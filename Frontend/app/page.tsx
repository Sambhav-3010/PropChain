import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, Zap, Globe, CheckCircle, ArrowRight, Building2, Lock, TrendingUp } from "lucide-react"


export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: "Secure Ownership",
      description: "Blockchain-verified property ownership with immutable records and smart contract automation.",
      color: "text-bauhaus-red",
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Automated property transfers with AI-powered verification and instant settlement.",
      color: "text-bauhaus-yellow",
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Access properties worldwide with transparent pricing and verified documentation.",
      color: "text-bauhaus-blue",
    },
  ]

  const benefits = [
    "Immutable ownership records",
    "Automated legal compliance",
    "Reduced transaction costs",
    "Instant property transfers",
    "AI-powered fraud detection",
    "Global accessibility",
  ]

  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bauhaus-hero py-16 md:py-24">
        {/* Bauhaus Geometric Decorations */}
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-bauhaus-red opacity-10 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-bauhaus-yellow opacity-10 rotate-45"></div>
        <div className="absolute top-40 left-1/4 w-16 h-16 rounded-full bg-bauhaus-blue opacity-10"></div>

        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Bauhaus accent bar */}
            <div className="w-20 h-1 mx-auto mb-8 flex">
              <div className="flex-1 bg-bauhaus-red"></div>
              <div className="flex-1 bg-bauhaus-yellow"></div>
              <div className="flex-1 bg-bauhaus-blue"></div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tight">
              Revolutionizing Property Ownership with{' '}
              <span className="text-bauhaus-gradient">
                Blockchain
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Secure, transparent, and verified real estate transactions powered by smart contracts and AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="primary"
                asChild
              >
                <Link href="/auth/signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <Link href="/marketplace">Explore Properties</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="w-12 h-1 mx-auto mb-6 flex">
              <div className="flex-1 bg-bauhaus-blue"></div>
              <div className="flex-1 bg-bauhaus-yellow"></div>
              <div className="flex-1 bg-bauhaus-red"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Our platform simplifies property transactions through blockchain technology and AI automation.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Column */}
            <div>
              <div className="w-12 h-1 mb-6 flex">
                <div className="flex-1 bg-bauhaus-red"></div>
                <div className="flex-1 bg-bauhaus-yellow"></div>
                <div className="flex-1 bg-bauhaus-blue"></div>
              </div>
              <h2 className="text-3xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-foreground">
                Why Blockchain for Real Estate?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-6 md:mb-8">
                Traditional property transactions are slow, expensive, and prone to fraud. Our blockchain solution
                eliminates intermediaries, reduces costs, and ensures complete transparency.
              </p>

              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center shadow-[2px_2px_4px_var(--neu-shadow-dark),-2px_-2px_4px_var(--neu-shadow-light)]">
                      <CheckCircle className="h-4 w-4 text-bauhaus-blue" />
                    </div>
                    <span className="text-sm sm:text-base text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="grid gap-4 md:gap-6 grid-cols-1">
              {[
                {
                  icon: Lock,
                  title: 'Secure & Immutable',
                  desc: 'Every transaction is recorded on the blockchain, creating an immutable history of ownership that cannot be altered or disputed.',
                  accent: 'bg-bauhaus-red'
                },
                {
                  icon: TrendingUp,
                  title: 'Cost Effective',
                  desc: 'Smart contracts automate processes, reducing the need for intermediaries and cutting transaction costs by up to 80%.',
                  accent: 'bg-bauhaus-yellow'
                },
                {
                  icon: Building2,
                  title: 'Global Access',
                  desc: 'Access properties from anywhere in the world with standardized processes and instant verification.',
                  accent: 'bg-bauhaus-blue'
                }
              ].map((item, idx) => (
                <Card key={idx} className="relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.accent}`}></div>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2 pl-8">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] mr-3">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-8">
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden bauhaus-bg-pattern">
            <div className="relative px-4 sm:px-8 py-10 md:py-16 text-center z-10">
              <div className="w-16 h-1 mx-auto mb-6 flex">
                <div className="flex-1 bg-bauhaus-red"></div>
                <div className="flex-1 bg-bauhaus-yellow"></div>
                <div className="flex-1 bg-bauhaus-blue"></div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6">
                Ready to Transform Your Property Experience?
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust PropChain for secure, transparent, and efficient property
                transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="primary"
                  asChild
                >
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
