import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Divider from '@mui/material/Divider';
// import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  const wallet = useWallet();
  const [showStaktedResults, setShowStakedResults] = useState(true);
  const [showUnstaktedResults, setShowUnstakedResults] = useState(false);
  const showStakedNFTs = () => {
    setShowStakedResults(true);
    setShowUnstakedResults(false);
  }
  const showUnstakedNFTs = () => {
    setShowStakedResults(false);
    setShowUnstakedResults(true);
  }
  return (
    <div className="main-content">
      <div className="stake-box">
        <div className="staking-buttons">
          <button className="staking-btn" onClick={() => showStakedNFTs()}>Staked NFTs</button>
          <button className="staking-btn" onClick={() => showUnstakedNFTs()}>Unstaked NFTs</button>
        </div>
        <Divider className="divider" />
        {
          wallet.publicKey !== null &&
          <>
            {
              showStaktedResults &&
              <div>
                <h1>Staked NFTs</h1>
              </div>
            }
            {
              showUnstaktedResults &&
              <div>
                <h1>Unstaked NFTs</h1>
              </div>
            }
          </>
        }
      </div>
    </div>
  );
}
