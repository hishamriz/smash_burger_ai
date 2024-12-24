'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Save } from 'lucide-react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [images, setImages] = useState<Array<{
    id: number;
    url: string;
    label: string | null;
  }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsRecording(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const newImage = {
          id: Date.now(),
          url: canvas.toDataURL('image/jpeg'),
          label: null
        };
        setImages(prev => [newImage, ...prev]);
      }
    }
  };

  const labelImage = (id: number, quality: string) => {
    setImages(images.map(img => 
      img.id === id ? {...img, label: quality} : img
    ));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const downloadData = () => {
    const data = JSON.stringify(images, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smash-burger-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Smash Burger Data Collector</h1>
        
        {/* Camera Controls */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <div className="flex justify-between mb-4">
            <button 
              onClick={isRecording ? stopCamera : startCamera}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isRecording ? 'bg-red-500' : 'bg-blue-500'
              } text-white`}
            >
              <Camera className="w-5 h-5" />
              {isRecording ? 'Stop Camera' : 'Start Camera'}
            </button>
            {isRecording && (
              <button 
                onClick={captureImage}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Capture
              </button>
            )}
          </div>
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="w-full rounded-lg bg-black"
          />
        </div>

        {/* Download Button */}
        {images.length > 0 && (
          <button
            onClick={downloadData}
            className="mb-8 bg-purple-500 text-white px-4 py-2 rounded-lg"
          >
            Download Dataset ({images.length} images)
          </button>
        )}

        {/* Captured Images Grid */}
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.id} className="border rounded-lg p-4">
              <img 
                src={image.url} 
                alt="Captured patty" 
                className="w-full rounded-lg mb-2"
              />
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => labelImage(image.id, 'under_smashed')}
                  className={`flex-1 px-2 py-1 rounded-lg ${
                    image.label === 'under_smashed' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200'
                  }`}
                >
                  Under
                </button>
                <button
                  onClick={() => labelImage(image.id, 'perfect')}
                  className={`flex-1 px-2 py-1 rounded-lg ${
                    image.label === 'perfect' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200'
                  }`}
                >
                  Perfect
                </button>
                <button
                  onClick={() => labelImage(image.id, 'over_smashed')}
                  className={`flex-1 px-2 py-1 rounded-lg ${
                    image.label === 'over_smashed' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-200'
                  }`}
                >
                  Over
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}