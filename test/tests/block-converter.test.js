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
        assert.equal(result.text[0], 'Parent Text', 'Should have parent text');
        assert.deepEqual(result.text[1], { text: 'Child Text', fontSize: 10 }, 'Should have child object');
        assert.equal(result.bold, true, 'Should have bold property');
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
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerBlockConverterTests };
}
if (typeof window !== 'undefined') {
    window.registerBlockConverterTests = registerBlockConverterTests;
}

