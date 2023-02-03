console.clear();
require("dotenv").config();

const {
  AccountId,
  PrivateKey,
  Client,
  TokenCreateTransaction,
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
const key1 = PrivateKey.generateED25519();
const key2 = PrivateKey.generateED25519();
const newSupplyKey = PrivateKey.generateED25519();

async function main() {
  // Create accounts
  console.log(`- Creating accounts...`);
  const [adminAccStatus, adminId] = await accountCreatorFcn(adminKey, 3);
  console.log(`- Created admin account ${adminId} that has a balance of 3ℏ`);

  const [key1AccStatus, key1Id] = await accountCreatorFcn(key1, 3);
  console.log(`- Created account 1: ${key1Id} that has a balance of 3ℏ`);
  
  const [key2AccStatus, key2Id] = await accountCreatorFcn(key2, 3);
  console.log(`- Created account 2: ${key2Id} that has a balance of 3ℏ`);

  const [randomAccStatus, randomId] = await accountCreatorFcn(randomKey, 3);
  console.log(`- Created random account ${randomId} that has a balance of 3ℏ`);

  const [treasuryAccStatus, treasuryId] = await accountCreatorFcn(treasuryKey, 3);
  console.log(`- Created treasury account ${treasuryId} that has a balance of 3ℏ`);

  // Setting node IDs
  // It is required to set the account ID of the node(s) the transaction will be submitted to when freezing a transaction for signatures.
  const nodeId = [];
  nodeId.push(new AccountId(3));

  // Create keylist
  console.log(`- Generating keylist...`);
  const keyList = new KeyList([key1.publicKey, key2.publicKey], 2);

  // Create NFT
  console.log(`\n- Creating NFT (with all token keys set)`);
  let nftCreate = await new TokenCreateTransaction()
    .setNodeAccountIds(nodeId)
    .setTokenName("Fall Collection")
    .setTokenSymbol("LEAF")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId) // needs to sign
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(5)
    // Set keys
    .setAdminKey(keyList)
    .setFreezeKey(randomKey)
    .setKycKey(randomKey)
    .setWipeKey(randomKey)
    .setSupplyKey(randomKey)
    .setPauseKey(randomKey)
    .setFeeScheduleKey(randomKey)
    .freezeWith(client)
    .sign(treasuryKey);

  // Adding multisig signatures
  const sig1 = key1.signTransaction(nftCreate);
  const sig2 = key2.signTransaction(nftCreate);
  const nftCreateTxSign = nftCreate.addSignature(key1.publicKey, sig1).addSignature(key2.publicKey, sig2);

  let nftCreateSubmit = await nftCreateTxSign.execute(client);
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);
  let tokenId = nftCreateRx.tokenId;
  console.log(`- Created NFT with Token ID: ${tokenId}`);
  console.log(`- Exchange rate for transaction: ${nftCreateRx.exchangeRate.exchangeRateInCents}`);

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
