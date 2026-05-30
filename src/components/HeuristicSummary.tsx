import { HEURISTIC_EVALUATION } from '../data/heuristicEvaluation'
import {
  calculateAverageBefore,
  calculateAverageAfter,
  calculateAverageImprovement,
} from '../lib/evaluation/heuristicMetrics'

const avg = (n: number) => n.toFixed(1)

// Dev/debug component — not mounted in App by default.
// Add <HeuristicSummary /> to App.tsx to display in the UI.
export function HeuristicSummary() {
  const before = calculateAverageBefore(HEURISTIC_EVALUATION)
  const after  = calculateAverageAfter(HEURISTIC_EVALUATION)
  const delta  = calculateAverageImprovement(HEURISTIC_EVALUATION)

  return (
    <section className="heuristic-summary">
      <h2 className="heuristic-summary__title">Heuristic Evaluation</h2>

      <div className="heuristic-summary__scores">
        <div className="heuristic-summary__score">
          <span className="heuristic-summary__score-label">Before</span>
          <span className="heuristic-summary__score-value heuristic-summary__score-value--before">
            {avg(before)}/10
          </span>
        </div>
        <div className="heuristic-summary__arrow">→</div>
        <div className="heuristic-summary__score">
          <span className="heuristic-summary__score-label">After</span>
          <span className="heuristic-summary__score-value heuristic-summary__score-value--after">
            {avg(after)}/10
          </span>
        </div>
        <div className="heuristic-summary__score heuristic-summary__score--delta">
          <span className="heuristic-summary__score-label">Improvement</span>
          <span className="heuristic-summary__score-value heuristic-summary__score-value--delta">
            +{avg(delta)}
          </span>
        </div>
      </div>

      <table className="heuristic-summary__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Heuristic</th>
            <th>Before</th>
            <th>After</th>
            <th>Δ</th>
          </tr>
        </thead>
        <tbody>
          {HEURISTIC_EVALUATION.map((h) => (
            <tr key={h.id} className={`heuristic-row heuristic-row--${h.statusAfter}`}>
              <td>{h.id}</td>
              <td>{h.name}</td>
              <td>{h.scoreBefore}</td>
              <td>{h.scoreAfter}</td>
              <td className="heuristic-row__delta">+{h.improvement}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
