import { Program, web3 } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import {
    AccountInfo,
    // Keypair,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    // Transaction,
    // TransactionInstruction,
    // sendAndConfirmTransaction
} from '@solana/web3.js';
import {
    // Token, 
    TOKEN_PROGRAM_ID, 
    // AccountLayout, 
    // MintLayout, 
    ASSOCIATED_TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import { GlobalPool, UserPool } from './types';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { IDL } from './staking_program';
import { programs } from '@metaplex/js';
import { successAlert } from '../components/toastGroup';
import { USER_POOL_SIZE, GLOBAL_AUTHORITY_SEED, REWARD_TOKEN_MINT, PROGRAM_ID } from '../config';

export const solConnection = new web3.Connection(web3.clusterApiUrl("devnet"));

export const getNftMetaData = async (nftMintPk: PublicKey) => {
    let { metadata: { Metadata } } = programs;
    let metadataAccount = await Metadata.getPDA(nftMintPk);
    const metadat = await Metadata.load(solConnection, metadataAccount);
    return metadat;
}

export const initProject = async (
    wallet: WalletContextState
) => {
    if (!wallet.publicKey) return;
    let cloneWindow: any = window;

    let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
    const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    const rewardVault = await getAssociatedTokenAccount(globalAuthority, REWARD_TOKEN_MINT);
    const tx = await program.rpc.initialize(bump, {
        accounts: {
            admin: wallet.publicKey,
            globalAuthority,
            rewardVault: rewardVault,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [],
    });
    await solConnection.confirmTransaction(tx, "confirmed");
    await new Promise((resolve, reject) => {
        solConnection.onAccountChange(globalAuthority, (data: AccountInfo<Buffer> | null) => {
            if (!data) reject();
            resolve(true);
        });
    });

    successAlert("Success. txHash=" + tx);
    return false;
}

export const initUserPool = async (
    userAddress: PublicKey,
) => {
    let userPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "user-pool",
        program.programId,
    );

    console.log(USER_POOL_SIZE);
    let ix = SystemProgram.createAccountWithSeed({
        fromPubkey: userAddress,
        basePubkey: userAddress,
        seed: "user-pool",
        newAccountPubkey: userPoolKey,
        lamports: await solConnection.getMinimumBalanceForRentExemption(USER_POOL_SIZE),
        space: USER_POOL_SIZE,
        programId: program.programId,
    });

    const tx = await program.rpc.initializeFixedPool(
        {
            accounts: {
                userFixedPool: userPoolKey,
                owner: userAddress
            },
            instructions: [
                ix
            ],
            signers: []
        }
    );
    await solConnection.confirmTransaction(tx, "confirmed");

    console.log("Your transaction signature", tx);
    let poolAccount = await program.account.userPool.fetch(userPoolKey);
    console.log('Owner of initialized pool = ', poolAccount.owner.toBase58());
}

export const stakeNft = async (userAddress: PublicKey, mint: PublicKey, rank: anchor.BN) => {
    let userTokenAccount = await getAssociatedTokenAccount(userAddress, mint);
    console.log("NFT = ", mint.toBase58(), userTokenAccount.toBase58());

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        globalAuthority,
        [mint]
    );

    console.log("Dest NFT Account = ", destinationAccounts[0].toBase58())
    let userPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "user-pool",
        program.programId,
    );

    let poolAccount = await solConnection.getAccountInfo(userPoolKey);
    console.log(poolAccount);
    if (poolAccount === null || poolAccount.data === null) {
        await initUserPool(userAddress);
    }

    const tx = await program.rpc.stakeNftToFixed(
        bump, rank, {
        accounts: {
            owner: userAddress,
            userFixedPool: userPoolKey,
            globalAuthority,
            userTokenAccount,
            destNftTokenAccount: destinationAccounts[0],
            nftMint: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [
            ...instructions,
        ],
        signers: [],
    }
    );
    await solConnection.confirmTransaction(tx, "singleGossip");

}

