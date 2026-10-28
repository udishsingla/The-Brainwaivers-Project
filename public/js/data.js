/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * Client Data Models, Institutions Registry & Global State (SIH 2026)
 * =========================================================================
 */

(function(global) {
    const CATEGORIES = [
        "Capitation Fee / Irregular Fees Refund",
        "Faculty Harassment & Salary Non-Payment",
        "Infrastructure & Lab Deficiency",
        "Unauthorized Courses / Seat Violation",
        "Ragging & Campus Safety Violation",
        "Accreditation & Approval Fraud",
        "Evaluation & Exam Discrepancy"
    ];

    const BUREAUS = [
        "Regulation Bureau (RB)",
        "Public Grievance Redressal Cell (PGRC)",
        "Legal & Compliance Cell",
        "Northern Regional Office (NRO)",
        "Appellate Authority / Grievance Oversight"
    ];

    const REGIONS = [
        "Northern",
        "North-Western",
        "Western",
        "Eastern",
        "Southern",
        "South-Western",
        "Central"
    ];

    const INITIAL_INSTITUTIONS = [
        {
            permanentId: "1-3349102845",
            name: "Aryavart Institute of Technology & Management",
            address: "Sector 14, Knowledge Corridor",
            city: "Lucknow",
            state: "Uttar Pradesh",
            region: "Northern",
            category: "Engineering & Technology",
            approvalStatus: "Under Scrutiny"
        },
        {
            permanentId: "1-4920194821",
            name: "Imperial College of Engineering & Research",
            address: "Wagholi-Loni Road",
            city: "Pune",
            state: "Maharashtra",
            region: "Western",
            category: "Engineering & Technology",
            approvalStatus: "Notice Served"
        },
        {
            permanentId: "1-1092837461",
            name: "Kalinga Institute of Industrial Science",
            address: "Campus 5, Patia",
            city: "Bhubaneswar",
            state: "Odisha",
            region: "Eastern",
            category: "Engineering & Technology",
            approvalStatus: "Approved"
        },
        {
            permanentId: "1-7782910482",
            name: "Vellore National Institute of Advanced Studies",
            address: "Katpadi Road",
            city: "Vellore",
            state: "Tamil Nadu",
            region: "Southern",
            category: "Management",
            approvalStatus: "Approved"
        },
        {
            permanentId: "1-2293847561",
            name: "Apex Global College of Pharmacy",
            address: "NH-8, Near Cyber City",
            city: "Gurugram",
            state: "Haryana",
            region: "North-Western",
            category: "Pharmacy",
            approvalStatus: "Approved"
        },
        {
            permanentId: "1-6652019483",
            name: "Sahyadri Polytechnic & Skill Academy",
            address: "Adyar Hills",
            city: "Mangaluru",
            state: "Karnataka",
            region: "South-Western",
            category: "Polytechnic",
            approvalStatus: "Approved"
        },
        {
            permanentId: "1-8837192044",
            name: "Central India Institute of Architecture & Planning",
            address: "Civil Lines",
            city: "Nagpur",
            state: "Maharashtra",
            region: "Central",
            category: "Architecture",
            approvalStatus: "Under Scrutiny"
        }
    ];

    // Authorized Solvers configuration
    const AUTHORIZED_SOLVERS = [
        {
            email: "usingla_be26@thapar.edu",
            name: "Er. Udish Singla",
            designation: "Chief Administrative Officer & Member Secretary",
            bureau: "Regulation Bureau (RB)",
            role: "CHIEF_ADMIN"
        },
        {
            email: "mmskunjal_be26@thapar.edu",
            name: "Ms. Kunjal Singla",
            designation: "Director, Public Grievance Redressal Cell",
            bureau: "Public Grievance Redressal Cell (PGRC)",
            role: "BUREAU_HEAD"
        },
        {
            email: "dbansal_be26@thapar.edu",
            name: "Dr. Dharuv Bansal",
            designation: "Joint Director (Institutional Regulation)",
            bureau: "Regulation Bureau (RB)",
            role: "INVESTIGATING_OFFICER"
        },
        {
            email: "gparvesh_be26@thapar.edu",
            name: "Shri Parvesh Garg",
            designation: "Regional Officer & Incharge",
            bureau: "Northern Regional Office (NRO)",
            role: "REGIONAL_COORDINATOR"
        },
        {
            email: "iishika_be26@thapar.edu",
            name: "Adv. Ishika",
            designation: "Senior Legal Counsel & Statutory Compliance Head",
            bureau: "Legal & Compliance Cell",
            role: "INVESTIGATING_OFFICER"
        },
        {
            email: "ddrishti_be26@thapar.edu",
            name: "Prof. Drishti",
            designation: "Appellate Ombudsman & Oversight Chair",
            bureau: "Appellate Authority / Grievance Oversight",
            role: "BUREAU_HEAD"
        }
    ];

    global.AICTE_DATA = {
        CATEGORIES,
        BUREAUS,
        REGIONS,
        INITIAL_INSTITUTIONS,
        AUTHORIZED_SOLVERS
    };
})(typeof window !== 'undefined' ? window : global);
