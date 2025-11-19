/**
 * Document Structure Parser Module
 * Parses XSL-FO layout-master-set to generate document structure variables
 * for PDFMake template rendering (headers, footers, page masters)
 */

/**
 * DocumentStructureParser Class
 * Provides methods to query header/footer information from parsed XSL-FO document
 */
class DocumentStructureParser {
    constructor(xslfoXml) {
        this.xslfoXml = xslfoXml;
        this.doc = null;
        this.layoutMasterSet = null;
        
        if (xslfoXml) {
            this._parseXML();
        }
    }

    /**
     * Parse the XML and cache the DOM and layout-master-set
     * @private
     */
    _parseXML() {
        if (!this.xslfoXml) return;

        // Parse XML
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            this.doc = parser.parseFromString(this.xslfoXml, 'text/xml');
        } else if (typeof require !== 'undefined') {
            try {
                const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
                const parser = new XMLDOMParser();
                this.doc = parser.parseFromString(this.xslfoXml, 'text/xml');
            } catch (e) {
                return;
            }
        }

        if (!this.doc) return;

        // Find and cache layout-master-set
        this.layoutMasterSet = this.doc.getElementsByTagName('fo:layout-master-set')[0] || 
                               this.doc.getElementsByTagName('layout-master-set')[0];
        
