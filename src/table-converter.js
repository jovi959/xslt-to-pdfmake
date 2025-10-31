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
 * Parses proportional-column-width() values
 * @param {string} width - Width value (e.g., "proportional-column-width(50)")
 * @returns {number|null} The numeric proportion or null if not proportional
 */
function parseProportionalWidth(width) {
    if (!width) return null;
    
    const match = width.match(/proportional-column-width\((\d+(?:\.\d+)?)\)/);
    if (match) {
        return parseFloat(match[1]);
    }
    return null;
}

/**
 * Converts proportional widths to percentages
 * @param {Array} widths - Array of width values (may include proportional-column-width)
 * @param {string} tableWidth - Table width attribute (e.g., "100%", "50%")
 * @returns {Array} Array of percentage strings (e.g., ["50%", "50%"])
 */
function convertProportionalWidths(widths, tableWidth) {
    const proportions = widths.map(w => parseProportionalWidth(w));
    
    // Check if all widths are proportional
    const allProportional = proportions.every(p => p !== null);
    
    if (!allProportional) {
        // If not all proportional, return as-is
        return widths;
    }
    
    // Calculate total proportions
    const total = proportions.reduce((sum, p) => sum + p, 0);
    
    // Parse table width (default 100%)
    let tableWidthPercent = 100;
    if (tableWidth) {
        const match = tableWidth.match(/(\d+(?:\.\d+)?)\s*%/);
        if (match) {
            tableWidthPercent = parseFloat(match[1]);
        }
    }
    
    // Convert each proportion to percentage of page
    return proportions.map(p => {
        const columnPercent = (p / total) * tableWidthPercent;
        return `${columnPercent}%`;
    });
}

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
 * Extracts cell styling attributes and converts them to PDFMake properties
 * NOTE: Most styling attributes (text-align, font-size, color, etc.) should be
 * inherited to child blocks via the inheritance preprocessor, NOT applied to the cell wrapper.
 * Only properties that affect the cell container itself should be extracted here.
 * 
 * @param {Element} node - The fo:table-cell DOM element
 * @returns {Object} Object with cell properties and border/padding info
 */
function extractCellStyling(node) {
    const styling = {
        cellProps: {},
        borderInfo: {},
        paddingInfo: null
    };
    
    // Background color - applies to cell wrapper
    const bgColor = node.getAttribute('background-color');
    if (bgColor && _deps.BlockConverter && _deps.BlockConverter.parseColor) {
        styling.cellProps.fillColor = _deps.BlockConverter.parseColor(bgColor);
    }
    
    // NOTE: text-align, font-size, font-weight, font-style, color, etc.
    // are NOT extracted here because they should be inherited to the blocks
    // inside the cell via the inheritance preprocessor (table-inheritance-config.js).
    // If we extract them here, cells with multiple blocks get wrapped in {stack: [...]}
    // which breaks tests that expect raw arrays.
    
    // Border properties - applies to cell via layout
    const border = node.getAttribute('border');
    const borderStyle = node.getAttribute('border-style');
    const borderColor = node.getAttribute('border-color');
    const borderWidth = node.getAttribute('border-width');
    
    if (border || borderStyle || borderColor || borderWidth) {
        // Use existing parseBorderShorthand if available
        if (border && _deps.BlockConverter && _deps.BlockConverter.parseBorderShorthand) {
            const parsed = _deps.BlockConverter.parseBorderShorthand(border);
            styling.borderInfo = parsed;
        }
        
        // Individual properties override shorthand
        if (borderStyle) styling.borderInfo.style = borderStyle;
        if (borderColor && _deps.BlockConverter && _deps.BlockConverter.parseColor) {
            styling.borderInfo.color = _deps.BlockConverter.parseColor(borderColor);
        }
        if (borderWidth && _deps.BlockConverter && _deps.BlockConverter.parseBorderWidth) {
            styling.borderInfo.width = _deps.BlockConverter.parseBorderWidth(borderWidth);
        }
    }
    
    // Padding - applies to cell via layout
    const padding = node.getAttribute('padding');
    if (padding && _deps.BlockConverter && _deps.BlockConverter.parsePadding) {
        styling.paddingInfo = _deps.BlockConverter.parsePadding(padding);
    }
    
    return styling;
}

