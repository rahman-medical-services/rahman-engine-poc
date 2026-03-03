/**
 * OutcomeLogic™ Export Handler - v2.0 (Native)
 * Decoupled from screen resolution and viewport bugs
 */
window.executePDFExport = async function(filename, btn) {
    // 1. Set document title (this becomes the filename in the print dialog)
    const originalTitle = document.title;
    document.title = filename;

    // 2. Trigger Print Dialog
    // User selects 'Save as PDF' - zero clipping, zero redraws
    window.print();

    // 3. Restore original title
    document.title = originalTitle;
};
