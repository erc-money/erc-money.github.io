export const DONATE_WALLET = '0x4A1eADE6B3780b50582344c162a547D04e4E8E4a';
export const DONATE_AMOUNT = '0.2';
export const POOL_INTERVAL = 10000;
export const TX_POOL_INTERVAL = 5000;
export const BLOCKS_CONFIRMATION = 1;
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const WALLET_PRECISION = 4;
export const DEFAULT_DENOMINATION = '18';
export const GENERIC_TOKEN = 'ERC20';
export const LIVE_TOKEN = 'EMToken';
export const TEST_TOKENS = [ 'TokenA', 'TokenB' ];
export const WATCH_TOKENS = [ LIVE_TOKEN/*, ...TEST_TOKENS*/ ];
export const CONTRACTS = [
  'Marketplace',
  GENERIC_TOKEN, 
  LIVE_TOKEN,
  ...TEST_TOKENS,
];
export const ORDERS_PAGE_SIZE = 100;
export const DEFAULT_TAB = 'market';
export const BLOCKCHAIN_STATE_DEBOUNCE = 500;
export const GOOGLE_ANALYTICS_ID = 'G-8SF2G9PK4R';
