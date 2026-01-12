"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Building2, Wallet, DollarSign, CheckCircle, Loader2, MapPin } from "lucide-react"

// Mock property data (should ideally come from a global state or API call)
const mockProperties = [
  {
    id: 1,
    title: "Luxury Villa with Pool",
    location: "Gurgaon, Haryana",
    area: "4,500 sq ft",
    price: "₹2.5 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Luxury+Villa",
    status: "Tokenized",
    type: "Villa",
    bedrooms: 4,
    bathrooms: 3,
    verified: true,
    views: 1247,
    likes: 89,
  },
  {
    id: 2,
    title: "Modern Apartment Complex",
    location: "Mumbai, Maharashtra",
    area: "1,200 sq ft",
    price: "₹1.8 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Modern+Apartment",
    status: "Pending Sale",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    verified: true,
    views: 892,
    likes: 67,
  },
  {
    id: 3,
    title: "Commercial Office Space",
    location: "Bangalore, Karnataka",
    area: "8,000 sq ft",
    price: "₹5.2 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Office+Space",
    status: "Smart Contract Verified",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 4,
    verified: true,
    views: 2156,
    likes: 134,
  },
  {
    id: 4,
    title: "Penthouse with City View",
    location: "Delhi, NCR",
    area: "3,200 sq ft",
    price: "₹4.1 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Penthouse",
    status: "Tokenized",
    type: "Penthouse",
    bedrooms: 3,
    bathrooms: 3,
    verified: true,
    views: 1678,
    likes: 156,
  },
  {
    id: 5,
    title: "Farmhouse with Land",
    location: "Lonavala, Maharashtra",
    area: "12,000 sq ft",
    price: "₹3.8 Cr",
    image: "/placeholder.svg?height=200&width=300&text=Farmhouse",
    status: "Pending Sale",
    type: "Farmhouse",
    bedrooms: 5,
    bathrooms: 4,
    verified: false,
    views: 743,
    likes: 45,
  },
  {
    id: 6,
    title: "Studio Apartment",
    location: "Pune, Maharashtra",
    area: "650 sq ft",
    price: "₹85 L",
    image: "/placeholder.svg?height=200&width=300&text=Studio",
    status: "Smart Contract Verified",
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    verified: true,
    views: 456,
    likes: 23,
  },
];

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = parseInt(params.propertyId as string) // Get propertyId from URL

  const [property, setProperty] = useState<typeof mockProperties[0] | null>(null)
  const [fromWalletAddress, setFromWalletAddress] = useState("")
  const [toWalletAddress, setToWalletAddress] = useState("0xPropertyOwnerContractAddress") // Mock owner/contract address
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, you'd fetch property details from an API/blockchain
    const foundProperty = mockProperties.find((p) => p.id === propertyId)
    if (foundProperty) {
      setProperty(foundProperty)
      setAmount(foundProperty.price) // Pre-fill amount with property price
    } else {
      // Handle case where property is not found
      setError("Property not found.")
    }

    // Simulate fetching user's wallet address
    const userWallet = localStorage.getItem("userWalletAddress") || "0xYourWalletAddress1234567890"
    setFromWalletAddress(userWallet)
  }, [propertyId])

  const handlePayment = useCallback(async () => {
    setError(null)
    if (!fromWalletAddress || !toWalletAddress || !amount) {
      setError("Please fill in all payment details.")
      return
    }

    setIsLoading(true)

    try {
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate network delay

      // Simulate success or failure
      if (Math.random() > 0.2) { // 80% chance of success
        setPaymentSuccess(true)
        // In a real app, you'd update blockchain state or a database here
        console.log("Payment successful!", { fromWalletAddress, toWalletAddress, amount })
        // Optionally, store transaction details in local storage or a global state
        localStorage.setItem("lastTransaction", JSON.stringify({
          propertyId,
          amount,
          timestamp: new Date().toISOString(),
          status: "completed"
        }));
      } else {
        throw new Error("Payment failed due to network error or insufficient funds.")
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during payment.")
      setPaymentSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }, [fromWalletAddress, toWalletAddress, amount, propertyId])

  if (error && !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
              <Building2 className="h-8 w-8 text-bauhaus-red" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/marketplace")} variant="primary">Back to Marketplace</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)] mr-4">
          <Loader2 className="h-8 w-8 animate-spin text-bauhaus-blue" />
        </div>
        <p className="text-lg text-muted-foreground">Loading property details...</p>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center relative overflow-hidden bauhaus-bg-pattern">
            <CardContent className="relative pt-8 pb-8 z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
                <CheckCircle className="h-10 w-10 text-bauhaus-blue" />
              </div>
              <div className="w-12 h-1 mx-auto mb-4 flex">
                <div className="flex-1 bg-bauhaus-red"></div>
                <div className="flex-1 bg-bauhaus-yellow"></div>
                <div className="flex-1 bg-bauhaus-blue"></div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your purchase for "{property.title}" has been successfully initiated.
                Transaction details will be updated on the blockchain shortly.
              </p>
              <Button
                onClick={() => router.push("/profile")}
                variant="primary"
              >
                Go to My Properties
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 py-8 max-w-3xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <Card className="relative overflow-hidden bauhaus-bg-pattern">
            <div className="relative px-6 md:px-8 py-8 md:py-12 z-10">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)] mr-6">
                  <DollarSign className="h-8 w-8 text-bauhaus-yellow" />
                </div>
                <div>
                  <div className="w-10 h-1 mb-2 flex">
                    <div className="flex-1 bg-bauhaus-red"></div>
                    <div className="flex-1 bg-bauhaus-yellow"></div>
                    <div className="flex-1 bg-bauhaus-blue"></div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Initiate Purchase</h1>
                  <p className="text-muted-foreground">Complete your property transaction securely</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Property Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] mr-3">
                    <Building2 className="h-4 w-4 text-bauhaus-blue" />
                  </div>
                  Property Details
                </CardTitle>
                <CardDescription>Review the property you are about to purchase.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-xl overflow-hidden shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)]">
                  <img
                    src={property.image || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/300x200/E0E0E0/333333?text=${encodeURIComponent(property.title)}`;
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">{property.title}</h3>
                  <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="mr-2 h-4 w-4" /> {property.location}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                      <span className="text-xs text-muted-foreground">Price</span>
                      <p className="font-bold text-foreground flex items-center">
                        <span className="w-2 h-2 rounded-full bg-bauhaus-blue mr-2"></span>
                        {property.price}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                      <span className="text-xs text-muted-foreground">Area</span>
                      <p className="font-medium text-foreground">{property.area}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] mr-3">
                    <Wallet className="h-4 w-4 text-bauhaus-yellow" />
                  </div>
                  Payment Information
                </CardTitle>
                <CardDescription>Enter your wallet details to proceed with payment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from-wallet">Your Wallet Address</Label>
                  <Input
                    id="from-wallet"
                    placeholder="e.g., 0xYourWalletAddress..."
                    value={fromWalletAddress}
                    onChange={(e) => setFromWalletAddress(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-wallet">Recipient Wallet Address</Label>
                  <Input
                    id="to-wallet"
                    value={toWalletAddress}
                    readOnly
                    className="cursor-not-allowed opacity-70"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={amount}
                    readOnly
                    className="cursor-not-allowed opacity-70"
                    disabled
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-bauhaus-red/10 border border-bauhaus-red/20 text-sm text-bauhaus-red">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  variant="primary"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
