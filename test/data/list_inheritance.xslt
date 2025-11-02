<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <!-- Test 1: Block with font-size should inherit to list items -->
      <fo:block font-size="10pt">
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label>
              <fo:block>•</fo:block>
            </fo:list-item-label>
            <fo:list-item-body>
              <fo:block>Item with inherited font-size</fo:block>
            </fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
      
      <!-- Test 2: Block with color should inherit through list structure -->
      <fo:block color="red">
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label>
              <fo:block>1.</fo:block>
            </fo:list-item-label>
            <fo:list-item-body>
              <fo:block>Red list item</fo:block>
            </fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
      
      <!-- Test 3: Block with multiple attributes should inherit all -->
      <fo:block font-size="12pt" color="blue" font-weight="bold">
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label>
              <fo:block>•</fo:block>
            </fo:list-item-label>
            <fo:list-item-body>
              <fo:block>Blue bold 12pt item</fo:block>
            </fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
      
      <!-- Test 4: Inheritance should work with inline elements in list -->
      <fo:block font-size="14pt" color="green">
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label>
              <fo:block>→</fo:block>
            </fo:list-item-label>
            <fo:list-item-body>
              <fo:block>Item with <fo:inline font-style="italic">italic inline</fo:inline> text</fo:block>
            </fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
      
      <!-- Test 5: Child override - list item block with explicit font-size should override parent -->
      <fo:block font-size="10pt">
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label>
              <fo:block>•</fo:block>
            </fo:list-item-label>
            <fo:list-item-body>
              <fo:block font-size="16pt">Override to 16pt</fo:block>
            </fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
      
      <!-- Test 6: Complex real-world example from user -->
      <fo:block font-size="10pt">
        <fo:block>
          <fo:block line-height="3pt"></fo:block>
          <fo:inline font-weight="bold">Washroom facilities at construction sites</fo:inline>
          <fo:block line-height="3pt"></fo:block>Effective October 1, 2024.
          <fo:block line-height="3pt"></fo:block>
          <fo:list-block>
            <fo:list-item>
              <fo:list-item-label>
                <fo:block>•</fo:block>
              </fo:list-item-label>
              <fo:list-item-body>
                <fo:block>Item text with inherited 10pt font size</fo:block>
              </fo:list-item-body>
            </fo:list-item>
          </fo:list-block>
        </fo:block>
      </fo:block>
      
      <!-- Test 7: Text-align inheritance through list -->
      <fo:block text-align="center">
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label>
              <fo:block>*</fo:block>
            </fo:list-item-label>
            <fo:list-item-body>
              <fo:block>Centered list item</fo:block>
            </fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
      
      <!-- Test 8: Font-family inheritance through list -->
      <fo:block font-family="NimbusSan">
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label>
              <fo:block>◆</fo:block>
            </fo:list-item-label>
            <fo:list-item-body>
              <fo:block>NimbusSan font item</fo:block>
            </fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

