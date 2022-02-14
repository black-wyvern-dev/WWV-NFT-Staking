import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import logo from "../assets/img/logo.svg";
import Container from "./Container";

export default function Header() {
  return (
    <div className="header">
      <Container>
        <div className="header-content">
          <div className="logo">
            {/* <img
              src={logo}
              alt="wild west verse logo"
            /> */}
          </div>
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        </div>
      </Container>
    </div>
  );
}
