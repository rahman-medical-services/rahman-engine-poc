// --- SECURE WEBHOOK DESTINATION ---
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyT4K9bN3nAqne_rvlZGoxlWAFDjoQx8TUFw9cCWQnSF4TtzhuGWVAOWCVw393cY9NivQ/exec";
// --- GLOBALS & SETUP ---
let currentStep = 1;
const totalSteps = 5;
let signaturePad = null;
let sigInitialized = false;
let activeChart = null;
let recoveryChart = null;
let generatedPdfBlob = null;

// Medicolegal Timer Tracker & Device Info
const appStartTime = Date.now();
const isMobile = /Mobi|Android/i.test(navigator.userAgent) ? "Mobile Device" : "Desktop Device";

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cbId = urlParams.get('patient_id') || urlParams.get('id');
    const idField = document.getElementById('patient_id');
    if (cbId && idField) idField.value = cbId;
    
    calculateReadiness(); 
};

function initSignature() {
    if (sigInitialized) return;
    const canvas = document.getElementById('signature-pad');
    if (canvas && canvas.offsetWidth > 0) {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = 150 * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad = new SignaturePad(canvas);
        sigInitialized = true;
    }
}

const clearSigBtn = document.getElementById('clear-sig');
if (clearSigBtn) {
    clearSigBtn.addEventListener('click', () => {
        if (signaturePad) signaturePad.clear();
    });
}

const whiteBackgroundPlugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
        const {ctx} = chart; ctx.save(); ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#ffffff'; ctx.fillRect(0, 0, chart.width, chart.height); ctx.restore();
    }
};
Chart.register(whiteBackgroundPlugin);

// --- EVENT LISTENERS (With Null Safety) ---

const cciToggle = document.getElementById('toggle_advanced_hx');
if (cciToggle) {
    cciToggle.addEventListener('click', function() {
        const panel = document.getElementById('advanced_hx_panel');
        if (panel) {
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                this.innerText = "- Hide Advanced Medical History";
            } else {
                panel.classList.add('hidden');
                this.innerText = "+ Show Advanced Medical History";
            }
        }
    });
}

const dobEl = document.getElementById('patient_dob');
if (dobEl) {
    dobEl.addEventListener('change', function() {
        if (!this.value) return;
        const dob = new Date(this.value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) { age--; }
        
        const ageIn = document.getElementById('age');
        const ageDisp = document.getElementById('age_display');
        if (ageIn) ageIn.value = age;
        if (ageDisp) ageDisp.textContent = age;
        
        const frailtyCon = document.getElementById('frailty_container');
        const frailtyCheck = document.getElementById('frailty_check');
        if (frailtyCon && frailtyCheck) {
            if(age >= 65) {
                frailtyCon.classList.remove('hidden');
            } else {
                frailtyCon.classList.add('hidden');
                frailtyCheck.checked = false;
            }
        }
        calculateReadiness();
    });
}

const engEl = document.getElementById('english_first');
if (engEl) {
    engEl.addEventListener('change', function() {
        const langSpec = document.getElementById('language_specify_container');
        if (langSpec) langSpec.classList.toggle('hidden', this.value === 'yes');
    });
}

const priorEl = document.getElementById('prior_consult');
if (priorEl) {
    priorEl.addEventListener('change', function() {
        const priorNest = document.getElementById('prior_consult_nested');
        if (priorNest) priorNest.classList.toggle('hidden', this.value === 'no');
    });
}

const painIn = document.getElementById('pain_score');
const painVal = document.getElementById('pain_val');
if (painIn && painVal) painIn.addEventListener('input', e => painVal.textContent = e.target.value);

const qolIn = document.getElementById('qol_score');
const qolVal = document.getElementById('qol_val');
if (qolIn && qolVal) qolIn.addEventListener('input', e => qolVal.textContent = e.target.value);

const fundEl = document.getElementById('funding');
if (fundEl) {
    fundEl.addEventListener('change', function() {
        const insNest = document.getElementById('insurance_nested');
        if (insNest) insNest.classList.toggle('hidden', this.value !== 'insurance');
    });
}

const condEl = document.getElementById('condition');
if (condEl) {
    condEl.addEventListener('change', function() {
        const val = this.value;
        const logicChole = document.getElementById('logic_chole');
        const logicUni = document.getElementById('logic_hernia_universal');
        const logicGroin = document.getElementById('logic_groin_only');
        
        if (logicChole) logicChole.classList.toggle('hidden', val !== 'lap_chole');
        const isHernia = val === 'groin_hernia' || val === 'incisional_hernia' || val === 'ventral_hernia';
        if (logicUni) logicUni.classList.toggle('hidden', !isHernia);
        if (logicGroin) logicGroin.classList.toggle('hidden', val !== 'groin_hernia');
    });
}

const prevAbdo = document.getElementById('prev_abdo_check');
if (prevAbdo) {
    prevAbdo.addEventListener('change', function() {
        const nested = document.getElementById('surgery_nested');
        if (nested) {
            if(this.checked) { nested.classList.remove('hidden'); } 
            else { 
                nested.classList.add('hidden'); 
                if (document.getElementById('prev_infection_check')) document.getElementById('prev_infection_check').checked = false;
                if (document.getElementById('prev_pelvic_check')) document.getElementById('prev_pelvic_check').checked = false;
            }
        }
    });
}

const choleHosp = document.getElementById('chole_hosp');
if (choleHosp) {
    choleHosp.addEventListener('change', function() {
        const nested = document.getElementById('hosp_nested');
        if (nested) {
            if(this.checked) { nested.classList.remove('hidden'); } 
            else { 
                nested.classList.add('hidden'); 
                if (document.getElementById('chole_ercp')) document.getElementById('chole_ercp').checked = false;
                if (document.getElementById('chole_alt')) document.getElementById('chole_alt').checked = false;
                if (document.getElementById('chole_wcc')) document.getElementById('chole_wcc').checked = false;
            }
        }
    });
}

const jobInput = document.getElementById('jobInput');
if (jobInput) jobInput.addEventListener('change', renderPlanner);
const dateInput = document.getElementById('dateInput');
if (dateInput) dateInput.addEventListener('change', renderPlanner);

document.querySelectorAll('input[name="units"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const metricIn = document.getElementById('metric_inputs');
        const impIn = document.getElementById('imperial_inputs');
        
        if (this.value === 'metric') {
            if(metricIn) metricIn.classList.remove('hidden');
            if(impIn) impIn.classList.add('hidden');
        } else {
            if(impIn) impIn.classList.remove('hidden');
            if(metricIn) metricIn.classList.add('hidden');
        }
        calculateBiometrics();
    });
});

document.querySelectorAll('input, select').forEach(i => {
    i.addEventListener('change', () => { calculateBiometrics(); calculateReadiness(); });
});

