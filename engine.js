/* ==========================================================================
 * OutcomeLogic™ Universal Clinical Engine v4.6
 * Integrated Build: Qualtrics API, Dashboard UI, & Digital Consent Suite
 * Status: Multi-Screen & Resolution Optimized
 * ========================================================================== */

let currentChart = null;
let signatureDrawing = false;
let sigCtx = null;

// --- GLOBAL SESSION STATE ---
// Bridge for passing calculator data to the future Consent UI
window.PatientSession = {
    procedureID: "",
    calculatorResult: "",
    rawModelData: null, // Critical: Bridges specific metrics to Consent Table
    lastUpdate: null
};

const GLOBAL_DISCLAIMER = `
    <div class="pdf-disclaimer">
        <strong>Medical Evidence Note:</strong> This document is for educational and administrative synthesis purposes only. 
        It visualises published research data by applying clinical modifiers to baseline cohorts. 
        It does not constitute a personalised clinical prediction, diagnostic tool, or substitute for formal medical advice. <br>
        &copy; 2026 Rahman Medical Services Limited. All Rights Reserved.
    </div>
`;

// --- TRIGGER PDF EXPORT ---
// Delegates to the isolated export-handler.js with fallback
async function triggerExport(filename, btnElement) {
    if (typeof window.executePDFExport === 'function') {
        try {
            await window.executePDFExport(filename, btnElement);
        } catch (err) {
            console.error("PDF Export Bridge Error:", err);
            alert("The PDF generator hit a snag. Please try again.");
        }
    } else {
        console.warn("External export-handler not found. Defaulting to Native Print.");
        window.print();
    }
}

// --- QUALTRICS API BRIDGE ---
// Synchronizes URL parameters from patient surveys to UI inputs
function loadDataFromQualtrics() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelTarget = urlParams.get('model');
    
    if (modelTarget && TRIAL_DATA[modelTarget]) {
        loadWidget(modelTarget, null);
        
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
        runCalculation(modelTarget);
    }
}

function exportToQualtrics(summaryText) {
    if (!summaryText) return;
    // Transmits synthesis back to parent Qualtrics window for record keeping
    window.parent.postMessage({ 
        type: 'OUTCOME_LOGIC_RESULT', 
        summaryText: summaryText 
    }, '*');
}

// --- EXECUTIVE DASHBOARD (Welcome Screen) ---
// Restores the high-fidelity branding from v4.3
function renderWelcomeScreen() {
    const mount = document.getElementById('content-mount');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    mount.innerHTML = `
        <div style="padding: 40px 20px; max-width: 900px; margin: 0 auto; animation: fadeIn 0.5s ease-in;">
            <div style="border-bottom: 3px solid var(--brand-navy); padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: var(--brand-navy); font-size: 2.4rem; margin-bottom: 10px; font-weight: 800; letter-spacing: -0.5px;">OutcomeLogic™</h1>
                <h2 style="color: #64748b; font-size: 1.4rem; font-weight: 400; margin-top: 0;">Evidence-Driven Clinical Decision Intelligence</h2>
                <p style="font-size: 1.15rem; color: #334155; line-height: 1.6; max-width: 700px; margin-top: 15px;">Transform patient questionnaire data into actionable triage profiles and optimized surgical pathways.</p>
            </div>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin-bottom: 40px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 25px;">
                    <h3 style="margin: 0; color: var(--brand-navy); font-size: 1.3rem;">Projected Pathway Impact</h3>
                    <span style="background: #fef08a; color: #854d0e; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;">Simulation Active</span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #10b981;">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1;">90<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Triage Efficiency</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6;">
                        <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; line-height: 1;">32<span style="font-size: 1.2rem;">%</span></div>
                        <div style="font-size: 0.95rem; font-weight: 700; color: #334155;">Deflection Potential</div>
                    </div>
                </div>
            </div>
            
            <button class="nav-btn active" style="width:100%; height:50px; background:var(--brand-cyan); font-size:1.1rem;" onclick="renderConsentForm()">
                Initialize Digital Consent Module
            </button>
        </div>
    `;
}

// --- CORE UI LOGIC ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    sidebar.classList.toggle('open');
    if (overlay) overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}

function initializeSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = ''; 

    // 1. Unified Consent Access
    const consentBtn = document.createElement('button');
    consentBtn.className = 'nav-btn active';
    consentBtn.style.margin = '10px 20px 20px 20px';
    consentBtn.style.background = 'var(--brand-cyan)';
    consentBtn.innerText = 'Digital Consent Form';
    consentBtn.onclick = renderConsentForm;
    nav.appendChild(consentBtn);

    // 2. Dynamic Categories with Accordion Logic
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
            if (TRIAL_DATA[key].category === cat) {
                const btn = document.createElement('button');
                btn.className = 'nav-btn';
                btn.innerText = TRIAL_DATA[key].shortName;
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

    // Handle Mobile Auto-Close
    if (window.innerWidth <= 900) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) toggleSidebar();
    }

    mount.innerHTML = `
        <div class="widget-container" id="printable-area">
            <div class="header-flex">
                <h2 style="margin:0; color:var(--brand-navy);">${trial.title}</h2>
                <span class="source-tag">${trial.source}</span>
            </div>
            <p class="subtitle">${trial.subtitle}</p>
            
            <div class="grid">
                <div id="controls-panel" class="ee-sidebar no-print">
                    ${trial.controlsHTML}
                    ${trial.type !== 'passport' ? `<button class="nav-btn active" style="margin-top:20px; width:100%; text-align:center; background:var(--brand-navy);" onclick="triggerExport('${trial.shortName}', this)">Download Evidence PDF</button>` : ''}
                </div>
                <div id="display-area">
                    ${trial.type === 'passport' ? trial.narrativeTemplate : '<div class="chart-box" id="chart-mount"><canvas id="mainChart"></canvas></div>'}
                    <div id="initial-message" style="text-align:center; padding:50px; color:#94a3b8; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
                        Assessment Pending - Reviewing Trial Data...
                    </div>
                    <div id="dynamic-output-box" style="display:none; margin-top: 25px; padding: 15px; border-radius: 6px; background: #f4f9fc;"></div>
                </div>
            </div>
            <div class="governance-box">${trial.footer_note}</div>
            ${GLOBAL_DISCLAIMER}
        </div>
    `;
    
    if (trial.type !== "passport") runCalculation(type);
}

function runCalculation(type) {
    const trial = TRIAL_DATA[type];
    const results = trial.calculate();
    
    if (results) {
        // Sync Global Session
        window.PatientSession.procedureID = trial.shortName;
        window.PatientSession.calculatorResult = results.synthesisText || "";
        window.PatientSession.lastUpdate = new Date().toLocaleString();

        const outputBox = document.getElementById('dynamic-output-box');
        if (outputBox && results.outputHTML) {
            outputBox.innerHTML = results.outputHTML;
            outputBox.style.display = 'block';
        }

        const initialMsg = document.getElementById('initial-message');
        if (initialMsg) initialMsg.style.display = 'none';

        if (results.primaryData) {
            renderChart('mainChart', results, trial.color, trial.xAxisLabels);
        }

        if (results.synthesisText) exportToQualtrics(results.synthesisText);
    }
}

// --- DIGITAL CONSENT MODULE ---
/**
 * UNIVERSAL DIGITAL CONSENT RENDERER
 * Dynamically switches layouts based on the clinical session data
 */
