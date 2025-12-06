import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib

# 1. LOAD CLEAN DATA
try:
    # Uses the PROCESSED file (No duplicates!)
    data = pd.read_csv('processed_dataset.csv')
    print("✅ Loaded processed dataset!")
except FileNotFoundError:
    print("❌ Error: 'processed_dataset.csv' not found. Run 'python preprocess.py' first!")
    exit()

# 2. PREPARE DATA
X = data['text']
y = data['Stress_Level']

# 3. SPLIT & TRAIN
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = make_pipeline(CountVectorizer(), MultinomialNB())

print("🧠 Training model...")
model.fit(X_train, y_train)

# 4. SAVE
print(f"🎯 Accuracy: {model.score(X_test, y_test) * 100:.2f}%")
joblib.dump(model, 'stress_model.pkl')
print("💾 Saved model to 'stress_model.pkl'")