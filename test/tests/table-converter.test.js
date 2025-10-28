/**
 * Table Converter Tests
 * Tests for XSL-FO table conversion to PDFMake
 */

function registerTableConverterTests(testRunner, converter, testXML, assert) {
    // Get environment-specific modules
    const RecursiveTraversal = typeof window !== 'undefined' && window.RecursiveTraversal 
        ? window.RecursiveTraversal 
        : (typeof require === 'function' ? require('../../src/recursive-traversal.js') : null);
    
    const TableConverter = typeof window !== 'undefined' && window.TableConverter 
        ? window.TableConverter 
        : (typeof require === 'function' ? require('../../src/table-converter.js') : null);

    // Helper to parse XML
    function parseXML(xml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        return xmlDoc.documentElement;
    }

    // ==================== Basic Table Structure Tests ====================
    
    testRunner.addTest('Table: Should convert basic table structure', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="50%"/>
  <fo:table-column column-width="50%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell>
        <fo:block>Cell 1</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block>Cell 2</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        assert.ok(result.table, 'Should have table property');
        assert.ok(result.layout, 'Should have layout property');
        assert.equal(result.layout.defaultBorder, false, 'Should have defaultBorder: false');
        assert.deepEqual(result.table.widths, ['50%', '50%'], 'Should have correct column widths');
        assert.equal(result.table.body.length, 1, 'Should have 1 row');
        assert.equal(result.table.body[0].length, 2, 'Row should have 2 cells');
    });

    testRunner.addTest('Table: Should extract column widths correctly', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="30%"/>
  <fo:table-column column-width="70%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell><fo:block>A</fo:block></fo:table-cell>
      <fo:table-cell><fo:block>B</fo:block></fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        assert.deepEqual(result.table.widths, ['30%', '70%'], 'Should parse column widths correctly');
    });

    testRunner.addTest('Table: Should handle table with no column definitions', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell><fo:block>A</fo:block></fo:table-cell>
      <fo:table-cell><fo:block>B</fo:block></fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        assert.deepEqual(result.table.widths, ['*'], 'Should default to auto width');
    });

    // ==================== Cell Border Tests ====================
    
    testRunner.addTest('Table: Should handle cell with border attribute', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="50%"/>
  <fo:table-column column-width="50%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell border="solid">
        <fo:block>Bordered cell</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block>No border</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        const firstCell = result.table.body[0][0];
        const secondCell = result.table.body[0][1];
        
        assert.ok(typeof firstCell === 'object', 'Bordered cell should be an object');
        assert.deepEqual(firstCell.border, [true, true, true, true], 'Should have border on all sides');
        assert.ok(typeof secondCell === 'string' || (typeof secondCell === 'object' && !secondCell.border), 
                  'Non-bordered cell should not have border property');
    });

    testRunner.addTest('Table: Should handle multiple rows with mixed borders', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="50%"/>
  <fo:table-column column-width="50%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell><fo:block>No border</fo:block></fo:table-cell>
      <fo:table-cell><fo:block>No border</fo:block></fo:table-cell>
    </fo:table-row>
    <fo:table-row>
      <fo:table-cell border="solid"><fo:block>With border</fo:block></fo:table-cell>
      <fo:table-cell border="solid"><fo:block>With border</fo:block></fo:table-cell>
    </fo:table-row>
    <fo:table-row>
      <fo:table-cell><fo:block>No border</fo:block></fo:table-cell>
      <fo:table-cell><fo:block>No border</fo:block></fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        assert.equal(result.table.body.length, 3, 'Should have 3 rows');
        
        // Row 1: No borders
        assert.ok(!result.table.body[0][0].border, 'Row 1 cell 1 should not have border');
        
        // Row 2: With borders
        assert.deepEqual(result.table.body[1][0].border, [true, true, true, true], 'Row 2 cell 1 should have border');
        assert.deepEqual(result.table.body[1][1].border, [true, true, true, true], 'Row 2 cell 2 should have border');
        
        // Row 3: No borders
        assert.ok(!result.table.body[2][0].border, 'Row 3 cell 1 should not have border');
    });

    // ==================== Cell Content Tests ====================
    
    testRunner.addTest('Table: Should convert block content inside cells', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="100%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell>
        <fo:block font-weight="bold" font-size="12pt">Bold text</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        const cellContent = result.table.body[0][0];
        
        assert.ok(typeof cellContent === 'object', 'Cell content should be an object with styling');
        assert.equal(cellContent.bold, true, 'Should preserve bold');
        assert.equal(cellContent.fontSize, 12, 'Should preserve fontSize');
    });

    testRunner.addTest('Table: Should handle cell with longer text', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="50%"/>
  <fo:table-column column-width="50%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell>
        <fo:block>Table cell with more text in it</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block>Short</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        assert.equal(result.table.body[0][0], 'Table cell with more text in it', 'Should handle longer text');
        assert.equal(result.table.body[0][1], 'Short', 'Should handle short text');
    });

    testRunner.addTest('Table: Should handle empty cells', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="50%"/>
  <fo:table-column column-width="50%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell><fo:block></fo:block></fo:table-cell>
      <fo:table-cell><fo:block>Content</fo:block></fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        // Empty block should return '\n' based on self-closing block behavior
        const firstCell = result.table.body[0][0];
        assert.ok(firstCell === '\n' || firstCell === '', 'Empty cell should be newline or empty string');
        assert.equal(result.table.body[0][1], 'Content', 'Second cell should have content');
    });

    // ==================== Complex Table Tests ====================
    
    testRunner.addTest('Table: Should handle 3+ column table', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
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
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        assert.deepEqual(result.table.widths, ['33%', '33%', '34%'], 'Should have 3 column widths');
        assert.equal(result.table.body[0].length, 3, 'Row should have 3 cells');
    });

    testRunner.addTest('Table: Should handle multiple rows', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="50%"/>
  <fo:table-column column-width="50%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell><fo:block>Row 1 Cell 1</fo:block></fo:table-cell>
      <fo:table-cell><fo:block>Row 1 Cell 2</fo:block></fo:table-cell>
    </fo:table-row>
    <fo:table-row>
      <fo:table-cell><fo:block>Row 2 Cell 1</fo:block></fo:table-cell>
      <fo:table-cell><fo:block>Row 2 Cell 2</fo:block></fo:table-cell>
    </fo:table-row>
    <fo:table-row>
      <fo:table-cell><fo:block>Row 3 Cell 1</fo:block></fo:table-cell>
      <fo:table-cell><fo:block>Row 3 Cell 2</fo:block></fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        assert.equal(result.table.body.length, 3, 'Should have 3 rows');
        assert.equal(result.table.body[0][0], 'Row 1 Cell 1', 'Row 1 Cell 1 content');
        assert.equal(result.table.body[1][0], 'Row 2 Cell 1', 'Row 2 Cell 1 content');
        assert.equal(result.table.body[2][0], 'Row 3 Cell 1', 'Row 3 Cell 1 content');
    });

    // ==================== User Example Tests ====================
    
    testRunner.addTest('Table: Should NOT add spaces between multiple blocks in a cell', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="100%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell>
        <fo:block font-weight="bold" font-size="12pt">
          INSPECTION REPORT
        </fo:block>
        <fo:block font-weight="bold" font-size="10pt">
          Prevention Services Division
        </fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        const cellContent = result.table.body[0][0];
        
        assert.ok(Array.isArray(cellContent), 'Cell with multiple blocks should be an array');
        assert.equal(cellContent.length, 2, 'Should have exactly 2 blocks, no spaces between');
        
        // First block
        assert.equal(cellContent[0].text, 'INSPECTION REPORT', 'First block text');
        assert.equal(cellContent[0].bold, true, 'First block should be bold');
        assert.equal(cellContent[0].fontSize, 12, 'First block fontSize');
        
        // Second block (no space between!)
        assert.equal(cellContent[1].text, 'Prevention Services Division', 'Second block text');
        assert.equal(cellContent[1].bold, true, 'Second block should be bold');
        assert.equal(cellContent[1].fontSize, 10, 'Second block fontSize');
        
        // Verify NO space was inserted
        assert.ok(typeof cellContent[0] === 'object', 'First item should be block object');
        assert.ok(typeof cellContent[1] === 'object', 'Second item should be block object');
        // If a space was inserted, length would be 3 and middle item would be a string
    });

    testRunner.addTest('Table: User Example 1 - Mixed borders', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="50%"/>
  <fo:table-column column-width="50%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell>
        <fo:block>Table cell</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block>Table cell</fo:block>
      </fo:table-cell>
    </fo:table-row>
    <fo:table-row>
      <fo:table-cell border="solid">
        <fo:block>Table cell with more text in it</fo:block>
      </fo:table-cell>
      <fo:table-cell border="solid">
        <fo:block>Table cell</fo:block>
      </fo:table-cell>
    </fo:table-row>
    <fo:table-row>
      <fo:table-cell>
        <fo:block>Table cell</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block>Table cell</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        // Verify structure matches user's expected output
        assert.equal(result.layout.defaultBorder, false, 'Should have defaultBorder: false');
        assert.deepEqual(result.table.widths, ['50%', '50%'], 'Should have 50/50 widths');
        assert.equal(result.table.body.length, 3, 'Should have 3 rows');
        
        // Row 1: No borders
        assert.equal(result.table.body[0][0], 'Table cell', 'Row 1 Cell 1');
        assert.equal(result.table.body[0][1], 'Table cell', 'Row 1 Cell 2');
        
        // Row 2: With borders
        assert.ok(result.table.body[1][0].border, 'Row 2 Cell 1 should have border');
        assert.equal(result.table.body[1][0].text, 'Table cell with more text in it', 'Row 2 Cell 1 text');
        assert.deepEqual(result.table.body[1][0].border, [true, true, true, true], 'Row 2 Cell 1 border');
        
        assert.ok(result.table.body[1][1].border, 'Row 2 Cell 2 should have border');
        assert.equal(result.table.body[1][1].text, 'Table cell', 'Row 2 Cell 2 text');
        assert.deepEqual(result.table.body[1][1].border, [true, true, true, true], 'Row 2 Cell 2 border');
        
        // Row 3: No borders
        assert.equal(result.table.body[2][0], 'Table cell', 'Row 3 Cell 1');
        assert.equal(result.table.body[2][1], 'Table cell', 'Row 3 Cell 2');
    });
}

