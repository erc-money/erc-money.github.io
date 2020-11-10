import {
  ComposableController,
  AccountTrackerController,
  PreferencesController,
  AssetsContractController,
  AssetsController,
  TokenBalancesController,
  util
} from '@metamask/controllers'
import { POOL_INTERVAL, IPFS_GATEWAY, WATCH_TOKENS } from '../constants'
import contractsFactory from './contracts-factory'

export default class Blockchain {
  constructor() {
    this.listener = null;
    this.datamodel = null;
    this.contracts = {};
  }

  initialize() {
    this.datamodel = new ComposableController([
      new PreferencesController(),
      new AccountTrackerController(),
      new AssetsContractController(),
      new AssetsController(),
      new TokenBalancesController(),
    ], {
      PreferencesController: {
        featureFlags: {}, // { [feature: string]: boolean }
        frequentRpcList: [], // FrequentRpc[]
        ipfsGateway: IPFS_GATEWAY, // string
        identities: {}, // { [address: string]: ContactEntry }
        lostIdentities: {}, // { [address: string]: ContactEntry }
        selectedAddress: '', // string
      },
      AccountTrackerController: {
        accounts: {}, // accounts: { [address: string]: { balance: string } }
      },
      AssetsContractController: {},
      AssetsController: {
        allTokens: {}, // { [key: string]: { [key: string]: Token[] } }
        allCollectibleContracts: {}, // { [key: string]: { [key: string]: CollectibleContract[] } }
        allCollectibles: {}, // { [key: string]: { [key: string]: Collectible[] } }
        collectibleContracts: [], // CollectibleContract[]
        collectibles: [], // Collectible[]
        ignoredTokens: [], // Token[]
        ignoredCollectibles: [], // Collectible[]
        suggestedAssets: [], // SuggestedAssetMeta[]
        tokens: [], // Token[]
      },
      TokenBalancesController: {
        contractBalances: [], // { [address: string]: typeof BN }
      },
    });
    this.datamodel.subscribe(this._listener.bind(this));

    return this;
  }

  reinitialize() {
    if (this.datamodel) {
      this.datamodel.unsubscribe(this._listener.bind(this));
      // shutdown ticker
      if (this.datamodel.context.AccountTrackerController.handle) {
        clearTimeout(this.datamodel.context.AccountTrackerController.handle);
      }
      this.listener = null;
    }

    return this.initialize();
  }

  async reconfigure(...args) {
    return this.reinitialize().configure(...args);
  }

  async configure({ web3, wallet, tokens = [], interval = POOL_INTERVAL }, listener) {
    this.listener = listener;
    this.contracts = contractsFactory(web3);

    tokens.push(...(await Promise.all(WATCH_TOKENS.map(async token => {
      const tokenContract = await this.contracts[token].deployed();

      if (!tokenContract.address) {
        return false;
      }

      const [ decimals, symbol ] = await Promise.all([
        tokenContract.decimals.call(),
        tokenContract.symbol.call(),
      ]);

      return {
        address: tokenContract.address,
        decimals, symbol,
      };
    }))).filter(Boolean));

    this.datamodel.configure({
      AccountTrackerController: {
        interval, // number (miliseconds)
        provider: web3.currentProvider, // doesn work :(
      },
      AssetsContractController: {
        provider: web3.currentProvider, // doesn work :(
      },
      AssetsController: {
        selectedAddress: wallet,
      },
      TokenBalancesController: {
        interval,
        tokens,
      },
    }, /* overwrite =*/ true, /* fullUpdate */ true);
    
    // o_O weird that it doesnt work...
    this.datamodel.context.AccountTrackerController.provider = web3.currentProvider;
    this.datamodel.context.AssetsContractController.provider = web3.currentProvider;

    return this.updateAccount(wallet);
  }

  async updateAccount(wallet, refresh = true) {
    // add wallet to identities
    this.datamodel.context.PreferencesController.updateIdentities([ wallet ]);
    // set wallet address
    this.datamodel.context.PreferencesController.setSelectedAddress(wallet);

    // do not wait for the ticker...
    if (refresh) {
      await util.safelyExecute(() => this.datamodel.context.AccountTrackerController.refresh());
      await util.safelyExecute(() => this.datamodel.context.TokenBalancesController.updateBalances());
    }

    return this;
  }

  _listener() {
    const state = { wallet: { balance: 0 }, ...this.flatState };
    state.wallet = { balance: '0' };

    if (state.accounts[state.selectedAddress]) {
      state.wallet.balance = util.hexToBN(
        state.accounts[state.selectedAddress].balance || '0x0'
      ).toString();
    }

    // eslint-disable-next-line no-console
    console.info('[BC]', state);

    if (typeof this.listener === 'function') {
      this.listener(state);
    }
  }

  get flatState() {
    return this.datamodel.flatState;
  }
}