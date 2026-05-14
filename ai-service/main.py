from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

app = FastAPI(title="Smart Hostel AI Matching Service")

class MatchRequest(BaseModel):
    currentUser: Dict[str, Any]
    others: List[Dict[str, Any]]

def norm(v: Optional[Any]) -> str:
    if v is None:
        return ""
    return str(v).strip().lower()

def score_pair(a: Dict[str, Any], b: Dict[str, Any]) -> int:
    score = 0

    # main features (your questionnaire)
    if norm(a.get("preferredStudyTime")) == norm(b.get("preferredStudyTime")):
        score += 20
    if norm(a.get("typicalSleepTime")) == norm(b.get("typicalSleepTime")):
        score += 20
    if norm(a.get("wakeUpTime")) == norm(b.get("wakeUpTime")):
        score += 15
    if norm(a.get("cleanlinessPreference")) == norm(b.get("cleanlinessPreference")):
        score += 15
    if norm(a.get("noiseTolerance")) == norm(b.get("noiseTolerance")):
        score += 10
    if norm(a.get("guestFrequency")) == norm(b.get("guestFrequency")):
        score += 5
    if norm(a.get("smokingPreference")) == norm(b.get("smokingPreference")):
        score += 10
    if norm(a.get("personalityType")) == norm(b.get("personalityType")):
        score += 5

    # optional extras small bonus
    if norm(a.get("roomTempPreference")) and norm(a.get("roomTempPreference")) == norm(b.get("roomTempPreference")):
        score += 5
    if norm(a.get("sharingPreference")) and norm(a.get("sharingPreference")) == norm(b.get("sharingPreference")):
        score += 5

    if score > 100:
        score = 100
    return score

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/ai/roommate-match")
def roommate_match(req: MatchRequest):
    current = req.currentUser
    others = req.others or []

    current_id = current.get("userId")
    if current_id is None:
        return {"matches": []}

    matches: List[Dict[str, Any]] = []

    for o in others:
        other_id = o.get("userId")
        if other_id is None:
            continue
        if str(other_id) == str(current_id):
            continue

        s = score_pair(current, o)
        matches.append({"userId": int(other_id), "score": int(s)})

    matches.sort(key=lambda x: x["score"], reverse=True)
    return {"matches": matches}