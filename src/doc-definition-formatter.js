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
    let jsCode = 'const docDefinition = {\n';
    jsCode += `  pageSize: ${typeof pdfDef.pageSize === 'string' ? `'${pdfDef.pageSize}'` : JSON.stringify(pdfDef.pageSize)},\n`;
    jsCode += `  pageMargins: [${pdfDef.pageMargins.join(', ')}],\n`;
    
    // Handle header (function or object)
    if (typeof pdfDef.header === 'function') {
        // Use the actual function source code
        const functionStr = pdfDef.header.toString();
        jsCode += '\n  header: ' + functionStr + ',\n';
    } else if (pdfDef.header) {
        jsCode += `\n  header: ${JSON.stringify(pdfDef.header, null, 2).replace(/\n/g, '\n  ')},\n`;
    }
    
    // Handle footer (function or object)
    if (typeof pdfDef.footer === 'function') {
        // Use the actual function source code
        const functionStr = pdfDef.footer.toString();
        jsCode += '\n  footer: ' + functionStr + ',\n';
    } else if (pdfDef.footer) {
        jsCode += `\n  footer: ${JSON.stringify(pdfDef.footer, null, 2).replace(/\n/g, '\n  ')},\n`;
    }
    
    jsCode += '\n  content: []\n';
    jsCode += '};';
    
    return jsCode;
}

// Export for use in other files (works in both browser and Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatDocDefinitionAsCode };
}
if (typeof window !== 'undefined') {
    window.formatDocDefinitionAsCode = formatDocDefinitionAsCode;
}

