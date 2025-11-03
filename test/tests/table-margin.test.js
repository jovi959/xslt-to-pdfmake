/**
 * Table Margin Tests
 * Tests for handling margin attribute on fo:table elements
 */

function registerTableMarginTests(testRunner, converter, tableMarginXML, assert) {
    
    testRunner.addTest('Should handle four-value margin format (top right bottom left)', () => {
        // Test: margin="20px 0px 0px 0px" should become margin: [0, 20, 0, 0]
        // XSL-FO format: "top right bottom left" = "20px 0px 0px 0px"
        // PDFMake format: [left, top, right, bottom] = [0, 20, 0, 0]
        const result = converter.convertToPDFMake(tableMarginXML);
        
        assert.ok(result, 'Should return result');
        assert.ok(result.content, 'Should have content array');
        assert.ok(result.content.length > 0, 'Should have at least one content item');
        
        // Find the first table (with four-value margin)
        const firstTable = result.content.find(item => item.table);
        assert.ok(firstTable, 'Should have a table in content');
        
        assert.ok(firstTable.margin, 'Table should have margin property');
        assert.ok(Array.isArray(firstTable.margin), 'Margin should be an array');
        assert.equal(firstTable.margin.length, 4, 'Margin array should have 4 values');
        
        // Verify conversion: "20px 0px 0px 0px" (top, right, bottom, left) 
        // -> [0, 20, 0, 0] (left, top, right, bottom)
        // parseNumericValue returns numeric value without unit conversion (20px -> 20)
        assert.equal(firstTable.margin[0], 0, 'Left margin should be 0');
        assert.equal(firstTable.margin[1], 20, 'Top margin should be 20 (from 20px)');
        assert.equal(firstTable.margin[2], 0, 'Right margin should be 0');
        assert.equal(firstTable.margin[3], 0, 'Bottom margin should be 0');
    });
    
    testRunner.addTest('Should handle single-value margin format (all sides same)', () => {
        // Test: margin="15px" should become margin: 15
        // In PDFMake, if all margin values are the same, we can use a single number
        const result = converter.convertToPDFMake(tableMarginXML);
        
        assert.ok(result, 'Should return result');
        assert.ok(result.content, 'Should have content array');
        assert.ok(result.content.length > 1, 'Should have at least two content items');
        
        // Find the second table (with single-value margin)
        const tables = result.content.filter(item => item.table);
        assert.ok(tables.length >= 2, 'Should have at least two tables');
        
        const secondTable = tables[1];
        assert.ok(secondTable.margin, 'Table should have margin property');
        
        // For single value, parseMargin returns array [15, 15, 15, 15]
        // parseNumericValue returns numeric value without unit conversion (15px -> 15)
        assert.ok(Array.isArray(secondTable.margin), 'Margin should be an array');
        assert.equal(secondTable.margin.length, 4, 'Margin array should have 4 values');
        assert.equal(secondTable.margin[0], 15, 'All margins should be 15 (from 15px)');
        assert.equal(secondTable.margin[1], 15, 'All margins should be 15');
        assert.equal(secondTable.margin[2], 15, 'All margins should be 15');
        assert.equal(secondTable.margin[3], 15, 'All margins should be 15');
    });
    
    testRunner.addTest('Should convert margin correctly to PDFMake format', () => {
        // Verify the conversion logic: XSL-FO "top right bottom left" -> PDFMake [left, top, right, bottom]
        const result = converter.convertToPDFMake(tableMarginXML);
        
        assert.ok(result, 'Should return result');
        const tables = result.content.filter(item => item.table);
        
        // First table: "20px 0px 0px 0px" -> [0, 20, 0, 0]
        const firstTable = tables[0];
        if (firstTable && firstTable.margin && Array.isArray(firstTable.margin)) {
            // Verify format conversion: [left, top, right, bottom]
            assert.equal(firstTable.margin[0], 0, 'Left margin (index 0) should be 0');
            assert.equal(firstTable.margin[1], 20, 'Top margin (index 1) should be 20');
            assert.equal(firstTable.margin[2], 0, 'Right margin (index 2) should be 0');
            assert.equal(firstTable.margin[3], 0, 'Bottom margin (index 3) should be 0');
        }
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerTableMarginTests };
}
if (typeof window !== 'undefined') {
    window.registerTableMarginTests = registerTableMarginTests;
}

