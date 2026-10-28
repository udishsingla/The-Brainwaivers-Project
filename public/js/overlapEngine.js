/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * Cross-Bureau Overlap Detection & Intelligent Coordination Engine (SIH 2026)
 * =========================================================================
 */

(function(global) {
    class OverlapEngine {
        constructor() {
            this.stopWords = new Set([
                'institute', 'institution', 'college', 'of', 'technology', 'engineering',
                'management', 'science', 'sciences', 'advanced', 'studies', 'polytechnic',
                'and', '&', 'the', 'trust', 'society', 'academy', 'group'
            ]);
        }

        /**
         * Tokenize and normalize institution name for fuzzy cross-matching
         */
        normalizeName(name) {
            if (!name) return '';
            return name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 2 && !this.stopWords.has(w))
                .sort()
                .join(' ');
        }

        /**
         * Calculate token Jaccard similarity between two institutional strings
         */
        similarityScore(strA, strB) {
            const tokensA = new Set(this.normalizeName(strA).split(' '));
            const tokensB = new Set(this.normalizeName(strB).split(' '));
            
            if (tokensA.size === 0 || tokensB.size === 0) return 0;
            
            let intersection = 0;
            tokensA.forEach(t => {
                if (tokensB.has(t)) intersection++;
            });
            
            const union = new Set([...tokensA, ...tokensB]).size;
            return union === 0 ? 0 : intersection / union;
        }

        /**
         * Main Overlap Detection Algorithm:
         * Scans all complaints across bureaus and identifies cross-cell concurrency
         */
        analyzeOverlaps(complaintsList) {
            const instIndex = {};

            // Group by AICTE Permanent ID
            complaintsList.forEach(comp => {
                const pid = comp.permanentId || 'UNKNOWN';
                if (!instIndex[pid]) {
                    instIndex[pid] = {
                        permanentId: pid,
                        institutionName: comp.institutionName,
                        complaints: [],
                        bureaus: new Set(),
                        activeStatuses: new Set(),
                        categories: new Set()
                    };
                }
                instIndex[pid].complaints.push(comp);
                instIndex[pid].bureaus.add(comp.assignedBureau);
                if (comp.status !== 'DISPOSED') {
                    instIndex[pid].activeStatuses.add(comp.status);
                }
                instIndex[pid].categories.add(comp.category);
            });

            const overlaps = [];

            for (const pid in instIndex) {
                const item = instIndex[pid];
                // Check if multiple bureaus are involved
                const distinctBureaus = Array.from(item.bureaus);
                const hasCrossBureauOverlap = distinctBureaus.length > 1;

                if (hasCrossBureauOverlap) {
                    const activeComplaints = item.complaints.filter(c => c.status !== 'DISPOSED');
                    const isSevere = item.complaints.length >= 3 || distinctBureaus.includes('Regulation Bureau (RB)');

                    overlaps.push({
                        permanentId: item.permanentId,
                        institutionName: item.institutionName,
                        totalCases: item.complaints.length,
                        activeCasesCount: activeComplaints.length,
                        bureaus: distinctBureaus,
                        categories: Array.from(item.categories),
                        complaints: item.complaints,
                        severity: isSevere ? 'CRITICAL' : 'HIGH',
                        badgeClass: isSevere ? 'badge-critical' : 'badge-warning',
                        alertTitle: 'Potential Overlapping Cases - Multi-Bureau Coordination Required',
                        recommendedAction: this._generateRecommendation(distinctBureaus, item.categories),
                        detectedTimestamp: new Date().toISOString()
                    });
                }
            }

            // Sort overlaps by severity (CRITICAL first) then by totalCases descending
            return overlaps.sort((a, b) => {
                if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
                if (b.severity === 'CRITICAL' && a.severity !== 'CRITICAL') return 1;
                return b.totalCases - a.totalCases;
            });
        }

        /**
         * Intelligent Recommendation generator for inter-bureau coordination
         */
        _generateRecommendation(bureaus, categories) {
            const hasRB = bureaus.some(b => b.includes('Regulation'));
            const hasPGRC = bureaus.some(b => b.includes('Grievance'));
            const hasLegal = bureaus.some(b => b.includes('Legal'));

            if (hasRB && hasPGRC) {
                return "Mandatory Joint Coordination: Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) must align on inquiry findings prior to issuing statutory directions.";
            } else if (hasLegal) {
                return "Statutory Hold & Legal Review: Pending court/affidavit review in Legal Cell takes precedence. Bureaus must coordinate before issuing contradictory compliance notices.";
            } else {
                return "Multi-Cell Advisory: Appoint single Lead Bureau to coordinate unified response and prevent duplicate requests to institution management.";
            }
        }
    }

    global.OverlapEngine = new OverlapEngine();
})(typeof window !== 'undefined' ? window : global);
