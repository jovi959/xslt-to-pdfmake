/**
 * Table Converter Module
 * 
 * Converts XSL-FO table elements to PDFMake table definitions.
 * Handles <fo:table>, <fo:table-column>, <fo:table-body>, <fo:table-row>, <fo:table-cell>
 */

/**
 * Get dependencies - store in object to avoid global conflicts
 */
const _deps = (function() {
    // Check for real browser environment (not Node.js with fake window)
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    let BlockConverter, WhitespaceUtils, RecursiveTraversal;
    
    if (isBrowser) {
        BlockConverter = window.BlockConverter;
        WhitespaceUtils = window.WhitespaceUtils;
        RecursiveTraversal = window.RecursiveTraversal;
        
        // Validate dependencies are loaded (browser only)
        if (!BlockConverter) {
            throw new Error(
                'BlockConverter not loaded! ' +
                'Make sure block-converter.js is loaded before table-converter.js in your HTML file.'
            );
        }
        if (!WhitespaceUtils) {
            throw new Error(
                'WhitespaceUtils not loaded! ' +
                'Make sure whitespace-utils.js is loaded before table-converter.js in your HTML file.'
            );
        }
        if (!RecursiveTraversal) {
            throw new Error(
                'RecursiveTraversal not loaded! ' +
                'Make sure recursive-traversal.js is loaded before table-converter.js in your HTML file.'
            );
        }
    } else if (typeof require === 'function') {
        // Node.js environment (or Node.js with fake window) - use require()
        BlockConverter = require('./block-converter.js');
        WhitespaceUtils = require('./whitespace-utils.js');
        RecursiveTraversal = require('./recursive-traversal.js');
    }
    
    return { BlockConverter, WhitespaceUtils, RecursiveTraversal };
})();

/**
 * Parses border attribute for table cells
 * @param {string} border - Border value (e.g., "solid", "1px solid black")
 * @returns {Array|undefined} Border array [left, top, right, bottom] or undefined
 */
function parseCellBorder(border) {
    if (!border) return undefined;
    
    // If border attribute exists, set all sides to true
    // (XSL-FO border="solid" means all sides)
    return [true, true, true, true];
}

/**
 * Converts a <fo:table-cell> element to PDFMake cell content
 * @param {Element} node - The fo:table-cell DOM element
 * @param {Array} children - Already-processed child content
 * @param {Function} traverse - Reference to traverse function
 * @returns {Object|string} PDFMake cell content
 */
function convertTableCell(node, children, traverse) {
    if (node.nodeName !== 'fo:table-cell') {
        return null;
    }

    // NOTE: Do NOT apply normalizeChildren here!
    // The children are already-processed blocks (objects), not raw text/inline content.
    // normalizeChildren is for inline content within a single block, not for multiple blocks.
    // Each block already had its internal whitespace normalized during convertBlock.
    // Calling normalizeChildren here would incorrectly add spaces between blocks.

    // Extract cell content (typically one or more blocks)
    let cellContent;
    
    if (children && children.length > 0) {
        if (children.length === 1) {
            // Single child - use directly
            cellContent = children[0];
        } else {
            // Multiple children - use as array (no spaces between blocks!)
            cellContent = children;
        }
    } else {
        // Empty cell
        cellContent = '';
    }

    // Check for column spanning
    const colSpan = parseInt(node.getAttribute('number-columns-spanned'), 10);
    
    // Check for border attribute
    const border = parseCellBorder(node.getAttribute('border'));
    
    // Build cell object if we have colSpan or border
    const needsObject = colSpan > 1 || border;
    
    if (needsObject) {
        // Build cell object
        const cellObject = {};
        
        // Add content
        if (typeof cellContent === 'string') {
            cellObject.text = cellContent;
        } else if (typeof cellContent === 'object' && cellContent !== null) {
            // If cellContent is already an object, merge it
            Object.assign(cellObject, cellContent);
        }
        
        // Add colSpan if present
        if (colSpan > 1) {
            cellObject.colSpan = colSpan;
        }
        
        // Add border if present
        if (border) {
            cellObject.border = border;
        }
        
        return cellObject;
    }

    // No special attributes - return content as-is
    return cellContent;
}

/**
 * Converts a <fo:table-row> element to PDFMake row array
 * @param {Element} node - The fo:table-row DOM element
 * @param {Function} traverse - Reference to traverse function
 * @returns {Array} Array of cell contents
 */
