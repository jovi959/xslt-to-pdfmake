/**
 * Metadata Tests
 * Tests for page master metadata storage and retrieval
 */

function registerMetadataTests(testRunner, converter, emptyPageXML, assert) {
    // Test: Page master metadata content
    testRunner.addTest('Should store complete and accurate page master metadata', () => {
        const result = converter.convertToPDFMake(emptyPageXML);
        
        // Verify metadata structure
        assert.ok(result._metadata, 'Must have metadata');
        assert.ok(Array.isArray(result._metadata.pageMasters), 'pageMasters should be an array');
        assert.equal(typeof result._metadata.primaryMaster, 'string', 'primaryMaster should be a string');
        
        // Verify exact primary master name
        assert.equal(result._metadata.primaryMaster, 'EmptyPage', 'Primary master should be "EmptyPage"');
        
        // Verify page master count
        assert.equal(result._metadata.pageMasters.length, 1, 'Should have exactly 1 page master');
        
        // Verify first page master details
        const master = result._metadata.pageMasters[0];
        assert.equal(master.masterName, 'EmptyPage', 'Master name should be "EmptyPage"');
        assert.equal(master.pageWidth, '8.5in', 'Original width should be preserved as "8.5in"');
        assert.equal(master.pageHeight, '11in', 'Original height should be preserved as "11in"');
        assert.equal(master.widthInPoints, 612, 'Converted width should be 612pt');
        assert.equal(master.heightInPoints, 792, 'Converted height should be 792pt');
        assert.equal(master.marginString, '0.5in 0.75in 1in 0.5in', 'Original margin string should be preserved');
        assert.deepEqual(master.margins, [36, 36, 54, 72], 'Converted margins should match');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerMetadataTests };
}
if (typeof window !== 'undefined') {
    window.registerMetadataTests = registerMetadataTests;
}

