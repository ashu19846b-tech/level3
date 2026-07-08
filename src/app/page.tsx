"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStellar } from "@/context/StellarContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { address, isConnected, connect } = useStellar();
  const [counts, setCounts] = useState({ records: 0, patients: 0, doctors: 0, uptime: 0 });
  const statsRef = useRef<HTMLElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.push("/dashboard");
    }
  }, [address, router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const targets = { records: 12400, patients: 3200, doctors: 890, uptime: 100 };
          const startTime = Date.now();
          const duration = 2000;

          const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setCounts({
              records: Math.floor(progress * targets.records),
              patients: Math.floor(progress * targets.patients),
              doctors: Math.floor(progress * targets.doctors),
              uptime: Math.floor(progress * targets.uptime),
            });

            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const tickerItems = [
    "Decentralised Storage", "IPFS Pinned", "Freighter Auth",
    "Zero Knowledge", "Open Protocol", "Immutable Records",
    "Patient Owned", "Doctor Access Control", "Audit Trail",
    "Decentralised Storage", "IPFS Pinned", "Freighter Auth",
    "Zero Knowledge", "Open Protocol", "Immutable Records",
    "Patient Owned", "Doctor Access Control", "Audit Trail",
  ];

  return (
    <div className="flex flex-col">
      {/* TOPBAR */}
      <nav className="sticky top-0 z-[100] bg-burgundy flex items-center justify-between px-10 h-14 border-b-3 border-lime">
        <div className="font-bebas text-[22px] tracking-[4px] text-lime">MEDIVAULT</div>
        <div className="hidden md:flex">
          <Link href="#features" className="font-mono-plex text-[11px] font-semibold tracking-[2px] uppercase text-cream px-5 h-14 flex items-center border-l border-white/10 hover:bg-lime hover:text-ink transition-colors cursor-crosshair">Features</Link>
          <Link href="#how" className="font-mono-plex text-[11px] font-semibold tracking-[2px] uppercase text-cream px-5 h-14 flex items-center border-l border-white/10 hover:bg-lime hover:text-ink transition-colors cursor-crosshair">How it Works</Link>
          <Link href="#stats" className="font-mono-plex text-[11px] font-semibold tracking-[2px] uppercase text-cream px-5 h-14 flex items-center border-l border-white/10 hover:bg-lime hover:text-ink transition-colors cursor-crosshair">Stats</Link>
        </div>
        <button
          onClick={connect}
          className={`font-mono-plex text-[11px] font-semibold tracking-[2px] uppercase px-6 py-[10px] cursor-crosshair transition-all duration-200 ${
            isConnected
              ? "bg-rust text-white rounded-[2px]"
              : "bg-lime text-ink clip-path-polygon hover:bg-white hover:scale-[1.04]"
          }`}
          style={!isConnected ? { clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" } : {}}
        >
          {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      {/* HERO */}
      <section className="grid md:grid-cols-2 min-h-[calc(100vh-56px)] relative overflow-hidden">
        <div className="bg-cream p-10 md:p-20 flex flex-col justify-center relative z-[2]">
          <div className="font-mono-plex text-[10px] tracking-[4px] uppercase text-rust font-semibold mb-6 flex items-center gap-4 before:content-[''] before:w-8 before:h-[2px] before:bg-rust">
            Blockchain Medical Records
          </div>
          <h1 className="font-bebas text-[clamp(72px,8vw,120px)] leading-[0.9] text-ink tracking-[2px] mb-8">
            YOUR<br /><span className="text-burgundy">HEALTH</span><br />ON CHAIN
          </h1>
          <p className="text-lg leading-[1.7] text-ink-soft max-w-[440px] mb-12 font-light">
            Decentralised. Immutable. Yours alone. MediVault stores your medical records on IPFS and anchors access rights to the blockchain — no hospital middlemen, no data breaches.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href={address ? "/dashboard" : "#"}
              onClick={(e) => !address && (e.preventDefault(), connect())}
              className="font-mono-plex text-[12px] font-semibold tracking-[3px] uppercase bg-burgundy text-lime px-10 py-[18px] transition-all hover:bg-ink group relative overflow-hidden"
            >
              Launch App
              <span className="ml-2 transition-all duration-300 group-hover:ml-4">→</span>
            </Link>
            <Link href="#how" className="font-mono-plex text-[11px] font-semibold tracking-[2px] uppercase bg-transparent text-ink-soft border-2 border-card-border px-8 py-4 hover:border-burgundy hover:text-burgundy transition-all">
              How it works
            </Link>
          </div>
        </div>

        <div className="bg-ink relative overflow-hidden flex items-center justify-center min-h-[400px]">
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="absolute w-[480px] h-[480px] border border-lime/15 rounded-full animate-ring">
              <div className="absolute w-2 h-2 bg-lime rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#C8F02A]" />
            </div>
            <div className="absolute w-[360px] h-[360px] border border-lime/25 rounded-full animate-ring-reverse">
              <div className="absolute w-2 h-2 bg-lime rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#C8F02A]" />
            </div>
            <div className="absolute w-[240px] h-[240px] border border-lime/40 rounded-full animate-ring-fast">
              <div className="absolute w-2 h-2 bg-lime rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#C8F02A]" />
            </div>
            <div className="relative z-[5] bg-cream/5 border border-lime/30 p-10 text-center w-[300px] backdrop-blur-md">
              <div className="w-16 h-16 bg-lime mx-auto mb-5 flex items-center justify-center text-2xl clip-path-hexagon">⬡</div>
              <div className="font-bebas text-[28px] tracking-[3px] text-cream mb-2">MEDIVAULT</div>
              <div className="font-mono-plex text-[10px] text-lime tracking-[2px] uppercase opacity-80">Secured · Decentralised · Yours</div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-lime py-3 overflow-hidden border-y-2 border-ink whitespace-nowrap">
        <div className="inline-flex gap-0 animate-ticker">
          {tickerItems.map((item, i) => (
            <div key={i} className="font-mono-plex text-[11px] font-semibold tracking-[3px] uppercase text-ink px-10 flex items-center gap-4 after:content-['✦'] after:text-[8px]">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="px-10 py-32 md:px-20 bg-cream-dark border-t-3 border-ink" id="features">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 border-b-2 border-card-border pb-10">
          <div className="font-bebas text-[120px] leading-[0.8] text-card-border">01</div>
          <div className="flex-1 pl-10">
            <div className="font-mono-plex text-[10px] tracking-[4px] text-rust uppercase mb-3">Core Capabilities</div>
            <div className="font-bebas text-[64px] leading-none tracking-[2px] text-ink">WHY MEDIVAULT</div>
          </div>
        </div>

        <div className="grid md:grid-cols-[2fr_1fr_1fr] border-3 border-ink">
          <FeatureCard 
            num="F — 001" 
            title="End-to-End Encrypted Storage" 
            desc="Every file is encrypted before it touches IPFS. Your private key, your data. Not even MediVault can read your records without your explicit permission."
            icon="🔐"
            isBig
          />
          <FeatureCard 
            num="F — 002" 
            title="Immutable Audit Trail" 
            desc="Every access event is logged on-chain. Tamper-proof history forever."
            icon="⛓"
          />
          <FeatureCard 
            num="F — 003" 
            title="Granular Doctor Access" 
            desc="Grant or revoke per-doctor access in seconds, on your terms."
            icon="👁"
          />
          <FeatureCard 
            num="F — 004" 
            title="IPFS Pinned Files" 
            desc="Records survive server outages — distributed across the globe permanently."
            icon="📄"
            isBottom
          />
          <FeatureCard 
            num="F — 005" 
            title="Instant Wallet Auth" 
            desc="No username, no password. Just sign with your wallet."
            icon="⚡"
            isBottom
          />
          <FeatureCard 
            num="F — 006" 
            title="Universal Portability" 
            desc="Access from any device, anywhere. No vendor lock-in, ever."
            icon="🌐"
            isBottom
          />
        </div>
      </section>

      {/* STATS RIBBON */}
      <section ref={statsRef} className="bg-burgundy grid grid-cols-2 md:grid-cols-4 border-y-3 border-lime" id="stats">
        <StatBlock val={counts.records} label="Records Stored" />
        <StatBlock val={counts.patients} label="Active Patients" />
        <StatBlock val={counts.doctors} label="Verified Doctors" />
        <StatBlock val={counts.uptime} label="% Uptime" />
      </section>

      {/* HOW IT WORKS */}
      <section className="px-10 py-32 md:px-20 bg-cream border-t-3 border-ink" id="how">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 border-b-2 border-card-border pb-10">
          <div className="font-bebas text-[120px] leading-[0.8] text-card-border">02</div>
          <div className="flex-1 pl-10">
            <div className="font-mono-plex text-[10px] tracking-[4px] text-rust uppercase mb-3">Process</div>
            <div className="font-bebas text-[64px] leading-none tracking-[2px] text-ink">HOW IT WORKS</div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 border-2 border-ink">
          <StepItem n="1" title="Connect Wallet" desc="Authenticate with your wallet — no account creation needed." arrow />
          <StepItem n="2" title="Upload Records" desc="Drag & drop your medical files. They're encrypted and pinned to IPFS instantly." arrow />
          <StepItem n="3" title="Grant Access" desc="Share your record access with doctors using their wallet address. Full control." arrow />
          <StepItem n="4" title="Revoke Anytime" desc="Remove access in seconds. The blockchain enforces it — no waiting, no disputes." />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink px-10 py-32 md:px-20 grid md:grid-cols-2 border-t-3 border-lime content-center items-center gap-20">
        <h2 className="font-bebas text-[80px] leading-[0.95] tracking-[2px] text-cream">
          OWN YOUR<br /><em className="italic text-lime font-serif text-[70px] normal-case">Medical</em><br />FUTURE
        </h2>
        <div>
          <p className="text-cream/60 text-lg leading-[1.8] font-light mb-10">
            Join thousands of patients who&apos;ve reclaimed control of their health data. No subscriptions. No corporations. Just you and your records, secured by cryptography.
          </p>
          <button 
            onClick={connect}
            className="font-mono-plex text-[13px] font-semibold tracking-[3px] uppercase bg-lime text-ink px-12 py-[22px] transition-all hover:bg-white hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#C8F02A]"
          >
            Connect Wallet & Begin
          </button>
        </div>
      </section>

      <footer className="bg-burgundy px-10 md:px-20 py-10 flex flex-col md:flex-row items-center justify-between border-t-3 border-lime gap-6">
        <div className="font-bebas text-[28px] tracking-[6px] text-lime">MEDIVAULT</div>
        <div className="font-mono-plex text-[10px] tracking-[2px] uppercase text-white/40">© 2026 MediVault Protocol. Decentralised. Open Source.</div>
      </footer>
    </div>
  );
}

function FeatureCard({ num, title, desc, icon, isBig = false, isBottom = false }: { num: string, title: string, desc: string, icon: string, isBig?: boolean, isBottom?: boolean }) {
  return (
    <div className={`p-12 border-r-3 border-ink group transition-colors duration-300 hover:bg-burgundy min-h-[300px] flex flex-col ${isBottom ? 'border-t-3' : ''} ${isBig ? 'md:row-span-1' : ''}`}>
      <div className="font-mono-plex text-[10px] text-mist tracking-[3px] mb-10 transition-colors duration-300 group-hover:text-cream">{num}</div>
      <div className="w-[52px] h-[52px] bg-cream border-2 border-ink flex items-center justify-center text-[22px] mb-6 transition-all duration-300 group-hover:bg-lime group-hover:text-ink">{icon}</div>
      <h3 className="font-serif text-[26px] leading-[1.2] text-ink mb-4 transition-colors duration-300 group-hover:text-cream">{title}</h3>
      <p className="text-sm leading-[1.7] text-ink-soft font-light transition-colors duration-300 group-hover:text-cream/80">{desc}</p>
    </div>
  );
}

function StatBlock({ val, label }: { val: number, label: string }) {
  return (
    <div className="p-16 border-r border-white/10 text-center relative overflow-hidden group">
      <div className="font-bebas text-[72px] text-lime leading-none tracking-[2px] relative z-10">{val.toLocaleString()}{label === '% Uptime' ? '' : '+'}</div>
      <div className="font-mono-plex text-[10px] tracking-[3px] uppercase text-white/50 mt-2 relative z-10">{label}</div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-lime transition-all duration-500 group-hover:w-[80%]" />
    </div>
  );
}

function StepItem({ n, title, desc, arrow }: { n: string, title: string, desc: string, arrow?: boolean }) {
  return (
    <div className="p-12 border-r-2 border-ink relative">
      {arrow && <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-lime border-2 border-ink flex items-center justify-center text-lg z-[5] hidden md:flex">→</div>}
      <div className="font-bebas text-[80px] text-cream-dark leading-none mb-4">{n}</div>
      <h3 className="font-serif text-[22px] text-ink mb-3">{title}</h3>
      <p className="text-[13px] leading-[1.7] text-ink-soft font-light">{desc}</p>
    </div>
  );
}
