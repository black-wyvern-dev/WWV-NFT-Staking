use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::*;

#[account]
#[derive(Default)]
pub struct GlobalPool {
    pub lottery_nft_count: u64, // 8
    pub fixed_nft_count: u64   // 8
}

#[zero_copy]
#[derive(Default)]
pub struct Item {
    // 72
    pub owner: Pubkey,      // 32
    pub nft_addr: Pubkey,   // 32
    pub stake_time: i64     // 8
}

#[zero_copy]
#[derive(Default, PartialEq)]
pub struct StakedNFT {
    pub nft_addr: Pubkey,       // 32
    pub stake_time: i64,        // 8
    pub rank: u64               // 8
}

#[account(zero_copy)]
pub struct UserPool {
    // 2464
    pub owner: Pubkey,                       // 32
    pub item_count: u64,                     // 8
    pub items: [StakedNFT; NFT_STAKE_MAX_COUNT],   // 48 * 50 = 2400
    pub reward_time: i64,                    // 8
    pub pending_reward: u64                  // 8
}
impl Default for UserPool {
    #[inline]
    fn default() -> UserPool {
        UserPool {
            owner: Pubkey::default(),
            item_count: 0,
            items: [
                StakedNFT {
                    ..Default::default()
                }; NFT_STAKE_MAX_COUNT
            ],
            reward_time: 0,
            pending_reward: 0
        }
    }
}

impl UserPool {
    pub fn add_nft(&mut self, item: StakedNFT) {
        self.items[self.item_count as usize] = item;
        self.item_count += 1;
    }
    pub fn remove_nft(&mut self, owner: Pubkey, nft_mint: Pubkey, now: i64) -> Result<u64> {
        require!(self.owner.eq(&owner), StakingError::InvalidOwner);
        let mut withdrawn: u8 = 0;
        let mut reward: u64 = 0;
        let count: u64 = self.item_count;
        for i in 0..self.item_count {
            let index = i as usize;
            if self.items[index].nft_addr.eq(&nft_mint) {
                
                //require!(self.items[index].stake_time + LIMIT_PERIOD <= now, StakingError::InvalidWithdrawTime);
                let mut last_reward_time = self.reward_time;
                if last_reward_time < self.items[index].stake_time {
                    last_reward_time = self.items[index].stake_time;
                }
                let mut rank: u64 = 0;
                rank = self.items[index].rank;

                let mut rwd: u64 = 0;
                let mut triple: u64 = 1;
                if count >= 10 triple =3;

                //according to the user's rank
                if rank > 0 && rank <= 50 { rwd = 50;}               
                if rank > 50 && rank < 200 { rwd = 40; }               
                if rank >= 200 && rank < 300 { rwd = 30; }              
                if rank >= 300 && rank < 600 { rwd = 25; }               
                if rank >= 600 && rank < 1000 { rwd = 20; }               
                if rank >= 1000 && rank < 1500 { rwd = 15; }              
                if rank >= 1500 && rank <= 2000 { rwd = 10; }              

                reward = (((now - last_reward_time) / DAY) as u64) * REWARD_PER_DAY * rwd * triple;
                // remove nft
                if i != self.item_count - 1 {
                    let last_idx = self.item_count - 1;
                    self.items[index] = self.items[last_idx as usize];
                }
                self.item_count -= 1;
                withdrawn = 1;
                break;
            }
        }
        require!(withdrawn == 1, StakingError::InvalidNFTAddress);
        Ok(reward)
    }
    pub fn claim_reward(&mut self, now: i64) -> Result<u64> {
        let mut total_reward: u64 = 0;
        let count: u64= self.item_count; 
        for i in 0..self.item_count {
            let index = i as usize;
            //require!(self.items[index].stake_time + LIMIT_PERIOD <= now, StakingError::InvalidWithdrawTime);
            let mut last_reward_time = self.reward_time;
            if last_reward_time < self.items[index].stake_time {
                last_reward_time = self.items[index].stake_time;
            }
            let mut rank: u64 = 0;
            rank = self.items[index].rank;

            let mut rwd: u64 = 0;
            let mut triple: u64 = 1;
            if count >= 10 triple =3;

            //according to the user's rank
            if (rank > 0 && rank <= 50) { rwd = 50;}               
            if (rank > 50 && rank < 200) { rwd = 40; }               
            if (rank >= 200 && rank < 300) { rwd = 30; }              
            if (rank >= 300 && rank < 600) { rwd = 25; }               
            if (rank >= 600 && rank < 1000) { rwd = 20; }               
            if (rank >= 1000 && rank < 1500) { rwd = 15; }              
            if (rank >= 1500 && rank < 2000) { rwd = 10; }              

            let reward = (((now - last_reward_time) / DAY) as u64) * REWARD_PER_DAY * rwd * triple;
            total_reward += reward;
        }
        total_reward += self.pending_reward;
        self.pending_reward = 0;
        self.reward_time = now;
        Ok(total_reward)
    }
}

