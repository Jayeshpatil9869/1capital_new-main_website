# Production Setup & Migration Guide: One Capital Standalone Website

This document explains the transition of the **One Capital** project from a hybrid Django-React application to a standalone React frontend, and provides instructions for you or any AI assistant to build and deploy the website to production.

---

## 1. Summary of What Was Done (The Migration)

We migrated the project from a mixed Django backend + React frontend structure to a **100% standalone React + Vite + TypeScript Single Page Application (SPA)**.

### 🗑️ What We Deleted:
- **Django Project:** The entire `SalesDashboard/` directory containing Django views, templates, models, database (`db.sqlite3`), and logs.
- **Data & Pipelines:** The `data_files/` directory (Employee/Client master lists, Sales brokerage sheets) and `tools/` folder.
- **Control Scripts:** Batch and PowerShell scripts (`start_dashboard.*`, `start_ngrok.*`, `upload_to_server.ps1`, `inspect_all_cols.py`).
- **Outdated Documentation:** Setup guides related to the Excel loader and Django models.

### 📦 What We Relocated and Cleaned:
- Moved all folders and files inside the `/frontend` subfolder directly into the **project root** (e.g., `src/`, `public/`, `package.json`, `vite.config.ts`, etc.).
- Deleted dashboard-specific views: `DashboardPage.tsx`, `UploadPortalPage.tsx`, and `LoginPage.tsx`.
- Deleted the authentication logic under `src/auth/` since the website no longer needs user accounts or authorization checks.
- Cleaned up `package.json` by removing the `postbuild` asset-fixing script (used previously to copy static assets to Django) and deleting the unused `axios` dependency.

### 🔗 What We Updated in the Frontend Code:
- **Routing (`src/App.tsx`):** Rewrote the SPA routing. The root `/` path now maps directly to the main landing page (`AlternateWebsite.tsx`). Set up fallback routes for `/mutual-funds` and `/pms-aif`.
- **Navigation & CTAs:** Cleaned up headers and footers on all pages. Removed "Client Login", "Dashboard", and "Data Portal" buttons. Changed the links to client-side paths (`/mutual-funds` and `/pms-aif`).
- **PMS & AIF Page (`src/pages/PmsAifPage.tsx`):** Upgraded it from a simple text stub to a premium informational page matching the design language, dark/light toggle modes, and scroll animations of the Mutual Funds page.

---

## 2. Copy-Paste AI Context (For Future AI Assistants)

If you are using a coding AI (e.g., Gemini, Claude, Cursor) to modify or deploy this project in the future, copy and paste this context block to get them up to speed instantly:

```markdown
### PROJECT CONTEXT: One Capital Standalone Website
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (configured via index.css and Vite plugin, no PostCSS)
- **Animations:** GSAP 3 (ScrollTrigger) & Locomotive Scroll v5
- **Routing:** React Router DOM v7 (Client-side routing)
- **Deployment Type:** Standalone Static Site (No backend API dependencies)
- **Main Pages:**
  - Homepage: `src/pages/AlternateWebsite.tsx`
  - Mutual Funds Page: `src/pages/MutualFundsPage.tsx`
  - PMS & AIF Page: `src/pages/PmsAifPage.tsx`
- **Theme Support:** Supports light/dark mode toggled via className `.theme-wrapper` using custom HSL CSS variables in `src/pages/website/AlternateWebsiteStyle.ts`.
```

---

## 3. Production Deployment Guide

Since the site is now a static SPA, it does not require a running Python process, virtual environment, or database. You only need to build the static bundle and host it.

### Step 1: Run the Production Build
Locally or on your build server, execute:
```bash
npm run build
```
This generates a folder named `dist/` at the root of the project. This folder contains optimized HTML, minified JS, and compiled CSS assets.

### Step 2: Choose Your Hosting Option

#### Option A: Serverless Static Hosting (Recommended)
You can link this GitHub repository directly to any of the following providers for free, automatic deployment on every git push:
- **Cloudflare Pages:** Set Build Command to `npm run build` and Output Directory to `dist`.
- **Vercel:** Auto-detects Vite. Set output to `dist`.
- **Netlify:** Set Build Command to `npm run build` and Publish Directory to `dist`.

#### Option B: Self-Hosted Web Server (Nginx)
If you want to host it on your own VPS using Nginx, copy the compiled `dist/` directory to your server (e.g., `/var/www/1capital/`) and use the following server block config. 

> [!IMPORTANT]
> Because this is a React SPA using client-side routing, Nginx must be configured to redirect all unmatched requests back to `index.html` via `try_files` so that users can refresh pages (like `/mutual-funds`) without getting a 404 error.

Use this custom Nginx configuration block:

```nginx
server {
    listen 80;
    server_name 1capital.in www.1capital.in;

    # Redirect www to non-www
    if ($host = "www.1capital.in") {
        return 301 https://1capital.in$request_uri;
    }

    # Set root directory to the compiled dist folder
    root /var/www/1capital/dist;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Handle SPA routing (Critical for React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```
