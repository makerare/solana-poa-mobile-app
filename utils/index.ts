/* eslint-disable no-case-declarations */
import * as solanaWeb3 from "@solana/web3.js";
import { generateSecureRandom } from 'react-native-securerandom';
import { ethers } from "ethers";

import * as ed25519 from "ed25519-hd-key";
import nacl from "tweetnacl";

import { ENV } from "../constants"

global.Buffer = global.Buffer || require('safe-buffer').Buffer;

export const DERIVATION_PATH = {
  bip44Change: "bip44Change",
};


const isValidWord = (word) => {
  return (ethers.wordlists.en.getWordIndex(word) > -1)
}

const isValidPhrase = (phrase) => {
  return ethers.utils.isValidMnemonic(phrase);
}

const generateMnemonic = async () => {
  const randomBytes = await generateSecureRandom(ENV.seed_length * 4/3);

  //const randomBytes = nanoid(32);
  const mnemonic = ethers.utils.entropyToMnemonic(randomBytes);

  return mnemonic;
};

const mnemonicToSeed = async (mnemonic: string) => {
  const bip39 = await import("bip39");
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed).toString("hex");
};

const accountFromSeed = (
  seed: string,
  walletIndex: number,
  derivationPath: string,
  accountIndex: 0
) => {
  const derivedSeed = deriveSeed(
    seed,
    walletIndex,
    derivationPath,
    accountIndex
  );
  const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);

  const acc = new solanaWeb3.Keypair(keyPair);
  return acc;
};

const maskedAddress = (address: string) => {
  if (!address) return;
  return `${address.slice(0, 14)}...${address.slice(address.length - 14)}`;
};

const deriveSeed = (
  seed: string,
  walletIndex: number,
  derivationPath: string,
  accountIndex: number
): Buffer | undefined => {
  const path44Change = `m/44'/501'/${walletIndex}'/0'`;
  return ed25519.derivePath(path44Change, Buffer.from(seed, "hex")).key;

};

export {
  generateMnemonic,
  mnemonicToSeed,
  accountFromSeed,
  maskedAddress,
  deriveSeed,
  isValidPhrase,
  isValidWord
};
