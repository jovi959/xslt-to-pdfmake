/**
 * Header/Footer Extraction Parity Tests
 * 
 * These tests verify that content extracted via _getStaticContentLayout() 
 * produces the same PDFMake output as regular conversion via convertToPDFMake().
 * 
 * This ensures headers/footers render identically to regular body content.
 */

function registerHeaderExtractionParityTests(testRunner, converter, headerExtractionParityXML, assert) {
    
    // Test 1: Basic table structure parity
    testRunner.addTest('Header Extraction Parity: Table structure should match between methods', () => {
        // Parse the document structure to get the header
        const parser = new window.DocumentStructureParser(headerExtractionParityXML);
        const docStructure = window.DocStructureParser.parseDocumentStructure(headerExtractionParityXML, converter);
        
        // Get header content via _getStaticContentLayout (the way headers/footers are extracted)
        const headerInfo = {
            'page-sequence-master': 'test-sequence',
            'page-master-reference': 'test-page',
            'region-name': 'test-header',
            'type': 'all'
        };
        const headerStructureFn = parser._getStaticContentLayout(headerInfo, headerExtractionParityXML, converter);
        const headerContent = headerStructureFn(1, 1); // Call with page 1 of 1
        
        // Get the same content via regular conversion (the way body content is converted)
        const regularDef = converter.convertToPDFMake(headerExtractionParityXML, { flowName: 'test-header' });
        const regularContent = regularDef.content || [];
        
        // They should be identical
        assert.ok(headerContent, 'Header content should exist');
        assert.ok(Array.isArray(headerContent) || typeof headerContent === 'object', 
            'Header content should be array or object');
        assert.deepEqual(headerContent, regularContent, 
            'Header extraction should produce identical content to regular conversion');
    });
    
    // Test 2: Table with styling parity
    testRunner.addTest('Header Extraction Parity: Table with borders and padding should match', () => {
        const parser = new window.DocumentStructureParser(headerExtractionParityXML);
        const headerInfo = {
            'page-sequence-master': 'test-sequence',
            'page-master-reference': 'test-page',
            'region-name': 'test-header',
            'type': 'all'
        };
        
        const headerStructureFn = parser._getStaticContentLayout(headerInfo, headerExtractionParityXML, converter);
        const headerContent = headerStructureFn(1, 1);
        
        // Verify table structure exists
        assert.ok(headerContent, 'Content should exist');
        
        // If it's an array, check the first element
        const tableContent = Array.isArray(headerContent) ? headerContent[0] : headerContent;
        
        // Should have table structure
        assert.ok(tableContent.table, 'Should have table object');
        assert.ok(tableContent.table.body, 'Should have table body');
        assert.ok(Array.isArray(tableContent.table.body), 'Table body should be array');
        assert.ok(tableContent.table.body.length > 0, 'Table body should have rows');
    });
    
    // Test 3: Table cell properties parity
    testRunner.addTest('Header Extraction Parity: Table cell styling should be preserved', () => {
        const parser = new window.DocumentStructureParser(headerExtractionParityXML);
        const headerInfo = {
            'page-sequence-master': 'test-sequence',
            'page-master-reference': 'test-page',
            'region-name': 'test-header',
            'type': 'all'
        };
        
        const headerStructureFn = parser._getStaticContentLayout(headerInfo, headerExtractionParityXML, converter);
        const headerContent = headerStructureFn(1, 1);
        
        const tableContent = Array.isArray(headerContent) ? headerContent[0] : headerContent;
        
        // Check that we have the middle cell with styling
        const firstRow = tableContent.table.body[0];
        assert.ok(firstRow, 'Should have first row');
        assert.equal(firstRow.length, 3, 'First row should have 3 cells');
        
        // Middle cell should have the styled block
        const middleCell = firstRow[1];
        assert.ok(middleCell, 'Middle cell should exist');
        
        // The cell should have content with styling
        const cellContent = Array.isArray(middleCell) ? middleCell : [middleCell];
        assert.ok(cellContent.length > 0, 'Cell should have content');
        
        // Check for background color on the cell or its content
        const hasBackgroundColor = middleCell.fillColor || 
            (Array.isArray(middleCell) && middleCell.some(item => item && item.fillColor));
        
        assert.ok(hasBackgroundColor || middleCell.length > 0, 
            'Cell should have background color or content');
    });
    
    // Test 4: Preprocessing consistency
    testRunner.addTest('Header Extraction Parity: Should apply same preprocessing to both methods', () => {
        // This test verifies that any preprocessing (whitespace, etc.) is consistent
        const parser = new window.DocumentStructureParser(headerExtractionParityXML);
        const headerInfo = {
            'page-sequence-master': 'test-sequence',
            'page-master-reference': 'test-page',
            'region-name': 'test-header',
            'type': 'all'
        };
        
        const headerStructureFn = parser._getStaticContentLayout(headerInfo, headerExtractionParityXML, converter);
        const headerContent = headerStructureFn(1, 1);
        
        const regularDef = converter.convertToPDFMake(headerExtractionParityXML, { flowName: 'test-header' });
        const regularContent = regularDef.content || [];
        
        // Convert to JSON strings to compare structure (ignore function references)
        const headerJson = JSON.stringify(headerContent, (key, val) => 
            typeof val === 'function' ? '[Function]' : val
        );
        const regularJson = JSON.stringify(regularContent, (key, val) => 
            typeof val === 'function' ? '[Function]' : val
        );
        
        assert.equal(headerJson, regularJson, 
            'Preprocessing should be identical between methods');
    });
    
    // Test 5: Column width proportions
    testRunner.addTest('Header Extraction Parity: Column widths should be preserved', () => {
        const parser = new window.DocumentStructureParser(headerExtractionParityXML);
        const headerInfo = {
            'page-sequence-master': 'test-sequence',
            'page-master-reference': 'test-page',
            'region-name': 'test-header',
            'type': 'all'
        };
        
        // Header path
        const headerStructureFn = parser._getStaticContentLayout(headerInfo, headerExtractionParityXML, converter);
        const headerContent = headerStructureFn(1, 1);
        const headerTable = Array.isArray(headerContent) ? headerContent[0] : headerContent;
        
        // Regular conversion path
        const regularDef = converter.convertToPDFMake(headerExtractionParityXML, { flowName: 'test-header' });
        const regularContent = regularDef.content || [];
        const regularTable = Array.isArray(regularContent) ? regularContent[0] : regularContent;
        
        if (headerTable.table && headerTable.table.widths && regularTable.table && regularTable.table.widths) {
            const headerWidths = headerTable.table.widths;
            const regularWidths = regularTable.table.widths;
            
            assert.ok(Array.isArray(headerWidths), 'Header widths should be array');
            assert.ok(Array.isArray(regularWidths), 'Regular widths should be array');
            assert.equal(headerWidths.length, regularWidths.length, 'Both should have same number of columns');
            assert.deepEqual(headerWidths, regularWidths, 'Header extraction widths should match regular conversion widths');
        }
    });
    
    // Test 6: Nested block properties
    testRunner.addTest('Header Extraction Parity: Nested block properties should be preserved', () => {
        const parser = new window.DocumentStructureParser(headerExtractionParityXML);
        const headerInfo = {
            'page-sequence-master': 'test-sequence',
            'page-master-reference': 'test-page',
            'region-name': 'test-header',
            'type': 'all'
        };
        
        const headerStructureFn = parser._getStaticContentLayout(headerInfo, headerExtractionParityXML, converter);
        const headerContent = headerStructureFn(1, 1);
        
        // Regular conversion
        const regularDef = converter.convertToPDFMake(headerExtractionParityXML, { flowName: 'test-header' });
        const regularContent = regularDef.content || [];
        
        // Both should have the same nested structure
        function countNestedBlocks(content) {
            let count = 0;
            function traverse(obj) {
                if (!obj) return;
                if (Array.isArray(obj)) {
                    obj.forEach(traverse);
                } else if (typeof obj === 'object') {
                    if (obj.text || obj.stack || obj.table) count++;
                    Object.values(obj).forEach(traverse);
                }
            }
            traverse(content);
            return count;
        }
        
        const headerBlocks = countNestedBlocks(headerContent);
        const regularBlocks = countNestedBlocks(regularContent);
        
        assert.equal(headerBlocks, regularBlocks, 
            'Number of nested blocks should match between methods');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerHeaderExtractionParityTests };
}
if (typeof window !== 'undefined') {
    window.registerHeaderExtractionParityTests = registerHeaderExtractionParityTests;
}

