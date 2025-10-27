/**
 * Block Inheritance Configuration
 * 
 * Defines inheritance rules specifically for XSL-FO block elements.
 * This configuration is used by the generic inheritance preprocessor.
 */

/**
 * Default inheritance configuration for XSL-FO blocks
 * 
 * Blocks can pass inheritable attributes to:
 * - Child blocks (<fo:block>)
 * - Inline elements (<fo:inline>)
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
    {
        tag: "block",
        inheriters: ["block", "inline"],
        inheritable_attributes: [
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
        ]
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
        BLOCK_INHERITANCE_CONFIG,
        getBlockInheritanceConfig,
        getCustomBlockConfig,
        getMinimalBlockConfig
    };
}

if (typeof window !== 'undefined') {
    window.BlockInheritanceConfig = {
        BLOCK_INHERITANCE_CONFIG,
        getBlockInheritanceConfig,
        getCustomBlockConfig,
        getMinimalBlockConfig
    };
}

