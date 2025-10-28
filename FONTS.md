# Custom Fonts Guide

## 📖 Overview

This project supports custom fonts in addition to the standard PDFMake fonts (Roboto). Custom fonts are converted to base64 and embedded directly in the application.

## 🎨 Available Fonts

### Standard Fonts (PDFMake)
- **Roboto** (default)
  - normal, bold, italics, bolditalics

### Custom Fonts
- **Wingdings**
  - Complete symbol font
  - Usage: `font-family="Wingdings"`

## 🚀 Using Custom Fonts

### In XSL-FO XML

Simply specify the font name in the `font-family` attribute (case-insensitive):

```xml
<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
          font-family="Wingdings" 
          font-size="18pt">
  ✓✗★✉☎
</fo:block>
```

### In PDFMake Output

The converter will automatically transform it to lowercase for PDFMake compatibility:

```javascript
{
  text: '✓✗★✉☎',
  font: 'wingdings',  // Lowercase for PDFMake
  fontSize: 18
}
```

**Note:** Font names are automatically converted to lowercase for PDFMake compatibility. You can use any case in your XSL-FO (e.g., `Wingdings`, `WINGDINGS`, `wingdings`), and it will work correctly.

## ➕ Adding New Fonts

### Step 1: Add Your Font File

Place your TTF font file in the `assets/` directory:

```
assets/
  └── your-font.ttf
```

### Step 2: Update Font Configuration

Edit `scripts/generate-font-config.js` and add your font to the `FONTS` array:

```javascript
const FONTS = [
    {
        name: 'Wingdings',  // Display name (for documentation)
        fontName: 'wingdings',  // PDFMake font name (lowercase, optional)
        normal: path.join(__dirname, '../assets/wingding.ttf')
    },
    {
        name: 'YourFont',
        fontName: 'yourfont',  // PDFMake font name (optional, defaults to lowercase name)
        normal: path.join(__dirname, '../assets/your-font.ttf'),
        bold: path.join(__dirname, '../assets/your-font-bold.ttf'),      // optional
        italics: path.join(__dirname, '../assets/your-font-italic.ttf'), // optional
        bolditalics: path.join(__dirname, '../assets/your-font-bolditalic.ttf') // optional
    }
];
```

**Notes:**
- `name` is the display name (for documentation and XSL-FO input)
- `fontName` is the PDFMake font name (optional, defaults to lowercase `name`)
- `normal` is required - the base font file
- `bold`, `italics`, and `bolditalics` are optional font variants
- If a variant is missing, the `normal` font will be used as a fallback
- Font names are automatically converted to lowercase for PDFMake compatibility

### Step 3: Generate Font Configuration

Run the generator script:

```bash
node scripts/generate-font-config.js
```

This will create/update `lib/custom-fonts.js` with your new font.

### Step 4: Use Your Font

Now you can use your font in XSL-FO:

```xml
<fo:block font-family="YourFont" font-size="12pt">
  Text in your custom font
</fo:block>
```

## 🔧 Technical Details

### Font Registration

Fonts are automatically registered when the page loads:

1. `lib/custom-fonts.js` is loaded (contains base64 font data)
2. Fonts are added to PDFMake's virtual file system (VFS)
3. Font definitions are registered with PDFMake
4. Fonts become available for use via `font-family` attribute

### File Structure

```
xslt_to_pdf/
├── assets/               # Source font files (.ttf)
│   └── wingding.ttf
├── lib/
│   ├── pdfmake.min.js
│   ├── vfs_fonts.js      # Standard fonts
│   └── custom-fonts.js   # Generated custom fonts (DO NOT EDIT)
└── scripts/
    └── generate-font-config.js  # Font generator script
```

### Generator Output

The generator creates a JavaScript file with:
- `customVfsFonts`: Object mapping font filenames to base64 data
- `customFonts`: Object mapping font names to font files
- Automatic exports for both browser and Node.js environments

## 📝 Examples

### Example 1: Simple Wingdings Block

```xml
<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
          font-family="Wingdings" 
          font-size="14pt">
  ✓✗★
</fo:block>
```

### Example 2: Mixed Fonts

```xml
<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-size="12pt">
  Normal text in Roboto
  <fo:inline font-family="Wingdings" font-size="16pt">✓</fo:inline>
  More normal text
</fo:block>
```

### Example 3: Table with Custom Font

```xml
<fo:table xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:table-column column-width="100%"/>
  <fo:table-body>
    <fo:table-row>
      <fo:table-cell font-family="Wingdings" text-align="center">
        <fo:block>★★★★★</fo:block>
      </fo:table-cell>
    </fo:table-row>
  </fo:table-body>
</fo:table>
```

## ⚠️ Important Notes

1. **DO NOT edit `lib/custom-fonts.js` manually** - it's generated automatically
2. Font files can be large - this increases the initial page load time
3. The generator uses base64 encoding, which increases file size by ~33%
4. Custom fonts work in both the browser and test environments
5. Font inheritance works just like other attributes (see table cell inheritance)

## 🐛 Troubleshooting

### Font not appearing in PDF

1. Check browser console for font registration message:
   ```
   ✅ Custom fonts registered: ['Wingdings']
   ```

2. Verify `lib/custom-fonts.js` exists and is loaded in HTML:
   ```html
   <script src="lib/custom-fonts.js"></script>
   ```

3. Font names are case-insensitive in XSL-FO (automatically converted to lowercase):
   ```xml
   <!-- ✅ All correct (case doesn't matter) -->
   <fo:block font-family="Wingdings">Text</fo:block>
   <fo:block font-family="wingdings">Text</fo:block>
   <fo:block font-family="WINGDINGS">Text</fo:block>
   ```
   
   All of these work because the converter automatically converts font names to lowercase for PDFMake.

### Regenerating fonts after changes

If you modify font files or add new fonts:

```bash
# Regenerate the font configuration
node scripts/generate-font-config.js

# Refresh your browser (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
```

### Checking generated file size

After generation, check the output:

```
✅ Font configuration written to: /path/to/lib/custom-fonts.js
📦 Total fonts: 1
📊 Total font files: 4
💾 Output size: 437.10 KB
```

## 📚 References

- [PDFMake Custom Fonts Documentation](https://pdfmake.github.io/docs/0.1/fonts/custom-fonts-client-side/)
- [XSL-FO Font Properties](https://www.w3.org/TR/xsl11/#font-selection-properties)

