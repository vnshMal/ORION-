"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Map, 
  FileCode, 
  ShieldAlert, 
  Cpu, 
  Settings, 
  LogOut,
  Activity
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Alerts", href: "/alerts", icon: AlertTriangle },
    { name: "Threat Map", href: "/map", icon: Map },
    { name: "Signatures", href: "/signatures", icon: FileCode },
    { name: "Firewall", href: "/firewall", icon: ShieldAlert },
    { name: "ML Model", href: "/ml-model", icon: Cpu },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/30">
              <span className="text-white text-xl font-black tracking-tighter">O</span>
            </div>
            <span className="text-xl font-extrabold text-slate-100 tracking-wider font-sans">
              ORION
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Sniffing Active
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 border ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.08)]"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon size={14} className={isActive ? "text-blue-400" : "text-slate-400"} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Links & Login status */}
        <div className="flex items-center gap-4">
          {/* Mobile Navigation Dropdown Button (hidden on large displays for desktop UI simplicity) */}
          <div className="xl:hidden flex items-center gap-1 mr-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`p-2 rounded-lg border transition-all ${
                    isActive
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                  title={link.name}
                >
                  <Icon size={16} />
                </Link>
              );
            })}
          </div>

          <Link 
            href="/login" 
            className="flex items-center gap-2 px-4 py-2 border border-slate-700/60 bg-slate-900/50 hover:bg-red-500/10 hover:border-red-500/30 text-xs font-semibold rounded-xl text-slate-300 hover:text-red-400 transition-all shadow-md"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout / Login</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
