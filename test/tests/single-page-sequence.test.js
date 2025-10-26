/**
 * Single Page Sequence Tests
 * Tests for documents with NO page-sequence-master (legacy/simple case)
 */

function registerSinglePageSequenceTests(testRunner, converter, singlePageSequenceXML, assert) {
    testRunner.addTest('Should return empty sequences when no page-sequence-master', () => {
        const result = converter.parsePageSequences(singlePageSequenceXML);
        
        assert.ok(result, 'Should return page sequence data');
        assert.ok(Array.isArray(result.sequences), 'Should have sequences array');
        assert.equal(result.sequences.length, 0, 'Should have 0 sequences (no page-sequence-master)');
    });

    testRunner.addTest('Should use legacy pageMargins when no page-sequence-master', () => {
        const docDef = converter.convertToPDFMake(singlePageSequenceXML);
        
        // When there's no page-sequence-master, use legacy behavior: pageMargins directly
        assert.deepEqual(docDef.pageMargins, [72, 72, 72, 72], 'Should use primary master margins directly');
    });

    testRunner.addTest('Should NOT have header when no page-sequence-master', () => {
        const docDef = converter.convertToPDFMake(singlePageSequenceXML);
        
        assert.ok(!docDef.header, 'Should NOT have header in legacy mode');
    });

    testRunner.addTest('Should NOT have footer when no page-sequence-master', () => {
        const docDef = converter.convertToPDFMake(singlePageSequenceXML);
        
        assert.ok(!docDef.footer, 'Should NOT have footer in legacy mode');
    });

    testRunner.addTest('Should maintain pageSize as LETTER for single sequence', () => {
        const docDef = converter.convertToPDFMake(singlePageSequenceXML);
        
        assert.equal(docDef.pageSize, 'LETTER', 'Page size should be LETTER');
    });

    testRunner.addTest('Should parse single page master correctly', () => {
        const pageMasters = converter.parsePageMasters(singlePageSequenceXML);
        
        assert.equal(pageMasters.length, 1, 'Should have 1 page master');
        assert.equal(pageMasters[0].masterName, 'single', 'Should be named "single"');
        assert.deepEqual(pageMasters[0].margins, [72, 72, 72, 72], 'Should have 1-inch margins all around');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerSinglePageSequenceTests };
}
if (typeof window !== 'undefined') {
    window.registerSinglePageSequenceTests = registerSinglePageSequenceTests;
}

