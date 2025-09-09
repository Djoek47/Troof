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
                href="https://x.com/faberland"
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
                href="https://youtube.com/@faberland"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                aria-label="Subscribe to our YouTube channel"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
              
              <Link
                href="https://instagram.com/faberland"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
              
              <Link
                href="https://facebook.com/faberland"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-300"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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