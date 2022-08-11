
import { QRCode } from '../component/QRCode';
import { useEffect, useState, useRef } from 'react';
import { encodeURL, createQR } from '@solana/pay';
import { MERCHANT_WALLET } from "./constants";
import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";

// async function establishConnection(cluster = "devnet") {
//   const endpoint = clusterApiUrl(cluster);
//   const connection = new Connection(endpoint, "confirmed");
//   const version = await connection.getVersion();
//   return connection;
// }

export default function Home() {
  let ref = useRef(null);
  const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    const url = encodeURL({
      recipient: MERCHANT_WALLET,
      amount: new BigNumber(1),
      reference: new Keypair().publicKey,
      label: 'SolKicks',
      message: 'SolKicks - your order - #001234',
      memo: 'SK#4098',
    });
    console.log("🚀 ~ file: main.js ~ line 86 ~ main ~ url", url);
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
    <div ref={ref}>
    </div>
    </>
  )
}
