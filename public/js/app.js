/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * Master Client Application Controller (SIH 2026)
 * Orchestrates Dual Portals, Overlap Matrix, 10k Load Simulator & Workflow
 * Zero Emojis | Vector SVGs | Responsive Flow
 * =========================================================================
 */

(function() {
    // Current Active Application State
    const AppState = {
        activePortal: 'GATEWAY', // 'GATEWAY', 'CITIZEN', 'SOLVER'
        officerTab: 'OVERVIEW',   // 'OVERVIEW', 'OVERLAPS', 'SIMULATOR', 'REPORTS'
        complaints: [],
        filteredComplaints: [],
        institutions: [],
        overlaps: [],
        selectedComplaint: null
    };

    // DOM Elements Cache
    let dom = {};

    function initDomElements() {
        dom = {
            gatewayView: document.getElementById('viewGateway'),
            citizenView: document.getElementById('viewCitizen'),
            solverView: document.getElementById('viewSolver'),
            btnGatewayNav: document.getElementById('btnNavGateway'),
            btnCitizenNav: document.getElementById('btnNavCitizen'),
            btnSolverNav: document.getElementById('btnNavSolver'),
            authStatusBox: document.getElementById('authStatusBox'),

            // Modals
            modalCitizenAuth: document.getElementById('modalCitizenAuth'),
            modalSolverAuth: document.getElementById('modalSolverAuth'),
            modalCaseDetail: document.getElementById('modalCaseDetail'),
            modalCaseAction: document.getElementById('modalCaseAction'),
            toastContainer: document.getElementById('toastContainer')
        };
    }

    // Initialize Application
    async function initApp() {
        initDomElements();
        renderStaticIcons();

        // Load institutions
        if (window.AICTE_DATA && window.AICTE_DATA.INITIAL_INSTITUTIONS) {
            AppState.institutions = window.AICTE_DATA.INITIAL_INSTITUTIONS;
        }

        // Load initial complaints
        if (window.ComplaintsService) {
            AppState.complaints = await window.ComplaintsService.loadInitial();
            AppState.filteredComplaints = [...AppState.complaints];
        }

        // Run initial overlap analysis
        refreshOverlaps();

        // Check active session
        updateAuthDisplay();

        // Bind UI Events
        bindEvents();

        // Render Initial Views
        renderKpis();
        renderComplaintsTable();
        renderOverlapView();
        populateFormDropdowns();
    }

    function renderStaticIcons() {
        document.querySelectorAll('[data-icon]').forEach(el => {
            const iconName = el.getAttribute('data-icon');
            el.innerHTML = window.IconLib ? window.IconLib.get(iconName) : '';
        });
    }

    function bindEvents() {
        // Navigation Switchers
        if (dom.btnGatewayNav) dom.btnGatewayNav.addEventListener('click', () => switchPortal('GATEWAY'));
        if (dom.btnCitizenNav) dom.btnCitizenNav.addEventListener('click', () => {
            if (!window.Auth.isCitizen()) {
                openModal('modalCitizenAuth');
            } else {
                switchPortal('CITIZEN');
            }
        });
        if (dom.btnSolverNav) dom.btnSolverNav.addEventListener('click', () => {
            if (!window.Auth.isSolver()) {
                openModal('modalSolverAuth');
            } else {
                switchPortal('SOLVER');
            }
        });

        // Gateway Entry Cards
        const btnEnterCitizen = document.getElementById('btnEnterCitizen');
        if (btnEnterCitizen) btnEnterCitizen.addEventListener('click', () => {
            if (!window.Auth.isCitizen()) {
                openModal('modalCitizenAuth');
            } else {
                switchPortal('CITIZEN');
            }
        });

        const btnEnterSolver = document.getElementById('btnEnterSolver');
        if (btnEnterSolver) btnEnterSolver.addEventListener('click', () => {
            if (!window.Auth.isSolver()) {
                openModal('modalSolverAuth');
            } else {
                switchPortal('SOLVER');
            }
        });

        // Officer Tab Buttons
        document.querySelectorAll('.officer-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.getAttribute('data-tab');
                switchOfficerTab(target);
            });
        });

        // Search & Filter Inputs
        const searchInput = document.getElementById('complaintSearchInput');
        if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 250));

        const filterStatus = document.getElementById('filterStatusSelect');
        if (filterStatus) filterStatus.addEventListener('change', applyFilters);

        const filterBureau = document.getElementById('filterBureauSelect');
        if (filterBureau) filterBureau.addEventListener('change', applyFilters);

        // Citizen Grievance Form Submission
        const lodgeForm = document.getElementById('formLodgeGrievance');
        if (lodgeForm) {
            lodgeForm.addEventListener('submit', handleLodgeGrievance);
        }

        // Institution Select autofill
        const instSelect = document.getElementById('complaintInstitutionSelect');
        if (instSelect) {
            instSelect.addEventListener('change', (e) => {
                const selectedPid = e.target.value;
                const inst = AppState.institutions.find(i => i.permanentId === selectedPid);
                const pidInput = document.getElementById('complaintPidInput');
                if (pidInput && inst) {
                    pidInput.value = inst.permanentId;
                }
            });
        }

        // Solver Quick-Select Persona Chips
        document.querySelectorAll('.solver-chip-item').forEach(chip => {
            chip.addEventListener('click', () => {
                const email = chip.getAttribute('data-email');
                const pass = chip.getAttribute('data-pass');
                const emailInput = document.getElementById('solverEmailInput');
                const passInput = document.getElementById('solverPassInput');
                if (emailInput && passInput) {
                    emailInput.value = email;
                    passInput.value = pass;
                    showToast('Selected: ' + email, 'info');
                }
            });
        });

        // Citizen Auth Form (Tabs: Login / Register)
        const citizenAuthForm = document.getElementById('citizenAuthForm');
        if (citizenAuthForm) {
            citizenAuthForm.addEventListener('submit', handleCitizenAuthSubmit);
        }

        // Solver Auth Form
        const solverAuthForm = document.getElementById('solverAuthForm');
        if (solverAuthForm) {
            solverAuthForm.addEventListener('submit', handleSolverAuthSubmit);
        }

        // 10,000 Request Simulator Controls
        const btnRun10k = document.getElementById('btnStart10kSim');
        if (btnRun10k) {
            btnRun10k.addEventListener('click', runStressBenchmark);
        }

        // Close Modal Handlers
        document.querySelectorAll('.modal-close-trigger').forEach(btn => {
            btn.addEventListener('click', () => {
                closeAllModals();
            });
        });
    }

    function switchPortal(portalName) {
        AppState.activePortal = portalName;

        // Toggle portal container visibility
        if (dom.gatewayView) dom.gatewayView.classList.toggle('active', portalName === 'GATEWAY');
        if (dom.citizenView) dom.citizenView.classList.toggle('active', portalName === 'CITIZEN');
        if (dom.solverView) dom.solverView.classList.toggle('active', portalName === 'SOLVER');

        // Update Nav Switcher Buttons
        if (dom.btnGatewayNav) dom.btnGatewayNav.classList.toggle('active', portalName === 'GATEWAY');
        if (dom.btnCitizenNav) dom.btnCitizenNav.classList.toggle('active', portalName === 'CITIZEN');
        if (dom.btnSolverNav) dom.btnSolverNav.classList.toggle('active', portalName === 'SOLVER');

        // Refresh views
        if (portalName === 'SOLVER') {
            refreshOverlaps();
            renderKpis();
            renderComplaintsTable();
        } else if (portalName === 'CITIZEN') {
            renderCitizenComplaints();
        }
    }

    function switchOfficerTab(tabName) {
        AppState.officerTab = tabName;

        document.querySelectorAll('.officer-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        document.querySelectorAll('.officer-subview').forEach(view => {
            view.classList.toggle('active', view.getAttribute('data-subview') === tabName);
        });

        if (tabName === 'OVERLAPS') {
            renderOverlapView();
        }
    }

    function refreshOverlaps() {
        if (window.OverlapEngine && AppState.complaints.length > 0) {
            AppState.overlaps = window.OverlapEngine.analyzeOverlaps(AppState.complaints);
        } else {
            AppState.overlaps = [];
        }
        renderOverlapAlertBanner();
    }

    function renderOverlapAlertBanner() {
        const bannerBox = document.getElementById('overlapBannerContainer');
        if (!bannerBox) return;

        if (AppState.overlaps.length === 0) {
            bannerBox.style.display = 'none';
            return;
        }

        bannerBox.style.display = 'block';
        const totalInstitutions = AppState.overlaps.length;
        const totalCases = AppState.overlaps.reduce((acc, curr) => acc + curr.totalCases, 0);

        bannerBox.innerHTML = `
            <div class="overlap-alert-banner">
                <div class="overlap-alert-content">
                    <div class="overlap-alert-icon-box">
                        ${window.IconLib.get('overlapAlert', 'svg-icon-lg')}
                    </div>
                    <div>
                        <div class="overlap-alert-title">Potential Overlapping Cases - Multi-Bureau Coordination Required</div>
                        <div class="overlap-alert-desc">
                            The centralized cross-cell analysis engine has flagged <strong>${totalInstitutions} institutions</strong> with <strong>${totalCases} parallel active grievances</strong> spanning across Regulation Bureau (RB), PGRC, and Regional Offices.
                        </div>
                        <div class="overlap-pills">
                            ${AppState.overlaps.map(o => `
                                <span class="overlap-pill">${o.institutionName} (${o.bureaus.join(' + ')})</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <button class="btn btn-amber btn-sm" id="btnViewOverlapMatrix">
                    ${window.IconLib.get('gitMerge')} View Overlap Matrix
                </button>
            </div>
        `;

        const btnView = document.getElementById('btnViewOverlapMatrix');
        if (btnView) {
            btnView.addEventListener('click', () => {
                switchPortal('SOLVER');
                switchOfficerTab('OVERLAPS');
            });
        }
    }

    function renderKpis() {
        const total = AppState.complaints.length;
        const pending = AppState.complaints.filter(c => c.status === 'PENDING').length;
        const underProcess = AppState.complaints.filter(c => c.status === 'UNDER_PROCESS').length;
        const disposed = AppState.complaints.filter(c => c.status === 'DISPOSED').length;
        const escalated = AppState.complaints.filter(c => c.status === 'ESCALATED').length;
        const breached = AppState.complaints.filter(c => c.isSlaBreached || c.daysRemaining < 0).length;
        const overlapsCount = AppState.overlaps.length;

        setText('kpiTotalVal', total);
        setText('kpiPendingVal', pending);
        setText('kpiProcessVal', underProcess);
        setText('kpiDisposedVal', disposed);
        setText('kpiEscalatedVal', escalated);
        setText('kpiOverlapsVal', overlapsCount);
    }

    function renderComplaintsTable() {
        const tbody = document.getElementById('complaintsTableBody');
        if (!tbody) return;

        const list = AppState.filteredComplaints;
        if (list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        No grievance cases match the specified filter criteria.
                    </td>
                </tr>
            `;
            return;
        }

        // Map overlapping institution IDs for fast row highlighting
        const overlapIds = new Set(AppState.overlaps.map(o => o.permanentId));

        tbody.innerHTML = list.map(c => {
            const hasOverlap = overlapIds.has(c.permanentId);
            const statusBadgeClass = 
                c.status === 'PENDING' ? 'badge-pending' :
                c.status === 'UNDER_PROCESS' ? 'badge-process' :
                c.status === 'DISPOSED' ? 'badge-disposed' :
                c.status === 'ESCALATED' ? 'badge-escalated' : 'badge-transferred';

            return `
                <tr class="${hasOverlap ? 'row-overlap' : ''}">
                    <td>
                        <strong style="color: var(--color-primary);">${c.complaintId}</strong>
                        <div style="font-size: 11px; color: var(--text-muted);">${formatDate(c.dateReceived)}</div>
                    </td>
                    <td>
                        <div style="font-weight: 600; color: var(--color-primary-dark);">${c.institutionName}</div>
                        <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">AICTE ID: ${c.permanentId}</div>
                        ${hasOverlap ? `
                            <span class="badge badge-overlap" style="margin-top: 4px;">
                                ${window.IconLib.get('overlapAlert')} Cross-Bureau Overlap
                            </span>
                        ` : ''}
                    </td>
                    <td>
                        <span style="font-size: 12px; font-weight: 500;">${c.category}</span>
                    </td>
                    <td>
                        <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">${c.assignedBureau}</span>
                    </td>
                    <td>
                        <span class="badge ${statusBadgeClass}">
                            ${c.status.replace('_', ' ')}
                        </span>
                    </td>
                    <td>
                        <div style="font-size: 12px; font-weight: 600;">${c.assignedOfficer}</div>
                    </td>
                    <td>
                        <div style="font-size: 12px; font-weight: 700; color: ${c.daysRemaining < 5 ? 'var(--color-danger)' : 'var(--text-secondary)'};">
                            ${c.daysRemaining} Days
                        </div>
                        <div style="font-size: 10px; color: var(--text-muted);">SLA: ${c.slaDeadline}</div>
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-outline btn-sm action-view-btn" data-id="${c.complaintId}">
                                ${window.IconLib.get('eye')} View
                            </button>
                            <button class="btn btn-primary btn-sm action-edit-btn" data-id="${c.complaintId}">
                                ${window.IconLib.get('scale')} Action
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach action handlers
        tbody.querySelectorAll('.action-view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openCaseDetail(id);
            });
        });

        tbody.querySelectorAll('.action-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openCaseActionModal(id);
            });
        });
    }

    function renderOverlapView() {
        const grid = document.getElementById('overlapMatrixGrid');
        if (!grid) return;

        if (AppState.overlaps.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; background: #FFFFFF; padding: 40px; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border-light);">
                    <div style="color: var(--color-success); margin-bottom: 8px;">
                        ${window.IconLib.get('checkCircle', 'svg-icon-xl')}
                    </div>
                    <h3>No Active Cross-Bureau Overlaps</h3>
                    <p style="margin-top: 6px;">All active grievances are assigned to distinct bureaus with zero recorded jurisdiction collisions.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = AppState.overlaps.map(o => `
            <div class="overlap-card">
                <div class="overlap-card-top">
                    <div>
                        <div class="overlap-inst-title">${o.institutionName}</div>
                        <div class="overlap-inst-id">AICTE Permanent ID: ${o.permanentId}</div>
                    </div>
                    <span class="badge ${o.badgeClass}">
                        ${window.IconLib.get('overlapAlert')} ${o.severity} OVERLAP
                    </span>
                </div>

                <div class="overlap-advisory-box">
                    <strong>Coordination Advisory:</strong> ${o.recommendedAction}
                </div>

                <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-top: 12px;">
                    CONCURRENT CASES (${o.totalCases} ACTIVE ACROSS BUREAUS):
                </div>

                <div class="overlap-cases-list">
                    ${o.complaints.map(c => `
                        <div class="overlap-case-item">
                            <div>
                                <strong style="color: var(--color-primary);">${c.complaintId}</strong>
                                <div style="color: var(--text-muted); font-size: 11px;">${c.category}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 600; font-size: 11px; color: var(--color-primary-dark);">${c.assignedBureau}</div>
                                <span class="badge ${c.status === 'PENDING' ? 'badge-pending' : 'badge-process'}">${c.status}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px;">
                    <button class="btn btn-outline btn-sm btn-view-inst-history" data-pid="${o.permanentId}">
                        ${window.IconLib.get('fileText')} Institution History
                    </button>
                    <button class="btn btn-amber btn-sm btn-init-joint-coord" data-pid="${o.permanentId}">
                        ${window.IconLib.get('gitMerge')} Initiate Joint Coordination
                    </button>
                </div>
            </div>
        `).join('');

        // Bind coordination button
        grid.querySelectorAll('.btn-init-joint-coord').forEach(btn => {
            btn.addEventListener('click', async () => {
                const pid = btn.getAttribute('data-pid');
                const session = window.Auth.getSession();
                const officerName = session ? session.user.fullName : 'Lead Investigating Officer';
                const bureau = session ? session.user.bureau : 'Regulation Bureau (RB)';

                await window.ComplaintsService.initiateJointCoordination(
                    pid,
                    bureau,
                    officerName,
                    'Joint committee convened between Regulation Bureau and PGRC to issue unified regulatory notice.'
                );

                showToast('Joint Cross-Bureau Coordination protocol initiated successfully', 'success');
                AppState.complaints = window.ComplaintsService.getAll();
                AppState.filteredComplaints = [...AppState.complaints];
                refreshOverlaps();
                renderComplaintsTable();
                renderOverlapView();
            });
        });
    }

    function renderCitizenComplaints() {
        const container = document.getElementById('citizenMyGrievancesList');
        if (!container) return;

        const session = window.Auth.getSession();
        const userEmail = session ? session.user.email : 'student.test@gmail.com';
        const myCases = window.ComplaintsService.getByComplainant(userEmail);

        if (myCases.length === 0) {
            container.innerHTML = `
                <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 40px; text-align: center;">
                    <div style="color: var(--text-muted); margin-bottom: 8px;">
                        ${window.IconLib.get('fileText', 'svg-icon-xl')}
                    </div>
                    <h4>No Grievances Lodged Yet</h4>
                    <p style="font-size: 13px; margin-top: 4px;">Submit a new grievance using the form on the left. You can track real-time resolution progress here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = myCases.map(c => `
            <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 20px; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <strong style="font-size: 15px; color: var(--color-primary);">${c.complaintId}</strong>
                        <div style="font-size: 13px; font-weight: 600; color: var(--color-primary-dark); margin-top: 2px;">${c.institutionName}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">Category: ${c.category}</div>
                    </div>
                    <span class="badge ${c.status === 'PENDING' ? 'badge-pending' : c.status === 'UNDER_PROCESS' ? 'badge-process' : 'badge-disposed'}">
                        ${c.status.replace('_', ' ')}
                    </span>
                </div>

                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.45;">
                    ${c.subject}
                </p>

                <div style="background: #F8FAFC; border-radius: var(--radius-sm); padding: 12px 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                        <span>Assigned Bureau: <strong>${c.assignedBureau}</strong></span>
                        <span>Officer: <strong>${c.assignedOfficer}</strong></span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        Last Action: ${c.lastAction}
                    </div>
                </div>

                <div class="timeline-tracker">
                    ${c.actions.map((act, idx) => `
                        <div class="timeline-item">
                            <div class="timeline-dot ${idx === 0 ? 'completed' : 'active'}"></div>
                            <div class="timeline-heading">${act.action}</div>
                            <div class="timeline-meta">${act.date} | Bureau: ${act.bureau}</div>
                            <div class="timeline-text">${act.remarks}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; border-top: 1px solid var(--border-light); padding-top: 12px;">
                    <button class="btn btn-outline btn-sm print-receipt-btn" data-id="${c.complaintId}">
                        ${window.IconLib.get('download')} Download Formal Acknowledgment Slip
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.print-receipt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                printAcknowledgmentSlip(id);
            });
        });
    }

    async function handleLodgeGrievance(e) {
        e.preventDefault();
        const permanentId = document.getElementById('complaintInstitutionSelect').value;
        const category = document.getElementById('complaintCategorySelect').value;
        const subject = document.getElementById('complaintSubjectInput').value;
        const description = document.getElementById('complaintDescriptionInput').value;
        const priority = document.getElementById('complaintPrioritySelect').value;

        if (!permanentId || !category || !subject || !description) {
            showToast('Please fill all mandatory fields', 'warning');
            return;
        }

        const inst = AppState.institutions.find(i => i.permanentId === permanentId);
        const session = window.Auth.getSession();

        const payload = {
            permanentId,
            institutionName: inst ? inst.name : 'Technical Institution',
            category,
            subject,
            description,
            priority,
            complainantEmail: session ? session.user.email : 'student.test@gmail.com',
            complainantName: session ? session.user.fullName : 'Citizen Complainant'
        };

        try {
            const newComp = await window.ComplaintsService.createComplaint(payload);
            showToast(`Grievance registered with Case ID: ${newComp.complaintId}`, 'success');
            document.getElementById('formLodgeGrievance').reset();

            // Refresh state
            AppState.complaints = window.ComplaintsService.getAll();
            AppState.filteredComplaints = [...AppState.complaints];
            refreshOverlaps();
            renderCitizenComplaints();
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    async function handleCitizenAuthSubmit(e) {
        e.preventDefault();
        const mode = document.getElementById('citizenAuthModeInput').value; // 'LOGIN' or 'REGISTER'
        const email = document.getElementById('citizenEmailInput').value;
        const password = document.getElementById('citizenPasswordInput').value;
        const fullName = document.getElementById('citizenNameInput') ? document.getElementById('citizenNameInput').value : '';
        const phone = document.getElementById('citizenPhoneInput') ? document.getElementById('citizenPhoneInput').value : '';
        const userType = document.getElementById('citizenTypeSelect') ? document.getElementById('citizenTypeSelect').value : 'STUDENT';

        try {
            if (mode === 'LOGIN') {
                const session = await window.Auth.loginCitizen(email, password);
                showToast(`Welcome back, ${session.user.fullName}`, 'success');
            } else {
                const session = await window.Auth.registerCitizen({ fullName, email, phone, password, userType });
                showToast(`Registration Successful! Welcome to AICTE Grievance Portal, ${session.user.fullName}`, 'success');
            }
            closeAllModals();
            updateAuthDisplay();
            switchPortal('CITIZEN');
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    async function handleSolverAuthSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('solverEmailInput').value;
        const pass = document.getElementById('solverPassInput').value;

        try {
            const session = await window.Auth.loginSolver(email, pass);
            showToast(`Official Access Granted: ${session.user.fullName} (${session.user.bureau})`, 'success');
            closeAllModals();
            updateAuthDisplay();
            switchPortal('SOLVER');
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    function updateAuthDisplay() {
        const session = window.Auth.getSession();
        const box = dom.authStatusBox;
        if (!box) return;

        if (!session) {
            box.innerHTML = `
                <button class="btn btn-outline btn-sm" id="btnHeaderCitizenLogin">
                    ${window.IconLib.get('user')} Citizen Login
                </button>
                <button class="btn btn-primary btn-sm" id="btnHeaderSolverLogin">
                    ${window.IconLib.get('lock')} Official Login
                </button>
            `;

            document.getElementById('btnHeaderCitizenLogin').addEventListener('click', () => openModal('modalCitizenAuth'));
            document.getElementById('btnHeaderSolverLogin').addEventListener('click', () => openModal('modalSolverAuth'));

            // Clear officer bar profile
            const profileChip = document.getElementById('officerProfileDisplay');
            if (profileChip) profileChip.style.display = 'none';
        } else {
            const isSolver = session.type === 'SOLVER';
            box.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="text-align: right;">
                        <div style="font-size: 12px; font-weight: 700; color: var(--color-primary-dark);">${session.user.fullName}</div>
                        <div style="font-size: 10px; color: var(--text-muted);">${isSolver ? session.user.designation : session.user.email}</div>
                    </div>
                    <button class="btn btn-outline btn-sm" id="btnHeaderLogout">
                        ${window.IconLib.get('logout')} Sign Out
                    </button>
                </div>
            `;

            document.getElementById('btnHeaderLogout').addEventListener('click', () => {
                window.Auth.logout();
                showToast('Signed out of AICTE Portal session', 'info');
                updateAuthDisplay();
                switchPortal('GATEWAY');
            });

            // Update officer profile header if solver
            const profileChip = document.getElementById('officerProfileDisplay');
            if (profileChip && isSolver) {
                profileChip.style.display = 'flex';
                setText('officerHeaderName', session.user.fullName);
                setText('officerHeaderRole', `${session.user.designation} (${session.user.bureau})`);
            }
        }
    }

    function openCaseDetail(complaintId) {
        const comp = window.ComplaintsService.getById(complaintId);
        if (!comp) return;

        AppState.selectedComplaint = comp;
        const modal = dom.modalCaseDetail;
        if (!modal) return;

        setText('detailCaseId', comp.complaintId);
        setText('detailInstitution', comp.institutionName);
        setText('detailPid', `AICTE ID: ${comp.permanentId}`);
        setText('detailCategory', comp.category);
        setText('detailBureau', comp.assignedBureau);
        setText('detailOfficer', comp.assignedOfficer);
        setText('detailStatus', comp.status);
        setText('detailDate', formatDate(comp.dateReceived));
        setText('detailSla', `${comp.slaDeadline} (${comp.daysRemaining} days left)`);
        setText('detailSubject', comp.subject);
        setText('detailDescription', comp.description);
        setText('detailComplainant', `${comp.complainantName} (${comp.complainantEmail})`);

        // Render Action Timeline
        const timelineWrap = document.getElementById('detailAuditTimeline');
        if (timelineWrap) {
            timelineWrap.innerHTML = comp.actions.map(act => `
                <div class="timeline-item">
                    <div class="timeline-dot completed"></div>
                    <div class="timeline-heading">${act.action}</div>
                    <div class="timeline-meta">${act.date} | ${act.officer} (${act.bureau})</div>
                    <div class="timeline-text">${act.remarks}</div>
                </div>
            `).join('');
        }

        openModal('modalCaseDetail');
    }

    function openCaseActionModal(complaintId) {
        const comp = window.ComplaintsService.getById(complaintId);
        if (!comp) return;

        AppState.selectedComplaint = comp;
        const modal = dom.modalCaseAction;
        if (!modal) return;

        setText('actionModalCaseId', comp.complaintId);
        setText('actionModalInstName', comp.institutionName);
        document.getElementById('actionModalStatusSelect').value = comp.status;
        document.getElementById('actionModalBureauSelect').value = comp.assignedBureau;
        document.getElementById('actionModalOfficerInput').value = comp.assignedOfficer;

        // Submit listener
        const form = document.getElementById('formUpdateCaseAction');
        form.onsubmit = async (e) => {
            e.preventDefault();
            const status = document.getElementById('actionModalStatusSelect').value;
            const bureau = document.getElementById('actionModalBureauSelect').value;
            const officer = document.getElementById('actionModalOfficerInput').value;
            const actionText = document.getElementById('actionModalActionInput').value;
            const remarks = document.getElementById('actionModalRemarksInput').value;
            const nextAction = document.getElementById('actionModalNextActionInput').value;

            try {
                await window.ComplaintsService.updateAction(comp.complaintId, {
                    status,
                    bureau,
                    officer,
                    action: actionText,
                    remarks,
                    nextAction
                });

                showToast(`Case ${comp.complaintId} action recorded successfully`, 'success');
                closeAllModals();
                AppState.complaints = window.ComplaintsService.getAll();
                AppState.filteredComplaints = [...AppState.complaints];
                refreshOverlaps();
                renderKpis();
                renderComplaintsTable();
            } catch (err) {
                showToast(err.message, 'danger');
            }
        };

        openModal('modalCaseAction');
    }

    // 10,000 Request Concurrency Stress Benchmark
    async function runStressBenchmark() {
        const btn = document.getElementById('btnStart10kSim');
        if (btn) btn.disabled = true;

        showToast('Initiating 10,000 synthetic grievance stress test with Bloom Filter pre-screening...', 'info');

        const fillEl = document.getElementById('simProgressFill');
        const countEl = document.getElementById('simProcessedCount');
        const tpsEl = document.getElementById('simThroughputVal');
        const latEl = document.getElementById('simLatencyVal');
        const nodesEl = document.getElementById('simNodesVal');
        const bloomBitsEl = document.getElementById('simBloomBitsVal');
        const bloomFpEl = document.getElementById('simBloomFpVal');

        const result = await window.LoadSimulator.runBenchmark(10000, (p) => {
            if (fillEl) fillEl.style.width = p.progressPercent + '%';
            if (countEl) countEl.innerText = p.processed.toLocaleString() + ' / ' + p.target.toLocaleString();
            if (tpsEl) tpsEl.innerText = p.throughputRps.toLocaleString() + ' req/s';
            if (latEl) latEl.innerText = p.avgLatencyMs + ' ms';
            if (nodesEl) nodesEl.innerText = p.activeNodes + ' Active Replicas';
            if (bloomBitsEl) bloomBitsEl.innerText = p.bloomStats.setBits.toLocaleString() + ' (' + p.bloomStats.bitUtilizationPercent + '%)';
            if (bloomFpEl) bloomFpEl.innerText = p.bloomStats.falsePositiveRatePercent + '%';
        });

        showToast(`10,000 Request Benchmark Complete: Ingested at ${result.averageThroughputRps} req/s in ${result.durationSeconds}s!`, 'success');

        if (btn) btn.disabled = false;
    }

    function applyFilters() {
        const search = (document.getElementById('complaintSearchInput').value || '').toLowerCase().trim();
        const status = document.getElementById('filterStatusSelect').value;
        const bureau = document.getElementById('filterBureauSelect').value;

        AppState.filteredComplaints = AppState.complaints.filter(c => {
            const matchStatus = status === 'ALL' || c.status === status;
            const matchBureau = bureau === 'ALL' || c.assignedBureau === bureau;
            const matchSearch = !search || (
                c.complaintId.toLowerCase().includes(search) ||
                c.institutionName.toLowerCase().includes(search) ||
                c.permanentId.toLowerCase().includes(search) ||
                c.category.toLowerCase().includes(search) ||
                c.subject.toLowerCase().includes(search)
            );
            return matchStatus && matchBureau && matchSearch;
        });

        renderComplaintsTable();
    }

    function populateFormDropdowns() {
        // Institution Select in Citizen View
        const instSelect = document.getElementById('complaintInstitutionSelect');
        if (instSelect && AppState.institutions.length > 0) {
            instSelect.innerHTML = `
                <option value="" disabled selected>-- Select AICTE Approved Institution --</option>
                ${AppState.institutions.map(i => `
                    <option value="${i.permanentId}">${i.name} (${i.permanentId}) - ${i.city}, ${i.state}</option>
                `).join('')}
            `;
        }

        // Categories Select
        const catSelect = document.getElementById('complaintCategorySelect');
        if (catSelect && window.AICTE_DATA && window.AICTE_DATA.CATEGORIES) {
            catSelect.innerHTML = `
                <option value="" disabled selected>-- Select Nature of Grievance --</option>
                ${window.AICTE_DATA.CATEGORIES.map(c => `
                    <option value="${c}">${c}</option>
                `).join('')}
            `;
        }
    }

    function printAcknowledgmentSlip(complaintId) {
        const comp = window.ComplaintsService.getById(complaintId);
        if (!comp) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>AICTE Grievance Acknowledgment - ${comp.complaintId}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; }
                    .gov-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; }
                    .logo-title { font-size: 20px; font-weight: bold; text-transform: uppercase; }
                    .sub { font-size: 13px; }
                    .receipt-badge { float: right; font-family: monospace; font-size: 14px; font-weight: bold; }
                    .grid { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .grid td { padding: 8px 12px; border: 1px solid #ccc; font-size: 13px; }
                    .grid td.label { font-weight: bold; background: #f5f5f5; width: 35%; }
                    .footer { margin-top: 40px; font-size: 11px; text-align: center; border-top: 1px solid #ddd; padding-top: 12px; }
                </style>
            </head>
            <body>
                <div class="gov-header">
                    <div class="logo-title">All India Council for Technical Education (AICTE)</div>
                    <div class="sub">Ministry of Education, Government of India | Statutory Grievance Redressal Gateway</div>
                    <div class="sub" style="margin-top: 4px; font-weight: bold;">OFFICIAL COMPLAINT ACKNOWLEDGMENT & SLA ADVISORY</div>
                </div>

                <div class="receipt-badge">REFERENCE: ${comp.complaintId}</div>
                <div style="font-size: 13px;">Date of Receipt: ${new Date(comp.dateReceived).toLocaleString()}</div>

                <table class="grid">
                    <tr><td class="label">Institution Name</td><td>${comp.institutionName}</td></tr>
                    <tr><td class="label">AICTE Permanent ID</td><td>${comp.permanentId}</td></tr>
                    <tr><td class="label">Complainant</td><td>${comp.complainantName} (${comp.complainantEmail})</td></tr>
                    <tr><td class="label">Grievance Category</td><td>${comp.category}</td></tr>
                    <tr><td class="label">Assigned AICTE Bureau</td><td>${comp.assignedBureau}</td></tr>
                    <tr><td class="label">Current Status</td><td>${comp.status}</td></tr>
                    <tr><td class="label">Mandatory SLA Timeline</td><td>30 Calendar Days (Disposal Target: ${comp.slaDeadline})</td></tr>
                    <tr><td class="label">Summary of Grievance</td><td>${comp.subject}</td></tr>
                </table>

                <div style="font-size: 12px; margin-top: 20px;">
                    <strong>Note:</strong> This is an electronically generated statutory acknowledgment slip under AICTE Centralized Institution Monitoring Regulation (SIH 2026). It does not require physical signature.
                </div>

                <div class="footer">
                    Nelson Mandela Marg, Vasant Kunj, New Delhi-110070 | Portal: aicte-india.org | Case Reference: ${comp.complaintId}
                </div>
                <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // Modal Helpers
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    // Toast Notification Manager
    function showToast(message, type = 'info') {
        const container = dom.toastContainer;
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const iconName = type === 'success' ? 'checkCircle' : type === 'warning' ? 'overlapAlert' : type === 'danger' ? 'overlapAlert' : 'activity';
        toast.innerHTML = `
            ${window.IconLib.get(iconName)}
            <span>${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4200);
    }

    // Utility Helpers
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }

    function formatDate(isoStr) {
        if (!isoStr) return '';
        try {
            return new Date(isoStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return isoStr;
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
