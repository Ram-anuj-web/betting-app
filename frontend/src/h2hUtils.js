import h2hData from './ipl_h2h.json'

/**
 * Get H2H last 3 results between two IPL teams.
 * Always returns results from t1's perspective regardless of key order.
 *
 * @param {string} t1 - Team abbreviation e.g. "RCB"
 * @param {string} t2 - Team abbreviation e.g. "MI"
 * @returns {{ results: number[], summary: string, t1: string, t2: string } | null}
 *
 * results array: 1 = t1 won, 0 = t1 lost. Index 0 = oldest, 2 = most recent.
 */
export function getH2H(t1, t2) {
  const key = `${t1}-${t2}`
  const reverseKey = `${t2}-${t1}`

  const entry = h2hData.matchups[key] || h2hData.matchups[reverseKey]
  if (!entry) return null

  const isReversed = !!h2hData.matchups[reverseKey] && !h2hData.matchups[key]
  const results = isReversed
    ? entry.t1_results.map(r => (r === 1 ? 0 : 1))
    : entry.t1_results

  return {
    results,          // [1, 0, 1] from t1's view
    summary: entry.summary,
    t1: entry.t1,
    t2: entry.t2,
    last_match: entry.last_match,
  }
}

/**
 * After a match completes, call this to get the updated entry
 * to paste back into ipl_h2h.json manually (or write to your DB).
 *
 * @param {string} t1
 * @param {string} t2
 * @param {string} winner - team abbreviation who won
 * @param {string} date - "YYYY-MM-DD"
 */
export function buildUpdatedH2H(t1, t2, winner, date) {
  const current = getH2H(t1, t2)
  if (!current) return null

  const newResult = winner === t1 ? 1 : 0
  const updatedResults = [...current.results.slice(-2), newResult]

  const t1Wins = updatedResults.filter(r => r === 1).length
  const t2Wins = updatedResults.filter(r => r === 0).length
  const summary =
    t1Wins > t2Wins
      ? `${t1} lead ${t1Wins}-${t2Wins}`
      : t2Wins > t1Wins
      ? `${t2} lead ${t2Wins}-${t1Wins}`
      : `Tied ${t1Wins}-${t2Wins} recent`

  return {
    t1,
    t2,
    t1_results: updatedResults,
    summary,
    last_match: date,
  }
}