        if (!this.layoutMasterSet) {
            this.layoutMasterSet = this.doc.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'layout-master-set')[0];
        }
    }

    /**
     * Gets comprehensive header/footer information for a specific region in a master reference
     * @param {string} masterReference - The master-reference from page-sequence
     * @param {string} headerFooterName - The region name to search for
     * @returns {Object|null} Single resolved object or null if not found
     */
    getHeaderFooterInformation(masterReference, headerFooterName) {
        if (!this.doc || !this.layoutMasterSet || !masterReference || !headerFooterName) {
            return null;
        }

        // Find all simple-page-masters
        let simplePageMasters = this.layoutMasterSet.getElementsByTagName('fo:simple-page-master');
        if (simplePageMasters.length === 0) {
            simplePageMasters = this.layoutMasterSet.getElementsByTagName('simple-page-master');
        }
        if (simplePageMasters.length === 0) {
            simplePageMasters = this.layoutMasterSet.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'simple-page-master');
        }

        // Check if masterReference is a simple-page-master
        let targetSimpleMaster = findSimplePageMaster(simplePageMasters, masterReference);
        
        if (targetSimpleMaster) {
            // It's a simple-page-master, check directly for the region
            if (checkSimpleMasterForRegion(targetSimpleMaster, headerFooterName)) {
                return {
                    'page-sequence-master': null,
                    'page-master-reference': masterReference,
                    'region-name': headerFooterName,
                    'type': 'all'
                };
            }
            return null;
        }

        // Not a simple master, check if it's a page-sequence-master
        let pageSequenceMasters = this.layoutMasterSet.getElementsByTagName('fo:page-sequence-master');
        if (pageSequenceMasters.length === 0) {
            pageSequenceMasters = this.layoutMasterSet.getElementsByTagName('page-sequence-master');
        }
        if (pageSequenceMasters.length === 0) {
            pageSequenceMasters = this.layoutMasterSet.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'page-sequence-master');
        }

        let targetSequence = null;
        for (let i = 0; i < pageSequenceMasters.length; i++) {
            if (pageSequenceMasters[i].getAttribute('master-name') === masterReference) {
                targetSequence = pageSequenceMasters[i];
                break;
            }
        }

        if (!targetSequence) {
            return null;
        }

        // Collect firstMaster
        let firstMaster = null;
        let singlePageRef = targetSequence.getElementsByTagName('fo:single-page-master-reference')[0] ||
                            targetSequence.getElementsByTagName('single-page-master-reference')[0] ||
                            targetSequence.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'single-page-master-reference')[0];
        
        if (singlePageRef) {
            firstMaster = singlePageRef.getAttribute('master-reference');
        }

        // Collect repeatableMasters
        const repeatableMasters = [];
        let repeatablePageRefs = targetSequence.getElementsByTagName('fo:repeatable-page-master-reference');
        if (repeatablePageRefs.length === 0) {
            repeatablePageRefs = targetSequence.getElementsByTagName('repeatable-page-master-reference');
        }
        if (repeatablePageRefs.length === 0) {
            repeatablePageRefs = targetSequence.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'repeatable-page-master-reference');
        }

        for (let i = 0; i < repeatablePageRefs.length; i++) {
            const masterRef = repeatablePageRefs[i].getAttribute('master-reference');
            if (masterRef) {
                repeatableMasters.push(masterRef);
            }
        }

        // Check which masters contain the specified region
        const mastersWithRegion = [];
        
        if (firstMaster) {
            const firstMasterNode = findSimplePageMaster(simplePageMasters, firstMaster);
            if (firstMasterNode && checkSimpleMasterForRegion(firstMasterNode, headerFooterName)) {
                mastersWithRegion.push({ ref: firstMaster, isFirst: true });
            }
        }

        for (let i = 0; i < repeatableMasters.length; i++) {
            const repeatMasterNode = findSimplePageMaster(simplePageMasters, repeatableMasters[i]);
            if (repeatMasterNode && checkSimpleMasterForRegion(repeatMasterNode, headerFooterName)) {
                mastersWithRegion.push({ ref: repeatableMasters[i], isFirst: false });
            }
        }

        if (mastersWithRegion.length === 0) {
            return null;
        }

        // Determine type
        let type;
        const hasFirst = mastersWithRegion.some(m => m.isFirst);
        const hasRepeatable = mastersWithRegion.some(m => !m.isFirst);
        
        // Check if the sequence defines a first page at all
        const sequenceHasFirstPage = !!firstMaster;

        if (hasFirst && !hasRepeatable) {
            type = 'first';
        } else if (!hasFirst && hasRepeatable) {
            // If the sequence doesn't define a first page, repeatable covers all pages from page 1
            if (!sequenceHasFirstPage) {
                type = 'all';
            } else {
                // If sequence has a first page but this region isn't in it, it's rest-only
                type = 'rest';
            }
        } else if (hasFirst && hasRepeatable) {
            type = 'all';
        } else {
            type = 'custom';
        }

        return {
            'page-sequence-master': masterReference,
            'page-master-reference': mastersWithRegion[0].ref,
            'region-name': headerFooterName,
            'type': type
        };
    }

    /**
     * Determines if a header/footer should be rendered based on its type and current page
     * @param {string} type - The type from getHeaderFooterInformation ('all', 'first', 'rest', 'custom')
     * @param {number} currentPage - The current page number (1-based)
     * @param {number} pageCount - Total number of pages in the document
     * @returns {boolean} True if the header/footer should be rendered on this page
     */
    isShouldRun(type, currentPage, pageCount) {
        if (type === 'all') {
            return true;
        } else if (type === 'first' && currentPage === 1) {
            return true;
        } else if (type === 'rest' && currentPage > 1) {
            return true;
        }
        return false;
    }

    /**
     * Creates a PDFMake layout function for static header/footer content
     * Extracts content from specified region and returns a function that conditionally renders
     * based on page number using isShouldRun logic
     * 
     * @param {Object} information - Header/footer information from getHeaderFooterInformation()
     * @param {string} xslfoXml - Complete XSL-FO XML document
     * @param {Object} converter - Instance of XSLToPDFMakeConverter
     * @returns {Function} PDFMake function(currentPage, pageCount) that returns content or empty string
     */
    _getStaticContentLayout(information, xslfoXml, converter) {
        // Handle null/undefined inputs gracefully
        if (!information || !xslfoXml || !converter) {
            // Return a function that always returns empty string
            return function(currentPage, pageCount) {
                return '';
            };
        }

        // Extract content from the specific region using flowName
        let content;
        try {
            // Get the full PDFMake definition for this region
            const fullDef = converter.convertToPDFMake(xslfoXml, { 
                flowName: information['region-name'] 
            });
            // Extract only the content array/object, as headers/footers don't need pageSize/Margins
            content = fullDef.content || [];
        } catch (e) {
            // If extraction fails, use empty content
            content = [];
        }

        // Extract type string as primitive value - this gets baked into the closure
        // The type is now a string literal in the returned function, not a reference to information.type
        const type = information.type;

        // Return PDFMake layout function with type baked in as a value
        const self = this;
        const layoutFn = function(currentPage, pageCount) {
            // Check if this header/footer should run on this page
            // type is captured as a primitive string value in the closure
            if (self.isShouldRun(type, currentPage, pageCount)) {
                return content;
            }
            return '';
        };

        // Override toString for better visualization in UI (shows literal type value and expanded content)
        layoutFn.toString = function() {
            // Indent the JSON content to match function body (8 spaces)
            const contentJson = JSON.stringify(content, null, 4).replace(/\n/g, '\n        ');
            return `function(currentPage, pageCount) {
    if (self.isShouldRun('${type}', currentPage, pageCount)) {
        return ${contentJson};
    }
    return '';
}`;
        };

        return layoutFn;
    }
}

