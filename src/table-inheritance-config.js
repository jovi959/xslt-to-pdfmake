/**
 * Table Inheritance Configuration
 * 
 * Defines which attributes table elements can pass to their children.
 */

const TABLE_INHERITANCE_CONFIG = [
    {
        tag: "table-cell",
        inheriters: ["block", "inline"],
        inheritable_attributes: [
            "color",
            "text-align",
            "font-size",
            "font-family"
        ]
    }
];

/**
 * Get the table inheritance configuration
 * @returns {Array} Table inheritance configuration
 */
function getTableInheritanceConfig() {
    return TABLE_INHERITANCE_CONFIG;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TABLE_INHERITANCE_CONFIG,
        getTableInheritanceConfig
    };
}

if (typeof window !== 'undefined') {
    window.TableInheritanceConfig = {
        TABLE_INHERITANCE_CONFIG,
        getTableInheritanceConfig
    };
}

