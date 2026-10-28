/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * High-Speed Redis Cache & Distributed Ingestion Store (SIH 2026)
 * Real Redis 7+ Connection with Zero-Downtime Microsecond Fallback
 * =========================================================================
 */

const Redis = require('ioredis');
const config = require('../config/env');

class RedisClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.fallbackStore = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            connectedAt: null,
            mode: 'INITIALIZING'
        };

        this.init();
    }

    async init() {
        if (!config.redis.enabled) {
            this.stats.mode = 'IN_MEMORY_HIGH_SPEED_STORE';
            console.log('[Redis] Standalone in-memory caching engine active.');
            return;
        }

        try {
            const redisOptions = {
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password || undefined,
                db: config.redis.db,
                keyPrefix: config.redis.prefix,
                connectTimeout: 2500,
                maxRetriesPerRequest: 1,
                retryStrategy: (times) => {
                    if (times > 2) return null; // stop retrying and rely on resilient fallback
                    return Math.min(times * 200, 1000);
                },
                lazyConnect: true
            };

            this.client = new Redis(redisOptions);

            this.client.on('connect', () => {
                this.isConnected = true;
                this.stats.mode = 'LIVE_REDIS_ACTIVE';
                this.stats.connectedAt = new Date().toISOString();
                console.log(`[Redis] Connected to Redis Cache server at ${config.redis.host}:${config.redis.port}`);
            });

            this.client.on('error', (err) => {
                this.isConnected = false;
                this.stats.mode = 'HIGH_SPEED_CACHE_EMULATOR_ACTIVE';
                // Silently fallback without crashing the process
            });

            await this.client.connect().catch(() => {
                this.isConnected = false;
                this.stats.mode = 'HIGH_SPEED_CACHE_EMULATOR_ACTIVE';
                console.log('[Redis] Redis server not detected locally on 6379. Operating in resilient In-Memory Redis Engine.');
            });

        } catch (err) {
            this.isConnected = false;
            this.stats.mode = 'HIGH_SPEED_CACHE_EMULATOR_ACTIVE';
            console.log('[Redis] Fallback active:', err.message);
        }
    }

    async get(key) {
        try {
            if (this.isConnected && this.client) {
                const data = await this.client.get(key);
                if (data) {
                    this.stats.hits++;
                    return JSON.parse(data);
                }
                this.stats.misses++;
                return null;
            }
        } catch (e) {
            // Fall through to memory
        }

        // Resilient Fallback Store
        const item = this.fallbackStore.get(key);
        if (item) {
            if (item.expiresAt && Date.now() > item.expiresAt) {
                this.fallbackStore.delete(key);
                this.stats.misses++;
                return null;
            }
            this.stats.hits++;
            return item.value;
        }
        this.stats.misses++;
        return null;
    }

    async set(key, value, ttlSeconds = config.redis.ttl) {
        this.stats.sets++;
        try {
            if (this.isConnected && this.client) {
                await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
                return true;
            }
        } catch (e) {
            // Fall through to memory
        }

        // Resilient Fallback Store
        this.fallbackStore.set(key, {
            value: value,
            expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
        });
        return true;
    }

    async del(key) {
        this.stats.deletes++;
        try {
            if (this.isConnected && this.client) {
                await this.client.del(key);
            }
        } catch (e) {}

        this.fallbackStore.delete(key);
        return true;
    }

    async invalidatePattern(prefix) {
        try {
            if (this.isConnected && this.client) {
                const keys = await this.client.keys(`${prefix}*`);
                if (keys && keys.length > 0) {
                    await this.client.del(...keys);
                }
            }
        } catch (e) {}

        // Invalidate fallback
        for (const k of this.fallbackStore.keys()) {
            if (k.startsWith(prefix)) {
                this.fallbackStore.delete(k);
            }
        }
        return true;
    }

    getStats() {
        return {
            isConnected: this.isConnected,
            engineMode: this.stats.mode,
            activeKeys: this.isConnected ? 'Dynamic Redis Keys' : this.fallbackStore.size,
            hits: this.stats.hits,
            misses: this.stats.misses,
            totalSets: this.stats.sets,
            hitRatio: (this.stats.hits + this.stats.misses) > 0 
                ? `${((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1)}%` 
                : '100.0%',
            ttlDefaultSeconds: config.redis.ttl
        };
    }
}

module.exports = new RedisClient();
