/**
 * Recursive Traversal Module
 * 
 * Provides a generic traversal function that can work with any conversion logic.
 * The traversal logic is separated from the conversion logic, allowing different
 * converters (block, table, etc.) to be plugged in.
 */

/**
 * Recursively traverses an XML node and converts it using the provided converter function.
 * 
 * The converter function receives:
 * - node: The current DOM element
 * - children: Array of already-processed child content (recursive results)
 * - traverse: Reference to this function for manual child processing if needed
 * 
 * @param {Element|Node} node - The XML/DOM node to traverse
 * @param {Function} converterFn - Function that converts a node to PDFMake format
 *                                 Signature: (node, children, traverse) => pdfmakeObject
 * @returns {any} The converted PDFMake content
 */
function traverse(node, converterFn) {
    if (!node) {
        return null;
    }

    // Handle text nodes
    if (node.nodeType === 3) { // Node.TEXT_NODE
        const text = node.textContent;
        
        // Filter out whitespace-only nodes (XML formatting like newlines/indentation)
        if (text === '' || /^\s*$/.test(text)) {
            return null;
        }
        
        // For text nodes with actual content, we'll return them as-is
        // Trimming will be handled by the parent converter based on position
        return text;
    }

    // Handle element nodes
    if (node.nodeType === 1) { // Node.ELEMENT_NODE
        // First, recursively process all children
        const processedChildren = [];
        
        if (node.childNodes && node.childNodes.length > 0) {
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                const processed = traverse(child, converterFn);
                
                if (processed !== null && processed !== undefined) {
                    processedChildren.push(processed);
                }
            }
        }

        // Call the converter function with the node and its processed children
        return converterFn(node, processedChildren, traverse);
    }

    return null;
}

/**
 * Flattens an array of content, merging adjacent strings
 * This helps clean up the output structure
 * 
 * @param {Array} content - Array of content items (strings, objects, arrays)
 * @returns {Array} Flattened and merged content
 */
function flattenContent(content) {
    if (!Array.isArray(content)) {
        return content;
    }

    const result = [];
    let currentText = '';

    for (const item of content) {
        if (typeof item === 'string') {
            currentText += item;
        } else {
            if (currentText) {
                result.push(currentText);
                currentText = '';
            }
            result.push(item);
        }
    }

    if (currentText) {
        result.push(currentText);
    }

    return result.length === 1 ? result[0] : result;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        traverse,
        flattenContent
    };
}
if (typeof window !== 'undefined') {
    window.RecursiveTraversal = { 
        traverse,
        flattenContent
    };
}

