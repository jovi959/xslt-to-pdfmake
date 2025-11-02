<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <!-- Example 1: line-height with unit, no font-size (uses default 10pt) -->
      <fo:block line-height="3pt">x</fo:block>
      
      <!-- Example 2: line-height with unit and explicit font-size -->
      <fo:block line-height="3pt" font-size="6pt">y</fo:block>
      
      <!-- Example 3: line-height with unit and larger font-size -->
      <fo:block line-height="3pt" font-size="18pt">z</fo:block>
      
      <!-- Example 4: unitless line-height (multiplier) -->
      <fo:block line-height="1.5">w</fo:block>
      
      <!-- Example 5: line-height with px unit -->
      <fo:block line-height="12px" font-size="8pt">a</fo:block>
      
      <!-- Example 6: larger unitless multiplier -->
      <fo:block line-height="2.0">b</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

