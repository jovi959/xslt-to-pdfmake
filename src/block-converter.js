/**
 * Block Converter Module
 * 
 * Converts XSL-FO <fo:block> elements to PDFMake text/content definitions.
 * This converter is designed to be plugged into the recursive traversal function.
 */

/**
 * Converts font-weight attribute to PDFMake bold property
 * @param {string} fontWeight - CSS font-weight value
 * @returns {boolean|undefined} true if bold, undefined otherwise
 */
function parseFontWeight(fontWeight) {
    if (!fontWeight) return undefined;
    
    const weight = fontWeight.toLowerCase();
    if (weight === 'bold' || weight === 'bolder' || parseInt(weight) >= 600) {
        return true;
    }
    
    return undefined;
}

/**
 * Converts font-style attribute to PDFMake italics property
 * @param {string} fontStyle - CSS font-style value
 * @returns {boolean|undefined} true if italic, undefined otherwise
 */
function parseFontStyle(fontStyle) {
    if (!fontStyle) return undefined;
    
    const style = fontStyle.toLowerCase();
    if (style === 'italic' || style === 'oblique') {
        return true;
    }
    
    return undefined;
}

/**
 * Converts text-decoration attribute to PDFMake decoration property
 * @param {string} textDecoration - CSS text-decoration value
 * @returns {string|undefined} 'underline', 'lineThrough', or undefined
 */
function parseTextDecoration(textDecoration) {
    if (!textDecoration) return undefined;
    
    const decoration = textDecoration.toLowerCase();
    if (decoration.includes('underline')) {
        return 'underline';
    }
    if (decoration.includes('line-through')) {
        return 'lineThrough';
    }
    
    return undefined;
}

/**
 * Converts font-size attribute to PDFMake fontSize property
 * @param {string} fontSize - CSS font-size value (e.g., "10pt", "12px")
 * @returns {number|undefined} Font size in points, undefined if not specified
 */
function parseFontSize(fontSize) {
    if (!fontSize) return undefined;
    
    const match = fontSize.match(/^([\d.]+)(pt|px|em|rem)?$/);
    if (!match) return undefined;
    
    const value = parseFloat(match[1]);
    const unit = match[2] || 'pt';
    
    // Convert to points (PDFMake's default unit)
    switch (unit) {
        case 'pt':
            return value;
        case 'px':
            return value * 0.75; // 1px ≈ 0.75pt
        case 'em':
        case 'rem':
            return value * 12; // Assuming 12pt base
        default:
            return value;
    }
}

/**
 * Converts color attribute to PDFMake color property
 * @param {string} color - CSS color value
 * @returns {string|undefined} Color value, undefined if not specified
 */
function parseColor(color) {
    if (!color) return undefined;
    return color;
}

/**
 * Converts text-align attribute to PDFMake alignment property
 * @param {string} textAlign - CSS text-align value
 * @returns {string|undefined} 'left', 'center', 'right', 'justify', or undefined
 */
function parseAlignment(textAlign) {
    if (!textAlign) return undefined;
    
    const align = textAlign.toLowerCase();
    if (['left', 'center', 'right', 'justify'].includes(align)) {
        return align;
    }
    
    return undefined;
}

/**
 * Extracts numeric value from a CSS size string without unit conversion
 * @param {string} size - CSS size value (e.g., '0.5pt', '5px', '10')
 * @returns {number|undefined} Numeric value, undefined if not specified
 */
function parseNumericValue(size) {
    if (!size) return undefined;
    
    const match = size.match(/^([\d.]+)(pt|px|em|rem)?$/);
    if (!match) return undefined;
    
    return parseFloat(match[1]);
}

/**
 * Parses border-width attribute to numeric value
 * @param {string} borderWidth - CSS border-width value (e.g., '0.5pt', '1px')
 * @returns {number|undefined} Width value, undefined if not specified
 */
function parseBorderWidth(borderWidth) {
    if (!borderWidth) return undefined;
    return parseNumericValue(borderWidth);
}

