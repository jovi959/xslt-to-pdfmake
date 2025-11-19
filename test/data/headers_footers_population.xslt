<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <!-- Simple page master with header and footer -->
    <fo:simple-page-master master-name="first-page" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-before region-name="first-page-header" extent="1in"/>
      <fo:region-after region-name="first-page-footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Simple page master for rest pages -->
    <fo:simple-page-master master-name="rest-page" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-before region-name="rest-page-header" extent="1in"/>
      <fo:region-after region-name="rest-page-footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Simple page master with shared header/footer -->
    <fo:simple-page-master master-name="shared-page" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-before region-name="shared-header" extent="1in"/>
      <fo:region-after region-name="shared-footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Simple page master with body only (no header/footer regions) -->
    <fo:simple-page-master master-name="body-only" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body"/>
    </fo:simple-page-master>
    
    <!-- Page sequence master for first/rest pattern -->
    <fo:page-sequence-master master-name="first-rest-sequence">
      <fo:single-page-master-reference master-reference="first-page"/>
      <fo:repeatable-page-master-reference master-reference="rest-page"/>
    </fo:page-sequence-master>
    
    <!-- Page sequence master for shared pages -->
    <fo:page-sequence-master master-name="shared-sequence">
      <fo:repeatable-page-master-reference master-reference="shared-page"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>
  
  <!-- Page sequence 1: First/Rest pattern with headers and footers -->
  <fo:page-sequence master-reference="first-rest-sequence">
    <!-- First page header (firstOnly) -->
    <fo:static-content flow-name="first-page-header">
      <fo:block font-size="18pt" font-weight="bold" text-align="center" color="blue">
        Document Title - Cover Page
      </fo:block>
      <fo:block font-size="10pt" text-align="center" margin-top="5pt">
        Confidential Report
      </fo:block>
    </fo:static-content>
    
    <!-- First page footer (firstOnly) -->
    <fo:static-content flow-name="first-page-footer">
      <fo:block font-size="8pt" text-align="center" color="gray">
        Cover Page - Do Not Distribute
      </fo:block>
    </fo:static-content>
    
    <!-- Rest pages header (rest) -->
    <fo:static-content flow-name="rest-page-header">
      <fo:block font-size="12pt" font-weight="bold">
        Document Title
      </fo:block>
      <fo:block font-size="8pt" color="gray">
        Section Header
      </fo:block>
    </fo:static-content>
    
    <!-- Rest pages footer (rest) -->
    <fo:static-content flow-name="rest-page-footer">
      <fo:block font-size="9pt" text-align="center">
        Page <fo:page-number/> of <fo:page-number-citation-last ref-id="last-page"/>
      </fo:block>
    </fo:static-content>
    
    <!-- Main content -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt" id="content-start">
        This is the main body content for the first/rest sequence.
      </fo:block>
      <fo:block font-size="12pt" margin-top="10pt">
        More content here to test the layout.
      </fo:block>
      <fo:block id="last-page">End marker</fo:block>
    </fo:flow>
  </fo:page-sequence>
  
  <!-- Page sequence 2: Shared header/footer pattern (all pages) -->
  <fo:page-sequence master-reference="shared-sequence">
    <!-- Shared header (all) -->
    <fo:static-content flow-name="shared-header">
      <fo:block font-size="10pt" text-align="right" color="#333333">
        Company Name | Department
      </fo:block>
    </fo:static-content>
    
    <!-- Shared footer (all) -->
    <fo:static-content flow-name="shared-footer">
      <fo:block font-size="8pt" text-align="center" border-top="1pt solid black" padding-top="5pt">
        © 2024 Company Name - All Rights Reserved | Internal Use Only
      </fo:block>
    </fo:static-content>
    
    <!-- Main content -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">
        This page sequence uses shared header and footer on all pages.
      </fo:block>
      <fo:block font-size="12pt" margin-top="10pt">
        The header and footer should appear consistently throughout.
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
  
  <!-- Page sequence 3: Body only (no headers/footers) -->
  <fo:page-sequence master-reference="body-only">
    <!-- No static-content blocks - only body -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">
        This page sequence has no headers or footers.
      </fo:block>
      <fo:block font-size="12pt" margin-top="10pt">
        Only body content should be processed.
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
  
  <!-- Page sequence 4: Using simple-page-master directly -->
  <fo:page-sequence master-reference="shared-page">
    <!-- Duplicate shared header/footer to test multiple sequences -->
    <fo:static-content flow-name="shared-header">
      <fo:block font-size="10pt" text-align="right">
        Duplicate Shared Header
      </fo:block>
    </fo:static-content>
    
    <fo:static-content flow-name="shared-footer">
      <fo:block font-size="8pt" text-align="center">
        Duplicate Shared Footer
      </fo:block>
    </fo:static-content>
    
    <!-- Main content -->
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">
        This tests direct simple-page-master reference (not through page-sequence-master).
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>



