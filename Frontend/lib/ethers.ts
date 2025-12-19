// lib/ethers.ts
"use client";

import { BrowserProvider, Contract, isAddress } from "ethers";
import rawAbi from "./LandReg.json"; // If this is a full artifact, we’ll pick .abi below

const CONTRACT_ADDRESS: string | undefined = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

type EthereumLike = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, cb: (...args: any[]) => void) => void;
  removeListener?: (event: string, cb: (...args: any[]) => void) => void;
};

// Normalize ABI whether file is full artifact or plain ABI array
const ABI: any[] = (rawAbi as any)?.abi ?? (rawAbi as any);

// Basic runtime validations to avoid UNCONFIGURED_NAME and similar errors
function assertClient() {
  if (typeof window === "undefined") {
    throw new Error("This function must run in the browser");
  }
}

function assertAddress(addr?: string) {
  if (!addr || !isAddress(addr)) {
    throw new Error("Missing or invalid NEXT_PUBLIC_CONTRACT_ADDRESS");
  }
}

function assertAbi(abi: any) {
  if (!abi || (Array.isArray(abi) && abi.length === 0)) {
    throw new Error("ABI is missing or empty");
  }
}

declare global {
  interface Window {
    ethereum?: EthereumLike;
  }
}

export const getEthereumObject = (): EthereumLike | null => {
  if (typeof window !== "undefined" && window.ethereum) return window.ethereum as EthereumLike;
  return null;
};

export const connectWallet = async (): Promise<string | null> => {
  try {
    assertClient();
    const ethereum = getEthereumObject();
    if (!ethereum) {
      alert("Install MetaMask");
      return null;
    }
    const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
    return accounts?.[0] ?? null;
  } catch (error) {
    console.error("connectWallet error:", error);
    return null;
  }
};

export const getProviderAndSigner = async () => {
  assertClient();
  const ethereum = getEthereumObject();
  if (!ethereum) throw new Error("MetaMask not found");
  const provider = new BrowserProvider(ethereum);
  // Ensure accounts are requested so signer has an address
  await ethereum.request({ method: "eth_requestAccounts" });
  const signer = await provider.getSigner();
  return { provider, signer };
};

export const getContract = async (): Promise<Contract> => {
  assertClient();
  assertAbi(ABI);
  assertAddress(CONTRACT_ADDRESS);

  const { signer } = await getProviderAndSigner();
  // Contract constructor: (address, abi, signerOrProvider)
  const contract = new Contract(CONTRACT_ADDRESS as string, ABI, signer);
  return contract;
};

/**
 * Optional helpers specific to your contract
 * (use these in components to avoid direct low-level calls)
 */

export const fetchOwnedLands = async (): Promise<number[]> => {
  const { signer } = await getProviderAndSigner();
  const user = await signer.getAddress();
  if (!isAddress(user)) throw new Error("Invalid signer address");

  const contract = await getContract();
  // getLandsByOwner(address) returns uint256[]
  const ids: bigint[] = await contract.getLandsByOwner(user);
  return ids.map((x) => Number(x));
};

export const getTotalProperties = async (): Promise<number> => {
  const contract = await getContract();
  const total: bigint = await contract.getTotalProperties();
  return Number(total);
};

export const getMarketplaceDetails = async (id: number) => {
  const contract = await getContract();
  // returns: propertyAddress, totalLandArea, propertyName, forSale, wholePrice, isShared, totalShares, availableShares, pricePerShare
  return contract.getMarketplaceDetails(id);
};

export const registerLand = async (addr: string, area: number, postal: number, name: string): Promise<number> => {
  const contract = await getContract();
  const tx = await contract.registerLand(addr, area, postal, name);
  const receipt = await tx.wait();
  // Get event LandRegistered(uint256 indexed landId, address indexed owner)
  // Parse logs if needed; or call getTotalProperties afterwards.
  // For simplicity, return latest total or decode event from receipt.logs with interface.
  const total = await contract.getTotalProperties();
  return Number(total); // Not exact landId, but often last ID == total
};

export const listWhole = async (id: number, priceWei: bigint) => {
  const contract = await getContract();
  const tx = await contract.listWhole(id, priceWei);
  return tx.wait();
};

export const buyWhole = async (id: number, priceWei: bigint) => {
  const contract = await getContract();
  const tx = await contract.buyWhole(id, { value: priceWei });
  return tx.wait();
};
