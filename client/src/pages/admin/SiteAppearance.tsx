import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAppearance } from '../../context/AppearanceContext';
import { admin } from '../../lib/api';
import {
  Upload, Image, Eye, EyeOff, Sliders, RefreshCw,
} from 'lucide-react';

export default function AdminSiteAppearance() {
  const { settings, updateSettings, refreshSettings, loading } = useAppearance();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', 'Site Background Image');
      formData.append('resourceType', 'IMAGE');
      formData.append('category', 'Site Assets');

      const uploadRes = await admin.upload(formData);
      const imageUrl = uploadRes.data.url;

      await updateSettings({ backgroundImage: imageUrl });
      toast.success('Background image updated successfully');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      setPreviewUrl(null);
    }
  };

  const currentBg = previewUrl || settings.backgroundImage;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Appearance</h1>
          <p className="text-white/50 text-sm mt-1">Customize the global look and feel of your Islamic learning platform</p>
        </div>
        <button
          onClick={refreshSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Background Image Preview */}
      <div className="glass-card-premium p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-icc-500/20 flex items-center justify-center">
            <Image className="w-5 h-5 text-icc-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Background Image</h2>
            <p className="text-sm text-white/50">Upload a mosque or Islamic-themed image as the site-wide background</p>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-white/10 mb-4">
          <div
            className="w-full h-48 md:h-64 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${currentBg}")` }}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              {uploading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {uploading ? 'Uploading...' : 'Change Image'}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <p className="text-xs text-white/40 truncate">
          Current: {settings.backgroundImage}
        </p>
      </div>

      {/* Overlay Controls */}
      <div className="glass-card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Overlay Settings</h2>
            <p className="text-sm text-white/50">Control the dark overlay and blur effect for better readability</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enable Overlay */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Background Overlay</p>
              <p className="text-sm text-white/50">Apply dark overlay and blur to the background image</p>
            </div>
            <button
              onClick={() => updateSettings({ enableOverlay: !settings.enableOverlay })}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                settings.enableOverlay ? 'bg-icc-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                  settings.enableOverlay ? 'left-7' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Overlay Opacity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">Overlay Opacity</p>
              <span className="text-sm text-gold-400 font-mono">
                {Math.round(settings.overlayOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(settings.overlayOpacity * 100)}
              onChange={(e) => updateSettings({ overlayOpacity: Number(e.target.value) / 100 })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0EA5E9 ${settings.overlayOpacity * 100}%, rgba(255,255,255,0.1) ${settings.overlayOpacity * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>0% (No overlay)</span>
              <span>100% (Full dark)</span>
            </div>
          </div>

          {/* Preview overlay */}
          <div className="relative rounded-xl overflow-hidden border border-white/10 h-20">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${currentBg}")` }}
            />
            <div
              className="absolute inset-0 transition-all duration-300"
              style={{
                backgroundColor: `rgba(0,0,0,${settings.enableOverlay ? settings.overlayOpacity : 0})`,
                backdropFilter: settings.enableOverlay ? `blur(${settings.blurStrength}px)` : 'none',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/60 text-sm font-medium">Live Preview</span>
            </div>
          </div>

          {/* Blur Strength */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">Background Blur Strength</p>
              <span className="text-sm text-gold-400 font-mono">{settings.blurStrength}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={settings.blurStrength}
              onChange={(e) => updateSettings({ blurStrength: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0EA5E9 ${(settings.blurStrength / 24) * 100}%, rgba(255,255,255,0.1) ${(settings.blurStrength / 24) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>0px (No blur)</span>
              <span>24px (Maximum)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="glass-card-premium p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-icc-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Eye className="w-4 h-4 text-icc-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Tips for Best Results</h3>
            <ul className="text-sm text-white/50 space-y-1 list-disc list-inside">
              <li>Use high-resolution mosque or Islamic architecture images (1920x1080 or larger)</li>
              <li>Keep overlay opacity between 40-70% for optimal readability</li>
              <li>A moderate blur (4-12px) creates a premium glassmorphism effect</li>
              <li>The background applies instantly across all pages after upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}