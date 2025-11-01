<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 1: Simple table with single header row -->
      <fo:block>Example 1: Simple Header</fo:block>
      <fo:table id="table-simple-header">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Header 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Header 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Data 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Data 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 2: Table with spanned header cell -->
      <fo:block>Example 2: Spanned Header</fo:block>
      <fo:table id="table-spanned-header">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell number-columns-spanned="2" text-align="center">
              <fo:block>Spanned Header</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Data 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Data 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 3: Table with multiple header rows -->
      <fo:block>Example 3: Multiple Header Rows</fo:block>
      <fo:table id="table-multiple-headers">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Main Header 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Main Header 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Sub Header 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Sub Header 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Data 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Data 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 4: Table with styled header cells -->
      <fo:block>Example 4: Styled Headers</fo:block>
      <fo:table id="table-styled-header">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-header>
          <fo:table-row>
            <fo:table-cell background-color="#cccccc" text-align="center">
              <fo:block font-weight="bold">Bold Header 1</fo:block>
            </fo:table-cell>
            <fo:table-cell background-color="#cccccc" text-align="center">
              <fo:block font-weight="bold">Bold Header 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-header>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Data 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Data 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 5: Table without header (should not have headerRows property) -->
      <fo:block>Example 5: No Header</fo:block>
      <fo:table id="table-no-header">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Data 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Data 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 6: Table with header INSIDE table-body (real-world pattern) -->
      <fo:block>Example 6: Header Inside Body</fo:block>
      <fo:table id="table-header-in-body">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-header>
            <fo:table-row>
              <fo:table-cell background-color="#DFDFDF">
                <fo:block font-weight="bold">Nested Header 1</fo:block>
              </fo:table-cell>
              <fo:table-cell background-color="#DFDFDF">
                <fo:block font-weight="bold">Nested Header 2</fo:block>
              </fo:table-cell>
            </fo:table-row>
          </fo:table-header>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Body Data 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Body Data 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

