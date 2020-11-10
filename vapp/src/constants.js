export const DONATE_WALLET = '0x4A1eADE6B3780b50582344c162a547D04e4E8E4a';
export const DONATE_AMOUNT = '0.5';
export const POOL_INTERVAL = 15000;
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const WALLET_PRECISION = 5;
export const GENERIC_TOKEN = 'IToken';
export const LIVE_TOKEN = 'EMToken';
export const TEST_TOKENS = [ 'TokenA', 'TokenB' ];
export const WATCH_TOKENS = [ LIVE_TOKEN, ...TEST_TOKENS ];
export const CONTRACTS = [
  'Marketplace',
  GENERIC_TOKEN, 
  LIVE_TOKEN,
  ...TEST_TOKENS,
];