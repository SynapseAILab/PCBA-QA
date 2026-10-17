const launchBtn = document.getElementById('launch-btn');
const modal = document.getElementById('launcherModal');
const messageEl = document.getElementById('launcherMessage');

launchBtn.addEventListener('click', () => {
    modal.classList.add('active');
    let count = 3;
    messageEl.textContent = `系統啟動中 (${count})`;

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            messageEl.textContent = `系統啟動中 (${count})`;
        } else {
            clearInterval(timer);
            window.location.href = 'index.html';
        }
    }, 1000);
});
const guideBtn = document.getElementById('guide-btn');
const guideModal = document.getElementById('guideModal');
const guideCloseBtn = document.getElementById('guideCloseBtn');

// 點擊「操作說明」按鈕時開啟對話框
if (guideBtn && guideModal) {
    guideBtn.addEventListener('click', () => {
        guideModal.classList.add('active');
    });
}

// 點擊對話框內的「了解 / Close」按鈕時關閉對話框
if (guideCloseBtn && guideModal) {
    guideCloseBtn.addEventListener('click', () => {
        guideModal.classList.remove('active');
    });
}

// 點擊對話框外部的暗色背景也能關閉對話框
if (guideModal) {
    guideModal.addEventListener('click', (e) => {
        if (e.target === guideModal) {
            guideModal.classList.remove('active');
        }
    });
}

