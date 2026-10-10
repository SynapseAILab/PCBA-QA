let currentLang = 'zh';

function toggleLanguage() {
    const btn = document.getElementById('langToggle');
    const elements = document.querySelectorAll('[data-zh]');
    const placeholders = document.querySelectorAll('[data-zh-placeholder]');
    
    if (currentLang === 'zh') {
        currentLang = 'en';
        document.documentElement.lang = 'en';
        btn.textContent = '中文';
    } else {
        currentLang = 'zh';
        document.documentElement.lang = 'zh-TW';
        btn.textContent = 'English';
    }

    elements.forEach(el => {
        if (el.tagName === 'IMG') {
            el.alt = el.getAttribute(`data-${currentLang}-alt`);
        } else {
            el.textContent = el.getAttribute(`data-${currentLang}`);
        }
    });

    placeholders.forEach(el => {
        el.placeholder = el.getAttribute(`data-${currentLang}-placeholder`);
    });
}

const micBtn = document.getElementById('mic-btn');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const chatBox = document.getElementById('chatBox');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW'; 
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        userInput.value = speechToText;
        appendMessage('user', speechToText);
        sendToBackend(speechToText);
    };

    recognition.onend = () => {
        micBtn.classList.remove('recording');
        micBtn.innerText = currentLang === 'zh' ? '🎙️ 點擊說話' : '🎙️ Click to Speak';
    };

    recognition.onerror = (event) => {
        console.error('語音辨識錯誤:', event.error);
        alert(currentLang === 'zh' ? '語音辨識失敗，請檢查麥克風權限。' : 'Speech recognition failed. Please check microphone permissions.');
    };
} else {
    micBtn.style.display = 'none';
    alert('您的瀏覽器不支援 Web Speech API，請使用 Chrome 瀏覽器。');
}

micBtn.addEventListener('click', () => {
    if (micBtn.classList.contains('recording')) {
        recognition.stop();
    } else {
        micBtn.classList.add('recording');
        micBtn.innerText = currentLang === 'zh' ? '🛑 錄音中...' : '🛑 Recording...';
        recognition.start();
    }
});

sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) {
        appendMessage('user', text);
        sendToBackend(text);
        userInput.value = '';
    }
});

clearBtn.addEventListener('click', () => {
    chatBox.innerHTML = ''; 
    userInput.value = ''; 
    const welcomeMsg = currentLang === 'zh' 
        ? '您好！請點擊麥克風開始說話，或直接輸入文字。' 
        : 'Hello! Click the microphone to speak, or type your message.';
    appendMessage('bot', welcomeMsg); 
});

function sendToBackend(text) {
    const apiUrl = 'https://yourdomain.com'; 
    const payload = { message: text };

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('網路回應不正常');
        }
        return response.json();
    })
    .then(data => {
        appendMessage('bot', data.reply);
    })
    .catch(error => {
        console.error('AJAX 請求失敗:', error);
        setTimeout(() => {
            const fallbackMsg = currentLang === 'zh' 
                ? `（模擬回覆）我收到您的訊息「${text}」了，但目前尚未連線至真實 NLP 後端伺服器與資料庫。` 
                : `(Simulated reply) Received your message "${text}", but not yet connected to a real NLP backend server.`;
            appendMessage('bot', fallbackMsg);
        }, 500);
    });
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-msg' : 'bot-msg';
    const prefixUser = currentLang === 'zh' ? '你: ' : 'You: ';
    const prefixBot = currentLang === 'zh' ? 'AI 助教: ' : 'PCBA-AI: ';
    msgDiv.innerText = sender === 'user' ? `${prefixUser}${text}` : `${prefixBot}${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}