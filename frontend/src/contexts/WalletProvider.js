import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { useEffect, useState } from "react";

export function WalletProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to ensure browser extensions are available
  useEffect(() => {
    setMounted(true);
  }, []);

  const wallets = [
    new PetraWallet(),
    new PontemWallet(),
    new MartianWallet(),
    new FewchaWallet(),
  ];

  // Don't render provider until mounted (prevents SSR issues)
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={false}
      onError={(error) => {
        console.error("Wallet connection error:", error);
        console.error("Error details:", error.message);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

