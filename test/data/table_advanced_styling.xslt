<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <!-- Example 1: Cell borders, padding, and background color -->
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="14pt" font-weight="bold" space-after="10pt">Example 1: Borders, Padding, and Background</fo:block>
      
      <fo:table width="100%">
        <fo:table-column column-width="proportional-column-width(50)"/>
        <fo:table-column column-width="proportional-column-width(50)"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell padding="3pt 3pt 3pt 3pt" border-style="solid" border-color="#000000" border-width="0.5pt" background-color="#DFDFDF">
              <fo:block font-weight="bold" text-align="center" font-size="8pt">*Inspection Time</fo:block>
            </fo:table-cell>
            <fo:table-cell padding="3pt 3pt 3pt 3pt" border-style="solid" border-color="#000000" border-width="0.5pt" background-color="#DFDFDF">
              <fo:block font-weight="bold" text-align="center" font-size="8pt">*Travel Time</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell padding="3pt 3pt 3pt 3pt" border-style="solid" border-color="#000000" border-width="0.5pt">
              <fo:block font-size="8pt" text-align="center">0.25 hrs</fo:block>
            </fo:table-cell>
            <fo:table-cell padding="3pt 3pt 3pt 3pt" border-style="solid" border-color="#000000" border-width="0.5pt">
              <fo:block font-size="8pt" text-align="center">0 hrs</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 2: Proportional widths 1:2:1 -->
      <fo:block font-size="14pt" font-weight="bold" space-before="20pt" space-after="10pt">Example 2: Proportional Widths (1:2:1)</fo:block>
      
      <fo:table width="100%">
        <fo:table-column column-width="proportional-column-width(1)"/>
        <fo:table-column column-width="proportional-column-width(2)"/>
        <fo:table-column column-width="proportional-column-width(1)"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block text-align="left" font-style="italic">Left Italic</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block text-align="center" font-weight="bold">Center Bold</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block text-align="right" color="gray">Right Gray</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 3: 70/30 split -->
      <fo:block font-size="14pt" font-weight="bold" space-before="20pt" space-after="10pt">Example 3: 70/30 Proportional Split</fo:block>
      
      <fo:table width="100%">
        <fo:table-column column-width="proportional-column-width(70)"/>
        <fo:table-column column-width="proportional-column-width(30)"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block font-size="12pt" font-weight="bold">Main Item</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block font-size="9pt" text-align="right">Price</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 4: Table width 50% with border shorthand -->
      <fo:block font-size="14pt" font-weight="bold" space-before="20pt" space-after="10pt">Example 4: Table Width 50% (25% + 25% columns)</fo:block>
      
      <fo:table width="50%">
        <fo:table-column column-width="proportional-column-width(50)"/>
        <fo:table-column column-width="proportional-column-width(50)"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black" padding="3pt">
              <fo:block>Cell 1 (25% Page)</fo:block>
            </fo:table-cell>
            <fo:table-cell border="1pt solid black" padding="3pt">
              <fo:block>Cell 2 (25% Page)</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

