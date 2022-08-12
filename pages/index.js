import { useEffect, useState, useRef } from 'react';
import { encodeURL, createQR } from '@solana/pay';
import { MERCHANT_WALLET } from "../component/constants";
import { Keypair } from "@solana/web3.js";
import BigNumber from "bignumber.js";

export default function Home() {
  let ref = useRef(null);
  // const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    const url = encodeURL({
      recipient: MERCHANT_WALLET,
      amount: new BigNumber(1),
      reference: new Keypair().publicKey,
      label: 'SolKicks',
      message: 'SolKicks - your order - #001234',
      memo: 'SK#4098',
    });
    console.log(url);
    const qrCode = createQR(url);
    console.log(qrCode);
    console.log(ref.current);
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, [])
  
  return (
    <>
    QR Demo
    <div ref={ref} />
    </>
  )
}
