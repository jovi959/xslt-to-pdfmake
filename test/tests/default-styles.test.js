/**
 * Default Styles Tests
 * Tests the default styles configuration system
 */

function registerDefaultStylesTests(testRunner, converter, testXML, assert) {
    // Helper to apply default styles to a doc definition
    const applyDefaultStyles = (docDef, styles) => {
        if (typeof window !== 'undefined' && window.DefaultStylesApplier) {
            return window.DefaultStylesApplier.applyDefaultStyles(docDef, styles);
        } else if (typeof require === 'function') {
            const applier = require('../../src/default-styles-applier.js');
            return applier.applyDefaultStyles(docDef, styles);
        }
        throw new Error('DefaultStylesApplier not available');
    };

    testRunner.addTest('Should apply lineHeight to document defaultStyle', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { lineHeight: 1.5 };
        applyDefaultStyles(result, defaultStyles);
        
        // Check defaultStyle at document level (applies globally via inheritance)
        assert.ok(result.defaultStyle, 'Should have defaultStyle');
        assert.equal(result.defaultStyle.lineHeight, 1.5, 'defaultStyle should have lineHeight 1.5');
    });

    testRunner.addTest('Should NOT override explicit lineHeight', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { lineHeight: 1.5 };
        applyDefaultStyles(result, defaultStyles);
        
        // Find block with explicit lineHeight="2.0"
        const blockWithLineHeight = result.content.find(item => 
            item.text && typeof item.text === 'string' && item.text.includes('explicit line-height 2.0')
        );
        
        assert.ok(blockWithLineHeight, 'Should find block with explicit lineHeight');
        assert.equal(blockWithLineHeight.lineHeight, 2.0, 'Should preserve explicit lineHeight 2.0');
    });

    testRunner.addTest('Should apply fontSize to document defaultStyle', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { fontSize: 10 };
        applyDefaultStyles(result, defaultStyles);
        
        // Check defaultStyle at document level
        assert.ok(result.defaultStyle, 'Should have defaultStyle');
        assert.equal(result.defaultStyle.fontSize, 10, 'defaultStyle should have fontSize 10');
    });

    testRunner.addTest('Should NOT override explicit fontSize', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { fontSize: 10 };
        applyDefaultStyles(result, defaultStyles);
        
        // Find block with explicit font-size="14pt"
        const blockWithFontSize = result.content.find(item => 
            item.text && typeof item.text === 'string' && item.text.includes('explicit font-size 14pt')
        );
        
        assert.ok(blockWithFontSize, 'Should find block with explicit fontSize');
        assert.equal(blockWithFontSize.fontSize, 14, 'Should preserve explicit fontSize 14');
    });

    testRunner.addTest('Should apply color to document defaultStyle', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { color: '#333333' };
        applyDefaultStyles(result, defaultStyles);
        
        // Check defaultStyle at document level
        assert.ok(result.defaultStyle, 'Should have defaultStyle');
        assert.equal(result.defaultStyle.color, '#333333', 'defaultStyle should have color #333333');
    });

    testRunner.addTest('Should NOT override explicit color', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { color: '#333333' };
        applyDefaultStyles(result, defaultStyles);
        
        // Find block with explicit color="#FF0000"
        const blockWithColor = result.content.find(item => 
            item.text && typeof item.text === 'string' && item.text.includes('Red text')
        );
        
        assert.ok(blockWithColor, 'Should find block with explicit color');
        assert.equal(blockWithColor.color, '#FF0000', 'Should preserve explicit color #FF0000');
    });

    testRunner.addTest('Should apply multiple default styles at once', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply multiple default styles
        const defaultStyles = { 
            lineHeight: 1.5, 
            fontSize: 10, 
            color: '#000000' 
        };
        applyDefaultStyles(result, defaultStyles);
        
        // Check defaultStyle at document level
        assert.ok(result.defaultStyle, 'Should have defaultStyle');
        assert.equal(result.defaultStyle.lineHeight, 1.5, 'Should have lineHeight 1.5');
        assert.equal(result.defaultStyle.fontSize, 10, 'Should have fontSize 10');
        assert.equal(result.defaultStyle.color, '#000000', 'Should have color #000000');
    });

    testRunner.addTest('Should apply defaults via PDFMake inheritance (nested blocks get defaults automatically)', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { lineHeight: 1.5 };
        applyDefaultStyles(result, defaultStyles);
        
        // The defaultStyle applies globally - nested blocks inherit automatically
        assert.ok(result.defaultStyle, 'Should have defaultStyle');
        assert.equal(result.defaultStyle.lineHeight, 1.5, 'defaultStyle should have lineHeight 1.5');
        
        // Verify explicit styles are preserved on child elements
        const childBlock = result.content.find(item => 
            typeof item === 'object' && item.text && 
            (item.text.includes('Child with explicit') || 
             (Array.isArray(item.text) && item.text.some(t => typeof t === 'object' && t.text && t.text.includes('Child with explicit'))))
        );
        
        if (childBlock) {
            // If we found a direct block with explicit styles
            if (childBlock.fontSize) {
                assert.equal(childBlock.fontSize, 16, 'Child should preserve explicit fontSize');
            }
            if (childBlock.color) {
                assert.equal(childBlock.color, '#0000FF', 'Child should preserve explicit color');
            }
        }
    });

    testRunner.addTest('Should apply defaults to table cells via inheritance', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { lineHeight: 1.5 };
        applyDefaultStyles(result, defaultStyles);
        
        // Table cells inherit from defaultStyle automatically
        assert.ok(result.defaultStyle, 'Should have defaultStyle');
        assert.equal(result.defaultStyle.lineHeight, 1.5, 'defaultStyle should have lineHeight (applies to table cells via inheritance)');
    });

    testRunner.addTest('Should NOT override table cell explicit styles', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { fontSize: 10 };
        applyDefaultStyles(result, defaultStyles);
        
        // Find table
        const table = result.content.find(item => item.table && item.table.body);
        assert.ok(table, 'Should find table');
        
        // Check second cell (has explicit fontSize)
        const secondCell = table.table.body[0][1];
        assert.ok(secondCell, 'Should have second cell');
        
        // Cell content might be an array or single block
        const cellContent = Array.isArray(secondCell) ? secondCell[0] : secondCell;
        assert.ok(cellContent, 'Should have cell content');
        assert.equal(cellContent.fontSize, 12, 'Should preserve explicit fontSize 12');
    });

    testRunner.addTest('Should apply defaults to list items via inheritance', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { color: '#333333' };
        applyDefaultStyles(result, defaultStyles);
        
        // List items inherit from defaultStyle automatically
        assert.ok(result.defaultStyle, 'Should have defaultStyle');
        assert.equal(result.defaultStyle.color, '#333333', 'defaultStyle should have color (applies to list items via inheritance)');
    });

    testRunner.addTest('Should work with empty default styles object', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply empty default styles
        const defaultStyles = {};
        const modifiedResult = applyDefaultStyles(result, defaultStyles);
        
        // Should not throw error and should return the result
        assert.ok(modifiedResult, 'Should return result');
        assert.ok(modifiedResult.content, 'Should have content');
    });

    testRunner.addTest('Should handle undefined/null default styles', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply null default styles (should not crash)
        const modifiedResult = applyDefaultStyles(result, null);
        
        // Should not throw error
        assert.ok(modifiedResult, 'Should return result');
        assert.ok(modifiedResult.content, 'Should have content');
    });

    testRunner.addTest('Should apply defaults to inline elements via inheritance', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { color: '#555555' };
        applyDefaultStyles(result, defaultStyles);
        
        // Inline elements inherit from defaultStyle automatically
        assert.ok(result.defaultStyle, 'Should have defaultStyle');
        assert.equal(result.defaultStyle.color, '#555555', 'defaultStyle should have color (applies to inline elements via inheritance)');
    });

    testRunner.addTest('Should NOT override inline explicit styles', () => {
        const result = converter.convertToPDFMake(testXML);
        
        // Apply default styles
        const defaultStyles = { bold: false };
        applyDefaultStyles(result, defaultStyles);
        
        // Find block with inline elements
        const blockWithInlines = result.content.find(item => 
            item.text && Array.isArray(item.text) && 
            item.text.some(t => typeof t === 'object' && t.text && t.text.includes('inline with bold'))
        );
        
        assert.ok(blockWithInlines, 'Should find block with inlines');
        
        // Find the inline with bold
        const inlineWithBold = blockWithInlines.text.find(t => 
            typeof t === 'object' && t.text && t.text.includes('inline with bold')
        );
        
        assert.ok(inlineWithBold, 'Should find inline with bold');
        assert.equal(inlineWithBold.bold, true, 'Should preserve explicit bold');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerDefaultStylesTests };
}
if (typeof window !== 'undefined') {
    window.registerDefaultStylesTests = registerDefaultStylesTests;
}


