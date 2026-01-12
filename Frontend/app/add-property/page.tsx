"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ethers } from "ethers"
import contractABI from "@/lib/LandReg.json"
import { Log } from "ethers"
import { useWallet } from "@/contexts/WalletContext"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Building2, MapPin, Hash, FileText, Wallet } from "lucide-react"

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
      <>
        <Navbar />
        <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
                <Wallet className="h-8 w-8 text-bauhaus-blue" />
              </div>
              <div className="w-12 h-1 mx-auto mb-4 flex">
                <div className="flex-1 bg-bauhaus-red"></div>
                <div className="flex-1 bg-bauhaus-yellow"></div>
                <div className="flex-1 bg-bauhaus-blue"></div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Wallet Required</h2>
              <p className="text-muted-foreground mb-6">Please connect your wallet to register properties</p>
              <Button
                onClick={() => router.push('/marketplace')}
                variant="primary"
              >
                Go to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-8 px-4 relative overflow-hidden">
        {/* Bauhaus Geometric Background */}
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-bauhaus-red opacity-5"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-bauhaus-blue opacity-5 rotate-45"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-bauhaus-yellow opacity-5"></div>

        <div className="max-w-xl mx-auto relative z-10">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
                <Building2 className="h-8 w-8 text-bauhaus-blue" />
              </div>

              <div className="w-16 h-1 mx-auto mb-4 flex">
                <div className="flex-1 bg-bauhaus-red"></div>
                <div className="flex-1 bg-bauhaus-yellow"></div>
                <div className="flex-1 bg-bauhaus-blue"></div>
              </div>

              <CardTitle className="text-2xl font-bold">Add Property Details</CardTitle>
              <CardDescription>
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-bauhaus-red" />
                    Property Address *
                  </Label>
                  <Input
                    value={addr}
                    onChange={(e) => setAddr(e.target.value)}
                    placeholder="e.g., 123 Main Street, New York"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-bauhaus-yellow" />
                    Area (sq. ft.) *
                  </Label>
                  <Input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g., 1000"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-bauhaus-blue" />
                    Postal Code *
                  </Label>
                  <Input
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    placeholder="e.g., 10001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-bauhaus-red" />
                    Property Name *
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Downtown Commercial Plot"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || isConnecting}
                  variant="primary"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                      Registering Property...
                    </>
                  ) : (
                    "Register Property"
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Property registration requires a blockchain transaction.
                  Make sure you have some Sepolia ETH for gas fees.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}
