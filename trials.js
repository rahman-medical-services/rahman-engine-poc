const TRIAL_DATA = {
    esopec: {
        category: "Oncology",
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
        subgroups: {
            all: { intervention: [100, 88, 75, 66], control: [100, 78, 55, 48] }
        },
        footer_note: "ESOPEC (n=438) demonstrates a significant OS benefit for FLOT over CROSS."
    },
    viale: {
        category: "Oncology",
        shortName: "AML (VIALE-A)",
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
            all: { intervention: [100, 75, 60, 43], control: [100, 55, 38, 24] }
        },
        footer_note: "Standard of care for patients unfit for intensive chemotherapy."
    },
    relapstone: {
        category: "General Surgery",
        shortName: "Gallstones (RELAPSTONE)",
        title: "RELAPSTONE: Symptomatic Gallstones",
        subtitle: "Conservative Management vs. Surgery",
        source: "Lancet 2023",
        color: "#0ea5e9",
        metrics: {
            m1_label: "Pain Reduction (Surgery)", m1_value: "-65%",
            m2_label: "Pain (Conservative)", m2_value: "Persistent",
            secondary: "Significant QoL gain in surgical arm."
        },
        subgroups: {
            all: { intervention: [100, 35, 15, 8], control: [100, 85, 75, 70] }
        },
        footer_note: "Visualising the probability of persistent biliary pain episodes."
    }
};
