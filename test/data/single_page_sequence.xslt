<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">

  <fo:layout-master-set>
    <!-- A single page master with 1-inch margins -->
    <fo:simple-page-master
        master-name="single"
        page-width="8.5in"
        page-height="11in"
        margin-top="1in"
        margin-bottom="1in"
        margin-left="1in"
        margin-right="1in">
      <fo:region-body region-name="body-single"/>
    </fo:simple-page-master>
  </fo:layout-master-set>

  <!-- Only one page-sequence -->
  <fo:page-sequence master-reference="single">
    <fo:flow flow-name="body-single">
      <fo:block>This is the first (and only) page-sequence.</fo:block>
      <fo:block>All pages share the same 1-inch margins.</fo:block>
      <fo:block>
        You can still create page breaks within this flow using
        <fo:block page-break-before="always"/> if you want multiple pages
        but with the same layout.
      </fo:block>
    </fo:flow>
  </fo:page-sequence>

</fo:root>

