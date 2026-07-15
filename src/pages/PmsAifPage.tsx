import { useState, useRef, useLayoutEffect } from 'react';
import { ALTERNATE_WEBSITE_STYLES } from './website/AlternateWebsiteStyle';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';

gsap.registerPlugin(ScrollTrigger);

const PMS_AIF_STYLES = `
    .hero-banner {
        background: radial-gradient(circle at 70% 20%, var(--primary-light) 0%, transparent 40%);
        color: var(--secondary);
        padding: 7rem 0 5rem 0;
        text-align: center;
        transition: background 0.4s;
    }
    .hero-banner h1 {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        font-weight: 900;
        letter-spacing: -1.5px;
    }
    .hero-banner p {
        font-size: 1.25rem;
        color: var(--text-body);
        max-width: 700px;
        margin: 0 auto;
        line-height: 1.7;
    }

    .info-card {
        background: var(--bg-card);
        padding: 2.5rem;
        border-radius: 2rem;
        border: 1px solid var(--border);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: all 0.4s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .info-card:hover {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        transform: translateY(-8px);
        border-color: var(--primary);
    }
    .info-card h3 {
        color: var(--primary);
        margin-bottom: 1.5rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        font-size: 1.35rem;
    }
    .info-card p {
        color: var(--text-body);
        line-height: 1.8;
        flex-grow: 1;
    }

    .feature-list {
        list-style: none;
        padding: 0;
        margin: 1.5rem 0;
    }
    .feature-list li {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.25rem;
        padding: 1.25rem;
        background: var(--bg-body);
        border-radius: 1rem;
        border-left: 4px solid var(--primary);
        transition: all 0.3s ease;
    }
    .feature-list li:hover {
        background: var(--primary-light);
        transform: translateX(5px);
    }
    .feature-list li:before {
        content: "✓";
        color: var(--success);
        font-weight: 900;
        font-size: 1.25rem;
        flex-shrink: 0;
        background: rgba(16, 185, 129, 0.1);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    .feature-list li span {
        color: var(--text-body);
        line-height: 1.6;
    }

    .cta-section {
        background: var(--bg-dark-surface);
        color: #fff;
        padding: 6rem 0;
        text-align: center;
        position: relative;
        overflow: hidden;
    }
    .cta-section::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 100%, rgba(126, 34, 206, 0.15) 0%, transparent 60%);
        pointer-events: none;
    }
    .cta-section h2 {
        font-size: 2.5rem;
        margin-bottom: 1.5rem;
        font-weight: 900;
        letter-spacing: -1px;
    }
    .cta-section p {
        font-size: 1.25rem;
        margin-bottom: 2.5rem;
        color: #cbd5e1;
    }

    .comparison-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2.5rem;
        margin-top: 3rem;
    }

    @media (max-width: 768px) {
        .comparison-grid {
            grid-template-columns: 1fr;
        }
    }

    .bg-light { background-color: var(--bg-body); }
    .bg-white { background-color: var(--bg-card); transition: background 0.4s; }
    
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--primary);
        font-weight: 700;
        margin-bottom: 2rem;
        transition: all 0.3s ease;
        padding: 0.5rem 1rem;
        background: var(--primary-light);
        border-radius: 99px;
    }
    .back-link:hover {
        color: var(--primary-dark);
        gap: 0.75rem;
        background: var(--border);
    }
`;

