/**
 * Whitespace Normalization Tests
 * Tests HTML-like whitespace handling for blocks and inlines
 */

function registerWhitespaceNormalizationTests(testRunner, converter, testXML, assert) {
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

    // EXAMPLE 1: Leading and trailing trim
    testRunner.addTest('Whitespace: Should trim leading spaces from block', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">   Leading trim test   </fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        assert.equal(result, 'Leading trim test', 'Should trim leading and trailing spaces');
    });

    testRunner.addTest('Whitespace: Should trim trailing spaces from block', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">Trailing trim test   </fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        assert.equal(result, 'Trailing trim test', 'Should trim trailing spaces');
    });

    testRunner.addTest('Whitespace: Should trim both sides', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">   Both sides trim   </fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        assert.equal(result, 'Both sides trim', 'Should trim both leading and trailing spaces');
    });

    // EXAMPLE 2: Collapse multiple spaces
    testRunner.addTest('Whitespace: Should collapse multiple spaces between words', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">Word1   Word2   Word3</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        assert.equal(result, 'Word1 Word2 Word3', 'Should collapse multiple spaces to single space');
    });

    // EXAMPLE 3: Block with inline
    testRunner.addTest('Whitespace: Should handle block with inline element', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
  Start <fo:inline font-weight="bold">bold inline</fo:inline> End
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Result text should be array');
        assert.equal(result.text.length, 3, 'Should have 3 items');
        assert.equal(result.text[0], 'Start ', 'First text should be "Start "');
        assert.equal(result.text[1].text, 'bold inline', 'Inline text should be "bold inline"');
        assert.equal(result.text[1].bold, true, 'Inline should be bold');
        assert.equal(result.text[2], ' End', 'Last text should be " End"');
    });

    // EXAMPLE 4: Multiple inline siblings with whitespace
    testRunner.addTest('Whitespace: Should collapse whitespace between inline siblings', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:inline color="red">Red</fo:inline>
  <fo:inline font-style="italic"> Italic </fo:inline>
  <fo:inline font-weight="bold"> Bold</fo:inline>
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Result text should be array');
        // Should have: Red, space, Italic, space, Bold = 5 items
        assert.equal(result.text.length, 5, 'Should have 5 items (3 inlines + 2 spaces)');
        assert.equal(result.text[0].text, 'Red', 'First inline text should be "Red"');
        assert.equal(result.text[1], ' ', 'Should have space between first and second inline');
        assert.equal(result.text[2].text, 'Italic', 'Second inline text should be "Italic" (trimmed)');
        assert.equal(result.text[3], ' ', 'Should have space between second and third inline');
        assert.equal(result.text[4].text, 'Bold', 'Third inline text should be "Bold" (trimmed)');
    });

    // EXAMPLE 5: Block with only whitespace
    testRunner.addTest('Whitespace: Should handle block with only whitespace', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">     
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        // Block with only whitespace is treated as empty, which returns '\n'
        const resultText = typeof result === 'string' ? result : result.text;
        assert.equal(resultText, '\n', 'Should result in newline for whitespace-only block');
    });

    // EXAMPLE 6: Empty self-closing block
    testRunner.addTest('Whitespace: Should handle empty self-closing block', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format"/>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        // Self-closing blocks now return '\n' for line breaks
        const resultText = typeof result === 'string' ? result : result.text;
        assert.equal(resultText, '\n', 'Should result in newline for self-closing block');
    });

    // EXAMPLE 7: Nested inline elements
    testRunner.addTest('Whitespace: Should handle nested inline elements', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:inline font-weight="bold">Outer 
    <fo:inline font-style="italic">Inner italic</fo:inline>
    end
  </fo:inline>
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Result text should be array');
        assert.equal(result.text.length, 1, 'Block should have 1 child (the outer inline)');
        
        const outerInline = result.text[0];
        assert.equal(outerInline.bold, true, 'Outer inline should be bold');
        assert.ok(Array.isArray(outerInline.text), 'Outer inline text should be array');
        assert.ok(outerInline.text.length >= 3, 'Outer inline should have at least 3 items');
        
        // Check that text segments have proper styling
        const hasItalic = outerInline.text.some(item =>
            typeof item === 'object' && item.italics === true && item.text === 'Inner italic'
        );
        assert.ok(hasItalic, 'Should have nested italic inline');
    });

    // EXAMPLE 8: Mixed whitespace trim and collapse
    testRunner.addTest('Whitespace: Should trim edges and collapse internal spaces', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">   Hello <fo:inline> world </fo:inline>  !  </fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Result text should be array');
        assert.equal(result.text.length, 3, 'Should have 3 items');
        assert.equal(result.text[0], 'Hello ', 'First text should be "Hello "');
        // Inline without attributes returns just the string
        const inlineText = typeof result.text[1] === 'string' ? result.text[1] : result.text[1].text;
        assert.equal(inlineText, 'world', 'Inline text should be "world" (trimmed)');
        assert.equal(result.text[2], ' !', 'Last text should be " !" (collapsed)');
    });

    // EXAMPLE 9: Deeply nested inlines with styles
    testRunner.addTest('Whitespace: Should handle deeply nested inline styling', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:inline font-weight="bold">Bold text 
    <fo:inline font-style="italic">Bold italic 
      <fo:inline color="red">Bold italic red</fo:inline>
      back to bold italic
    </fo:inline>
    back to bold
  </fo:inline>
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Result text should be array');
        assert.ok(result.text.length > 0, 'Should have content');
        
        // Check that bold styling exists somewhere
        const hasBold = result.text.some(item => 
            typeof item === 'object' && item.bold === true
        );
        assert.ok(hasBold, 'Should have bold styled content');
        
        // Check for italic nested content
        const hasItalic = result.text.some(item =>
            typeof item === 'object' && item.italics === true
        );
        assert.ok(hasItalic || JSON.stringify(result).includes('italics'), 'Should have italic styled content');
        
        // Check for red color
        assert.ok(JSON.stringify(result).includes('red'), 'Should have red color somewhere in nested structure');
    });

    // EXAMPLE 10: Only inline siblings (no surrounding text)
    testRunner.addTest('Whitespace: Should insert space between adjacent inline elements', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:inline font-weight="bold">Bold</fo:inline>
  <fo:inline font-style="italic">Italic</fo:inline>
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Result text should be array');
        assert.equal(result.text.length, 3, 'Should have 3 items (2 inlines + 1 space)');
        assert.equal(result.text[0].text, 'Bold', 'First inline should be "Bold"');
        assert.equal(result.text[0].bold, true, 'First inline should be bold');
        assert.equal(result.text[1], ' ', 'Should have space between inlines');
        assert.equal(result.text[2].text, 'Italic', 'Second inline should be "Italic"');
        assert.equal(result.text[2].italics, true, 'Second inline should be italic');
    });

    // EXAMPLE 11: Inline with internal spaces
    testRunner.addTest('Whitespace: Should trim inline edges but preserve internal spaces', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
  Start
  <fo:inline font-weight="bold">  Bold with spaces  </fo:inline>
  End
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Result text should be array');
        assert.equal(result.text.length, 3, 'Should have 3 items');
        assert.equal(result.text[0], 'Start ', 'First text should be "Start "');
        assert.equal(result.text[1].text, 'Bold with spaces', 'Inline text should be "Bold with spaces" (edges trimmed, internal space preserved)');
        assert.equal(result.text[1].bold, true, 'Inline should be bold');
        assert.equal(result.text[2], ' End', 'Last text should be " End"');
    });

    // Additional utility function tests
    testRunner.addTest('Whitespace Utils: normalizeWhitespace should collapse newlines and spaces', () => {
        const WhitespaceUtils = typeof window !== 'undefined' && window.WhitespaceUtils 
            ? window.WhitespaceUtils 
            : require('../../src/whitespace-utils.js');
        
        const input = 'Word1\n\n  Word2\t\tWord3';
        const result = WhitespaceUtils.normalizeWhitespace(input);
        assert.equal(result, 'Word1 Word2 Word3', 'Should collapse newlines/tabs and multiple spaces');
    });

    testRunner.addTest('Whitespace Utils: normalizeChildren should do all 3 steps', () => {
        const WhitespaceUtils = typeof window !== 'undefined' && window.WhitespaceUtils 
            ? window.WhitespaceUtils 
            : require('../../src/whitespace-utils.js');
        
        const input = ['  Text1\n\nText2  ', { text: 'object' }, 'Text3\t\tText4  '];
        const result = WhitespaceUtils.normalizeChildren(input);
        // normalizeChildren does: normalize whitespace, trim edges, insert spaces
        assert.ok(Array.isArray(result), 'Should return array');
        assert.ok(result.length > 0, 'Should have content');
        // The first string should have leading space trimmed
        const firstItem = result.find(item => typeof item === 'string');
        assert.ok(!firstItem || !firstItem.startsWith(' '), 'Should trim leading spaces');
    });

    testRunner.addTest('Whitespace Utils: insertSpacesBetweenElements should add spaces between objects', () => {
        const WhitespaceUtils = typeof window !== 'undefined' && window.WhitespaceUtils 
            ? window.WhitespaceUtils 
            : require('../../src/whitespace-utils.js');
        
        const input = [
            { text: 'Inline1', bold: true },
            { text: 'Inline2', italics: true }
        ];
        const result = WhitespaceUtils.insertSpacesBetweenElements(input);
        assert.equal(result.length, 3, 'Should have 3 items');
        assert.equal(result[0].text, 'Inline1', 'First inline unchanged');
        assert.equal(result[1], ' ', 'Should insert space');
        assert.equal(result[2].text, 'Inline2', 'Second inline unchanged');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerWhitespaceNormalizationTests };
}
if (typeof window !== 'undefined') {
    window.registerWhitespaceNormalizationTests = registerWhitespaceNormalizationTests;
}

