import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect, useRef } from "react";
import { API_URL } from "../config";
import { stakeNft, withdrawNft } from "../contexts/helper";
import CardLoading from "./CardLoading";

export default function NFTCard({
  image,
  name,
  isStaked,
  mint,
  updatePageStates,
  ...props
}) {
  const ref = useRef();
  const [width, setWidth] = useState(0);
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);

  const getRank = (mint) => {
    const number = name.slice(12);
    return new Promise((resolve, reject) => {
      fetch(API_URL)
      .then(resp =>resp.json())
      .then((json) => {
        const nfts = json.result.data.items;
        const results = nfts.filter(item => {
          if (item.id === number) return true
        }
          // item.mint.indexOf(mint) !== -1
        )
        const rank = results[0].rank
        resolve(rank);
      })
      .catch(error => {
        console.log(error)
      });
    });
  }

  const onStakeNFT = async (mint) => {
    const rank = await getRank(mint);
    console.log(rank, 'rank')
    stakeNft(wallet, new PublicKey(mint), rank, () => setLoading(true), () => setLoading(false), updatePageStates);
  }

  const onUntakeNFT = (mint) => {
    withdrawNft(wallet, new PublicKey(mint), () => setLoading(true), () => setLoading(false), updatePageStates);
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
                <button className="action-button" onClick={() => onStakeNFT(mint)}>
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
