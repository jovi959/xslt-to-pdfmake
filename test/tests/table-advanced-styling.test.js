/**
 * Advanced Table Styling Tests
 * 
 * Tests for:
 * - proportional-column-width()
 * - Cell-level padding, borders, background-color
 * - Table-level width attribute
 * - PDFMake layout functions for borders and padding
 */

function registerTableAdvancedStylingTests(testRunner, converter, emptyPageXML, assert) {
    const parseXML = (xmlString) => {
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlString, 'text/xml');
            return doc.documentElement;
        } else {
            const { parseXMLString } = require('../test-cli.js');
            const doc = parseXMLString(xmlString);
            return doc.documentElement;
        }
    };
    
    // Example 1: Border properties and padding on all cells with background color
    // NOTE: In this unit test, styling attributes are placed directly on blocks
    // In real usage with the full converter, these would be inherited from fo:table-cell
    testRunner.addTest('Table: Should handle cell borders, padding, and background color', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format" width="100%">
  <fo:table-column column-width="proportional-column-width(50)"/>
  <fo:table-column column-width="proportional-column-width(50)"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell padding="3pt 3pt 3pt 3pt" border-style="solid" border-color="#000000" border-width="0.5pt" background-color="#DFDFDF">
        <fo:block font-weight="bold" text-align="center" font-size="8pt">*Inspection Time</fo:block>
      </fo:table-cell>
      <fo:table-cell padding="3pt 3pt 3pt 3pt" border-style="solid" border-color="#000000" border-width="0.5pt" background-color="#DFDFDF">
        <fo:block font-weight="bold" text-align="center" font-size="8pt">*Travel Time</fo:block>
      </fo:table-cell>
    </fo:table-row>
    <fo:table-row>
      <fo:table-cell padding="3pt 3pt 3pt 3pt" border-style="solid" border-color="#000000" border-width="0.5pt">
        <fo:block font-size="8pt" text-align="center">0.25 hrs</fo:block>
      </fo:table-cell>
      <fo:table-cell padding="3pt 3pt 3pt 3pt" border-style="solid" border-color="#000000" border-width="0.5pt">
        <fo:block font-size="8pt" text-align="center">0 hrs</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        // Check table structure
        assert.ok(result.table, 'Should have table structure');
        assert.equal(result.table.widths.length, 2, 'Should have 2 columns');
        assert.equal(result.table.widths[0], '50%', 'First column should be 50%');
        assert.equal(result.table.widths[1], '50%', 'Second column should be 50%');
        
        // Check layout for borders and padding
        assert.ok(result.layout, 'Should have layout object');
        assert.ok(result.layout.hLineWidth, 'Should have border line width function');
        assert.ok(result.layout.paddingLeft, 'Should have padding functions');
        
        // Check first row (headers with background)
        const row1 = result.table.body[0];
        assert.equal(row1.length, 2, 'First row should have 2 cells');
        // Cell wrapper should have background color only
        assert.ok(row1[0].fillColor, 'First cell should have background color');
        assert.equal(row1[0].fillColor, '#DFDFDF', 'First cell background should be #DFDFDF');
        // Content styling is on the block inside
        assert.equal(row1[0].text, '*Inspection Time', 'First cell text');
        assert.equal(row1[0].bold, true, 'First cell should be bold');
        assert.equal(row1[0].alignment, 'center', 'First cell should be centered');
        assert.equal(row1[0].fontSize, 8, 'First cell font size');
        
        // Check second row (data)
        const row2 = result.table.body[1];
        assert.equal(row2[0].text, '0.25 hrs', 'Second row first cell text');
        assert.equal(row2[0].alignment, 'center', 'Second row should be centered');
        assert.equal(row2[0].fontSize, 8, 'Second row should have font size 8');
    });
    
    // Example 2: Proportional column widths with 1:2:1 ratio
    testRunner.addTest('Table: Should handle proportional-column-width with different ratios', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format" width="100%">
  <fo:table-column column-width="proportional-column-width(1)"/>
  <fo:table-column column-width="proportional-column-width(2)"/>
  <fo:table-column column-width="proportional-column-width(1)"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell>
        <fo:block text-align="left" font-style="italic">Left Italic</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block text-align="center" font-weight="bold">Center Bold</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block text-align="right" color="gray">Right Gray</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        // Check proportional widths (1:2:1 = 25%:50%:25%)
        assert.equal(result.table.widths.length, 3, 'Should have 3 columns');
        assert.equal(result.table.widths[0], '25%', 'First column should be 25%');
        assert.equal(result.table.widths[1], '50%', 'Second column should be 50%');
        assert.equal(result.table.widths[2], '25%', 'Third column should be 25%');
        
        // Check cell content and styling
        const row = result.table.body[0];
        assert.equal(row[0].text, 'Left Italic', 'First cell text');
        assert.equal(row[0].italics, true, 'First cell should be italic');
        assert.equal(row[0].alignment, 'left', 'First cell alignment');
        
        assert.equal(row[1].text, 'Center Bold', 'Second cell text');
        assert.equal(row[1].bold, true, 'Second cell should be bold');
        assert.equal(row[1].alignment, 'center', 'Second cell alignment');
        
        assert.equal(row[2].text, 'Right Gray', 'Third cell text');
        assert.equal(row[2].color, 'gray', 'Third cell color');
        assert.equal(row[2].alignment, 'right', 'Third cell alignment');
    });
    
    // Example 3: 70/30 split proportional widths
    testRunner.addTest('Table: Should handle 70/30 proportional column split', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format" width="100%">
  <fo:table-column column-width="proportional-column-width(70)"/>
  <fo:table-column column-width="proportional-column-width(30)"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell>
        <fo:block font-size="12pt" font-weight="bold">Main Item</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block font-size="9pt" text-align="right">Price</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        // Check proportional widths (70:30)
        assert.equal(result.table.widths.length, 2, 'Should have 2 columns');
        assert.equal(result.table.widths[0], '70%', 'First column should be 70%');
        assert.equal(result.table.widths[1], '30%', 'Second column should be 30%');
        
        // Check cell styling
        const row = result.table.body[0];
        assert.equal(row[0].text, 'Main Item', 'First cell text');
        assert.equal(row[0].fontSize, 12, 'First cell font size');
        assert.equal(row[0].bold, true, 'First cell should be bold');
        
        assert.equal(row[1].text, 'Price', 'Second cell text');
        assert.equal(row[1].fontSize, 9, 'Second cell font size');
        assert.equal(row[1].alignment, 'right', 'Second cell alignment');
    });
    
    // Example 4: Table width 50% with border shorthand and padding
    testRunner.addTest('Table: Should handle table width 50% and border shorthand', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format" width="50%">
  <fo:table-column column-width="proportional-column-width(50)"/>
  <fo:table-column column-width="proportional-column-width(50)"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell border="1pt solid black" padding="3pt">
        <fo:block>Cell 1 (25% Page)</fo:block>
      </fo:table-cell>
      <fo:table-cell border="1pt solid black" padding="3pt">
        <fo:block>Cell 2 (25% Page)</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        // With table width 50%, each 50% column becomes 25% of page
        assert.equal(result.table.widths.length, 2, 'Should have 2 columns');
        assert.equal(result.table.widths[0], '25%', 'First column should be 25% of page');
        assert.equal(result.table.widths[1], '25%', 'Second column should be 25% of page');
        
        // Check layout exists for borders and padding
        assert.ok(result.layout, 'Should have layout object');
        assert.ok(result.layout.hLineWidth, 'Should have border functions');
        assert.ok(result.layout.paddingLeft, 'Should have padding functions');
        
        // Check cell content (cells become objects because they have borders)
        const row = result.table.body[0];
        assert.ok(row[0], 'First cell should exist');
        assert.ok(row[1], 'Second cell should exist');
        // The text content is inside a block object
        assert.equal(row[0].text, 'Cell 1 (25% Page)', 'First cell text');
        assert.equal(row[1].text, 'Cell 2 (25% Page)', 'Second cell text');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerTableAdvancedStylingTests };
}
if (typeof window !== 'undefined') {
    window.registerTableAdvancedStylingTests = registerTableAdvancedStylingTests;
}