/**
 * Calculate PDFMake pageMargins from page master components
 * Pre-calculates the margins needed for body content based on header/footer heights
 * @param {Object} pageMaster - Page master with header/body/footer
 * @returns {Array<number>} [left, top, right, bottom] margins in points
 */
function calculatePageMarginsFromMaster(pageMaster) {
    // MARGIN INDICES ASSUMPTION: [Left, Top, Right, Bottom]
    
    // LEFT: Sum of Global Page Left + Body Region Left
    const left = (pageMaster.pageMargin[0] || 0) + 
                 (pageMaster.body ? (pageMaster.body.margins[0] || 0) : 0);

    // RIGHT: Sum of Global Page Right + Body Region Right
    const right = (pageMaster.pageMargin[2] || 0) + 
                  (pageMaster.body ? (pageMaster.body.margins[2] || 0) : 0);

    // TOP: header height only (if header exists)
    const top = (pageMaster.header && pageMaster.header.height) || 0;

    // BOTTOM: page bottom + footer height + footer top margin (gap)
    // Footer margins[1] is Top (Gap to Body)
    const bottom = (pageMaster.pageMargin[3] || 0) + 
                   (pageMaster.footer && pageMaster.footer.height > 0 
                       ? pageMaster.footer.height + (pageMaster.footer.margins[1] || 0) 
                       : 0);

    return [left, top, right, bottom];
}

/**
 * Main function to parse document structure from XSL-FO
 * @param {string} xslfoXml - The XSL-FO XML string
 * @param {Object} converter - Instance of XSLToPDFMakeConverter for utility methods
 * @returns {Object} Object containing { simplePageMasters: {}, sequences: {} }
 */
