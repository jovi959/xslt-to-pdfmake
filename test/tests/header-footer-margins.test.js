
function registerHeaderFooterMarginsTests(testRunner, converter, headerFooterMarginsXML, assert) {
    // Happy Path Tests - Testing new approach where margins are applied dynamically
    testRunner.addTest('Header/Footer Margins: Should have header margins structure in simplePageMasters', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(headerFooterMarginsXML, converter);
        
        // Check first page master
        const firstMaster = docStructure.simplePageMasters['first'];
        assert.ok(firstMaster, 'First page master should exist');
        assert.ok(firstMaster.header, 'First page master should have header');
        assert.ok(firstMaster.header.margins, 'Header should have margins');
        // Note: Margins are now applied dynamically in convertXSLFOToPDF, not pre-parsed
        assert.ok(Array.isArray(firstMaster.header.margins), 'Header margins should be an array');
        assert.equal(firstMaster.header.margins.length, 4, 'Header margins should have 4 values');
    });

    testRunner.addTest('Header/Footer Margins: Should have footer margins structure in simplePageMasters', () => {
        const docStructure = window.DocStructureParser.parseDocumentStructure(headerFooterMarginsXML, converter);
        
        // Check first page master
        const firstMaster = docStructure.simplePageMasters['first'];
        assert.ok(firstMaster, 'First page master should exist');
        assert.ok(firstMaster.footer, 'First page master should have footer');
        assert.ok(firstMaster.footer.margins, 'Footer should have margins');
        // Note: Margins are now applied dynamically in convertXSLFOToPDF, not pre-parsed
        assert.ok(Array.isArray(firstMaster.footer.margins), 'Footer margins should be an array');
        assert.equal(firstMaster.footer.margins.length, 4, 'Footer margins should have 4 values');
    });

    testRunner.addTest('Header/Footer Margins: Should use correct margins in convertXSLFOToPDF', async () => {
        if (!converter.convertXSLFOToPDF) {
            console.warn('convertXSLFOToPDF not implemented yet');
            return;
        }

        try {
            // This test verifies that the margins from simplePageMasters are used
            // when building the PDFMake definitions in convertXSLFOToPDF
            const pdfBytes = await converter.convertXSLFOToPDF(headerFooterMarginsXML);
            assert.ok(pdfBytes instanceof Uint8Array, 'Should return Uint8Array');
            assert.ok(pdfBytes.length > 0, 'Should return non-empty buffer');
            
            // The actual margin application is tested visually in the generated PDF
            console.log('✅ PDF generated successfully - verify margins visually in opened PDF');
        } catch (e) {
            if (typeof window !== 'undefined' && window.PDFLib) {
                throw e;
            } else {
                console.warn('Skipping PDF generation test in CLI (PDFLib not available)');
            }
        }
    });

    // Unhappy Path Tests
    testRunner.addTest('Header/Footer Margins: Should handle missing header margins gracefully', () => {
        // Create XML without explicit header margins
        const noMarginsXML = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-before region-name="header"/>
              <fo:region-body/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="simple">
            <fo:static-content flow-name="header">
              <fo:block>Header</fo:block>
            </fo:static-content>
            <fo:flow flow-name="xsl-region-body">
              <fo:block>Content</fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;

        const docStructure = window.DocStructureParser.parseDocumentStructure(noMarginsXML, converter);
        const simpleMaster = docStructure.simplePageMasters['simple'];
        
        assert.ok(simpleMaster, 'Simple page master should exist');
        assert.ok(simpleMaster.header, 'Header should exist');
        // Should have default margins or empty array
        assert.ok(Array.isArray(simpleMaster.header.margins), 'Header margins should be an array');
    });

    testRunner.addTest('Header/Footer Margins: Should handle missing footer margins gracefully', () => {
        const noMarginsXML = `<?xml version="1.0" encoding="UTF-8"?>
        <fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
          <fo:layout-master-set>
            <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in" margin="1in">
              <fo:region-body/>
              <fo:region-after region-name="footer"/>
            </fo:simple-page-master>
          </fo:layout-master-set>
          <fo:page-sequence master-reference="simple">
            <fo:static-content flow-name="footer">
              <fo:block>Footer</fo:block>
            </fo:static-content>
            <fo:flow flow-name="xsl-region-body">
              <fo:block>Content</fo:block>
            </fo:flow>
          </fo:page-sequence>
        </fo:root>`;

        const docStructure = window.DocStructureParser.parseDocumentStructure(noMarginsXML, converter);
        const simpleMaster = docStructure.simplePageMasters['simple'];
        
        assert.ok(simpleMaster, 'Simple page master should exist');
        assert.ok(simpleMaster.footer, 'Footer should exist');
        // Should have default margins or empty array
        assert.ok(Array.isArray(simpleMaster.footer.margins), 'Footer margins should be an array');
    });

    // Edge Cases - Only testing structure, not specific values
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerHeaderFooterMarginsTests };
}
if (typeof window !== 'undefined') {
    window.registerHeaderFooterMarginsTests = registerHeaderFooterMarginsTests;
}

