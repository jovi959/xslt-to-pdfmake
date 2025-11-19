/**
 * Tests for getHeaderFooterInformation method in DocumentStructureParser class
 * Following TDD approach
 */

function registerHeaderFooterInfoTests(testRunner, converter, headerFooterInfoXML, assert) {
    
    // Create parser instance once for all tests
    const parser = new DocumentStructureParser(headerFooterInfoXML);
    
    // Test 1: first type - header that only appears on first page
    testRunner.addTest('getHeaderFooterInformation: Should detect first header', () => {
        const result = parser.getHeaderFooterInformation('first-only-sequence', 'first_before');
        
        assert.equal(result['page-sequence-master'], 'first-only-sequence', 'Should have correct sequence name');
        assert.equal(result['page-master-reference'], 'first', 'Should reference first master');
        assert.equal(result['region-name'], 'first_before', 'Should have correct region name');
        assert.equal(result.type, 'first', 'Should be first type');
    });
    
    // Test 2: first type - footer that only appears on first page
    testRunner.addTest('getHeaderFooterInformation: Should detect first footer', () => {
        const result = parser.getHeaderFooterInformation('first-only-sequence', 'first_after');
        
        assert.equal(result['page-sequence-master'], 'first-only-sequence', 'Should have correct sequence name');
        assert.equal(result['page-master-reference'], 'first', 'Should reference first master');
        assert.equal(result['region-name'], 'first_after', 'Should have correct region name');
        assert.equal(result.type, 'first', 'Should be first type');
    });
    
    // Test 3: rest type - header that appears on repeatable pages but not first
    testRunner.addTest('getHeaderFooterInformation: Should detect rest-only header', () => {
        const result = parser.getHeaderFooterInformation('rest-only-sequence', 'rest_before');
        
        assert.equal(result['page-sequence-master'], 'rest-only-sequence', 'Should have correct sequence name');
        assert.equal(result['page-master-reference'], 'rest', 'Should reference rest master');
        assert.equal(result['region-name'], 'rest_before', 'Should have correct region name');
        assert.equal(result.type, 'rest', 'Should be rest type');
    });
    
    // Test 4: rest type - footer that appears on repeatable pages but not first
    testRunner.addTest('getHeaderFooterInformation: Should detect rest-only footer', () => {
        const result = parser.getHeaderFooterInformation('rest-only-sequence', 'rest_after');
        
        assert.equal(result['page-sequence-master'], 'rest-only-sequence', 'Should have correct sequence name');
        assert.equal(result['page-master-reference'], 'rest', 'Should reference rest master');
        assert.equal(result['region-name'], 'rest_after', 'Should have correct region name');
        assert.equal(result.type, 'rest', 'Should be rest type');
    });
    
    // Test 5: all type - footer that appears on both first and repeatable pages
    testRunner.addTest('getHeaderFooterInformation: Should detect all-pages footer', () => {
        const result = parser.getHeaderFooterInformation('shared-sequence', 'shared_footer');
        
        assert.equal(result['page-sequence-master'], 'shared-sequence', 'Should have correct sequence name');
        assert.equal(result['page-master-reference'], 'simple', 'Should reference first master');
        assert.equal(result['region-name'], 'shared_footer', 'Should have correct region name');
        assert.equal(result.type, 'all', 'Should be all type');
    });
    
    // Test 6: custom type - footer appears on both first and rest with different names
    testRunner.addTest('getHeaderFooterInformation: Should detect custom type when multiple distinct footers', () => {
        const result = parser.getHeaderFooterInformation('custom-sequence', 'first_after');
        
        assert.equal(result['page-sequence-master'], 'custom-sequence', 'Should have correct sequence name');
        assert.equal(result['page-master-reference'], 'first', 'Should reference first master');
        assert.equal(result.type, 'first', 'First-only footer should be first type');
    });
    
    // Test 7: rest type when no first page master is specified
    testRunner.addTest('getHeaderFooterInformation: Should handle sequence with no first page', () => {
        const result = parser.getHeaderFooterInformation('simple-sequence', 'rest_before');
        
        assert.equal(result['page-sequence-master'], 'simple-sequence', 'Should have correct sequence name');
        assert.equal(result['page-master-reference'], 'rest', 'Should reference rest master');
        assert.equal(result.type, 'all', 'Should be all type (repeatable starts from page 1)');
    });
    
    // Test 8: Handle non-existent flow name
    testRunner.addTest('getHeaderFooterInformation: Should return null for non-existent flow', () => {
        const result = parser.getHeaderFooterInformation('first-only-sequence', 'non-existent-flow');
        
        assert.equal(result, null, 'Should return null for non-existent flow');
    });
    
    // Test 9: Handle non-existent sequence master
    testRunner.addTest('getHeaderFooterInformation: Should return null for non-existent sequence', () => {
        const result = parser.getHeaderFooterInformation('non-existent-sequence', 'first_before');
        
        assert.equal(result, null, 'Should return null for non-existent sequence');
    });
    
    // Test 10: Handle empty/null inputs
    testRunner.addTest('getHeaderFooterInformation: Should handle empty XML', () => {
        const emptyParser = new DocumentStructureParser('');
        const result = emptyParser.getHeaderFooterInformation('first-only-sequence', 'first_before');
        
        assert.equal(result, null, 'Should return null for empty XML');
    });
    
    testRunner.addTest('getHeaderFooterInformation: Should handle null sequence name', () => {
        const result = parser.getHeaderFooterInformation(null, 'first_before');
        
        assert.equal(result, null, 'Should return null for null sequence name');
    });
    
    testRunner.addTest('getHeaderFooterInformation: Should handle null flow name', () => {
        const result = parser.getHeaderFooterInformation('first-only-sequence', null);
        
        assert.equal(result, null, 'Should return null for null flow name');
    });
    
    // ===== isShouldRun Tests =====
    
    // Test: Type 'all' should return true for page 1
    testRunner.addTest('isShouldRun: Type "all" should return true for page 1', () => {
        const result = parser.isShouldRun('all', 1, 10);
        assert.equal(result, true, 'Should return true for all type on page 1');
    });
    
    // Test: Type 'all' should return true for page 2
    testRunner.addTest('isShouldRun: Type "all" should return true for page 2', () => {
        const result = parser.isShouldRun('all', 2, 10);
        assert.equal(result, true, 'Should return true for all type on page 2');
    });
    
    // Test: Type 'all' should return true for any page
    testRunner.addTest('isShouldRun: Type "all" should return true for any page', () => {
        assert.equal(parser.isShouldRun('all', 5, 10), true, 'Should return true for page 5');
        assert.equal(parser.isShouldRun('all', 10, 10), true, 'Should return true for last page');
    });
    
    // Test: Type 'first' should return true for page 1
    testRunner.addTest('isShouldRun: Type "first" should return true for page 1', () => {
        const result = parser.isShouldRun('first', 1, 10);
        assert.equal(result, true, 'Should return true for first type on page 1');
    });
    
    // Test: Type 'first' should return false for page 2
    testRunner.addTest('isShouldRun: Type "first" should return false for page 2', () => {
        const result = parser.isShouldRun('first', 2, 10);
        assert.equal(result, false, 'Should return false for first type on page 2');
    });
    
    // Test: Type 'first' should return false for page 3+
    testRunner.addTest('isShouldRun: Type "first" should return false for page 3+', () => {
        assert.equal(parser.isShouldRun('first', 3, 10), false, 'Should return false for page 3');
        assert.equal(parser.isShouldRun('first', 5, 10), false, 'Should return false for page 5');
        assert.equal(parser.isShouldRun('first', 10, 10), false, 'Should return false for page 10');
    });
    
    // Test: Type 'rest' should return false for page 1
    testRunner.addTest('isShouldRun: Type "rest" should return false for page 1', () => {
        const result = parser.isShouldRun('rest', 1, 10);
        assert.equal(result, false, 'Should return false for rest type on page 1');
    });
    
    // Test: Type 'rest' should return true for page 2
    testRunner.addTest('isShouldRun: Type "rest" should return true for page 2', () => {
        const result = parser.isShouldRun('rest', 2, 10);
        assert.equal(result, true, 'Should return true for rest type on page 2');
    });
    
    // Test: Type 'rest' should return true for page 3+
    testRunner.addTest('isShouldRun: Type "rest" should return true for page 3+', () => {
        assert.equal(parser.isShouldRun('rest', 3, 10), true, 'Should return true for page 3');
        assert.equal(parser.isShouldRun('rest', 5, 10), true, 'Should return true for page 5');
        assert.equal(parser.isShouldRun('rest', 10, 10), true, 'Should return true for page 10');
    });
    
    // Test: Type 'custom' should return false (not handled)
    testRunner.addTest('isShouldRun: Type "custom" should return false', () => {
        const result = parser.isShouldRun('custom', 1, 10);
        assert.equal(result, false, 'Should return false for custom type (not handled)');
    });
    
    // Test: Invalid type should return false
    testRunner.addTest('isShouldRun: Invalid type should return false', () => {
        assert.equal(parser.isShouldRun('invalid', 1, 10), false, 'Should return false for invalid type');
        assert.equal(parser.isShouldRun('', 1, 10), false, 'Should return false for empty type');
        assert.equal(parser.isShouldRun(null, 1, 10), false, 'Should return false for null type');
        assert.equal(parser.isShouldRun(undefined, 1, 10), false, 'Should return false for undefined type');
    });
    
    // Test: Page 0 should be handled gracefully
    testRunner.addTest('isShouldRun: Page 0 should be handled gracefully', () => {
        assert.equal(parser.isShouldRun('all', 0, 10), true, 'Type all should still work for page 0');
        assert.equal(parser.isShouldRun('first', 0, 10), false, 'Type first should be false for page 0');
        assert.equal(parser.isShouldRun('rest', 0, 10), false, 'Type rest should be false for page 0');
    });
    
    // Test: Negative page should be handled gracefully
    testRunner.addTest('isShouldRun: Negative page should be handled gracefully', () => {
        assert.equal(parser.isShouldRun('all', -1, 10), true, 'Type all should still work for negative page');
        assert.equal(parser.isShouldRun('first', -1, 10), false, 'Type first should be false for negative page');
        assert.equal(parser.isShouldRun('rest', -1, 10), false, 'Type rest should be false for negative page');
    });
    
    // Test: Very large page number should work with 'rest'
    testRunner.addTest('isShouldRun: Very large page number should work with "rest"', () => {
        const result = parser.isShouldRun('rest', 1000, 1000);
        assert.equal(result, true, 'Should return true for rest type on page 1000');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerHeaderFooterInfoTests };
}
if (typeof window !== 'undefined') {
    window.registerHeaderFooterInfoTests = registerHeaderFooterInfoTests;
}

