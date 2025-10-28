<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="TableTest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="TableTest">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Simple 2x2 Table -->
      <fo:block font-weight="bold" margin="10px 0px 5px 0px">Simple Table:</fo:block>
      <fo:table>
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Cell 1-1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Cell 1-2</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Cell 2-1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Cell 2-2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Table with Borders (User Example 1) -->
      <fo:block font-weight="bold" margin="20px 0px 5px 0px">Table with Row 2 Bordered:</fo:block>
      <fo:table>
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Table cell</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Table cell</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="solid">
              <fo:block>Table cell with more text in it</fo:block>
            </fo:table-cell>
            <fo:table-cell border="solid">
              <fo:block>Table cell</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Table cell</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Table cell</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Table with 3 Columns -->
      <fo:block font-weight="bold" margin="20px 0px 5px 0px">Three Column Table:</fo:block>
      <fo:table>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="34%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="solid">
              <fo:block>Header 1</fo:block>
            </fo:table-cell>
            <fo:table-cell border="solid">
              <fo:block>Header 2</fo:block>
            </fo:table-cell>
            <fo:table-cell border="solid">
              <fo:block>Header 3</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Data 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Data 2</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Data 3</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Table with Styled Content -->
      <fo:block font-weight="bold" margin="20px 0px 5px 0px">Table with Styled Content:</fo:block>
      <fo:table>
        <fo:table-column column-width="40%"/>
        <fo:table-column column-width="60%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="solid">
              <fo:block font-weight="bold" background-color="#CCCCCC">Property</fo:block>
            </fo:table-cell>
            <fo:table-cell border="solid">
              <fo:block font-weight="bold" background-color="#CCCCCC">Value</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Name</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block color="blue">John Doe</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Email</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block font-style="italic">john.doe@example.com</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>
