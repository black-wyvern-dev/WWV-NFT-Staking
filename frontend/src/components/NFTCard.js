import { useState, useEffect, useRef } from "react";

export default function NFTCard({
  image,
  name,
  isStaked,
  mint,
  onStakeNFT,
  onUntakeNFT,
  ...props
}) {
  const ref = useRef();
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(ref.current?.clientWidth);
    // eslint-disable-next-line
  }, [])
  return (
    <div className="nft-card" ref={ref}>
      <div className="card-image">
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
      </div>
    </div>
  )
}