/**
 * Converts a <fo:table-cell> element to PDFMake cell content
 * @param {Element} node - The fo:table-cell DOM element
 * @param {Array} children - Already-processed child content
 * @param {Function} traverse - Reference to traverse function
 * @param {Object} tableMeta - Metadata about table (borders, padding, etc.)
 * @returns {Object|string} PDFMake cell content
 */
function convertTableCell(node, children, traverse, tableMeta) {
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
    
    // Check for border attribute (legacy support)
    const border = parseCellBorder(node.getAttribute('border'));
    
    // Track total cells for layout calculation
    if (tableMeta) {
        tableMeta.totalCells = (tableMeta.totalCells || 0) + 1;
    }
    
    // Extract cell styling (font-size, padding, borders, background, etc.)
    const styling = extractCellStyling(node);
    
    // Check if we need to collect border/padding for layout object
    if (styling.borderInfo && Object.keys(styling.borderInfo).length > 0) {
        if (!tableMeta.hasCellBorders) tableMeta.hasCellBorders = true;
        if (!tableMeta.cellBorders) tableMeta.cellBorders = [];
        tableMeta.cellBorders.push(styling.borderInfo);
    }
    if (styling.paddingInfo) {
        if (!tableMeta.hasCellPadding) tableMeta.hasCellPadding = true;
        if (!tableMeta.cellPadding) tableMeta.cellPadding = [];
        tableMeta.cellPadding.push(styling.paddingInfo);
    }
    
    // Build cell object if we have special attributes
    const hasSpecialAttrs = colSpan > 1 || border || Object.keys(styling.cellProps).length > 0;
    
    if (hasSpecialAttrs) {
        // Build cell object
        const cellObject = {};
        
        // Add content
        // IMPORTANT: Check for array BEFORE checking for generic object
        // because in JavaScript, Array.isArray() is more specific than typeof === 'object'
        if (typeof cellContent === 'string') {
            cellObject.text = cellContent;
        } else if (Array.isArray(cellContent)) {
            // Multiple blocks - use PDFMake's stack property
            // This preserves the array structure instead of spreading indices as numeric keys
            cellObject.stack = cellContent;
        } else if (typeof cellContent === 'object' && cellContent !== null) {
            // Single object (like a styled block) - merge properties
            Object.assign(cellObject, cellContent);
        }
        
        // Add colSpan if present
        if (colSpan > 1) {
            cellObject.colSpan = colSpan;
        }
        
        // Add border if present (legacy support)
        if (border) {
            cellObject.border = border;
        }
        
        // Add cell styling properties (fontSize, bold, alignment, fillColor, etc.)
        Object.assign(cellObject, styling.cellProps);
        
        return cellObject;
    }

    // No special attributes - return content as-is
    return cellContent;
}

/**
 * Converts a <fo:table-row> element to PDFMake row array
 * @param {Element} node - The fo:table-row DOM element
 * @param {Function} traverse - Reference to traverse function
 * @param {Object} tableMeta - Metadata about table
 * @returns {Array} Array of cell contents
 */
