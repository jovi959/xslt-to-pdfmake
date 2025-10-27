/**
 * Generic Inheritance Preprocessor
 * 
 * This module provides a configurable inheritance system for XML elements.
 * It explicitly propagates inheritable attributes from parent elements to their
 * children based on configurable rules.
 * 
 * Each tag configuration defines:
 * - tag: The parent tag name (without namespace prefix)
 * - inheriters: Array of child tag names that can inherit from this parent
 * - inheritable_attributes: Array of attribute names that should be inherited
 * 
 * Example config:
 * [{
 *   tag: "block",
 *   inheriters: ["block", "inline"],
 *   inheritable_attributes: ["color", "font-family", "font-size"]
 * }]
 */

/**
 * Get DOMParser for current environment
 * @returns {DOMParser|null} DOMParser instance
 */
function getDOMParser() {
    // Browser environment
    if (typeof DOMParser !== 'undefined') {
        return new DOMParser();
    }
    
    // Node.js environment - use @xmldom/xmldom
    if (typeof module !== 'undefined' && module.exports) {
        try {
            const { DOMParser: NodeDOMParser } = require('@xmldom/xmldom');
            return new NodeDOMParser();
        } catch (e) {
            // @xmldom/xmldom not available, will use fallback
            console.warn('Warning: @xmldom/xmldom not available, falling back to SimpleXMLParser');
        }
    }
    
    return null;
}

/**
 * Get XMLSerializer for current environment
 * @returns {XMLSerializer|null} XMLSerializer instance
 */
function getXMLSerializer() {
    // Browser environment
    if (typeof XMLSerializer !== 'undefined') {
        return new XMLSerializer();
    }
    
    // Node.js environment - use @xmldom/xmldom
    if (typeof module !== 'undefined' && module.exports) {
        try {
            const { XMLSerializer: NodeXMLSerializer } = require('@xmldom/xmldom');
            return new NodeXMLSerializer();
        } catch (e) {
            // @xmldom/xmldom not available
            console.warn('Warning: @xmldom/xmldom not available');
        }
    }
    
    return null;
}

/**
 * Parse XML string to DOM
 * @param {string} xmlString - XML string to parse
 * @returns {Document|Element|null} Parsed XML document
 */
function parseXML(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') {
        return null;
    }

    const parser = getDOMParser();
    
    if (parser) {
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        // Check for parsing errors
        if (xmlDoc.getElementsByTagName) {
            const parserError = xmlDoc.getElementsByTagName('parsererror');
            if (parserError && parserError.length > 0) {
                console.error('XML parsing error:', parserError[0].textContent);
                return null;
            }
        }
        
        return xmlDoc;
    } else {
        // Fallback to SimpleXMLParser if available (test environment)
        if (typeof global !== 'undefined' && global.SimpleXMLParser) {
            const parser = new global.SimpleXMLParser();
            return parser.parse(xmlString);
        }
        // Last resort - return null
        return null;
    }
}

/**
 * Serialize DOM back to XML string
 * @param {Document|Element} xmlDoc - XML document or element
 * @returns {string} XML string
 */
function serializeXML(xmlDoc) {
    if (!xmlDoc) {
        return '';
    }

    const serializer = getXMLSerializer();
    
    if (serializer) {
        return serializer.serializeToString(xmlDoc);
    }
    
    // Fallback: For SimpleXMLParser nodes, manually build XML string
    if (xmlDoc.nodeName) {
        return simpleSerialize(xmlDoc);
    }
    
    return '';
}

/**
 * Simple XML serializer for SimpleXMLParser nodes
 * @param {Object} node - SimpleXMLParser node
 * @returns {string} XML string
 */
