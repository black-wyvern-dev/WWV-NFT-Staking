import ProcessBar from "./ProcessBar";
import bannerImage from "../assets/img/WWV-TOKEN.png";
import { ClaimButton } from "./styleHook";
import { useWallet } from "@solana/wallet-adapter-react";

export default function HomeBanner({ totalGlabalStakedCnt, ...props }) {
	const wallet = useWallet();
	return (
		<div className="home-banner">
			<div className="home-banner-content">
				<h1>Earn <span>$WWV</span> By Staking Your Wild West Verse </h1>
				<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever 
					since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
				<ProcessBar value={totalGlabalStakedCnt} />
				<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
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
								<h2>00.00</h2>
							</div>
						</div>
						<p>Accumulated Rewards Amount</p>
						<ClaimButton>
							Claim $WWV
						</ClaimButton>
					</div>
				}

			</div>
		</div>
	)
}
