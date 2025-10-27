<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="InlineTest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="InlineTest">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Simple inline with color -->
      <fo:block id="simple-color">
        This sentence contains <fo:inline color="red">red text</fo:inline>.
      </fo:block>
      
      <!-- Multiple inlines -->
      <fo:block id="multiple-inlines">
        This sentence contains <fo:inline color="red">red text</fo:inline>
        and <fo:inline font-style="italic">italic text</fo:inline>.
      </fo:block>
      
      <!-- Inline with bold -->
      <fo:block id="inline-bold">
        Text with <fo:inline font-weight="bold">bold text</fo:inline>.
      </fo:block>
      
      <!-- Inline with font-size -->
      <fo:block id="inline-size">
        Text with <fo:inline font-size="18pt">large text</fo:inline>.
      </fo:block>
      
      <!-- Inline with multiple attributes -->
      <fo:block id="inline-multi-attr">
        Text with <fo:inline font-weight="bold" font-style="italic" color="#0000FF">styled text</fo:inline>.
      </fo:block>
      
      <!-- Nested inlines -->
      <fo:block id="nested-inline">
        Text with <fo:inline font-weight="bold">bold <fo:inline color="red">and red</fo:inline> text</fo:inline>.
      </fo:block>
      
      <!-- Inline within styled block -->
      <fo:block id="inline-in-styled-block" font-size="12pt">
        Block text with <fo:inline color="red">red inline</fo:inline>.
      </fo:block>
      
      <!-- Consecutive inlines -->
      <fo:block id="consecutive-inlines">
        <fo:inline color="red">Red</fo:inline><fo:inline color="blue">Blue</fo:inline><fo:inline color="green">Green</fo:inline>
      </fo:block>
      
      <!-- Inline with underline -->
      <fo:block id="inline-underline">
        Text with <fo:inline text-decoration="underline">underlined text</fo:inline>.
      </fo:block>
      
      <!-- Complex mixed content -->
      <fo:block id="complex-mixed">
        Start <fo:inline color="red">red</fo:inline> middle <fo:inline font-weight="bold">bold</fo:inline> end.
      </fo:block>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

