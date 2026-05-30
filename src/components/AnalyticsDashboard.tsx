import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import type { SessionSummary } from '../types/session'
import type { SessionRecord } from '../types/sessionHistory'
import type { UserProfile } from '../types/userProfile'
import { GESTURE_DICTIONARY } from '../data/gestureDictionary'
import { generateRecommendations } from '../lib/recommendations/recommendationEngine'
import { formatDuration } from '../lib/session/computeSessionSummary'
import {
  averagePostureStats,
  topConditionAcrossRecords,
  getSessionsByDay,
} from '../lib/history/sessionHistoryStorage'
import { HabitTracker } from './HabitTracker'
import { SessionHistoryTable } from './SessionHistoryTable'

interface Props {
  summary: SessionSummary | null
  conditionFrequency: Record<string, number>
  profile: UserProfile | null
  history: SessionRecord[]
  onDeleteRecord?: (id: string) => void
}

const CONDITION_NAMES: Record<string, string> = Object.fromEntries(
  GESTURE_DICTIONARY.map(g => [g.id, g.name])
)

const STATUS_COLORS = { good: '#22c55e', warning: '#f59e0b', bad: '#ef4444' }
const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#38bdf8' }

type AnalyticsTab = 'current' | 'history' | 'habits'

import { useState } from 'react'

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {sub && <span className="stat-card__sub">{sub}</span>}
    </div>
  )
}

