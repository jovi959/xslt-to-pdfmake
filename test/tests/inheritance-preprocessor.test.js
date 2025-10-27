/**
 * Inheritance Preprocessor Tests
 * Tests for the generic inheritance pre-processor system
 */

function registerInheritancePreprocessorTests(testRunner, converter, sampleXML, assert) {
    // Helper to parse XML for testing
    function parseXML(xmlString) {
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            return xmlDoc.documentElement;
        } else {
            // Node.js environment - use the converter's parser
            const SimpleXMLParser = require('../test-cli.js').SimpleXMLParser;
            const parser = new SimpleXMLParser();
            return parser.parse(xmlString);
        }
    }

    // Helper to get attribute from element
    function getAttr(element, attrName) {
        if (element.getAttribute) {
            const value = element.getAttribute(attrName);
            // @xmldom/xmldom returns empty string for missing attributes, normalize to null
            return (value === '' || value === null) ? null : value;
        }
        return element.attributes ? (element.attributes[attrName] || null) : null;
    }

    // Helper to find elements by tag name (works for both DOM and SimpleXMLParser)
    function findElementsByTagName(root, tagName) {
        if (root.getElementsByTagName) {
            return Array.from(root.getElementsByTagName(tagName));
        }
        
        // For SimpleXMLParser nodes
        const results = [];
        
        function traverse(node) {
            if (!node) return;
            
            if (node.nodeName === tagName) {
                results.push(node);
            }
            
            if (node.childNodes && node.childNodes.length > 0) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    traverse(node.childNodes[i]);
                }
            }
        }
        
        traverse(root);
        return results;
    }

    // Helper to find first child element by tag name
    function findFirstChildByTagName(parent, tagName) {
        if (!parent || !parent.childNodes) return null;
        
        for (let i = 0; i < parent.childNodes.length; i++) {
            const child = parent.childNodes[i];
            if (child.nodeName === tagName) {
                return child;
            }
        }
        return null;
    }

    // ==========================================
    // HAPPY PATH TESTS
    // ==========================================

    testRunner.addTest('Inheritance: Should inherit single attribute from parent to child', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block>Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.ok(childBlock, 'Should have child block');
        assert.equal(getAttr(childBlock, 'color'), '#FF0000', 'Child should inherit color');
    });

    testRunner.addTest('Inheritance: Should inherit multiple attributes from parent', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                       color="#FF0000" 
                       font-family="Roboto" 
                       font-size="14pt">
            <fo:block>Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color", "font-family", "font-size"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const blocks = findElementsByTagName(element, 'fo:block');
        const childBlock = blocks[0]; // First child block
        
        assert.equal(getAttr(childBlock, 'color'), '#FF0000', 'Child should inherit color');
        assert.equal(getAttr(childBlock, 'font-family'), 'Roboto', 'Child should inherit font-family');
        assert.equal(getAttr(childBlock, 'font-size'), '14pt', 'Child should inherit font-size');
    });

    testRunner.addTest('Inheritance: Should propagate to grandchildren (nested inheritance)', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                       font-family="Roboto" 
                       font-weight="bold" 
                       color="#FF0000">
            <fo:block font-size="10pt">
                <fo:block>Grandchild</fo:block>
            </fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["font-family", "font-weight", "color", "font-size"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        // Get all blocks
        const blocks = findElementsByTagName(element, 'fo:block');
        
        // Grandchild should be the last block (most deeply nested)
        const grandchild = blocks[blocks.length - 1];
        
        assert.equal(getAttr(grandchild, 'font-family'), 'Roboto', 'Grandchild should inherit font-family');
        assert.equal(getAttr(grandchild, 'font-weight'), 'bold', 'Grandchild should inherit font-weight');
        assert.equal(getAttr(grandchild, 'color'), '#FF0000', 'Grandchild should inherit color from root');
        assert.equal(getAttr(grandchild, 'font-size'), '10pt', 'Grandchild should inherit font-size from parent');
    });

    testRunner.addTest('Inheritance: Should inherit from block to inline', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                       color="#FF0000" 
                       font-weight="bold">
            Text with <fo:inline>inline content</fo:inline>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block", "inline"],
            inheritable_attributes: ["color", "font-weight"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const inlines = findElementsByTagName(element, 'fo:inline');
        const inline = inlines[0];
        
        assert.ok(inline, 'Should have inline element');
        assert.equal(getAttr(inline, 'color'), '#FF0000', 'Inline should inherit color');
        assert.equal(getAttr(inline, 'font-weight'), 'bold', 'Inline should inherit font-weight');
    });

    // ==========================================
    // CHILD ATTRIBUTE PRECEDENCE TESTS
    // ==========================================

    testRunner.addTest('Inheritance: Child attribute should take precedence over parent', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block color="#0000FF">Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const blocks = findElementsByTagName(element, 'fo:block');
        const childBlock = blocks[0]; // First child block
        
        assert.equal(getAttr(childBlock, 'color'), '#0000FF', 'Child should keep its own color, not inherit');
    });

    testRunner.addTest('Inheritance: Mixed inheritance and override', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                       color="#FF0000" 
                       font-family="Roboto" 
                       font-size="14pt">
            <fo:block font-size="10pt">Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color", "font-family", "font-size"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const blocks = findElementsByTagName(element, 'fo:block');
        const childBlock = blocks[0]; // First child block
        
        assert.equal(getAttr(childBlock, 'color'), '#FF0000', 'Should inherit color');
        assert.equal(getAttr(childBlock, 'font-family'), 'Roboto', 'Should inherit font-family');
        assert.equal(getAttr(childBlock, 'font-size'), '10pt', 'Should keep own font-size');
    });

    testRunner.addTest('Inheritance: Grandchild override should not affect middle child', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block>
                <fo:block color="#00FF00">Grandchild</fo:block>
            </fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const blocks = findElementsByTagName(element, 'fo:block');
        
        const middleChild = blocks[0]; // First child
        const grandchild = blocks[1]; // Second child (grandchild)
        
        assert.equal(getAttr(middleChild, 'color'), '#FF0000', 'Middle child should inherit from parent');
        assert.equal(getAttr(grandchild, 'color'), '#00FF00', 'Grandchild should keep its own color');
    });

    // ==========================================
    // CONFIGURATION TESTS
    // ==========================================

    testRunner.addTest('Inheritance: Should only inherit configured attributes', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                       color="#FF0000" 
                       font-family="Roboto" 
                       background-color="#FFFF00">
            <fo:block>Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color", "font-family"] // background-color NOT included
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const blocks = findElementsByTagName(element, 'fo:block');
        const childBlock = findFirstChildByTagName(element, 'fo:block'); // Get child, not parent
        
        assert.equal(getAttr(childBlock, 'color'), '#FF0000', 'Should inherit color');
        assert.equal(getAttr(childBlock, 'font-family'), 'Roboto', 'Should inherit font-family');
        assert.equal(getAttr(childBlock, 'background-color'), null, 'Should NOT inherit background-color');
    });

    testRunner.addTest('Inheritance: Should only pass to configured inheriter tags', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block>Block Child</fo:block>
            <fo:inline>Inline Child</fo:inline>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"], // inline NOT included
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block'); // Get child, not parent
        const inline = findFirstChildByTagName(element, 'fo:inline'); // Get child inline
        
        assert.equal(getAttr(childBlock, 'color'), '#FF0000', 'Block child should inherit');
        assert.equal(getAttr(inline, 'color'), null, 'Inline should NOT inherit (not in inheriters list)');
    });

    testRunner.addTest('Inheritance: Multiple tag configurations should work independently', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:inline font-weight="bold">
                <fo:inline>Nested inline</fo:inline>
            </fo:inline>
        </fo:block>`;
        
        const config = [
            {
                tag: "block",
                inheriters: ["inline"],
                inheritable_attributes: ["color"]
            },
            {
                tag: "inline",
                inheriters: ["inline"],
                inheritable_attributes: ["font-weight"]
            }
        ];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const inlines = findElementsByTagName(element, 'fo:inline');
        
        const firstInline = inlines[0];
        const nestedInline = inlines[1];
        
        assert.equal(getAttr(firstInline, 'color'), '#FF0000', 'First inline should inherit color from block');
        assert.equal(getAttr(nestedInline, 'font-weight'), 'bold', 'Nested inline should inherit font-weight');
        assert.equal(getAttr(nestedInline, 'color'), '#FF0000', 'Nested inline should also have inherited color');
    });

    // ==========================================
    // EDGE CASES
    // ==========================================

    testRunner.addTest('Inheritance: Should handle empty blocks', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block></fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result, 'Should return a result');
        assert.ok(result.includes('color="#FF0000"'), 'Should process XML');
    });

    testRunner.addTest('Inheritance: Should handle blocks with only text (no child tags)', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            Just text content
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result, 'Should return a result');
        assert.ok(result.includes('Just text content'), 'Should preserve text');
    });

    testRunner.addTest('Inheritance: Should handle parent with no inheritable attributes', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" border="1px solid">
            <fo:block>Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color", "font-family"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block'); // Get child, not parent
        
        assert.ok(childBlock, 'Should have child block');
        assert.equal(getAttr(childBlock, 'color'), null, 'Child should not have color');
        assert.equal(getAttr(childBlock, 'font-family'), null, 'Child should not have font-family');
    });

    testRunner.addTest('Inheritance: Should handle deeply nested structure (5+ levels)', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block>
                <fo:block>
                    <fo:block>
                        <fo:block>
                            <fo:block>Deep child</fo:block>
                        </fo:block>
                    </fo:block>
                </fo:block>
            </fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const blocks = element.getElementsByTagName ? 
            Array.from(element.getElementsByTagName('fo:block')) :
            [element];
        
        // All blocks should have color inherited
        assert.ok(result.split('color="#FF0000"').length > 5, 'All deep children should inherit color');
    });

    testRunner.addTest('Inheritance: Should handle mixed text and elements', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            Some text
            <fo:inline>inline content</fo:inline>
            more text
            <fo:block>block content</fo:block>
            final text
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block", "inline"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result.includes('Some text'), 'Should preserve first text');
        assert.ok(result.includes('more text'), 'Should preserve middle text');
        assert.ok(result.includes('final text'), 'Should preserve final text');
    });

    testRunner.addTest('Inheritance: Should handle self-closing tags', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block/>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result, 'Should handle self-closing tags');
    });

    // ==========================================
    // UNHAPPY PATH / ERROR HANDLING
    // ==========================================

    testRunner.addTest('Inheritance: Should handle empty XML string', () => {
        const xml = '';
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.equal(result, '', 'Should return empty string for empty input');
    });

    testRunner.addTest('Inheritance: Should handle null XML', () => {
        const xml = null;
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.equal(result, '', 'Should return empty string for null input');
    });

    testRunner.addTest('Inheritance: Should handle empty config array', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block>Child</fo:block>
        </fo:block>`;
        const config = [];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result, 'Should return XML unchanged');
        assert.ok(result.includes('<fo:block'), 'Should preserve XML structure');
    });

    testRunner.addTest('Inheritance: Should handle null config', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block>Child</fo:block>
        </fo:block>`;
        const config = null;
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result, 'Should return XML unchanged');
    });

    testRunner.addTest('Inheritance: Should handle malformed config (missing tag)', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block>Child</fo:block>
        </fo:block>`;
        const config = [{
            inheriters: ["block"],
            inheritable_attributes: ["color"]
            // missing 'tag' field
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result, 'Should handle malformed config gracefully');
    });

    testRunner.addTest('Inheritance: Should preserve namespace prefixes', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000">
            <fo:block>Child</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result.includes('fo:block'), 'Should preserve fo: namespace prefix');
        assert.ok(result.includes('xmlns:fo'), 'Should preserve namespace declaration');
    });

    testRunner.addTest('Inheritance: Should handle attributes with special characters', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" color="#FF0000" data-test="value&quot;with&quot;quotes">
            <fo:block>Child</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["color", "data-test"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        assert.ok(result, 'Should handle special characters in attributes');
    });

    // ==========================================
    // REAL-WORLD EXAMPLE TEST
    // ==========================================

    testRunner.addTest('Inheritance: User provided example (Roboto, bold, colors)', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format"
          font-family="Roboto"
          font-size="14pt"
          font-weight="bold"
          color="#FF0000"
          background-color="#FFFF00">
  Parent Text

  <fo:block font-size="10pt" color="#0000FF">
    Child Text (Blue, 10pt)

    <fo:block>
      Grandchild Text (inherits color, font, weight, background)
    </fo:block>
  </fo:block>
</fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block", "inline"],
            inheritable_attributes: ["font-family", "font-size", "font-weight", "color", "background-color"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        
        // Get all blocks
        const blocks = findElementsByTagName(element, 'fo:block');
        
        // Child block (should be index 0 since we're getting children only)
        const childBlock = blocks[0];
        assert.equal(getAttr(childBlock, 'font-family'), 'Roboto', 'Child should inherit font-family');
        assert.equal(getAttr(childBlock, 'font-size'), '10pt', 'Child should keep own font-size');
        assert.equal(getAttr(childBlock, 'font-weight'), 'bold', 'Child should inherit font-weight');
        assert.equal(getAttr(childBlock, 'color'), '#0000FF', 'Child should keep own color');
        assert.equal(getAttr(childBlock, 'background-color'), '#FFFF00', 'Child should inherit background-color');
        
        // Grandchild block (last in the list)
        const grandchildBlock = blocks[blocks.length - 1];
        assert.equal(getAttr(grandchildBlock, 'font-family'), 'Roboto', 'Grandchild should inherit font-family');
        assert.equal(getAttr(grandchildBlock, 'font-size'), '10pt', 'Grandchild should inherit font-size from parent');
        assert.equal(getAttr(grandchildBlock, 'font-weight'), 'bold', 'Grandchild should inherit font-weight');
        assert.equal(getAttr(grandchildBlock, 'color'), '#0000FF', 'Grandchild should inherit color from parent');
        assert.equal(getAttr(grandchildBlock, 'background-color'), '#FFFF00', 'Grandchild should inherit background-color');
    });

    // ==========================================
    // FONT-FAMILY AND FONT ATTRIBUTE TESTS
    // ==========================================

    testRunner.addTest('Inheritance: Should inherit font-family from parent', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-family="Arial">
            <fo:block>Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["font-family"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.ok(childBlock, 'Should have child block');
        assert.equal(getAttr(childBlock, 'font-family'), 'Arial', 'Child should inherit Arial font-family');
    });

    testRunner.addTest('Inheritance: Should inherit font-family with multiple fonts', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-family="Helvetica, Arial, sans-serif">
            <fo:block>Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["font-family"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.equal(getAttr(childBlock, 'font-family'), 'Helvetica, Arial, sans-serif', 
            'Child should inherit full font-family stack');
    });

    testRunner.addTest('Inheritance: Should inherit font-family to inline elements', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-family="Times New Roman">
            Text with <fo:inline>inline content</fo:inline>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block", "inline"],
            inheritable_attributes: ["font-family"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const inline = findFirstChildByTagName(element, 'fo:inline');
        
        assert.ok(inline, 'Should have inline element');
        assert.equal(getAttr(inline, 'font-family'), 'Times New Roman', 'Inline should inherit font-family');
    });

    testRunner.addTest('Inheritance: Child font-family should override parent', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" font-family="Arial">
            <fo:block font-family="Courier">Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["font-family"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.equal(getAttr(childBlock, 'font-family'), 'Courier', 
            'Child should keep its own font-family, not inherit');
    });

    testRunner.addTest('Inheritance: Should inherit multiple font attributes together', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                       font-family="Roboto" 
                       font-size="14pt" 
                       font-weight="bold" 
                       font-style="italic">
            <fo:block>Child Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["font-family", "font-size", "font-weight", "font-style"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.equal(getAttr(childBlock, 'font-family'), 'Roboto', 'Should inherit font-family');
        assert.equal(getAttr(childBlock, 'font-size'), '14pt', 'Should inherit font-size');
        assert.equal(getAttr(childBlock, 'font-weight'), 'bold', 'Should inherit font-weight');
        assert.equal(getAttr(childBlock, 'font-style'), 'italic', 'Should inherit font-style');
    });

    testRunner.addTest('Inheritance: Should inherit text-align', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" text-align="center">
            <fo:block>Centered Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["text-align"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.equal(getAttr(childBlock, 'text-align'), 'center', 'Should inherit text-align');
    });

    testRunner.addTest('Inheritance: Should inherit text-decoration', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" text-decoration="underline">
            <fo:block>Underlined Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["text-decoration"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.equal(getAttr(childBlock, 'text-decoration'), 'underline', 'Should inherit text-decoration');
    });

    testRunner.addTest('Inheritance: Should inherit line-height', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" line-height="1.5">
            <fo:block>Text with line height</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["line-height"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.equal(getAttr(childBlock, 'line-height'), '1.5', 'Should inherit line-height');
    });

    testRunner.addTest('Inheritance: Should inherit letter-spacing and word-spacing', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                       letter-spacing="2px" 
                       word-spacing="5px">
            <fo:block>Spaced Text</fo:block>
        </fo:block>`;
        
        const config = [{
            tag: "block",
            inheriters: ["block"],
            inheritable_attributes: ["letter-spacing", "word-spacing"]
        }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.equal(getAttr(childBlock, 'letter-spacing'), '2px', 'Should inherit letter-spacing');
        assert.equal(getAttr(childBlock, 'word-spacing'), '5px', 'Should inherit word-spacing');
    });

    testRunner.addTest('Inheritance: Should inherit all configured attributes using default config', () => {
        const xml = `<fo:block xmlns:fo="http://www.w3.org/1999/XSL/Format" 
                       color="#FF0000"
                       font-family="Roboto"
                       font-size="14pt"
                       font-weight="bold"
                       font-style="italic"
                       background-color="#FFFF00"
                       text-align="center"
                       text-decoration="underline"
                       line-height="1.5"
                       text-indent="20px"
                       letter-spacing="1px"
                       word-spacing="3px">
            <fo:block>Child with all attributes</fo:block>
        </fo:block>`;
        
        // Use the actual default config
        const config = window.BlockInheritanceConfig 
            ? window.BlockInheritanceConfig.getBlockInheritanceConfig()
            : [{
                tag: "block",
                inheriters: ["block"],
                inheritable_attributes: [
                    "color", "font-family", "font-size", "font-weight", "font-style",
                    "background-color", "text-align", "text-decoration", "line-height",
                    "text-indent", "letter-spacing", "word-spacing"
                ]
            }];
        
        const result = window.InheritancePreprocessor.preprocessInheritance(xml, config);
        const element = parseXML(result);
        const childBlock = findFirstChildByTagName(element, 'fo:block');
        
        assert.equal(getAttr(childBlock, 'color'), '#FF0000', 'Should inherit color');
        assert.equal(getAttr(childBlock, 'font-family'), 'Roboto', 'Should inherit font-family');
        assert.equal(getAttr(childBlock, 'font-size'), '14pt', 'Should inherit font-size');
        assert.equal(getAttr(childBlock, 'font-weight'), 'bold', 'Should inherit font-weight');
        assert.equal(getAttr(childBlock, 'font-style'), 'italic', 'Should inherit font-style');
        assert.equal(getAttr(childBlock, 'background-color'), '#FFFF00', 'Should inherit background-color');
        assert.equal(getAttr(childBlock, 'text-align'), 'center', 'Should inherit text-align');
        assert.equal(getAttr(childBlock, 'text-decoration'), 'underline', 'Should inherit text-decoration');
        assert.equal(getAttr(childBlock, 'line-height'), '1.5', 'Should inherit line-height');
        assert.equal(getAttr(childBlock, 'text-indent'), '20px', 'Should inherit text-indent');
        assert.equal(getAttr(childBlock, 'letter-spacing'), '1px', 'Should inherit letter-spacing');
        assert.equal(getAttr(childBlock, 'word-spacing'), '3px', 'Should inherit word-spacing');
    });
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerInheritancePreprocessorTests };
}
if (typeof window !== 'undefined') {
    window.registerInheritancePreprocessorTests = registerInheritancePreprocessorTests;
}

