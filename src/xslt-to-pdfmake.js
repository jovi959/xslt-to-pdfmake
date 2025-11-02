/**
 * XSL-FO to PDFMake Converter
 * Converts XSL-FO (XSL Formatting Objects) documents to PDFMake document definitions
 */

class XSLToPDFMakeConverter {
    constructor() {
        // Conversion constants
        this.POINTS_PER_INCH = 72;
        this.POINTS_PER_CM = 28.35;
        this.POINTS_PER_MM = 2.835;
        this.POINTS_PER_PT = 1;
        
        // Standard page sizes in points (width x height)
        this.PAGE_SIZES = {
            'LETTER': { width: 612, height: 792 },    // 8.5 x 11 inches
            'LEGAL': { width: 612, height: 1008 },    // 8.5 x 14 inches
            'A4': { width: 595.28, height: 841.89 },  // 210 x 297 mm
            'A3': { width: 841.89, height: 1190.55 }, // 297 x 420 mm
            'A5': { width: 419.53, height: 595.28 },  // 148 x 210 mm
        };
    }

    /**
     * Convert a unit string (e.g., "8.5in", "11in", "1cm") to points
     * @param {string} value - The value with unit (e.g., "8.5in", "72pt", "2.54cm")
     * @returns {number} Value in points
     */
    convertToPoints(value) {
        if (!value || typeof value !== 'string') {
            return 0;
        }

        value = value.trim();
        
        // Extract number and unit
        const match = value.match(/^([\d.]+)(in|cm|mm|pt)?$/i);
        if (!match) {
            console.warn(`Could not parse unit value: ${value}`);
            return 0;
        }

        const number = parseFloat(match[1]);
        const unit = (match[2] || 'pt').toLowerCase();

        switch (unit) {
            case 'in':
                return number * this.POINTS_PER_INCH;
            case 'cm':
                return number * this.POINTS_PER_CM;
            case 'mm':
                return number * this.POINTS_PER_MM;
            case 'pt':
                return number * this.POINTS_PER_PT;
            default:
                console.warn(`Unknown unit: ${unit}`);
                return number;
        }
    }

    /**
     * Parse margin string (supports various formats)
     * Formats: "1in" (all), "1in 2in" (vertical horizontal), "1in 2in 3in 4in" (top right bottom left)
     * @param {string} marginStr - Margin string from XSL-FO
     * @returns {Array<number>} Array of margins [left, top, right, bottom] in points
     */
    parseMargins(marginStr) {
        if (!marginStr || typeof marginStr !== 'string') {
            return [0, 0, 0, 0];
        }

        const parts = marginStr.trim().split(/\s+/);
        const margins = parts.map(part => this.convertToPoints(part));

        // Handle different margin formats
        if (margins.length === 1) {
            // All sides the same
            return [margins[0], margins[0], margins[0], margins[0]];
        } else if (margins.length === 2) {
            // First is vertical (top/bottom), second is horizontal (left/right)
            return [margins[1], margins[0], margins[1], margins[0]];
        } else if (margins.length === 4) {
            // Top, Right, Bottom, Left -> convert to [left, top, right, bottom]
            return [margins[3], margins[0], margins[1], margins[2]];
        } else {
            console.warn(`Invalid margin format: ${marginStr}`);
            return [0, 0, 0, 0];
        }
    }

    /**
     * Determine page size name from dimensions
     * @param {number} width - Width in points
     * @param {number} height - Height in points
     * @returns {string|Object} Page size name or custom dimensions
     */
    determinePageSize(width, height) {
        const tolerance = 2; // Allow 2 points tolerance for matching

        for (const [name, size] of Object.entries(this.PAGE_SIZES)) {
            if (Math.abs(size.width - width) < tolerance && 
                Math.abs(size.height - height) < tolerance) {
                return name;
            }
        }

        // Return custom size if no standard match
        return { width: Math.round(width * 100) / 100, height: Math.round(height * 100) / 100 };
    }

