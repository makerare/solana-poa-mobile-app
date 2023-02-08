import * as solanaWeb3 from "@solana/web3.js";
import {
  PublicKey,
  Transaction,
  TransactionInstruction
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
  decodeData,
  TOKEN_PROGRAM_ID,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID, } from "@solana/spl-token";

import { ENV } from "../constants"

import tweetnacl from "tweetnacl";

import axios from "axios";

import * as metadata from "./metadata"; // see metadata.ts

import { accountFromSeed } from "../utils";

const LAMPORTS_PER_SOL = solanaWeb3.LAMPORTS_PER_SOL;

const SPL_TOKEN = "FyUYPbYiEFjC5LG4oYqdBfiA6PwgC78kbVyWAoYkwMTC";

if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')


const createConnection = async () => {
  if (!(global.rpc)) {
    global.rpc = (await axios.get(ENV.rpc_api_url)).data.rpc_url;
  }
  if (!(global.connection)) {
    global.connection = new solanaWeb3.Connection(global.rpc);
  }
  return global.connection 
};


const isValidAddress = async (publicKey) => {
  console.log('isValidAddress');
  const connection = await createConnection();
  try {
      const _publicKey = publicKeyFromString(publicKey);
      const isValid = await PublicKey.isOnCurve(_publicKey.toBytes());

      if (!isValid) {
        return {valid: false}
      }
      const lamports = await connection.getBalance(_publicKey).catch((err) => {
        return {valid: false};
      });
      const sol = lamports / LAMPORTS_PER_SOL;
      return {valid: true, balance: sol};

    } catch (err) {
      return {valid: false};
    }
};


const getBalance = async (publicKey) => {
  const connection = await createConnection();

  const _publicKey = publicKeyFromString(publicKey);

  const lamports = await connection.getBalance(_publicKey).catch((err) => {
    console.error(`Error: ${err}`);
  });

  const sol = lamports / LAMPORTS_PER_SOL;
  return sol;
};


const getFeesAndBalance = async (from, toAddress, selectedNFT, amount) => {
  const connection = await createConnection();
  const fromPubkey = from.publicKey;

  const lamports = await connection.getBalance(fromPubkey).catch((err) => {
    console.error(`Error: ${err}`);
  });

  const balanceInSol = lamports / LAMPORTS_PER_SOL;

  if (balanceInSol == 0)
    return { empty: true };


  let transaction = new solanaWeb3.Transaction();


  if (toAddress == "" || toAddress == undefined)
    toAddress = "AxN94Wz8aL2gMC1jnaN3RpuXhNZAVeKUFfaKi15GnUwn"; // DUMMY ADDRESS

  let somethingInTransaction = false;

  const destPublicKey = publicKeyFromString(toAddress);

  const minRentSol = await connection.getMinimumBalanceForRentExemption(1, 'confirmed')
                  / LAMPORTS_PER_SOL;

  if (Number(amount) != 0 && amount != undefined) {
    somethingInTransaction = true;
    transaction = transaction.add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: destPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
  }
  if (selectedNFT != "none") {
    somethingInTransaction = true;
    const mintPublicKey = publicKeyFromString(selectedNFT);// Mint is the Mint address found in the NFT metadata

    const deb = Date.now()
    const associatedToken = await getAssociatedTokenAddress(
        mintPublicKey,
        fromPubkey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )

    const toAssociatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        destPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )

    const fromTokenAccount = await getAccount(connection, associatedToken, 'confirmed', TOKEN_PROGRAM_ID)


    const toTokenAccount = await connection.getAccountInfo(toAssociatedTokenAddress);

    if (toTokenAccount === null) {
/*
      const createTokenInstructRep = await getOrCreateAssociatedTokenAccount(
        connection,
        from,
        mintPublicKey,
        destPublicKey);
      console.log(createTokenInstructRep);

      transaction = transaction.add(
          createTokenInstructRep.added
      ); */


      transaction = transaction.add(
          createAssociatedTokenAccountInstruction(
            fromPubkey, toAssociatedTokenAddress, destPublicKey, mintPublicKey, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
          )
      );




      }

    transaction = transaction.add(
      createTransferInstruction(
                              fromTokenAccount.address, // source
                              toAssociatedTokenAddress, // dest
                              fromPubkey,
                              1,
                              [],
                              TOKEN_PROGRAM_ID
                          )
    )


  }
  if (!somethingInTransaction) {
    return { transactionEmpty : true }
  }

  transaction.feePayer = fromPubkey;

  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

  transaction.recentBlockhash = blockhash;

  console.log(blockhash)

  const response = await connection.getFeeForMessage(
    transaction.compileMessage(),
    'confirmed',
  );

  const simulation = await connection.simulateTransaction(
    transaction,
    [from],
    true
  );

  let feeInSol = response.value / LAMPORTS_PER_SOL;

  if (simulation.value.err == "InvalidRentPayingAccount")
    return { invalidRent: true, minAmount: minRentSol }

  if (simulation.value.err) {
    for (const log of simulation.value.logs) {
      if (log.includes('Transfer: insufficient lamports')) {
        const splittedMessage = log.split(' ');

        console.log(log)
        const landportsMin = splittedMessage[splittedMessage.length -1];

        console.log({landportsMin})

        console.log({landportsMincalc: (Number(landportsMin) / LAMPORTS_PER_SOL)})
        feeInSol = Number(landportsMin) / LAMPORTS_PER_SOL - Number(amount);

        console.log({ feeInSol })
      }
    }
  }

  console.log(simulation)

  /*
  const signature = await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [from]
    );
  console.log(feeInSol);
  console.log(signature);*/
  console.log(feeInSol);
  return {balance: balanceInSol, fees: feeInSol, empty: false, transactionEmpty : false };
};



