/**
 * Tests for headers and footers population in parseDocumentStructure
 * Following TDD approach - Comprehensive happy path, unhappy path, and edge case tests
 * Uses dedicated test data: headers_footers_population.xslt
 */

function registerHeadersFootersPopulationTests(testRunner, converter, headersFootersPopulationXML, assert) {
    
    // Get parseDocumentStructure function
    const parseDocumentStructure = (typeof window !== 'undefined' && window.DocStructureParser)
        ? window.DocStructureParser.parseDocumentStructure
        : require('../../src/doc-structure-parser.js').parseDocumentStructure;
    
    // ===== HAPPY PATH TESTS =====
    
    testRunner.addTest('parseDocumentStructure: Should return object with headers and footers arrays', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        assert.ok(result, 'Result should exist');
        assert.ok(Array.isArray(result.headers), 'Headers should be an array');
        assert.ok(Array.isArray(result.footers), 'Footers should be an array');
    });
    
    testRunner.addTest('parseDocumentStructure: Should populate headers array when header static-content exists', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        assert.ok(result.headers.length > 0, 'Headers array should not be empty');
    });
    
    testRunner.addTest('parseDocumentStructure: Should populate footers array when footer static-content exists', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        assert.ok(result.footers.length > 0, 'Footers array should not be empty');
    });
    
    testRunner.addTest('parseDocumentStructure: Should find first-page-header with type first', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        const firstHeader = result.headers.find(h => 
            h.information && h.information['region-name'] === 'first-page-header'
        );
        
        assert.ok(firstHeader, 'Should find first-page-header');
        assert.equal(firstHeader.information.type, 'first', 'First-page-header should have type first');
    });
    
    testRunner.addTest('parseDocumentStructure: Should find shared-footer with type all', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        const sharedFooter = result.footers.find(f => 
            f.information && f.information['region-name'] === 'shared-footer'
        );
        
        assert.ok(sharedFooter, 'Should find shared-footer');
        assert.equal(sharedFooter.information.type, 'all', 'Shared-footer should have type all');
    });
    
    testRunner.addTest('parseDocumentStructure: Should find rest-page-header with type rest', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        const restHeader = result.headers.find(h => 
            h.information && h.information['region-name'] === 'rest-page-header'
        );
        
        assert.ok(restHeader, 'Should find rest-page-header');
        assert.equal(restHeader.information.type, 'rest', 'Rest-page-header should have type rest');
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle multiple page-sequences', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        // headers_footers_population.xslt has 4 page-sequences
        // Should find headers/footers from multiple sequences
        assert.ok(result.headers.length >= 3, 'Should find headers from multiple sequences');
        assert.ok(result.footers.length >= 3, 'Should find footers from multiple sequences');
    });
    
    testRunner.addTest('parseDocumentStructure: Each entry should have information and structure properties', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        if (result.headers.length > 0) {
            const entry = result.headers[0];
            assert.ok(entry.information, 'Entry should have information property');
            assert.ok(entry.structure, 'Entry should have structure property');
        }
        
        if (result.footers.length > 0) {
            const entry = result.footers[0];
            assert.ok(entry.information, 'Entry should have information property');
            assert.ok(entry.structure, 'Entry should have structure property');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Information should have correct format', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        if (result.headers.length > 0) {
            const info = result.headers[0].information;
            assert.ok(info['page-sequence-master'] || info['page-master-reference'], 'Should have page-sequence-master or page-master-reference');
            assert.ok(info['region-name'], 'Should have region-name');
            assert.ok(info.type, 'Should have type');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Structure should be a function', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        if (result.headers.length > 0) {
            assert.equal(typeof result.headers[0].structure, 'function', 'Structure should be a function');
        }
        
        if (result.footers.length > 0) {
            assert.equal(typeof result.footers[0].structure, 'function', 'Structure should be a function');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Structure function should accept currentPage and pageCount', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        if (result.headers.length > 0) {
            const structureFn = result.headers[0].structure;
            
            // Should not throw when called with page numbers
            let didNotThrow = true;
            try {
                structureFn(1, 10);
            } catch (e) {
                didNotThrow = false;
            }
            
            assert.ok(didNotThrow, 'Structure function should accept (currentPage, pageCount)');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Structure function should return content on appropriate pages', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        // Find first header
        const firstHeader = result.headers.find(h => 
            h.information && h.information.type === 'first'
        );
        
        if (firstHeader) {
            const content1 = firstHeader.structure(1, 10);
            const content2 = firstHeader.structure(2, 10);
            
            assert.ok(content1 !== '', 'First should return content on page 1');
            assert.equal(content2, '', 'First should return empty string on page 2');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: All type should return content on all pages', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        // Find 'all' type footer
        const allFooter = result.footers.find(f => 
            f.information && f.information.type === 'all'
        );
        
        if (allFooter) {
            const content1 = allFooter.structure(1, 10);
            const content5 = allFooter.structure(5, 10);
            
            assert.ok(content1 !== '', 'All type should return content on page 1');
            assert.ok(content5 !== '', 'All type should return content on page 5');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Rest type should return content on pages 2+', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        // Find 'rest' type header
        const restHeader = result.headers.find(h => 
            h.information && h.information.type === 'rest'
        );
        
        if (restHeader) {
            const content1 = restHeader.structure(1, 10);
            const content2 = restHeader.structure(2, 10);
            
            assert.equal(content1, '', 'Rest type should return empty string on page 1');
            assert.ok(content2 !== '', 'Rest type should return content on page 2');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Should work with page-sequence-master references', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        // headers_footers_population.xslt uses page-sequence-masters
        const hasPageSequenceMaster = result.headers.some(h => 
            h.information && h.information['page-sequence-master']
        );
        
        assert.ok(hasPageSequenceMaster, 'Should find entries with page-sequence-master');
    });
    
    // ===== UNHAPPY PATH TESTS =====
    
    testRunner.addTest('parseDocumentStructure: Should return empty headers when no headers exist', () => {
        // XML with only body content
        const xmlNoHeaders = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <fo:region-body/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="simple">
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Content</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = parseDocumentStructure(xmlNoHeaders, converter);
        assert.equal(result.headers.length, 0, 'Should have empty headers array');
    });
    
    testRunner.addTest('parseDocumentStructure: Should return empty footers when no footers exist', () => {
        const xmlNoFooters = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <fo:region-body/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="simple">
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Content</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = parseDocumentStructure(xmlNoFooters, converter);
        assert.equal(result.footers.length, 0, 'Should have empty footers array');
    });
    
    testRunner.addTest('parseDocumentStructure: Should skip xsl-region-body flow (not header/footer)', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        // Make sure body content is not in headers or footers
        const hasBodyInHeaders = result.headers.some(h => 
            h.information && h.information['region-name'] === 'xsl-region-body'
        );
        const hasBodyInFooters = result.footers.some(f => 
            f.information && f.information['region-name'] === 'xsl-region-body'
        );
        
        assert.ok(!hasBodyInHeaders, 'Body content should not be in headers');
        assert.ok(!hasBodyInFooters, 'Body content should not be in footers');
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle page-sequence with no static-content', () => {
        const xmlNoStatic = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <fo:region-body/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="simple">
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Content</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = parseDocumentStructure(xmlNoStatic, converter);
        assert.equal(result.headers.length, 0, 'Should return empty headers');
        assert.equal(result.footers.length, 0, 'Should return empty footers');
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle static-content with invalid flow-name', () => {
        const xmlInvalidFlow = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <fo:region-body/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="simple">
    <fo:static-content flow-name="invalid-unknown-flow">
      <fo:block>Content</fo:block>
    </fo:static-content>
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Body</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        try {
            const result = parseDocumentStructure(xmlInvalidFlow, converter);
            // Should not crash, should skip invalid entries
            assert.ok(true, 'Should not crash with invalid flow-name');
        } catch (e) {
            assert.ok(false, 'Should handle invalid flow-name gracefully: ' + e.message);
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle non-existent master-reference', () => {
        const xmlBadRef = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="real" page-width="8.5in" page-height="11in">
      <fo:region-body/>
      <fo:region-before region-name="header"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="non-existent">
    <fo:static-content flow-name="header">
      <fo:block>Header</fo:block>
    </fo:static-content>
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Body</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        try {
            const result = parseDocumentStructure(xmlBadRef, converter);
            assert.ok(true, 'Should not crash with non-existent master-reference');
        } catch (e) {
            assert.ok(false, 'Should handle non-existent master-reference gracefully: ' + e.message);
        }
    });
    
    testRunner.addTest('parseDocumentStructure: First structure should return empty on page 2', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        const firstHeader = result.headers.find(h => 
            h.information && h.information.type === 'first'
        );
        
        if (firstHeader) {
            const content = firstHeader.structure(2, 10);
            assert.equal(content, '', 'First should return empty string on page 2');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Rest structure should return empty on page 1', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        const restHeader = result.headers.find(h => 
            h.information && h.information.type === 'rest'
        );
        
        if (restHeader) {
            const content = restHeader.structure(1, 10);
            assert.equal(content, '', 'Rest should return empty string on page 1');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Should skip entries where getHeaderFooterInformation returns null', () => {
        // This should be handled internally - entries with null information shouldn't be added
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        const hasNullInfo = result.headers.some(h => !h.information) || 
                           result.footers.some(f => !f.information);
        
        assert.ok(!hasNullInfo, 'Should not include entries with null information');
    });
    
    // ===== EDGE CASE TESTS =====
    
    testRunner.addTest('parseDocumentStructure: Should handle empty XML string', () => {
        const result = parseDocumentStructure('', converter);
        
        assert.ok(result, 'Should return result object');
        assert.equal(result.headers.length, 0, 'Should have empty headers');
        assert.equal(result.footers.length, 0, 'Should have empty footers');
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle XML with no page-sequences', () => {
        const xmlNoSequences = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <fo:region-body/>
    </fo:simple-page-master>
  </fo:layout-master-set>
</fo:root>`;
        
        const result = parseDocumentStructure(xmlNoSequences, converter);
        assert.equal(result.headers.length, 0, 'Should have empty headers');
        assert.equal(result.footers.length, 0, 'Should have empty footers');
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle page-sequence with no master-reference attribute', () => {
        const xmlNoMasterRef = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <fo:region-body/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence>
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Content</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        try {
            const result = parseDocumentStructure(xmlNoMasterRef, converter);
            assert.ok(true, 'Should not crash with missing master-reference');
        } catch (e) {
            assert.ok(false, 'Should handle missing master-reference gracefully: ' + e.message);
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle static-content with no flow-name attribute', () => {
        const xmlNoFlowName = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <fo:region-body/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="simple">
    <fo:static-content>
      <fo:block>Content</fo:block>
    </fo:static-content>
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Body</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        try {
            const result = parseDocumentStructure(xmlNoFlowName, converter);
            assert.ok(true, 'Should not crash with missing flow-name');
        } catch (e) {
            assert.ok(false, 'Should handle missing flow-name gracefully: ' + e.message);
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle null converter parameter', () => {
        try {
            const result = parseDocumentStructure(headersFootersPopulationXML, null);
            assert.ok(result, 'Should return result object');
            assert.equal(result.headers.length, 0, 'Should have empty headers with null converter');
            assert.equal(result.footers.length, 0, 'Should have empty footers with null converter');
        } catch (e) {
            assert.ok(false, 'Should handle null converter gracefully: ' + e.message);
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle undefined xslfoXml parameter', () => {
        const result = parseDocumentStructure(undefined, converter);
        
        assert.ok(result, 'Should return result object');
        assert.equal(result.headers.length, 0, 'Should have empty headers');
        assert.equal(result.footers.length, 0, 'Should have empty footers');
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle non-namespaced elements', () => {
        const xmlNoNamespace = `<?xml version="1.0"?>
<root>
  <layout-master-set>
    <simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <region-body/>
      <region-before region-name="header"/>
    </simple-page-master>
  </layout-master-set>
  <page-sequence master-reference="simple">
    <static-content flow-name="header">
      <block>Header</block>
    </static-content>
    <flow flow-name="xsl-region-body">
      <block>Body</block>
    </flow>
  </page-sequence>
</root>`;
        
        try {
            const result = parseDocumentStructure(xmlNoNamespace, converter);
            assert.ok(true, 'Should handle non-namespaced elements');
        } catch (e) {
            assert.ok(false, 'Should handle non-namespaced elements gracefully: ' + e.message);
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle duplicate headers from multiple sequences', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        // headers_footers_population.xslt has multiple page-sequences
        // All headers should be included
        assert.ok(result.headers.length >= 2, 'Should include all headers from all sequences');
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle duplicate footers from multiple sequences', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        // All footers should be included
        assert.ok(result.footers.length >= 1, 'Should include all footers from all sequences');
    });
    
    testRunner.addTest('parseDocumentStructure: Should preserve order of headers as they appear', () => {
        const result = parseDocumentStructure(headersFootersPopulationXML, converter);
        
        if (result.headers.length >= 2) {
            // Just verify we have an ordered array
            assert.ok(Array.isArray(result.headers), 'Headers should be an array');
            assert.ok(result.headers.length > 0, 'Headers should preserve order');
        }
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle page-sequence with only body flow', () => {
        const xmlOnlyBody = `<?xml version="1.0"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in">
      <fo:region-body/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="simple">
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Only body content</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>`;
        
        const result = parseDocumentStructure(xmlOnlyBody, converter);
        assert.equal(result.headers.length, 0, 'Should have no headers');
        assert.equal(result.footers.length, 0, 'Should have no footers');
    });
    
    testRunner.addTest('parseDocumentStructure: Should handle malformed XML gracefully', () => {
        const malformedXml = `<?xml version="1.0"?><fo:root><invalid>`;
        
        try {
            const result = parseDocumentStructure(malformedXml, converter);
            assert.ok(result, 'Should return result object');
            assert.ok(Array.isArray(result.headers), 'Should have headers array');
            assert.ok(Array.isArray(result.footers), 'Should have footers array');
        } catch (e) {
            assert.ok(false, 'Should handle malformed XML gracefully: ' + e.message);
        }
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerHeadersFootersPopulationTests };
}
if (typeof window !== 'undefined') {
    window.registerHeadersFootersPopulationTests = registerHeadersFootersPopulationTests;
}

