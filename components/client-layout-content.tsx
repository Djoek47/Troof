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
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Clock, Shield } from "lucide-react";

// Import the client object - adjust path if necessary based on where it's defined relative to this file
// If client is defined in app/layout.tsx and exported, this import should work: 
import { client } from "@/app/layout";

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

// Maintenance Modal Component
function MaintenanceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-light text-gray-900">Maintenance Update</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">Current Status</span>
            </div>
            <p className="text-yellow-700 text-sm">
              We're currently performing essential maintenance on our payment infrastructure and related subsystems.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">What We're Working On</span>
            </div>
            <p className="text-blue-700 text-sm mb-3">
              Our team is updating and securing our payment processing systems, blockchain integration protocols, 
              and financial transaction infrastructure to ensure enhanced security and performance.
            </p>
            <p className="text-blue-700 text-sm">
              This includes backend optimizations, security enhancements, and system integrations that are 
              critical for maintaining the highest standards of service reliability.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center mb-3">
              <Clock className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-gray-800 font-medium">Expected Timeline</span>
            </div>
            <p className="text-gray-700 text-sm">
              We're working diligently to complete these updates as quickly as possible. 
              The maintenance is expected to be completed soon, and we'll notify you immediately when all systems are fully operational.
            </p>
          </div>

          <div className="text-center pt-4">
            <Button
              onClick={onClose}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-medium"
            >
              Got It
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCheckoutPage = pathname.startsWith('/checkout');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Listen for custom events from child components
  useEffect(() => {
    const handleOpenModal = () => setShowMaintenanceModal(true);
    window.addEventListener('openMaintenanceModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openMaintenanceModal', handleOpenModal);
    };
  }, []);

  return (
    <ThirdwebProvider>
      <CartProvider>
        <WalletCartSync />
        <SplashScreen />
        
        {/* Maintenance Banner - Top of all pages */}
        <div 
          className="bg-yellow-500 text-black py-3 px-4 text-center font-medium z-50 relative cursor-pointer hover:bg-yellow-600 transition-colors duration-200"
          onClick={() => setShowMaintenanceModal(true)}
        >
          🚧 Site Under Maintenance - Click for more info 🚧
        </div>
        
        {/* Maintenance Modal */}
        <MaintenanceModal 
          isOpen={showMaintenanceModal} 
          onClose={() => setShowMaintenanceModal(false)} 
        />
        
        {!isCheckoutPage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
            <Logo />
          </div>
        )}
        {children}
        <footer className="w-full py-6 px-4 bg-dark-600 text-gray-400 border-t border-yellow-500/20">
          <div className="container mx-auto text-center">
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