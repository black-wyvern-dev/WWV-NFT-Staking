import { Skeleton } from "@mui/material";
import { useState, useEffect, useRef } from "react";

export default function SkeletonCard() {
    const ref = useRef();
    const [width, setWidth] = useState(0);
    useEffect(() => {
        setWidth(ref.current?.clientWidth);
        // eslint-disable-next-line
    }, [])
    return (
        <div className="nft-card" ref={ref}>
            <div className="card-image">
                <Skeleton animation="wave" style={{ width: width, height: width, backgroundColor: "#ffffff3b" }} variant="retangle" />
            </div>
        </div>
    )
}
