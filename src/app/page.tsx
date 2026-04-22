// src/app/page.tsx
import { fetchAndCompareStats } from "@/lib/services/statsService";
import TrendIndicator from "@/components/TrendIndicator";
import styles from "./page.module.css";

export const revalidate = 0; // Ensure data is fetched fresh on every request (page load)

export default async function Home() {
  const { current, changes } = await fetchAndCompareStats();
  const playerName = process.env.GAMETOOLS_PLAYER_NAME || "Player";

  return (
    <main className="container animate-slide-up">
      <div className={styles.hero}>
        <h1 className={`${styles.title} text-gradient`}>{playerName}'s BF6 Stats</h1>
        <p className={styles.subtitle}>Motivate your daily grind. View your progression.</p>
        
        <div className={styles.heroStats}>
          <div className={`glass-panel ${styles.heroStatCard}`}>
            <div className={styles.statLabel}>Total Kills</div>
            <div className={styles.statValue}>{current.kills}</div>
            <TrendIndicator value={changes.killsChange || 0} />
          </div>
          <div className={`glass-panel ${styles.heroStatCard}`}>
            <div className={styles.statLabel}>K/D Ratio</div>
            <div className={styles.statValue}>{current.kdRatio}</div>
            <TrendIndicator value={changes.kdRatioChange || 0} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '3rem', padding: '1rem', overflowX: 'auto' }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Headshots</td>
              <td className={styles.tableValue}>{current.headshots}</td>
              <td><TrendIndicator value={changes.headshotsChange || 0} /></td>
            </tr>
            <tr>
              <td>Win %</td>
              <td className={styles.tableValue}>{current.winPct}%</td>
              <td><TrendIndicator value={changes.winPctChange || 0} isPercentage /></td>
            </tr>
            <tr>
              <td>Score / Min</td>
              <td className={styles.tableValue}>{current.scorePerMin}</td>
              <td><TrendIndicator value={changes.spmChange || 0} /></td>
            </tr>
            <tr>
              <td>Kills / Min (KPM)</td>
              <td className={styles.tableValue}>{current.kpm}</td>
              <td><TrendIndicator value={changes.kpmChange || 0} /></td>
            </tr>
            <tr>
              <td>Damage / Min</td>
              <td className={styles.tableValue}>{current.dpm}</td>
              <td><TrendIndicator value={changes.dpmChange || 0} /></td>
            </tr>
            <tr>
              <td>Revives</td>
              <td className={styles.tableValue}>{current.revives}</td>
              <td><TrendIndicator value={changes.revivesChange || 0} /></td>
            </tr>
            <tr>
              <td>Kill Assists</td>
              <td className={styles.tableValue}>{current.assists}</td>
              <td><TrendIndicator value={changes.assistsChange || 0} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className={styles.sectionTitle}>Weapon Rankings</h2>
      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Weapon</th>
              <th>Kills</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {current.weapons.map((weapon) => {
              const rankChange = changes.weaponRankChanges[weapon.name] || 0;
              return (
                <tr key={weapon.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={styles.weaponRank}>#{weapon.rank}</span>
                      {rankChange !== 0 && (
                        <span style={{ fontSize: '0.8rem' }}>
                          <TrendIndicator value={rankChange} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {weapon.image && (
                        <img src={weapon.image} alt={weapon.name} className={styles.weaponImage} />
                      )}
                      <span className={styles.weaponName}>{weapon.name}</span>
                    </div>
                  </td>
                  <td className={styles.tableValue}>{weapon.kills}</td>
                  <td className={styles.tableValue}>{weapon.accuracy}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
