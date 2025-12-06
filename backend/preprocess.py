import pandas as pd
import re

input_file = 'mental_health_stress_detector.csv'
output_file = 'processed_dataset.csv'

try:
    df = pd.read_csv(input_file)
    print(f"✅ Loaded {len(df)} rows")
except FileNotFoundError:
    print("❌ Error: CSV file not found!")
    exit()

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text

print("🧹 Cleaning data...")
df['text'] = df['text'].apply(clean_text)

# Rename columns to match what the App expects
column_mapping = {
    'study_hour': 'Study_Hours',
    'sleep_hour': 'Sleep_Hours',
    'screen_time': 'Screen_Time',
    'social_hours': 'Social_Hours',
    'physical_activity': 'Physical_Activity',
    'stress_level': 'Stress_Level',
    'stress_score': 'Stress_Score'
}
df.rename(columns=column_mapping, inplace=True)

df.drop_duplicates(inplace=True)
df.to_csv(output_file, index=False)
print(f"💾 Saved clean data to '{output_file}'")