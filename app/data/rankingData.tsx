import { ApiPromise } from "@polkadot/api";
import { WsProvider } from "@polkadot/rpc-provider";
import { GraphQLClient, RequestDocument } from "graphql-request";
import { getValidatorsWithIdentity } from "./handlers/identity";
import { accountQuery } from "./handlers/query";
import { BigNumber } from "bignumber.js";
import {
  getClusterInfo,
  getCommissionHistory,
  getCommissionRating,
  getPayoutRating,
  parseIdentity,
} from "./handlers/utils";
import {
  GetCouncilVotes,
  GetEraPoints,
  GetEraPreferences,
  GetEraSalashes,
  GetMaxNominatorRewardedPerValidator,
  GetNomination,
  GetProposals,
  GetReferendums,
  GetStakingRewards,
} from "./queries";
import { RankingData } from "./types";

const provider = new WsProvider("wss://polkadot.api.onfinality.io/public-ws");

const stakingQueryFlags = {
  withDestination: false,
  withExposure: true,
  withLedger: true,
  withNominations: false,
  withPrefs: true,
};

export async function fetchAll(query: RequestDocument, key: string) {
  const subquery = new GraphQLClient(
    "https://api.subquery.network/sq/ashikmeerankutty/staking-subquery"
  );
  let hasNext = true;
  let data: unknown[] = [];
  let cursor = "";
  let pageCount = 0;
  while (hasNext && pageCount < 50) {
    pageCount += 1;
    const gqlData = await subquery.request(query, {
      after: cursor,
    });
    if (gqlData[key]) {
      data = [...data, ...gqlData[key].nodes];
    }
    hasNext = gqlData[key].pageInfo.hasNextPage;
    cursor = gqlData[key].pageInfo.endCursor;
  }
  return data;
}

export async function fetchEnd(query: RequestDocument, key: string) {
  const subquery = new GraphQLClient(
    "https://api.subquery.network/sq/ashikmeerankutty/staking-subquery"
  );
  let hasPrev = true;
  let data: unknown[] = [];
  let cursor = "";
  let pageCount = 0;
  while (hasPrev && pageCount < 50) {
    pageCount += 1;
    const gqlData = await subquery.request(query, {
      before: cursor,
    });
    if (gqlData[key]) {
      data = [...data, ...gqlData[key].nodes];
    }
    hasPrev = gqlData[key].pageInfo.hasPreviousPage;
    cursor = gqlData[key].pageInfo.startCursor;
  }
  return data;
}

export enum Status {
  INITIALIZING = "INITIALIZING",
  FETCHING_VALIDATORS = "FETCHING_VALIDATORS",
  FETCHING_REFERENDUMS = "FETCHING_REFERENDUMS",
  FETCHING_NOMINATIONS = "FETCHING_NOMINATIONS",
  FETCHING_PROPOSALS = "FETCHING_PROPOSALS",
  FETCHING_COUNCIL_VOTES = "FETCHING_COUNCIL_VOTES",
  FETCHING_ERA_SLASHES = "FETCHING_ERA_SLASHES",
  FETCHING_ERA_PREFERENCES = "FETCHING_ERA_PREFERENCES",
  FETCHING_ERA_POINTS = "FETCHING_ERA_POINTS",
  FETCHING_STAKING_REWARDS = "FETCHING_STAKING_REWARDS",
  CALCULATING_RANKS = "CALCULATING_RANKS",
  COMPLETED = "COMPLETED",
}

