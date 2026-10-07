'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, X } from 'lucide-react';

export default function Header() {
  const [showScanner, setShowScanner] = useState(false);
  const router = useRouter();

  const handleStartScan = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("qr-reader-element", { 
        fps: 10, 
        qrbox: { width: 220, height: 220 } 
      });

      scanner.render(
        (decodedText) => {
          // Jika QR berupa URL penuh atau sekadar Room ID
          if (decodedText.startsWith('http')) {
            window.location.href = decodedText;
          } else {
            router.push(`/target?room=${decodedText}`);
          }
          scanner.clear();
          setShowScanner(false);
        },
        (error) => {
          // Abaikan error frame scan reguler
        }
      );
    }, 300);
  };

  return (
    <>
      <header className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">R</div>
          <span className="font-bold text-lg tracking-wide">RemoteHub</span>
        </div>

        {/* Tombol Scan QR di Bagian Kanan Atas */}
        <button
          onClick={handleStartScan}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan QR</span>
        </button>
      </header>

      {/* Modal Popup Scanner */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 max-w-sm w-full relative shadow-2xl">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-1">Scan QR Controller</h3>
            <p className="text-xs text-slate-400 mb-4">Arahkan kamera ke QR Code di layar Pengontrol</p>
            
            <div id="qr-reader-element" className="w-full rounded-xl overflow-hidden bg-black"></div>
          </div>
        </div>
      )}
    </>
  );
}
