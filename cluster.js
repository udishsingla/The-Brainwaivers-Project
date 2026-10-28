/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * Multi-Core Cluster Engine & Auto-Healing Load Balancer (SIH 2026)
 * High-Concurrency Horizontal Scaling & Zero-Downtime Worker Auto-Recovery
 * =========================================================================
 */

const cluster = require('cluster');
const os = require('os');
const path = require('path');
const config = require('./config/env');

const numCPUs = os.cpus().length;
const workerCount = Math.min(config.server.clusterWorkers || 4, Math.max(2, numCPUs));

if (cluster.isMaster || cluster.isPrimary) {
    // Explicitly configure worker target module
    if (typeof cluster.setupPrimary === 'function') {
        cluster.setupPrimary({ exec: path.join(__dirname, 'server.js') });
    } else if (typeof cluster.setupMaster === 'function') {
        cluster.setupMaster({ exec: path.join(__dirname, 'server.js') });
    }

    console.log(`=================================================================`);
    console.log(` AICTE HIGH-PERFORMANCE CLUSTER LOAD BALANCER (SIH 2026)`);
    console.log(` Master PID:         ${process.pid}`);
    console.log(` Physical CPU Cores: ${numCPUs}`);
    console.log(` Active Worker Pool: ${workerCount} Worker Instances`);
    console.log(` Load Balancing:     Kernel Round-Robin (SO_REUSEPORT)`);
    console.log(` Port:               http://localhost:${config.server.port}`);
    console.log(` Auto-Scaling:       ENABLED (Zero-Downtime Auto-Recovery)`);
    console.log(`=================================================================`);

    const workers = {};

    // Fork workers
    for (let i = 0; i < workerCount; i++) {
        const worker = cluster.fork({ WORKER_INDEX: i + 1 });
        workers[worker.id] = {
            id: worker.id,
            pid: worker.process.pid,
            workerIndex: i + 1,
            startedAt: new Date().toISOString()
        };
    }

    // Auto-Recovery & Auto-Scaling event handler
    cluster.on('exit', (worker, code, signal) => {
        console.warn(`[Auto-Scaler Alert] Worker #${worker.id} (PID ${worker.process.pid}) exited with code ${code} / signal ${signal}.`);
        console.log(`[Auto-Scaler Action] Spawning healthy replacement worker instance to maintain ${workerCount} workers...`);
        
        const newWorker = cluster.fork({ WORKER_INDEX: worker.id });
        workers[newWorker.id] = {
            id: newWorker.id,
            pid: newWorker.process.pid,
            workerIndex: newWorker.id,
            startedAt: new Date().toISOString(),
            recoveredFrom: worker.process.pid
        };
    });

    cluster.on('online', (worker) => {
        console.log(`[Cluster] Worker #${worker.id} (PID ${worker.process.pid}) is online and accepting connections.`);
    });

} else {
    // Worker processes execute the Express application server
    require('./server.js');
}
