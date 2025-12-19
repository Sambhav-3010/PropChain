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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Search,
  Filter,
  Heart,
  Eye,
  Building2,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
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
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Pending Sale":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Smart Contract Verified":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
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
      
      const isOwner = ownerAddress[1].toLowerCase()==user.toLowerCase();
     
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
      if(details[7]==0)
      {
      const tx = await contract.buyWhole(landId, { value: price });
      await tx.wait();
      alert("Land purchased successfully!");
      fetchAllProperties(); // Refresh list
      }
      else
      {
       const input = prompt("Enter number of shares to buy :");
        if(!input) throw new Error("Invalid input");
        const shares = parseInt(input);
        if(isNaN(shares) || shares<1 || shares>details[7]) throw new Error("Invalid number of shares");

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
    <div className="min-h-screen bg-background ">
      <main className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
            <div className="relative px-8 py-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Property Marketplace
                  </h1>
                  <p className="text-purple-100">
                    Discover verified real estate with blockchain technology
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                    <Zap className="mr-2 h-4 w-4" />
                    AI Recommendations
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Property Listing */}
          <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-100">
              Available Properties
            </h2>

            {loading ? (
              <p className="text-muted-foreground">Loading properties...</p>
            ) : lands.length === 0 ? (
              <p className="text-muted-foreground">
                No properties currently for sale.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lands.map((land) => (
                  <Card
                    key={land.id}
                    className="overflow-hidden glass border-purple-800/20 dark:border-purple-100/20 hover:shadow-lg transition-shadow"
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
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-green-600/80 text-white">
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
                        <div>
                          <span className="text-muted-foreground">Area:</span>
                          <p className="font-medium">
                            {land.totalLandArea} sq.ft
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium">
                            {land.isShared ? "Fractional" : "Whole Parcel"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Shares:</span>
                          <p className="font-medium">{land.totalShares}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Available:
                          </span>
                          <p className="font-medium">
                            {land.availableShares}
                          </p>
                        </div>
                      </div>

                      {land.forSale && (
                        <>
                          <div className="text-xl font-bold text-foreground">
                            {land.ethPrice} ETH
                          </div>
                          <Button
                            className={`w-full py-2 mt-2 text-white ${
                              buying === land.id
                                ? "bg-gray-500"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                            onClick={() =>
                              handleBuy(land.id, land.wholePrice,land.pricePerShare)
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
