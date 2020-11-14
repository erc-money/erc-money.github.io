import { LIVE_TOKEN } from '../constants'

const MARKETPLACE_PROPS = {
  owner: { contract: 'Marketplace', prop: 'owner' },
  paused: { contract: 'Marketplace', prop: 'paused' },
  reward: { contract: 'Marketplace' },
  rewardSymbol: { contract: LIVE_TOKEN, prop: 'symbol' },
  rewardDecimals: { contract: LIVE_TOKEN, prop: 'decimals' },
  rewardsCount: { contract: 'Marketplace' },
  rewardsValue: { contract: 'Marketplace' },
  lastOrderId: { contract: 'Marketplace' },
  blacklistedTokensCount: { contract: 'Marketplace' },
  openedOrders: { contract: 'Marketplace', prop: 'stats', args: [ 0 ] },
  partiallyCompletedOrders:  { contract: 'Marketplace', prop: 'stats', args: [ 1 ] },
  completedOrders:  { contract: 'Marketplace', prop: 'stats', args: [ 2 ] },
  closedOrders:  { contract: 'Marketplace', prop: 'stats', args: [ 3 ] },
};

const handlers = {};

for (const key of Object.keys(MARKETPLACE_PROPS)) {
  handlers[key] = async ({ state }) => {
    const { contract, prop, args } = MARKETPLACE_PROPS[key];
    return (await state[contract].deployed())[prop || key].call(...(args || []));
  };
}

export default handlers;
