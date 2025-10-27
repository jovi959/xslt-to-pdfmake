/**
 * Inline Converter Tests
 * Tests for <fo:inline> element conversion to PDFMake format
 */

function registerInlineConverterTests(testRunner, converter, testXML, assert) {
    // Helper to parse XML
    function parseXML(xmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');
        return doc.documentElement;
    }

    // ===== BASIC INLINE TESTS =====

    testRunner.addTest('Inline: Should convert simple inline with color', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              This sentence contains <fo:inline color="red">red text</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Text should be array for mixed content');
        assert.ok(result.text.length >= 3, 'Should have text, inline, and more text');
        
        // Find the inline element
        const inlineElement = result.text.find(item => 
            typeof item === 'object' && item.color === 'red'
        );
        assert.ok(inlineElement, 'Should have red inline element');
        assert.equal(inlineElement.text, 'red text', 'Inline should have correct text');
        assert.equal(inlineElement.color, 'red', 'Inline should have red color');
    });

    testRunner.addTest('Inline: Should convert inline with italic style', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Text with <fo:inline font-style="italic">italic text</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        const inlineElement = result.text.find(item => 
            typeof item === 'object' && item.italics === true
        );
        assert.ok(inlineElement, 'Should have italic inline element');
        assert.equal(inlineElement.text, 'italic text', 'Should have correct text');
    });

    testRunner.addTest('Inline: Should convert inline with bold weight', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Text with <fo:inline font-weight="bold">bold text</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        const inlineElement = result.text.find(item => 
            typeof item === 'object' && item.bold === true
        );
        assert.ok(inlineElement, 'Should have bold inline element');
        assert.equal(inlineElement.text, 'bold text', 'Should have correct text');
    });

    testRunner.addTest('Inline: Should convert inline with font-size', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Text with <fo:inline font-size="18pt">large text</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        const inlineElement = result.text.find(item => 
            typeof item === 'object' && item.fontSize === 18
        );
        assert.ok(inlineElement, 'Should have large inline element');
        assert.equal(inlineElement.text, 'large text', 'Should have correct text');
    });

    testRunner.addTest('Inline: Should convert inline with text-decoration', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Text with <fo:inline text-decoration="underline">underlined text</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        const inlineElement = result.text.find(item => 
            typeof item === 'object' && item.decoration === 'underline'
        );
        assert.ok(inlineElement, 'Should have underlined inline element');
        assert.equal(inlineElement.text, 'underlined text', 'Should have correct text');
    });

    testRunner.addTest('Inline: Should handle multiple inline elements', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              This sentence contains <fo:inline color="red">red text</fo:inline>
              and <fo:inline font-style="italic">italic text</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Text should be array');
        
        // Find red inline
        const redInline = result.text.find(item => 
            typeof item === 'object' && item.color === 'red'
        );
        assert.ok(redInline, 'Should have red inline');
        assert.equal(redInline.text, 'red text', 'Red inline should have correct text');
        
        // Find italic inline
        const italicInline = result.text.find(item => 
            typeof item === 'object' && item.italics === true
        );
        assert.ok(italicInline, 'Should have italic inline');
        assert.equal(italicInline.text, 'italic text', 'Italic inline should have correct text');
    });

    testRunner.addTest('Inline: Should handle inline with multiple attributes', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Text with <fo:inline font-weight="bold" font-style="italic" color="#0000FF">styled text</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        const inlineElement = result.text.find(item => 
            typeof item === 'object' && item.bold === true && item.italics === true
        );
        assert.ok(inlineElement, 'Should have styled inline element');
        assert.equal(inlineElement.text, 'styled text', 'Should have correct text');
        assert.equal(inlineElement.bold, true, 'Should be bold');
        assert.equal(inlineElement.italics, true, 'Should be italic');
        assert.equal(inlineElement.color, '#0000FF', 'Should be blue');
    });

    // ===== NESTED INLINE TESTS =====

    testRunner.addTest('Inline: Should handle nested inline elements', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Text with <fo:inline font-weight="bold">bold <fo:inline color="red">and red</fo:inline> text</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Text should be array');
        
        // Find the outer bold inline
        const boldInline = result.text.find(item => 
            typeof item === 'object' && item.bold === true
        );
        assert.ok(boldInline, 'Should have bold inline');
        assert.ok(Array.isArray(boldInline.text), 'Bold inline should have text array for nested content');
        
        // Check for nested red inline
        const hasRedNested = boldInline.text.some(item => 
            typeof item === 'object' && item.color === 'red'
        );
        assert.ok(hasRedNested, 'Should have nested red inline');
    });

    testRunner.addTest('Inline: Should handle inline within block with styling', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-size="12pt">
              Block text with <fo:inline color="red">red inline</fo:inline>.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.fontSize, 12, 'Block should have fontSize');
        assert.ok(Array.isArray(result.text), 'Text should be array');
        
        const inlineElement = result.text.find(item => 
            typeof item === 'object' && item.color === 'red'
        );
        assert.ok(inlineElement, 'Should have red inline within styled block');
    });

    // ===== EDGE CASES =====

    testRunner.addTest('Inline: Should handle empty inline', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Text with <fo:inline color="red"></fo:inline> empty inline.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(result.text, 'Should have text property');
        // Empty inline should either be filtered out or present with empty text
    });

    testRunner.addTest('Inline: Should handle inline with only whitespace', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Text<fo:inline color="red">   </fo:inline>text.
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(result.text, 'Should have text property');
    });

    testRunner.addTest('Inline: Should handle consecutive inline elements', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              <fo:inline color="red">Red</fo:inline><fo:inline color="blue">Blue</fo:inline><fo:inline color="green">Green</fo:inline>
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Text should be array');
        
        const redInline = result.text.find(item => item.color === 'red');
        const blueInline = result.text.find(item => item.color === 'blue');
        const greenInline = result.text.find(item => item.color === 'green');
        
        assert.ok(redInline, 'Should have red inline');
        assert.ok(blueInline, 'Should have blue inline');
        assert.ok(greenInline, 'Should have green inline');
    });

    testRunner.addTest('Inline: Should preserve text order with inlines', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
              Start <fo:inline color="red">middle</fo:inline> end
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Text should be array');
        assert.equal(result.text.length, 3, 'Should have 3 items in order');
        
        // Check order
        assert.ok(String(result.text[0]).includes('Start'), 'First should be start text');
        assert.ok(typeof result.text[1] === 'object' && result.text[1].color === 'red', 'Second should be red inline');
        assert.ok(String(result.text[2]).includes('end'), 'Third should be end text');
    });

    testRunner.addTest('Inline: Should preserve spaces around inline elements', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">This sentence contains <fo:inline color="red">red text</fo:inline> and <fo:inline font-style="italic">italic text</fo:inline>.</fo:block>`;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Text should be array');
        
        // Helper to extract text content (handles both strings and objects)
        const getText = (item) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item.text) return item.text;
            return '';
        };
        
        // Check that spaces are preserved in the first text node
        const firstText = getText(result.text[0]);
        assert.ok(firstText.endsWith(' '), 'Text before first inline should end with space: "This sentence contains "');
        assert.equal(firstText, 'This sentence contains ', 'First text should be exactly "This sentence contains "');
        
        // Find text between inlines (may be string or wrapped object)
        const middleItem = result.text.find((item, idx) => {
            const text = getText(item);
            return idx > 0 && text.includes('and');
        });
        assert.ok(middleItem, 'Should have text between inlines');
        
        const middleText = getText(middleItem);
        assert.ok(middleText.startsWith(' '), 'Text between inlines should start with space');
        assert.ok(middleText.endsWith(' '), 'Text between inlines should end with space');
        assert.equal(middleText, ' and ', 'Middle text should be exactly " and "');
    });

    // ===== HTML-LIKE WHITESPACE NORMALIZATION TESTS =====

    testRunner.addTest('Whitespace: Should trim edge spaces from block', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format"> Hello world </fo:block>`;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result, 'Hello world', 'Should trim leading and trailing spaces touching parent tags');
    });

    testRunner.addTest('Whitespace: Should preserve spaces between siblings', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">Text <fo:inline color="red">red</fo:inline> more</fo:block>`;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(Array.isArray(result.text), 'Text should be array');
        assert.equal(result.text.length, 3, 'Should have 3 items');
        
        // "Text " -> "Text " (no leading space to trim, trailing space preserved for sibling)
        assert.equal(result.text[0], 'Text ', 'First text should be "Text "');
        
        // red inline
        assert.equal(result.text[1].text, 'red', 'Inline should be "red"');
        
        // " more" -> " more" (leading space preserved for sibling, no trailing space to trim)
        assert.equal(result.text[2], ' more', 'Last text should be " more"');
    });

    testRunner.addTest('Whitespace: trimEdgeSpaces helper function', () => {
        // Test the trimEdgeSpaces function directly
        const children1 = [' Hello ', 'world'];
        const result1 = window.BlockConverter.trimEdgeSpaces(children1);
        assert.equal(result1[0], 'Hello ', 'Should trim leading space from first string');
        assert.equal(result1[1], 'world', 'Should trim trailing space from last string');
        
        const children2 = [' Text ', { text: 'inline' }, ' more '];
        const result2 = window.BlockConverter.trimEdgeSpaces(children2);
        assert.equal(result2[0], 'Text ', 'Should trim leading from first text');
        assert.equal(result2[2], ' more', 'Should trim trailing from last text');
        assert.ok(result2[1].text === 'inline', 'Should preserve object in middle');
        
        const children3 = ['Single'];
        const result3 = window.BlockConverter.trimEdgeSpaces(children3);
        assert.equal(result3[0], 'Single', 'Should work with single string');
    });
}



// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerInlineConverterTests };
}
if (typeof window !== 'undefined') {
    window.registerInlineConverterTests = registerInlineConverterTests;
}

