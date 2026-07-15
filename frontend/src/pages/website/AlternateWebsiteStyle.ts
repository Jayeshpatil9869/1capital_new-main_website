export const ALTERNATE_WEBSITE_STYLES = `
    /* Purple light/dark theme variables */
    :root {
        --primary: #7e22ce; 
        --primary-dark: #6b21a8;
        --primary-light: #f3e8ff;
        --secondary: #0f172a;
        --text-body: #475569;
        --text-light: #94a3b8;
        --white: #ffffff;
        --border: #e2e8f0;
        --success: #10b981;
        --failure: #ef4444;
        --warning: #f59e0b;
        --info: #3b82f6;
        --font-main: 'Plus Jakarta Sans', sans-serif;
        --container-width: 1280px;
        --nav-height: 80px;
        --ticker-height: 44px;
        --radius-xl: 1.5rem;
        --radius-lg: 1rem;
        --bg-dark-surface: #1e1b4b;
        --bg-body: #fdfbff;
        --bg-card: #ffffff;
    }

    [data-theme='dark'] {
        --primary: #a855f7; 
        --primary-dark: #7e22ce;
        --primary-light: #2e1065;
        --secondary: #f8fafc;
        --text-body: #cbd5e1;
        --text-light: #94a3b8;
        --white: #000000; /* Pitch Black */
        --border: #1e1b4b;
        --bg-dark-surface: #111111;
        --bg-body: #000000; /* Pitch Black */
        --bg-card: #0a0a0a;
    }

    /* Core Styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    /* Safest Scroll settings */
    html {
        scroll-behavior: auto; /* Required for Locomotive Scroll */
    }

    .theme-wrapper {
        font-family: var(--font-main);
        background-color: var(--bg-body);
        color: var(--secondary);
        line-height: 1.6;
        transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s;
        min-height: 100vh;
        width: 100%;
        overflow-x: hidden;
    }

    .theme-wrapper a { text-decoration: none; color: inherit; transition: all 0.3s ease; }
    .theme-wrapper ul { list-style: none; }
    
    .container { max-width: var(--container-width); margin: 0 auto; padding: 0 1.5rem; width: 100%; }
    .section { padding: 8rem 0; width: 100%; }
    .text-center { text-align: center; }
    .text-muted { color: var(--text-body); transition: color 0.3s; }
    .text-gradient { background: linear-gradient(90deg, var(--secondary), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .grid { display: grid; gap: 2.5rem; }
    
    @media (min-width: 768px) { .grid-2 { grid-template-columns: repeat(2, 1fr); } .grid-3 { grid-template-columns: repeat(3, 1fr); } .grid-4 { grid-template-columns: repeat(4, 1fr); } .col-span-2 { grid-column: span 2; } }
    
    /* Buttons */
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.85rem 2.25rem; border-radius: 999px; font-weight: 700; font-size: 0.9rem; cursor: pointer; border: 1px solid transparent; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    
    .btn-primary { 
        background-color: var(--secondary); 
        color: var(--bg-body); 
        box-shadow: 0 4px 14px 0 rgba(0,0,0,0.1);
    }
    .btn-primary:hover { 
        background-color: var(--primary);
        color: #ffffff;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(126, 34, 206, 0.23);
    }
    
    [data-theme='dark'] .btn-primary {
        background-color: var(--secondary);
        color: #000000;
    }

    .btn-lg { padding: 1.15rem 2.5rem; border-radius: 0.85rem; font-size: 1.05rem; }
    .btn-purple { background-color: var(--primary); color: #fff; box-shadow: 0 10px 15px -3px rgba(126, 34, 206, 0.3); }
    .btn-purple:hover { transform: translateY(-2px); box-shadow: 0 15px 20px -3px rgba(126, 34, 206, 0.4); background-color: var(--primary-dark); }
    .btn-outline { background-color: transparent; border-color: var(--border); color: var(--secondary); }
    .btn-outline:hover { background-color: var(--primary-light); border-color: var(--primary); }

    /* Theme Toggle */
    .theme-toggle { position: fixed; bottom: 2rem; right: 2rem; width: 3.5rem; height: 3.5rem; border-radius: 50%; background: var(--secondary); color: var(--bg-body); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1000; border: none; box-shadow: 0 8px 30px rgba(0,0,0,0.15); transition: all 0.4s ease; font-size: 1.25rem; }
    .theme-toggle:hover { transform: scale(1.1) rotate(15deg); background: var(--primary); }

    /* Safe Reveal Initial States (GSAP manages these) */
    .gsap-reveal, .gsap-reveal-stagger { 
        visibility: hidden; /* Prevent flash but keep space if needed, will be handled by gsap.set */
    }

    /* Ticker */
    .ticker-wrap { background-color: #000; color: #fff; padding: 0.75rem 0; overflow: hidden; position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #111; }
    .ticker-move { display: flex; width: max-content; animation: ticker-scroll 35s linear infinite; }
    .ticker-item { padding: 0 2.5rem; font-weight: 700; font-size: 0.85rem; white-space: nowrap; letter-spacing: 0.5px; }
    .val-up { color: var(--success); } .val-neutral { color: var(--warning); } .val-down { color: var(--failure); } .val-blue { color: var(--info); }
    @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

    /* Navigation */
    .navbar { background: var(--bg-card); opacity: 0.98; backdrop-filter: blur(15px); border-bottom: 1px solid var(--border); position: sticky; top: var(--ticker-height); z-index: 95; height: var(--nav-height); display: flex; align-items: center; transition: all 0.4s ease; }
    .navbar .container { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .logo { font-size: 1.75rem; font-weight: 900; letter-spacing: -1.5px; color: var(--secondary); }
    .logo span { color: var(--primary); text-shadow: 0 0 20px rgba(126, 34, 206, 0.2); }
    .nav-links { display: none; flex: 1; justify-content: center; align-items: center; }
    .nav-links a { font-weight: 700; font-size: 0.9rem; margin-left: 2.25rem; color: var(--text-body); position: relative; }
    .nav-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: var(--primary); transition: width 0.3s; }
    .nav-links a:hover { color: var(--secondary); }
    .nav-links a:hover::after { width: 100%; }
    @media (min-width: 768px) { .nav-links { display: flex; } }

    /* Hero */
    .hero { padding-top: 5rem; padding-bottom: 8rem; overflow: hidden; background: radial-gradient(circle at 70% 20%, var(--primary-light) 0%, transparent 40%); transition: background 0.4s; width: 100%; }
    .hero-tag { display: inline-flex; align-items: center; background-color: var(--primary-light); color: var(--primary); padding: 0.5rem 1.25rem; border-radius: 99px; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2rem; border: 1px solid rgba(126, 34, 206, 0.1); }
    .hero h1 { font-size: 3.5rem; line-height: 1; font-weight: 900; margin-bottom: 2rem; color: var(--secondary); letter-spacing: -2px; }
    .hero p { font-size: 1.25rem; color: var(--text-body); margin-bottom: 3rem; max-width: 35rem; line-height: 1.7; }
    .hero-actions { display: flex; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 2rem; }
    .hero-card-wrapper { position: relative; min-height: 400px; display: flex; align-items: center; }
    .hero-glow { position: absolute; inset: -2rem; background: linear-gradient(135deg, var(--primary), var(--info)); border-radius: 50%; opacity: 0.2; filter: blur(60px); z-index: 0; }
    .hero-card { position: relative; background: var(--bg-card); padding: 2.5rem; border-radius: 2.5rem; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25); border: 1px solid var(--border); z-index: 1; transition: all 0.4s; width: 100%; }
    @media (min-width: 768px) { .hero h1 { font-size: 5rem; } }

    .stat-card { background-color: var(--bg-body); padding: 2rem; border-radius: 1.5rem; border: 1px solid var(--border); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .stat-val { font-size: 2.5rem; font-weight: 900; color: var(--primary); margin-bottom: 0.5rem; }
    .stat-label { font-size: 0.75rem; font-weight: 800; color: var(--text-light); text-transform: uppercase; letter-spacing: 1px; }

    .feature-item { display: flex; align-items: center; gap: 1.5rem; padding: 1.25rem; border-radius: 1.5rem; transition: all 0.3s; border: 1px solid transparent; }
    .feature-icon { width: 3.5rem; height: 3.5rem; background-color: var(--primary); color: #fff; border-radius: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.25rem; box-shadow: 0 8px 16px rgba(126, 34, 206, 0.2); }

    .dark-section { background-color: var(--bg-dark-surface); color: #fff; padding: 8rem 0; position: relative; overflow: hidden; width: 100%; }
    .dark-section h2 { font-size: 3.5rem; font-weight: 900; margin-bottom: 2rem; letter-spacing: -1px; }
    .check-list li { display: flex; align-items: center; gap: 1rem; color: #cbd5e1; margin-bottom: 1.5rem; font-weight: 600; }
    .check-icon { color: var(--success); font-size: 1.25rem; }

    .service-grid-item { padding: 3rem 2.5rem; border: 1px solid var(--border); border-radius: 2rem; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1); background: var(--bg-card); min-height: 280px; }
    .service-icon { width: 4rem; height: 4rem; background-color: var(--bg-body); border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; color: var(--primary); transition: all 0.4s; font-size: 1.75rem; }
    .service-grid-item h3 { color: var(--secondary); margin-bottom: 1rem; font-weight: 800; font-size: 1.5rem; }

    .calc-wrapper { background-color: var(--bg-dark-surface); padding: 3.5rem; border-radius: 3rem; border: 1px solid var(--border); box-shadow: 0 40px 80px rgba(0,0,0,0.3); width: 100%; }
    .calc-input { width: 100%; background: rgba(255,255,255,0.05); border: 2px solid transparent; padding: 1rem 1.25rem; border-radius: 1rem; color: #fff; outline: none; transition: all 0.3s; font-size: 1.1rem; font-weight: 600; }
    
    .form-card { background: var(--bg-card); padding: 4rem; border-radius: 3rem; box-shadow: 0 40px 80px rgba(0, 0, 0, 0.15); max-width: 900px; margin: 0 auto; border: 1px solid var(--border); }
    .form-input, .form-textarea { width: 100%; padding: 1.15rem; background: var(--bg-body); border: 2px solid var(--border); border-radius: 1.25rem; outline: none; font-family: inherit; color: var(--secondary); font-weight: 600; transition: all 0.3s; }

    .testimonial-card { background: var(--bg-body); padding: 3rem; border-radius: 2.25rem; border: 1px solid var(--border); font-style: italic; transition: all 0.4s ease; position: relative; min-height: 250px; }
    .stars { color: var(--warning); display: flex; gap: 0.35rem; margin-bottom: 1.5rem; }

    .footer { background-color: #000000; color: #fff; padding-top: 7rem; padding-bottom: 4rem; font-size: 0.95rem; border-top: 1px solid rgba(255,255,255,0.05); width: 100%; }
    .social-icon { width: 3rem; height: 3rem; background: rgba(255, 255, 255, 0.05); border-radius: 1rem; display: inline-flex; align-items: center; justify-content: center; margin-right: 0.85rem; transition: all 0.4s; color: #fff; font-size: 1.15rem; }
    .footer-bottom { text-align: center; margin-top: 6rem; padding-top: 2.5rem; border-top: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 0.85rem; }
`;
