<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="BlockTest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="BlockTest">
    <fo:flow flow-name="xsl-region-body">
      <!-- Simple block -->
      <fo:block id="simple">Simple text</fo:block>
      
      <!-- Block with bold -->
      <fo:block id="bold" font-weight="bold">Bold text</fo:block>
      
      <!-- Block with italic -->
      <fo:block id="italic" font-style="italic">Italic text</fo:block>
      
      <!-- Block with underline -->
      <fo:block id="underline" text-decoration="underline">Underlined text</fo:block>
      
      <!-- Block with font size -->
      <fo:block id="fontSize" font-size="14pt">Sized text</fo:block>
      
      <!-- Block with color -->
      <fo:block id="color" color="#FF0000">Red text</fo:block>
      
      <!-- Block with alignment -->
      <fo:block id="alignment" text-align="center">Centered text</fo:block>
      
      <!-- Block with multiple attributes -->
      <fo:block id="multiple" font-weight="bold" font-size="16pt" color="#0000FF">Bold blue 16pt text</fo:block>
      
      <!-- Nested blocks - Simple nesting -->
      <fo:block id="nested-simple" font-weight="bold">
        Parent Text
        <fo:block font-size="10pt">Child Text</fo:block>
      </fo:block>
      
      <!-- Nested blocks - Deep nesting (3 levels) -->
      <fo:block id="nested-deep" font-weight="bold">
        Parent Text
        <fo:block font-size="10pt">
          Child Text
          <fo:block>Grandchild Text</fo:block>
        </fo:block>
      </fo:block>
      
      <!-- Nested blocks - Multiple children -->
      <fo:block id="nested-multiple" font-weight="bold">
        Parent
        <fo:block font-size="10pt">First Child</fo:block>
        <fo:block font-style="italic">Second Child</fo:block>
        <fo:block color="#00FF00">Third Child</fo:block>
      </fo:block>
      
      <!-- Nested blocks with mixed content -->
      <fo:block id="nested-mixed" font-weight="bold">
        Before child
        <fo:block font-size="10pt">Child content</fo:block>
        After child
      </fo:block>
      
      <!-- Empty block -->
      <fo:block id="empty"></fo:block>
      
      <!-- Block with border -->
      <fo:block id="bordered" border-style="solid" border-color="#000000" border-width="0.5pt" font-weight="bold" font-size="12pt" text-align="center" padding="5px 0px 5px 0px" margin="10px 0px 10px 0px">
        Inspection Report #202358107988A
      </fo:block>
      
      <!-- Block with border only (no padding/margin) -->
      <fo:block id="border-simple" border-style="solid" border-width="1pt" border-color="#FF0000">
        Simple bordered text
      </fo:block>
      
      <!-- Block with padding only (should create table) -->
      <fo:block id="padding-only" padding="10px">
        Text with padding
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>

