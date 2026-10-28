/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE) - SIH 2026
 * Interactive Citizen Portal Guided Walkthrough & Educational Tour
 * Explains Overlap Engine, Problem Cards, SLA Timelines & Bureau Workflows
 * Strictly Zero Emojis • Vector Icons • Spotlight Animation • Full Keyboard Nav
 * =========================================================================
 */

(function (global) {
    'use strict';

    const TUTORIAL_STORAGE_KEY = 'aicte_portal_tutorial_completed_v1';

    const TOUR_STEPS = [
        {
            targetId: 'view-overview',
            title: 'Welcome to AICTE Samadhan Portal',
            subtitle: 'Central Citizen Grievance & Redressal Command Center',
            content: 'This portal provides transparent, real-time tracking of institutional complaints across all AICTE-approved colleges in India. Track case progress, statutory deadlines, and bureau allocations with zero friction.',
            badge: 'Portal Foundation',
            position: 'center'
        },
        {
            targetId: 'stat-total',
            title: '30-Day Statutory Resolution Timeline (SLA)',
            subtitle: 'What does SLA Mean?',
            content: 'SLA stands for Service Level Agreement. Under AICTE regulations, all registered grievances carry a strict 30-day statutory redressal mandate. The live countdown clocks alert both complainants and council officers before deadlines expire.',
            badge: 'Statutory SLA Mandate',
            position: 'bottom'
        },
        {
            targetId: 'overview-deck-container',
            title: 'Interactive Problem Dossier Deck',
            subtitle: 'Dynamic 3D Problem Cards',
            content: 'Grievance dossiers are rendered as interactive 3D cards. Click cards or use keyboard Left/Right arrows to flip through dossiers. Each card shows the institute name, permanent ID, category, and an SLA countdown progress bar.',
            badge: 'Interactive Problem View',
            position: 'top'
        },
        {
            targetSelector: '[data-view="view-register"]',
            title: 'Lodge New Grievances with Instant PID Verification',
            subtitle: 'AICTE Permanent Institute ID Lookup',
            content: 'When submitting a complaint, enter the AICTE Permanent Institute ID (PID) to auto-fill official college credentials. High-performance Bloom Filters verify active filings to eliminate redundant paperwork.',
            badge: 'Fast Ingestion',
            position: 'right'
        },
        {
            targetSelector: '.navbar-cluster-badge',
            title: 'Cross-Bureau Overlap Engine & Enterprise Security',
            subtitle: 'SIH 2026 Innovation',
            content: 'What is Bureau Overlap? Often, complaints against the same college land across multiple cells (Regulation Bureau, PGRC, Approval Bureau). Our engine algorithmically detects overlaps in milliseconds, coordinating multi-bureau action. All citizen data is protected with AES-256-GCM encryption.',
            badge: 'Zero Vulnerability',
            position: 'bottom'
        }
    ];

    class PortalTutorial {
        constructor() {
            this.currentStep = 0;
            this.overlay = null;
            this.spotlight = null;
            this.card = null;
            this.isOpen = false;
        }

        init() {
            this.createDomElements();
            this.bindEvents();

            // Auto-trigger on first visit after a slight delay
            if (!localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
                setTimeout(() => {
                    this.start();
                }, 1800);
            }
        }

        createDomElements() {
            if (document.getElementById('aicte-tutorial-overlay')) return;

            // Backdrop Overlay
            this.overlay = document.createElement('div');
            this.overlay.id = 'aicte-tutorial-overlay';
            this.overlay.className = 'tutorial-overlay';
            this.overlay.innerHTML = `
                <div class="tutorial-spotlight" id="tutorial-spotlight"></div>
                <div class="tutorial-modal-card" id="tutorial-modal-card" role="dialog" aria-modal="true">
                    <!-- Header -->
                    <div class="tutorial-modal-header">
                        <div class="tutorial-badge-row">
                            <span class="tutorial-step-tag" id="tutorial-step-indicator">Step 1 of 5</span>
                            <span class="tutorial-feature-tag" id="tutorial-feature-tag">System Overview</span>
                        </div>
                        <button class="tutorial-close-btn" id="tutorial-btn-close" title="Exit Tour">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <!-- Body Content -->
                    <div class="tutorial-modal-body">
                        <h3 class="tutorial-title" id="tutorial-title">Title Here</h3>
                        <h4 class="tutorial-subtitle" id="tutorial-subtitle">Subtitle Here</h4>
                        <p class="tutorial-text" id="tutorial-text">Content Here</p>
                    </div>

                    <!-- Progress Bar Track -->
                    <div class="tutorial-progress-track">
                        <div class="tutorial-progress-fill" id="tutorial-progress-fill"></div>
                    </div>

                    <!-- Footer Controls -->
                    <div class="tutorial-modal-footer">
                        <button class="tutorial-btn-text" id="tutorial-btn-skip">
                            Skip Tour
                        </button>
                        <div class="tutorial-btn-group">
                            <button class="tutorial-btn-nav" id="tutorial-btn-prev">
                                <i class="fa-solid fa-arrow-left"></i> Previous
                            </button>
                            <button class="tutorial-btn-primary" id="tutorial-btn-next">
                                Next Step <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(this.overlay);

            this.spotlight = document.getElementById('tutorial-spotlight');
            this.card = document.getElementById('tutorial-modal-card');
        }

        bindEvents() {
            document.getElementById('tutorial-btn-close')?.addEventListener('click', () => this.end());
            document.getElementById('tutorial-btn-skip')?.addEventListener('click', () => this.end());
            document.getElementById('tutorial-btn-prev')?.addEventListener('click', () => this.prev());
            document.getElementById('tutorial-btn-next')?.addEventListener('click', () => this.next());

            // Keyboard navigation
            window.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;
                if (e.key === 'Escape') this.end();
                if (e.key === 'ArrowRight') this.next();
                if (e.key === 'ArrowLeft') this.prev();
            });

            // Reposition on resize
            window.addEventListener('resize', () => {
                if (this.isOpen) this.renderStep(this.currentStep);
            });
        }

        start(stepIndex = 0) {
            this.currentStep = stepIndex;
            this.isOpen = true;
            this.overlay.classList.add('active');
            document.body.classList.add('tutorial-active');
            this.renderStep(this.currentStep);
        }

        renderStep(index) {
            if (index < 0 || index >= TOUR_STEPS.length) return;
            const step = TOUR_STEPS[index];

            // Update Text
            document.getElementById('tutorial-step-indicator').innerText = `Step ${index + 1} of ${TOUR_STEPS.length}`;
            document.getElementById('tutorial-feature-tag').innerText = step.badge;
            document.getElementById('tutorial-title').innerText = step.title;
            document.getElementById('tutorial-subtitle').innerText = step.subtitle;
            document.getElementById('tutorial-text').innerText = step.content;

            // Update Progress Bar
            const progressPct = ((index + 1) / TOUR_STEPS.length) * 100;
            document.getElementById('tutorial-progress-fill').style.width = `${progressPct}%`;

            // Update Navigation Buttons
            const prevBtn = document.getElementById('tutorial-btn-prev');
            const nextBtn = document.getElementById('tutorial-btn-next');

            if (prevBtn) {
                prevBtn.style.display = index === 0 ? 'none' : 'inline-flex';
            }

            if (nextBtn) {
                if (index === TOUR_STEPS.length - 1) {
                    nextBtn.innerHTML = `Explore Portal <i class="fa-solid fa-check"></i>`;
                } else {
                    nextBtn.innerHTML = `Next Step <i class="fa-solid fa-arrow-right"></i>`;
                }
            }

            // Target Highlighting
            let targetElem = null;
            if (step.targetId) {
                targetElem = document.getElementById(step.targetId);
            } else if (step.targetSelector) {
                targetElem = document.querySelector(step.targetSelector);
            }

            if (targetElem && typeof targetElem.getBoundingClientRect === 'function') {
                targetElem.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setTimeout(() => {
                    const rect = targetElem.getBoundingClientRect();
                    const padding = 12;

                    this.spotlight.style.display = 'block';
                    this.spotlight.style.top = `${Math.max(10, rect.top - padding + window.scrollY)}px`;
                    this.spotlight.style.left = `${Math.max(10, rect.left - padding + window.scrollX)}px`;
                    this.spotlight.style.width = `${rect.width + (padding * 2)}px`;
                    this.spotlight.style.height = `${rect.height + (padding * 2)}px`;

                    this.positionCard(rect, step.position);
                }, 300);
            } else {
                // Center modal if target not found
                this.spotlight.style.display = 'none';
                this.card.style.top = '50%';
                this.card.style.left = '50%';
                this.card.style.transform = 'translate(-50%, -50%)';
            }
        }

        positionCard(targetRect, preferredPosition) {
            const cardWidth = Math.min(480, window.innerWidth - 32);
            const cardHeight = this.card.offsetHeight || 320;
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top = targetRect.bottom + 18 + scrollY;
            let left = targetRect.left + (targetRect.width / 2) - (cardWidth / 2) + scrollX;

            // Boundary checks
            if (top + cardHeight > window.innerHeight + scrollY) {
                top = targetRect.top - cardHeight - 18 + scrollY;
            }

            if (left < 16) left = 16;
            if (left + cardWidth > window.innerWidth - 16) {
                left = window.innerWidth - cardWidth - 16;
            }

            if (top < scrollY + 16) {
                top = scrollY + 24;
            }

            this.card.style.top = `${top}px`;
            this.card.style.left = `${left}px`;
            this.card.style.transform = 'none';
        }

        next() {
            if (this.currentStep < TOUR_STEPS.length - 1) {
                this.currentStep++;
                this.renderStep(this.currentStep);
            } else {
                this.end();
            }
        }

        prev() {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.renderStep(this.currentStep);
            }
        }

        end() {
            this.isOpen = false;
            this.overlay.classList.remove('active');
            document.body.classList.remove('tutorial-active');
            localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');

            if (window.AICTE_UTILS && typeof window.AICTE_UTILS.showToast === 'function') {
                window.AICTE_UTILS.showToast('Tutorial completed! Click "Help Tutorial" in the header anytime to review.', 'success');
            }
        }
    }

    // Initialize Tutorial Engine
    const tutorialEngine = new PortalTutorial();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => tutorialEngine.init());
    } else {
        tutorialEngine.init();
    }

    // Expose global API
    global.AICTE_TUTORIAL = {
        start: () => tutorialEngine.start(0),
        restart: () => {
            localStorage.removeItem(TUTORIAL_STORAGE_KEY);
            tutorialEngine.start(0);
        }
    };

})(window);
