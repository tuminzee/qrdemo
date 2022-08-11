import { createTransfer } from '@solana/pay';
import { PublicKey, Transaction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';


const get = async (request, response) => {
    const label = request.query.label;
    if (!label) throw new Error('missing label');
    if (typeof label !== 'string') throw new Error('invalid label');

    const icon = `https://${request.headers.host}/solana-pay-logo.svg`;

    response.status(200).send({
        label,
        icon,
    });
};


// const post = async (request, response) => {
//     /*
//     Transfer request params provided in the URL by the app client. In practice, these should be generated on the server,
//     persisted along with an unpredictable opaque ID representing the payment, and the ID be passed to the app client,
//     which will include the ID in the transaction request URL. This prevents tampering with the transaction request.
//     */
//     const recipientField = request.query.recipient;
//     if (!recipientField) throw new Error('missing recipient');
//     if (typeof recipientField !== 'string') throw new Error('invalid recipient');
//     const recipient = new PublicKey(recipientField);

//     const amountField = request.query.amount;
//     if (!amountField) throw new Error('missing amount');
//     if (typeof amountField !== 'string') throw new Error('invalid amount');
//     const amount = new BigNumber(amountField);

//     const splTokenField = request.query['spl-token'];
//     if (splTokenField && typeof splTokenField !== 'string') throw new Error('invalid spl-token');
//     const splToken = splTokenField ? new PublicKey(splTokenField) : undefined;

//     const referenceField = request.query.reference;
//     if (!referenceField) throw new Error('missing reference');
//     if (typeof referenceField !== 'string') throw new Error('invalid reference');
//     const reference = new PublicKey(referenceField);

//     const memoParam = request.query.memo;
//     if (memoParam && typeof memoParam !== 'string') throw new Error('invalid memo');
//     const memo = memoParam || undefined;

//     const messageParam = request.query.message;
//     if (messageParam && typeof messageParam !== 'string') throw new Error('invalid message');
//     const message = messageParam || undefined;

//     // Account provided in the transaction request body by the wallet.
//     const accountField = request.body?.account;
//     if (!accountField) throw new Error('missing account');
//     if (typeof accountField !== 'string') throw new Error('invalid account');
//     const account = new PublicKey(accountField);

//     // Compose a simple transfer transaction to return. In practice, this can be any transaction, and may be signed.
//     let transaction = await createTransfer(connection, account, {
//         recipient,
//         amount,
//         splToken,
//         reference,
//         memo,
//     });

//     // Serialize and deserialize the transaction. This ensures consistent ordering of the account keys for signing.
//     transaction = Transaction.from(
//         transaction.serialize({
//             verifySignatures: false,
//             requireAllSignatures: false,
//         })
//     );

//     // Serialize and return the unsigned transaction.
//     const serialized = transaction.serialize({
//         verifySignatures: false,
//         requireAllSignatures: false,
//     });
//     const base64 = serialized.toString('base64');

//     response.status(200).send({ transaction: base64, message });
// };

const post = async (request, response) => {
    const accountField = request.body?.account;
    if (!accountField) throw new Error('missing account');

    const sender = new PublicKey(accountField);

    // create spl transfer instruction
    const splTransferIx = await createSplTransferIx(sender, connection);

    // create the transaction
    const transaction = new Transaction();

    // add the instruction to the transaction
    transaction.add(splTransferIx);

    // Serialize and return the unsigned transaction.
    const serializedTransaction = transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
    });

    const base64Transaction = serializedTransaction.toString('base64');
    const message = 'Thank you for your purchase of ExiledApe #518';

    response.status(200).send({ transaction: base64Transaction, message });
};

async function createSplTransferIx(sender, connection) {
    const senderInfo = await connection.getAccountInfo(sender);
    if (!senderInfo) throw new Error('sender not found');

    // Get the sender's ATA and check that the account exists and can send tokens
    const senderATA = await getAssociatedTokenAddress(splToken, sender);
    const senderAccount = await getAccount(connection, senderATA);
    if (!senderAccount.isInitialized) throw new Error('sender not initialized');
    if (senderAccount.isFrozen) throw new Error('sender frozen');

    // Get the merchant's ATA and check that the account exists and can receive tokens
    const merchantATA = await getAssociatedTokenAddress(splToken, MERCHANT_WALLET);
    const merchantAccount = await getAccount(connection, merchantATA);
    if (!merchantAccount.isInitialized) throw new Error('merchant not initialized');
    if (merchantAccount.isFrozen) throw new Error('merchant frozen');

    // Check that the token provided is an initialized mint
    const mint = await getMint(connection, splToken);
    if (!mint.isInitialized) throw new Error('mint not initialized');

    // You should always calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    let amount = calculateCheckoutAmount();
    amount = amount.times(TEN.pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);

    // Check that the sender has enough tokens
    const tokens = BigInt(String(amount));
    if (tokens > senderAccount.amount) throw new Error('insufficient funds');

    // Create an instruction to transfer SPL tokens, asserting the mint and decimals match
    const splTransferIx = createTransferCheckedInstruction(
        senderATA,
        splToken,
        merchantATA,
        sender,
        tokens,
        mint.decimals
    );

    // Create a reference that is unique to each checkout session
    const references = [new Keypair().publicKey];

    // add references to the instruction
    for (const pubkey of references) {
        splTransferIx.keys.push({ pubkey, isWritable: false, isSigner: false });
    }

    return splTransferIx;
}

const index = async (request, response) => {
    // await cors(request, response);
    // await rateLimit(request, response);

    if (request.method === 'GET') return get(request, response);
    if (request.method === 'POST') return post(request, response);

    throw new Error(`Unexpected method ${request.method}`);
};

export default index;
