"""
generate_energy_data.py
-----------------------
Generates 5,000 realistic monthly energy consumption records
and inserts them into MySQL (smarthosteldb).

HOW TO RUN:
    pip install mysql-connector-python
    python generate_energy_data.py

CONFIGURE your DB credentials below before running.
"""

import mysql.connector
import random
from datetime import date, timedelta
import math

# ─────────────────────────────────────────
#  DATABASE CONFIG — change these!
# ─────────────────────────────────────────
DB_CONFIG = {
    "host":     "localhost",
    "port":     3306,
    "user":     "root",         # your MySQL username
    "password": "1234", # your MySQL password
    "database": "smart_hostel"
}

# ─────────────────────────────────────────
#  HOSTEL SETTINGS
# ─────────────────────────────────────────
BLOCKS = ["Block A", "Block B", "Block C", "Block D"]

# Base monthly consumption per block (kWh) — reflects block size
BASE_CONSUMPTION = {
    "Block A": 480,
    "Block B": 520,
    "Block C": 390,
    "Block D": 450,
}

# Seasonal multipliers for Sri Lanka (hotter = more fans/AC)
# Month: 1=Jan ... 12=Dec
SEASONAL_FACTOR = {
    1:  1.05,   # Jan  - warm
    2:  1.10,   # Feb  - getting hotter
    3:  1.20,   # Mar  - hot (pre-monsoon)
    4:  1.25,   # Apr  - hottest (Avurudu season)
    5:  1.10,   # May  - monsoon starts, cools slightly
    6:  0.95,   # Jun  - inter-monsoon, moderate
    7:  0.90,   # Jul  - cooler
    8:  0.92,   # Aug  - moderate
    9:  1.00,   # Sep  - warming
    10: 1.05,   # Oct  - second inter-monsoon
    11: 1.00,   # Nov  - moderate
    12: 0.98,   # Dec  - moderate/cool
}

# Occupancy rate per month (exam periods = lower occupancy)
OCCUPANCY_FACTOR = {
    1:  0.85,   # Jan  - semester start
    2:  0.90,
    3:  0.92,
    4:  0.75,   # Apr  - holidays / Avurudu
    5:  0.88,
    6:  0.95,   # Jun  - mid semester peak
    7:  0.60,   # Jul  - semester break
    8:  0.65,
    9:  0.90,   # Sep  - semester restart
    10: 0.93,
    11: 0.88,
    12: 0.55,   # Dec  - year end holidays
}

COST_PER_KWH = 35.00  # LKR


def generate_records(count=5000):
    """Generate `count` realistic energy records."""
    records = []

    # Date range: Jan 2020 → Dec 2025 (72 months)
    start_date = date(2020, 1, 1)
    end_date   = date(2025, 12, 1)

    # Build list of all (year, month) combinations
    all_months = []
    d = start_date
    while d <= end_date:
        all_months.append((d.year, d.month))
        # Advance by one month
        if d.month == 12:
            d = date(d.year + 1, 1, 1)
        else:
            d = date(d.year, d.month + 1, 1)

    # Each block × each month = 4 × 72 = 288 unique combos
    # To reach 5000, we allow multiple meter readings per month per block
    # (simulating weekly sub-meter readings or additional data points)
    readings_needed = math.ceil(count / (len(BLOCKS) * len(all_months)))

    for block in BLOCKS:
        base = BASE_CONSUMPTION[block]
        for (year, month) in all_months:
            for reading_num in range(readings_needed):
                if len(records) >= count:
                    break

                seasonal   = SEASONAL_FACTOR[month]
                occupancy  = OCCUPANCY_FACTOR[month]

                # Add a year-on-year growth trend (~3% per year)
                year_growth = 1.0 + (year - 2020) * 0.03

                # Random noise ±8%
                noise = random.uniform(0.92, 1.08)

                consumption = round(
                    base * seasonal * occupancy * year_growth * noise, 2
                )

                # Meter readings (cumulative simulation)
                meter_start = round(random.uniform(1000, 50000), 1)
                meter_end   = round(meter_start + consumption, 1)

                total_cost  = round(consumption * COST_PER_KWH, 2)

                record_date = date(year, month, random.randint(1, 28))

                notes = ""
                if occupancy < 0.70:
                    notes = "Low occupancy period"
                elif seasonal > 1.15:
                    notes = "High demand - hot season"

                records.append((
                    block,
                    record_date.strftime("%Y-%m-%d"),
                    consumption,
                    COST_PER_KWH,
                    total_cost,
                    meter_start,
                    meter_end,
                    month,
                    year,
                    round(occupancy * 100, 1),
                    notes
                ))

    return records[:count]


def create_table_if_not_exists(cursor):
    """Create energy_records table if it doesn't exist."""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS energy_records (
            id              BIGINT AUTO_INCREMENT PRIMARY KEY,
            block           VARCHAR(50)    NOT NULL,
            record_date     DATE           NOT NULL,
            consumption_kwh DOUBLE         NOT NULL,
            cost_per_kwh    DOUBLE         DEFAULT 35.00,
            total_cost      DOUBLE,
            meter_start     DOUBLE,
            meter_end       DOUBLE,
            month           INT,
            year            INT,
            occupancy_rate  DOUBLE,
            notes           VARCHAR(255),
            created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
        )
    """)
    print("✅ Table 'energy_records' ready.")


def insert_records(records):
    """Insert all records into MySQL."""
    conn   = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    create_table_if_not_exists(cursor)

    # Clear existing data (optional — comment out if you want to keep existing)
    cursor.execute("DELETE FROM energy_records")
    print("🗑️  Cleared existing records.")

    sql = """
        INSERT INTO energy_records
            (block, record_date, consumption_kwh, cost_per_kwh, total_cost,
             meter_start, meter_end, month, year, occupancy_rate, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    # Batch insert in chunks of 500
    chunk_size = 500
    total = len(records)
    for i in range(0, total, chunk_size):
        chunk = records[i:i + chunk_size]
        cursor.executemany(sql, chunk)
        conn.commit()
        print(f"  Inserted {min(i + chunk_size, total)}/{total} records...")

    cursor.close()
    conn.close()
    print(f"\n🎉 Done! {total} energy records inserted into smarthosteldb.")


if __name__ == "__main__":
    print("⚡ Generating 5,000 energy records...")
    records = generate_records(5000)
    print(f"✅ Generated {len(records)} records. Inserting into MySQL...")
    insert_records(records)