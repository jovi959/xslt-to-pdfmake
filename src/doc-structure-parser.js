/**
 * Document Structure Parser Module
 * Parses XSL-FO layout-master-set to generate document structure variables
 * for PDFMake template rendering (headers, footers, page masters)
 */

/**
 * Main function to parse document structure from XSL-FO
 * @param {string} xslfoXml - The XSL-FO XML string
 * @param {Object} converter - Instance of XSLToPDFMakeConverter for utility methods
 * @returns {Object} Object containing { simplePageMasters: {}, sequences: {} }
 */
function parseDocumentStructure(xslfoXml, converter) {
    if (!xslfoXml || !converter) {
        return { simplePageMasters: {}, sequences: {} };
    }

    // Parse XML
    let doc;
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        doc = parser.parseFromString(xslfoXml, 'text/xml');
    } else if (typeof require !== 'undefined') {
        // Node.js environment
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM(xslfoXml, { contentType: 'text/xml' });
        doc = dom.window.document;
    }

    const result = {
        simplePageMasters: {},
        sequences: {}
    };

    // Find layout-master-set (handle both namespaced and non-namespaced)
    let layoutMasterSet = doc.getElementsByTagName('fo:layout-master-set')[0] || 
                          doc.getElementsByTagName('layout-master-set')[0];
    
    // Try getElementsByTagNameNS if still not found
    if (!layoutMasterSet) {
        layoutMasterSet = doc.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'layout-master-set')[0];
    }
    
    if (!layoutMasterSet) {
        // No layout-master-set found, return empty structure (fallback behavior)
        return result;
    }

    // Parse all simple-page-masters
    let simplePageMasters = layoutMasterSet.getElementsByTagName('fo:simple-page-master');
    if (simplePageMasters.length === 0) {
        simplePageMasters = layoutMasterSet.getElementsByTagName('simple-page-master');
    }
    if (simplePageMasters.length === 0) {
        simplePageMasters = layoutMasterSet.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'simple-page-master');
    }
    
    Array.from(simplePageMasters).forEach(masterNode => {
        const masterName = masterNode.getAttribute('master-name');
        if (masterName) {
            result.simplePageMasters[masterName] = parseSimplePageMaster(masterNode, converter);
        }
    });

    // Parse all page-sequence-masters
    let pageSequenceMasters = layoutMasterSet.getElementsByTagName('fo:page-sequence-master');
    if (pageSequenceMasters.length === 0) {
        pageSequenceMasters = layoutMasterSet.getElementsByTagName('page-sequence-master');
    }
    if (pageSequenceMasters.length === 0) {
        pageSequenceMasters = layoutMasterSet.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'page-sequence-master');
    }
    
    Array.from(pageSequenceMasters).forEach(sequenceNode => {
        const sequenceName = sequenceNode.getAttribute('master-name');
        if (sequenceName) {
            result.sequences[sequenceName] = parsePageSequenceMaster(sequenceNode, result.simplePageMasters);
        }
    });

    return result;
}

/**
 * Parse a single simple-page-master element
 * @param {Element} node - The simple-page-master DOM element
 * @param {Object} converter - Instance of XSLToPDFMakeConverter
 * @returns {Object} Parsed page master object
 */
