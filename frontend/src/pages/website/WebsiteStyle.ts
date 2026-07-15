// frontend/src/pages/website/WebsiteStyles.ts
export const WEBSITE_STYLES = `
        :root {
            --primary: #2563eb;
            --secondary: #0f172a;
            --white: #ffffff;
            --success: #4ade80;
            --info: #60a5fa;
            --warning: #facc15;
        }

        @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }

        /* Essential utility for smooth scrolling on the whole page */
        html {
            scroll-behavior: smooth;
        }

        /* Ensure Font Awesome and Lucide icons have consistent sizing if needed */
        .fas, .fab {
            display: inline-block;
        }
`