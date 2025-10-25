# Test Files

This directory contains organized unit tests for the XSL-FO to PDFMake converter.

## Structure

Tests are split into logical files by feature area:

```
test/
├── test-cli.js               - Command-line test runner
├── test-runner.js            - Browser test framework
├── test-definitions.js       - Test loader
├── test.html                 - Visual test interface
├── data/                     - Test XSL-FO files
│   ├── empty_page.xslt
│   ├── simple.xslt
│   └── table.xslt
└── tests/                    - Test files
    ├── page-structure.test.js    - Document parsing & page size detection
    ├── unit-conversion.test.js   - Converting inches, cm, mm to points
    ├── margin-parsing.test.js    - Margin format parsing
    └── README.md                 - This file
```

## Creating a New Test File

### 1. Create the test file

Create a new file in `test/tests/` directory with a `.test.js` extension:

```javascript
// test/tests/your-feature.test.js

/**
 * Your Feature Tests
 * Description of what this test file covers
 */

function registerYourFeatureTests(testRunner, converter, emptyPageXML, assert) {
    // Add your tests here
    testRunner.addTest('Should do something specific', () => {
        const result = converter.someMethod(input);
        assert.equal(result, expected, 'Description of what should happen');
    });
    
    testRunner.addTest('Should handle edge cases', () => {
        const result = converter.someMethod(edgeCase);
        assert.ok(result, 'Should not crash');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerYourFeatureTests };
}
if (typeof window !== 'undefined') {
    window.registerYourFeatureTests = registerYourFeatureTests;
}
```

### 2. Register in test-cli.js

Add your test file to the CLI runner:

```javascript
// In test/test-cli.js, add to the imports:
const { registerYourFeatureTests } = require('./tests/your-feature.test.js');

// Then register it:
registerYourFeatureTests(testRunner, converter, emptyPageXML, assert);
```

### 3. Register in test.html

Add your test file to the browser runner:

```html
<!-- In test/test.html, add to the script tags: -->
<script src="tests/your-feature.test.js"></script>
```

### 4. Run the tests

```bash
# Command line
npm test

# Browser
# Open http://localhost:8000/test/test.html
```

## Available Assertions

The `assert` object provides these methods:

- **`assert.ok(value, message)`** - Value is truthy
- **`assert.equal(actual, expected, message)`** - Strict equality (===)
- **`assert.deepEqual(actual, expected, message)`** - Deep object/array equality
- **`assert.approximately(actual, expected, tolerance, message)`** - Numeric approximation
- **`assert.instanceOf(value, type, message)`** - Type checking
- **`assert.contains(array, value, message)`** - Array contains value
- **`assert.throws(fn, expectedError, message)`** - Function throws error

## Test Naming Conventions

- Use descriptive names that explain **what** is being tested
- Start with "Should" to describe expected behavior
- Be specific about inputs and expected outputs

Good examples:
- ✅ `'Should convert 1 inch to 72 points'`
- ✅ `'Should detect LETTER page size from 8.5in x 11in dimensions'`
- ✅ `'Should handle edge cases in unit conversion'`

Bad examples:
- ❌ `'Test conversion'` (too vague)
- ❌ `'Unit test 1'` (not descriptive)
- ❌ `'Works'` (doesn't explain what works)

## Organizing Tests

Group related tests in the same file:

- **Page Structure** - Document parsing, page sizes, layouts
- **Unit Conversion** - All measurement conversions (in, cm, mm, pt)
- **Margin Parsing** - Margin formats and conversions
- **Content Parsing** - When you add content parsing features
- **Edge Cases** - Error handling, invalid inputs

## Example: Adding Content Tests

When you start implementing content parsing, create a new file:

```javascript
// test/tests/content-parsing.test.js

function registerContentParsingTests(testRunner, converter, testXML, assert) {
    testRunner.addTest('Should parse fo:block elements', () => {
        const xml = '<fo:block>Test text</fo:block>';
        const result = converter.parseBlock(xml);
        assert.equal(result.text, 'Test text');
    });
    
    testRunner.addTest('Should parse fo:table structures', () => {
        // Test table parsing
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerContentParsingTests };
}
if (typeof window !== 'undefined') {
    window.registerContentParsingTests = registerContentParsingTests;
}
```

Then register it in both `test/test-cli.js` and `test/test.html`.

## Benefits of Split Test Files

1. **Easy to Navigate** - Find tests by feature area
2. **Maintainable** - Small files are easier to update
3. **Collaborative** - Multiple people can work on different test files
4. **Organized** - Related tests stay together
5. **Scalable** - Add new files without touching existing ones

## Running Individual Test Categories

While the framework runs all tests together, you can comment out test file loads in `test-cli.js` to run specific categories during development:

```javascript
// Comment out tests you don't want to run
registerPageStructureTests(testRunner, converter, emptyPageXML, assert);
// registerUnitConversionTests(testRunner, converter, emptyPageXML, assert);
// registerMarginParsingTests(testRunner, converter, emptyPageXML, assert);
```

## Tips

- Keep test files focused on one feature area
- Use descriptive test names
- Test both success and failure cases
- Include edge cases
- Document complex test setups
- Run tests before committing code

