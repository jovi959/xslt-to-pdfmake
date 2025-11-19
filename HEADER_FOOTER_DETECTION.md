# Header/Footer Detection Feature

## 🎯 Feature Overview

The `isHeaderOrFooter` function in `doc-structure-parser.js` determines if a flow name belongs to a header (`region-before`) or footer (`region-after`) region within a specific page master.

## 📝 API Usage

```javascript
const DocStructureParser = require('./src/doc-structure-parser.js');

// Check if a flow name is a header or footer
const result = DocStructureParser.isHeaderOrFooter(
    xslfoXml,           // The XSL-FO XML document
    'with-header-footer', // master-reference name
    'my-header'          // flow-name to check
);

console.log(result);
// { isHeader: true, isFooter: false }
```

## 🔧 Function Signature

```javascript
isHeaderOrFooter(xslfoXml, masterReference, flowName)
```

**Parameters:**
- `xslfoXml` (string): The XSL-FO XML document
- `masterReference` (string): The `master-name` of the `<fo:simple-page-master>` to check
- `flowName` (string): The flow name to look for

**Returns:** Object with structure:
```javascript
{
    isHeader: boolean,  // true if flowName matches region-before
    isFooter: boolean   // true if flowName matches region-after
}
```

## 📊 Test Results

### TDD Approach ✅

**Step 1: Red** - Created 11 failing tests  
**Step 2: Green** - Implemented function, all tests pass  
**Step 3: Refactor** - Code is clean and well-documented

### Test Coverage (11 tests)

✅ All passing in both environments!

1. Should identify header flow in master with header and footer
2. Should identify footer flow in master with header and footer
3. Should identify header in header-only master
4. Should identify footer in footer-only master
5. Should return false for body region
6. Should handle custom region names
7. Should return false for non-existent flow name
8. Should return false for non-existent master reference
9. Should handle master with no regions
10. Should handle empty flow name
11. Should handle null flow name

### Results
- **CLI (Node.js)**: ✅ 388/388 tests passing (100%)
- **Browser**: ✅ All 11 `isHeaderOrFooter` tests passing

## 📄 Test Data Structure

The test data file (`test/data/header_footer_detection.xslt`) contains multiple page masters:

```xml
<fo:layout-master-set>
  <!-- Master with both header and footer -->
  <fo:simple-page-master master-name="with-header-footer" ...>
    <fo:region-body region-name="xsl-region-body"/>
    <fo:region-before region-name="my-header"/>
    <fo:region-after region-name="my-footer"/>
  </fo:simple-page-master>
  
  <!-- Master with only header -->
  <fo:simple-page-master master-name="header-only" ...>
    <fo:region-body region-name="xsl-region-body"/>
    <fo:region-before region-name="page-header"/>
  </fo:simple-page-master>
  
  <!-- Master with only footer -->
  <fo:simple-page-master master-name="footer-only" ...>
    <fo:region-body region-name="xsl-region-body"/>
    <fo:region-after region-name="page-footer"/>
  </fo:simple-page-master>
  
  <!-- Master with no header/footer -->
  <fo:simple-page-master master-name="body-only" ...>
    <fo:region-body region-name="xsl-region-body"/>
  </fo:simple-page-master>
  
  <!-- Master with custom names -->
  <fo:simple-page-master master-name="custom-regions" ...>
    <fo:region-body region-name="main-content"/>
    <fo:region-before region-name="top-banner"/>
    <fo:region-after region-name="bottom-bar"/>
  </fo:simple-page-master>
</fo:layout-master-set>
```

## 🔍 Implementation Details

### Algorithm

1. Parse the XSL-FO XML document
2. Find the `<fo:layout-master-set>`
3. Search all `<fo:simple-page-master>` elements
4. Find the master matching `masterReference`
5. Check `<fo:region-before>` for `region-name` matching `flowName` → header
6. Check `<fo:region-after>` for `region-name` matching `flowName` → footer
7. Return `{ isHeader: boolean, isFooter: boolean }`

### Edge Cases Handled

✅ Null/empty inputs → returns `{ isHeader: false, isFooter: false }`  
✅ Non-existent master reference → returns `{ isHeader: false, isFooter: false }`  
✅ Non-existent flow name → returns `{ isHeader: false, isFooter: false }`  
✅ Body region → returns `{ isHeader: false, isFooter: false }`  
✅ Masters with no regions → returns `{ isHeader: false, isFooter: false }`  
✅ Custom region names → correctly identifies based on region type

### Environment Compatibility

**Browser:**
- Uses native `DOMParser`
- Full DOM manipulation support

**Node.js:**
- Uses `@xmldom/xmldom`
- Full compatibility with CLI tests

## 💡 Use Cases

### 1. Dynamic Header/Footer Rendering

```javascript
// Check if a flow should be rendered as header/footer
const check = DocStructureParser.isHeaderOrFooter(xml, 'main-master', 'my-header');
if (check.isHeader) {
    // Render as header with appropriate margins
}
```

### 2. Flow Validation

```javascript
// Validate that a flow name exists and identify its type
function validateFlow(xml, master, flowName) {
    const check = DocStructureParser.isHeaderOrFooter(xml, master, flowName);
    if (check.isHeader) {
        return 'header';
    } else if (check.isFooter) {
        return 'footer';
    } else {
        return 'body'; // or 'unknown'
    }
}
```

### 3. Template Processing

```javascript
// Process different regions with appropriate styling
const flows = ['header', 'footer', 'main'];
flows.forEach(flowName => {
    const type = DocStructureParser.isHeaderOrFooter(xml, masterRef, flowName);
    if (type.isHeader) {
        processHeader(flowName);
    } else if (type.isFooter) {
        processFooter(flowName);
    }
});
```

## 📦 Files Created/Modified

### New Files
1. ✅ `test/data/header_footer_detection.xslt` - Test data with multiple master types
2. ✅ `test/tests/header-footer-detection.test.js` - Test suite (11 tests)
3. ✅ `HEADER_FOOTER_DETECTION.md` - This documentation

### Modified Files
1. ✅ `src/doc-structure-parser.js` - Added `isHeaderOrFooter` function
2. ✅ `test/test-cli.js` - Registered tests, made `DocStructureParser` globally available
3. ✅ `test/test.html` - Registered tests in browser runner

## ✅ Completion Checklist

- [x] Created test data file with comprehensive examples
- [x] Created 11 comprehensive tests (TDD approach)
- [x] Implemented `isHeaderOrFooter` function
- [x] All tests passing in CLI (388/388)
- [x] All header/footer tests passing in browser
- [x] Function exported for both browser and Node.js
- [x] Documentation complete
- [x] Edge cases handled
- [x] Environment compatibility verified

## 🚀 Future Enhancements

Potential improvements:
- [ ] Add caching for repeated lookups
- [ ] Support for page-sequence-master resolution
- [ ] Batch checking multiple flow names
- [ ] Region type detection (start, end, left, right)

---

**Date Created**: November 18, 2025  
**Feature Status**: ✅ Complete and Production-Ready  
**Test Coverage**: 11/11 tests passing (100%)  
**TDD Approach**: Red → Green → Refactor ✅

