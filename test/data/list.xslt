<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="ListTest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="ListTest">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 1: Simple Bullet List -->
      <fo:list-block>
        <fo:list-item>
          <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>Item 1</fo:block></fo:list-item-body>
        </fo:list-item>
        <fo:list-item>
          <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>Item 2</fo:block></fo:list-item-body>
        </fo:list-item>
      </fo:list-block>
      
      <!-- Example 2: Simple Numbered List -->
      <fo:list-block>
        <fo:list-item>
          <fo:list-item-label><fo:block>1.</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>First Item</fo:block></fo:list-item-body>
        </fo:list-item>
        <fo:list-item>
          <fo:list-item-label><fo:block>2.</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>Second Item</fo:block></fo:list-item-body>
        </fo:list-item>
      </fo:list-block>
      
      <!-- Example 3: Three-item Numbered List -->
      <fo:list-block>
        <fo:list-item>
          <fo:list-item-label><fo:block>1.</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>First</fo:block></fo:list-item-body>
        </fo:list-item>
        <fo:list-item>
          <fo:list-item-label><fo:block>2.</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>Second</fo:block></fo:list-item-body>
        </fo:list-item>
        <fo:list-item>
          <fo:list-item-label><fo:block>3.</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>Third</fo:block></fo:list-item-body>
        </fo:list-item>
      </fo:list-block>
      
      <!-- Example 4: Bullet List with Bold Item -->
      <fo:list-block>
        <fo:list-item>
          <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block font-weight="bold">Bold Item</fo:block></fo:list-item-body>
        </fo:list-item>
      </fo:list-block>
      
      <!-- Example 5: Bullet List with Styled Items -->
      <fo:list-block>
        <fo:list-item>
          <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block color="#FF0000">Red Item</fo:block></fo:list-item-body>
        </fo:list-item>
        <fo:list-item>
          <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block font-size="14pt">Large Item</fo:block></fo:list-item-body>
        </fo:list-item>
      </fo:list-block>
      
      <!-- Example 6: Numbered List with Parentheses -->
      <fo:list-block>
        <fo:list-item>
          <fo:list-item-label><fo:block>1)</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>First with paren</fo:block></fo:list-item-body>
        </fo:list-item>
        <fo:list-item>
          <fo:list-item-label><fo:block>2)</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>Second with paren</fo:block></fo:list-item-body>
        </fo:list-item>
      </fo:list-block>
      
      <!-- Example 7: Bullet List with Dash -->
      <fo:list-block>
        <fo:list-item>
          <fo:list-item-label><fo:block>-</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>Dash item 1</fo:block></fo:list-item-body>
        </fo:list-item>
        <fo:list-item>
          <fo:list-item-label><fo:block>-</fo:block></fo:list-item-label>
          <fo:list-item-body><fo:block>Dash item 2</fo:block></fo:list-item-body>
        </fo:list-item>
      </fo:list-block>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

