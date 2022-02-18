import { useState, useEffect, useRef } from "react";
import bar from "../assets/img/color-bar.svg";

export default function ProcessBar({ value, forceRender, ...props }) {
  const ref = useRef();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(ref.current?.clientWidth);
    // eslint-disable-next-line
  }, [value, forceRender])
  return (
    <div className="process-bar">
      <h3>{value}/2000 WWV Staked</h3>
      <div className="process-body">
        <div className="process-content" ref={ref}>
          <img
            src={bar}
            alt=""
            style={{ transform: `translateX(-${(2000 - value) / 2000 * width}px)` }}
          />
        </div>
      </div>
    </div>
  )
}
