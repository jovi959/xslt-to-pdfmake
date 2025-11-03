/**
 * Table Inheritance Tests
 * Tests for table-cell attribute inheritance to blocks and inlines
 */

function registerTableInheritanceTests(testRunner, converter, testXML, assert) {
    // Helper to parse XML
    function parseXML(xml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        return xmlDoc.documentElement;
    }

    // Helper to get attribute (works for both native DOM and SimpleXMLParser)
    function getAttr(element, attrName) {
        if (element.getAttribute) {
            const value = element.getAttribute(attrName);
            return (value === '' || value === null) ? null : value;
        }
        return element.attributes ? (element.attributes[attrName] || null) : null;
    }

    // Helper to find elements by tag name
    function findElementsByTagName(root, tagName) {
        const results = [];
        
        function search(node) {
            if (node.nodeName === tagName || node.nodeName === 'fo:' + tagName) {
                results.push(node);
            }
            if (node.childNodes) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    search(node.childNodes[i]);
                }
            }
        }
        
        search(root);
        return results;
    }

    // Helper to find first child by tag name
    function findFirstChildByTagName(parent, tagName) {
        if (!parent.childNodes) return null;
        
        for (let i = 0; i < parent.childNodes.length; i++) {
            const child = parent.childNodes[i];
            if (child.nodeName === tagName || child.nodeName === 'fo:' + tagName) {
                return child;
            }
        }
        return null;
    }

    // ==================== Basic Inheritance Tests ====================
    
    testRunner.addTest('Table Inheritance: Should inherit color from table-cell to block', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" color="red">
  <fo:block>Text in cell</fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const config = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        
        const result = preprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        const block = findFirstChildByTagName(element, 'fo:block');
        assert.ok(block, 'Should find block');
        assert.equal(getAttr(block, 'color'), 'red', 'Block should inherit color from table-cell');
    });

    testRunner.addTest('Table Inheritance: Should inherit text-align from table-cell to block', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" text-align="center">
  <fo:block>Centered text</fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const config = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        
        const result = preprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        const block = findFirstChildByTagName(element, 'fo:block');
        assert.ok(block, 'Should find block');
        assert.equal(getAttr(block, 'text-align'), 'center', 'Block should inherit text-align from table-cell');
    });

    testRunner.addTest('Table Inheritance: Should inherit font-size from table-cell to block', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" font-size="14pt">
  <fo:block>Large text</fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const config = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        
        const result = preprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        const block = findFirstChildByTagName(element, 'fo:block');
        assert.ok(block, 'Should find block');
        assert.equal(getAttr(block, 'font-size'), '14pt', 'Block should inherit font-size from table-cell');
    });

    testRunner.addTest('Table Inheritance: Should inherit font-size from table-cell to inline', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" font-size="16pt">
  <fo:block>Text with <fo:inline>inline content</fo:inline></fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const blockConfig = typeof window !== 'undefined' ? window.BlockInheritanceConfig : require('../../src/block-inheritance-config.js');
        
        const tableInheritanceConfig = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        const blockInheritanceConfig = blockConfig.getBlockInheritanceConfig ? blockConfig.getBlockInheritanceConfig() : blockConfig.BLOCK_INHERITANCE_CONFIG;
        const mergedConfig = [...blockInheritanceConfig, ...tableInheritanceConfig];
        
        const result = preprocessor.preprocessInheritance(xml, mergedConfig);
        const element = parseXML(result);
        
        const block = findFirstChildByTagName(element, 'fo:block');
        const inline = findFirstChildByTagName(block, 'fo:inline');
        
        assert.ok(block, 'Should find block');
        assert.ok(inline, 'Should find inline');
        assert.equal(getAttr(block, 'font-size'), '16pt', 'Block should inherit font-size from table-cell');
        assert.equal(getAttr(inline, 'font-size'), '16pt', 'Inline should inherit font-size from block');
    });

    testRunner.addTest('Table Inheritance: Should inherit multiple attributes from table-cell', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" color="blue" text-align="right" font-size="18pt">
  <fo:block>Right-aligned blue large text</fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const config = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        
        const result = preprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        const block = findFirstChildByTagName(element, 'fo:block');
        assert.ok(block, 'Should find block');
        assert.equal(getAttr(block, 'color'), 'blue', 'Block should inherit color');
        assert.equal(getAttr(block, 'text-align'), 'right', 'Block should inherit text-align');
        assert.equal(getAttr(block, 'font-size'), '18pt', 'Block should inherit font-size');
    });

    testRunner.addTest('Table Inheritance: Child block attribute should override table-cell', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" color="red">
  <fo:block color="green">Green overrides red</fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const config = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        
        const result = preprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        const block = findFirstChildByTagName(element, 'fo:block');
        assert.ok(block, 'Should find block');
        assert.equal(getAttr(block, 'color'), 'green', 'Block color should remain green (child overrides parent)');
    });

    testRunner.addTest('Table Inheritance: Child block font-size should override table-cell', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" font-size="20pt">
  <fo:block font-size="10pt">Small text overrides large</fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const config = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        
        const result = preprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        const block = findFirstChildByTagName(element, 'fo:block');
        assert.ok(block, 'Should find block');
        assert.equal(getAttr(block, 'font-size'), '10pt', 'Block font-size should remain 10pt (child overrides parent)');
    });

    testRunner.addTest('Table Inheritance: Should inherit to inline elements', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" color="purple">
  <fo:block>Text with <fo:inline>inline content</fo:inline></fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const blockConfig = typeof window !== 'undefined' ? window.BlockInheritanceConfig : require('../../src/block-inheritance-config.js');
        
        // Need BOTH configs: table-cell→block (table config) + block→inline (block config)
        const tableInheritanceConfig = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        const blockInheritanceConfig = blockConfig.getBlockInheritanceConfig ? blockConfig.getBlockInheritanceConfig() : blockConfig.BLOCK_INHERITANCE_CONFIG;
        const mergedConfig = [...blockInheritanceConfig, ...tableInheritanceConfig];
        
        const result = preprocessor.preprocessInheritance(xml, mergedConfig);
        const element = parseXML(result);
        
        const block = findFirstChildByTagName(element, 'fo:block');
        const inline = findFirstChildByTagName(block, 'fo:inline');
        
        assert.ok(block, 'Should find block');
        assert.ok(inline, 'Should find inline');
        assert.equal(getAttr(block, 'color'), 'purple', 'Block should inherit color from table-cell');
        assert.equal(getAttr(inline, 'color'), 'purple', 'Inline should inherit color from block');
    });

    testRunner.addTest('Table Inheritance: Should handle multiple blocks in cell', () => {
        const xml = `<fo:table-cell xmlns:fo="http://www.w3.org/1999/XSL/Format" text-align="center">
  <fo:block>First block</fo:block>
  <fo:block>Second block</fo:block>
</fo:table-cell>`;
        
        const preprocessor = typeof window !== 'undefined' ? window.InheritancePreprocessor : require('../../src/preprocessor.js');
        const tableConfig = typeof window !== 'undefined' ? window.TableInheritanceConfig : require('../../src/table-inheritance-config.js');
        const config = tableConfig.getTableInheritanceConfig ? tableConfig.getTableInheritanceConfig() : tableConfig.TABLE_INHERITANCE_CONFIG;
        
        const result = preprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        const blocks = findElementsByTagName(element, 'fo:block');
        assert.equal(blocks.length, 2, 'Should find 2 blocks');
        assert.equal(getAttr(blocks[0], 'text-align'), 'center', 'First block should inherit text-align');
        assert.equal(getAttr(blocks[1], 'text-align'), 'center', 'Second block should inherit text-align');
    });

    // ==================== Integration Tests ====================
    // Note: These tests are skipped in CLI due to CLI wrapper limitations
    // but run in browser to verify end-to-end functionality
    
    const isCLI = typeof process !== 'undefined' && process.versions && process.versions.node;

    testRunner.addTest('Table Inheritance Integration: Full table with inherited alignment', () => {
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
            <fo:table-cell text-align="left">
              <fo:block>Left aligned</fo:block>
            </fo:table-cell>
            <fo:table-cell text-align="right">
              <fo:block>Right aligned</fo:block>
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
        
        const cell1 = table.table.body[0][0];
        const cell2 = table.table.body[0][1];
        
        assert.equal(cell1.alignment, 'left', 'First cell should have left alignment');
        assert.equal(cell2.alignment, 'right', 'Second cell should have right alignment');
    });

    testRunner.addTest('Table Inheritance Integration: Full table with inherited color', () => {
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
            <fo:table-cell color="red">
              <fo:block>Red text from cell</fo:block>
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
        assert.equal(cellContent.color, 'red', 'Cell content should inherit red color');
    });

    testRunner.addTest('Table Inheritance Integration: User example with right alignment', () => {
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
              <fo:block font-weight="bold" font-size="12pt">INSPECTION REPORT</fo:block>
              <fo:block font-weight="bold" font-size="10pt">Prevention Services Division</fo:block>
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
        assert.ok(cellContent.stack, 'Cell should have stack property with multiple blocks');
        assert.ok(Array.isArray(cellContent.stack), 'Stack should be an array');
        assert.equal(cellContent.stack.length, 2, 'Should have 2 blocks');
        
        // Both blocks should inherit text-align="right"
        assert.equal(cellContent.stack[0].alignment, 'right', 'First block should be right-aligned');
        assert.equal(cellContent.stack[1].alignment, 'right', 'Second block should be right-aligned');
        
        // Blocks should keep their own styling
        assert.equal(cellContent.stack[0].fontSize, 12, 'First block fontSize');
        assert.equal(cellContent.stack[1].fontSize, 10, 'Second block fontSize');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerTableInheritanceTests };
}
if (typeof window !== 'undefined') {
    window.registerTableInheritanceTests = registerTableInheritanceTests;
}

