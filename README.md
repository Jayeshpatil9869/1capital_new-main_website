# One Capital Website (Standalone React + Vite + TypeScript)

This repository contains the standalone, premium website for **One Capital**, built using React, Vite, Tailwind CSS, GSAP, and Locomotive Scroll. All Sales Dashboard and Django backend code has been removed.

---

## 🚀 How to Run the Website Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended).

### Step 1: Install Dependencies
Open your terminal in the project's root directory and run:
```bash
npm install
```

### Step 2: Start Development Server
Run the following command to start the local Vite development server:
```bash
npm run dev
```

### Step 3: Open in Browser
Once started, Vite will display the local URL. Open your browser and navigate to:
👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## 📦 How to Build for Production

### Step 1: Compile the Project
To compile the site into optimized static assets (HTML, CSS, JS), run:
```bash
npm run build
```
This will compile the website and save the output inside the `dist/` directory.

### Step 2: Preview the Build (Optional)
To test the production build locally before deploying, run:
```bash
npm run preview
```
Open the provided URL (usually `http://localhost:4173/`) to inspect the compiled version.

### Step 3: Deployment
To deploy, simply upload the contents of the `dist/` folder to any static web hosting provider, such as:
- Cloudflare Pages
- Netlify
- Vercel
- AWS S3 / Cloudfront
- Github Pages

---

## 📁 Key File Locations

- **Main Navigation/App Routes:** `src/App.tsx`
- **Homepage:** `src/pages/AlternateWebsite.tsx`
- **Mutual Funds Page:** `src/pages/MutualFundsPage.tsx`
- **PMS & AIF Page:** `src/pages/PmsAifPage.tsx`
- **Styles & Dark/Light Theme definitions:** `src/pages/website/AlternateWebsiteStyle.ts`
