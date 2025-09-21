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


# --- HELPER FUNCTIONS ---
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

    # Case 1: Plain text is provided
    if 'resume_text' in data and data['resume_text']:
        return data['resume_text']

    # Case 2: A Base64 encoded file is provided
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
                return None  # Unsupported type
            return text
        except Exception as e:
            print(f"Error processing Base64 file: {e}")
            return None
    
    return None


# --- GLOBAL VARIABLES & FAST DATA LOADING ---
print("--- Server Startup Sequence ---")
print("1. Loading Word2Vec model...")
model = Word2Vec.load(os.path.join('models', 'resume_word2vec.model'))
print("   ...Word2Vec model loaded.")

print("2. Loading pre-computed job data and embeddings...")
job_descriptions = pd.read_pickle("processed_jobs.pkl")
job_description_embeddings = np.load("job_embeddings.npy")
print(f"   ...Loaded {len(job_descriptions)} jobs and embeddings instantly.")

print("--- Startup Complete. Server is ready to accept requests. ---")


# --- API ENDPOINT 1: Match Jobs ---
@app.route('/match-jobs', methods=['POST'])
def match_jobs():
    """
    Finds the top 5 job descriptions that match the provided resume.
    """
    data = request.get_json()
    resume_text = get_resume_text_from_request(data)

    if not resume_text:
        return jsonify({"error": "Missing or invalid resume data in request"}), 400

    preprocessed_resume = preprocess_text(resume_text)
    resume_embedding = document_embedding(preprocessed_resume, model).reshape(1, -1)
    similarity_scores = cosine_similarity(resume_embedding, job_description_embeddings)[0]
    top_5_indices = np.argsort(similarity_scores)[-5:][::-1]
    
    results = []
    for i in top_5_indices:
        job_info = job_descriptions.iloc[i]
        results.append({
            "jobId": int(job_info['job_id']),
            "title": job_info['title'],
            "companyName": job_info['company_name'],
            "description": job_info['description'],
            "similarityScore": float(similarity_scores[i])
        })
    return jsonify(results)


# --- API ENDPOINT 2: Explain Match ---
@app.route('/explain-match', methods=['POST'])
def explain_match():
    """
    Explains a match by finding common keywords between a resume and a job description.
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


# --- MAIN EXECUTION ---
if __name__ == '__main__':
    # Use port 5001 to avoid conflicts with other development servers
    app.run(debug=True, port=5001)