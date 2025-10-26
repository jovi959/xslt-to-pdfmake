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
 * Converts a <fo:block> element to PDFMake content definition
 * 
 * This function is designed to be used as a converter callback for the traverse function.
 * It extracts attributes from the fo:block element and converts them to PDFMake properties.
 * 
 * @param {Element} node - The fo:block DOM element
 * @param {Array} children - Already-processed child content from recursive traversal
 * @param {Function} traverse - Reference to traverse function (unused in simple case)
 * @returns {Object|string} PDFMake content object or string
 */
function convertBlock(node, children, traverse) {
    // If not a block element, return null (shouldn't happen with proper usage)
    if (node.nodeName !== 'fo:block') {
        return null;
    }

    // Build the PDFMake content object
    const result = {};

    // Handle content (children)
    if (children && children.length > 0) {
        // Check if we have mixed content (text + objects) or multiple items
        const hasObjects = children.some(child => typeof child === 'object');
        const hasMultipleItems = children.length > 1;
        
        // If only one child and it's a string, use it directly
        if (children.length === 1 && typeof children[0] === 'string') {
            result.text = children[0];
        } else if (hasObjects || hasMultipleItems) {
            // Multiple children or mixed content - use array
            result.text = children;
        } else {
            // Single non-string child
            result.text = children[0];
        }
    } else {
        // No children - empty text
        result.text = '';
    }

    // Extract and convert attributes
    const bold = parseFontWeight(node.getAttribute('font-weight'));
    const italics = parseFontStyle(node.getAttribute('font-style'));
    const decoration = parseTextDecoration(node.getAttribute('text-decoration'));
    const fontSize = parseFontSize(node.getAttribute('font-size'));
    const color = parseColor(node.getAttribute('color'));
    const alignment = parseAlignment(node.getAttribute('text-align'));

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

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        convertBlock,
        parseFontWeight,
        parseFontStyle,
        parseTextDecoration,
        parseFontSize,
        parseColor,
        parseAlignment
    };
}
if (typeof window !== 'undefined') {
    window.BlockConverter = { 
        convertBlock,
        parseFontWeight,
        parseFontStyle,
        parseTextDecoration,
        parseFontSize,
        parseColor,
        parseAlignment
    };
}