function convertTableRow(node, traverse) {
    if (node.nodeName !== 'fo:table-row') {
        return null;
    }

    const row = [];
    
    // Process each table-cell child
    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            if (child.nodeType === 1 && child.nodeName === 'fo:table-cell') {
                // Process cell children first (blocks inside the cell)
                const cellChildren = [];
                
                if (child.childNodes) {
                    for (let j = 0; j < child.childNodes.length; j++) {
                        const cellChild = child.childNodes[j];
                        
                        // Use block converter for blocks inside cells
                        if (cellChild.nodeType === 1 && cellChild.nodeName === 'fo:block') {
                            const processed = traverse(cellChild, _deps.BlockConverter.convertBlock);
                            if (processed !== null && processed !== undefined) {
                                cellChildren.push(processed);
                            }
                        } else if (cellChild.nodeType === 3) {
                            // Text node
                            const text = cellChild.textContent;
                            if (text && !/^\s*$/.test(text)) {
                                cellChildren.push(text);
                            }
                        }
                    }
                }
                
                // Convert the cell with its processed children
                const cellContent = convertTableCell(child, cellChildren, traverse);
                if (cellContent !== null) {
                    row.push(cellContent);
                    
                    // If cell has colSpan, add empty placeholder cells
                    const colSpan = parseInt(child.getAttribute('number-columns-spanned'), 10);
                    if (colSpan > 1) {
                        // Add (colSpan - 1) empty placeholder cells
                        for (let k = 1; k < colSpan; k++) {
                            row.push({});
                        }
                    }
                }
            }
        }
    }

    return row;
}

/**
 * Converts a <fo:table-body> element to PDFMake body array
 * @param {Element} node - The fo:table-body DOM element
 * @param {Function} traverse - Reference to traverse function
 * @returns {Array} Array of rows
 */
function convertTableBody(node, traverse) {
    if (node.nodeName !== 'fo:table-body') {
        return null;
    }

    const body = [];
    
    // Process each table-row child
    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            if (child.nodeType === 1 && child.nodeName === 'fo:table-row') {
                const row = convertTableRow(child, traverse);
                if (row && row.length > 0) {
                    body.push(row);
                }
            }
        }
    }

    return body;
}

/**
 * Parses <fo:table-column> elements to extract column widths
 * @param {Element} tableNode - The fo:table DOM element
 * @returns {Array} Array of column widths (e.g., ['50%', '50%'])
 */
function parseTableColumns(tableNode) {
    const widths = [];
    
    if (tableNode.childNodes) {
        for (let i = 0; i < tableNode.childNodes.length; i++) {
            const child = tableNode.childNodes[i];
            
            if (child.nodeType === 1 && child.nodeName === 'fo:table-column') {
                const columnWidth = child.getAttribute('column-width');
                if (columnWidth) {
                    widths.push(columnWidth);
                } else {
                    // Default to auto or equal width
                    widths.push('*');
                }
            }
        }
    }

    return widths;
}

/**
 * Converts a <fo:table> element to PDFMake table definition
 * @param {Element} node - The fo:table DOM element
 * @param {Array} children - Already-processed child content (not used directly)
 * @param {Function} traverse - Reference to traverse function
 * @returns {Object} PDFMake table definition
 */
function convertTable(node, children, traverse) {
    if (node.nodeName !== 'fo:table') {
        return null;
    }

    // Parse column widths from <fo:table-column> elements
    const widths = parseTableColumns(node);

    // Find and process table body
    let body = [];
    
    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            if (child.nodeType === 1 && child.nodeName === 'fo:table-body') {
                body = convertTableBody(child, traverse);
                break;
            }
        }
    }

    // Build table structure
    const tableStructure = {
        table: {
            widths: widths.length > 0 ? widths : ['*'],
            body: body
        },
        // XSL-FO tables don't have borders by default
        // This layout tells PDFMake NOT to draw borders unless explicitly defined on cells
        layout: {
            defaultBorder: false
        }
    };

    return tableStructure;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convertTable,
        convertTableBody,
        convertTableRow,
        convertTableCell,
        parseTableColumns,
        parseCellBorder
    };
}

if (typeof window !== 'undefined') {
    window.TableConverter = {
        convertTable,
        convertTableBody,
        convertTableRow,
        convertTableCell,
        parseTableColumns,
        parseCellBorder
    };
}

