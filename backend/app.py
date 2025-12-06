from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

# 1. SETUP FLASK
app = Flask(__name__)
CORS(app)

# 2. LOAD TEXT AI MODEL
text_model_path = 'stress_model.pkl'
if os.path.exists(text_model_path):
    try:
        text_model = joblib.load(text_model_path)
        print("✅ Custom Text AI Model Loaded!")
    except:
        text_model = None
else:
    print("⚠️ Text Model not found.")
    text_model = None

# 3. LOAD NUMERICAL AI MODEL
num_model_path = 'numerical_model.pkl'
if os.path.exists(num_model_path):
    try:
        num_model = joblib.load(num_model_path)
        print("✅ Numerical AI Model Loaded!")
    except:
        num_model = None
else:
    print("⚠️ Numerical Model not found.")
    num_model = None

@app.route('/')
def home():
    return "✅ Python AI Server is running!"

# --- ROUTE 1: TEXT ANALYSIS ---
@app.route('/analyze_text', methods=['POST'])
def analyze_text():
    print("--- TEXT REQUEST RECEIVED ---")
    data = request.json
    text = data.get('text', '').lower()

    prediction = "Low"
    confidence = 0

    # 1. AI PREDICTION
    if text_model:
        try:
            prediction = text_model.predict([text])[0]
            proba = text_model.predict_proba([text])[0]
            confidence = int(max(proba) * 100)
        except:
            pass

    # 2. SAFETY NET
    danger_words = ['suicide', 'kill', 'die', 'death', 'panic', 'terror', 'fail', 'hopeless', 'stress', 'anxiety', 'anxious', 'afraid', 'scared', 'cry', 'crying', 'terrified', 'overwhelmed', 'nervous', 'worry', 'worried', 'bad', 'sad', 'terrible', 'awful', 'nothing', 'empty', 'numb', 'pain']
    
    if any(word in text for word in danger_words):
        print(f"⚠️ Safety Net Triggered!")
        prediction = "High"
        confidence = 95

    # 3. SCORE
    label = str(prediction).lower()
    if label == "high": score = 75 + int(confidence / 5)
    elif label == "medium": score = 45 + int(confidence / 5)
    else: score = 25 - int(confidence / 10)
    
    score = max(0, min(100, score))
    return jsonify({ "score": score, "keywords": [label] })

# --- ROUTE 2: NUMERICAL ANALYSIS (DAILY ENTRY) ---
@app.route('/predict_daily', methods=['POST'])
def predict_daily():
    print("--- DAILY ENTRY REQUEST RECEIVED ---")
    data = request.json
    
    features = [
        float(data.get('study', 0)),
        float(data.get('sleep', 0)),
        float(data.get('screen', 0)),
        float(data.get('social', 0)),
        float(data.get('activity', 0))
    ]

    if not num_model:
        return jsonify({"error": "Numerical model not trained"}), 500

    # AI PREDICTION
    try:
        prediction = num_model.predict([features])[0]
        score = int(prediction)
        
        if score > 70: level = "High"
        elif score > 30: level = "Medium"
        else: level = "Low"

        print(f"Input: {features} -> Score: {score} ({level})")
        
        return jsonify({
            "stressScore": score,
            "stressLevel": level
        })
    except Exception as e:
        print("Error predicting:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🐍 Python AI Server is running on port 5000...")
    app.run(debug=True, port=5000)