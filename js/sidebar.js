/**
 * Sidebar Logic: Resizing, Collapsing, and Hiding Recent Activity
 */
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
});

function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const shrinkBtn = document.getElementById('shrink-sidebar');
    const expandBtn = document.getElementById('expand-sidebar');
    const resizer = document.getElementById('sidebar-resizer');

    // Load saved state
    const sidebarWidth = localStorage.getItem('sidebar_width') || '260';
    sidebar.style.width = `${sidebarWidth}px`;

    // Width Adjustment Buttons
    const updateWidth = (newWidth) => {
        if (newWidth < 200) newWidth = 200;
        if (newWidth > 500) newWidth = 500;
        sidebar.style.width = `${newWidth}px`;
        localStorage.setItem('sidebar_width', newWidth);
    };

    if (shrinkBtn) {
        shrinkBtn.addEventListener('click', () => {
            const currentWidth = parseInt(sidebar.style.width) || 260;
            updateWidth(currentWidth - 20);
        });
    }

    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            const currentWidth = parseInt(sidebar.style.width) || 260;
            updateWidth(currentWidth + 20);
        });
    }

    // Drag to Resize
    let isResizing = false;

    if (resizer) {
        resizer.addEventListener('mousedown', (e) => {
            if (sidebar.classList.contains('collapsed')) return;
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            let newWidth = e.clientX;
            // Constraints
            if (newWidth < 180) newWidth = 180;
            if (newWidth > 500) newWidth = 500;
            
            sidebar.style.width = `${newWidth}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                localStorage.setItem('sidebar_width', sidebar.offsetWidth);
            }
        });
    }
}
