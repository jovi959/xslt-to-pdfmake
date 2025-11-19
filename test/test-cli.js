#!/usr/bin/env node

/**
 * Command-line test runner for XSL-FO to PDFMake Converter
 * Usage: node test-cli.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// Simple XML parser for Node.js (no external dependencies)
// This uses Node.js built-in DOMParser support (available via jsdom-like implementation)
// For the tests, we'll use a more complete DOM implementation
let DOMParser;

try {
    // Try to use xmldom if available (but don't require it)
    const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
    
    // Wrap @xmldom/xmldom to add querySelector support for tests
    DOMParser = class DOMParser {
        parseFromString(xmlString, contentType) {
            const parser = new XMLDOMParser();
            const doc = parser.parseFromString(xmlString, contentType);
            
            // Add querySelector support (needed for tests)
            if (!doc.querySelector) {
                doc.querySelector = function(selector) {
                    // Support id selector: [id="value"]
                    if (selector.startsWith('[id="') && selector.endsWith('"]')) {
                        const id = selector.slice(5, -2);
                        
                        // Recursively search for element with matching id
                        function findById(node) {
                            if (node.nodeType === 1 && node.getAttribute && node.getAttribute('id') === id) {
                                return node;
                            }
                            if (node.childNodes) {
                                for (let i = 0; i < node.childNodes.length; i++) {
                                    const found = findById(node.childNodes[i]);
                                    if (found) return found;
                                }
                            }
                            return null;
                        }
                        
                        return findById(doc.documentElement);
                    }
                    return null;
                };
            }
            
            return doc;
        }
    };
} catch (e) {
    // Fallback: Use a basic implementation
    DOMParser = class DOMParser {
        parseFromString(xmlString, contentType) {
            // Very basic parser for testing purposes
            // This is sufficient for our test cases
            const parser = new SimpleXMLParser();
            return parser.parse(xmlString);
        }
    };
}

class SimpleXMLParser {
    parse(xmlString) {
        // Create a minimal DOM-like structure
        const doc = {
            _xmlString: xmlString,
            
            querySelector: (selector) => {
                // Support id selector
                if (selector.startsWith('[id="') && selector.endsWith('"]')) {
                    const id = selector.slice(5, -2);
                    const regex = new RegExp(`<([^>\\s]+)[^>]*\\sid="${id}"[^>]*>([\\s\\S]*?)<\\/\\1>`, 'i');
                    const match = xmlString.match(regex);
                    
                    if (match) {
                        return this._createElementFromMatch(match[0], match[1]);
                    }
                }
                
                return null;
            },
            
            querySelectorAll: (selector) => {
                const matches = [];
                // Simple regex-based parsing for fo:simple-page-master elements
                const regex = /<fo:simple-page-master([^>]*)>/g;
                let match;
                
                while ((match = regex.exec(xmlString)) !== null) {
                    const attributes = match[1];
                    const element = {
                        getAttribute: (name) => {
                            const attrRegex = new RegExp(`${name}="([^"]*)"`, 'i');
                            const attrMatch = attributes.match(attrRegex);
                            return attrMatch ? attrMatch[1] : null;
                        }
                    };
                    matches.push(element);
                }
                
                return matches;
            },
            
            documentElement: this._parseElement(xmlString)
        };
        
        return doc;
    }
    
    _parseElement(xmlString) {
        // Parse the root element
        const tagMatch = xmlString.match(/<([^\s>]+)([^>]*)>/);
        if (!tagMatch) return null;
        
        return this._createElementFromMatch(xmlString, tagMatch[1]);
    }
    
    _createElementFromMatch(xmlString, tagName) {
        const attributes = this._parseAttributes(xmlString);
        const content = this._extractContent(xmlString, tagName);
        const childNodes = this._parseChildren(content);
        
        return {
            nodeName: tagName,
            nodeType: 1, // ELEMENT_NODE
            getAttribute: (name) => attributes[name] || null,
            attributes: attributes,
            childNodes: childNodes,
            textContent: this._extractTextContent(content),
            _xmlString: xmlString
        };
    }
    
    _parseAttributes(xmlString) {
        const attributes = {};
        // Only parse attributes from the opening tag, not from nested elements
        // Trim whitespace first to handle leading whitespace
        const trimmed = xmlString.trim();
        const openingTagMatch = trimmed.match(/^<[^\s>]+([^>]*)>/);
        if (!openingTagMatch) return attributes;
        
        const attributesString = openingTagMatch[1];
        const attrRegex = /(\w+(?:-\w+)*)="([^"]*)"/g;
        let match;
        
        while ((match = attrRegex.exec(attributesString)) !== null) {
            attributes[match[1]] = match[2];
        }
        
        return attributes;
    }
    
    _extractContent(xmlString, tagName) {
        // Properly handle nested tags by counting depth
        const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const openingTagRegex = new RegExp(`<${escapedTagName}[^>]*>`, 'i');
        
        const openingMatch = xmlString.match(openingTagRegex);
        if (!openingMatch) return '';
        
        const startIndex = openingMatch.index + openingMatch[0].length;
        let depth = 1;
        
        // Find all opening and closing tags
        const openingTags = [];
        const closingTags = [];
        
        let match;
        const openRegex = new RegExp(`<${escapedTagName}[^>]*>`, 'gi');
        while ((match = openRegex.exec(xmlString)) !== null) {
            if (match.index >= startIndex) {
                openingTags.push(match.index);
            }
        }
        
        const closeRegex = new RegExp(`<\\/${escapedTagName}>`, 'gi');
        while ((match = closeRegex.exec(xmlString)) !== null) {
            closingTags.push(match.index);
        }
        
        // Find the matching closing tag by counting depth
        let openIdx = 0;
        let closeIdx = 0;
        
        while (depth > 0 && closeIdx < closingTags.length) {
            const nextOpen = openingTags[openIdx];
            const nextClose = closingTags[closeIdx];
            
            if (nextOpen !== undefined && nextOpen < nextClose) {
                depth++;
                openIdx++;
            } else {
                depth--;
                if (depth === 0) {
                    // Found the matching closing tag
                    return xmlString.substring(startIndex, nextClose);
                }
                closeIdx++;
            }
        }
        
        return '';
    }
    
    _parseChildren(content) {
        const children = [];
        let currentIndex = 0;
        
        // Find all element start positions
        const elementStarts = [];
        const elementRegex = /<([\w:]+)([^>\/]*)>/g;
        let match;
        
        while ((match = elementRegex.exec(content)) !== null) {
            // Skip self-closing tags and closing tags
            if (!content.substring(match.index, match.index + match[0].length).includes('</')) {
                elementStarts.push({
                    index: match.index,
                    tagName: match[1]
                });
            }
        }
        
        // Process each element
        for (const start of elementStarts) {
            // Add text before this element
            const textBefore = content.slice(currentIndex, start.index);
            // Only skip purely whitespace-only nodes (XML formatting), but preserve meaningful spaces
            const isWhitespaceOnly = /^\s*$/.test(textBefore);
            if (textBefore && !isWhitespaceOnly) {
                children.push({
                    nodeType: 3, // TEXT_NODE
                    textContent: textBefore,
                    nodeName: '#text'
                });
            }
            
            // Extract the full element using depth counting
            const elementXml = this._extractElementAt(content, start.index, start.tagName);
            if (elementXml) {
                children.push(this._createElementFromMatch(elementXml, start.tagName));
                currentIndex = start.index + elementXml.length;
            }
        }
        
        // Add remaining text
        const textAfter = content.slice(currentIndex);
        // Only skip purely whitespace-only nodes (XML formatting), but preserve meaningful spaces
        const isWhitespaceOnly = /^\s*$/.test(textAfter);
        if (textAfter && !isWhitespaceOnly) {
            children.push({
                nodeType: 3, // TEXT_NODE
                textContent: textAfter,
                nodeName: '#text'
            });
        }
        
        return children;
    }
    
    _extractElementAt(content, startIndex, tagName) {
        // Extract a complete element starting at startIndex using depth counting
        const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const remaining = content.substring(startIndex);
        
        // Find the opening tag
        const openingRegex = new RegExp(`^<${escapedTagName}[^>]*>`, 'i');
        const openingMatch = remaining.match(openingRegex);
        if (!openingMatch) return null;
        
        const contentStart = openingMatch[0].length;
        let depth = 1;
        let currentPos = contentStart;
        
        // Scan through the remaining string counting depth
        const openRegex = new RegExp(`<${escapedTagName}[^>\/]*>`, 'gi');
        const closeRegex = new RegExp(`<\\/${escapedTagName}>`, 'gi');
        
        const opens = [];
        const closes = [];
        
        let m;
        openRegex.lastIndex = contentStart;
        while ((m = openRegex.exec(remaining)) !== null) {
            opens.push(m.index);
        }
        
        closeRegex.lastIndex = 0;
        while ((m = closeRegex.exec(remaining)) !== null) {
            closes.push({ index: m.index, length: m[0].length });
        }
        
        // Find the matching close tag
        let openIdx = 0;
        let closeIdx = 0;
        
        while (depth > 0 && closeIdx < closes.length) {
            const nextOpen = opens[openIdx];
            const nextClose = closes[closeIdx];
            
            if (nextOpen !== undefined && nextOpen < nextClose.index) {
                depth++;
                openIdx++;
            } else {
                depth--;
                if (depth === 0) {
                    // Found the matching closing tag
                    return remaining.substring(0, nextClose.index + nextClose.length);
                }
                closeIdx++;
            }
        }
        
        return null;
    }
    
    _extractTextContent(content) {
        // Remove all tags and return text
        return content.replace(/<[^>]*>/g, '').trim();
    }
}

// Node.js compatible converter
class XSLToPDFMakeConverter {
    constructor() {
        this.POINTS_PER_INCH = 72;
        this.POINTS_PER_CM = 28.35;
        this.POINTS_PER_MM = 2.835;
        this.POINTS_PER_PT = 1;
        
        this.PAGE_SIZES = {
            'LETTER': { width: 612, height: 792 },
            'LEGAL': { width: 612, height: 1008 },
            'A4': { width: 595.28, height: 841.89 },
            'A3': { width: 841.89, height: 1190.55 },
            'A5': { width: 419.53, height: 595.28 },
        };
    }

    convertToPoints(value) {
        if (!value || typeof value !== 'string') {
            return 0;
        }

        value = value.trim();
        const match = value.match(/^([\d.]+)(in|cm|mm|pt)?$/i);
        if (!match) {
            return 0;
        }

        const number = parseFloat(match[1]);
        const unit = (match[2] || 'pt').toLowerCase();

        switch (unit) {
            case 'in': return number * this.POINTS_PER_INCH;
            case 'cm': return number * this.POINTS_PER_CM;
            case 'mm': return number * this.POINTS_PER_MM;
            case 'pt': return number * this.POINTS_PER_PT;
            default: return number;
        }
    }

    parseMargins(marginStr) {
        if (!marginStr || typeof marginStr !== 'string') {
            return [0, 0, 0, 0];
        }

        const parts = marginStr.trim().split(/\s+/);
        const margins = parts.map(part => this.convertToPoints(part));

        if (margins.length === 1) {
            return [margins[0], margins[0], margins[0], margins[0]];
        } else if (margins.length === 2) {
            return [margins[1], margins[0], margins[1], margins[0]];
        } else if (margins.length === 4) {
            return [margins[3], margins[0], margins[1], margins[2]];
        } else {
            return [0, 0, 0, 0];
        }
    }

    determinePageSize(width, height) {
        const tolerance = 2;

        for (const [name, size] of Object.entries(this.PAGE_SIZES)) {
            if (Math.abs(size.width - width) < tolerance && 
                Math.abs(size.height - height) < tolerance) {
                return name;
            }
        }

        return { width: Math.round(width * 100) / 100, height: Math.round(height * 100) / 100 };
    }

    parsePageMasters(xslfoXml) {
        const parser = new SimpleXMLParser();
        const xmlDoc = parser.parse(xslfoXml);
        const pageMasters = xmlDoc.querySelectorAll('simple-page-master');
        const pageMasterData = [];

        pageMasters.forEach(master => {
            const masterName = master.getAttribute('master-name');
            const pageWidth = master.getAttribute('page-width');
            const pageHeight = master.getAttribute('page-height');
            const marginAttr = master.getAttribute('margin');
            
            // Individual margin attributes
            const marginTop = master.getAttribute('margin-top');
            const marginBottom = master.getAttribute('margin-bottom');
            const marginLeft = master.getAttribute('margin-left');
            const marginRight = master.getAttribute('margin-right');

            const widthInPoints = this.convertToPoints(pageWidth);
            const heightInPoints = this.convertToPoints(pageHeight);
            
            // Parse margins - prefer individual attributes over shorthand
            let margins;
            if (marginTop || marginBottom || marginLeft || marginRight) {
                margins = [
                    this.convertToPoints(marginLeft || '0'),
                    this.convertToPoints(marginTop || '0'),
                    this.convertToPoints(marginRight || '0'),
                    this.convertToPoints(marginBottom || '0')
                ];
            } else {
                margins = this.parseMargins(marginAttr);
            }

            pageMasterData.push({
                masterName: masterName,
                pageWidth: pageWidth,
                pageHeight: pageHeight,
                widthInPoints: widthInPoints,
                heightInPoints: heightInPoints,
                marginString: marginAttr,
                margins: margins
            });
        });

        return pageMasterData;
    }

    parsePageSequences(xslfoXml) {
        // Simple regex-based parsing for page sequences
        const sequenceMasterRegex = /<fo:page-sequence-master[^>]*>([\s\S]*?)<\/fo:page-sequence-master>/;
        const match = xslfoXml.match(sequenceMasterRegex);
        
        if (!match) {
            return { sequences: [] };
        }
        
        const sequenceContent = match[1];
        const sequences = [];
        
        // Parse single-page-master-reference
        const singleRegex = /<fo:single-page-master-reference[^>]*master-reference="([^"]*)"/g;
        let singleMatch;
        while ((singleMatch = singleRegex.exec(sequenceContent)) !== null) {
            sequences.push({
                type: 'single',
                masterRef: singleMatch[1]
            });
        }
        
        // Parse repeatable-page-master-reference
        const repeatableRegex = /<fo:repeatable-page-master-reference[^>]*master-reference="([^"]*)"/g;
        let repeatableMatch;
        while ((repeatableMatch = repeatableRegex.exec(sequenceContent)) !== null) {
            sequences.push({
                type: 'repeatable',
                masterRef: repeatableMatch[1]
            });
        }
        
        return { sequences };
    }

    extractContent(xslfoXml) {
        try {
            // Load conversion modules
            const { traverse } = require('../src/recursive-traversal.js');
            const { convertBlock } = require('../src/block-converter.js');
            const { processKeepWithPrevious } = require('../src/keep-properties.js');
            
            // Try to load table converter (optional)
            let convertTable = null;
            try {
                const TableConverter = require('../src/table-converter.js');
                convertTable = TableConverter.convertTable;
            } catch (e) {
                // Table converter not available, that's okay
                console.log('Table converter not loaded (optional)');
            }
            
            // Try to load inline converter (optional but recommended)
            let convertInline = null;
            try {
                const InlineConverter = require('../src/inline-converter.js');
                convertInline = InlineConverter.convertInline;
            } catch (e) {
                // Inline converter not available, that's okay (fallback to block converter)
                console.log('Inline converter not loaded (optional)');
            }
            
            // Try to load list converter (optional)
            let convertList = null;
            try {
                const ListConverter = require('../src/list-converter.js');
                convertList = ListConverter.convertList;
            } catch (e) {
                // List converter not available, that's okay
                console.log('List converter not loaded (optional)');
            }

            if (!traverse || !convertBlock) {
                console.warn('Block conversion modules not available');
                return [];
            }

            const parser = new SimpleXMLParser();
            const content = [];

            // Find flow elements and extract their direct children (blocks and tables)
            const flowRegex = /<(fo:)?flow[^>]*>([\s\S]*?)<\/\1?flow>/gi;
            let flowMatch;
            
            while ((flowMatch = flowRegex.exec(xslfoXml)) !== null) {
                const flowContent = flowMatch[2]; // Capture group 2 is the content between flow tags
                
                // Extract each top-level element (block or table) using proper depth counting
                let currentPos = 0;
                
                while (currentPos < flowContent.length) {
                    // Find next block, table, inline, or list start
                    const elementStartRegex = /<(fo:block|block|fo:table|table|fo:inline|inline|fo:list-block|list-block)[\s>\/]/;
                    const startMatch = flowContent.substring(currentPos).match(elementStartRegex);
                    
                    if (!startMatch) break;
                    
                    const elementStart = currentPos + startMatch.index;
                    const tagName = startMatch[1];
                    
                    // Extract the complete element using depth counting
                    const elementXml = this._extractBlockAt(flowContent, elementStart, tagName);
                    
                    if (elementXml) {
                        // Parse and convert the element
                        const elementDoc = parser.parse(elementXml);
                        const element = elementDoc.documentElement;
                        
                        if (element) {
                            let converted = null;
                            
                            // Use appropriate converter based on tag name
                            if (tagName === 'fo:table' || tagName === 'table') {
                                if (convertTable) {
                                    converted = traverse(element, convertTable);
                                }
                            } else if (tagName === 'fo:list-block' || tagName === 'list-block') {
                                if (convertList) {
                                    converted = traverse(element, convertList);
                                }
                            } else if ((tagName === 'fo:inline' || tagName === 'inline') && convertInline) {
                                converted = traverse(element, convertInline);
                            } else {
                                converted = traverse(element, convertBlock);
                            }
                            
                            if (converted !== null && converted !== undefined) {
                                content.push(converted);
                            }
                        }
                        
                        currentPos = elementStart + elementXml.length;
                    } else {
                        currentPos = elementStart + 1;
                    }
                }
            }

            // Post-process for keep-with-previous properties
            if (processKeepWithPrevious) {
                return processKeepWithPrevious(content);
            }
            return content;
        } catch (error) {
            console.error('Error extracting content:', error);
            return [];
        }
    }

    _extractBlockAt(content, startIndex, tagName) {
        const remaining = content.substring(startIndex);
        const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Find opening tag
        const openingRegex = new RegExp(`^<${escapedTagName}[^>]*>`, 'i');
        const openingMatch = remaining.match(openingRegex);
        if (!openingMatch) return null;
        
        const contentStart = openingMatch[0].length;
        let depth = 1;
        
        // Find all opening and closing tags
        const openRegex = new RegExp(`<${escapedTagName}[\\s>]`, 'gi');
        const closeRegex = new RegExp(`<\\/${escapedTagName}>`, 'gi');
        
        const opens = [];
        const closes = [];
        
        let m;
        openRegex.lastIndex = contentStart;
        while ((m = openRegex.exec(remaining)) !== null) {
            opens.push(m.index);
        }
        
        closeRegex.lastIndex = 0;
        while ((m = closeRegex.exec(remaining)) !== null) {
            closes.push({ index: m.index, length: m[0].length });
        }
        
        // Find matching close tag
        let openIdx = 0;
        let closeIdx = 0;
        
        while (depth > 0 && closeIdx < closes.length) {
            const nextOpen = opens[openIdx];
            const nextClose = closes[closeIdx];
            
            if (nextOpen !== undefined && nextOpen < nextClose.index) {
                depth++;
                openIdx++;
            } else {
                depth--;
                if (depth === 0) {
                    return remaining.substring(0, nextClose.index + nextClose.length);
                }
                closeIdx++;
            }
        }
        
        return null;
    }

    convertToPDFMake(xslfoXml, options = {}) {
        // Note: options.skipPreprocessing is accepted for API compatibility
        // but test-cli.js doesn't have preprocessing, so it's effectively always skipped
        const pageMasters = this.parsePageMasters(xslfoXml);
        const pageSequences = this.parsePageSequences(xslfoXml);

        if (pageMasters.length === 0) {
            throw new Error('No page masters found in XSL-FO document');
        }

        const primaryMaster = pageMasters[0];
        const pageSize = this.determinePageSize(
            primaryMaster.widthInPoints,
            primaryMaster.heightInPoints
        );

        // Extract and convert content
        const content = this.extractContent(xslfoXml);

        const pdfMakeDefinition = {
            pageSize: pageSize,
            pageMargins: [0, 0, 0, 0], // Always [0,0,0,0] when using header/footer
            content: content,
            _metadata: {
                pageMasters: pageMasters,
                primaryMaster: primaryMaster.masterName,
                pageSequences: pageSequences
            }
        };

        // Generate header/footer based on page sequences
        if (pageSequences.sequences.length >= 2) {
            // Multiple sequences - use functions
            pdfMakeDefinition.header = this.generateHeaderFunction(pageSequences, pageMasters);
            pdfMakeDefinition.footer = this.generateFooterFunction(pageSequences, pageMasters);
        } else if (pageSequences.sequences.length === 1) {
            // Single sequence - use static objects
            const masterRef = pageSequences.sequences[0].masterRef;
            const master = pageMasters.find(m => m.masterName === masterRef);
            if (master) {
                pdfMakeDefinition.header = {
                    margin: [master.margins[0], master.margins[1], master.margins[2], 0],
                    text: ''
                };
                pdfMakeDefinition.footer = {
                    margin: [master.margins[0], 0, master.margins[2], master.margins[3]],
                    text: ''
                };
            }
        } else {
            // No sequences - use primary master margins directly (legacy behavior)
            pdfMakeDefinition.pageMargins = primaryMaster.margins;
        }

        return pdfMakeDefinition;
    }

    generateHeaderFunction(pageSequences, pageMasters) {
        const sequences = pageSequences.sequences;
        
        // Get the actual margin values for each sequence
        const firstMaster = pageMasters.find(m => m.masterName === sequences[0]?.masterRef);
        const restMaster = pageMasters.find(m => m.masterName === sequences[1]?.masterRef);
        
        // Extract margin values to bake into the function
        const firstMargins = firstMaster ? firstMaster.margins : [0, 0, 0, 0];
        const restMargins = restMaster ? restMaster.margins : [0, 0, 0, 0];
        
        // Create function with hardcoded values (not closures)
        const functionBody = `
            if (currentPage === 1) {
                return {
                    margin: [${firstMargins[0]}, ${firstMargins[1]}, ${firstMargins[2]}, 0],
                    text: ''
                };
            }
            if (currentPage > 1 && currentPage <= pageCount) {
                return {
                    margin: [${restMargins[0]}, ${restMargins[1]}, ${restMargins[2]}, 0],
                    text: ''
                };
            }
        `;
        
        return new Function('currentPage', 'pageCount', functionBody);
    }

    generateFooterFunction(pageSequences, pageMasters) {
        const sequences = pageSequences.sequences;
        
        // Get the actual margin values for each sequence
        const firstMaster = pageMasters.find(m => m.masterName === sequences[0]?.masterRef);
        const restMaster = pageMasters.find(m => m.masterName === sequences[1]?.masterRef);
        
        // Extract margin values to bake into the function
        const firstMargins = firstMaster ? firstMaster.margins : [0, 0, 0, 0];
        const restMargins = restMaster ? restMaster.margins : [0, 0, 0, 0];
        
        // Create function with hardcoded values (not closures)
        const functionBody = `
            if (currentPage === 1) {
                return {
                    margin: [${firstMargins[0]}, 0, ${firstMargins[2]}, ${firstMargins[3]}],
                    text: ''
                };
            }
            if (currentPage > 1 && currentPage <= pageCount) {
                return {
                    margin: [${restMargins[0]}, 0, ${restMargins[2]}, ${restMargins[3]}],
                    text: ''
                };
            }
        `;
        
        return new Function('currentPage', 'pageCount', functionBody);
    }

    getMargins(pageMasters, masterName) {
        const master = pageMasters.find(m => m.masterName === masterName);
        return master ? master.margins : [0, 0, 0, 0];
    }
}

// Test runner
class TestRunner {
    constructor() {
        this.tests = [];
        this.passCount = 0;
        this.failCount = 0;
    }

    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async runTests() {
        console.log(`${colors.cyan}${colors.bright}🧪 Running Tests...${colors.reset}\n`);
        
        const startTime = Date.now();

        for (let i = 0; i < this.tests.length; i++) {
            const test = this.tests[i];
            await this.runSingleTest(test, i + 1);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`${colors.bright}Test Summary:${colors.reset}`);
        console.log(`${colors.green}✅ Passed: ${this.passCount}${colors.reset}`);
        console.log(`${colors.red}❌ Failed: ${this.failCount}${colors.reset}`);
        console.log(`${colors.cyan}📊 Total: ${this.tests.length}${colors.reset}`);
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log(`${'='.repeat(60)}\n`);

        // Exit with error code if tests failed
        process.exit(this.failCount > 0 ? 1 : 0);
    }

    async runSingleTest(test, index) {
        const startTime = Date.now();
        let passed = false;
        let error = null;

        try {
            await test.testFn();
            passed = true;
            const duration = Date.now() - startTime;
            console.log(`${colors.green}✅ Test ${index}: ${test.name}${colors.reset} (${duration}ms)`);
            this.passCount++;
        } catch (e) {
            passed = false;
            error = e.message || e.toString();
            const duration = Date.now() - startTime;
            console.log(`${colors.red}❌ Test ${index}: ${test.name}${colors.reset}`);
            console.log(`${colors.yellow}   Error: ${error}${colors.reset}`);
            this.failCount++;
        }
    }
}

// Assertion helpers
const assert = {
    ok(value, message = 'Expected value to be truthy') {
        if (!value) {
            throw new Error(message);
        }
    },

    equal(actual, expected, message) {
        if (actual !== expected) {
            const msg = message || `Expected ${expected}, but got ${actual}`;
            throw new Error(msg);
        }
    },

    deepEqual(actual, expected, message) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        
        if (actualStr !== expectedStr) {
            const msg = message || `Expected ${expectedStr}, but got ${actualStr}`;
            throw new Error(msg);
        }
    },

    approximately(actual, expected, tolerance = 0.01, message) {
        const diff = Math.abs(actual - expected);
        if (diff > tolerance) {
            const msg = message || `Expected ${expected} (±${tolerance}), but got ${actual} (diff: ${diff})`;
            throw new Error(msg);
        }
    }
};

// Main test execution
async function main() {
    const converter = new XSLToPDFMakeConverter();
    const testRunner = new TestRunner();

    // Load test data
    const emptyPageXML = fs.readFileSync(
        path.join(__dirname, 'data', 'empty_page.xslt'),
        'utf-8'
    );
    const pageSequenceXML = fs.readFileSync(
        path.join(__dirname, 'data', 'page_sequence.xslt'),
        'utf-8'
    );
    const singlePageSequenceXML = fs.readFileSync(
        path.join(__dirname, 'data', 'single_page_sequence.xslt'),
        'utf-8'
    );

    // Load block conversion test data
    const blockConversionXML = fs.readFileSync(
        path.join(__dirname, 'data', 'block_conversion.xslt'),
        'utf-8'
    );

    // Load inline conversion test data
    const inlineConversionXML = fs.readFileSync(
        path.join(__dirname, 'data', 'inline_conversion.xslt'),
        'utf-8'
    );

    // Load new modules
    const { traverse, flattenContent } = require('../src/recursive-traversal.js');
    const BlockConverter = require('../src/block-converter.js');
    const ListConverter = require('../src/list-converter.js');
    const InheritancePreprocessor = require('../src/preprocessor.js');
    const BlockInheritanceConfig = require('../src/block-inheritance-config.js');
    const DocStructureParser = require('../src/doc-structure-parser.js');
    const { DocumentStructureParser } = DocStructureParser;
    
    // Make modules available globally for tests (similar to browser)
    // Set up window-like environment for tests that expect browser globals
    if (typeof global.window === 'undefined') {
        global.window = global;
    }
    
    global.RecursiveTraversal = { traverse, flattenContent };
    global.BlockConverter = BlockConverter;
    global.ListConverter = ListConverter;
    global.DOMParser = DOMParser;
    global.DocStructureParser = DocStructureParser;
    global.DocumentStructureParser = DocumentStructureParser;
    
    // Load table inheritance config
    const TableInheritanceConfig = require('../src/table-inheritance-config.js');
    
    // Also set on window for test compatibility
    global.window.RecursiveTraversal = { traverse, flattenContent };
    global.window.BlockConverter = BlockConverter;
    global.window.ListConverter = ListConverter;
    global.window.InheritancePreprocessor = InheritancePreprocessor;
    global.window.BlockInheritanceConfig = BlockInheritanceConfig;
    global.window.TableInheritanceConfig = TableInheritanceConfig;
    global.window.DOMParser = DOMParser;
    global.window.DocStructureParser = DocStructureParser;
    global.window.DocumentStructureParser = DocumentStructureParser;
    global.SimpleXMLParser = SimpleXMLParser; // Make SimpleXMLParser available to preprocessor

    // Load all test files
    const { registerPageStructureTests } = require('./tests/page-structure.test.js');
    const { registerUnitConversionTests } = require('./tests/unit-conversion.test.js');
    const { registerMarginParsingTests } = require('./tests/margin-parsing.test.js');
    const { registerPageSequenceTests } = require('./tests/page-sequence.test.js');
    const { registerSinglePageSequenceTests } = require('./tests/single-page-sequence.test.js');
    const { registerBlockConverterTests } = require('./tests/block-converter.test.js');
    const { registerRecursiveTraversalTests } = require('./tests/recursive-traversal.test.js');
    const { registerNestedBlockStylingTests } = require('./tests/nested-block-styling.test.js');
    const { registerInlineConverterTests } = require('./tests/inline-converter.test.js');
    const { registerIntegratedConversionTests } = require('./tests/integrated-conversion.test.js');
    const { registerInheritancePreprocessorTests } = require('./tests/inheritance-preprocessor.test.js');
    const { registerWhitespaceNormalizationTests } = require('./tests/whitespace-normalization.test.js');
    const { registerSelfClosingBlockTests } = require('./tests/self-closing-block.test.js');
    const { registerSpecialAttributesTests } = require('./tests/special-attributes.test.js');
    const { registerTableConverterTests, registerTableColspanUnitTests } = require('./tests/table-converter.test.js');
    const { registerTableIntegrationTests } = require('./tests/table-integration.test.js');
    const { registerTableInheritanceTests } = require('./tests/table-inheritance.test.js');
    const { registerTableColspanTests } = require('./tests/table-colspan.test.js');
    const { registerTableAdvancedStylingTests } = require('./tests/table-advanced-styling.test.js');
    const { registerCustomFontsTests } = require('./tests/custom-fonts.test.js');
    const { registerTablePaddingToMarginTests } = require('./tests/table-padding-to-margin.test.js');
    const { registerKeepPropertiesTests } = require('./tests/keep-properties.test.js');
    const { registerTableHeaderTests } = require('./tests/table-header.test.js');
    const { registerTableMarginTests } = require('./tests/table-margin.test.js');
    const { registerBlockIndividualBordersTests } = require('./tests/block-individual-borders.test.js');
    const { registerStandaloneInlineTests } = require('./tests/standalone-inline.test.js');
    const { registerLineHeightTests } = require('./tests/line-height.test.js');
    const { registerListConverterTests } = require('./tests/list-converter.test.js');
    const { registerNestedListInBlockTests } = require('./tests/nested-list-in-block.test.js');
    const { registerTextArrayStructureTests } = require('./tests/text-array-structure.test.js');
    const { registerListInheritanceTests } = require('./tests/list-inheritance.test.js');
    const { registerFontWeightOverrideTests } = require('./tests/font-weight-override.test.js');
    const { registerNestedTableTests } = require('./tests/nested-table.test.js');
    const { registerTableOuterInnerBorderTests } = require('./tests/table-outer-inner-border.test.js');
    const { registerDocStructureParserTests } = require('./tests/doc-structure-parser.test.js');
    const { registerFlowFilteringTests } = require('./tests/flow-filtering.test.js');
    const { registerHeaderFooterDetectionTests } = require('./tests/header-footer-detection.test.js');
    const { registerHeaderFooterInfoTests } = require('./tests/header-footer-info.test.js');
    const { registerStaticContentLayoutTests } = require('./tests/static-content-layout.test.js');
    const { registerHeadersFootersPopulationTests } = require('./tests/headers-footers-population.test.js');
    const { registerTableRowBackgroundTests } = require('./tests/table-row-background.test.js');
    
    // Load integrated conversion test data
    const integratedConversionXML = fs.readFileSync(
        path.join(__dirname, 'data', 'integrated_conversion.xslt'),
        'utf-8'
    );
    
    // Load table colspan test data
    const tableColspanXML = fs.readFileSync(
        path.join(__dirname, 'data', 'table_colspan.xslt'),
        'utf-8'
    );
    
    // Load table advanced styling test data
    const tableAdvancedStylingXML = fs.readFileSync(
        path.join(__dirname, 'data', 'table_advanced_styling.xslt'),
        'utf-8'
    );
    
    // Load table padding to margin test data
    const tablePaddingToMarginXML = fs.readFileSync(
        path.join(__dirname, 'data', 'table_padding_to_margin.xslt'),
        'utf-8'
    );
    const keepPropertiesXML = fs.readFileSync(
        path.join(__dirname, 'data', 'keep_properties.xslt'),
        'utf-8'
    );
    
    // Load table header test data
    const tableHeaderXML = fs.readFileSync(
        path.join(__dirname, 'data', 'table_header.xslt'),
        'utf-8'
    );
    
    // Load block individual borders test data
    const blockIndividualBordersXML = fs.readFileSync(
        path.join(__dirname, 'data', 'block_individual_borders.xslt'),
        'utf-8'
    );
    
    // Load standalone inline test data
    const standaloneInlineXML = fs.readFileSync(
        path.join(__dirname, 'data', 'standalone_inline.xslt'),
        'utf-8'
    );
    
    // Load line height test data
    const lineHeightXML = fs.readFileSync(
        path.join(__dirname, 'data', 'line_height.xslt'),
        'utf-8'
    );
    
    // Load list converter test data
    const listXML = fs.readFileSync(
        path.join(__dirname, 'data', 'list.xslt'),
        'utf-8'
    );
    
    // Load list inheritance test data
    const listInheritanceXML = fs.readFileSync(
        path.join(__dirname, 'data', 'list_inheritance.xslt'),
        'utf-8'
    );
    
    // Load nested list in block test data
    const nestedListXML = fs.readFileSync(
        path.join(__dirname, 'data', 'nested_list_in_block.xslt'),
        'utf-8'
    );
    
    // Load text array structure test data
    const textArrayXML = fs.readFileSync(
        path.join(__dirname, 'data', 'text_array_structure.xslt'),
        'utf-8'
    );
    
    // Load nested table test data
    const nestedTableXML = fs.readFileSync(
        path.join(__dirname, 'data', 'nested_table.xslt'),
        'utf-8'
    );
    
    // Load font weight override test data
    const fontWeightXML = fs.readFileSync(
        path.join(__dirname, 'data', 'font_weight_override.xslt'),
        'utf-8'
    );
    
    // Load table margin test data
    const tableMarginXML = fs.readFileSync(
        path.join(__dirname, 'data', 'table_margin.xslt'),
        'utf-8'
    );
    
    // Load table outer/inner border test data
    const tableOuterInnerBorderXML = fs.readFileSync(
        path.join(__dirname, 'data', 'table_outer_inner_border.xslt'),
        'utf-8'
    );
    
    // Load layout master set test data
    const layoutMasterXML = fs.readFileSync(
        path.join(__dirname, 'data', 'layout_master_set.xslt'),
        'utf-8'
    );
    
    // Load table row background test data
    const tableRowBackgroundXML = fs.readFileSync(
        path.join(__dirname, 'data', 'table_row_background.xslt'),
        'utf-8'
    );
    
    // Register all tests
    registerPageStructureTests(testRunner, converter, emptyPageXML, assert);
    registerUnitConversionTests(testRunner, converter, emptyPageXML, assert);
    registerMarginParsingTests(testRunner, converter, emptyPageXML, assert);
    registerPageSequenceTests(testRunner, converter, pageSequenceXML, assert);
    registerSinglePageSequenceTests(testRunner, converter, singlePageSequenceXML, assert);
    registerBlockConverterTests(testRunner, converter, blockConversionXML, assert);
    registerRecursiveTraversalTests(testRunner, converter, blockConversionXML, assert);
    registerNestedBlockStylingTests(testRunner, converter, blockConversionXML, assert);
    registerInlineConverterTests(testRunner, converter, inlineConversionXML, assert);
    registerIntegratedConversionTests(testRunner, converter, integratedConversionXML, assert);
    registerInheritancePreprocessorTests(testRunner, converter, emptyPageXML, assert);
    registerWhitespaceNormalizationTests(testRunner, converter, emptyPageXML, assert);
    registerSelfClosingBlockTests(testRunner, converter, emptyPageXML, assert);
    registerSpecialAttributesTests(testRunner, converter, emptyPageXML, assert);
    registerTableConverterTests(testRunner, converter, emptyPageXML, assert);
    registerTableColspanUnitTests(testRunner, converter, tableColspanXML, assert);
    registerTableIntegrationTests(testRunner, converter, emptyPageXML, assert);
    registerTableInheritanceTests(testRunner, converter, emptyPageXML, assert);
    registerTableColspanTests(testRunner, converter, tableColspanXML, assert);
    registerTableAdvancedStylingTests(testRunner, converter, tableAdvancedStylingXML, assert);
    registerCustomFontsTests(testRunner, converter, emptyPageXML, assert);
    registerTablePaddingToMarginTests(testRunner, converter, tablePaddingToMarginXML, assert);
    registerKeepPropertiesTests(testRunner, converter, keepPropertiesXML, assert);
    registerTableHeaderTests(testRunner, converter, tableHeaderXML, assert);
    registerBlockIndividualBordersTests(testRunner, converter, blockIndividualBordersXML, assert);
    registerStandaloneInlineTests(testRunner, converter, standaloneInlineXML, assert);
    registerLineHeightTests(testRunner, converter, lineHeightXML, assert);
    registerListConverterTests(testRunner, converter, listXML, assert);
    registerListInheritanceTests(testRunner, converter, listInheritanceXML, assert);
    registerNestedListInBlockTests(testRunner, converter, nestedListXML, assert);
    registerTextArrayStructureTests(testRunner, converter, textArrayXML, assert);
    registerNestedTableTests(testRunner, converter, nestedTableXML, assert);
    registerFontWeightOverrideTests(testRunner, converter, fontWeightXML, assert);
    registerTableMarginTests(testRunner, converter, tableMarginXML, assert);
    registerTableOuterInnerBorderTests(testRunner, converter, tableOuterInnerBorderXML, assert);
    registerTableRowBackgroundTests(testRunner, converter, tableRowBackgroundXML, assert);
    registerDocStructureParserTests(testRunner, converter, layoutMasterXML, assert);

    // Register flow filtering tests
    const flowFilteringXML = fs.readFileSync(
        path.join(__dirname, 'data', 'flow_filtering.xslt'),
        'utf-8'
    );
    registerFlowFilteringTests(testRunner, converter, flowFilteringXML, assert);

    // Register header/footer detection tests
    const headerFooterDetectionXML = fs.readFileSync(
        path.join(__dirname, 'data', 'header_footer_detection.xslt'),
        'utf-8'
    );
    registerHeaderFooterDetectionTests(testRunner, converter, headerFooterDetectionXML, assert);

    // Register header/footer information tests
    const headerFooterInfoXML = fs.readFileSync(
        path.join(__dirname, 'data', 'header_footer_info.xslt'),
        'utf-8'
    );
    registerHeaderFooterInfoTests(testRunner, converter, headerFooterInfoXML, assert);
    
    // Register static content layout tests with dedicated test data
    const staticContentLayoutXML = fs.readFileSync(
        path.join(__dirname, 'data', 'static_content_layout.xslt'),
        'utf-8'
    );
    registerStaticContentLayoutTests(testRunner, converter, staticContentLayoutXML, assert);
    
    // Register headers/footers population tests with dedicated test data
    const headersFootersPopulationXML = fs.readFileSync(
        path.join(__dirname, 'data', 'headers_footers_population.xslt'),
        'utf-8'
    );
    registerHeadersFootersPopulationTests(testRunner, converter, headersFootersPopulationXML, assert);
    
    // Register multi-sequence conversion tests
    const multiSequenceXML = fs.readFileSync(
        path.join(__dirname, 'data', 'multi_sequence.xslt'),
        'utf-8'
    );
    const multiHeaderXML = fs.readFileSync(
        path.join(__dirname, 'data', 'multi_header.xslt'),
        'utf-8'
    );
    const multiFooterXML = fs.readFileSync(
        path.join(__dirname, 'data', 'multi_footer.xslt'),
        'utf-8'
    );
    const { registerMultiSequenceConversionTests } = require('./tests/multi-sequence-conversion.test.js');
    registerMultiSequenceConversionTests(testRunner, converter, multiSequenceXML, assert, multiHeaderXML, multiFooterXML);
    
    // Register header/footer margins tests
    const headerFooterMarginsXML = fs.readFileSync(
        path.join(__dirname, 'data', 'header_footer_margins.xslt'),
        'utf-8'
    );
    const { registerHeaderFooterMarginsTests } = require('./tests/header-footer-margins.test.js');
    registerHeaderFooterMarginsTests(testRunner, converter, headerFooterMarginsXML, assert);
    
    // Register page margins calculation tests
    const pageMarginsCalculationXML = fs.readFileSync(
        path.join(__dirname, 'data', 'page_margins_calculation.xslt'),
        'utf-8'
    );
    const { registerPageMarginsCalculationTests } = require('./tests/page-margins-calculation.test.js');
    registerPageMarginsCalculationTests(testRunner, converter, pageMarginsCalculationXML, assert);

    // Run all tests
    await testRunner.runTests();
}

// Run tests
main().catch(error => {
    console.error(`${colors.red}${colors.bright}Fatal Error:${colors.reset}`, error);
    process.exit(1);
});

