<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <!-- Master with header and footer -->
    <fo:simple-page-master master-name="with-header-footer" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin="0.5in"/>
      <fo:region-before region-name="my-header" extent="0.5in"/>
      <fo:region-after region-name="my-footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Master with only header -->
    <fo:simple-page-master master-name="header-only" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin="0.5in"/>
      <fo:region-before region-name="page-header" extent="0.75in"/>
    </fo:simple-page-master>
    
    <!-- Master with only footer -->
    <fo:simple-page-master master-name="footer-only" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin="0.5in"/>
      <fo:region-after region-name="page-footer" extent="0.75in"/>
    </fo:simple-page-master>
    
    <!-- Master with neither header nor footer -->
    <fo:simple-page-master master-name="body-only" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Master with custom names -->
    <fo:simple-page-master master-name="custom-regions" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="main-content" margin="0.5in"/>
      <fo:region-before region-name="top-banner" extent="1in"/>
      <fo:region-after region-name="bottom-bar" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Page sequence master -->
    <fo:page-sequence-master master-name="document-sequence">
      <fo:single-page-master-reference master-reference="with-header-footer"/>
      <fo:repeatable-page-master-reference master-reference="with-header-footer"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="document-sequence">
    <!-- Header content -->
    <fo:static-content flow-name="my-header">
      <fo:block font-size="10pt" text-align="center">
        Header Content
      </fo:block>
    </fo:static-content>
    
    <!-- Footer content -->
    <fo:static-content flow-name="my-footer">
      <fo:block font-size="8pt" text-align="right">
        Footer Content
      </fo:block>
    </fo:static-content>
    
    <!-- Main content -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">
        Main document content
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