function parseDocumentStructure(xslfoXml, converter) {
    if (!xslfoXml || !converter) {
        return { simplePageMasters: {}, sequences: {}, headers: [], footers: [] };
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
        sequences: {},
        headers: [],
        footers: []
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

    // Populate headers and footers from page-sequences
    // Create a DocumentStructureParser instance to access helper methods
    const docStructParser = new DocumentStructureParser(xslfoXml);
    
    // Find all page-sequence elements
    let pageSequences = doc.getElementsByTagName('fo:page-sequence');
    if (pageSequences.length === 0) {
        pageSequences = doc.getElementsByTagName('page-sequence');
    }
    if (pageSequences.length === 0) {
        pageSequences = doc.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'page-sequence');
    }
    
    // Process each page-sequence
    Array.from(pageSequences).forEach(pageSeqNode => {
        const masterReference = pageSeqNode.getAttribute('master-reference');
        if (!masterReference) {
            return; // Skip if no master-reference
        }
        
        // Find all static-content children
        let staticContents = pageSeqNode.getElementsByTagName('fo:static-content');
        if (staticContents.length === 0) {
            staticContents = pageSeqNode.getElementsByTagName('static-content');
        }
        if (staticContents.length === 0) {
            staticContents = pageSeqNode.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'static-content');
        }
        
        // Process each static-content
        Array.from(staticContents).forEach(staticNode => {
            const flowName = staticNode.getAttribute('flow-name');
            if (!flowName) {
                return; // Skip if no flow-name
            }
            
            // Get header/footer information (this also determines if it's a header/footer)
            const information = docStructParser.getHeaderFooterInformation(masterReference, flowName);
            if (!information) {
                return; // Skip if can't get information (not a header/footer)
            }
            
            // Determine if it's a header or footer based on region-name
            const regionName = information['region-name'];
            if (!regionName) {
                return; // Skip if no region-name
            }
            
            // Check if this is a header or footer using the existing function
            const flags = isHeaderOrFooter(xslfoXml, information['page-master-reference'], regionName);
            if (!flags.isHeader && !flags.isFooter) {
                return; // Skip if neither header nor footer
            }
            
            // Get the layout function (structure)
            const structure = docStructParser._getStaticContentLayout(information, xslfoXml, converter);
            
            // Create entry
            const entry = {
                information: information,
                structure: structure
            };
            
            // Add to appropriate array
            if (flags.isHeader) {
                result.headers.push(entry);
            }
            if (flags.isFooter) {
                result.footers.push(entry);
            }
        });
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

    // Parse region-body margins (needed for header/footer calculations and body margins)
    let regionBodyMargins = null; // Will be set if margin attribute exists
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
                regionBodyMargins ? regionBodyMargins[0] : 0, // left from region-body only
                0,                                             // top = 0
                regionBodyMargins ? regionBodyMargins[2] : 0, // right from region-body only
                0                                              // bottom = 0
            ]
        };
    }

    // Parse region-before (header)
    if (regionBefore) {
        const extentAttr = regionBefore.getAttribute('extent');
        const height = extentAttr ? converter.convertToPoints(extentAttr) : 0;

        // Parse individual margin attributes or use page margins as fallback
        const marginLeft = regionBefore.getAttribute('margin-left') 
            ? converter.convertToPoints(regionBefore.getAttribute('margin-left'))
            : result.pageMargin[0];
        const marginTop = regionBefore.getAttribute('margin-top')
            ? converter.convertToPoints(regionBefore.getAttribute('margin-top'))
            : result.pageMargin[1];
        const marginRight = regionBefore.getAttribute('margin-right')
            ? converter.convertToPoints(regionBefore.getAttribute('margin-right'))
            : result.pageMargin[2];
        const marginBottom = regionBefore.getAttribute('margin-bottom')
            ? converter.convertToPoints(regionBefore.getAttribute('margin-bottom'))
            : (regionBodyMargins ? regionBodyMargins[1] : 0);

        result.header = {
            name: regionBefore.getAttribute('region-name') || 'xsl-region-before',
            height: height,
            margins: [
                marginLeft,
                marginTop,
                marginRight,
                marginBottom
            ],
            content: null // Will be populated later by PDFMake
        };
    }

    // Parse region-after (footer)
    if (regionAfter) {
        const extentAttr = regionAfter.getAttribute('extent');
        const height = extentAttr ? converter.convertToPoints(extentAttr) : 0;

        // Parse individual margin attributes or use page margins as fallback
        const marginLeft = regionAfter.getAttribute('margin-left')
            ? converter.convertToPoints(regionAfter.getAttribute('margin-left'))
            : result.pageMargin[0];
        const marginTop = regionAfter.getAttribute('margin-top')
            ? converter.convertToPoints(regionAfter.getAttribute('margin-top'))
            : (regionBodyMargins ? regionBodyMargins[3] : 0);
        const marginRight = regionAfter.getAttribute('margin-right')
            ? converter.convertToPoints(regionAfter.getAttribute('margin-right'))
            : result.pageMargin[2];
        const marginBottom = regionAfter.getAttribute('margin-bottom')
            ? converter.convertToPoints(regionAfter.getAttribute('margin-bottom'))
            : result.pageMargin[3];

        result.footer = {
            name: regionAfter.getAttribute('region-name') || 'xsl-region-after',
            height: height,
            margins: [
                marginLeft,
                marginTop,
                marginRight,
                marginBottom
            ],
            content: null // Will be populated later by PDFMake
        };
    }

    // Pre-calculate PDFMake pageMargins for this page master
    // This is calculated once here and reused by convertXSLFOToPDF
    result.calculatedPageMargins = calculatePageMarginsFromMaster(result);

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
 * Determines if a flow name belongs to a header or footer region in a specific page master
 * @param {string} xslfoXml - The XSL-FO XML string
 * @param {string} masterReference - The master-name of the simple-page-master to check
 * @param {string} flowName - The flow name to check
 * @returns {Object} Object with { isHeader: boolean, isFooter: boolean }
 */
