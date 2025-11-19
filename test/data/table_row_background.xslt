<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="TestPage" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="TestPage">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Table 1: Single row with background color -->
      <fo:table>
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row background-color="#DFDFDF" keep-with-next.within-page="always">
            <fo:table-cell>
              <fo:block>Cell 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Cell 2</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Table 2: Multiple rows with different backgrounds -->
      <fo:table>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="33%"/>
        <fo:table-column column-width="34%"/>
        <fo:table-body>
          <fo:table-row background-color="#FFCCCC">
            <fo:table-cell>
              <fo:block>Red Row - Cell 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Red Row - Cell 2</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Red Row - Cell 3</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row background-color="#CCFFCC">
            <fo:table-cell>
              <fo:block>Green Row - Cell 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Green Row - Cell 2</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Green Row - Cell 3</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row background-color="#CCCCFF">
            <fo:table-cell>
              <fo:block>Blue Row - Cell 1</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Blue Row - Cell 2</fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>Blue Row - Cell 3</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Table 3: Cell override - cell background should override row background -->
      <fo:table>
        <fo:table-column column-width="50%"/>
        <fo:table-column column-width="50%"/>
        <fo:table-body>
          <fo:table-row background-color="#EEEEEE">
            <fo:table-cell>
              <fo:block>Inherited background</fo:block>
            </fo:table-cell>
            <fo:table-cell background-color="#FFFF00">
              <fo:block>Yellow cell overrides row</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Table 4: Row without background -->
      <fo:table>
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>No background color</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Table 5: Mixed - some rows with background, some without -->
      <fo:table>
        <fo:table-column column-width="100%"/>
        <fo:table-body>
          <fo:table-row background-color="#DDDDDD">
            <fo:table-cell>
              <fo:block>Row with background</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Row without background</fo:block>
            </fo:table-cell>
          </fo:table-row>
          <fo:table-row background-color="#CCCCCC">
            <fo:table-cell>
              <fo:block>Another row with background</fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>

