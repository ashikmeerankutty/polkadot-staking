import { getSessionIndexes } from "./session";

function parseDetails(
  stashId: any,
  controllerIdOpt: any,
  nominatorsOpt: any,
  rewardDestination: any,
  validatorPrefs: any,
  exposure: any,
  stakingLedgerOpt: any
) {
  return {
    accountId: stashId,
    controllerId: controllerIdOpt && controllerIdOpt.unwrapOr(null),
    exposure,
    nominators: nominatorsOpt.isSome ? nominatorsOpt.unwrap().targets : [],
    rewardDestination,
    stakingLedger: stakingLedgerOpt.unwrapOrDefault(),
    stashId,
    validatorPrefs,
  };
}

async function getLedgers(api: any, optIds: any, { withLedger = false }: any) {
  const ids = optIds
    .filter(
      // @ts-ignore
      (opt): opt => withLedger && !!opt && opt.isSome
    )
    // @ts-ignore
    .map((opt) => opt.unwrap());
  const emptyLed = api.registry.createType("Option<StakingLedger>");

  let optLedgers: any[] = [];

  if (ids.length) {
    optLedgers = await api.query.staking.ledger.multi(ids);
  }
  let offset = -1;

  return optIds.map(
    // @ts-ignore
    (opt) => (opt && opt.isSome ? optLedgers[++offset] || emptyLed : emptyLed)
  );
}

async function getStashInfo(
  api: any,
  stashIds: any[],
  activeEra: any,
  {
    withController,
    withDestination,
    withExposure,
    withLedger,
    withNominations,
    withPrefs,
  }: any
) {
  const emptyNoms = await api.registry.createType("Option<Nominations>");
  const emptyRewa = await api.registry.createType("RewardDestination");
  const emptyExpo = await api.registry.createType("Exposure");
  const emptyPrefs = await api.registry.createType("ValidatorPrefs");

  const bonded =
    withController || withLedger
      ? await api.query.staking.bonded.multi(stashIds)
      : stashIds.map(() => null);
  const nominators = withNominations
    ? await api.query.staking.nominators.multi(stashIds)
    : stashIds.map(() => emptyNoms);
  const payee = withDestination
    ? await api.query.staking.payee.multi(stashIds)
    : stashIds.map(() => emptyRewa);
  const validators = withPrefs
    ? await api.query.staking.validators.multi(stashIds)
    : stashIds.map(() => emptyPrefs);
  const erasStakers = withExposure
    ? await api.query.staking.erasStakers.multi(
        stashIds.map((stashId) => [activeEra, stashId])
      )
    : stashIds.map(() => emptyExpo);
  return [bonded, nominators, payee, validators, erasStakers];
}

async function getBatch(api: any, activeEra: any, stashIds: any[], flags: any) {
  const [
    controllerIdOpt,
    nominatorsOpt,
    rewardDestination,
    validatorPrefs,
    exposure,
  ] = await getStashInfo(api, stashIds, activeEra, flags);

  const stakingLedgerOpts = await getLedgers(api, controllerIdOpt, flags);

  const parsedDetails = stashIds.map(
    async (stashId, index) =>
      await parseDetails(
        stashId,
        controllerIdOpt[index],
        nominatorsOpt[index],
        rewardDestination[index],
        validatorPrefs[index],
        exposure[index],
        stakingLedgerOpts[index]
      )
  );

  return Promise.all(parsedDetails);
}

export async function accountQuery(
  accountId: Uint8Array | string,
  flags: any,
  api: any
) {
  const [first] = await accountQueryMulti([accountId], flags, api);
  return first;
}

export async function accountQueryMulti(
  accountIds: (Uint8Array | string)[],
  flags: any,
  api: any
) {
  if (accountIds.length) {
    const { activeEra } = await getSessionIndexes(api);
    const stashIds = await Promise.all(
      accountIds.map(
        async (accountId) =>
          await api.registry.createType("AccountId", accountId)
      )
    );

    return await getBatch(api, activeEra, stashIds, flags);
  }
  return [];
}
