console.clear();
require("dotenv").config();

// Goal: Create an NFT using Hedera Token Service with all token keys set. 
// Note that the treasury account ID is also set, who needs to sign the transaction as well

const {
  AccountId,
  PrivateKey,
  Client,
  TokenCreateTransaction,
  TokenInfoQuery,
  TokenType,
  Hbar,
  TokenSupplyType,
  AccountCreateTransaction
} = require("@hashgraph/sdk");

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

const adminKey = PrivateKey.generateED25519();
const randomKey = PrivateKey.generateED25519();
const treasuryKey = PrivateKey.generateED25519();

async function main() {
  // Create accounts
  console.log(`- Creating accounts...`);
  const [adminAccStatus, adminId] = await accountCreatorFcn(adminKey, 5);
  console.log(`- Created admin account ${adminId} that has a balance of 5ℏ`);

  const [randomAccStatus, randomId] = await accountCreatorFcn(randomKey, 5);
  console.log(`- Created random account ${randomId} that has a balance of 5ℏ`);
  
  const [treasuryAccStatus, treasuryId] = await accountCreatorFcn(treasuryKey, 5);
  console.log(`- Created random account ${treasuryId} that has a balance of 5ℏ`);

  console.log(treasuryKey.publicKey)

  // Create NFT
  console.log(`\n- Creating NFT (with all token keys set)`);
  let nftCreate = await new TokenCreateTransaction()
    .setTokenName("Fall Collection")
    .setTokenSymbol("LEAF")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId) // needs to sign
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(5)
    // No keys throws error: TOKEN_HAS_NO_SUPPLY_KEY
    .setSupplyKey(randomKey) // REQUIRED
    .freezeWith(client);

  let nftCreateTxSign = await (await nftCreate.sign(adminKey)).sign(treasuryKey);
  let nftCreateSubmit = await nftCreateTxSign.execute(client);
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);
  let tokenId = nftCreateRx.tokenId;
  console.log(`- Created NFT with Token ID: ${tokenId}`);

  let tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  console.log(`- Current NFT supply: ${tokenInfo.totalSupply}`);

  client.close();


  // ACCOUNT CREATOR FUNCTION ==========================================
  async function accountCreatorFcn(pvKey, iBal) {
    const response = await new AccountCreateTransaction()
      .setInitialBalance(new Hbar(iBal))
      .setKey(pvKey.publicKey)
      .execute(client);
    const receipt = await response.getReceipt(client);
    return [receipt.status, receipt.accountId];
  }
}

main();
