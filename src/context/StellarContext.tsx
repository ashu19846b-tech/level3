"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isConnected as freighterIsConnected, requestAccess, getAddress, signTransaction, getNetwork } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";
import { prepareContractTransaction, submitTransaction } from "@/lib/soroban";
import { Address, nativeToScVal } from "@stellar/stellar-sdk";

const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

type StellarContextType = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Signs an XDR-encoded transaction via Freighter and returns the signed XDR string. */
  signTx: (xdr: string, network?: string) => Promise<string>;
};

const StellarContext = createContext<StellarContextType | undefined>(undefined);

/**
 * Attempts to register the wallet address as a patient on the MediChain contract.
 * Silently ignores "already registered" panics so this is safe to call every login.
 */
async function tryRegisterPatient(address: string, signTxFn: (xdr: string) => Promise<string>) {
  try {
    const txXdr = await prepareContractTransaction(address, "register_patient", [
      new Address(address).toScVal(),
      nativeToScVal("Patient", { type: "string" }),
    ]);
    const signedXdr = await signTxFn(txXdr);
    await submitTransaction(signedXdr);
    console.log("[MediChain] register_patient submitted successfully.");
  } catch (err: unknown) {
    // "already registered" is a normal scenario — swallow it silently.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already registered") || msg.includes("AlreadyRegistered")) {
      console.log("[MediChain] Patient already registered — skipping.");
    } else {
      // Non-fatal: log but don't block the user from using the app.
      console.warn("[MediChain] register_patient failed (non-fatal):", msg);
    }
  }
}

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

  /**
   * Signs an XDR-encoded transaction using Freighter.
   * Returns the signed XDR string ready for submission to Soroban RPC.
   */
  const signTx = async (xdr: string, network: string = "TESTNET"): Promise<string> => {
    try {
      const tx = StellarSdk.TransactionBuilder.fromXDR(xdr, StellarSdk.Networks.TESTNET);
      console.log("Decoded XDR networkPassphrase:", tx.networkPassphrase);
      console.log("Expected NETWORK_PASSPHRASE:", StellarSdk.Networks.TESTNET);
      console.log("XDR:", xdr);
      const currentNetwork = await getNetwork();
      console.log("Freighter network:", currentNetwork);
    } catch (err) {
      console.error("Failed to decode XDR before signing:", err);
    }

    const opts: { network?: string; networkPassphrase?: string } = {
      networkPassphrase: StellarSdk.Networks.TESTNET
    };

    const signed = await signTransaction(xdr, opts);
    if (signed.error) {
      const errMsg = typeof signed.error === "object" ? JSON.stringify(signed.error) : String(signed.error);
      throw new Error(errMsg);
    }
    // Freighter returns { signedTxXdr, error }
    const signedXdr = (signed as unknown as { signedTxXdr?: string; tx?: string } & typeof signed).signedTxXdr
      ?? (signed as unknown as { tx?: string }).tx
      ?? (signed as unknown as string);
    if (!signedXdr || typeof signedXdr !== "string") {
      throw new Error("Freighter did not return a signed XDR string.");
    }
    return signedXdr;
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      const result = await freighterIsConnected();
      if (!result.isConnected) {
        alert("Please install the Freighter browser extension to use MediVault!");
        return;
      }

      // Request wallet access (triggers Freighter popup)
      const accessObj = await requestAccess();
      if (accessObj.error) {
        throw new Error(String(accessObj.error));
      }

      if (accessObj.address) {
        setAddress(accessObj.address);
        await fetchBalance(accessObj.address);

        // Register the patient on-chain so subsequent contract calls don't panic.
        // This is a best-effort call — "already registered" errors are swallowed.
        await tryRegisterPatient(accessObj.address, signTx);
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
      disconnect,
      signTx
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
