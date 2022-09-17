import { gql } from "graphql-request";

export const GetValidatorAddresses = gql`
  query GetValidators($after: Cursor) {
    validatorsInfos(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
      }
    }
  }
`;

export const GetEraSalashes = gql`
  query GetEraSalashes($after: Cursor) {
    eraSlashes(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        validators
      }
    }
  }
`;

export const GetEraPreferences = gql`
  query GetEraPreferences($after: Cursor) {
    eraPreferences(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        validators
      }
    }
  }
`;

export const GetProposals = gql`
  query GetProposals($after: Cursor) {
    proposals(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        proposer
        seconds
      }
    }
  }
`;

export const GetMaxNominatorRewardedPerValidator = gql`
  query {
    maxNominatorRewardedPerValidator(id: "1") {
      maxNominatorRewardedPerValidator
    }
  }
`;

export const GetCouncilVotes = gql`
  query GetCouncilVotes($after: Cursor) {
    councilVotes(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        stake
        votes
      }
    }
  }
`;

export const GetEraPoints = gql`
  query GetEraPoints($after: Cursor) {
    eraPoints(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        eraPoints
        validators
      }
    }
  }
`;

export const GetNomination = gql`
  query GetNomination($after: Cursor) {
    nominations(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        nominator
        targets
      }
    }
  }
`;

export const GetReferendums = gql`
  query GetReferendums($after: Cursor) {
    referendums(first: 100, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        votes
      }
    }
  }
`;

export const GetStakingRewards = gql`
  query GetStakingRewards($before: Cursor) {
    sumRewards(last: 100 before: $before) {
      totalCount
      pageInfo {
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        rewards {
          totalCount
          nodes {
            balance
            date
          }
        }
      }
    }
  }
`;
