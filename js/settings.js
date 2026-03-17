document.addEventListener('DOMContentLoaded', () => {
    initDashboardModeToggle();
    initSettingsPanel();
});

// Settings config fields mapping by widget type
const settingsForms = {
    kpi: `
        <div class="form-group">
            <label>Widget Title</label>
            <input type="text" id="set-title" class="input-field">
        </div>
        <div class="form-group mt-2">
            <label>Description</label>
            <textarea id="set-desc" class="input-field" rows="2"></textarea>
        </div>
        <div class="form-grid mt-2">
            <div class="form-group">
                <label>Width (cols)</label>
                <input type="number" id="set-w" class="input-field" min="1" max="12">
            </div>
            <div class="form-group">
                <label>Height (rows)</label>
                <input type="number" id="set-h" class="input-field" min="1">
            </div>
        </div>
        <hr style="border:1px solid var(--border-color); margin: 1rem 0;">
        <h4 style="margin-bottom: 0.5rem; color: var(--text-main);">Data Setting</h4>
        <div class="form-group">
            <label>Select Metric</label>
            <select id="set-metric" class="premium-select">
                <option value="totalAmount">Total Amount</option>
                <option value="quantity">Quantity</option>
                <option value="unitPrice">Unit Price</option>
            </select>
        </div>
        <div class="form-group mt-2">
            <label>Aggregation</label>
            <select id="set-agg" class="premium-select">
                <option value="Sum">Sum</option>
                <option value="Average">Average</option>
                <option value="Count">Count</option>
            </select>
        </div>
        <div class="form-group mt-2">
            <label>Data Format</label>
            <select id="set-format" class="premium-select">
                <option value="Number">Number</option>
                <option value="Currency">Currency</option>
            </select>
        </div>
        <div class="form-group mt-2">
            <label>Decimal Precision</label>
            <input type="number" id="set-precision" class="input-field" min="0">
        </div>
    `,
    chart: `
        <div class="form-group">
            <label>Widget Title</label>
            <input type="text" id="set-title" class="input-field">
        </div>
        <div class="form-group mt-2">
            <label>Description</label>
            <textarea id="set-desc" class="input-field" rows="2"></textarea>
        </div>
        <div class="form-grid mt-2">
            <div class="form-group">
                <label>Width (cols)</label>
                <input type="number" id="set-w" class="input-field" min="1" max="12">
            </div>
            <div class="form-group">
                <label>Height (rows)</label>
                <input type="number" id="set-h" class="input-field" min="1">
            </div>
        </div>
        <hr style="border:1px solid var(--border-color); margin: 1rem 0;">
        <h4 style="margin-bottom: 0.5rem; color: var(--text-main);">Data Setting</h4>
        <div class="form-group">
            <label>X-Axis</label>
            <select id="set-xaxis" class="premium-select">
                <option value="product">Product</option>
                <option value="status">Status</option>
                <option value="createdBy">Created By</option>
            </select>
        </div>
        <div class="form-group mt-2">
            <label>Y-Axis</label>
            <select id="set-yaxis" class="premium-select">
                <option value="totalAmount">Total Amount</option>
                <option value="quantity">Quantity</option>
            </select>
        </div>
        <hr style="border:1px solid var(--border-color); margin: 1rem 0;">
        <h4 style="margin-bottom: 0.5rem; color: var(--text-main);">Styling</h4>
        <div class="form-group">
            <label>Chart Color</label>
            <input type="color" id="set-color" style="width:100%; height:40px; border:none; border-radius:4px;">
        </div>
        <div class="form-group mt-2" style="flex-direction: row; align-items:center; gap:0.5rem;">
            <input type="checkbox" id="set-showlabel">
            <label for="set-showlabel">Show Data Label</label>
        </div>
    `,
    pie: `
        <div class="form-group">
            <label>Widget Title</label>
            <input type="text" id="set-title" class="input-field">
        </div>
        <div class="form-group mt-2">
            <label>Description</label>
            <textarea id="set-desc" class="input-field" rows="2"></textarea>
        </div>
        <div class="form-grid mt-2">
            <div class="form-group">
                <label>Width (cols)</label>
                <input type="number" id="set-w" class="input-field" min="1" max="12">
            </div>
            <div class="form-group">
                <label>Height (rows)</label>
                <input type="number" id="set-h" class="input-field" min="1">
            </div>
        </div>
        <hr style="border:1px solid var(--border-color); margin: 1rem 0;">
        <h4 style="margin-bottom: 0.5rem; color: var(--text-main);">Data Setting</h4>
        <div class="form-group">
            <label>Chart Data</label>
            <select id="set-chartdata" class="premium-select">
                <option value="product">Product</option>
                <option value="status">Status</option>
                <option value="createdBy">Created By</option>
            </select>
        </div>
        <div class="form-group mt-2" style="flex-direction: row; align-items:center; gap:0.5rem;">
            <input type="checkbox" id="set-showlegend">
            <label for="set-showlegend">Show Legend</label>
        </div>
    `,
    table: `
        <div class="form-group">
            <label>Widget Title</label>
            <input type="text" id="set-title" class="input-field">
        </div>
        <div class="form-group mt-2">
            <label>Description</label>
            <textarea id="set-desc" class="input-field" rows="2"></textarea>
        </div>
        <div class="form-grid mt-2">
            <div class="form-group">
                <label>Width (cols)</label>
                <input type="number" id="set-w" class="input-field" min="1" max="12">
            </div>
            <div class="form-group">
                <label>Height (rows)</label>
                <input type="number" id="set-h" class="input-field" min="1">
            </div>
        </div>
        <hr style="border:1px solid var(--border-color); margin: 1rem 0;">
        <h4 style="margin-bottom: 0.5rem; color: var(--text-main);">Data Setting</h4>
        <div class="form-group">
            <label>Pagination</label>
            <select id="set-pagination" class="premium-select">
                <option value="5">5 Rows</option>
                <option value="10">10 Rows</option>
                <option value="15">15 Rows</option>
            </select>
        </div>
    `
};

