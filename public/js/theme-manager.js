/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE) - SIH 2026
 * Streamlined Dark / Light Mode Engine
 * Light Mode: Refined Blue & White Palette
 * Dark Mode: Deep Pitch Black / Obsidian Palette
 * Zero Raw Emojis • Vector Icons • Smooth Transitions
 * =========================================================================
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'aicte_theme_mode';

    function getPreferredMode() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        return 'dark'; // High-tech dark mode by default
    }

    function applyMode(mode) {
        const html = document.documentElement;
        if (mode === 'light') {
            html.classList.add('light-mode');
        } else {
            html.classList.remove('light-mode');
        }

        localStorage.setItem(STORAGE_KEY, mode);
        updateToggleIcons(mode === 'light');

        // Remove any leftover floating switcher if it was created
        const legacyBar = document.getElementById('floating-theme-switcher');
        if (legacyBar) {
            legacyBar.remove();
        }

        if (typeof window.onThemeChanged === 'function') {
            window.onThemeChanged(mode);
        }
    }

    function toggleMode() {
        const isCurrentlyLight = document.documentElement.classList.contains('light-mode');
        const nextMode = isCurrentlyLight ? 'dark' : 'light';
        applyMode(nextMode);

        if (window.AICTE_UTILS && typeof window.AICTE_UTILS.showToast === 'function') {
            window.AICTE_UTILS.showToast(`Switched to ${nextMode === 'light' ? 'Light (Blue & White)' : 'Dark (Obsidian Black)'} Mode`, 'info');
        }
    }

    function updateToggleIcons(isLight) {
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

    // Apply immediately to prevent flash of wrong theme
    applyMode(getPreferredMode());

    // Clean up DOM on load
    document.addEventListener('DOMContentLoaded', () => {
        const legacyBar = document.getElementById('floating-theme-switcher');
        if (legacyBar) legacyBar.remove();
        updateToggleIcons(document.documentElement.classList.contains('light-mode'));
    });

    // Expose global API
    window.ThemeEngine = {
        toggle: toggleMode,
        setMode: (m) => applyMode(m),
        getMode: () => document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'
    };

    // Keep compatibility with AICTE_UTILS.toggleLightDarkMode()
    if (!window.AICTE_UTILS) window.AICTE_UTILS = {};
    window.AICTE_UTILS.toggleLightDarkMode = toggleMode;
})();
