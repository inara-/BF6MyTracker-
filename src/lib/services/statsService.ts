// src/lib/services/statsService.ts

import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { gametoolsService, PlayerStatsData } from '../api/gametoolsService';

let prisma: PrismaClient;

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  // ローカル開発用（dev.db）のフォールバック
  prisma = new PrismaClient();
}

export interface StatsComparison {
  current: PlayerStatsData;
  previous: PlayerStatsData | null;
  changes: {
    kdRatioChange?: number;
    killsChange?: number;
    headshotsChange?: number;
    winPctChange?: number;
    spmChange?: number;
    kpmChange?: number;
    dpmChange?: number;
    revivesChange?: number;
    assistsChange?: number;
    weaponRankChanges: Record<string, number>;
  };
}

export async function fetchAndCompareStats(): Promise<StatsComparison> {
  const playerId = process.env.GAMETOOLS_PLAYER_NAME || "Nonna123";

  // 1. Get latest stats from API
  const latestStats = await gametoolsService.getPlayerStats();

  // 2. Ensure Player exists
  let player = await prisma.player.findUnique({ where: { trnId: playerId } });
  if (!player) {
    player = await prisma.player.create({ data: { trnId: playerId } });
  }

  // 3. Get the most recent previous stats
  const previousRecord = await prisma.playerStats.findFirst({
    where: { playerId: player.id },
    orderBy: { createdAt: 'desc' },
    include: { weaponStats: true }
  });

  // 4. Save new stats to DB
  const newRecord = await prisma.playerStats.create({
    data: {
      playerId: player.id,
      kills: latestStats.kills,
      deaths: latestStats.deaths,
      kdRatio: latestStats.kdRatio,
      headshots: latestStats.headshots,
      winPct: latestStats.winPct,
      scorePerMin: latestStats.scorePerMin,
      kpm: latestStats.kpm,
      dpm: latestStats.dpm,
      revives: latestStats.revives,
      assists: latestStats.assists,
      weaponStats: {
        create: latestStats.weapons.map(w => ({
          name: w.name,
          kills: w.kills,
          accuracy: w.accuracy,
          rank: w.rank
        }))
      }
    }
  });

  // 5. Calculate Changes
  const changes: StatsComparison["changes"] = {
    weaponRankChanges: {}
  };

  if (previousRecord) {
    changes.kdRatioChange = Number((latestStats.kdRatio - previousRecord.kdRatio).toFixed(3));
    changes.killsChange = latestStats.kills - previousRecord.kills;
    changes.headshotsChange = latestStats.headshots - previousRecord.headshots;
    changes.winPctChange = Number((latestStats.winPct - previousRecord.winPct).toFixed(1));
    changes.spmChange = Number((latestStats.scorePerMin - previousRecord.scorePerMin).toFixed(2));
    changes.kpmChange = Number((latestStats.kpm - (previousRecord.kpm || 0)).toFixed(2));
    changes.dpmChange = Number((latestStats.dpm - (previousRecord.dpm || 0)).toFixed(1));
    changes.revivesChange = latestStats.revives - (previousRecord.revives || 0);
    changes.assistsChange = latestStats.assists - (previousRecord.assists || 0);

    // Calculate weapon rank changes
    latestStats.weapons.forEach(currWeapon => {
      const prevWeapon = previousRecord.weaponStats.find(w => w.name === currWeapon.name);
      if (currWeapon.rank && prevWeapon?.rank) {
        // High rank number means lower position (rank 1 is best).
        // If previous rank was 3, and current is 2, change is +1 (improved)
        changes.weaponRankChanges[currWeapon.name] = prevWeapon.rank - currWeapon.rank;
      } else {
         changes.weaponRankChanges[currWeapon.name] = 0; // New or unranked previously
      }
    });

    return {
      current: latestStats,
      previous: {
        kills: previousRecord.kills,
        deaths: previousRecord.deaths,
        kdRatio: previousRecord.kdRatio,
        headshots: previousRecord.headshots,
        winPct: previousRecord.winPct,
        scorePerMin: previousRecord.scorePerMin,
        kpm: previousRecord.kpm || 0,
        dpm: previousRecord.dpm || 0,
        revives: previousRecord.revives || 0,
        assists: previousRecord.assists || 0,
        weapons: previousRecord.weaponStats as any[]
      },
      changes
    };
  } else {
    // If no previous record, default changes to 0
    latestStats.weapons.forEach(w => {
      changes.weaponRankChanges[w.name] = 0;
    });

    return {
       current: latestStats,
       previous: null,
       changes
    };
  }
}
