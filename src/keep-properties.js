/**
 * Keep Properties Module
 * 
 * Handles XSL-FO keep-together and keep-with-previous attributes.
 * These are universal attributes that work on blocks, tables, and other elements.
 * 
 * - keep-together.within-page="always" → adds unbreakable: true
 * - keep-with-previous.within-page="always" → wraps element with previous in stack
 */

/**
 * Checks if a node has keep-together.within-page="always"
 * @param {Element} node - DOM element
 * @returns {boolean} True if keep-together is set
 */
function hasKeepTogether(node) {
    if (!node || !node.getAttribute) return false;
    const keepTogether = node.getAttribute('keep-together.within-page');
    return keepTogether === 'always';
}

/**
 * Checks if a node has keep-with-previous.within-page="always"
 * @param {Element} node - DOM element
 * @returns {boolean} True if keep-with-previous is set
 */
function hasKeepWithPrevious(node) {
    if (!node || !node.getAttribute) return false;
    const keepWithPrevious = node.getAttribute('keep-with-previous.within-page');
    return keepWithPrevious === 'always';
}

/**
 * Applies keep-together property to a PDFMake object
 * If the XSL-FO node has keep-together.within-page="always",
 * adds unbreakable: true to the PDFMake object.
 * 
 * @param {Element} xslfoNode - The XSL-FO DOM element
 * @param {Object} pdfMakeObj - The PDFMake object to modify
 * @returns {Object} The modified PDFMake object
 */
function applyKeepTogether(xslfoNode, pdfMakeObj) {
    if (hasKeepTogether(xslfoNode)) {
        pdfMakeObj.unbreakable = true;
    }
    return pdfMakeObj;
}

/**
 * Marks an element with metadata if it has keep-with-previous
 * This is used during conversion to track which elements need wrapping
 * 
 * @param {Element} xslfoNode - The XSL-FO DOM element
 * @param {Object} pdfMakeObj - The PDFMake object
 * @returns {Object} The PDFMake object with metadata if needed
 */
function markKeepWithPrevious(xslfoNode, pdfMakeObj) {
    if (hasKeepWithPrevious(xslfoNode)) {
        // Add a temporary marker that will be processed later
        pdfMakeObj._keepWithPrevious = true;
    }
    return pdfMakeObj;
}

/**
 * Post-processes a content array to wrap elements with keep-with-previous
 * with their previous siblings in stacks.
 * 
 * This should be called after all content has been converted.
 * 
 * @param {Array} content - Array of PDFMake content elements
 * @returns {Array} Processed content array with stacks
 */
function processKeepWithPrevious(content) {
    if (!Array.isArray(content) || content.length === 0) {
        return content;
    }
    
    const result = [];
    let i = 0;
    
    while (i < content.length) {
        const current = content[i];
        
        // Check if current element has keep-with-previous marker
        if (current && current._keepWithPrevious) {
            // Remove the marker
            delete current._keepWithPrevious;
            
            // If there's no previous element, just add current as-is
            if (result.length === 0) {
                result.push(current);
                i++;
                continue;
            }
            
            // Get the previous element (last item in result)
            const previous = result.pop();
            
            // Create a stack to wrap them
            const stackElements = [];
            
            // If previous is already a stack with _keepWithPrevious marker,
            // extend it instead of nesting
            if (previous.stack && previous._extendableStack) {
                stackElements.push(...previous.stack);
                delete previous._extendableStack;
            } else {
                stackElements.push(previous);
            }
            
            stackElements.push(current);
            
            // Look ahead to see if next elements also have keep-with-previous
            let j = i + 1;
            while (j < content.length && content[j] && content[j]._keepWithPrevious) {
                const next = content[j];
                delete next._keepWithPrevious;
                stackElements.push(next);
                j++;
            }
            
            // Create the stack
            const stack = {
                stack: stackElements,
                unbreakable: true,
                _extendableStack: true  // Mark as extendable for future iterations
            };
            
            result.push(stack);
            
            // Move index forward
            i = j;
        } else {
            result.push(current);
            i++;
        }
    }
    
    // Clean up any remaining _extendableStack markers
    result.forEach(item => {
        if (item && item._extendableStack) {
            delete item._extendableStack;
        }
    });
    
    return result;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        hasKeepTogether,
        hasKeepWithPrevious,
        applyKeepTogether,
        markKeepWithPrevious,
        processKeepWithPrevious
    };
}

if (typeof window !== 'undefined') {
    window.KeepProperties = {
        hasKeepTogether,
        hasKeepWithPrevious,
        applyKeepTogether,
        markKeepWithPrevious,
        processKeepWithPrevious
    };
}