/**
 * Parses padding attribute to PDFMake margin array [left, top, right, bottom]
 * @param {string} padding - CSS padding value (e.g., '5px 0px 5px 0px', '5px', '5px 10px')
 * @returns {Array|undefined} Margin array [left, top, right, bottom] or undefined
 */
function parsePadding(padding) {
    if (!padding) return undefined;
    
    const parts = padding.trim().split(/\s+/);
    const values = parts.map(p => parseNumericValue(p) || 0);
    
    if (values.length === 1) {
        // All sides same
        return [values[0], values[0], values[0], values[0]];
    } else if (values.length === 2) {
        // top/bottom, left/right
        return [values[1], values[0], values[1], values[0]];
    } else if (values.length === 3) {
        // top, left/right, bottom
        return [values[1], values[0], values[1], values[2]];
    } else if (values.length === 4) {
        // top, right, bottom, left -> convert to left, top, right, bottom
        return [values[3], values[0], values[1], values[2]];
    }
    
    return undefined;
}

/**
 * Parses margin attribute to PDFMake margin array [left, top, right, bottom]
 * @param {string} margin - CSS margin value (e.g., '10px 0px 10px 0px', '10px', '5px 10px')
 * @returns {Array|undefined} Margin array [left, top, right, bottom] or undefined
 */
function parseMargin(margin) {
    return parsePadding(margin); // Same logic as padding
}

/**
 * Checks if a block has border properties
 * @param {Element} node - The fo:block DOM element
 * @returns {boolean} true if block has border properties
 */
function hasBorder(node) {
    return !!(node.getAttribute('border-style') || 
              node.getAttribute('border-width') || 
              node.getAttribute('border-color') ||
              node.getAttribute('padding'));
}

/**
 * Trims edge whitespace from children array (HTML-like normalization)
 * - Trim leading space from first text child (touching parent's opening tag)
 * - Trim trailing space from last text child (touching parent's closing tag)
 * - Preserve all internal spaces between siblings
 * 
 * @param {Array} children - Array of child content (strings and objects)
 * @returns {Array} Children with edge spaces trimmed
 */
function trimEdgeSpaces(children) {
    if (!children || children.length === 0) {
        return children;
    }
    
    const trimmed = [...children];
    
    // Trim leading space from first string child
    for (let i = 0; i < trimmed.length; i++) {
        if (typeof trimmed[i] === 'string') {
            trimmed[i] = trimmed[i].replace(/^\s+/, '');
            // If it becomes empty, remove it
            if (trimmed[i] === '') {
                trimmed.splice(i, 1);
                i--;
            }
            break; // Only trim the first text node
        }
    }
    
    // Trim trailing space from last string child
    for (let i = trimmed.length - 1; i >= 0; i--) {
        if (typeof trimmed[i] === 'string') {
            trimmed[i] = trimmed[i].replace(/\s+$/, '');
            // If it becomes empty, remove it
            if (trimmed[i] === '') {
                trimmed.splice(i, 1);
            }
            break; // Only trim the last text node
        }
    }
    
    return trimmed;
}

/**
 * Converts a <fo:inline> element to PDFMake inline content
 * 
 * @param {Element} node - The fo:inline DOM element
 * @param {Array} children - Already-processed child content from recursive traversal
 * @param {Function} traverse - Reference to traverse function
 * @returns {Object|string} PDFMake inline content object or string
 */
