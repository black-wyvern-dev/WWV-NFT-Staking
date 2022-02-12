import ProcessBar from "./ProcessBar";
import bannerImage from "../assets/img/WWV-TOKEN.png";
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
		<div className="home-banner">
			<div className="home-banner-content">
				<h1>Earn <span>$WWV</span> By Staking Your Wild West Verse </h1>
				<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever 
					since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
				{wallet.publicKey !== null &&
					<ProcessBar value={totalGlabalStakedCnt} forceRender={hide} />
				}
				<p>WWV Token will be the currency of our universe and the token has different kinds of utilities.</p>
			</div>
			<div className="home-banner-image">
				{wallet.publicKey === null ?
					<img
						src={bannerImage}
						alt=""
					/>
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
	)
}
