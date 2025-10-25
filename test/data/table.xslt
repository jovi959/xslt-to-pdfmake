<?xml version="1.0" encoding="UTF-8"?>
<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
  <!-- Layout definitions -->
  <fo:layout-master-set>
    <fo:simple-page-master master-name="A4"
        page-width="8.27in" page-height="11.69in"
        margin="0.5in">
      <fo:region-body margin="1in"/>
    </fo:simple-page-master>
  </fo:layout-master-set>

  <!-- Page sequence -->
  <fo:page-sequence master-reference="A4">
    <fo:flow flow-name="xsl-region-body">

      <!-- Table -->
      <fo:table width="100%"
          table-layout="fixed"
          border-collapse="collapse"
          border="0.75pt solid #000000">

        <!-- Columns -->
        <fo:table-column column-width="proportional-column-width(25)"/>
        <fo:table-column column-width="proportional-column-width(25)"/>
        <fo:table-column column-width="proportional-column-width(20)"/>
        <fo:table-column column-width="proportional-column-width(30)"/>

        <!-- Table Body -->
        <fo:table-body>

          <!-- Header Row -->
          <fo:table-row background-color="#E0E0E0" font-weight="bold">
            <fo:table-cell border="0.5pt solid #000000" padding="4pt" text-align="center">
              <fo:block>Employee Name</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #000000" padding="4pt" text-align="center">
              <fo:block>Department</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #000000" padding="4pt" text-align="center">
              <fo:block>Score</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #000000" padding="4pt" text-align="center">
              <fo:block>Comments</fo:block>
            </fo:table-cell>
          </fo:table-row>

          <!-- Row 1 -->
          <fo:table-row>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block font-weight="bold">Jane Doe</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block>Finance</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt" text-align="center">
              <fo:block>92</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block>Excellent attention to detail.</fo:block>
            </fo:table-cell>
          </fo:table-row>

          <!-- Row 2 -->
          <fo:table-row background-color="#F9F9F9">
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block font-weight="bold">John Smith</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block>Operations</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt" text-align="center">
              <fo:block>85</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block>Strong performance under pressure.</fo:block>
            </fo:table-cell>
          </fo:table-row>

          <!-- Row 3 -->
          <fo:table-row>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block font-weight="bold">Lisa Chen</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block>IT</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt" text-align="center">
              <fo:block>88</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block>Great technical expertise.</fo:block>
            </fo:table-cell>
          </fo:table-row>

          <!-- Row 4 -->
          <fo:table-row background-color="#F9F9F9">
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block font-weight="bold">Samuel Grant</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block>Human Resources</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt" text-align="center">
              <fo:block>79</fo:block>
            </fo:table-cell>
            <fo:table-cell border="0.5pt solid #666666" padding="3pt">
              <fo:block>Needs improvement in report timelines.</fo:block>
            </fo:table-cell>
          </fo:table-row>

        </fo:table-body>
      </fo:table>

      <!-- Footer note -->
      <fo:block font-size="9pt" color="#444444" space-before="10pt" text-align="center">
        *Scores are calculated based on quarterly performance indicators.
      </fo:block>

    </fo:flow>
  </fo:page-sequence>
</fo:root>
