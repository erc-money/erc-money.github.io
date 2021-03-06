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
import debounce from 'debounce'
import { POOL_INTERVAL, IPFS_GATEWAY, WATCH_TOKENS, BLOCKCHAIN_STATE_DEBOUNCE } from '../constants'
import contractsFactory from './contracts-factory'
import marketplaceHandlers from './marketplace-handlers'

export default class Blockchain {
  constructor() {
    this.listener = null;
    this.datamodel = null;
    this.handle = null;
    this.contracts = {};
    this.tokens = [];
    this.handlers = { ...marketplaceHandlers };
    this.handlersState = {};
    this._debounceListener = debounce(this._listener.bind(this), BLOCKCHAIN_STATE_DEBOUNCE);
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
    this.datamodel.subscribe(this._debounceListener);

    return this;
  }

  reinitialize() {
    if (this.datamodel) {
      this.datamodel.unsubscribe(this._debounceListener);
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
      this.tokens = [];
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

    await this._configureController('AccountTrackerController', {
      interval,
      provider: web3.currentProvider,
    });

    await this._configureController('AssetsContractController', {
      provider: web3.currentProvider,
    });
    
    await this.updateAccount({ wallet, tokens, interval });
    this._poll(interval);

    return this;
  }

  async updateAccount({ wallet, tokens = [], interval = POOL_INTERVAL }, refresh = true) {
    // add wallet to identities
    this.datamodel.context.PreferencesController.updateIdentities([ wallet ]);
    // set wallet address
    this.datamodel.context.PreferencesController.setSelectedAddress(wallet);
    
    await this._configureController('AssetsController', {
      selectedAddress: wallet,
    });

    await this.updateTokens({ tokens, interval }, refresh, false);

    return this;
  }

  async updateTokens({ tokens = [], interval = POOL_INTERVAL }, refresh = true, onlyMissing = false) {
    const existingTokens = onlyMissing ? this.tokens.map(x => x.address.toLowerCase()) : [];
    const missingTokens = tokens.filter(x => !existingTokens.includes(x.address.toLowerCase()));

    if (onlyMissing && missingTokens.length <= 0) {
      return this;
    } else if (onlyMissing) {
      this.tokens.push(...missingTokens);
    } else {
      this.tokens = await this._augmentTokens(tokens);
    }
    
    await Promise.all((onlyMissing ? missingTokens : this.tokens).map(token => {
      return this.datamodel.context.AssetsController.addToken(
        token.address,
        token.symbol,
        token.decimals,
      );
    }));

    await this._configureController('TokenBalancesController', {
      interval,
      tokens: this.tokens,
    });

    // do not wait for the ticker...
    if (refresh) {
      await this.refresh();
    }

    return this;
  } 

  async refresh() {
    await Promise.all([
      util.safelyExecute(() => this.datamodel.context.AccountTrackerController.refresh()),
      util.safelyExecute(() => this.datamodel.context.TokenBalancesController.updateBalances()),
      util.safelyExecute(() => this.refreshHandlers()),
    ]);

    return this;
  }

  async addHandler(stateKey, functor) {
    this.handlers[stateKey] = functor;
    await this.refreshHandler(stateKey);
    return this;
  }

  removeHandler(stateKey) {
    delete this.handlers[stateKey];
    return this;
  }

  async refreshHandler(key, updateState = true) {
    const { flatState: state, web3, ethjsQuery } = this;

    await util.safelyExecute(async () => {
      this.handlersState[key] = await this.handlers[key]({ state, web3, ethjsQuery });
    });

    if (updateState) {
      this._debounceListener();
    }

    return this;
  }

  async refreshHandlers(updateState = true) {
    await Promise.all(Object.keys(this.handlers).map(key => {
      return this.refreshHandler(key, false);
    }));

    if (updateState) {
      this._debounceListener();
    }
    
    return this;
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
        decimals,
        symbol,
      };
    }))));
    
    return tokens.filter(Boolean);
  }

  _poll(interval) {
    this.handle && clearTimeout(this.handle);
    this.handle = setTimeout(async () => {
      await util.safelyExecute(() => this.refreshHandlers());
      this._poll(interval);
    }, interval);
  }

  async _configureController(controller, config) {
    this.datamodel.context[controller].configure(config, true, true);

    // hack to start controller polling... weird...
    if (config.interval && typeof this.datamodel.context[controller].poll === 'function') {
      await util.safelyExecute(() => this.datamodel.context[controller].poll(config.interval));
    }
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

    if (typeof this.listener === 'function') {
      this.listener(state);
    }
  }

  get web3() {
    return this.datamodel.context.AssetsContractController.web3;
  }

  get ethjsQuery() {
    return this.datamodel.context.AccountTrackerController.ethjsQuery;
  }

  get flatState() {
    return {
      ...this.contracts,
      ...this.handlersState,
      ...this.datamodel.flatState,
    };
  }
}