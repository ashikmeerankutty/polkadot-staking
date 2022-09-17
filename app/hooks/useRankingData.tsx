import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { getRankingData, Status } from "~/data/rankingData";
import { RankingData } from "~/data/types";
const rankingDataAtom = atom<RankingData[]>([]);

const statusInfo = {
  [Status.INITIALIZING]: {
    progress: 0,
    text: "Initializing"
  },
  [Status.FETCHING_VALIDATORS]: {
    progress: 8,
    text: "Fetching current validators"
  },
  [Status.FETCHING_REFERENDUMS]: {
    progress: 16,
    text: "Fetching referendums"
  },
  [Status.FETCHING_NOMINATIONS]: {
    progress: 24,
    text: "Fetching Nominations"
  },
  [Status.FETCHING_PROPOSALS]: {
    progress: 32,
    text: "Fetching proposals"
  },
  [Status.FETCHING_COUNCIL_VOTES]: {
    progress: 40,
    text: "Fetching council votes"
  },
  [Status.FETCHING_ERA_SLASHES]: {
    progress: 48,
    text: "Fetching era slashed"
  },
  [Status.FETCHING_ERA_PREFERENCES]: {
    progress: 56,
    text: "Fetching era preferences"
  },
  [Status.FETCHING_ERA_POINTS]: {
    progress: 64,
    text: "Fetching era points"
  },
  [Status.FETCHING_STAKING_REWARDS]: {
    progress: 72,
    text: "Fetching staking rewards"
  },
  [Status.CALCULATING_RANKS]: {
    progress: 80,
    text: "Calculating ranks"
  },
  [Status.COMPLETED]: {
    progress: 100,
    text: "Completed"
  }
}


export function useRankingData() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(Status.INITIALIZING);
  const [rankingData, setRankingData] = useAtom(rankingDataAtom);

  async function fetchRankingData() {
    setLoading(true);
    const validatorRankingData = await getRankingData(setStatus);
    console.log(validatorRankingData);
    setRankingData(validatorRankingData);
    setLoading(false);
  }

  useEffect(() => {
    if (!rankingData.length) {
      fetchRankingData();
    }
  }, []);

  return {
    rankingData,
    loading,
    status,
    info: statusInfo[status]
  };
}
