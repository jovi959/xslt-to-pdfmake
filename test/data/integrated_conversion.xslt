<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="IntegratedTest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="IntegratedTest">
    <fo:flow flow-name="xsl-region-body">
      <!-- Simple paragraph -->
      <fo:block>This is a simple paragraph of text.</fo:block>
      
      <!-- Bold paragraph -->
      <fo:block font-weight="bold">This paragraph is bold.</fo:block>
      
      <!-- Styled paragraph -->
      <fo:block font-size="14pt" color="#0000FF">This is 14pt blue text.</fo:block>
      
      <!-- Nested blocks -->
      <fo:block font-weight="bold">
        This is bold parent text with 
        <fo:block font-style="italic">italic child text</fo:block>
        and more parent text.
      </fo:block>
      
      <!-- Complex nested structure -->
      <fo:block font-size="18pt" font-weight="bold">
        Heading Text
      </fo:block>
      
      <fo:block>
        Regular paragraph with 
        <fo:block font-weight="bold" font-size="12pt">
          bold inline section
        </fo:block>
        continuing.
      </fo:block>
      
      <!-- Multiple attributes -->
      <fo:block font-size="10pt" text-align="center" color="#FF0000">
        Centered red 10pt text
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

