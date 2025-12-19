"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Building2,
  Users,
  AlertTriangle,
  ReceiptText,
  Search,
  Flag,
  List,
  Wallet,
  Globe,
  CheckCircle,
  XCircle,
} from "lucide-react"

// Define types for better readability and type safety
interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  isAlert?: boolean
}

interface SuspiciousActivity {
  id: string
  description: string
  timestamp: string
}

interface FlaggedPair {
  id: string
  user1: string
  user2: string
  reason: string
}

interface Transaction {
  id: string
  sender: string
  receiver: string
  amount: string
  timestamp: string
  status: "normal" | "flagged" | "addressed" | "dismissed"
}

// Helper component for stat cards
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isAlert = false }) => (
  <Card className={`glass ${isAlert ? "border-red-500 dark:border-red-400" : ""}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${isAlert ? "text-red-500 dark:text-red-400" : ""}`}>
        {value}
      </div>
      <p className="text-xs text-muted-foreground">{isAlert ? "Action Required" : "Overview"}</p>
    </CardContent>
  </Card>
)

export default function AdminDashboardPage() {
  const router = useRouter()

  // Simulated Dashboard Data
  const [totalProperties, setTotalProperties] = useState(125)
  const [totalUsers, setTotalUsers] = useState(580)
  const [fraudAlerts, setFraudAlerts] = useState(3) // Initial fraud alerts
  const [todayTransactions, setTodayTransactions] = useState(15)
  const [walletAddress, setWalletAddress] = useState("0xAbc123DeF456GhI789JkL012MnOpQ345RsT678UvW")
  const [currentNetwork, setCurrentNetwork] = useState("Sepolia Testnet")

  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([
    { id: "1", description: "Unusual large transaction detected.", timestamp: "2025-08-06 10:30 AM" },
    { id: "2", description: "Multiple failed login attempts for user X.", timestamp: "2025-08-06 09:15 AM" },
    { id: "3", description: "Property ownership change without full verification.", timestamp: "2025-08-05 04:00 PM" },
  ])

  const [flaggedPairs, setFlaggedPairs] = useState<FlaggedPair[]>([
    { id: "fp1", user1: "0xUserA123", user2: "0xUserB456", reason: "Repeated disputed transactions" },
    { id: "fp2", user1: "0xUserC789", user2: "0xUserD012", reason: "Suspicious property transfers" },
  ])

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "tx1", sender: "0xUser1", receiver: "0xUser2", amount: "1.5 ETH", timestamp: "2025-08-06 11:00 AM", status: "normal" },
    { id: "tx2", sender: "0xUser3", receiver: "0xUser4", amount: "0.8 ETH", timestamp: "2025-08-06 10:45 AM", status: "normal" },
    { id: "tx3", sender: "0xUser5", receiver: "0xUser6", amount: "5.0 ETH", timestamp: "2025-08-06 10:30 AM", status: "flagged" },
    { id: "tx4", sender: "0xUser7", receiver: "0xUser8", amount: "2.2 ETH", timestamp: "2025-08-06 10:15 AM", status: "normal" },
    { id: "tx5", sender: "0xUser9", receiver: "0xUser10", amount: "0.1 ETH", timestamp: "2025-08-06 10:00 AM", status: "dismissed" },
  ])

  // State for Quick Actions
  const [searchUser1, setSearchUser1] = useState("")
  const [searchUser2, setSearchUser2] = useState("")
  const [flagUser1, setFlagUser1] = useState("")
  const [flagUser2, setFlagUser2] = useState("")
  const [flagReason, setFlagReason] = useState("")
  const [showFlaggedPairsList, setShowFlaggedPairsList] = useState(false)

  // Simulate data updates (e.g., new alerts, transactions)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate a new fraud alert every 30 seconds
      if (Math.random() > 0.7) {
        setFraudAlerts((prev) => prev + 1)
        setSuspiciousActivities((prev) => [
          {
            id: Math.random().toString(36).substr(2, 9),
            description: `New suspicious activity detected at ${new Date().toLocaleTimeString()}`,
            timestamp: new Date().toLocaleString(),
          },
          ...prev, // Add new activity to the top
        ])
      }
      // Simulate new transactions
      if (Math.random() > 0.5) {
        setTodayTransactions((prev) => prev + 1)
        setTransactions((prev) => [
          {
            id: Math.random().toString(36).substr(2, 9),
            sender: `0xUser${Math.floor(Math.random() * 100)}`,
            receiver: `0xUser${Math.floor(Math.random() * 100)}`,
            amount: `${(Math.random() * 5).toFixed(2)} ETH`,
            timestamp: new Date().toLocaleTimeString(),
            status: "normal",
          },
          ...prev, // Add new transaction to the top
        ])
      }
    }, 15000) // Every 15 seconds for more dynamic updates

    return () => clearInterval(interval)
  }, [])

  // Mock function for searching transaction history
  const handleSearchTransactions = useCallback(() => {
    if (!searchUser1.trim() || !searchUser2.trim()) {
      alert("Please enter both user addresses to search transaction history.")
      return
    }
    // In a real app, this would query your blockchain or database
    alert(`Searching transaction history between ${searchUser1} and ${searchUser2}... (Mock Search)`)
    // Simulate search results or redirect
  }, [searchUser1, searchUser2])

  // Mock function for flagging/unflagging a user pair
  const handleFlagUserPair = useCallback(() => {
    if (!flagUser1.trim() || !flagUser2.trim() || !flagReason.trim()) {
      alert("Please enter both user addresses and a reason to flag a pair.")
      return
    }

    const existingFlag = flaggedPairs.find(
      (pair) =>
        (pair.user1 === flagUser1 && pair.user2 === flagUser2) ||
        (pair.user1 === flagUser2 && pair.user2 === flagUser1),
    )

    if (existingFlag) {
      // Unflag
      setFlaggedPairs((prev) => prev.filter((pair) => pair.id !== existingFlag.id))
      alert(`User pair ${flagUser1} and ${flagUser2} unflagged.`)
    } else {
      // Flag
      setFlaggedPairs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          user1: flagUser1,
          user2: flagUser2,
          reason: flagReason,
        },
      ])
      alert(`User pair ${flagUser1} and ${flagUser2} flagged for: ${flagReason}`)
    }
    setFlagUser1("")
    setFlagUser2("")
    setFlagReason("")
  }, [flagUser1, flagUser2, flagReason, flaggedPairs])

  // Handle addressing a transaction issue
  const handleAddressIssue = useCallback((transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? { ...tx, status: "addressed" } : tx)),
    )
    alert(`Transaction ${transactionId} issue has been addressed.`)
  }, [])

  // Handle dismissing a transaction issue
  const handleDismissIssue = useCallback((transactionId: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === transactionId ? { ...tx, status: "dismissed" } : tx)),
    )
    alert(`Transaction ${transactionId} issue has been dismissed.`)
  }, [])

  // Helper to get status color for transaction badges
  const getTransactionStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "flagged":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "addressed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "dismissed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    }
  }

  // Helper to get status icon for transaction badges
  const getTransactionStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "flagged":
        return <AlertTriangle className="h-4 w-4" />
      case "addressed":
        return <CheckCircle className="h-4 w-4" />
      case "dismissed":
        return <XCircle className="h-4 w-4" />
      default:
        return <ReceiptText className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background ">
      <Navbar />

      <main className="px-4 py-8">
        <div className="space-y-8">
          {/* Top Header */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-100"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-6">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Land Registry Admin Dashboard</h1>
                    <p className="text-purple-100">Centralized oversight for PropChain operations</p>
                  </div>
                </div>
                <div className="text-right text-white">
                  <div className="flex items-center justify-end text-sm mb-1">
                    <Wallet className="h-4 w-4 mr-2 text-purple-100" />
                    <span className="font-mono">{walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 10)}</span>
                  </div>
                  <div className="flex items-center justify-end text-sm">
                    <Globe className="h-4 w-4 mr-2 text-purple-100" />
                    <span>{currentNetwork}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Properties" value={totalProperties} icon={<Building2 className="h-5 w-5 text-muted-foreground" />} />
            <StatCard title="Total Users" value={totalUsers} icon={<Users className="h-5 w-5 text-muted-foreground" />} />
            <StatCard
              title="Fraud Alerts"
              value={fraudAlerts}
              icon={<AlertTriangle className={`h-5 w-5 ${fraudAlerts > 0 ? "text-red-500 dark:text-red-400" : "text-muted-foreground"}`} />}
              isAlert={fraudAlerts > 0}
            />
            <StatCard title="Today's Transactions" value={todayTransactions} icon={<ReceiptText className="h-5 w-5 text-muted-foreground" />} />
          </div>

          {/* Fraud Monitoring */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500 dark:text-red-400" />
                Fraud Monitoring
              </CardTitle>
              <CardDescription>Monitor and manage suspicious activities and user pairs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert Box */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                  Recent Suspicious Activities
                </h3>
                {suspiciousActivities.length > 0 ? (
                  <ul className="space-y-2">
                    {suspiciousActivities.map((activity) => (
                      <li
                        key={activity.id}
                        className="p-3 bg-red-100/20 dark:bg-red-900/10 rounded-lg border border-red-500/20 text-sm text-red-800 dark:text-red-400 flex justify-between items-center"
                      >
                        <span>{activity.description}</span>
                        <span className="text-xs text-red-600 dark:text-red-300">{activity.timestamp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No suspicious activities detected recently.</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <List className="h-4 w-4 mr-2 text-purple-800 dark:text-purple-100" />
                  Quick Actions
                </h3>

                {/* Search Transaction History */}
                <Card className="glass-sm">
                  <CardContent className="pt-6 space-y-3">
                    <h4 className="font-medium text-md flex items-center">
                      <Search className="h-4 w-4 mr-2 text-purple-800 dark:text-purple-100" />
                      Search Transaction History
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="search-user1">User 1 Wallet Address</Label>
                        <Input
                          id="search-user1"
                          placeholder="e.g., 0x..."
                          value={searchUser1}
                          onChange={(e) => setSearchUser1(e.target.value)}
                          className="bg-background/50 border-purple-800/20 dark:border-purple-100/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="search-user2">User 2 Wallet Address</Label>
                        <Input
                          id="search-user2"
                          placeholder="e.g., 0x..."
                          value={searchUser2}
                          onChange={(e) => setSearchUser2(e.target.value)}
                          className="bg-background/50 border-purple-800/20 dark:border-purple-100/20"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSearchTransactions}
                      className="w-full bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                    >
                      Search Transactions
                    </Button>
                  </CardContent>
                </Card>

                {/* Flag/Unflag User Pair */}
                <Card className="glass-sm">
                  <CardContent className="pt-6 space-y-3">
                    <h4 className="font-medium text-md flex items-center">
                      <Flag className="h-4 w-4 mr-2 text-purple-800 dark:text-purple-100" />
                      Flag/Unflag User Pair
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="flag-user1">User 1 Wallet Address</Label>
                        <Input
                          id="flag-user1"
                          placeholder="e.g., 0x..."
                          value={flagUser1}
                          onChange={(e) => setFlagUser1(e.target.value)}
                          className="bg-background/50 border-purple-800/20 dark:border-purple-100/20"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="flag-user2">User 2 Wallet Address</Label>
                        <Input
                          id="flag-user2"
                          placeholder="e.g., 0x..."
                          value={flagUser2}
                          onChange={(e) => setFlagUser2(e.target.value)}
                          className="bg-background/50 border-purple-800/20 dark:border-purple-100/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="flag-reason">Reason for Flagging</Label>
                      <Input
                        id="flag-reason"
                        placeholder="e.g., Suspicious activity, multiple disputes"
                        value={flagReason}
                        onChange={(e) => setFlagReason(e.target.value)}
                        className="bg-background/50 border-purple-800/20 dark:border-purple-100/20"
                      />
                    </div>
                    <Button
                      onClick={handleFlagUserPair}
                      className="w-full bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500"
                    >
                      {flaggedPairs.some(
                        (pair) =>
                          (pair.user1 === flagUser1 && pair.user2 === flagUser2) ||
                          (pair.user1 === flagUser2 && pair.user2 === flagUser1),
                      )
                        ? "Unflag Pair"
                        : "Flag Pair"}
                    </Button>
                  </CardContent>
                </Card>

                {/* View Flagged Pairs List */}
                <Card className="glass-sm">
                  <CardContent className="pt-6 space-y-3">
                    <Button
                      onClick={() => setShowFlaggedPairsList((prev) => !prev)}
                      variant="outline"
                      className="w-full border-purple-800/20 dark:border-purple-100/20 bg-transparent flex items-center justify-center"
                    >
                      <List className="h-4 w-4 mr-2" />
                      {showFlaggedPairsList ? "Hide Flagged Pairs" : "View Flagged Pairs List"}
                    </Button>
                    {showFlaggedPairsList && (
                      <div className="mt-4 space-y-2">
                        {flaggedPairs.length > 0 ? (
                          <ul className="space-y-2">
                            {flaggedPairs.map((pair) => (
                              <li
                                key={pair.id}
                                className="p-3 bg-red-100/10 dark:bg-red-900/5 rounded-lg border border-red-500/10 text-sm"
                              >
                                <p className="font-medium text-red-800 dark:text-red-400">
                                  Users: {pair.user1} & {pair.user2}
                                </p>
                                <p className="text-xs text-muted-foreground">Reason: {pair.reason}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground text-sm text-center">No user pairs are currently flagged.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Monitoring */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ReceiptText className="mr-2 h-5 w-5 text-purple-800 dark:text-purple-100" />
                Transaction Monitoring
              </CardTitle>
              <CardDescription>View and manage all blockchain transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-purple-800/20 dark:divide-purple-100/20">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Sender
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Receiver
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-800/10 dark:divide-purple-100/10">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-background/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            {tx.id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {tx.sender}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {tx.receiver}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            {tx.amount}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {tx.timestamp}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={getTransactionStatusColor(tx.status)}>
                              {getTransactionStatusIcon(tx.status)}
                              <span className="ml-1 capitalize">{tx.status}</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {tx.status === "flagged" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500/20 text-green-600 hover:bg-green-500/10"
                                  onClick={() => handleAddressIssue(tx.id)}
                                >
                                  Address
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-500/20 text-gray-600 hover:bg-gray-500/10"
                                  onClick={() => handleDismissIssue(tx.id)}
                                >
                                  Dismiss
                                </Button>
                              </>
                            )}
                            {tx.status === "normal" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                                onClick={() =>
                                  setTransactions((prev) =>
                                    prev.map((t) => (t.id === tx.id ? { ...t, status: "flagged" } : t)),
                                  )
                                }
                              >
                                Flag
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No transactions to display.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
