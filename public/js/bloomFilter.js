/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * High-Performance Probabilistic Bloom Filter Engine (SIH 2026)
 * O(1) Multi-Hash Deduplication & Cross-Bureau Overlap Pre-filter
 * =========================================================================
 */

(function(global) {
    class BloomFilter {
        /**
         * @param {number} size - Number of bits in the bit array (default: 131,072 bits / 16KB)
         * @param {number} hashCount - Number of independent hash functions (default: 4)
         */
        constructor(size = 131072, hashCount = 4) {
            this.size = size;
            this.hashCount = hashCount;
            // Uint32Array where each entry holds 32 bits
            this.bitArray = new Uint32Array(Math.ceil(size / 32));
            this.elementsCount = 0;
            this.hashCollisionsAvoided = 0;
        }

        // Hash Function 1: FNV-1a 32-bit
        _hashFnv1a(str) {
            let hash = 2166136261;
            for (let i = 0; i < str.length; i++) {
                hash ^= str.charCodeAt(i);
                hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
            }
            return (hash >>> 0) % this.size;
        }

        // Hash Function 2: DJB2 hash
        _hashDjb2(str) {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) + hash) + str.charCodeAt(i);
            }
            return (hash >>> 0) % this.size;
        }

        // Hash Function 3: SDBM hash
        _hashSdbm(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
            }
            return (hash >>> 0) % this.size;
        }

        // Hash Function 4: Murmur-like polynomial rolling hash
        _hashMurmurPoly(str) {
            let hash = 0;
            const p = 31;
            let p_pow = 1;
            for (let i = 0; i < str.length; i++) {
                hash = (hash + (str.charCodeAt(i) + 1) * p_pow) >>> 0;
                p_pow = (p_pow * p) >>> 0;
            }
            return (hash >>> 0) % this.size;
        }

        /**
         * Compute k hash indexes for a string key
         */
        _getHashes(key) {
            const h1 = this._hashFnv1a(key);
            const h2 = this._hashDjb2(key);
            const h3 = this._hashSdbm(key);
            const h4 = this._hashMurmurPoly(key);
            return [h1, h2, h3, h4].slice(0, this.hashCount);
        }

        /**
         * Add an element signature (e.g., permanentId + bureau) into the filter
         */
        add(key) {
            const hashes = this._getHashes(String(key));
            hashes.forEach(idx => {
                const arrayIndex = Math.floor(idx / 32);
                const bitOffset = idx % 32;
                this.bitArray[arrayIndex] |= (1 << bitOffset);
            });
            this.elementsCount++;
        }

        /**
         * Check if key possibly exists (False Negatives Impossible, False Positives Small)
         * @returns {boolean}
         */
        has(key) {
            const hashes = this._getHashes(String(key));
            for (let i = 0; i < hashes.length; i++) {
                const idx = hashes[i];
                const arrayIndex = Math.floor(idx / 32);
                const bitOffset = idx % 32;
                if ((this.bitArray[arrayIndex] & (1 << bitOffset)) === 0) {
                    return false; // Definitely not in the set
                }
            }
            return true; // Possibly in the set
        }

        /**
         * Count total set bits (1s) in filter
         */
        getSetBitCount() {
            let count = 0;
            for (let i = 0; i < this.bitArray.length; i++) {
                let v = this.bitArray[i];
                // Brian Kernighan's algorithm for set bits
                while (v) {
                    v &= (v - 1);
                    count++;
                }
            }
            return count;
        }

        /**
         * Current Bit Utilization percentage
         */
        getBitUtilization() {
            const setBits = this.getSetBitCount();
            return ((setBits / this.size) * 100).toFixed(2);
        }

        /**
         * Theoretical False Positive Probability: (1 - e^(-k*n/m))^k
         */
        getFalsePositiveRate() {
            if (this.elementsCount === 0) return 0;
            const k = this.hashCount;
            const m = this.size;
            const n = this.elementsCount;
            const exponent = (-k * n) / m;
            const prob = Math.pow(1 - Math.exp(exponent), k);
            return (prob * 100).toFixed(4);
        }

        /**
         * Clear the filter
         */
        reset() {
            this.bitArray.fill(0);
            this.elementsCount = 0;
            this.hashCollisionsAvoided = 0;
        }

        getStats() {
            return {
                totalBits: this.size,
                hashFunctions: this.hashCount,
                itemsIndexed: this.elementsCount,
                setBits: this.getSetBitCount(),
                bitUtilizationPercent: this.getBitUtilization(),
                falsePositiveRatePercent: this.getFalsePositiveRate(),
                memoryFootprintKb: (this.bitArray.byteLength / 1024).toFixed(1)
            };
        }
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BloomFilter;
    } else {
        global.BloomFilter = BloomFilter;
    }
})(typeof window !== 'undefined' ? window : global);
