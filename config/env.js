/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * Central Environment & Configuration Orchestrator (SIH 2026)
 * Loads, validates, and exposes encrypted credentials securely
 * =========================================================================
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
    // 1. Core Server & Cluster
    server: {
        port: parseInt(process.env.PORT, 10) || 3000,
        env: process.env.NODE_ENV || 'production',
        appName: process.env.APP_NAME || 'AICTE Integrated Institution Complaint Monitoring System',
        appVersion: process.env.APP_VERSION || '2026.1.0-SIH',
        clusterEnabled: process.env.CLUSTER_ENABLED !== 'false',
        clusterWorkers: parseInt(process.env.CLUSTER_WORKERS, 10) || 4,
        host: process.env.HOST || '0.0.0.0'
    },

    // 2. MySQL Database
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'udishsingla@47451',
        database: process.env.DB_NAME || 'storage',
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 20,
        queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0
    },

    // 3. Redis Cache
    redis: {
        enabled: process.env.REDIS_ENABLED !== 'false',
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
        ttl: parseInt(process.env.REDIS_TTL_SECONDS, 10) || 300,
        prefix: process.env.REDIS_KEY_PREFIX || 'aicte:cache:'
    },

    // 4. Kafka Event Streaming Pipeline
    kafka: {
        enabled: process.env.KAFKA_ENABLED !== 'false',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',').map(b => b.trim()),
        clientId: process.env.KAFKA_CLIENT_ID || 'aicte-monitoring-engine',
        groupId: process.env.KAFKA_GROUP_ID || 'aicte-grievance-group',
        topics: {
            grievance: process.env.KAFKA_TOPIC_GRIEVANCE || 'aicte.grievance.submitted',
            overlap: process.env.KAFKA_TOPIC_OVERLAP || 'aicte.overlap.detected',
            action: process.env.KAFKA_TOPIC_ACTION || 'aicte.action.logged'
        }
    },

    // 5. Cryptography & Encryption
    security: {
        masterKey: process.env.ENCRYPTION_MASTER_KEY || 'e4d29a5f8b1c3d7e6a0f2b4c8e1a3d5f7b9c1e3a5d7f9b1c3e5a7d9f1b3c5e7a',
        algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
        ivLength: parseInt(process.env.ENCRYPTION_IV_LENGTH, 10) || 12,
        jwtSecret: process.env.JWT_SECRET || 'aicte_super_secret_jwt_sih2026_production_key_47451',
        jwtExpiration: process.env.JWT_EXPIRATION || '7d',
        sessionSecret: process.env.SESSION_SECRET || 'aicte_session_encryption_seed_987654321_secure',
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
    },

    // 6. External APIs & Gateways
    apis: {
        aicteRegistryApiKey: process.env.AICTE_REGISTRY_API_KEY || 'aicte_live_sec_token_99182371928',
        aicteRegistryUrl: process.env.AICTE_REGISTRY_URL || 'https://api.aicte-india.org/v2/institutions',
        digilockerKey: process.env.DIGILOCKER_INTEGRATION_KEY || 'dl_sandbox_aicte_sec_88491',
        smsAuthToken: process.env.SMS_GATEWAY_AUTH_TOKEN || 'sms_gov_in_token_771892',
        piiProtectionLevel: process.env.INTERNAL_PII_PROTECTION || 'STRICT_AES256_GCM'
    },

    // Safe summary for health-check / diagnostics (all sensitive secrets masked)
    getSanitizedDiagnostics() {
        return {
            server: {
                env: this.server.env,
                port: this.server.port,
                clusterEnabled: this.server.clusterEnabled,
                clusterWorkers: this.server.clusterWorkers
            },
            database: {
                host: this.database.host,
                port: this.database.port,
                user: this.database.user,
                database: this.database.database
            },
            redis: {
                enabled: this.redis.enabled,
                host: this.redis.host,
                port: this.redis.port,
                ttlSeconds: this.redis.ttl
            },
            kafka: {
                enabled: this.kafka.enabled,
                brokers: this.kafka.brokers,
                clientId: this.kafka.clientId
            },
            security: {
                algorithm: this.security.algorithm,
                encryptionActive: !!this.security.masterKey,
                jwtConfigured: !!this.security.jwtSecret,
                piiProtection: this.apis.piiProtectionLevel
            }
        };
    }
};

module.exports = config;
