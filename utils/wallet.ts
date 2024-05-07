import { HDNodeWallet, Wallet } from "ethers";
import { chainConfigs } from "../config/blockchainConfigs";
import Cryptr from "cryptr";
import { config } from "../config/config";
import { CryptoWallet } from "../models/CryptoWallet";

export const createCryptoWallet = async (ownerID: string) => {
  try {
    const _mnemonic = Wallet.createRandom().mnemonic;

    const wallet = HDNodeWallet.fromMnemonic(_mnemonic!);

    //encrypt and store private key

    const cryptr = new Cryptr(config.JWT_SECRET);

    const private_key = cryptr.encrypt(wallet.privateKey);

    const public_key = wallet.publicKey;

    const wallet_address = wallet.address;

    let mnemonic;

    if (wallet.mnemonic) mnemonic = cryptr.encrypt(wallet.mnemonic.phrase);

    const cryptoWallet = await CryptoWallet.create({
      private_key,
      public_key,
      ownerID,
      mnemonic,
      wallet_address,
    });

    console.log("created user wallet", cryptoWallet, "wallet", wallet);

    return cryptoWallet;
  } catch (err) {
    console.log(err);
  }
};
