import React from 'react';
import { useDirectWallet } from '../contexts/DirectWalletContext';

export function WalletConnect() {
  const { connected, address, petraInstalled, connectWallet, disconnectWallet } = useDirectWallet();

  if (!petraInstalled) {
    return (
      <button
        onClick={() => window.open("https://petra.app/", "_blank")}
        className="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm font-medium"
      >
        Install Petra Wallet
      </button>
    );
  }

  if (connected) {
    return (
      <div className="space-y-2">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <p className="text-xs text-green-700 font-semibold mb-1">Connected Wallet</p>
          <p className="text-xs font-mono text-green-800 break-all">
            {address.slice(0, 8)}...{address.slice(-6)}
          </p>
        </div>
        <button
          onClick={disconnectWallet}
          className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
    >
      Connect Petra Wallet
    </button>
  );
}

export default WalletConnect;

