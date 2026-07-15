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

We have created a production-ready Nginx configuration file at [deployment/nginx/1capital.in.conf](file:///c:/Users/Asus/Pictures/All%20Programs/Internship%201Capital/1capital_new-main_website/deployment/nginx/1capital.in.conf) that is optimized for hosting the standalone React SPA behind Cloudflare proxy (`72.61.141.247`).

Follow these step-by-step instructions to deploy it on your VPS:

##### Step 1: Copy the Build Folder to the Server
Upload the compiled `dist/` folder from your local machine to `/var/www/1capital/dist` on your server:
```bash
# Example using rsync (run from local project root)
rsync -avz --delete dist/ user@72.61.141.247:/var/www/1capital/dist/
```
Ensure directory permissions are correct so that the Nginx user (`www-data`) can read it:
```bash
sudo chown -R www-data:www-data /var/www/1capital
sudo chmod -R 755 /var/www/1capital
```

##### Step 2: Copy and Enable the Nginx Configuration
1. Copy the Nginx configuration file to the Nginx configurations directory:
   ```bash
   sudo cp deployment/nginx/1capital.in.conf /etc/nginx/sites-available/1capital.in.conf
   ```
2. Enable the configuration by creating a symbolic link in the `sites-enabled` directory:
   ```bash
   sudo ln -s /etc/nginx/sites-available/1capital.in.conf /etc/nginx/sites-enabled/
   ```
3. Remove the `default` configuration if you aren't using it:
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   ```

##### Step 3: Obtain SSL Certificates (For Cloudflare Full/Full strict SSL)
To support `https://1capital.in/` using **Full** or **Full (strict)** SSL on Cloudflare (highly recommended), generate Let's Encrypt certificates using Certbot:
```bash
# Install Certbot and the Nginx plugin
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain and configure the SSL certificate
sudo certbot --nginx -d 1capital.in -d www.1capital.in
```
*Note: Certbot will automatically verify ownership, create the certificates, and link them to the Nginx server block.*

##### Step 4: Validate and Reload Nginx
1. Verify the Nginx configuration syntax is valid:
   ```bash
   sudo nginx -t
   ```
   *Expected Output: `syntax is ok` and `test is successful`*
2. Reload Nginx to apply the configuration:
   ```bash
   sudo systemctl reload nginx
   ```

##### Step 5: Toggling Cloudflare SSL Modes
- **Full / Full (strict) (Recommended):** Use the default configuration. Cloudflare encrypts traffic to the edge, and Nginx encrypts traffic from Cloudflare to your VPS using the certificates set in the HTTPS server block.
- **Flexible SSL:** If you choose Flexible SSL, Cloudflare terminates SSL and requests pages from your VPS via HTTP (port 80). In this case, edit `/etc/nginx/sites-available/1capital.in.conf`, comment out the SSL server blocks (Sections 3 and 4), and uncomment the **ALTERNATIVE SETUP** block at the bottom of the file. Then, reload Nginx.

