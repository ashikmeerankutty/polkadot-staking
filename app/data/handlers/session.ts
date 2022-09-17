
// parse into Indexes
function parse([
    currentIndex,
    activeEra,
    activeEraStart,
    currentEra,
    validatorCount,
  ]: any) {
    return {
      activeEra,
      activeEraStart,
      currentEra,
      currentIndex,
      validatorCount,
    };
  }
  
  // query based on latest
  async function queryStaking(api: any) {
    const [currentIndex, activeOpt, currentEra, validatorCount] =
      await api.queryMulti([
        api.query.session.currentIndex,
        api.query.staking.activeEra,
        api.query.staking.currentEra,
        api.query.staking.validatorCount,
      ]);
  
    const { index, start } = activeOpt.unwrapOrDefault();
  
    return parse([
      currentIndex,
      index,
      start,
      currentEra.unwrapOrDefault(),
      validatorCount,
    ]);
  }
  
  // query based on latest
  async function querySession(api: any) {
    const currentIndex = await api.query.session.currentIndex();
    const eraIndex = await api.registry.createType("EraIndex");
    const option = await api.registry.createType("Option<Moment>");
    const u32option = await api.registry.createType("u32");
    return parse([currentIndex, eraIndex, option, eraIndex, u32option]);
  }
  
  // empty set when none is available
  async function empty(api: any) {
    return parse([
      await api.registry.createType("SessionIndex", 1),
      await api.registry.createType("EraIndex"),
      await api.registry.createType("Option<Moment>"),
      await api.registry.createType("EraIndex"),
      await api.registry.createType("u32"),
    ]);
  }
  
  export async function getSessionIndexes(api: any) {
    if (api.query.session) {
      if (api.query.staking) {
        return queryStaking(api);
      }
      return querySession(api);
    }
    return empty(api);
  }
  