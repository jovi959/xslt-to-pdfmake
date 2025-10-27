/**
 * Shared Test Definitions - Loader
 * Loads and registers all test files from the tests/ directory
 * Used by both browser (test.html) and CLI (test-cli.js) test runners
 */

/**
 * Register all unit tests by loading test files
 * @param {TestRunner} testRunner - The test runner instance
 * @param {XSLToPDFMakeConverter} converter - The converter instance
 * @param {string} emptyPageXML - The test XML data
 * @param {Object} assert - Assertion helpers
 */
function registerTests(testRunner, converter, emptyPageXML, assert) {
    // Load all test files
    // These functions are loaded from individual test files in tests/ directory
    if (typeof registerPageStructureTests === 'function') {
        registerPageStructureTests(testRunner, converter, emptyPageXML, assert);
    }
    if (typeof registerUnitConversionTests === 'function') {
        registerUnitConversionTests(testRunner, converter, emptyPageXML, assert);
    }
    if (typeof registerMarginParsingTests === 'function') {
        registerMarginParsingTests(testRunner, converter, emptyPageXML, assert);
    }
    if (typeof registerPageSequenceTests === 'function') {
        registerPageSequenceTests(testRunner, converter, emptyPageXML, assert);
    }
    if (typeof registerSinglePageSequenceTests === 'function') {
        registerSinglePageSequenceTests(testRunner, converter, emptyPageXML, assert);
    }
    if (typeof registerBlockConverterTests === 'function') {
        registerBlockConverterTests(testRunner, converter, emptyPageXML, assert);
    }
if (typeof registerRecursiveTraversalTests === 'function') {
    registerRecursiveTraversalTests(testRunner, converter, emptyPageXML, assert);
}
if (typeof registerNestedBlockStylingTests === 'function') {
    registerNestedBlockStylingTests(testRunner, converter, emptyPageXML, assert);
}
if (typeof registerInlineConverterTests === 'function') {
    registerInlineConverterTests(testRunner, converter, emptyPageXML, assert);
}
if (typeof registerIntegratedConversionTests === 'function') {
    registerIntegratedConversionTests(testRunner, converter, emptyPageXML, assert);
}
if (typeof registerInheritancePreprocessorTests === 'function') {
    registerInheritancePreprocessorTests(testRunner, converter, emptyPageXML, assert);
}
if (typeof registerWhitespaceNormalizationTests === 'function') {
    registerWhitespaceNormalizationTests(testRunner, converter, emptyPageXML, assert);
}
if (typeof registerSelfClosingBlockTests === 'function') {
    registerSelfClosingBlockTests(testRunner, converter, emptyPageXML, assert);
}
}

// Export for use in both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerTests };
}
if (typeof window !== 'undefined') {
    window.registerTests = registerTests;
}

