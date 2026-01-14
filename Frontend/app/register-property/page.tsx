"use client"

import React, { useState, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import axios from "axios"

import { ethers } from "ethers"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FileText, Upload, User, Camera, RefreshCw, X } from "lucide-react"

const CONTRACT_ADDRESS = "0xYourContractAddressHere"


export default function RegisterPropertyPage() {
  const [fullName, setFullName] = useState("")
  const [govtIdNumber, setGovtIdNumber] = useState("")
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null)
  const [propertyDeedFile, setPropertyDeedFile] = useState<File | null>(null)
  const [liveCaptureFile, setLiveCaptureFile] = useState<File | null>(null)
  const router = useRouter()

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setIsVideoReady(false)
      setCapturedImage(null)
      setLiveCaptureFile(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })

      streamRef.current = stream
      setIsCameraActive(true) // Video element will render now

    } catch (err: any) {
      console.error('Camera access error:', err)
      if (err.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access.')
      } else if (err.name === 'NotFoundError') {
        toast.error('No camera found on this device.')
      } else {
        toast.error('Could not access camera: ' + err.message)
      }
    }
  }, [])

  // Assign stream to video when element becomes available
  React.useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play()
        setIsVideoReady(true)
      }
    }
  }, [isCameraActive])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setIsVideoReady(false)
  }, [])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Video not ready yet. Please wait a moment.')
      return
    }

    const context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageDataUrl)

      // Convert to File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'live_capture.jpg', { type: 'image/jpeg' })
          setLiveCaptureFile(file)
          toast.success('Photo captured!')
        }
      }, 'image/jpeg', 0.8)

      stopCamera()
    }
  }, [stopCamera])

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setLiveCaptureFile(null)
    startCamera()
  }, [startCamera])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()

    formData.append("full_name", fullName)
    formData.append("govt_id_number", govtIdNumber)

    if (aadhaarFile) {
      formData.append("files", new File([aadhaarFile], `${fullName}_id.${aadhaarFile.name.split('.').pop()}`, { type: aadhaarFile.type || 'image/jpeg' }))
    }
    if (propertyDeedFile) {
      formData.append("files", new File([propertyDeedFile], `${fullName}_deed.${propertyDeedFile.name.split('.').pop()}`, { type: propertyDeedFile.type || 'image/jpeg' }))
    }
    if (liveCaptureFile) {
      formData.append("files", new File([liveCaptureFile], `${fullName}_live.jpg`, { type: liveCaptureFile.type || 'image/jpeg' }))
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
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-8 px-4 relative overflow-hidden">
        {/* Bauhaus Geometric Background */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-bauhaus-blue opacity-5"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-bauhaus-red opacity-5 rotate-45"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-bauhaus-yellow opacity-5"></div>

        <div className="max-w-2xl mx-auto relative z-10">
          <Card className="relative overflow-hidden">
            <CardHeader className="text-center">
              {/* Logo Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
                <FileText className="h-8 w-8 text-bauhaus-blue" />
              </div>

              {/* Bauhaus accent */}
              <div className="w-16 h-1 mx-auto mb-4 flex">
                <div className="flex-1 bg-bauhaus-red"></div>
                <div className="flex-1 bg-bauhaus-yellow"></div>
                <div className="flex-1 bg-bauhaus-blue"></div>
              </div>

              <CardTitle className="text-2xl font-bold">Register Property</CardTitle>
              <CardDescription>
                Submit your documents for verification
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-foreground">
                    <span className="w-1 h-5 bg-bauhaus-red rounded-full mr-3"></span>
                    Personal Information
                  </h3>

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Government ID Number</Label>
                    <Input
                      value={govtIdNumber}
                      onChange={(e) => setGovtIdNumber(e.target.value)}
                      required
                      placeholder="Format: XXXX XXXX XXXX"
                    />
                  </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-foreground">
                    <span className="w-1 h-5 bg-bauhaus-yellow rounded-full mr-3"></span>
                    Required Documents
                  </h3>

                  <div className="space-y-2">
                    <Label>Aadhaar Image</Label>
                    <div className="p-4 rounded-xl bg-background shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)]">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                        required
                        className="border-none shadow-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Live Capture</Label>
                    <div className="p-4 rounded-xl bg-background shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)]">
                      {/* Hidden canvas for capturing */}
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Camera not started yet */}
                      {!isCameraActive && !capturedImage && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">Take a live photo for verification</p>
                          <Button type="button" variant="outline" onClick={startCamera}>
                            <Camera className="mr-2 h-4 w-4" />
                            Open Camera
                          </Button>
                        </div>
                      )}

                      {/* Camera active - show video */}
                      {isCameraActive && (
                        <div className="space-y-4">
                          <div className="relative rounded-lg overflow-hidden bg-black min-h-48 flex items-center justify-center">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full max-h-64 object-cover"
                            />
                            {!isVideoReady && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="text-white text-sm">Loading camera...</div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="primary"
                              onClick={capturePhoto}
                              className="flex-1"
                              disabled={!isVideoReady}
                            >
                              <Camera className="mr-2 h-4 w-4" />
                              {isVideoReady ? 'Capture Photo' : 'Loading...'}
                            </Button>
                            <Button type="button" variant="outline" onClick={stopCamera}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Photo captured - show preview */}
                      {capturedImage && (
                        <div className="space-y-4">
                          <div className="relative rounded-lg overflow-hidden">
                            <img
                              src={capturedImage}
                              alt="Captured"
                              className="w-full max-h-64 object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                ✓ Captured
                              </span>
                            </div>
                          </div>
                          <Button type="button" variant="outline" onClick={retakePhoto} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retake Photo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Verification
                </Button>
              </form>

              {/* Note */}
              <div className="mt-6 p-4 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> All documents will be securely processed and verified.
                  Your information is protected using blockchain technology.
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
