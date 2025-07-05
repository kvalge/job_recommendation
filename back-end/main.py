from fastapi import FastAPI
from models.tfidf.recommend_tfidf_model import TfidfRecommender


app = FastAPI()


@app.get("/")
async def main():
    pass



