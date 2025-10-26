/**
 * Recursive Traversal Unit Tests
 * 
 * Tests the traversal function with block converter plugged in.
 * These tests verify that the recursive traversal correctly processes nested structures.
 */

function registerRecursiveTraversalTests(testRunner, converter, testXML, assert) {
    const parser = new DOMParser();

    // Helper function to parse XML and get element by id
    function getElementFromTestData(id) {
        const doc = parser.parseFromString(testXML, 'text/xml');
        const element = doc.querySelector(`[id="${id}"]`);
        return element;
    }

    // Helper function to parse arbitrary XML
    function parseXML(xml) {
        const doc = parser.parseFromString(xml, 'text/xml');
        return doc.documentElement;
    }

    // ===== BASIC TRAVERSAL TESTS =====

    testRunner.addTest('Traversal: Should handle simple text block', () => {
        const element = getElementFromTestData('simple');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result, 'Simple text', 'Should return plain text');
    });

    testRunner.addTest('Traversal: Should handle empty block', () => {
        const element = getElementFromTestData('empty');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result, '', 'Should return empty string');
    });

    testRunner.addTest('Traversal: Should handle block with bold', () => {
        const element = getElementFromTestData('bold');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.text, 'Bold text', 'Should have text');
        assert.equal(result.bold, true, 'Should have bold property');
    });

    testRunner.addTest('Traversal: Should handle block with italic', () => {
        const element = getElementFromTestData('italic');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.text, 'Italic text', 'Should have text');
        assert.equal(result.italics, true, 'Should have italics property');
    });

    testRunner.addTest('Traversal: Should handle block with underline', () => {
        const element = getElementFromTestData('underline');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.text, 'Underlined text', 'Should have text');
        assert.equal(result.decoration, 'underline', 'Should have decoration property');
    });

    testRunner.addTest('Traversal: Should handle block with font size', () => {
        const element = getElementFromTestData('fontSize');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.text, 'Sized text', 'Should have text');
        assert.equal(result.fontSize, 14, 'Should have fontSize property');
    });

    testRunner.addTest('Traversal: Should handle block with color', () => {
        const element = getElementFromTestData('color');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.text, 'Red text', 'Should have text');
        assert.equal(result.color, '#FF0000', 'Should have color property');
    });

    testRunner.addTest('Traversal: Should handle block with alignment', () => {
        const element = getElementFromTestData('alignment');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.text, 'Centered text', 'Should have text');
        assert.equal(result.alignment, 'center', 'Should have alignment property');
    });

    testRunner.addTest('Traversal: Should handle block with multiple attributes', () => {
        const element = getElementFromTestData('multiple');
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result.text, 'Bold blue 16pt text', 'Should have text');
        assert.equal(result.bold, true, 'Should have bold property');
        assert.equal(result.fontSize, 16, 'Should have fontSize property');
        assert.equal(result.color, '#0000FF', 'Should have color property');
    });

    // ===== NESTED TRAVERSAL TESTS =====

    testRunner.addTest('Traversal: Should handle simple nested blocks', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-weight="bold">
                Parent Text
                <fo:block font-size="10pt">Child Text</fo:block>
            </fo:block>
        `;
        const element = parseXML(xml);
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(result.text, 'Should have text property');
        assert.ok(Array.isArray(result.text), 'Text should be an array for nested content');
        assert.equal(result.bold, true, 'Parent should have bold property');
        
        // Check first child (text) - with new behavior, text with block siblings is wrapped
        const firstItem = result.text[0];
        const parentText = typeof firstItem === 'string' ? firstItem : firstItem.text;
        assert.ok(parentText.includes('Parent Text'), 'Should contain parent text');
        
        // Check second child (nested block)
        const childBlock = result.text.find(item => typeof item === 'object' && item.fontSize === 10);
        assert.ok(childBlock, 'Should have child block with fontSize');
        const childText = typeof childBlock.text === 'string' ? childBlock.text : childBlock.text;
        assert.ok(String(childText).includes('Child Text'), 'Child should have correct text');
    });

    testRunner.addTest('Traversal: Should handle deeply nested blocks (3 levels)', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-weight="bold">
                Parent Text
                <fo:block font-size="10pt">
                    Child Text
                    <fo:block>Grandchild Text</fo:block>
                </fo:block>
            </fo:block>
        `;
        const element = parseXML(xml);
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(result.text, 'Should have text property');
        assert.equal(result.bold, true, 'Parent should have bold property');
        assert.ok(Array.isArray(result.text), 'Parent text should be an array');
        
        // Find the child block
        const childBlock = result.text.find(item => typeof item === 'object' && item.fontSize === 10);
        assert.ok(childBlock, 'Should have child block');
        assert.equal(childBlock.fontSize, 10, 'Child should have fontSize');
        assert.ok(Array.isArray(childBlock.text), 'Child text should be an array');
        
        // Find the grandchild block
        const grandchildBlock = childBlock.text.find(item => typeof item === 'object' || (typeof item === 'string' && item.includes('Grandchild')));
        assert.ok(grandchildBlock, 'Should have grandchild content');
    });

    testRunner.addTest('Traversal: Should match expected output format from user example', () => {
        // This is the exact example from the user's requirements
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-weight="bold">
                Parent Text
                <fo:block font-size="10pt">
                    Child Text
                    <fo:block>Grandchild Text</fo:block>
                </fo:block>
            </fo:block>
        `;
        const element = parseXML(xml);
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        // New behavior: text nodes with block siblings are wrapped with parent styling
        
        assert.ok(result.text, 'Should have text property');
        assert.equal(result.bold, true, 'Should have bold on parent');
        assert.ok(Array.isArray(result.text), 'Text should be array for nested content');
        
        // Verify structure - text may be wrapped or unwrapped
        const hasParentText = result.text.some(item => {
            const text = typeof item === 'string' ? item : item.text;
            return String(text).includes('Parent Text');
        });
        assert.ok(hasParentText, 'Should contain parent text');
        
        const childBlock = result.text.find(item => 
            typeof item === 'object' && item.fontSize === 10
        );
        assert.ok(childBlock, 'Should have child block with fontSize: 10');
        assert.ok(Array.isArray(childBlock.text), 'Child text should be array');
        
        const hasChildText = childBlock.text.some(item => 
            typeof item === 'string' && item.includes('Child Text')
        );
        assert.ok(hasChildText, 'Should contain child text');
        
        const hasGrandchildText = childBlock.text.some(item => 
            (typeof item === 'string' && item.includes('Grandchild Text')) ||
            (typeof item === 'object' && typeof item.text === 'string' && item.text.includes('Grandchild'))
        );
        assert.ok(hasGrandchildText, 'Should contain grandchild text');
    });

    testRunner.addTest('Traversal: Should handle multiple sibling blocks', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-weight="bold">
                Parent
                <fo:block font-size="10pt">First Child</fo:block>
                <fo:block font-style="italic">Second Child</fo:block>
                <fo:block color="#00FF00">Third Child</fo:block>
            </fo:block>
        `;
        const element = parseXML(xml);
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(result.text, 'Should have text property');
        assert.ok(Array.isArray(result.text), 'Text should be array for multiple children');
        assert.equal(result.bold, true, 'Parent should have bold');
        
        // Find children with specific attributes
        const firstChild = result.text.find(item => 
            typeof item === 'object' && item.fontSize === 10
        );
        const secondChild = result.text.find(item => 
            typeof item === 'object' && item.italics === true
        );
        const thirdChild = result.text.find(item => 
            typeof item === 'object' && item.color === '#00FF00'
        );
        
        assert.ok(firstChild, 'Should have first child with fontSize');
        assert.ok(secondChild, 'Should have second child with italics');
        assert.ok(thirdChild, 'Should have third child with color');
    });

    testRunner.addTest('Traversal: Should handle mixed content (text and blocks)', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-weight="bold">
                Before child
                <fo:block font-size="10pt">Child content</fo:block>
                After child
            </fo:block>
        `;
        const element = parseXML(xml);
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.ok(result.text, 'Should have text property');
        assert.ok(Array.isArray(result.text), 'Text should be array for mixed content');
        assert.equal(result.bold, true, 'Should have bold property');
        
        // With new behavior: text nodes with block siblings are wrapped with parent styling
        const hasBeforeText = result.text.some(item => {
            const text = typeof item === 'string' ? item : item.text;
            return String(text).includes('Before child');
        });
        const hasBlock = result.text.some(item => 
            typeof item === 'object' && item.fontSize === 10
        );
        const hasAfterText = result.text.some(item => {
            const text = typeof item === 'string' ? item : item.text;
            return String(text).includes('After child');
        });
        
        assert.ok(hasBeforeText, 'Should have text before child block');
        assert.ok(hasBlock, 'Should have child block');
        assert.ok(hasAfterText, 'Should have text after child block');
    });

    // ===== EDGE CASES =====

    testRunner.addTest('Traversal: Should handle null node', () => {
        const result = window.RecursiveTraversal.traverse(null, window.BlockConverter.convertBlock);
        assert.equal(result, null, 'Should return null for null node');
    });

    testRunner.addTest('Traversal: Should trim whitespace-only text nodes', () => {
        const xml = `
            <fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
                
                    Text with whitespace
                
            </fo:block>
        `;
        const element = parseXML(xml);
        
        const result = window.RecursiveTraversal.traverse(element, window.BlockConverter.convertBlock);
        
        assert.equal(result, 'Text with whitespace', 'Should trim whitespace');
    });

    // ===== TEST flattenContent UTILITY =====

    testRunner.addTest('flattenContent: Should merge adjacent strings', () => {
        const content = ['Hello', ' ', 'World'];
        const result = window.RecursiveTraversal.flattenContent(content);
        
        assert.equal(result, 'Hello World', 'Should merge adjacent strings');
    });

    testRunner.addTest('flattenContent: Should preserve objects in array', () => {
        const content = ['Text', { text: 'Bold', bold: true }, 'More text'];
        const result = window.RecursiveTraversal.flattenContent(content);
        
        assert.ok(Array.isArray(result), 'Should return array with mixed content');
        assert.equal(result.length, 3, 'Should have 3 items');
        assert.equal(result[0], 'Text', 'First item should be text');
        assert.deepEqual(result[1], { text: 'Bold', bold: true }, 'Second item should be object');
        assert.equal(result[2], 'More text', 'Third item should be text');
    });

    testRunner.addTest('flattenContent: Should return single item if array has one element', () => {
        const content = ['Single item'];
        const result = window.RecursiveTraversal.flattenContent(content);
        
        assert.equal(result, 'Single item', 'Should return single item, not array');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerRecursiveTraversalTests };
}
if (typeof window !== 'undefined') {
    window.registerRecursiveTraversalTests = registerRecursiveTraversalTests;
}

