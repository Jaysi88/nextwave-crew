'use client';

import { useMemo, useState } from 'react';
import { encodeUsdcTransfer, toUsdcUnits, USDC_NETWORKS, type UsdcNetwork } from '@/lib/usdc';

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type Props = {
  recipient: string;
  network: UsdcNetwork;
};

const PRESETS = ['3', '5', '10', '25'];

function shortAddress(value: string) {
  return value ? `${value.slice(0, 6)}…${value.slice(-4)}` : 'Not configured';
}

export default function UsdcCoffeeCard({ recipient, network }: Props) {
  const chain = USDC_NETWORKS[network];
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('5');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'paying' | 'verifying' | 'success' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');
  const [txHash, setTxHash] = useState('');

  const configured = /^0x[a-fA-F0-9]{40}$/.test(recipient);
  const buttonLabel = useMemo(() => {
    if (!configured) return 'Wallet address required';
    if (status === 'connecting') return 'Connecting wallet…';
    if (status === 'paying') return 'Confirm in your wallet…';
    if (status === 'verifying') return 'Verifying on BSC…';
    if (account) return `Send ${amount || '0'} USDC`;
    return 'Connect wallet';
  }, [account, amount, configured, status]);

  async function ensureNetwork(provider: EthereumProvider) {
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chain.chainIdHex }] });
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? Number((error as { code?: number }).code) : 0;
      if (code !== 4902) throw error;
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chain.chainIdHex,
          chainName: chain.label,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: [chain.rpcUrl],
          blockExplorerUrls: [chain.explorerUrl],
        }],
      });
    }
  }

  async function connect() {
    const provider = window.ethereum;
    if (!provider) throw new Error('No compatible wallet was detected. Install MetaMask, Trust Wallet or Coinbase Wallet, or open this page inside your wallet browser.');
    setStatus('connecting');
    const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
    if (!accounts?.[0]) throw new Error('The wallet did not return an account.');
    await ensureNetwork(provider);
    setAccount(accounts[0]);
    setStatus('idle');
    setStatusText('Wallet connected on BNB Smart Chain.');
    return accounts[0];
  }

  async function verify(hash: string) {
    setStatus('verifying');
    for (let attempt = 0; attempt < 15; attempt += 1) {
      const response = await fetch('/api/support/usdc/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ txHash: hash, amount, network, supporterName: name, message }),
      });
      const payload = await response.json() as { verified?: boolean; error?: string };
      if (response.ok && payload.verified) {
        setStatus('success');
        setStatusText(`Thank you. ${amount} USDC was verified on ${chain.label}.`);
        return;
      }
      if (response.status !== 409) throw new Error(payload.error || 'The transfer could not be verified.');
      setStatusText('Transaction submitted. Waiting for BSC confirmation…');
      await new Promise((resolve) => window.setTimeout(resolve, 1800));
    }
    throw new Error('The transaction is still pending. Check the explorer link below before sending another payment.');
  }

  async function copyRecipient() {
    if (!configured) return;
    try {
      await navigator.clipboard.writeText(recipient);
      setStatusText('Recipient wallet address copied.');
    } catch {
      setStatusText('Copy failed. Select the recipient address manually.');
    }
  }

  async function act() {
    try {
      setStatusText('');
      setTxHash('');
      if (!configured) throw new Error('The support wallet is not configured.');
      const units = toUsdcUnits(amount, chain.usdcDecimals);
      const one = 10n ** BigInt(chain.usdcDecimals);
      if (units < one || units > (500n * one)) throw new Error('Coffee support can be between 1 and 500 USDC.');
      const provider = window.ethereum;
      if (!provider) throw new Error('No compatible wallet was detected. Install MetaMask, Trust Wallet or Coinbase Wallet, or open this page inside your wallet browser.');
      const from = account || await connect();
      await ensureNetwork(provider);
      setStatus('paying');
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from,
          to: chain.usdcAddress,
          data: encodeUsdcTransfer(recipient, units),
          value: '0x0',
        }],
      }) as string;
      setTxHash(hash);
      await verify(hash);
    } catch (error) {
      setStatus('error');
      setStatusText(error instanceof Error ? error.message : 'Payment failed. NextWave Crew never has access to your wallet keys.');
    }
  }

  return (
    <section className="coffeeCard" aria-labelledby="coffee-title">
      <div className="coffeeTop">
        <div>
          <span className="microLabel">BEP-20 USDC</span>
          <h2 id="coffee-title">Buy the crew a coffee</h2>
          <p>Send Binance-Peg USDC directly to the NextWave Crew wallet on BNB Smart Chain. The site verifies the transfer on-chain.</p>
        </div>
        <div className="usdcCoin">USDC</div>
      </div>

      <div className="networkWarning">
        <b>BNB Smart Chain only</b>
        <span>Do not send USDC using Ethereum, Base, Solana or another network to this flow.</span>
      </div>

      <div className="presetRow" aria-label="Suggested amounts">
        {PRESETS.map((preset) => <button key={preset} type="button" className={amount === preset ? 'selected' : ''} onClick={() => setAmount(preset)}>${preset}</button>)}
        <label className="customAmount"><span>Custom</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} aria-label="Custom USDC amount"/></label>
      </div>

      <div className="coffeeFields">
        <label><span>Name <small>optional</small></span><input maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name"/></label>
        <label><span>Message <small>optional</small></span><input maxLength={240} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Fair winds and following seas"/></label>
      </div>

      <div className="paymentSummary">
        <div><span>Network</span><b>{chain.label}</b></div>
        <div><span>Asset</span><b>{chain.tokenLabel}</b></div>
        <div><span>Recipient</span><b>{shortAddress(recipient)}</b>{configured && <button type="button" className="miniCopy" onClick={copyRecipient}>Copy</button>}</div>
        <div><span>Connected wallet</span><b>{account ? shortAddress(account) : 'Not connected'}</b></div>
      </div>

      <button className="primaryButton coffeePay" type="button" disabled={!configured || ['connecting','paying','verifying'].includes(status)} onClick={act}>{buttonLabel}</button>
      {!account && configured && <button className="textButton coffeeConnect" type="button" onClick={() => connect().catch((error) => { setStatus('error'); setStatusText(error instanceof Error ? error.message : 'Could not connect wallet.'); })}>Connect wallet first</button>}

      {statusText && <div className={`paymentNotice ${status}`}>{statusText}</div>}
      {txHash && <a className="txLink" href={`${chain.explorerUrl}/tx/${txHash}`} target="_blank" rel="noreferrer">View transaction on BscScan ↗</a>}
      <p className="coffeeFinePrint">Token contract: {chain.usdcAddress}. BSC gas is paid by the sender in BNB. Crypto transfers are irreversible.</p>
    </section>
  );
}
