window.chartInstances = {};

// Set modern defaults for all charts
if (window.Chart) {
    Chart.defaults.color = '#94a3b8'; // text-muted
    Chart.defaults.borderColor = 'hsla(0, 0%, 100%, 0.08)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.elements.line.tension = 0.4;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
}

const brandColors = {
    primary: '#6366f1',
    secondary: '#a855f7',
    success: '#10b981',
    info: '#06b6d4',
    warning: '#f59e0b',
    danger: '#ef4444'
};

window.renderWidgetData = (widget, data) => {
    try {
        if (widget.type === 'kpi') {
            renderKpi(widget, data);
        } else if (['bar', 'line', 'pie', 'area', 'scatter'].includes(widget.type)) {
            renderChart(widget, data);
        } else if (widget.type === 'table') {
            renderTableWidget(widget, data);
        }
    } catch (e) {
        console.error('Error rendering widget:', widget, e);
    }
};

function renderKpi(widget, data) {
    const el = document.getElementById(`kpi-val-${widget.id}`);
    if (!el) return;

    const { metric, aggregation, format, precision } = widget.settings;
    if (!metric) return;

    let numbers = data.map(d => Number(d[metric]) || 0);
    if (numbers.length === 0) numbers = [0];

    let val = 0;
    if (aggregation === 'Sum') {
        val = numbers.reduce((a, b) => a + b, 0);
    } else if (aggregation === 'Average') {
        val = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    } else if (aggregation === 'Count') {
        val = data.length;
    }

    if (format === 'Currency') {
        el.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: precision, minimumFractionDigits: precision }).format(val);
    } else {
        el.textContent = Number(val).toFixed(precision);
    }
}

function processChartData(data, xAxis, yAxis) {
    // Grouping data by xAxis
    const grouped = {};
    data.forEach(d => {
        const xVal = d[xAxis] || 'Unknown';
        if (!grouped[xVal]) grouped[xVal] = 0;
        grouped[xVal] += Number(d[yAxis]) || 0; // Summarize
    });

    return {
        labels: Object.keys(grouped),
        values: Object.values(grouped)
    };
}

function renderChart(widget, data) {
    const canvas = document.getElementById(`chart-${widget.id}`);
    if (!canvas) return;

    // Destroy existing instance
    if (window.chartInstances[widget.id]) {
        window.chartInstances[widget.id].destroy();
    }

    let chartType = widget.type;
    if (chartType === 'area') chartType = 'line'; // ChartJS uses line with fill for area
    if (chartType === 'scatter') {
        // Simple mock mapping for scatter (requires x, y objects instead)
    }

    const s = widget.settings;
    let computedData;
    
    if (widget.type === 'pie') {
        // Count distribution or sum
        computedData = processChartData(data, s.chartData || 'product', 'totalAmount');
    } else {
        computedData = processChartData(data, s.xAxis || 'product', s.yAxis || 'totalAmount');
    }

    const bgColors = widget.type === 'pie' 
        ? [brandColors.primary, brandColors.success, brandColors.warning, brandColors.danger, brandColors.secondary, brandColors.info]
        : s.color || brandColors.primary;

    const dataset = {
        label: s.yAxis || s.chartData || 'Data',
        data: computedData.values,
        backgroundColor: widget.type === 'area' ? 'rgba(99, 102, 241, 0.2)' : bgColors,
        borderColor: widget.type === 'line' || widget.type === 'area' ? brandColors.primary : undefined,
        fill: widget.type === 'area',
        tension: 0.4,
        pointBackgroundColor: brandColors.primary,
        pointBorderColor: '#fff',
        pointHoverRadius: 6
    };

    window.chartInstances[widget.id] = new Chart(canvas, {
        type: chartType,
        data: {
            labels: computedData.labels,
            datasets: [dataset]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: widget.type === 'pie' ? !!s.showLegend : false,
                    position: 'bottom',
                    labels: { 
                        color: '#94a3b8',
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: widget.type !== 'pie' ? {
                x: { 
                    ticks: { color: '#94a3b8', font: { size: 11 } }, 
                    grid: { display: false } 
                },
                y: { 
                    ticks: { color: '#94a3b8', font: { size: 11 } }, 
                    grid: { color: 'hsla(0, 0%, 100%, 0.05)' } 
                }
            } : {}
        }
    });
}

function renderTableWidget(widget, data) {
    const head = document.getElementById(`table-head-${widget.id}`);
    const body = document.getElementById(`table-body-${widget.id}`);
    const table = document.getElementById(`table-${widget.id}`);
    if (!head || !body) return;

    const s = widget.settings;
    const cols = s.columns && s.columns.length ? s.columns : ['customerName', 'totalAmount'];

    // Header styling mapping
    const titleMap = {
        customerName: 'Customer',
        product: 'Product',
        totalAmount: 'Amount',
        status: 'Status',
        quantity: 'Qty',
        orderDate: 'Date'
    };

    const fontSizeStyle = s.fontSize ? `style="font-size: ${s.fontSize}px"` : '';
    
    head.innerHTML = cols.map(c => `<th style="background-color: ${s.headerBg || '#54bd95'}; color: #fff; font-size: ${s.fontSize || 14}px">${titleMap[c] || c}</th>`).join('');
    
    // Sort
    let sortedData = [...data];
    if (s.sortBy === 'Descending') {
        sortedData = sortedData.reverse(); // Simplified
    }

    // Paginate
    const limit = s.pagination || 5;
    const paginated = sortedData.slice(0, limit);

    body.innerHTML = paginated.map(row => {
        return `<tr>` + cols.map(c => {
            let val = row[c];
            if (c === 'totalAmount') val = window.formatCurrency(val);
            if (c === 'orderDate') val = window.formatDate(val);
            return `<td style="font-size: ${s.fontSize || 14}px">${val || '-'}</td>`;
        }).join('') + `</tr>`;
    }).join('');
}
