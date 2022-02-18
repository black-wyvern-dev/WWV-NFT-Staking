import { useEffect, useState } from "react";
import { web3 } from '@project-serum/anchor';
import Container from "../components/Container";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HomeBanner from "../components/HomeBanner";
import NFTCard from "../components/NFTCard";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { useWallet } from "@solana/wallet-adapter-react";
import { WWV_CREATOR } from "../config";
import SkeletonCard from "../components/SkeletonCard";
import { getNftMetaData, getUserPoolState } from "../contexts/helper";
// import { PublicKey } from "@solana/web3.js";
// import { initProject } from "../contexts/helper";


export default function Home() {
  const solConnection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
  // const solConnection = new web3.Connection(web3.clusterApiUrl("devnet"));
  // ------------page state-----------
  const wallet = useWallet();
  const [stakedLoading, setStakedLoading] = useState(false)
  const [unstakedLoading, setUnStakedLoading] = useState(false)
  const [hide, setHide] = useState(false);
  const [disable, setDisable] = useState(false);

  // ------------content state-----------
  const [userStakedNFTs, setUserStakedNFTs] = useState([]);
  const [unstaked, setUnstaked] = useState([]);

  const getUnstakedNFTs = async () => {
    setUnStakedLoading(true);
    let nftDump = [];
    const unstakedNftList = await getMetadataDetail();
    console.log(unstakedNftList, 'unstakedNFTList-===========-');
    if (unstakedNftList !== undefined) {
      for (let item of unstakedNftList) {
        if (item.data.creators && item.data.creators[0]?.address === WWV_CREATOR) {
          await fetch(item.data.uri)
            .then(resp =>
              resp.json()
            ).then((json) => {
              nftDump.push({
                "name": json.name,
                "image": json.image,
                "mint": item.mint,
              })
            })
        }
      }
    }
    setUnstaked(nftDump);
    console.log(nftDump, "===>unstaked nfts -1");
    setHide(!hide);
    setUnStakedLoading(false);
    console.log(nftDump, "===>unstaked nfts");
  }

  const getStakedNFTs = async () => {
    setStakedLoading(true);
    const nftDump = [];
    const list = await getUserPoolState(wallet.publicKey);
    if(list !== null) {
      console.log(list, 'listlistlist')
      for (let i = 0; i < list.itemCount.toNumber(); i++) {
        const nft = await getNftMetaData(list.items[i].nftAddr)
        await fetch(nft.data.data.uri)
          .then(resp =>
            resp.json()
          ).then((json) => {
            nftDump.push({
              "name": json.name,
              "image": json.image,
              "mint": nft.data.mint,
            })
          })
      }
    }
    setUserStakedNFTs(nftDump);
    console.log(nftDump, "===>staked nfts --------- 1");
    setStakedLoading(false);
    setHide(!hide);
    console.log(nftDump, "===>staked nfts");
  }

  const getMetadataDetail = async () => {
    const nftsList = await getParsedNftAccountsByOwner({ publicAddress: wallet.publicKey, connection: solConnection });
    return nftsList;
  }

  const updatePageStates = () => {
    getUnstakedNFTs();
    getStakedNFTs();
  }

  useEffect(() => {
    if (wallet.publicKey !== null) {
      updatePageStates();
    } else {
      setUnstaked([]);
      setUserStakedNFTs([]);
    }
    // eslint-disable-next-line
  }, [wallet.connected])

  return (
    <div className="main-content">
      <Header />
      <Container>
        <HomeBanner forceRender={hide} />
        {/* <button onClick={() => initProject(wallet.publicKey)}>init project</button> */}
        {wallet.publicKey !== null &&
          <>
            <div className="nft-list">
              <h2 className="list-title">Staked NFTs{!stakedLoading && <span>({userStakedNFTs.length})</span>}</h2>
              {
                userStakedNFTs.length === 0 &&
                <hr />
              }
              {stakedLoading ?
                <>
                  <div className="list-content">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                  <hr />
                </>
                :
                <>
                  <div className="list-content">
                    {userStakedNFTs.length !== 0 && userStakedNFTs.map((item, key) => (
                      <NFTCard
                        key={key}
                        isStaked={true}
                        image={item.image}
                        name={item.name}
                        mint={item.mint}
                        updatePageStates={updatePageStates}
                        disable={disable}
                        setDisable={setDisable}
                      />
                    ))}
                  </div>
                  {
                    userStakedNFTs.length !== 0 &&
                    <hr />
                  }
                </>
              }
            </div>
            <div className="nft-list">
              <h2 className="list-title">Unstaked NFTs{!unstakedLoading && <span>({unstaked.length})</span>}</h2>
              {unstakedLoading ?
                <>
                  <div className="list-content">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                  <hr />
                </>
                :
                <>
                  <div className="list-content">
                    {unstaked.length !== 0 && unstaked.map((item, key) => (
                      <NFTCard
                        key={key}
                        isStaked={false}
                        image={item.image}
                        name={item.name}
                        mint={item.mint}
                        updatePageStates={updatePageStates}
                        disable={disable}
                        setDisable={setDisable}
                      />
                    ))}
                  </div>
                  {
                    unstaked.length !== 0 &&
                    <hr />
                  }
                </>
              }
            </div>
          </>
        }
      </Container>
      <Footer />
    </div>
  );
}