// --- MATH & LOGIC ENGINES ---
function calculateBiometrics() {
    let bmi = 0;
    const unitChecked = document.querySelector('input[name="units"]:checked');
    if (!unitChecked) return;
    
    const isMetric = unitChecked.value === 'metric';

    if (isMetric) {
        const cmEl = document.getElementById('height_cm');
        const kgEl = document.getElementById('weight_kg');
        if (cmEl && kgEl) {
            const cm = parseFloat(cmEl.value);
            const kg = parseFloat(kgEl.value);
            if (cm > 0 && kg > 0) bmi = kg / ((cm / 100) * (cm / 100));
        }
    } else {
        const ftEl = document.getElementById('height_ft');
        const inEl = document.getElementById('height_in');
        const stEl = document.getElementById('weight_st');
        const lbsEl = document.getElementById('weight_lbs');
        
        const ft = ftEl ? (parseFloat(ftEl.value) || 0) : 0;
        const inc = inEl ? (parseFloat(inEl.value) || 0) : 0;
        const st = stEl ? (parseFloat(stEl.value) || 0) : 0;
        const lbs = lbsEl ? (parseFloat(lbsEl.value) || 0) : 0;
        
        const totalInches = (ft * 12) + inc;
        const totalLbs = (st * 14) + lbs;
        if (totalInches > 0 && totalLbs > 0) bmi = (totalLbs / (totalInches * totalInches)) * 703;
    }

    const bmiRes = document.getElementById('bmi_result');
    const bmiBadge = document.getElementById('bmi_badge');
    
    if (bmi > 10 && bmiRes && bmiBadge) {
        bmiRes.textContent = bmi.toFixed(1);
        bmiBadge.style.display = 'block';
    } else if (bmiBadge) {
        bmiBadge.style.display = 'none';
    }
}

function calculateReadiness() {
    let dasi = 0;
    document.querySelectorAll('.d-val:checked').forEach(i => dasi += parseFloat(i.value));
    let mets = ((0.43 * dasi) + 9.6) / 3.5;

    let sb = 0;
    if (document.getElementById('sb_snore') && document.getElementById('sb_snore').checked) sb++;
    if (document.getElementById('sb_tired') && document.getElementById('sb_tired').checked) sb++;
    if (document.getElementById('sb_observe') && document.getElementById('sb_observe').checked) sb++;
    if (document.getElementById('pmh_htn') && document.getElementById('pmh_htn').checked) sb++;
    if (document.getElementById('sex') && document.getElementById('sex').value === 'male') sb++;
    if (document.getElementById('age') && (parseInt(document.getElementById('age').value) || 0) > 50) sb++;
    
    const bmiEl = document.getElementById('bmi_result');
    const bmi = bmiEl ? (parseFloat(bmiEl.textContent) || 0) : 0;
    if (bmi > 35) sb++;

    const badge = document.getElementById('readiness_badge');
    const res = document.getElementById('readiness_result');
    if (badge && res) {
        badge.className = 'badge ' + (sb >= 5 || mets < 4 ? 'badge-red' : (sb >= 3 ? 'badge-amber' : 'badge-green'));
        
        if (sb >= 5 || mets < 4) res.textContent = `Profile suggests discussing airway risk with anaesthetist (STOP-BANG: ${sb}, METs: ${mets.toFixed(1)}).`;
        else if (sb >= 3) res.textContent = `Moderate Risk Profile (STOP-BANG: ${sb}, METs: ${mets.toFixed(1)}). Monitor Airway.`;
        else res.textContent = `Routine Day-Case Profile (STOP-BANG: ${sb}, METs: ${mets.toFixed(1)})`;
    }

    let pHTML = "";
    if (document.getElementById('smoking') && document.getElementById('smoking').checked) pHTML += "• <strong>Smoking Cessation:</strong> 4-week optimisation recommended.<br>";
    if (document.getElementById('pmh_thin') && document.getElementById('pmh_thin').checked) pHTML += "• <strong>Anticoagulant Protocol:</strong> Specialist bridging plan required.<br>";
    if (bmi >= 35) pHTML += "• <strong>BMI Optimisation:</strong> Pre-hab weight strategy recommended to reduce technical complexity.<br>";
    
    const englishEl = document.getElementById('english_first');
    if (englishEl && englishEl.value === 'no') pHTML += "• <strong>Language:</strong> Interpreter may be required — confirm at booking.<br>";
    
    const alcoholEl = document.getElementById('alcohol_intake');
    if (alcoholEl && alcoholEl.value === 'daily') pHTML += "• <strong>Alcohol Optimisation:</strong> Daily intake identified. Review perioperative weaning to reduce bleeding risk.<br>";
    
    const diabStatus = document.getElementById('pmh_diab_status');
    if (diabStatus) {
        if (diabStatus.value === 'controlled') pHTML += "• <strong>Diabetes:</strong> Standard perioperative glycemic control protocol applies.<br>";
        else if (diabStatus.value === 'uncontrolled') pHTML += "• <strong>Diabetes Review:</strong> Pre-operative HbA1c review requested.<br>";
        else if (diabStatus.value === 'unknown') pHTML += "• <strong>Diabetes Review:</strong> Pre-operative HbA1c testing required.<br>";
    }

    const frailtyEl = document.getElementById('frailty_check');
    if (frailtyEl && frailtyEl.checked) pHTML += "• <strong>Frailty Screen:</strong> Self-reported functional decline in last 6 months. Consider geriatric pre-assessment.<br>";
    
    const famEl = document.getElementById('fam_anaesthetic');
    if (famEl && famEl.checked) pHTML += "• <strong style='color:#b91c1c;'>CRITICAL:</strong> Family history of anaesthetic complications. Urgent review required.<br>";

    const outPillars = document.getElementById('out-pillars');
    if (outPillars) outPillars.innerHTML = pHTML === "" ? "No specific pillars identified." : pHTML;
}

