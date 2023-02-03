console.clear();
require("dotenv").config();

const {
  AccountId,
  PrivateKey,
  Client,
  TokenCreateTransaction,
  TokenUpdateTransaction,
  TokenType,
  Hbar,
  TokenSupplyType,
  AccountCreateTransaction,
  KeyList
} = require("@hashgraph/sdk");

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

const adminKey = PrivateKey.generateED25519();
const randomKey = PrivateKey.generateED25519();
const treasuryKey = PrivateKey.generateED25519();
const newSupplyKey = PrivateKey.generateED25519();

async function main() {
  // Create accounts
  console.log(`- Creating accounts...`);
  const [adminAccStatus, adminId] = await accountCreatorFcn(adminKey, 3);
  console.log(`- Created admin account ${adminId} that has a balance of 3ℏ`);

  const [randomAccStatus, randomId] = await accountCreatorFcn(randomKey, 3);
  console.log(`- Created random account ${randomId} that has a balance of 3ℏ`);
  
  const [treasuryAccStatus, treasuryId] = await accountCreatorFcn(treasuryKey, 3);
  console.log(`- Created random account ${treasuryId} that has a balance of 3ℏ`);

  // Create NFT
  console.log(`\n- Creating NFT (with all token keys set)`);
  let nftCreate = await new TokenCreateTransaction()
    .setTokenName("Fall Collection")
    .setTokenSymbol("LEAF")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(5)
    // Set keys
    .setAdminKey(adminKey)
    .setFreezeKey(randomKey)
    .setKycKey(randomKey)
    .setWipeKey(randomKey)
    .setSupplyKey(randomKey)
    .setPauseKey(randomKey)
    .setFeeScheduleKey(randomKey)
    .freezeWith(client)
    .sign(treasuryKey);

  let nftCreateTxSign = await nftCreate.sign(adminKey);
  let nftCreateSubmit = await nftCreateTxSign.execute(client);
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);
  let tokenId = nftCreateRx.tokenId;
  console.log(`- Created NFT with Token ID: ${tokenId}`);

  // Update supply key from token using token update transaction (not possible to remove by setting to "null")
  console.log('\n- Updating token with new supply key');
  let tokenUpdateTx = await new TokenUpdateTransaction()
    .setTokenId(tokenId)
    .setSupplyKey(null) // if you set this to null, nothing happens - try "newSupplyKey" which works
    .freezeWith(client)
    .sign(adminKey);

  let tokenUpdateTxSubmit = await tokenUpdateTx.execute(client);
  let tokenUpdateTxRx = await tokenUpdateTxSubmit.getReceipt(client);
  console.log('- Updated supply key');

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
