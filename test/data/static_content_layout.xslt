<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <!-- First page master with header and footer -->
    <fo:simple-page-master master-name="first" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-before region-name="first-header" extent="1in"/>
      <fo:region-after region-name="first-footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Rest pages master with different header and footer -->
    <fo:simple-page-master master-name="rest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-before region-name="rest-header" extent="1in"/>
      <fo:region-after region-name="rest-footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Simple master with shared footer -->
    <fo:simple-page-master master-name="all-pages" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-after region-name="shared-footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Page sequence masters -->
    <fo:page-sequence-master master-name="first-only-seq">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
    
    <fo:page-sequence-master master-name="all-pages-seq">
      <fo:single-page-master-reference master-reference="all-pages"/>
      <fo:repeatable-page-master-reference master-reference="all-pages"/>
    </fo:page-sequence-master>
    
    <fo:page-sequence-master master-name="rest-only-seq">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="first-only-seq">
    <!-- First page header - only appears on page 1 -->
    <fo:static-content flow-name="first-header">
      <fo:block font-size="16pt" font-weight="bold" text-align="center" color="blue">
        Annual Report 2024
      </fo:block>
      <fo:block font-size="10pt" text-align="center">
        Company Confidential
      </fo:block>
    </fo:static-content>
    
    <!-- First page footer - only appears on page 1 -->
    <fo:static-content flow-name="first-footer">
      <fo:block font-size="8pt" text-align="center" color="gray">
        Cover Page
      </fo:block>
    </fo:static-content>
    
    <!-- Rest pages header - appears on pages 2+ -->
    <fo:static-content flow-name="rest-header">
      <fo:block font-size="12pt" font-weight="bold">
        Annual Report
      </fo:block>
    </fo:static-content>
    
    <!-- Rest pages footer - appears on pages 2+ -->
    <fo:static-content flow-name="rest-footer">
      <fo:block font-size="9pt" text-align="center">
        Page <fo:page-number/>
      </fo:block>
    </fo:static-content>
    
    <!-- Main content -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">
        This is the main body content.
      </fo:block>
      <fo:block font-size="12pt">
        More content here.
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
  
  <!-- Second page sequence for testing "all" type -->
  <fo:page-sequence master-reference="all-pages-seq">
    <!-- Shared footer - appears on ALL pages -->
    <fo:static-content flow-name="shared-footer">
      <fo:block font-size="8pt" text-align="center" border-top="1pt solid black">
        © 2024 Company Name - All Rights Reserved
      </fo:block>
    </fo:static-content>
    
    <!-- Main content -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">
        Second page sequence content.
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

