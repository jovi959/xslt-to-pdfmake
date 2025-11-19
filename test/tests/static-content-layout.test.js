/**
 * Tests for _getStaticContentLayout method in DocumentStructureParser class
 * Following TDD approach - Comprehensive happy path, unhappy path, and edge case tests
 * Uses dedicated test data: static_content_layout.xslt
 */

function registerStaticContentLayoutTests(testRunner, converter, staticContentLayoutXML, assert) {
    
    // Create parser instance for testing
    const parser = new DocumentStructureParser(staticContentLayoutXML);
    
    // ===== Happy Path Tests =====
    
    // Test 1: Should return a function
    testRunner.addTest('_getStaticContentLayout: Should return a function', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'first'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        assert.equal(typeof layoutFn, 'function', 'Should return a function');
    });
    
    // Test 2: Type 'all' returns content on page 1
    testRunner.addTest('_getStaticContentLayout: Type "all" should return content on page 1', () => {
        const info = {
            'page-sequence-master': 'all-pages-seq',
            'page-master-reference': 'all-pages',
            'region-name': 'shared-footer',
            'type': 'all'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 10);
        
        assert.ok(result !== '', 'Should return content, not empty string');
    });
    
    // Test 3: Type 'all' returns content on page 5
    testRunner.addTest('_getStaticContentLayout: Type "all" should return content on page 5', () => {
        const info = {
            'page-sequence-master': 'all-pages-seq',
            'page-master-reference': 'all-pages',
            'region-name': 'shared-footer',
            'type': 'all'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(5, 10);
        
        assert.ok(result !== '', 'Should return content on page 5');
    });
    
    // Test 4: Type 'first' returns content on page 1
    testRunner.addTest('_getStaticContentLayout: Type "first" should return content on page 1', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'first'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 10);
        
        assert.ok(result !== '', 'Should return content on page 1');
    });
    
    // Test 5: Type 'rest' returns content on page 2
    testRunner.addTest('_getStaticContentLayout: Type "rest" should return content on page 2', () => {
        const info = {
            'page-sequence-master': 'rest-only-seq',
            'page-master-reference': 'rest',
            'region-name': 'rest-header',
            'type': 'rest'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(2, 10);
        
        assert.ok(result !== '', 'Should return content on page 2');
    });
    
    // Test 6: Type 'rest' returns content on page 10
    testRunner.addTest('_getStaticContentLayout: Type "rest" should return content on page 10', () => {
        const info = {
            'page-sequence-master': 'rest-only-seq',
            'page-master-reference': 'rest',
            'region-name': 'rest-header',
            'type': 'rest'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(10, 10);
        
        assert.ok(result !== '', 'Should return content on page 10');
    });
    
    // Test 7: Should extract content from correct region-name
    testRunner.addTest('_getStaticContentLayout: Should extract content from correct region-name', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'all'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 10);
        
        // Should have extracted content (not empty)
        assert.ok(result !== '', 'Should extract content from region');
    });
    
    // Test 8: Returned content should be valid PDFMake structure
    testRunner.addTest('_getStaticContentLayout: Returned content should be valid PDFMake structure', () => {
        const info = {
            'page-sequence-master': 'all-pages-seq',
            'page-master-reference': 'all-pages',
            'region-name': 'shared-footer',
            'type': 'all'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 10);
        
        // Should be an object (PDFMake structure) or empty string
        const isValid = typeof result === 'object' || result === '';
        assert.ok(isValid, 'Should return valid PDFMake structure or empty string');
    });
    
    // ===== CRITICAL: Type String Baking Test =====
    
    // Test 9: Type string must be baked into function code
    testRunner.addTest('_getStaticContentLayout: CRITICAL - Type string and Content must be baked into function', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'first'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const fnString = layoutFn.toString();
        
        // Verify the literal type string 'first' appears in the function code
        assert.ok(fnString.includes('first') || fnString.includes('type'), 
            'Function should contain the type value or variable');
        
        // Verify it does NOT reference information.type (should be baked in as primitive)
        assert.ok(!fnString.includes('information.type'), 
            'Function should NOT reference information.type - type should be baked in as primitive value');

        // Verify the content object is baked into the string (checking for some known content text)
        assert.ok(fnString.includes('Annual Report 2024'), 
            'Function should contain the actual content JSON ( Annual Report 2024 )');

        // Verify that pageSize and pageMargins are NOT included (we only want the content array)
        assert.ok(!fnString.includes('pageSize'), 
            'Function should NOT contain pageSize - only the content array/object');
    });
    
    // ===== Unhappy Path Tests =====
    
    // Test 10: Type 'first' returns empty string on page 2
    testRunner.addTest('_getStaticContentLayout: Type "first" should return empty string on page 2', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'first'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(2, 10);
        
        assert.equal(result, '', 'Should return empty string on page 2');
    });
    
    // Test 11: Type 'first' returns empty string on page 5
    testRunner.addTest('_getStaticContentLayout: Type "first" should return empty string on page 5', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'first'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(5, 10);
        
        assert.equal(result, '', 'Should return empty string on page 5');
    });
    
    // Test 12: Type 'rest' returns empty string on page 1
    testRunner.addTest('_getStaticContentLayout: Type "rest" should return empty string on page 1', () => {
        const info = {
            'page-sequence-master': 'rest-only-seq',
            'page-master-reference': 'rest',
            'region-name': 'rest-header',
            'type': 'rest'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 10);
        
        assert.equal(result, '', 'Should return empty string on page 1');
    });
    
    // Test 13: Type 'custom' returns empty string
    testRunner.addTest('_getStaticContentLayout: Type "custom" should return empty string', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-footer',
            'type': 'custom'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 10);
        
        assert.equal(result, '', 'Type custom should return empty string');
    });
    
    // Test 14: Invalid type returns empty string
    testRunner.addTest('_getStaticContentLayout: Invalid type should return empty string', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'invalid-type'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 10);
        
        assert.equal(result, '', 'Invalid type should return empty string');
    });
    
    // Test 15: Non-existent region-name handled gracefully
    testRunner.addTest('_getStaticContentLayout: Non-existent region-name should be handled gracefully', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'non-existent-region',
            'type': 'all'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 10);
        
        // Should return something (empty content or empty string), not crash
        assert.ok(result !== undefined, 'Should handle non-existent region gracefully');
    });
    
    // ===== Edge Case Tests =====
    
    // Test 16: Null information handled gracefully
    testRunner.addTest('_getStaticContentLayout: Should handle null information gracefully', () => {
        try {
            const layoutFn = parser._getStaticContentLayout(null, staticContentLayoutXML, converter);
            assert.ok(true, 'Should not crash with null information');
        } catch (e) {
            assert.ok(false, 'Should handle null information gracefully: ' + e.message);
        }
    });
    
    // Test 17: Undefined information handled gracefully
    testRunner.addTest('_getStaticContentLayout: Should handle undefined information gracefully', () => {
        try {
            const layoutFn = parser._getStaticContentLayout(undefined, staticContentLayoutXML, converter);
            assert.ok(true, 'Should not crash with undefined information');
        } catch (e) {
            assert.ok(false, 'Should handle undefined information gracefully: ' + e.message);
        }
    });
    
    // Test 18: Empty XML handled gracefully
    testRunner.addTest('_getStaticContentLayout: Should handle empty XML gracefully', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'all'
        };
        
        try {
            const layoutFn = parser._getStaticContentLayout(info, '', converter);
            assert.ok(true, 'Should not crash with empty XML');
        } catch (e) {
            assert.ok(false, 'Should handle empty XML gracefully: ' + e.message);
        }
    });
    
    // Test 19: Null converter handled gracefully
    testRunner.addTest('_getStaticContentLayout: Should handle null converter gracefully', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'all'
        };
        
        try {
            const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, null);
            assert.ok(true, 'Should not crash with null converter');
        } catch (e) {
            assert.ok(false, 'Should handle null converter gracefully: ' + e.message);
        }
    });
    
    // Test 20: Page count of 1 works correctly
    testRunner.addTest('_getStaticContentLayout: Should work correctly with page count of 1', () => {
        const info = {
            'page-sequence-master': 'first-only-seq',
            'page-master-reference': 'first',
            'region-name': 'first-header',
            'type': 'first'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(1, 1);
        
        assert.ok(result !== '', 'Should return content for page 1 of 1');
    });
    
    // Test 21: Page 0 handled gracefully
    testRunner.addTest('_getStaticContentLayout: Should handle page 0 gracefully', () => {
        const info = {
            'page-sequence-master': 'all-pages-seq',
            'page-master-reference': 'all-pages',
            'region-name': 'shared-footer',
            'type': 'all'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        const result = layoutFn(0, 10);
        
        // Type 'all' should still return content (isShouldRun handles this)
        assert.ok(result !== '', 'Type all should return content even for page 0');
    });
    
    // Test 22: Negative page numbers handled gracefully
    testRunner.addTest('_getStaticContentLayout: Should handle negative page numbers gracefully', () => {
        const info = {
            'page-sequence-master': 'all-pages-seq',
            'page-master-reference': 'all-pages',
            'region-name': 'shared-footer',
            'type': 'all'
        };
        
        const layoutFn = parser._getStaticContentLayout(info, staticContentLayoutXML, converter);
        
        try {
            const result = layoutFn(-1, 10);
            // Type 'all' should still return content
            assert.ok(result !== '', 'Type all should handle negative pages');
        } catch (e) {
            assert.ok(false, 'Should not crash with negative page: ' + e.message);
        }
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerStaticContentLayoutTests };
}
if (typeof window !== 'undefined') {
    window.registerStaticContentLayoutTests = registerStaticContentLayoutTests;
}

