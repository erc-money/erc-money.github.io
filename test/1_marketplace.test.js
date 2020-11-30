const {
  BN,
  ether,
  expectEvent,
  expectRevert,
} = require('@openzeppelin/test-helpers');
const utilsFunctor = require('../utils');

const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const EMToken = artifacts.require("EMToken");
const Marketplace = artifacts.require("Marketplace");

contract('Marketplace', function (accounts) {
  const STATUS = { Open: '0', PartiallyCompleted: '1', Completed: '2', Closed: '3' };
  const TRADERS_BALANCE = ether('999');
  const TRADE_FROM_AMOUNT = ether('4');
  const TRADE_FROM_ONE_FOURTH_AMOUNT = TRADE_FROM_AMOUNT.div(new BN('4'));
  const TRADE_TO_AMOUNT = ether('1');
  const TRADE_TO_ONE_FOURTH_AMOUNT = TRADE_TO_AMOUNT.div(new BN('4'));
  const DEFAULT_REWARD = ether('0.1');
  const ZERO = new BN('0');
  const ONE = new BN('1');
  const TWO = new BN('2');
  const THREE = new BN('3');
  const [ owner, treasury, trader1, trader2, trader3, trader4 ] = accounts;
  const { MINTER_ROLE } = utilsFunctor();

  before(async function () {
    this.marketplace = await Marketplace.deployed();
    this.token = await EMToken.deployed();
    this.tokenA = await TokenA.new();
    this.tokenB = await TokenB.new();

    this.lastOrderId = ZERO;

    this.createRandomTrade = async () => {
      return this.marketplace.createOrder(
        this.tokenA.address,
        TRADE_FROM_AMOUNT,
        this.tokenB.address,
        TRADE_TO_AMOUNT,
        false,
        { from: trader3 }
      );
    };

    this.createTrade = async ({
      from,
      fromToken = this.tokenA,
      fromAmount = TRADE_FROM_AMOUNT,
      toToken = this.tokenB,
      toAmount = TRADE_TO_AMOUNT,
      allowPartial = true,
    }, setupAllowance = true) => {
      if (setupAllowance) {
        await fromToken.increaseAllowance(
          this.marketplace.address,
          fromAmount,
          { from }
        );
      }

      const receipt = await this.marketplace.createOrder(
        fromToken.address,
        fromAmount,
        toToken.address,
        toAmount,
        allowPartial,
        { from }
      );

      this.lastOrderId = this.lastOrderId.add(ONE);

      return { receipt, orderId: this.lastOrderId };
    };

    this.claimTrade = async ({
      from,
      amount,
      toToken = null,
      allowanceAmount = null,
      wallet = null,
      orderId = null,
    }, setupAllowance = true) => {
      if (setupAllowance) {
        await toToken.increaseAllowance(
          this.marketplace.address,
          allowanceAmount,
          { from }
        );
      }

      wallet = wallet || from;
      orderId = orderId || this.lastOrderId;

      return this.marketplace.claimOrder(
        orderId,
        amount,
        wallet,
        { from }
      );
    };

    await Promise.all([ trader1, trader2, trader3, trader4 ].map(trader => {
      return Promise.all([ this.tokenA, this.tokenB ]
        .map(token => token.mint(trader, TRADERS_BALANCE)))
    }));
  });

  it('check contract initialization', async function () {
    expect(await this.marketplace.owner()).to.be.equal(owner);
    expect(await this.marketplace.treasury()).to.be.equal(treasury);
    expect(await this.marketplace.token()).to.be.equal(this.token.address);
    expect((await this.marketplace.reward()).toString()).to.be.equal(DEFAULT_REWARD.toString());
    expect(await this.token.hasRole(MINTER_ROLE, this.marketplace.address)).to.be.true;
  });

  it('should create an order properly', async function () {
    // validate required pre-allowance
    const userRequiredPreAllowance = await this.marketplace.requiredUserTokenAllowance(
      trader1,
      this.tokenA.address,
      0
    );
    expect(userRequiredPreAllowance.toString()).to.be.equal(ZERO.toString());

    const { receipt, orderId } = await this.createTrade({ from: trader1 });
    expectEvent(
      receipt,
      'OrderCreated',
      {
        orderId,
        fromSymbol: await this.tokenA.symbol(),
        toSymbol: await this.tokenB.symbol(),
      }
    );

    // validate Order
    const {
      from, fromAmount, to, toAmount,
      owner, allowPartial, id, status,
    } = await this.marketplace.getOrder(orderId);
    expect(allowPartial).to.be.true;
    expect(id).to.be.equal(this.lastOrderId.toString());
    expect(status).to.be.equal(STATUS.Open);
    expect(owner).to.be.equal(trader1);
    expect(from).to.be.equal(this.tokenA.address);
    expect(to).to.be.equal(this.tokenB.address);
    expect(fromAmount).to.be.equal(TRADE_FROM_AMOUNT.toString());
    expect(toAmount).to.be.equal(TRADE_TO_AMOUNT.toString());

    // validate required post-allowance
    const userRequiredAllowance = await this.marketplace.requiredUserTokenAllowance(
      trader1,
      this.tokenA.address,
      0
    );
    expect(userRequiredAllowance.toString()).to.be.equal(TRADE_FROM_AMOUNT.toString());

    // validate getters
    expect((await this.marketplace.lastOrderId()).toString()).to.be.equal(orderId.toString());
    expect(await this.marketplace.orderExists(orderId)).to.be.true;
    expect(await this.marketplace.isOrderActive(orderId)).to.be.true;
    expect((await this.marketplace.stats(STATUS.Open)).toString()).to.be.equal(ONE.toString());
  });

  it('validate listing functions', async function () {
    const traderOrders = await this.marketplace.listActiveUserOrders(trader1);
    const { page: marketOrders, entries: marketEntries } = await this.marketplace.listOrders(
      0,
      100,
      true,
      ''
    );
    const { entries: marketEntriesInvalidSymbol } = await this.marketplace.listOrders(
      0,
      100,
      true,
      'xyz'
    );

    expect(traderOrders.length).to.be.equal(1);
    expect(traderOrders[0].id.toString()).to.be.equal(this.lastOrderId.toString());

    expect(marketEntries.toString()).to.be.equal(ONE.toString());
    expect(marketOrders[0].id.toString()).to.be.equal(this.lastOrderId.toString());

    expect(marketEntriesInvalidSymbol.toString()).to.be.equal(ZERO.toString());
  });

  it('validate payoff amount', async function () {
    const wholeAmount = await this.marketplace.orderPayoffAmount(
      this.lastOrderId,
      TRADE_FROM_AMOUNT
    );
    const oneFourthAmount = await this.marketplace.orderPayoffAmount(
      this.lastOrderId,
      TRADE_FROM_ONE_FOURTH_AMOUNT
    );

    expect(wholeAmount.toString()).to.be.equal(TRADE_TO_AMOUNT.toString());
    expect(oneFourthAmount.toString()).to.be.equal(
      TRADE_TO_ONE_FOURTH_AMOUNT.toString()
    );
  });

  it('should allow freezing marketplace', async function () {
    await this.marketplace.freeze(true, { from: owner });
    await expectRevert.unspecified(this.createRandomTrade());
    await this.marketplace.freeze(false, { from: owner });
  });

  it('should allow blacklist a token', async function () {
    // from
    expectEvent(
      await this.marketplace.blacklistToken(this.tokenA.address, true, { from: owner }),
      'BlacklistedToken',
      {
        token: this.tokenA.address,
        who: owner,
      }
    );
    expect((await this.marketplace.blacklistedTokensCount()).toString()).to.be.equal(ONE.toString());
    expect(await this.marketplace.isTokenBlacklisted(this.tokenA.address)).to.be.true;
    await expectRevert(this.createRandomTrade(), "Token is blacklisted.");
    expectEvent(
      await this.marketplace.blacklistToken(this.tokenA.address, false, { from: owner }),
      'UnblacklistedToken',
      {
        token: this.tokenA.address,
        who: owner,
      }
    );

    // to
    expectEvent(
      await this.marketplace.blacklistToken(this.tokenB.address, true, { from: owner }),
      'BlacklistedToken',
      {
        token: this.tokenB.address,
        who: owner,
      }
    );
    await expectRevert(this.createRandomTrade(), "Token is blacklisted.");
    expectEvent(
      await this.marketplace.blacklistToken(this.tokenB.address, false, { from: owner }),
      'UnblacklistedToken',
      {
        token: this.tokenB.address,
        who: owner,
      }
    );
  });

  it('should deny creating an order with an amount grater than the user holds', async function () {
    await expectRevert(
      this.createTrade({ from: trader4, fromAmount: TRADERS_BALANCE.mul(TWO).toString() }),
      "User does not hold the desired amount of tokens"
    );
  });

  it('should deny creating an order without setting allowance', async function () {
    await expectRevert(this.createRandomTrade(), "Marketplace not allowed to spend the desired amount of tokens");
  });

  it('should deny creating invalid orders', async function () {
    await expectRevert(
      this.marketplace.createOrder(
        this.tokenA.address,
        ZERO.toString(),
        this.tokenB.address,
        TRADE_TO_AMOUNT,
        true,
        { from: trader3 }
      ),
      "Amounts can not be 0"
    );
    await expectRevert(
      this.marketplace.createOrder(
        this.tokenA.address,
        TRADE_FROM_AMOUNT,
        this.tokenA.address,
        TRADE_TO_AMOUNT,
        true,
        { from: trader3 }
      ),
      "Token can not be the same"
    );
    await expectRevert(
      this.marketplace.createOrder(
        trader3,
        TRADE_FROM_AMOUNT,
        this.tokenB.address,
        TRADE_TO_AMOUNT,
        true,
        { from: trader3 }
      ),
      "Token 'from' should be a contract"
    );
    await expectRevert(
      this.marketplace.createOrder(
        this.tokenA.address,
        TRADE_FROM_AMOUNT,
        trader3,
        TRADE_TO_AMOUNT,
        true,
        { from: trader3 }
      ),
      "Token 'to' should be a contract"
    );
    // @todo Test it with ERC721 tokens or similar...
    // await expectRevert(
    //   this.marketplace.createOrder(
    //     this.marketplace.address,
    //     TRADE_FROM_AMOUNT,
    //     this.tokenB.address,
    //     TRADE_TO_AMOUNT,
    //     true,
    //     { from: trader3 }
    //   ),
    //   "Token 'from' is not a valid ERC20 token"
    // );
    // await expectRevert(
    //   this.marketplace.createOrder(
    //     this.tokenA.address,
    //     TRADE_FROM_AMOUNT,
    //     this.marketplace.address,
    //     TRADE_TO_AMOUNT,
    //     true,
    //     { from: trader3 }
    //   ),
    //   "Token 'to' is not a valid ERC20 token"
    // );
  });

  it('should deny claiming an order without setting allowance', async function () {
    await expectRevert(
      this.claimTrade({
        from: trader2,
        amount: TRADE_FROM_ONE_FOURTH_AMOUNT,
      }, false),
      "Marketplace not allowed to spend desired amount of tokens"
    );
  });

  it('should allow claiming an order', async function () {
    const receipt = await this.claimTrade({
      from: trader2,
      toToken: this.tokenB,
      amount: TRADE_FROM_ONE_FOURTH_AMOUNT,
      allowanceAmount: TRADE_TO_ONE_FOURTH_AMOUNT,
    });

    // validate transition
    expectEvent(
      receipt,
      'OrderUpdated',
      {
        orderId: this.lastOrderId,
        fromStatus: STATUS.Open,
        toStatus: STATUS.PartiallyCompleted,
      }
    );
    expect((await this.marketplace.stats(STATUS.Open)).toString()).to.be.equal(ZERO.toString());
    expect((await this.marketplace.stats(STATUS.PartiallyCompleted)).toString()).to.be.equal(ONE.toString());

    // validate Order
    const { completedAmount, status } = await this.marketplace.getOrder(this.lastOrderId);
    expect(status).to.be.equal(STATUS.PartiallyCompleted);
    expect(completedAmount).to.be.equal(TRADE_FROM_ONE_FOURTH_AMOUNT.toString());

    // validate tokens transfer
    expect((await this.tokenA.balanceOf(trader1)).toString()).to.be.equal(
      TRADERS_BALANCE.sub(TRADE_FROM_ONE_FOURTH_AMOUNT).toString()
    );
    expect((await this.tokenB.balanceOf(trader1)).toString()).to.be.equal(
      TRADERS_BALANCE.add(TRADE_TO_ONE_FOURTH_AMOUNT).toString()
    );
    expect((await this.tokenB.balanceOf(trader2)).toString()).to.be.equal(
      TRADERS_BALANCE.sub(TRADE_TO_ONE_FOURTH_AMOUNT).toString()
    );
    expect((await this.tokenA.balanceOf(trader2)).toString()).to.be.equal(
      TRADERS_BALANCE.add(TRADE_FROM_ONE_FOURTH_AMOUNT).toString()
    );

    // validate reward
    expectEvent(
      receipt,
      'Reward',
      {
        receiver: trader2,
        reward: DEFAULT_REWARD,
      }
    );
    expect((await this.token.balanceOf(trader2)).toString()).to.be.equal(DEFAULT_REWARD.toString());
    expect((await this.marketplace.rewardsCount()).toString()).to.be.equal(ONE.toString());
    expect((await this.marketplace.rewardsValue()).toString()).to.be.equal(DEFAULT_REWARD.toString());
  });

  it('should deny closing an order for non owner', async function () {
    await expectRevert(
      this.marketplace.closeOrder(this.lastOrderId, { from: trader3 }),
      "Order updates allowed by orners only!"
    );
  });

  it('should allow closing an order', async function () {
    const receipt = await this.marketplace.closeOrder(this.lastOrderId, { from: trader1 });

    // validate transition
    expectEvent(
      receipt,
      'OrderUpdated',
      {
        orderId: this.lastOrderId,
        fromStatus: STATUS.PartiallyCompleted,
        toStatus: STATUS.Closed,
      }
    );
    expect((await this.marketplace.stats(STATUS.PartiallyCompleted)).toString()).to.be.equal(ZERO.toString());
    expect((await this.marketplace.stats(STATUS.Closed)).toString()).to.be.equal(ONE.toString());

    // validate Order
    const { status } = await this.marketplace.getOrder(this.lastOrderId);
    expect(status).to.be.equal(STATUS.Closed);
  });

  it('should deny closing a closed order', async function () {
    await expectRevert(
      this.marketplace.closeOrder(this.lastOrderId, { from: trader1 }),
      "Order is either completed or closed."
    );
  });

  it('should deny partially claiming a non partial order', async function () {
    const { orderId } = await this.createTrade({ from: trader1, allowPartial: false });

    await expectRevert(
      this.claimTrade({
        from: trader2,
        orderId: orderId,
        toToken: this.tokenB,
        amount: TRADE_FROM_ONE_FOURTH_AMOUNT,
        allowanceAmount: TRADE_TO_ONE_FOURTH_AMOUNT,
      }),
      "Order does not allow partial buyout"
    );
  });

  it('should allow completing an order', async function () {
    const receipt = await this.claimTrade({
      from: trader2,
      toToken: this.tokenB,
      amount: TRADE_FROM_AMOUNT,
      allowanceAmount: TRADE_TO_AMOUNT,
    });

    // validate transition
    expectEvent(
      receipt,
      'OrderUpdated',
      {
        orderId: this.lastOrderId,
        fromStatus: STATUS.Open,
        toStatus: STATUS.Completed,
      }
    );
    expect((await this.marketplace.stats(STATUS.Open)).toString()).to.be.equal(ZERO.toString());
    expect((await this.marketplace.stats(STATUS.Completed)).toString()).to.be.equal(ONE.toString());

    // validate Order
    const { completedAmount, status, owner } = await this.marketplace.getOrder(this.lastOrderId);
    expect(status).to.be.equal(STATUS.Completed);
    expect(completedAmount).to.be.equal(TRADE_FROM_AMOUNT.toString());

    // validate rewards
    expectEvent(
      receipt,
      'Reward',
      {
        receiver: owner,
        reward: DEFAULT_REWARD,
      }
    );
    expectEvent(
      receipt,
      'Reward',
      {
        receiver: trader2,
        reward: DEFAULT_REWARD,
      }
    );
    expect((await this.marketplace.rewardsCount()).toString()).to.be.equal(THREE.toString());
    expect((await this.marketplace.rewardsValue()).toString()).to.be.equal(DEFAULT_REWARD.mul(THREE).toString());
  });

  it('should deny claiming a non existing order', async function () {
    await expectRevert(
      this.claimTrade({
        from: trader2,
        orderId: '987',
        toToken: this.tokenB,
        amount: TRADE_FROM_AMOUNT,
        allowanceAmount: TRADE_TO_AMOUNT,
      }),
      "Order does not exist."
    );
  });

  it('should allow donating ETH (through contract)', async function () {
    const initialBalance = await web3.eth.getBalance(treasury);

    // through receive()
    expectEvent(
      await this.marketplace.sendTransaction({ from: trader1, value: ONE }),
      'Donated',
      {
        account: trader1,
        value: ONE,
      }
    );

    // through fallback()
    expectEvent(
      await this.marketplace.sendTransaction({ from: trader2, value: ONE, data: '0xcdcd77c000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000001' }),
      'Donated',
      {
        account: trader2,
        value: ONE,
      }
    );

    expect(await web3.eth.getBalance(treasury))
      .to.be.equal(new BN(initialBalance).add(TWO).toString());
  });

  it('should allow updating order reward', async function () {
    await this.tokenA.grantRole(MINTER_ROLE, this.marketplace.address);
    expectEvent(
      await this.marketplace.updateReward(
        this.tokenA.address,
        DEFAULT_REWARD.mul(TWO).toString(),
        { from: owner }
      ),
      'RewardUpdated',
      {
        token: this.tokenA.address,
        reward: DEFAULT_REWARD.mul(TWO).toString(),
        who: owner,
      }
    );
    expect(await this.marketplace.token()).to.be.equal(this.tokenA.address);
    expect((await this.marketplace.reward()).toString()).to.be.equal(DEFAULT_REWARD.mul(TWO).toString());
  });

  it('should allow updating treasury wallet', async function () {
    expectEvent(
      await this.marketplace.updateTreasury(owner, { from: owner }),
      'TreasuryUpdated',
      {
        treasury: owner,
        who: owner,
      }
    );
    expect(await this.marketplace.treasury()).to.be.equal(owner);
  });
});
