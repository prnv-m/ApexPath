import os
import re
import numpy as np
import pandas as pd
import nltk
from flask import Flask, request, jsonify
from flask_cors import CORS
from gensim.models import Word2Vec
from sklearn.metrics.pairwise import cosine_similarity
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk import pos_tag
import base64
import io
from PyPDF2 import PdfReader
import pickle # Required for loading the saved TF-IDF vectorizer
from thefuzz import fuzz

# --- INITIAL SETUP: NLTK Data Check ---
try:
    stopwords.words("english")
except LookupError:
    print("Downloading required NLTK data...")
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('averaged_perceptron_tagger')
    print("NLTK data downloaded.")

# --- FLASK APP INITIALIZATION ---
app = Flask(__name__)
CORS(app)


# --- HELPER FUNCTIONS (No changes needed here) ---
def preprocess_text(text):
    """
    Cleans, tokenizes, and filters text to extract meaningful keywords.
    """
    if not isinstance(text, str):
        return ""
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
    """
    Calculates the mean Word2Vec embedding for a document.
    """
    tokens = text.split()
    embeddings = [model.wv[word] for word in tokens if word in model.wv]
    if embeddings:
        return np.mean(embeddings, axis=0)
    else:
        return np.zeros(model.vector_size)

def get_resume_text_from_request(data):
    """
    Extracts resume text from a request, whether it's plain text or a Base64 encoded file.
    Returns the text string or None if not found.
    """
    if not data:
        return None

    if 'resume_text' in data and data['resume_text']:
        return data['resume_text']
    elif 'file_base64' in data and data['file_base64']:
        try:
            decoded_bytes = base64.b64decode(data['file_base64'])
            mime_type = data.get('mime_type', '')
            text = ""
            if 'pdf' in mime_type:
                pdf_file = io.BytesIO(decoded_bytes)
                reader = PdfReader(pdf_file)
                for page in reader.pages:
                    text += page.extract_text() or ""
            elif 'text' in mime_type:
                text = decoded_bytes.decode('utf-8')
            else:
                return None
            return text
        except Exception as e:
            print(f"Error processing Base64 file: {e}")
            return None
    return None


# --- UPDATED GLOBAL VARIABLES & DATA LOADING FOR HYBRID MODEL ---
print("--- Server Startup Sequence ---")

# Load the Word2Vec model
print("1. Loading Word2Vec model...")
w2v_model = Word2Vec.load(os.path.join('models', 'resume_word2vec.model'))

# Load the TF-IDF vectorizer
print("2. Loading TF-IDF model...")
with open('tfidf_vectorizer.pkl', 'rb') as f:
    tfidf_vectorizer = pickle.load(f)

# Load the main job data DataFrame
print("3. Loading pre-computed job data and all embeddings...")
job_descriptions = pd.read_pickle("processed_jobs.pkl")

# Load the pre-calculated embeddings for both models
job_embeddings_w2v = np.load("job_embeddings_w2v.npy")
job_embeddings_tfidf = np.load("job_embeddings_tfidf.npy")
print(f"   ...Loaded {len(job_descriptions)} jobs and embeddings for both models.")

print("--- Startup Complete. Server is ready. ---")


