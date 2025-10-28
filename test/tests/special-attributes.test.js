/**
 * Special Attributes Tests
 * Tests for page-break-before and linefeed-treatment attributes
 */

function registerSpecialAttributesTests(testRunner, converter, testXML, assert) {
    // Get environment-specific modules
    const RecursiveTraversal = typeof window !== 'undefined' && window.RecursiveTraversal 
        ? window.RecursiveTraversal 
        : (typeof require === 'function' ? require('../../src/recursive-traversal.js') : null);
    
    const BlockConverter = typeof window !== 'undefined' && window.BlockConverter 
        ? window.BlockConverter 
        : (typeof require === 'function' ? require('../../src/block-converter.js') : null);

    // Helper to parse XML
    function parseXML(xml) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        return xmlDoc.documentElement;
    }

    // ==================== page-break-before Tests ====================
    
    testRunner.addTest('page-break-before: Should add pageBreak property when set to "always"', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" page-break-before="always">INSPECTION NOTES</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(typeof result === 'object', 'Result should be an object');
        assert.equal(result.text, 'INSPECTION NOTES', 'Should have correct text');
        assert.equal(result.pageBreak, 'before', 'Should have pageBreak: "before"');
    });

    testRunner.addTest('page-break-before: Should work with styled blocks', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" page-break-before="always" font-weight="bold" font-size="14pt">Heading with Page Break</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.equal(result.pageBreak, 'before', 'Should have pageBreak property');
        assert.equal(result.bold, true, 'Should be bold');
        assert.equal(result.fontSize, 14, 'Should have fontSize 14');
    });

    testRunner.addTest('page-break-before: Should work with bordered blocks (table structure)', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" page-break-before="always" border="1px solid black" padding="10px">Content with border</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(result.table, 'Should have table structure for bordered block');
        assert.equal(result.pageBreak, 'before', 'Table structure should have pageBreak property');
    });

    testRunner.addTest('page-break-before: Should not add pageBreak when attribute is absent', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">Normal text</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const resultObj = typeof result === 'object' ? result : { text: result };
        assert.equal(resultObj.pageBreak, undefined, 'Should not have pageBreak property');
    });

    testRunner.addTest('page-break-before: parsePageBreak should only recognize "always"', () => {
        assert.equal(BlockConverter.parsePageBreak('always'), 'before', 'Should return "before" for "always"');
        assert.equal(BlockConverter.parsePageBreak('auto'), undefined, 'Should return undefined for "auto"');
        assert.equal(BlockConverter.parsePageBreak('avoid'), undefined, 'Should return undefined for "avoid"');
        assert.equal(BlockConverter.parsePageBreak(''), undefined, 'Should return undefined for empty string');
    });

    // ==================== linefeed-treatment="preserve" Tests ====================
    
    testRunner.addTest('linefeed-treatment: Should preserve newlines in text', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" linefeed-treatment="preserve">John Smith
123 Main Street
Anytown, USA 12345</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = typeof result === 'string' ? result : result.text;
        
        // Should contain actual newlines
        assert.ok(textStr.includes('\n'), 'Should contain newline characters');
        
        // Should have all three lines
        assert.ok(textStr.includes('John Smith'), 'Should contain first line');
        assert.ok(textStr.includes('123 Main Street'), 'Should contain second line');
        assert.ok(textStr.includes('Anytown, USA 12345'), 'Should contain third line');
        
        // Count newlines (should have 2: one after "John Smith", one after "123 Main Street")
        const newlineCount = (textStr.match(/\n/g) || []).length;
        assert.ok(newlineCount >= 2, 'Should have at least 2 newlines');
    });

    testRunner.addTest('linefeed-treatment: Should preserve indentation with newlines', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" linefeed-treatment="preserve">Report Summary:
  - Section 1: Complete
  - Section 2: In Progress</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = typeof result === 'string' ? result : result.text;
        
        // Should contain newlines
        assert.ok(textStr.includes('\n'), 'Should contain newlines');
        
        // Should preserve leading spaces (indentation)
        assert.ok(textStr.includes('  - Section 1'), 'Should preserve leading spaces for Section 1');
        assert.ok(textStr.includes('  - Section 2'), 'Should preserve leading spaces for Section 2');
    });

    testRunner.addTest('linefeed-treatment: Should work with fontSize attribute', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" linefeed-treatment="preserve" font-size="8pt">23 fljalsjf
                      asfa af</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(typeof result === 'object', 'Result should be an object with fontSize');
        assert.equal(result.fontSize, 8, 'Should have fontSize 8');
        
        const textStr = result.text;
        assert.ok(textStr.includes('\n'), 'Should contain newline');
        assert.ok(textStr.includes('23 fljalsjf'), 'Should contain first line');
        assert.ok(textStr.includes('asfa af'), 'Should contain second line');
    });

    testRunner.addTest('linefeed-treatment: Should work with margin-left', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" linefeed-treatment="preserve" font-size="8pt" margin="5px 0px 0px 0px">Line 1
Line 2</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.equal(result.fontSize, 8, 'Should have fontSize 8');
        assert.deepEqual(result.margin, [0, 5, 0, 0], 'Should have margin [left, top, right, bottom]');
        
        const textStr = result.text;
        assert.ok(textStr.includes('\n'), 'Should preserve newline');
    });

    testRunner.addTest('linefeed-treatment: Should preserve ASCII art/code formatting', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" linefeed-treatment="preserve">+------------------+
|   IMPORTANT      |
+------------------+

  var x = 10;</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = typeof result === 'string' ? result : result.text;
        
        // Should preserve box drawing
        assert.ok(textStr.includes('+------------------+'), 'Should preserve box top');
        assert.ok(textStr.includes('|   IMPORTANT      |'), 'Should preserve box content with spacing');
        
        // Should preserve blank line between box and code
        assert.ok(textStr.includes('\n\n'), 'Should have blank line (double newline)');
        
        // Should preserve code indentation
        assert.ok(textStr.includes('  var x = 10;'), 'Should preserve code indentation');
    });

    testRunner.addTest('linefeed-treatment: Should NOT normalize whitespace when preserve is set', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" linefeed-treatment="preserve">Line 1
Line 2</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = typeof result === 'string' ? result : result.text;
        
        // Without preserve, newlines would be converted to spaces
        // With preserve, newlines should remain
        assert.ok(textStr.includes('\n'), 'Newlines should be preserved, not converted to spaces');
        
        // Should NOT have "Line 1 Line 2" (which would happen with normal whitespace normalization)
        const normalized = textStr.replace(/\s+/g, ' ');
        assert.ok(textStr !== normalized, 'Text should NOT be whitespace-normalized');
    });

    testRunner.addTest('linefeed-treatment: Should work WITHOUT preserve (normal behavior)', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">Line 1
Line 2</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = typeof result === 'string' ? result : result.text;
        
        // Without preserve, newlines should be converted to spaces
        assert.ok(!textStr.includes('\n') || textStr === '\n', 'Newlines should be converted to spaces when preserve is not set');
        assert.ok(textStr.includes('Line 1'), 'Should still contain text content');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerSpecialAttributesTests };
}
if (typeof window !== 'undefined') {
    window.registerSpecialAttributesTests = registerSpecialAttributesTests;
}

