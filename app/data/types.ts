import BigNumber from "bignumber.js";

export interface IdentityInfo {
  judgements: any[];
}

export interface Identity {
  identity: IdentityInfo;
}

export interface Nominator {
  who: string;
  value: any;
}

export interface CommissionHistory {
  era: string;
  commission: string;
}

export interface Rewarded {
  balance: number;
  date: string;
}

export interface RankingData {
  accountId: string;
  active: boolean;
  activeRating: number;
  name: string;
  identity: Identity[];
  hasSubIdentity?: boolean;
  subAccountsRating: number;
  verifiedIdentity: boolean;
  identityRating: number;
  stashAddress: string;
  controllerAddress: string;
  partOfCluster: boolean;
  clusterName: string;
  clusterMembers: number;
  showClusterMember: boolean;
  nominators: Nominator[];
  nominatorsRating: number;
  commission: number;
  commissionHistory: CommissionHistory[];
  commissionRating: number;
  performance: number;
  slashed: boolean;
  slashRating: number;
  slashes: any[];
  councilBacking: boolean;
  activeInGovernance: boolean;
  governanceRating: number;
  selfStake: BigNumber;
  otherStake: BigNumber;
  totalStake: BigNumber;
  totalRating: number;
  activeEras: number;
  eraPointsPercent: number;
  rewarded: Rewarded[];
  averageRewarded: BigNumber;
}
