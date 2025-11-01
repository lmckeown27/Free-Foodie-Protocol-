import React from 'react';
import { useDirectWallet } from '../contexts/DirectWalletContext';

export function WalletConnect() {
  const { connected, address, petraInstalled, connectWallet, disconnectWallet } = useDirectWallet();

  if (!petraInstalled) {
    return (
      <button
        onClick={() => window.open("https://petra.app/", "_blank")}
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
      >
        Install Petra Wallet
      </button>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
    >
      Connect Petra Wallet
    </button>
  );
}

export default WalletConnect;

