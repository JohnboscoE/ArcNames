import { createContext, useContext, useEffect, useState } from "react";

interface WalletContextType {
  walletAddress: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWallet] = useState<string | null>(null);

  // Auto-reconnect if MetaMask already authorized
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) setWallet(accounts[0]);
      });

    // Listen for account changes
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      setWallet(accounts.length > 0 ? accounts[0] : null);
    });
  }, []);

  async function connect() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWallet(accounts[0]);
  }

  function disconnect() {
    setWallet(null);
  }

  return (
    <WalletContext.Provider value={{ walletAddress, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
