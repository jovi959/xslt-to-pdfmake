<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4" page-width="8.5in" page-height="11in" margin="1in">
      <fo:region-body margin="0.5in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>
  
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">
      <!-- Test 1: Inline and text inside block, followed by list -->
      <fo:block>
        <fo:inline font-weight="bold">Washroom facilities at construction sites</fo:inline>
        <fo:block> </fo:block>
        Effective October 1, 2024, changes were made to the Occupational Health and Safety Regulation (OHS) to address flush toilets on specified construction sites where there are 25 or more workers who will be present at any time.
        
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label end-indent="label-end()">
              <fo:block>•</fo:block>
            </fo:list-item-label>
            <fo:list-item-body start-indent="body-start()">
              <fo:block>determine if and when it is practicable to install flush toilets that are readily available and if it is not practicable to install flush toilets, employer must ensure there is a sufficient number of other type(s) of non flush toilets that are readily available,
                <fo:block> </fo:block>
                <fo:inline font-style="italic">Note: In determining what would be practicable in the circumstances, the employer should consider all  relevant factors and strike a balance between what is theoretically possible and what is reasonable in the circumstances.
                  <fo:block> </fo:block>
                </fo:inline>
              </fo:block>
            </fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
      
      <!-- Test 2: Simple nested list -->
      <fo:block>
        Simple text before list
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
            <fo:list-item-body><fo:block>Item 1</fo:block></fo:list-item-body>
          </fo:list-item>
          <fo:list-item>
            <fo:list-item-label><fo:block>•</fo:block></fo:list-item-label>
            <fo:list-item-body><fo:block>Item 2</fo:block></fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
      
      <!-- Test 3: Block with just a list (no text before) -->
      <fo:block>
        <fo:list-block>
          <fo:list-item>
            <fo:list-item-label><fo:block>1.</fo:block></fo:list-item-label>
            <fo:list-item-body><fo:block>First</fo:block></fo:list-item-body>
          </fo:list-item>
          <fo:list-item>
            <fo:list-item-label><fo:block>2.</fo:block></fo:list-item-label>
            <fo:list-item-body><fo:block>Second</fo:block></fo:list-item-body>
          </fo:list-item>
        </fo:list-block>
      </fo:block>
    </fo:flow>
  </fo:page-sequence>
</fo:root>



