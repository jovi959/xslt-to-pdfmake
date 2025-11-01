/**
 * Table Padding to Margin Tests
 * 
 * Tests that padding on <fo:table> elements is converted to PDFMake margin.
 * In XSL-FO, padding on a table container should be interpreted as spacing
 * around the table (margin in PDFMake), not as cell padding.
 */

function registerTablePaddingToMarginTests(testRunner, converter, tablePaddingXML, assert) {
    
    testRunner.addTest('Should convert table padding to margin', () => {
        // Use inline XML instead of loaded file to avoid loading issues
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="Test">
    <fo:flow flow-name="xsl-region-body">
      <fo:table padding="20px">
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell Content</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = converter.convertToPDFMake(xml);
        
        assert.ok(result, 'Should return result');
        assert.ok(result.content, 'Should have content array');
        assert.ok(result.content.length > 0, 'Content should not be empty');
        
        // Find the table in content
        const table = result.content.find(item => item.table);
        assert.ok(table, 'Should have a table');
        assert.ok(table.margin, 'Table should have margin property');
        
        // Padding "20px" (all sides) 
        // should become margin [20, 20, 20, 20] (left, top, right, bottom)
        assert.deepEqual(table.margin, [20, 20, 20, 20], 
            'Should convert padding to margin [left, top, right, bottom]');
    });
    
    testRunner.addTest('Should convert table padding with all sides', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="Test">
    <fo:flow flow-name="xsl-region-body">
      <fo:table padding="10px 20px 30px 40px">
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell Content</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        const result = converter.convertToPDFMake(xml);
        const table = result.content.find(item => item.table);
        
        // padding "10px 20px 30px 40px" (top right bottom left)
        // should become margin [40, 10, 20, 30] (left, top, right, bottom)
        assert.deepEqual(table.margin, [40, 10, 20, 30], 
            'Should convert all padding sides to margin');
    });
    
    testRunner.addTest('Should handle table padding with two values', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="Test">
    <fo:flow flow-name="xsl-region-body">
      <fo:table padding="10px 20px">
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell Content</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        const result = converter.convertToPDFMake(xml);
        const table = result.content.find(item => item.table);
        
        // padding "10px 20px" (vertical horizontal)
        // should become margin [20, 10, 20, 10] (left, top, right, bottom)
        assert.deepEqual(table.margin, [20, 10, 20, 10], 
            'Should convert two-value padding to margin');
    });
    
    testRunner.addTest('Should handle table padding with single value', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="Test">
    <fo:flow flow-name="xsl-region-body">
      <fo:table padding="15px">
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell Content</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        const result = converter.convertToPDFMake(xml);
        const table = result.content.find(item => item.table);
        
        // padding "15px" (all sides)
        // should become margin [15, 15, 15, 15]
        assert.deepEqual(table.margin, [15, 15, 15, 15], 
            'Should convert single-value padding to margin on all sides');
    });
    
    testRunner.addTest('Should not add margin if table has no padding', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="Test">
    <fo:flow flow-name="xsl-region-body">
      <fo:table>
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell Content</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        const result = converter.convertToPDFMake(xml);
        const table = result.content.find(item => item.table);
        
        assert.ok(!table.margin, 'Table without padding should not have margin');
    });
    
    testRunner.addTest('Should preserve cell borders when table has padding', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="Test">
    <fo:flow flow-name="xsl-region-body">
      <fo:table padding="5px 10px">
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell Content</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        const result = converter.convertToPDFMake(xml);
        const table = result.content.find(item => item.table);
        
        assert.ok(table, 'Should have a table');
        assert.ok(table.table, 'Should have table structure');
        assert.ok(table.layout, 'Should have layout property');
        
        // Verify margin is set from padding
        // padding="5px 10px" means vertical=5px, horizontal=10px
        // So: top=5px, right=10px, bottom=5px, left=10px
        // PDFMake margin: [left, top, right, bottom] = [10, 5, 10, 5]
        assert.ok(table.margin, 'Should have margin from padding');
        assert.deepEqual(table.margin, [10, 5, 10, 5], 
            'Should convert padding="5px 10px" to margin [10, 5, 10, 5]');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerTablePaddingToMarginTests };
}
if (typeof window !== 'undefined') {
    window.registerTablePaddingToMarginTests = registerTablePaddingToMarginTests;
}

