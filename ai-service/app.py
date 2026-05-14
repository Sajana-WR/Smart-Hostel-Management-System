"""
app.py — Energy Forecasting + Roommate Matching Microservice
-------------------------------------------------------------
Flask microservice that:
  1. Trains a Linear Regression model on historical energy data from MySQL
  2. Exposes a REST API for energy forecasting
  3. Exposes a REST API for AI roommate matching
  4. Called by the Spring Boot backend

HOW TO RUN:
    pip install -r requirements.txt
    python app.py

Runs on: http://localhost:5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)  # Allow Spring Boot to call this service

# ─────────────────────────────────────────
#  DATABASE CONFIG — match your Spring Boot config
# ─────────────────────────────────────────
DB_CONFIG = {
    "host":     "localhost",
    "port":     3306,
    "user":     "root",
    "password": "1234",
    "database": "smart_hostel"
}

# ─────────────────────────────────────────
#  GLOBAL MODEL STORAGE
# ─────────────────────────────────────────
model          = None
label_encoder  = LabelEncoder()
model_metrics  = {}
is_trained     = False


# ─────────────────────────────────────────
#  HELPER: Fetch training data from MySQL
# ─────────────────────────────────────────
def fetch_training_data():
    conn   = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT block, month, year, occupancy_rate, consumption_kwh
        FROM energy_records
        ORDER BY year, month
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


# ─────────────────────────────────────────
#  HELPER: Prepare features from raw rows
# ─────────────────────────────────────────
def prepare_features(rows, fit_encoder=False):
    blocks       = [r["block"] for r in rows]
    months       = [r["month"] for r in rows]
    years        = [r["year"]  for r in rows]
    occupancies  = [r["occupancy_rate"] if r["occupancy_rate"] else 85.0 for r in rows]

    if fit_encoder:
        block_enc = label_encoder.fit_transform(blocks)
    else:
        block_enc = label_encoder.transform(blocks)

    month_sin = [np.sin(2 * np.pi * m / 12) for m in months]
    month_cos = [np.cos(2 * np.pi * m / 12) for m in months]

    X = np.column_stack([
        block_enc,
        months,
        years,
        occupancies,
        month_sin,
        month_cos
    ])
    return X


# ─────────────────────────────────────────
#  TRAIN THE MODEL
# ─────────────────────────────────────────
def train_model():
    global model, is_trained, model_metrics

    print("🔄 Fetching training data from MySQL...")
    rows = fetch_training_data()

    if len(rows) < 50:
        print("⚠️  Not enough data to train. Need at least 50 records.")
        return False

    print(f"✅ Fetched {len(rows)} records. Training model...")

    X = prepare_features(rows, fit_encoder=True)
    y = np.array([r["consumption_kwh"] for r in rows])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae    = mean_absolute_error(y_test, y_pred)
    r2     = r2_score(y_test, y_pred)

    within_15pct = np.mean(np.abs((y_test - y_pred) / y_test) < 0.15) * 100

    model_metrics = {
        "total_records":   len(rows),
        "mae_kwh":         round(mae, 2),
        "r2_score":        round(r2, 4),
        "accuracy_pct":    round(within_15pct, 1),
        "train_samples":   len(X_train),
        "test_samples":    len(X_test),
    }

    is_trained = True
    print(f"🎉 Model trained! R²={r2:.4f}, Accuracy={within_15pct:.1f}%, MAE={mae:.2f} kWh")
    return True


# ─────────────────────────────────────────
#  ROOMMATE MATCHING HELPER
# ─────────────────────────────────────────
def compute_compatibility_score(user, candidate):
    """
    Weighted scoring algorithm for roommate compatibility.
    Returns a score from 0–100.
    """
    score = 0
    max_score = 0

    # Sleep time compatibility (weight: 25)
    if user.get("typicalSleepTime") and candidate.get("typicalSleepTime"):
        max_score += 25
        if user["typicalSleepTime"] == candidate["typicalSleepTime"]:
            score += 25
        else:
            # Partial credit for close sleep times
            sleep_order = ["before_10pm", "10pm_12am", "12am_2am", "after_2am"]
            try:
                u_idx = sleep_order.index(user["typicalSleepTime"])
                c_idx = sleep_order.index(candidate["typicalSleepTime"])
                diff = abs(u_idx - c_idx)
                if diff == 1:
                    score += 12
            except ValueError:
                pass

    # Wake up time compatibility (weight: 20)
    if user.get("wakeUpTime") and candidate.get("wakeUpTime"):
        max_score += 20
        if user["wakeUpTime"] == candidate["wakeUpTime"]:
            score += 20
        else:
            wake_order = ["before_6am", "6am_8am", "8am_10am", "after_10am"]
            try:
                u_idx = wake_order.index(user["wakeUpTime"])
                c_idx = wake_order.index(candidate["wakeUpTime"])
                diff = abs(u_idx - c_idx)
                if diff == 1:
                    score += 10
            except ValueError:
                pass

    # Study time compatibility (weight: 20)
    if user.get("preferredStudyTime") and candidate.get("preferredStudyTime"):
        max_score += 20
        if user["preferredStudyTime"] == candidate["preferredStudyTime"]:
            score += 20
        else:
            score += 5  # partial

    # Cleanliness compatibility (weight: 15)
    if user.get("cleanlinessPreference") and candidate.get("cleanlinessPreference"):
        max_score += 15
        if user["cleanlinessPreference"] == candidate["cleanlinessPreference"]:
            score += 15
        else:
            clean_order = ["relaxed", "moderate", "very_clean"]
            try:
                u_idx = clean_order.index(user["cleanlinessPreference"])
                c_idx = clean_order.index(candidate["cleanlinessPreference"])
                diff = abs(u_idx - c_idx)
                if diff == 1:
                    score += 7
            except ValueError:
                pass

    # Noise tolerance compatibility (weight: 10)
    if user.get("noiseTolerance") and candidate.get("noiseTolerance"):
        max_score += 10
        if user["noiseTolerance"] == candidate["noiseTolerance"]:
            score += 10
        else:
            noise_order = ["silent", "low", "moderate", "high"]
            try:
                u_idx = noise_order.index(user["noiseTolerance"])
                c_idx = noise_order.index(candidate["noiseTolerance"])
                diff = abs(u_idx - c_idx)
                if diff == 1:
                    score += 5
            except ValueError:
                pass

    # Smoking preference (weight: 10 — hard requirement)
    if user.get("smokingPreference") and candidate.get("smokingPreference"):
        max_score += 10
        if user["smokingPreference"] == candidate["smokingPreference"]:
            score += 10

    # Guest frequency (weight: 5)
    if user.get("guestFrequency") and candidate.get("guestFrequency"):
        max_score += 5
        if user["guestFrequency"] == candidate["guestFrequency"]:
            score += 5

    # Personality type (weight: 5)
    if user.get("personalityType") and candidate.get("personalityType"):
        max_score += 5
        if user["personalityType"] == candidate["personalityType"]:
            score += 5

    # Normalise to 0–100
    if max_score == 0:
        return 50  # neutral score if no data
    return round((score / max_score) * 100)


# ─────────────────────────────────────────
#  API ROUTES
# ─────────────────────────────────────────

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "service":    "Smart Hostel AI Microservice",
        "status":     "running",
        "model_ready": is_trained
    })


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint called by Spring Boot MatchingController."""
    return jsonify({
        "status":     "UP",
        "service":    "Smart Hostel AI Microservice",
        "model_ready": is_trained
    })


