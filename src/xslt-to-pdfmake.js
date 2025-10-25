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

                // Convert dimensions to points
                const widthInPoints = this.convertToPoints(pageWidth);
                const heightInPoints = this.convertToPoints(pageHeight);

                // Parse margins
                const margins = this.parseMargins(marginAttr);

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
     * Convert XSL-FO document to PDFMake definition (top-level parameters only)
     * @param {string} xslfoXml - XSL-FO XML string
     * @returns {Object} PDFMake document definition with pageSize and pageMargins
     */
    convertToPDFMake(xslfoXml) {
        const pageMasters = this.parsePageMasters(xslfoXml);

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

        // Create PDFMake definition (only pageSize and pageMargins)
        const pdfMakeDefinition = {
            pageSize: pageSize,
            pageMargins: primaryMaster.margins,
            content: []
        };

        return pdfMakeDefinition;
    }
}

// Export for use in other files (works in both browser and Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XSLToPDFMakeConverter;
}

