<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="StandaloneInline" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="StandaloneInline">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 0: Simple standalone inline with color -->
      <fo:inline color="red">Red text standalone</fo:inline>
      
      <!-- Example 1: Standalone inline with bold -->
      <fo:inline font-weight="bold">Bold standalone text</fo:inline>
      
      <!-- Example 2: Standalone inline with multiple attributes -->
      <fo:inline font-weight="bold" font-style="italic" color="#0000FF">Styled standalone</fo:inline>
      
      <!-- Example 3: User's specific case - inline with color and border-color -->
      <fo:inline color="Red" border-color="Red">&lt;Officer's inspection text&gt;</fo:inline>
      
      <!-- Example 4: Standalone inline with font-size -->
      <fo:inline font-size="18pt">Large standalone text</fo:inline>
      
      <!-- Example 5: Standalone inline with text-decoration -->
      <fo:inline text-decoration="underline">Underlined standalone</fo:inline>
      
      <!-- Example 6: Standalone inline with font-family -->
      <fo:inline font-family="Arial">Arial standalone text</fo:inline>
      
      <!-- Example 7: Standalone inline with background-color -->
      <fo:inline background-color="#FFFF00">Highlighted standalone</fo:inline>
      
      <!-- Example 8: Mix of standalone inlines and blocks -->
      <fo:inline color="green">Green inline</fo:inline>
      <fo:block>Block after inline</fo:block>
      <fo:inline color="blue">Blue inline</fo:inline>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

