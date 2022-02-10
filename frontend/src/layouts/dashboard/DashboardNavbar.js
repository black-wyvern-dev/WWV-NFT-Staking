import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// components
import logo from '../../assets/img/logo.svg'

import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

DashboardNavbar.propTypes = {
  onOpenSidebar: PropTypes.func
};

export default function DashboardNavbar({ onOpenSidebar }) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <Link to={"/"}>
          <img
            src={logo}
            alt=""
          />
        </Link>
      </div>
      <div>
        <WalletModalProvider>
          <WalletMultiButton />
        </WalletModalProvider>
      </div>
    </div>
  );
}