// --- DYNAMIC EXPECTED PATHWAY ---
function renderPathway() {
    const fundEl = document.getElementById('funding');
    const funding = fundEl ? fundEl.value : 'self_pay';
    
    const condEl = document.getElementById('condition');
    const cond = condEl ? condEl.value : 'other';
    
    const panel = document.getElementById('dynamic_pathway_panel');
    if(!panel) return;

    let html = `<h3 style="margin-top:0; color: var(--brand-navy);">Your Expected Pathway</h3>`;
    html += `<p style="font-size: 13.5px; color: #444; margin-bottom: 15px; line-height: 1.5;">To help you prepare, I have outlined the typical pathway for my patients, from our first consultation through to your full recovery.</p>`;

    html += `<strong style="color: var(--brand-navy);">1. The Consultation & Funding</strong><br>`;
    if(funding === 'self_pay') {
        html += `<p style="font-size: 13px; margin-top: 5px; color: #555; line-height: 1.4;">Following our initial consultation (which is invoiced separately), if we decide surgery is the right path for you, my team will provide a transparent, all-inclusive package price for your procedure and any required scans.</p>`;
    } else {
        html += `<p style="font-size: 13px; margin-top: 5px; color: #555; line-height: 1.4;">Please ensure you have your pre-authorization code for our initial consultation. If we decide further scans or surgery are needed, my team will provide you with the exact clinical codes (OPCS codes) so you can seamlessly request further authorization from your insurer.</p>`;
    }

    html += `<strong style="margin-top: 15px; display: block; color: var(--brand-navy);">2. Diagnostics & Imaging</strong>`;
    let diagText = "";
    if (cond === 'groin_hernia') diagText = "Typically, a thorough clinical examination during our appointment is all I need to confirm a groin hernia, meaning no further scans are required.";
    else if (cond === 'lap_chole') diagText = "If you haven't had one recently, we will usually arrange an Ultrasound. Depending on your symptoms, I may sometimes also request a specialized MRI (MRCP) to check your bile ducts.";
    else if (cond === 'incisional_hernia') diagText = "Because incisional hernias involve previous surgical scar tissue, I will usually arrange a CT scan of your abdomen to accurately map the hernia before we plan the repair.";
    else if (cond === 'ventral_hernia') diagText = "I can often diagnose this during our physical examination, but if the hernia is particularly large, I may arrange a CT scan to plan the safest possible repair.";
    else diagText = "Depending on your specific symptoms and examination, we may need to arrange imaging such as an Ultrasound or CT scan.";
    html += `<p style="font-size: 13px; margin-top: 5px; color: #555; line-height: 1.4;">${diagText} All imaging decisions will be made together after your physical assessment. If scans are required, we may schedule a brief follow-up appointment to review the results.</p>`;

    html += `<strong style="margin-top: 15px; display: block; color: var(--brand-navy);">3. Preparing for Surgery</strong>`;
    html += `<p style="font-size: 13px; margin-top: 5px; color: #555; line-height: 1.4;">Once we agree to proceed with surgery, we typically aim to schedule your operation within 2 to 4 weeks. Before your date, you will have a formal pre-assessment with the hospital team to ensure you are fully optimized for the anaesthetic. While waiting for your surgical date, I strongly encourage you to focus on any of the 'Optimisation Pillars' we identified earlier in your profile.</p>`;

    html += `<strong style="margin-top: 15px; display: block; color: var(--brand-navy);">4. Admission & Discharge</strong>`;
    html += `<p style="font-size: 13px; margin-top: 5px; color: #555; line-height: 1.4;">On the day of surgery, you will be admitted and complete your final paperwork. You will see both myself and your anaesthetist on the ward before we go to theatre. When you are ready to go home, my team will provide you with clear discharge instructions, a tailored pain relief pack, and a dedicated contact number should you have any concerns.</p>`;
    html += `<ul style="font-size: 13px; color: #555; margin-top: 5px; line-height: 1.5; padding-left: 20px;">`;
    html += `<li><strong>The 24-Hour Rule:</strong> For day-case surgery under general anaesthetic, hospital policy requires that an adult drives you home and stays with you for the first 24 hours.</li>`;
    html += `<li><strong>Fit Notes:</strong> If you require a 'Fit Note' for your employer, I will provide this for you upon discharge.</li>`;
    html += `</ul>`;
    html += `<p style="font-size: 13px; margin-top: 5px; color: #555; line-height: 1.4;">I will then see you for a routine follow-up in clinic around 6 weeks later to check on your recovery.</p>`;

    panel.innerHTML = html;
}

// --- CLINICAL EVIDENCE CHARTS ---
const chartOpts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 800 },
    plugins: { legend: { position: 'top', labels: { color: '#333', font:{weight:'bold'} } }, customCanvasBackgroundColor: { color: 'white' } },
    scales: { y: { ticks: { color: '#333' } }, x: { ticks: { color: '#333' } } }
};

