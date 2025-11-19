<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="test-page" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-before region-name="test-header" extent="1in"/>
      <fo:region-body margin-top="1.5in" margin-bottom="0.5in"/>
      <fo:region-after region-name="test-footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <fo:page-sequence-master master-name="test-sequence">
      <fo:repeatable-page-master-reference master-reference="test-page"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>

  <fo:page-sequence master-reference="test-sequence">
    <!-- Header with the table -->
    <fo:static-content flow-name="test-header">
      <fo:table width="100%">
        <fo:table-column column-width="proportional-column-width(33)"/>
        <fo:table-column column-width="proportional-column-width(33)"/>
        <fo:table-column column-width="proportional-column-width(33)"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block font-size="6pt"/>
            </fo:table-cell>
            <fo:table-cell text-align="center" background-color="#5F5F5F" color="#ffffff">
              <fo:block border-style="solid" border-color="#000000" border-width="0.5pt" font-weight="bold" font-size="12pt" text-align="center" padding="5px 0px 5px 0px">IR 202558107209A</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block font-size="6pt"/>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:static-content>

    <!-- Body content -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Test content in body</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