function parseSimplePageMaster(node, converter) {
    const result = {
        pageInfo: null,
        pageMargin: [0, 0, 0, 0],
        header: null,
        body: null,
        footer: null
    };

    // Parse page dimensions
    const pageWidth = node.getAttribute('page-width');
    const pageHeight = node.getAttribute('page-height');
    if (pageWidth && pageHeight) {
        const widthPt = converter.convertToPoints(pageWidth);
        const heightPt = converter.convertToPoints(pageHeight);
        result.pageInfo = converter.determinePageSize(widthPt, heightPt);
    }

    // Parse page margins (from simple-page-master)
    const marginAttr = node.getAttribute('margin');
    if (marginAttr) {
        result.pageMargin = converter.parseMargins(marginAttr);
    }

    // Find regions (handle both namespaced and non-namespaced)
    let regionBody = node.getElementsByTagName('fo:region-body')[0] || 
                     node.getElementsByTagName('region-body')[0] ||
                     node.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'region-body')[0];
    
    let regionBefore = node.getElementsByTagName('fo:region-before')[0] || 
                       node.getElementsByTagName('region-before')[0] ||
                       node.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'region-before')[0];
    
    let regionAfter = node.getElementsByTagName('fo:region-after')[0] || 
                      node.getElementsByTagName('region-after')[0] ||
                      node.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'region-after')[0];

    // Parse region-body margins (needed for header/footer calculations)
    let regionBodyMargins = [0, 0, 0, 0]; // [left, top, right, bottom]
    if (regionBody) {
        const bodyMarginAttr = regionBody.getAttribute('margin');
        if (bodyMarginAttr) {
            regionBodyMargins = converter.parseMargins(bodyMarginAttr);
        }
    }

    // Parse region-body
    if (regionBody) {
        result.body = {
            name: regionBody.getAttribute('region-name') || 'xsl-region-body',
            margins: [
                result.pageMargin[0], // left from page
                0,                     // top = 0
                result.pageMargin[2], // right from page
                0                      // bottom = 0
            ]
        };
    }

    // Parse region-before (header)
    if (regionBefore) {
        const extentAttr = regionBefore.getAttribute('extent');
        const height = extentAttr ? converter.convertToPoints(extentAttr) : 0;

        result.header = {
            name: regionBefore.getAttribute('region-name') || 'xsl-region-before',
            height: height,
            margins: [
                result.pageMargin[0],   // left from page
                result.pageMargin[1],   // top from page
                result.pageMargin[2],   // right from page
                regionBodyMargins[1]    // bottom from region-body top margin
            ],
            content: null // Will be populated later by PDFMake
        };
    }

    // Parse region-after (footer)
    if (regionAfter) {
        const extentAttr = regionAfter.getAttribute('extent');
        const height = extentAttr ? converter.convertToPoints(extentAttr) : 0;

        result.footer = {
            name: regionAfter.getAttribute('region-name') || 'xsl-region-after',
            height: height,
            margins: [
                result.pageMargin[0],   // left from page
                regionBodyMargins[3],   // top from region-body bottom margin
                result.pageMargin[2],   // right from page
                result.pageMargin[3]    // bottom from page
            ],
            content: null // Will be populated later by PDFMake
        };
    }

    return result;
}

/**
 * Parse a page-sequence-master element
 * @param {Element} node - The page-sequence-master DOM element
 * @param {Object} simplePageMasters - Already parsed simple page masters
 * @returns {Object} Sequence object with first and repeatable references
 */
function parsePageSequenceMaster(node, simplePageMasters) {
    const result = {
        first: null,
        repeatable: null
    };

    // Find single-page-master-reference (handle both namespaced and non-namespaced)
    let singlePageRef = node.getElementsByTagName('fo:single-page-master-reference')[0] ||
                        node.getElementsByTagName('single-page-master-reference')[0] ||
                        node.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'single-page-master-reference')[0];
    
    if (singlePageRef) {
        const masterRef = singlePageRef.getAttribute('master-reference');
        if (masterRef && simplePageMasters[masterRef]) {
            result.first = simplePageMasters[masterRef];
        }
    }

    // Find repeatable-page-master-reference (handle both namespaced and non-namespaced)
    let repeatablePageRef = node.getElementsByTagName('fo:repeatable-page-master-reference')[0] ||
                            node.getElementsByTagName('repeatable-page-master-reference')[0] ||
                            node.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'repeatable-page-master-reference')[0];
    
    if (repeatablePageRef) {
        const masterRef = repeatablePageRef.getAttribute('master-reference');
        if (masterRef && simplePageMasters[masterRef]) {
            result.repeatable = simplePageMasters[masterRef];
        }
    }

    return result;
}

/**
 * Helper function to calculate region margins based on rules
 * @param {string} regionType - 'header', 'body', or 'footer'
 * @param {Array<number>} pageMargins - Page margins [left, top, right, bottom]
 * @param {Array<number>} regionBodyMargins - Region body margins [left, top, right, bottom]
 * @returns {Array<number>} Calculated margins [left, top, right, bottom]
 */
function calculateRegionMargins(regionType, pageMargins, regionBodyMargins) {
    switch (regionType) {
        case 'header':
            return [
                pageMargins[0],         // left from page
                pageMargins[1],         // top from page
                pageMargins[2],         // right from page
                regionBodyMargins[1]    // bottom from region-body top
            ];
        case 'body':
            return [
                pageMargins[0],   // left from page
                0,                // top = 0
                pageMargins[2],   // right from page
                0                 // bottom = 0
            ];
        case 'footer':
            return [
                pageMargins[0],         // left from page
                regionBodyMargins[3],   // top from region-body bottom
                pageMargins[2],         // right from page
                pageMargins[3]          // bottom from page
            ];
        default:
            return [0, 0, 0, 0];
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        parseDocumentStructure,
        parseSimplePageMaster,
        parsePageSequenceMaster,
        calculateRegionMargins
    };
}
if (typeof window !== 'undefined') {
    window.DocStructureParser = {
        parseDocumentStructure,
        parseSimplePageMaster,
        parsePageSequenceMaster,
        calculateRegionMargins
    };
}

