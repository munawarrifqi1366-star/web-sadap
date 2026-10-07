import Link from 'next/link';
import Header from '@/components/Header';
import { Shield, Monitor, QrCode } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          WebRTC Remote Monitoring Hub
        </h1>
        <p className="text-slate-400 max-w-xl mb-10 text-sm leading-relaxed">
          Platform streaming P2P langsung untuk pemantauan kamera depan/belakang, audio, dan pembagian layar real-time via QR Code.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
          <Link
            href="/controller"
            className="p-6 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl flex flex-col items-center group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Mode Controller</h3>
            <p className="text-xs text-slate-400">Tampilkan QR Code dan pantau stream dari perangkat target.</p>
          </Link>

          <Link
            href="/target"
            className="p-6 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl flex flex-col items-center group transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Mode Target</h3>
            <p className="text-xs text-slate-400">Scan QR Controller dan bagikan kamera atau layar Anda.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
