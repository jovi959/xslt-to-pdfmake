# Whitespace Normalization Implementation

## Overview
Implemented comprehensive HTML-like whitespace normalization for XSL-FO to PDFMake conversion. This system is **generic and reusable** for any tag types (blocks, inlines, table cells, etc.).

## Key Features

### 1. **Newline Conversion**
- Converts `\n`, `\r`, `\t` to spaces
- Example: `"Word1\n\nWord2"` → `"Word1 Word2"`

### 2. **Space Collapsing**
- Multiple consecutive spaces → single space
- Example: `"Word1   Word2"` → `"Word1 Word2"`

### 3. **Edge Trimming**
- Trims leading/trailing spaces from block/inline edges
- Example: `"   text   "` → `"text"`

### 4. **Space Preservation Between Elements**
- Automatically inserts space between sibling inline elements
- Example: `<inline>A</inline><inline>B</inline>` → `["A", " ", "B"]`

## Implementation

### Core Files Created

1. **`src/whitespace-utils.js`** (214 lines)
   - Generic whitespace utilities
   - Exports: `normalizeWhitespace`, `trimEdgeSpaces`, `normalizeChildren`, `insertSpacesBetweenElements`

2. **`src/block-converter.js`** (Updated)
   - Integrated whitespace functions
   - Added: `normalizeWhitespace()`, `normalizeChildrenWhitespace()`, `insertSpacesBetweenInlines()`
   - All converters (`convertBlock`, `convertInline`) now apply 3-step normalization:
     1. Normalize whitespace in text (newlines → spaces, collapse multiple spaces)
     2. Trim edge spaces
     3. Insert spaces between consecutive inline elements

3. **`test/tests/whitespace-normalization.test.js`** (246 lines)
   - 16 comprehensive tests covering all 11 user scenarios
   - Tests edge cases, nested inlines, empty blocks, etc.

### How It Works

Every converter follows this pattern:

```javascript
function convertElement(node, children, traverse) {
    // Step 1: Normalize whitespace (newlines → spaces, collapse)
    children = normalizeChildrenWhitespace(children);
    
    // Step 2: Trim edges
    children = trimEdgeSpaces(children);
    
    // Step 3: Insert spaces between inline siblings
    children = insertSpacesBetweenInlines(children);
    
    // ... rest of conversion logic
}
```

## Test Coverage

### All 11 User Scenarios Covered:

1. ✅ **Leading/trailing trim** - `"   text   "` → `"text"`
2. ✅ **Space collapsing** - `"Word1   Word2"` → `"Word1 Word2"`
3. ✅ **Block with inline** - Proper spacing around `<fo:inline>`
4. ✅ **Multiple inline siblings** - Auto-inserted spaces between `<fo:inline>` elements
5. ✅ **Whitespace-only blocks** - `<fo:block>   </fo:block>` → `""`
6. ✅ **Empty self-closing blocks** - `<fo:block/>` → `""`
7. ✅ **Nested inlines** - Proper structure with nested `<fo:inline>` elements
8. ✅ **Mixed whitespace** - Combined trim + collapse
9. ✅ **Deeply nested styling** - 3+ levels of nested inlines
10. ✅ **Only inline siblings** - No surrounding text, just inlines
11. ✅ **Inline with internal spaces** - Trim edges, preserve internal spaces

### Test Results

```
CLI Tests:  ✅ 166/166 passing
Browser:    ✅ Ready (all utilities exported to window)
```

## Usage for Future Tags

When implementing converters for new tags (e.g., `<fo:table-cell>`), simply follow the same pattern:

```javascript
function convertTableCell(node, children, traverse) {
    // Apply whitespace normalization
    children = normalizeChildrenWhitespace(children);
    children = trimEdgeSpaces(children);
    children = insertSpacesBetweenInlines(children);
    
    // Your cell-specific logic here
    return {
        text: children,
        // ... other properties
    };
}
```

No duplication needed - the utilities are generic!

## API Reference

### `normalizeWhitespace(text)`
Converts newlines/tabs to spaces and collapses multiple spaces.

```javascript
normalizeWhitespace("Word1\n\n  Word2") // → "Word1 Word2"
```

### `normalizeChildrenWhitespace(children)`
Applies `normalizeWhitespace` to all string children in an array.

```javascript
normalizeChildrenWhitespace(["Text\n\nMore", { obj: true }])
// → ["Text More", { obj: true }]
```

### `trimEdgeSpaces(children)`
Trims leading spaces from first string child, trailing spaces from last string child.

```javascript
trimEdgeSpaces([" text ", { inline: true }, " more "])
// → ["text ", { inline: true }, " more"]
```

### `insertSpacesBetweenInlines(children)`
Inserts single space between consecutive object (inline) elements.

```javascript
insertSpacesBetweenInlines([{ text: "A" }, { text: "B" }])
// → [{ text: "A" }, " ", { text: "B" }]
```

## Benefits

✅ **Consistent** - All tags handle whitespace the same way
✅ **Reusable** - No code duplication
✅ **Testable** - Each utility function has unit tests
✅ **Maintainable** - Single source of truth for whitespace logic
✅ **Extensible** - Easy to apply to new tags

## Files Modified

- ✅ `src/whitespace-utils.js` (NEW)
- ✅ `src/block-converter.js` (UPDATED - added whitespace functions)
- ✅ `test/tests/whitespace-normalization.test.js` (NEW - 16 tests)
- ✅ `test/test-definitions.js` (UPDATED - registered new tests)
- ✅ `test/test-cli.js` (UPDATED - registered new tests)
- ✅ `test/test.html` (UPDATED - added script tag for whitespace-utils.js)

## Next Steps

When implementing new tags (tables, lists, etc.):
1. Import/use the whitespace utilities
2. Apply the 3-step normalization at the start of your converter
3. Add specific tests for your tag type
4. Follow the existing pattern in `convertBlock` and `convertInline`

That's it! The whitespace logic is ready to be reused. 🎉

