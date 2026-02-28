/**
 * OutcomeLogic™ Universal Clinical Engine v4.2
 * Updates: Mobile Responsiveness, Sidebar Overlay, Auto-Collapse
 */

let currentChart = null;

const GLOBAL_DISCLAIMER = `
    <div class="pdf-disclaimer">
        <strong>Medical Evidence Note:</strong> This document is for educational purposes only. It visualises published research data by applying clinical modifiers to baseline cohorts. It does not constitute a personalised clinical prediction, diagnostic tool, or substitute for formal medical advice. <br>
        &copy; 2026 Rahman Medical Services Limited. All Rights Reserved.
    </div>
`;

// Mobile Menu Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}

function initializeSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = ''; 

    const categories = [...new Set(Object.values(TRIAL_DATA).map(t => t.category))];
    
    categories.forEach((cat, index) => {
        const details = document.createElement('details');
        details.className = 'nav-category';
        if (index === 0) details.open = true; 

        const summary = document.createElement('summary');
        summary.className = 'nav-label';
        summary.innerText = cat;
        details.appendChild(summary);

        const content = document.createElement('div');
        content.className = 'category-content';

        Object.keys(TRIAL_DATA).forEach(key => {
            const trial = TRIAL_DATA[key];
            if (trial.category === cat) {
                const btn = document.createElement('button');
                btn.className = 'nav-btn';
                btn.innerText = trial.shortName;
                btn.onclick = (e) => loadWidget(key, e);
                content.appendChild(btn);
            }
        });

        details.appendChild(content);
        nav.appendChild(details);
    });
}

function loadWidget(type, event) {
    const trial = TRIAL_DATA[type];
    const mount = document.getElementById('content-mount');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');

    // Auto-close sidebar on mobile after selection
    if (window.innerWidth <= 900) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('open')) toggleSidebar();
    }

    if (trial.type === "passport") {
        mount.innerHTML = `
            <div class="widget-container" id="printable-area">
                <div class="header-flex"><h2 style="margin:0; color:var(--brand-navy);">${trial.title}</h2><span class="source-tag">${trial.source}</span></div>
                <p class="subtitle">${trial.subtitle}</p>
                <div class="grid">
                    <div id="controls-panel" class="ee-sidebar">${trial.controlsHTML}</div>
                    <div id="passport-display-area">
                        ${trial.narrativeTemplate}
                        <div id="initial-message" style="text-align:center; padding:50px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
                            <h3 style="margin-top:0;">Assessment Pending</h3>
                            <p style="font-size:0.9rem;">Complete the clinical profile to generate the patient narrative.</p>
                        </div>
                    </div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
                ${GLOBAL_DISCLAIMER}
            </div>
        `;
    } else {
        mount.innerHTML = `
            <div class="widget-container" id="printable-area">
                <div class="header-flex"><h2 style="margin:0; color:var(--brand-navy);">${trial.title}</h2><span class="source-tag">${trial.source}</span></div>
                <p class="subtitle">${trial.subtitle}</p>
                <div class="grid">
                    <div id="controls-panel" class="ee-sidebar">
                        ${trial.controlsHTML}
                        <button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="exportToPDF('${trial.shortName}')">Download Evidence PDF</button>
                    </div>
                    <div>
                        <div class="chart-box" id="chart-mount"><canvas id="mainChart"></canvas></div>
                        <div id="dynamic-output-box" style="display:none; margin-top: 25px; padding: 15px; border-radius: 6px; font-size: 14px; color: #444; line-height: 1.5; background: #f4f9fc;"></div>
                    </div>
                </div>
                <div class="governance-box">${trial.footer_note}</div>
                ${GLOBAL_DISCLAIMER}
            </div>
        `;
        runCalculation(type);
    }
}

function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    if (!trial || typeof trial.calculate !== 'function') return;

    const results = trial.calculate();

    if (results) {
        const outputBox = document.getElementById('dynamic-output-box');
        if (results.outputHTML) {
            outputBox.innerHTML = results.outputHTML;
            outputBox.style.borderLeft = `5px solid ${results.outputColor || 'var(--brand-cyan)'}`;
            outputBox.style.display = 'block';
        } else if (outputBox) {
            outputBox.style.display = 'none';
        }

        if (results.primaryData) {
            renderChart('mainChart', results, trial.color, trial.xAxisLabels);
        }
    }
}

function renderChart(id, results, color, xLabels) {
    if (currentChart) currentChart.destroy();
    const ctx = document.getElementById(id).getContext('2d');
    
    const isBar = results.chartType === 'bar';
    const safeLabels = xLabels || results.primaryData.map((_, i) => i === 0 ? 'Baseline' : `+${i}`);

    currentChart = new Chart(ctx, {
        type: isBar ? 'bar' : 'line',
        data: {
            labels: results.customXLabels || safeLabels,
            datasets: [
                { 
                    label: results.primaryLabel || 'Selected Patient Scenario', 
                    data: results.primaryData, 
                    borderColor: color, 
                    backgroundColor: isBar ? color : `${color}20`, 
                    borderWidth: isBar ? 1 : 4, 
                    fill: !isBar, 
                    tension: 0.3, 
                    pointBackgroundColor: color, 
                    pointRadius: isBar ? 0 : 4 
                },
                { 
                    label: results.secondaryLabel || 'Trial Average / Comparator', 
                    data: results.secondaryData, 
                    borderColor: results.secondaryColor || '#cbd5e1', 
                    backgroundColor: isBar ? (results.secondaryColor || '#cbd5e1') : 'transparent', 
                    borderDash: isBar ? [] : [5, 5], 
                    pointRadius: 0, fill: false, tension: 0.3, 
                    borderWidth: isBar ? 1 : 2 
                }
            ]
        },
        options: { 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'top', labels: { font: { weight: 'bold', family: 'Inter', color: '#334155' }, boxWidth: 15 } } },
            scales: { 
                y: { 
                    min: results.yMin !== undefined ? results.yMin : 0, 
                    max: results.yMax !== undefined ? results.yMax : 100, 
                    title: { display: true, text: results.labelY, font: { weight: 'bold', color: '#475569' } } 
                },
                x: { grid: { display: false } }
            }
        }
    });
}

async function exportToPDF(filename) {
    const element = document.getElementById('printable-area');
    const btn = event.target;
    const originalText = btn.innerText;
    
    btn.innerText = "Generating PDF...";
    btn.disabled = true;
    element.style.backgroundColor = "white";

    const opt = {
        margin: [15, 12, 15, 12],
        filename: `${filename}-Evidence-Summary.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: 1000 }, /* Force desktop layout for PDF even on mobile */
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try { await html2pdf().set(opt).from(element).save(); } 
    catch (err) { alert("Failed to generate PDF."); } 
    finally { btn.innerText = originalText; btn.disabled = false; element.style.backgroundColor = ""; }
}

window.onload = initializeSidebar;
