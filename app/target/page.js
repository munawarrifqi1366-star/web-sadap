'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Camera, Monitor, Mic, MicOff, RefreshCw, Radio } from 'lucide-react';

function TargetContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');

  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (depan) atau 'environment' (belakang)
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeSource, setActiveSource] = useState('camera'); // 'camera' atau 'screen'
  const [status, setStatus] = useState('Siap menghubungkan...');

  const localVideoRef = useRef(null);
  const activeCallRef = useRef(null);

  useEffect(() => {
    import('peerjs').then(({ default: Peer }) => {
      const newPeer = new Peer();
      newPeer.on('open', () => {
        setPeer(newPeer);
      });
    });
  }, []);

  // Memulai Media Stream (Kamera / Screen Share)
  const startStreaming = async (type = 'camera', cameraFacing = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      let mediaStream;
      if (type === 'camera') {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing },
          audio: true,
        });
      } else {
        // Share Screen + Audio
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        // Ambil audio mikrofon gabungan jika dibutuhkan
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
        } catch {
          mediaStream = screenStream;
        }
      }

      setStream(mediaStream);
      setActiveSource(type);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      // Kirim stream ke Controller jika Room ID tersedia
      if (peer && roomId) {
        if (activeCallRef.current) activeCallRef.current.close();
        
        const call = peer.call(roomId, mediaStream);
        activeCallRef.current = call;
        setStatus(`Terhubung & Menyiarkan ke Room: ${roomId}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('Gagal mengakses kamera/layar. Pastikan izin telah diberikan.');
    }
  };

  // Switch Kamera Depan <-> Belakang
  const toggleCamera = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startStreaming('camera', nextFacing);
  };

  // Mute / Unmute Audio
  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioMuted;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              Panel Penyiaran Target
            </h2>
            <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
              Room: {roomId || 'Belum Ada'}
            </span>
          </div>

          {/* Preview Kamera Local */}
          <div className="bg-black rounded-xl overflow-hidden aspect-video relative mb-6 flex items-center justify-center border border-slate-800">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!stream && (
              <p className="text-slate-500 text-xs">Pilih Mode Penyiaran di bawah</p>
            )}
          </div>

          {/* Kontrol Utama */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => startStreaming('camera', facingMode)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                activeSource === 'camera' && stream
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Gunakan Kamera</span>
            </button>

            <button
              onClick={() => startStreaming('screen')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                activeSource === 'screen' && stream
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Share Screen</span>
            </button>
          </div>

          {/* Sub Kontrol (Ganti Kamera & Mute Audio) */}
          {stream && (
            <div className="flex gap-3 pt-2 border-t border-slate-800">
              {activeSource === 'camera' && (
                <button
                  onClick={toggleCamera}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kamera ({facingMode === 'user' ? 'Depan' : 'Belakang'})</span>
                </button>
              )}

              <button
                onClick={toggleAudio}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isAudioMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isAudioMuted ? 'Audio Muted' : 'Audio Aktif'}</span>
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-400">{status}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TargetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-6">Loading...</div>}>
      <TargetContent />
    </Suspense>
  );
}
