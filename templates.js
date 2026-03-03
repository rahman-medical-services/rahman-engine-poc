/**
 * OutcomeLogic™ - Clinical Procedure Templates
 * Editable dictionary for procedural risks and benefits.
 */

const PROCEDURE_TEMPLATES = {
    "lap_chole": {
        title: "Laparoscopic Cholecystectomy",
        risks: "Intended Benefits: Resolution of biliary pain, prevention of cholecystitis, pancreatitis, or jaundice.\n\nSpecific Risks: Bleeding/Infection (1-2%), Bile leak (1%), Damage to the common bile duct requiring major reconstruction (~0.3% or 1 in 300), Bowel or major vascular injury (<0.5%), Conversion to open surgery (1-5%, higher if acute), Retained stones (1-2%), DVT/PE (<1%), and general anesthesia risks."
    },
    "lap_hernia": {
        title: "Laparoscopic Inguinal Hernia Repair",
        risks: "Intended Benefits: Resolution of swelling/pain, prevention of bowel obstruction or strangulation.\n\nSpecific Risks: Seroma/Hematoma (2-5%), Surgical site infection (1-2%), Chronic groin pain (2-5%), Recurrence of hernia (1-2%), Visceral or vascular injury (<0.5%), Testicular pain/atrophy (<1%), DVT/PE (<1%)."
    },
    "open_hernia": {
        title: "Open Inguinal Hernia Repair",
        risks: "Intended Benefits: Resolution of swelling/pain, prevention of bowel obstruction or strangulation.\n\nSpecific Risks: Hematoma/Seroma (2-5%), Surgical site infection (1-3%), Chronic groin pain or nerve numbness (5-10%), Recurrence of hernia (1-4%), Testicular pain/swelling (<1%), DVT/PE (<1%)."
    },
    "lap_fundoplication": {
        title: "Laparoscopic Fundoplication",
        risks: "Intended Benefits: Relief of reflux symptoms, reduction of PPI medication dependency.\n\nSpecific Risks: Dysphagia/difficulty swallowing (transient is common; persistent 2-5%), Gas bloat syndrome/inability to belch (10-15%), Bleeding/Infection (<1%), Esophageal/gastric perforation (<1%), Wrap slippage or symptom recurrence (5-10% over 5 years), Conversion to open surgery (1-2%), DVT/PE (<1%)."
    },
    "bariatric_bypass": {
        title: "Laparoscopic Roux-en-Y Gastric Bypass",
        risks: "Intended Benefits: Significant total body weight loss, remission of Type 2 Diabetes and metabolic syndrome.\n\nSpecific Risks: Anastomotic leak (1-2%), Bleeding (1-2%), Internal hernia (2-5% over lifetime), Marginal ulcers (2-5%), Bowel obstruction (1-2%), Long-term nutritional deficiencies (requires lifelong supplements), DVT/PE (<1%), Mortality (~0.1%)."
    }
};

// 1. Injects the text when a dropdown option is selected
function autoFillProcedure(key) {
    const procInput = document.getElementById('consent-proc-name');
    const riskInput = document.getElementById('consent-risk-text');
    
    if (key && PROCEDURE_TEMPLATES[key]) {
        procInput.value = PROCEDURE_TEMPLATES[key].title;
        riskInput.value = PROCEDURE_TEMPLATES[key].risks;
        autoResize(riskInput); // Snap to correct height
    } else {
        procInput.value = "";
        riskInput.value = "";
        riskInput.style.height = 'auto';
    }
}

// 2. Resizes the box dynamically
function autoResize(element) {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight + 5) + 'px';
}
