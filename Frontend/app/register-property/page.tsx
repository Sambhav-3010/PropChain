"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import axios from "axios"

import { ethers } from "ethers"
import LandRegistration1155ABI from "@/lib/LandReg.json"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const CONTRACT_ADDRESS = "0xYourContractAddressHere"


export default function RegisterPropertyPage() {
  const [fullName, setFullName] = useState("")
  const [govtIdNumber, setGovtIdNumber] = useState("")
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [propertyDeedFile, setPropertyDeedFile] = useState<File | null>(null)
  const [liveCaptureFile, setLiveCaptureFile] = useState<File | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()

    formData.append("full_name", fullName)
    formData.append("govt_id_number", govtIdNumber)

    if (aadhaarFile) {
      formData.append("files", new File([aadhaarFile], `${fullName}_id.${aadhaarFile.name.split('.').pop()}`))
    }
    if (propertyDeedFile) {
      formData.append("files", new File([propertyDeedFile], `${fullName}_deed.${propertyDeedFile.name.split('.').pop()}`))
    }
    if (liveCaptureFile) {
      formData.append("files", new File([liveCaptureFile], `${fullName}_live.${liveCaptureFile.name.split('.').pop()}`))
    }

    try {
      const res = await axios.post("http://localhost:8000/verify_identity", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      console.log("Success:", res.data)
      router.push('/success')
      toast.success("Property registered successfully!")
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message)
      toast.error("Failed to register property. Please try again.")
      router.push('/reject')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient px-4 py-8 ">
      <div className="w-full max-w-2xl bg-white/60 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center text-purple-800 mb-6">Register Property</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-purple-700">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-purple-700">Government ID Number</Label>
            <Input
              value={govtIdNumber}
              onChange={(e) => setGovtIdNumber(e.target.value)}
              required
              placeholder="Format:XXXX XXXX XXXX"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-purple-700">Aadhaar Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
              required
              className="mt-1 cursor-pointer"
            />
          </div>
          <div>
            <Label className="text-purple-700">Property Document</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setPropertyDeedFile(e.target.files?.[0] || null)}
              required
              className="mt-1 cursor-pointer"
            />
          </div>
          <div>
            <Label className="text-purple-700">Live Capture</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setLiveCaptureFile(e.target.files?.[0] || null)}
              required
              className="mt-1 cursor-pointer"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-fuchsia-600 hover:to-purple-700 text-white font-semibold"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  )
}
