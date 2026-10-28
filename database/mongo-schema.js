/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * MongoDB Document Store Schemas & Aggregation Pipelines (SIH 2026)
 * High-Scale Document Storage for Dynamic Complaint Dossiers & Workflow Events
 * =========================================================================
 */

// If running with MongoDB / Mongoose in production, import mongoose:
// const mongoose = require('mongoose');

const ComplaintDossierSchemaDefinition = {
    complaintId: { type: String, required: true, unique: true, index: true },
    aictePermanentId: { type: String, required: true, index: true },
    institutionName: { type: String, required: true, index: 'text' },
    category: { type: String, required: true, index: true },
    subCategory: String,
    status: { 
        type: String, 
        enum: ['PENDING', 'UNDER_PROCESS', 'TRANSFERRED', 'ESCALATED', 'DISPOSED'],
        default: 'PENDING',
        index: true
    },
    priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
    complainant: {
        userId: String,
        fullName: String,
        email: { type: String, index: true },
        phone: String,
        userType: String,
        confidentialityRequested: Boolean
    },
    bureauAllocation: {
        primaryBureau: { type: String, required: true, index: true },
        assignedOfficer: {
            officerId: String,
            name: String,
            email: String,
            designation: String
        },
        transferredFrom: String,
        transferReason: String,
        transferDate: Date
    },
    crossBureauOverlap: {
        hasOverlap: { type: Boolean, default: false, index: true },
        detectedAt: Date,
        overlappingInstitutions: [String],
        linkedComplaintIds: [String],
        jointCoordinationStatus: {
            type: String,
            enum: ['NONE', 'FLAGGED', 'JOINT_REVIEW_INITIATED', 'RESOLVED_AND_CONSOLIDATED'],
            default: 'NONE'
        },
        leadBureau: String,
        sharedNotes: [
            {
                officer: String,
                bureau: String,
                note: String,
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    chronologicalAuditTrail: [
        {
            actionId: String,
            actionType: String,
            officerName: String,
            bureau: String,
            remarks: String,
            evidenceUrls: [String],
            timestamp: { type: Date, default: Date.now }
        }
    ],
    metadata: {
        slaDeadline: { type: Date, index: true },
        slaDaysRemaining: Number,
        isSlaBreached: { type: Boolean, default: false, index: true },
        bloomFilterSignature: String,
        ingestedAt: { type: Date, default: Date.now }
    }
};

/**
 * MongoDB Aggregation Pipeline for Cross-Bureau Overlap Intelligence
 * Groups complaints by AICTE Permanent ID and flags institutions appearing
 * simultaneously across multiple bureaus.
 */
const CrossBureauOverlapAggregation = [
    {
        $match: {
            status: { $in: ['PENDING', 'UNDER_PROCESS', 'ESCALATED'] }
        }
    },
    {
        $group: {
            _id: "$aictePermanentId",
            institutionName: { $first: "$institutionName" },
            bureausInvolved: { $addToSet: "$bureauAllocation.primaryBureau" },
            totalActiveComplaints: { $sum: 1 },
            complaintIds: { $push: "$complaintId" },
            categories: { $addToSet: "$category" },
            oldestSlaDeadline: { $min: "$metadata.slaDeadline" }
        }
    },
    {
        $match: {
            $expr: { $gt: [{ $size: "$bureausInvolved" }, 1] }
        }
    },
    {
        $project: {
            aictePermanentId: "$_id",
            institutionName: 1,
            bureausInvolved: 1,
            totalActiveComplaints: 1,
            complaintIds: 1,
            categories: 1,
            overlapSeverity: {
                $cond: { if: { $gte: ["$totalActiveComplaints", 3] }, then: "CRITICAL", else: "HIGH" }
            },
            statusText: "Potential Overlapping Cases - Multi-Bureau Coordination Required"
        }
    },
    {
        $sort: { totalActiveComplaints: -1 }
    }
];

module.exports = {
    ComplaintDossierSchemaDefinition,
    CrossBureauOverlapAggregation
};
