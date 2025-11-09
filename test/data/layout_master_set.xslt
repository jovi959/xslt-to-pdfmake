<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master page-height="11in" page-width="8.5in" master-name="first" margin="0.25in 0.25in 0.25in 0.25in">
      <fo:region-body region-name="xsl-region-body" margin="1in 0in 1.2cm 0in"/>
      <fo:region-before region-name="first_before" extent="1in"/>
      <fo:region-after extent="1cm" region-name="footer"/>
    </fo:simple-page-master>
    <fo:simple-page-master page-height="11in" page-width="8.5in" master-name="rest" margin="0.25in 0.25in 0.25in 0.25in">
      <fo:region-body region-name="xsl-region-body" margin="1in 0in 1.2cm 0in"/>
      <fo:region-before region-name="rest_before" extent="1in"/>
      <fo:region-after extent="1cm" region-name="footer"/>
    </fo:simple-page-master>
    <fo:page-sequence-master master-name="master-sequence">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="master-sequence">
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Sample content for testing layout master set parsing</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>


