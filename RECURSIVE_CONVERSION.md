# Recursive Conversion System - Architecture & Usage

## Overview

This document describes the recursive conversion system for XSL-FO to PDFMake transformation. The system uses a **pluggable architecture** that separates traversal logic from conversion logic, following Test-Driven Development (TDD) principles.

## Architecture

### Core Modules

#### 1. Recursive Traversal (`src/recursive-traversal.js`)
- **Purpose**: Generic XML tree traversal
- **Responsibility**: Walking through DOM nodes recursively
- **Key Feature**: Agnostic to conversion logic - accepts any converter function as a callback

```javascript
const result = traverse(domNode, converterFunction);
```

#### 2. Block Converter (`src/block-converter.js`)
- **Purpose**: Converts XSL-FO `<fo:block>` elements to PDFMake format
- **Responsibility**: Attribute parsing and PDFMake object generation
- **Key Feature**: Plugs into traversal function; can be used independently

```javascript
const pdfmakeObj = convertBlock(node, processedChildren, traverse);
```

## Key Design Principles

### 1. Separation of Concerns
- **Traversal logic** is completely separate from **conversion logic**
- You can plug in different converters (block, table, list, etc.) without changing traversal code

### 2. Pluggable Converters
Each converter receives:
- `node`: The current DOM element
- `children`: Already-processed child content (results of recursive calls)
- `traverse`: Reference to traversal function (for manual recursion if needed)

### 3. Composability
- Converters can be chained or composed
- Each converter focuses on a single element type
- Easy to add new converters for other XSL-FO elements

## Example Usage

### Basic Block Conversion

```javascript
// Simple block
const xml = `<fo:block>Simple text</fo:block>`;
const doc = parser.parseFromString(xml, 'text/xml');
const result = traverse(doc.documentElement, convertBlock);
// Result: "Simple text"
```

### Nested Blocks with Attributes

```javascript
// Nested structure
const xml = `
<fo:block font-weight="bold">
    Parent Text
    <fo:block font-size="10pt">
        Child Text
        <fo:block>Grandchild Text</fo:block>
    </fo:block>
</fo:block>
`;

const doc = parser.parseFromString(xml, 'text/xml');
const result = traverse(doc.documentElement, convertBlock);

/* Result:
{
  text: [
    "Parent Text",
    {
      text: [
        "Child Text",
        { text: "Grandchild Text" }
      ],
      fontSize: 10
    }
  ],
  bold: true
}
*/
```

## Supported Attributes

The Block Converter currently supports:

| XSL-FO Attribute | PDFMake Property | Values |
|------------------|------------------|--------|
| `font-weight` | `bold` | `bold`, `bolder`, `600+` → `true` |
| `font-style` | `italics` | `italic`, `oblique` → `true` |
| `text-decoration` | `decoration` | `underline`, `line-through` |
| `font-size` | `fontSize` | `pt`, `px`, `em`, `rem` → points |
| `color` | `color` | Any CSS color value |
| `text-align` | `alignment` | `left`, `center`, `right`, `justify` |

## Testing Strategy

### Unit Test Structure

Tests are organized in two categories:

#### 1. Isolated Converter Tests (`test/tests/block-converter.test.js`)
Tests the converter **without traversal** by manually providing processed children:

```javascript
// Mock children (simulating what traversal would provide)
const children = ['Text', { text: 'Nested', bold: true }];
const result = convertBlock(blockElement, children, null);
```

**Benefits:**
- Fast execution
- Easy to test edge cases
- Clear failure messages
- No dependency on traversal logic

#### 2. Integrated Traversal Tests (`test/tests/recursive-traversal.test.js`)
Tests the **full recursive process** with block converter plugged in:

```javascript
// Real XML parsing and recursive traversal
const element = parseXML(xml);
const result = traverse(element, convertBlock);
```

**Benefits:**
- Tests real-world scenarios
- Validates nested structure handling
- Ensures integration between components
- Catches issues with actual XML parsing

### Running Tests

```bash
# CLI (Node.js)
node test/test-cli.js

# Browser
open test/test.html
```

## Adding New Converters

To add a converter for another XSL-FO element (e.g., table, list):

### Step 1: Create Converter Module

```javascript
// src/table-converter.js

function convertTable(node, children, traverse) {
    // Extract table-specific attributes
    const rows = parseTableRows(node, children);
    
    return {
        table: {
            body: rows
        }
    };
}

// Export for both environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { convertTable };
}
if (typeof window !== 'undefined') {
    window.TableConverter = { convertTable };
}
```

### Step 2: Create Tests

```javascript
// test/tests/table-converter.test.js

function registerTableConverterTests(testRunner, converter, testXML, assert) {
    // Isolated tests
    testRunner.addTest('Should convert simple table', () => {
        const tableElement = createTableElement();
        const children = [/* mocked rows */];
        const result = convertTable(tableElement, children, null);
        assert.ok(result.table);
    });
    
    // Integrated tests
    testRunner.addTest('Should handle nested tables', () => {
        const xml = `<fo:table>...</fo:table>`;
        const element = parseXML(xml);
        const result = traverse(element, convertTable);
        assert.ok(result.table);
    });
}
```

### Step 3: Wire Up Tests

Follow the steps in `.cursorrules` to register tests in:
- `test/test-definitions.js`
- `test/test-cli.js`
- `test/test.html`

## Benefits of This Approach

1. **Modularity**: Each converter is independent and focused
2. **Testability**: Can test converters in isolation or integration
3. **Maintainability**: Easy to understand and modify individual pieces
4. **Extensibility**: Adding new converters doesn't affect existing ones
5. **Reusability**: Traversal logic can be reused for any XML structure

## Future Enhancements

Potential additions:
- Table converter (`<fo:table>`)
- List converter (`<fo:list-block>`)
- Inline converter (`<fo:inline>`)
- Page break converter (`<fo:block break-before="page">`)
- Image converter (`<fo:external-graphic>`)

Each would follow the same pattern: separate module, pluggable into traversal, comprehensive tests.

## Test Results

Current test coverage:
- **Total Tests**: 68
- **Passing**: 68 ✅
- **Categories**:
  - Block converter (isolated): 24 tests
  - Recursive traversal (integrated): 19 tests
  - Other tests (page structure, margins, etc.): 25 tests

All tests pass in both Node.js (CLI) and browser environments.