function renderEvidence() {
    const condEl = document.getElementById('condition');
    if (!condEl) return;
    const val = condEl.value;
    
    // Hide everything first to reset the view
    if (document.getElementById('sdm_lap_chole')) document.getElementById('sdm_lap_chole').classList.add('hidden');
    if (document.getElementById('sdm_groin_hernia')) document.getElementById('sdm_groin_hernia').classList.add('hidden');
    if (document.getElementById('sdm_incisional')) document.getElementById('sdm_incisional').classList.add('hidden');
    if (document.getElementById('sdm_ventral')) document.getElementById('sdm_ventral').classList.add('hidden');
    
    if (activeChart) {
        activeChart.destroy();
        activeChart = null;
    }

    if (val === 'lap_chole') {
        document.getElementById('sdm_lap_chole').classList.remove('hidden');
        const time = [0,1,2,3,4,5,6,7,8,9,10,11,12];
        const baseSurv = [1.0,0.93,0.86,0.79,0.76,0.73,0.71,0.69,0.67,0.65,0.64,0.635,0.63];
        let hr = 1.0;
        
        const ageEl = document.getElementById('age');
        if (ageEl && (parseInt(ageEl.value)||0) > 54) hr *= 0.57;
        
        if (document.getElementById('chole_mult') && document.getElementById('chole_mult').checked) hr *= 1.19;
        
        const choleHosp = document.getElementById('chole_hosp');
        const choleErcp = document.getElementById('chole_ercp');
        if (choleHosp && choleErcp && choleHosp.checked && choleErcp.checked) hr *= 0.58;
        
        if (document.getElementById('chole_alt') && document.getElementById('chole_alt').checked) hr *= 1.22;
        if (document.getElementById('chole_wcc') && document.getElementById('chole_wcc').checked) hr *= 0.79;
        
        let adjRisk = baseSurv.map(s => (1 - Math.pow(s, hr)) * 100);
        if (document.getElementById('chole-percentage')) document.getElementById('chole-percentage').innerText = adjRisk[12].toFixed(1) + "%";

        activeChart = new Chart(document.getElementById('choleChart'), {
            type: 'line', data: { labels: time, datasets: [
                { label: 'Study Average Risk', data: baseSurv.map(s=>(1-s)*100), borderColor: '#bbbbbb', borderDash: [5,5], tension: 0.3, fill: false },
                { label: 'Your Risk Profile', data: adjRisk, borderColor: '#6facd5', backgroundColor: 'rgba(111,172,213,0.1)', borderWidth: 4, tension: 0.3, fill: true }
            ]}, options: { ...chartOpts, scales: { y: { title: {display:true, text:'Hospital Admission Risk (%)'}, min:0, max:100}, x: {title: {display:true, text:'Months'}} } }
        });
    } 
    else if (val === 'groin_hernia') {
        document.getElementById('sdm_groin_hernia').classList.remove('hidden');
        
        const gType = document.getElementById('groin_type')?.value || 'inguinal';
        const pSex = document.getElementById('sex')?.value || 'male';

        const incaContainer = document.getElementById('inca_chart_container');
        const femoralWarning = document.getElementById('femoral_warning_container');
        const femaleDisclaimer = document.getElementById('inca_female_disclaimer');

        // 1. Handle Femoral vs Inguinal UI
        if (gType === 'femoral') {
            if (incaContainer) incaContainer.classList.add('hidden');
            if (femoralWarning) femoralWarning.classList.remove('hidden');
        } else {
            if (incaContainer) incaContainer.classList.remove('hidden');
            if (femoralWarning) femoralWarning.classList.add('hidden');
            
            // 2. Handle Female Disclaimer
            if (pSex === 'female' && femaleDisclaimer) {
                femaleDisclaimer.classList.remove('hidden');
            } else if (femaleDisclaimer) {
                femaleDisclaimer.classList.add('hidden');
            }

            // 3. Render INCA Chart (Only if not femoral)
            const time = [0,1,2,3,4,5,6,7,8,9,10,11,12];
            const baseCross = [0,0.12,0.22,0.31,0.39,0.46,0.51,0.55,0.58,0.61,0.63,0.64,0.642];
            let hr = 1.0;
            
            const sympEl = document.getElementById('groin_symptoms');
            const symp = sympEl ? sympEl.value : 'none';
            if (symp === 'mild' || symp === 'severe') hr *= 1.45;
            
            const ageEl = document.getElementById('age');
            if (ageEl && (parseInt(ageEl.value)||0) >= 65) hr *= 1.25;
            
            if (document.getElementById('groin_heavy') && document.getElementById('groin_heavy').checked) hr *= 1.30;
            
            let adjCross = baseCross.map(v => (1 - Math.pow(1-v, hr)) * 100);
            if(document.getElementById('groin-percentage')) document.getElementById('groin-percentage').innerText = adjCross[12].toFixed(1) + "%";

            activeChart = new Chart(document.getElementById('groinChart'), {
                type: 'line', data: { labels: time, datasets: [
                    { label: 'Study Average', data: baseCross.map(v=>v*100), borderColor: '#bbbbbb', borderDash: [5,5], tension: 0.3, fill: false },
                    { label: 'Your Profile', data: adjCross, borderColor: '#142b45', backgroundColor: 'rgba(20,43,69,0.1)', borderWidth: 4, tension: 0.3, fill: true }
                ]}, options: { ...chartOpts, scales: { y: { title: {display:true, text:'Surgery Prob (%)'}, min:0, max:100}, x: {title: {display:true, text:'Years'}} } }
            });
        }

        // 4. EHS Surgical Technique Matcher
        let tTitle = "Laparoscopic TEP/TAPP Repair";
        let tDesc = "A minimally invasive approach may be an excellent fit, typically offering fast recovery.";
        if (document.getElementById('groin_local') && document.getElementById('groin_local').checked) { tTitle = "Open Mesh Repair (Local)"; tDesc = "A safe pathway avoiding a general anaesthetic."; }
        else if (document.getElementById('groin_recurrent_lap') && document.getElementById('groin_recurrent_lap').checked) { tTitle = "Open Revision Repair"; tDesc = "A change of surgical plane is typically recommended here."; }
        else if (document.getElementById('prev_pelvic_check') && document.getElementById('prev_pelvic_check').checked) { tTitle = "Open Mesh Repair"; tDesc = "A safe option avoiding pelvic scar tissue from prior surgery."; }
        else if (document.getElementById('groin_recurrent_open') && document.getElementById('groin_recurrent_open').checked) { tTitle = "Laparoscopic Revision"; tDesc = "A change of plane avoids old anterior scar tissue."; }
        else if (document.getElementById('groin_bilateral') && document.getElementById('groin_bilateral').checked) { tTitle = "Laparoscopic TEP/TAPP"; tDesc = "Allows repair of both sides through the same tiny incisions."; }
        else if (gType === 'femoral') { tTitle = "Laparoscopic TEP/TAPP or Open Preperitoneal Repair"; tDesc = "Femoral hernias require a specific approach to close the femoral ring. Keyhole surgery is highly effective for this."; }
        
        if (document.getElementById('groin-tech-title')) document.getElementById('groin-tech-title').innerText = tTitle;
        if (document.getElementById('groin-tech-desc')) document.getElementById('groin-tech-desc').innerText = tDesc;
    }
    else if (val === 'incisional_hernia') {
        document.getElementById('sdm_incisional').classList.remove('hidden');
        let risk = 6; 
        
        const bmiEl = document.getElementById('bmi_result');
        const bmi = bmiEl ? parseFloat(bmiEl.textContent) || 25 : 25;
        
        if (bmi >= 30 && bmi < 35) risk += 4;
        if (bmi >= 35 && bmi < 40) risk += 8;
        if (bmi >= 40) risk += 14;
        
        if (document.getElementById('smoking') && document.getElementById('smoking').checked) risk += 8;
        
        const diabStatus = document.getElementById('pmh_diab_status');
        if (diabStatus && (diabStatus.value === 'controlled' || diabStatus.value === 'uncontrolled')) risk += 5;
        
        if (document.getElementById('prev_infection_check') && document.getElementById('prev_infection_check').checked) risk += 10;
        
        if (document.getElementById('cedar-percentage')) document.getElementById('cedar-percentage').innerText = risk + "%";

        activeChart = new Chart(document.getElementById('cedarChart'), {
            type: 'bar', data: { labels: ['Optimized Target', 'Your Current Risk Profile'], datasets: [{ label: 'Wound Complication Risk (%)', data: [6, risk], backgroundColor: ['#10b981', '#ef4444'], borderRadius: 4 }] },
            options: { ...chartOpts, scales: { y: { beginAtZero: true, max: Math.max(30, risk + 5) } } }
        });
    }
    else if (val === 'ventral_hernia') {
        document.getElementById('sdm_ventral').classList.remove('hidden');
        activeChart = new Chart(document.getElementById('ventralChart'), {
            type: 'bar', data: { labels: ['Planned Day-Case', 'Delayed / Emergency'], datasets: [{ label: 'Recovery Time (Weeks)', data: [1.5, 6], backgroundColor: ['#6facd5', '#142b45'], borderRadius: 4 }] },
            options: { ...chartOpts, indexAxis: 'y' }
        });
    }
}

