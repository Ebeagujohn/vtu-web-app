import { createContext, useCallback, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(null);
  const [profilePicture, setProfilePicture] = useState(
    localStorage.getItem("noha_profile_picture") || null
  );
  const [loading, setLoading] = useState(false);

  const refreshWallet = useCallback(async () => {
    const token = localStorage.getItem("noha_user_token");
    if (!token) {
      setBalance(null);
      return;
    }

    setLoading(true);
    try {
      const [walletRes, profileRes] = await Promise.all([
        API.get("/auth/wallet/"),
        API.get("/auth/profile/"),
      ]);

      setBalance(walletRes.data.balance);

      const pic = profileRes.data.profile_picture || null;
      setProfilePicture(pic);
      if (pic) localStorage.setItem("noha_profile_picture", pic);
      else localStorage.removeItem("noha_profile_picture");
    } catch {
      // keep old balance on transient errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return (
    <WalletContext.Provider
      value={{ balance, profilePicture, loading, refreshWallet, setBalance }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}