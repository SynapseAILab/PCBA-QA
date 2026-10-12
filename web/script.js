let countdownTimer = null;
let shouldRedirectOnOk = false;
let currentRequestId = 0;

function showCustomAlert(message, emoji = '🎙️', showConfirm = false) {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }

    shouldRedirectOnOk = false;

    const modal = document.getElementById('customModal');
    const messageEl = document.getElementById('modalMessage');
    messageEl.textContent = message;
    
    const emojiSpan = modal.querySelector('.tech-radar-icon').lastElementChild;
    if (emojiSpan && emojiSpan.tagName === 'SPAN' && !emojiSpan.classList.contains('radar-wave')) {
        emojiSpan.textContent = emoji;
    }

    const okBtn = document.getElementById('modalOkBtn');
    const yesBtn = document.getElementById('modalYesBtn');
    const noBtn = document.getElementById('modalNoBtn');

    if (showConfirm) {
        okBtn.style.display = 'none';
        yesBtn.style.display = 'inline-block';
        noBtn.style.display = 'inline-block';
    } else {
        okBtn.style.display = 'inline-block';
        yesBtn.style.display = 'none';
        noBtn.style.display = 'none';
    }
    
    modal.classList.add('active');
}

const modalOverlay = document.getElementById('customModal');
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        const techGlass = modalOverlay.querySelector('.tech-glass');
        techGlass.classList.add('shake-anim');
        setTimeout(() => {
            techGlass.classList.remove('shake-anim');
        }, 400);
    }
});

document.getElementById('modalOkBtn').addEventListener('click', () => {
    const modal = document.getElementById('customModal');
    modal.classList.remove('active');
    if (shouldRedirectOnOk) {
        shouldRedirectOnOk = false;
        window.location.href = 'launcher.html';
    }
});

document.getElementById('modalYesBtn').addEventListener('click', () => {
    if (countdownTimer) return;
    
    const modal = document.getElementById('customModal');
    const messageEl = document.getElementById('modalMessage');
    const emojiSpan = modal.querySelector('.tech-radar-icon').lastElementChild;
    if (emojiSpan) {
        emojiSpan.textContent = '👋';
    }
    
    document.getElementById('modalYesBtn').style.display = 'none';
    document.getElementById('modalNoBtn').style.display = 'none';
    
    let count = 3;
    messageEl.textContent = `掰 下次見！ (${count})`;
    
    countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
            messageEl.textContent = `掰 下次見！ (${count})`;
        } else {
            clearInterval(countdownTimer);
            countdownTimer = null;
            
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            currentRequestId++;
            chatBox.innerHTML = '';
            userInput.value = '';
            appendMessage('bot', '您已成功登出系統。', false);

            messageEl.textContent = '已完成登出\n將返回系統啟動頁';
            if (emojiSpan) {
                emojiSpan.textContent = '🔒';
            }
            document.getElementById('modalOkBtn').style.display = 'inline-block';
            shouldRedirectOnOk = true;
        }
    }, 1000);
});

document.getElementById('modalNoBtn').addEventListener('click', () => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    document.getElementById('customModal').classList.remove('active');
});

const micBtn = document.getElementById('mic-btn');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-btn');
const chatBox = document.getElementById('chatBox');
const logoutBtn = document.getElementById('logout-btn');

window.addEventListener('load', () => {
    if (!navigator.onLine) {
        showCustomAlert('⚠️ 目前偵測不到網路連線，請檢查您的網際網路設定。');
    }
});

window.addEventListener('offline', () => {
    showCustomAlert('⚠️ 網路連線已中斷！目前處於離線狀態。');
});

window.addEventListener('online', () => {
    showCustomAlert('✅ 網路連線已恢復正常！');
});

logoutBtn.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    showCustomAlert('是否確認登出', '⚠️', true);
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW'; 
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        if (!navigator.onLine) {
            showCustomAlert('⚠️ 目前無網路連線，無法進行語音辨識與傳送。');
            return;
        }
        const speechToText = event.results[0][0].transcript;
        
        if (/[a-zA-Z]/.test(speechToText)) {
            showCustomAlert('⚠️ 語音辨識錯誤\n僅支援繁體中文輸入，偵測到非中文內容。');
            return;
        }

        userInput.value = speechToText;
        appendMessage('user', speechToText);
        sendToBackend(speechToText);
    };

    recognition.onend = () => {
        micBtn.classList.remove('recording');
        micBtn.innerText = '🎙️ 點擊說話';
    };

    recognition.onerror = (event) => {
        console.error('語音辨識錯誤:', event.error);
        if (event.error === 'not-allowed') {
            showCustomAlert('⚠️ 請允許麥克風權限以使用語音助理。');
        } else {
            showCustomAlert('語音辨識發生錯誤，請重新點擊麥克風。');
        }
    };
} else {
    micBtn.style.display = 'none';
    showCustomAlert('⚠️ 您的瀏覽器不支援語音辨識，請使用 Chrome。');
}

