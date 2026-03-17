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
        if (type) {
            addNewWidget(type);
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