// --- PLANNER (STEP 4) & RISKS ---
function renderPlanner() {
    const condEl = document.getElementById('condition');
    if (!condEl) return;
    const val = condEl.value;
    
    const jobEl = document.getElementById('jobInput');
    const job = jobEl ? jobEl.value : 'light';
    
    const dateEl = document.getElementById('dateInput');
    const dateStr = dateEl ? dateEl.value : null;
    
    if (recoveryChart) recoveryChart.destroy();
    let timeLabels = ['Day 1', 'Day 3', 'Week 1', 'Week 2', 'Week 4', 'Week 6'];
    let painData, funcData;
    if (val === 'incisional_hernia' || val === 'ventral_hernia') {
        painData = [85, 70, 50, 30, 15, 5]; funcData = [15, 25, 45, 65, 85, 100];
    } else {
        painData = [75, 45, 20, 10, 5, 0]; funcData = [25, 50, 75, 95, 100, 100];
    }
    const ctxRec = document.getElementById('recoveryChart').getContext('2d');
    recoveryChart = new Chart(ctxRec, {
        type: 'line', plugins: [whiteBackgroundPlugin],
        data: { labels: timeLabels, datasets: [
                { label: 'Pain / Discomfort', data: painData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 3, tension: 0.4, fill: true },
                { label: 'Mobility / Function', data: funcData, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 3, tension: 0.4, fill: true }
        ]}, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 800 }, plugins: { legend: { position: 'top', labels: { color: '#333', font:{weight:'bold'} } } }, scales: { y: { min: 0, max: 100, title: { display: true, text: '% (Estimated)' }, ticks: { color: '#333' } }, x: { ticks: { color: '#333' } } } }
    });

    let workDays, heavyDays, driveDays;
    if (val === 'incisional_hernia' || val === 'ventral_hernia') {
        workDays = job === "heavy" ? 42 : (job === "light" ? 21 : 14); 
        heavyDays = 56; driveDays = 14;
    } else { 
        workDays = job === "heavy" ? 28 : (job === "light" ? 14 : 7); 
        heavyDays = 28; driveDays = 7;
    }

    let riskHTML = "";
    if (val === 'lap_chole') { 
        riskHTML = `
            <div style="margin-bottom: 8px;">
                <strong style="color: #b45309; display:block;">Common (5-10%) - Expected Post-Op Symptoms:</strong>
                <span>Because bile now flows directly into your gut, you may experience looser stools. Minor port-site bruising or temporary shoulder pain (from the gas used during keyhole surgery) is also very common.</span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #c2410c; display:block;">Uncommon (1-2%) - Retained Stones & Hernias:</strong>
                <span>A small stone may slip into the main bile duct requiring a brief camera procedure (ERCP) down the throat later. Rarely, a small hernia can develop at one of the camera port sites.</span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #b91c1c; display:block;">Rare (&lt;0.5%) - Severe Injury & Bleeding:</strong>
                <span>Damage to the main bile duct, severe internal bleeding, or accidental injury to surrounding organs (like the bowel) are rare but major complications that require open surgery to fix.</span>
            </div>
        `;
    }
    else if (val === 'incisional_hernia') { 
        riskHTML = `
            <div style="margin-bottom: 8px;">
                <strong style="color: #b45309; display:block;">Common (10-20%) - Wound Complications:</strong>
                <span>Operating through old scar tissue increases the chance of fluid collections (seromas) or superficial wound infections that usually resolve with simple care and antibiotics.</span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #c2410c; display:block;">Uncommon (2-5%) - Recurrence & Mesh Infection:</strong>
                <span>There is a long-term risk the hernia returns. In ~2% of cases, the reinforcing mesh itself can develop a deep infection requiring prolonged treatment or surgical removal.</span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #b91c1c; display:block;">Rare (&lt;1%) - Bowel Injury & DVT:</strong>
                <span>Previous surgeries cause dense internal scarring (adhesions). This introduces a rare but severe risk of accidental injury to the bowel during repair, or deep vein thrombosis (blood clots).</span>
            </div>
        `;
    }
    else { 
        riskHTML = `
            <div style="margin-bottom: 8px;">
                <strong style="color: #b45309; display:block;">Common (5-10%) - Bruising, Swelling & Numbness:</strong>
                <span>Extensive bruising and localized swelling (often dropping down into the scrotum in men) is normal. Temporary numbness around the incision site is also highly expected.</span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #c2410c; display:block;">Uncommon (1-3%) - Chronic Pain & Recurrence:</strong>
                <span>A small percentage of patients experience post-herniorrhaphy neuralgia (a long-lasting ache in the groin). There is also a 1-2% chance the hernia eventually returns.</span>
            </div>
            <div style="margin-bottom: 8px;">
                <strong style="color: #b91c1c; display:block;">Rare (&lt;1%) - Deep Injury:</strong>
                <span>Damage to major blood vessels, the bladder, the bowel, or the vas deferens (the tube carrying sperm) is an extremely rare but severe complication.</span>
            </div>
        `;
    }
    const riskPanel = document.getElementById("dynamic_risks_panel");
    if (riskPanel) riskPanel.innerHTML = riskHTML;

    const formatDate = (d, add) => { 
        let res = new Date(d); 
        res.setDate(res.getDate() + add); 
        return res.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); 
    };

    const outTime = document.getElementById("out-timeline");
    if (outTime) {
        if (dateStr) {
            outTime.innerHTML = `
                <strong>🚿 Showering:</strong> ${formatDate(dateStr, 1)} (Pat dry)<br>
                <strong>🚙 Driving:</strong> ${formatDate(dateStr, driveDays)} (When emergency stop is safe)<br>
                <strong>💼 Return to Work:</strong> ${formatDate(dateStr, workDays)}<br>
                <strong>🏋️ Heavy Lifting:</strong> ${formatDate(dateStr, heavyDays)}
            `;
        } else {
            outTime.innerHTML = `
                <strong>🚿 Showering:</strong> After 24-48 hours<br>
                <strong>🚙 Driving:</strong> ${driveDays} - ${driveDays+3} days<br>
                <strong>💼 Return to Work:</strong> ${workDays/7} to ${(workDays/7)+1} weeks<br>
                <strong>🏋️ Heavy Lifting:</strong> ${heavyDays/7} weeks
            `;
        }
    }
}

