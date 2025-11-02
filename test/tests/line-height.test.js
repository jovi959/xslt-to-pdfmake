/**
 * Line Height Tests
 * 
 * Tests conversion of XSL-FO line-height to PDFMake lineHeight multiplier.
 * 
 * XSL-FO supports two formats:
 * 1. With unit (e.g., "3pt") - must be converted to multiplier: targetHeight / fontSize
 * 2. Unitless (e.g., "1.5") - used directly as multiplier
 */

function registerLineHeightTests(testRunner, converter, lineHeightXML, assert) {
    
    testRunner.addTest('Should convert line-height with unit to multiplier using default fontSize', () => {
        // <fo:block line-height="3pt">x</fo:block>
        // Expected: lineHeight = 3pt / 10pt (default) = 0.3
        const result = converter.convertToPDFMake(lineHeightXML);
        const block = result.content[0];
        
        assert.ok(block, 'Should have first block');
        assert.equal(block.text, 'x', 'Should have text "x"');
        assert.approximately(block.lineHeight, 0.3, 0.01, 'lineHeight should be 0.3 (3pt / 10pt default)');
    });
    
    testRunner.addTest('Should convert line-height with unit to multiplier using explicit fontSize', () => {
        // <fo:block line-height="3pt" font-size="6pt">y</fo:block>
        // Expected: lineHeight = 3pt / 6pt = 0.5
        const result = converter.convertToPDFMake(lineHeightXML);
        const block = result.content[1];
        
        assert.ok(block, 'Should have second block');
        assert.equal(block.text, 'y', 'Should have text "y"');
        assert.equal(block.fontSize, 6, 'Should have fontSize 6');
        assert.approximately(block.lineHeight, 0.5, 0.01, 'lineHeight should be 0.5 (3pt / 6pt)');
    });
    
    testRunner.addTest('Should convert line-height with unit to multiplier with larger fontSize', () => {
        // <fo:block line-height="3pt" font-size="18pt">z</fo:block>
        // Expected: lineHeight = 3pt / 18pt = 0.1667
        const result = converter.convertToPDFMake(lineHeightXML);
        const block = result.content[2];
        
        assert.ok(block, 'Should have third block');
        assert.equal(block.text, 'z', 'Should have text "z"');
        assert.equal(block.fontSize, 18, 'Should have fontSize 18');
        assert.approximately(block.lineHeight, 0.1667, 0.01, 'lineHeight should be ~0.1667 (3pt / 18pt)');
    });
    
    testRunner.addTest('Should use unitless line-height as multiplier directly', () => {
        // <fo:block line-height="1.5">w</fo:block>
        // Expected: lineHeight = 1.5 (used directly)
        const result = converter.convertToPDFMake(lineHeightXML);
        const block = result.content[3];
        
        assert.ok(block, 'Should have fourth block');
        assert.equal(block.text, 'w', 'Should have text "w"');
        assert.equal(block.lineHeight, 1.5, 'lineHeight should be 1.5 (unitless multiplier)');
    });
    
    testRunner.addTest('Should convert line-height with px unit to multiplier', () => {
        // <fo:block line-height="12px" font-size="8pt">a</fo:block>
        // 12px = 12 * 0.75 = 9pt
        // Expected: lineHeight = 9pt / 8pt = 1.125
        const result = converter.convertToPDFMake(lineHeightXML);
        const block = result.content[4];
        
        assert.ok(block, 'Should have fifth block');
        assert.equal(block.text, 'a', 'Should have text "a"');
        assert.equal(block.fontSize, 8, 'Should have fontSize 8');
        assert.approximately(block.lineHeight, 1.125, 0.01, 'lineHeight should be 1.125 (9pt / 8pt)');
    });
    
    testRunner.addTest('Should use larger unitless multiplier directly', () => {
        // <fo:block line-height="2.0">b</fo:block>
        // Expected: lineHeight = 2.0 (used directly)
        const result = converter.convertToPDFMake(lineHeightXML);
        const block = result.content[5];
        
        assert.ok(block, 'Should have sixth block');
        assert.equal(block.text, 'b', 'Should have text "b"');
        assert.equal(block.lineHeight, 2.0, 'lineHeight should be 2.0 (unitless multiplier)');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerLineHeightTests };
}
if (typeof window !== 'undefined') {
    window.registerLineHeightTests = registerLineHeightTests;
}

