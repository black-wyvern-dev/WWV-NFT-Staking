# NFT-Staking-Rarity-Rust
Multiple Factor Rewards Staking program for WildWestVerse NFT collections

## Install Dependencies
- Install `node` and `yarn`
- Install `ts-node` as global command
- Confirm the solana wallet preparation: `/home/fury/.config/solana/id.json` in test case

## Usage
- Main script source for all functionality is here: `/cli/script.ts`
- Program account types are declared here: `/cli/types.ts`
- Idl to make the JS binding easy is here: `/cli/staking_program.json`

Able to test the script functions working in this way.
- Change commands properly in the main functions of the `script.ts` file to call the other functions
- Confirm the `ANCHOR_WALLET` environment variable of the `ts-node` script in `package.json`
- Run `yarn ts-node`

## Features

### As a Smart Contract Owner
For the first time use, the Smart Contract Owner should `initialize` the Smart Contract for global account allocation.
- `initProject`
 
Recall `initialize` function for update the Threshold values after change the constants properly
- `initProject` 

Maintain the Reward token($WWV) vault's balance
- `REWARD_TOKEN_MINT` is the reward token mint (for test).
- `rewardVault` is the reward token account for owner. The owner should have the token's `Mint Authority` or should `Fund` regularly.

This is current test value. Should be revised properly.
- `EPOCH` = 60                                    // A day 
- `REWARD_PER_DAY` = 100_000_000                  // 0.1 $WWV 
According to the rank of NFTs, there reward amount will be changed automatically following the below logic.

- RANK          /DAILY PRIZE
- 1500-2000     /1$WWV
- 1000-1499     /1.5$WWV
- 600-999       /2$WWV
- 300-599       /2.5$WWV
- 200-299       /3$WWV
- 51-199        /4$WWV
- 1-50          /5$WWV


### As a NFT Holder
Stake Shred Collection NFTs with NFT `mint address` and a boolean parameter weather the NFT is Legendary NFT.
- `stakeNft`

### As a Staker
Unstake their staked NFTs with `mint address` and get rewards. ( Calculate generated reward by this NFT too )
- `withdrawNft`

Claim reward to receive generated $WWV from their staking.
- `claimReward`
