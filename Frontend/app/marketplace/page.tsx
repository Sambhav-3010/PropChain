"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Search,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

import { ethers } from "ethers";
import contractABI from "@/lib/LandReg.json"; // adjust path
import { getContract, connectWallet } from "@/lib/ethers"; // adjust path
import { convertUsdToEth } from '@/lib/price'; // Import the conversion function
import { useAuth } from '@/hooks/use-auth';
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
  ethPrice: string; // Required field now
};




export default function MarketplacePage() {
  const { isAuthenticated, userEmail, isLoading } = useAuth();
  const [account, setAccount] = useState<string>("");
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [buying, setBuying] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Tokenized":
        return "bg-bauhaus-blue/10 text-bauhaus-blue border-bauhaus-blue/20";
      case "Pending Sale":
        return "bg-bauhaus-yellow/10 text-bauhaus-yellow border-bauhaus-yellow/20";
      case "Smart Contract Verified":
        return "bg-bauhaus-blue/10 text-bauhaus-blue border-bauhaus-blue/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const fetchAllProperties = async () => {
    setLoading(true);
    try {
      const contract = await getContract();
      const ids: number[] = await contract.getPropertiesForSale();

      // Get the current user's wallet address once before the loop
      // Get the current user's wallet address
      const user = await connectWallet();

      let landList: Land[] = [];

      if (user) {
        landList = (await Promise.all(
          ids.map(async (id: number) => {
            const ownerAddress = await contract.getLandDetails(id);

            // --- START DEBUGGING LOGS ---
            console.log(`--- Checking Land ID: ${id} ---`);

            console.log("Owner result from contract:", ownerAddress[1]);

            console.log("Current user address:", user);

            // Assuming ownerResult might be an object or array, let's get the string
            // Adjust this line based on what you see in the logs!

            const isOwner = ownerAddress[1].toLowerCase() == user.toLowerCase();

            console.log("Is current user the owner?", isOwner);
            // --- END DEBUGGING LOGS ---

            if (isOwner) {
              return null; // Don't show this land
            }

            const details = await contract.getMarketplaceDetails(id);
            const ethPriceStr = await convertUsdToEth(Number(details[4]));
            return {
              id,
              propertyAddress: details[0],
              totalLandArea: Number(details[1]),
              propertyName: details[2],
              forSale: details[3],
              wholePrice: Number(details[4]),
              isShared: details[5],
              totalShares: Number(details[6]),
              availableShares: Number(details[7]),
              pricePerShare: Number(details[8]),
              ethPrice: ethPriceStr,
            };
          })
        )).filter((land): land is Land => land !== null);
      }

      setLands(landList);
    } catch (err) {
      console.error("Error loading properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (landId: number, price: number, pps: number) => {
    try {

      const contract = await getContract();
      const details = await contract.getMarketplaceDetails(landId);
      setBuying(landId);
      if (details[7] == 0) {
        const tx = await contract.buyWhole(landId, { value: price });
        await tx.wait();
        alert("Land purchased successfully!");
        fetchAllProperties(); // Refresh list
      }
      else {
        const input = prompt("Enter number of shares to buy :");
        if (!input) throw new Error("Invalid input");
        const shares = parseInt(input);
        if (isNaN(shares) || shares < 1 || shares > details[7]) throw new Error("Invalid number of shares");

        const ppsBigInt = BigInt(pps);
        const sharesBigInt = BigInt(shares);

        // 2. The result will also be a BigInt, which is what ethers expects
        const totalCostInWei = ppsBigInt * sharesBigInt;

        const tx = await contract.buyShares(landId, shares, {
          value: totalCostInWei
        });

        await tx.wait();
        alert("Shares purchased successfully!");
        fetchAllProperties(); // Refresh list
      }
    } catch (err) {
      console.error("Error buying land:", err);
      alert("Failed to buy land.");
    } finally {
      setBuying(null);
    }
  };

  const init = async () => {
    const acc = await connectWallet();
    if (acc) setAccount(acc);
    await fetchAllProperties();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* Header */}
            <Card className="relative overflow-hidden bauhaus-bg-pattern">
              <div className="relative px-6 md:px-8 py-8 md:py-12 z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    {/* Bauhaus accent */}
                    <div className="w-12 h-1 mb-4 flex">
                      <div className="flex-1 bg-bauhaus-red"></div>
                      <div className="flex-1 bg-bauhaus-yellow"></div>
                      <div className="flex-1 bg-bauhaus-blue"></div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      Property Marketplace
                    </h1>
                    <p className="text-muted-foreground">
                      Discover verified real estate with blockchain technology
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button variant="primary">
                      <Zap className="mr-2 h-4 w-4" />
                      AI Recommendations
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Property Listing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center">
                  <span className="w-1 h-6 bg-bauhaus-blue rounded-full mr-3"></span>
                  Available Properties
                </h2>
              </div>

              {loading ? (
                <Card className="p-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-background flex items-center justify-center shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)]">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-muted-foreground">Loading properties...</p>
                </Card>
              ) : lands.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No properties currently for sale.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lands.map((land) => (
                    <Card
                      key={land.id}
                      className="overflow-hidden group"
                    >
                      <div className="aspect-video bg-muted relative">
                        <img
                          src="/placeholder.svg"
                          alt={land.propertyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/300x200/E0E0E0/333333?text=${encodeURIComponent(
                              land.propertyName
                            )}`;
                          }}
                        />
                        <div className="absolute bottom-3 left-3">
                          <Badge className={`${land.isShared ? 'bg-bauhaus-yellow/90 text-bauhaus-black' : 'bg-bauhaus-blue/90 text-white'} border-none`}>
                            {land.isShared ? "Fractional" : "Whole"}
                          </Badge>
                        </div>
                      </div>

                      <CardHeader>
                        <CardTitle className="text-lg">
                          {land.propertyName}
                        </CardTitle>
                        <CardDescription className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {land.propertyAddress}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                            <span className="text-muted-foreground text-xs">Area</span>
                            <p className="font-semibold">
                              {land.totalLandArea} sq.ft
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                            <span className="text-muted-foreground text-xs">Type</span>
                            <p className="font-semibold">
                              {land.isShared ? "Fractional" : "Whole Parcel"}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                            <span className="text-muted-foreground text-xs">Shares</span>
                            <p className="font-semibold">{land.totalShares}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-background shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]">
                            <span className="text-muted-foreground text-xs">Available</span>
                            <p className="font-semibold">
                              {land.availableShares}
                            </p>
                          </div>
                        </div>

                        {land.forSale && (
                          <>
                            <div className="text-xl font-bold text-foreground flex items-center">
                              <span className="w-2 h-2 rounded-full bg-bauhaus-blue mr-2"></span>
                              {land.ethPrice} ETH
                            </div>
                            <Button
                              variant="primary"
                              className="w-full"
                              onClick={() =>
                                handleBuy(land.id, land.wholePrice, land.pricePerShare)
                              }
                              disabled={buying === land.id}
                            >
                              {buying === land.id ? "Processing..." : "Buy Now"}
                            </Button>

                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
