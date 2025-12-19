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
import { Building2, Wallet, DollarSign, CheckCircle, Loader2 } from "lucide-react"

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center glass">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/marketplace")}>Back to Marketplace</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <p className="ml-4 text-lg text-muted-foreground">Loading property details...</p>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center glass">
            <CardContent className="pt-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-600 to-green-300 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your purchase for "{property.title}" has been successfully initiated.
                Transaction details will be updated on the blockchain shortly.
              </p>
              <Button
                onClick={() => router.push("/profile")}
                className="bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
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
    <div className="min-h-screen bg-background ">
      <Navbar />

      <main className="px-4 py-8">
        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-6">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Initiate Purchase</h1>
                  <p className="text-purple-100">Complete your property transaction securely</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Property Details Card */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                  Property Details
                </CardTitle>
                <CardDescription>Review the property you are about to purchase.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={property.image || "/placeholder.svg"}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/300x200/E0E0E0/333333?text=${encodeURIComponent(property.title)}`;
                  }}
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{property.title}</h3>
                  <p className="text-muted-foreground flex items-center">
                    <Building2 className="mr-2 h-4 w-4" /> {property.location}
                  </p>
                  <p className="text-muted-foreground flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" /> {property.price}
                  </p>
                  <p className="text-muted-foreground text-sm">Area: {property.area}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details Card */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
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
                    className="bg-background/50 border-purple-800/20 dark:border-purple-100/20"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-wallet">Recipient Wallet Address</Label>
                  <Input
                    id="to-wallet"
                    value={toWalletAddress}
                    readOnly
                    className="bg-background/50 border-purple-800/20 dark:border-purple-100/20 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={amount}
                    readOnly
                    className="bg-background/50 border-purple-800/20 dark:border-purple-100/20 cursor-not-allowed"
                    disabled
                  />
                </div>

                {error && (
                  <div className="bg-red-100/20 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
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