function isHeaderOrFooter(xslfoXml, masterReference, flowName) {
    const result = {
        isHeader: false,
        isFooter: false
    };

    // Handle empty/null inputs
    if (!xslfoXml || !masterReference || !flowName) {
        return result;
    }

    // Parse XML
    let doc;
    if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        doc = parser.parseFromString(xslfoXml, 'text/xml');
    } else if (typeof require !== 'undefined') {
        // Node.js environment
        try {
            const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
            const parser = new XMLDOMParser();
            doc = parser.parseFromString(xslfoXml, 'text/xml');
        } catch (e) {
            return result;
        }
    } else {
        return result;
    }

    // Find layout-master-set
    let layoutMasterSet = doc.getElementsByTagName('fo:layout-master-set')[0] || 
                          doc.getElementsByTagName('layout-master-set')[0];
    
    if (!layoutMasterSet) {
        layoutMasterSet = doc.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'layout-master-set')[0];
    }
    
    if (!layoutMasterSet) {
        return result;
    }

    // Find all simple-page-masters
    let simplePageMasters = layoutMasterSet.getElementsByTagName('fo:simple-page-master');
    if (simplePageMasters.length === 0) {
        simplePageMasters = layoutMasterSet.getElementsByTagName('simple-page-master');
    }
    if (simplePageMasters.length === 0) {
        simplePageMasters = layoutMasterSet.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'simple-page-master');
    }

    // Find the specific master by reference
    let targetMaster = null;
    for (let i = 0; i < simplePageMasters.length; i++) {
        if (simplePageMasters[i].getAttribute('master-name') === masterReference) {
            targetMaster = simplePageMasters[i];
            break;
        }
    }

    if (!targetMaster) {
        return result;
    }

    // Check region-before (header)
    let regionBefore = targetMaster.getElementsByTagName('fo:region-before')[0] || 
                       targetMaster.getElementsByTagName('region-before')[0] ||
                       targetMaster.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'region-before')[0];
    
    if (regionBefore) {
        const regionName = regionBefore.getAttribute('region-name');
        if (regionName === flowName) {
            result.isHeader = true;
            return result;
        }
    }

    // Check region-after (footer)
    let regionAfter = targetMaster.getElementsByTagName('fo:region-after')[0] || 
                      targetMaster.getElementsByTagName('region-after')[0] ||
                      targetMaster.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'region-after')[0];
    
    if (regionAfter) {
        const regionName = regionAfter.getAttribute('region-name');
        if (regionName === flowName) {
            result.isFooter = true;
            return result;
        }
    }

    return result;
}

/**
 * Helper: Find a simple-page-master by name
 * @param {NodeList} simplePageMasters - Collection of simple-page-master elements
 * @param {string} masterName - The master-name to find
 * @returns {Element|null} The found element or null
 */
function findSimplePageMaster(simplePageMasters, masterName) {
    for (let i = 0; i < simplePageMasters.length; i++) {
        if (simplePageMasters[i].getAttribute('master-name') === masterName) {
            return simplePageMasters[i];
        }
    }
        return null;
    }

/**
 * Helper: Check if a simple-page-master contains a specific region name
 * @param {Element} masterNode - The simple-page-master element
 * @param {string} regionName - The region name to search for
 * @returns {boolean} True if the region exists in this master
 */
function checkSimpleMasterForRegion(masterNode, regionName) {
        // Check region-before (header)
    let regionBefore = masterNode.getElementsByTagName('fo:region-before')[0] || 
                       masterNode.getElementsByTagName('region-before')[0] ||
                       masterNode.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'region-before')[0];
        
    if (regionBefore && regionBefore.getAttribute('region-name') === regionName) {
        return true;
        }

        // Check region-after (footer)
    let regionAfter = masterNode.getElementsByTagName('fo:region-after')[0] || 
                      masterNode.getElementsByTagName('region-after')[0] ||
                      masterNode.getElementsByTagNameNS('http://www.w3.org/1999/XSL/Format', 'region-after')[0];
        
    if (regionAfter && regionAfter.getAttribute('region-name') === regionName) {
        return true;
    }

    return false;
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
        DocumentStructureParser,
        parseDocumentStructure,
        parseSimplePageMaster,
        parsePageSequenceMaster,
        calculateRegionMargins,
        calculatePageMarginsFromMaster,
        isHeaderOrFooter
    };
}
if (typeof window !== 'undefined') {
    window.DocumentStructureParser = DocumentStructureParser;
    window.DocStructureParser = {
        DocumentStructureParser,
        parseDocumentStructure,
        parseSimplePageMaster,
        parsePageSequenceMaster,
        calculateRegionMargins,
        calculatePageMarginsFromMaster,
        isHeaderOrFooter
    };
}

