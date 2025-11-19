// Quick test to check default styles behavior
const XSLToPDFMakeConverter = require('./src/xslt-to-pdfmake.js');
const DefaultStylesApplier = require('./src/default-styles-applier.js');
const fs = require('fs');

const testXML = fs.readFileSync('./test/data/default_styles.xslt', 'utf-8');
const conv = new XSLToPDFMakeConverter();

// Convert without default styles
const result = conv.convertToPDFMake(testXML, { skipDefaultStyles: true });

console.log('Content before applying defaults:');
console.log('First block:', JSON.stringify(result.content[0], null, 2));
console.log('Has lineHeight?', result.content[0].lineHeight);
console.log('Has fontSize?', result.content[0].fontSize);
console.log('Has color?', result.content[0].color);

// Apply default styles manually
const defaultStyles = { lineHeight: 1.5, fontSize: 10, color: '#333333' };
DefaultStylesApplier.applyDefaultStyles(result, defaultStyles);

console.log('\nContent after applying defaults:');
console.log('First block:', JSON.stringify(result.content[0], null, 2));
console.log('Has lineHeight?', result.content[0].lineHeight);
console.log('Has fontSize?', result.content[0].fontSize);
console.log('Has color?', result.content[0].color);
