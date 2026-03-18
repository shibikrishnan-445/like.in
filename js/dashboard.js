document.addEventListener('DOMContentLoaded', () => {
    initDashboardButtons();
    window.appStore.subscribe(() => {
        if (document.getElementById('view-dashboard').classList.contains('active')) {
            window.renderDashboard();
        }
    });

    // Initial render
    window.renderDashboard();
});

window.currentDashboardDraft = null;

function initDashboardButtons() {
    const configBtn = document.getElementById('configure-dashboard-btn');
    const saveBtn = document.getElementById('save-configuration-btn');
    
    const dashboardView = document.getElementById('view-dashboard');
    const configView = document.getElementById('view-config');
    const pageTitle = document.getElementById('page-title');

    const downloadBtn = document.getElementById('download-config-btn');
    
    configBtn.addEventListener('click', () => {
        // Enter Config Mode
        dashboardView.classList.add('hidden');
        dashboardView.classList.remove('active');
        
        configView.classList.remove('hidden');
        configView.classList.add('active');
        
        configBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        downloadBtn.classList.add('hidden'); // Hide download in config mode to focus on editing? Or keep it? User might want to download the draft. Let's keep it visible for now.
        
        pageTitle.textContent = 'Dashboard Configuration';
        
        // Setup draft
        window.currentDashboardDraft = JSON.parse(JSON.stringify(window.appStore.getDashboardConfig()));
        window.renderConfigCanvas();
    });

    saveBtn.addEventListener('click', () => {
        // Save Config Mode
        window.appStore.setDashboardConfig(window.currentDashboardDraft);
        exitConfigMode();
    });

    downloadBtn.addEventListener('click', () => {
        const config = window.appStore.getDashboardConfig();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "dashboard_config.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    window.exitConfigMode = () => {
        configView.classList.add('hidden');
        configView.classList.remove('active');
        
        dashboardView.classList.remove('hidden');
        dashboardView.classList.add('active');
        
        saveBtn.classList.add('hidden');
        configBtn.classList.remove('hidden');
        pageTitle.textContent = 'Dashboard';
        window.currentDashboardDraft = null;
        document.getElementById('widget-settings-panel').classList.add('hidden');
        
        window.renderDashboard();
    };

    // Global Date Filter
    const dateSelect = document.getElementById('date-filter');
    if (dateSelect) {
        dateSelect.addEventListener('change', (e) => {
            window.appStore.setDateFilter(e.target.value);
        });
    }
}

window.renderConfigCanvas = () => {
    const draft = window.currentDashboardDraft || [];
    const canvas = document.getElementById('config-canvas');
    
    if (draft.length > 0) {
        canvas.classList.add('has-widgets');
    } else {
        canvas.classList.remove('has-widgets');
    }

    // Generate HTML for each
    let html = draft.map(w => window.widgetTemplates.getComponentHtml(w)).join('') + `<div class="drop-placeholder-start">Drag and drop widgets here</div>`;
    
    // Add big save button at the bottom
    html += `
        <div class="config-canvas-footer" style="grid-column: span 12; display: flex; justify-content: center; padding: 2rem 0; clear: both;">
            <button id="canvas-save-btn" class="btn btn-success" style="padding: 1rem 3rem; font-size: 1.2rem; border-radius: 50px; box-shadow: var(--shadow-lg);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save & Apply Dashboard Changes
            </button>
        </div>
    `;
    
    canvas.innerHTML = html;

    // Attach canvas save button
    const canvasSaveBtn = canvas.querySelector('#canvas-save-btn');
    if (canvasSaveBtn) {
        canvasSaveBtn.addEventListener('click', () => {
            window.appStore.setDashboardConfig(window.currentDashboardDraft);
            exitConfigMode();
        });
    }

    // Hydrate data exactly like dashboard
    const currentUser = window.appAuth.currentUser;
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const orders = isAdmin ? window.appStore.getOrders('all') : window.appStore.getOrders(currentUser ? currentUser.id : null);
    
    draft.forEach(widget => {
        window.renderWidgetData(widget, orders);
    });

    // Initialize widget resizing
    initWidgetResizing(true);
    if (window.initGridReordering) window.initGridReordering(true);

    // Attach config-only action buttons events (delete & settings)
    const settingsBtns = canvas.querySelectorAll('.settings-btn');
    const removeBtns = canvas.querySelectorAll('.remove-btn');

    settingsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.widget-card');
            window.openSettings(card.dataset.id);
        });
    });

    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.widget-card');
            const id = card.dataset.id;
            window.currentDashboardDraft = window.currentDashboardDraft.filter(w => w.id !== id);
            
            // Clean settings panel if deleting currently open settings
            if (window.currentSettingsId === id) {
                document.getElementById('widget-settings-panel').classList.add('hidden');
            }
            window.renderConfigCanvas();
        });
    });
};