const sendTx = async (from, toAddress, selectedNFT, amount) => {
  console.log('sendTx');
  const connection = await createConnection();

  const fromPubkey = from.publicKey;

  const lamports = await connection.getBalance(fromPubkey).catch((err) => {
    console.error(`Error: ${err}`);
  });

  const balanceInSol = lamports / LAMPORTS_PER_SOL;

  if (balanceInSol == 0)
    return { error: 'Empty wallet, not enough SOL in your wallet.' };


  let transaction = new solanaWeb3.Transaction();


  if (toAddress == "" || toAddress == undefined)
    return { error: "No receiving address found." }

  let somethingInTransaction = false;

  const destPublicKey = publicKeyFromString(toAddress);

  const minRentSol = await connection.getMinimumBalanceForRentExemption(1, 'confirmed')
                     / LAMPORTS_PER_SOL;

  if (Number(amount) != 0 && amount != undefined) {
    somethingInTransaction = true;
    transaction = transaction.add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: fromPubkey,
        toPubkey: destPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
  }
  if (selectedNFT != "none") {
    somethingInTransaction = true;
    const mintPublicKey = publicKeyFromString(selectedNFT);// Mint is the Mint address found in the NFT metadata

    const deb = Date.now()
    const associatedToken = await getAssociatedTokenAddress(
        mintPublicKey,
        fromPubkey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )

    const toAssociatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        destPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )

    const fromTokenAccount = await getAccount(connection, associatedToken, 'confirmed', TOKEN_PROGRAM_ID)


    const toTokenAccount = await connection.getAccountInfo(toAssociatedTokenAddress);

    if (toTokenAccount === null) {
      transaction = transaction.add(
          createAssociatedTokenAccountInstruction(
            fromPubkey, toAssociatedTokenAddress, destPublicKey, mintPublicKey, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
          )
      );
    }
    transaction = transaction.add(
      createTransferInstruction(
                              fromTokenAccount.address, // source
                              toAssociatedTokenAddress, // dest
                              fromPubkey,
                              1,
                              [],
                              TOKEN_PROGRAM_ID
                          )
    )

  }
  if (!somethingInTransaction) {
    return { transactionEmpty : true }
  }

  transaction.feePayer = fromPubkey;

  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

  transaction.recentBlockhash = blockhash;

  const response = await connection.getFeeForMessage(
    transaction.compileMessage(),
    'confirmed',
  );

  try {
    const signature = await solanaWeb3.sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
      );
    return {balance: balanceInSol, empty: false, transactionEmpty : false , signature: signature};
  }
  catch (e) {
    return {error: errorTx}
  }

}


const zeroPad = (num, places) => String(num).padStart(places, '0');


