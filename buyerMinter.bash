#!/bin/bash
# generate the NFT and metadata to the output folder
# call this as follows:
# ./Buyerminter.bash <number of NFT editions to mint> 
# example:
# ./buyerMinter.bash 10
# will create and mint 10 NFTs with a minting cost of 1 SOL
if [ "$1" == "-h" ]; then
  echo "Usage: `basename $0` [number of editions to create]";
  echo "Example: `basename $0` 100";
  echo "         will mint 100 editions for this person's wallet";
  exit 0
fi
echo "<ctrl-c> any time to quit the generator"

# create a new wallet
read -p "Do you need a new wallet? [Y/n]   " NEW_WALLET
if [ $NEW_WALLET == 'Y' ]
then
  read -p "DID YOU BACKUP YOUR OLD WALLET?  If not, and you need to, do it now."
  read -p "What name do you want the wallet to have?   " NEW_WALLET_NAME
  solana-keygen new --outfile "../walletbackups/$NEW_WALLET_NAME" --force
  echo "Wallet $NEW_WALLET_NAME created.  Airdropping 10 SOL to it"
  solana airdrop 10 -u devnet -k ../walletbackups/$NEW_WALLET_NAME
else
  NEW_WALLET_NAME=BUYER.json
fi
WALLET_NAME=$NEW_WALLET_NAME 
PUBLIC_KEY=`solana address -k ../walletbackups/$WALLET_NAME`
echo "Public Key for the buying wallet is $PUBLIC_KEY"

read -p "Go set up Phoenix or Sollet or Solflare with the new wallet.  Create a new wallet (with this passphrase AND THEN import the private key to a new account.  Press any key to continue..."
read -p "Are you ready to begin minting?  This minting will end up in the new buyer wallet. [YES/N]   " BEGIN_SELF_MINTING

if [ $BEGIN_SELF_MINTING == 'YES' ]
then
  NUMBER_TO_MINT=$1
  NUM=0
  while [ "$NUM" -lt "$NUMBER_TO_MINT" ]
  do
    currItem=`expr $NUM + 1`
    echo "Minting item $currItem"
    metaplex mint_one_token --keypair ../walletbackups/$WALLET_NAME --env devnet
    NUM=$currItem
  done
  echo "Your NFTs are ready!"
  exit 0
else
  "Make sure you keep the .cache folder.  You will need this to mint the NFTs"
  exit 0
fi  