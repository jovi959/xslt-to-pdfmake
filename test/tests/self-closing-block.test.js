/**
 * Self-Closing Block Tests
 * Tests that <fo:block/> elements are converted to newline characters (\n)
 */

function registerSelfClosingBlockTests(testRunner, converter, testXML, assert) {
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

    // EXAMPLE 1: Self-closing blocks as line breaks within text
    testRunner.addTest('Self-Closing Block: Should convert <fo:block/> to newline within text', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-size="6pt">
  6951 Westminster Highway, Richmond, BC<fo:block/>
  Mailing Address: PO Box 5350 Stn Terminal, Vancouver BC, V6B 5L5<fo:block/>
  Telephone 604 276-3100 Toll Free 1-888-621-7233 Fax 604 276-3247
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.ok(typeof result === 'object', 'Result should be an object');
        assert.equal(result.fontSize, 6, 'Font size should be 6pt');
        
        // The text should contain the newlines
        const textStr = Array.isArray(result.text) ? result.text.join('') : result.text;
        assert.ok(textStr.includes('\n'), 'Text should contain newline characters');
        
        // Count newlines
        const newlineCount = (textStr.match(/\n/g) || []).length;
        assert.equal(newlineCount, 2, 'Should have 2 newlines (from 2 self-closing blocks)');
        
        // Check specific content
        assert.ok(textStr.includes('6951 Westminster Highway, Richmond, BC'), 'Should contain first line');
        assert.ok(textStr.includes('Mailing Address: PO Box 5350 Stn Terminal, Vancouver BC, V6B 5L5'), 'Should contain second line');
        assert.ok(textStr.includes('Telephone 604 276-3100 Toll Free 1-888-621-7233 Fax 604 276-3247'), 'Should contain third line');
    });

    // EXAMPLE 2: Multiple consecutive self-closing blocks
    testRunner.addTest('Self-Closing Block: Multiple consecutive <fo:block/> should create blank lines', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">
  Line 1<fo:block/><fo:block/>
  Line 3
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = Array.isArray(result.text) ? result.text.join('') : result.text;
        
        // Should have 2 consecutive newlines (blank line)
        assert.ok(textStr.includes('\n\n'), 'Should contain double newline (blank line)');
        assert.ok(textStr.includes('Line 1'), 'Should contain Line 1');
        assert.ok(textStr.includes('Line 3'), 'Should contain Line 3');
        
        // Verify structure: "Line 1\n\nLine 3"
        const expectedPattern = /Line 1\s*\n\n\s*Line 3/;
        assert.ok(expectedPattern.test(textStr), 'Should match pattern "Line 1\\n\\nLine 3"');
    });

    // EXAMPLE 3: Leading self-closing block
    testRunner.addTest('Self-Closing Block: Leading <fo:block/> should create leading newline', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:block/>This text starts on a new line.</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = Array.isArray(result.text) ? result.text.join('') : result.text;
        
        // Should start with newline
        assert.ok(textStr.startsWith('\n'), 'Text should start with newline');
        assert.ok(textStr.includes('This text starts on a new line.'), 'Should contain the text');
        
        // Verify it's "\nThis text starts on a new line."
        const trimmedText = textStr.trim();
        assert.equal(trimmedText, 'This text starts on a new line.', 'After trimming, should be just the text');
    });

    // EXAMPLE 4: Trailing self-closing block
    testRunner.addTest('Self-Closing Block: Trailing <fo:block/> should create trailing newline', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format">This text has a newline at the end.<fo:block/></fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = Array.isArray(result.text) ? result.text.join('') : result.text;
        
        // Should end with newline
        assert.ok(textStr.endsWith('\n'), 'Text should end with newline');
        assert.ok(textStr.includes('This text has a newline at the end.'), 'Should contain the text');
        
        // Verify exact structure
        assert.equal(textStr.trim(), 'This text has a newline at the end.', 'After trimming, should be just the text');
    });

    // Additional test: Mixed self-closing blocks with styled text
    testRunner.addTest('Self-Closing Block: Should preserve styling with newlines', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-weight="bold" color="red">
Bold red text<fo:block/>
More bold red text
</fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        assert.equal(result.bold, true, 'Should be bold');
        assert.equal(result.color, 'red', 'Should be red');
        
        const textStr = Array.isArray(result.text) ? result.text.join('') : result.text;
        assert.ok(textStr.includes('\n'), 'Should contain newline');
        assert.ok(textStr.includes('Bold red text'), 'Should contain first line');
        assert.ok(textStr.includes('More bold red text'), 'Should contain second line');
    });

    // Edge case: Only a self-closing block (no other content)
    testRunner.addTest('Self-Closing Block: Standalone <fo:block/> should be just newline', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:block/></fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        // Should be just a newline character
        const textStr = typeof result === 'string' ? result : result.text;
        assert.equal(textStr, '\n', 'Should be exactly one newline character');
    });

    // Edge case: Multiple standalone self-closing blocks
    testRunner.addTest('Self-Closing Block: Multiple standalone <fo:block/> should be multiple newlines', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:block/><fo:block/><fo:block/></fo:block>`;
        const element = parseXML(xml);
        const result = RecursiveTraversal.traverse(element, BlockConverter.convertBlock);
        
        const textStr = Array.isArray(result.text) ? result.text.join('') : result.text;
        
        // Should be 3 newlines
        const newlineCount = (textStr.match(/\n/g) || []).length;
        assert.equal(newlineCount, 3, 'Should have exactly 3 newlines');
        assert.equal(textStr, '\n\n\n', 'Should be exactly three newline characters');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerSelfClosingBlockTests };
}
if (typeof window !== 'undefined') {
    window.registerSelfClosingBlockTests = registerSelfClosingBlockTests;
}

