<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <!-- Simple page masters for different scenarios -->
    
    <!-- First page with header and footer -->
    <fo:simple-page-master master-name="first" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-before region-name="first_before" extent="1in"/>
      <fo:region-after region-name="first_after" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Rest pages with different header and footer -->
    <fo:simple-page-master master-name="rest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-before region-name="rest_before" extent="1in"/>
      <fo:region-after region-name="rest_after" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Alternate page with shared footer -->
    <fo:simple-page-master master-name="alternate" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-before region-name="alternate_before" extent="1in"/>
      <fo:region-after region-name="shared_footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Simple page with shared footer -->
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="xsl-region-body" margin-top="1.5in" margin-bottom="1in"/>
      <fo:region-after region-name="shared_footer" extent="0.5in"/>
    </fo:simple-page-master>
    
    <!-- Page sequence masters -->
    
    <!-- Scenario 1: first-only header/footer -->
    <fo:page-sequence-master master-name="first-only-sequence">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
    
    <!-- Scenario 2: rest-only header/footer -->
    <fo:page-sequence-master master-name="rest-only-sequence">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
    
    <!-- Scenario 3: all pages (first + rest share same header/footer) -->
    <fo:page-sequence-master master-name="shared-sequence">
      <fo:single-page-master-reference master-reference="simple"/>
      <fo:repeatable-page-master-reference master-reference="alternate"/>
    </fo:page-sequence-master>
    
    <!-- Scenario 4: custom (footer on multiple different masters) -->
    <fo:page-sequence-master master-name="custom-sequence">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
    
    <!-- Scenario 5: simple sequence with no first page -->
    <fo:page-sequence-master master-name="simple-sequence">
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="first-only-sequence">
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Content</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>






