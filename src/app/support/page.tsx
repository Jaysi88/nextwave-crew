import Link from 'next/link';
import UsdcCoffeeCard from '@/components/UsdcCoffeeCard';
import BinancePayCard from '@/components/BinancePayCard';
import { normalizeNetwork, USDC_NETWORKS } from '@/lib/usdc';

export const metadata = { title: 'Support NextWave Crew | USDC & Binance Pay', description: 'Support NextWave Crew with verified USDC on BNB Smart Chain or Binance Pay.' };

export default function SupportPage() {
  const network = normalizeNetwork(process.env.NEXT_PUBLIC_USDC_NETWORK);
  const recipient = process.env.NEXT_PUBLIC_USDC_RECIPIENT_ADDRESS || '0xf8766be6d62f80c7e5f37af4a07f4faca0dac9fe';
  const chain = USDC_NETWORKS[network];
  return <main className="supportPage">
    <section className="supportIntro"><span className="eyebrow"><span className="liveDot"/> Support the seafarer community</span><h1>Buy us a coffee.<br/><span>Help build for crew worldwide.</span></h1><p>Support community tools, maritime learning resources, career features and CrewWealth development using BSC USDC or Binance Pay.</p><div className="supportPrinciples"><div><b>Direct to owner</b><span>No NextWave custody wallet</span></div><div><b>BEP-20 USDC</b><span>Verified on {chain.label}</span></div><div><b>Binance Pay</b><span>Scan or open in the Binance app</span></div></div></section>
    <div className="supportPaymentGrid"><UsdcCoffeeCard recipient={recipient} network={network}/><BinancePayCard/></div>
    <section className="paymentSafety"><b>Payment safety</b><p>The BSC option accepts Binance-Peg USDC at the displayed contract and verifies the transfer on-chain. Always confirm the network, token and recipient in your wallet before approving. Binance Pay payments are handled by Binance under its own account and payment terms.</p></section>
    <div className="supportBack"><Link href="/">← Back to NextWave Crew</Link></div>
  </main>;
}
