import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

# 1. LOAD DATA
try:
    data = pd.read_csv('processed_dataset.csv')
    print("✅ Loaded dataset for numerical training!")
except:
    print("❌ Error: 'processed_dataset.csv' not found.")
    exit()

# 2. SELECT FEATURES (Inputs) & TARGET (Output)
# We use the column names exactly as they appear in your processed file
features = ['Study_Hours', 'Sleep_Hours', 'Screen_Time', 'Social_Hours', 'Physical_Activity']
target = 'Stress_Score'

X = data[features]
y = data[target]

# 3. TRAIN MODEL
# Random Forest is excellent for numerical predictions
model = RandomForestRegressor(n_estimators=100, random_state=42)
print("🧠 Training Numerical AI...")
model.fit(X, y)

# 4. TEST IT
sample_input = [[5, 8, 4, 3, 2]] # 5h study, 8h sleep...
predicted_stress = model.predict(sample_input)[0]
print(f"🧪 Test Prediction: Input {sample_input} -> Stress Score: {int(predicted_stress)}")

# 5. SAVE
joblib.dump(model, 'numerical_model.pkl')
print("💾 Model saved as 'numerical_model.pkl'")