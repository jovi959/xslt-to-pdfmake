/**
 * Document Structure Parser Tests
 * Tests for parsing layout-master-set and generating document structure variables
 */

function registerDocStructureParserTests(testRunner, converter, layoutMasterXML, assert) {
    // ========================================
    // HAPPY PATH TESTS
    // ========================================

    testRunner.addTest('Should parse complete layout-master-set with all regions', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        assert.ok(result, 'Result should exist');
        assert.ok(result.simplePageMasters, 'simplePageMasters should exist');
        assert.ok(result.sequences, 'sequences should exist');
    });

    testRunner.addTest('Should parse simple-page-master "first" with correct structure', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        assert.ok(firstMaster, 'First master should exist');
        assert.ok(firstMaster.pageInfo, 'pageInfo should exist');
        assert.ok(firstMaster.pageMargin, 'pageMargin should exist');
        assert.ok(firstMaster.header, 'header should exist');
        assert.ok(firstMaster.body, 'body should exist');
        assert.ok(firstMaster.footer, 'footer should exist');
    });

    testRunner.addTest('Should parse simple-page-master "rest" with correct structure', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const restMaster = result.simplePageMasters['rest'];
        assert.ok(restMaster, 'Rest master should exist');
        assert.ok(restMaster.pageInfo, 'pageInfo should exist');
        assert.ok(restMaster.pageMargin, 'pageMargin should exist');
        assert.ok(restMaster.header, 'header should exist');
        assert.ok(restMaster.body, 'body should exist');
        assert.ok(restMaster.footer, 'footer should exist');
    });

    testRunner.addTest('Should correctly identify page size as LETTER', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        assert.equal(firstMaster.pageInfo, 'LETTER', 'Page size should be LETTER');
    });

    testRunner.addTest('Should parse page margins correctly [left, top, right, bottom]', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        const expected = [18, 18, 18, 18]; // 0.25in = 18 points
        assert.ok(Array.isArray(firstMaster.pageMargin), 'pageMargin should be an array');
        assert.equal(firstMaster.pageMargin.length, 4, 'pageMargin should have 4 elements');
        assert.approximately(firstMaster.pageMargin[0], expected[0], 0.1, 'Left margin should be ~18pt');
        assert.approximately(firstMaster.pageMargin[1], expected[1], 0.1, 'Top margin should be ~18pt');
        assert.approximately(firstMaster.pageMargin[2], expected[2], 0.1, 'Right margin should be ~18pt');
        assert.approximately(firstMaster.pageMargin[3], expected[3], 0.1, 'Bottom margin should be ~18pt');
    });

    testRunner.addTest('Should parse header with correct properties', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        const header = firstMaster.header;
        
        assert.equal(header.name, 'first_before', 'Header name should be first_before');
        assert.approximately(header.height, 72, 0.1, 'Header height should be ~72pt (1in)');
        assert.ok(Array.isArray(header.margins), 'Header margins should be an array');
        assert.equal(header.margins.length, 4, 'Header margins should have 4 elements');
    });

    testRunner.addTest('Should calculate header margins: bottom from region-body top', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        const header = firstMaster.header;
        
        // Header margins: [left (page), top (page), right (page), bottom (body top)]
        // Page margins are 0.25in = 18pt, body top is 1in = 72pt
        assert.approximately(header.margins[0], 18, 0.1, 'Header left should be 18pt (from page)');
        assert.approximately(header.margins[1], 18, 0.1, 'Header top should be 18pt (from page)');
        assert.approximately(header.margins[2], 18, 0.1, 'Header right should be 18pt (from page)');
        assert.approximately(header.margins[3], 72, 0.1, 'Header bottom should be 72pt (from body top margin)');
    });

    testRunner.addTest('Should parse body with correct properties', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        const body = firstMaster.body;
        
        assert.equal(body.name, 'xsl-region-body', 'Body name should be xsl-region-body');
        assert.ok(Array.isArray(body.margins), 'Body margins should be an array');
        assert.equal(body.margins.length, 4, 'Body margins should have 4 elements');
    });

    testRunner.addTest('Should store region-body margins only (not including page margins)', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        const body = firstMaster.body;
        
        // region-body margin="1in 0in 1.2cm 0in" -> [left=0, top=72, right=0, bottom=34]
        // body.margins should only contain region-body margins (page margins are added in calculatePageMarginsFromMaster)
        assert.equal(body.margins[0], 0, 'Body left should be 0 (region-body left only)');
        assert.equal(body.margins[1], 0, 'Body top should be 0 (always 0 for body)');
        assert.equal(body.margins[2], 0, 'Body right should be 0 (region-body right only)');
        assert.equal(body.margins[3], 0, 'Body bottom should be 0 (always 0 for body)');
    });

    testRunner.addTest('Should parse footer with correct properties', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        const footer = firstMaster.footer;
        
        assert.equal(footer.name, 'footer', 'Footer name should be footer');
        assert.approximately(footer.height, 28.35, 0.1, 'Footer height should be ~28.35pt (1cm)');
        assert.ok(Array.isArray(footer.margins), 'Footer margins should be an array');
        assert.equal(footer.margins.length, 4, 'Footer margins should have 4 elements');
    });

    testRunner.addTest('Should calculate footer margins: top from region-body bottom', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const firstMaster = result.simplePageMasters['first'];
        const footer = firstMaster.footer;
        
        // Footer margins: [left (page), top (body bottom), right (page), bottom (page)]
        // Page margins are 0.25in = 18pt, body bottom is 1.2cm = ~34.02pt
        assert.approximately(footer.margins[0], 18, 0.1, 'Footer left should be 18pt (from page)');
        assert.approximately(footer.margins[1], 34.02, 0.1, 'Footer top should be ~34.02pt (from body bottom)');
        assert.approximately(footer.margins[2], 18, 0.1, 'Footer right should be 18pt (from page)');
        assert.approximately(footer.margins[3], 18, 0.1, 'Footer bottom should be 18pt (from page)');
    });

    testRunner.addTest('Should parse page-sequence-master with first and repeatable', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const sequence = result.sequences['master-sequence'];
        assert.ok(sequence, 'Sequence master-sequence should exist');
        assert.ok(sequence.first, 'Sequence should have first reference');
        assert.ok(sequence.repeatable, 'Sequence should have repeatable reference');
    });

    testRunner.addTest('Should link sequence to correct simple-page-masters', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(layoutMasterXML, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(layoutMasterXML, converter);

        const sequence = result.sequences['master-sequence'];
        const firstMaster = result.simplePageMasters['first'];
        const restMaster = result.simplePageMasters['rest'];
        
        assert.deepEqual(sequence.first, firstMaster, 'Sequence first should reference first master');
        assert.deepEqual(sequence.repeatable, restMaster, 'Sequence repeatable should reference rest master');
    });

    // ========================================
    // UNHAPPY PATH TESTS
    // ========================================

    testRunner.addTest('Should handle missing layout-master-set gracefully', () => {
        const xmlWithoutMasters = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:page-sequence master-reference="test"><fo:flow flow-name="xsl-region-body"><fo:block>Test</fo:block></fo:flow></fo:page-sequence></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlWithoutMasters, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlWithoutMasters, converter);

        assert.ok(result, 'Result should exist');
        assert.ok(result.simplePageMasters, 'simplePageMasters should exist');
        assert.ok(result.sequences, 'sequences should exist');
        assert.equal(Object.keys(result.simplePageMasters).length, 0, 'simplePageMasters should be empty');
        assert.equal(Object.keys(result.sequences).length, 0, 'sequences should be empty');
    });

    testRunner.addTest('Should handle missing region-before (no header)', () => {
        const xmlNoHeader = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="test" margin="0.5in"><fo:region-body region-name="xsl-region-body"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlNoHeader, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlNoHeader, converter);

        const testMaster = result.simplePageMasters['test'];
        assert.ok(testMaster, 'Test master should exist');
        assert.equal(testMaster.header, null, 'Header should be null');
        assert.ok(testMaster.body, 'Body should exist');
    });

    testRunner.addTest('Should handle missing region-after (no footer)', () => {
        const xmlNoFooter = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="test" margin="0.5in"><fo:region-body region-name="xsl-region-body"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlNoFooter, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlNoFooter, converter);

        const testMaster = result.simplePageMasters['test'];
        assert.ok(testMaster, 'Test master should exist');
        assert.equal(testMaster.footer, null, 'Footer should be null');
        assert.ok(testMaster.body, 'Body should exist');
    });

    testRunner.addTest('Should handle missing region-body', () => {
        const xmlNoBody = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="test" margin="0.5in"><fo:region-before region-name="header" extent="1in"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlNoBody, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlNoBody, converter);

        const testMaster = result.simplePageMasters['test'];
        assert.ok(testMaster, 'Test master should exist');
        assert.equal(testMaster.body, null, 'Body should be null');
    });

    testRunner.addTest('Should use defaults for missing margin attributes', () => {
        const xmlNoMargins = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="test"><fo:region-body region-name="xsl-region-body"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlNoMargins, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlNoMargins, converter);

        const testMaster = result.simplePageMasters['test'];
        assert.ok(testMaster, 'Test master should exist');
        assert.deepEqual(testMaster.pageMargin, [0, 0, 0, 0], 'Page margins should default to zeros');
    });

    testRunner.addTest('Should use defaults for missing extent attribute', () => {
        const xmlNoExtent = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="test" margin="0.5in"><fo:region-body region-name="xsl-region-body"/><fo:region-before region-name="header"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlNoExtent, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlNoExtent, converter);

        const testMaster = result.simplePageMasters['test'];
        assert.ok(testMaster.header, 'Header should exist');
        assert.equal(testMaster.header.height, 0, 'Header height should default to 0');
    });

    testRunner.addTest('Should use default region-name if missing', () => {
        const xmlNoRegionName = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="test" margin="0.5in"><fo:region-body/><fo:region-before extent="1in"/><fo:region-after extent="1cm"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlNoRegionName, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlNoRegionName, converter);

        const testMaster = result.simplePageMasters['test'];
        assert.equal(testMaster.body.name, 'xsl-region-body', 'Body should use default name');
        assert.equal(testMaster.header.name, 'xsl-region-before', 'Header should use default name');
        assert.equal(testMaster.footer.name, 'xsl-region-after', 'Footer should use default name');
    });

    // ========================================
    // EDGE CASES
    // ========================================

    testRunner.addTest('Should handle single simple-page-master without sequences', () => {
        const xmlSingleMaster = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="only" margin="0.5in"><fo:region-body region-name="xsl-region-body"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlSingleMaster, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlSingleMaster, converter);

        assert.equal(Object.keys(result.simplePageMasters).length, 1, 'Should have 1 simple page master');
        assert.ok(result.simplePageMasters['only'], 'Should have "only" master');
        assert.equal(Object.keys(result.sequences).length, 0, 'Should have no sequences');
    });

    testRunner.addTest('Should handle sequence without single-page-master-reference', () => {
        const xmlNoSingleRef = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="only" margin="0.5in"><fo:region-body region-name="xsl-region-body"/></fo:simple-page-master><fo:page-sequence-master master-name="seq"><fo:repeatable-page-master-reference master-reference="only"/></fo:page-sequence-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlNoSingleRef, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlNoSingleRef, converter);

        const sequence = result.sequences['seq'];
        assert.ok(sequence, 'Sequence should exist');
        assert.equal(sequence.first, null, 'First should be null');
        assert.ok(sequence.repeatable, 'Repeatable should exist');
    });

    testRunner.addTest('Should handle sequence without repeatable-page-master-reference', () => {
        const xmlNoRepeatableRef = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="only" margin="0.5in"><fo:region-body region-name="xsl-region-body"/></fo:simple-page-master><fo:page-sequence-master master-name="seq"><fo:single-page-master-reference master-reference="only"/></fo:page-sequence-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlNoRepeatableRef, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlNoRepeatableRef, converter);

        const sequence = result.sequences['seq'];
        assert.ok(sequence, 'Sequence should exist');
        assert.ok(sequence.first, 'First should exist');
        assert.equal(sequence.repeatable, null, 'Repeatable should be null');
    });

    testRunner.addTest('Should handle mixed units in margins (in, cm, pt)', () => {
        const xmlMixedUnits = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="mixed" margin="1in 2cm 36pt 0.5in"><fo:region-body region-name="xsl-region-body" margin="0.5in 1cm 72pt 2cm"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlMixedUnits, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlMixedUnits, converter);

        const mixedMaster = result.simplePageMasters['mixed'];
        assert.ok(mixedMaster, 'Mixed master should exist');
        // Should parse all units correctly
        assert.ok(mixedMaster.pageMargin[0] > 0, 'Left margin should be parsed');
        assert.ok(mixedMaster.pageMargin[1] > 0, 'Top margin should be parsed');
        assert.ok(mixedMaster.pageMargin[2] > 0, 'Right margin should be parsed');
        assert.ok(mixedMaster.pageMargin[3] > 0, 'Bottom margin should be parsed');
    });

    testRunner.addTest('Should handle zero margins', () => {
        const xmlZeroMargins = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="zero" margin="0in"><fo:region-body region-name="xsl-region-body" margin="0in"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlZeroMargins, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlZeroMargins, converter);

        const zeroMaster = result.simplePageMasters['zero'];
        assert.ok(zeroMaster, 'Zero master should exist');
        assert.deepEqual(zeroMaster.pageMargin, [0, 0, 0, 0], 'Page margins should be all zeros');
    });

    testRunner.addTest('Should handle very large margins', () => {
        const xmlLargeMargins = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height="11in" page-width="8.5in" master-name="large" margin="5in"><fo:region-body region-name="xsl-region-body" margin="3in"/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlLargeMargins, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlLargeMargins, converter);

        const largeMaster = result.simplePageMasters['large'];
        assert.ok(largeMaster, 'Large master should exist');
        assert.approximately(largeMaster.pageMargin[0], 360, 0.1, 'Left margin should be ~360pt (5in)');
    });

    testRunner.addTest('Should handle empty or null input gracefully', () => {
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure('', converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure('', converter);

        assert.ok(result, 'Result should exist for empty input');
        assert.ok(result.simplePageMasters, 'simplePageMasters should exist');
        assert.ok(result.sequences, 'sequences should exist');
    });

    testRunner.addTest('Should handle whitespace in attribute values', () => {
        const xmlWhitespace = '<?xml version="1.0"?><fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"><fo:layout-master-set><fo:simple-page-master page-height=" 11in " page-width=" 8.5in " master-name="  whitespace  " margin=" 0.5in "><fo:region-body region-name=" xsl-region-body "/></fo:simple-page-master></fo:layout-master-set></fo:root>';
        
        const result = (typeof window !== 'undefined' && window.DocStructureParser) 
            ? window.DocStructureParser.parseDocumentStructure(xmlWhitespace, converter)
            : require('../../src/doc-structure-parser.js').parseDocumentStructure(xmlWhitespace, converter);

        // Should still parse correctly with trimmed values
        const whitespaceMaster = result.simplePageMasters['  whitespace  '];
        assert.ok(whitespaceMaster, 'Whitespace master should exist (attribute not auto-trimmed)');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerDocStructureParserTests };
}
if (typeof window !== 'undefined') {
    window.registerDocStructureParserTests = registerDocStructureParserTests;
}


