<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format"
    xmlns:TMS="http://schemas.datacontract.org/2004/07/wcb.TMS.entity"
    xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
    <fo:layout-master-set>
        <fo:simple-page-master
            page-height="11in" page-width="8.5in" master-name="first"
            margin="0.25in 0.25in 0.25in 0.25in">
            <fo:region-body region-name="xsl-region-body" margin="1in 0in 1.2cm 0in"
                background-image="url(data:application/ibex-image, watermark)"
                background-position="center" />
            <fo:region-before region-name="first_before" extent="1in" />
            <fo:region-after extent="1cm"
                region-name="footer" />
        </fo:simple-page-master>
        <fo:simple-page-master page-height="11in"
            page-width="8.5in" master-name="rest" margin="0.25in 0.25in 0.25in 0.25in">
            <fo:region-body
                region-name="xsl-region-body" margin="1in 0in 1.2cm 0in"
                background-image="url(data:application/ibex-image, watermark)"
                background-position="center" />
            <fo:region-before region-name="rest_before" extent="1in" />
            <fo:region-after extent="1cm"
                region-name="footer" />
        </fo:simple-page-master>
        <fo:simple-page-master page-height="11in"
            page-width="8.5in" master-name="final" margin="2.125in 0.625in 0.625in 0.625in">
            <fo:region-body
                region-name="xsl-mailing-address"
                background-image="url(data:application/ibex-image, watermark)"
                background-position="left" />
        </fo:simple-page-master>
        <fo:page-sequence-master
            master-name="master-sequence">
            <fo:single-page-master-reference master-reference="first" />
            <fo:repeatable-page-master-reference master-reference="rest" />
        </fo:page-sequence-master>
        <fo:page-sequence-master master-name="final-sequence">
            <fo:single-page-master-reference
                master-reference="final" />
        </fo:page-sequence-master>
    </fo:layout-master-set>
    <fo:page-sequence
        master-reference="master-sequence">
        <fo:static-content flow-name="first_before">
            <fo:table width="100%">
                <fo:table-column column-width="proportional-column-width(50)" />
                <fo:table-column
                    column-width="proportional-column-width(50)" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell />
                        <fo:table-cell text-align="right">
                            <fo:block font-weight="bold" font-size="12pt"> INSPECTION REPORT </fo:block>
                            <fo:block font-weight="bold" font-size="10pt"> Prevention Services
                                Division </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
        </fo:static-content>
        <fo:static-content flow-name="rest_before">
            <fo:table width="100%">
                <fo:table-column column-width="proportional-column-width(50)" />
                <fo:table-column
                    column-width="proportional-column-width(50)" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell />
                        <fo:table-cell text-align="right">
                            <fo:block font-weight="bold" font-size="12pt"> INSPECTION REPORT </fo:block>
                            <fo:block font-weight="bold" font-size="10pt"> Prevention Services
                                Division </fo:block>
                            <fo:block font-weight="bold" font-size="12pt">2016165800005</fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
        </fo:static-content>
        <fo:static-content flow-name="footer">
            <fo:table width="95%">
                <fo:table-column column-width="50%" />
                <fo:table-column column-width="50%" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell>
                            <fo:block font-size="8pt"> IR 2016165800005 Printed: Jan 21, 2019 9:42</fo:block>
                        </fo:table-cell>
                        <fo:table-cell text-align="right">
                            <fo:block font-size="8pt"> Page <fo:page-number /> of <fo:page-number-citation
                                    ref-id="last-page" />
                            </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
        </fo:static-content>
        <fo:flow flow-name="xsl-region-body">
            <fo:block font-weight="bold" font-size="8pt" padding="10px 0px 10px 0px"> The <fo:inline
                    font-style="italic">Workers Compensation Act</fo:inline> requires that the
            employer must post a copy of this report in a conspicuous place at or near the workplace
            inspected for at least seven days, or until compliance has been achieved, whichever is
            the longer period. A copy of this report must also be given to the joint committee or
            worker health and safety representative, as applicable. </fo:block>
            <fo:block
                border-style="solid" border-color="#000000" border-width="0.5pt" font-weight="bold"
                font-size="12pt" text-align="center" padding="5px 0px 5px 0px"> Inspection Report
            #2016165800005
            </fo:block>
            <fo:table border-style="solid"
                border-color="#000000" border-width="0.5pt">
                <fo:table-column
                    column-width="33%" />
                <fo:table-column column-width="33%" />
                <fo:table-column column-width="34%" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center" border-style="solid" border-color="#000000"
                            border-width="0.5pt"
                            font-size="8pt" background-color="#DFDFDF">
                            <fo:block>Employer Names</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Jobsite Inspected</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Scope of Inspection</fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                    <fo:table-row>
                        <fo:table-cell padding="3px 3px 3px 3px"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt">
                            <fo:block white-space-collapse="false" white-space-treatment="preserve"
                                linefeed-treatment="preserve">1. ARCTIC CRANE SERVICE LTD. 2.
            CANADIAN NATURAL RESOURCES
                                LIMITED </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt">
                            <fo:block margin-left="5px">
                                <fo:block xmlns:fo="http://www.w3.org/1999/Format"
                                    linefeed-treatment="preserve">CNRL
                                    Location 14-36-81-20-W6 Fort Saint John BC</fo:block>
                            </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block>Incident Investigation </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
            <fo:table
                border-style="solid" border-color="#000000" border-width="0.5pt"
                padding="20px 0px 0px 0px">
                <fo:table-column column-width="25%" />
                <fo:table-column column-width="25%" />
                <fo:table-column
                    column-width="25%" />
                <fo:table-column column-width="25%" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Date of Initiating Inspection</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Date of This Inspection</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Delivery Date of This Report</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Delivery Method</fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                    <fo:table-row>
                        <fo:table-cell padding="3px 3px 3px 3px"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            text-align="center">
                            <fo:block>Jul 18, 2016</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block>Jul 18, 2016</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block>Jul 18, 2016</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block />
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
            <fo:block
                border-style="solid" border-color="black" border-width="0.5pt" line-height="0.5pt"
                width="100%"
                margin="20px 20px 20px 20px" padding="1px 0px 0px 0px" border-right-width="0pt"
                border-left-width="0pt" />
            <fo:block font-weight="bold" font-size="12pt"
                text-align="center"> THERE ARE <fo:inline
                    text-decoration="underline">ZERO (0)</fo:inline> ORDERS OR OTHER ITEMS
            OUTSTANDING </fo:block>--&gt; <fo:block font-weight="bold" text-align="center"
                font-size="14pt" border="2px solid black"
                padding="5px 20px 5px 20px" margin="10px 75px 0px 75px"
                linefeed-treatment="preserve"> ACTION MAY STILL
                BE NECESSARY TO ENSURE COMPLIANCE PLEASE READ FULL REPORT </fo:block>
            <fo:block
                border-style="solid" border-color="black" border-width="0.5pt" line-height="0.5pt"
                width="100%"
                margin="20px 20px 20px 20px" padding="1px 0px 0px 0px" border-right-width="0pt"
                border-left-width="0pt" />
            <fo:block font-weight="bold" font-size="12pt"
                text-align="center" text-decoration="underline"
                page-break-before="always"> INSPECTION NOTES </fo:block>
            <fo:block font-size="10pt"
                padding="10px 0px 10px 0px" white-space-collapse="false"
                white-space-treatment="preserve" linefeed-treatment="preserve" />
            <fo:block
                border-style="solid" border-color="black" border-width="0.5pt" line-height="0.5pt"
                width="100%"
                margin="20px 20px 20px 20px" padding="1px 0px 0px 0px" border-right-width="0pt"
                border-left-width="0pt" />
            <fo:table border-style="solid" border-color="#000000"
                border-width="0.5pt" width="100%"
                margin="20px 0px 0px 0px" page-break-before="always">
                <fo:table-column
                    column-width="proportional-column-width(20)" />
                <fo:table-column
                    column-width="proportional-column-width(40)" />
                <fo:table-column
                    column-width="proportional-column-width(20)" />
                <fo:table-column
                    column-width="proportional-column-width(20)" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell
                            padding="3px 3px 3px 3px" font-weight="bold" text-align="center"
                            border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Employer #</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Mailing Address</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Classification Unit #</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Operating Location</fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                    <fo:table-row>
                        <fo:table-cell padding="3px 3px 3px 3px"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            text-align="center">
                            <fo:block>797556 </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt">
                            <fo:block margin-left="5px">
                                <fo:block xmlns:fo="http://www.w3.org/1999/Format"
                                    linefeed-treatment="preserve">14915
                                    89 ST GRANDE PRAIRIE AB T8X 0J2</fo:block>
                            </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block>721014 </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block>001 </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                    <fo:table-row>
                        <fo:table-cell padding="3px 3px 3px 3px"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            text-align="center">
                            <fo:block>896938 </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt">
                            <fo:block margin-left="5px">
                                <fo:block xmlns:fo="http://www.w3.org/1999/Format"
                                    linefeed-treatment="preserve">UNIT
                                    2500 855 2 ST SW CALGARY AB T2P 4J8</fo:block>
                            </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block>713018 </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block>001 </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
            <fo:table
                width="100%" margin="20px 0px 0px 0px">
                <fo:table-column
                    column-width="proportional-column-width(65)" />
                <fo:table-column
                    column-width="proportional-column-width(35)" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell>
                            <fo:table border-style="solid" border-color="#000000"
                                border-width="0.5pt" width="100%">
                                <fo:table-column column-width="proportional-column-width(20)" />
                                <fo:table-column
                                    column-width="proportional-column-width(20)" />
                                <fo:table-column
                                    column-width="proportional-column-width(20)" />
                                <fo:table-column
                                    column-width="proportional-column-width(40)" />
                                <fo:table-body>
                                    <fo:table-row>
                                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                                            text-align="center"
                                            border-style="solid" border-color="#000000"
                                            border-width="0.5pt"
                                            font-size="8pt" background-color="#DFDFDF">
                                            <fo:block>Lab Samples Taken</fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                                            text-align="center" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt"
                                            background-color="#DFDFDF">
                                            <fo:block>Direct Readings</fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                                            text-align="center" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt"
                                            background-color="#DFDFDF">
                                            <fo:block>Results Presented</fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                                            text-align="center" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt"
                                            background-color="#DFDFDF">
                                            <fo:block>Sampling Inspection(s)</fo:block>
                                        </fo:table-cell>
                                    </fo:table-row>
                                    <fo:table-row>
                                        <fo:table-cell
                                            padding="3px 3px 3px 3px" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt" text-align="center">
                                            <fo:block> </fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px"
                                            border-style="solid"
                                            border-color="#000000" border-width="0.5pt"
                                            font-size="8pt"
                                            text-align="center">
                                            <fo:block> </fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px"
                                            border-style="solid"
                                            border-color="#000000" border-width="0.5pt"
                                            font-size="8pt"
                                            text-align="center">
                                            <fo:block> </fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px"
                                            border-style="solid"
                                            border-color="#000000" border-width="0.5pt"
                                            font-size="8pt"
                                            text-align="center">
                                            <fo:block> </fo:block>
                                        </fo:table-cell>
                                    </fo:table-row>
                                </fo:table-body>
                            </fo:table>
                        </fo:table-cell>
                        <fo:table-cell padding="0px 0px 0px 20px">
                            <fo:table border-style="solid" border-color="#000000"
                                border-width="0.5pt" width="100%">
                                <fo:table-column column-width="proportional-column-width(50)" />
                                <fo:table-column
                                    column-width="proportional-column-width(50)" />
                                <fo:table-body>
                                    <fo:table-row>
                                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                                            text-align="center"
                                            border-style="solid" border-color="#000000"
                                            border-width="0.5pt"
                                            font-size="8pt" background-color="#DFDFDF">
                                            <fo:block>Workers onsite during Inspection</fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                                            text-align="center" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt"
                                            background-color="#DFDFDF">
                                            <fo:block>Notice of Project Number</fo:block>
                                        </fo:table-cell>
                                    </fo:table-row>
                                    <fo:table-row>
                                        <fo:table-cell
                                            padding="3px 3px 3px 3px" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt" text-align="center">
                                            <fo:block> </fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px"
                                            border-style="solid"
                                            border-color="#000000" border-width="0.5pt"
                                            font-size="8pt"
                                            text-align="center">
                                            <fo:block> </fo:block>
                                        </fo:table-cell>
                                    </fo:table-row>
                                </fo:table-body>
                            </fo:table>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
            <fo:table
                width="100%" margin="20px 0px 0px 0px">
                <fo:table-column
                    column-width="proportional-column-width(25)" />
                <fo:table-column
                    column-width="proportional-column-width(25)" />
                <fo:table-column
                    column-width="proportional-column-width(25)" />
                <fo:table-column
                    column-width="proportional-column-width(25)" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell
                            padding="3px 3px 3px 3px" font-weight="bold" text-align="center"
                            border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Inspection Report Delivered To</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Employer Representative Present During Inspection</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Worker Representative Present During Inspection</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>Labour Organization &amp; Local</fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                    <fo:table-row>
                        <fo:table-cell padding="3px 3px 3px 3px"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            text-align="center">
                            <fo:block> </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block />
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block />
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block />
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
            <fo:table
                width="100%" margin="20px 0px 0px 0px">
                <fo:table-column
                    column-width="proportional-column-width(25)" />
                <fo:table-column
                    column-width="proportional-column-width(30)" />
                <fo:table-column
                    column-width="proportional-column-width(45)" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell
                            padding="3px 3px 3px 3px" font-weight="bold" text-align="center"
                            border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            background-color="#DFDFDF">
                            <fo:block>WorkSafeBC Officer Conducting Inspection</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                            text-align="center"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            background-color="#DFDFDF" number-columns-spanned="2">
                            <fo:block>Contact Details</fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                    <fo:table-row>
                        <fo:table-cell padding="3px 3px 3px 3px"
                            border-style="solid" border-color="#000000" border-width="0.5pt"
                            font-size="8pt"
                            text-align="center">
                            <fo:block>Egan Wuth</fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block> Phone: (250) 794-4682 </fo:block>
                        </fo:table-cell>
                        <fo:table-cell padding="3px 3px 3px 3px" border-style="solid"
                            border-color="#000000" border-width="0.5pt" font-size="8pt"
                            text-align="center">
                            <fo:block> Email: Egan.Wuth@worksafebc.com </fo:block>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
            <fo:table
                width="100%" margin="20px 0px 0px 0px">
                <fo:table-column
                    column-width="proportional-column-width(50)" />
                <fo:table-column
                    column-width="proportional-column-width(50)" />
                <fo:table-body>
                    <fo:table-row>
                        <fo:table-cell>
                            <fo:table width="100%">
                                <fo:table-column column-width="proportional-column-width(50)" />
                                <fo:table-column column-width="proportional-column-width(50)" />
                                <fo:table-body>
                                    <fo:table-row>
                                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                                            text-align="center" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt"
                                            background-color="#DFDFDF">
                                            <fo:block>Inspection Time*</fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px" font-weight="bold"
                                            text-align="center" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt"
                                            background-color="#DFDFDF">
                                            <fo:block>Travel Time*</fo:block>
                                        </fo:table-cell>
                                    </fo:table-row>
                                    <fo:table-row>
                                        <fo:table-cell
                                            padding="3px 3px 3px 3px" border-style="solid"
                                            border-color="#000000"
                                            border-width="0.5pt" font-size="8pt" text-align="center">
                                            <fo:block>3 hrs </fo:block>
                                        </fo:table-cell>
                                        <fo:table-cell padding="3px 3px 3px 3px"
                                            border-style="solid"
                                            border-color="#000000" border-width="0.5pt"
                                            font-size="8pt"
                                            text-align="center">
                                            <fo:block>0 hrs </fo:block>
                                        </fo:table-cell>
                                    </fo:table-row>
                                </fo:table-body>
                            </fo:table>
                        </fo:table-cell>
                    </fo:table-row>
                </fo:table-body>
            </fo:table>
            <fo:block
                font-size="10pt" margin="20px 0px 0px 0px"> *The time recorded above reflects the
            inspection time
                and travel time associated with this inspection report and includes time spent on
            pre and
                post-inspection activities. Additional time may be added for subsequent activity. </fo:block>
            <fo:block
                font-weight="bold" margin="20px 0px 0px 0px" border="3px double black"
                padding="5px 5px 5px 5px">
                <fo:block text-align="center" text-decoration="underline"> Request a Review </fo:block>
                <fo:block margin="10px 0px 0px 0px"> Any employer, worker, owner, supplier, union,
            or a member of a deceased worker's family directly affected may, within 45 calendar days
            of the delivery date of this report, in writing, request the Review Division of
            WorkSafeBC to conduct a review of an order, or the non-issuance of an order, by
            contacting the Review Division. Employers requiring assistance may contact the
            Employers' Advisers Office at 1-800-925-2233. <fo:block> </fo:block>
                    <fo:block>To submit
            a request online, visit
                        https://www.worksafebc.com/en/review-appeal/submit-request </fo:block>
                </fo:block>
            </fo:block>
            <fo:block
                font-size="10pt" font-weight="bold" margin="20px 0px 0px 0px"> WorkSafeBC values
            your feedback. To
                obtain that feedback, an external market research provider may be contacting you to
            complete a survey.
            </fo:block>
            <fo:block
                font-size="10pt" margin="20px 0px 0px 0px"> WorkSafeBC’s online services provide
            employers with
                tools to view information and to complete a variety of transactions with us in an
            easy, fast, and secure
                way. Through an online services account, you can view and download your inspection
            reports and
                compliance agreements, submit Employer Incident Investigation Reports, view your
            Health &amp; Safety
                Planning Tool Kit, and more. Visit worksafebc.com to log in or create an account. </fo:block>
            <fo:block
                id="last-page" />
        </fo:flow>
    </fo:page-sequence>
    <fo:page-sequence master-reference="final-sequence">
        <fo:flow flow-name="xsl-mailing-address">
            <fo:block page-break-before="always" />
            <fo:block font-size="10pt" top-margin="2.125in" margin-left="0.625in"
                page-break-before="always"> Address
                not found </fo:block>
        </fo:flow>
    </fo:page-sequence>
</fo:root>