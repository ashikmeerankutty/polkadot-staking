import { BigNumber } from "bignumber.js";

export const getPayoutRating = (payoutHistory: any) => {
  const pendingEras = payoutHistory.filter(
    (era: any) => era.status === "pending"
  ).length;
  if (pendingEras <= 1) {
    return 3;
  }
  if (pendingEras <= 3 * 1) {
    return 2;
  }
  if (pendingEras < 7 * 1) {
    return 1;
  }
  return 0;
};

export const isIdentityVerified = (identity: any) => {
  if (identity.judgements?.length === 0) {
    return false;
  }

  if (!identity.judgements) {
    return false;
  }

  return (
    identity.judgements
      // @ts-ignore
      .filter(([, judgement]) => !judgement.isFeePaid)
      // @ts-ignore
      .some(([, judgement]) => judgement.isKnownGood || judgement.isReasonable)
  );
};

export const subIdentity = (identity: any) => {
  if (
    identity.displayParent &&
    identity.displayParent !== "" &&
    identity.display &&
    identity.display !== ""
  ) {
    return true;
  }
  return false;
};

export const getName = (identity: any) => {
  if (
    identity.displayParent &&
    identity.displayParent !== "" &&
    identity.display &&
    identity.display !== ""
  ) {
    return `${identity.displayParent}/${identity.display}`;
  }
  return identity.display || "";
};

export const getIdentityRating = (
  name: any,
  verifiedIdentity: any,
  hasAllFields: any
) => {
  if (verifiedIdentity && hasAllFields) {
    return 3;
  }
  if (verifiedIdentity && !hasAllFields) {
    return 2;
  }
  if (name !== "") {
    return 1;
  }
  return 0;
};

export const parseIdentity = (identities: any) => {
  if (identities.length === 0) {
    return {};
  }
  const { identity } = identities[0];
  const verifiedIdentity = isIdentityVerified(identity);
  const hasSubIdentity = subIdentity(identity);
  const name = getName(identity);
  const hasAllFields =
    identity.display &&
    identity.legal &&
    identity.web &&
    identity.email &&
    identity.twitter &&
    identity.riot;
  const identityRating = getIdentityRating(
    name,
    verifiedIdentity,
    hasAllFields
  );
  return {
    verifiedIdentity,
    hasSubIdentity,
    name,
    identityRating,
  };
};

export const getCommissionHistory = (accountId: any, erasPreferences: any) => {
  const commissionHistory: any = [];
  // @ts-ignore
  erasPreferences.forEach(({ id, validators }) => {
    if (validators[accountId]) {
      commissionHistory.push({
        era: new BigNumber(id.toString()).toString(10),
        commission: (validators[accountId].commission / 10000000).toFixed(2),
      });
    } else {
      commissionHistory.push({
        era: new BigNumber(id.toString()).toString(10),
        commission: null,
      });
    }
  });
  return commissionHistory;
};

// @ts-ignore
export const getCommissionRating = (commission, commissions) => {
  const commissionHistory = commissions.map(
    ({ commission }: { commission: string }) => {
      if (!commission) {
        return 0;
      }
      return parseInt(commission, 10);
    }
  );
  if (commission !== 100 && commission !== 0) {
    if (commission > 10) {
      return 1;
    }
    if (commission >= 5) {
      if (
        commissionHistory.length > 1 &&
        commissionHistory[0].commission >
          commissionHistory[commissionHistory.length - 1].commission
      ) {
        return 3;
      }
      return 2;
    }
    if (commission < 5) {
      return 3;
    }
  }
  return 0;
};

const getClusterName = (identity: any) => identity.displayParent || "";

export const getClusterInfo = (
  hasSubIdentity: any,
  validators: any,
  validatorIdentities: any
) => {
  const validatorIdentity =
    validatorIdentities.length > 0 ? validatorIdentities[0].identity : {};
  if (!hasSubIdentity) {
    // string detection
    // samples: DISC-SOFT-01, BINANCE_KSM_9, SNZclient-1
    if (validatorIdentity.display) {
      const stringSize = 6;
      const clusterMembers = validators.filter(
        // @ts-ignore
        ({ identity }) =>
          (identity.display || "").substring(0, stringSize) ===
          validatorIdentity.display.substring(0, stringSize)
      ).length;
      const clusterName = validatorIdentity.display
        .replace(/\d{1,2}$/g, "")
        .replace(/-$/g, "")
        .replace(/_$/g, "");
      return {
        clusterName,
        clusterMembers,
      };
    }
    return {
      clusterName: "",
      clusterMembers: 0,
    };
  }

  const clusterMembers = validators.filter(
    // @ts-ignore
    ({ identity: identities }) => {
      const identity = identities.length > 0 ? identities[0].identity : {}
      return identity.displayParent === validatorIdentity.displayParent
    }
  ).length;
  const clusterName = getClusterName(validatorIdentity);
  return {
    clusterName,
    clusterMembers,
  };
};
