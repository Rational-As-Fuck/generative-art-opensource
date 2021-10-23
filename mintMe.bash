#!/bin/bash
# generate the NFT and metadata to the output folder
# call this as follows:
# ./mintMe.bash <number of NFT editions> <how much it costs to mint on Candy Machine> 
# example:
# ./mintMe.bash 10 1
# will create and mint 10 NFTs with a minting cost of 1 SOL
NOW=$(date +"%Y%m%d_%H%M%S")
LOGFILE=$PWD/log/$NOW.log
#CM_HOME=metaplex/js/packages/cli/build
CM_HOME=cm/buildYES
echo "Log will be at $LOGFILE"
echo "#########################################################" >> $LOGFILE
echo "###########  RAF NFT GENERATOR ##########################" >> $LOGFILE
echo "#########################################################" >> $LOGFILE
echo "########### Runtime: $(date +'%c') ####" >> $LOGFILE
echo "#########################################################" >> $LOGFILE

if [ "$1" == "-h" ]; then
  echo "Usage: `basename $0` [number of editions to create] [amount to charge to mint]";
  echo "Example: `basename $0` 100 .666";
  echo "         will mint 100 editions and set up candymachine to sell at .666 SOL from the current date";
  exit 0
fi
echo "<ctrl-c> any time to quit the generator"
read -p "Which environment are you running in? [devnet/mainnet-beta]    " env

if [ $env == 'mainnet-beta' ]; then
  echo "Ensure your wallet is present in ../walletbackups and has SOL"
  read -p "Do you want to continue?    [Y/n]" CONTINUE_WITH_PROD
  if [ $CONTINUE_WITH_PROD != 'Y' ]; then
    echo "OK.  Stopping now"
    exit 0
  fi
fi

if [ $env != 'mainnet-beta' ] && [ $env != 'devnet' ]; then
  echo "You must use either 'mainnet-beta' or 'devnet' for the environment.  Try again."
  exit 0
fi

echo "Running this job against $env" >> $LOGFILE

# create a new wallet
read -p "Do you need a new wallet? [Y/n]   " NEW_WALLET
if [ $NEW_WALLET == 'Y' ]
then
  echo "Creating a new wallet." >> $LOGFILE
  read -p "DID YOU BACKUP YOUR OLD WALLET?  If not, and you need to, do it now."
  read -p "What name do you want the wallet to have?   " NEW_WALLET_NAME
  echo "Storing the new wallet as ../walletbackups/$NEW_WALLET_NAME" >> $LOGFILE
  solana-keygen new --outfile "../walletbackups/$NEW_WALLET_NAME" --force >> $LOGFILE
  read -p "Wallet $NEW_WALLET_NAME created.  How much SOL do you need (be conservative!)  " ADTOTAL
  echo "Airdropping $ADTOTAL SOL" 
  ADNUM=0
  while [ "$ADNUM" -lt "$ADTOTAL" ]
  do
      currItem=`expr $ADNUM + 1`
      echo "Airdropping # $currItem"
      solana airdrop 1 -u $env --keypair ../walletbackups/$NEW_WALLET_NAME 
      ADNUM=$currItem
  done
  echo "Currnet solana balance is: " >> $LOGFILE
  solana balance -k ~/walletbackups/$NEW_WALLET_NAME >> $LOGFILE
else
  NEW_WALLET_NAME=MINTER.json
  echo "Using current wallet called '../walletbackups/$NEW_WALLET_NAME'" >> $LOGFILE
fi
WALLET_NAME=$NEW_WALLET_NAME 
PUBLIC_KEY=`solana address -k ../walletbackups/$WALLET_NAME`
echo "Public Key for the generating wallet is $PUBLIC_KEY" >> $LOGFILE

read -p "Go set up Phoenix or Sollet or Solflare with the new wallet.  Create a new wallet (with this passphrase AND THEN import the private key to a new account.  Press any key to continue..."
echo "Creating the output directory if it doesn't exist"
OUTPUT_DIR="./output"

echo "Creating the masterDNA.json file if it doesn't exist"
if [ ! -f "./input/masterDNA.json" ]
then 
touch ./input/masterDNA.json
fi

read -p "Would you like to clear out the output directory? [Y/n]   " CLEAR_OUTPUT_DIR
if [ $CLEAR_OUTPUT_DIR == 'Y' ]
then
  rm -Rf output
  echo "Output directory is cleared out" >> $LOGFILE
fi

echo "The current output directory is $OUTPUT_DIR"

if [ ! -d "$OUTPUT_DIR" ]; then
  mkdir $OUTPUT_DIR
fi

read -p "Your layers should be prepared at this time.  Are you ready to generate $1 NFTs? [Y/n]   " READY_TO_GENERATE
if [ $READY_TO_GENERATE == 'Y' ]
then
  echo "generating $1 NFTs"
  node index.js $1 $PUBLIC_KEY >> $LOGFILE
else
  echo "OK - quitting now.  Please make sure your layers are ready to go for next time."
fi

read -p "Should we destroy the last .cache directory?  THIS WILL DESTROY THE LAST RUN.  [YES/n]   " DESTROY_CACHE
if [ $DESTROY_CACHE == 'YES' ]
then 
  echo "Destroying the remnants of the last run" >> $LOGFILE
  rm -Rf .cache
  echo "Uploading NFTs to Arweave" >> $LOGFILE
  npx ts-node $CM_HOME/candy-machine-cli.js upload ./output --env $env --keypair ../walletbackups/$WALLET_NAME >> $LOGFILE
fi
npx ts-node $CM_HOME/candy-machine-cli.js verify --env devnet --keypair ../walletbackups/$WALLET_NAME >> $LOGFILE
read -p "Ready to create the candy machine with a minting price of $2? [YES/n]   " CREATE_CANDY_MACHINE
if [ $CREATE_CANDY_MACHINE == 'YES' ]
then
  npx ts-node $CM_HOME/candy-machine-cli.js create_candy_machine --env $env --keypair ../walletbackups/$WALLET_NAME -p $2 >> $LOGFILE
  
  npx ts-node $CM_HOME/candy-machine-cli.js update_candy_machine --env $env --keypair ../walletbackups/$WALLET_NAME -date "21 SEPT 2021 00:12:00 GMT" >> $LOGFILE 
  read -p "Are you ready to begin minting?  This minting will end up in the creator wallet, and you will need to sell them manually. [YES/N]   " BEGIN_SELF_MINTING
  if [ $BEGIN_SELF_MINTING == 'YES' ]
  then
    echo "Beginning self minting process" >> $LOGFILE
    read -p "How many would you like to mint?   " NUMBER_TO_MINT
    echo "MINTING $NUMBER_TO_MINT" >> $LOGFILE
    NUM=0
    while [ "$NUM" -lt "$NUMBER_TO_MINT" ]
    do
      currItem=`expr $NUM + 1`
      echo "Minting item $currItem" >> $LOGFILE
      npx ts-node $CM_HOME/candy-machine-cli.js mint_one_token --keypair ../walletbackups/$WALLET_NAME --env devnet >> $LOGFILE
      NUM=$currItem
    done
    echo "Your NFTs are ready!"
    echo "Job Complete!" >> $LOGFILE
    exit 0
  else
    "Make sure you keep the .cache folder.  You will need this to mint the NFTs" >> $LOGFILE
    exit 0
  fi  
else
  echo "OK, ending the generator now" >> $LOGFILE
  exit 0
fi 