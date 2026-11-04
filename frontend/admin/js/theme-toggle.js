/**
 * CLAUDIA SNU - Système Unifié Thème Officiel (Rouge & Blanc) & Mode Sombre (Black & Rouge Braise)
 * Mode par défaut : mode sombre équilibré. Le mode clair conserve le thème officiel.
 */
(function () {
    'use strict';

    if (window.__SNU_THEME_TOGGLE_INITIALIZED__) {
        return;
    }
    window.__SNU_THEME_TOGGLE_INITIALIZED__ = true;

    var STORAGE_KEY = 'snu_theme';

    // 1. Détection du thème sauvegardé ou par défaut
    function getStoredTheme() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'dark' || saved === 'light') return saved;
        } catch (e) {}
        return 'dark';
    }

    // 2. Application du thème
    function applyTheme(theme) {
        var isDark = (theme === 'dark');
        var root = document.documentElement;
        var body = document.body;

        if (isDark) {
            root.setAttribute('data-bs-theme', 'dark');
            root.setAttribute('data-theme', 'dark');
            if (body) {
                body.classList.add('dark-mode');
            }
        } else {
            root.setAttribute('data-bs-theme', 'light');
            root.setAttribute('data-theme', 'light');
            if (body) {
                body.classList.remove('dark-mode');
            }
        }

        // Mettre à jour tous les boutons de toggle sur la page
        var buttons = document.querySelectorAll('.theme-toggle-btn, #themeToggleBtn, #adminThemeToggleBtn');
        buttons.forEach(function (btn) {
            var icon = btn.querySelector('.theme-icon') || btn.querySelector('i');
            var text = btn.querySelector('.theme-text') || btn.querySelector('span');

            if (isDark) {
                if (icon) {
                    icon.className = 'fa fa-sun me-1 text-warning theme-icon';
                }
                if (text) {
                    text.textContent = 'Mode Clair';
                }
                btn.setAttribute('title', 'Passer au thème clair (Rouge & Blanc)');
            } else {
                if (icon) {
                    icon.className = 'fa fa-moon me-1 theme-icon';
                }
                if (text) {
                    text.textContent = 'Mode Sombre';
                }
                btn.setAttribute('title', 'Passer au mode sombre');
            }
        });
    }

    // 3. Bascule du thème avec verrouillage anti-rebond
    var isToggling = false;
    function toggleTheme() {
        if (isToggling) return;
        isToggling = true;
        try {
            var current = (
                document.documentElement.getAttribute('data-theme') === 'dark' ||
                (document.body && document.body.classList.contains('dark-mode'))
            ) ? 'dark' : 'light';
            var next = (current === 'dark') ? 'light' : 'dark';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (e) {}
            applyTheme(next);
        } finally {
            setTimeout(function () {
                isToggling = false;
            }, 120);
        }
    }

    // Application précoce (évite le flash blanc)
    var initialTheme = getStoredTheme();
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.setAttribute('data-bs-theme', initialTheme);
    if (document.body) {
        if (initialTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Initialisation après chargement du DOM
    function init() {
        applyTheme(getStoredTheme());

        document.addEventListener('click', function (e) {
            var target = e.target.closest('.theme-toggle-btn, #themeToggleBtn, #adminThemeToggleBtn');
            if (target) {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Synchronisation multi-onglets
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) {
            applyTheme(e.newValue || 'dark');
        }
    });

    window.snuToggleTheme = toggleTheme;
})();
