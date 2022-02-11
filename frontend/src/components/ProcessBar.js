import { useState, useEffect, useRef } from "react";
import bar from "../assets/img/color-bar.svg";

export default function ProcessBar({ value, ...props }) {
  const ref = useRef();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(ref.current?.clientWidth);
    // eslint-disable-next-line
  }, [])
  return (
    <div className="process-bar">
      <h5>{value}/5000 WWV Staked</h5>
      <div className="process-body">
        <div className="process-content" ref={ref}>
          <img
            src={bar}
            alt=""
            style={{ transform: `translateX(-${(5000 - value) / 5000 * width}px)` }}
          />
        </div>
      </div>
    </div>
  )
}
