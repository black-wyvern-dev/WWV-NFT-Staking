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
// import { getNftMetaData, getUserPoolState } from "../contexts/helper";
import { PublicKey } from "@solana/web3.js";
// import { initProject } from "../contexts/helper";


export default function Home() {
  const solConnection = new web3.Connection(web3.clusterApiUrl("devnet"));
  // ------------page state-----------
  const wallet = useWallet();
  const [stakedLoading, setStakedLoading] = useState(false)
  const [unstakedLoading, setUnStakedLoading] = useState(false)
  const [hide, setHide] = useState(false);

  // ------------content state-----------
  const [unstaked, setUnstaked] = useState([]);
  const [userStakedNFTs, setUserStakedNFTs] = useState([]);

  const getUnstakedNFTs = async () => {
    setUnStakedLoading(true);
    let nftDump = [];
    const unstakedNftList = await getMetadataDetail();
    console.log(unstakedNftList, "==> list")
    if (unstakedNftList.length !== 0) {
      for (let item of unstakedNftList) {
        if (item.data.creators[1]?.address === WWV_CREATOR) {
          await fetch(item.data.uri)
            .then(resp =>
              resp.json()
            ).then((json) => {
              nftDump.push({
                "name": json.name,
                "image": json.image,
                "mint": item.mint,
                // "legendary": legendaryValidatie(json)
              })
            })
        }
      }
      setUnstaked(nftDump);
      console.log(nftDump, '--------------')
      setHide(!hide);
    }
    setUnStakedLoading(false);
  }

  // const getStakedNFTs = async () => {
  //   setStakedLoading(true);
  //   const nftDump = [];
  //   const list = await getUserPoolState(wallet.publicKey);
  //   if(list !== null) {
  //     for (let i = 0; i < list.stakedCount.toNumber(); i++) {
  //       const nft = await getNftMetaData(new PublicKey(list.stakedMints[i].mint))
  //       await fetch(nft.data.data.uri)
  //         .then(resp =>
  //           resp.json()
  //         ).then((json) => {
  //           nftDump.push({
  //             "name": json.name,
  //             "image": json.image,
  //             "mint": nft.data.mint,
  //             "legendary": legendaryValidatie(json)
  //           })
  //         })
  //     }
  //   }
  //   setUserStakedNFTs(nftDump);
  //   setStakedLoading(false);
  //   setHide(!hide);
  // }

  const getMetadataDetail = async () => {
    const nftsList = await getParsedNftAccountsByOwner({ publicAddress: wallet.publicKey, connection: solConnection });
    return nftsList;
  }

  const legendaryValidatie = (nft) => {
    const lagendary_trait = nft.attributes.find(({ trait_type }) => trait_type === "Legendary");
    return !(lagendary_trait.value === "None")
  }

  const updatePageStates = () => {
    getUnstakedNFTs();
    // getStakedNFTs();
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
              <h2 className="list-title">Staked Apes{!stakedLoading && <span>({userStakedNFTs.length})</span>}</h2>
              {stakedLoading ?
                <div className="list-content">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
                :
                <div className="list-content">
                  {userStakedNFTs.length !== 0 && userStakedNFTs.map((item, key) => (
                    <NFTCard
                      key={key}
                      isStaked={true}
                      image={item.image}
                      name={item.name}
                      mint={item.mint}
                      legendary={item.legendary}
                      updatePageStates={updatePageStates}
                    />
                  ))}
                </div>
              }
            </div>
            <div className="nft-list">
              <h2 className="list-title">Unstaked Apes{!unstakedLoading && <span>({unstaked.length})</span>}</h2>
              {unstakedLoading ?
                <div className="list-content">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
                :
                <div className="list-content">
                  {unstaked.length !== 0 && unstaked.map((item, key) => (
                    <NFTCard
                      key={key}
                      isStaked={false}
                      image={item.image}
                      name={item.name}
                      mint={item.mint}
                      legendary={item.legendary}
                      updatePageStates={updatePageStates}
                    />
                  ))}
                </div>
              }
            </div>
          </>
        }
      </Container>
      <Footer />
    </div>
  );
}
