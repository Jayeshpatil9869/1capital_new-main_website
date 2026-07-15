import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import Chart from 'chart.js/auto'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import './dashboard/dashboard.css'

type DashboardFullResponse = {
  title: string
  user: { username: string; full_name: string }
  filters: {
    selected_rm: string
    selected_ma: string
    selected_manager: string
    selected_date_from: string
    selected_date_to: string
  }
  options: {
    all_rms: string[]
    all_mas: string[]
    all_managers: string[]
  }
  totals: {
    combined_total_brokerage?: number
    [k: string]: any
  }
  chart_data: any
  records: Array<{
    client_name: string
    rm_name: string
    ma_name: string | null
    total_brokerage: number
    total_equity_cash_turnover: number
    total_equity_fno_turnover: number
    total_turnover: number
  }>
}

export function DashboardPage() {
  const { accessToken, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardFullResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const [draftFilters, setDraftFilters] = useState({
    manager: '',
    rm: '',
    ma: '',
    date_from: '',
    date_to: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    manager: '',
    rm: '',
    ma: '',
    date_from: '',
    date_to: '',
  })

  const rmCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const topClientsCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const maCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const segmentCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const chartsRef = useRef<{ rm?: Chart; top?: Chart; ma?: Chart; seg?: Chart }>({})

  const queryString = useMemo(() => {
    const p = new URLSearchParams()
    if (appliedFilters.manager) p.set('manager', appliedFilters.manager)
    if (appliedFilters.rm) p.set('rm', appliedFilters.rm)
    if (appliedFilters.ma) p.set('ma', appliedFilters.ma)
    if (appliedFilters.date_from) p.set('date_from', appliedFilters.date_from)
    if (appliedFilters.date_to) p.set('date_to', appliedFilters.date_to)
    return p.toString()
  }, [
    appliedFilters.manager,
    appliedFilters.rm,
    appliedFilters.ma,
    appliedFilters.date_from,
    appliedFilters.date_to,
  ])

  useEffect(() => {
    if (!accessToken) return
    setLoading(true)
    axios
      .get<DashboardFullResponse>(`/api/dashboard/full/?${queryString}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        setData(res.data)
        // Sync both draft+applied from server (role-based options may constrain filters).
        const next = {
          manager: res.data.filters.selected_manager || '',
          rm: res.data.filters.selected_rm || '',
          ma: res.data.filters.selected_ma || '',
          date_from: res.data.filters.selected_date_from || '',
          date_to: res.data.filters.selected_date_to || '',
        }
        setDraftFilters((prev) => {
          const same =
            prev.manager === next.manager &&
            prev.rm === next.rm &&
            prev.ma === next.ma &&
            prev.date_from === next.date_from &&
            prev.date_to === next.date_to
          return same ? prev : next
        })
        setAppliedFilters((prev) => {
          const same =
            prev.manager === next.manager &&
            prev.rm === next.rm &&
            prev.ma === next.ma &&
            prev.date_from === next.date_from &&
            prev.date_to === next.date_to
          return same ? prev : next
        })
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          logout()
          navigate('/login', { replace: true })
        }
      })
      .finally(() => setLoading(false))
  }, [accessToken, queryString])

  // Initialize/refresh charts when data changes
  useEffect(() => {
    if (!data) return

    // cleanup previous charts
    Object.values(chartsRef.current).forEach((c) => c?.destroy())
    chartsRef.current = {}

    // Chart.js defaults to match template
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif"

    const cd = data.chart_data || {}

    if (cd.rm_performance?.labels?.length && rmCanvasRef.current) {
      chartsRef.current.rm = new Chart(rmCanvasRef.current, {
        type: 'bar',
        data: {
          labels: cd.rm_performance.labels,
          datasets: [
            {
              label: 'Equity Brokerage',
              data: cd.rm_performance.brokerage,
              backgroundColor: '#2563eb',
              borderRadius: 8,
              borderSkipped: false,
            },
            {
              label: 'MF Brokerage',
              data: cd.rm_performance.mf_brokerage,
              backgroundColor: '#4ade80',
              borderRadius: 8,
              borderSkipped: false,
            },
            {
              label: 'Equity Cash',
              data: cd.rm_performance.equity_cash,
              backgroundColor: '#60a5fa',
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'bottom' as const } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (v: any) {
                  return 'INR ' + (Number(v) / 100000).toFixed(1) + 'L'
                },
              },
            },
            x: { grid: { display: false } },
          },
        },
      })
    }

    if (cd.top_clients?.labels?.length && topClientsCanvasRef.current) {
      chartsRef.current.top = new Chart(topClientsCanvasRef.current, {
        type: 'bar',
        data: {
          labels: cd.top_clients.labels,
          datasets: [
            {
              label: 'Brokerage',
              data: cd.top_clients.brokerage,
              backgroundColor: '#2563eb',
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: function (v: any) {
                  return 'INR ' + (Number(v) / 100000).toFixed(1) + 'L'
                },
              },
            },
            y: { grid: { display: false } },
          },
        },
      })
    }

    if (cd.ma_performance?.labels?.length && maCanvasRef.current) {
      chartsRef.current.ma = new Chart(maCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: cd.ma_performance.labels,
          datasets: [
            {
              data: cd.ma_performance.brokerage,
              backgroundColor: ['#2563eb', '#60a5fa', '#93c5fd', '#0ea5e9', '#06b6d4'],
              borderColor: '#ffffff',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' as const } },
        },
      })
    }

    if (cd.segment_analysis?.labels?.length && segmentCanvasRef.current) {
      chartsRef.current.seg = new Chart(segmentCanvasRef.current, {
        type: 'bar',
        data: {
          labels: cd.segment_analysis.labels,
          datasets: [
            {
              label: 'Equity Cash',
              data: cd.segment_analysis.cash,
              backgroundColor: '#2563eb',
              borderRadius: 8,
              borderSkipped: false,
            },
            {
              label: 'Equity F&O',
              data: cd.segment_analysis.fno,
              backgroundColor: '#60a5fa',
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'bottom' as const } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (v: any) {
                  return 'INR' + (Number(v) / 100000).toFixed(1) + 'L'
                },
              },
            },
            x: { grid: { display: false } },
          },
        },
      })
    }
  }, [data])

  function clearFilters() {
    setDraftFilters({ manager: '', rm: '', ma: '', date_from: '', date_to: '' })
    setAppliedFilters({ manager: '', rm: '', ma: '', date_from: '', date_to: '' })
  }

  const hasAnyFilter = Boolean(
    appliedFilters.manager || appliedFilters.rm || appliedFilters.ma || appliedFilters.date_from || appliedFilters.date_to,
  )

  const showLoader = loading && !data;

  // Exact structure replication from `dashboard.html`
  return (
    <div className="dashboard-page">
      {showLoader && (
        <div className="dashboard-loader-container">
          <div className="dashboard-spinner"></div>
          <div className="dashboard-loader-text">Loading Analytics...</div>
        </div>
      )}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>
            <i className="fas fa-chart-line" style={{ color: 'var(--primary)' }} /> {data?.title || 'Sales Dashboard'}
          </h1>
          <p>Welcome to your sales analytics dashboard</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <strong>{data?.user.username || ''}</strong>
            <p>{data?.user.full_name || 'User'}</p>
          </div>
          <button
            className="home-btn"
            onClick={() => navigate('/website')}
            style={{ marginRight: '0.5rem' }}
          >
            <i className="fas fa-home" /> Home
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div className="filters-section">
          <div className="filters-title">
            <i className="fas fa-sliders-h" /> Filter Data
          </div>

          <div className="filters-row">
            <div className="hierarchy-filters">
              {!!data?.options.all_managers?.length && (
                <div className="filter-group">
                  <label htmlFor="manager">
                    <i className="fas fa-sitemap" /> Manager
                  </label>
                  <select
                    id="manager"
                    name="manager"
                    value={draftFilters.manager}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftFilters(s => ({ ...s, manager: val, rm: '', ma: '' }));
                    }}
                  >
                    <option value="">-- All Managers --</option>
                    {data.options.all_managers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="filter-group">
                <label htmlFor="rm">
                  <i className="fas fa-user-tie" /> Relationship Manager
                </label>
                <select
                  id="rm"
                  name="rm"
                  value={draftFilters.rm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraftFilters(s => ({ ...s, rm: val, ma: '' }));
                  }}
                >
                  <option value="">-- All RMs --</option>
                  {data?.options.all_rms?.map((rm) => (
                    <option key={rm} value={rm}>
                      {rm}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="ma">
                  <i className="fas fa-user-tag" /> Mutual Fund Advisor
                </label>
                <select 
                  id="ma" 
                  name="ma" 
                  value={draftFilters.ma} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraftFilters(s => ({ ...s, ma: val }));
                  }}
                >
                  <option value="">-- All MAs --</option>
                  {data?.options.all_mas?.map((ma) => (
                    <option key={ma} value={ma}>
                      {ma}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="date-filters">
              <div className="filter-group">
                <label htmlFor="quick_range">
                  <i className="fas fa-bolt" /> Quick Range
                </label>
                <select
                  id="quick_range"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    
                    const now = new Date();
                    let from = new Date();
                    let to = new Date();
                    
                    if (val === '7d') {
                      from.setDate(now.getDate() - 7);
                    } else if (val === '30d') {
                      from.setDate(now.getDate() - 30);
                    } else if (val === 'this_month') {
                      from = new Date(now.getFullYear(), now.getMonth(), 1);
                    } else if (val === 'last_month') {
                      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                      to = new Date(now.getFullYear(), now.getMonth(), 0);
                    } else if (val === 'last_quarter') {
                      const q = Math.floor(now.getMonth() / 3) - 1;
                      from = new Date(now.getFullYear(), q * 3, 1);
                      to = new Date(now.getFullYear(), (q + 1) * 3, 0);
                    } else if (val === 'this_year') {
                      from = new Date(now.getFullYear(), 0, 1);
                    }
                    
                    const fromStr = from.toISOString().split('T')[0];
                    const toStr = to.toISOString().split('T')[0];
                    
                    setDraftFilters(s => ({ ...s, date_from: fromStr, date_to: toStr }));
                  }}
                >
                  <option value="">-- Quick Select --</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="last_quarter">Last Quarter</option>
                  <option value="this_year">This Year</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="date_from">
                  <i className="far fa-calendar-alt" /> From Date
                </label>
                <input
                  type="date"
                  id="date_from"
                  name="date_from"
                  value={draftFilters.date_from}
                  onChange={(e) => setDraftFilters((s) => ({ ...s, date_from: e.target.value }))}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="date_to">
                  <i className="far fa-calendar-alt" /> To Date
                </label>
                <input
                  type="date"
                  id="date_to"
                  name="date_to"
                  value={draftFilters.date_to}
                  onChange={(e) => setDraftFilters((s) => ({ ...s, date_to: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button
              className="clear-button"
              type="button"
              onClick={() => setAppliedFilters(draftFilters)}
              disabled={loading}
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--white)' }}
            >
              <i className="fas fa-filter" /> Apply Filters
            </button>

            {hasAnyFilter && (
              <button className="clear-button" onClick={clearFilters} type="button">
                <i className="fas fa-redo" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        <section className="charts-section">
          <h2 className="section-title">
            <i className="fas fa-tachometer-alt" /> Key Metrics
          </h2>
          <div className="metrics">
            <div className="metric-card">
              <div className="metric-label">
                <i className="fas fa-handshake" /> Total Brokerage
              </div>
              <div className="metric-value">{Number(data?.totals?.combined_total_brokerage || 0).toFixed(0)}</div>
              <div className="metric-change">
                <i className="fas fa-arrow-up" /> All RMs
              </div>
            </div>
          </div>
        </section>

        <section className="charts-section">
          <h2 className="section-title">
            <i className="fas fa-chart-bar" /> Performance Analysis
          </h2>
          <div className="charts-grid">
            <div className="chart-container">
              <div className="chart-title">
                <i className="fas fa-user-tie" /> RM Performance - Brokerage
              </div>
              <canvas id="rmChart" ref={rmCanvasRef} />
            </div>

            <div className="chart-container">
              <div className="chart-title">
                <i className="fas fa-users" /> Top 10 Clients by Brokerage
              </div>
              <canvas id="topClientsChart" ref={topClientsCanvasRef} />
            </div>
          </div>
        </section>

        {(!!appliedFilters.rm || !!appliedFilters.manager) && (
          <section className="charts-section">
            <h2 className="section-title">
              <i className="fas fa-filter" /> Analysis for {appliedFilters.rm || appliedFilters.manager}
            </h2>
            <div className="charts-grid">
              <div className="chart-container">
                <div className="chart-title">
                  <i className="fas fa-user-tag" /> MA Performance under {appliedFilters.rm || appliedFilters.manager}
                </div>
                <canvas id="maChart" ref={maCanvasRef} />
              </div>

              <div className="chart-container">
                <div className="chart-title">
                  <i className="fas fa-pie-chart" /> Segment Analysis
                </div>
                <canvas id="segmentChart" ref={segmentCanvasRef} />
              </div>
            </div>
          </section>
        )}

        <section className="charts-section" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">
            <i className="fas fa-table" /> Sales Records
          </h2>
          <div className="table-section">
            <div className="table-header">
              <h3>Recent Transactions</h3>
            </div>

            {data?.records?.length ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>RM Name</th>
                      <th>MA Name</th>
                      <th>Total Brokerage(₹)</th>
                      <th>Equity Cash(₹)</th>
                      <th>Equity F&O(₹)</th>
                      <th>Total Turnover(₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((r, idx) => (
                      <tr key={`${r.client_name}-${idx}`}>
                        <td>
                          <strong>{r.client_name}</strong>
                        </td>
                        <td>{r.rm_name}</td>
                        <td>{r.ma_name || '--'}</td>
                        <td>
                          <span style={{ color: 'var(--success)' }}>₹ {Number(r.total_brokerage || 0).toFixed(2)}</span>
                        </td>
                        <td>₹ {Number(r.total_equity_cash_turnover || 0).toFixed(0)}</td>
                        <td>₹ {Number(r.total_equity_fno_turnover || 0).toFixed(0)}</td>
                        <td>
                          <strong>₹ {Number(r.total_turnover || 0).toFixed(0)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <i className="fas fa-inbox" />
                <p>No sales records found for the selected filters.</p>
              </div>
            )}
          </div>
        </section>

        {loading && <div style={{ color: 'var(--text-light)', paddingBottom: '2rem' }}>Loading…</div>}
      </div>
    </div>
  )
}

