from load_data import load_raw_data
from clean_data import clean_job_data


def eda():
    df = load_raw_data()
    print("Raw Data Overview:")
    print(df.head())
    print("\nColumns:", df.columns.tolist())

    print("\nMissing Values:")
    print(df.isnull().sum())

    categorical_columns = [
        'job_title_short',
        'job_title',
        'job_work_from_home',
        'job_no_degree_mention',
        'job_health_insurance'
    ]

    for col in categorical_columns:
        print(f"\n--- Value counts for column: {col} ---")
        print(df[col].value_counts(dropna=False))
        print(f"Unique values: {df[col].nunique()}")
        print(f"Missing values: {df[col].isnull().sum()}")

    df = clean_job_data(df)
    print("\nMissing Values:")
    print(df.isnull().sum())


if __name__ == "__main__":
    eda()