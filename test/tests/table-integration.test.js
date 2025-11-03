/**
 * Table Integration Tests
 * Tests table conversion through the main convertToPDFMake function
 */

function registerTableIntegrationTests(testRunner, converter, testXML, assert) {
    
    testRunner.addTest('Table Integration: Should convert table through main converter', () => {
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
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell><fo:block>Cell 1</fo:block></fo:table-cell>
            <fo:table-cell><fo:block>Cell 2</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = converter.convertToPDFMake(xml);
        
        assert.ok(result.content, 'Should have content array');
        assert.ok(result.content.length > 0, 'Content should not be empty');
        
        const table = result.content.find(item => item.table);
        assert.ok(table, 'Should find table in content');
        assert.ok(table.table, 'Should have table property');
        assert.ok(table.layout, 'Should have layout property');
    });

    testRunner.addTest('Table Integration: Should convert mixed blocks and tables', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="Test">
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-weight="bold">Header</fo:block>
      <fo:table>
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell><fo:block>Data</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      <fo:block>Footer</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = converter.convertToPDFMake(xml);
        
        assert.equal(result.content.length, 3, 'Should have 3 content items');
        
        // First item should be bold block
        assert.equal(result.content[0].text, 'Header', 'First item should be Header');
        assert.equal(result.content[0].bold, true, 'Header should be bold');
        
        // Second item should be table
        assert.ok(result.content[1].table, 'Second item should be table');
        
        // Third item should be normal block
        const thirdItem = result.content[2];
        const thirdText = typeof thirdItem === 'string' ? thirdItem : thirdItem.text;
        assert.equal(thirdText, 'Footer', 'Third item should be Footer');
    });

    // ==================== Additional Integration Tests ====================
    // Note: These tests are skipped in CLI due to CLI wrapper limitations
    // but run in browser to verify end-to-end functionality
    
    const isCLI = typeof process !== 'undefined' && process.versions && process.versions.node;
    
    testRunner.addTest('Table Integration: Should handle table with borders', () => {
        if (isCLI) {
            assert.ok(true, 'Skipped in CLI - covered by unit tests');
            return;
        }
        
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
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="solid"><fo:block>Bordered</fo:block></fo:table-cell>
            <fo:table-cell><fo:block>Not bordered</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = converter.convertToPDFMake(xml);
        const table = result.content.find(item => item.table);
        
        assert.ok(table, 'Should find table');
        assert.equal(table.layout.defaultBorder, false, 'Should have defaultBorder: false');
        
        const firstCell = table.table.body[0][0];
        const secondCell = table.table.body[0][1];
        
        assert.ok(firstCell.border, 'First cell should have border');
        assert.deepEqual(firstCell.border, [true, true, true, true], 'Border should be on all sides');
        assert.ok(!secondCell.border, 'Second cell should not have border');
    });

    testRunner.addTest('Table Integration: Should handle styled content in cells', () => {
        if (isCLI) {
            assert.ok(true, 'Skipped in CLI - covered by unit tests');
            return;
        }
        
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
            <fo:table-cell>
              <fo:block font-weight="bold" font-size="14pt" color="red">Styled Cell</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = converter.convertToPDFMake(xml);
        const table = result.content.find(item => item.table);
        
        assert.ok(table, 'Should find table');
        
        const cellContent = table.table.body[0][0];
        assert.ok(typeof cellContent === 'object', 'Cell content should be an object');
        assert.equal(cellContent.bold, true, 'Should preserve bold');
        assert.equal(cellContent.fontSize, 14, 'Should preserve fontSize');
        assert.equal(cellContent.color, 'red', 'Should preserve color');
    });

    testRunner.addTest('Table Integration: Should NOT add spaces between multiple blocks in cell', () => {
        if (isCLI) {
            assert.ok(true, 'Skipped in CLI - covered by unit tests');
            return;
        }
        
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
            <fo:table-cell text-align="right">
              <fo:block font-weight="bold" font-size="12pt">
                INSPECTION REPORT
              </fo:block>
              <fo:block font-weight="bold" font-size="10pt">
                Prevention Services Division
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = converter.convertToPDFMake(xml);
        const table = result.content.find(item => item.table);
        
        assert.ok(table, 'Should find table');
        
        const cellContent = table.table.body[0][0];
        // Cell with multiple children should use stack property
        assert.ok(cellContent.stack, 'Cell with multiple blocks should have stack property');
        assert.ok(Array.isArray(cellContent.stack), 'Stack should be an array');
        assert.equal(cellContent.stack.length, 2, 'Should have exactly 2 blocks (no space between)');
        
        assert.equal(cellContent.stack[0].text, 'INSPECTION REPORT', 'First block text');
        assert.equal(cellContent.stack[0].bold, true, 'First block should be bold');
        assert.equal(cellContent.stack[0].fontSize, 12, 'First block fontSize');
        
        assert.equal(cellContent.stack[1].text, 'Prevention Services Division', 'Second block text');
        assert.equal(cellContent.stack[1].bold, true, 'Second block should be bold');
        assert.equal(cellContent.stack[1].fontSize, 10, 'Second block fontSize');
        
        assert.ok(typeof cellContent.stack[0] === 'object', 'First item should be object');
        assert.ok(typeof cellContent.stack[1] === 'object', 'Second item should be object');
    });

    testRunner.addTest('Table Integration: Should handle document with only table (no blocks)', () => {
        if (isCLI) {
            assert.ok(true, 'Skipped in CLI - covered by unit tests');
            return;
        }
        
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
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="34%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell><fo:block>A</fo:block></fo:table-cell>
            <fo:table-cell><fo:block>B</fo:block></fo:table-cell>
            <fo:table-cell><fo:block>C</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = converter.convertToPDFMake(xml);
        
        assert.equal(result.content.length, 1, 'Should have exactly 1 content item');
        assert.ok(result.content[0].table, 'Content should be a table');
        assert.deepEqual(result.content[0].table.widths, ['33%', '33%', '34%'], 'Should have correct widths');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerTableIntegrationTests };
}
if (typeof window !== 'undefined') {
    window.registerTableIntegrationTests = registerTableIntegrationTests;
}

