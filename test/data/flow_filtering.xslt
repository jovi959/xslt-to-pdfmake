<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="main" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin="0.5in"/>
      <fo:region-before region-name="page-header" extent="0.5in"/>
      <fo:region-after region-name="page-footer" extent="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="main">
    <!-- Header content -->
    <fo:static-content flow-name="page-header">
      <fo:block font-size="10pt" text-align="center" font-weight="bold">
        Document Header
      </fo:block>
    </fo:static-content>
    
    <!-- Footer content -->
    <fo:static-content flow-name="page-footer">
      <fo:block font-size="8pt" text-align="right">
        Page Footer - Page 1 of 10
      </fo:block>
    </fo:static-content>
    
    <!-- Main content -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="14pt" font-weight="bold" margin-bottom="12pt">
        Main Document Title
      </fo:block>
      
      <fo:block font-size="11pt" margin-bottom="8pt">
        This is the main content of the document. It should be extracted
        when no flow name is specified, or when "xsl-region-body" is specified.
      </fo:block>
      
      <fo:block font-size="10pt" margin-bottom="6pt">
        Additional paragraph with more content.
      </fo:block>
      
      <fo:table width="100%" margin-top="10pt">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black" padding="5pt">
              <fo:block>Table Cell 1</fo:block>
            </fo:table-cell>
            <fo:table-cell border="1pt solid black" padding="5pt">
              <fo:block>Table Cell 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