function convertTableRow(node, traverse, tableMeta) {
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
                const cellContent = convertTableCell(child, cellChildren, traverse, tableMeta);
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
 * @param {Object} tableMeta - Metadata about table
 * @returns {Array} Array of rows
 */
function convertTableBody(node, traverse, tableMeta) {
    if (node.nodeName !== 'fo:table-body') {
        return null;
    }

    const body = [];
    
    // Process each table-row child
    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            if (child.nodeType === 1 && child.nodeName === 'fo:table-row') {
                const row = convertTableRow(child, traverse, tableMeta);
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
 * Builds PDFMake layout object with border and padding functions
 * @param {Object} tableMeta - Table metadata collected during cell processing
 * @returns {Object} PDFMake layout object
 */
function buildTableLayout(tableMeta) {
    const layout = {};
    let hasBorderFunctions = false;
    
    // Only use layout functions if ALL cells have borders and they're all the same
    // If only some cells have borders, they should use individual cell.border property
    if (tableMeta.hasCellBorders && 
        tableMeta.cellBorders && 
        tableMeta.cellBorders.length > 0 &&
        tableMeta.cellBorders.length === tableMeta.totalCells) {
        
        // Check if all borders are the same
        const firstBorder = tableMeta.cellBorders[0];
        const allSame = tableMeta.cellBorders.every(b => 
            b.width === firstBorder.width && 
            b.color === firstBorder.color && 
            b.style === firstBorder.style
        );
        
        if (allSame) {
            const borderWidth = firstBorder.width || 1;
            const borderColor = firstBorder.color || '#000000';
            
            layout.hLineWidth = function(i, node) { return borderWidth; };
            layout.vLineWidth = function(i, node) { return borderWidth; };
            layout.hLineColor = function(i, node) { return borderColor; };
            layout.vLineColor = function(i, node) { return borderColor; };
            hasBorderFunctions = true;
        }
    }
    
    // Only set defaultBorder: false if we don't have border functions
    // If we have border functions, let them control the borders
    if (!hasBorderFunctions) {
        layout.defaultBorder = false;
    }
    
    // Only use layout padding functions if ALL cells have padding and it's all the same
    if (tableMeta.hasCellPadding && 
        tableMeta.cellPadding && 
        tableMeta.cellPadding.length > 0 &&
        tableMeta.cellPadding.length === tableMeta.totalCells) {
        
        // Check if all padding is the same
        const firstPadding = tableMeta.cellPadding[0];
        const allSame = tableMeta.cellPadding.every(p => 
            p[0] === firstPadding[0] && // top
            p[1] === firstPadding[1] && // right
            p[2] === firstPadding[2] && // bottom
            p[3] === firstPadding[3]    // left
        );
        
        if (allSame) {
            layout.paddingLeft = function(i, node) { return firstPadding[3]; };
            layout.paddingRight = function(i, node) { return firstPadding[1]; };
            layout.paddingTop = function(i, node) { return firstPadding[0]; };
            layout.paddingBottom = function(i, node) { return firstPadding[2]; };
        }
    }
    
    return layout;
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

    // Create table metadata object to collect border/padding info
    const tableMeta = {
        hasCellBorders: false,
        hasCellPadding: false,
        cellBorders: [],
        cellPadding: [],
        totalCells: 0  // Track total cells to ensure all have same styling
    };

    // Parse column widths from <fo:table-column> elements
    const rawWidths = parseTableColumns(node);
    
    // Get table width attribute
    const tableWidth = node.getAttribute('width');
    
    // Convert proportional widths to percentages
    const widths = convertProportionalWidths(rawWidths, tableWidth);

    // Find and process table body
    let body = [];
    
    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            if (child.nodeType === 1 && child.nodeName === 'fo:table-body') {
                body = convertTableBody(child, traverse, tableMeta);
                break;
            }
        }
    }

    // Build layout object
    const layout = buildTableLayout(tableMeta);

    // Build table structure
    const tableStructure = {
        table: {
            widths: widths.length > 0 ? widths : ['*'],
            body: body
        },
        layout: layout
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
        parseCellBorder,
        parseProportionalWidth,
        convertProportionalWidths,
        extractCellStyling,
        buildTableLayout
    };
}

if (typeof window !== 'undefined') {
    window.TableConverter = {
        convertTable,
        convertTableBody,
        convertTableRow,
        convertTableCell,
        parseTableColumns,
        parseCellBorder,
        parseProportionalWidth,
        convertProportionalWidths,
        extractCellStyling,
        buildTableLayout
    };
}


