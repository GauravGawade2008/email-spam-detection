import json
import os
import joblib
import pandas as pd
from scipy.sparse import hstack
from http.server import BaseHTTPRequestHandler

# Locate models directory relative to project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

MODEL_PATH = os.path.join(MODEL_DIR, 'spam_model.pkl')
TFIDF_SUBJ_PATH = os.path.join(MODEL_DIR, 'tfidf_subject.pkl')
TFIDF_MSG_PATH = os.path.join(MODEL_DIR, 'tfidf_message.pkl')

_model = None
_tfidf_subject = None
_tfidf_message = None

def get_models():
    global _model, _tfidf_subject, _tfidf_message
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _tfidf_subject = joblib.load(TFIDF_SUBJ_PATH)
        _tfidf_message = joblib.load(TFIDF_MSG_PATH)
    return _model, _tfidf_subject, _tfidf_message

SPAM_KEYWORDS = [
    "urgent", "free", "winner", "cash", "prize", "dollar", "$", "credit", "account",
    "password", "login", "verify", "security", "suspended", "claim", "click", "limited",
    "offer", "guaranteed", "earn", "risk-free", "investment", "buy", "cheap", "bonus",
    "action required", "congratulations", "lottery", "refinance"
]

def analyze_text(text):
    text_lower = text.lower()
    return [kw for kw in SPAM_KEYWORDS if kw in text_lower]

def predict_email(subject, message):
    model, tfidf_subj, tfidf_msg = get_models()
    
    subj_clean = subject.strip() if subject else ""
    msg_clean = message.strip() if message else ""
    
    df = pd.DataFrame([{"Subject": subj_clean, "Message": msg_clean}])
    
    subj_vec = tfidf_subj.transform(df['Subject'])
    msg_vec = tfidf_msg.transform(df['Message'])
    
    features = hstack([subj_vec, msg_vec])
    
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    classes = list(model.classes_)
    
    spam_idx = classes.index('spam') if 'spam' in classes else 1
    spam_prob = float(probabilities[spam_idx])
    ham_prob = float(1.0 - spam_prob)
    
    is_spam = (prediction.lower() == 'spam')
    confidence = float(max(probabilities) * 100)
    
    subj_keywords = analyze_text(subj_clean)
    msg_keywords = analyze_text(msg_clean)
    all_triggers = list(set(subj_keywords + msg_keywords))
    
    return {
        "prediction": "spam" if is_spam else "ham",
        "is_spam": is_spam,
        "confidence": round(confidence, 2),
        "spam_probability": round(spam_prob * 100, 2),
        "ham_probability": round(ham_prob * 100, 2),
        "analysis": {
            "trigger_words": all_triggers,
            "subject_length": len(subj_clean),
            "message_length": len(msg_clean)
        }
    }

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            subject = body.get('subject', '')
            message = body.get('message', '')
            
            if not subject and not message:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {"error": "Please provide a subject or message to analyze."}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return

            result = predict_email(subject, message)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"error": str(e)}
            self.wfile.write(json.dumps(response).encode('utf-8'))
