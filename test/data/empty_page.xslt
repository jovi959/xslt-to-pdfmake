<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <!-- Layout definitions for an empty page -->
  <fo:layout-master-set>
    <fo:simple-page-master master-name="EmptyPage"
        page-width="8.5in" page-height="11in"
        margin="0.5in 0.75in 1in 0.5in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>

  <!-- Page sequence -->
  <fo:page-sequence master-reference="EmptyPage">
    <fo:flow flow-name="xsl-region-body">
      <!-- Empty content -->
    </fo:flow>
  </fo:page-sequence>
</fo:root>

