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
  accent?: string
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
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isAlert = false, accent = "bg-bauhaus-blue" }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${isAlert ? "text-bauhaus-red" : "text-foreground"}`}>
            {value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{isAlert ? "Action Required" : "Overview"}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)]`}>
          {icon}
        </div>
      </div>
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
        return "bg-bauhaus-red/10 text-bauhaus-red"
      case "addressed":
        return "bg-bauhaus-blue/10 text-bauhaus-blue"
      case "dismissed":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-bauhaus-yellow/10 text-bauhaus-yellow"
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 py-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Top Header */}
          <Card className="relative overflow-hidden bauhaus-bg-pattern">
            <div className="relative px-6 md:px-8 py-8 md:py-12 z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)] mr-6">
                    <Building2 className="h-8 w-8 text-bauhaus-blue" />
                  </div>
                  <div>
                    <div className="w-12 h-1 mb-3 flex">
                      <div className="flex-1 bg-bauhaus-red"></div>
                      <div className="flex-1 bg-bauhaus-yellow"></div>
                      <div className="flex-1 bg-bauhaus-blue"></div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Land Registry Admin Dashboard</h1>
                    <p className="text-muted-foreground">Centralized oversight for PropChain operations</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end text-sm mb-1 text-muted-foreground">
                    <Wallet className="h-4 w-4 mr-2" />
                    <span className="font-mono">{walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 10)}</span>
                  </div>
                  <div className="flex items-center justify-end text-sm text-muted-foreground">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>{currentNetwork}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Stats */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Properties" value={totalProperties} icon={<Building2 className="h-5 w-5 text-bauhaus-blue" />} />
            <StatCard title="Total Users" value={totalUsers} icon={<Users className="h-5 w-5 text-bauhaus-yellow" />} />
            <StatCard
              title="Fraud Alerts"
              value={fraudAlerts}
              icon={<AlertTriangle className={`h-5 w-5 ${fraudAlerts > 0 ? "text-bauhaus-red" : "text-muted-foreground"}`} />}
              isAlert={fraudAlerts > 0}
            />
            <StatCard title="Today's Transactions" value={todayTransactions} icon={<ReceiptText className="h-5 w-5 text-bauhaus-blue" />} />
          </div>

          {/* Fraud Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] mr-3">
                  <AlertTriangle className="h-4 w-4 text-bauhaus-red" />
                </div>
                Fraud Monitoring
              </CardTitle>
              <CardDescription>Monitor and manage suspicious activities and user pairs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert Box */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <span className="w-1 h-5 bg-bauhaus-red rounded-full mr-3"></span>
                  Recent Suspicious Activities
                </h3>
                {suspiciousActivities.length > 0 ? (
                  <ul className="space-y-2">
                    {suspiciousActivities.map((activity) => (
                      <li
                        key={activity.id}
                        className="p-3 rounded-xl bg-bauhaus-red/5 border border-bauhaus-red/20 text-sm flex justify-between items-center"
                      >
                        <span className="text-foreground">{activity.description}</span>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No suspicious activities detected recently.</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <span className="w-1 h-5 bg-bauhaus-yellow rounded-full mr-3"></span>
                  Quick Actions
                </h3>

                {/* Search Transaction History */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <h4 className="font-medium flex items-center">
                      <Search className="h-4 w-4 mr-2 text-bauhaus-blue" />
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
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="search-user2">User 2 Wallet Address</Label>
                        <Input
                          id="search-user2"
                          placeholder="e.g., 0x..."
                          value={searchUser2}
                          onChange={(e) => setSearchUser2(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSearchTransactions}
                      variant="primary"
                      className="w-full"
                    >
                      Search Transactions
                    </Button>
                  </CardContent>
                </Card>

                {/* Flag/Unflag User Pair */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <h4 className="font-medium flex items-center">
                      <Flag className="h-4 w-4 mr-2 text-bauhaus-red" />
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
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="flag-user2">User 2 Wallet Address</Label>
                        <Input
                          id="flag-user2"
                          placeholder="e.g., 0x..."
                          value={flagUser2}
                          onChange={(e) => setFlagUser2(e.target.value)}
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
                      />
                    </div>
                    <Button
                      onClick={handleFlagUserPair}
                      variant="accent"
                      className="w-full"
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
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Button
                      onClick={() => setShowFlaggedPairsList((prev) => !prev)}
                      variant="outline"
                      className="w-full flex items-center justify-center"
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
                                className="p-3 rounded-xl bg-bauhaus-red/5 border border-bauhaus-red/10 text-sm"
                              >
                                <p className="font-medium text-foreground">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] mr-3">
                  <ReceiptText className="h-4 w-4 text-bauhaus-blue" />
                </div>
                Transaction Monitoring
              </CardTitle>
              <CardDescription>View and manage all blockchain transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Sender
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Receiver
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
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
                            <Badge className={`${getTransactionStatusColor(tx.status)} border-none`}>
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
                                  className="text-bauhaus-blue hover:bg-bauhaus-blue/10"
                                  onClick={() => handleAddressIssue(tx.id)}
                                >
                                  Address
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
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
                                className="text-bauhaus-red hover:bg-bauhaus-red/10"
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
