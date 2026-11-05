/**
 * ==============================================================================
 * HANUMAN GYM — PROGRESSIVE WEB APP (PWA) 1-TAP INSTALLER
 * Floating luxury dark-gold install HUD for native home screen experience
 * ==============================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PWAInstallerEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    let deferredPrompt = null;
    let isDismissed = false;

    /**
     * Initializes the PWA install prompt listener.
     */
    function initPWAInstaller() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Automatic floating HUD popup disabled
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            removePWAInstallBanner();
        });
    }

    /**
     * Renders the luxury floating install card.
     */
    function renderPWAInstallBanner() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('pwa-install-floating-hud')) return;

        const banner = document.createElement('div');
        banner.id = 'pwa-install-floating-hud';
        banner.className = 'pwa-floating-hud-card';
        banner.innerHTML = `
            <div class="pwa-hud-left">
                <div class="pwa-hud-icon-box">
                    <i class="fas fa-dumbbell"></i>
                </div>
                <div class="pwa-hud-text">
                    <h4 class="pwa-hud-title">Install Hanuman Gym App</h4>
                    <p class="pwa-hud-desc">Instant offline workout access & full-screen Gym HUD.</p>
                </div>
            </div>
            <div class="pwa-hud-actions">
                <button class="plan-btn btn-gold pwa-install-btn" onclick="PWAInstallerEngine.promptPWAInstall()">
                    <i class="fas fa-download"></i> Install App
                </button>
                <button class="pwa-dismiss-btn" onclick="PWAInstallerEngine.dismissPWAInstall()" title="Dismiss">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
        `;

        document.body.appendChild(banner);
    }

    /**
     * Triggers the native browser install dialog.
     */
    async function promptPWAInstall() {
        if (!deferredPrompt) {
            alert('To install, open your browser menu and tap "Add to Home Screen".');
            return;
        }

        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
            removePWAInstallBanner();
        }
        deferredPrompt = null;
    }

    /**
     * Dismisses the floating install HUD.
     */
    function dismissPWAInstall() {
        isDismissed = true;
        removePWAInstallBanner();
    }

    /**
     * Removes the banner DOM element.
     */
    function removePWAInstallBanner() {
        if (typeof document === 'undefined') return;
        const banner = document.getElementById('pwa-install-floating-hud');
        if (banner) banner.remove();
    }

    return {
        initPWAInstaller,
        renderPWAInstallBanner,
        promptPWAInstall,
        dismissPWAInstall,
        removePWAInstallBanner
    };
}));
