"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Building2, MapPin, DollarSign, Loader2, ArrowLeft, Layers, Hash } from "lucide-react"
import { ethers } from "ethers"

// Assuming these functions are correctly defined elsewhere
import { connectWallet, getContract } from "@/lib/ethers"

type Land = {
  id: number;
  propertyAddress: string;
  totalLandArea: number;
  propertyName: string;
  forSale: boolean;
  wholePrice: number;
  isShared: boolean;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
};

export default function PropertyDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = parseInt(params.propertyId as string, 10)

  const [property, setProperty] = useState<Land | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [account, setAccount] = useState<string>("")

  useEffect(() => {
    const init = async () => {
      if (!propertyId) return;
      try {
        setLoading(true)
        const acc = await connectWallet()
        if (acc) {
          setAccount(acc)
          await fetchLandDetails(propertyId)
        } else {
          setError("Please connect your wallet to view property details.")
        }
      } catch (err) {
        console.error("Initialization error:", err)
        setError("Failed to initialize. Please check your wallet connection and refresh.")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [propertyId])

  const fetchLandDetails = async (id: number) => {
    try {
      const contract = await getContract()
      const details = await contract.getMarketplaceDetails(id);
      console.log("Land Details from Blockchain:", details)

      setProperty({
        id: id,
        propertyAddress: details[0],
        totalLandArea: Number(details[1]),
        propertyName: details[2],
        forSale: details[3],
        // Convert BigInt from contract to a formatted string
        wholePrice: parseFloat(ethers.formatEther(details[4])),
        isShared: details[5],
        totalShares: Number(details[6]),
        availableShares: Number(details[7]),
        pricePerShare: parseFloat(ethers.formatEther(details[8])),
      });
    } catch (err) {
      console.error("Error fetching land details:", err)
      setError("Failed to fetch land details from the blockchain. The property may not exist or there could be a network issue.")
    }
  }

  // --- Render Functions for different states ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)] mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-bauhaus-blue" />
        </div>
        <p className="text-lg text-muted-foreground">Loading Property Details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
        <Card className="max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
              <Building2 className="h-8 w-8 text-bauhaus-red" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">An Error Occurred</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/marketplace")} variant="primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
        <Card className="max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-6">We couldn't find the details for this property.</p>
            <Button onClick={() => router.push("/marketplace")} variant="primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 py-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <Card className="relative overflow-hidden bauhaus-bg-pattern">
            <div className="relative px-6 md:px-8 py-8 md:py-12 z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)] mr-6">
                    <Building2 className="h-8 w-8 text-bauhaus-blue" />
                  </div>
                  <div>
                    <div className="w-10 h-1 mb-2 flex">
                      <div className="flex-1 bg-bauhaus-red"></div>
                      <div className="flex-1 bg-bauhaus-yellow"></div>
                      <div className="flex-1 bg-bauhaus-blue"></div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{property.propertyName}</h1>
                    <p className="text-muted-foreground">{property.propertyAddress}</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </div>
          </Card>

          {/* Property Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] mr-3">
                  <Building2 className="h-4 w-4 text-bauhaus-blue" />
                </div>
                Property Overview
              </CardTitle>
              <CardDescription>Detailed information fetched from the blockchain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Placeholder */}
              <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
                <p className="text-muted-foreground">[ Property Image Placeholder ]</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border pb-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <span className="w-1 h-5 bg-bauhaus-red rounded-full mr-3"></span>
                    Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                      <span className="text-xs text-muted-foreground">Address</span>
                      <p className="font-medium text-sm">{property.propertyAddress}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                      <span className="text-xs text-muted-foreground">Total Area</span>
                      <p className="font-medium text-sm">{property.totalLandArea} sq. meters</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <span className="w-1 h-5 bg-bauhaus-yellow rounded-full mr-3"></span>
                    Pricing
                  </h3>
                  <div className="p-4 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                    <span className="text-xs text-muted-foreground">Whole Property Price</span>
                    <p className="text-2xl font-bold text-foreground flex items-center">
                      <span className="w-2 h-2 rounded-full bg-bauhaus-blue mr-2"></span>
                      {property.wholePrice} ETH
                    </p>
                  </div>
                </div>
              </div>

              {/* Fractional Ownership Details */}
              {property.isShared && (
                <div className="space-y-4 border-b border-border pb-6">
                  <h3 className="font-semibold flex items-center">
                    <span className="w-1 h-5 bg-bauhaus-blue rounded-full mr-3"></span>
                    Fractional Ownership Details
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                      <span className="text-xs text-muted-foreground">Price Per Share</span>
                      <p className="font-semibold">{property.pricePerShare} ETH</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                      <span className="text-xs text-muted-foreground">Available Shares</span>
                      <p className="font-semibold">{property.availableShares}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                      <span className="text-xs text-muted-foreground">Total Shares</span>
                      <p className="font-semibold">{property.totalShares}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Section */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <span className="w-1 h-5 bg-bauhaus-red rounded-full mr-3"></span>
                  Status
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Badge className={`${property.forSale ? 'bg-bauhaus-blue/10 text-bauhaus-blue' : 'bg-bauhaus-red/10 text-bauhaus-red'} border-none`}>
                    {property.forSale ? "For Sale" : "Not for Sale"}
                  </Badge>
                  <Badge className={`${property.isShared ? 'bg-bauhaus-yellow/10 text-bauhaus-yellow' : 'bg-muted text-muted-foreground'} border-none`}>
                    {property.isShared ? "Fractional Ownership" : "Whole Ownership"}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                <Button
                  onClick={() => router.push(`/purchase/${propertyId}`)}
                  disabled={!property.forSale}
                  variant="primary"
                  className="flex-1"
                >
                  Initiate Purchase
                </Button>
                <Button
                  onClick={() => router.push("/marketplace")}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}