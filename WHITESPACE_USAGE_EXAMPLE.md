# How to Use Whitespace Normalization for Any Tag

## ✅ **The Problem is Solved!**

All whitespace normalization logic is now **centralized in `src/whitespace-utils.js`** and can be applied to ANY tag with just **1 line of code**!

---

## 🚀 **Super Simple Usage**

### For Any New Tag (Tables, Lists, etc.)

Just call `normalizeChildren()` at the start of your converter:

```javascript
// Example: Converting a <fo:table-cell> element
function convertTableCell(node, children, traverse) {
    // ✨ ONE LINE - Applies all 3 whitespace normalization steps:
    // 1. Normalize whitespace (newlines → spaces, collapse multiple)
    // 2. Trim edge spaces
    // 3. Insert spaces between inline siblings
    children = WhitespaceUtils.normalizeChildren(children);
    
    // Your cell-specific logic
    return {
        text: children,
        // ... other properties
    };
}
```

**That's it!** No duplicated code, no manual steps. 🎉

---

## 📚 **Complete Example: Table Cell Converter**

```javascript
/**
 * Converts <fo:table-cell> to PDFMake cell definition
 */
function convertTableCell(node, children, traverse) {
    // Apply whitespace normalization (ONE LINE!)
    children = WhitespaceUtils.normalizeChildren(children);
    
    // Extract cell attributes
    const border = node.getAttribute('border');
    const padding = parsePadding(node.getAttribute('padding'));
    const backgroundColor = parseColor(node.getAttribute('background-color'));
    
    // Build cell definition
    const cell = {
        text: children
    };
    
    // Apply attributes
    if (border) cell.border = [true, true, true, true];
    if (padding) cell.margin = padding;
    if (backgroundColor) cell.fillColor = backgroundColor;
    
    return cell;
}
```

---

## 🎯 **What It Does Automatically**

When you call `WhitespaceUtils.normalizeChildren(children)`, it:

1. **Converts newlines to spaces**
   ```
   "Line1\nLine2" → "Line1 Line2"
   ```

2. **Collapses multiple spaces**
   ```
   "Word1   Word2" → "Word1 Word2"
   ```

3. **Trims edge whitespace**
   ```
   "   text   " → "text"
   ```

4. **Inserts spaces between inline elements**
   ```
   [<inline>A</inline>, <inline>B</inline>] → [{text: "A"}, " ", {text: "B"}]
   ```

---

## 🔧 **Setup in Your Converter File**

At the top of your converter file, import WhitespaceUtils:

```javascript
// Browser environment
let WhitespaceUtils;
if (typeof window !== 'undefined' && window.WhitespaceUtils) {
    WhitespaceUtils = window.WhitespaceUtils;
} else if (typeof require === 'function') {
    // Node.js environment
    WhitespaceUtils = require('./whitespace-utils.js');
}
```

Then use it anywhere:

```javascript
function convertYourTag(node, children, traverse) {
    children = WhitespaceUtils.normalizeChildren(children);
    // ... rest of your logic
}
```

---

## 🎨 **Advanced: Step-by-Step Control**

If you need more control, you can call individual functions:

```javascript
// Step 1: Normalize whitespace only
children = children.map(child => 
    typeof child === 'string' ? WhitespaceUtils.normalizeWhitespace(child) : child
);

// Step 2: Trim edges only
children = WhitespaceUtils.trimEdgeSpaces(children);

// Step 3: Insert spaces between elements only
children = WhitespaceUtils.insertSpacesBetweenElements(children);
```

But **99% of the time**, just use `normalizeChildren()` - it does all 3 steps perfectly!

---

## ✅ **Benefits**

✨ **No Code Duplication** - One source of truth  
✨ **Consistent Behavior** - All tags handle whitespace the same way  
✨ **Easy to Use** - Just one function call  
✨ **Thoroughly Tested** - 16 comprehensive tests  
✨ **Cross-Environment** - Works in both browser and Node.js  

---

## 📦 **API Reference**

### `normalizeChildren(children)` ⭐ **Use This One!**
Does all 3 steps in one call. Perfect for 99% of use cases.

**Input:** `Array<string | object>`  
**Output:** `Array<string | object>` (normalized)

```javascript
const input = ['  Text\n\nMore  ', { inline: true }, '  End  '];
const result = WhitespaceUtils.normalizeChildren(input);
// → ["Text More", { inline: true }, "End"]
```

---

### `normalizeWhitespace(text)`
Converts newlines/tabs to spaces and collapses multiple spaces.

**Input:** `string`  
**Output:** `string`

```javascript
WhitespaceUtils.normalizeWhitespace("Word1\n\n  Word2")
// → "Word1 Word2"
```

---

### `trimEdgeSpaces(children)`
Trims leading/trailing spaces from edge text nodes.

**Input:** `Array<string | object>`  
**Output:** `Array<string | object>`

```javascript
WhitespaceUtils.trimEdgeSpaces([" text ", { obj: true }, " more "])
// → ["text ", { obj: true }, " more"]
```

---

### `insertSpacesBetweenElements(children)`
Inserts single space between consecutive object elements.

**Input:** `Array<string | object>`  
**Output:** `Array<string | object>`

```javascript
WhitespaceUtils.insertSpacesBetweenElements([{ text: "A" }, { text: "B" }])
// → [{ text: "A" }, " ", { text: "B" }]
```

---

## 🚀 **You're All Set!**

That's it! Whitespace normalization is now as simple as:

```javascript
children = WhitespaceUtils.normalizeChildren(children);
```

Apply this one line to **any new tag converter** and you're done! 🎉

