import { WEBSITE_STYLES } from './website/WebsiteStyle'
import { useState, useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Link } from 'react-router-dom'

export function WebsitePage() {
  const { user } = useAuth()
  
  // SIP calculator state
  const [sipMonthly, setSipMonthly] = useState(5000)
  const [sipRate, setSipRate] = useState(12)
  const [sipYears, setSipYears] = useState(10)

  const sipResult = useMemo(() => {
    const P = Number(sipMonthly)
    const r = Number(sipRate) / 100 / 12
    const n = Number(sipYears) * 12
    if (!P || !r || !n) return { invested: 0, returns: 0, total: 0 }
    const fv = P * (((Math.pow(1 + r, n)) - 1) / r) * (1 + r)
    const invested = P * n
    return {
      invested,
      returns: fv - invested,
      total: fv,
    }
  }, [sipMonthly, sipRate, sipYears])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: WEBSITE_STYLES }} />
      <div className="min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Market Ticker */}
        <div className="bg-slate-950 text-white overflow-hidden py-2.5 sticky top-0 z-50 border-b border-slate-800">
          <div className="flex animate-[ticker-scroll_30s_linear_infinite] whitespace-nowrap">
            {[1, 2].map((i) => (
              <div key={i} className="flex shrink-0">
                <div className="px-8 font-bold text-xs uppercase tracking-wider items-center flex gap-2">
                  SENSEX: <span className="text-emerald-400">72,450.20 (+0.45%)</span>
                </div>
                <div className="px-8 font-bold text-xs uppercase tracking-wider items-center flex gap-2">
                  NIFTY 50: <span className="text-emerald-400">22,010.50 (+0.38%)</span>
                </div>
                <div className="px-8 font-bold text-xs uppercase tracking-wider items-center flex gap-2">
                  GOLD: <span className="text-amber-400">INR 62,450 (+0.12%)</span>
                </div>
                <div className="px-8 font-bold text-xs uppercase tracking-wider items-center flex gap-2">
                  ALPHA GROWTH: <span className="text-blue-400">+2.1%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Navigation */}
        <header className="sticky top-11 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 h-20 flex items-center">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                <i className="fas fa-chart-line text-lg" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">
                One<span className="text-blue-600">Capital</span>
              </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-10">
              {['Home', 'Services', 'Mutual Funds', 'PMS & AIF', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                  className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Dashboard
                </Link>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Client Login
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="relative pt-24 pb-32 overflow-hidden bg-white">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl opacity-60" />
          <div className="container mx-auto px-6 relative">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="max-w-2xl">
                <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-6">
                  Expert Financial Wealth Management
                </span>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05] mb-8">
                  Optimize Your <br/>
                  <span className="bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent italic">
                    Wealth
                  </span> with Precision.
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
                  Navigate the complexities of equity markets with our premium advisory. 
                  We deliver data-driven strategies for long-term capital appreciation.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/login" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-black transition-all">
                    Start Your Journey
                  </Link>
                  <a href="#services" className="px-8 py-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-white transition-all">
                    Explore Services
                  </a>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-10 bg-linear-to-br from-blue-400 to-emerald-400 rounded-full opacity-10 blur-3xl" />
                <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Growth Portfolio</h3>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">INR 25.5L</p>
                    </div>
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl font-bold text-sm">
                      +12.5%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 mb-1">Monthly Yield</p>
                      <p className="text-xl font-black text-slate-900">+6.2%</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 mb-1">Net Returns</p>
                      <p className="text-xl font-black text-slate-900">+INR 2.1L</p>
                    </div>
                  </div>
                  {/* Decorative Chart Visualization */}
                  <div className="h-32 flex items-end gap-2">
                    {[40, 60, 45, 70, 50, 85, 65, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-100 rounded-t-lg transition-all hover:bg-blue-600 hover:h-full" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-white border-y border-slate-100">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { val: 'INR 500+ Cr', label: 'Assets Under Management' },
                { val: '5000+', label: 'Trusted Clients' },
                { val: '25+', label: 'Years of Excellence' },
                { val: '15+', label: 'Elite Strategists' }
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-4xl lg:text-5xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {stat.val}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-32 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mb-20">
              <h2 className="text-4xl font-black text-slate-900 mb-6 font-['Plus_Jakarta_Sans',sans-serif]">
                Elite Investment <span className="text-blue-600">Services</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                We provide a comprehensive suite of financial solutions designed for individuals and institutions 
                seeking superior risk-adjusted returns in the Indian equity markets.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: 'fa-pie-chart', title: 'Portfolio Management', desc: 'Custom tailored strategies focused on high-growth equity sectors with active risk mitigation.' },
                { icon: 'fa-funnel-dollar', title: 'Mutual Funds', desc: 'Curated selection of mutual funds across all categories with expert recommendations and tax-efficient structures.' },
                { icon: 'fa-landmark', title: 'Wealth Advisory', desc: 'Holistic financial mapping, retirement planning, and succession strategies for high net-worth families.' },
                { icon: 'fa-coins', title: 'Alternative Assets', desc: 'Exclusive access to Structured Products, AIFs, and private equity vehicles for diversification.' },
                { icon: 'fa-file-invoice-dollar', title: 'Tax Strategy', desc: 'Sophisticated tax planning to optimize your bottom line and ensure regulatory compliance.' },
                { icon: 'fa-headset', title: 'Private Support', desc: 'Dedicated relationship managers providing direct access to our core investment team.' }
              ].map((service, i) => (
                <div key={i} className="bg-white p-10 rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 mb-8 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                    <i className={`fas ${service.icon} text-xl`} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4">{service.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Solutions Section */}
        <section id="pms-aif" className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                  Institutional Grade <br/>
                  <span className="text-blue-600">Opportunities</span>
                </h2>
                <div className="space-y-8">
                  <div className="flex gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 transition-hover hover:bg-white hover:shadow-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="font-black text-blue-600">01</span>
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900 mb-2">Portfolio Management (PMS)</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Direct equity ownership with professional active management. (Min. INR 50L)</p>
                    </div>
                  </div>
                  <div className="flex gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 transition-hover hover:bg-white hover:shadow-lg">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="font-black text-emerald-600">02</span>
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-900 mb-2">Alternative Investment Funds (AIF)</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Sophisticated vehicles covering private equity and venture capital. (Min. INR 1Cr)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <i className="fas fa-crown text-blue-500 text-4xl opacity-20" />
                </div>
                <h3 className="text-2xl font-black mb-6">Why Premium?</h3>
                <ul className="space-y-6">
                  {[
                    'Hyper-personalized investment mandates',
                    'Direct interaction with Fund Managers',
                    'Advanced multi-asset class allocation',
                    'Low correlation to traditional benchmarks'
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <i className="fas fa-check text-[10px]" />
                      </div>
                      <span className="text-sm font-bold text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-12 w-full py-4 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all">
                  Request Premium Access
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SIP Calculator Section */}
        <section className="py-32 bg-slate-900 overflow-hidden relative">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-blue-600/10 blur-[120px]" />
          <div className="container mx-auto px-6 relative">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-white mb-4 font-['Plus_Jakarta_Sans',sans-serif]">Wealth Projection</h2>
                <p className="text-slate-400">Calculate the power of consistent compounding</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 lg:p-14">
                <div className="grid lg:grid-cols-3 gap-10 mb-16">
                  {[
                    { label: 'Monthly SIP (INR)', val: sipMonthly, set: setSipMonthly, min: 1000, max: 100000 },
                    { label: 'Expected Return (%)', val: sipRate, set: setSipRate, min: 5, max: 30 },
                    { label: 'Time Period (Years)', val: sipYears, set: setSipYears, min: 1, max: 30 }
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">{field.label}</label>
                      <input 
                        type="number" 
                        value={field.val}
                        onChange={(e) => field.set(Number(e.target.value))}
                        className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-black text-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  ))}
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Invested</p>
                    <p className="text-2xl font-black text-white">INR {Math.round(sipResult.invested).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-800/50 p-8 rounded-3xl border border-white/5 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Est. Returns</p>
                    <p className="text-2xl font-black text-emerald-400">INR {Math.round(sipResult.returns).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-blue-600 p-8 rounded-3xl shadow-xl shadow-blue-900/40 text-center">
                    <p className="text-xs font-bold text-blue-100 uppercase mb-2">Maturity Value</p>
                    <p className="text-2xl font-black text-white">INR {Math.round(sipResult.total).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-center text-3xl font-black text-slate-900 mb-20 font-['Plus_Jakarta_Sans',sans-serif]">Investor Sentiment</h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { name: 'Rajesh Patel', role: 'Global Entrepreneur', text: '"OneCapital transformed my approach to wealth. Their professional guidance and deep market execution helped me achieve my targets 2 years ahead of plan."' },
                { name: 'Priya Sharma', role: 'Tech Executive', text: '"The transparency and data-driven insights are remarkable. I finally feel in control of my capital with their intuitive dashboard and expert support."' },
                { name: 'Amit Verma', role: 'Business Owner', text: '"Unlike traditional brokers, OneCapital focuses purely on my goals. Their AIF access is game-changing for my family office diversification strategy."' }
              ].map((t, i) => (
                <div key={i} className="bg-slate-50 p-10 rounded-[2.5rem] relative group border border-transparent hover:border-slate-200 transition-all hover:bg-white hover:shadow-xl">
                  <div className="flex gap-1 text-amber-400 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => <i key={s} className="fas fa-star text-xs" />)}
                  </div>
                  <p className="text-slate-600 italic leading-relaxed mb-8">
                    {t.text}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full" />
                    <div>
                      <h4 className="font-black text-slate-900 text-sm tracking-tight">{t.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="bg-slate-950 pt-24 pb-12 text-slate-400">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-4 gap-16 mb-20">
              <div className="col-span-1 lg:col-span-1">
                <div className="text-2xl font-black tracking-tighter text-white mb-8">
                  One<span className="text-blue-600">Capital</span>
                </div>
                <p className="text-sm leading-relaxed mb-8">
                  Leading the digital transformation of Indian wealth management. 
                  Regulated, transparent, and client-first.
                </p>
                <div className="flex gap-4">
                  {['twitter', 'linkedin-in', 'instagram', 'facebook-f'].map((social) => (
                    <a key={social} href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                      <i className={`fab fa-${social}`} />
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-white font-black text-sm uppercase tracking-widest mb-8">Wealth Solutions</h5>
                <ul className="space-y-4 text-sm font-bold">
                  {['Equity Management', 'Mutual Fund Engine', 'Alternative Assets', 'Estate Planning'].map(link => (
                    <li key={link}><a href="#" className="hover:text-blue-500 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-black text-sm uppercase tracking-widest mb-8">Legal Core</h5>
                <ul className="space-y-4 text-sm font-bold">
                  {['Service Agreement', 'Data Privacy', 'Risk Disclosures', 'SEBI Compliance'].map(link => (
                    <li key={link}><a href="#" className="hover:text-blue-500 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-white font-black text-sm uppercase tracking-widest mb-8">Get In Touch</h5>
                <p className="text-sm mb-6 font-bold">support@onecapital.in</p>
                <Link to="/login" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700">
                  Client Support Portal
                </Link>
              </div>
            </div>
            
            <div className="pt-12 border-t border-slate-900 text-center text-[10px] font-black uppercase tracking-[0.2em]">
              &copy; 2026 OneCapital Advisory Services LLP. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}