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

const treasuryKey = PrivateKey.generateED25519();

async function main() {
  // Create accounts
  const [treasuryAccStatus, treasuryId] = await accountCreatorFcn(treasuryKey, 3);
  console.log(`- Created treasury account ${treasuryId} that has a balance of 3ℏ`);

  // Create NFT
  console.log(`\n- Creating NFT (with only supply key)`);
  let nftCreateTx = await new TokenCreateTransaction()
    .setTokenName("Fall Collection")
    .setTokenSymbol("LEAF")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(5)
    // No admin key, only required supply key is set
    .setSupplyKey(treasuryKey)
    .freezeWith(client)
    .sign(treasuryKey);

  //let nftCreateTxSign = await nftCreateTx.sign(adminKey);
  let nftCreateSubmit = await nftCreateTx.execute(client);
  let nftCreateRx = await nftCreateSubmit.getReceipt(client);
  let tokenId = nftCreateRx.tokenId;
  console.log(`- Created NFT with Token ID: ${tokenId}`);

  /* Output for token:

    {
        "admin_key": null,
        "auto_renew_account": "0.0.2617920",
        "auto_renew_period": 7776000,
        "created_timestamp": "1675418666.482710003",
        "custom_fees": {
            "created_timestamp": "1675418666.482710003",
            "fixed_fees": [],
            "royalty_fees": []
        },
        "decimals": "0",
        "deleted": false,
        "expiry_timestamp": 1683194666482710003,
        "fee_schedule_key": null,
        "freeze_default": false,
        "freeze_key": null,
        "initial_supply": "0",
        "kyc_key": null,
        "max_supply": "5",
        "memo": "",
        "modified_timestamp": "1675418666.482710003",
        "name": "Fall Collection",
        "pause_key": null,
        "pause_status": "NOT_APPLICABLE",
        "supply_key": {
            "_type": "ED25519",
            "key": "e86357247a5036069236433adb2cdd42c2c3a5d0479b571566a211d4125f7b47"
        },
        "supply_type": "FINITE",
        "symbol": "LEAF",
        "token_id": "0.0.3371173",
        "total_supply": "0",
        "treasury_account_id": "0.0.3371172",
        "type": "NON_FUNGIBLE_UNIQUE",
        "wipe_key": null
        }
  */

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
