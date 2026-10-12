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