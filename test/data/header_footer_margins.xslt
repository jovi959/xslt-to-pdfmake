<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <!-- First page with specific header/footer margins -->
    <fo:simple-page-master master-name="first" page-width="8.5in" page-height="11in" 
                          margin-top="0.25in" margin-bottom="0.25in" 
                          margin-left="0.25in" margin-right="0.25in">
      <fo:region-before region-name="first_before" extent="1in" 
                       margin-top="0.25in" margin-bottom="1in"
                       margin-left="0.25in" margin-right="0.25in"/>
      <fo:region-body region-name="xsl-region-body" 
                     margin-top="0.25in" margin-bottom="0in"
                     margin-left="0.25in" margin-right="0in"/>
      <fo:region-after region-name="footer" extent="0.39375in"
                      margin-top="0.47222in" margin-bottom="0.25in"
                      margin-left="0.25in" margin-right="0.25in"/>
    </fo:simple-page-master>
    
    <!-- Rest pages with different header/footer margins -->
    <fo:simple-page-master master-name="rest" page-width="8.5in" page-height="11in"
                          margin-top="0.25in" margin-bottom="0.25in"
                          margin-left="0.25in" margin-right="0.25in">
      <fo:region-before region-name="rest_before" extent="1in"
                       margin-top="0.25in" margin-bottom="1in"
                       margin-left="0.25in" margin-right="0.25in"/>
      <fo:region-body region-name="xsl-region-body"
                     margin-top="0.25in" margin-bottom="0in"
                     margin-left="0.25in" margin-right="0in"/>
      <fo:region-after region-name="footer" extent="0.39375in"
                      margin-top="0.47222in" margin-bottom="0.25in"
                      margin-left="0.25in" margin-right="0.25in"/>
    </fo:simple-page-master>
    
    <fo:page-sequence-master master-name="margin-test-sequence">
      <fo:single-page-master-reference master-reference="first"/>
      <fo:repeatable-page-master-reference master-reference="rest"/>
    </fo:page-sequence-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="margin-test-sequence">
    <fo:static-content flow-name="first_before">
      <fo:block font-size="14pt" font-weight="bold" text-align="center">
        FIRST PAGE HEADER - Check margins: [18, 18, 18, 72]
      </fo:block>
    </fo:static-content>
    
    <fo:static-content flow-name="rest_before">
      <fo:block font-size="14pt" font-weight="bold" text-align="center">
        REST PAGE HEADER - Check margins: [18, 18, 18, 72]
      </fo:block>
    </fo:static-content>
    
    <fo:static-content flow-name="footer">
      <fo:block font-size="10pt" text-align="center">
        FOOTER - Check margins: [18, 34.02, 18, 18]
      </fo:block>
    </fo:static-content>
    
    <fo:flow flow-name="xsl-region-body">
      <fo:block>Page 1 content - Testing header/footer margins</fo:block>
      <fo:block break-before="page">Page 2 content - Testing header/footer margins</fo:block>
      <fo:block break-before="page">Page 3 content - Testing header/footer margins</fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

