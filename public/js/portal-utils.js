/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE) - SIH 2026
 * Unified Portal Utilities: Preloader, Scroll Progress, Dark Mode,
 * Site Search, Cookie Banner, UTM Tracking, Copy Buttons & Modals
 * =========================================================================
 */

(function (global) {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. UTM PARAMETER TRACKER
    // -------------------------------------------------------------------------
    function initUtmTracker() {
        try {
            const params = new URLSearchParams(window.location.search);
            const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'];
            let foundUtm = {};
            let hasAny = false;

            utmKeys.forEach(key => {
                if (params.has(key)) {
                    foundUtm[key] = params.get(key);
                    hasAny = true;
                }
            });

            if (hasAny) {
                sessionStorage.setItem('aicte_utm_tracking', JSON.stringify({
                    ...foundUtm,
                    capturedAt: new Date().toISOString(),
                    landingUrl: window.location.pathname
                }));
            }
        } catch (e) {
            console.warn('[UTM Tracker] Error capturing params:', e);
        }
    }

    function getUtmData() {
        try {
            const data = sessionStorage.getItem('aicte_utm_tracking');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // 2. SMOOTH PAGE PRELOADER & INITIAL ANIMATION
    // -------------------------------------------------------------------------
    function initPagePreloader() {
        let preloader = document.getElementById('page-preloader');
        
        // If not already in DOM, create one
        if (!preloader) {
            preloader = document.createElement('div');
            preloader.id = 'page-preloader';
            preloader.innerHTML = `
                <div class="preloader-emblem">
                    <div class="preloader-ring"></div>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                    </svg>
                </div>
                <div style="text-align: center;">
                    <h3 style="font-family:'Montserrat',sans-serif; font-weight:700; font-size:1.05rem; letter-spacing:0.5px; color:#F8FAFC; margin-bottom:0.25rem;">
                        AICTE Samadhan
                    </h3>
                    <p style="font-size:0.75rem; color:#94A3B8;" id="preloader-status-text">
                        Establishing Secure Session & Bureau Registry...
                    </p>
                </div>
                <div class="preloader-progress-track">
                    <div class="preloader-progress-bar" id="preloader-bar"></div>
                </div>
            `;
            document.body.prepend(preloader);
        }

        const bar = document.getElementById('preloader-bar');
        const statusText = document.getElementById('preloader-status-text');

        let progress = 15;
        if (bar) bar.style.width = '15%';

        const timer = setInterval(() => {
            progress += Math.floor(Math.random() * 25) + 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(timer);
                if (bar) bar.style.width = '100%';
                if (statusText) statusText.innerText = 'Verified & Ready';

                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    setTimeout(() => {
                        preloader.remove();
                    }, 650);
                }, 350);
            } else {
                if (bar) bar.style.width = `${progress}%`;
                if (progress > 50 && statusText) {
                    statusText.innerText = 'Synchronizing Statutory Grievance Index...';
                }
            }
        }, 80);
    }

    // -------------------------------------------------------------------------
    // 3. TOP SCROLL PROGRESS BAR
    // -------------------------------------------------------------------------
    function initScrollProgressBar() {
        let bar = document.getElementById('scroll-progress-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'scroll-progress-bar';
            document.body.appendChild(bar);
        }

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
        }, { passive: true });
    }

    // -------------------------------------------------------------------------
    // 4. SCROLL REVEAL (IntersectionObserver)
    // -------------------------------------------------------------------------
    function initScrollReveal() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    }

    // -------------------------------------------------------------------------
    // 5. DARK / LIGHT MODE TOGGLE
    // -------------------------------------------------------------------------
    function initThemeToggle() {
        const savedMode = localStorage.getItem('aicte_theme_mode') || 'dark';
        if (savedMode === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
        updateThemeToggleIcons();
    }

    function toggleLightDarkMode() {
        const isLight = document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('aicte_theme_mode', isLight ? 'light' : 'dark');
        updateThemeToggleIcons();
        
        if (typeof showToast === 'function') {
            showToast(`Switched to ${isLight ? 'Light' : 'Dark'} Mode`, 'info');
        }
    }

    function updateThemeToggleIcons() {
        const isLight = document.documentElement.classList.contains('light-mode');
        document.querySelectorAll('.theme-toggle-icon').forEach(icon => {
            if (isLight) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 6. BACK TO TOP BUTTON WITH CIRCULAR SVG PROGRESS
    // -------------------------------------------------------------------------
    function initBackToTop() {
        let btn = document.getElementById('back-to-top-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'back-to-top-btn';
            btn.setAttribute('aria-label', 'Back to top');
            btn.title = 'Back to top';
            btn.innerHTML = `
                <svg class="scroll-progress-svg" width="50" height="50" viewBox="0 0 50 50">
                    <circle class="scroll-progress-circle-bg" cx="25" cy="25" r="22"></circle>
                    <circle class="scroll-progress-circle" id="back-to-top-circle" cx="25" cy="25" r="22"></circle>
                </svg>
                <i class="fa-solid fa-arrow-up text-cyan-400 text-sm relative z-10" style="color:#06B6D4;"></i>
            `;
            document.body.appendChild(btn);
        }

        const circle = document.getElementById('back-to-top-circle');
        const circumference = 2 * Math.PI * 22; // ~138.23

        if (circle) {
            circle.style.strokeDasharray = `${circumference}`;
            circle.style.strokeDashoffset = `${circumference}`;
        }

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

            if (scrollTop > 260) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }

            if (circle) {
                const offset = circumference - (scrollPercent * circumference);
                circle.style.strokeDashoffset = `${offset}`;
            }
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // -------------------------------------------------------------------------
    // 7. SIMPLE COOKIE BANNER
    // -------------------------------------------------------------------------
    function initCookieBanner() {
        const consent = localStorage.getItem('aicte_cookie_consent');
        if (consent) return; // Already answered

        let banner = document.getElementById('cookie-consent-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'cookie-consent-banner';
            banner.innerHTML = `
                <div style="display:flex; align-items:flex-start; gap:0.85rem;">
                    <div style="padding:0.45rem; border-radius:0.5rem; background:rgba(99,102,241,0.2); color:#6366F1; flex-shrink:0;">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <div>
                        <h4 style="font-size:0.82rem; font-weight:700; color:#F8FAFC; margin-bottom:0.25rem;">
                            Privacy & Cookie Notice
                        </h4>
                        <p style="font-size:0.75rem; color:#94A3B8; line-height:1.45; margin-bottom:0.85rem;">
                            This portal uses essential session storage and statutory security tokens to safeguard your grievance submissions in accordance with the 
                            <a href="/privacy_policy.html" target="_blank" style="color:#06B6D4; text-decoration:underline;">Privacy Policy</a>.
                        </p>
                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                            <button id="btn-cookie-accept-all" style="padding:6px 14px; font-size:0.72rem; font-weight:700; border-radius:8px; background:#6366F1; color:#FFFFFF; border:none; cursor:pointer;">
                                Accept All
                            </button>
                            <button id="btn-cookie-essential" style="padding:6px 14px; font-size:0.72rem; font-weight:600; border-radius:8px; background:rgba(255,255,255,0.06); color:#CCD0CF; border:1px solid rgba(255,255,255,0.12); cursor:pointer;">
                                Essential Only
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);
        }

        setTimeout(() => {
            banner.classList.add('show');
        }, 1200);

        document.getElementById('btn-cookie-accept-all')?.addEventListener('click', () => {
            localStorage.setItem('aicte_cookie_consent', 'all');
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        });

        document.getElementById('btn-cookie-essential')?.addEventListener('click', () => {
            localStorage.setItem('aicte_cookie_consent', 'essential');
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        });
    }

    // -------------------------------------------------------------------------
    // 8. GLOBAL SITE SEARCH MODAL (Ctrl + K)
    // -------------------------------------------------------------------------
    const SEARCH_INDEX = [
        { title: "Lodge New Grievance", category: "Citizen Portal", url: "/user.html#lodge", desc: "Submit formal complaint regarding fee refunds, harassment or approval fraud." },
        { title: "My Tracked Cases", category: "Citizen Portal", url: "/user.html#cases", desc: "Real-time SLA status, assigned bureau, and official resolution timeline." },
        { title: "Regulation Bureau (RB)", category: "Bureaus", url: "/solver.html", desc: "Handles unapproved courses, seat violations, and statutory inspections." },
        { title: "Public Grievance Redressal Cell (PGRC)", category: "Bureaus", url: "/solver.html", desc: "Institutional harassment, ragging, and student welfare grievances." },
        { title: "Privacy Policy & Data Security", category: "Statutory", url: "/privacy_policy.html", desc: "Comprehensive data protection, Bloom filter deduplication, and citizen rights." },
        { title: "Cross-Bureau Overlap Redressal", category: "SIH Innovation", url: "/solver.html", desc: "Multi-cell algorithmic deduplication & fast pre-check mechanism." },
        { title: "Approval Process Handbook (APH)", category: "Regulations", url: "/privacy_policy.html", desc: "AICTE statutory regulations governing technical education institutions in India." },
        { title: "Official Solver Workspace", category: "AICTE Official", url: "/solver.html", desc: "Authorized desk for investigating officers, show-cause notices, and case disposal." }
    ];

    function initSiteSearch() {
        let modal = document.getElementById('site-search-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'site-search-modal';
            modal.innerHTML = `
                <div class="search-box-card" onclick="event.stopPropagation()">
                    <div class="search-input-wrapper">
                        <i class="fa-solid fa-magnifying-glass text-indigo-400" style="color:#6366F1;"></i>
                        <input type="text" id="site-search-input" class="search-input-field" placeholder="Search grievance topics, bureaus, regulations... (Esc to close)">
                        <span style="font-size:0.68rem; font-family:monospace; padding:3px 7px; border-radius:6px; background:rgba(255,255,255,0.08); color:#94A3B8;">ESC</span>
                    </div>
                    <div class="search-results-list" id="site-search-results">
                        <!-- Populated dynamically -->
                    </div>
                    <div style="padding:0.75rem 1.25rem; border-top:1px solid rgba(255,255,255,0.06); font-size:0.72rem; color:#64748B; display:flex; justify-content:space-between;">
                        <span>Navigate with keyboard or click</span>
                        <span>Shortcuts: <strong>Ctrl + K</strong> to search</span>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const input = document.getElementById('site-search-input');
        const resultsBox = document.getElementById('site-search-results');

        function renderResults(query = '') {
            const cleanQuery = query.toLowerCase().trim();
            const matches = SEARCH_INDEX.filter(item => 
                !cleanQuery || 
                item.title.toLowerCase().includes(cleanQuery) || 
                item.desc.toLowerCase().includes(cleanQuery) || 
                item.category.toLowerCase().includes(cleanQuery)
            );

            if (matches.length === 0) {
                resultsBox.innerHTML = `
                    <div style="text-align:center; padding:2rem; color:#64748B; font-size:0.8rem;">
                        No matching topics found for "${query}". Try searching "Grievance", "Privacy", or "Bureau".
                    </div>
                `;
                return;
            }

            resultsBox.innerHTML = matches.map(item => `
                <div class="search-result-item" onclick="window.location.href='${item.url}'">
                    <div>
                        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">
                            <span style="font-size:0.85rem; font-weight:600; color:#F8FAFC;">${item.title}</span>
                            <span style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:rgba(99,102,241,0.2); color:#818CF8; font-weight:600;">${item.category}</span>
                        </div>
                        <p style="font-size:0.75rem; color:#94A3B8; margin:0;">${item.desc}</p>
                    </div>
                    <i class="fa-solid fa-chevron-right text-xs" style="color:#64748B;"></i>
                </div>
            `).join('');
        }

        renderResults('');

        input.addEventListener('input', (e) => {
            renderResults(e.target.value);
        });

        // Toggle modal
        function openSearch() {
            modal.classList.add('active');
            input.value = '';
            renderResults('');
            setTimeout(() => input.focus(), 50);
        }

        function closeSearch() {
            modal.classList.remove('active');
        }

        modal.addEventListener('click', closeSearch);

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (modal.classList.contains('active')) {
                    closeSearch();
                } else {
                    openSearch();
                }
            } else if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeSearch();
            }
        });

        // Connect any search trigger buttons
        document.querySelectorAll('.btn-open-search').forEach(btn => {
            btn.addEventListener('click', openSearch);
        });
    }

    // -------------------------------------------------------------------------
    // 9. COPY TO CLIPBOARD HELPER
    // -------------------------------------------------------------------------
    function copyToClipboard(text, triggerEl) {
        if (!navigator.clipboard) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showCopiedFeedback(triggerEl);
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            showCopiedFeedback(triggerEl);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    function showCopiedFeedback(el) {
        if (!el) return;
        const originalHtml = el.innerHTML;
        el.classList.add('copied');
        el.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => {
            el.innerHTML = originalHtml;
            el.classList.remove('copied');
        }, 1800);
    }

    // -------------------------------------------------------------------------
    // 10. PASSWORD VISIBILITY TOGGLE HELPER
    // -------------------------------------------------------------------------
    function initPasswordToggles() {
        document.querySelectorAll('input[type="password"]').forEach(input => {
            // Check if wrapper already has toggle
            const parent = input.parentElement;
            if (parent && !parent.querySelector('.password-toggle-icon')) {
                const icon = document.createElement('i');
                icon.className = 'fa-solid fa-eye password-toggle-icon';
                icon.title = 'Show password';
                
                icon.addEventListener('click', () => {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    icon.className = isPassword ? 'fa-solid fa-eye-slash password-toggle-icon' : 'fa-solid fa-eye password-toggle-icon';
                    icon.title = isPassword ? 'Hide password' : 'Show password';
                });

                parent.style.position = 'relative';
                parent.appendChild(icon);
            }
        });
    }

    // -------------------------------------------------------------------------
    // 11. CONFIRMATION MODAL HELPER
    // -------------------------------------------------------------------------
    function showConfirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'btn-brand', onConfirm }) {
        let modal = document.getElementById('global-confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'global-confirm-modal';
            modal.innerHTML = `
                <div class="confirm-modal-card" onclick="event.stopPropagation()">
                    <div style="display:flex; align-items:flex-start; gap:0.85rem; margin-bottom:1rem;">
                        <div style="padding:0.5rem; border-radius:0.75rem; background:rgba(99,102,241,0.15); color:#6366F1; flex-shrink:0;">
                            <i class="fa-solid fa-triangle-exclamation text-lg"></i>
                        </div>
                        <div>
                            <h3 id="confirm-modal-title" style="font-size:1.05rem; font-weight:700; color:#F8FAFC; margin-bottom:0.25rem;">
                                Confirmation Required
                            </h3>
                            <p id="confirm-modal-message" style="font-size:0.8rem; color:#94A3B8; line-height:1.5;">
                                Are you sure you wish to proceed?
                            </p>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:0.65rem; margin-top:1.5rem;">
                        <button id="confirm-modal-cancel" style="padding:8px 16px; font-size:0.75rem; font-weight:600; border-radius:10px; background:transparent; border:1px solid rgba(255,255,255,0.15); color:#CCD0CF; cursor:pointer;">
                            ${cancelText}
                        </button>
                        <button id="confirm-modal-ok" style="padding:8px 20px; font-size:0.75rem; font-weight:700; border-radius:10px; background:linear-gradient(135deg, #6366F1, #4F46E5); border:none; color:#FFFFFF; cursor:pointer;">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        document.getElementById('confirm-modal-title').innerText = title;
        document.getElementById('confirm-modal-message').innerText = message;
        const okBtn = document.getElementById('confirm-modal-ok');
        const cancelBtn = document.getElementById('confirm-modal-cancel');

        okBtn.innerText = confirmText;
        cancelBtn.innerText = cancelText;

        function close() {
            modal.classList.remove('active');
        }

        okBtn.onclick = () => {
            close();
            if (typeof onConfirm === 'function') onConfirm();
        };

        cancelBtn.onclick = close;
        modal.onclick = close;

        modal.classList.add('active');
    }

    // -------------------------------------------------------------------------
    // 12. FLOATING CONTACT SPEED DIAL
    // -------------------------------------------------------------------------
    function initFloatingContact() {
        let menu = document.querySelector('.floating-contact-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.className = 'floating-contact-menu';
            menu.innerHTML = `
                <div class="floating-contact-popover" id="contact-popover">
                    <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.5rem; margin-bottom:0.75rem;">
                        <span style="font-weight:700; font-size:0.82rem; color:#F8FAFC;">AICTE Grievance Desk</span>
                        <span style="font-size:0.65rem; padding:2px 6px; border-radius:4px; background:#10B981; color:#FFFFFF; font-weight:700;">24/7 Redressal</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.78rem;">
                        <a href="tel:1800111600" style="display:flex; align-items:center; gap:0.6rem; color:#94A3B8; text-decoration:none; padding:6px 8px; border-radius:8px; transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                            <i class="fa-solid fa-phone text-emerald-400"></i>
                            <div>
                                <div style="color:#F8FAFC; font-weight:600;">Toll-Free Helpline</div>
                                <div style="font-size:0.7rem; color:#64748B;">1800-111-600 / 011-29581000</div>
                            </div>
                        </a>
                        <a href="mailto:grievance@aicte-india.org" style="display:flex; align-items:center; gap:0.6rem; color:#94A3B8; text-decoration:none; padding:6px 8px; border-radius:8px; transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                            <i class="fa-solid fa-envelope text-indigo-400"></i>
                            <div>
                                <div style="color:#F8FAFC; font-weight:600;">Official Redressal Email</div>
                                <div style="font-size:0.7rem; color:#64748B;">grievance@aicte-india.org</div>
                            </div>
                        </a>
                        <a href="/privacy_policy.html" style="display:flex; align-items:center; gap:0.6rem; color:#94A3B8; text-decoration:none; padding:6px 8px; border-radius:8px; transition:background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                            <i class="fa-solid fa-shield-halved text-cyan-400"></i>
                            <div>
                                <div style="color:#F8FAFC; font-weight:600;">Privacy & Citizen Rights</div>
                                <div style="font-size:0.7rem; color:#64748B;">Official Statutory Guidelines</div>
                            </div>
                        </a>
                    </div>
                </div>
                <button class="floating-contact-btn" id="btn-toggle-contact" aria-label="Official Help & Contacts" title="AICTE Grievance Helpdesk">
                    <i class="fa-solid fa-headset text-lg"></i>
                </button>
            `;
            document.body.appendChild(menu);
        }

        const btn = document.getElementById('btn-toggle-contact');
        const popover = document.getElementById('contact-popover');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target)) {
                popover.classList.remove('active');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 13. DYNAMIC LAST UPDATE DATE
    // -------------------------------------------------------------------------
    function initLastUpdateBadges() {
        const dateStr = "October 27, 2026 • AICTE Version 2026.1.4 (SIH Final Submission)";
        document.querySelectorAll('.portal-last-updated-text').forEach(el => {
            el.innerText = dateStr;
        });
    }

    // -------------------------------------------------------------------------
    // BOOTSTRAP ALL UTILITIES ON DOM READY
    // -------------------------------------------------------------------------
    function initPortalUtils() {
        initUtmTracker();
        initPagePreloader();
        initScrollProgressBar();
        initScrollReveal();
        initThemeToggle();
        initBackToTop();
        initCookieBanner();
        initSiteSearch();
        initPasswordToggles();
        initFloatingContact();
        initLastUpdateBadges();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPortalUtils);
    } else {
        initPortalUtils();
    }

    // Export helpers globally
    global.AICTE_UTILS = {
        copyToClipboard,
        showConfirmDialog,
        toggleLightDarkMode,
        getUtmData
    };

})(window);
