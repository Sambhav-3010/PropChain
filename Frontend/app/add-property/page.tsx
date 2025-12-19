"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ethers } from "ethers"
import contractABI from "@/lib/LandReg.json"
import { Log } from "ethers"
import { useWallet } from "@/contexts/WalletContext"

// Add your deployed contract address here
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "your_contract_address_here"

export default function AddPropertyDetails() {
  const { account, isConnecting } = useWallet()
  const [addr, setAddr] = useState("") // ✅ Fixed: Added missing addr state
  const [area, setArea] = useState("")
  const [postal, setPostal] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ✅ Added wallet connection check
    if (!account) {
      alert("Please connect your wallet first")
      return
    }
    
    if (!addr || !area || !postal || !name) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      if (!window.ethereum) throw new Error("MetaMask not found")

      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()

      // ✅ Fixed: Use contractABI directly (not contractABI.abi)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)

      console.log("Registering land with:", { addr, area, postal, name })

      // ✅ Convert values and call registerLand
      const tx = await contract.registerLand(
        addr, 
        parseInt(area), 
        parseInt(postal), 
        name
      )
      
      console.log("Transaction sent:", tx.hash)
      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      // ✅ Extract land ID from events
      let landId
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log)
          if (parsedLog?.name === 'LandRegistered') {
            landId = parsedLog.args.landId.toString()
            break
          }
        } catch (e) {
          // Skip logs that can't be parsed
        }
      }

      console.log("Land registered with ID:", landId)

      if (landId) {
        alert(`✅ Property registered successfully!\nTransaction: ${tx.hash}\nLand ID: ${landId}`)
      } else {
        alert(`✅ Property registered successfully!\nTransaction: ${tx.hash}`)
      }
      
      // ✅ Clear form after successful registration
      setAddr("")
      setArea("")
      setPostal("")
      setName("")
      
      // Redirect to marketplace or property list
      router.push("/marketplace")
    } catch (err: any) {
      console.error("Registration error:", err)
      
      // ✅ Better error handling
      if (err.code === 4001) {
        alert("Transaction rejected by user")
      } else if (err.message.includes("insufficient funds")) {
        alert("Insufficient funds for transaction")
      } else if (err.message.includes("not seller")) {
        alert("You need seller role to register properties. Please get trading roles first.")
      } else {
        alert("Error registering property: " + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ Show wallet connection prompt if not connected
  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700 px-4 py-10">
        <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm text-center">
          <h2 className="text-3xl font-bold text-purple-800 mb-4">Wallet Required</h2>
          <p className="text-purple-600 mb-6">Please connect your wallet to register properties</p>
          <Button 
            onClick={() => router.push('/marketplace')} 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-fuchsia-600 hover:to-purple-700"
          >
            Go to Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700 px-4 py-10 ">
      <div className="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-2">Add Property Details</h2>
        <p className="text-center text-purple-600 mb-6">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-purple-700 font-medium">Property Address *</Label>
            <Input 
              value={addr} 
              onChange={(e) => setAddr(e.target.value)} 
              placeholder="e.g., 123 Main Street, New York"
              className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              required 
            />
          </div>
          
          <div>
            <Label className="text-purple-700 font-medium">Area (sq. ft.) *</Label>
            <Input 
              type="number" 
              value={area} 
              onChange={(e) => setArea(e.target.value)} 
              placeholder="e.g., 1000"
              min="1"
              className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              required 
            />
          </div>
          
          <div>
            <Label className="text-purple-700 font-medium">Postal Code *</Label>
            <Input 
              value={postal} 
              onChange={(e) => setPostal(e.target.value)} 
              placeholder="e.g., 10001"
              className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              required 
            />
          </div>
          
          <div>
            <Label className="text-purple-700 font-medium">Property Name *</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Downtown Commercial Plot"
              className="mt-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              required 
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading || isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-semibold py-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registering Property...
              </>
            ) : (
              "Register Property"
            )}
          </Button>
        </form>
        
        <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-700">
            <strong>Note:</strong> Property registration requires a blockchain transaction. 
            Make sure you have some Sepolia ETH for gas fees.
          </p>
        </div>
      </div>
    </div>
  )
}
