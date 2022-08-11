// import { LAMPORTS_PER_SOL } from '@solana/web3.js';
// import BigNumber from 'bignumber.js';

// import { encodeURL } from "../src/encodeURL";
// import { createQR } from "../src/createQR";

import { encodeURL, createQR } from '@solana/pay';

import { MERCHANT_WALLET } from "../constants";
// import { simulateCheckout } from './simulateCheckout';
// import { simulateWalletInteraction } from './simulateWalletInteraction';
import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import kp from "./keypair.json";

/**
 * Simulate a checkout experience
 *
 * Recommendation:
 * `amount` and `reference` should be created in a trusted environment (server).
 * The `reference` should be unique to a single customer session,
 * and will be used to find and validate the payment in the future.
 *
 * Read our [getting started guide](#getting-started-guide) for more information on what these parameters mean.
 */
export async function simulateCheckout() {
  const arr = Object.values(kp._keypair.secretKey);
  const secret = new Uint8Array(arr);
  const baseAccount = Keypair.fromSecretKey(secret).publicKey;

  return {
    label: "Jungle Cats store",
    message: "Jungle Cats store - your order - #001234",
    memo: "JC#4098",
    amount: new BigNumber(1),
    reference: baseAccount,
  };
}

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(cluster = "devnet") {
  const endpoint = clusterApiUrl(cluster);
  const connection = new Connection(endpoint, "confirmed");
  const version = await connection.getVersion();
  // console.log('Connection to cluster established:', endpoint, version);

  return connection;
}

async function main(request, response) {
  console.log("Let's simulate a Solana Pay flow ... \n");
  let paymentStatus;

  console.log("1. ✅ Establish connection to the cluster");
  const connection = await establishConnection();
  const version = await connection.getVersion();

  /**
   * Simulate a checkout experience
   *
   * Recommendation:
   * `amount` and `reference` should be created in a trusted environment (server).
   * The `reference` should be unique to a single customer session,
   * and will be used to find and validate the payment in the future.
   *
   * Read our [getting started guide](#getting-started) for more information on the parameters.
   */
  console.log("\n2. 🛍 Simulate a customer checkout \n");
  const { label, message, memo, amount, reference } = await simulateCheckout();

  // return response.status(200).send({
  //     label, message, memo, amount, reference
  // });

  console.log("3. 💰 Create a payment request link \n");
  // const url = encodeURL({ recipient, amount, reference, label, message, memo });
  const url = encodeURL({
    recipient: MERCHANT_WALLET,
    amount,
    reference,
    label,
    message,
    memo,
  });
  console.log("🚀 ~ file: main.js ~ line 86 ~ main ~ url", url)

  // encode URL in QR code
  // const qrCode = createQR(url);
  return response.status(200).send(url);
}

const index = async (request, response) => {
  // await cors(request, response);
  // await rateLimit(request, response);

  if (request.method === "GET") return main(request, response);
  // if (request.method === 'POST') return post(request, response);

  throw new Error(`Unexpected method ${request.method}`);
};

export default index;
