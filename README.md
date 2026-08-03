# 📧 Email Spam Detection AI

An end-to-end Machine Learning project that classifies emails as **Spam** or **Ham (Legitimate)** with **98.72% accuracy**, featuring a **ChatGPT-inspired minimal Web Interface** ready for instant **Vercel deployment**.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.0%2B-F7931E?logo=scikit-learn&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0%2B-000000?logo=flask&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 🌟 Overview & Workflow

This project covers the full Machine Learning pipeline—from raw email text processing to a production-grade web application:

1. **Manual Data Engineering & EDA** (`notebooks/data-cleaning.ipynb`):
   - Cleaned raw dataset containing thousands of email records.
   - Handled missing values, normalized text, and separated email **Subject** and **Message** components.
2. **Model Training & Feature Pipeline** (`notebooks/model-training.ipynb`):
   - Built separate `TfidfVectorizer` models for both **Subject** and **Message** to capture distinct linguistic features.
   - Combined sparse matrices via horizontal stacking (`hstack`).
   - Trained a **Logistic Regression** classifier achieving **98.72% test accuracy** and **0.9992 ROC-AUC**.
   - Exported model artifacts to `models/` directory (`spam_model.pkl`, `tfidf_subject.pkl`, `tfidf_message.pkl`).
3. **AI-Assisted ChatGPT Web Interface**:
   - Designed a sleek, minimalist **ChatGPT-inspired web UI** using HTML5, Vanilla CSS, and JavaScript.
   - Features real-time spam prediction, probability confidence gauge, risk metric breakdown, preset sample emails, dark/light theme, and local history tracking.
4. **Vercel Serverless Deployment**:
   - Created a Vercel-compatible serverless API (`api/predict.py`) enabling 1-click zero-config cloud deployment.

---

## 📊 Model Performance

| Metric | Score |
| :--- | :--- |
| **Accuracy** | **98.72%** |
| **ROC-AUC Score** | **0.9992** |
| **Spam Precision / Recall / F1** | **0.98 / 1.00 / 0.99** |
| **Ham Precision / Recall / F1** | **1.00 / 0.98 / 0.99** |

---

## 📁 Project Structure

```text
email-spam-detection/
├── api/
│   └── predict.py              # Vercel Serverless API Function (POST /api/predict)
├── datasets/
│   └── email_data_cleaned.csv  # Cleaned dataset used for model training
├── models/
│   ├── spam_model.pkl          # Trained Logistic Regression classifier
│   ├── tfidf_message.pkl       # Fitted TF-IDF Vectorizer for Message body
│   └── tfidf_subject.pkl       # Fitted TF-IDF Vectorizer for Subject line
├── notebooks/
│   ├── data-cleaning.ipynb     # Exploratory Data Analysis & cleaning notebook
│   └── model-training.ipynb    # Model training, evaluation & serialization
├── static/
│   ├── app.js                  # Frontend state management, presets & history
│   └── style.css               # ChatGPT-inspired dark/light CSS design system
├── app.py                      # Local Flask server (Run: python app.py)
├── index.html                  # Main Web Application Interface
├── requirements.txt            # Python dependencies for local & Vercel runtime
├── vercel.json                 # Vercel serverless rewrite & routing rules
└── README.md                   # Project documentation & deployment guide
```

---

## 🎨 Web Interface Features

- 💬 **ChatGPT-Inspired UI**: Clean, distraction-free interface matching ChatGPT's aesthetic.
- 🎯 **Dual Field Inputs**: Input both email **Subject** and **Message Body** for enhanced classification accuracy.
- 📈 **Probability Meter**: Displays precise confidence percentage (e.g. `99.1% Spam Probability`).
- ⚡ **Preset Samples**: One-click test chips for Phishing Scams, Work Meetings, Lottery Fraud, and Invoice follow-ups.
- 📜 **Local Scan History**: Automatically records recent checks in browser `localStorage`.
- 🌓 **Dark & Light Mode**: Seamless theme switching with persistent user preferences.

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.10+
- `pip` package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/email-spam-detection.git
   cd email-spam-detection
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the local web server**:
   ```bash
   python app.py
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5000` to interact with the web interface.

---

## ☁️ Deploying to Vercel

This repository is pre-configured for instant Vercel deployment:

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New Project**.
3. Select your repository and click **Deploy**. Vercel will automatically detect the Python serverless backend and static frontend!

---

## 🛠️ Tech Stack

- **Machine Learning**: Scikit-Learn, SciPy, Joblib, Pandas, NumPy
- **Backend API**: Python, Flask, Vercel Serverless Functions (`BaseHTTPRequestHandler`)
- **Frontend UI**: HTML5, Vanilla CSS3, JavaScript (ES6+)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
