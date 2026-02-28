const TRIAL_DATA = {
esopec: {
        category: "Upper GI Oncology",
        shortName: "Esophageal (ESOPEC)",
        title: "ESOPEC: Esophageal Adenocarcinoma",
        subtitle: "Perioperative FLOT vs. Neoadjuvant CROSS",
        source: "ASCO 2024 / NEJM",
        color: "#2563eb",
        metrics: {
            m1_label: "Median OS (FLOT)", m1_value: "66m",
            m2_label: "Median OS (CROSS)", m2_value: "37m",
            secondary: "pCR: 17.3% (FLOT) vs 13.5% (CROSS)"
        },
        // This allows the UI to build a dropdown automatically
        subgroups: {
            all: { 
                label: "All Patients (ITT)",
                intervention: [100, 88, 75, 66], 
                control: [100, 78, 55, 48],
                hr: "0.70" 
            },
            under_65: { 
                label: "Age < 65 Years",
                intervention: [100, 92, 82, 74], 
                control: [100, 80, 58, 50],
                hr: "0.66"
            },
            over_65: { 
                label: "Age ≥ 65 Years",
                intervention: [100, 84, 68, 58], 
                control: [100, 75, 52, 45],
                hr: "0.76"
            },
            n_plus: { 
                label: "Clinical N+ (Node Positive)",
                intervention: [100, 85, 70, 60], 
                control: [100, 72, 48, 40],
                hr: "0.68"
            }
        },
        footer_note: "ESOPEC (n=438) is the first prospective trial showing significant OS benefit for FLOT over CROSS in adenocarcinoma. Hazard Ratio: 0.70 (p=0.012)."
    },
   viale: {
        category: "Oncology / Haematology",
        shortName: "AML (VIALE-A)",
        title: "VIALE-A: Acute Myeloid Leukemia",
        subtitle: "Azacitidine + Venetoclax in Patients Unfit for Intensive Chemo",
        source: "NEJM 2020",
        color: "#8e44ad", // Amethyst Purple
        yAxisLabel: "Overall Survival (%)",
        metrics: {
            m1_label: "CR/CRi Rate (Combination)", m1_value: "66.4%",
            m2_label: "CR/CRi Rate (Aza Alone)", m2_value: "28.3%",
            secondary: "Median OS: 14.7 months vs 9.6 months"
        },
        subgroups: {
            all: { 
                label: "All Patients (ITT)",
                intervention: [100, 75, 60, 50, 43], 
                control: [100, 55, 38, 30, 24],
                hr: "0.66" 
            },
            intermediate_risk: { 
                label: "Intermediate Cytogenetic Risk",
                intervention: [100, 82, 68, 58, 52], 
                control: [100, 60, 42, 34, 28],
                hr: "0.57"
            },
            poor_risk: { 
                label: "Poor Cytogenetic Risk",
                intervention: [100, 65, 48, 38, 30], 
                control: [100, 45, 30, 22, 18],
                hr: "0.78"
            }
        },
        footer_note: "VIALE-A (n=431) established Aza+Ven as the global standard for patients ineligible for intensive induction therapy. CR/CRi: Composite Complete Remission."
    },
    relapstone: {
        category: "General Surgery",
        shortName: "Gallstones (RELAPSTONE)",
        title: "RELAPSTONE Evidence Explorer",
        subtitle: "Multicentre study cohort visualising symptom-free probability",
        source: "Study Cohort (2024)",
        color: "#142b45",
        type: "calculated", // NEW: Tells the engine to use the math below
        yAxisLabel: "Symptom-Free Rate (%)",
        baseline: [1.0, 0.93, 0.86, 0.79, 0.76, 0.73, 0.71, 0.69, 0.67, 0.65, 0.64, 0.635, 0.63],
        hazardRatios: {
            age_over_54: 0.57,
            multiple_stones: 1.19,
            post_ercp: 0.58,
            alt_high: 1.22,
            wcc_high: 0.79
        },
        footer_note: "Model applies multivariate Hazard Ratios (HR) to a baseline survival curve from the RELAPSTONE 2024 cohort."
    }
};