# --- API ENDPOINT 1: Match Jobs (UPDATED with HYBRID scoring) ---
@app.route('/match-jobs', methods=['POST'])
def match_jobs():
    """
    Finds top 5 job matches using a hybrid of TF-IDF and Word2Vec scores.
    """
    data = request.get_json()
    resume_text = get_resume_text_from_request(data)
    if not resume_text:
        return jsonify({"error": "Missing or invalid resume data"}), 400

    preprocessed_resume = preprocess_text(resume_text)

    # --- Score Calculation for Both Models ---
    
    # 1. Word2Vec Score (Semantic Similarity)
    resume_embedding_w2v = document_embedding(preprocessed_resume, w2v_model).reshape(1, -1)
    w2v_scores = cosine_similarity(resume_embedding_w2v, job_embeddings_w2v)[0]

    # 2. TF-IDF Score (Keyword Similarity)
    resume_embedding_tfidf = tfidf_vectorizer.transform([preprocessed_resume])
    tfidf_scores = cosine_similarity(resume_embedding_tfidf, job_embeddings_tfidf)[0]

    # --- Hybrid Score Calculation ---
    # These weights can be tuned. Giving more weight to TF-IDF emphasizes direct keyword matches.
    w_tfidf = 0.6
    w_w2v = 0.4
    
    hybrid_scores = (w_tfidf * tfidf_scores) + (w_w2v * w2v_scores)

    # Get top 5 indices based on the new hybrid score
    top_5_indices = np.argsort(hybrid_scores)[-5:][::-1]
    
    results = []
    for i in top_5_indices:
        job_info = job_descriptions.iloc[i]
        results.append({
            "jobId": int(job_info['job_id']),
            "title": job_info['title'],
            "companyName": job_info['company_name'],
            "description": job_info['description'],
            # Send the final hybrid score to the frontend for display
            "similarityScore": float(hybrid_scores[i]) 
        })
    return jsonify(results)


# --- API ENDPOINT 2: Explain Match (No changes needed, logic is still perfect) ---
@app.route('/explain-match', methods=['POST'])
def explain_match():
    """
    Explains a match by finding common keywords, which aligns with the TF-IDF model's strengths.
    """
    data = request.get_json()
    
    resume_text = get_resume_text_from_request(data)
    if not resume_text:
        return jsonify({"error": "Missing or invalid resume data in request"}), 400

    job_description_text = data.get('job_description_text')
    if not job_description_text:
        return jsonify({"error": "Missing 'job_description_text'"}), 400

    resume_keywords = set(preprocess_text(resume_text).split())
    job_keywords = set(preprocess_text(job_description_text).split())
    matching_keywords = sorted(list(resume_keywords.intersection(job_keywords)))

    return jsonify({"matchingKeywords": matching_keywords})

import math

@app.route('/search-jobs', methods=['GET'])
def search_jobs():
    """
    Performs a fuzzy search for jobs based on a title query and location, with pagination.
    Accepts 'query', 'location', and 'page' as URL parameters.
    e.g., /search-jobs?query=python dev&location=delhi&page=1
    """
    query = request.args.get('query', '').lower()
    location = request.args.get('location', '').lower()
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1
    
    results_per_page = 10

    if not query and not location:
        return jsonify({"error": "Please provide a search query or a location."}), 400

    # Start with the full dataset of jobs
    results_df = job_descriptions.copy()

    # 1. Filter by location (if provided)
    if location:
        # Using .str.contains for a fast, simple "fuzzy" location match
        results_df = results_df[results_df['location'].str.lower().str.contains(location, na=False)]

    # 2. Perform fuzzy search on the title (if provided)
    if query:
        # thefuzz.partial_ratio is great for matching "python dev" to "Senior Python Developer"
        # We calculate a score for each job title against the query.
        results_df['match_score'] = results_df['title'].apply(
            lambda title: fuzz.partial_ratio(query, str(title).lower())
        )
        # Filter out jobs with a low match score and sort by the best matches
        results_df = results_df[results_df['match_score'] > 70].sort_values(
            by='match_score', ascending=False
        )
    
    # 3. Paginate the results
    total_results = len(results_df)
    total_pages = math.ceil(total_results / results_per_page)
    start_index = (page - 1) * results_per_page
    end_index = start_index + results_per_page
    paginated_df = results_df.iloc[start_index:end_index]
    
    # 4. Format and return the results
    search_results = paginated_df.to_dict('records')

    return jsonify({
        "results": search_results,
        "totalResults": total_results,
        "totalPages": total_pages,
        "currentPage": page
    })
# --- MAIN EXECUTION ---
if __name__ == '__main__':
    app.run(debug=True, port=5001)