function convertInline(node, children, traverse) {
    // If not an inline element, return null
    if (node.nodeName !== 'fo:inline') {
        return null;
    }

    // Apply HTML-like edge whitespace trimming
    children = trimEdgeSpaces(children);

    // Extract and convert attributes
    const bold = parseFontWeight(node.getAttribute('font-weight'));
    const italics = parseFontStyle(node.getAttribute('font-style'));
    const decoration = parseTextDecoration(node.getAttribute('text-decoration'));
    const fontSize = parseFontSize(node.getAttribute('font-size'));
    const color = parseColor(node.getAttribute('color'));
    const alignment = parseAlignment(node.getAttribute('text-align'));

    // Build the text content
    let textContent;
    if (children && children.length > 0) {
        // Check if we have nested inlines (objects)
        const hasNestedInlines = children.some(child => typeof child === 'object' && child !== null && !Array.isArray(child));
        
        // If only one child and it's a string, use it directly
        if (children.length === 1 && typeof children[0] === 'string') {
            textContent = children[0];
        } else if (hasNestedInlines) {
            // Has nested inlines - wrap text children with this inline's styling
            textContent = children.map(child => {
                if (typeof child === 'string') {
                    // Text node with nested inline siblings - wrap with parent styling
                    const styledText = { text: child };
                    if (bold !== undefined) styledText.bold = bold;
                    if (italics !== undefined) styledText.italics = italics;
                    if (decoration !== undefined) styledText.decoration = decoration;
                    if (fontSize !== undefined) styledText.fontSize = fontSize;
                    if (color !== undefined) styledText.color = color;
                    if (alignment !== undefined) styledText.alignment = alignment;
                    
                    // If no styling, return string as-is
                    return Object.keys(styledText).length > 1 ? styledText : child;
                } else {
                    // Nested inline - return as-is
                    return child;
                }
            });
        } else {
            // No nested inlines - use array of children as-is
            textContent = children.length === 1 ? children[0] : children;
        }
    } else {
        // No children - empty text
        textContent = '';
    }
    
    // Build the inline object
    const result = { text: textContent };
    
    // Only add properties that are defined
    if (bold !== undefined) result.bold = bold;
    if (italics !== undefined) result.italics = italics;
    if (decoration !== undefined) result.decoration = decoration;
    if (fontSize !== undefined) result.fontSize = fontSize;
    if (color !== undefined) result.color = color;
    if (alignment !== undefined) result.alignment = alignment;

    // If result only has text property and it's a string, return just the string
    if (Object.keys(result).length === 1 && typeof result.text === 'string') {
        return result.text;
    }

    return result;
}

/**
 * Converts a <fo:block> element to PDFMake content definition
 * 
 * This function is designed to be used as a converter callback for the traverse function.
 * It extracts attributes from the fo:block element and converts them to PDFMake properties.
 * 
 * If the block has border properties, it returns a table structure with a single cell.
 * 
 * @param {Element} node - The fo:block DOM element
 * @param {Array} children - Already-processed child content from recursive traversal
 * @param {Function} traverse - Reference to traverse function (unused in simple case)
 * @returns {Object|string} PDFMake content object or string
 */
