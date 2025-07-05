import pandas as pd
from load_data import load_raw_data

def clean_job_data(df: pd.DataFrame) -> pd.DataFrame:
    columns_to_keep = [
        "job_title_short",
        "job_title",
        "job_work_from_home",
        "job_posted_date",
        "job_no_degree_mention",
        "job_health_insurance",
        "job_country",
        "company_name",
        "job_skills",
        "job_type_skills"
    ]
    df = df[columns_to_keep]

    df = df.dropna()

    return df

if __name__ == "__main__":
    df = load_raw_data()
    cleaned_df = clean_job_data(df)
    print(f"Original shape: {df.shape}")
    print(f"Cleaned shape: {cleaned_df.shape}")

    cleaned_df.to_csv("data_cleaned.csv", index=False)
