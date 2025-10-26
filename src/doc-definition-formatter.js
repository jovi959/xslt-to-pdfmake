/**
 * Document Definition Formatter
 * Converts PDFMake document definitions to displayable JavaScript code
 */

/**
 * Format a PDFMake document definition as JavaScript code string
 * @param {Object} pdfDef - The PDFMake document definition
 * @returns {string} JavaScript code representation
 */
function formatDocDefinitionAsCode(pdfDef) {
    // Simple approach: just stringify the entire object
    // Handle functions specially since they can't be JSON stringified
    const replacer = (key, value) => {
        if (typeof value === 'function') {
            return value.toString();
        }
        return value;
    };
    
    const jsonStr = JSON.stringify(pdfDef, replacer, 2);
    return `const docDefinition = ${jsonStr};`;
}

// Export for use in other files (works in both browser and Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatDocDefinitionAsCode };
}
if (typeof window !== 'undefined') {
    window.formatDocDefinitionAsCode = formatDocDefinitionAsCode;
}

