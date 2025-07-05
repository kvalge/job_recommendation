from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from models.tfidf_model import TfidfRecommender

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    job_type: str
    skills: List[str]

@app.get("/")
async def index():
    return {"message": "Job Recommendation API"}

@app.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    try:
        recommender = TfidfRecommender()

        recommendations = recommender.recommend(request.skills, top_n=20)

        formatted_results = []
        for rec in recommendations:
            job_data = {
                "job_title_short": rec.get('job_title_short', ''),
                "job_title": rec.get('job_title', ''),
                "job_work_from_home": "Yes" if rec.get('job_work_from_home', False) else "No",
                "job_posted_date": rec.get('job_posted_date', ''),
                "job_health_insurance": "Yes" if rec.get('job_health_insurance', False) else "No",
                "job_country": rec.get('job_country', ''),
                "company_name": rec.get('company_name', ''),
                "job_skills": rec.get('job_skills', []) if isinstance(rec.get('job_skills'), list) else []
            }
            formatted_results.append(job_data)
        
        return {
            "status": "success",
            "job_type": request.job_type,
            "user_skills": request.skills,
            "recommendations": formatted_results,
            "total_jobs": len(formatted_results)
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error generating recommendations: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    



