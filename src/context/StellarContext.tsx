"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isConnected as freighterIsConnected, requestAccess, getAddress } from "@stellar/freighter-api";
import * as StellarSdk from "stellar-sdk";

const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

type StellarContextType = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const StellarContext = createContext<StellarContextType | undefined>(undefined);

export function StellarProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState("0");

  const fetchBalance = async (addr: string) => {
    try {
      const account = await server.loadAccount(addr);
      const xlmBalance = account.balances.find((b: { asset_type: string }) => b.asset_type === "native");
      if (xlmBalance) {
        setBalance(Number(xlmBalance.balance).toFixed(2));
      }
    } catch (e) {
      console.error("Failed to fetch balance", e);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await freighterIsConnected();
        if (result.isConnected) {
          const addressObj = await getAddress();
          if (!addressObj.error && addressObj.address) {
            setAddress(addressObj.address);
            fetchBalance(addressObj.address);
          }
        }
      } catch (error) {
        console.error("Failed to check Freighter connection", error);
      }
    };
    checkConnection();
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const result = await freighterIsConnected();
      if (!result.isConnected) {
        alert("Please install Freighter extension!");
        return;
      }

      const accessObj = await requestAccess();
      if (accessObj.error) {
        throw new Error(accessObj.error);
      }

      if (accessObj.address) {
        setAddress(accessObj.address);
        await fetchBalance(accessObj.address);
      }
    } catch (error: unknown) {
      console.error("Freighter connection failed", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert("Failed to connect: " + errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance("0");
  };

  return (
    <StellarContext.Provider value={{
      address,
      isConnected: !!address,
      isConnecting,
      balance,
      connect,
      disconnect
    }}>
      {children}
    </StellarContext.Provider>
  );
}

export function useStellar() {
  const context = useContext(StellarContext);
  if (context === undefined) {
    throw new Error("useStellar must be used within a StellarProvider");
  }
  return context;
}
