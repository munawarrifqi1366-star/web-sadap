'use client';

import React, { useEffect, useState, useRef } from 'react';
import Header from '@/components/Header';
import { QRCodeSVG } from 'qrcode.react';
import { Tv, Volume2, ShieldAlert } from 'lucide-react';

export default function ControllerPage() {
  const [peerId, setPeerId] = useState('');
  const [status, setStatus] = useState('Membuat sesi ID...');
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    let peer;
    import('peerjs').then(({ default: Peer }) => {
      // Membuat Peer ID acak
      const randomId = 'room-' + Math.random().toString(36).substring(2, 9);
      peer = new Peer(randomId);

      peer.on('open', (id) => {
        setPeerId(id);
        setStatus('Menunggu Target menscan QR Code...');
      });

      // Menerima Panggilan Stream dari Target
      peer.on('call', (call) => {
        setStatus('Target terhubung! Mengirimkan siaran live...');
        call.answer(); // Menjawab panggilan tanpa balik mengirim media stream

        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        call.on('close', () => {
          setStatus('Koneksi terputus oleh Target.');
        });
      });
    });

    return () => {
      if (peer) peer.destroy();
    };
  }, []);

  const targetConnectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/target?room=${peerId}` 
    : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Kontrol & QR Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center justify-center">
          <h2 className="text-xl font-bold mb-2">Sambungkan Perangkat</h2>
          <p className="text-xs text-slate-400 mb-6">Pinta Target untuk men-scan QR code ini menggunakan tombol Scan QR di perangkat mereka.</p>

          {peerId ? (
            <div className="bg-white p-4 rounded-xl shadow-xl mb-4">
              <QRCodeSVG value={targetConnectUrl} size={180} />
            </div>
          ) : (
            <div className="w-48 h-48 bg-slate-800 animate-pulse rounded-xl mb-4 flex items-center justify-center text-xs text-slate-500">
              Generating QR...
            </div>
          )}

          <div className="w-full bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-xs text-slate-300">
            <span className="text-slate-500 block mb-1">Status Koneksi:</span>
            <span className="font-semibold text-blue-400">{status}</span>
          </div>
        </div>

        {/* Display Video Stream dari Target */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-sm">Layar Remote / Stream Kamera</h3>
            </div>
            <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-green-400" />
              <span>Audio Live</span>
            </div>
          </div>

          <div className="flex-1 bg-black rounded-xl overflow-hidden relative flex items-center justify-center min-h-[350px]">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              controls
              className="w-full h-full object-contain"
            />
          </div>

          {/* Banner Peringatan Keterbatasan Web */}
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed">
              <strong>Catatan Keamanan Web:</strong> Stream video & audio hanya dapat berjalan selama tab browser Target tetap aktif terbuka dan izin kamera/mikrofon disetujui.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
