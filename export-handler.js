/**
 * OutcomeLogic™ Export Handler - NATIVE PRINT VERSION
 * Strategy: Browser-Native PDF Generation (Resolution Independent)
 */

window.executePDFExport = async function(filename, btnElement) {
    // 1. We don't need to 'lock' the UI or hide buttons manually 
    // because CSS @media print will handle it perfectly.
    
    // 2. Set the document title temporarily (this becomes the default PDF filename)
    const originalTitle = document.title;
    document.title = filename;

    // 3. Trigger the Native Print Dialog
    // This allows the user to 'Save as PDF' using the browser's internal engine.
    window.print();

    // 4. Restore the original title
    document.title = originalTitle;
};
