/**
 * Default Styles Applier Module
 * 
 * Applies default styles from configuration to all PDFMake content objects.
 * Only adds properties that don't already exist (non-overriding behavior).
 */

/**
 * Default styles configuration (can be overridden)
 */
let DEFAULT_STYLES = {
    lineHeight: 1.2,
    fontSize: 10,
    color: '#000000'
};

/**
 * Set the default styles configuration
 * @param {Object} styles - The default styles object
 */
function setDefaultStyles(styles) {
    DEFAULT_STYLES = styles || {};
}

/**
 * Get the current default styles configuration
 * @returns {Object} The default styles object
 */
function getDefaultStyles() {
    return DEFAULT_STYLES;
}

/**
 * Check if an object is a content object that can have styles applied
 * @param {*} obj - The object to check
 * @returns {boolean} True if it's a content object
 */
function isContentObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    
    // Don't apply to arrays themselves, but check their contents
    if (Array.isArray(obj)) {
        return false;
    }
    
    // Don't apply to PDFMake document root properties
    const rootProperties = ['pageSize', 'pageOrientation', 'pageMargins', 'info', 
                           'header', 'footer', 'background', 'defaultStyle', 'styles'];
    
    // If it has text content or is a table/list/stack/columns structure, it's a content object
    const hasText = typeof obj.text !== 'undefined';
    const hasTable = obj.table !== undefined;
    const hasList = obj.ul !== undefined || obj.ol !== undefined;
    const hasStack = obj.stack !== undefined;
    const hasColumns = obj.columns !== undefined;
    
    return hasText || hasTable || hasList || hasStack || hasColumns;
}

/**
 * Apply default styles to a single content object
 * @param {Object} obj - The content object
 * @param {Object} defaultStyles - The default styles to apply
 */
function applyStylesToObject(obj, defaultStyles) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        return;
    }
    
    // Apply each default style property if it doesn't already exist
    for (const [key, value] of Object.entries(defaultStyles)) {
        if (obj[key] === undefined) {
            obj[key] = value;
        }
    }
}

/**
 * Recursively traverse and apply default styles to all content objects
 * @param {*} node - The current node in the document tree
 * @param {Object} defaultStyles - The default styles to apply
 * @param {Array} [parentArray] - Parent array if node is an array element
 * @param {number} [index] - Index in parent array
 * @param {boolean} [isInlineContent] - True if this is inside a text array (inline content)
 */
function traverseAndApplyStyles(node, defaultStyles, parentArray, index, isInlineContent) {
    // Handle null/undefined
    if (node == null) {
        return;
    }
    
    // Handle strings - only convert to objects if they're in the main content array, not inline content
    if (typeof node === 'string') {
        if (parentArray !== undefined && index !== undefined && !isInlineContent) {
            // Create an object with text and default styles
            const styledObject = { text: node, ...defaultStyles };
            parentArray[index] = styledObject;
        }
        return;
    }
    
    // Handle other primitive types (numbers, booleans)
    if (typeof node !== 'object') {
        return;
    }
    
    // Handle arrays - traverse each element
    if (Array.isArray(node)) {
        node.forEach((item, idx) => traverseAndApplyStyles(item, defaultStyles, node, idx, isInlineContent));
        return;
    }
    
    // It's an object - check if it's a content object
    if (isContentObject(node)) {
        applyStylesToObject(node, defaultStyles);
    }
    
    // Recursively traverse all properties
    // Special handling for common PDFMake structures
    if (node.content) {
        traverseAndApplyStyles(node.content, defaultStyles);
    }
    if (node.stack) {
        traverseAndApplyStyles(node.stack, defaultStyles);
    }
    if (node.columns) {
        traverseAndApplyStyles(node.columns, defaultStyles);
    }
    if (node.ul) {
        traverseAndApplyStyles(node.ul, defaultStyles);
    }
    if (node.ol) {
        traverseAndApplyStyles(node.ol, defaultStyles);
    }
    if (node.table && node.table.body) {
        traverseAndApplyStyles(node.table.body, defaultStyles);
    }
    if (node.text && Array.isArray(node.text)) {
        // Text can be an array of inline elements - mark as inline content so strings aren't converted
        node.text.forEach((item, idx) => traverseAndApplyStyles(item, defaultStyles, node.text, idx, true));
    }
    
    // Also check header and footer if present at document level
    if (node.header) {
        traverseAndApplyStyles(node.header, defaultStyles);
    }
    if (node.footer) {
        traverseAndApplyStyles(node.footer, defaultStyles);
    }
}

/**
 * Apply default styles to a PDFMake document definition
 * Uses PDFMake's defaultStyle property for global inheritance
 * @param {Object} docDefinition - The PDFMake document definition
 * @param {Object} [customStyles] - Optional custom default styles (overrides config)
 * @returns {Object} The modified document definition
 */
function applyDefaultStyles(docDefinition, customStyles) {
    if (!docDefinition) {
        return docDefinition;
    }
    
    const stylesToApply = customStyles || DEFAULT_STYLES;
    
    // Don't apply if styles are empty
    if (!stylesToApply || Object.keys(stylesToApply).length === 0) {
        return docDefinition;
    }
    
    // Ensure defaultStyle exists
    if (!docDefinition.defaultStyle) {
        docDefinition.defaultStyle = {};
    }
    
    // Merge user's default styles into the document's defaultStyle
    // Only add properties that don't already exist (non-overriding)
    for (const [key, value] of Object.entries(stylesToApply)) {
        if (docDefinition.defaultStyle[key] === undefined) {
            docDefinition.defaultStyle[key] = value;
        }
    }
    
    return docDefinition;
}

/**
 * Load default styles from JSON file (browser environment)
 * @param {string} [url] - URL to the JSON file (default: 'src/default-styles.json')
 * @returns {Promise<Object>} Promise that resolves to the styles object
 */
async function loadDefaultStylesFromJSON(url) {
    const jsonUrl = url || 'src/default-styles.json';
    
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            console.warn(`Failed to load default styles from ${jsonUrl}, using built-in defaults`);
            return DEFAULT_STYLES;
        }
        const styles = await response.json();
        setDefaultStyles(styles);
        return styles;
    } catch (error) {
        console.warn(`Error loading default styles: ${error.message}, using built-in defaults`);
        return DEFAULT_STYLES;
    }
}

/**
 * Load default styles from JSON file (Node.js environment)
 * @param {string} [filePath] - Path to the JSON file
 * @returns {Object} The styles object
 */
function loadDefaultStylesFromJSONSync(filePath) {
    if (typeof require === 'function') {
        try {
            const fs = require('fs');
            const path = require('path');
            const jsonPath = filePath || path.join(__dirname, 'default-styles.json');
            const data = fs.readFileSync(jsonPath, 'utf-8');
            const styles = JSON.parse(data);
            setDefaultStyles(styles);
            return styles;
        } catch (error) {
            console.warn(`Error loading default styles: ${error.message}, using built-in defaults`);
            return DEFAULT_STYLES;
        }
    }
    return DEFAULT_STYLES;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyDefaultStyles,
        setDefaultStyles,
        getDefaultStyles,
        loadDefaultStylesFromJSON,
        loadDefaultStylesFromJSONSync,
        traverseAndApplyStyles,
        isContentObject,
        applyStylesToObject
    };
}

if (typeof window !== 'undefined') {
    window.DefaultStylesApplier = {
        applyDefaultStyles,
        setDefaultStyles,
        getDefaultStyles,
        loadDefaultStylesFromJSON,
        traverseAndApplyStyles,
        isContentObject,
        applyStylesToObject
    };
}


