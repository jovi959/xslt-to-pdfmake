<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <!-- Example 1: Four-value margin format -->
      <fo:table margin="20px 0px 0px 0px">
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell><fo:block>Cell 1</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 2: Single-value margin format -->
      <fo:table margin="15px">
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell><fo:block>Cell 1</fo:block></fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