export function PmsAifPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!scrollRef.current) return;

        const locoScroll = new LocomotiveScroll();

        const ctx = gsap.context(() => {
            gsap.set(".gsap-reveal", { autoAlpha: 0, y: 50 });
            gsap.set(".gsap-reveal-stagger", { autoAlpha: 0, y: 30 });

            // Immediate Hero Animation
            const heroTl = gsap.timeline();
            heroTl.to(".hero-banner h1, .hero-banner p", { 
                autoAlpha: 1, 
                y: 0, 
                duration: 1, 
                stagger: 0.1, 
                ease: "power3.out",
                delay: 0.1
            });

            // Scroll Triggers for reveals
            const revealElements = gsap.utils.toArray(".gsap-reveal");
            revealElements.forEach((el: any) => {
                gsap.to(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    },
                    autoAlpha: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out"
                });
            });

            // Staggered items
            const staggerGroups = [".info-card-group .info-card", ".feature-list li", ".grid-3 .info-card"];
            staggerGroups.forEach(selector => {
                const elements = gsap.utils.toArray(selector);
                if (elements.length > 0) {
                    gsap.to(elements, {
                        scrollTrigger: {
                            trigger: elements[0] as any,
                            start: "top 85%",
                        },
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: "power2.out"
                    });
                }
            });

        }, scrollRef);

        return () => {
            ctx.revert();
            locoScroll.destroy();
        };
    }, []);

    return (
        <div className="theme-wrapper" data-theme={isDarkMode ? 'dark' : 'light'}>
            <style dangerouslySetInnerHTML={{ __html: ALTERNATE_WEBSITE_STYLES }} />
            <style dangerouslySetInnerHTML={{ __html: PMS_AIF_STYLES }} />
            
            <button 
                className="theme-toggle" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Pitch Black Mode"
            >
                <i className={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
            </button>

            <div ref={scrollRef}>
                <div className="ticker-wrap">
                    <div className="ticker-move">
                        <div className="ticker-item">SENSEX: <span className="val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">NIFTY 50: <span className="val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">GOLD: <span className="val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">1CAPITAL.IN GROWTH: <span className="val-blue">-- (--%)</span></div>
                        <div className="ticker-item">SENSEX: <span className="val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">NIFTY 50: <span className="val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">GOLD: <span className="val-neutral">-- (--%)</span></div>
                    </div>
                </div>

                <nav className="navbar">
                    <div className="container" style={{ opacity: 1, visibility: 'visible' }}>
                        <div className="logo">
                            <i className="fas fa-chart-line"></i> One<span>Capital</span>
                        </div>
                        <div className="nav-links">
                            <a href="/">Home</a>
                            <a href="/#about">About Us</a>
                            <a href="/#services">Services</a>
                            <a href="/mutual-funds">Mutual Funds</a>
                            <a href="/#sip-calculator">MF Advisor</a>
                            <a href="/pms-aif">PMS &amp; AIF</a>
                            <a href="/#contact">Contact</a>
                        </div>
                        <div className="nav-auth"></div>
                    </div>
                </nav>

                <section className="hero-banner">
                    <div className="container">
                        <h1 style={{ opacity: 0, transform: 'translateY(20px)' }}>PMS &amp; AIF</h1>
                        <p style={{ opacity: 0, transform: 'translateY(20px)' }}>Sophisticated investment architectures designed to maximize alpha and generate premium wealth opportunities for high-net-worth individuals and family offices.</p>
                    </div>
                </section>

                <section className="section bg-light" style={{ padding: '2rem 0' }}>
                    <div className="container">
                        <a href="/" className="back-link">
                            <i className="fas fa-arrow-left"></i> Back to Home
                        </a>
                    </div>
                </section>

                <section className="section bg-white">
                    <div className="container">
                        <div className="grid grid-2 gsap-reveal">
                            <div>
                                <h2 className="section-title">Institutional Grade <span className="text-gradient">Wealth Solutions</span></h2>
                                <p className="text-muted" style={{ fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                                    We offer direct, tailored access to high-conviction portfolios (PMS) and complex structured assets, venture capital, and private credit vehicles (AIF). Our solutions bypass standard retail limitations to unlock concentrated outperformance.
                                </p>
                            </div>

                            <div className="info-card-group">
                                <div className="info-card" style={{ opacity: 0 }}>
                                    <h3><i className="fas fa-gem" style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}></i>Elite Wealth Features</h3>
                                    <ul className="feature-list">
                                        <li><span><strong>Active Custom Mandate:</strong> Individual account structures tailored for specific risk-return targets</span></li>
                                        <li><span><strong>Direct Co-investments:</strong> Participation in select direct equity and venture opportunities</span></li>
                                        <li><span><strong>Micro-allocation Controls:</strong> Sophisticated sector exclusions and customized cash level hedges</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="gsap-reveal" style={{ marginTop: '5rem' }}>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 900 }}>Strategic Pillars of Premium Assets</h3>
                            <ul className="feature-list grid grid-2" style={{ margin: 0 }}>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Uncorrelated Returns:</strong> Asset profiles designed to perform independently of equity benchmarks</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Direct Advisory Loops:</strong> Direct dialogue with portfolio managers and principal strategists</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Structured Risk Mitigation:</strong> Built-in hedges to shelter capital against structural market shifts</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Advanced Tax Structuring:</strong> Optimized wrappers to contain taxation overhead on returns</span></li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="section bg-light">
                    <div className="container">
                        <h2 className="section-title text-center gsap-reveal" style={{ marginBottom: '2rem' }}>Our Premium Asset Classes</h2>
                        <p className="text-center text-muted gsap-reveal" style={{ maxWidth: '600px', margin: '0 auto 4rem auto' }}>Compare our two institutional investment channels tailored for serious capital appreciation.</p>

                        <div className="comparison-grid info-card-group">
                            <div className="info-card" style={{ opacity: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0 }}><i className="fas fa-crown" style={{ marginRight: '0.75rem' }}></i>PMS</h3>
                                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.35rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800 }}>MIN. INR 50 LAKHS</span>
                                </div>
                                <p style={{ fontWeight: 800, color: 'var(--secondary)', marginBottom: '1rem' }}>Portfolio Management Services</p>
                                <p style={{ marginBottom: '1.5rem' }}>Concentrated stock portfolios managed by dedicated investment teams. Offers direct equity ownership with transaction transparency.</p>
                                <ul className="feature-list" style={{ margin: 0 }}>
                                    <li><span>Direct ownership of stocks in your personal demat account</span></li>
                                    <li><span>Bespoke sector overlays and investment restrictions</span></li>
                                    <li><span>Higher transparency on costs, transactions, and holdings</span></li>
                                </ul>
                            </div>

                            <div className="info-card" style={{ opacity: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0 }}><i className="fas fa-vault" style={{ marginRight: '0.75rem' }}></i>AIF</h3>
                                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.35rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800 }}>MIN. INR 1 CRORE</span>
                                </div>
                                <p style={{ fontWeight: 800, color: 'var(--secondary)', marginBottom: '1rem' }}>Alternative Investment Funds</p>
                                <p style={{ marginBottom: '1.5rem' }}>Pooled investment vehicles across Venture Capital, Private Equity, Structured Debt, and Hedge Fund strategies. Unlocks private market alpha.</p>
                                <ul className="feature-list" style={{ margin: 0 }}>
                                    <li><span>Access to exclusive pre-IPO startups, private debt, and real estate</span></li>
                                    <li><span>Sophisticated derivatives and hedging strategies for Category III</span></li>
                                    <li><span>Long-term lock-in options designed for generation-level wealth</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section gsap-reveal">
                    <div className="container">
                        <h2>Request Private Placement Access</h2>
                        <p>Our principal advisors review applications on a private basis to construct custom portfolios suited for your targets.</p>
                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="/#contact" className="btn btn-purple btn-lg">Request Consultation</a>
                        </div>
                    </div>
                </section>

                <footer className="footer">
                    <div className="container">
                        <div className="grid grid-4" style={{ marginBottom: '6rem' }}>
                            <div>
                                <div className="logo" style={{ marginBottom: '2rem', fontSize: '2rem', color: '#fff' }}>
                                    One<span>Capital</span>
                                </div>
                                <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                                    Redefining wealth management through precision advisory and institutional-grade technology.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                                    <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                                    <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                                    <a href="#" className="social-icon whatsapp"><i className="fab fa-whatsapp"></i></a>
                                </div>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '2rem', fontWeight: 900 }}>Strategies</h4>
                                <ul className="footer-links">
                                    <li><a href="#">Equity PMS</a></li>
                                    <li><a href="/mutual-funds">MF Advisory</a></li>
                                    <li><a href="/pms-aif">Alternative Funds</a></li>
                                    <li><a href="#">Tax Harvesting</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '2rem', fontWeight: 900 }}>Company</h4>
                                <ul className="footer-links">
                                    <li><a href="/#about">Our Vision</a></li>
                                    <li><a href="#">Legal Disclosure</a></li>
                                    <li><a href="/#contact">Contact Advisory</a></li>
                                    <li><a href="#">Partner Network</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '2rem', fontWeight: 900 }}>Ecosystem</h4>
                                <ul className="footer-links">
                                    <li><a href="/mutual-funds">Mutual Fund Engine</a></li>
                                    <li><a href="/pms-aif">Private Assets Portal</a></li>
                                    <li><a href="#">Investor Desk</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; 2026 1capital.in &bull; SEBI Master Advisory Licensed &bull; All Rights Reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
