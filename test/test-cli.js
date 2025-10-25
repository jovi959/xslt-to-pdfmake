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
class SimpleXMLParser {
    parse(xmlString) {
        // Create a minimal DOM-like structure
        const doc = {
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
            }
        };
        
        return doc;
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

            const widthInPoints = this.convertToPoints(pageWidth);
            const heightInPoints = this.convertToPoints(pageHeight);
            const margins = this.parseMargins(marginAttr);

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

    convertToPDFMake(xslfoXml) {
        const pageMasters = this.parsePageMasters(xslfoXml);

        if (pageMasters.length === 0) {
            throw new Error('No page masters found in XSL-FO document');
        }

        const primaryMaster = pageMasters[0];
        const pageSize = this.determinePageSize(
            primaryMaster.widthInPoints,
            primaryMaster.heightInPoints
        );

        return {
            pageSize: pageSize,
            pageMargins: primaryMaster.margins,
            content: [],
            _metadata: {
                pageMasters: pageMasters,
                primaryMaster: primaryMaster.masterName
            }
        };
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

    // Load all test files
    const { registerPageStructureTests } = require('./tests/page-structure.test.js');
    const { registerUnitConversionTests } = require('./tests/unit-conversion.test.js');
    const { registerMarginParsingTests } = require('./tests/margin-parsing.test.js');
    const { registerMetadataTests } = require('./tests/metadata.test.js');
    
    // Register all tests
    registerPageStructureTests(testRunner, converter, emptyPageXML, assert);
    registerUnitConversionTests(testRunner, converter, emptyPageXML, assert);
    registerMarginParsingTests(testRunner, converter, emptyPageXML, assert);
    registerMetadataTests(testRunner, converter, emptyPageXML, assert);

    // Run all tests
    await testRunner.runTests();
}

// Run tests
main().catch(error => {
    console.error(`${colors.red}${colors.bright}Fatal Error:${colors.reset}`, error);
    process.exit(1);
});

