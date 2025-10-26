<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="first"
        page-width="8.5in" page-height="11in"
        margin-top="1in" margin-bottom="1in"
        margin-left="1in" margin-right="1in">
      <fo:region-body region-name="body-first"/>
    </fo:simple-page-master>

    <fo:simple-page-master master-name="rest"
        page-width="8.5in" page-height="11in"
        margin-top="0.5in" margin-bottom="0.5in"
        margin-left="0.5in" margin-right="0.5in">
      <fo:region-body region-name="body-rest"/>
    </fo:simple-page-master>

    <fo:page-sequence-master master-name="sequence">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>

  <fo:page-sequence master-reference="sequence">
    <fo:flow flow-name="body-first">
      <fo:block>This is page one. It has 1-inch margins.</fo:block>
      <fo:block>This is page two (and any after). They have 0.5-inch margins.</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

