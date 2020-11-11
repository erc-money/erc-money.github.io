export default {
  web3: null,
  network: null,
  wallet: null,
  blockchain: {
    wallet: {
      balance: 0,
      tokens: [],
    },
    reward: 0,
    rewardsCount: 0,
    rewardsValue: 0,
    lastOrderId: 0,
    blacklistedTokensCount: 0,
    openedOrders: 0,
    partiallyCompletedOrders: 0,
    completedOrders: 0,
    closedOrders: 0,
    orders: [],
    personalOrders: [],
  },
}
