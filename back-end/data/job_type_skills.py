import pandas as pd
import ast
from collections import defaultdict
import json
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parent / "data_cleaned.csv"
OUTPUT_PATH = Path(__file__).resolve().parent / "job_types_skills.json"


def process_job_type_skills():
    df = pd.read_csv(DATA_PATH)

    df['job_type_skills'] = df['job_type_skills'].apply(ast.literal_eval)

    type_skill_map = defaultdict(set)

    for d in df['job_type_skills']:
        for skill_type, skills in d.items():
            for skill in skills:
                type_skill_map[skill_type].add(skill.lower())

    type_skill_map = {k: sorted(list(v)) for k, v in type_skill_map.items()}

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(type_skill_map, f, indent=4)

    print(f"Saved types and skills mapping to {OUTPUT_PATH}")


if __name__ == "__main__":
    process_job_type_skills()
