<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <!-- Layout definitions -->
  <fo:layout-master-set>
    <fo:simple-page-master master-name="InheritancePage" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>

  <!-- Page sequence with inheritance examples -->
  <fo:page-sequence master-reference="InheritancePage">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 1: Font-family inheritance -->
      <fo:block font-family="Roboto" color="#0066CC">
        Parent block with Roboto font and blue color
        <fo:block>
          Child inherits Roboto and blue
        </fo:block>
      </fo:block>

      <!-- Example 2: Multiple font attributes -->
      <fo:block font-family="Arial" font-size="14pt" font-weight="bold" color="#FF0000">
        Parent: Arial, 14pt, bold, red
        <fo:block font-size="10pt">
          Child: Inherits Arial, bold, red but overrides to 10pt
        </fo:block>
      </fo:block>

      <!-- Example 3: Text styling inheritance -->
      <fo:block text-align="center" text-decoration="underline">
        Centered and underlined parent
        <fo:block>
          Child inherits centering and underline
        </fo:block>
      </fo:block>

      <!-- Example 4: Background color inheritance -->
      <fo:block background-color="#FFFF00" color="#000000">
        Parent with yellow background
        <fo:block>
          Child inherits yellow background
        </fo:block>
      </fo:block>

      <!-- Example 5: Nested inheritance (3 levels) -->
      <fo:block font-family="Times New Roman" font-size="16pt" color="#006600">
        Level 1: Times New Roman, 16pt, green
        <fo:block font-weight="bold">
          Level 2: Inherits font and color, adds bold
          <fo:block font-style="italic">
            Level 3: Inherits all, adds italic
          </fo:block>
        </fo:block>
      </fo:block>

      <!-- Example 6: Inline inheritance -->
      <fo:block font-family="Courier" font-size="12pt" color="#CC0066">
        Block with Courier font and magenta color
        <fo:inline font-weight="bold">
          Bold inline inherits Courier and magenta
        </fo:inline>
        continuing text
      </fo:block>

    </fo:flow>
  </fo:page-sequence>
</fo:root>

