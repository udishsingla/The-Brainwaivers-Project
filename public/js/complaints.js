/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * Complaint Operations, Workflow State Machine & PDF Receipt Engine (SIH 2026)
 * =========================================================================
 */

(function(global) {
    class ComplaintsService {
        constructor() {
            this.LOCAL_KEY = 'aicte_active_complaints_2026';
            this.complaints = [];
            this.loadInitial();
        }

        async loadInitial() {
            // First check if server API is responding
            try {
                const res = await fetch('/api/complaints');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.complaints && data.complaints.length > 0) {
                        this.complaints = data.complaints;
                        this.saveLocal();
                        return this.complaints;
                    }
                }
            } catch (e) {
                // local fallback
            }

            // Fallback to local storage or seed
            const stored = localStorage.getItem(this.LOCAL_KEY);
            if (stored) {
                try {
                    this.complaints = JSON.parse(stored);
                    return this.complaints;
                } catch (e) {}
            }

            // Default seed complaints
            this.complaints = this.getSeedComplaints();
            this.saveLocal();
            return this.complaints;
        }

        saveLocal() {
            try {
                localStorage.setItem(this.LOCAL_KEY, JSON.stringify(this.complaints));
            } catch (e) {
                console.warn('Storage quota exceeded, caching in memory');
            }
        }

        getSeedComplaints() {
            return [
                {
                    id: 1,
                    complaintId: "AICTE/PGRC/2026/0142",
                    permanentId: "1-3349102845",
                    institutionName: "Aryavart Institute of Technology & Management",
                    category: "Faculty Harassment & Salary Non-Payment",
                    subject: "Non-disbursement of 7th CPC salaries for 6 months to Assistant Professors",
                    description: "The faculty association has lodged an urgent grievance stating 42 faculty members have not received approved salaries since September 2025 despite AICTE mandates.",
                    status: "UNDER_PROCESS",
                    priority: "CRITICAL",
                    assignedBureau: "Public Grievance Redressal Cell (PGRC)",
                    assignedOfficer: "Ms. Kunjal Singla",
                    lastAction: "Show-cause letter issued to Management Board on 12-Feb-2026",
                    nextAction: "Physical hearing with institution Principal and Accounts Registrar",
                    dateReceived: "2026-02-04T10:30:00Z",
                    slaDeadline: "2026-03-06",
                    daysRemaining: 12,
                    isSlaBreached: false,
                    complainantEmail: "faculty.rep@gmail.com",
                    complainantName: "Dr. Rajesh Sharma",
                    actions: [
                        {
                            date: "2026-02-04 10:30",
                            officer: "System Gateway",
                            bureau: "PGRC",
                            action: "Complaint registered and auto-indexed via AICTE Samadhan engine",
                            remarks: "Initial review confirmed valid supporting salary slips"
                        },
                        {
                            date: "2026-02-12 14:15",
                            officer: "Ms. Kunjal Singla",
                            bureau: "PGRC",
                            action: "Statutory Notice Issued",
                            remarks: "Institution granted 10 days to submit certified bank statements"
                        }
                    ]
                },
                {
                    id: 2,
                    complaintId: "AICTE/RB/2026/0289",
                    permanentId: "1-3349102845",
                    institutionName: "Aryavart Institute of Technology & Management",
                    category: "Unauthorized Courses / Seat Violation",
                    subject: "Running unapproved AI/ML B.Tech sections exceeding sanctioned intake by 120 seats",
                    description: "Regulation Bureau received inspection intelligence that the institute admitted 300 students against sanctioned intake of 180 without prior council approval.",
                    status: "UNDER_PROCESS",
                    priority: "CRITICAL",
                    assignedBureau: "Regulation Bureau (RB)",
                    assignedOfficer: "Dr. Dharuv Bansal",
                    lastAction: "Regional surprise inspection report submitted by Committee on 18-Feb-2026",
                    nextAction: "Issue punitive withdrawal of approval or penalty under Regulation clause 14.3",
                    dateReceived: "2026-02-10T11:00:00Z",
                    slaDeadline: "2026-03-12",
                    daysRemaining: 18,
                    isSlaBreached: false,
                    complainantEmail: "whistleblower.edu@gmail.com",
                    complainantName: "Anonymous Stakeholder",
                    actions: [
                        {
                            date: "2026-02-10 11:00",
                            officer: "Dr. Dharuv Bansal",
                            bureau: "RB",
                            action: "Regulatory Scrutiny Case opened",
                            remarks: "Discrepancy identified in portal admission list vs approved seat matrix"
                        },
                        {
                            date: "2026-02-18 16:45",
                            officer: "Er. Udish Singla",
                            bureau: "RB",
                            action: "Cross-Bureau Overlap Flagged",
                            remarks: "System detected parallel ongoing grievance in PGRC. Coordination required."
                        }
                    ]
                },
                {
                    id: 3,
                    complaintId: "AICTE/PGRC/2026/0304",
                    permanentId: "1-4920194821",
                    institutionName: "Imperial College of Engineering & Research",
                    category: "Capitation Fee / Irregular Fees Refund",
                    subject: "Retention of original certificates and refusal to refund admission cancellation fee",
                    description: "Student cancelled admission within permitted schedule as per AICTE handbook guidelines. College refuses to release 10th/12th marksheets and retained full tuition.",
                    status: "PENDING",
                    priority: "HIGH",
                    assignedBureau: "Public Grievance Redressal Cell (PGRC)",
                    assignedOfficer: "Ms. Kunjal Singla",
                    lastAction: "Automated advisory notice dispatched to Institution Ombudsman",
                    nextAction: "Escalate to Standing Hearing Committee if reply not received in 48 hours",
                    dateReceived: "2026-02-16T09:15:00Z",
                    slaDeadline: "2026-03-18",
                    daysRemaining: 24,
                    isSlaBreached: false,
                    complainantEmail: "parent.ananya@gmail.com",
                    complainantName: "Ananya Deshmukh",
                    actions: [
                        {
                            date: "2026-02-16 09:15",
                            officer: "System Gateway",
                            bureau: "PGRC",
                            action: "Registered via Complainant Web Portal",
                            remarks: "Fee receipt and fee waiver application attached as proof"
                        }
                    ]
                },
                {
                    id: 4,
                    complaintId: "AICTE/LEGAL/2026/0091",
                    permanentId: "1-4920194821",
                    institutionName: "Imperial College of Engineering & Research",
                    category: "Accreditation & Approval Fraud",
                    subject: "Fraudulent representation of NAAC A++ grade on institutional hoardings and prospectus",
                    description: "Legal compliance cell initiated suo-moto proceedings regarding misleading advertisements violating AICTE statutory regulations.",
                    status: "ESCALATED",
                    priority: "CRITICAL",
                    assignedBureau: "Legal & Compliance Cell",
                    assignedOfficer: "Adv. Ishika",
                    lastAction: "Summons served to Chairman & Secretary of the Trust",
                    nextAction: "Submit formal affidavit to Central Scrutiny Committee",
                    dateReceived: "2026-01-20T14:00:00Z",
                    slaDeadline: "2026-02-19",
                    daysRemaining: -3,
                    isSlaBreached: true,
                    complainantEmail: "vigilance.unit@aicte-india.org",
                    complainantName: "Vigilance Cell Suo-Moto",
                    actions: [
                        {
                            date: "2026-01-20 14:00",
                            officer: "Adv. Ishika",
                            bureau: "Legal",
                            action: "Legal Notice Drafted",
                            remarks: "Advertisements archived as primary digital evidence"
                        },
                        {
                            date: "2026-02-19 18:00",
                            officer: "Prof. Drishti",
                            bureau: "Appellate",
                            action: "SLA Threshold Breached - Escalated to Appellate Ombudsman",
                            remarks: "Overdue by 3 days. Fast-track hearing mandated."
                        }
                    ]
                },
                {
                    id: 5,
                    complaintId: "AICTE/NRO/2026/0411",
                    permanentId: "1-2293847561",
                    institutionName: "Apex Global College of Pharmacy",
                    category: "Infrastructure & Lab Deficiency",
                    subject: "Lack of functional pharmaceutical analysis laboratories and expired chemicals",
                    description: "Students report basic equipment like HPLC, Spectrophotometer are non-functional, preventing mandatory PCI/AICTE lab practicals.",
                    status: "DISPOSED",
                    priority: "MEDIUM",
                    assignedBureau: "Northern Regional Office (NRO)",
                    assignedOfficer: "Shri Parvesh Garg",
                    lastAction: "Compliance verified during physical spot verification on 15-Feb-2026",
                    nextAction: "Case closed with formal compliance undertaking on record",
                    dateReceived: "2026-01-05T10:00:00Z",
                    slaDeadline: "2026-02-05",
                    daysRemaining: 0,
                    isSlaBreached: false,
                    complainantEmail: "student.test@gmail.com",
                    complainantName: "Rahul Verma",
                    actions: [
                        {
                            date: "2026-01-05 10:00",
                            officer: "Shri Parvesh Garg",
                            bureau: "NRO",
                            action: "Case Registered",
                            remarks: "Inspection team constituted"
                        },
                        {
                            date: "2026-02-15 17:30",
                            officer: "Shri Parvesh Garg",
                            bureau: "NRO",
                            action: "Disposal Approved",
                            remarks: "All lab equipment installed and tested. Compliance validated."
                        }
                    ]
                }
            ];
        }

        getAll() {
            return this.complaints;
        }

        getById(id) {
            return this.complaints.find(c => c.complaintId === id);
        }

        getByComplainant(email) {
            if (!email) return [];
            const clean = email.toLowerCase();
            return this.complaints.filter(c => c.complainantEmail && c.complainantEmail.toLowerCase() === clean);
        }

        /**
         * Citizen lodges a new grievance
         */
        async createComplaint(payload) {
            // Determine bureau based on category if not selected
            let bureau = payload.assignedBureau;
            if (!bureau) {
                if (payload.category.includes('Salary') || payload.category.includes('Capitation') || payload.category.includes('Ragging')) {
                    bureau = "Public Grievance Redressal Cell (PGRC)";
                } else if (payload.category.includes('Approval') || payload.category.includes('Fraud')) {
                    bureau = "Legal & Compliance Cell";
                } else {
                    bureau = "Regulation Bureau (RB)";
                }
            }

            const prefix = bureau.includes('Regulation') ? 'RB' :
                           bureau.includes('Grievance') ? 'PGRC' :
                           bureau.includes('Legal') ? 'LEGAL' : 'NRO';

            const complaintId = `AICTE/${prefix}/2026/${String(this.complaints.length + 1).padStart(4, '0')}`;
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 30);

            const newCase = {
                id: this.complaints.length + 1,
                complaintId: complaintId,
                permanentId: payload.permanentId,
                institutionName: payload.institutionName,
                category: payload.category,
                subject: payload.subject,
                description: payload.description,
                status: "PENDING",
                priority: payload.priority || "HIGH",
                assignedBureau: bureau,
                assignedOfficer: "Pending Scrutiny Allocation",
                lastAction: "Dossier officially registered in Central AICTE Monitoring Portal",
                nextAction: "Initial scrutiny by Bureau Scrutiny Officer",
                dateReceived: new Date().toISOString(),
                slaDeadline: deadline.toISOString().split('T')[0],
                daysRemaining: 30,
                isSlaBreached: false,
                complainantEmail: payload.complainantEmail,
                complainantName: payload.complainantName,
                actions: [
                    {
                        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        officer: payload.complainantName || "Complainant",
                        bureau: "Portal Ingestion Gateway",
                        action: "Grievance Dossier Submitted",
                        remarks: `Registered under reference ${complaintId}. Statutory 30-day timeline initiated.`
                    }
                ]
            };

            // Post to backend server if available
            try {
                await fetch('/api/complaints', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newCase)
                });
            } catch (e) {
                // local fallback
            }

            this.complaints.unshift(newCase);
            this.saveLocal();
            return newCase;
        }

        /**
         * Update complaint status, bureau, or action
         */
        async updateAction(complaintId, { status, officer, bureau, action, remarks, nextAction }) {
            const comp = this.getById(complaintId);
            if (!comp) throw new Error("Complaint not found: " + complaintId);

            if (status) comp.status = status;
            if (bureau) comp.assignedBureau = bureau;
            if (officer) comp.assignedOfficer = officer;
            if (nextAction) comp.nextAction = nextAction;
            if (action) comp.lastAction = action;

            if (status === 'DISPOSED') {
                comp.daysRemaining = 0;
                comp.isSlaBreached = false;
            }

            comp.actions.push({
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                officer: officer || "Authorized Officer",
                bureau: bureau || comp.assignedBureau,
                action: action || "Case action recorded",
                remarks: remarks || "Official status progression updated"
            });

            // Sync with backend API
            try {
                await fetch(`/api/complaints/${encodeURIComponent(complaintId)}/action`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status, officer, bureau, action, remarks, nextAction })
                });
            } catch (e) {
                // local fallback
            }

            this.saveLocal();
            return comp;
        }

        /**
         * Initiate Cross-Bureau Joint Coordination across overlapping cases
         */
        async initiateJointCoordination(permanentId, leadBureau, officerName, notes) {
            const related = this.complaints.filter(c => c.permanentId === permanentId);
            related.forEach(comp => {
                comp.status = "UNDER_PROCESS";
                comp.lastAction = `Joint Multi-Bureau Coordination Initiated. Lead Bureau: ${leadBureau}`;
                comp.nextAction = "Convene Joint Scrutiny Session and submit consolidated disposal proposal";
                comp.actions.push({
                    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    officer: officerName || "Joint Committee Chair",
                    bureau: leadBureau,
                    action: "Cross-Bureau Coordination Protocol Activated",
                    remarks: notes || `Case synchronized with parallel proceedings for ${comp.institutionName}. Overlapping duplicated inquiry halted.`
                });
            });

            this.saveLocal();
            return related;
        }
    }

    global.ComplaintsService = new ComplaintsService();
})(typeof window !== 'undefined' ? window : global);