    /**
     * Parse XSL-FO XML document and extract page master definitions
     * @param {string} xslfoXml - XSL-FO XML string
     * @returns {Object} Parsed page master information
     */
    parsePageMasters(xslfoXml) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xslfoXml, 'text/xml');

            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML parsing error: ' + parserError.textContent);
            }

            // Find all simple-page-master elements
            const pageMasters = xmlDoc.querySelectorAll('simple-page-master');
            const pageMasterData = [];

            pageMasters.forEach(master => {
                const masterName = master.getAttribute('master-name');
                const pageWidth = master.getAttribute('page-width');
                const pageHeight = master.getAttribute('page-height');
                const marginAttr = master.getAttribute('margin');
                
                // Individual margin attributes
                const marginTop = master.getAttribute('margin-top');
                const marginBottom = master.getAttribute('margin-bottom');
                const marginLeft = master.getAttribute('margin-left');
                const marginRight = master.getAttribute('margin-right');

                // Convert dimensions to points
                const widthInPoints = this.convertToPoints(pageWidth);
                const heightInPoints = this.convertToPoints(pageHeight);

                // Parse margins - prefer individual attributes over shorthand
                let margins;
                if (marginTop || marginBottom || marginLeft || marginRight) {
                    margins = [
                        this.convertToPoints(marginLeft || '0'),
                        this.convertToPoints(marginTop || '0'),
                        this.convertToPoints(marginRight || '0'),
                        this.convertToPoints(marginBottom || '0')
                    ];
                } else {
                    margins = this.parseMargins(marginAttr);
                }

                pageMasterData.push({
                    masterName: masterName,
                    pageWidth: pageWidth,
                    pageHeight: pageHeight,
                    widthInPoints: widthInPoints,
                    heightInPoints: heightInPoints,
                    marginString: marginAttr,
                    margins: margins
                });
            });

            return pageMasterData;
        } catch (error) {
            console.error('Error parsing XSL-FO document:', error);
            throw error;
        }
    }

    /**
     * Parse page-sequence-master to determine page flow
     * @param {string} xslfoXml - XSL-FO XML string
     * @returns {Object} Page sequence information
     */
    parsePageSequences(xslfoXml) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xslfoXml, 'text/xml');

            // Find page-sequence-master element
            const pageSeqMaster = xmlDoc.querySelector('page-sequence-master');
            
            if (!pageSeqMaster) {
                // No page sequence master, return empty sequences
                return { sequences: [] };
            }

            const sequences = [];

            // Parse single-page-master-reference elements
            const singleRefs = pageSeqMaster.querySelectorAll('single-page-master-reference');
            singleRefs.forEach(ref => {
                sequences.push({
                    type: 'single',
                    masterRef: ref.getAttribute('master-reference')
                });
            });

            // Parse repeatable-page-master-reference elements
            const repeatableRefs = pageSeqMaster.querySelectorAll('repeatable-page-master-reference');
            repeatableRefs.forEach(ref => {
                sequences.push({
                    type: 'repeatable',
                    masterRef: ref.getAttribute('master-reference')
                });
            });

            return { sequences };
        } catch (error) {
            console.error('Error parsing page sequences:', error);
            return { sequences: [] };
        }
    }

    /**
     * Extract and convert content from XSL-FO flow elements
     * This method coordinates the recursive traversal and block conversion
     * @param {string} xslfoXml - XSL-FO XML string
     * @returns {Array} Array of converted content items
     */
    extractContent(xslfoXml) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xslfoXml, 'text/xml');

            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML parsing error: ' + parserError.textContent);
            }

            // Find all flow elements (where content lives)
            const flows = xmlDoc.querySelectorAll('flow, fo\\:flow');
            const content = [];

            // If no flows found, return empty content
            if (!flows || flows.length === 0) {
                return content;
            }

            // Check if we have the required modules available
            const hasTraversal = typeof window !== 'undefined' && window.RecursiveTraversal;
            const hasBlockConverter = typeof window !== 'undefined' && window.BlockConverter;
            const hasInlineConverter = typeof window !== 'undefined' && window.InlineConverter;
            const hasTableConverter = typeof window !== 'undefined' && window.TableConverter;

            // If modules not available in browser, check Node.js
            let traverse, convertBlock, convertInline, convertTable;
            
            // Browser environment
            if (hasTraversal && hasBlockConverter) {
                traverse = window.RecursiveTraversal.traverse;
                convertBlock = window.BlockConverter.convertBlock;
                // Inline converter is optional but recommended
                if (hasInlineConverter) {
                    convertInline = window.InlineConverter.convertInline;
                }
                // Table converter is optional
                if (hasTableConverter) {
                    convertTable = window.TableConverter.convertTable;
                }
            } else if (typeof require !== 'undefined') {
                // Node.js environment
                try {
                    const RecursiveTraversal = require('./recursive-traversal.js');
                    const BlockConverter = require('./block-converter.js');
                    traverse = RecursiveTraversal.traverse;
                    convertBlock = BlockConverter.convertBlock;
                    
                    // Try to load inline converter (optional but recommended)
                    try {
                        const InlineConverter = require('./inline-converter.js');
                        convertInline = InlineConverter.convertInline;
                    } catch (inlineErr) {
                        // Inline converter not available, that's okay (fallback to block converter)
                        console.log('Inline converter not loaded (optional)');
                    }
                    
                    // Try to load table converter (optional)
                    try {
                        const TableConverter = require('./table-converter.js');
                        convertTable = TableConverter.convertTable;
                    } catch (tableErr) {
                        // Table converter not available, that's okay
                        console.log('Table converter not loaded (optional)');
                    }
                } catch (e) {
                    console.warn('Conversion modules not available:', e.message);
                    return content; // Return empty content if modules not available
                }
            }

            if (!traverse || !convertBlock) {
                console.warn('Block conversion not available - modules not loaded');
                return content;
            }

            // Process each flow
            flows.forEach(flow => {
                // Get all direct children of flow (typically fo:block or fo:table elements)
                const children = flow.childNodes;
                
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    
                    // Handle text nodes at flow level (wrap in block)
                    if (child.nodeType === 3) { // TEXT_NODE
                        const text = child.textContent;
                        // Skip whitespace-only text nodes
                        if (text && !/^\s*$/.test(text)) {
                            // Bare text at flow level - wrap it in a simple text block
                            content.push({ text: text.trim() });
                        }
                        continue;
                    }
                    
                    // Skip comments and other non-element nodes
                    if (child.nodeType !== 1) continue;
                    
                    // Process block elements
                    if (child.nodeName === 'fo:block' || child.nodeName === 'block') {
                        const converted = traverse(child, convertBlock);
                        if (converted !== null && converted !== undefined) {
                            content.push(converted);
                        }
                    }
                    
                    // Process inline elements (if inline converter is available)
                    // Standalone inline elements at the top level
                    else if ((child.nodeName === 'fo:inline' || child.nodeName === 'inline') && convertInline) {
                        const converted = traverse(child, convertInline);
                        if (converted !== null && converted !== undefined) {
                            content.push(converted);
                        }
                    }
                    
                    // Process table elements (if table converter is available)
                    else if ((child.nodeName === 'fo:table' || child.nodeName === 'table') && convertTable) {
                        const converted = traverse(child, convertTable);
                        if (converted !== null && converted !== undefined) {
                            content.push(converted);
                        }
                    }
                }
            });

            return content;
        } catch (error) {
            console.error('Error extracting content:', error);
            return [];
        }
    }

    /**
     * Convert XSL-FO document to PDFMake definition
     * @param {string} xslfoXml - XSL-FO XML string
     * @param {Object} options - Optional conversion options
     * @param {boolean} options.skipPreprocessing - Skip inheritance preprocessing (default: false)
     * @returns {Object} PDFMake document definition with pageSize, pageMargins, and content
     */
    convertToPDFMake(xslfoXml, options = {}) {
        // Step 1: Apply preprocessing (inheritance, etc.)
        let processedXml = xslfoXml;
        
        if (!options.skipPreprocessing) {
            // Get preprocessor functions
            const preprocessor = typeof window !== 'undefined' 
                ? window.InheritancePreprocessor 
                : require('./preprocessor.js');
            
            const blockConfig = typeof window !== 'undefined'
                ? window.BlockInheritanceConfig
                : require('./block-inheritance-config.js');
            
            const tableConfig = typeof window !== 'undefined'
                ? window.TableInheritanceConfig
                : require('./table-inheritance-config.js');
            
            if (preprocessor && blockConfig) {
                // Get block inheritance config
                const blockInheritanceConfig = blockConfig.getBlockInheritanceConfig 
                    ? blockConfig.getBlockInheritanceConfig()
                    : blockConfig.BLOCK_INHERITANCE_CONFIG;
                
                // Get table inheritance config
                const tableInheritanceConfig = tableConfig && (tableConfig.getTableInheritanceConfig
                    ? tableConfig.getTableInheritanceConfig()
                    : tableConfig.TABLE_INHERITANCE_CONFIG);
                
                // Merge both configs
                const mergedConfig = [...blockInheritanceConfig];
                if (tableInheritanceConfig) {
                    mergedConfig.push(...tableInheritanceConfig);
                }
                
                if (preprocessor.preprocessXML) {
                    processedXml = preprocessor.preprocessXML(processedXml, {
                        inheritanceConfig: mergedConfig
                    });
                } else if (preprocessor.preprocessInheritance) {
                    processedXml = preprocessor.preprocessInheritance(processedXml, mergedConfig);
                }
            }
        }
        
        // Step 2: Continue with normal conversion
        const pageMasters = this.parsePageMasters(processedXml);
        const pageSequences = this.parsePageSequences(processedXml);

        if (pageMasters.length === 0) {
            throw new Error('No page masters found in XSL-FO document');
        }

        // Use the first page master as the primary page definition
        const primaryMaster = pageMasters[0];

        // Determine page size
        const pageSize = this.determinePageSize(
            primaryMaster.widthInPoints,
            primaryMaster.heightInPoints
        );

        // Extract and convert content (use preprocessed XML)
        let content = this.extractContent(processedXml);
        
        // Post-process content for keep-with-previous properties
        const keepProperties = typeof window !== 'undefined'
            ? window.KeepProperties
            : require('./keep-properties.js');
        
        if (keepProperties && keepProperties.processKeepWithPrevious) {
            content = keepProperties.processKeepWithPrevious(content);
        }

        // Create PDFMake definition
        const pdfMakeDefinition = {
            pageSize: pageSize,
            pageMargins: [0, 0, 0, 0], // Always [0,0,0,0] when using header/footer
            content: content,
            defaultStyle: {
                font: 'NimbusSan'  // Open-source Helvetica clone
            }
        };

        // Generate header/footer based on page sequences
        if (pageSequences.sequences.length >= 2) {
            // Multiple sequences - use functions
            pdfMakeDefinition.header = this.generateHeaderFunction(pageSequences, pageMasters);
            pdfMakeDefinition.footer = this.generateFooterFunction(pageSequences, pageMasters);
        } else if (pageSequences.sequences.length === 1) {
            // Single sequence - use static objects
            const masterRef = pageSequences.sequences[0].masterRef;
            const master = pageMasters.find(m => m.masterName === masterRef);
            if (master) {
                pdfMakeDefinition.header = {
                    margin: [master.margins[0], master.margins[1], master.margins[2], 0],
                    text: ''
                };
                pdfMakeDefinition.footer = {
                    margin: [master.margins[0], 0, master.margins[2], master.margins[3]],
                    text: ''
                };
            }
        } else {
            // No sequences - use primary master margins directly (legacy behavior)
            pdfMakeDefinition.pageMargins = primaryMaster.margins;
        }

        return pdfMakeDefinition;
    }

    /**
     * Generate header function for multi-sequence documents
     * @param {Object} pageSequences - Parsed page sequences
     * @param {Array} pageMasters - Parsed page masters
     * @returns {Function} Header function
     */
    generateHeaderFunction(pageSequences, pageMasters) {
        const sequences = pageSequences.sequences;
        
        // Get the actual margin values for each sequence
        const firstMaster = pageMasters.find(m => m.masterName === sequences[0]?.masterRef);
        const restMaster = pageMasters.find(m => m.masterName === sequences[1]?.masterRef);
        
        // Extract margin values to bake into the function
        const firstMargins = firstMaster ? firstMaster.margins : [0, 0, 0, 0];
        const restMargins = restMaster ? restMaster.margins : [0, 0, 0, 0];
        
        // Create function with hardcoded values (not closures)
        const functionBody = `
            if (currentPage === 1) {
                return {
                    margin: [${firstMargins[0]}, ${firstMargins[1]}, ${firstMargins[2]}, 0],
                    text: ''
                };
            }
            if (currentPage > 1 && currentPage <= pageCount) {
                return {
                    margin: [${restMargins[0]}, ${restMargins[1]}, ${restMargins[2]}, 0],
                    text: ''
                };
            }
        `;
        
        return new Function('currentPage', 'pageCount', functionBody);
    }

    /**
     * Generate footer function for multi-sequence documents
     * @param {Object} pageSequences - Parsed page sequences
     * @param {Array} pageMasters - Parsed page masters
     * @returns {Function} Footer function
     */
    generateFooterFunction(pageSequences, pageMasters) {
        const sequences = pageSequences.sequences;
        
        // Get the actual margin values for each sequence
        const firstMaster = pageMasters.find(m => m.masterName === sequences[0]?.masterRef);
        const restMaster = pageMasters.find(m => m.masterName === sequences[1]?.masterRef);
        
        // Extract margin values to bake into the function
        const firstMargins = firstMaster ? firstMaster.margins : [0, 0, 0, 0];
        const restMargins = restMaster ? restMaster.margins : [0, 0, 0, 0];
        
        // Create function with hardcoded values (not closures)
        const functionBody = `
            if (currentPage === 1) {
                return {
                    margin: [${firstMargins[0]}, 0, ${firstMargins[2]}, ${firstMargins[3]}],
                    text: ''
                };
            }
            if (currentPage > 1 && currentPage <= pageCount) {
                return {
                    margin: [${restMargins[0]}, 0, ${restMargins[2]}, ${restMargins[3]}],
                    text: ''
                };
            }
        `;
        
        return new Function('currentPage', 'pageCount', functionBody);
    }
}

// Export for use in other files (works in both browser and Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XSLToPDFMakeConverter;
}

