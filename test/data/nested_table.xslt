<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      
      <!-- Example 1: Simple nested table -->
      <fo:table width="100%" border="1px solid black">
        <fo:table-column column-width="proportional-column-width(100)"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell border="1px solid black">
              <fo:block>Parent cell (with border)</fo:block>
              
              <fo:table width="100%" border="1px solid black">
                <fo:table-column column-width="proportional-column-width(50)"/>
                <fo:table-column column-width="proportional-column-width(50)"/>
                <fo:table-body>
                  <fo:table-row>
                    <fo:table-cell border="1px solid black"><fo:block>Child Cell 1</fo:block></fo:table-cell>
                    <fo:table-cell border="1px solid black"><fo:block>Child Cell 2</fo:block></fo:table-cell>
                  </fo:table-row>
                </fo:table-body>
              </fo:table>
              
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 2: Multiple nested tables in same cell -->
      <fo:table width="100%">
        <fo:table-column column-width="proportional-column-width(100)"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Cell with multiple nested tables:</fo:block>
              
              <fo:table width="100%">
                <fo:table-column column-width="proportional-column-width(100)"/>
                <fo:table-body>
                  <fo:table-row>
                    <fo:table-cell><fo:block>First nested table</fo:block></fo:table-cell>
                  </fo:table-row>
                </fo:table-body>
              </fo:table>
              
              <fo:table width="100%">
                <fo:table-column column-width="proportional-column-width(100)"/>
                <fo:table-body>
                  <fo:table-row>
                    <fo:table-cell><fo:block>Second nested table</fo:block></fo:table-cell>
                  </fo:table-row>
                </fo:table-body>
              </fo:table>
              
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
      <!-- Example 3: Deeply nested tables (3 levels) -->
      <fo:table width="100%">
        <fo:table-column column-width="proportional-column-width(100)"/>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell>
              <fo:block>Level 1</fo:block>
              
              <fo:table width="100%">
                <fo:table-column column-width="proportional-column-width(100)"/>
                <fo:table-body>
                  <fo:table-row>
                    <fo:table-cell>
                      <fo:block>Level 2</fo:block>
                      
                      <fo:table width="100%">
                        <fo:table-column column-width="proportional-column-width(100)"/>
                        <fo:table-body>
                          <fo:table-row>
                            <fo:table-cell><fo:block>Level 3</fo:block></fo:table-cell>
                          </fo:table-row>
                        </fo:table-body>
                      </fo:table>
                      
                    </fo:table-cell>
                  </fo:table-row>
                </fo:table-body>
              </fo:table>
              
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
      
    </fo:flow>
  </fo:page-sequence>
</fo:root>



