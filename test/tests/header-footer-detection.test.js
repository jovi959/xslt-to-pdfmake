/**
 * Tests for isHeaderOrFooter function
 * Verifies that the function correctly identifies if a flow name belongs to a header or footer region
 */

function registerHeaderFooterDetectionTests(testRunner, converter, headerFooterDetectionXML, assert) {
    // Get the doc structure parser
    const DocStructureParser = typeof window !== 'undefined' 
        ? window.DocStructureParser 
        : require('../src/doc-structure-parser.js');
    
    testRunner.addTest('isHeaderOrFooter: Should identify header flow in master with header and footer', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'with-header-footer',
            'my-header'
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, true, 'Should identify as header');
        assert.equal(result.isFooter, false, 'Should not identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should identify footer flow in master with header and footer', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'with-header-footer',
            'my-footer'
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, false, 'Should not identify as header');
        assert.equal(result.isFooter, true, 'Should identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should identify header in header-only master', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'header-only',
            'page-header'
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, true, 'Should identify as header');
        assert.equal(result.isFooter, false, 'Should not identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should identify footer in footer-only master', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'footer-only',
            'page-footer'
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, false, 'Should not identify as header');
        assert.equal(result.isFooter, true, 'Should identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should return false for body region', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'with-header-footer',
            'xsl-region-body'
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, false, 'Should not identify as header');
        assert.equal(result.isFooter, false, 'Should not identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should handle custom region names', () => {
        const headerResult = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'custom-regions',
            'top-banner'
        );
        
        assert.equal(headerResult.isHeader, true, 'Should identify custom header name');
        assert.equal(headerResult.isFooter, false, 'Should not identify as footer');
        
        const footerResult = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'custom-regions',
            'bottom-bar'
        );
        
        assert.equal(footerResult.isHeader, false, 'Should not identify as header');
        assert.equal(footerResult.isFooter, true, 'Should identify custom footer name');
    });

    testRunner.addTest('isHeaderOrFooter: Should return false for non-existent flow name', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'with-header-footer',
            'non-existent-flow'
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, false, 'Should not identify as header');
        assert.equal(result.isFooter, false, 'Should not identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should return false for non-existent master reference', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'non-existent-master',
            'my-header'
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, false, 'Should not identify as header');
        assert.equal(result.isFooter, false, 'Should not identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should handle master with no regions', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'body-only',
            'xsl-region-body'
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, false, 'Should not identify as header');
        assert.equal(result.isFooter, false, 'Should not identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should handle empty flow name', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'with-header-footer',
            ''
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, false, 'Should not identify as header');
        assert.equal(result.isFooter, false, 'Should not identify as footer');
    });

    testRunner.addTest('isHeaderOrFooter: Should handle null flow name', () => {
        const result = DocStructureParser.isHeaderOrFooter(
            headerFooterDetectionXML,
            'with-header-footer',
            null
        );
        
        assert.ok(result, 'Should return a result object');
        assert.equal(result.isHeader, false, 'Should not identify as header');
        assert.equal(result.isFooter, false, 'Should not identify as footer');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerHeaderFooterDetectionTests };
}
if (typeof window !== 'undefined') {
    window.registerHeaderFooterDetectionTests = registerHeaderFooterDetectionTests;
}

