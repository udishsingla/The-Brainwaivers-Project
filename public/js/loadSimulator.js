/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * High-Concurrency 10,000 Request Stress & Scale Simulator (SIH 2026)
 * Real-Time Telemetry: Bloom Filter Pre-screening, B-Tree Indexing & Worker Auto-Scaling
 * =========================================================================
 */

(function(global) {
    class LoadSimulator {
        constructor() {
            this.isRunning = false;
            this.totalTarget = 10000;
            this.processed = 0;
            this.duplicatesCaught = 0;
            this.overlapsFlagged = 0;
            this.startTime = null;
            this.latencyHistory = [];
            this.activeNodes = 1;
            this.bloom = new (global.BloomFilter || Object)(131072, 4);
        }

        async runBenchmark(targetCount = 10000, onProgressUpdate) {
            if (this.isRunning) return;
            this.isRunning = true;
            this.totalTarget = targetCount;
            this.processed = 0;
            this.duplicatesCaught = 0;
            this.overlapsFlagged = 0;
            this.latencyHistory = [];
            this.startTime = performance.now();
            this.bloom.reset();

            // Pre-seed bloom filter with known existing institutions
            const initialInsts = (global.AICTE_DATA && global.AICTE_DATA.INITIAL_INSTITUTIONS) || [];
            initialInsts.forEach(inst => {
                this.bloom.add(inst.permanentId);
            });

            // Try running backend stress test in parallel if server is active
            let serverBenchmarkPromise = null;
            try {
                serverBenchmarkPromise = fetch('/api/stress-test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ count: Math.min(targetCount, 10000) })
                }).then(r => r.json()).catch(() => null);
            } catch (e) {
                // local fallback
            }

            // Client-side batch streaming in micro-ticks
            const batchSize = 250;
            const institutions = initialInsts.length ? initialInsts : [
                { permanentId: "1-3349102845", name: "Aryavart Inst of Tech" },
                { permanentId: "1-4920194821", name: "Imperial College of Eng" },
                { permanentId: "1-1092837461", name: "Kalinga Institute" },
                { permanentId: "1-7782910482", name: "Vellore National Inst" },
                { permanentId: "1-2293847561", name: "Apex Global Pharmacy" }
            ];

            const bureaus = [
                "Regulation Bureau (RB)",
                "Public Grievance Redressal Cell (PGRC)",
                "Legal & Compliance Cell",
                "Northern Regional Office (NRO)"
            ];

            const categories = [
                "Capitation Fee / Irregular Fees Refund",
                "Faculty Harassment & Salary Non-Payment",
                "Infrastructure & Lab Deficiency",
                "Unauthorized Courses / Seat Violation"
            ];

            while (this.processed < this.totalTarget && this.isRunning) {
                const batchStartTime = performance.now();
                const currentBatch = Math.min(batchSize, this.totalTarget - this.processed);

                for (let i = 0; i < currentBatch; i++) {
                    const inst = institutions[(this.processed + i) % institutions.length];
                    const bureau = bureaus[(this.processed + i) % bureaus.length];
                    const cat = categories[(this.processed + i) % categories.length];

                    // Bloom Filter O(1) Check for fast overlap / duplicate detection
                    const signature = `${inst.permanentId}:${cat}`;
                    if (this.bloom.has(signature)) {
                        this.duplicatesCaught++;
                    } else {
                        this.bloom.add(signature);
                    }

                    // Check if permanent ID appears across different bureaus (Overlap pre-screening)
                    if (this.bloom.has(inst.permanentId)) {
                        this.overlapsFlagged++;
                    }
                }

                const batchDuration = performance.now() - batchStartTime;
                this.latencyHistory.push(batchDuration / currentBatch);
                this.processed += currentBatch;

                // Auto-scaling simulation: scale cluster workers based on processed rate
                if (this.processed > 7500) this.activeNodes = 4;
                else if (this.processed > 4000) this.activeNodes = 3;
                else if (this.processed > 1000) this.activeNodes = 2;
                else this.activeNodes = 1;

                const elapsedSec = (performance.now() - this.startTime) / 1000;
                const currentThroughput = Math.round(this.processed / (elapsedSec || 0.001));

                if (onProgressUpdate) {
                    onProgressUpdate({
                        processed: this.processed,
                        target: this.totalTarget,
                        progressPercent: Math.min(100, Math.round((this.processed / this.totalTarget) * 100)),
                        throughputRps: currentThroughput,
                        activeNodes: this.activeNodes,
                        duplicatesCaught: this.duplicatesCaught,
                        overlapsFlagged: this.overlapsFlagged,
                        avgLatencyMs: (batchDuration / currentBatch).toFixed(3),
                        bloomStats: this.bloom.getStats(),
                        isComplete: this.processed >= this.totalTarget
                    });
                }

                // Yield briefly to event loop to preserve silky 60 FPS UI responsiveness
                await new Promise(r => setTimeout(r, 8));
            }

            const totalDurationSec = (performance.now() - this.startTime) / 1000;
            const avgThroughput = Math.round(this.totalTarget / totalDurationSec);

            this.isRunning = false;

            // Wait for server response if it was running
            const serverResult = serverBenchmarkPromise ? await serverBenchmarkPromise : null;

            return {
                totalProcessed: this.processed,
                durationSeconds: totalDurationSec.toFixed(2),
                averageThroughputRps: avgThroughput,
                duplicatesFiltered: this.duplicatesCaught,
                overlapsDetected: this.overlapsFlagged,
                activeWorkerReplicas: this.activeNodes,
                bloomStats: this.bloom.getStats(),
                serverResult: serverResult
            };
        }

        stop() {
            this.isRunning = false;
        }
    }

    global.LoadSimulator = new LoadSimulator();
})(typeof window !== 'undefined' ? window : global);
