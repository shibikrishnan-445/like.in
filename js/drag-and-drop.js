document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
});

function initDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable-widget');
    const canvas = document.getElementById('config-canvas');
    let draggedType = null;

    draggables.forEach(draggable => {
        // Drag events
        draggable.addEventListener('dragstart', (e) => {
            draggedType = e.target.dataset.type;
            e.dataTransfer.setData('text/plain', draggedType);
            e.currentTarget.style.opacity = '0.5';
        });

        draggable.addEventListener('dragend', (e) => {
            e.currentTarget.style.opacity = '1';
        });

        // Click event for easier interaction and accessibility
        draggable.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            if (type) {
                addNewWidget(type);
            }
        });
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        canvas.classList.add('drag-over');

        // Create or get placeholder
        let placeholder = document.getElementById('drag-placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.id = 'drag-placeholder';
            placeholder.className = 'drag-placeholder';
            canvas.appendChild(placeholder);
        }

        // Set placeholder size based on dragged type
        if (draggedType) {
            const w = window.widgetTemplates.getDefaultWidth(draggedType);
            const h = window.widgetTemplates.getDefaultHeight(draggedType);
            placeholder.style.gridColumn = `span ${w}`;
            placeholder.style.gridRow = `span ${h}`;
        }
    });

    canvas.addEventListener('dragleave', (e) => {
        // Only remove if we're actually leaving the canvas, not just a child element
        if (e.relatedTarget && !canvas.contains(e.relatedTarget)) {
            canvas.classList.remove('drag-over');
            const placeholder = document.getElementById('drag-placeholder');
            if (placeholder) placeholder.remove();
        }
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        canvas.classList.remove('drag-over');
        const placeholder = document.getElementById('drag-placeholder');
        if (placeholder) placeholder.remove();
        
        const type = e.dataTransfer.getData('text/plain');
        const allowedTypes = ['bar', 'line', 'pie', 'area', 'scatter', 'table', 'kpi'];
        
        if (type && allowedTypes.includes(type)) {
            addNewWidget(type);
        } else if (e.dataTransfer.getData('reorder-id')) {
            // It's a reorder drop that landed on the empty canvas space (not on another card)
            const sourceId = e.dataTransfer.getData('reorder-id');
            const isConfigMode = document.getElementById('view-config').classList.contains('active');
            let arr = isConfigMode ? window.currentDashboardDraft : window.appStore.getDashboardConfig();
            
            const idx1 = arr.findIndex(w => w.id === sourceId);
            if (idx1 !== -1) {
                // Move to end
                const [removed] = arr.splice(idx1, 1);
                arr.push(removed);
                
                if (!isConfigMode) {
                    window.appStore.setDashboardConfig([...arr]);
                } else {
                    window.renderConfigCanvas();
                }
            }
        }
    });
}

function addNewWidget(type) {
    // Generate new widget data
    const newWidget = {
        id: 'widget-' + Date.now(),
        type: type,
        title: 'Untitled ' + type.charAt(0).toUpperCase() + type.slice(1),
        description: '',
        w: window.widgetTemplates.getDefaultWidth(type),
        h: window.widgetTemplates.getDefaultHeight(type),
        settings: {} // specific settings based on type
    };

    // Default specific settings
    if (type === 'kpi') {
        newWidget.settings = { metric: 'totalAmount', aggregation: 'Sum', format: 'Number', precision: 0, zoom: 1 };
    } else if (['bar', 'line', 'area', 'scatter'].includes(type)) {
        newWidget.settings = { xAxis: 'product', yAxis: 'totalAmount', color: '#6366f1', showLabel: true, zoom: 1 };
    } else if (type === 'pie') {
        newWidget.settings = { chartData: 'product', showLegend: true, zoom: 1 };
    } else if (type === 'table') {
        newWidget.settings = { columns: ['customerName', 'product', 'totalAmount', 'status'], sortBy: 'Order date', pagination: 5, fontSize: 14, headerBg: '#54bd95' };
    }

    // Add to current configuration model
    if (!window.currentDashboardDraft) {
        window.currentDashboardDraft = [...window.appStore.getDashboardConfig()];
    }
    
    window.currentDashboardDraft.push(newWidget);
    
    // Re-render config canvas
    window.renderConfigCanvas();
}

window.initGridReordering = (isConfigMode) => {
    const gridPrefix = isConfigMode ? 'config-canvas' : 'dashboard-grid';
    const grid = document.getElementById(gridPrefix);
    if (!grid) return;

    if (grid.sortableTracker) {
        grid.sortableTracker.destroy();
    }

    if (typeof Sortable !== 'undefined') {
        grid.sortableTracker = new Sortable(grid, {
            animation: 250,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
            handle: '.widget-header',
            ghostClass: 'sortable-ghost',
            draggable: '.widget-card',
            onEnd: function (evt) {
                let arr = isConfigMode ? window.currentDashboardDraft : window.appStore.getDashboardConfig();
                
                // Ignore if it wasn't actually moved
                if (evt.oldIndex === evt.newIndex) return;
                
                // Create a clone of the array to apply changes
                const newArr = [...arr];
                
                // Account for potential placeholder indices in config canvas that Sortable might count
                // But since we restricted draggable to `.widget-card`, it usually perfectly aligns 
                // with our array bounds.
                
                if (evt.oldIndex >= 0 && evt.oldIndex < newArr.length && evt.newIndex >= 0 && evt.newIndex < newArr.length) {
                    const movedItem = newArr.splice(evt.oldIndex, 1)[0];
                    newArr.splice(evt.newIndex, 0, movedItem);
                    
                    if (!isConfigMode) {
                        // Force a state update silently then re-render
                        window.appStore.state.dashboardConfig = newArr;
                        window.appStore.saveState(); 
                    } else {
                        window.currentDashboardDraft = newArr;
                        // For config mode, we just let Sortable handle it visually or force refresh
                        // Re-rendering canvas recreates the children, which is fine
                        window.renderConfigCanvas();
                    }
                } else {
                    // Fallback refresh if indexes look weird due to placeholders
                    if (isConfigMode) {
                        window.renderConfigCanvas();
                    } else {
                        window.renderDashboard();
                    }
                }
            }
        });
    }
};
