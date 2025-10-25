/**
 * Unit Conversion Tests
 * Tests for converting between inches, cm, mm, and points
 */

function registerUnitConversionTests(testRunner, converter, emptyPageXML, assert) {
    // Test: Comprehensive unit conversions
    testRunner.addTest('Should accurately convert all unit types to points', () => {
        // Inches
        assert.equal(converter.convertToPoints('1in'), 72, '1 inch = 72 points');
        assert.equal(converter.convertToPoints('0.5in'), 36, '0.5 inch = 36 points');
        assert.equal(converter.convertToPoints('2in'), 144, '2 inches = 144 points');
        assert.equal(converter.convertToPoints('8.5in'), 612, '8.5 inches = 612 points');
        
        // Centimeters (1cm = 28.35pt)
        assert.approximately(converter.convertToPoints('1cm'), 28.35, 0.01, '1cm ≈ 28.35pt');
        assert.approximately(converter.convertToPoints('2.54cm'), 72.009, 0.1, '2.54cm ≈ 1 inch (72.009pt)');
        
        // Millimeters (1mm = 2.835pt)
        assert.approximately(converter.convertToPoints('1mm'), 2.835, 0.01, '1mm ≈ 2.835pt');
        assert.approximately(converter.convertToPoints('10mm'), 28.35, 0.01, '10mm = 1cm');
        
        // Points (1pt = 1pt)
        assert.equal(converter.convertToPoints('1pt'), 1, '1pt = 1pt');
        assert.equal(converter.convertToPoints('72pt'), 72, '72pt = 72pt');
        assert.equal(converter.convertToPoints('100pt'), 100, '100pt = 100pt');
    });

    // Test: Edge cases for unit conversion
    testRunner.addTest('Should handle edge cases in unit conversion', () => {
        // Zero values
        assert.equal(converter.convertToPoints('0in'), 0, '0 inches = 0 points');
        assert.equal(converter.convertToPoints('0cm'), 0, '0 cm = 0 points');
        
        // Decimal values
        assert.equal(converter.convertToPoints('0.25in'), 18, '0.25 inch = 18 points');
        assert.approximately(converter.convertToPoints('1.5cm'), 42.525, 0.01, '1.5cm ≈ 42.525pt');
        
        // Invalid inputs
        assert.equal(converter.convertToPoints(''), 0, 'Empty string should return 0');
        assert.equal(converter.convertToPoints(null), 0, 'null should return 0');
        assert.equal(converter.convertToPoints('invalid'), 0, 'Invalid value should return 0');
        assert.equal(converter.convertToPoints('10xyz'), 0, 'Invalid unit should return 0');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerUnitConversionTests };
}
if (typeof window !== 'undefined') {
    window.registerUnitConversionTests = registerUnitConversionTests;
}

