<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <!-- Example 1: Colspan at start of row -->
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="16pt" font-weight="bold" space-after="10pt">Example 1: Colspan at Start</fo:block>
      <fo:table>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="34%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell number-columns-spanned="2" border="solid">
              <fo:block>Spans 2 (A+B)</fo:block>
            </fo:table-cell>
            <fo:table-cell border="solid">
              <fo:block>Cell C</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="solid"><fo:block>A</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>B</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>C</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <fo:block space-before="20pt" font-size="16pt" font-weight="bold" space-after="10pt">Example 2: Colspan in Middle</fo:block>
      <fo:table>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="34%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="solid">
              <fo:block>Cell A</fo:block>
            </fo:table-cell>
            <fo:table-cell number-columns-spanned="2" border="solid">
              <fo:block>Spans 2 (B+C)</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="solid"><fo:block>A</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>B</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>C</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <fo:block space-before="20pt" font-size="16pt" font-weight="bold" space-after="10pt">Example 3: Colspan All Columns</fo:block>
      <fo:table>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="34%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell number-columns-spanned="3" border="solid">
              <fo:block>Spans all 3 (A+B+C)</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="solid"><fo:block>A</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>B</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>C</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <fo:block space-before="20pt" font-size="16pt" font-weight="bold" space-after="10pt">Example 4: Multiple Colspans</fo:block>
      <fo:table>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-column column-width="25%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell number-columns-spanned="2" border="solid">
              <fo:block>Spans 2 (A+B)</fo:block>
            </fo:table-cell>
            <fo:table-cell number-columns-spanned="2" border="solid">
              <fo:block>Spans 2 (C+D)</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="solid"><fo:block>A</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>B</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>C</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>D</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <fo:block space-before="20pt" font-size="16pt" font-weight="bold" space-after="10pt">Example 5: Colspan in Second Row</fo:block>
      <fo:table>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="34%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="solid"><fo:block>Normal A</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>Normal B</fo:block></fo:table-cell>
            <fo:table-cell border="solid"><fo:block>Normal C</fo:block></fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="solid">
              <fo:block>Cell A</fo:block>
            </fo:table-cell>
            <fo:table-cell number-columns-spanned="2" border="solid">
              <fo:block>Spans 2 (B+C)</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

