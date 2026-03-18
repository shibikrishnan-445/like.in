window.widgetTemplates = {
    getComponentHtml(widget) {
        // Base structure wrapping the specific content
        const w = widget.w || this.getDefaultWidth(widget.type);
        const h = widget.h || this.getDefaultHeight(widget.type);
        
        return `
            <div class="widget-card" data-id="${widget.id}" style="grid-column: span ${w}; grid-row: span ${h};">
                <div class="widget-actions">
                    <button class="icon-btn settings-btn" title="Settings"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
                    <button class="icon-btn remove-btn" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
                <div class="widget-header" style="cursor: grab;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--text-muted); opacity: 0.5; display: inline-flex; align-items: center;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
                        </span>
                        <div>
                            <div class="widget-title">${widget.title || 'Untitled'}</div>
                            ${widget.description ? `<div class="widget-desc">${widget.description}</div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="widget-body">
                    ${this.getSpecificHtml(widget)}
                </div>
                
                <!-- 8-Handle Resize System -->
                <div class="resizer n" data-direction="n" data-id="${widget.id}"></div>
                <div class="resizer s" data-direction="s" data-id="${widget.id}"></div>
                <div class="resizer e" data-direction="e" data-id="${widget.id}"></div>
                <div class="resizer w" data-direction="w" data-id="${widget.id}"></div>
                <div class="resizer nw" data-direction="nw" data-id="${widget.id}"></div>
                <div class="resizer ne" data-direction="ne" data-id="${widget.id}"></div>
                <div class="resizer sw" data-direction="sw" data-id="${widget.id}"></div>
                <div class="resizer se" data-direction="se" data-id="${widget.id}"></div>
            </div>
        `;
    },

    getSpecificHtml(widget) {
        if (widget.type === 'kpi') {
            return `<div class="kpi-value" id="kpi-val-${widget.id}">-</div>`;
        } else if (['bar', 'line', 'pie', 'area', 'scatter'].includes(widget.type)) {
            return `<canvas id="chart-${widget.id}"></canvas>`;
        } else if (widget.type === 'table') {
            return `
                <div style="overflow-x: auto; width: 100%; height: 100%; max-height: 400px;">
                    <table class="premium-table" id="table-${widget.id}">
                        <thead><tr id="table-head-${widget.id}"></tr></thead>
                        <tbody id="table-body-${widget.id}"></tbody>
                    </table>
                </div>
            `;
        }
        return `<div>Unsupported Widget</div>`;
    },

    getDefaultWidth(type) {
        if (type === 'kpi') return 2;
        if (type === 'pie' || type === 'table') return 4;
        return 5; // Bar, Line, Area, Scatter
    },

    getDefaultHeight(type) {
        if (type === 'kpi') return 2;
        if (type === 'pie' || type === 'table') return 4;
        return 5; // Bar, Line, Area, Scatter
    }
};
