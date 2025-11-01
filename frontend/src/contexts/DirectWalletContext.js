import { createContext, useContext, useState, useEffect } from "react";

const DirectWalletContext = createContext(undefined);

export function DirectWalletProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [petraInstalled, setPetraInstalled] = useState(false);
  const [wallet, setWallet] = useState(null);

  // Check if Petra is installed
  useEffect(() => {
    const checkPetra = () => {
      const petra = window.aptos || window.petra;
      setPetraInstalled(!!petra);
      setWallet(petra || null);
      console.log("🔍 Petra wallet detected:", !!petra);
    };

    // Check immediately
    checkPetra();

    // Check again after delay (extension might load late)
    const timer = setTimeout(checkPetra, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem("ffqWalletConnected");
      const petra = window.aptos;

      if (wasConnected && petra) {
        try {
          const isConnected = await petra.isConnected();
          if (isConnected) {
            const account = await petra.account();
            setAddress(account.address);
            setConnected(true);
            console.log("✅ Auto-connected to Petra wallet");
          } else {
            // Clear stale connection
            localStorage.removeItem("ffqWalletConnected");
            localStorage.removeItem("ffqWalletAddress");
          }
        } catch (error) {
          console.log("Auto-connect failed, user needs to connect manually");
          // Clear stale connection
          localStorage.removeItem("ffqWalletConnected");
          localStorage.removeItem("ffqWalletAddress");
        }
      }
    };

    if (petraInstalled) {
      checkConnection();
    }
  }, [petraInstalled]);

  const connectWallet = async () => {
    try {
      const petra = window.aptos;

      if (!petra) {
        alert("Petra wallet not detected! Please install the Petra browser extension.");
        window.open("https://petra.app/", "_blank");
        return;
      }

      console.log("🔗 Connecting to Petra wallet...");
      const response = await petra.connect();

      setAddress(response.address);
      setConnected(true);

      console.log("✅ Connected to Petra wallet!");
      console.log("📍 Address:", response.address);

      // Store in localStorage for persistence
      localStorage.setItem("ffqWalletConnected", "true");
      localStorage.setItem("ffqWalletAddress", response.address);
    } catch (error) {
      console.error("❌ Failed to connect wallet:", error);
      alert(`Failed to connect wallet: ${error.message || "Unknown error"}`);
    }
  };

  const disconnectWallet = async () => {
    try {
      const petra = window.aptos;
      if (petra) {
        await petra.disconnect();
      }

      setConnected(false);
      setAddress("");

      localStorage.removeItem("ffqWalletConnected");
      localStorage.removeItem("ffqWalletAddress");

      console.log("✅ Wallet disconnected");
    } catch (error) {
      console.error("❌ Failed to disconnect wallet:", error);
    }
  };

  const getAccount = () => {
    if (!connected || !address) {
      return null;
    }
    return { address };
  };

  return (
    <DirectWalletContext.Provider
      value={{
        connected,
        address,
        petraInstalled,
        connectWallet,
        disconnectWallet,
        wallet,
        getAccount,
      }}
    >
      {children}
    </DirectWalletContext.Provider>
  );
}

export function useDirectWallet() {
  const context = useContext(DirectWalletContext);
  if (context === undefined) {
    throw new Error("useDirectWallet must be used within a DirectWalletProvider");
  }
  return context;
}

