import { u8aToString } from "@polkadot/util";

const getIdentityParent = (identityOfOpt: any, superOfOpt: any, api: any) => {
  if (identityOfOpt?.isSome) {
    // this identity has something set
    return [identityOfOpt, undefined];
  } else if (superOfOpt?.isSome) {
    const superOf = superOfOpt.unwrap();

    // we have a super
    return [api.query.identity.identityOf(superOf[0]), superOf];
  }

  return [undefined, undefined];
};

const dataAsString = (data: any): string | undefined => {
  if (!data) {
    return "";
  }
  return data?.isRaw
    ? u8aToString(data.asRaw.toU8a(true))
    : data.isNone
    ? undefined
    : data.toHex();
};

const extractOther = (additional: any[]): Record<string, string> => {
  return additional.reduce(
    (other: Record<string, string>, [_key, _value]): Record<string, string> => {
      const key = dataAsString(_key);
      const value = dataAsString(_value);

      if (key && value) {
        other[key] = value;
      }

      return other;
    },
    {}
  );
};

const UNDEF_HEX = { toHex: (): void => undefined };

const extractIdentity = (identityOfOpt: any, superOf: any) => {
  if (!identityOfOpt?.isSome) {
    // @ts-ignore
    return { judgements: [] };
  }

  const { info, judgements } = identityOfOpt.unwrap();
  const topDisplay = dataAsString(info.display);

  return {
    display: (superOf && dataAsString(superOf[1])) || topDisplay,
    displayParent: superOf && topDisplay,
    email: dataAsString(info.email),
    image: dataAsString(info.image),
    judgements,
    legal: dataAsString(info.legal),
    other: extractOther(info.additional),
    parent: superOf && superOf[0],
    pgp: info.pgpFingerprint.unwrapOr(UNDEF_HEX).toHex(),
    riot: dataAsString(info.riot),
    twitter: dataAsString(info.twitter),
    web: dataAsString(info.web),
  };
};

export const getBase = (api: any, accountId: any) => {
  return accountId && api.query.identity?.identityOf
    ? api.queryMulti([
        [api.query.identity.identityOf, accountId],
        [api.query.identity.superOf, accountId],
      ])
    : [undefined, undefined];
};

export const getIdentity = async (accountId: any, api: any) => {
  const [identityOfOpt, superOfOpt] = await api.queryMulti([
    [api.query.identity.identityOf, accountId],
    [api.query.identity.superOf, accountId],
  ]);
  const parent = getIdentityParent(identityOfOpt, superOfOpt, api);
  // @ts-ignore
  const identityInfo = extractIdentity(parent[0], parent[1]);
  return identityInfo;
};

export const getValidatorsWithIdentity = async (
  api: any,
  validatorAddresses: any
) => {
  const validatorsWithIdentity = validatorAddresses.map(
    async (validatorAddresses: any) => {
      try {
        const identity = await getIdentity(validatorAddresses, api);
        return {
          identity,
        };
      } catch (err) {
        return {};
      }
    }
  );
  return Promise.all(validatorsWithIdentity);
};