export async function getRankingData(
  setStatus: (status: Status) => void
): Promise<RankingData[]> {
  const api = await ApiPromise.create({ provider });

  const validatorsInfos = await api.query.session.validators();
  setStatus(Status.FETCHING_VALIDATORS);
  const validatorsInfo = await Promise.all(
    validatorsInfos.map(async (authority: any) => {
      const accountId = authority;
      const accountInfo = await accountQuery(
        accountId as string,
        stakingQueryFlags,
        api
      );
      const identity = await getValidatorsWithIdentity(api, [accountId]);
      return {
        ...accountInfo,
        identity,
        active: true,
      };
    })
  );

  const subquery = new GraphQLClient(
    "https://api.subquery.network/sq/ashikmeerankutty/polkstakes"
  );
  setStatus(Status.FETCHING_REFERENDUMS);
  const referendums = await fetchAll(GetReferendums, "referendums");
  setStatus(Status.FETCHING_NOMINATIONS);
  const nominations = await fetchAll(GetNomination, "nominations");
  setStatus(Status.FETCHING_PROPOSALS);
  const proposals = await fetchAll(GetProposals, "proposals");
  setStatus(Status.FETCHING_COUNCIL_VOTES);
  const councilVotes = await fetchAll(GetCouncilVotes, "councilVotes");
  setStatus(Status.FETCHING_ERA_SLASHES);
  const eraSlashes = await fetchAll(GetEraSalashes, "eraSlashes");
  setStatus(Status.FETCHING_ERA_PREFERENCES);
  const eraPreferences = await fetchAll(GetEraPreferences, "eraPreferences");
  setStatus(Status.FETCHING_ERA_POINTS);
  const eraPoints = await fetchAll(GetEraPoints, "eraPoints");
  setStatus(Status.FETCHING_STAKING_REWARDS);
  const stakingRewards = await fetchEnd(GetStakingRewards, "sumRewards");

  const stakingRewardsMap: Record<string, { balance: number; date: string }[]> =
    stakingRewards.reduce(
      (
        acc: Record<string, { balance: number; date: string }[]>,
        staking: any
      ) => {
        return {
          ...acc,
          [staking.id]: staking.rewards.nodes,
        };
      },
      {}
    );

  const { maxNominatorRewardedPerValidator } = await subquery.request(
    GetMaxNominatorRewardedPerValidator
  );

  const participateInGovernance: any = [];
  // @ts-expect-error
  proposals.forEach(({ seconds, proposer }) => {
    participateInGovernance.push(proposer.toString());
    // @ts-expect-error
    seconds.forEach((accountId) =>
      participateInGovernance.push(accountId.toString())
    );
  });
  // @ts-expect-error
  referendums.forEach(({ votes }) => {
    // @ts-expect-error
    votes.forEach(({ accountId }) =>
      participateInGovernance.push(accountId.toString())
    );
  });

  const clusters: any = [];

  setStatus(Status.CALCULATING_RANKS);

  const rankingData = validatorsInfo.map((validator: any): RankingData => {
    const { active } = validator;
    const activeRating = active ? 2 : 0;
    const stashAddress = validator.stashId.toString();
    const controllerAddress = validator.controllerId.toString();
    const {
      verifiedIdentity,
      hasSubIdentity,
      name,
      identityRating = 0,
    } = parseIdentity(validator.identity);
    const identity = JSON.parse(JSON.stringify(validator.identity));
    const { clusterMembers, clusterName } = getClusterInfo(
      hasSubIdentity,
      validatorsInfo,
      validator.identity
    );
    if (clusterName && !clusters.includes(clusterName)) {
      clusters.push(clusterName);
    }
    const partOfCluster = clusterMembers > 1;
    const subAccountsRating = hasSubIdentity ? 2 : 0;
    const nominators = active
      ? validator.exposure.others
      : // @ts-expect-error
        nominations.filter((nomination: { targets: [string] }) =>
          nomination.targets.some(
            // @ts-ignore
            (target) => target === validator.accountId.toString()
          )
        ).length;
    const nominatorsRating =
      nominators > 0 &&
      nominators <=
        maxNominatorRewardedPerValidator.maxNominatorRewardedPerValidator.toNumber()
        ? 2
        : 0;
    const slashes =
      eraSlashes.filter(
        // @ts-ignore
        ({ validators }) => {
          const parsedValidators = JSON.parse(validators);
          return parsedValidators[validator.accountId.toString()];
        }
      ) || [];

    const slashed = slashes.length > 0;
    const slashRating = slashed ? 0 : 2;

    const commission =
      parseInt(validator.validatorPrefs.commission.toString(), 10) / 10000000;

    const commissionHistory = getCommissionHistory(
      validator.accountId,
      eraPreferences.map((pref: any) => {
        return {
          ...pref,
          validators: JSON.parse(pref.validators),
        };
      })
    );

    const commissionRating = getCommissionRating(commission, commissionHistory);

    const eraPointsHistory: any = [];
    const payoutHistory: any = [];
    const stakeHistory: any = [];
    let activeEras = 0;
    let performance = 0;
    // eslint-disable-next-line
    eraPoints.forEach((eraPoints: any) => {
      const { id } = eraPoints;
      let eraPayoutState = "inactive";
      let eraPerformance = 0;
      const validators = JSON.parse(eraPoints.validators);
      if (validators[stashAddress]) {
        activeEras += 1;
        const points = parseInt(validators[stashAddress].toString(), 10);
        eraPointsHistory.push({
          era: new BigNumber(id.toString()).toString(10),
          points,
        });
        if (validator.stakingLedger.claimedRewards.includes(id)) {
          eraPayoutState = "paid";
        } else {
          eraPayoutState = "pending";
        }
      } else {
        // validator was not active in that era
        eraPointsHistory.push({
          era: new BigNumber(id.toString()).toString(10),
          points: 0,
        });
        stakeHistory.push({
          era: new BigNumber(id.toString()).toString(10),
          self: 0,
          others: 0,
          total: 0,
        });
      }
      payoutHistory.push({
        era: new BigNumber(id.toString()).toString(10),
        status: eraPayoutState,
      });
      // total performance
      performance += eraPerformance;
    });

    const eraPointsHistoryValidator = eraPointsHistory.reduce(
      // @ts-ignore
      (total, era) => total + era.points,
      0
    );
    const eraPointsHistoryTotals: any = [];
    eraPoints.forEach(({ eraPoints }: any) => {
      eraPointsHistoryTotals.push(parseInt(eraPoints.toString(), 10));
    });
    const eraPointsHistoryTotalsSum = eraPointsHistoryTotals.reduce(
      // @ts-expect-error
      (total, num) => total + num,
      0
    );
    const numActiveValidators = validatorsInfo.length;

    const eraPointsAverage = eraPointsHistoryTotalsSum / numActiveValidators;

    const eraPointsPercent =
      (eraPointsHistoryValidator * 100) / eraPointsHistoryTotalsSum;
    const eraPointsRating =
      eraPointsHistoryValidator > eraPointsAverage ? 2 : 0;
    const payoutRating = getPayoutRating(payoutHistory);

    const councilBacking = validator.identity?.parent
      ? councilVotes.some(
          // @ts-ignore
          (vote) => vote.id.toString() === validator.accountId.toString()
        ) ||
        councilVotes.some(
          // @ts-ignore
          (vote) => vote.id.toString() === validator.identity.parent.toString()
        )
      : councilVotes.some(
          // @ts-ignore
          (vote) => vote.id.toString() === validator.accountId.toString()
        );
    const activeInGovernance = validator.identity?.parent
      ? participateInGovernance.includes(validator.accountId.toString()) ||
        participateInGovernance.includes(validator.identity.parent.toString())
      : participateInGovernance.includes(validator.accountId.toString());
    let governanceRating = 0;
    if (councilBacking && activeInGovernance) {
      governanceRating = 3;
    } else if (councilBacking || activeInGovernance) {
      governanceRating = 2;
    }
    const selfStake = active
      ? new BigNumber(validator.exposure.own.toString())
      : new BigNumber(validator.stakingLedger.total.toString());
    const totalStake = active
      ? new BigNumber(validator.exposure.total.toString())
      : selfStake;
    const otherStake = active ? totalStake.minus(selfStake) : new BigNumber(0);
    const showClusterMember = true;
    const rewarded = stakingRewardsMap[validator.accountId];

    const rewardedRating = rewarded && rewarded.length > 0 ? 5 : 0;
    const totalRating =
      activeRating +
      identityRating +
      subAccountsRating +
      nominatorsRating +
      commissionRating +
      slashRating +
      governanceRating +
      eraPointsRating +
      payoutRating +
      rewardedRating;

    const totalRewarded: BigNumber =
      rewarded && rewarded.length > 0
        ? rewarded.reduce((acc, { balance }) => {
            return BigNumber.sum(acc, new BigNumber(balance));
          }, new BigNumber(0))
        : new BigNumber(0);

    const averageRewarded: BigNumber =
      rewarded && rewarded.length > 0
        ? totalRewarded.dividedBy(rewarded.length)
        : new BigNumber(0);

    return {
      accountId: validator.accountId,
      active,
      activeRating,
      name,
      identity,
      hasSubIdentity,
      subAccountsRating,
      verifiedIdentity,
      identityRating,
      stashAddress: stashAddress.toString(),
      controllerAddress,
      partOfCluster,
      clusterName,
      clusterMembers,
      showClusterMember,
      nominators,
      nominatorsRating,
      commission,
      commissionHistory,
      commissionRating,
      performance,
      slashed,
      slashRating,
      slashes,
      councilBacking,
      activeInGovernance,
      governanceRating,
      selfStake,
      otherStake,
      totalStake,
      totalRating,
      activeEras,
      eraPointsPercent,
      rewarded,
      averageRewarded,
    };
  });

  setStatus(Status.COMPLETED);

  return rankingData.sort((a, b) => (a.totalRating < b.totalRating ? 1 : -1));
}
