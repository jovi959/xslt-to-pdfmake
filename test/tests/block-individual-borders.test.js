/**
 * Block Individual Borders Tests
 * 
 * Tests for fo:block elements with individual border sides (top, bottom, left, right).
 * Each side can have its own width, color, and style.
 * 
 * Test data: test/data/block_individual_borders.xslt
 */

function registerBlockIndividualBordersTests(testRunner, converter, blockBordersXML, assert) {
    
    // Parse the test data once
    const result = converter.convertToPDFMake(blockBordersXML);
    
    testRunner.addTest('Should convert block with border-bottom override to table', () => {
        // Block index 5: border-bottom-width="0px" override
        const block = result.content[5];
        assert.ok(block.table, 'Should convert to table structure');
        assert.ok(block.layout, 'Should have layout for border styling');
        
        // Check cell content
        const cell = block.table.body[0][0];
        assert.equal(cell.text, 'ORDER STATUS LEGEND', 'Should preserve text content');
        assert.equal(cell.alignment, 'center', 'Should have center alignment');
        assert.equal(cell.fontSize, 8, 'Should have font size 8');
        assert.equal(cell.fillColor, '#DFDFDF', 'Should have background color');
        
        // Check layout functions
        assert.ok(typeof block.layout.hLineWidth === 'function', 'Should have hLineWidth function');
        assert.ok(typeof block.layout.vLineWidth === 'function', 'Should have vLineWidth function');
        assert.ok(typeof block.layout.hLineColor === 'function', 'Should have hLineColor function');
        assert.ok(typeof block.layout.vLineColor === 'function', 'Should have vLineColor function');
        
        // Test border widths: top should be 0.5, bottom should be 0
        assert.equal(block.layout.hLineWidth(0), 0.5, 'Top border should be 0.5pt');
        assert.equal(block.layout.hLineWidth(1), 0, 'Bottom border should be 0 (overridden)');
        
        // Test border colors
        assert.equal(block.layout.hLineColor(0), '#000000', 'Top border color should be black');
        assert.equal(block.layout.vLineColor(0), '#000000', 'Left border color should be black');
    });
    
    testRunner.addTest('Should convert block with only top and bottom borders', () => {
        // Block index 6: Only top and bottom borders (explicit width/color/style)
        const block = result.content[6];
        
        assert.ok(block.table, 'Should convert to table structure');
        assert.ok(block.layout, 'Should have layout for border styling');
        
        // Check cell content
        const cell = block.table.body[0][0];
        assert.equal(cell.text, 'Block with only top and bottom borders', 'Should preserve text content');
        
        // Test border widths: only top and bottom
        assert.equal(block.layout.hLineWidth(0), 1, 'Top border should be 1pt');
        assert.equal(block.layout.hLineWidth(1), 3, 'Bottom border should be 3pt');
        assert.equal(block.layout.vLineWidth(0), 0, 'Left border should be 0 (none)');
        assert.equal(block.layout.vLineWidth(1), 0, 'Right border should be 0 (none)');
        
        // Test border colors
        assert.equal(block.layout.hLineColor(1), '#FF0000', 'Bottom border should be red');
        assert.equal(block.layout.hLineColor(0), '#000000', 'Top border should default to black');
    });
    
    testRunner.addTest('Should convert block with only left and right borders', () => {
        // Block index 7: Only left and right borders (explicit width/color/style)
        const block = result.content[7];
        
        assert.ok(block.table, 'Should convert to table structure');
        assert.ok(block.layout, 'Should have layout for border styling');
        
        // Check cell content
        const cell = block.table.body[0][0];
        assert.equal(cell.text, 'Block with only left and right borders', 'Should preserve text content');
        
        // Test border widths: only left and right
        assert.equal(block.layout.hLineWidth(0), 0, 'Top border should be 0 (none)');
        assert.equal(block.layout.hLineWidth(1), 0, 'Bottom border should be 0 (none)');
        assert.equal(block.layout.vLineWidth(0), 4, 'Left border should be 4pt');
        assert.equal(block.layout.vLineWidth(1), 1, 'Right border should be 1pt');
        
        // Test border colors
        assert.equal(block.layout.vLineColor(1), 'blue', 'Right border should be blue');
        assert.equal(block.layout.vLineColor(0), '#000000', 'Left border should default to black');
    });
    
    testRunner.addTest('Should handle block with mixed border properties', () => {
        // Block index 8: All sides with different properties
        const block = result.content[8];
        
        assert.ok(block.table, 'Should convert to table structure');
        assert.ok(block.layout, 'Should have layout for border styling');
        
        // Test all border widths
        assert.equal(block.layout.hLineWidth(0), 2, 'Top border should be 2pt');
        assert.equal(block.layout.hLineWidth(1), 2, 'Bottom border should be 2pt');
        assert.equal(block.layout.vLineWidth(0), 1, 'Left border should be 1pt');
        assert.equal(block.layout.vLineWidth(1), 1, 'Right border should be 1pt');
        
        // Test all border colors
        assert.equal(block.layout.hLineColor(0), 'red', 'Top border should be red');
        assert.equal(block.layout.hLineColor(1), 'yellow', 'Bottom border should be yellow');
        assert.equal(block.layout.vLineColor(0), 'green', 'Left border should be green');
        assert.equal(block.layout.vLineColor(1), 'blue', 'Right border should be blue');
    });
    
    testRunner.addTest('Should not convert block without borders to table', () => {
        // Block index 4: No borders (should not convert to table)
        const block = result.content[4];
        
        assert.ok(!block.table, 'Should NOT convert to table structure');
        assert.ok(block.text, 'Should be a regular text block');
    });
    
    // ==================== Individual Border Shorthand Tests ====================
    
    testRunner.addTest('Should parse border-bottom shorthand', () => {
        // Block index 0: border-bottom shorthand (user's specific case)
        const block = result.content[0];
        
        assert.ok(block.table, 'Should convert to table structure');
        assert.ok(block.layout, 'Should have layout for border styling');
        
        // Test border widths: only bottom should have border
        assert.equal(block.layout.hLineWidth(0), 0, 'Top border should be 0 (none)');
        assert.equal(block.layout.hLineWidth(1), 1, 'Bottom border should be 1px');
        assert.equal(block.layout.vLineWidth(0), 0, 'Left border should be 0 (none)');
        assert.equal(block.layout.vLineWidth(1), 0, 'Right border should be 0 (none)');
        
        // Test border colors
        assert.equal(block.layout.hLineColor(1), 'black', 'Bottom border should be black');
    });
    
    testRunner.addTest('Should parse border-top shorthand', () => {
        // Block index 1: border-top shorthand
        const block = result.content[1];
        
        assert.ok(block.table, 'Should convert to table structure');
        
        // Test border widths: only top should have border
        assert.equal(block.layout.hLineWidth(0), 2, 'Top border should be 2pt');
        assert.equal(block.layout.hLineWidth(1), 0, 'Bottom border should be 0 (none)');
        
        // Test border colors
        assert.equal(block.layout.hLineColor(0), 'red', 'Top border should be red');
    });
    
    testRunner.addTest('Should parse border-left and border-right shorthand', () => {
        // Block index 2: border-left and border-right shorthand
        const block = result.content[2];
        
        assert.ok(block.table, 'Should convert to table structure');
        
        // Test border widths
        assert.equal(block.layout.hLineWidth(0), 0, 'Top border should be 0 (none)');
        assert.equal(block.layout.hLineWidth(1), 0, 'Bottom border should be 0 (none)');
        assert.equal(block.layout.vLineWidth(0), 3, 'Left border should be 3px');
        assert.equal(block.layout.vLineWidth(1), 1, 'Right border should be 1px');
        
        // Test border colors
        assert.equal(block.layout.vLineColor(0), 'green', 'Left border should be green');
        assert.equal(block.layout.vLineColor(1), 'blue', 'Right border should be blue');
    });
    
    testRunner.addTest('Should handle individual shorthand overriding general border', () => {
        // Block index 3: General border with bottom shorthand override
        const block = result.content[3];
        
        assert.ok(block.table, 'Should convert to table structure');
        
        // Test border widths: top/left/right should be 2px, bottom should be 4px (override)
        assert.equal(block.layout.hLineWidth(0), 2, 'Top border should be 2px (from general border)');
        assert.equal(block.layout.hLineWidth(1), 4, 'Bottom border should be 4px (from border-bottom)');
        assert.equal(block.layout.vLineWidth(0), 2, 'Left border should be 2px (from general border)');
        assert.equal(block.layout.vLineWidth(1), 2, 'Right border should be 2px (from general border)');
        
        // Test border colors
        assert.equal(block.layout.hLineColor(0), 'black', 'Top border should be black');
        assert.equal(block.layout.hLineColor(1), 'red', 'Bottom border should be red (override)');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerBlockIndividualBordersTests };
}
if (typeof window !== 'undefined') {
    window.registerBlockIndividualBordersTests = registerBlockIndividualBordersTests;
}

