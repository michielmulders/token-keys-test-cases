# What's this project about?

This project explores various test cases related to setting token keys for NFTs created using the Hedera Token Service (HTS). 

**Table of Contents:**

- **[Project Setup](#project-setup)**
- **[Token Keys](#token-keys)**
    - [Which token keys can you set?](#which-token-keys-can-you-set)
- **[How to create an NFT?](#how-to-create-an-NFT)**
- **[Token keys test cases](#token-keys-test-cases)**
    - [Case 1: Can you make changes to an NFT when you don't set an admin key?](#case-1)
    - [Case 2: Can the admin key remove other keys?](#case-2)
    - [Case 3: Can the admin key update other keys?](#case-3)
    - [Case 4:](#case-4)
    - [Case 5:](#case-5)
    - [Case 6:](#case-6)
    - [Case 7:](#case-7)

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

**Output:**

When you don't set an admin key, the token becomes immutable. This means that none of the token properties can be updated. 

**Code example:** [immutable-token.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/immutable-token.js)


### Case 2
**Can the admin key remove other keys?**

**Output:** No, it's not possible to remove keys. The admin key is only allowed to update keys. When you set a key to null or undefined, nothing will change.

**Code example:** [all-keys-remove-supply.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys-remove-supply.js)


### Case 3
**Can the admin key update other keys?**

**Output:** Yes, 

**Code example:** [all-keys-remove-supply.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys-remove-supply.js)



### Case 4
**Can the admin key remove other keys?**

**Output:** 

**Code example:** [all-keys-remove-supply.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys-remove-supply.js)


### Case 5
**Can the admin key remove other keys?**

**Output:** 

**Code example:** [all-keys-remove-supply.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys-remove-supply.js)


### Case 6
**Can the admin key remove other keys?**

**Output:** 

**Code example:** [all-keys-remove-supply.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys-remove-supply.js)


### Case 7
**Can the admin key remove other keys?**

**Output:** 

**Code example:** [all-keys-remove-supply.js](https://github.com/michielmulders/token-keys-test-cases/blob/main/all-keys-remove-supply.js)