window.renderDashboard = () => {
    const config = window.appStore.getDashboardConfig();
    const grid = document.getElementById('dashboard-grid');
    const emptyState = document.getElementById('dashboard-empty-state');

    if (config.length === 0) {
        grid.classList.add('hidden');
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';
    grid.classList.remove('hidden');

    grid.innerHTML = config.map(w => window.widgetTemplates.getComponentHtml(w)).join('');

    // Remove action buttons and resizers in view mode
    grid.querySelectorAll('.widget-actions').forEach(el => el.remove());
    grid.querySelectorAll('.resizer').forEach(el => el.remove());

    const currentUser = window.appAuth.currentUser;
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const orders = isAdmin ? window.appStore.getOrders('all') : window.appStore.getOrders(currentUser ? currentUser.id : null);

    config.forEach(widget => {
        window.renderWidgetData(widget, orders);
    });

    // Initialize widget resizing
    initWidgetResizing(false);
    if (window.initGridReordering) window.initGridReordering(false);
};

function initWidgetResizing(isConfigMode) {
    const resizers = document.querySelectorAll('.resizer');
    const grid = isConfigMode ? document.getElementById('config-canvas') : document.getElementById('dashboard-grid');
    
    if (!grid) return;

    resizers.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Avoid triggering drag-and-drop

            const direction = handle.dataset.direction;
            const widgetId = handle.dataset.id;
            const card = handle.closest('.widget-card');
            
            card.classList.add('resizing');

            const startX = e.clientX;
            const startY = e.clientY;
            
            const startW = parseInt(window.getComputedStyle(card).gridColumn.match(/span (\d+)/)[1]);
            const startH = parseInt(window.getComputedStyle(card).gridRow.match(/span (\d+)/)[1]);
            
            // Grid cell size calculation
            const rect = grid.getBoundingClientRect();
            const cellW = (rect.width - (11 * 24)) / 12; // Adjusted for gap if it's 1.5rem (24px)
            const cellH = 100; // Matches grid-auto-rows
            const gap = 24; // 1.5rem

            const onMouseMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaY = moveEvent.clientY - startY;

                let newW = startW;
                let newH = startH;

                // Horizontal Resize
                if (direction.includes('e')) {
                    newW = Math.max(1, Math.min(12, Math.round(startW + deltaX / (cellW + gap))));
                } else if (direction.includes('w')) {
                    // This would ideally shift the grid column start, but for simplicity 
                    // and stability in this grid system, we focus on E and S expansion first.
                    // To implement true NW resizing, we'd need to update the absolute grid positioning.
                    newW = Math.max(1, Math.min(12, Math.round(startW - deltaX / (cellW + gap))));
                }

                // Vertical Resize
                if (direction.includes('s')) {
                    newH = Math.max(1, Math.round(startH + deltaY / (cellH + gap)));
                } else if (direction.includes('n')) {
                    newH = Math.max(1, Math.round(startH - deltaY / (cellH + gap)));
                }

                card.style.gridColumn = `span ${newW}`;
                card.style.gridRow = `span ${newH}`;

                const widget = isConfigMode 
                    ? window.currentDashboardDraft.find(w => w.id === widgetId)
                    : window.appStore.getDashboardConfig().find(w => w.id === widgetId);
                
                if (widget) {
                    widget.w = newW;
                    widget.h = newH;
                }
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                card.classList.remove('resizing');
                
                if (!isConfigMode) {
                    window.appStore.setDashboardConfig([...window.appStore.getDashboardConfig()]);
                }
                
                // Re-render to refresh charts (they need to adjust to new canvas size)
                if (isConfigMode) {
                    window.renderConfigCanvas();
                } else {
                    window.renderDashboard();
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}
