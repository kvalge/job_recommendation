from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data'))
from load_clean_data import load_clean_data
import numpy as np


class TfidfRecommender:
    def __init__(self):
        self.df = load_clean_data()
        self.df['skill_text'] = self.df['job_skills'].apply(lambda skills: " ".join(skills))
        self.vectorizer = TfidfVectorizer()
        self.job_matrix = self.vectorizer.fit_transform(self.df['skill_text'])

    def recommend(self, user_skills, top_n=5):
        user_input_text = " ".join(user_skills)
        user_vector = self.vectorizer.transform([user_input_text])
        similarity_scores = cosine_similarity(user_vector, self.job_matrix)[0]
        top_indices = np.argsort(similarity_scores)[::-1][:top_n]

        recommendations = []
        for idx in top_indices:
            job = self.df.iloc[idx]
            recommendations.append({
                "job_title_short": job['job_title_short'],
                "job_title": job['job_title'],
                "job_work_from_home": job['job_work_from_home'],
                "job_posted_date": job['job_posted_date'],
                "job_health_insurance": job['job_health_insurance'],
                "job_country": job['job_country'],
                "company_name": job['company_name'],
                "job_skills": job['job_skills']
            })
        return recommendations


if __name__ == "__main__":
    recommender = TfidfRecommender()

    user_skills_list = [
        ["python", "sql", "excel"],
        ["java", "cloud", "docker"]
    ]

    for user_skills in user_skills_list:
        print(f"\n Recommendations for skills: {user_skills}\n")
        results = recommender.recommend(user_skills)
        for i, rec in enumerate(results, 1):
            print(f"{i}. {rec['job_title']} @ {rec['company_name']} (Remote: {rec['job_work_from_home']})")
            print(f"   Required skills: {', '.join(rec['job_skills'])}")
            print("   ---")
