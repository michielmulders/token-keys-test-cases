# Hedera Token Service: Everything about setting token keys for NFTs

This project explores various test cases related to setting token keys for NFTs created using the Hedera Token Service (HTS). 

**Table of Contents:**

- **[Project Setup](#project-setup)**
- **[Token Keys](#token-keys---hedera-token-service-hts)**
    - [Which token keys can you set?](#which-token-keys-can-you-set)
- **[How to create an NFT?](#how-to-create-an-nft-using-the-javascript-sdk)**
- **[Token keys test cases](#token-keys---hedera-token-service-hts)**
    - [Case 1: Can you make changes to an NFT when you don't set an admin key?](#case-1)
    - [Case 2: Can the admin key remove other keys?](#case-2)
    - [Case 3: Can the admin key update other keys?](#case-3)
    - [Case 4: Can the admin key remove itself?](#case-4)
    - [Case 5: Can one account ID be set to different keys for the same token?](#case-5)
    - [Case 6: Can you assign multiple accounts to a single key?](#case-6)
    - [Case 7: Can you set no keys for an NFT?](#case-7)

# Project Setup

In order to run any of the examples, execute the following steps:

```bash
npm install

# Create .env file
touch .env
```

Add your operator ID (OPERATOR_ID) and operator key (OPERATOR_PVKEY) to .env file.

```bash
OPERATOR_ID=0.0.XXXXX
OPERATOR_PVKEY=myprivkey
```

Then run the example you want:
```bash
node all-keys.js 
```

# Token Keys - Hedera Token Service (HTS)
The Hedera Token Service enables the configuration, management, and transfer of native fungible and non-fungible tokens on the public Hedera network. The Hedera Token Service offers incredibly high-throughput, low fees, and compliance configurations. There's even on-chain programmability, with API calls for atomic swaps and royalties — and for more complex programming, it's integrated into the Hedera Smart Contract service.

## Which token keys can you set?

1. **Admin key:** The key which can perform token update and token delete operations on the token. The admin key has the authority to change the supply key, freeze key, pause key, wipe key, and KYC key. It can also update the treasury account of the token. If empty, the token can be perceived as immutable (not being able to be updated/deleted).

2. **Freeze key:** This key is used to freeze or unfreeze token accounts. When an account is frozen, it cannot perform any transactions.

3. **KYC key:** This key is used to manage the token's KYC (Know Your Customer) information. It can be used to add, update, or remove KYC information for token accounts.

4. **Wipe key:** This key is used to wipe the balance of a token account. This can be useful in cases where the account owner has lost access to the account or it has been compromised.

5. **Supply key:** This key is used to manage the total supply of a token. It can be used to mint new tokens or burn existing ones. If the supply key is not set, it’s not possible to mint or burn tokens.

6. **Pause key:** This key has the authority to pause or unpause a token. Pausing a token prevents the token from participating in all transactions.

7. **Fee Schedule key:** This key can change the token's custom fee schedule. It must sign a TokenFeeScheduleUpdate transaction. A token without a fee schedule key is immutable, which means you can’t set a custom fee schedule after the token has been created.

**[Read the docs about creating a token and setting token keys](https://docs.hedera.com/hedera/docs/sdks/tokens/define-a-token)**

# How to create an NFT using the JavaScript SDK?

Here's an example of how you can create an NFT with the Hedara Token Service using the Hedera JavaScript SDK, setting all token keys.

```js
 let nftCreate = await new TokenCreateTransaction()
    .setTokenName("Fall Collection")
    .setTokenSymbol("LEAF")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId) // needs to sign
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
    .freezeWith(client);
```

Now, let's take a look at specific test cases related to setting token keys. 

## Token Keys Test Cases

### Case 1
**Can you make changes to an NFT when you don't set an admin key?**

**Output:** When you don't set an admin key, the token becomes immutable. This means that none of the token properties can be updated. 

```js
let nftCreateTx = await new TokenCreateTransaction()
    .setTokenName("Fall Collection")
    .setTokenSymbol("LEAF")
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(treasuryId)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(5)
    // No admin key, only the required supply key is set
    .setSupplyKey(treasuryKey)
    .freezeWith(client)
    .sign(treasuryKey);
```

**Code example:** [immutable-token.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/immutable-token.js)


### Case 2
**Can the admin key remove other keys or itself?**

**Output:** No, it's not possible to remove keys or itself. The admin key is only allowed to update keys. When you set a key to null or undefined, nothing will change.

```js
let tokenUpdateTx = await new TokenUpdateTransaction()
    .setTokenId(tokenId)
    .setSupplyKey(null) // if you set this to null, nothing happens
    .freezeWith(client)
    .sign(adminKey);
```

**Code example:** [all-keys-remove-supply.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys-remove-supply.js)


### Case 3
**Can the admin key update other keys?**

**Output:** Yes, the admin key has the authority to change the supply key, freeze key, pause key, wipe key, and KYC key.

```js
let tokenUpdateTx = await new TokenUpdateTransaction()
    .setTokenId(tokenId)
    .setSupplyKey(newSupplyKey) 
    .freezeWith(client)
    .sign(adminKey);
```

**Code example:** [all-keys-update-supply.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys-update-supply.js)


### Case 4
**Can the admin key be updated to a new admin key?**

**Output:** Yes, the admin key can be updated when its set. Both the old and the new admin key need to sign the transaction to be successful. 

```js
let tokenUpdateTx = await new TokenUpdateTransaction()
    .setTokenId(tokenId)
    .setAdminKey(newAdminKey)
    .freezeWith(client)
    .sign(newAdminKey);

let tokenUpdateTxSign = await tokenUpdateTx.sign(adminKey);
```

**Code example:** [token-update-admin-key.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/token-update-admin-key.js)


### Case 5
**Can one account ID be set to different keys for the same token?**

**Output:** Yes, you are allowed to set the same account for multipe keys on a token. For instance, our base example uses the `random account ID` for 6 keys.

```js
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
    .setFreezeKey(randomKey) // 1
    .setKycKey(randomKey) // 2
    .setWipeKey(randomKey) // 3
    .setSupplyKey(randomKey) // 4
    .setPauseKey(randomKey) // 5
    .setFeeScheduleKey(randomKey) // 6
    .freezeWith(client);
```

**Code example:** [all-keys.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys.js)


### Case 6
**Can you assign multiple accounts to a single key?**

**Output:** Yes, you can create a `KeyList`, which acts as a multisig. For instance, you can create a KeyList that contains two accounts and set the signing requirements to `2-out-of-2`. This means that both accounts need to sign when the specific key is required. 

Below you find an example with an admin key that has been assigned a `2-out-of-2` `KeyList`.

```js
// Create keylist
console.log(`- Generating keylist...`);
const keyList = new KeyList([key1.publicKey, key2.publicKey], 2); // 2-out-of-2

// Create NFT
console.log(`\n- Creating NFT`);
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
    .setAdminKey(keyList) // multisig (keylist)
    .setSupplyKey(randomKey)
    .freezeWith(client)
    .sign(treasuryKey);
```

When you want to execute a transaction, both keys need to sign.

```js
// Adding multisig signatures
const sig1 = key1.signTransaction(nftCreate);
const sig2 = key2.signTransaction(nftCreate);
const nftCreateTxSign = nftCreate.addSignature(key1.publicKey, sig1).addSignature(key2.publicKey, sig2);

let nftCreateSubmit = await nftCreateTxSign.execute(client);
let nftCreateRx = await nftCreateSubmit.getReceipt(client);
let tokenId = nftCreateRx.tokenId;
console.log(`- Created NFT with Token ID: ${tokenId}`);
```

**Code example:** [token-admin-keylist.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/token-admin-keylist.js)


### Case 7
**Can you set no keys for an NFT?**

**Output:** No, the supply key is the only required key when you don't set any other keys for an NFT. If you don't set a supply key, you get the error `TOKEN_HAS_NO_SUPPLY_KEY`.

```js
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
```

**Code example:** [no-keys.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/no-keys.js)

## Learn more about token keys?

Reach out on [Discord](https://hedera.com/discord) or look at the docs about [token creation](https://docs.hedera.com/hedera/sdks-and-apis/sdks/tokens/define-a-token) using the Hedera Token Service.