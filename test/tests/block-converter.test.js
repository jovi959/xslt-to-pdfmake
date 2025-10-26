/**
 * Block Converter Unit Tests
 * 
 * Tests the block converter in isolation, without relying on the full traversal system.
 * These tests verify that individual conversion logic works correctly.
 */

function registerBlockConverterTests(testRunner, converter, testXML, assert) {
    const parser = new DOMParser();

    // Helper function to create a mock fo:block element
    function createBlockElement(attributes, textContent = '') {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" ${attributes}>${textContent}</fo:block>`;
        const doc = parser.parseFromString(xml, 'text/xml');
        return doc.documentElement;
    }

    // ===== ISOLATED CONVERTER TESTS =====
    // These tests check the converter logic WITHOUT traversal

    testRunner.addTest('Block Converter: Should convert simple block with plain text', () => {
        const block = createBlockElement('', 'Simple text');
        // Mock children array (simulating what traversal would provide)
        const children = ['Simple text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result, 'Simple text', 'Should return plain text for simple block');
    });

    testRunner.addTest('Block Converter: Should convert empty block', () => {
        const block = createBlockElement('');
        const children = [];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result, '', 'Should return empty string for empty block');
    });

    testRunner.addTest('Block Converter: Should convert bold attribute', () => {
        const block = createBlockElement('font-weight="bold"', 'Bold text');
        const children = ['Bold text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.ok(result.text, 'Should have text property');
        assert.equal(result.text, 'Bold text', 'Should have correct text');
        assert.equal(result.bold, true, 'Should have bold property set to true');
    });

    testRunner.addTest('Block Converter: Should convert font-weight="600" to bold', () => {
        const block = createBlockElement('font-weight="600"', 'Semi-bold text');
        const children = ['Semi-bold text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.bold, true, 'Should convert numeric font-weight >= 600 to bold');
    });

    testRunner.addTest('Block Converter: Should convert italic attribute', () => {
        const block = createBlockElement('font-style="italic"', 'Italic text');
        const children = ['Italic text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.text, 'Italic text', 'Should have correct text');
        assert.equal(result.italics, true, 'Should have italics property set to true');
    });

    testRunner.addTest('Block Converter: Should convert underline decoration', () => {
        const block = createBlockElement('text-decoration="underline"', 'Underlined text');
        const children = ['Underlined text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.text, 'Underlined text', 'Should have correct text');
        assert.equal(result.decoration, 'underline', 'Should have decoration property');
    });

    testRunner.addTest('Block Converter: Should convert line-through decoration', () => {
        const block = createBlockElement('text-decoration="line-through"', 'Strikethrough text');
        const children = ['Strikethrough text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.decoration, 'lineThrough', 'Should convert line-through to lineThrough');
    });

    testRunner.addTest('Block Converter: Should convert font-size in points', () => {
        const block = createBlockElement('font-size="14pt"', 'Sized text');
        const children = ['Sized text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.fontSize, 14, 'Should convert pt font-size correctly');
    });

    testRunner.addTest('Block Converter: Should convert font-size in pixels', () => {
        const block = createBlockElement('font-size="16px"', 'Sized text');
        const children = ['Sized text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.fontSize, 12, 'Should convert px to pt (16px * 0.75 = 12pt)');
    });

    testRunner.addTest('Block Converter: Should convert color attribute', () => {
        const block = createBlockElement('color="#FF0000"', 'Red text');
        const children = ['Red text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.color, '#FF0000', 'Should preserve color value');
    });

    testRunner.addTest('Block Converter: Should convert text-align to alignment', () => {
        const block = createBlockElement('text-align="center"', 'Centered text');
        const children = ['Centered text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.alignment, 'center', 'Should convert text-align to alignment');
    });

    testRunner.addTest('Block Converter: Should handle multiple attributes', () => {
        const block = createBlockElement('font-weight="bold" font-size="16pt" color="#0000FF"', 'Multi-attr text');
        const children = ['Multi-attr text'];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.equal(result.text, 'Multi-attr text', 'Should have correct text');
        assert.equal(result.bold, true, 'Should have bold property');
        assert.equal(result.fontSize, 16, 'Should have fontSize property');
        assert.equal(result.color, '#0000FF', 'Should have color property');
    });

    testRunner.addTest('Block Converter: Should handle nested content (array of children)', () => {
        const block = createBlockElement('font-weight="bold"');
        // Simulate what traversal would provide for nested content
        const children = [
            'Parent Text',
            { text: 'Child Text', fontSize: 10 }
        ];
        
        const result = window.BlockConverter.convertBlock(block, children, null);
        
        assert.ok(Array.isArray(result.text), 'Should have text as array for mixed content');
        // With new behavior: text nodes with block siblings are wrapped with parent styling
        assert.ok(result.text[0].text === 'Parent Text' || result.text[0] === 'Parent Text', 'Should have parent text (wrapped or unwrapped)');
        if (typeof result.text[0] === 'object') {
            assert.equal(result.text[0].bold, true, 'Parent text should inherit bold styling');
        }
        assert.deepEqual(result.text[1], { text: 'Child Text', fontSize: 10 }, 'Should have child object');
        assert.equal(result.bold, true, 'Should have bold property on parent');
    });

    // ===== ATTRIBUTE PARSING TESTS =====
    // Test individual parsing functions

    testRunner.addTest('parseFontWeight: Should return true for "bold"', () => {
        const result = window.BlockConverter.parseFontWeight('bold');
        assert.equal(result, true, 'Should return true for bold');
    });

    testRunner.addTest('parseFontWeight: Should return true for "bolder"', () => {
        const result = window.BlockConverter.parseFontWeight('bolder');
        assert.equal(result, true, 'Should return true for bolder');
    });

    testRunner.addTest('parseFontWeight: Should return true for numeric >= 600', () => {
        assert.equal(window.BlockConverter.parseFontWeight('600'), true, 'Should return true for 600');
        assert.equal(window.BlockConverter.parseFontWeight('700'), true, 'Should return true for 700');
    });

    testRunner.addTest('parseFontWeight: Should return undefined for "normal"', () => {
        const result = window.BlockConverter.parseFontWeight('normal');
        assert.equal(result, undefined, 'Should return undefined for normal weight');
    });

    testRunner.addTest('parseFontStyle: Should return true for "italic"', () => {
        const result = window.BlockConverter.parseFontStyle('italic');
        assert.equal(result, true, 'Should return true for italic');
    });

    testRunner.addTest('parseFontStyle: Should return true for "oblique"', () => {
        const result = window.BlockConverter.parseFontStyle('oblique');
        assert.equal(result, true, 'Should return true for oblique');
    });

    testRunner.addTest('parseFontSize: Should parse pt values', () => {
        assert.equal(window.BlockConverter.parseFontSize('12pt'), 12);
        assert.equal(window.BlockConverter.parseFontSize('14pt'), 14);
    });

    testRunner.addTest('parseFontSize: Should parse px values', () => {
        assert.equal(window.BlockConverter.parseFontSize('16px'), 12, '16px should be 12pt');
    });

    testRunner.addTest('parseFontSize: Should parse decimal values', () => {
        assert.equal(window.BlockConverter.parseFontSize('10.5pt'), 10.5);
    });

    testRunner.addTest('parseAlignment: Should parse valid alignments', () => {
        assert.equal(window.BlockConverter.parseAlignment('left'), 'left');
        assert.equal(window.BlockConverter.parseAlignment('center'), 'center');
        assert.equal(window.BlockConverter.parseAlignment('right'), 'right');
        assert.equal(window.BlockConverter.parseAlignment('justify'), 'justify');
    });

    testRunner.addTest('parseAlignment: Should return undefined for invalid alignment', () => {
        const result = window.BlockConverter.parseAlignment('invalid');
        assert.equal(result, undefined, 'Should return undefined for invalid alignment');
    });

    // Border and padding tests
    testRunner.addTest('parseBorderWidth: Should parse border width', () => {
        assert.equal(window.BlockConverter.parseBorderWidth('0.5pt'), 0.5);
        assert.equal(window.BlockConverter.parseBorderWidth('1pt'), 1);
        assert.equal(window.BlockConverter.parseBorderWidth('2px'), 2);
    });

    testRunner.addTest('parsePadding: Should parse single value', () => {
        const result = window.BlockConverter.parsePadding('10px');
        assert.deepEqual(result, [10, 10, 10, 10], 'Should expand to all sides');
    });

    testRunner.addTest('parsePadding: Should parse two values (vertical horizontal)', () => {
        const result = window.BlockConverter.parsePadding('5px 10px');
        assert.deepEqual(result, [10, 5, 10, 5], 'Should be [left, top, right, bottom]');
    });

    testRunner.addTest('parsePadding: Should parse four values', () => {
        const result = window.BlockConverter.parsePadding('5px 0px 5px 0px');
        assert.deepEqual(result, [0, 5, 0, 5], 'Should convert from top,right,bottom,left to left,top,right,bottom');
    });

    testRunner.addTest('parseMargin: Should parse margin values', () => {
        const result = window.BlockConverter.parseMargin('10px 0px 10px 0px');
        assert.deepEqual(result, [0, 10, 0, 10], 'Should parse margin like padding');
    });

    testRunner.addTest('Block Converter: Should convert block with border to table', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                      border-style="solid" 
                      border-width="0.5pt" 
                      border-color="#000000"
                      font-weight="bold" 
                      font-size="12pt" 
                      text-align="center"
                      padding="5px 0px 5px 0px"
                      margin="10px 0px 10px 0px">
                Test Text
            </fo:block>
        `;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const element = xmlDoc.documentElement;
        
        const result = window.BlockConverter.convertBlock(element, ['Test Text'], null);
        
        assert.ok(result.table, 'Should have table property');
        assert.deepEqual(result.table.widths, ['*'], 'Table should span full width');
        assert.ok(Array.isArray(result.table.body), 'Should have body array');
        assert.equal(result.table.body.length, 1, 'Should have one row');
        assert.equal(result.table.body[0].length, 1, 'Should have one cell');
        
        const cell = result.table.body[0][0];
        assert.equal(cell.text, 'Test Text', 'Cell should contain text');
        assert.equal(cell.bold, true, 'Cell should be bold');
        assert.equal(cell.fontSize, 12, 'Cell should have fontSize');
        assert.equal(cell.alignment, 'center', 'Cell should be centered');
        assert.deepEqual(cell.margin, [0, 5, 0, 5], 'Padding should be converted to cell margin');
        
        assert.ok(result.layout, 'Should have layout property');
        assert.equal(typeof result.layout.hLineWidth, 'function', 'Should have hLineWidth function');
        assert.equal(typeof result.layout.vLineWidth, 'function', 'Should have vLineWidth function');
        assert.equal(result.layout.hLineWidth(), 0.5, 'Should have correct border width');
        assert.equal(result.layout.hLineColor(), '#000000', 'Should have correct border color');
        
        assert.deepEqual(result.margin, [0, 10, 0, 10], 'Should have margin outside table');
    });

    testRunner.addTest('Block Converter: Should convert block with padding only to table', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" padding="10px">
                Padded Text
            </fo:block>
        `;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const element = xmlDoc.documentElement;
        
        const result = window.BlockConverter.convertBlock(element, ['Padded Text'], null);
        
        assert.ok(result.table, 'Should have table property for padding');
        assert.deepEqual(result.table.body[0][0].margin, [10, 10, 10, 10], 'Should have padding as margin');
    });

    testRunner.addTest('Block Converter: Should not convert block without border to table', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                      font-weight="bold" 
                      margin="10px">
                Normal Text
            </fo:block>
        `;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const element = xmlDoc.documentElement;
        
        const result = window.BlockConverter.convertBlock(element, ['Normal Text'], null);
        
        assert.ok(!result.table, 'Should not have table property');
        assert.equal(result.text, 'Normal Text', 'Should have text property');
        assert.equal(result.bold, true, 'Should have bold');
        assert.deepEqual(result.margin, [10, 10, 10, 10], 'Should have margin on text block');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerBlockConverterTests };
}
if (typeof window !== 'undefined') {
    window.registerBlockConverterTests = registerBlockConverterTests;
}

