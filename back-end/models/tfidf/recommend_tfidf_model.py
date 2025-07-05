import pandas as pd
import joblib
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import ast

BASE_DIR = Path(__file__).parent

VECTOR_FILE = BASE_DIR / "tfidf_vectorizer.joblib"
MATRIX_FILE = BASE_DIR / "job_matrix.joblib"
METADATA_FILE = BASE_DIR.parent / "job_metadata.csv"

class TfidfRecommender:
    def __init__(self):
        self.vectorizer = joblib.load(VECTOR_FILE)
        self.job_matrix = joblib.load(MATRIX_FILE)
        self.df = pd.read_csv(METADATA_FILE)
        self.df['job_skills'] = self.df['job_skills'].apply(ast.literal_eval)

    def recommend(self, user_skills, top_n=5):
        user_input_text = " ".join(user_skills)
        user_vector = self.vectorizer.transform([user_input_text])
        similarity_scores = cosine_similarity(user_vector, self.job_matrix)[0]
        top_indices = np.argsort(similarity_scores)[::-1][:top_n]

        recommendations = []
        for idx in top_indices:
            job = self.df.iloc[idx]
            recommendations.append({
                "job_title": job['job_title'],
                "company_name": job['company_name'],
                "remote": job['job_work_from_home'],
                "required_skills": job['job_skills']
            })
        return recommendations

if __name__ == "__main__":
    recommender = TfidfRecommender()
    user_skills = ["python", "sql", "excel"]
    results = recommender.recommend(user_skills, 10)
    print("\n Top Recommended Jobs Based on Your Skills:\n")
    for i, rec in enumerate(results, 1):
        print(f"{i}. {rec['job_title']} @ {rec['company_name']} (Remote: {rec['remote']})")
        print(f"   Required skills: {', '.join(rec['required_skills'])}")
        print("   ---")