// ==================== Column Spanning Unit Tests ====================
function registerTableColspanUnitTests(testRunner, converter, tableColspanXML, assert) {
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
    
    testRunner.addTest('Table: Should handle colspan of 2 at start of row', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="33%"/>
  <fo:table-column column-width="33%"/>
  <fo:table-column column-width="34%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell number-columns-spanned="2">
        <fo:block>Spans 2</fo:block>
      </fo:table-cell>
      <fo:table-cell>
        <fo:block>Cell C</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        assert.equal(result.table.body.length, 1, 'Should have 1 row');
        const row = result.table.body[0];
        assert.equal(row.length, 3, 'Row should have 3 cells (1 spanning + 1 placeholder + 1 normal)');
        
        // Check spanning cell
        assert.ok(typeof row[0] === 'object', 'First cell should be an object');
        assert.equal(row[0].colSpan, 2, 'First cell should have colSpan of 2');
        assert.equal(row[0].text, 'Spans 2', 'First cell should have correct text');
        
        // Check placeholder
        assert.deepEqual(row[1], {}, 'Second cell should be empty placeholder');
        
        // Check normal cell
        assert.equal(row[2], 'Cell C', 'Third cell should be normal');
    });

    testRunner.addTest('Table: Should handle colspan of 2 in middle of row', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="33%"/>
  <fo:table-column column-width="33%"/>
  <fo:table-column column-width="34%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell>
        <fo:block>Cell A</fo:block>
      </fo:table-cell>
      <fo:table-cell number-columns-spanned="2">
        <fo:block>Spans 2</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        const row = result.table.body[0];
        assert.equal(row.length, 3, 'Row should have 3 cells');
        assert.equal(row[0], 'Cell A', 'First cell should be normal');
        assert.equal(row[1].colSpan, 2, 'Second cell should have colSpan of 2');
        assert.deepEqual(row[2], {}, 'Third cell should be empty placeholder');
    });

    testRunner.addTest('Table: Should handle colspan spanning all columns', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="33%"/>
  <fo:table-column column-width="33%"/>
  <fo:table-column column-width="34%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell number-columns-spanned="3">
        <fo:block>Spans all 3</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        const row = result.table.body[0];
        assert.equal(row.length, 3, 'Row should have 3 cells (1 spanning + 2 placeholders)');
        assert.equal(row[0].colSpan, 3, 'First cell should have colSpan of 3');
        assert.deepEqual(row[1], {}, 'Second cell should be empty placeholder');
        assert.deepEqual(row[2], {}, 'Third cell should be empty placeholder');
    });

    testRunner.addTest('Table: Should handle multiple colspans in same row', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="25%"/>
  <fo:table-column column-width="25%"/>
  <fo:table-column column-width="25%"/>
  <fo:table-column column-width="25%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell number-columns-spanned="2">
        <fo:block>Spans 2 (A+B)</fo:block>
      </fo:table-cell>
      <fo:table-cell number-columns-spanned="2">
        <fo:block>Spans 2 (C+D)</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        const row = result.table.body[0];
        assert.equal(row.length, 4, 'Row should have 4 cells (2 spanning + 2 placeholders)');
        assert.equal(row[0].colSpan, 2, 'First cell should span 2');
        assert.deepEqual(row[1], {}, 'Second cell should be placeholder');
        assert.equal(row[2].colSpan, 2, 'Third cell should span 2');
        assert.deepEqual(row[3], {}, 'Fourth cell should be placeholder');
    });

    testRunner.addTest('Table: Should handle colspan with borders', () => {
        const xml = `<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="50%"/>
  <fo:table-column column-width="50%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell number-columns-spanned="2" border="solid">
        <fo:block>Spans both with border</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>`;
        
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, TableConverter.convertTable);
        
        const row = result.table.body[0];
        assert.equal(row.length, 2, 'Row should have 2 cells (1 spanning + 1 placeholder)');
        assert.equal(row[0].colSpan, 2, 'Cell should have colSpan');
        assert.ok(row[0].border, 'Cell should have border');
        assert.deepEqual(row[0].border, [true, true, true, true], 'Border should be on all sides');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerTableConverterTests, registerTableColspanUnitTests };
}
if (typeof window !== 'undefined') {
    window.registerTableConverterTests = registerTableConverterTests;
    window.registerTableColspanUnitTests = registerTableColspanUnitTests;
}

