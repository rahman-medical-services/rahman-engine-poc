// OutcomeLogic™ Evidence Ledger
// Proprietary Data of Rahman Medical Services Limited

const TRIAL_DATA = {
    esopec: {
        title: "ESOPEC: Esophageal Adenocarcinoma",
        subtitle: "Perioperative FLOT vs. Neoadjuvant CROSS",
        source: "ASCO 2024 / NEJM",
        color: "#2563eb",
        metrics: {
            m1_label: "Median OS (FLOT)", m1_value: "66m",
            m2_label: "Median OS (CROSS)", m2_value: "37m",
            secondary: "pCR: 17.3% (FLOT) vs 13.5% (CROSS)"
        },
        subgroups: {
            all: { flot: [100, 88, 75, 66], cross: [100, 78, 55, 48], hr: "0.70" },
            age_over_65: { flot: [100, 84, 68, 58], cross: [100, 75, 52, 45], hr: "0.76" }
        },
        footer_note: "ESOPEC (n=438) demonstrates a significant OS benefit for FLOT over CROSS."
    },
    viale: {
        title: "VIALE-A: Acute Myeloid Leukemia",
        subtitle: "Aza + Venetoclax vs. Aza + Placebo",
        source: "NEJM 2020",
        color: "#8e44ad",
        metrics: {
            m1_label: "Remission (Aza+Ven)", m1_value: "66.4%",
            m2_label: "Remission (Control)", m2_value: "28.3%",
            secondary: "Median OS: 14.7m vs 9.6m"
        },
        subgroups: {
            all: { active: [100, 75, 60, 43], control: [100, 55, 38, 24], hr: "0.66" }
        },
        footer_note: "Standard of care for patients unfit for intensive chemotherapy."
    }
};
