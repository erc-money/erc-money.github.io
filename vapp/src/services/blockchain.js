import {
  ComposableController,
  AccountTrackerController,
  PreferencesController,
  AssetsContractController,
  AssetsController,
  TokenBalancesController,
  NetworkController,
  util
} from '@metamask/controllers'
import { POOL_INTERVAL, IPFS_GATEWAY, WATCH_TOKENS } from '../constants'
import contractsFactory from './contracts-factory'
import marketplaceHandlers from './marketplace-handlers';

export default class Blockchain {
  constructor() {
    this.listener = null;
    this.datamodel = null;
    this.handle = null;
    this.contracts = {};
    this.handlers = { ...marketplaceHandlers };
    this.handlersState = {};
  }

  initialize() {
    this.datamodel = new ComposableController([
      new PreferencesController(),
      new AccountTrackerController(),
      new AssetsContractController(),
      new AssetsController(),
      new TokenBalancesController(),
      new NetworkController(),
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
      NetworkController: {},
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
      if (this.handle) {
        clearTimeout(this.handle);
      }
      this.handle = null;
      this.listener = null;
      this.contracts = {};
      this.handlers = { ...marketplaceHandlers };
      this.handlersState = {};
    }

    return this.initialize();
  }

  async reconfigure(...args) {
    return this.reinitialize().configure(...args);
  }

  async configure({ web3, wallet, tokens = [], interval = POOL_INTERVAL }, listener) {
    this.listener = listener;
    this.contracts = contractsFactory(web3);

    await this._augmentTokens(tokens); // add internal tokens

    this._configureController('AccountTrackerController', {
      interval,
      provider: web3.currentProvider,
    });

    this._configureController('AssetsContractController', {
      provider: web3.currentProvider,
    });

    this._configureController('AssetsController', {
      selectedAddress: wallet,
    });

    this._configureController('TokenBalancesController', {
      interval,
      tokens,
    });

    await Promise.all(tokens.map(token => {
      return this.datamodel.context.AssetsController.addToken(
        token.address,
        token.symbol,
        token.decimals,
      );
    }));

    await this.updateAccount(wallet);
    await this._poll(interval);

    return this;
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

  addHandler(stateKey, functor) {
    this.handlers[stateKey] = functor;
    return this;
  }

  removeHandler(stateKey) {
    delete this.handlers[stateKey];
    return this;
  }

  async _poll(interval) {
    this.handle && clearTimeout(this.handle);
    await util.safelyExecute(() => this._refresh());
    this.handle = setTimeout(() => {
      this._poll(interval);
    }, interval);
  }

  async _refresh() {
    const state = this.flatState;

    for (const key of Object.keys(this.handlers)) {
      await util.safelyExecute(async () => {
        this.handlersState[key] = await this.handlers[key](state);
      });
    }

    this._listener();
  }

  async _augmentTokens(tokens) {
    tokens.push(...(await Promise.all(WATCH_TOKENS.map(async token => {
      const tokenContract = await this.contracts[token].deployed();

      if (!tokenContract.address || tokenContract.address == '0x0') {
        return false;
      }

      const [ decimals, symbol ] = (await Promise.all([
        tokenContract.decimals.call(),
        tokenContract.symbol.call(),
      ])).map(x => x.toString());

      return {
        address: tokenContract.address,
        decimals, symbol,
      };
    }))).filter(Boolean));
  }

  _configureController(controller, config) {
    this.datamodel.context[controller].configure(config, true, true);
  }

  _listener() {
    const state = {
      wallet: { balance: '0', tokens: [] },
      ...this.flatState,
    };
    const tokens = (state.allTokens[state.selectedAddress.toLowerCase()] || {}).undefined || [];

    if (state.accounts[state.selectedAddress]) {
      state.wallet.balance = util.hexToBN(
        state.accounts[state.selectedAddress].balance || '0x0'
      ).toString();
    }
    
    for (const token of tokens) {
      state.wallet.tokens.push({
        ...token,
        balance: (state.contractBalances[token.address] || 0).toString(),
      });
    }

    // eslint-disable-next-line no-console
    console.info('[BC]', state);

    if (typeof this.listener === 'function') {
      this.listener(state);
    }
  }

  get flatState() {
    return {
      ...this.contracts,
      ...this.handlersState,
      ...this.datamodel.flatState,
    };
  }
}