# Adding Tests - Quick Guide

## 📋 Overview

Tests go in `test/tests/*.test.js`. Data files go in `test/data/*.xslt`. Wire them up in 3 places.

---

## 🔧 Step 1: Create Test File

**Location:** `test/tests/my-feature.test.js`

```javascript
function registerMyFeatureTests(testRunner, converter, myDataXML, assert) {
    
    testRunner.addTest('Should do something', () => {
        const result = converter.convertToPDFMake(myDataXML);
        assert.ok(result, 'Should return result');
        assert.equal(result.content.length, 1, 'Should have content');
    });
    
    testRunner.addTest('Should do another thing', () => {
        // Test code here
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerMyFeatureTests };
}
if (typeof window !== 'undefined') {
    window.registerMyFeatureTests = registerMyFeatureTests;
}
```

---

## 📄 Step 2: Create Test Data (Optional)

**Location:** `test/data/my_feature.xslt`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <!-- Your test content here -->
      <fo:block>Test content</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>
```

**Skip this if using existing data like `emptyPageXML`.**

---

## 🔌 Step 3: Wire Up Tests

### A. CLI Test Runner (`test/test-cli.js`)

**Around line 920 - Add require:**
```javascript
const { registerMyFeatureTests } = require('./tests/my-feature.test.js');
```

**Around line 930 - Load data (if using custom data):**
```javascript
const myFeatureXML = fs.readFileSync(
    path.join(__dirname, 'data', 'my_feature.xslt'),
    'utf-8'
);
```

**Around line 950 - Register tests:**
```javascript
registerMyFeatureTests(testRunner, converter, myFeatureXML, assert);
```

---

### B. Browser Test Runner (`test/test.html`)

**Around line 440 - Add script tag:**
```html
<script src="tests/my-feature.test.js"></script>
```

**Around line 533 - Declare variable (if using custom data):**
```javascript
let myFeatureXML = null;
```

**Around line 577 - Load data (if using custom data):**
```javascript
myFeatureXML = await loadTestFile('data/my_feature.xslt');
```

**Around line 610 - Add to testSuites array:**
```javascript
const testSuites = [
    // ... existing suites ...
    { registerFn: registerMyFeatureTests, xml: myFeatureXML, name: 'my_feature.xslt' }
];
```

---

### C. Test Definitions (`test/test-definitions.js`)

**Around line 70 - Add registration:**
```javascript
if (typeof registerMyFeatureTests === 'function') {
    registerMyFeatureTests(testRunner, converter, myFeatureXML, assert);
}
```

---

## ✅ Step 4: Run Tests

**CLI:**
```bash
node test/test-cli.js
```

**Browser:**
Open `test/test.html` in browser

---

## 🧪 Test Types

### Unit Tests (Isolated Component)
```javascript
testRunner.addTest('Should parse table cell', () => {
    const xml = `<fo:table-cell><fo:block>Text</fo:block></fo:table-cell>`;
    const element = parseXML(xml);
    const result = TableConverter.convertTable(element);
    assert.equal(result.text, 'Text');
});
```

### Integration Tests (Full Document)
```javascript
testRunner.addTest('Should convert full document', () => {
    const xslfo = `<?xml version="1.0"?>...`; // Full XSL-FO
    const result = converter.convertToPDFMake(xslfo);
    assert.ok(result.content);
});
```

---

## 🎯 Assertion Methods

```javascript
assert.ok(value, 'message')                              // Truthy
assert.equal(actual, expected, 'message')                // ===
assert.deepEqual(obj1, obj2, 'message')                  // Deep comparison
assert.approximately(num, expected, tolerance, 'msg')    // Number ±tolerance
```

---

## 🗂️ File Organization

```
test/
├── data/                      # Test XML files
│   └── my_feature.xslt
├── tests/                     # Test suites
│   └── my-feature.test.js
├── test-cli.js               # Node.js runner (wire here)
├── test.html                 # Browser runner (wire here)
└── test-definitions.js       # Browser test loader (wire here)
```

---

## 💡 Pro Tips

1. **Reuse existing data** - Use `emptyPageXML` for simple tests instead of creating new files
2. **Test naming** - Use descriptive names: `Should handle colspan with borders`
3. **Group related tests** - One test file per feature area
4. **Browser debugging** - Click "View Data" button to see the XML for any test
5. **Data mapping** - Tests auto-map to their data file for "View Data" dropdown

---

## 🚀 Quick Example: Adding "Font Size" Tests

**1. Create** `test/tests/font-size.test.js`:
```javascript
function registerFontSizeTests(testRunner, converter, emptyPageXML, assert) {
    testRunner.addTest('Should parse font-size in points', () => {
        const result = converter.convertToPoints('12pt');
        assert.equal(result, 12);
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerFontSizeTests };
}
if (typeof window !== 'undefined') {
    window.registerFontSizeTests = registerFontSizeTests;
}
```

**2. Wire in `test-cli.js`:**
```javascript
const { registerFontSizeTests } = require('./tests/font-size.test.js');
// ...
registerFontSizeTests(testRunner, converter, emptyPageXML, assert);
```

**3. Wire in `test.html`:**
```html
<script src="tests/font-size.test.js"></script>
```
```javascript
// In testSuites array:
{ registerFn: registerFontSizeTests, xml: emptyPageXML, name: 'empty_page.xslt' }
```

**4. Wire in `test-definitions.js`:**
```javascript
if (typeof registerFontSizeTests === 'function') {
    registerFontSizeTests(testRunner, converter, emptyPageXML, assert);
}
```

**5. Run:**
```bash
node test/test-cli.js
```

Done! ✅

---

## 🔍 Debugging Failed Tests

**CLI shows:**
```
❌ Test 42: Should parse font size
   Error: Expected 12 but got 14
```

**Add console.log:**
```javascript
testRunner.addTest('Should parse font size', () => {
    const result = converter.convertToPoints('12pt');
    console.log('Result:', result); // Debug output
    assert.equal(result, 12);
});
```

**Browser:** Use browser DevTools console to see logs and inspect variables.

---

## 📝 Summary Checklist

- [ ] Create test file: `test/tests/my-feature.test.js`
- [ ] Create data file (optional): `test/data/my_feature.xslt`
- [ ] Wire in CLI: `test/test-cli.js` (require, load data, register)
- [ ] Wire in browser: `test/test.html` (script tag, load data, testSuites)
- [ ] Wire in definitions: `test/test-definitions.js` (register call)
- [ ] Run tests: `node test/test-cli.js`
- [ ] Verify in browser: Open `test/test.html`

---

**That's it!** Follow this pattern for every new test suite.