export const withdrawNft = async (userAddress: PublicKey, mint: PublicKey) => {
    let userTokenAccount = await getAssociatedTokenAccount(userAddress, mint);
    console.log("NFT = ", mint.toBase58(), userTokenAccount.toBase58());

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        globalAuthority,
        [mint]
    );

    console.log("Dest NFT Account = ", destinationAccounts[0].toBase58());

    let userPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "user-pool",
        program.programId,
    );

    const tx = await program.rpc.withdrawNftFromFixed(
        bump, {
        accounts: {
            owner: userAddress,
            userFixedPool: userPoolKey,
            globalAuthority,
            userTokenAccount,
            destNftTokenAccount: destinationAccounts[0],
            nftMint: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [
        ],
        signers: [],
    }
    );
    await solConnection.confirmTransaction(tx, "singleGossip");
}

export const claimReward = async (userAddress: PublicKey) => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );

    console.log("globalAuthority =", globalAuthority.toBase58());

    let userPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "user-pool",
        program.programId,
    );

    let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
        solConnection,
        userAddress,
        userAddress,
        [REWARD_TOKEN_MINT]
    );

    console.log("Dest NFT Account = ", destinationAccounts[0].toBase58());
    console.log(await solConnection.getTokenAccountBalance(destinationAccounts[0]));

    const tx = await program.rpc.claimReward(
        bump, {
        accounts: {
            owner: userAddress,
            userFixedPool: userPoolKey,
            globalAuthority,
            rewardVault,
            userRewardAccount: destinationAccounts[0],
            tokenProgram: TOKEN_PROGRAM_ID,
        },
        instructions: [
            ...instructions,
        ],
        signers: []
    }
    );

    console.log("Your transaction signature", tx);
    await solConnection.confirmTransaction(tx, "singleGossip");

    console.log(await solConnection.getTokenAccountBalance(destinationAccounts[0]));
}

export const getGlobalState = async (
): Promise<GlobalPool | null> => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    try {
        let globalState = await program.account.globalPool.fetch(globalAuthority);
        return globalState as GlobalPool;
    } catch {
        return null;
    }
}

export const getUserPoolState = async (
    userAddress: PublicKey
): Promise<UserPool | null> => {
    if (!userAddress) return null;

    let userPoolKey = await PublicKey.createWithSeed(
        userAddress,
        "user-pool",
        program.programId,
    );
    console.log('User Pool: ', userPoolKey.toBase58());
    try {
        let poolState = await program.account.userPool.fetch(userPoolKey);
        return poolState as UserPool;
    } catch {
        return null;
    }
}

const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
    let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
        [
            ownerPubkey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintPk.toBuffer(), // mint address
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];
    return associatedTokenAccountPubkey;
}

export const getATokenAccountsNeedCreate = async (
    connection: anchor.web3.Connection,
    walletAddress: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    nfts: anchor.web3.PublicKey[],
) => {
    let instructions = [], destinationAccounts = [];
    for (const mint of nfts) {
        const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
        let response = await connection.getAccountInfo(destinationPubkey);
        if (!response) {
            const createATAIx = createAssociatedTokenAccountInstruction(
                destinationPubkey,
                walletAddress,
                owner,
                mint,
            );
            instructions.push(createATAIx);
        }
        destinationAccounts.push(destinationPubkey);
        if (walletAddress != owner) {
            const userAccount = await getAssociatedTokenAccount(walletAddress, mint);
            response = await connection.getAccountInfo(userAccount);
            if (!response) {
                const createATAIx = createAssociatedTokenAccountInstruction(
                    userAccount,
                    walletAddress,
                    walletAddress,
                    mint,
                );
                instructions.push(createATAIx);
            }
        }
    }
    return {
        instructions,
        destinationAccounts,
    };
}

export const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey,
    walletAddress: anchor.web3.PublicKey,
    splTokenMintAddress: anchor.web3.PublicKey
) => {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new anchor.web3.TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}

main();