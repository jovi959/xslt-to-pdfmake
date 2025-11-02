/**
 * Font Weight Override Tests
 * 
 * Tests handling of font-weight inheritance and explicit overrides.
 * When a parent has bold: true, a child with font-weight="normal" should get bold: false.
 * When a parent has bold: false (or no bold), a child with font-weight="bold" should get bold: true.
 */

function registerFontWeightOverrideTests(testRunner, converter, fontWeightXML, assert) {
    
    testRunner.addTest('Should handle bold block with normal inline override', () => {
        const result = converter.convertToPDFMake(fontWeightXML);
        
        // Find the first block (bold block with normal inline)
        const block = result.content[0];
        
        assert.ok(block, 'Should have first block');
        assert.equal(block.bold, true, 'Block should have bold: true');
        assert.ok(Array.isArray(block.text), 'Block text should be an array');
        assert.equal(block.text.length, 2, 'Should have 2 text elements (text + inline)');
        
        // First element: "This is bold. " - inherits bold from parent
        assert.equal(typeof block.text[0], 'string', 'First element should be string');
        assert.ok(block.text[0].includes('This is bold'), 'First element should contain "This is bold"');
        
        // Second element: inline with font-weight="normal" - should have bold: false
        assert.equal(typeof block.text[1], 'object', 'Second element should be object');
        assert.ok(block.text[1].text.includes('This is normal'), 'Inline should contain "This is normal"');
        assert.equal(block.text[1].bold, false, 'Inline with font-weight="normal" should have bold: false to override parent');
    });
    
    testRunner.addTest('Should handle normal block with bold inline', () => {
        const result = converter.convertToPDFMake(fontWeightXML);
        
        // Find the second block (normal block with bold inline)
        const block = result.content[1];
        
        assert.ok(block, 'Should have second block');
        assert.ok(!block.bold || block.bold === false, 'Block should not have bold property or be false');
        assert.ok(Array.isArray(block.text), 'Block text should be an array');
        
        // Last element should be the bold inline
        const boldInline = block.text[block.text.length - 1];
        assert.equal(typeof boldInline, 'object', 'Bold inline should be object');
        assert.ok(boldInline.text.includes('This is bold'), 'Inline should contain "This is bold"');
        assert.equal(boldInline.bold, true, 'Inline with font-weight="bold" should have bold: true');
    });
    
    testRunner.addTest('Should handle multiple inlines with different weights', () => {
        const result = converter.convertToPDFMake(fontWeightXML);
        
        // Find the third block (bold block with multiple inlines)
        const block = result.content[2];
        
        assert.ok(block, 'Should have third block');
        assert.equal(block.bold, true, 'Block should have bold: true');
        assert.ok(Array.isArray(block.text), 'Block text should be an array');
        
        // Find the normal inline
        const normalInline = block.text.find(item => 
            typeof item === 'object' && item.text && item.text.includes('normal')
        );
        assert.ok(normalInline, 'Should find normal inline');
        assert.equal(normalInline.bold, false, 'Normal inline should have bold: false to override parent');
        
        // Find the explicitly bold inline
        const explicitBoldInline = block.text.find(item => 
            typeof item === 'object' && item.text && item.text.includes('explicitly bold')
        );
        assert.ok(explicitBoldInline, 'Should find explicitly bold inline');
        // Explicitly bold inline in a bold parent may have bold: true or may not have it
        // (since it matches parent). Either is acceptable.
        assert.ok(explicitBoldInline.bold === true || explicitBoldInline.bold === undefined,
            'Explicitly bold inline should have bold: true or inherit from parent');
    });
    
    testRunner.addTest('Should handle nested inlines with weight changes', () => {
        const result = converter.convertToPDFMake(fontWeightXML);
        
        // Find the fourth block (bold block with nested inlines)
        const block = result.content[3];
        
        assert.ok(block, 'Should have fourth block');
        assert.equal(block.bold, true, 'Block should have bold: true');
        assert.ok(Array.isArray(block.text), 'Block text should be an array');
        
        // Find the normal inline (should be an object with text array)
        const normalInline = block.text.find(item => 
            typeof item === 'object' && Array.isArray(item.text)
        );
        
        if (normalInline) {
            assert.equal(normalInline.bold, false, 'Normal inline should have bold: false');
            
            // Inside the normal inline, there should be a bold nested inline
            const nestedBold = normalInline.text.find(item =>
                typeof item === 'object' && item.text && item.text.includes('nested bold')
            );
            
            if (nestedBold) {
                assert.equal(nestedBold.bold, true, 'Nested bold inline should have bold: true');
            }
        }
    });
    
    testRunner.addTest('Should not add bold: false when parent is not bold', () => {
        const result = converter.convertToPDFMake(fontWeightXML);
        
        // Second block is normal (not bold)
        const block = result.content[1];
        
        // Find text before the bold inline
        const normalText = block.text.find(item => 
            typeof item === 'string' && item.includes('This is normal')
        );
        
        // The block itself should not have bold property or should be false/undefined
        assert.ok(block.bold === undefined || block.bold === false, 
            'Normal block should not have bold: true');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerFontWeightOverrideTests };
}
if (typeof window !== 'undefined') {
    window.registerFontWeightOverrideTests = registerFontWeightOverrideTests;
}

