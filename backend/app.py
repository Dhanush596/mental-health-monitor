from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import nltk
from textblob import TextBlob

# --- 1. INITIALIZATION ---
# This ensures NLP data is downloaded so the server doesn't hang
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

app = Flask(__name__)
CORS(app) # Allows React to communicate with Python

# --- 2. LOAD ML MODELS ---
def load_model(path, name):
    if os.path.exists(path):
        try:
            return joblib.load(path)
        except Exception as e:
            print(f"⚠️ {name} Load Warning: {e}")
    return None

text_ml = load_model('stress_model.pkl', 'Text AI')
num_ml = load_model('numerical_model.pkl', 'Numerical AI')

# --- 3. TEXT ANALYSIS ROUTE ---
@app.route('/analyze_text', methods=['POST'])
def analyze_text():
    data = request.json
    text = data.get('text', '').lower()
    
    # Critical: If no text, return empty but valid structure to prevent React crash
    if not text: 
        return jsonify({"score": 0, "level": "Low", "keywords": []})

    # A. NLP Sentiment (TextBlob)
    analysis = TextBlob(text)
    sentiment_base = 50 - (analysis.sentiment.polarity * 50)

    # B. Daily Conversation Weighted Keywords
    stress_markers = {
        'fail': 20, 'backlog': 25, 'viva': 20, 'exam': 15, 'deadline': 15,
        'depressed': 30, 'anxious': 25, 'exhausted': 20, 'insomnia': 20, 
        'stress': 10, 'marks': 10, 'sad': 10, 'angry': 10
    }
    
    found_keywords = [word for word in stress_markers if word in text]
    keyword_score = sum(stress_markers[word] for word in found_keywords)

    # C. ML Prediction Fallback
    ml_boost = 0
    if text_ml:
        try:
            pred = text_ml.predict([text])[0]
            if str(pred).lower() == "high": ml_boost = 25
        except: pass

    # D. Final Hybrid Score calculation
    final_score = max(5, min(99, sentiment_base + keyword_score + ml_boost))
    
    # E. Safety Net Override
    if any(w in text for w in ['suicide', 'kill', 'hurt myself', 'end my life']):
        final_score = 99

    level = "High" if final_score > 70 else "Moderate" if final_score > 40 else "Low"

    print(f"📝 Text Result: {int(final_score)}% | Level: {level}")

    # Return structure that matches your TextAnalyzer.tsx expectations
    return jsonify({
        "score": int(final_score), 
        "level": level, 
        "keywords": found_keywords[:3] 
    })

# --- 4. DAILY CHECK-IN ROUTE ---
@app.route('/predict_daily', methods=['POST'])
def predict_daily():
    data = request.json
    
    # Match the keys from your DailyEntry.tsx payload
    sleep = float(data.get('sleep', 0))
    study = float(data.get('study', 0))
    screen = float(data.get('screen', 0))
    social = float(data.get('social', 0))
    activity = float(data.get('activity', 0))

    # A. ML Base Score from Numerical Model
    score = 45 # Default
    if num_ml:
        try:
            # Note: Ensure features are in the same order as trained
            score = int(num_ml.predict([[study, sleep, screen, social, activity]])[0])
        except: pass

    # B. Domain-Specific Sensitivity Guards (God Mode)
    if sleep < 6: 
        score += 20
        print("🚩 Low Sleep Penalty (+20)")
    if screen > 10: 
        score += 25
        print("🚩 High Screen Penalty (+25)")
    if social < 2: 
        score += 10
        print("🚩 Isolation Penalty (+10)")
    if activity > 2: 
        score -= 15
        print("🟢 High Activity Bonus (-15)")

    # C. Final Result Mapping
    final_score = max(5, min(98, score))
    
    # Match frontend status badge colors
    if final_score > 70: level = "High"
    elif final_score > 35: level = "Moderate"
    else: level = "Low"

    print(f"✅ Daily Result: {final_score}% | Level: {level}")
    
    return jsonify({
        "stressScore": int(final_score),
        "stressLevel": level
    })

if __name__ == '__main__':
    print("🚀 Ultimate ML Backend running on http://127.0.0.1:5000")
    app.run(port=5000, debug=True)