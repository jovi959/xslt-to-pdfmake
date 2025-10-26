/**
 * Integrated Conversion Tests
 * 
 * Tests the full conversion pipeline from XSL-FO to PDFMake,
 * including content extraction and block conversion.
 */

function registerIntegratedConversionTests(testRunner, converter, testXML, assert) {
    const parser = new DOMParser();

    // ===== CONTENT EXTRACTION TESTS =====

    testRunner.addTest('Integrated: Should extract content from flow', () => {
        const result = converter.convertToPDFMake(testXML);
        
        assert.ok(result.content, 'Should have content property');
        assert.ok(Array.isArray(result.content), 'Content should be an array');
        assert.ok(result.content.length > 0, 'Content array should not be empty');
    });

    testRunner.addTest('Integrated: Should convert simple text blocks', () => {
        const result = converter.convertToPDFMake(testXML);
        const content = result.content;
        
        // Find simple paragraph
        const simplePara = content.find(item => 
            typeof item === 'string' && item.includes('simple paragraph')
        );
        
        assert.ok(simplePara, 'Should have simple paragraph text');
    });

    testRunner.addTest('Integrated: Should convert bold blocks', () => {
        const result = converter.convertToPDFMake(testXML);
        const content = result.content;
        
        // Find bold paragraph
        const boldPara = content.find(item => 
            typeof item === 'object' && 
            item.bold === true &&
            (typeof item.text === 'string' && item.text.includes('bold'))
        );
        
        assert.ok(boldPara, 'Should have bold paragraph');
        assert.equal(boldPara.bold, true, 'Should have bold property');
    });

    testRunner.addTest('Integrated: Should convert styled blocks with multiple attributes', () => {
        const result = converter.convertToPDFMake(testXML);
        const content = result.content;
        
        // Find blue 14pt text
        const styledPara = content.find(item => 
            typeof item === 'object' && 
            item.fontSize === 14 &&
            item.color === '#0000FF'
        );
        
        assert.ok(styledPara, 'Should have styled paragraph');
        assert.equal(styledPara.fontSize, 14, 'Should have fontSize 14');
        assert.equal(styledPara.color, '#0000FF', 'Should have blue color');
    });

    testRunner.addTest('Integrated: Should handle nested blocks in content', () => {
        const result = converter.convertToPDFMake(testXML);
        const content = result.content;
        
        // Find nested block structure
        const nestedBlock = content.find(item => 
            typeof item === 'object' && 
            item.bold === true &&
            Array.isArray(item.text)
        );
        
        assert.ok(nestedBlock, 'Should have nested block structure');
        assert.ok(Array.isArray(nestedBlock.text), 'Nested block should have array text');
        
        // Check for nested italic child
        const hasItalicChild = nestedBlock.text.some(child =>
            typeof child === 'object' && child.italics === true
        );
        assert.ok(hasItalicChild, 'Should have italic child in nested structure');
    });

    testRunner.addTest('Integrated: Should preserve document structure (pageSize, margins)', () => {
        const result = converter.convertToPDFMake(testXML);
        
        assert.ok(result.pageSize, 'Should have pageSize');
        assert.equal(result.pageSize, 'LETTER', 'Should detect LETTER page size');
        assert.ok(result.pageMargins, 'Should have pageMargins');
        assert.ok(Array.isArray(result.pageMargins), 'pageMargins should be an array');
    });

    testRunner.addTest('Integrated: Should return complete PDFMake definition', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Verify all required properties
        assert.ok(result.pageSize, 'Should have pageSize');
        assert.ok(result.pageMargins, 'Should have pageMargins');
        assert.ok(result.content, 'Should have content');
        
        // Verify structure
        assert.ok(typeof result === 'object', 'Result should be an object');
        assert.ok(Array.isArray(result.content), 'Content should be array');
    });

    testRunner.addTest('Integrated: Content should be valid PDFMake format', () => {
        const result = converter.convertToPDFMake(testXML);
        const content = result.content;
        
        // Check each content item is valid
        content.forEach((item, index) => {
            const isValidString = typeof item === 'string';
            const isValidObject = typeof item === 'object' && item.text !== undefined;
            
            assert.ok(
                isValidString || isValidObject,
                `Content item ${index} should be string or object with text property`
            );
        });
    });

    // ===== CONTENT EXTRACTION METHOD TESTS =====

    testRunner.addTest('Integrated: extractContent should return array', () => {
        const content = converter.extractContent(testXML);
        
        assert.ok(Array.isArray(content), 'extractContent should return an array');
    });

    testRunner.addTest('Integrated: extractContent should process all blocks', () => {
        const content = converter.extractContent(testXML);
        
        // Should have multiple content items from the test file
        assert.ok(content.length >= 5, 'Should have at least 5 content items');
    });

    testRunner.addTest('Integrated: extractContent should convert attributes correctly', () => {
        const content = converter.extractContent(testXML);
        
        // Find an item with fontSize
        const itemWithFontSize = content.find(item => 
            typeof item === 'object' && item.fontSize
        );
        
        assert.ok(itemWithFontSize, 'Should find item with fontSize');
        assert.ok(typeof itemWithFontSize.fontSize === 'number', 'fontSize should be a number');
    });

    // ===== EDGE CASES =====

    testRunner.addTest('Integrated: Should handle empty flow gracefully', () => {
        const emptyFlowXML = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
    <fo:layout-master-set>
        <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
            <fo:region-body margin="0.5in"/>
        </fo:simple-page-master>
    </fo:layout-master-set>
    <fo:page-sequence master-reference="Test">
        <fo:flow flow-name="xsl-region-body">
            <!-- Empty flow -->
        </fo:flow>
    </fo:page-sequence>
</fo:root>`;
        
        const result = converter.convertToPDFMake(emptyFlowXML);
        
        assert.ok(result, 'Should return result');
        assert.ok(result.content, 'Should have content property');
        assert.ok(Array.isArray(result.content), 'Content should be array');
        assert.equal(result.content.length, 0, 'Empty flow should result in empty content array');
    });

    testRunner.addTest('Integrated: Should handle document without flow', () => {
        const noFlowXML = `<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
    <fo:layout-master-set>
        <fo:simple-page-master master-name="Test" page-width="8.5in" page-height="11in" margin="1in">
            <fo:region-body margin="0.5in"/>
        </fo:simple-page-master>
    </fo:layout-master-set>
</fo:root>`;
        
        const result = converter.convertToPDFMake(noFlowXML);
        
        assert.ok(result, 'Should return result');
        assert.ok(result.content, 'Should have content property');
        assert.ok(Array.isArray(result.content), 'Content should be array');
        assert.equal(result.content.length, 0, 'Document without flow should have empty content');
    });

    testRunner.addTest('Integrated: Should maintain content order', () => {
        const content = converter.extractContent(testXML);
        
        // First item should be simple paragraph
        const firstItem = content[0];
        assert.ok(
            typeof firstItem === 'string' && firstItem.includes('simple'),
            'First item should be simple paragraph'
        );
        
        // Second item should be bold paragraph
        const secondItem = content[1];
        assert.ok(
            typeof secondItem === 'object' && secondItem.bold === true,
            'Second item should be bold paragraph'
        );
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerIntegratedConversionTests };
}
if (typeof window !== 'undefined') {
    window.registerIntegratedConversionTests = registerIntegratedConversionTests;
}

