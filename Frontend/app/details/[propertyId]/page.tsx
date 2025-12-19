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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <p className="ml-4 text-lg">Loading Property Details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/marketplace")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    )
  }

  if (!property) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
            <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
            <p className="text-muted-foreground">We couldn't find the details for this property.</p>
            <Button onClick={() => router.push("/marketplace")} className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
            </Button>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 py-8">
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-400"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-6">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{property.propertyName}</h1>
                    <p className="text-purple-100">{property.propertyAddress}</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </div>
          </div>

          {/* Property Details Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                Property Overview
              </CardTitle>
              <CardDescription>Detailed information fetched from the blockchain.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Placeholder */}
              <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                 <p className="text-muted-foreground">[ Property Image Placeholder ]</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                        Details
                    </h3>
                    <p className="text-muted-foreground"><strong>Address:</strong> {property.propertyAddress}</p>
                    <p className="text-muted-foreground"><strong>Total Area:</strong> {property.totalLandArea} sq. meters</p>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                        <DollarSign className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                        Pricing
                    </h3>
                    <p className="text-2xl font-bold text-foreground">{property.wholePrice} ETH</p>
                    <p className="text-muted-foreground">For the entire property</p>
                </div>
              </div>
              
              {/* Fractional Ownership Details */}
              {property.isShared && (
                <div className="space-y-4 border-b pb-6">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Layers className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                        Fractional Ownership Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Price Per Share:</span>
                            <p className="font-medium">{property.pricePerShare} ETH</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Available Shares:</span>
                            <p className="font-medium">{property.availableShares}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Total Shares:</span>
                            <p className="font-medium">{property.totalShares}</p>
                        </div>
                    </div>
                </div>
              )}

              {/* Status Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center">
                    <Hash className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                    Status
                </h3>
                <div className="flex flex-wrap gap-4">
                    <Badge className={property.forSale ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {property.forSale ? "For Sale" : "Not for Sale"}
                    </Badge>
                     <Badge className={property.isShared ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                        {property.isShared ? "Fractional Ownership" : "Whole Ownership"}
                    </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  onClick={() => router.push(`/purchase/${propertyId}`)}
                  disabled={!property.forSale}
                  className="flex-1 bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Initiate Purchase
                </Button>
                <Button
                  onClick={() => router.push("/marketplace")}
                  variant="outline"
                  className="flex-1 border-purple-800/20 dark:border-purple-100/20 hover:bg-purple-800/5 dark:hover:bg-purple-100/5 bg-transparent"
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