// --- NAVIGATION & EXPORT ---
function updateUI() {
    document.querySelectorAll('.app-step').forEach(el => el.classList.remove('active'));
    
    const targetStep = document.getElementById(`step-${currentStep}`);
    if(targetStep) targetStep.classList.add('active');
    
    const pb = document.getElementById('progressBar');
    if(pb) pb.style.width = `${(currentStep / totalSteps) * 100}%`;

    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');
    if (btnBack) btnBack.classList.toggle('hidden', currentStep === 1);

    if(!btnNext) return;

    if (currentStep === 1) btnNext.textContent = 'Analyze Readiness';
    else if (currentStep === 2) { btnNext.textContent = 'View Evidence'; calculateReadiness(); }
    else if (currentStep === 3) { btnNext.textContent = 'Build Plan'; renderEvidence(); }
    else if (currentStep === 4) { btnNext.textContent = 'Review & Sign'; renderPlanner(); }
    else if (currentStep === 5) {
        btnNext.innerHTML = 'Submit Profile';
        const panel = document.getElementById('next_steps_panel');
        if(panel) panel.classList.add('hidden'); 
        
        renderPathway();

        const condEl = document.getElementById('condition');
        const val = condEl ? condEl.value : null;
        
        const pilMap = {
            lap_chole: [
                { url: 'https://www.rahmanmedical.co.uk/gallstones-laparoscopic-cholecystectomy', title: 'Gallbladder Information (Rahman Medical)' },
                { url: 'https://www.rcseng.ac.uk/-/media/files/rcs/library-and-publications/non-journal-publications/gall-bladder-removal.pdf', title: 'RCS England - Recovery Leaflet' },
                { url: 'https://www.england.nhs.uk/wp-content/uploads/2023/11/PRN00250-dst-making-a-decision-about-gallstones.pdf', title: 'NHS - Decision Support Tool' }
            ],
            groin_hernia: [
                { url: 'https://www.rahmanmedical.co.uk/inguinal-femoral-hernias', title: 'Groin Hernia Information (Rahman Medical)' },
                { url: 'https://www.rcseng.ac.uk/-/media/files/rcs/library-and-publications/non-journal-publications/groin-hernia-repair.pdf', title: 'RCS England - Recovery Leaflet' },
                { url: 'https://www.rcseng.ac.uk/patient-care/recovering-from-surgery/groin-hernia-repair/', title: 'RCS England - Recovery Tracker' }
            ],
            incisional_hernia: [
                { url: 'https://www.rahmanmedical.co.uk/abdominal-wall-hernias', title: 'Abdominal Wall Hernias (Rahman Medical)' },
                { url: 'https://www.bradfordhospitals.nhs.uk/wp-content/uploads/2024/04/23071304-hernia-repair.pdf', title: 'Bradford Hospitals - Hernia Repair Risks' }
            ],
            ventral_hernia: [
                { url: 'https://www.rahmanmedical.co.uk/abdominal-wall-hernias', title: 'Abdominal Wall Hernias (Rahman Medical)' },
                { url: 'https://www.esht.nhs.uk/wp-content/uploads/2022/04/0977.pdf', title: 'East Sussex NHS - Post-op Care' }
            ],
            other: [
                { url: 'https://www.rahmanmedical.co.uk', title: 'General Information (Rahman Medical)' }
            ]
        };
        
        const container = document.getElementById('pil_links_container');
        if (container && val && pilMap[val]) {
            container.innerHTML = '';
            pilMap[val].forEach(linkData => {
                const a = document.createElement('a');
                a.href = linkData.url;
                a.target = '_blank';
                a.style.cssText = 'display: inline-block; padding: 12px 18px; background: var(--brand-navy); color: white; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: bold; transition: 0.2s; text-align: center;';
                a.innerText = "View Document: " + linkData.title;
                container.appendChild(a);
            });
        }

        setTimeout(initSignature, 50); 
    }
}

const btnNextObj = document.getElementById('btnNext');
if(btnNextObj) {
    btnNextObj.addEventListener('click', () => {
        const condEl = document.getElementById('condition');
        const cond = condEl ? condEl.value : null;

        if (currentStep === 1) {
            const pName = document.getElementById('patient_name');
            const pDob = document.getElementById('patient_dob');
            if (pName && !pName.value) return alert("Please enter your name.");
            if (pDob && !pDob.value) return alert("Please enter your Date of Birth.");
            if (!cond) return alert("Please select a condition.");
        }
        
        if (currentStep < totalSteps) {
            if (currentStep === 2 && cond === 'other') {
                currentStep = 5;
            } else {
                currentStep++; 
            }
            updateUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const capCheck = document.getElementById('capacity_check');
            const montCheck = document.getElementById('montgomery_check');
            const priFinal = document.getElementById('priority_final');
            const consRisk = document.getElementById('consent_risks');
            
            if (capCheck && !capCheck.checked) return alert("Please confirm the capacity statement.");
            if (montCheck && !montCheck.checked) return alert("Please confirm the withdrawal right statement.");
            if (priFinal && !priFinal.value) return alert("Please state your primary goals for the consultation.");
            if (!signaturePad || signaturePad.isEmpty()) return alert("Signature is required.");
            if (consRisk && !consRisk.checked) return alert("Please confirm you have reviewed the clinical evidence and information.");
            generateFinalPDF();
        }
    });
}

const btnBackObj = document.getElementById('btnBack');
if(btnBackObj) {
    btnBackObj.addEventListener('click', () => { 
        const condEl = document.getElementById('condition');
        const cond = condEl ? condEl.value : null;
        if (currentStep > 1) { 
            if (currentStep === 5 && cond === 'other') {
                currentStep = 2; 
            } else {
                currentStep--; 
            }
            updateUI(); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); // ADD THIS LINE
        } 
    });
}

// Copy to Carebit Event
const copyBtn = document.getElementById('copy_payload_btn');
if(copyBtn) {
    copyBtn.addEventListener('click', () => {
        const payloadText = document.getElementById('clinic_payload_display').value;
        navigator.clipboard.writeText(payloadText).then(() => {
            copyBtn.innerText = "Copied to Clipboard!";
            copyBtn.style.background = "#10b981"; // Success Green
            setTimeout(() => {
                copyBtn.innerText = "Copy to Clinical Notes";
                copyBtn.style.background = "var(--brand-navy)";
            }, 3000);
        }).catch(err => alert("Failed to copy. Please select the text and copy manually."));
    });
}

// --- CAREBIT PAYLOAD GENERATOR ---
function generateCarebitPayload(mets, sb) {
    const name = document.getElementById('patient_name')?.value || 'UNKNOWN';
    let dob = document.getElementById('patient_dob')?.value || 'UNKNOWN';
    if(dob !== 'UNKNOWN') dob = dob.split('-').reverse().join('/'); // Format DD/MM/YYYY
    
    const age = document.getElementById('age')?.value || 'N/A';
    const sex = document.getElementById('sex')?.value === 'male' ? 'M' : 'F';
    
    const condEl = document.getElementById('condition');
    let condition = condEl ? condEl.options[condEl.selectedIndex].text : 'N/A';
    
    // Dynamic Inguinal vs Femoral capture
    if (condEl && condEl.value === 'groin_hernia') {
        const gType = document.getElementById('groin_type')?.value;
        if (gType === 'femoral') condition = 'Groin Hernia (Femoral)';
        else if (gType === 'inguinal') condition = 'Groin Hernia (Inguinal)';
    }

    const bmi = document.getElementById('bmi_result')?.textContent || 'N/A';
    const goals = document.getElementById('priority_final')?.value || "Unclear — explore";
    const reason = document.getElementById('reason')?.value || "Routine review";

    // Optimization Logic (OPT)
    let opt = [];
    if (document.getElementById('smoking')?.checked) opt.push("⚠ Smoking cessation");
    if (parseFloat(bmi) > 35) opt.push("⚠ Weight pre-hab");
    if (document.getElementById('pmh_diab_status')?.value === 'uncontrolled') opt.push("⚠ HbA1c review");

    // Past Medical History Array
    let pmhArr = [];
    if (document.getElementById('pmh_htn')?.checked) pmhArr.push("HTN");
    const diabStatus = document.getElementById('pmh_diab_status')?.value;
    if (diabStatus && diabStatus !== 'none') pmhArr.push(`Diabetes (${diabStatus})`);
    if (document.getElementById('pmh_thin')?.checked) pmhArr.push("Anticoagulants");
    const otherPmh = document.getElementById('pmh_other_text')?.value;
    if (otherPmh) pmhArr.push(otherPmh);
    
    const pmhStr = pmhArr.length > 0 ? pmhArr.join(', ') : 'Nil significant';
    const pshStr = document.getElementById('prev_surgeries_text')?.value || 'Nil significant';

    return `Re: ${name} | ${age}${sex} | DOB: ${dob} | ID: ${document.getElementById('patient_id')?.value || 'N/A'}
PC: ${condition} | BMI: ${bmi}
Cx: ${reason}
Goals: ${goals}
HPC: Pain ${document.getElementById('pain_score')?.value || 'N/A'}/10 | QoL ${document.getElementById('qol_score')?.value || 'N/A'}/10
PMH: ${pmhStr}
PSH: ${pshStr}
SH: ${document.getElementById('smoking')?.checked ? 'Smoker ⚠' : 'Non-smoker'} | Job: ${document.getElementById('jobInput')?.value || 'N/A'}
RISK: METs ${mets.toFixed(1)} | STOP-BANG ${sb}/8
OPT: ${opt.length > 0 ? opt.join(' | ') : 'Routine'}`;
}

