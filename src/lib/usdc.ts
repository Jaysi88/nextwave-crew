export type UsdcNetwork = 'bsc';

export const USDC_NETWORKS = {
  bsc: {
    label: 'BNB Smart Chain',
    shortLabel: 'BSC',
    chainId: 56,
    chainIdHex: '0x38',
    usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    usdcDecimals: 18,
    tokenLabel: 'Binance-Peg USDC',
    rpcUrl: 'https://bsc-dataseed.bnbchain.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
} as const;

export const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export function normalizeNetwork(value?: string): UsdcNetwork {
  void value;
  return 'bsc';
}

export function isEvmAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function toUsdcUnits(value: string, decimals = USDC_NETWORKS.bsc.usdcDecimals) {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) throw new Error('Enter a valid USDC amount with up to 6 decimal places.');
  const [whole, fraction = ''] = trimmed.split('.');
  return BigInt(whole) * (10n ** BigInt(decimals)) + BigInt(fraction.padEnd(decimals, '0'));
}

export function fromUsdcUnits(value: bigint, decimals = USDC_NETWORKS.bsc.usdcDecimals) {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const rawFraction = (value % base).toString().padStart(decimals, '0');
  const displayFraction = rawFraction.slice(0, 6).replace(/0+$/, '');
  return displayFraction ? `${whole}.${displayFraction}` : whole.toString();
}

export function encodeUsdcTransfer(recipient: string, units: bigint) {
  if (!isEvmAddress(recipient)) throw new Error('USDC recipient wallet is not configured correctly.');
  const selector = 'a9059cbb';
  const addressWord = recipient.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const amountWord = units.toString(16).padStart(64, '0');
  return `0x${selector}${addressWord}${amountWord}`;
}

export function topicToAddress(topic: string) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(topic)) return '';
  return `0x${topic.slice(-40)}`.toLowerCase();
}
