let currentChart = null;

function loadWidget(type) {
    const trial = TRIAL_DATA[type];
    const mount = document.getElementById('content-mount');
    
    // Update sidebar UI
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    // Build the UI String
    mount.innerHTML = `
        <div class="widget-container">
            <div class="header-flex">
                <h2>${trial.title}</h2>
                <span class="source-tag">${trial.source}</span>
            </div>
            <p class="subtitle">${trial.subtitle}</p>
            <div class="grid">
                <div class="evidence-card">
                    <div class="stat-main">${trial.metrics.m1_value}</div>
                    <div class="stat-label">${trial.metrics.m1_label}</div>
                    <div class="stat-main muted">${trial.metrics.m2_value}</div>
                    <div class="stat-label">${trial.metrics.m2_label}</div>
                    <div class="secondary-info">${trial.metrics.secondary}</div>
                </div>
                <div class="chart-box"><canvas id="mainChart"></canvas></div>
            </div>
            <div class="governance-box">${trial.footer_note}</div>
        </div>
    `;

    renderChart('mainChart', trial.subgroups.all, trial.color);
}

function renderChart(id, subgroupData, color) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    
    const datasets = [
        { label: 'Intervention', data: Object.values(subgroupData)[0], borderColor: color, borderWidth: 4, fill: false },
        { label: 'Control', data: Object.values(subgroupData)[1], borderColor: '#cbd5e1', borderDash: [5, 5], fill: false }
    ];

    currentChart = new Chart(ctx, {
        type: 'line',
        data: { labels: ['Baseline', '1yr', '2yr', '3yr'], datasets: datasets },
        options: { maintainAspectRatio: false }
    });
}
