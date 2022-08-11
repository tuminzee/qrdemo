import { SOLANA_PROTOCOL } from './constants';



function encodeTransactionRequestURL({ link, label, message }) {
    // Remove trailing slashes
    const pathname = link.search
        ? encodeURIComponent(String(link).replace(/\/\?/, '?'))
        : String(link).replace(/\/$/, '');
    const url = new URL(SOLANA_PROTOCOL + pathname);

    if (label) {
        url.searchParams.append('label', label);
    }

    if (message) {
        url.searchParams.append('message', message);
    }

    return url;
}

function encodeTransferRequestURL({
    recipient,
    amount,
    splToken,
    reference,
    label,
    message,
    memo,
}) {
    const pathname = recipient.toBase58();
    const url = new URL(SOLANA_PROTOCOL + pathname);

    if (amount) {
        url.searchParams.append('amount', amount.toFixed(amount.decimalPlaces()));
    }

    if (splToken) {
        url.searchParams.append('spl-token', splToken.toBase58());
    }

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            url.searchParams.append('reference', pubkey.toBase58());
        }
    }

    if (label) {
        url.searchParams.append('label', label);
    }

    if (message) {
        url.searchParams.append('message', message);
    }

    if (memo) {
        url.searchParams.append('memo', memo);
    }

    return url;
}


export function encodeURL(fields) {
    return 'link' in fields ? encodeTransactionRequestURL(fields) : encodeTransferRequestURL(fields);
}