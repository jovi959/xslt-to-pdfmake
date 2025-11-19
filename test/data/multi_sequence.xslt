<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <!-- Simple page masters -->
    <fo:simple-page-master master-name="first-page" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body region-name="first-body" margin-top="1.5in"/>
      <fo:region-before region-name="first-header" extent="1in"/>
      <fo:region-after region-name="first-footer" extent="0.5in"/>
    </fo:simple-page-master>

    <fo:simple-page-master master-name="second-page" page-width="11in" page-height="8.5in" margin="0.5in">
      <fo:region-body region-name="second-body" margin-top="1in"/>
      <fo:region-before region-name="second-header" extent="0.75in"/>
    </fo:simple-page-master>

    <!-- Page Sequence Masters -->
    <fo:page-sequence-master master-name="seq1">
      <fo:single-page-master-reference master-reference="first-page"/>
    </fo:page-sequence-master>

    <fo:page-sequence-master master-name="seq2">
      <fo:single-page-master-reference master-reference="second-page"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>

  <!-- First Page Sequence -->
  <fo:page-sequence master-reference="seq1">
    <fo:static-content flow-name="first-header">
      <fo:block>First Sequence Header</fo:block>
    </fo:static-content>
    <fo:static-content flow-name="first-footer">
      <fo:block>First Sequence Footer</fo:block>
    </fo:static-content>
    <fo:flow flow-name="first-body">
      <fo:block>Content for first sequence.</fo:block>
    </fo:flow>
  </fo:page-sequence>

  <!-- Second Page Sequence -->
  <fo:page-sequence master-reference="seq2">
    <fo:static-content flow-name="second-header">
      <fo:block>Second Sequence Header</fo:block>
    </fo:static-content>
    <fo:flow flow-name="second-body">
      <fo:block>Content for second sequence.</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>