<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Real-world example: Header nested inside table-body -->
      <fo:table border-style="solid" border-color="#000000" border-width="0.5pt">
        <fo:table-column column-width="16%"/>
        <fo:table-column column-width="49%"/>
        <fo:table-column column-width="35%"/>
        <fo:table-body>
          <fo:table-header>
            <fo:table-row keep-with-next.within-page="always">
              <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold" text-align="center" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt" background-color="#DFDFDF" number-columns-spanned="3">
                <fo:block font-size="12pt">Summary of Orders or other Items</fo:block>
                <fo:block font-size="8pt" font-weight="normal">See "Orders/Items – Full Details" section of this Inspection Report for orders/items cited</fo:block>
              </fo:table-cell>
            </fo:table-row>
          </fo:table-header>
          <fo:table-row keep-with-next.within-page="always">
            <fo:table-cell padding="3px 3px 3px 3px" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt">
              <fo:block>
                Order/Item No.1<fo:inline font-size="14pt" padding="0px 5px 0px 5px" color="black" font-family="wingdings">o</fo:inline>
              </fo:block>
            </fo:table-cell>
            <fo:table-cell padding="3px 3px 3px 3px" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt">
              <fo:block>
                Status:
                <fo:inline font-weight="bold" font-size="12pt">Outstanding</fo:inline>
              </fo:block>
            </fo:table-cell>
            <fo:table-cell padding="3px 3px 3px 3px" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt">
              <fo:block>
                Cited:
                <fo:inline font-weight="bold" font-size="12pt">WCA90(1)(a)</fo:inline>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row/>
          <fo:table-row background-color="#DFDFDF" keep-with-next.within-page="always">
            <fo:table-cell padding="3px 3px 3px 3px" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt">
              <fo:block>
                Order/Item No.2<fo:inline font-size="14pt" padding="0px 5px 0px 5px" color="green" font-family="wingdings">þ</fo:inline>
              </fo:block>
            </fo:table-cell>
            <fo:table-cell padding="3px 3px 3px 3px" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt">
              <fo:block>
                Status:
                <fo:inline font-weight="bold" font-size="12pt">Closed</fo:inline>
              </fo:block>
            </fo:table-cell>
            <fo:table-cell padding="3px 3px 3px 3px" border-style="solid" border-color="#000000" border-width="0.5pt" font-size="8pt">
              <fo:block>
                Cited:
                <fo:inline font-weight="bold" font-size="12pt">WCA89(1)</fo:inline>
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row/>
        </fo:table-body>
      </fo:table>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

