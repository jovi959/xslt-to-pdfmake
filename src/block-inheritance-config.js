/**
 * Block Inheritance Configuration
 * 
 * Defines inheritance rules specifically for XSL-FO block elements.
 * This configuration is used by the generic inheritance preprocessor.
 */

/**
 * Common inheritable text formatting attributes
 * These attributes are shared across all inheritance configurations
 */
const INHERITABLE_TEXT_ATTRIBUTES = [
    "color",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "background-color",
    "text-align",
    "text-decoration",
    "line-height",
    "text-indent",
    "letter-spacing",
    "word-spacing"
];

/**
 * Default inheritance configuration for XSL-FO blocks and lists
 * 
 * Inheritance chain for lists:
 * 1. block → block, inline, list-block
 * 2. list-block → list-item
 * 3. list-item → list-item-label, list-item-body
 * 4. list-item-label → block, inline
 * 5. list-item-body → block, inline
 * 
 * This allows attributes from an outer block (e.g., font-size="10pt")
 * to flow down through the entire list structure to reach inner blocks.
 * 
 * Inheritable attributes include common text formatting properties:
 * - color: Text color
 * - font-family: Font family name
 * - font-size: Font size (with units)
 * - font-weight: Font weight (normal, bold, etc.)
 * - font-style: Font style (normal, italic, etc.)
 * - background-color: Background color
 * - text-align: Text alignment
 * - text-decoration: Text decoration (underline, line-through, etc.)
 * - line-height: Line height
 * - text-indent: Text indentation
 * - letter-spacing: Space between letters
 * - word-spacing: Space between words
 */
const BLOCK_INHERITANCE_CONFIG = [
    // Block can pass attributes to blocks, inlines, and list-blocks
    {
        tag: "block",
        inheriters: ["block", "inline", "list-block"],
        inheritable_attributes: INHERITABLE_TEXT_ATTRIBUTES
    },
    // List-block can pass attributes to list items
    {
        tag: "list-block",
        inheriters: ["list-item"],
        inheritable_attributes: INHERITABLE_TEXT_ATTRIBUTES
    },
    // List-item can pass attributes to label and body
    {
        tag: "list-item",
        inheriters: ["list-item-label", "list-item-body"],
        inheritable_attributes: INHERITABLE_TEXT_ATTRIBUTES
    },
    // List-item-label can pass attributes to blocks and inlines inside it
    {
        tag: "list-item-label",
        inheriters: ["block", "inline"],
        inheritable_attributes: INHERITABLE_TEXT_ATTRIBUTES
    },
    // List-item-body can pass attributes to blocks and inlines inside it
    {
        tag: "list-item-body",
        inheriters: ["block", "inline"],
        inheritable_attributes: INHERITABLE_TEXT_ATTRIBUTES
    }
];

/**
 * Get the default block inheritance configuration
 * @returns {Array} Inheritance configuration array
 */
function getBlockInheritanceConfig() {
    return BLOCK_INHERITANCE_CONFIG;
}

/**
 * Get a custom block inheritance configuration with specific attributes
 * @param {Array<string>} attributes - Array of attribute names to inherit
 * @returns {Array} Custom inheritance configuration
 */
function getCustomBlockConfig(attributes) {
    return [{
        tag: "block",
        inheriters: ["block", "inline"],
        inheritable_attributes: attributes || []
    }];
}

/**
 * Get minimal block inheritance config (most common attributes only)
 * @returns {Array} Minimal inheritance configuration
 */
function getMinimalBlockConfig() {
    return [{
        tag: "block",
        inheriters: ["block", "inline"],
        inheritable_attributes: [
            "color",
            "font-family",
            "font-size",
            "font-weight",
            "font-style"
        ]
    }];
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INHERITABLE_TEXT_ATTRIBUTES,
        BLOCK_INHERITANCE_CONFIG,
        getBlockInheritanceConfig,
        getCustomBlockConfig,
        getMinimalBlockConfig
    };
}

if (typeof window !== 'undefined') {
    window.BlockInheritanceConfig = {
        INHERITABLE_TEXT_ATTRIBUTES,
        BLOCK_INHERITANCE_CONFIG,
        getBlockInheritanceConfig,
        getCustomBlockConfig,
        getMinimalBlockConfig
    };
}