// --- FINAL SUBMISSION & PDF EXPORT ---
// --- PRIVACY & SECURITY UTILITIES ---
async function scrambleID(id) {
    if (!id || id === "NO_ID") return "NO_ID";
    const msgBuffer = new TextEncoder().encode(id + "OutcomeLogicSalt2026");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8).toUpperCase();
}

// --- FINAL SUBMISSION & PDF EXPORT ---
async function generateFinalPDF() {
    const btn = document.getElementById('btnNext');
    if(btn) { 
        btn.innerText = "Securing Data & Processing..."; 
        btn.disabled = true; 
    }

    // 1. TIMING & DEVICE METRICS
    const submitTime = new Date();
    const timeSpentSeconds = Math.floor((submitTime.getTime() - (typeof appStartTime !== 'undefined' ? appStartTime : submitTime.getTime())) / 1000);
    const mins = Math.floor(timeSpentSeconds / 60);
    const secs = timeSpentSeconds % 60;
    const timeInAppString = `${mins}m ${secs}s`;

    // 2. CALCULATE MATH ENGINES 
    let dasi = 0;
    document.querySelectorAll('.d-val:checked').forEach(i => dasi += parseFloat(i.value));
    const mets = ((0.43 * dasi) + 9.6) / 3.5;

    let sb = 0;
    if (document.getElementById('sb_snore')?.checked) sb++;
    if (document.getElementById('sb_tired')?.checked) sb++;
    if (document.getElementById('sb_observe')?.checked) sb++;
    if (document.getElementById('pmh_htn')?.checked) sb++;
    if (document.getElementById('sex')?.value === 'male') sb++;
    if (document.getElementById('age') && (parseInt(document.getElementById('age').value) || 0) > 50) sb++;
    const bmiVal = parseFloat(document.getElementById('bmi_result')?.textContent) || 0;
    if (bmiVal > 35) sb++;

    let cci = 0;
    document.querySelectorAll('.cci-val:checked').forEach(i => cci += parseInt(i.value));

    // 3. POPULATE EVERY PDF FIELD
    document.getElementById('pdf-date').innerText = new Date().toLocaleDateString('en-GB');
    document.getElementById('pdf-timestamp').innerText = submitTime.toLocaleTimeString('en-GB');
    document.getElementById('pdf-time-spent').innerText = timeInAppString;

    // Grab raw Name and DOB for the Webhook & PDF
    const rawName = document.getElementById('patient_name')?.value || 'UNKNOWN';
    const rawDOB = document.getElementById('patient_dob')?.value || 'UNKNOWN';
    const formattedDOB = rawDOB !== 'UNKNOWN' ? rawDOB.split('-').reverse().join('/') : 'UNKNOWN';

    document.getElementById('pdf-name').innerText = rawName;
    document.getElementById('pdf-dob').innerText = formattedDOB;
    
    const condEl = document.getElementById('condition');
    document.getElementById('pdf-proc').innerText = condEl ? condEl.options[condEl.selectedIndex].text : 'N/A';
    
    const tfEl = document.getElementById('timeframe');
    document.getElementById('pdf-timeframe').innerText = tfEl ? tfEl.options[tfEl.selectedIndex].text : 'N/A';

    document.getElementById('pdf-reason').innerText = document.getElementById('reason')?.value || 'N/A';
    document.getElementById('pdf-priorities').innerText = document.getElementById('priority_final')?.value || 'N/A';

    const refEl = document.getElementById('referral_source');
    document.getElementById('pdf-referral').innerText = refEl ? refEl.options[refEl.selectedIndex].text : 'N/A';
    document.getElementById('pdf-gp-text').innerText = document.getElementById('gp_practice')?.value ? `(${document.getElementById('gp_practice').value})` : '';
    
    const priorEl = document.getElementById('prior_consult');
    document.getElementById('pdf-prior-consult').innerText = (priorEl && priorEl.value === 'yes') ? `Yes - ${document.getElementById('prior_consult_who')?.value}` : 'No';
    
    const durEl = document.getElementById('symptom_duration');
    document.getElementById('pdf-duration').innerText = durEl ? durEl.options[durEl.selectedIndex].text : 'N/A';

    document.getElementById('pdf-allergies').innerText = document.getElementById('allergies_text')?.value || 'None recorded';
    document.getElementById('pdf-meds').innerText = document.getElementById('medications_text')?.value || 'None recorded';
    
    const diabEl = document.getElementById('pmh_diab_status');
    document.getElementById('pdf-diabetes').innerText = diabEl ? diabEl.options[diabEl.selectedIndex].text : 'No';
    document.getElementById('pdf-other-mh').innerText = document.getElementById('pmh_other_text')?.value || 'None';

    document.getElementById('pdf-pain').innerText = document.getElementById('pain_score')?.value || '0';
    document.getElementById('pdf-qol').innerText = document.getElementById('qol_score')?.value || '0';

    const eq1 = document.getElementById('eq5d_mobility')?.value || "1";
    const eq2 = document.getElementById('eq5d_selfcare')?.value || "1";
    const eq3 = document.getElementById('eq5d_activities')?.value || "1";
    const eq4 = document.getElementById('eq5d_pain')?.value || "1";
    const eq5 = document.getElementById('eq5d_anxiety')?.value || "1";
    const eq5dProfile = `${eq1}${eq2}${eq3}${eq4}${eq5}`;
    
    document.getElementById('pdf-eq5d-profile').innerText = eq5dProfile;
    const eqText = ["No problems", "Some problems / Moderate", "Severe / Unable"];
    document.getElementById('pdf-eq1').innerText = eqText[eq1-1] || 'N/A';
    document.getElementById('pdf-eq2').innerText = eqText[eq2-1] || 'N/A';
    document.getElementById('pdf-eq3').innerText = eqText[eq3-1] || 'N/A';
    document.getElementById('pdf-eq4').innerText = eqText[eq4-1] || 'N/A';
    document.getElementById('pdf-eq5').innerText = eqText[eq5-1] || 'N/A';

    document.getElementById('pdf-bmi').innerText = bmiVal ? bmiVal.toFixed(1) : 'N/A';
    document.getElementById('pdf-mets').innerText = mets.toFixed(1);
    
    // Dynamic METs Evaluation
    const evalEl = document.getElementById('pdf-mets-eval');
    if (evalEl) {
        if (mets >= 4.0) {
            evalEl.innerText = "(Adequate)";
            evalEl.style.color = "#166534"; // Green
        } else {
            evalEl.innerText = "— Anaesthetic review required";
            evalEl.style.color = "#b91c1c"; // Red
        }
    }
    
    document.getElementById('pdf-sb').innerText = sb;
    document.getElementById('pdf-cci').innerText = cci;

    document.getElementById('pdf-pillars').innerHTML = document.getElementById('out-pillars')?.innerHTML || 'None identified';
    document.getElementById('pdf-pathway-discussed').innerHTML = document.getElementById('dynamic_pathway_panel')?.innerHTML || 'Standard pathway';
    document.getElementById('pdf-risks-reviewed').innerHTML = document.getElementById('dynamic_risks_panel')?.innerHTML || 'Standard risks';
    document.getElementById('pdf-concerns').innerText = document.getElementById('patient_concerns')?.value || 'None reported';
    
    document.getElementById('pdf-feedback').innerText = `Comprehension: ${document.getElementById('survey_comprehension')?.value}/5 | Preparedness: ${document.getElementById('survey_prepared')?.value}/5 | Usability: ${document.getElementById('survey_usability')?.value}/5`;
    document.getElementById('pdf-research-consent').innerText = document.getElementById('research_consent')?.checked ? "Yes" : "No";
    document.getElementById('pdf-device-type').innerText = typeof isMobile !== 'undefined' ? isMobile : 'Unknown Device';

    // CAPTURE CHARTS
    if(activeChart && condEl && condEl.value !== 'other') {
        document.getElementById('pdf-chart-header').style.display = 'block';
        const snap = document.getElementById('pdf-chart-snapshot');
        if (snap) {
            snap.src = activeChart.canvas.toDataURL('image/png', 1.0); 
            snap.style.display = 'block'; 
        }
    }
    if(recoveryChart) {
        document.getElementById('pdf-recovery-header').style.display = 'block';
        const rSnap = document.getElementById('pdf-recovery-snapshot');
        if (rSnap) {
            rSnap.src = recoveryChart.canvas.toDataURL('image/png', 1.0);
            rSnap.style.display = 'block';
        }
    }

    // 4. BUILD THE CAREBIT TEXT PAYLOAD & SECURE HASH
    const carebitPayload = generateCarebitPayload(mets, sb);
    const secureAuditID = await scrambleID(rawName.toUpperCase() + formattedDOB);

    // Silently copy to clipboard
    try { await navigator.clipboard.writeText(carebitPayload); } 
    catch (err) { console.log("Silent clipboard copy bypassed (normal for mobile devices)."); }

    // 5. PDF GENERATION & WEBHOOK
    const element = document.getElementById('printable-passport');
    if(!element) return;
    element.style.display = 'block';

    const opt = { 
        margin: [15, 12, 15, 12], 
        filename: 'Clinical-Passport.pdf', 
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };

  setTimeout(async () => {
        try { 
            const worker = html2pdf().set(opt).from(element);
            
            // Generate the physical PDF file (Blob)
            const pdfBlob = await worker.output('blob');
            generatedPdfBlob = pdfBlob; // Saves for the 'Open' button (don't forget to declare this variable globally if needed)

            // Perfectly convert that exact file to Base64
            const reader = new FileReader();
            reader.readAsDataURL(pdfBlob);
            reader.onloadend = async function() {
                const cleanBase64 = reader.result.split(',')[1];

                // Logic to capture only the partial postcode (Outward Code)
                const fullPostcode = document.getElementById('gp_practice')?.value.trim().toUpperCase() || 'N/A';
                const partialPostcode = fullPostcode.includes(' ') 
                    ? fullPostcode.split(' ')[0] 
                    : fullPostcode.substring(0, 4);

                // FIRE WEBHOOK
                if (typeof WEBHOOK_URL !== 'undefined') {
                    const dataPacket = {
                        patientName: rawName.toUpperCase(),
                        patientDOB: formattedDOB,
                        auditID: secureAuditID,
                        condition: condEl ? condEl.value : 'N/A',
                        referralSource: document.getElementById('referral_source')?.value || 'N/A',
                        gpPractice: partialPostcode, // Cleaned partial postcode
                        age: document.getElementById('age')?.value || '0',
                        bmi: bmiVal ? bmiVal.toFixed(1) : "0",
                        stopBang: sb,
                        mets: mets.toFixed(1),
                        cci: cci,
                        painScore: document.getElementById('pain_score')?.value || '0',
                        qolScore: document.getElementById('qol_score')?.value || '0',
                        eq5d: eq5dProfile,
                        timeInApp: timeInAppString,
                        deviceType: (typeof isMobile !== 'undefined' ? isMobile : (/Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop')),
                        compScore: document.getElementById('survey_comprehension')?.value || '0',
                        prepScore: document.getElementById('survey_prepared')?.value || '0',
                        usaScore: document.getElementById('survey_usability')?.value || '0',
                        researchConsent: document.getElementById('research_consent')?.checked ? "Yes" : "No",
                        targetDate: document.getElementById('dateInput')?.value || "", 
                        clinicalPayload: carebitPayload,
                        pdfData: cleanBase64 
                    };

                    fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify(dataPacket)
                    }).catch(e => console.log("Webhook failed or skipped", e));
                }

                // SHOW SUCCESS UI
                const nsPanel = document.getElementById('next_steps_panel');
                if(nsPanel) {
                    nsPanel.classList.remove('hidden');
                    setTimeout(() => { nsPanel.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 100);
                }
                
                if(btn) btn.innerHTML = "Profile Submitted Successfully"; 
            };

        } catch (err) { 
            console.error("PDF generation failed:", err);
            alert("An error occurred during final processing. Please try submitting again.");
            if(btn) { btn.disabled = false; btn.innerText = "Try Again"; }
        } finally { 
            element.style.display = 'none'; 
        }
    }, 500);
}

// --- PRIVACY & SECURITY UTILITIES ---
async function scrambleID(id) {
    if (!id || id === "NO_ID") return "NO_ID";
    const msgBuffer = new TextEncoder().encode(id + "OutcomeLogicSalt2026");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8).toUpperCase();
}
function openPdfInNewTab() {
    if (generatedPdfBlob) {
        const fileURL = URL.createObjectURL(generatedPdfBlob);
        window.open(fileURL, '_blank');
    } else {
        alert("The document is still processing. Please wait a moment.");
    }
}