# ─────────────────────────────────────────
#  ROOMMATE MATCHING ENDPOINT
# ─────────────────────────────────────────

@app.route("/ai/roommate-match", methods=["POST"])
def roommate_match():
    """
    AI Roommate Matching endpoint.
    Called by Spring Boot MatchingController.

    Request body:
    {
        "currentUser": { ...survey fields... },
        "others": [ { ...survey fields... }, ... ]
    }

    Response:
    {
        "matches": [
            { "userId": 5, "score": 87 },
            ...
        ]
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    current_user = data.get("currentUser")
    others       = data.get("others", [])

    if not current_user:
        return jsonify({"error": "currentUser is required"}), 400

    matches = []
    for candidate in others:
        candidate_id = candidate.get("userId")
        if candidate_id is None:
            continue

        score = compute_compatibility_score(current_user, candidate)
        matches.append({
            "userId": candidate_id,
            "score":  score
        })

    # Sort by score descending
    matches.sort(key=lambda x: x["score"], reverse=True)

    return jsonify({
        "status":  "success",
        "matches": matches,
        "total":   len(matches)
    })


# ─────────────────────────────────────────
#  ENERGY FORECASTING ENDPOINTS
# ─────────────────────────────────────────

@app.route("/api/energy/train", methods=["POST"])
def train():
    success = train_model()
    if success:
        return jsonify({
            "status":  "success",
            "message": "Model trained successfully",
            "metrics": model_metrics
        }), 200
    else:
        return jsonify({
            "status":  "error",
            "message": "Not enough data to train. Add more energy records first."
        }), 400


@app.route("/api/energy/forecast", methods=["POST"])
def forecast():
    if not is_trained:
        success = train_model()
        if not success:
            return jsonify({
                "status":  "error",
                "message": "Model not trained yet. Add energy data first."
            }), 503

    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No JSON body provided"}), 400

    block          = data.get("block", "Block A")
    month          = int(data.get("month", 1))
    year           = int(data.get("year", 2026))
    occupancy_rate = float(data.get("occupancy_rate", 85.0))

    if block not in label_encoder.classes_:
        return jsonify({
            "status":  "error",
            "message": f"Unknown block '{block}'. Valid: {list(label_encoder.classes_)}"
        }), 400

    if not (1 <= month <= 12):
        return jsonify({"status": "error", "message": "Month must be 1–12"}), 400

    row = [{"block": block, "month": month, "year": year, "occupancy_rate": occupancy_rate}]
    X = prepare_features(row, fit_encoder=False)

    predicted_kwh  = float(model.predict(X)[0])
    predicted_kwh  = max(0, round(predicted_kwh, 2))
    predicted_cost = round(predicted_kwh * 35.0, 2)

    r2 = model_metrics.get("r2_score", 0)
    confidence = "High" if r2 >= 0.85 else ("Medium" if r2 >= 0.70 else "Low")

    return jsonify({
        "status":             "success",
        "block":              block,
        "month":              month,
        "year":               year,
        "occupancy_rate":     occupancy_rate,
        "predicted_kwh":      predicted_kwh,
        "predicted_cost_lkr": predicted_cost,
        "confidence":         confidence,
        "model_r2":           model_metrics.get("r2_score"),
        "model_accuracy_pct": model_metrics.get("accuracy_pct")
    })


@app.route("/api/energy/forecast/all-blocks", methods=["POST"])
def forecast_all_blocks():
    if not is_trained:
        train_model()

    data           = request.get_json() or {}
    month          = int(data.get("month", 1))
    year           = int(data.get("year", 2026))
    occupancy_rate = float(data.get("occupancy_rate", 85.0))

    results = []
    blocks  = ["Block A", "Block B", "Block C", "Block D"]

    for block in blocks:
        row = [{"block": block, "month": month, "year": year, "occupancy_rate": occupancy_rate}]
        X   = prepare_features(row, fit_encoder=False)
        kwh = max(0, round(float(model.predict(X)[0]), 2))
        results.append({
            "block":              block,
            "predicted_kwh":      kwh,
            "predicted_cost_lkr": round(kwh * 35.0, 2)
        })

    total_kwh  = round(sum(r["predicted_kwh"] for r in results), 2)
    total_cost = round(sum(r["predicted_cost_lkr"] for r in results), 2)

    return jsonify({
        "status":         "success",
        "month":          month,
        "year":           year,
        "forecasts":      results,
        "total_kwh":      total_kwh,
        "total_cost_lkr": total_cost,
        "confidence":     "High" if model_metrics.get("r2_score", 0) >= 0.85 else "Medium"
    })


@app.route("/api/energy/model-info", methods=["GET"])
def model_info():
    if not is_trained:
        return jsonify({"status": "not_trained", "message": "Model not yet trained"}), 200

    return jsonify({
        "status":  "trained",
        "metrics": model_metrics,
        "blocks":  list(label_encoder.classes_)
    })


# ─────────────────────────────────────────
#  STARTUP — auto-train on launch
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("⚡ Smart Hostel AI Microservice starting...")
    try:
        train_model()
    except Exception as e:
        print(f"⚠️  Auto-train failed: {e}. Train manually via POST /api/energy/train")

    app.run(host="0.0.0.0", port=5001, debug=True)