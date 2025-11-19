<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="TestPage" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="TestPage">
    <fo:flow flow-name="xsl-region-body">
      <!-- Block without explicit styles (should get defaults) -->
      <fo:block>
        Text without explicit styles
      </fo:block>
      
      <!-- Block with explicit lineHeight (should NOT be overridden) -->
      <fo:block line-height="2.0">
        Text with explicit line-height 2.0
      </fo:block>
      
      <!-- Block with explicit fontSize (should NOT be overridden) -->
      <fo:block font-size="14pt">
        Text with explicit font-size 14pt
      </fo:block>
      
      <!-- Block with explicit color (should NOT be overridden) -->
      <fo:block color="#FF0000">
        Red text with explicit color
      </fo:block>
      
      <!-- Nested blocks - parent with no styles, child with explicit styles -->
      <fo:block>
        Parent without styles
        <fo:block font-size="16pt" color="#0000FF">
          Child with explicit styles
        </fo:block>
      </fo:block>
      
      <!-- Table with cells without explicit styles -->
      <fo:table>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Cell 1 without styles</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block font-size="12pt">Cell 2 with explicit font-size</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- List without explicit styles -->
      <fo:list-block>
        <fo:list-item>
          <fo:list-item-label>
            <fo:block>•</fo:block>
          </fo:list-item-label>
          <fo:list-item-body>
            <fo:block>List item without styles</fo:block>
          </fo:list-item-body>
        </fo:list-item>
        <fo:list-item>
          <fo:list-item-label>
            <fo:block>•</fo:block>
          </fo:list-item-label>
          <fo:list-item-body>
            <fo:block line-height="1.8">List item with explicit line-height</fo:block>
          </fo:list-item-body>
        </fo:list-item>
      </fo:list-block>
      
      <!-- Inline elements without styles -->
      <fo:block>
        Text with <fo:inline>inline without styles</fo:inline> and <fo:inline font-weight="bold">inline with bold</fo:inline>
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>


