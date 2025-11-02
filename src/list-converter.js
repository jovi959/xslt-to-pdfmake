/**
 * List Converter Module
 * Converts XSL-FO list elements to PDFMake list definitions
 */

/**
 * Trim edge spaces from children array (simple implementation)
 * @param {Array} children - Array of converted children
 * @returns {Array} Children with edge spaces trimmed
 */
function trimEdgeSpaces(children) {
    if (!children || children.length === 0) return children;
    
    const result = [...children];
    
    // Trim leading space from first text element
    if (result.length > 0 && typeof result[0] === 'string') {
        result[0] = result[0].replace(/^\s+/, '');
    } else if (result.length > 0 && result[0] && typeof result[0].text === 'string') {
        result[0].text = result[0].text.replace(/^\s+/, '');
    }
    
    // Trim trailing space from last text element
    const last = result.length - 1;
    if (last >= 0 && typeof result[last] === 'string') {
        result[last] = result[last].replace(/\s+$/, '');
    } else if (last >= 0 && result[last] && typeof result[last].text === 'string') {
        result[last].text = result[last].text.replace(/\s+$/, '');
    }
    
    return result;
}

/**
 * Convert XSL-FO list-block to PDFMake ul/ol
 * @param {Element} node - The fo:list-block element
 * @param {Array} children - Converted children (list items)
 * @param {Function} traverse - Recursive traversal function
 * @returns {Object} PDFMake list definition (ul or ol)
 */
function convertList(node, children, traverse) {
    // ⚠️ CRITICAL: Apply HTML-like whitespace normalization
    children = trimEdgeSpaces(children);
    
    // Get all fo:list-item elements
    // Handle both browser DOM (children) and custom XML parser (childNodes)
    const nodeChildren = node.children || node.childNodes || [];
    const listItems = Array.from(nodeChildren).filter(child => 
        child.nodeType === 1 && (child.nodeName === 'fo:list-item' || child.nodeName === 'list-item')
    );
    
    if (listItems.length === 0) {
        return null; // No list items, return null
    }
    
    // Check the first item's label to determine list type
    const firstItem = listItems[0];
    const isNumbered = isNumberedList(firstItem);
    
    // Extract list item bodies (the actual content)
    const items = listItems.map(item => extractListItemContent(item, traverse)).filter(i => i !== null);
    
    if (items.length === 0) {
        return null;
    }
    
    // Return ul or ol based on label type
    if (isNumbered) {
        return { ol: items };
    } else {
        return { ul: items };
    }
}

/**
 * Determine if a list is numbered by examining the label
 * @param {Element} listItem - The fo:list-item element
 * @returns {boolean} True if numbered list, false if bulleted
 */
function isNumberedList(listItem) {
    // Find the fo:list-item-label
    const children = listItem.children || listItem.childNodes || [];
    const label = Array.from(children).find(child =>
        child.nodeType === 1 && (child.nodeName === 'fo:list-item-label' || child.nodeName === 'list-item-label')
    );
    
    if (!label) {
        return false; // Default to bullet if no label
    }
    
    // Get the text content of the label
    const labelText = label.textContent.trim();
    
    // Check if it's a number followed by a dot or parenthesis
    // Examples: "1.", "1)", "2.", "10.", etc.
    return /^\d+[.)]/.test(labelText);
}

/**
 * Extract the content from fo:list-item-body
 * @param {Element} listItem - The fo:list-item element
 * @param {Function} traverse - Recursive traversal function
 * @returns {*} Converted content (string or object with styling)
 */
function extractListItemContent(listItem, traverse) {
    // Find the fo:list-item-body
    const itemChildren = listItem.children || listItem.childNodes || [];
    const body = Array.from(itemChildren).find(child =>
        child.nodeType === 1 && (child.nodeName === 'fo:list-item-body' || child.nodeName === 'list-item-body')
    );
    
    if (!body) {
        return null; // No body, skip this item
    }
    
    // Find the fo:block inside the body
    const bodyChildren = body.children || body.childNodes || [];
    const block = Array.from(bodyChildren).find(child =>
        child.nodeType === 1 && (child.nodeName === 'fo:block' || child.nodeName === 'block')
    );
    
    if (!block) {
        // No block, just get text content
        const text = body.textContent.trim();
        return text || null;
    }
    
    // Use block converter to handle the block content
    // This will handle styling, nested blocks, etc.
    const BlockConverter = typeof window !== 'undefined' 
        ? window.BlockConverter 
        : require('./block-converter.js');
    
    if (BlockConverter && BlockConverter.convertBlock) {
        const converted = traverse(block, BlockConverter.convertBlock);
        
        // If the result is a simple text object, extract just the text
        if (converted && typeof converted === 'object' && converted.text && !converted.stack) {
            return converted;
        }
        
        return converted;
    }
    
    // Fallback: just return text
    return block.textContent.trim() || null;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        convertList,
        isNumberedList,
        extractListItemContent
    };
}

if (typeof window !== 'undefined') {
    window.ListConverter = { 
        convertList,
        isNumberedList,
        extractListItemContent
    };
}

