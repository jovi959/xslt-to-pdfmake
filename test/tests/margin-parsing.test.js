/**
 * Margin Parsing Tests
 * Tests for parsing margins in various XSL-FO formats
 */

function registerMarginParsingTests(testRunner, converter, emptyPageXML, assert) {
    // Test: Exact margin extraction and format
    testRunner.addTest('Should extract margins in PDFMake [left, top, right, bottom] format', () => {
        const result = converter.convertToPDFMake(emptyPageXML);
        
        // Verify margins structure
        assert.ok(Array.isArray(result.pageMargins), 'pageMargins must be an array');
        assert.equal(result.pageMargins.length, 4, 'pageMargins must have exactly 4 values');
        
        // Verify all values are numbers
        result.pageMargins.forEach((margin, index) => {
            assert.equal(typeof margin, 'number', `Margin at index ${index} should be a number`);
            assert.ok(margin >= 0, `Margin at index ${index} should be non-negative`);
        });
        
        // Verify exact margin values: "0.5in 0.75in 1in 0.5in" (top, right, bottom, left)
        // PDFMake format: [left, top, right, bottom] = [36, 36, 54, 72]
        assert.equal(result.pageMargins[0], 36, 'Left margin should be 36pt (0.5in)');
        assert.equal(result.pageMargins[1], 36, 'Top margin should be 36pt (0.5in)');
        assert.equal(result.pageMargins[2], 54, 'Right margin should be 54pt (0.75in)');
        assert.equal(result.pageMargins[3], 72, 'Bottom margin should be 72pt (1in)');
    });

    // Test: Margin parsing with different formats
    testRunner.addTest('Should parse margins in all valid XSL-FO formats', () => {
        // Single value (all sides equal)
        const margins1 = converter.parseMargins('1in');
        assert.deepEqual(margins1, [72, 72, 72, 72], 'Single value: all sides should be 72pt');
        
        // Two values (vertical, horizontal)
        const margins2 = converter.parseMargins('1in 2in');
        assert.deepEqual(margins2, [144, 72, 144, 72], 'Two values: [horizontal, vertical, horizontal, vertical]');
        
        // Four values (top, right, bottom, left)
        const margins4 = converter.parseMargins('1in 2in 3in 4in');
        assert.deepEqual(margins4, [288, 72, 144, 216], 'Four values: [left, top, right, bottom]');
        
        // Mixed units
        const marginsMixed = converter.parseMargins('1in 2cm 10mm 0.5in');
        assert.approximately(marginsMixed[0], 36, 0.1, 'Left: 0.5in = 36pt');
        assert.approximately(marginsMixed[1], 72, 0.1, 'Top: 1in = 72pt');
        assert.approximately(marginsMixed[2], 56.7, 0.1, 'Right: 2cm ≈ 56.7pt');
        assert.approximately(marginsMixed[3], 28.35, 0.1, 'Bottom: 10mm ≈ 28.35pt');
    });

    // Test: Edge cases for margin parsing
    testRunner.addTest('Should handle edge cases in margin parsing', () => {
        // Empty or invalid margins
        assert.deepEqual(converter.parseMargins(''), [0, 0, 0, 0], 'Empty string should return zeros');
        assert.deepEqual(converter.parseMargins(null), [0, 0, 0, 0], 'null should return zeros');
        
        // Margins with extra whitespace
        const marginsSpace = converter.parseMargins('  1in   2in  ');
        assert.deepEqual(marginsSpace, [144, 72, 144, 72], 'Should handle extra whitespace');
        
        // Invalid margin count (3 values - should be ignored/return zeros)
        const margins3 = converter.parseMargins('1in 2in 3in');
        assert.equal(margins3.length, 4, 'Should always return 4 values');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerMarginParsingTests };
}
if (typeof window !== 'undefined') {
    window.registerMarginParsingTests = registerMarginParsingTests;
}

