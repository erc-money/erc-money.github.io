export const DONATE_WALLET = '0x4A1eADE6B3780b50582344c162a547D04e4E8E4a';
export const DONATE_AMOUNT = '0.5';
export const POOL_INTERVAL = 15000;
export const TX_POOL_INTERVAL = 5000;
export const BLOCKS_CONFIRMATION = 1;
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const WALLET_PRECISION = 5;
export const GENERIC_TOKEN = 'ERC20';
export const LIVE_TOKEN = 'EMToken';
export const TEST_TOKENS = [ 'TokenA', 'TokenB' ];
export const WATCH_TOKENS = [ LIVE_TOKEN, ...TEST_TOKENS ];
export const CONTRACTS = [
  'Marketplace',
  GENERIC_TOKEN, 
  LIVE_TOKEN,
  ...TEST_TOKENS,
];
export const ORDERS_PAGE_SIZE = 100;
export const DEFAULT_TAB = 'market';
