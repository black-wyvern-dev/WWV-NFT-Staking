import ProcessBar from "./ProcessBar";
import bannerImage from "../assets/img/WWV-TOKEN.png";
import rewardImage from '../assets/img/StakinngRewards.png';
import { ClaimButton } from "./styleHook";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import SyncLoader from "react-spinners/SyncLoader";
import { calculateAvailableReward, claimReward, getGlobalState } from "../contexts/helper";
import { SHOW_REWARD_FIXED } from "../config";

export default function HomeBanner({ forceRender, ...props }) {
	const wallet = useWallet();
	const [loading, setLoading] = useState(false);
	const [rewardValue, setRewardValue] = useState(0);
	const [totalGlabalStakedCnt, setTotalGlabalStakedCnt] = useState(0);
	const [hide, setHide] = useState(false);

	const getReward = async () => {
		const reward = await calculateAvailableReward(wallet.publicKey);
		setRewardValue(reward);
	}
	const onClaim = () => {
		claimReward(wallet, () => setLoading(true), () => setLoading(false));
		setHide(!hide);
	}

	const getGlobalStateNFTs = async () => {
		const list = await getGlobalState();
		setTotalGlabalStakedCnt(list.fixedNftCount.toNumber());
	}
	const updateBannerStates = () => {
		const intv = setInterval(() => {
			getGlobalStateNFTs();
			getReward();
		}, 5000);
		return intv;
	}

	useEffect(() => {
		let intv = -1;
		if (wallet.publicKey !== null) {
			intv = updateBannerStates();
		}
		return () => {
			if (intv !== -1) {
				clearInterval(intv);
				console.log('clear interval', intv);
			}
		}
		// eslint-disable-next-line
	}, [wallet.connected, hide])

	return (
		<>
			<div className="home-banner">
				<div className="home-banner-content">
					{
						wallet.publicKey === null &&
						<div>
							<h1>NFT Staking</h1>
							<h3>What is staking?</h3>
							<p>Staking is a way to put your asset to work and earn rewards on it.</p>
							<h3>How does staking work?</h3>
							<p>You send your NFT to WWV staking smart contract from the web site <a href="https://www.wildwestverse.com/" target="_blank" rel="noreferrer">www.wildwestverse.com</a>. You earn <span>$WWV</span> while your NFT is staked here.</p>
							<h3>Why should I stake?</h3>
							<p>You can earn passive income by staking your NFT.</p>
							<h3>What should I do with my staking rewards?</h3>
							<p>You can join lottery, sell on the market, stake your <span>$WWV</span> Token and buy items on WWV Auctions. Also <span>$WWV</span> will be able to use on the WWV P2E Strategic Card Game for in game purchases.</p>
							<h3>When can I collect my staking rewards?</h3>
							<p>Whenever you want. Remember, you will receive as many staking rewards as the day you stake.</p>
							<h3>What is rarity based staking?</h3>
							<p>If your NFT is rarer you will get more staking reward. You can check the rarity scheme from the list above. Also rankings are arranged 
								by <a href="https://howrare.is/wildwestverse" target="_blank" rel="noreferrer">https://howrare.is/wildwestverse</a></p>
							<h3>When should I withdraw my NFT?</h3>
							<p>Whenever you want. But keep in mind that you won't be able to get any more staking income.</p>
						</div>
					}
					{wallet.publicKey !== null &&
						<ProcessBar value={totalGlabalStakedCnt} forceRender={hide} />
					}
					{/* <p>And wait for the WWV P2E Strategic Card Game! <span>$WWV</span> Token will able to use in game purchases.</p> */}
				</div>
				{
					wallet.publicKey === null ?
					<div className="vl"></div>
					: <div className="v2"></div>
				}
				<div className="home-banner-image">
					{wallet.publicKey === null ?
						<>
							<div>
								<img
									src={bannerImage}
									alt=""
								/>
							</div>
							<div className="rewardImage">
								<img 
									src={rewardImage}
									alt=""
								/>
							</div>
						</>
						:
						<div className="claim-box">
							<div className="claim-title">
								<div className="claim-title-content">
									<p>$WWV</p>
									<h2>{rewardValue.toFixed(SHOW_REWARD_FIXED)}</h2>
								</div>
							</div>
							<p>Accumulated Rewards Amount</p>
							<ClaimButton disabled={loading} onClick={() => onClaim()}>
								{!loading ?
									<>
										Claim $WWV
									</>
									:
									<SyncLoader color="#B22234" size={15} />
								}
							</ClaimButton>
						</div>
					}

				</div>
			</div>
			<hr />
		</>
	)
}
