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
  AccountCreateTransaction
} = require("@hashgraph/sdk");

// Configure accounts and client, and generate needed keys
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

const adminKey = PrivateKey.generateED25519();
const treasuryKey = PrivateKey.generateED25519();
const newAdminKey = PrivateKey.generateED25519();

async function main() {
  // Create accounts
  console.log(`- Creating accounts...`);
  const [adminAccStatus, adminId] = await accountCreatorFcn(adminKey, 3);
  console.log(`- Created admin account ${adminId} that has a balance of 3ℏ`);

  const [treasuryAccStatus, treasuryId] = await accountCreatorFcn(treasuryKey, 3);
  console.log(`- Created treasury account ${treasuryId} that has a balance of 3ℏ`);

  const [newAdminAccStatus, newAdminId] = await accountCreatorFcn(newAdminKey, 3);
  console.log(`- Created new admin account ${newAdminId} that has a balance of 3ℏ`);

  // Create NFT
  console.log(`\n- Creating NFT (with admin and supply key set)`);
  let nftCreateTx = await new TokenCreateTransaction()
    .setTokenName("Fall Collection")
    .setTokenSymbol("LEAF")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(5)
    // Set admin key
    .setAdminKey(adminKey)
    .setSupplyKey(adminKey)
    .freezeWith(client)
    .sign(treasuryKey);

  let nftCreateTxSign = await nftCreateTx.sign(adminKey);
  let nftCreateSubmit = await nftCreateTxSign.execute(client);
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);
  let tokenId = nftCreateRx.tokenId;
  console.log(`- Created NFT with Token ID: ${tokenId}`);

  // Update admin key (old and new admin key need to sign)
  console.log('\n- Updating token with new admin key');
  let tokenUpdateTx = await new TokenUpdateTransaction()
    .setTokenId(tokenId)
    .setAdminKey(newAdminKey)
    .freezeWith(client)
    .sign(newAdminKey);

  let tokenUpdateTxSign = await tokenUpdateTx.sign(adminKey);
  let tokenUpdateTxSubmit = await tokenUpdateTxSign.execute(client);
  let tokenUpdateTxRx = await tokenUpdateTxSubmit.getReceipt(client);
  console.log('- Updated admin key');

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
