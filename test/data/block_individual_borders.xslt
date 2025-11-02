<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 1: border-bottom shorthand (user's specific case) -->
      <fo:block border-bottom="1px solid black" padding="5px 0px 5px 0px">
        <fo:inline font-weight="bold">WCA72(2)</fo:inline>
      </fo:block>
      
      <!-- Example 2: border-top shorthand -->
      <fo:block border-top="2pt dashed red">
        Content with top border
      </fo:block>
      
      <!-- Example 3: border-left and border-right shorthand -->
      <fo:block border-left="3px solid green" border-right="1px solid blue">
        Content with left and right borders
      </fo:block>
      
      <!-- Example 4: General border with individual shorthand override -->
      <fo:block border="2px solid black" border-bottom="4px dashed red">
        General border with bottom override
      </fo:block>
      
      <!-- Example 5: Block without borders (should not convert to table) -->
      <fo:block font-size="12pt">
        Regular block without borders
      </fo:block>
      
      <!-- Example 6: Border-bottom override with 0 width (from earlier test) -->
      <fo:block text-align="center" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt" background-color="#DFDFDF" border-bottom-width="0px">
        ORDER STATUS LEGEND
      </fo:block>
      
      <!-- Example 7: Only top and bottom borders (explicit width/color/style) -->
      <fo:block border-top-style="solid" border-top-width="1pt" border-bottom-style="solid" border-bottom-width="3pt" border-bottom-color="#FF0000">
        Block with only top and bottom borders
      </fo:block>
      
      <!-- Example 8: Only left and right borders (explicit width/color/style) -->
      <fo:block border-left-style="solid" border-left-width="4pt" border-right-style="solid" border-right-width="1pt" border-right-color="blue">
        Block with only left and right borders
      </fo:block>
      
      <!-- Example 9: All sides with different properties -->
      <fo:block border-top-width="2pt" border-top-color="red" border-left-width="1pt" border-left-color="green" border-right-width="1pt" border-right-color="blue" border-bottom-width="2pt" border-bottom-color="yellow">
        Block with all sides different
      </fo:block>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

