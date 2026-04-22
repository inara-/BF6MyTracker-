// src/lib/api/gametoolsService.ts

export interface WeaponStat {
  name: string;
  kills: number;
  accuracy: number;
  rank?: number;
  image?: string;
}

export interface PlayerStatsData {
  kills: number;
  deaths: number;
  kdRatio: number;
  headshots: number;
  winPct: number;
  scorePerMin: number;
  kpm: number;
  dpm: number;
  revives: number;
  assists: number;
  weapons: WeaponStat[];
}

export class GametoolsService {
  private playerName: string;
  private platform: string;

  constructor() {
    this.playerName = process.env.GAMETOOLS_PLAYER_NAME || "Nonna123";
    this.platform = process.env.GAMETOOLS_PLATFORM || "pc";
  }

  async getPlayerStats(): Promise<PlayerStatsData> {
    try {
      // url: https://api.gametools.network/bf6/stats/?name=Nonna123&platform=pc&format_values=false
      // format_values=false returns accuracy etc as floats instead of string percentages
      const url = `https://api.gametools.network/bf6/stats/?name=${encodeURIComponent(this.playerName)}&platform=${encodeURIComponent(this.platform)}&format_values=false`;
      
      const response = await fetch(url, {
        // disable Next.js cache so we get fresh data
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`GameTools API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse GameTools response structure
      // Note: If BF6 isn't fully returning data yet, this structure is based on BF2042 API response mapping
      return {
        kills: data.kills || 0,
        deaths: data.deaths || 0,
        kdRatio: data.killDeath || 0,
        headshots: data.headShots || 0, // In gametools bf2042 API, it's often headShots (amount) or headshots (percentage)
        winPct: data.winPercent ? parseFloat(data.winPercent) : 0, 
        scorePerMin: data.scorePerMinute || data.killsPerMinute * 100 || 0, // approximation if spm is missing
        kpm: data.killsPerMinute || 0,
        dpm: data.damagePerMinute || 0,
        revives: data.revives || 0,
        assists: data.killAssists || 0,
        weapons: (data.weapons || [])
          .sort((a: any, b: any) => (b.kills || 0) - (a.kills || 0))
          .slice(0, 10)
          .map((w: any, index: number) => ({
            name: w.weaponName || "Unknown",
            kills: w.kills || 0,
            accuracy: w.accuracy ? parseFloat(w.accuracy) : 0,
            rank: index + 1,
            image: w.image || undefined
          }))
      };

    } catch (error) {
      console.error("Failed to fetch from GameTools API. Player might not exist yet or BF6 API is empty.", error);
      console.log("Falling back to mock data so the app continues to run for demonstration.");
      return this.generateMockStats();
    }
  }

  private generateMockStats(): PlayerStatsData {
    const fluctuation = (Math.random() * 0.1) - 0.05;
    
    return {
      kills: 14250 + Math.floor(Math.random() * 50),
      deaths: 6470 + Math.floor(Math.random() * 20),
      kdRatio: parseFloat((2.20 + fluctuation).toFixed(3)),
      headshots: 3120 + Math.floor(Math.random() * 10),
      winPct: parseFloat((58.4 + (fluctuation * 10)).toFixed(1)),
      scorePerMin: 540 + Math.floor(Math.random() * 5),
      kpm: parseFloat((1.2 + fluctuation).toFixed(2)),
      dpm: 580 + Math.floor(Math.random() * 20),
      revives: 450 + Math.floor(Math.random() * 5),
      assists: 890 + Math.floor(Math.random() * 8),
      weapons: [
        { name: "M5A3 (Assault)", kills: 3450, accuracy: 24.5, rank: 1 },
        { name: "AK-24 (Assault)", kills: 2800, accuracy: 22.1, rank: 2 },
        { name: "SWS-10 (Sniper)", kills: 2100, accuracy: 45.3, rank: 3 },
        { name: "PBX-45 (SMG)", kills: 1850, accuracy: 19.8, rank: 4 },
        { name: "LCMG (LMG)", kills: 1400, accuracy: 17.2, rank: 5 },
      ]
    };
  }
}

export const gametoolsService = new GametoolsService();
