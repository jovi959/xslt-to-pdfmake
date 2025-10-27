/**
 * Nested Block Styling Tests
 * Tests for proper handling of text nodes with parent styling when mixed with nested blocks
 */

function registerNestedBlockStylingTests(testRunner, converter, testXML, assert) {
    // Helper to parse XML
    function parseXML(xmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');
        return doc.documentElement;
    }

    testRunner.addTest('Nested Styling: Text nodes should inherit parent styling when mixed with blocks', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format"
                      font-weight="bold"
                      font-size="14pt"
                      color="#FF0000">
              Parent Text
              <fo:block font-weight="bold" font-size="10pt" color="#0000FF">
                Child Text
                <fo:block font-weight="bold" font-size="10pt" color="#0000FF" font-style="italic">
                  Grandchild Text
                </fo:block>
              </fo:block>
              Ending Text
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        // Parent should have its styling
        assert.equal(result.bold, true, 'Parent should be bold');
        assert.equal(result.fontSize, 14, 'Parent should be 14pt');
        assert.equal(result.color, '#FF0000', 'Parent should be red');
        
        // Text should be an array
        assert.ok(Array.isArray(result.text), 'Text should be array');
        assert.ok(result.text.length >= 2, 'Should have at least parent text and child block');
        
        // Check for parent text
        const hasParentText = result.text.some(item => {
            const text = typeof item === 'string' ? item : item.text;
            return String(text).includes('Parent Text');
        });
        assert.ok(hasParentText, 'Should contain parent text');
        
        // Check for child block with styling
        const childWrapper = result.text.find(item => {
            if (typeof item === 'object' && item.fontSize === 10 && item.color === '#0000FF') {
                return true;
            }
            // Child may be wrapped differently
            if (typeof item === 'object' && (Array.isArray(item.text) || typeof item.text === 'object')) {
                const childTextArray = Array.isArray(item.text) ? item.text : [item.text];
                return childTextArray.some(child => {
                    if (typeof child === 'object') {
                        return child.fontSize === 10 && child.color === '#0000FF';
                    }
                    return false;
                });
            }
            return false;
        });
        assert.ok(childWrapper, 'Should have child block with blue 10pt styling');
        
        // Check for ending text
        const hasEndingText = result.text.some(item => {
            const text = typeof item === 'string' ? item : item.text;
            return String(text).includes('Ending Text');
        });
        assert.ok(hasEndingText, 'Should contain ending text');
    });

    testRunner.addTest('Nested Styling: Simple case with parent text and one child block', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-weight="bold" font-size="14pt">
              Parent Text
              <fo:block font-size="10pt">Child Text</fo:block>
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.bold, true, 'Parent should be bold');
        assert.equal(result.fontSize, 14, 'Parent should be 14pt');
        assert.ok(Array.isArray(result.text), 'Text should be array');
        assert.equal(result.text.length, 2, 'Should have parent text and child block');
        
        // Parent text - may be string or object
        const firstItem = result.text[0];
        const firstText = typeof firstItem === 'string' ? firstItem : firstItem.text;
        assert.ok(firstText.includes('Parent Text'), 'Should have parent text');
        
        // Child block
        const child = result.text[1];
        assert.ok(typeof child === 'object', 'Child should be object');
        const childText = typeof child.text === 'string' ? child.text : (Array.isArray(child.text) ? child.text[0] : child.text);
        assert.ok(String(childText).includes('Child Text'), 'Child should contain child text');
        // Child should have 10pt styling somewhere (either on wrapper or on text)
        const hasFontSize10 = child.fontSize === 10 || (typeof childText === 'object' && childText.fontSize === 10);
        assert.ok(hasFontSize10, 'Child should have 10pt font size');
    });

    testRunner.addTest('Nested Styling: Only text nodes (no nested blocks)', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-weight="bold">Just text content</fo:block>`;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.bold, true, 'Should be bold');
        assert.equal(result.text, 'Just text content', 'Should have text as string when no nested blocks');
    });

    testRunner.addTest('Nested Styling: Multiple text nodes with nested blocks', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
              Start
              <fo:block font-weight="bold">Bold</fo:block>
              Middle
              <fo:block font-style="italic">Italic</fo:block>
              End
            </fo:block>
        `;
        const element = parseXML(xml);
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.color, '#FF0000', 'Parent should be red');
        assert.ok(Array.isArray(result.text), 'Text should be array');
        assert.equal(result.text.length, 5, 'Should have 5 items: start, bold, middle, italic, end');
        
        // Check text nodes (may be strings or styled objects)
        const getText = (item) => typeof item === 'string' ? item : item.text;
        assert.ok(getText(result.text[0]).includes('Start'), 'First item should contain Start');
        assert.ok(getText(result.text[2]).includes('Middle'), 'Third item should contain Middle');
        assert.ok(getText(result.text[4]).includes('End'), 'Fifth item should contain End');
        
        // Check nested blocks have styling
        const boldItem = result.text[1];
        const hasBold = boldItem.bold === true || (typeof boldItem.text === 'object' && boldItem.text.bold);
        assert.ok(hasBold, 'Second item should have bold');
        
        const italicItem = result.text[3];
        const hasItalic = italicItem.italics === true || (typeof italicItem.text === 'object' && italicItem.text.italics);
        assert.ok(hasItalic, 'Fourth item should have italic');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerNestedBlockStylingTests };
}
if (typeof window !== 'undefined') {
    window.registerNestedBlockStylingTests = registerNestedBlockStylingTests;
}