function renderConsentForm() {
    const mount = document.getElementById('content-mount');
    const session = window.PatientSession;
    const data = session.rawModelData;

    // 1. DYNAMIC METRIC DETECTOR
    let metricHTML = "";
    if (data && data.mets) {
        // Layout: Multi-Metric Risk Table (Readiness Assessment)
        metricHTML = `
            <table style="width:100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem; border: 1px solid #e2e8f0;">
                <tr style="background: var(--brand-navy); color: white;">
                    <th style="padding: 12px; text-align: left;">Clinical Metric</th>
                    <th style="padding: 12px; text-align: left;">Reference Baseline</th>
                    <th style="padding: 12px; text-align: left;">Your Assessment</th>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px; font-weight:600;">Functional Capacity (METs)</td>
                    <td style="padding: 12px;">> 4.0 (Standard)</td>
                    <td style="padding: 12px; font-weight:800; color:${data.mets < 4 ? '#ef4444' : '#10b981'}">${data.mets}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight:600;">Airway Score (STOP-BANG)</td>
                    <td style="padding: 12px;">< 3 (Low Risk)</td>
                    <td style="padding: 12px; font-weight:800; color:${data.sb >= 5 ? '#ef4444' : '#10b981'}">${data.sb}/8</td>
                </tr>
            </table>`;
    } else if (data && data.mainMetric) {
        // Layout: Single Probability Widget (RELAPSTONE, INCA, etc.)
        metricHTML = `
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0; text-align: center;">
                <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--text-muted);">${data.label}</div>
                <div style="font-size: 2.8rem; font-weight: 800; color: var(--brand-navy); margin: 5px 0;">${data.mainMetric}</div>
                <div style="font-size: 0.85rem; color: #64748b;">Statistically synthesized evidence for the proposed pathway.</div>
            </div>`;
    } else {
        // Error State: No session data detected
        metricHTML = `<div style="padding:30px; color:#ef4444; font-weight:bold; text-align:center; border:2px dashed #fecdd3; border-radius:12px; margin:20px 0;">No Clinical Assessment Data Found. <br>Please run a calculator before generating consent.</div>`;
    }

    // 2. PAINT THE LEGAL ACKNOWLEDGEMENT FRAMEWORK
    mount.innerHTML = `
        <div class="widget-container" id="printable-area">
            <div class="header-flex">
                <h2 style="color:var(--brand-navy); margin:0;">Digital Consent & Risk Acknowledgement</h2>
                <span class="source-tag">v2.1 Regulatory Build</span>
            </div>
            <p class="subtitle">Evidence-Driven Agreement for ${session.procedureID || 'Selected Clinical Pathway'}</p>

            ${metricHTML}

            <div style="background:#f1f5f9; padding:25px; border-radius:12px; border-left:6px solid var(--brand-navy); margin-bottom:30px;">
                <h3 style="margin:0 0 10px 0; font-size:1rem; color:var(--brand-navy);">Clinician's Evidence Synthesis:</h3>
                <p style="margin:0; line-height:1.6; font-size:1.05rem;">${session.calculatorResult || '---'}</p>
            </div>

            <div style="border: 2px solid var(--brand-navy); padding:25px; border-radius:12px; background:white;">
                <label class="nav-label" style="display:block; margin-bottom:10px;">Patient Acknowledgement Signature</label>
                <div id="sig-wrapper" style="background:#fff; border:1px dashed #cbd5e1; height:160px; position:relative; border-radius:8px; cursor:crosshair;">
                    <canvas id="sig-canvas" style="width:100%; height:100%; touch-action:none;"></canvas>
                    <button class="no-print" onclick="clearSignature()" style="position:absolute; bottom:10px; right:10px; padding:6px 12px; font-size:0.75rem; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; cursor:pointer; font-weight:700;">Clear Signature</button>
                </div>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-top:12px;">By signing, I confirm I have reviewed the specific metrics identified above and have discussed the risks and benefits of the proposed pathway with my surgical team.</p>
            </div>

            <div class="no-print" style="margin-top:40px; display:flex; gap:15px;">
                <button class="nav-btn active" style="flex:2; height:55px; background:var(--brand-navy); font-size:1rem;" onclick="window.print()">Confirm & Print Consent PDF</button>
                <button class="nav-btn" style="flex:1; height:55px;" onclick="renderWelcomeScreen()">Cancel</button>
            </div>
            
            <div class="governance-box">Clinical Timestamp: ${session.lastUpdate || 'Session Initialised'}</div>
            ${GLOBAL_DISCLAIMER}
        </div>
    `;
    
    // 4. RE-INITIALISE INTERACTION
    initSignaturePad();
}

// --- SIGNATURE PAD LOGIC ---
function initSignaturePad() {
    const canvas = document.getElementById('sig-canvas');
    if (!canvas) return;
    sigCtx = canvas.getContext('2d');
    
    // Decouple canvas size from monitor resolution
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvas.addEventListener('mousedown', () => signatureDrawing = true);
    canvas.addEventListener('mouseup', () => { signatureDrawing = false; sigCtx.beginPath(); });
    canvas.addEventListener('mousemove', (e) => {
        if (!signatureDrawing) return;
        const rect = canvas.getBoundingClientRect();
        sigCtx.lineWidth = 2.5; 
        sigCtx.lineCap = 'round'; 
        sigCtx.strokeStyle = '#0f172a';
        sigCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        sigCtx.stroke();
    });
}

function clearSignature() {
    const canvas = document.getElementById('sig-canvas');
    if (sigCtx && canvas) sigCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- CHARTING CORE ---
function renderChart(id, results, color, xLabels) {
    if (currentChart) currentChart.destroy();
    const canvas = document.getElementById(id);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isBar = results.chartType === 'bar';
    const safeLabels = xLabels || results.primaryData.map((_, i) => i === 0 ? 'Baseline' : '+' + i);
    
    currentChart = new Chart(ctx, {
        type: isBar ? 'bar' : 'line',
        data: {
            labels: results.customXLabels || safeLabels,
            datasets: [
                { 
                    label: results.primaryLabel || 'Patient Profile', 
                    data: results.primaryData, 
                    borderColor: color, 
                    backgroundColor: isBar ? color : color + '20', 
                    fill: !isBar, tension: 0.3 
                },
                { 
                    label: results.secondaryLabel || 'Standard Cohort', 
                    data: results.secondaryData, 
                    borderColor: '#94a3b8', 
                    borderDash: [5, 5], fill: false 
                }
            ]
        },
        options: { 
            animation: false, 
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: results.yMax || 100 } }
        }
    });
}

// --- APP INITIALISATION ---
window.onload = function() {
    initializeSidebar();
    loadDataFromQualtrics();
    if (!new URLSearchParams(window.location.search).get('model')) renderWelcomeScreen();
};
