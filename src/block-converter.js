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
 * Parses font-family attribute
 * @param {string} fontFamily - Font family string (e.g., "Arial", "Helvetica, Arial, sans-serif")
 * @returns {string|undefined} Font family name or undefined
 */
function parseFontFamily(fontFamily) {
    if (!fontFamily) return undefined;
    
    // For PDFMake, we typically use the first font in the stack
    // or the full string if it's a single font
    const trimmed = fontFamily.trim();
    
    // If it contains commas, take the first font
    let fontName;
    if (trimmed.includes(',')) {
        fontName = trimmed.split(',')[0].trim().replace(/['"]/g, '');
    } else {
        fontName = trimmed.replace(/['"]/g, '');
    }
    
    // PDFMake font names are case-sensitive and typically lowercase
    // Convert to lowercase for consistent matching
    return fontName.toLowerCase();
}

/**
 * Parses background-color attribute
 * @param {string} bgColor - Background color value
 * @returns {string|undefined} Color string or undefined
 */
function parseBackgroundColor(bgColor) {
    return parseColor(bgColor);
}

/**
 * Parses line-height attribute
 * @param {string} lineHeight - Line height value (e.g., "1.5", "2em", "20px")
 * @returns {number|undefined} Line height value or undefined
 */
function parseLineHeight(lineHeight) {
    if (!lineHeight) return undefined;
    
    // If it's a unitless number, return as-is
    if (/^\d+(\.\d+)?$/.test(lineHeight)) {
        return parseFloat(lineHeight);
    }
    
    // For now, extract numeric value (PDFMake uses numeric line height)
    const match = lineHeight.match(/^([\d.]+)/);
    if (match) {
        return parseFloat(match[1]);
    }
    
    return undefined;
}

/**
 * Parses page-break-before attribute (generic, works for any element)
 * @param {string} pageBreakBefore - Page break value (e.g., "always", "auto", "avoid")
 * @returns {string|undefined} 'before', 'after', or undefined
 */
function parsePageBreak(pageBreakBefore) {
    if (!pageBreakBefore) return undefined;
    
    const value = pageBreakBefore.toLowerCase().trim();
    if (value === 'always') {
        return 'before';
    }
    
    // Could add support for 'after' if needed
    return undefined;
}

/**
 * Parses shorthand border attribute (e.g., "2px solid black")
 * @param {string} borderStr - Border shorthand string
 * @returns {Object} Object with width, style, and color properties
 */
function parseBorderShorthand(borderStr) {
    if (!borderStr) return {};
    
    const result = {};
    const parts = borderStr.trim().split(/\s+/);
    
    for (const part of parts) {
        // Check if it's a width (starts with number)
        if (/^[\d.]+/.test(part)) {
            result.width = parseNumericValue(part);
        }
        // Check if it's a style (solid, dashed, dotted, etc.)
        else if (/^(solid|dashed|dotted|double|groove|ridge|inset|outset|none|hidden)$/i.test(part)) {
            result.style = part.toLowerCase();
        }
        // Check if it's a color (starts with # or is a named color)
        else if (part.startsWith('#') || /^[a-z]+$/i.test(part)) {
            result.color = parseColor(part);
        }
    }
    
    return result;
}

/**
 * Checks if a block has border properties
 * @param {Element} node - The fo:block DOM element
 * @returns {boolean} true if block has border properties
 */
function hasBorder(node) {
    return !!(node.getAttribute('border') ||
              node.getAttribute('border-style') || 
              node.getAttribute('border-width') || 
              node.getAttribute('border-color') ||
              node.getAttribute('padding'));
}

/**
 * Import whitespace utilities from centralized module
 * All whitespace normalization logic lives in whitespace-utils.js
 */
let WhitespaceUtils;
if (typeof window !== 'undefined' && window.WhitespaceUtils) {
    // Browser environment
    WhitespaceUtils = window.WhitespaceUtils;
} else if (typeof require === 'function') {
    // Node.js environment
    WhitespaceUtils = require('./whitespace-utils.js');
}

// Validate WhitespaceUtils is available
if (!WhitespaceUtils) {
    throw new Error(
        'WhitespaceUtils not loaded! ' +
        'Make sure whitespace-utils.js is loaded before block-converter.js in your HTML file.'
    );
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

    // Apply HTML-like whitespace normalization (all 3 steps in one call)
    // 1. Normalize whitespace (newlines → spaces, collapse multiple)
    // 2. Trim edge spaces
    // 3. Insert spaces between consecutive inline elements
    children = WhitespaceUtils.normalizeChildren(children);

    // Extract and convert attributes
    const bold = parseFontWeight(node.getAttribute('font-weight'));
    const italics = parseFontStyle(node.getAttribute('font-style'));
    const decoration = parseTextDecoration(node.getAttribute('text-decoration'));
    const fontSize = parseFontSize(node.getAttribute('font-size'));
    const color = parseColor(node.getAttribute('color'));
    const alignment = parseAlignment(node.getAttribute('text-align'));
    const font = parseFontFamily(node.getAttribute('font-family'));
    const background = parseBackgroundColor(node.getAttribute('background-color'));
    const lineHeight = parseLineHeight(node.getAttribute('line-height'));

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
    if (font !== undefined) result.font = font;
    if (background !== undefined) result.background = background;
    if (lineHeight !== undefined) result.lineHeight = lineHeight;

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

    // Check for linefeed-treatment="preserve" attribute
    const linefeedTreatment = node.getAttribute('linefeed-treatment');
    const preserveLinefeeds = linefeedTreatment === 'preserve';
    
    // Apply HTML-like whitespace normalization UNLESS linefeed-treatment="preserve"
    // When preserving linefeeds, we keep actual newlines as \n in the text
    if (!preserveLinefeeds) {
        // 1. Normalize whitespace (newlines → spaces, collapse multiple)
        // 2. Trim edge spaces
        // 3. Insert spaces between consecutive inline elements
        children = WhitespaceUtils.normalizeChildren(children);
    }

    // Extract and convert attributes first (we'll need these to style text children)
    const bold = parseFontWeight(node.getAttribute('font-weight'));
    const italics = parseFontStyle(node.getAttribute('font-style'));
    const decoration = parseTextDecoration(node.getAttribute('text-decoration'));
    const fontSize = parseFontSize(node.getAttribute('font-size'));
    const color = parseColor(node.getAttribute('color'));
    const alignment = parseAlignment(node.getAttribute('text-align'));
    const font = parseFontFamily(node.getAttribute('font-family'));
    const background = parseBackgroundColor(node.getAttribute('background-color'));
    const lineHeight = parseLineHeight(node.getAttribute('line-height'));
    const pageBreak = parsePageBreak(node.getAttribute('page-break-before'));

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
                    if (font !== undefined) styledText.font = font;
                    if (background !== undefined) styledText.background = background;
                    if (lineHeight !== undefined) styledText.lineHeight = lineHeight;
                    
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
        // No children - self-closing block becomes newline character
        // <fo:block/> → "\n" (used for line breaks within parent block)
        textContent = '\n';
    }
    
    // Check for border/padding properties
    // Parse shorthand border attribute first (e.g., "2px solid black")
    const borderShorthand = parseBorderShorthand(node.getAttribute('border'));
    
    // Individual attributes override shorthand
    const borderStyle = node.getAttribute('border-style') || borderShorthand.style;
    const borderWidth = parseBorderWidth(node.getAttribute('border-width')) || borderShorthand.width;
    const borderColor = parseColor(node.getAttribute('border-color')) || borderShorthand.color;
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
        
        // Add layout for border styling if any border attributes are specified
        if (hasBorderAttributes) {
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
        
        // Apply page break if specified
        if (pageBreak !== undefined) {
            tableStructure.pageBreak = pageBreak;
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
    if (font !== undefined) result.font = font;
    if (background !== undefined) result.background = background;
    if (lineHeight !== undefined) result.lineHeight = lineHeight;
    if (margin !== undefined) result.margin = margin;
    if (pageBreak !== undefined) result.pageBreak = pageBreak;

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
        parseFontWeight,
        parseFontStyle,
        parseTextDecoration,
        parseFontSize,
        parseColor,
        parseAlignment,
        parseFontFamily,
        parseBackgroundColor,
        parseLineHeight,
        parsePageBreak,
        parseNumericValue,
        parseBorderWidth,
        parseBorderShorthand,
        parsePadding,
        parseMargin,
        hasBorder
    };
}
if (typeof window !== 'undefined') {
    window.BlockConverter = { 
        convertBlock,
        convertInline,
        parseFontWeight,
        parseFontStyle,
        parseTextDecoration,
        parseFontSize,
        parseColor,
        parseAlignment,
        parseFontFamily,
        parseBackgroundColor,
        parseLineHeight,
        parsePageBreak,
        parseNumericValue,
        parseBorderWidth,
        parseBorderShorthand,
        parsePadding,
        parseMargin,
        hasBorder
    };
}

