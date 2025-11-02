/**
 * Block Converter Module
 * 
 * Converts XSL-FO <fo:block> elements to PDFMake text/content definitions.
 * This converter is designed to be plugged into the recursive traversal function.
 */

/**
 * Get dependencies - load keep properties and inline converter modules
 */
const _blockDeps = (function() {
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    let KeepProperties, InlineConverter;
    
    if (isBrowser) {
        KeepProperties = window.KeepProperties;
        InlineConverter = window.InlineConverter;
    } else if (typeof require === 'function') {
        KeepProperties = require('./keep-properties.js');
        InlineConverter = require('./inline-converter.js');
    }
    
    return { KeepProperties, InlineConverter };
})();

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
 * Normalizes named colors to lowercase (PDFMake requirement)
 * @param {string} color - CSS color value
 * @returns {string|undefined} Color value, undefined if not specified
 */
function parseColor(color) {
    if (!color) return undefined;
    
    // If it's a hex color (starts with #), return as-is (case doesn't matter for hex)
    if (color.startsWith('#')) {
        return color;
    }
    
    // For named colors, PDFMake requires lowercase (e.g., "red" not "Red")
    return color.toLowerCase();
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
 * Parses line-height attribute and converts to PDFMake lineHeight multiplier
 * 
 * PDFMake uses lineHeight as a multiplier of fontSize:
 * - Unitless values (e.g., "1.5") are used directly as multipliers
 * - Values with units (e.g., "3pt", "12px") are converted to points, then divided by fontSize
 * 
 * @param {string} lineHeight - Line height value (e.g., "1.5", "3pt", "12px")
 * @param {number} fontSize - Font size in points (default: 10 if not specified)
 * @returns {number|undefined} Line height multiplier or undefined
 */
function parseLineHeight(lineHeight, fontSize = 10) {
    if (!lineHeight) return undefined;
    
    // If it's a unitless number, return as-is (it's already a multiplier)
    if (/^\d+(\.\d+)?$/.test(lineHeight)) {
        return parseFloat(lineHeight);
    }
    
    // Parse value with unit
    const match = lineHeight.match(/^([\d.]+)(pt|px|em|rem)?$/);
    if (!match) return undefined;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    // Convert to points based on unit
    let valueInPoints;
    switch (unit) {
        case 'pt':
            valueInPoints = value;
            break;
        case 'px':
            valueInPoints = value * 0.75; // 1px ≈ 0.75pt
            break;
        case 'em':
        case 'rem':
            valueInPoints = value * fontSize; // em/rem relative to fontSize
            break;
        default:
            valueInPoints = value;
    }
    
    // Convert to multiplier by dividing by fontSize
    return valueInPoints / fontSize;
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
 * Parses individual border properties for all sides
 * @param {Element} node - The fo:block DOM element
 * @returns {Object} Object with top, bottom, left, right border properties
 */
function parseIndividualBorders(node) {
    // Parse shorthand first (applies to all sides)
    const borderShorthand = parseBorderShorthand(node.getAttribute('border'));
    
    // Helper to determine if a side has any border definition
    function hasBorderDef(width, color, style) {
        return width !== undefined || color !== undefined || style !== undefined;
    }
    
    // If shorthand has any properties, apply default width if not specified
    const shorthandHasBorder = hasBorderDef(borderShorthand.width, borderShorthand.color, borderShorthand.style);
    const defaultWidth = shorthandHasBorder && borderShorthand.width === undefined ? 0.5 : borderShorthand.width;
    
    // Individual side properties
    const result = {
        top: {
            width: defaultWidth,
            color: borderShorthand.color || '#000000',
            style: borderShorthand.style || 'solid'
        },
        bottom: {
            width: defaultWidth,
            color: borderShorthand.color || '#000000',
            style: borderShorthand.style || 'solid'
        },
        left: {
            width: defaultWidth,
            color: borderShorthand.color || '#000000',
            style: borderShorthand.style || 'solid'
        },
        right: {
            width: defaultWidth,
            color: borderShorthand.color || '#000000',
            style: borderShorthand.style || 'solid'
        }
    };
    
    // Parse general border properties (override shorthand)
    const borderWidth = node.getAttribute('border-width');
    const borderColor = node.getAttribute('border-color');
    const borderStyle = node.getAttribute('border-style');
    
    // Check if general border properties exist (for default width logic)
    const hasGeneralBorder = borderWidth || borderColor || borderStyle;
    
    if (borderWidth) {
        const width = parseNumericValue(borderWidth);
        result.top.width = result.bottom.width = result.left.width = result.right.width = width;
    } else if (hasGeneralBorder && result.top.width === undefined) {
        // Apply default width if general border props exist but no width specified
        result.top.width = result.bottom.width = result.left.width = result.right.width = 0.5;
    }
    
    if (borderColor) {
        const color = parseColor(borderColor);
        result.top.color = result.bottom.color = result.left.color = result.right.color = color;
    }
    if (borderStyle) {
        result.top.style = result.bottom.style = result.left.style = result.right.style = borderStyle;
    }
    
    // Parse individual side shorthand (border-top="...", border-bottom="...", etc.)
    // These override general properties but are overridden by individual width/color/style
    const topShorthand = parseBorderShorthand(node.getAttribute('border-top'));
    const bottomShorthand = parseBorderShorthand(node.getAttribute('border-bottom'));
    const leftShorthand = parseBorderShorthand(node.getAttribute('border-left'));
    const rightShorthand = parseBorderShorthand(node.getAttribute('border-right'));
    
    // Apply top shorthand
    if (topShorthand.width !== undefined) result.top.width = topShorthand.width;
    else if ((topShorthand.color || topShorthand.style) && result.top.width === undefined) result.top.width = 0.5;
    if (topShorthand.color) result.top.color = topShorthand.color;
    if (topShorthand.style) result.top.style = topShorthand.style;
    
    // Apply bottom shorthand
    if (bottomShorthand.width !== undefined) result.bottom.width = bottomShorthand.width;
    else if ((bottomShorthand.color || bottomShorthand.style) && result.bottom.width === undefined) result.bottom.width = 0.5;
    if (bottomShorthand.color) result.bottom.color = bottomShorthand.color;
    if (bottomShorthand.style) result.bottom.style = bottomShorthand.style;
    
    // Apply left shorthand
    if (leftShorthand.width !== undefined) result.left.width = leftShorthand.width;
    else if ((leftShorthand.color || leftShorthand.style) && result.left.width === undefined) result.left.width = 0.5;
    if (leftShorthand.color) result.left.color = leftShorthand.color;
    if (leftShorthand.style) result.left.style = leftShorthand.style;
    
    // Apply right shorthand
    if (rightShorthand.width !== undefined) result.right.width = rightShorthand.width;
    else if ((rightShorthand.color || rightShorthand.style) && result.right.width === undefined) result.right.width = 0.5;
    if (rightShorthand.color) result.right.color = rightShorthand.color;
    if (rightShorthand.style) result.right.style = rightShorthand.style;
    
    // Parse individual side properties (highest priority - override everything including shorthand)
    // Top
    const topWidth = node.getAttribute('border-top-width');
    const topColor = node.getAttribute('border-top-color');
    const topStyle = node.getAttribute('border-top-style');
    const hasTopBorder = topWidth || topColor || topStyle;
    
    if (topWidth) result.top.width = parseNumericValue(topWidth);
    else if (hasTopBorder && result.top.width === undefined) result.top.width = 0.5;
    
    if (topColor) result.top.color = parseColor(topColor);
    if (topStyle) result.top.style = topStyle;
    
    // Bottom
    const bottomWidth = node.getAttribute('border-bottom-width');
    const bottomColor = node.getAttribute('border-bottom-color');
    const bottomStyle = node.getAttribute('border-bottom-style');
    const hasBottomBorder = bottomWidth || bottomColor || bottomStyle;
    
    if (bottomWidth) result.bottom.width = parseNumericValue(bottomWidth);
    else if (hasBottomBorder && result.bottom.width === undefined) result.bottom.width = 0.5;
    
    if (bottomColor) result.bottom.color = parseColor(bottomColor);
    if (bottomStyle) result.bottom.style = bottomStyle;
    
    // Left
    const leftWidth = node.getAttribute('border-left-width');
    const leftColor = node.getAttribute('border-left-color');
    const leftStyle = node.getAttribute('border-left-style');
    const hasLeftBorder = leftWidth || leftColor || leftStyle;
    
    if (leftWidth) result.left.width = parseNumericValue(leftWidth);
    else if (hasLeftBorder && result.left.width === undefined) result.left.width = 0.5;
    
    if (leftColor) result.left.color = parseColor(leftColor);
    if (leftStyle) result.left.style = leftStyle;
    
    // Right
    const rightWidth = node.getAttribute('border-right-width');
    const rightColor = node.getAttribute('border-right-color');
    const rightStyle = node.getAttribute('border-right-style');
    const hasRightBorder = rightWidth || rightColor || rightStyle;
    
    if (rightWidth) result.right.width = parseNumericValue(rightWidth);
    else if (hasRightBorder && result.right.width === undefined) result.right.width = 0.5;
    
    if (rightColor) result.right.color = parseColor(rightColor);
    if (rightStyle) result.right.style = rightStyle;
    
    return result;
}

/**
 * Checks if a block has border properties (including individual sides)
 * @param {Element} node - The fo:block DOM element
 * @returns {boolean} true if block has border properties
 */
function hasBorder(node) {
    return !!(node.getAttribute('border') ||
              node.getAttribute('border-style') || 
              node.getAttribute('border-width') || 
              node.getAttribute('border-color') ||
              node.getAttribute('border-top') ||
              node.getAttribute('border-top-style') ||
              node.getAttribute('border-top-width') ||
              node.getAttribute('border-top-color') ||
              node.getAttribute('border-bottom') ||
              node.getAttribute('border-bottom-style') ||
              node.getAttribute('border-bottom-width') ||
              node.getAttribute('border-bottom-color') ||
              node.getAttribute('border-left') ||
              node.getAttribute('border-left-style') ||
              node.getAttribute('border-left-width') ||
              node.getAttribute('border-left-color') ||
              node.getAttribute('border-right') ||
              node.getAttribute('border-right-style') ||
              node.getAttribute('border-right-width') ||
              node.getAttribute('border-right-color') ||
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
        if (node.nodeName === 'fo:inline' && _blockDeps.InlineConverter) {
            return _blockDeps.InlineConverter.convertInline(node, children, traverse);
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
    // Parse line-height, passing fontSize for unit conversion (default to 10pt if no fontSize)
    const lineHeight = parseLineHeight(node.getAttribute('line-height'), fontSize || 10);
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
    const padding = parsePadding(node.getAttribute('padding'));
    const margin = parseMargin(node.getAttribute('margin'));
    
    // If block has borders or padding, convert to table
    if (hasBorder(node)) {
        // Parse individual border properties for each side
        const borders = parseIndividualBorders(node);
        
        // Build the cell content with text styling
        const cellContent = { text: textContent };
        if (bold !== undefined) cellContent.bold = bold;
        if (italics !== undefined) cellContent.italics = italics;
        if (decoration !== undefined) cellContent.decoration = decoration;
        if (fontSize !== undefined) cellContent.fontSize = fontSize;
        if (color !== undefined) cellContent.color = color;
        if (alignment !== undefined) cellContent.alignment = alignment;
        
        // Add background color (fillColor) to cell
        if (background !== undefined) {
            cellContent.fillColor = background;
        }
        
        // Convert padding to margin inside the cell
        if (padding !== undefined) {
            cellContent.margin = padding;
        }
        
        // Determine which borders are actually present
        const hasTopBorder = borders.top.width !== undefined && borders.top.width > 0;
        const hasBottomBorder = borders.bottom.width !== undefined && borders.bottom.width > 0;
        const hasLeftBorder = borders.left.width !== undefined && borders.left.width > 0;
        const hasRightBorder = borders.right.width !== undefined && borders.right.width > 0;
        
        // Set border array: [left, top, right, bottom]
        cellContent.border = [hasLeftBorder, hasTopBorder, hasRightBorder, hasBottomBorder];
        
        // Build the table structure
        const tableStructure = {
            table: {
                widths: ['*'],
                body: [[cellContent]]
            }
        };
        
        // Add layout with individual border styling
        // For a single-cell table: i=0 is top line, i=1 is bottom line (horizontal)
        //                         i=0 is left line, i=1 is right line (vertical)
        // If called without index (for backward compatibility), return top/left border
        tableStructure.layout = {
            hLineWidth: function(i, node) {
                // Backward compatibility: if no index provided, return top border
                if (i === undefined) {
                    return borders.top.width !== undefined ? borders.top.width : 0;
                }
                if (i === 0) {
                    // Top border
                    return borders.top.width !== undefined ? borders.top.width : 0;
                } else if (i === 1) {
                    // Bottom border
                    return borders.bottom.width !== undefined ? borders.bottom.width : 0;
                }
                return 0;
            },
            vLineWidth: function(i, node) {
                // Backward compatibility: if no index provided, return left border
                if (i === undefined) {
                    return borders.left.width !== undefined ? borders.left.width : 0;
                }
                if (i === 0) {
                    // Left border
                    return borders.left.width !== undefined ? borders.left.width : 0;
                } else if (i === 1) {
                    // Right border
                    return borders.right.width !== undefined ? borders.right.width : 0;
                }
                return 0;
            },
            hLineColor: function(i, node) {
                // Backward compatibility: if no index provided, return top border color
                if (i === undefined) {
                    return borders.top.color || '#000000';
                }
                if (i === 0) {
                    // Top border color
                    return borders.top.color || '#000000';
                } else if (i === 1) {
                    // Bottom border color
                    return borders.bottom.color || '#000000';
                }
                return '#000000';
            },
            vLineColor: function(i, node) {
                // Backward compatibility: if no index provided, return left border color
                if (i === undefined) {
                    return borders.left.color || '#000000';
                }
                if (i === 0) {
                    // Left border color
                    return borders.left.color || '#000000';
                } else if (i === 1) {
                    // Right border color
                    return borders.right.color || '#000000';
                }
                return '#000000';
            }
        };
        
        // Apply margin outside the table
        if (margin !== undefined) {
            tableStructure.margin = margin;
        }
        
        // Apply page break if specified
        if (pageBreak !== undefined) {
            tableStructure.pageBreak = pageBreak;
        }
        
        // Apply keep properties (keep-together and keep-with-previous)
        if (_blockDeps.KeepProperties) {
            _blockDeps.KeepProperties.applyKeepTogether(node, tableStructure);
            _blockDeps.KeepProperties.markKeepWithPrevious(node, tableStructure);
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

    // Apply keep properties (keep-together and keep-with-previous)
    if (_blockDeps.KeepProperties) {
        _blockDeps.KeepProperties.applyKeepTogether(node, result);
        _blockDeps.KeepProperties.markKeepWithPrevious(node, result);
    }

    // If result only has text property and it's a string, return just the string
    // BUT: Don't simplify if we have keep-with-previous marker
    if (Object.keys(result).length === 1 && typeof result.text === 'string' && !result._keepWithPrevious) {
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
        parseAlignment,
        parseFontFamily,
        parseBackgroundColor,
        parseLineHeight,
        parsePageBreak,
        parseNumericValue,
        parseBorderWidth,
        parseBorderShorthand,
        parseIndividualBorders,
        parsePadding,
        parseMargin,
        hasBorder
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
        parseAlignment,
        parseFontFamily,
        parseBackgroundColor,
        parseLineHeight,
        parsePageBreak,
        parseNumericValue,
        parseBorderWidth,
        parseBorderShorthand,
        parseIndividualBorders,
        parsePadding,
        parseMargin,
        hasBorder
    };
}