function simpleSerialize(node) {
    if (!node) return '';
    
    // Text node
    if (node.nodeType === 3) {
        return node.textContent || '';
    }
    
    // Element node
    if (node.nodeType === 1) {
        let xml = '<' + node.nodeName;
        
        // Add attributes
        if (node.attributes) {
            for (const [key, value] of Object.entries(node.attributes)) {
                // Escape attribute values
                const escapedValue = String(value).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                xml += ` ${key}="${escapedValue}"`;
            }
        }
        
        // Check if has children or text content
        const hasChildren = node.childNodes && node.childNodes.length > 0;
        const hasText = node.textContent && node.textContent.trim() !== '';
        
        if (hasChildren || hasText) {
            xml += '>';
            
            // Serialize children
            if (hasChildren) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    xml += simpleSerialize(node.childNodes[i]);
                }
            } else if (hasText) {
                // No childNodes, but has textContent - output it directly
                const escapedText = node.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                xml += escapedText;
            }
            
            xml += '</' + node.nodeName + '>';
        } else {
            xml += '/>';
        }
        
        return xml;
    }
    
    return '';
}

/**
 * Build inheritance map from configuration
 * @param {Array} config - Array of inheritance configuration objects
 * @returns {Map} Map of tag names to their inheritance rules
 */
function buildInheritanceMap(config) {
    const map = new Map();
    
    if (!config || !Array.isArray(config)) {
        return map;
    }
    
    for (const rule of config) {
        if (rule && rule.tag) {
            map.set(rule.tag, {
                inheriters: rule.inheriters || [],
                attributes: rule.inheritable_attributes || []
            });
        }
    }
    
    return map;
}

/**
 * Get tag name without namespace prefix
 * @param {string} fullTagName - Full tag name (e.g., "fo:block")
 * @returns {string} Tag name without prefix (e.g., "block")
 */
function getTagNameWithoutNamespace(fullTagName) {
    if (!fullTagName) return '';
    const parts = fullTagName.split(':');
    return parts.length > 1 ? parts[1] : parts[0];
}

/**
 * Check if element has attribute (works for both DOM and SimpleXMLParser)
 * @param {Element} element - Element to check
 * @param {string} attrName - Attribute name
 * @returns {boolean} True if attribute exists
 */
function hasAttribute(element, attrName) {
    if (element.hasAttribute) {
        return element.hasAttribute(attrName);
    }
    return element.attributes && element.attributes[attrName] !== undefined;
}

/**
 * Set attribute on element (works for both DOM and SimpleXMLParser)
 * @param {Element} element - Element to modify
 * @param {string} attrName - Attribute name
 * @param {string} attrValue - Attribute value
 */
function setAttribute(element, attrName, attrValue) {
    if (element.setAttribute) {
        element.setAttribute(attrName, attrValue);
    } else if (element.attributes) {
        element.attributes[attrName] = attrValue;
    }
}

/**
 * Get attribute from element (works for both DOM and SimpleXMLParser)
 * @param {Element} element - Element to read from
 * @param {string} attrName - Attribute name
 * @returns {string|null} Attribute value or null
 */
function getAttribute(element, attrName) {
    if (element.getAttribute) {
        return element.getAttribute(attrName);
    }
    return element.attributes ? element.attributes[attrName] : null;
}

/**
 * Process inheritance for a single element (DOM-based)
 * @param {Element} element - XML element to process
 * @param {Map} inheritanceMap - Map of inheritance rules
 * @param {Object} inheritedAttrs - Attributes inherited from ancestors
 */
