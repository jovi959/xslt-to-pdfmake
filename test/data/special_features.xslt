<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="SpecialTest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="SpecialTest">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Self-closing block examples (converts to newline) -->
      <fo:block font-size="12pt" font-weight="bold">Address with Line Breaks:</fo:block>
      <fo:block font-size="10pt">
6951 Westminster Highway, Richmond, BC<fo:block/>
Mailing Address: PO Box 5350 Stn Terminal, Vancouver BC, V6B 5L5<fo:block/>
Telephone 604 276-3100 Toll Free 1-888-621-7233
      </fo:block>
      
      <!-- Page break example -->
      <fo:block page-break-before="always" font-size="14pt" font-weight="bold">
NEW PAGE - INSPECTION NOTES
      </fo:block>
      
      <fo:block font-size="10pt">
This content appears on a new page due to page-break-before="always"
      </fo:block>
      
      <!-- Linefeed treatment preserve example -->
      <fo:block font-size="12pt" font-weight="bold" margin="10px 0px 5px 0px">
Preserved Formatting Example:
      </fo:block>
      
      <fo:block linefeed-treatment="preserve" font-size="8pt" font-family="Courier">
John Smith
123 Main Street
Anytown, USA 12345

Report Summary:
  - Section 1: Complete
  - Section 2: In Progress
  - Section 3: Pending
      </fo:block>
      
      <!-- ASCII art with preserve -->
      <fo:block linefeed-treatment="preserve" font-size="8pt" font-family="Courier" margin="10px 0px 0px 0px">
+------------------+
|   IMPORTANT      |
+------------------+

  Code Example:
  var x = 10;
  console.log(x);
      </fo:block>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

