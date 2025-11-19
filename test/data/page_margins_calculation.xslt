<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <!-- First page master: Simplified header, original footer -->
    <!-- pageMargin: [18, 18, 18, 18] -->
    <!-- header: height=72 -->
    <!-- body: margins=[18, 0, 18, 0] (region-body margins) -->
    <!-- footer: height=28.35, gap=34.02 -->
    <!-- Expected calculatedPageMargins: [36, 72, 36, 80.37] -->
    <!-- Calculation: left=18+18=36, top=72 (header height), right=18+18=36, bottom=18+28.35+34.02=80.37 -->
    <fo:simple-page-master master-name="first" page-width="8.5in" page-height="11in" margin="0.25in">
      <fo:region-before region-name="first-header" extent="1in" margin-left="0.25in" margin-top="0.25in" margin-right="0.25in" margin-bottom="0.5in"/>
      <fo:region-body region-name="xsl-region-body" margin="0in 0.25in 0in 0.25in"/>
      <fo:region-after region-name="first-footer" extent="0.394in" margin-left="0.25in" margin-top="0.473in" margin-right="0.25in" margin-bottom="0.25in"/>
    </fo:simple-page-master>

    <!-- Rest page master: identical to first (validates consistent calculation) -->
    <!-- Expected calculatedPageMargins: [36, 72, 36, 80.37] -->
    <fo:simple-page-master master-name="rest" page-width="8.5in" page-height="11in" margin="0.25in">
      <fo:region-before region-name="rest-header" extent="1in" margin-left="0.25in" margin-top="0.25in" margin-right="0.25in" margin-bottom="0.5in"/>
      <fo:region-body region-name="xsl-region-body" margin="0in 0.25in 0in 0.25in"/>
      <fo:region-after region-name="rest-footer" extent="0.394in" margin-left="0.25in" margin-top="0.473in" margin-right="0.25in" margin-bottom="0.25in"/>
    </fo:simple-page-master>

    <!-- Simple page master: no header (extent 0), footer 28.35pt -->
    <!-- pageMargin: [18, 18, 18, 18], body: [0, 0, 0, 0], footer: height=28.35, gap=34.02 -->
    <!-- Expected calculatedPageMargins: [18, 0, 18, 80.37] -->
    <!-- Calculation: left=18+0=18, top=0 (no header), right=18+0=18, bottom=18+28.35+34.02=80.37 -->
    <fo:simple-page-master master-name="simple" page-width="8.5in" page-height="11in" margin="0.25in">
      <fo:region-before region-name="simple-header" extent="0in" margin-left="0.25in" margin-top="0.25in" margin-right="0.25in" margin-bottom="0in"/>
      <fo:region-body region-name="xsl-region-body" margin="0in 0in 0in 0in"/>
      <fo:region-after region-name="simple-footer" extent="0.394in" margin-left="0.25in" margin-top="0.473in" margin-right="0.25in" margin-bottom="0.25in"/>
    </fo:simple-page-master>

    <!-- Complex page master: large header, large footer -->
    <!-- pageMargin: [20, 20, 20, 20], header: height=100, body: [0, 0, 0, 0], footer: height=50, gap=20 -->
    <!-- Expected calculatedPageMargins: [20, 100, 20, 90] -->
    <!-- Calculation: left=20+0=20, top=100 (header height), right=20+0=20, bottom=20+50+20=90 -->
    <fo:simple-page-master master-name="complex" page-width="8.5in" page-height="11in" margin="0.278in">
      <fo:region-before region-name="complex-header" extent="1.389in" margin-left="0.278in" margin-top="0.278in" margin-right="0.278in" margin-bottom="0.278in"/>
      <fo:region-body region-name="xsl-region-body" margin="0in 0in 0in 0in"/>
      <fo:region-after region-name="complex-footer" extent="0.694in" margin-left="0.278in" margin-top="0.278in" margin-right="0.278in" margin-bottom="0.278in"/>
    </fo:simple-page-master>

    <!-- Page sequence master for first -->
    <fo:page-sequence-master master-name="first-sequence">
      <fo:single-page-master-reference master-reference="first"/>
    </fo:page-sequence-master>

    <!-- Page sequence master for rest -->
    <fo:page-sequence-master master-name="rest-sequence">
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>

    <!-- Page sequence master for simple -->
    <fo:page-sequence-master master-name="simple-sequence">
      <fo:single-page-master-reference master-reference="simple"/>
    </fo:page-sequence-master>

    <!-- Page sequence master for complex -->
    <fo:page-sequence-master master-name="complex-sequence">
      <fo:single-page-master-reference master-reference="complex"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>

  <!-- First page sequence -->
  <fo:page-sequence master-reference="first-sequence">
    <fo:static-content flow-name="first-header">
      <fo:block font-size="10pt" text-align="center">First Page Header</fo:block>
    </fo:static-content>
    <fo:static-content flow-name="first-footer">
      <fo:block font-size="8pt" text-align="center">First Page Footer</fo:block>
    </fo:static-content>
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">First page content with header 72pt and footer 28.35pt.</fo:block>
      <fo:block font-size="12pt">Expected margins: [18, 90, 18, 46.35]</fo:block>
    </fo:flow>
  </fo:page-sequence>

  <!-- Rest page sequence -->
  <fo:page-sequence master-reference="rest-sequence">
    <fo:static-content flow-name="rest-header">
      <fo:block font-size="10pt" text-align="center">Rest Page Header</fo:block>
    </fo:static-content>
    <fo:static-content flow-name="rest-footer">
      <fo:block font-size="8pt" text-align="center">Rest Page Footer</fo:block>
    </fo:static-content>
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">Rest page content (identical to first).</fo:block>
      <fo:block font-size="12pt">Expected margins: [18, 90, 18, 46.35]</fo:block>
    </fo:flow>
  </fo:page-sequence>

  <!-- Simple page sequence (no header) -->
  <fo:page-sequence master-reference="simple-sequence">
    <fo:static-content flow-name="simple-header">
      <fo:block font-size="10pt" text-align="center">This header should not display (extent 0)</fo:block>
    </fo:static-content>
    <fo:static-content flow-name="simple-footer">
      <fo:block font-size="8pt" text-align="center">Simple Footer</fo:block>
    </fo:static-content>
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">Simple page with no header (extent 0), wider body margins.</fo:block>
      <fo:block font-size="12pt">Expected margins: [40, 18, 40, 46.35]</fo:block>
    </fo:flow>
  </fo:page-sequence>

  <!-- Complex page sequence (large header/footer) -->
  <fo:page-sequence master-reference="complex-sequence">
    <fo:static-content flow-name="complex-header">
      <fo:block font-size="14pt" text-align="center" font-weight="bold">Complex Large Header</fo:block>
      <fo:block font-size="10pt" text-align="center">With more content</fo:block>
    </fo:static-content>
    <fo:static-content flow-name="complex-footer">
      <fo:block font-size="10pt" text-align="center">Complex Large Footer</fo:block>
    </fo:static-content>
    <fo:flow flow-name="xsl-region-body">
      <fo:block font-size="12pt">Complex page with large header (100pt) and footer (50pt).</fo:block>
      <fo:block font-size="12pt">Expected margins: [25, 120, 25, 70]</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>


