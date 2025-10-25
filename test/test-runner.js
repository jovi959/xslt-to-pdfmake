/**
 * Vanilla JavaScript Test Runner for XSL-FO to PDFMake Converter
 * No external testing framework required
 */

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
        this.passCount = 0;
        this.failCount = 0;
    }

    /**
     * Add a test to the test suite
     * @param {string} name - Test name
     * @param {Function} testFn - Test function (should throw on failure)
     */
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    /**
     * Run all tests and collect results
     * @returns {Promise<Object>} Test results summary
     */
    async runTests() {
        this.results = [];
        this.passCount = 0;
        this.failCount = 0;

        console.log('🧪 Starting test run...\n');

        for (const test of this.tests) {
            const result = await this.runSingleTest(test);
            this.results.push(result);

            if (result.passed) {
                this.passCount++;
            } else {
                this.failCount++;
            }
        }

        console.log(`\n✅ Passed: ${this.passCount}`);
        console.log(`❌ Failed: ${this.failCount}`);
        console.log(`📊 Total: ${this.tests.length}\n`);

        return {
            total: this.tests.length,
            passed: this.passCount,
            failed: this.failCount,
            results: this.results
        };
    }

    /**
     * Run a single test
     * @param {Object} test - Test object with name and testFn
     * @returns {Object} Test result
     */
    async runSingleTest(test) {
        const startTime = performance.now();
        let passed = false;
        let error = null;

        try {
            await test.testFn();
            passed = true;
            console.log(`✅ PASS: ${test.name}`);
        } catch (e) {
            passed = false;
            error = e.message || e.toString();
            console.error(`❌ FAIL: ${test.name}`);
            console.error(`   Error: ${error}`);
        }

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        return {
            name: test.name,
            passed: passed,
            error: error,
            duration: duration
        };
    }

    /**
     * Render test results to HTML
     * @param {string} containerId - ID of container element
     */
    renderResults(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container element #${containerId} not found`);
            return;
        }

        const totalTests = this.tests.length;
        const passPercentage = totalTests > 0 ? Math.round((this.passCount / totalTests) * 100) : 0;

        let html = `
            <div class="test-summary ${this.failCount === 0 ? 'all-pass' : 'has-failures'}">
                <h2>Test Results</h2>
                <div class="summary-stats">
                    <div class="stat-box pass">
                        <div class="stat-number">${this.passCount}</div>
                        <div class="stat-label">Passed</div>
                    </div>
                    <div class="stat-box fail">
                        <div class="stat-number">${this.failCount}</div>
                        <div class="stat-label">Failed</div>
                    </div>
                    <div class="stat-box total">
                        <div class="stat-number">${totalTests}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat-box percentage">
                        <div class="stat-number">${passPercentage}%</div>
                        <div class="stat-label">Pass Rate</div>
                    </div>
                </div>
            </div>

            <div class="test-results">
        `;

        this.results.forEach((result, index) => {
            const statusIcon = result.passed ? '✅' : '❌';
            const statusClass = result.passed ? 'test-pass' : 'test-fail';
            
            html += `
                <div class="test-item ${statusClass}" id="test-item-${index}">
                    <div class="test-header">
                        <span class="test-icon">${statusIcon}</span>
                        <span class="test-name">${result.name}</span>
                        <span class="test-duration">${result.duration}ms</span>
                    </div>
                    <div class="test-actions">
                        <button class="test-btn test-btn-run" onclick="runSingleTest(${index})">
                            ▶️ Run Test
                        </button>
                        <button class="test-btn test-btn-view" onclick="toggleComparison(${index})">
                            👁️ View Data
                        </button>
                        <button class="test-btn test-btn-pdf" onclick="generateTestPDF(${index})">
                            📄 Generate PDF
                        </button>
                    </div>
            `;

            if (!result.passed) {
                html += `
                    <div class="test-error">
                        <strong>Error:</strong> ${this.escapeHtml(result.error)}
                    </div>
                `;
            }

            html += `
                    <div class="comparison-view" id="comparison-${index}">
                        <div class="comparison-panel">
                            <h4>📝 Original XSL-FO</h4>
                            <div class="comparison-content" id="original-${index}">
                                <em>Click "View Data" to load...</em>
                            </div>
                        </div>
                        <div class="comparison-panel">
                            <h4>🔄 Converted PDFMake</h4>
                            <div class="comparison-content" id="converted-${index}">
                                <em>Click "View Data" to load...</em>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        container.innerHTML = html;
    }

    /**
     * Escape HTML for safe rendering
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Assertion helpers
const assert = {
    /**
     * Assert that a value is truthy
     */
    ok(value, message = 'Expected value to be truthy') {
        if (!value) {
            throw new Error(message);
        }
    },

    /**
     * Assert that two values are equal
     */
    equal(actual, expected, message) {
        if (actual !== expected) {
            const msg = message || `Expected ${expected}, but got ${actual}`;
            throw new Error(msg);
        }
    },

    /**
     * Assert that two values are deeply equal (for objects and arrays)
     */
    deepEqual(actual, expected, message) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        
        if (actualStr !== expectedStr) {
            const msg = message || `Expected ${expectedStr}, but got ${actualStr}`;
            throw new Error(msg);
        }
    },

    /**
     * Assert that two numbers are approximately equal (within tolerance)
     */
    approximately(actual, expected, tolerance = 0.01, message) {
        const diff = Math.abs(actual - expected);
        if (diff > tolerance) {
            const msg = message || `Expected ${expected} (±${tolerance}), but got ${actual} (diff: ${diff})`;
            throw new Error(msg);
        }
    },

    /**
     * Assert that a value is an instance of a type
     */
    instanceOf(value, type, message) {
        if (!(value instanceof type)) {
            const msg = message || `Expected instance of ${type.name}, but got ${typeof value}`;
            throw new Error(msg);
        }
    },

    /**
     * Assert that an array contains a value
     */
    contains(array, value, message) {
        if (!array.includes(value)) {
            const msg = message || `Expected array to contain ${value}`;
            throw new Error(msg);
        }
    },

    /**
     * Assert that a function throws an error
     */
    throws(fn, expectedError, message) {
        let threw = false;
        let error = null;

        try {
            fn();
        } catch (e) {
            threw = true;
            error = e;
        }

        if (!threw) {
            const msg = message || 'Expected function to throw an error';
            throw new Error(msg);
        }

        if (expectedError && !(error instanceof expectedError)) {
            const msg = message || `Expected error of type ${expectedError.name}`;
            throw new Error(msg);
        }
    }
};

// Helper function to load test files
async function loadTestFile(filepath) {
    try {
        const response = await fetch(filepath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filepath}: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error loading test file ${filepath}:`, error);
        throw error;
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.TestRunner = TestRunner;
    window.assert = assert;
    window.loadTestFile = loadTestFile;
}

