/**
 * Whitespace Normalization Utilities
 * 
 * Generic utilities for HTML-like whitespace normalization that can be applied
 * to any XML element (blocks, inlines, table cells, etc.)
 * 
 * Rules:
 * 1. Newlines are converted to spaces
 * 2. Multiple consecutive whitespace characters collapse to a single space
 * 3. Leading/trailing whitespace at block/element edges is trimmed
 * 4. Single spaces between elements are preserved
 */

/**
 * Normalizes whitespace in a text string (HTML-like behavior)
 * - Converts newlines to spaces
 * - Collapses multiple consecutive whitespace to single space
 * - Does NOT trim edges (that's handled separately)
 * 
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeWhitespace(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    // Replace newlines and tabs with spaces
    // Then collapse multiple consecutive spaces to single space
    return text.replace(/[\n\r\t]+/g, ' ').replace(/[ ]{2,}/g, ' ');
}

/**
 * Trims edge spaces from an array of children
 * - Trims leading spaces from the first text child
 * - Trims trailing spaces from the last text child
 * - Preserves all internal spaces between siblings
 * 
 * @param {Array} children - Array of text strings and/or objects
 * @returns {Array} Children with edge spaces trimmed
 */
function trimEdgeSpaces(children) {
    if (!children || children.length === 0) {
        return children;
    }
    
    const trimmed = [...children];
    
    // Trim leading space from first text child
    for (let i = 0; i < trimmed.length; i++) {
        if (typeof trimmed[i] === 'string') {
            trimmed[i] = trimmed[i].replace(/^\s+/, '');
            // Remove if now empty
            if (trimmed[i] === '') {
                trimmed.splice(i, 1);
                i--;
            }
            break;
        }
    }
    
    // Trim trailing space from last text child
    for (let i = trimmed.length - 1; i >= 0; i--) {
        if (typeof trimmed[i] === 'string') {
            trimmed[i] = trimmed[i].replace(/\s+$/, '');
            // Remove if now empty
            if (trimmed[i] === '') {
                trimmed.splice(i, 1);
            }
            break;
        }
    }
    
    return trimmed;
}

/**
 * Inserts single space between adjacent sibling elements where whitespace existed
 * This handles cases like: <inline>A</inline> <inline>B</inline>
 * where the whitespace between them should become a single space in the array
 * 
 * @param {Array} children - Array of processed children
 * @param {Array} originalChildren - Original child nodes (before processing)
 * @returns {Array} Children with spaces between siblings
 */
function insertSpacesBetweenSiblings(children, originalChildren) {
    if (!children || children.length <= 1 || !originalChildren) {
        return children;
    }
    
    const result = [];
    
    for (let i = 0; i < children.length; i++) {
        result.push(children[i]);
        
        // Check if there should be a space before the next sibling
        if (i < children.length - 1) {
            // Look for whitespace text nodes between current and next element in original
            // If found, insert a single space
            const hasWhitespaceBetween = checkWhitespaceBetweenOriginalSiblings(
                originalChildren, 
                i, 
                i + 1
            );
            
            if (hasWhitespaceBetween) {
                result.push(' ');
            }
        }
    }
    
    return result;
}

/**
 * Helper to check if there was whitespace between original sibling nodes
 * @param {Array} originalChildren - Original child nodes
 * @param {number} idx1 - Index of first child
 * @param {number} idx2 - Index of second child  
 * @returns {boolean} True if whitespace exists between siblings
 */
function checkWhitespaceBetweenOriginalSiblings(originalChildren, idx1, idx2) {
    // For now, we'll use a simpler heuristic:
    // If both children are objects (not text), assume there was whitespace between them
    // This handles the common case of <inline>A</inline>\n  <inline>B</inline>
    return true; // Simplified: always insert space between element siblings
}

/**
 * Processes children array with full whitespace normalization
 * This is the main entry point for applying whitespace rules
 * 
 * @param {Array} children - Array of text strings and/or objects
 * @returns {Array} Fully normalized children
 */
function normalizeChildren(children) {
    if (!children || children.length === 0) {
        return children;
    }
    
    // Step 1: Normalize whitespace in all text strings (but preserve explicit newlines)
    const normalized = children.map(child => {
        if (typeof child === 'string') {
            // If the string is ONLY newlines (from self-closing blocks), preserve it
            if (/^[\n]+$/.test(child)) {
                return child;
            }
            return normalizeWhitespace(child);
        }
        return child;
    });
    
    // Step 2: Filter out empty strings (but keep newlines)
    const filtered = normalized.filter(child => {
        if (typeof child === 'string') {
            // Keep newlines and non-empty strings
            return child !== '' && (child.trim() !== '' || /^[\n]+$/.test(child));
        }
        return true;
    });
    
    // Step 3: Trim edge spaces (but don't trim newlines from edges)
    const edgeTrimmed = trimEdgeSpacesPreservingNewlines(filtered);
    
    // Step 4: Insert spaces between element siblings where needed
    const result = insertSpacesBetweenElements(edgeTrimmed);
    
    return result;
}

/**
 * Trims edge spaces but preserves newlines
 * @param {Array} children - Array of children
 * @returns {Array} Children with spaces trimmed but newlines preserved
 */
function trimEdgeSpacesPreservingNewlines(children) {
    if (!children || children.length === 0) {
        return children;
    }
    
    const trimmed = [...children];
    
    // Trim leading space from first text child (but not if it's just newlines)
    for (let i = 0; i < trimmed.length; i++) {
        if (typeof trimmed[i] === 'string') {
            // Don't trim if it's only newlines
            if (!/^[\n]+$/.test(trimmed[i])) {
                trimmed[i] = trimmed[i].replace(/^\s+/, '');
                if (trimmed[i] === '') {
                    trimmed.splice(i, 1);
                    i--;
                }
            }
            break;
        }
    }
    
    // Trim trailing space from last text child (but not if it's just newlines)
    for (let i = trimmed.length - 1; i >= 0; i--) {
        if (typeof trimmed[i] === 'string') {
            // Don't trim if it's only newlines
            if (!/^[\n]+$/.test(trimmed[i])) {
                trimmed[i] = trimmed[i].replace(/\s+$/, '');
                if (trimmed[i] === '') {
                    trimmed.splice(i, 1);
                }
            }
            break;
        }
    }
    
    return trimmed;
}

/**
 * Inserts single space between consecutive object elements (inlines)
 * @param {Array} children - Array of children
 * @returns {Array} Children with spaces between elements
 */
function insertSpacesBetweenElements(children) {
    if (!children || children.length <= 1) {
        return children;
    }
    
    const result = [];
    
    for (let i = 0; i < children.length; i++) {
        result.push(children[i]);
        
        // If current is object and next is also object, insert space
        if (i < children.length - 1) {
            const currentIsObject = typeof children[i] === 'object' && children[i] !== null;
            const nextIsObject = typeof children[i + 1] === 'object' && children[i + 1] !== null;
            
            if (currentIsObject && nextIsObject) {
                result.push(' ');
            }
        }
    }
    
    return result;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        normalizeWhitespace,
        trimEdgeSpaces,
        normalizeChildren,
        insertSpacesBetweenElements
    };
}

if (typeof window !== 'undefined') {
    window.WhitespaceUtils = {
        normalizeWhitespace,
        trimEdgeSpaces,
        normalizeChildren,
        insertSpacesBetweenElements
    };
}

