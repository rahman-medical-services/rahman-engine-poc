/* ==========================================================================
 * OutcomeLogic™ Universal Clinical Engine v4.2 (V2.0 Commercial Build)
 * (c) 2026 OutcomeLogic Ltd / Rahman Medical Services Limited. 
 * All Rights Reserved. PROPRIETARY CLINICAL TRIAGE MODELS.
 * Updates: Executive Dashboard, Qualtrics API Bridge, Mobile Responsiveness
 * ========================================================================== */

let currentChart = null;

const GLOBAL_DISCLAIMER = `
    <div class="pdf-disclaimer">
        <strong>Medical Evidence Note:</strong> This document is for educational and administrative synthesis purposes only. It visualises published research data by applying clinical modifiers to baseline cohorts. It does not constitute a personalised clinical prediction, diagnostic tool, or substitute for formal medical advice. <br>
        &copy; 2026 Rahman Medical Services Limited. All Rights Reserved.
    </div>
`;

// --- QUALTRICS API BRIDGE (V2.0 LOGIC) ---

function loadDataFromQualtrics() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelTarget = urlParams.get('model');

    if (modelTarget && TRIAL_DATA[modelTarget]) {
        console.log(`OutcomeLogic: Loading ${modelTarget} model via Qualtrics API...`);

        // Mount the widget into the DOM first
        loadWidget(modelTarget, null);

        // Auto-fill the inputs based on URL parameters
        urlParams.forEach((value, key) => {
            if (key !== 'model') {
                const inputElement = document.getElementById(key);
                if (inputElement) {
                    if (inputElement.type === 'checkbox') {
                        inputElement.checked = (value === 'true' || value === 'on');
                    } else {
                        inputElement.value = value;
                    }
                }
            }
        });

        // Run the math immediately with the pre-filled data
        runCalculation(modelTarget);
    }
}

function exportToQualtrics(summaryText) {
    if (!summaryText) return;
    console.log("OutcomeLogic: Exporting clinical synthesis to Qualtrics...");
    window.parent.postMessage({ 
        type: 'OUTCOME_LOGIC_RESULT', 
        summaryText: summaryText 
    }, '*');
}


// --- EXECUTIVE DASHBOARD / HOME SCREEN ---

function renderWelcomeScreen() {
    const mount = document.getElementById('content-mount');
    
    // Clear any active nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    mount.innerHTML = `
        <div style="padding: 40px 20px; max-width: 900px; margin: 0 auto; animation: fadeIn 0.5s ease-in;">
            <div style="border-bottom: 3px solid var(--brand-navy); padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: var(--brand-navy); font-size: 2.4rem; margin-bottom: 10px; font-weight: 800; letter-spacing: -0.5px;">
                    OutcomeLogic™
                </h1>
                <h2 style="color: #64748b; font-size: 1.4rem; font-weight: 400; margin-top: 0;">
                    Evidence-Driven Clinical Decision Intelligence
                </h2>
                <p style="font-size: 1.15rem; color: #334155; line-height: 1.6; max-width: 700px; margin-top: 15px;">
                    Transform patient questionnaire data into actionable triage outcomes, shared decision reports, and optimized surgical pathways.
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px;">
                <div style="background: #f0f9ff; padding: 25px; border-radius: 10px; border-left: 5px solid #0ea5e9;">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 1.1rem;">Operational Efficiency</h3>
                    <ul style="color: #475569; padding-left: 20px; margin-bottom: 0; line-height: 1.6;">
                        <li><strong>Automated Triage:</strong> Convert pre-assessment responses into structured discharge profiles.</li>
                        <li><strong>Reduce F2F:</strong> Safely outline watchful waiting trajectories using validated trial math.</li>
                        <li><strong>Consultant ROI:</strong> Reduce manual data review time from 8 minutes to 30 seconds per file.</li>
                    </ul>
                </div>

                <div style="background: #fef2f2; padding: 25px; border-radius: 10px; border-left: 5px solid #ef4444;">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 1.1rem;">Clinical Governance</h3>
                    <ul style="color: #475569; padding-left: 20px; margin-bottom: 0; line-height: 1.6;">
                        <li><strong>Montgomery Compliant:</strong> Generate dynamic, personalized shared decision narratives.</li>
                        <li><strong>Audit-Ready:</strong> Exportable, printed clinical summaries mapped directly to peer-reviewed evidence.</li>
                        <li><strong>Zero IT Friction:</strong> Drops instantly into existing Qualtrics forms via secure iframe.</li>
                    </ul>
                </div>
            </div>

            <h3 style="color: var(--brand-navy); font-size: 1.3rem; margin-bottom: 20px;">Select a Pathway to View Demo</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <button class="nav-btn" style="padding: 15px; text-align: left; background: white; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" onclick="loadWidget('inca', event)">
                    <strong>Waitlist Triage</strong><br><span style="font-size: 0.85rem; color: #64748b;">Watchful Waiting Deflection (INCA)</span>
                </button>
                <button class="nav-btn" style="padding: 15px; text-align: left; background: white; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" onclick="loadWidget('readiness', event)">
                    <strong>Perioperative Planning</strong><br><span style="font-size: 0.85rem; color: #64748b;">Readiness & STOP-BANG</span>
                </button>
                <button class="nav-btn" style="padding: 15px; text-align: left; background: white; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" onclick="loadWidget('bariatrics', event)">
                    <strong>Shared Decision Making</strong><br><span style="font-size: 0.85rem; color: #64748b;">Metabolic Surgery Outcomes</span>
                </button>
            </div>
        </div>
    `;
}


// --- ORIGINAL CORE ENGINE ---

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

        // V2.0 LOGIC: Export synthesis to Qualtrics if available
        if (results.synthesisText) {
            exportToQualtrics(results.synthesisText);
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

// Ensure proper loading order and URL parameter checking
window.onload = function() {
    initializeSidebar();
    
    // Check if Qualtrics is asking for a specific model via URL
    const urlParams = new URLSearchParams(window.location.search);
    const modelTarget = urlParams.get('model');

    if (modelTarget && TRIAL_DATA[modelTarget]) {
        loadDataFromQualtrics(); // Loads the specific widget silently for the iframe
    } else {
        renderWelcomeScreen(); // Loads the beautiful Executive Dashboard for direct visitors
    }
};
