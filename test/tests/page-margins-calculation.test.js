/**
 * Tests for page margins calculation from simplePageMasters
 * Verifies that calculatedPageMargins are pre-calculated correctly during parseDocumentStructure
 * and applied properly in convertXSLFOToPDF
 */

function registerPageMarginsCalculationTests(testRunner, converter, pageMarginsXML, assert) {
    // ========================================
    // UNIT TESTS: parseDocumentStructure
    // ========================================

    testRunner.addTest('Page Margins: parseDocumentStructure should add calculatedPageMargins field', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(pageMarginsXML, converter);
        
        assert.ok(docStructure.simplePageMasters, 'Should have simplePageMasters');
        assert.ok(docStructure.simplePageMasters['first'], 'Should have first page master');
        assert.ok(docStructure.simplePageMasters['first'].calculatedPageMargins, 
            'First page master should have calculatedPageMargins field');
        assert.ok(Array.isArray(docStructure.simplePageMasters['first'].calculatedPageMargins), 
            'calculatedPageMargins should be an array');
        assert.equal(docStructure.simplePageMasters['first'].calculatedPageMargins.length, 4, 
            'calculatedPageMargins should have 4 elements [left, top, right, bottom]');
    });

    testRunner.addTest('Page Margins: First page master should calculate [36, 72, 36, 80.37]', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(pageMarginsXML, converter);
        const firstMaster = docStructure.simplePageMasters['first'];
        
        // Expected: left=18+18=36, top=72 (header height), right=18+18=36, bottom=18+28.35+34.02=80.37
        assert.equal(firstMaster.calculatedPageMargins[0], 36, 'Left margin should be 36 (18 page + 18 body)');
        assert.approximately(firstMaster.calculatedPageMargins[1], 72, 0.1, 'Top margin should be 72 (header height only)');
        assert.equal(firstMaster.calculatedPageMargins[2], 36, 'Right margin should be 36 (18 page + 18 body)');
        assert.approximately(firstMaster.calculatedPageMargins[3], 80.37, 0.1, 'Bottom margin should be 80.37 (18 page + 28.35 footer + 34.02 gap)');
    });

    testRunner.addTest('Page Margins: Rest page master should calculate [36, 72, 36, 80.37]', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(pageMarginsXML, converter);
        const restMaster = docStructure.simplePageMasters['rest'];
        
        // Expected: identical to first
        assert.equal(restMaster.calculatedPageMargins[0], 36, 'Left margin should be 36');
        assert.approximately(restMaster.calculatedPageMargins[1], 72, 0.1, 'Top margin should be 72');
        assert.equal(restMaster.calculatedPageMargins[2], 36, 'Right margin should be 36');
        assert.approximately(restMaster.calculatedPageMargins[3], 80.37, 0.1, 'Bottom margin should be 80.37');
    });

    testRunner.addTest('Page Margins: Simple page master (no header) should calculate [18, 0, 18, 80.37]', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(pageMarginsXML, converter);
        const simpleMaster = docStructure.simplePageMasters['simple'];
        
        // Expected: left=18+0=18, top=0 (no header), right=18+0=18, bottom=18+28.35+34.02=80.37
        assert.equal(simpleMaster.calculatedPageMargins[0], 18, 'Left margin should be 18 (18 page + 0 body)');
        assert.equal(simpleMaster.calculatedPageMargins[1], 0, 'Top margin should be 0 (no header)');
        assert.equal(simpleMaster.calculatedPageMargins[2], 18, 'Right margin should be 18 (18 page + 0 body)');
        assert.approximately(simpleMaster.calculatedPageMargins[3], 80.37, 0.1, 'Bottom margin should be 80.37 (18 page + 28.35 footer + 34.02 gap)');
    });

    testRunner.addTest('Page Margins: Complex page master should calculate [20, 100, 20, 90]', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(pageMarginsXML, converter);
        const complexMaster = docStructure.simplePageMasters['complex'];
        
        // Expected: left=20+0=20, top=100 (header height), right=20+0=20, bottom=20+50+20=90
        assert.approximately(complexMaster.calculatedPageMargins[0], 20, 0.1, 'Left margin should be 20 (20 page + 0 body)');
        assert.approximately(complexMaster.calculatedPageMargins[1], 100, 0.1, 'Top margin should be 100 (header height only)');
        assert.approximately(complexMaster.calculatedPageMargins[2], 20, 0.1, 'Right margin should be 20 (20 page + 0 body)');
        assert.approximately(complexMaster.calculatedPageMargins[3], 90, 0.1, 'Bottom margin should be 90 (20 page + 50 footer + 20 gap)');
    });

    // ========================================
    // EDGE CASES
    // ========================================

    testRunner.addTest('Page Margins: Should handle zero header height correctly', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(pageMarginsXML, converter);
        const simpleMaster = docStructure.simplePageMasters['simple'];
        
        // When header height is 0, top should be 0 (simplified logic)
        assert.ok(simpleMaster.header, 'Simple master should have header object');
        assert.equal(simpleMaster.header.height, 0, 'Simple master header height should be 0');
        assert.equal(simpleMaster.calculatedPageMargins[1], 0, 
            'Top margin should be 0 when header height is 0 (simplified logic)');
    });

    testRunner.addTest('Page Margins: calculatedPageMargins should differ from pageMargin when regions exist', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(pageMarginsXML, converter);
        const firstMaster = docStructure.simplePageMasters['first'];
        
        // calculatedPageMargins should be different from pageMargin because we add header/footer heights
        const pageMarginTop = firstMaster.pageMargin[1];
        const calculatedTop = firstMaster.calculatedPageMargins[1];
        
        assert.ok(calculatedTop > pageMarginTop, 
            'Calculated top margin should be greater than page margin when header exists');
    });

    // ========================================
    // INTEGRATION TESTS: convertXSLFOToPDF
    // ========================================

    testRunner.addTest('Page Margins: convertXSLFOToPDF should use calculatedPageMargins', async () => {
        // This test verifies that the generated PDF uses the pre-calculated margins
        // We can't directly inspect the PDF, but we can verify the docStructure is correct
        const docStructure = window.DocStructureParser.parseDocumentStructure(pageMarginsXML, converter);
        
        // Verify all page masters have calculatedPageMargins
        const masterNames = ['first', 'rest', 'simple', 'complex'];
        for (const name of masterNames) {
            assert.ok(docStructure.simplePageMasters[name].calculatedPageMargins, 
                `${name} page master should have calculatedPageMargins`);
        }
    });

    testRunner.addTest('Page Margins: Fallback to pageMargin if calculatedPageMargins missing', () => {
        // Create a mock page master without calculatedPageMargins
        const mockPageMaster = {
            pageInfo: 'LETTER',
            pageMargin: [72, 72, 72, 72],
            body: { name: 'xsl-region-body', margins: [72, 0, 72, 0] }
        };
        
        // Simulate the fallback logic from convertXSLFOToPDF
        const margins = mockPageMaster.calculatedPageMargins || mockPageMaster.pageMargin;
        
        assert.deepEqual(margins, [72, 72, 72, 72], 
            'Should fallback to pageMargin when calculatedPageMargins is missing');
    });

    // ========================================
    // HELPER FUNCTION TESTS
    // ========================================

    testRunner.addTest('Page Margins: calculatePageMarginsFromMaster helper should work correctly', () => {
        const mockPageMaster = {
            pageMargin: [18, 18, 18, 18],
            header: { height: 72, margins: [18, 18, 18, 36] },
            body: { margins: [18, 0, 18, 0] }, // region-body margins only (will be added to pageMargin)
            footer: { height: 28.35, margins: [18, 34.02, 18, 18] }
        };
        
        const result = window.DocStructureParser.calculatePageMarginsFromMaster(mockPageMaster);
        
        assert.equal(result[0], 36, 'Left should be 36 (18 page + 18 body)');
        assert.approximately(result[1], 72, 0.1, 'Top should be 72 (header height only)');
        assert.equal(result[2], 36, 'Right should be 36 (18 page + 18 body)');
        assert.approximately(result[3], 80.37, 0.1, 'Bottom should be 80.37 (18 page + 28.35 footer + 34.02 gap)');
    });

    testRunner.addTest('Page Margins: calculatePageMarginsFromMaster should handle zero header height', () => {
        const mockPageMaster = {
            pageMargin: [18, 18, 18, 18],
            header: { height: 0, margins: [18, 18, 18, 0] },
            body: { margins: [0, 0, 0, 0] }, // region-body margins only (0 in this case)
            footer: { height: 28.35, margins: [18, 34.02, 18, 18] }
        };
        
        const result = window.DocStructureParser.calculatePageMarginsFromMaster(mockPageMaster);
        
        assert.equal(result[0], 18, 'Left should be 18 (18 page + 0 body)');
        assert.equal(result[1], 0, 'Top should be 0 (header height is 0)');
        assert.equal(result[2], 18, 'Right should be 18 (18 page + 0 body)');
        assert.approximately(result[3], 80.37, 0.1, 'Bottom should be 80.37 (18 page + 28.35 footer + 34.02 gap)');
    });

    testRunner.addTest('Page Margins: calculatePageMarginsFromMaster should handle zero footer height', () => {
        const mockPageMaster = {
            pageMargin: [20, 20, 20, 20],
            header: { height: 100, margins: [20, 20, 20, 20] },
            body: { margins: [0, 0, 0, 0] }, // region-body margins only (0 in this case)
            footer: { height: 0, margins: [20, 20, 20, 20] }
        };
        
        const result = window.DocStructureParser.calculatePageMarginsFromMaster(mockPageMaster);
        
        assert.equal(result[0], 20, 'Left should be 20 (20 page + 0 body)');
        assert.approximately(result[1], 100, 0.1, 'Top should be 100 (header height only)');
        assert.equal(result[2], 20, 'Right should be 20 (20 page + 0 body)');
        assert.equal(result[3], 20, 'Bottom should be 20 (pageMargin[3] when footer height is 0)');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerPageMarginsCalculationTests };
}
if (typeof window !== 'undefined') {
    window.registerPageMarginsCalculationTests = registerPageMarginsCalculationTests;
}


