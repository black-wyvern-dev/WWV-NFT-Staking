import { useRef, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Divider from '@mui/material/Divider';
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { web3 } from '@project-serum/anchor';
import NFTCard from "../components/NFTCard";
import { WWV_CREATOR, PUBLISH_NETWORK } from "../config";
import SkeletonCard from "../components/SkeletonCard";

export default function Home() {
  const solConnection = new web3.Connection(web3.clusterApiUrl(PUBLISH_NETWORK));
  const wallet = useWallet();
  const ref = useRef();
  const [unstaked, setUnstaked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hide, setHide] = useState(false);
  const [width, setWidth] = useState(0);
  const [poolState, setPoolstate] = useState(true);

  const setNFTArray = async () => {
    setLoading(true);
    let nftDump = [];
    const unstakedNftList = await getMetadataDetail()
    if (unstakedNftList.length !== 0) {
      for (let item of unstakedNftList) {
        console.log(item, '999999999')
        // if (item.data.creators[1].address === WWV_CREATOR) {
          console.log(item, '----------------')
          await fetch(item.data.uri)
            .then(resp =>
              resp.json()
            ).then((json) => {
              console.log(json)
              nftDump.push({
                "name": json.name,
                "image": json.image,
                "mint": item.mint
              })
            })
        // }
      }
      setUnstaked(nftDump);
      setHide(!hide);
    }
    setLoading(false);
  }

  const getMetadataDetail = async () => {
    const nftsList = await getParsedNftAccountsByOwner({ publicAddress: wallet.publicKey, connection: solConnection });
    return nftsList;
  }

  const onStakeNFT = () => {

  }
  const onUntakeNFT = () => {

  }

  useEffect(() => {
    if (wallet.publicKey !== null) {
      setNFTArray()
    } else {
      setUnstaked([]);
    }
    // eslint-disable-next-line
  }, [wallet.connected])

  useEffect(() => {
    setWidth(ref.current?.clientWidth);
    // eslint-disable-next-line
  }, [])

  return (
    <div className="main-content">
      <div className="stake-box">
        <div className="staking-buttons">
          <button className="staking-btn" onClick={() => setPoolstate(true)}>Staked NFTs</button>
          <button className="staking-btn" onClick={() => setPoolstate(false)}>Unstaked NFTs</button>
        </div>
        <Divider className="divider" />
        {
          wallet.publicKey !== null &&
          <>
            {poolState ?
              <div>
                <h1 className="list-title">Staked NFTs</h1>
                <div className="list-content" style={{ minHeight: width / 4 }}></div>
              </div>
              :
              <div>
                <h1 className="list-title">Unstaked NFTs {!loading && <span>({unstaked.length})</span>}</h1>
                {loading ?
                  <div className="list-content" style={{ minHeight: width / 4 }}>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                  :
                  <div className="list-content" style={{ minHeight: width / 4 }}>
                    {unstaked.length !== 0 && unstaked.map((item, key) => (
                      <NFTCard
                        key={key}
                        isStaked={false}
                        image={item.image}
                        name={item.name}
                        onStakeNFT={onStakeNFT}
                        onUntakeNFT={onUntakeNFT}
                      />
                    ))}
                  </div>
                }
              </div>
            }
          </>
        }
      </div>
    </div>
  );
}
