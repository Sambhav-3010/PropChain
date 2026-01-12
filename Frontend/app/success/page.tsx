import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background relative overflow-hidden">
        {/* Bauhaus Geometric Background */}
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-bauhaus-blue opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-bauhaus-yellow opacity-10 rotate-45"></div>

        <Card className="max-w-md w-full text-center relative overflow-hidden bauhaus-bg-pattern">
          <CardContent className="relative pt-10 pb-10 z-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
              <CheckCircle2 className="h-10 w-10 text-bauhaus-blue" />
            </div>

            <div className="w-12 h-1 mx-auto mb-4 flex">
              <div className="flex-1 bg-bauhaus-red"></div>
              <div className="flex-1 bg-bauhaus-yellow"></div>
              <div className="flex-1 bg-bauhaus-blue"></div>
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">Thanks for Submitting!</h1>
            <p className="text-muted-foreground mb-6">We'll get back to you soon.</p>

            <Button variant="primary" asChild>
              <Link href="/profile">Go to Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  )
}