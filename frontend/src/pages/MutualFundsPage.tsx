import { useState, useRef, useLayoutEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ALTERNATE_WEBSITE_STYLES } from './website/AlternateWebsiteStyle';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';

gsap.registerPlugin(ScrollTrigger);

const MUTUAL_FUNDS_STYLES = `
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
        max-width: 600px;
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

export function MutualFundsPage() {
    const { user } = useAuth();
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
            <style dangerouslySetInnerHTML={{ __html: MUTUAL_FUNDS_STYLES }} />
            
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
                            <a href="/website">Home</a>
                            <a href="/about-us/">About Us</a>
                            <a href="/website#services">Services</a>
                            <a href="/mutual-funds/">Mutual Funds</a>
                            <a href="/mf-advisor/">MF Advisor</a>
                            <a href="/pms/">PMS &amp; AIF</a>
                            <a href="/website#contact">Contact</a>
                        </div>
                        <div className="nav-auth">
                            {user && <a href="/dashboard" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Dashboard</a>}
                        </div>
                    </div>
                </nav>

                <section className="hero-banner">
                    <div className="container">
                        <h1 style={{ opacity: 0, transform: 'translateY(20px)' }}>Mutual Funds</h1>
                        <p style={{ opacity: 0, transform: 'translateY(20px)' }}>Build wealth systematically with professionally managed investment portfolios across equity, debt, and hybrid categories.</p>
                    </div>
                </section>

                <section className="section bg-light" style={{ padding: '2rem 0' }}>
                    <div className="container">
                        <a href="/website" className="back-link">
                            <i className="fas fa-arrow-left"></i> Back to Home
                        </a>
                    </div>
                </section>

                <section className="section bg-white">
                    <div className="container">
                        <div className="grid grid-2 gsap-reveal">
                            <div>
                                <h2 className="section-title">What are <span className="text-gradient">Mutual Funds?</span></h2>
                                <p className="text-muted" style={{ fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                                    Mutual Funds pool money from multiple investors and invest it in a diversified portfolio of stocks, bonds, or other securities. They are managed by professional fund managers, offering an easy way to invest in financial markets without needing large capital or expertise.
                                </p>
                            </div>

                            <div className="info-card-group">
                                <div className="info-card" style={{ opacity: 0 }}>
                                    <h3><i className="fas fa-chart-pie" style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}></i>Investment Categories</h3>
                                    <ul className="feature-list">
                                        <li><span><strong>Equity Funds:</strong> Focused on stock market investments for growth potential</span></li>
                                        <li><span><strong>Debt Funds:</strong> Primarily invested in bonds and fixed-income securities</span></li>
                                        <li><span><strong>Hybrid Funds:</strong> Balanced blend of equity and debt for moderate growth</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="gsap-reveal" style={{ marginTop: '5rem' }}>
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 900 }}>Advantages of Mutual Funds</h3>
                            <ul className="feature-list grid grid-2" style={{ margin: 0 }}>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Professional Management:</strong> Managed by experienced experts</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Diversification:</strong> Spread risk across multiple assets</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Affordable Investing:</strong> Start with small SIP amounts</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Liquidity:</strong> Easy buy and redemption options</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Transparency:</strong> Regular updates and disclosures</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Tax Benefits:</strong> ELSS funds help save tax</span></li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="section bg-light">
                    <div className="container">
                        <h2 className="section-title text-center gsap-reveal" style={{ marginBottom: '4rem' }}>Why Choose <span className="text-gradient">1Capital</span> for Mutual Funds?</h2>

                        <div className="grid grid-2 info-card-group" style={{ marginBottom: '4rem' }}>
                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3><i className="fas fa-ban" style={{ marginRight: '0.75rem', color: 'var(--failure)', fontSize: '1.25rem' }}></i>No "Top Performers" Gimmicks</h3>
                                <p>Carefully curated mutual funds based on forward-looking market analysis, not just past performance.</p>
                            </div>

                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3><i className="fas fa-compass" style={{ marginRight: '0.75rem', color: 'var(--primary)', fontSize: '1.25rem' }}></i>Market Scenario & Sector Outlook</h3>
                                <p>Direct plans with zero commission and personalized advice based on market conditions.</p>
                            </div>

                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3><i className="fas fa-percent" style={{ marginRight: '0.75rem', color: 'var(--success)', fontSize: '1.25rem' }}></i>Interest Rate & Inflation Analysis</h3>
                                <p>We monitor macroeconomic indicators like interest rates and inflation to make informed decisions about asset allocation.</p>
                            </div>

                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3><i className="fas fa-chart-line" style={{ marginRight: '0.75rem', color: 'var(--success)', fontSize: '1.25rem' }}></i>Evidence-Based Strategy</h3>
                                <p>Research-driven recommendations backed by thorough market analysis and historical data.</p>
                            </div>

                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3><i className="fas fa-user-tie" style={{ marginRight: '0.75rem', color: 'var(--info)', fontSize: '1.25rem' }}></i>Fund Manager Strategy</h3>
                                <p>Expert insights into fund manager philosophy and performance consistency over varying market cycles.</p>
                            </div>

                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3><i className="fas fa-shield-alt" style={{ marginRight: '0.75rem', color: 'var(--info)', fontSize: '1.25rem' }}></i>Enterprise-Grade Security</h3>
                                <p>Secure and compliant platform with 100% digital, paperless process for your convenience.</p>
                            </div>
                        </div>

                        <div className="gsap-reveal">
                            <h3 style={{ color: 'var(--primary)', fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 900 }}>Our Approach to Fund Selection</h3>
                            <ul className="feature-list">
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Forward-Looking Strategy:</strong> We construct portfolios based on future market prospects, not backward-looking performance</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Strategic Rebalancing:</strong> We adjust allocations as macro conditions shift to maintain optimal portfolio balance</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Goal-Based Planning:</strong> Customized strategies for SIPs, lump sum investments, and tactical entries</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Continuous Monitoring:</strong> Regular review and optimization of fund selections based on performance</span></li>
                                <li style={{ opacity: 0 }} className="gsap-reveal-stagger"><span><strong>Risk Management:</strong> Careful consideration of risk-adjusted returns across all strategies</span></li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="section bg-white">
                    <div className="container">
                        <h2 className="section-title text-center gsap-reveal" style={{ marginBottom: '4rem' }}>Investment Options</h2>

                        <div className="grid grid-3">
                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3 style={{ fontSize: '1.5rem', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
                                    <i className="fas fa-landmark" style={{ marginRight: '0.75rem', color: 'var(--primary)' }}></i>
                                    SIP
                                </h3>
                                <div className="text-center">
                                    <p style={{ fontWeight: 800, color: 'var(--secondary)' }}>Systematic Investment Plans</p>
                                    <p style={{ marginTop: '1rem' }}>Invest a fixed amount regularly to build wealth systematically and benefit from rupee cost averaging.</p>
                                </div>
                            </div>

                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3 style={{ fontSize: '1.5rem', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
                                    <i className="fas fa-money-bill-wave" style={{ marginRight: '0.75rem', color: 'var(--success)' }}></i>
                                    Lump Sum
                                </h3>
                                <div className="text-center">
                                    <p style={{ fontWeight: 800, color: 'var(--secondary)' }}>One-Time Investment</p>
                                    <p style={{ marginTop: '1rem' }}>Invest a larger amount at once, ideal for windfall gains or when you have available capital.</p>
                                </div>
                            </div>

                            <div className="info-card" style={{ opacity: 0 }}>
                                <h3 style={{ fontSize: '1.5rem', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
                                    <i className="fas fa-bolt" style={{ marginRight: '0.75rem', color: 'var(--warning)' }}></i>
                                    Tactical Entries
                                </h3>
                                <div className="text-center">
                                    <p style={{ fontWeight: 800, color: 'var(--secondary)' }}>Strategic Timing</p>
                                    <p style={{ marginTop: '1rem' }}>Capitalize on market opportunities with well-timed investments based on market analysis.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section gsap-reveal">
                    <div className="container">
                        <h2>Ready to Start Your Mutual Fund Journey?</h2>
                        <p>Let our expert advisors help you build a customized mutual fund portfolio aligned with your financial goals.</p>
                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {!user ? (
                                <a href="/login" className="btn btn-primary btn-lg">Login</a>
                            ) : (
                                <a href="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</a>
                            )}
                            <a href="/website#contact" className="btn btn-purple btn-lg">Contact Us</a>
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
                                    <li><a href="/mutual-funds/">MF Advisory</a></li>
                                    <li><a href="/pms/">Alternative Funds</a></li>
                                    <li><a href="#">Tax Harvesting</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '2rem', fontWeight: 900 }}>Company</h4>
                                <ul className="footer-links">
                                    <li><a href="/about-us/">Our Vision</a></li>
                                    <li><a href="#">Legal Disclosure</a></li>
                                    <li><a href="/website#contact">Contact Advisory</a></li>
                                    <li><a href="#">Partner Network</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '2rem', fontWeight: 900 }}>Ecosystem</h4>
                                <ul className="footer-links">
                                    <li><a href="/dashboard">Institutional Dashboard</a></li>
                                    <li><a href="/upload-portal/login/" style={{ fontWeight: 900, color: 'var(--primary)' }}>Data Portal</a></li>
                                    <li><a href="#">API Documentation</a></li>
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
