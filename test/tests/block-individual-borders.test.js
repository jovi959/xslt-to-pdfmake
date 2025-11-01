/**
 * Block Individual Borders Tests
 * 
 * Tests for fo:block elements with individual border sides (top, bottom, left, right).
 * Each side can have its own width, color, and style.
 */

function registerBlockIndividualBordersTests(testRunner, converter, blockBordersXML, assert) {
    
    testRunner.addTest('Should convert block with border-bottom override to table', () => {
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block text-align="center" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt" background-color="#DFDFDF" border-bottom-width="0px">
                ORDER STATUS LEGEND
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
        
        assert.ok(result.content, 'Should have content');
        assert.ok(result.content.length > 0, 'Should have at least one content item');
        
        const block = result.content[0];
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
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block border-top-style="solid" border-top-width="1pt" border-bottom-style="solid" border-bottom-width="3pt" border-bottom-color="#FF0000">
                Block with only top and bottom borders
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
        const block = result.content[0];
        
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
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block border-left-style="solid" border-left-width="4pt" border-right-style="solid" border-right-width="1pt" border-right-color="blue">
                Block with only left and right borders
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
        const block = result.content[0];
        
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
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block border-top-width="2pt" border-top-color="red" border-left-width="1pt" border-left-color="green" border-right-width="1pt" border-right-color="blue" border-bottom-width="2pt" border-bottom-color="yellow">
                Block with all sides different
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
        const block = result.content[0];
        
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
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block font-size="12pt">
                Regular block without borders
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
        const block = result.content[0];
        
        assert.ok(!block.table, 'Should NOT convert to table structure');
        assert.ok(block.text, 'Should be a regular text block');
    });
    
    // ==================== Individual Border Shorthand Tests ====================
    
    testRunner.addTest('Should parse border-bottom shorthand', () => {
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block border-bottom="1px solid black" padding="5px 0px 5px 0px">
                <fo:inline font-weight="bold">WCA72(2)</fo:inline>
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
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
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block border-top="2pt dashed red">
                Content with top border
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
        const block = result.content[0];
        
        assert.ok(block.table, 'Should convert to table structure');
        
        // Test border widths: only top should have border
        assert.equal(block.layout.hLineWidth(0), 2, 'Top border should be 2pt');
        assert.equal(block.layout.hLineWidth(1), 0, 'Bottom border should be 0 (none)');
        
        // Test border colors
        assert.equal(block.layout.hLineColor(0), 'red', 'Top border should be red');
    });
    
    testRunner.addTest('Should parse border-left and border-right shorthand', () => {
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block border-left="3px solid green" border-right="1px solid blue">
                Content with left and right borders
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
        const block = result.content[0];
        
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
        const xslfo = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body margin="0.5in"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="A4">
            <fo:flow flow-name="xsl-region-body">
              <fo:block border="2px solid black" border-bottom="4px dashed red">
                General border with bottom override
              </fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;
        
        const result = converter.convertToPDFMake(xslfo);
        const block = result.content[0];
        
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

