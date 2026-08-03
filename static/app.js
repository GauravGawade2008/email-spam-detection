// Email Spam Detector AI - Frontend Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const spamForm = document.getElementById('spam-form');
    const subjectInput = document.getElementById('subject-input');
    const messageInput = document.getElementById('message-input');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    const loadingState = document.getElementById('loading-state');
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    const resultCard = document.getElementById('result-card');
    
    const resultBadge = document.getElementById('result-badge');
    const resultIcon = document.getElementById('result-icon');
    const resultText = document.getElementById('result-text');
    const confidencePill = document.getElementById('confidence-pill');
    
    const spamProbText = document.getElementById('spam-prob-text');
    const meterBarFill = document.getElementById('meter-bar-fill');
    const spamProbVal = document.getElementById('spam-prob-val');
    const hamProbVal = document.getElementById('ham-prob-val');
    
    const predictionVal = document.getElementById('prediction-val');
    const triggersVal = document.getElementById('triggers-val');
    const lengthVal = document.getElementById('length-val');
    const recommendationBanner = document.getElementById('recommendation-banner');
    const recIcon = document.getElementById('rec-icon');
    const recText = document.getElementById('rec-text');
    
    const copyResultBtn = document.getElementById('copy-result-btn');
    const presetChips = document.querySelectorAll('.preset-chip');
    
    // Sidebar & Theme Elements
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const newCheckBtn = document.getElementById('new-check-btn');
    const historyList = document.getElementById('history-list');
    const emptyHistory = document.getElementById('empty-history');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    // Preset Data
    const PRESETS = {
        phishing: {
            subject: "Urgent: Reset your account password immediately",
            message: "Dear user, we detected a suspicious login attempt on your account. Click this link to confirm your details and claim your $500 bonus reward."
        },
        lottery: {
            subject: "CONGRATULATIONS! You won $1,000,000 Cash Prize!",
            message: "You have been randomly selected as a lucky winner of $1,000,000 cash. Reply immediately with your account details to claim your free reward."
        },
        work: {
            subject: "Project Review Meeting Agenda",
            message: "Hi Team, please find attached the slide deck for tomorrow's 10 AM synchronization call regarding the Q3 product roadmap."
        },
        invoice: {
            subject: "calpine daily gas nomination",
            message: "- calpine daily gas nomination 1 . doc"
        }
    };

    // State
    let currentTheme = localStorage.getItem('spam_theme') || 'dark';
    let scanHistory = JSON.parse(localStorage.getItem('spam_history') || '[]');

    // Initialize Theme
    applyTheme(currentTheme);

    // Initialize History
    renderHistory();

    // Event Listeners
    messageInput.addEventListener('input', updateCharCount);
    subjectInput.addEventListener('input', updateCharCount);

    spamForm.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', resetForm);
    newCheckBtn.addEventListener('click', resetForm);

    copyResultBtn.addEventListener('click', copyAnalysis);

    // Preset Chip Click Handlers
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const type = chip.dataset.type;
            if (PRESETS[type]) {
                subjectInput.value = PRESETS[type].subject;
                messageInput.value = PRESETS[type].message;
                updateCharCount();
            }
        });
    });

    // Theme Toggle Handler
    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('spam_theme', currentTheme);
        applyTheme(currentTheme);
    });

    // Mobile Sidebar Handlers
    if (menuBtn) {
        menuBtn.addEventListener('click', () => sidebar.classList.add('open'));
    }
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));
    }

    clearHistoryBtn.addEventListener('click', () => {
        scanHistory = [];
        localStorage.removeItem('spam_history');
        renderHistory();
    });

    // Functions
    function updateCharCount() {
        const total = subjectInput.value.length + messageInput.value.length;
        charCount.textContent = `${total} characters`;
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-moon';
            themeText.textContent = 'Dark Mode';
        } else {
            themeIcon.className = 'fa-solid fa-sun';
            themeText.textContent = 'Light Mode';
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const subject = subjectInput.value.trim();
        const message = messageInput.value.trim();

        if (!subject && !message) {
            showError("Please enter a subject or message to analyze.");
            return;
        }

        // Show loading state
        hideError();
        resultCard.classList.add('hidden');
        loadingState.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to get prediction from model server.");
            }

            displayResults(data, subject, message);
            saveToHistory(data, subject, message);

        } catch (err) {
            showError(err.message || "Network error. Please make sure the backend server is running.");
        } finally {
            loadingState.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    function displayResults(data, subject, message) {
        const { is_spam, confidence, spam_probability, ham_probability, analysis } = data;

        // Result Badge Setup
        if (is_spam) {
            resultBadge.className = 'result-badge spam';
            resultIcon.className = 'fa-solid fa-shield-virus';
            resultText.textContent = 'SPAM DETECTED';
            
            recommendationBanner.className = 'recommendation-banner spam';
            recIcon.className = 'fa-solid fa-triangle-exclamation';
            recText.textContent = 'High Risk: This message displays strong characteristics of spam or phishing. Do not open links or share personal data.';
        } else {
            resultBadge.className = 'result-badge ham';
            resultIcon.className = 'fa-solid fa-shield-check';
            resultText.textContent = 'LEGITIMATE EMAIL (HAM)';
            
            recommendationBanner.className = 'recommendation-banner ham';
            recIcon.className = 'fa-solid fa-circle-check';
            recText.textContent = 'Low Risk: This email appears legitimate based on linguistic analysis.';
        }

        confidencePill.textContent = `${confidence}% Confidence`;
        spamProbText.textContent = `Spam Risk Score: ${spam_probability}%`;

        // Animate meter fill bar
        meterBarFill.style.width = `${spam_probability}%`;

        spamProbVal.textContent = `${spam_probability}%`;
        hamProbVal.textContent = `${ham_probability}%`;

        predictionVal.textContent = is_spam ? 'SPAM' : 'HAM / SAFE';

        // Trigger words display
        if (analysis && analysis.trigger_words && analysis.trigger_words.length > 0) {
            triggersVal.textContent = analysis.trigger_words.join(', ');
        } else {
            triggersVal.textContent = 'None detected';
        }

        lengthVal.textContent = `Subject: ${analysis.subject_length} | Message: ${analysis.message_length}`;

        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function resetForm() {
        subjectInput.value = '';
        messageInput.value = '';
        updateCharCount();
        hideError();
        resultCard.classList.add('hidden');
        loadingState.classList.add('hidden');
        subjectInput.focus();
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorAlert.classList.remove('hidden');
    }

    function hideError() {
        errorAlert.classList.add('hidden');
    }

    function copyAnalysis() {
        const textToCopy = `Email Spam Analysis Result:
Prediction: ${predictionVal.textContent}
Spam Probability: ${spamProbVal.textContent}
Ham Probability: ${hamProbVal.textContent}
Triggers: ${triggersVal.textContent}`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyResultBtn.innerHTML;
            copyResultBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => {
                copyResultBtn.innerHTML = originalText;
            }, 2000);
        });
    }

    function saveToHistory(data, subject, message) {
        const item = {
            id: Date.now(),
            title: subject || message.substring(0, 30) + '...',
            is_spam: data.is_spam,
            spam_prob: data.spam_probability,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            subject,
            message,
            data
        };

        scanHistory.unshift(item);
        if (scanHistory.length > 10) scanHistory.pop();

        localStorage.setItem('spam_history', JSON.stringify(scanHistory));
        renderHistory();
    }

    function renderHistory() {
        if (scanHistory.length === 0) {
            emptyHistory.style.display = 'block';
            historyList.innerHTML = '';
            historyList.appendChild(emptyHistory);
            return;
        }

        emptyHistory.style.display = 'none';
        historyList.innerHTML = '';

        scanHistory.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            el.innerHTML = `
                <span class="badge-dot ${item.is_spam ? 'spam' : 'ham'}"></span>
                <span class="history-text" title="${item.title}">${item.title}</span>
            `;

            el.addEventListener('click', () => {
                subjectInput.value = item.subject || '';
                messageInput.value = item.message || '';
                updateCharCount();
                displayResults(item.data, item.subject, item.message);
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }
            });

            historyList.appendChild(el);
        });
    }
});