function processElementDOM(element, inheritanceMap, inheritedAttrs = {}) {
    if (!element || element.nodeType !== 1) { // ELEMENT_NODE
        return;
    }
    
    const tagName = getTagNameWithoutNamespace(element.nodeName);
    const rule = inheritanceMap.get(tagName);
    
    // Apply inherited attributes to this element (if not already present)
    for (const [attrName, attrValue] of Object.entries(inheritedAttrs)) {
        if (!hasAttribute(element, attrName)) {
            setAttribute(element, attrName, attrValue);
        }
    }
    
    // Build attributes to pass to children
    // Start with inherited attributes and add/override with this element's inheritable attributes
    let attrsForChildren = { ...inheritedAttrs };
    
    if (rule) {
        // Add this element's inheritable attributes to the inheritance chain
        for (const attrName of rule.attributes) {
            const attrValue = getAttribute(element, attrName);
            if (attrValue) {
                attrsForChildren[attrName] = attrValue;
            }
        }
        
        // Process children
        if (element.childNodes) {
            for (let i = 0; i < element.childNodes.length; i++) {
                const child = element.childNodes[i];
                
                if (child.nodeType === 1) { // ELEMENT_NODE
                    const childTagName = getTagNameWithoutNamespace(child.nodeName);
                    
                    // Only process if this child is in the inheriters list
                    if (rule.inheriters.includes(childTagName)) {
                        processElementDOM(child, inheritanceMap, attrsForChildren);
                    } else {
                        // Still recurse, but don't pass inherited attributes
                        processElementDOM(child, inheritanceMap, {});
                    }
                }
            }
        }
    } else {
        // No rule for this tag, just recurse into children without inheritance
        if (element.childNodes) {
            for (let i = 0; i < element.childNodes.length; i++) {
                processElementDOM(element.childNodes[i], inheritanceMap, {});
            }
        }
    }
}

/**
 * Process inheritance using string manipulation (fallback for Node.js)
 * @param {string} xml - XML string
 * @param {Map} inheritanceMap - Map of inheritance rules
 * @returns {string} Processed XML string
 */
function processInheritanceString(xml, inheritanceMap) {
    // This is a simple implementation for Node.js that doesn't have DOMParser
    // For now, return the original XML
    // A full implementation would need a custom XML parser/serializer
    return xml;
}

/**
 * Main preprocessing function - applies inheritance rules to XML
 * @param {string} xmlString - Input XML string
 * @param {Array} config - Array of inheritance configuration objects
 * @returns {string} Processed XML string with explicit inheritance
 */
function preprocessInheritance(xmlString, config) {
    // Handle edge cases
    if (!xmlString || typeof xmlString !== 'string') {
        return '';
    }
    
    if (!config || !Array.isArray(config) || config.length === 0) {
        return xmlString; // No config, return unchanged
    }
    
    // Build inheritance map from config
    const inheritanceMap = buildInheritanceMap(config);
    
    if (inheritanceMap.size === 0) {
        return xmlString; // No valid rules, return unchanged
    }
    
    // Parse XML
    const xmlDoc = parseXML(xmlString);
    
    if (!xmlDoc) {
        // Fallback to string manipulation (for Node.js)
        return processInheritanceString(xmlString, inheritanceMap);
    }
    
    // Process the document
    const rootElement = xmlDoc.documentElement || xmlDoc;
    processElementDOM(rootElement, inheritanceMap, {});
    
    // Serialize back to string
    let result = serializeXML(xmlDoc);
    
    // Clean up XML declaration if present
    if (result.startsWith('<?xml')) {
        const endOfDeclaration = result.indexOf('?>');
        if (endOfDeclaration !== -1) {
            result = result.substring(endOfDeclaration + 2).trim();
        }
    }
    
    return result;
}

/**
 * Central orchestrator for all preprocessors
 * This function runs all preprocessing steps in order
 * @param {string} xmlString - Input XML string
 * @param {Object} options - Preprocessing options
 * @param {Array} options.inheritanceConfig - Inheritance configuration
 * @returns {string} Fully preprocessed XML string
 */
function preprocessXML(xmlString, options = {}) {
    let processedXML = xmlString;
    
    // Step 1: Apply inheritance preprocessing
    if (options.inheritanceConfig) {
        processedXML = preprocessInheritance(processedXML, options.inheritanceConfig);
    }
    
    // Future preprocessors can be added here
    // Step 2: Apply other preprocessing...
    // Step 3: Apply more preprocessing...
    
    return processedXML;
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        preprocessInheritance,
        preprocessXML,
        buildInheritanceMap,
        getTagNameWithoutNamespace
    };
}

if (typeof window !== 'undefined') {
    window.InheritancePreprocessor = {
        preprocessInheritance,
        preprocessXML,
        buildInheritanceMap,
        getTagNameWithoutNamespace
    };
}

