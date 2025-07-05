import joblib
from pathlib import Path
from data.load_clean_data import load_clean_data
from sklearn.feature_extraction.text import TfidfVectorizer


BASE_DIR = Path(__file__).parent

VECTOR_FILE = BASE_DIR / "tfidf_vectorizer.joblib"
MATRIX_FILE = BASE_DIR / "job_matrix.joblib"
METADATA_FILE = BASE_DIR / "../job_metadata.csv"

def train_and_save_model():
    df = load_clean_data()
    df['skill_text'] = df['job_skills'].apply(lambda skills: " ".join(skills))

    vectorizer = TfidfVectorizer()
    job_matrix = vectorizer.fit_transform(df['skill_text'])

    VECTOR_FILE.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(vectorizer, VECTOR_FILE)
    joblib.dump(job_matrix, MATRIX_FILE)

    df.to_csv(METADATA_FILE, index=False)

    print("Model and data saved successfully.")

if __name__ == "__main__":
    train_and_save_model()

