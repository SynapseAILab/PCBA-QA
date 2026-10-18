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

if (guideBtn && guideModal) {
    guideBtn.addEventListener('click', () => {
        guideModal.classList.add('active');
    });
}

if (guideCloseBtn && guideModal) {
    guideCloseBtn.addEventListener('click', () => {
        guideModal.classList.remove('active');
    });
}

if (guideModal) {
    guideModal.addEventListener('click', (e) => {
        if (e.target === guideModal) {
            guideModal.classList.remove('active');
        }
    });
}

