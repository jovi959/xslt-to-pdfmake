/**
 * Page Sequence Tests
 * Tests for page-sequence-master parsing and header/footer generation
 */

function registerPageSequenceTests(testRunner, converter, pageSequenceXML, assert) {
    testRunner.addTest('Should parse page-sequence-master with multiple references', () => {
        const result = converter.parsePageSequences(pageSequenceXML);
        
        assert.ok(result, 'Should return page sequence data');
        assert.ok(Array.isArray(result.sequences), 'Should have sequences array');
        assert.equal(result.sequences.length, 2, 'Should have 2 page references');
    });

    testRunner.addTest('Should parse single-page-master-reference', () => {
        const result = converter.parsePageSequences(pageSequenceXML);
        const firstRef = result.sequences[0];
        
        assert.ok(firstRef, 'Should have first reference');
        assert.equal(firstRef.type, 'single', 'Should be single type');
        assert.equal(firstRef.masterRef, 'first', 'Should reference "first" master');
    });

    testRunner.addTest('Should parse repeatable-page-master-reference', () => {
        const result = converter.parsePageSequences(pageSequenceXML);
        const repeatableRef = result.sequences[1];
        
        assert.ok(repeatableRef, 'Should have repeatable reference');
        assert.equal(repeatableRef.type, 'repeatable', 'Should be repeatable type');
        assert.equal(repeatableRef.masterRef, 'rest', 'Should reference "rest" master');
    });

    testRunner.addTest('Should generate function-based header for multi-sequence', () => {
        const docDef = converter.convertToPDFMake(pageSequenceXML);
        
        assert.ok(docDef.header, 'Should have header');
        assert.equal(typeof docDef.header, 'function', 'Header should be a function for multi-sequence');
    });

    testRunner.addTest('Should generate function-based footer for multi-sequence', () => {
        const docDef = converter.convertToPDFMake(pageSequenceXML);
        
        assert.ok(docDef.footer, 'Should have footer');
        assert.equal(typeof docDef.footer, 'function', 'Footer should be a function for multi-sequence');
    });

    testRunner.addTest('Should return correct margins for page 1 in header', () => {
        const docDef = converter.convertToPDFMake(pageSequenceXML);
        const headerResult = docDef.header(1, 10);
        
        assert.ok(headerResult, 'Should return header object for page 1');
        assert.deepEqual(headerResult.margin, [72, 72, 72, 0], 'Page 1 header should have 1-inch margins (72pt)');
    });

    testRunner.addTest('Should return correct margins for page 2+ in header', () => {
        const docDef = converter.convertToPDFMake(pageSequenceXML);
        const headerResult = docDef.header(2, 10);
        
        assert.ok(headerResult, 'Should return header object for page 2');
        assert.deepEqual(headerResult.margin, [36, 36, 36, 0], 'Page 2+ header should have 0.5-inch margins (36pt)');
    });

    testRunner.addTest('Should return correct margins for page 1 in footer', () => {
        const docDef = converter.convertToPDFMake(pageSequenceXML);
        const footerResult = docDef.footer(1, 10);
        
        assert.ok(footerResult, 'Should return footer object for page 1');
        assert.deepEqual(footerResult.margin, [72, 0, 72, 72], 'Page 1 footer should have 1-inch margins (72pt)');
    });

    testRunner.addTest('Should return correct margins for page 2+ in footer', () => {
        const docDef = converter.convertToPDFMake(pageSequenceXML);
        const footerResult = docDef.footer(2, 10);
        
        assert.ok(footerResult, 'Should return footer object for page 2');
        assert.deepEqual(footerResult.margin, [36, 0, 36, 36], 'Page 2+ footer should have 0.5-inch margins (36pt)');
    });

    testRunner.addTest('Should set pageMargins to [0,0,0,0] globally', () => {
        const docDef = converter.convertToPDFMake(pageSequenceXML);
        
        assert.deepEqual(docDef.pageMargins, [0, 0, 0, 0], 'Global pageMargins should be [0,0,0,0]');
    });

    testRunner.addTest('Should maintain pageSize as LETTER', () => {
        const docDef = converter.convertToPDFMake(pageSequenceXML);
        
        assert.equal(docDef.pageSize, 'LETTER', 'Page size should be LETTER');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerPageSequenceTests };
}
if (typeof window !== 'undefined') {
    window.registerPageSequenceTests = registerPageSequenceTests;
}

