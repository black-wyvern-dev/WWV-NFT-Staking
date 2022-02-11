import SyncLoader from "react-spinners/SyncLoader";

export default function CardLoading({ width, ...props }) {
    return (
        <div className="card-loading" style={{ height: width }}>
            <SyncLoader color="#000" size={20} />
        </div>
    )
}