micBtn.addEventListener('click', () => {
    if (!navigator.onLine) {
        showCustomAlert('⚠️ 目前無網路連線，無法使用語音功能。');
        return;
    }

    if (micBtn.classList.contains('recording')) {
        recognition.stop();
    } else {
        micBtn.classList.add('recording');
        micBtn.innerText = '🛑 錄音中...';
        recognition.start();
    }
});

sendBtn.addEventListener('click', () => {
    if (!navigator.onLine) {
        showCustomAlert('目前無網路連線\n無法傳送訊息至伺服器！');
        return;
    }

    const text = userInput.value.trim();
    if (!text) {
        appendMessage('bot', '我不清楚你在說甚麼 請再說一次', true);
        return;
    }

    if (/[a-zA-Z]/.test(text)) {
        showCustomAlert('僅支援繁體中文輸入\n偵測到非中文內容');
        return;
    }

    appendMessage('user', text);
    sendToBackend(text);
    userInput.value = '';
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

clearBtn.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    currentRequestId++;

    chatBox.classList.add('clear-anim');
    setTimeout(() => {
        chatBox.classList.remove('clear-anim');
    }, 400);

    chatBox.innerHTML = ''; 
    userInput.value = ''; 
    appendMessage('bot', '系統提示: 您好！請點擊麥克風開始說話，或直接輸入文字。', false); 
});

function sendToBackend(text) {
    if (!navigator.onLine) {
        showCustomAlert('⚠️ 網路連線已中斷，無法連接後端伺服器。');
        return;
    }

    const requestId = ++currentRequestId;
    const apiUrl = 'https://yourdomain.com';  // update your domain name. ex. https://dee.lit.edu.tw/
    const payload = { message: text };

    const loadingId = 'loading-' + Date.now();
    appendLoadingMessage(loadingId, '正在思考中');

    const fetchCall = fetch(apiUrl, {
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
    .then(data => ({ reply: data.reply }))
    .catch(error => {
        console.error('AJAX 請求失敗:', error);
        return { reply: `（模擬回覆）我收到您的訊息「${text}」了，但目前尚未連線至真實 NLP 後端伺服器與資料庫。` };
    });

    const minDelay = new Promise(resolve => setTimeout(resolve, 3000));

    Promise.all([fetchCall, minDelay])
        .then(([result]) => {
            if (requestId !== currentRequestId) {
                removeLoadingMessage(loadingId);
                return;
            }
            removeLoadingMessage(loadingId);
            appendMessage('bot', result.reply, true);
        });
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        
        const cleanText = text.replace(/AI\s*助教[:：]?\s*/g, '').replace(/AI助教/g, '');
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'zh-TW';
        utterance.rate = 1.0; 
        utterance.pitch = 1.0; 
        window.speechSynthesis.speak(utterance);
    }
}

function appendMessage(sender, text, shouldSpeak = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-msg' : 'bot-msg';
    
    if (sender === 'user') {
        msgDiv.innerText = `你: ${text}`;
    } else {
        msgDiv.innerText = text;
        if (shouldSpeak) {
            speakText(text);
        }
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendLoadingMessage(id, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bot-msg loading-msg';
    msgDiv.id = id;
    msgDiv.innerHTML = `${text} <span class="loading-dots"><span></span><span></span><span></span></span>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeLoadingMessage(id) {
    const loadingEl = document.getElementById(id);
    if (loadingEl) {
        loadingEl.remove();
    }
}



// 在 script.js 中加入權限主動偵測與自動提示邏輯

async function checkMicrophonePermission() {
    if (navigator.permissions && navigator.permissions.query) {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
            if (permissionStatus.state === 'denied') {
                showAlert('麥克風權限已被瀏覽器封鎖！\n請點擊網址列左側的「鎖頭 🔒」圖示\n將麥克風改為「允許」後重新整理');
            }
            permissionStatus.onchange = () => {
                if (permissionStatus.state === 'denied') {
                    showAlert('麥克風權限已被瀏覽器封鎖！\n請點擊網址列左側的「鎖頭 🔒」圖示\n將麥克風改為「允許」後重新整理');
                }
            };
        } catch (e) {
            console.log('Permissions API 狀態檢查不支援', e);
        }
    }
}

// 頁面載入完成後自動執行權限檢查
window.addEventListener('load', () => {
    checkMicrophonePermission();
});