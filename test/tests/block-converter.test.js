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
        
        // Empty block now returns '\n' (self-closing blocks become line breaks)
        assert.equal(result, '\n', 'Should return newline for empty block');
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

    testRunner.addTest('parseFontWeight: Should return false for "normal" to override parent bold', () => {
        const result = window.BlockConverter.parseFontWeight('normal');
        assert.equal(result, false, 'Should return false for normal weight (to explicitly override parent bold)');
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

    testRunner.addTest('Block Converter: Should parse shorthand border attribute', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                      font-weight="bold" 
                      text-align="center" 
                      font-size="14pt" 
                      border="2px solid black" 
                      padding="5px 20px 5px 20px" 
                      margin="10px 180px 0px 180px">
                ACTION REQUIRED
            </fo:block>
        `;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const element = xmlDoc.documentElement;
        
        const result = window.BlockConverter.convertBlock(element, ['ACTION REQUIRED'], null);
        
        assert.ok(result.table, 'Should have table property');
        const cell = result.table.body[0][0];
        
        // Should have border set to true because border attribute is present
        assert.deepEqual(cell.border, [true, true, true, true], 'Border should be [true, true, true, true] with border attribute');
        
        // Should parse border values
        assert.ok(result.layout, 'Should have layout for border styling');
        assert.equal(result.layout.hLineWidth(), 2, 'Should have 2px border width');
        assert.equal(result.layout.vLineWidth(), 2, 'Should have 2px border width');
        
        // Should have text styling
        assert.equal(cell.bold, true, 'Should have bold');
        assert.equal(cell.fontSize, 14, 'Should have font size 14');
        assert.equal(cell.alignment, 'center', 'Should have center alignment');
        
        // Should have padding and margin
        // User explicitly set padding - respect it completely (padding="5px 20px 5px 20px" -> [20, 5, 20, 5])
        assert.deepEqual(cell.margin, [20, 5, 20, 5], 'Should respect user-defined padding completely');
        assert.deepEqual(result.margin, [180, 10, 180, 0], 'Should have margin on table');
    });

    testRunner.addTest('Block Converter: Should set border to false when only padding (no border attributes)', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                      font-weight="bold" 
                      font-size="8pt" 
                      padding="10px 0px 10px 0px">
                Text content
            </fo:block>
        `;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const element = xmlDoc.documentElement;
        
        const result = window.BlockConverter.convertBlock(element, ['Text content'], null);
        
        assert.ok(result.table, 'Should have table structure due to padding');
        const cell = result.table.body[0][0];
        
        // Should have border set to false because no border attributes
        assert.deepEqual(cell.border, [false, false, false, false], 'Border should be all false when no border attributes');
        assert.deepEqual(cell.margin, [0, 10, 0, 10], 'Should have padding converted to margin');
    });

    testRunner.addTest('Block Converter: parseBorderShorthand should parse border values', () => {
        const result1 = window.BlockConverter.parseBorderShorthand('2px solid black');
        assert.equal(result1.width, 2, 'Should parse width');
        assert.equal(result1.style, 'solid', 'Should parse style');
        assert.equal(result1.color, 'black', 'Should parse black color');
        
        const result2 = window.BlockConverter.parseBorderShorthand('1pt dashed #FF0000');
        assert.equal(result2.width, 1, 'Should parse pt width');
        assert.equal(result2.style, 'dashed', 'Should parse dashed style');
        assert.equal(result2.color, '#FF0000', 'Should parse hex color');
        
        // Edge case: style and color only (no width)
        const result3 = window.BlockConverter.parseBorderShorthand('solid gray');
        assert.equal(result3.style, 'solid', 'Should parse style without width');
        assert.equal(result3.color, 'gray', 'Should parse color without width');
        assert.equal(result3.width, undefined, 'Width should be undefined');
        
        // Edge case: style only with trailing space
        const result4 = window.BlockConverter.parseBorderShorthand('solid ');
        assert.equal(result4.style, 'solid', 'Should parse style with trailing space');
        assert.equal(result4.width, undefined, 'Width should be undefined');
        assert.equal(result4.color, undefined, 'Color should be undefined');
    });

    testRunner.addTest('Block Converter: Should handle border shorthand with style and color only', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                      border="solid gray" 
                      background-color="yellow">
                Test Border 2
            </fo:block>
        `;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const element = xmlDoc.documentElement;
        
        const result = window.BlockConverter.convertBlock(element, ['Test Border 2'], null);
        
        assert.ok(result.table, 'Should have table property');
        const cell = result.table.body[0][0];
        
        // Should have border set to true because border attribute is present
        assert.deepEqual(cell.border, [true, true, true, true], 'Border should be [true, true, true, true]');
        
        // Should have layout with default width and parsed color
        assert.ok(result.layout, 'Should have layout for border styling');
        assert.equal(result.layout.hLineWidth(), 0.5, 'Should use default 0.5 width when not specified');
        assert.equal(result.layout.hLineColor(), 'gray', 'Should have gray color');
    });

    testRunner.addTest('Block Converter: Should handle border shorthand with style only', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                      space-before="12pt" 
                      border="solid " 
                      background-color="yellow">
                Test Border
            </fo:block>
        `;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const element = xmlDoc.documentElement;
        
        const result = window.BlockConverter.convertBlock(element, ['Test Border'], null);
        
        assert.ok(result.table, 'Should have table property');
        const cell = result.table.body[0][0];
        
        // Should have border set to true because border attribute is present
        assert.deepEqual(cell.border, [true, true, true, true], 'Border should be [true, true, true, true]');
        
        // Should have layout with defaults when only style is specified
        assert.ok(result.layout, 'Should have layout for border styling');
        assert.equal(result.layout.hLineWidth(), 0.5, 'Should use default 0.5 width');
        assert.equal(result.layout.hLineColor(), '#000000', 'Should use default black color');
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