let currentSettingsId = null;

function initSettingsPanel() {
    const p = document.getElementById('widget-settings-panel');
    const closeBtn = document.getElementById('close-settings');
    const container = document.getElementById('settings-form-container');

    closeBtn.addEventListener('click', () => {
        p.classList.add('hidden');
        currentSettingsId = null;
    });
}

window.openSettings = (id) => {
    const widget = window.currentDashboardDraft.find(w => w.id === id);
    if (!widget) return;

    currentSettingsId = id;
    const p = document.getElementById('widget-settings-panel');
    const container = document.getElementById('settings-form-container');

    // Load template
    if (widget.type === 'kpi') container.innerHTML = settingsForms.kpi;
    else if (widget.type === 'pie') container.innerHTML = settingsForms.pie;
    else if (widget.type === 'table') container.innerHTML = settingsForms.table;
    else container.innerHTML = settingsForms.chart;

    // Populate common
    document.getElementById('set-title').value = widget.title || '';
    document.getElementById('set-desc').value = widget.description || '';
    document.getElementById('set-w').value = widget.w;
    document.getElementById('set-h').value = widget.h;
    
    if (widget.type === 'table') {
        document.getElementById('set-fontSize').value = widget.settings.fontSize || 14;
    } else {
        document.getElementById('set-zoom').value = widget.settings.zoom || 1;
    }

    // Populate specific
    if (widget.type === 'kpi') {
        document.getElementById('set-metric').value = widget.settings.metric;
        document.getElementById('set-agg').value = widget.settings.aggregation;
        document.getElementById('set-format').value = widget.settings.format;
        document.getElementById('set-precision').value = widget.settings.precision;
    } else if (['bar', 'line', 'area', 'scatter'].includes(widget.type)) {
        document.getElementById('set-xaxis').value = widget.settings.xAxis;
        document.getElementById('set-yaxis').value = widget.settings.yAxis;
        document.getElementById('set-color').value = widget.settings.color || '#6366f1';
        document.getElementById('set-showlabel').checked = widget.settings.showLabel;
    } else if (widget.type === 'pie') {
        document.getElementById('set-chartdata').value = widget.settings.chartData;
        document.getElementById('set-showlegend').checked = widget.settings.showLegend;
    } else if (widget.type === 'table') {
        document.getElementById('set-pagination').value = widget.settings.pagination || '5';
    }

    // Attach real-time binding
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => saveSettingsToDraft(e.target.id));
    });

    p.classList.remove('hidden');
};

function saveSettingsToDraft(inputId) {
    if (!currentSettingsId) return;
    const widget = window.currentDashboardDraft.find(w => w.id === currentSettingsId);
    if (!widget) return;

    // Common properties
    if (inputId === 'set-title') widget.title = document.getElementById(inputId).value;
    if (inputId === 'set-desc') widget.description = document.getElementById(inputId).value;
    if (inputId === 'set-w') widget.w = Math.max(1, Number(document.getElementById(inputId).value));
    if (inputId === 'set-h') widget.h = Math.max(1, Number(document.getElementById(inputId).value));
    if (inputId === 'set-zoom') widget.settings.zoom = Number(document.getElementById(inputId).value);
    if (inputId === 'set-fontSize') widget.settings.fontSize = Number(document.getElementById(inputId).value);
    
    // Specific
    if (widget.type === 'kpi') {
        if (inputId === 'set-metric') widget.settings.metric = document.getElementById(inputId).value;
        if (inputId === 'set-agg') widget.settings.aggregation = document.getElementById(inputId).value;
        if (inputId === 'set-format') widget.settings.format = document.getElementById(inputId).value;
        if (inputId === 'set-precision') widget.settings.precision = Math.max(0, Number(document.getElementById(inputId).value));
    } else if (['bar', 'line', 'area', 'scatter'].includes(widget.type)) {
        if (inputId === 'set-xaxis') widget.settings.xAxis = document.getElementById(inputId).value;
        if (inputId === 'set-yaxis') widget.settings.yAxis = document.getElementById(inputId).value;
        if (inputId === 'set-color') widget.settings.color = document.getElementById(inputId).value;
        if (inputId === 'set-showlabel') widget.settings.showLabel = document.getElementById(inputId).checked;
    } else if (widget.type === 'pie') {
        if (inputId === 'set-chartdata') widget.settings.chartData = document.getElementById(inputId).value;
        if (inputId === 'set-showlegend') widget.settings.showLegend = document.getElementById(inputId).checked;
    } else if (widget.type === 'table') {
        if (inputId === 'set-pagination') widget.settings.pagination = Number(document.getElementById(inputId).value);
    }

    // Re-render immediately on config canvas
    window.renderConfigCanvas();
}