function convertBlock(node, children, traverse) {
    // If not a block element, check if it's an inline element
    if (node.nodeName !== 'fo:block') {
        // Delegate to inline converter if it's an inline element
        if (node.nodeName === 'fo:inline') {
            return convertInline(node, children, traverse);
        }
        return null;
    }

    // Apply HTML-like edge whitespace trimming
    children = trimEdgeSpaces(children);

    // Extract and convert attributes first (we'll need these to style text children)
    const bold = parseFontWeight(node.getAttribute('font-weight'));
    const italics = parseFontStyle(node.getAttribute('font-style'));
    const decoration = parseTextDecoration(node.getAttribute('text-decoration'));
    const fontSize = parseFontSize(node.getAttribute('font-size'));
    const color = parseColor(node.getAttribute('color'));
    const alignment = parseAlignment(node.getAttribute('text-align'));

    // Build the text content
    let textContent;
    
    if (children && children.length > 0) {
        // Check if we have nested blocks (objects)
        const hasNestedBlocks = children.some(child => typeof child === 'object' && child !== null && !Array.isArray(child));
        
        // If only one child and it's a string, use it directly
        if (children.length === 1 && typeof children[0] === 'string') {
            textContent = children[0];
        } else if (hasNestedBlocks) {
            // Has nested blocks - wrap text children with this block's styling
            textContent = children.map(child => {
                if (typeof child === 'string') {
                    // Text node with nested block siblings - wrap with parent styling
                    const styledText = { text: child };
                    if (bold !== undefined) styledText.bold = bold;
                    if (italics !== undefined) styledText.italics = italics;
                    if (decoration !== undefined) styledText.decoration = decoration;
                    if (fontSize !== undefined) styledText.fontSize = fontSize;
                    if (color !== undefined) styledText.color = color;
                    if (alignment !== undefined) styledText.alignment = alignment;
                    
                    // If no styling, return string as-is
                    return Object.keys(styledText).length > 1 ? styledText : child;
                } else {
                    // Nested block - return as-is
                    return child;
                }
            });
        } else {
            // No nested blocks - use array of children as-is
            textContent = children.length === 1 ? children[0] : children;
        }
    } else {
        // No children - empty text
        textContent = '';
    }
    
    // Check for border/padding properties
    const borderStyle = node.getAttribute('border-style');
    const borderWidth = parseBorderWidth(node.getAttribute('border-width'));
    const borderColor = parseColor(node.getAttribute('border-color'));
    const padding = parsePadding(node.getAttribute('padding'));
    const margin = parseMargin(node.getAttribute('margin'));
    
    // If block has borders or padding, convert to table
    if (hasBorder(node)) {
        // Build the cell content with text styling
        const cellContent = { text: textContent };
        if (bold !== undefined) cellContent.bold = bold;
        if (italics !== undefined) cellContent.italics = italics;
        if (decoration !== undefined) cellContent.decoration = decoration;
        if (fontSize !== undefined) cellContent.fontSize = fontSize;
        if (color !== undefined) cellContent.color = color;
        if (alignment !== undefined) cellContent.alignment = alignment;
        
        // Convert padding to margin inside the cell
        if (padding !== undefined) {
            cellContent.margin = padding;
        }
        
        // Check if actual border attributes are present (not just padding)
        const hasBorderAttributes = borderStyle || borderWidth !== undefined || borderColor !== undefined;
        
        // Set border on all sides based on whether border attributes are present
        cellContent.border = hasBorderAttributes ? [true, true, true, true] : [false, false, false, false];
        
        // Build the table structure
        const tableStructure = {
            table: {
                widths: ['*'],
                body: [[cellContent]]
            }
        };
        
        // Add layout for border styling if border width or color specified
        if (borderWidth !== undefined || borderColor !== undefined) {
            const lineWidth = borderWidth !== undefined ? borderWidth : 0.5;
            const lineColor = borderColor !== undefined ? borderColor : '#000000';
            
            tableStructure.layout = {
                hLineWidth: function() { return lineWidth; },
                vLineWidth: function() { return lineWidth; },
                hLineColor: function() { return lineColor; },
                vLineColor: function() { return lineColor; }
            };
        }
        
        // Apply margin outside the table
        if (margin !== undefined) {
            tableStructure.margin = margin;
        }
        
        return tableStructure;
    }
    
    // No border - return normal text block
    const result = { text: textContent };
    
    // Only add properties that are defined
    if (bold !== undefined) result.bold = bold;
    if (italics !== undefined) result.italics = italics;
    if (decoration !== undefined) result.decoration = decoration;
    if (fontSize !== undefined) result.fontSize = fontSize;
    if (color !== undefined) result.color = color;
    if (alignment !== undefined) result.alignment = alignment;
    if (margin !== undefined) result.margin = margin;

    // If result only has text property and it's a string, return just the string
    if (Object.keys(result).length === 1 && typeof result.text === 'string') {
        return result.text;
    }

    return result;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        convertBlock,
        convertInline,
        trimEdgeSpaces,
        parseFontWeight,
        parseFontStyle,
        parseTextDecoration,
        parseFontSize,
        parseColor,
        parseAlignment,
        parseNumericValue,
        parseBorderWidth,
        parsePadding,
        parseMargin,
        hasBorder
    };
}
if (typeof window !== 'undefined') {
    window.BlockConverter = { 
        convertBlock,
        convertInline,
        trimEdgeSpaces,
        parseFontWeight,
        parseFontStyle,
        parseTextDecoration,
        parseFontSize,
        parseColor,
        parseAlignment,
        parseNumericValue,
        parseBorderWidth,
        parsePadding,
        parseMargin,
        hasBorder
    };
}

