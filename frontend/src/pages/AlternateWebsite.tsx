import { useEffect, useMemo, useState, useRef, useLayoutEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ALTERNATE_WEBSITE_STYLES } from './website/AlternateWebsiteStyle';
import Chart from 'chart.js/auto';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LocomotiveScroll from 'locomotive-scroll';

// Important for GSAP + Locomotive
gsap.registerPlugin(ScrollTrigger);

export function AlternateWebsitePage() {
    const { user } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // SIP Calculator State
    const [monthly, setMonthly] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    const sipResult = useMemo(() => {
        const P = Number(monthly);
        const r = Number(rate) / 100 / 12;
        const n = Number(years) * 12;
        if (!P || !r || !n) return { invested: 0, returns: 0, total: 0 };
        const fv = P * (((Math.pow(1 + r, n)) - 1) / r) * (1 + r);
        const invested = P * n;
        return {
            invested,
            returns: fv - invested,
            total: fv,
        };
    }, [monthly, rate, years]);

    const fmt = (val: number) => "INR" + Math.round(val).toLocaleString('en-IN');
    const heroChartRef = useRef<HTMLCanvasElement>(null);
    const dashChartRef = useRef<HTMLCanvasElement>(null);

    // Locomotive Scroll v5 + GSAP Initialization
    useLayoutEffect(() => {
        // Only initialize if we have the ref
        if (!scrollRef.current) return;

        // Locomotive Scroll v5 is basically "new LocomotiveScroll()"
        // We initialize it and it automatically finds the scroll container or uses body
        const locoScroll = new LocomotiveScroll();

        // GSAP Animations
        const ctx = gsap.context(() => {
            // Set initial state for reveal elements to prevent blank page
            // We use autoAlpha for both visibility and opacity
            gsap.set(".gsap-reveal", { autoAlpha: 0, y: 50 });
            gsap.set(".gsap-reveal-stagger", { autoAlpha: 0, y: 30 });

            // Immediate Hero Animation
            const heroTl = gsap.timeline();
            heroTl.to(".hero h1, .hero p, .hero-actions, .hero-tag", { 
                autoAlpha: 1, 
                y: 0, 
                duration: 1, 
                stagger: 0.1, 
                ease: "power3.out" 
            });
            heroTl.to(".hero-card-wrapper", {
                autoAlpha: 1,
                x: 0,
                duration: 1,
                ease: "power2.out"
            }, "-=0.8");

            // Scroll Triggers for reveals
            const revealElements = gsap.utils.toArray(".gsap-reveal");
            revealElements.forEach((el: any) => {
                gsap.to(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%", // Trigger slightly earlier
                        toggleActions: "play none none none"
                    },
                    autoAlpha: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out"
                });
            });

            // Staggered items (like service cards or stats)
            const staggerGroups = [".stat-card", ".service-grid-item", ".testimonial-card"];
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
                        stagger: 0.2,
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

    useEffect(() => {
        let heroChartInstance: any = null;
        let dashChartInstance: any = null;

        if (heroChartRef.current) {
            heroChartInstance = new Chart(heroChartRef.current, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Portfolio Value',
                        data: [23, 23.5, 24, 24.5, 25, 25.5],
                        borderColor: '#7e22ce',
                        backgroundColor: 'rgba(126, 34, 206, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#7e22ce'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { display: false }, x: { grid: { display: false } } }
                }
            });
        }

        if (dashChartRef.current) {
            dashChartInstance = new Chart(dashChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Equity', 'MF', 'Bonds', 'Cash'],
                    datasets: [{
                        label: 'Allocation',
                        data: [45, 30, 15, 10],
                        backgroundColor: ['#7e22ce', '#a855f7', '#c084fc', '#e9d5ff'],
                        borderRadius: 12,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'x',
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, display: false }, x: { grid: { display: false } } }
                }
            });
        }

        return () => {
            if (heroChartInstance) heroChartInstance.destroy();
            if (dashChartInstance) dashChartInstance.destroy();
        };
    }, []);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for reaching out! We will contact you shortly.');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="theme-wrapper" data-theme={isDarkMode ? 'dark' : 'light'}>
            <style dangerouslySetInnerHTML={{ __html: ALTERNATE_WEBSITE_STYLES }} />
            
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
                        <div className="ticker-item">SENSEX: <span className="ticker-sensex val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">NIFTY 50: <span className="ticker-nifty val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">GOLD: <span className="ticker-gold val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">1CAPITAL.IN GROWTH: <span className="ticker-alpha val-blue">-- (--%)</span></div>
                        <div className="ticker-item">SENSEX: <span className="ticker-sensex val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">NIFTY 50: <span className="ticker-nifty val-neutral">-- (--%)</span></div>
                        <div className="ticker-item">GOLD: <span className="ticker-gold val-neutral">-- (--%)</span></div>
                    </div>
                </div>

                <nav className="navbar">
                    <div className="container" style={{ opacity: 1, visibility: 'visible' }}>
                        <div className="logo">
                            <i className="fas fa-chart-line"></i> One<span>Capital</span>
                        </div>
                        <div className="nav-links">
                            <a href="#home">Home</a>
                            <a href="/about-us/">About Us</a>
                            <a href="#services">Services</a>
                            <a href="/mutual-funds/">Mutual Funds</a>
                            <a href="/mf-advisor/">MF Advisor</a>
                            <a href="/pms-aif/">PMS &amp; AIF</a>
                            <a href="#contact">Contact</a>
                        </div>
                        <div className="nav-auth">
                            {user && <a href="/dashboard" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>Dashboard</a>}
                        </div>
                    </div>
                </nav>

                <section id="home" className="hero">
                    <div className="container grid grid-2">
                        <div>
                            <span className="hero-tag">Expert Financial Guidance</span>
                            <h1>Empower Your <span className="text-gradient">Financial</span> Future.</h1>
                            <p>Explore elite Mutual Funds, bespoke Portfolio Management, and precision Wealth Advisory. Our Vision is defined by your growth.</p>
                            <div className="hero-actions">
                                {!user ? (
                                    <>
                                        <a href="/login" className="btn btn-primary btn-lg">Get Started</a>
                                        <a href="/mf-advisor/" className="btn btn-purple btn-lg">MF Recommendation</a>
                                        <a href="#contact" className="btn btn-outline btn-lg">Contact Us</a>
                                    </>
                                ) : (
                                    <>
                                        <a href="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</a>
                                        <a href="/mf-advisor/" className="btn btn-purple btn-lg">MF Advisor</a>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hero-card-wrapper" style={{ opacity: 0, transform: 'translateX(30px)' }}>
                            <div className="hero-glow"></div>
                            <div className="hero-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Global Indices</h3>
                                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.35rem 1rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 800 }}>LIVE MARKETS</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.5rem', fontWeight: 700 }}>Avg. Monthly Returns</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--secondary)' }}>+2.45%</div>
                                    </div>
                                    <div style={{ background: 'var(--bg-body)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.5rem', fontWeight: 700 }}>Alpha Generated</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>+5.21%</div>
                                    </div>
                                </div>
                                <div style={{ height: '140px' }}>
                                    <canvas ref={heroChartRef}></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="section bg-white">
                    <div className="container grid grid-2 gsap-reveal">
                        <div>
                            <h2 className="section-title">A Vision Beyond Numbers</h2>
                            <p className="text-muted" style={{ marginBottom: '3rem', fontSize: '1.15rem' }}>
                                We bridge the gap between financial aspirations and reality. Our team of veteran advisors leverages cutting-edge analytics to secure your legacy.
                            </p>
                            <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                                <div className="stat-card" style={{ opacity: 0 }}>
                                    <div className="stat-val">INR 500+ Cr</div>
                                    <div className="stat-label">AUM Under Advisory</div>
                                </div>
                                <div className="stat-card" style={{ opacity: 0 }}>
                                    <div className="stat-val">5K+</div>
                                    <div className="stat-label">Trusted Clients</div>
                                </div>
                                <div className="stat-card" style={{ opacity: 0 }}>
                                    <div className="stat-val">25+</div>
                                    <div className="stat-label">Years of Mastery</div>
                                </div>
                                <div className="stat-card" style={{ opacity: 0 }}>
                                    <div className="stat-val">99%</div>
                                    <div className="stat-label">Retention Rate</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="section-title">Unmatched Standards</h2>
                            <div className="grid">
                                <div className="feature-item">
                                    <div className="feature-icon"><i className="fas fa-shield-halved"></i></div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.35rem', fontSize: '1.1rem' }}>Sovereign Security</h4>
                                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>SEBI licensed & ISO certified advisory protocols.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon"><i className="fas fa-microchip"></i></div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.35rem', fontSize: '1.1rem' }}>AI-Driven Insights</h4>
                                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Proprietary algorithms for market scanning.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon"><i className="fas fa-gem"></i></div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.35rem', fontSize: '1.1rem' }}>Exclusive Access</h4>
                                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Direct entry into elite PMS & Alternative Funds.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="command" className="dark-section">
                    <div className="container grid grid-2 gsap-reveal" style={{ alignItems: 'center' }}>
                        <div>
                            <h2>Wealth Command, <br/> Everywhere.</h2>
                            <p>Command your portfolio with our sophisticated interface. Real-time risk heatmaps, tax-loss harvesting, and multi-asset tracking.</p>
                            <ul className="check-list">
                                <li><i className="fas fa-check-circle check-icon"></i> Institutional Grade Security</li>
                                <li><i className="fas fa-check-circle check-icon"></i> Dynamic Asset Rebalancing</li>
                                <li><i className="fas fa-check-circle check-icon"></i> Bespoke Risk Profiling</li>
                            </ul>
                            {!user && (
                                <a href="#" className="btn btn-purple btn-lg" style={{ marginTop: '1rem' }}>Launch Dashboard</a>
                            )}
                        </div>

                        <div>
                            <div className="calc-wrapper">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Performance Radar</h3>
                                    <span style={{ background: 'rgba(126, 34, 206, 0.4)', color: '#fff', padding: '0.4rem 1.25rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 800 }}>Q1 GAINS</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div className="dash-stat-box">
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.5rem', fontWeight: 700 }}>NAV Growth</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>+18.2%</div>
                                    </div>
                                    <div className="dash-stat-box">
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.5rem', fontWeight: 700 }}>Alpha</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>+6.4%</div>
                                    </div>
                                    <div className="dash-stat-box">
                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.5rem', fontWeight: 700 }}>Risk Adjusted</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>1.4x</div>
                                    </div>
                                </div>
                                <div style={{ height: '200px' }}>
                                    <canvas ref={dashChartRef}></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="services" className="section bg-white">
                    <div className="container">
                        <div className="text-center gsap-reveal" style={{ marginBottom: '5rem' }}>
                            <h2 className="section-title">The Masterworks</h2>
                            <p className="text-muted" style={{ maxWidth: '40rem', margin: '0 auto', fontSize: '1.2rem' }}>Every client is unique. Every strategy is handcrafted.</p>
                        </div>
                        <div className="grid grid-3">
                            {/* Service Items */}
                            <div className="service-grid-item" style={{ opacity: 0 }}>
                                <div className="service-icon"><i className="fas fa-crown"></i></div>
                                <h3>Elite PMS</h3>
                                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Precision management for high-conviction portfolios aiming for consistent alpha generation.</p>
                            </div>
                            <div className="service-grid-item" style={{ opacity: 0 }}>
                                <div className="service-icon"><i className="fas fa-vault"></i></div>
                                <h3>Mutual Fund 360</h3>
                                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Curated baskets across categories, optimized daily for performance and tax efficiency.</p>
                            </div>
                            <div className="service-grid-item" style={{ opacity: 0 }}>
                                <div className="service-icon"><i className="fas fa-infinity"></i></div>
                                <h3>Wealth Planning</h3>
                                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Multi-generational asset mapping, estate planning, and risk containment strategies.</p>
                            </div>
                            <div className="service-grid-item" style={{ opacity: 0 }}>
                                <div className="service-icon"><i className="fas fa-shield-heart"></i></div>
                                <h3>Alternative Assets</h3>
                                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Exclusive access to AIFs, Startup Equity, and Real Estate Structured Products.</p>
                            </div>
                            <div className="service-grid-item" style={{ opacity: 0 }}>
                                <div className="service-icon"><i className="fas fa-piggy-bank"></i></div>
                                <h3>Tax Strategy</h3>
                                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Institutional-grade tax planning to preserve more of what you earn year after year.</p>
                            </div>
                            <div className="service-grid-item" style={{ opacity: 0 }}>
                                <div className="service-icon"><i className="fas fa-bolt"></i></div>
                                <h3>Direct Execution</h3>
                                <p className="text-muted" style={{ fontSize: '0.95rem' }}>Low-latency trade execution engine for institutional and high-volume retail mandates.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pms-cta" className="section" style={{ backgroundColor: 'var(--primary-light)' }}>
                    <div className="container grid grid-2 gsap-reveal">
                        <div style={{ background: 'var(--bg-card)', padding: '3.5rem', borderRadius: '3rem', border: '1px solid var(--border)', transition: 'transform 0.4s' }}>
                            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--secondary)' }}>Portfolio Management</h3>
                            <p className="text-muted" style={{ marginBottom: '2.5rem', fontSize: '1.1rem' }}>Bespoke equity mandates for long-term compounding.</p>
                            <ul style={{ gap: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                                <li style={{ display: 'flex', gap: '1rem', fontWeight: 700 }}><i className="fas fa-circle-check" style={{ color: 'var(--success)', fontSize: '1.2rem' }}></i> Minimum Mandate: INR 25 Lakhs</li>
                                <li style={{ display: 'flex', gap: '1rem', fontWeight: 700 }}><i className="fas fa-circle-check" style={{ color: 'var(--success)', fontSize: '1.2rem' }}></i> Thematic Conviction Investing</li>
                                <li style={{ display: 'flex', gap: '1rem', fontWeight: 700 }}><i className="fas fa-circle-check" style={{ color: 'var(--success)', fontSize: '1.2rem' }}></i> Real-time Compliance Audits</li>
                            </ul>
                            <a href="#" className="btn btn-primary" style={{ marginTop: '2.5rem', width: '100%' }}>Inquire Now</a>
                        </div>

                        <div style={{ background: 'var(--secondary)', padding: '3.5rem', borderRadius: '3rem', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem' }}>Alternative Funds</h3>
                            <p style={{ opacity: 0.6, marginBottom: '2.5rem', fontSize: '1.1rem' }}>Exclusive entry into private equity & infrastructure.</p>
                            <ul style={{ gap: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                                <li style={{ display: 'flex', gap: '1rem', fontWeight: 700 }}><i className="fas fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i> Minimum Mandate: INR 1 Crore</li>
                                <li style={{ display: 'flex', gap: '1rem', fontWeight: 700 }}><i className="fas fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i> Diversified AIF Structures</li>
                                <li style={{ display: 'flex', gap: '1rem', fontWeight: 700 }}><i className="fas fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i> Priority Access to VC Alpha</li>
                            </ul>
                            <a href="#" className="btn btn-purple" style={{ marginTop: '2.5rem', width: '100%' }}>Request Prospectus</a>
                        </div>
                    </div>
                </section>

                <section id="contact" className="section" style={{ backgroundColor: 'var(--secondary)' }}>
                    <div className="container gsap-reveal">
                        <div className="form-card">
                            <h2 className="section-title text-center">Start Your Legacy.</h2>
                            <p className="text-center text-muted" style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>Initiate a consultation with our master advisors.</p>
                            <form className="form-grid" onSubmit={handleFormSubmit}>
                                <input type="text" className="form-input" placeholder="Full Name" required />
                                <input type="email" className="form-input" placeholder="Professional Email" required />
                                <input type="tel" className="form-input" placeholder="Phone Number" required />
                                <input type="text" className="form-input" placeholder="Investment Focus" />
                                <textarea className="form-textarea span-2" placeholder="Message or Portfolio Brief" required></textarea>
                                <button type="submit" className="btn btn-purple btn-lg" style={{ gridColumn: 'span 2' }}>Send Application</button>
                            </form>
                        </div>
                    </div>
                </section>

                <section id="sip-calculator" className="dark-section">
                    <div className="container gsap-reveal" style={{ maxWidth: '1000px' }}>
                        <div className="text-center" style={{ marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '3rem' }}>The compounding engine.</h2>
                            <p>Simulate your future wealth with our optimized SIP calculator.</p>
                        </div>
                        <div className="calc-wrapper">
                            <div className="grid grid-3" style={{ marginBottom: '4rem' }}>
                                <div className="calc-input-group">
                                    <label>Monthly Contribution</label>
                                    <input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="calc-input" />
                                </div>
                                <div className="calc-input-group">
                                    <label>Expected Alpha (%)</label>
                                    <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="calc-input" />
                                </div>
                                <div className="calc-input-group">
                                    <label>Time Horizon (Years)</label>
                                    <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="calc-input" />
                                </div>
                            </div>
                            <div className="grid grid-3 text-center">
                                <div className="dash-stat-box">
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>TOTAL INVESTED</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{fmt(sipResult.invested)}</div>
                                </div>
                                <div className="dash-stat-box" style={{ borderColor: 'var(--primary)' }}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>EST. GROWTH</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>{fmt(sipResult.returns)}</div>
                                </div>
                                <div style={{ background: 'var(--primary)', padding: '1.5rem', borderRadius: '1.5rem', boxShadow: '0 15px 30px rgba(126, 34, 206, 0.4)' }}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: '#fff' }}>MATURITY VALUE</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>{fmt(sipResult.total)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="testimonials" className="section bg-white">
                    <div className="container gsap-reveal">
                        <h2 className="section-title text-center" style={{ marginBottom: '5rem' }}>Voices of Success</h2>
                        <div className="grid grid-3">
                            <div className="testimonial-card" style={{ opacity: 0 }}>
                                <div className="stars">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>"1capital.in didn't just manage my money; they redefined my relationship with wealth. Their PMS strategy is institutional grade."</p>
                                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--primary-light)' }}></div>
                                    <div>
                                        <div style={{ fontWeight: 900, color: 'var(--secondary)' }}>Vikram Singh</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>CEO, TechSphere</div>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card" style={{ opacity: 0 }}>
                                <div className="stars">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>"The transparency and real-time dashboard are miles ahead of traditional brokers. Highly recommended for Serious Investors."</p>
                                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--primary-light)' }}></div>
                                    <div>
                                        <div style={{ fontWeight: 900, color: 'var(--secondary)' }}>Dr. Anjali Verma</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Entrepreneur</div>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card" style={{ opacity: 0 }}>
                                <div className="stars">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>"Bespoke wealth advisory that actually understands risk. They saved my capital during the 2024 volatility."</p>
                                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--primary-light)' }}></div>
                                    <div>
                                        <div style={{ fontWeight: 900, color: 'var(--secondary)' }}>Siddharth Mehta</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Venture Partner</div>
                                    </div>
                                </div>
                            </div>
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
                                    <li><a href="#">MF Advisory</a></li>
                                    <li><a href="#">Alternative Funds</a></li>
                                    <li><a href="#">Tax Harvesting</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '2rem', fontWeight: 900 }}>Company</h4>
                                <ul className="footer-links">
                                    <li><a href="#">Our Vision</a></li>
                                    <li><a href="#">Legal Disclosure</a></li>
                                    <li><a href="#">Contact Advisory</a></li>
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
