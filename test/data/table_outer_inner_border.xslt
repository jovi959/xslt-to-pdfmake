<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 1: Basic table with outer/inner border pattern -->
      <fo:table border-style="solid" border-color="#000000" border-width="0.5pt">
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C1</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C2</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C3</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C4</fo:block></fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C1</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C2</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C3</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C4</fo:block></fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R3C1</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R3C2</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R3C3</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R3C4</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 2: Table with header and outer/inner border pattern -->
      <fo:table border-style="solid" border-color="#000000" border-width="0.5pt">
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block font-weight="bold">Header 1</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block font-weight="bold">Header 2</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block font-weight="bold">Header 3</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block font-weight="bold">Header 4</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C1</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C2</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C3</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C4</fo:block></fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C1</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C2</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C3</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C4</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 3: Table with background colors and alignment -->
      <fo:table border-style="solid" border-color="#000000" border-width="0.5pt">
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C1</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt" background-color="#EEEEEE">
              <fo:block text-align="center">R1C2</fo:block>
            </fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C3</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R1C4</fo:block></fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt" background-color="#DDDDDD">
              <fo:block>R2C1</fo:block>
            </fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C2</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt"><fo:block>R2C3</fo:block></fo:table-cell>
            <fo:table-cell border-style="solid" border-color="#AAAAAA" border-width="0.5pt" background-color="#DDDDDD">
              <fo:block text-align="right">R2C4</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