const getTransactionsFromToAccountsLinkedToAddress = async (connection, publicKey) => {
  console.log('getTransactionsFromToAccountsLinkedToAddress');
  const ownedAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    {programId: TOKEN_PROGRAM_ID}
  );

  const token_histories = [];
  for (const nft of ownedAccounts.value){
    token_histories.push(connection.getSignaturesForAddress(nft.pubkey));
  }
  const allResults = await Promise.all(token_histories);
  const transctions = [];
  for (const sevRes of allResults){
    for (const aRes of sevRes) {
      transctions.push(aRes);
    }
  }
  return transctions;
};

const getHistory = async (publicKeyString, options = { limit: 20 }) => {
  console.log('getHistory ' + publicKeyString);

  const publicKey = publicKeyFromString(publicKeyString);
  const connection = await createConnection();

  const simResults = await Promise.all([
      connection.getSignaturesForAddress(
        publicKey,
        options
      ),
      getTransactionsFromToAccountsLinkedToAddress(connection, publicKey)
  ]);

  const history = simResults[0].map((el)=>el.signature);
  const ownedAccounts = simResults[1].map((el)=>el.signature);


  //Array.from(new Set([...arr1, ...arr2]));

  const signatures = Array.from(new Set([...ownedAccounts, ...history,]));


  const parsedHistory =  await connection.getParsedConfirmedTransactions(signatures);


  const concurrentRequests = [];

  const resHistory = [];
  let idInc = 0;

  let uris = {};

  for (const parsedTx of parsedHistory) {
    if(!parsedTx)
      continue
    idInc += 1;
    const deltaSolAccounts = {};
    let amountSigners = 0;
    let txType = 'incoming';

    for (let incr = 0; incr < parsedTx.transaction.message.accountKeys.length; incr++) {
      const pubkey = parsedTx.transaction.message.accountKeys[incr].pubkey;

      let accountSigned = parsedTx.transaction.message.accountKeys[incr].signer
      amountSigners += Number(accountSigned)
      if (accountSigned && pubkey == publicKeyString)
        txType = 'outgoing';

      deltaSolAccounts[pubkey] = parsedTx.meta.postBalances[incr] - parsedTx.meta.preBalances[incr];
    }
    if (amountSigners > 1) {
      txType = 'contract';
    }
    let amount = 0;
    if (publicKeyString in deltaSolAccounts)
      amount = deltaSolAccounts[publicKeyString]/10**9;

    let amountIncoming = true;
    if (amount < 0) {
      amountIncoming = false;
      amount = -amount;
    }

    let transferedTokens = []; // [{incoming: true, amount:  1, mint: "ERm9pquumuMspbab64uDR4XTCxxCPrZqae3BmVny3gi"}]

    let relatedTokens = {};

    for (const preTokenBalance of parsedTx.meta.preTokenBalances) {
      if (preTokenBalance.owner != publicKeyString)
        continue;
      relatedTokens[preTokenBalance.mint] = Number(preTokenBalance.uiTokenAmount.amount)
    }

    for (const postTokenBalance of parsedTx.meta.postTokenBalances) {
      if (postTokenBalance.owner != publicKeyString)
        continue;
      if (!(postTokenBalance.mint in relatedTokens))
        relatedTokens[postTokenBalance.mint] = 0;
      let amountTransfered = Number(postTokenBalance.uiTokenAmount.amount) - relatedTokens[postTokenBalance.mint];
      let tokenIncoming = true;
      if (amountTransfered == 0)
        continue;
      if (amountTransfered < 0) {
        amountTransfered = -amountTransfered;
        tokenIncoming = false;
      }
      if (!(postTokenBalance.mint in uris)) {
        let tokenAddress = new PublicKey(
          postTokenBalance.mint // TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
        );
        const m = await metadata.getMetadataAccount(tokenAddress);

        // get the account info for that account
        const accInfo = await connection.getAccountInfo(new PublicKey(m));

        // finally, decode metadata
        const decodedMetadata = metadata.decodeMetadata(accInfo!.data);
        uris[postTokenBalance.mint] = concurrentRequests.length;

        concurrentRequests.push(axios.get(decodedMetadata.data.uri));
      }

      transferedTokens.push( { incoming: tokenIncoming,
                               amount: amountTransfered,
                               mint: postTokenBalance.mint } )
    }

    const parts = String(amount).split('.');
    const isInt = parts.length == 1;

    var timestemp = new Date( parsedTx.blockTime * 1000 );
    var formatted = timestemp.toUTCString().split(' ');
    resHistory.push(
      {
          id: idInc,
          type: txType,
          amountIncoming: amountIncoming,
          assets: transferedTokens,
          timestamp: timestemp,
          time: formatted[4],
          date: formatted[3] + '-' + zeroPad(timestemp.getUTCMonth() + 1, 2) + '-' + formatted[1],
          amountInt: parts[0],
          amountFloat: (isInt ? '' : parts[1]),
          fee: parsedTx.meta.fee,
          txId: parsedTx.transaction.signatures[0]
      },
    )
  }
  resHistory.sort(function(b, a) {
    var keyA = a.timestamp,
      keyB = b.timestamp;
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  if (!concurrentRequests.length)
    return resHistory;

  const request_results = (await Promise.all(concurrentRequests));
  const request_data = [];

  for (const request_result of request_results) {
    const tokenData = {};
    if (request_result.data.attributes != undefined)
    {
      for (const attrib of request_result.data.attributes) {
        tokenData[attrib.trait_type] = attrib.value;
      }
    }
    request_result.data.attributes = tokenData;
    request_data.push(request_result.data);
  }
  for (const resTx of resHistory) {
    resTx.idInc = 1 + resHistory.length - resTx.idInc
    for (const asset of resTx.assets) {
      asset.data = request_data[uris[asset.mint]];
    }
  }

  return resHistory;
};




const getSolanaPrice = async () => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`,
    {
      method: "GET",
    }
  );

  const data = await response.json();
  return data.solana.usd;
};

const requestAirDrop = async (publicKeyString: string) => {
  const connection = await createConnection();

  const airdropSignature = await connection.requestAirdrop(
    publicKeyFromString(publicKeyString),
    LAMPORTS_PER_SOL
  );

  const signature = await connection.confirmTransaction(airdropSignature);
  return signature;
};

const publicKeyFromString = (publicKeyString: string) => {
  return new solanaWeb3.PublicKey(publicKeyString);
};

const transaction = async (from, to, amount) => {
  console.log("Executing transaction...");
  console.log(amount);

  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: publicKeyFromString(from.keyPair.publicKey.toString()),
      toPubkey: publicKeyFromString(to),
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  // Sign transaction, broadcast, and confirm
  const connection = await createConnection();
  const signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from.keyPair]
  );
  console.log("SIGNATURE", signature);
};

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" // TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
);

async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
    console.log('findAssociatedTokenAddress');
  return (
    await solanaWeb3.PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0];
}

const getTokenBalance = async (publicKey: string, splToken: string) => {
  const connection = await createConnection();
  const account = await findAssociatedTokenAddress(
    publicKeyFromString(publicKey),
    publicKeyFromString(splToken)
  );

  try {
    const balance = await connection.getTokenAccountBalance(
      publicKeyFromString(account.toString())
    );
    return balance.value.amount / LAMPORTS_PER_SOL;
  } catch (e) {
    return 0;
  }
};


const checkBalanceofToken = async (connection, nft) =>{
  const balanceToken = await connection.getTokenAccountBalance(
    {toBase58: () => nft.pubkey}
  );
  return (balanceToken.value.amount == 1) ? nft : null ;
}


const getTokenDataFromMint = async (connection, mint, pubkey) =>{
  console.log('getTokenDataFromMint')
  let tokenAddress = new PublicKey(
    mint // TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
  );

  const m = await metadata.getMetadataAccount(tokenAddress);



  // get the account info for that account
  const accInfo = await connection.getAccountInfo(new PublicKey(m));

  // finally, decode metadata
  const decodedMetadata = metadata.decodeMetadata(accInfo!.data);

  const request_result = await axios.get(decodedMetadata.data.uri);

  const tokenData = {};

  request_result.data.properties.files.forEach(element => {
    if (element.type === "video/mp4")
      request_result.data.video = element.uri;
  });
  if (request_result.data.attributes != undefined)
    for (const attrib of request_result.data.attributes) {
      tokenData[attrib.trait_type] = attrib.value;
    }

  request_result.data.attributes = tokenData;
  request_result.data.mint = mint;
  request_result.data.pubkey = pubkey;

  return request_result.data
}




const getAllTokens = async (publicKeyString: string) =>{
  console.log('getAllTokens')
  const publicKey = publicKeyFromString(publicKeyString);
  const connection = await createConnection();
  const balance = await connection.getParsedTokenAccountsByOwner(
    publicKey, //'7XJuUiC4NkMKwi6jdAFtShB5AmMrWZ1AwVEHwKEVhnrh'
    {programId: TOKEN_PROGRAM_ID}
  );

  const resultsBalanceChecks = await Promise.all(
                                      balance.value.map(
                                        (nft) => checkBalanceofToken(connection,
                                                                     nft)
                                      )
                               );
  const concurrentRequests = [];
  for (const nft of resultsBalanceChecks){
    if (nft === null)
      continue;
    concurrentRequests.push(getTokenDataFromMint(connection,
                                                 nft.account.data.parsed.info.mint,
                                                 nft.pubkey))
  }
  const request_results = (await Promise.all(concurrentRequests));

  request_results.sort(function(a, b) {
    var keyA = a.name,
      keyB = b.name;
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  return request_results;
}

const unknown_error = "Unknown error.";

export const breed_nft = async (pubKeyString) => {
  try {
    const request_result = await axios.post(
      ENV.breed_api_url,
      { pubkey: pubKeyString },
      {timeout: 360000, headers:{"Content-Type" : "application/json"}},
    );
    return request_result;
  } catch (e) {
    throw (
      (e?.response?.data?.error !== undefined) ? 
      e?.response?.data?.error : 
      unknown_error
    )
  }
}

const mint_nft_api = async (collection_name, mint_id, pubKeyString) => {
  try {
    const request_result = await axios.post(
      ENV.mint_api_url,
      {
        collection_name: collection_name,
        mint_id: mint_id,
        pubkey: pubKeyString,
      },
      {timeout: 360000, headers:{"Content-Type" : "application/json"}}
    );
    return request_result;
  } catch (e) {
    throw (
      (e?.response?.data?.error !== undefined) ? 
      e?.response?.data?.error : 
      unknown_error
    )
  }
}


const encodedURIComponentToUint8Array = function(s) {
  if (typeof s !== 'string') throw new TypeError('expected string');
  var i, d = unescape(s), b = new Uint8Array(d.length);
  for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
  return b;
};


const uint8ArrayToEncodedURIComponent = function(arr) {
  var i, s = [];
  for (i = 0; i < arr.length; i++) s.push(String.fromCharCode(arr[i]));
  return (escape(s.join('')));
};


export const encodedURIComponentToInt8Array = function(s) {
  if (typeof s !== 'string') throw new TypeError('expected string');
  var i, d = unescape((s)), b = new Uint8Array(d.length);
  for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i);
  return b;
};


export const sign_and_submit_data_api = async (sign_data, keyPair) => {
  const encoded_sign_data = encodeURIComponent(sign_data);
  
  const message = encodedURIComponentToUint8Array(encoded_sign_data);
  
  const signature = tweetnacl.sign.detached(message, keyPair.secretKey);
  const signature_str = uint8ArrayToEncodedURIComponent(signature);

  console.log(tweetnacl.sign.detached.verify(
    encodedURIComponentToInt8Array(encoded_sign_data),
    encodedURIComponentToInt8Array(signature_str),
    keyPair.publicKey.toBytes()
    ));
  
  try {
    console.log(ENV.sign_api_url)
    console.log(      {
      message: encoded_sign_data,
      signature: signature_str,
      pubkey: keyPair.publicKey.toString()
    })
    const request_result = await axios.post(
      ENV.sign_api_url,
      {
        message: encoded_sign_data,
        signature: signature_str,
        pubkey: keyPair.publicKey.toString()
      },
      {timeout: 360000, headers:{"Content-Type" : "application/json"}}
    );
    return request_result;
  } catch (e) {
    throw (
      (e?.response?.data?.error !== undefined) ? 
      e?.response?.data?.error : 
      unknown_error
    )
  }
}



export {
  LAMPORTS_PER_SOL,
  SPL_TOKEN,
  createConnection,
  getBalance,
  getHistory,
  getSolanaPrice,
  publicKeyFromString,
  requestAirDrop,
  transaction,
  getTokenBalance,
  getAllTokens,
  getFeesAndBalance,
  isValidAddress,
  sendTx,
  mint_nft_api
};
