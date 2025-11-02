<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <!-- Test 1: Nested block with text and list (the problematic case) -->
      <fo:block>
        <fo:block>
          <fo:block line-height="3pt"></fo:block>
          <fo:inline font-weight="bold">Washroom facilities at construction sites</fo:inline>
          <fo:block line-height="3pt"></fo:block>
          Effective October 1, 2024, changes were made.
          <fo:block line-height="3pt"></fo:block>
          <fo:list-block>
            <fo:list-item>
              <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
              <fo:list-item-body><fo:block>Item text</fo:block></fo:list-item-body>
            </fo:list-item>
          </fo:list-block>
        </fo:block>
      </fo:block>
      
      <!-- Test 2: Simple text with inline (valid) -->
      <fo:block>
        <fo:inline font-weight="bold">Bold</fo:inline> and regular text
      </fo:block>
      
      <!-- Test 3: Nested blocks without lists (valid) -->
      <fo:block>
        <fo:block>Inner block 1</fo:block>
        <fo:block>Inner block 2</fo:block>
      </fo:block>
      
      <!-- Test 4: Outer block with inner stack + sibling text (complex case) -->
      <fo:block>
        <fo:block>
          <fo:block line-height="3pt"></fo:block>
          <fo:inline font-weight="bold">Washroom facilities at construction sites</fo:inline>
          <fo:block line-height="3pt"></fo:block>Effective October 1, 2024.
          <fo:block line-height="3pt"></fo:block>
          <fo:list-block>
            <fo:list-item>
              <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
              <fo:list-item-body><fo:block>Item text</fo:block></fo:list-item-body>
            </fo:list-item>
          </fo:list-block>
        </fo:block>
        fasfsaf
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

