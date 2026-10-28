/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * Dual-Portal Authentication & Session Manager (SIH 2026)
 * Solvers (Authorized Officials Only) vs Citizens (Registration & Login)
 * =========================================================================
 */

(function(global) {
    const SOLVER_ACCOUNTS = {
        "usingla_be26@thapar.edu": {
            pass: "udishsingla",
            name: "Er. Udish Singla",
            designation: "Chief Administrative Officer & Member Secretary",
            bureau: "Regulation Bureau (RB)",
            role: "CHIEF_ADMIN",
            phone: "+91 98765 43210"
        },
        "mmskunjal_be26@thapar.edu": {
            pass: "kunjalsingla",
            name: "Ms. Kunjal Singla",
            designation: "Director, Public Grievance Redressal Cell",
            bureau: "Public Grievance Redressal Cell (PGRC)",
            role: "BUREAU_HEAD",
            phone: "+91 98765 43211"
        },
        "dbansal_be26@thapar.edu": {
            pass: "dharuvbansal",
            name: "Dr. Dharuv Bansal",
            designation: "Joint Director (Institutional Regulation)",
            bureau: "Regulation Bureau (RB)",
            role: "INVESTIGATING_OFFICER",
            phone: "+91 98765 43212"
        },
        "gparvesh_be26@thapar.edu": {
            pass: "parveshgarg",
            name: "Shri Parvesh Garg",
            designation: "Regional Officer & Incharge",
            bureau: "Northern Regional Office (NRO)",
            role: "REGIONAL_COORDINATOR",
            phone: "+91 98765 43213"
        },
        "iishika_be26@thapar.edu": {
            pass: "ishika",
            name: "Adv. Ishika",
            designation: "Senior Legal Counsel & Statutory Compliance Head",
            bureau: "Legal & Compliance Cell",
            role: "INVESTIGATING_OFFICER",
            phone: "+91 98765 43214"
        },
        "ddrishti_be26@thapar.edu": {
            pass: "drishti",
            name: "Prof. Drishti",
            designation: "Appellate Ombudsman & Oversight Chair",
            bureau: "Appellate Authority / Grievance Oversight",
            role: "BUREAU_HEAD",
            phone: "+91 98765 43215"
        }
    };

    class AuthManager {
        constructor() {
            this.SESSION_KEY = 'aicte_active_session_2026';
            this.USERS_KEY = 'aicte_registered_users_2026';
            this.initLocalUsers();
        }

        initLocalUsers() {
            if (!localStorage.getItem(this.USERS_KEY)) {
                const initialUsers = [
                    {
                        email: "student.test@gmail.com",
                        password: "password123",
                        fullName: "Rahul Verma",
                        phone: "+91 98111 22334",
                        userType: "STUDENT"
                    },
                    {
                        email: "faculty.rep@gmail.com",
                        password: "password123",
                        fullName: "Dr. Rajesh Sharma",
                        phone: "+91 98222 33445",
                        userType: "FACULTY"
                    },
                    {
                        email: "parent.ananya@gmail.com",
                        password: "password123",
                        fullName: "Ananya Deshmukh",
                        phone: "+91 98333 44556",
                        userType: "PARENT"
                    }
                ];
                localStorage.setItem(this.USERS_KEY, JSON.stringify(initialUsers));
            }
        }

        getRegisteredUsers() {
            try {
                return JSON.parse(localStorage.getItem(this.USERS_KEY)) || [];
            } catch (e) {
                return [];
            }
        }

        /**
         * Check whether citizen exists by Email / Gmail ID
         */
        checkUserExists(email) {
            const clean = String(email || '').trim().toLowerCase();
            const users = this.getRegisteredUsers();
            return users.some(u => u.email.toLowerCase() === clean);
        }

        /**
         * Citizen Registration
         */
        async registerCitizen({ fullName, email, phone, password, userType }) {
            const cleanEmail = String(email || '').trim().toLowerCase();
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                throw new Error("Invalid Email Address format. Please provide a valid email (e.g. name@gmail.com).");
            }

            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters long.");
            }

            // Check if user already exists
            if (this.checkUserExists(cleanEmail)) {
                throw new Error("An account with this email address already exists. Please proceed to Sign In.");
            }

            // Try server registration if available
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName, email: cleanEmail, phone, password, userType })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!data.success) throw new Error(data.message || 'Registration failed');
                }
            } catch (err) {
                // Server might be in local mode; fallback to local storage
                console.log('[Auth] Local fallback for registration');
            }

            const newUser = {
                id: Date.now(),
                fullName: fullName.trim(),
                email: cleanEmail,
                phone: phone.trim(),
                password: password,
                userType: userType || "STUDENT",
                registeredAt: new Date().toISOString()
            };

            const users = this.getRegisteredUsers();
            users.push(newUser);
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

            // Auto-login newly registered citizen
            const session = {
                type: 'CITIZEN',
                user: {
                    fullName: newUser.fullName,
                    email: newUser.email,
                    phone: newUser.phone,
                    userType: newUser.userType
                },
                token: 'citizen_session_' + Date.now()
            };
            this.setSession(session);
            return session;
        }

        /**
         * Citizen Login
         */
        async loginCitizen(email, password) {
            const cleanEmail = String(email || '').trim().toLowerCase();

            if (!cleanEmail) {
                throw new Error("Please enter your registered Gmail or Email ID.");
            }

            // Verify whether user exists
            if (!this.checkUserExists(cleanEmail)) {
                throw new Error("No account registered with this email (" + cleanEmail + "). Please click 'Create New Citizen Account' to register.");
            }

            const users = this.getRegisteredUsers();
            const user = users.find(u => u.email.toLowerCase() === cleanEmail);

            if (!user || user.password !== password) {
                throw new Error("Incorrect password. Please verify and try again.");
            }

            const session = {
                type: 'CITIZEN',
                user: {
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    userType: user.userType
                },
                token: 'citizen_session_' + Date.now()
            };
            this.setSession(session);
            return session;
        }

        /**
         * Solver (AICTE Official) Login - Restricted to authorized IDs only
         */
        async loginSolver(email, password) {
            const cleanEmail = String(email || '').trim().toLowerCase();

            const account = SOLVER_ACCOUNTS[cleanEmail];
            if (!account) {
                throw new Error("Access Denied: Email address is not in the authorized AICTE Redressal Official registry.");
            }

            if (account.pass !== password) {
                throw new Error("Authentication Failed: Invalid security password for official " + cleanEmail);
            }

            const session = {
                type: 'SOLVER',
                user: {
                    fullName: account.name,
                    email: cleanEmail,
                    designation: account.designation,
                    bureau: account.bureau,
                    role: account.role,
                    phone: account.phone
                },
                token: 'solver_session_' + Date.now()
            };
            this.setSession(session);
            return session;
        }

        setSession(session) {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }

        getSession() {
            try {
                const s = sessionStorage.getItem(this.SESSION_KEY);
                return s ? JSON.parse(s) : null;
            } catch (e) {
                return null;
            }
        }

        logout() {
            sessionStorage.removeItem(this.SESSION_KEY);
        }

        isLoggedIn() {
            return !!this.getSession();
        }

        isSolver() {
            const s = this.getSession();
            return s && s.type === 'SOLVER';
        }

        isCitizen() {
            const s = this.getSession();
            return s && s.type === 'CITIZEN';
        }

        getSolverList() {
            return Object.keys(SOLVER_ACCOUNTS).map(email => ({
                email,
                ...SOLVER_ACCOUNTS[email]
            }));
        }
    }

    global.Auth = new AuthManager();
})(typeof window !== 'undefined' ? window : global);
