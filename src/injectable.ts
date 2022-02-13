// This file serves no purpose in production environment - but is required for local development.
// Ideally, this would be in main.ts, but as vite bundles all code first, we end up in a scenario where
// the window.Wisp object isn't available on initial load. Good example is service/request.ts which needs the base URL.
// It creates a singleton and instantly initializes axios with the base URL, but as window.Wisp is defined in the same
// "scope" overall in the bundle, it'll first initialize the service while that info isn't available leading to issues.
// This way, we guarantee window.Wisp loading always first and that data being available instantly everywhere.

if (import.meta.env.DEV && !window.Wisp) {
    window.Wisp = {
        Debug: true,

        Node: 'local',
        Version: 'dev',

        BaseURL: import.meta.env.VITE_PANEL_URL || alert('No base URL configured') || '',
    };
}
