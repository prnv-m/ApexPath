# flask_server/preprocess_data.py

import os
import re
import time
import numpy as np
import pandas as pd
import nltk
from gensim.models import Word2Vec
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk import pos_tag
import pickle # For saving the TF-IDF vectorizer

print("--- Data Pre-computation Script ---")

# --- (NLTK Download and Helper Functions are the same) ---
try:
    stopwords.words("english")
except LookupError:
    print("Downloading NLTK data...")
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('averaged_perceptron_tagger')

def preprocess_text(text):
    if not isinstance(text, str): return ""
    text = re.sub('[^a-zA-Z]', ' ', text)
    text = text.lower()
    sentences = sent_tokenize(text)
    features = []
    stop_words = set(stopwords.words("english"))
    for sent in sentences:
        words = word_tokenize(sent)
        words = [word for word in words if word not in stop_words]
        tagged_words = pos_tag(words)
        filtered_words = [word for word, tag in tagged_words if tag not in ['DT', 'IN', 'TO', 'PRP', 'WP']]
        features.extend(filtered_words)
    return " ".join(features)

def document_embedding(text, model):
    tokens = text.split()
    embeddings = [model.wv[word] for word in tokens if word in model.wv]
    if embeddings: return np.mean(embeddings, axis=0)
    else: return np.zeros(model.vector_size)

# --- Main Processing Logic ---
print("1. Loading and processing raw job data...")
start_time = time.time()
job_posts = pd.read_csv(os.path.join('data', 'postings.csv'))
company_industries = pd.read_csv(os.path.join('data', 'company_industries.csv'))
desired_industries = ["IT Services and IT Consulting", "Financial Services", "Real Estate", "Banking"]
filtered_industries = company_industries[company_industries['industry'].isin(desired_industries)]
job_descriptions = job_posts[["job_id", "company_id", "company_name", "title", "description"]]
job_descriptions = job_descriptions.merge(filtered_industries[['company_id']], on='company_id', how='inner')
job_descriptions = job_descriptions.dropna(subset=['description'])
job_descriptions = job_descriptions[job_descriptions['description'].apply(lambda x: isinstance(x, str))]

print("2. Preprocessing job description text...")
job_descriptions['jdFeatures'] = job_descriptions['description'].apply(preprocess_text)
print(f"   ...Text preprocessing complete for {len(job_descriptions)} jobs.")

# --- Model 1: Word2Vec ---
print("3. Loading Word2Vec model and calculating embeddings...")
w2v_model = Word2Vec.load(os.path.join('models', 'resume_word2vec.model'))
job_embeddings_w2v = np.array([document_embedding(text, w2v_model) for text in job_descriptions['jdFeatures']])
print("   ...Word2Vec embeddings calculated.")

# --- Model 2: TF-IDF ---
print("4. Creating and training TF-IDF model...")
# Initialize and fit TF-IDF on the preprocessed job descriptions
tfidf_vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1, 2))
job_embeddings_tfidf = tfidf_vectorizer.fit_transform(job_descriptions['jdFeatures'])
print("   ...TF-IDF model trained.")

# --- Save all the results ---
print("5. Saving all processed data and models to files...")
# We don't need the 'jdFeatures' column for the server, so we can drop it before saving
job_descriptions.drop(columns=['jdFeatures'], inplace=True)
job_descriptions.to_pickle("processed_jobs.pkl")

# Save Word2Vec embeddings
np.save("job_embeddings_w2v.npy", job_embeddings_w2v)

# Save TF-IDF vectorizer and embeddings
with open('tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(tfidf_vectorizer, f)
np.save("job_embeddings_tfidf.npy", job_embeddings_tfidf.toarray()) # Save as dense array

print(f"--- Processing Complete in {time.time() - start_time:.2f} seconds ---")
print("Saved: 'processed_jobs.pkl', 'job_embeddings_w2v.npy', 'tfidf_vectorizer.pkl', 'job_embeddings_tfidf.npy'")
print("You can now run the main app.py server.")