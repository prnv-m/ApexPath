import pandas as pd
import numpy as np
import random
import os
print("--- Location Generation Script ---")

# --- Configuration: Define cities and their target distribution ---
# We use the midpoint of the user-provided ranges.
LOCATION_DISTRIBUTION = {
    'Delhi NCR': 0.195,  # Midpoint of 18-21%
    'Bengaluru': 0.16,   # Midpoint of 14-18%
    'Mumbai': 0.15,      # Midpoint of 14-16%
    'Chennai': 0.09,     # Midpoint of 8-10%
    'Pune': 0.085,       # Midpoint of 8-9%
    'Hyderabad': 0.085,  # Midpoint of 8-9%
    'Kolkata': 0.035,    # Midpoint of 3-4%
    'Ahmedabad': 0.03,
}

# Other Tier-2 cities will share the remaining percentage
OTHER_TIER_2_CITIES = [
    'Kochi', 'Jaipur', 'Thiruvananthapuram', 'Coimbatore', 
    'Visakhapatnam', 'Indore', 'Lucknow', 'Chandigarh'
]

# --- Main Logic ---
try:
    # 1. Load the original postings to get the job_ids
    print("1. Reading job_ids from postings.csv...")
    postings_df = pd.read_csv(os.path.join('data', 'postings.csv'))
    job_ids = postings_df['job_id'].unique()
    total_jobs = len(job_ids)
    print(f"   Found {total_jobs} unique jobs.")

    # 2. Calculate the number of jobs for each primary city
    locations_list = []
    assigned_jobs_count = 0
    for city, percentage in LOCATION_DISTRIBUTION.items():
        num_jobs = int(round(total_jobs * percentage))
        locations_list.extend([city] * num_jobs)
        assigned_jobs_count += num_jobs

    # 3. Distribute the remaining jobs among Tier-2 cities
    remaining_jobs = total_jobs - assigned_jobs_count
    if remaining_jobs > 0:
        print(f"2. Assigning {remaining_jobs} jobs to Tier-2 cities...")
        for i in range(remaining_jobs):
            locations_list.append(random.choice(OTHER_TIER_2_CITIES))
    else:
        # If we over-assigned due to rounding, trim the excess from the largest category
        locations_list = locations_list[:total_jobs]

    # 4. Shuffle the list to ensure random assignment
    print("3. Randomly shuffling locations...")
    random.shuffle(locations_list)
    
    # 5. Create the final DataFrame
    locations_df = pd.DataFrame({
        'job_id': job_ids,
        'location': locations_list
    })

    # 6. Save to CSV
    output_path = os.path.join('data', 'locations.csv')
    locations_df.to_csv(output_path, index=False)
    print(f"--- Success! ---")
    print(f"Generated and saved locations for {len(locations_df)} jobs to '{output_path}'.")
    print("\nDistribution preview:")
    print(locations_df['location'].value_counts(normalize=True).head(10))

except FileNotFoundError:
    print("\nError: 'data/postings.csv' not found.")
    print("Please ensure the postings data is in the correct directory before running this script.")