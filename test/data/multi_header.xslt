<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="first" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-before region-name="first-header" extent="0.5in"/>
      <fo:region-body region-name="first-body" margin-top="0.5in"/>
    </fo:simple-page-master>
    <fo:simple-page-master master-name="rest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-before region-name="rest-header" extent="0.5in"/>
      <fo:region-body region-name="rest-body" margin-top="0.5in"/>
    </fo:simple-page-master>
    <fo:page-sequence-master master-name="multi-seq">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>
  <fo:page-sequence master-reference="multi-seq">
    <fo:static-content flow-name="first-header">
      <fo:block>FIRST PAGE HEADER</fo:block>
    </fo:static-content>
    <fo:static-content flow-name="rest-header">
      <fo:block>REST PAGE HEADER</fo:block>
    </fo:static-content>
    <fo:flow flow-name="first-body">
      <fo:block>Content page 1</fo:block>
      <fo:block break-before="page">Content page 2</fo:block>
      <fo:block break-before="page">Content page 3</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

