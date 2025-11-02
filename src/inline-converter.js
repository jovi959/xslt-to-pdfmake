/**
 * Inline Converter Module
 * 
 * Converts XSL-FO <fo:inline> elements to PDFMake inline content definitions.
 * This converter can handle inline elements both standalone and within blocks.
 */

/**
 * Get dependencies - lazy load to avoid circular dependency issues
 */
let _cachedDeps = null;

function _getDeps() {
    if (_cachedDeps) return _cachedDeps;
    
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    let parseFontWeight, parseFontStyle, parseTextDecoration, parseFontSize, parseColor;
    let parseAlignment, parseFontFamily, parseBackgroundColor, parseLineHeight;
    let WhitespaceUtils;
    
    if (isBrowser) {
        // Browser environment - access via window.BlockConverter
        if (window.BlockConverter) {
            parseFontWeight = window.BlockConverter.parseFontWeight;
            parseFontStyle = window.BlockConverter.parseFontStyle;
            parseTextDecoration = window.BlockConverter.parseTextDecoration;
            parseFontSize = window.BlockConverter.parseFontSize;
            parseColor = window.BlockConverter.parseColor;
            parseAlignment = window.BlockConverter.parseAlignment;
            parseFontFamily = window.BlockConverter.parseFontFamily;
            parseBackgroundColor = window.BlockConverter.parseBackgroundColor;
            parseLineHeight = window.BlockConverter.parseLineHeight;
        }
        WhitespaceUtils = window.WhitespaceUtils;
    } else if (typeof require === 'function') {
        // Node.js environment - require returns the exported object
        // Use lazy require to avoid circular dependency issues
        const BlockConverter = require('./block-converter.js');
        parseFontWeight = BlockConverter.parseFontWeight;
        parseFontStyle = BlockConverter.parseFontStyle;
        parseTextDecoration = BlockConverter.parseTextDecoration;
        parseFontSize = BlockConverter.parseFontSize;
        parseColor = BlockConverter.parseColor;
        parseAlignment = BlockConverter.parseAlignment;
        parseFontFamily = BlockConverter.parseFontFamily;
        parseBackgroundColor = BlockConverter.parseBackgroundColor;
        parseLineHeight = BlockConverter.parseLineHeight;
        
        WhitespaceUtils = require('./whitespace-utils.js');
    }
    
    _cachedDeps = { 
        parseFontWeight, parseFontStyle, parseTextDecoration, parseFontSize, 
        parseColor, parseAlignment, parseFontFamily, parseBackgroundColor, 
        parseLineHeight, WhitespaceUtils
    };
    
    return _cachedDeps;
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

    // Get dependencies (lazy loaded to avoid circular dependency)
    const deps = _getDeps();
    
    // Apply HTML-like whitespace normalization (all 3 steps in one call)
    // 1. Normalize whitespace (newlines → spaces, collapse multiple)
    // 2. Trim edge spaces
    // 3. Insert spaces between consecutive inline elements
    if (deps.WhitespaceUtils) {
        children = deps.WhitespaceUtils.normalizeChildren(children);
    }

    // Extract and convert attributes using BlockConverter utility functions
    const bold = deps.parseFontWeight ? deps.parseFontWeight(node.getAttribute('font-weight')) : undefined;
    const italics = deps.parseFontStyle ? deps.parseFontStyle(node.getAttribute('font-style')) : undefined;
    const decoration = deps.parseTextDecoration ? deps.parseTextDecoration(node.getAttribute('text-decoration')) : undefined;
    const fontSize = deps.parseFontSize ? deps.parseFontSize(node.getAttribute('font-size')) : undefined;
    const color = deps.parseColor ? deps.parseColor(node.getAttribute('color')) : undefined;
    const alignment = deps.parseAlignment ? deps.parseAlignment(node.getAttribute('text-align')) : undefined;
    const font = deps.parseFontFamily ? deps.parseFontFamily(node.getAttribute('font-family')) : undefined;
    const background = deps.parseBackgroundColor ? deps.parseBackgroundColor(node.getAttribute('background-color')) : undefined;
    const lineHeight = deps.parseLineHeight ? deps.parseLineHeight(node.getAttribute('line-height')) : undefined;

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

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        convertInline
    };
}
if (typeof window !== 'undefined') {
    window.InlineConverter = { 
        convertInline
    };
}

