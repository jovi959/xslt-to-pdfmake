<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 1: Bold block with normal inline -->
      <fo:block font-weight="bold">
        This is bold. 
        <fo:inline font-weight="normal">This is normal.</fo:inline>
      </fo:block>
      
      <!-- Example 2: Normal block with bold inline -->
      <fo:block font-weight="normal">
        This is normal. 
        <fo:inline font-weight="bold">This is bold.</fo:inline>
      </fo:block>
      
      <!-- Example 3: Bold block with multiple inlines -->
      <fo:block font-weight="bold">
        Bold text 
        <fo:inline font-weight="normal">normal</fo:inline>
        more bold
        <fo:inline font-weight="bold">explicitly bold</fo:inline>
      </fo:block>
      
      <!-- Example 4: Nested inlines with weight changes -->
      <fo:block font-weight="bold">
        Bold block
        <fo:inline font-weight="normal">
          Normal inline with <fo:inline font-weight="bold">nested bold</fo:inline> inside
        </fo:inline>
      </fo:block>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

