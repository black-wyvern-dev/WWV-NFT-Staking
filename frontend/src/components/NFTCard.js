import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect, useRef } from "react";
import { stakeNft, withdrawNft } from "../contexts/helper";
import CardLoading from "./CardLoading";

export default function NFTCard({
  image,
  name,
  isStaked,
  mint,
  legendary,
  updatePageStates,
  ...props
}) {
  const ref = useRef();
  const [width, setWidth] = useState(0);
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const onStakeNFT = (mint, legendary) => {
    stakeNft(wallet.publicKey, new PublicKey(mint), legendary, () => setLoading(true), () => setLoading(false), updatePageStates);
  }

  const onUntakeNFT = (mint) => {
    withdrawNft(wallet.publicKey, new PublicKey(mint), () => setLoading(true), () => setLoading(false), updatePageStates);
  }

  useEffect(() => {
    setWidth(ref.current?.clientWidth);
    // eslint-disable-next-line
  }, [])

  return (
    <div className="nft-card" ref={ref}>
      <div className="card-image">
        {loading ?
          <CardLoading width={width} />
          :
          <>
            <img
              src={image}
              alt=""
              style={{ width: width, height: width }}
            />
            <div className="card-action">
              <p>{name}</p>
              {isStaked ?
                <button className="action-button" onClick={() => onUntakeNFT(mint)}>
                  unstake
                </button>
                :
                <button className="action-button" onClick={() => onStakeNFT(mint, legendary)}>
                  stake
                </button>
              }
            </div>
          </>
        }
      </div>
    </div>
  )
}
