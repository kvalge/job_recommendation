import pandas as pd
from pathlib import Path
import ast

CLEANED_DATA_PATH = Path(__file__).resolve().parent / "data_cleaned.csv"

def load_clean_data():
    df = pd.read_csv(CLEANED_DATA_PATH)
    df['job_skills'] = df['job_skills'].apply(ast.literal_eval)
    return df
