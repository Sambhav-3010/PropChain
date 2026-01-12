import Link from "next/link"
import { Building2, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-background relative">
      {/* Bauhaus accent stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-bauhaus-blue"></div>
        <div className="flex-1 bg-bauhaus-yellow"></div>
        <div className="flex-1 bg-bauhaus-red"></div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)] group-hover:shadow-[5px_5px_10px_var(--neu-shadow-dark),-5px_-5px_10px_var(--neu-shadow-light)] transition-shadow duration-300">
                <Building2 className="h-5 w-5 text-bauhaus-blue" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-foreground">
                PropChain
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-6">
              Revolutionizing property ownership with blockchain technology. Secure, transparent, and verified real estate transactions.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              {[
                { icon: Twitter, href: "#", color: "text-bauhaus-blue" },
                { icon: Github, href: "#", color: "text-foreground" },
                { icon: Linkedin, href: "#", color: "text-bauhaus-blue" }
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)] hover:shadow-[5px_5px_10px_var(--neu-shadow-dark),-5px_-5px_10px_var(--neu-shadow-light)] active:shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)] transition-all duration-200"
                >
                  <social.icon className={`h-5 w-5 ${social.color}`} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground flex items-center">
              <span className="w-1 h-6 bg-bauhaus-red rounded-full mr-3"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Marketplace", href: "/marketplace" },
                { name: "List Property", href: "/register-property" },
                { name: "Verify Documents", href: "/verify-documents" },
                { name: "Feedback", href: "/feedback" }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground flex items-center">
              <span className="w-1 h-6 bg-bauhaus-yellow rounded-full mr-3"></span>
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" },
                { name: "Cookie Policy", href: "#" }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 PropChain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
