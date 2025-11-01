<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="KeepPropertiesTest" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="KeepPropertiesTest">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 1: Block with keep-together.within-page="always" -->
      <!-- Expected PDFMake: { text: "...", unbreakable: true } -->
      <fo:block keep-together.within-page="always">
        This paragraph should not be split across two pages. If it doesn't fit on the current page, 
        it should move entirely to the next page.
      </fo:block>
      
      <!-- Example 2: Table with keep-together.within-page="always" -->
      <!-- Expected PDFMake: { table: {...}, unbreakable: true } -->
      <fo:table keep-together.within-page="always">
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Table Row 1 - This entire table should not split across pages</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Table Row 2 - All rows must stay together</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Table Row 3 - If table doesn't fit, move entire table to next page</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 3: Normal block without keep properties (baseline comparison) -->
      <fo:block>This is a normal block that can be split across pages.</fo:block>
      
      <!-- Example 4: Block with keep-with-previous.within-page="always" -->
      <!-- Expected PDFMake: { stack: [previousBlock, currentBlock], unbreakable: true } -->
      <fo:block font-weight="bold">Previous block that must stay with the next one</fo:block>
      <fo:block keep-with-previous.within-page="always">
        Current block - This block must not be separated from the previous block by a page break.
        Both blocks will be wrapped in a stack with unbreakable: true.
      </fo:block>
      
      <!-- Example 5: Table with keep-with-previous.within-page="always" -->
      <!-- Expected PDFMake: { stack: [previousBlock, tableObject], unbreakable: true } -->
      <fo:block font-weight="bold" margin-bottom="10pt">Text before table that must stay with table</fo:block>
      <fo:table keep-with-previous.within-page="always">
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>This table must not be separated from the text above.</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 6: Both keep-together and keep-with-previous on a table -->
      <!-- Expected PDFMake: { stack: [previousBlock, {table: {...}, unbreakable: true}], unbreakable: true } -->
      <fo:block font-weight="bold" margin-bottom="10pt">Text before complex table</fo:block>
      <fo:table keep-with-previous.within-page="always" keep-together.within-page="always">
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>This table should not split (keep-together) AND...</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>...should not be separated from the text above (keep-with-previous).</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 7: Multiple keep-with-previous in sequence -->
      <!-- Expected PDFMake: { stack: [block1, block2, block3], unbreakable: true } -->
      <fo:block font-weight="bold">Block 1 - Start of sequence</fo:block>
      <fo:block keep-with-previous.within-page="always">Block 2 - Must stay with Block 1</fo:block>
      <fo:block keep-with-previous.within-page="always">Block 3 - Must stay with Block 2 (and thus Block 1)</fo:block>
      
      <!-- Example 8: keep-with-previous on first element (edge case) -->
      <!-- Expected PDFMake: Just the block (no stack, since there's no previous element) -->
      <fo:block keep-with-previous.within-page="always" color="gray">
        This is the first block with keep-with-previous, but since there's no previous element,
        it should remain as a normal block (not wrapped in a stack).
      </fo:block>
      
      <!-- Example 9: Mixed scenario - multiple blocks and tables with various keep properties -->
      <fo:block font-size="14pt" font-weight="bold" margin-top="20pt" margin-bottom="10pt">
        Mixed Keep Properties Scenario
      </fo:block>
      
      <fo:block>Normal block that can break</fo:block>
      
      <fo:block keep-together.within-page="always">
        This block cannot be broken and will move to the next page if it doesn't fit.
      </fo:block>
      
      <fo:block>Another normal block</fo:block>
      
      <fo:block keep-with-previous.within-page="always">
        This block must stay with the previous normal block.
      </fo:block>
      
      <fo:table keep-together.within-page="always">
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell 1</fo:block>
            </fo:table-cell>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell 3</fo:block>
            </fo:table-cell>
            <fo:table-cell border="1pt solid black">
              <fo:block>Cell 4</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <fo:block keep-with-previous.within-page="always" keep-together.within-page="always">
        Final block with both keep properties - must stay with table above and cannot break.
      </fo:block>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

