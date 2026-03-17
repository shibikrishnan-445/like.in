function renderHistory() {
    const historyContainer = document.getElementById('sidebar-history');
    if (!historyContainer) return;

    const history = window.appStore.getHistory();
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<div class="history-empty">No recent activity</div>';
        return;
    }

    historyContainer.innerHTML = history.map(item => `
        <div class="history-item">
            <span class="history-action">${item.action}</span>
            <span class="history-details">${item.details}</span>
            <span class="history-time">${formatRelativeTime(item.timestamp)}</span>
        </div>
    `).join('');
}

function formatRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now - then) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return then.toLocaleDateString();
}

// Initial render and subscribe
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    window.appStore.subscribe(() => {
        renderHistory();
    });
});