export function AnalyticsDashboard({ summary, conditionFrequency, profile, history, onDeleteRecord }: Props) {
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('current')
  const recommendations = generateRecommendations(profile, conditionFrequency, summary)

  const weekRecords = history.filter(r => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return new Date(r.startedAt) >= cutoff
  })
  const weekStats = averagePostureStats(weekRecords)
  const topWeekConditionId = topConditionAcrossRecords(weekRecords)
  const topWeekConditionLabel = topWeekConditionId
    ? (CONDITION_NAMES[topWeekConditionId] ?? topWeekConditionId)
    : null

  const dayHistory = getSessionsByDay()

  const prevSession = history.length > 1 ? history[1] : null
  const goodImprovement = summary && prevSession
    ? summary.goodPct - prevSession.goodPercentage
    : null

  // ── SUB-NAV ──────────────────────────────────────────────────
  const subTabs: { id: AnalyticsTab; label: string }[] = [
    { id: 'current', label: 'Current session' },
    { id: 'history', label: 'History' },
    { id: 'habits',  label: 'Habit tracker' },
  ]

  return (
    <div className="analytics-dashboard">
      <nav className="analytics-tabs" aria-label="Analytics sub-navigation">
        {subTabs.map(t => (
          <button
            key={t.id}
            className={`analytics-tab-btn${analyticsTab === t.id ? ' analytics-tab-btn--active' : ''}`}
            onClick={() => setAnalyticsTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── CURRENT SESSION ── */}
      {analyticsTab === 'current' && (
        <>
          {!summary ? (
            <div className="analytics-dashboard--empty">
              <p className="analytics-dashboard__empty-msg">No session data yet.</p>
              <p className="analytics-dashboard__empty-hint">
                Start a session in the <strong>Live Check</strong> tab, then press Stop to see your analytics.
              </p>
            </div>
          ) : (
            <>
              <div className="stat-cards">
                <StatCard label="Duration"        value={formatDuration(summary.durationSeconds)} />
                <StatCard label="Frames analysed" value={summary.totalFrames.toLocaleString()} />
                <StatCard label="Good posture"    value={`${summary.goodPct.toFixed(1)}%`}
                  sub={goodImprovement !== null
                    ? `${goodImprovement >= 0 ? '+' : ''}${goodImprovement.toFixed(1)}% vs previous`
                    : undefined} />
                <StatCard label="Most frequent"   value={(() => {
                  const sorted = Object.entries(conditionFrequency).sort(([,a],[,b])=>b-a)
                  return sorted.length ? (CONDITION_NAMES[sorted[0][0]] ?? sorted[0][0]) : '—'
                })()} />
              </div>

              <div className="analytics-dashboard__charts">
                <div className="chart-section">
                  <h3 className="chart-section__title">Status distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Good',    value: Math.round(summary.goodPct),    fill: STATUS_COLORS.good },
                          { name: 'Warning', value: Math.round(summary.warningPct), fill: STATUS_COLORS.warning },
                          { name: 'Bad',     value: Math.round(summary.badPct),     fill: STATUS_COLORS.bad },
                        ].filter(d => d.value > 0)}
                        dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}
                      >
                        {[STATUS_COLORS.good, STATUS_COLORS.warning, STATUS_COLORS.bad].map((fill, i) => (
                          <Cell key={i} fill={fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${Number(v)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    {[
                      { name: 'Good', fill: STATUS_COLORS.good, pct: summary.goodPct },
                      { name: 'Warning', fill: STATUS_COLORS.warning, pct: summary.warningPct },
                      { name: 'Bad', fill: STATUS_COLORS.bad, pct: summary.badPct },
                    ].filter(d => d.pct > 0).map(d => (
                      <span key={d.name} className="chart-legend__item">
                        <span className="chart-legend__dot" style={{ background: d.fill }} />
                        {d.name} {Math.round(d.pct)}%
                      </span>
                    ))}
                  </div>
                </div>

                {Object.values(conditionFrequency).some(v => v > 0) && (
                  <div className="chart-section">
                    <h3 className="chart-section__title">Condition frequency</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={Object.entries(conditionFrequency)
                          .filter(([,v]) => v > 0)
                          .sort(([,a],[,b]) => b-a)
                          .map(([id, count]) => ({ name: CONDITION_NAMES[id] ?? id, count }))}
                        margin={{ top: 5, right: 10, bottom: 55, left: 0 }}
                      >
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-25} textAnchor="end" />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                        <Bar dataKey="count" fill="#38bdf8" radius={[4,4,0,0]} />
                        <Tooltip />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}

          {recommendations.length > 0 && (
            <div className="recommendation-cards">
              <h3 className="analytics-dashboard__section-title">Recommendations</h3>
              {recommendations.map(r => (
                <div key={r.id} className={`recommendation-card recommendation-card--${r.priority}`}>
                  <div className="recommendation-card__header">
                    <span className="recommendation-card__priority" style={{ color: PRIORITY_COLORS[r.priority] }}>
                      {r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}
                    </span>
                    <span className="recommendation-card__title">{r.title}</span>
                  </div>
                  <p className="recommendation-card__body">{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── HISTORY ── */}
      {analyticsTab === 'history' && (
        <div className="analytics-history">
          {weekStats && (
            <div className="history-weekly-summary">
              <h3 className="history-weekly-summary__title">This week ({weekRecords.length} sessions)</h3>
              <div className="stat-cards">
                <StatCard label="Avg good posture"    value={`${weekStats.goodPct.toFixed(1)}%`} />
                <StatCard label="Avg warning"         value={`${weekStats.warningPct.toFixed(1)}%`} />
                <StatCard label="Avg bad posture"     value={`${weekStats.badPct.toFixed(1)}%`} />
                {topWeekConditionLabel && (
                  <StatCard label="Top issue this week" value={topWeekConditionLabel} />
                )}
              </div>
              {topWeekConditionLabel && (
                <p className="history-insight">
                  Your most frequent issue this week was <strong>{topWeekConditionLabel}</strong>.
                </p>
              )}
              {weekRecords.length >= 2 && weekStats.goodPct >= 60 && (
                <p className="history-insight history-insight--positive">
                  You spent most sessions in a stable posture this week. Keep it up.
                </p>
              )}
            </div>
          )}

          <h3 className="analytics-dashboard__section-title">Session history</h3>
          <SessionHistoryTable records={history} onDelete={onDeleteRecord} />
        </div>
      )}

      {/* ── HABIT TRACKER ── */}
      {analyticsTab === 'habits' && (
        <div className="analytics-habits">
          <HabitTracker history={dayHistory} days={28} />

          {history.length > 0 && (
            <div className="habits-summary">
              <p className="habits-summary__text">
                You have completed <strong>{history.length}</strong> session{history.length !== 1 ? 's' : ''} in total.
              </p>
              {weekRecords.length > 0 && (
                <p className="habits-summary__text">
                  <strong>{weekRecords.length}</strong> session{weekRecords.length !== 1 ? 's' : ''} this week.
                  {weekStats && ` Average good posture: ${weekStats.goodPct.toFixed(1)}%.`}
                </p>
              )}
              {goodImprovement !== null && goodImprovement > 0 && (
                <p className="habits-summary__text habits-summary__text--positive">
                  Your good posture time improved by {goodImprovement.toFixed(1)}% compared with your previous session.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
