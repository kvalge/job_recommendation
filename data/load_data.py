import pandas as pd
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent / "data_jobs.csv"

def load_raw_data():
    return pd.read_csv(DATA_PATH)


