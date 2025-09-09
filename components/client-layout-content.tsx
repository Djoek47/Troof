"use client";

import type { ReactNode } from "react";
import { ThirdwebProvider, ConnectButton, darkTheme } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";
import { CartProvider } from "@/components/providers/cart-provider";
import { SplashScreen } from "@/components/splash-screen";
import { Logo } from "@/components/logo";
import { CustomCursor } from "@/components/custom-cursor";
import Image from "next/image"; // Assuming Image might be used in footer/logo
import Link from "next/link"; // Assuming Link might be used in footer/logo
import { useEffect } from "react";
import { useCart } from "@/context/cart-context";
import { usePathname } from "next/navigation";

// Import the client object - adjust path if necessary based on where it's defined relative to this file
// If client is defined in app/layout.tsx and exported, this import should work: 
import { client } from "@/lib/thirdweb-client";

// Define a custom theme based on the dark theme
export const customTheme = darkTheme({
  colors: {
    // Customize button colors to match the project's yellow theme
    accentButtonBg: "#F59E0B", // Approximate yellow-500
    accentButtonText: "#0E1116", // Approximate dark-900
  },
});

// Create a wrapper component to handle wallet connection
function WalletCartSync() {
  const account = useActiveAccount();
  const { setWalletId } = useCart();

  useEffect(() => {
    if (account?.address) {
      console.log('Setting wallet ID:', account.address);
      setWalletId(account.address);
    } else {
      console.log('Clearing wallet ID');
      setWalletId(undefined);
    }
  }, [account, setWalletId]);

  return null;
}

export default function ClientLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCheckoutPage = pathname.startsWith('/checkout');

  return (
    <ThirdwebProvider>
      <CartProvider>
        <WalletCartSync />
        <SplashScreen />
        
        {!isCheckoutPage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
            <Logo />
          </div>
        )}
        {children}
        <footer className="w-full py-6 px-4 bg-dark-600 text-gray-400 border-t border-yellow-500/20">
          <div className="container mx-auto text-center">
            {/* Social Media Links */}
            <div className="flex justify-center items-center gap-6 mb-6">
              <Link
                href="https://x.com/Faber4land"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                aria-label="Follow us on X (Twitter)"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              
              <Link
                href="https://discord.gg/faberland"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                aria-label="Join our Discord server"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </Link>
            </div>
            
            <p className="mb-4">&copy; 2025 Faberland. All rights reserved.</p>
            <div className="flex items-center justify-center">
              <span className="text-xs text-gray-500 mr-2">Powered by</span>
              <Link
                href="https://www.faber.land/"
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <div className="relative w-6 h-6">
                  <Image src="/v1-logo.png" alt="Visser Studios" fill className="object-contain" />
                </div>
                <span className="text-xs text-gray-500 ml-1">Visser Studios</span>
              </Link>
            </div>
          </div>
        </footer>
        <CustomCursor />
      </CartProvider>
    </ThirdwebProvider>
  );
} 