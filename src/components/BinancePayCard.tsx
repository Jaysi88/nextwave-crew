'use client';

import Image from 'next/image';
import { useState } from 'react';

const BINANCE_PAY_URL = 'https://app.binance.com/uni-qr/2VuuSfAT';
const BINANCE_PAY_QR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXIAAAFyAQAAAADAX2ykAAACcklEQVR4nO2bS26kMBRFz2uQemikLCBLgR30WnsHsJTeAR6WZHR7YBuoqKNU1IQU0vPIuM7gStb7u0x8Zk0/PoWD884777zzzjv/Hm9ltUA0250Nsf42nKjH+YP5XpI0l0MzM6OXBDSS8u5EPc4fzMdioTbUC9XIslpye7Ye57+MX1av3KLx+/U4fyQ/vUoQUv6y4bv1OP9ffHW8QUAEiG2qZzMGsG+BPJt+5x/iJzMz64B+Bog/Rf+nBVhy+nyuHucP4rP97ix0er0ZsBiEm+neep9Pv/MfrFz8ZKulkUagVEphq5nWnPrZ9Dv/wSr3FhIQpFz19nMjetVAnM/8fi/IZ/9sOdZGA+JLEnExoBHTrzmDOkeP88fyxT8TJI1B1T8rsdmvxpBw/3xJvt4b91FXCdhu1ePvVflyg5rXTEs1EgNopJHH3+vyq39ObEacd2Mo8wU8f74sv7faMkRqciSuSXT51e/3kvydf56r1eZyuEZij7/X5e/8c6g7raUvwGbJfr8X5UvXuT7dGABpboqTBuqk8En1O//OqvOj+CLrBUxDmz9z/3nqGmon+gw9zh/Lt/uP2NVduOX+leVJQ+ywfjxDj/PH8jW/qot+bkpDYyt9ATz+XpIv/efy1STBzQSL0WsxiC8JaGq+9Wz6nX+I72uRZANgQ1gfTIbSibbhTD3OH8Sv+VUH/e+yE7FNmrpZNhmUmdIpepw/lt/P93MtVIfAW2Mrl0Yef6/It/86VDHiDibj7pHds+l3/jF+Hf2OLMbUVUvOL2VDest/tR7nj+FrfzKvtVcV9vPfXDN5//mKvPn/u5133nnnnXf+dP4vx4LlEI4VFNsAAAAASUVORK5CYII=';

export default function BinancePayCard() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(BINANCE_PAY_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="binancePayCard" aria-labelledby="binance-pay-title">
      <div className="binancePayBrand">
        <span className="binanceMark">◆</span>
        <span>BINANCE <b>PAY</b></span>
      </div>
      <span className="microLabel">QUICK SUPPORT</span>
      <h2 id="binance-pay-title">Scan with Binance App</h2>
      <p>Send support directly through Binance Pay to <b>DreamFaith</b>. The payment is completed inside Binance.</p>

      <div className="binanceQrWrap">
        <Image src={BINANCE_PAY_QR} alt="Binance Pay QR code for DreamFaith" width={260} height={260} unoptimized />
        <span>DreamFaith</span>
      </div>

      <a className="binanceOpenButton" href={BINANCE_PAY_URL} target="_blank" rel="noreferrer">
        Open in Binance App
      </a>
      <button className="textButton binanceCopy" type="button" onClick={copyLink}>
        {copied ? 'Payment link copied' : 'Copy Binance Pay link'}
      </button>

      <div className="binancePayNote">
        <b>Binance Pay option</b>
        <span>This QR is the Binance Pay code supplied by the NextWave Crew owner. Automatic on-site verification requires Binance merchant/API credentials, so Binance confirms this payment inside its own app.</span>
      </div>
    </section>
  );
}
