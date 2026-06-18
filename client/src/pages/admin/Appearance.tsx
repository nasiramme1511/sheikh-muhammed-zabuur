import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Save, Upload, AlertCircle, CheckCircle, Sliders, Image as ImageIcon, Eye,
  RotateCcw, Download, Upload as UploadIcon, Trash2, Star, Settings, Type, Sun, Moon,
  Layout, Pen, Image as ImageOff, RefreshCw, X, ChevronDown, ChevronUp, Plus, Square,
  Monitor, Layers, GlassWater, PanelTop, GripHorizontal, Music, Video, FileText
} from 'lucide-react';
import { useAppearance, BackgroundItem } from '../../context/AppearanceContext';
import { admin as adminApi, appearance as appearanceApi } from '../../lib/api';

const SECTIONS = [
  { id: 'backgrounds', label: 'Background Management', icon: ImageIcon },
  { id: 'slideshow', label: 'Hero Slideshow', icon: Layers },
  { id: 'overlay', label: 'Overlay & Blur', icon: Sliders },
  { id: 'colors', label: 'Theme Colors', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'mode', label: 'Dark / Light Mode', icon: Sun },
  { id: 'layout', label: 'Homepage Sections', icon: Layout },
  { id: 'footer', label: 'Footer Branding', icon: Pen },
  { id: 'logo', label: 'Custom Logo', icon: ImageOff },
  { id: 'behavior', label: 'Background Behavior', icon: GripHorizontal },
  { id: 'cards', label: 'Resource Card Appearance', icon: GlassWater },
  { id: 'stats', label: 'Statistics Design', icon: Monitor },
];

interface AppearanceNavProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
}

function SidebarNav({ activeSection, setActiveSection }: AppearanceNavProps) {
  return (
    <nav className="space-y-1">
      {SECTIONS.map((sec) => {
        const Icon = sec.icon;
        return (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              activeSection === sec.id
                ? 'bg-icc-500/10 text-icc-400 border border-icc-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{sec.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const COLOR_OPTIONS = [
  { label: 'Black', value: '#000000' },
  { label: 'Dark Green', value: '#022010' },
  { label: 'Emerald', value: '#065f46' },
  { label: 'Navy', value: '#0f172a' },
  { label: 'Slate', value: '#1e293b' },
];

const FONT_OPTIONS = ['Inter', 'Poppins', 'Cairo', 'Noto Sans Arabic', 'Amiri'];

export default function AdminAppearance() {
  const { settings, updateSettings, resetDefaults } = useAppearance();

  const [activeSection, setActiveSection] = useState('backgrounds');
  const [local, setLocal] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [bgColorPicker, setBgColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocal({ ...settings });
  }, [settings]);

  const update = (partial: Partial<typeof local>) => {
    setLocal(prev => ({ ...prev, ...partial }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setError('Image exceeds 20MB limit');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const res = await appearanceApi.uploadBackground(file);
      if (res.data?.url) {
        update({ backgroundImage: res.data.url });
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateSettings(local);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Restore all appearance settings to defaults? This cannot be undone.')) return;
    try {
      await resetDefaults();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to reset');
    }
  };

  const removeBackground = () => {
    update({ backgroundImage: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Palette className="w-6 h-6 text-icc-500" />
            Visual Branding Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control the complete visual identity of Sheikh Muhammed Zabuur and Iman Chercher College
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="btn-secondary flex items-center gap-1.5 text-sm px-4 py-2.5">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-icc-500/10 border border-icc-500/20 text-icc-500 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" /> Settings saved successfully!
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="lg:sticky lg:top-6">
            <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* ── 1. BACKGROUND MANAGEMENT ────────────── */}
          {activeSection === 'backgrounds' && (
            <SectionCard icon={ImageIcon} title="Background Management" subtitle="Upload, replace, or remove the site background image">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Background</label>
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video max-w-lg bg-gray-100 dark:bg-gray-900">
                    {local.backgroundImage ? (
                      <>
                        <img src={local.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                        <button onClick={removeBackground} className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-icc-500 hover:bg-icc-600 text-white text-sm font-semibold transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                  </label>

                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors border border-gray-200 dark:border-gray-700">
                    <UploadIcon className="w-4 h-4" />
                    Replace
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                  </label>

                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors border border-gray-200 dark:border-gray-700">
                      <Star className="w-4 h-4" />
                      Add to Backgrounds
                      <input type="file" accept="image/jpeg,image/png,image.webp" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 20 * 1024 * 1024) { setError('Max 20MB'); return; }
                        setUploading(true);
                        const fd = new FormData();
                        fd.append('file', file); fd.append('title', 'Background ' + (local.backgrounds.length + 1));
                        fd.append('category', 'General'); fd.append('resourceType', 'IMAGE');
                        adminApi.upload(fd).then(res => {
                          if (res.data?.url) {
                            const newBg: BackgroundItem = {
                              id: String(Date.now()), name: 'Custom ' + (local.backgrounds.length + 1),
                              url: res.data.url, active: false,
                            };
                            update({ backgrounds: [...local.backgrounds, newBg] });
                          }
                        }).catch(() => setError('Upload failed')).finally(() => setUploading(false));
                      }} disabled={uploading} className="hidden" />
                    </label>
                  </div>
                </div>

                <p className="text-xs text-gray-400">Supported: JPG, JPEG, PNG, WEBP — Max 20MB</p>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Multiple Backgrounds</h3>
                  {local.backgrounds.length === 0 ? (
                    <p className="text-sm text-gray-400">No backgrounds saved yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {local.backgrounds.map((bg) => (
                        <div key={bg.id} className={`relative rounded-xl overflow-hidden border-2 aspect-video cursor-pointer group ${
                          local.activeBackgroundId === bg.id ? 'border-icc-500' : 'border-transparent'
                        }`} onClick={() => {
                          update({ activeBackgroundId: bg.id, backgroundImage: bg.url });
                          const updated = local.backgrounds.map(b => ({ ...b, active: b.id === bg.id }));
                          update({ backgrounds: updated });
                        }}>
                          <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            {local.activeBackgroundId === bg.id && <CheckCircle className="w-5 h-5 text-icc-400" />}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-[10px] text-white truncate font-medium">{bg.name}</p>
                          </div>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            const filtered = local.backgrounds.filter(b => b.id !== bg.id);
                            update({ backgrounds: filtered });
                            if (local.activeBackgroundId === bg.id && filtered.length > 0) {
                              update({ activeBackgroundId: filtered[0].id, backgroundImage: filtered[0].url });
                            }
                          }} className="absolute top-1 right-1 p-0.5 rounded bg-red-500/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <input type="text" value={local.backgrounds.find(b => b.id === local.activeBackgroundId)?.name || ''} onChange={(e) => {
                      const updated = local.backgrounds.map(b => b.id === local.activeBackgroundId ? { ...b, name: e.target.value } : b);
                      update({ backgrounds: updated });
                    }} placeholder="Rename active background" className="input-field w-full max-w-xs text-sm" />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── 2. HERO SLIDESHOW ────────────────────── */}
          {activeSection === 'slideshow' && (
            <SectionCard icon={Layers} title="Hero Background Slideshow" subtitle="Optional rotating background images on the homepage hero">
              <div className="space-y-5">
                <ToggleRow label="Enable Slideshow" desc="Rotate through background images on the homepage" checked={local.slideshowEnabled} onChange={(v) => update({ slideshowEnabled: v })} />
                <RangeRow label="Transition Speed" desc="How fast images transition" value={local.slideshowSpeed} min={2000} max={15000} step={500} format={(v) => `${(v / 1000).toFixed(1)}s`} onChange={(v) => update({ slideshowSpeed: v })} />
                <ToggleRow label="Auto Rotate" desc="Automatically cycle through images" checked={local.slideshowAutoRotate} onChange={(v) => update({ slideshowAutoRotate: v })} />
                <ToggleRow label="Fade Animation" desc="Use fade effect between transitions" checked={local.slideshowFade} onChange={(v) => update({ slideshowFade: v })} />
              </div>
            </SectionCard>
          )}

          {/* ── 3. OVERLAY & BLUR ────────────────────── */}
          {activeSection === 'overlay' && (
            <SectionCard icon={Sliders} title="Overlay & Blur Controls" subtitle="Control the dimming overlay, brightness, and glass blur effect site-wide">
              <div className="space-y-5">
                <ToggleRow label="Enable Background" desc="Show the background image across the entire website" checked={local.backgroundEnabled} onChange={(v) => update({ backgroundEnabled: v })} />
                <ToggleRow label="Enable Overlay" desc="Dim the background to improve text readability" checked={local.enableOverlay} onChange={(v) => update({ enableOverlay: v })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overlay Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button key={c.value} onClick={() => update({ overlayColor: c.value })} className={`w-8 h-8 rounded-lg border-2 transition-all ${local.overlayColor === c.value ? 'border-icc-500 scale-110' : 'border-gray-300 dark:border-gray-600'}`} style={{ backgroundColor: c.value }} title={c.label} />
                    ))}
                    <button onClick={() => setBgColorPicker(!bgColorPicker)} className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-icc-500">
                      <Palette className="w-4 h-4" />
                    </button>
                    {bgColorPicker && <input type="color" value={local.overlayColor} onChange={(e) => update({ overlayColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />}
                  </div>
                </div>
                <ToggleRow label="Gradient Overlay" desc="Apply a gradient overlay instead of solid color" checked={local.overlayGradient} onChange={(v) => update({ overlayGradient: v })} />
                <RangeRow label="Overlay Opacity" desc="How dark the overlay appears" value={local.overlayOpacity} min={0} max={0.85} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => update({ overlayOpacity: v })} />
                <RangeRow label="Background Brightness" desc="Brightness of the background image (lower = darker)" value={local.brightness} min={0} max={2} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => update({ brightness: v })} />
                <RangeRow label="Blur Strength" desc="Blur effect on the background image (0-40px)" value={local.blurStrength} min={0} max={40} step={1} format={(v) => `${v}px`} onChange={(v) => update({ blurStrength: v })} />
              </div>
            </SectionCard>
          )}

          {/* ── 4. THEME COLORS ──────────────────────── */}
          {activeSection === 'colors' && (
            <SectionCard icon={Palette} title="Theme Colors" subtitle="Customize the primary branding colors of the platform">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ColorField label="Primary Color" value={local.primaryColor} onChange={(v) => update({ primaryColor: v })} />
                <ColorField label="Secondary Color" value={local.secondaryColor} onChange={(v) => update({ secondaryColor: v })} />
                <ColorField label="Accent Color" value={local.accentColor} onChange={(v) => update({ accentColor: v })} />
                <ColorField label="Button Color" value={local.buttonColor} onChange={(v) => update({ buttonColor: v })} />
                <ColorField label="Link Color" value={local.linkColor} onChange={(v) => update({ linkColor: v })} />
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</label>
                <div className="flex gap-3 flex-wrap">
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: local.primaryColor }} title="Primary" />
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: local.secondaryColor }} title="Secondary" />
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: local.accentColor }} title="Accent" />
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: local.buttonColor }} title="Button" />
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: local.linkColor }} title="Link" />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── 5. TYPOGRAPHY ────────────────────────── */}
          {activeSection === 'typography' && (
            <SectionCard icon={Type} title="Typography Settings" subtitle="Choose fonts, sizes, and weights for the platform">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Family</label>
                  <select value={local.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })} className="input-field w-full max-w-xs">
                    {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="text-xs mt-1 text-gray-400" style={{ fontFamily: local.fontFamily }}>Sample: بسم الله الرحمن الرحيم — The quick brown fox</p>
                </div>
                <RangeRow label="Base Font Size" desc="Global text size" value={local.fontSize} min={14} max={20} step={1} format={(v) => `${v}px`} onChange={(v) => update({ fontSize: v })} />
                <RangeRow label="Heading Weight" desc="Boldness of titles" value={local.headingWeight} min={400} max={900} step={100} format={(v) => String(v)} onChange={(v) => update({ headingWeight: v })} />
                <RangeRow label="Body Weight" desc="Regular text thickness" value={local.bodyWeight} min={300} max={500} step={100} format={(v) => String(v)} onChange={(v) => update({ bodyWeight: v })} />
              </div>
            </SectionCard>
          )}

          {/* ── 6. DARK / LIGHT MODE ─────────────────── */}
          {activeSection === 'mode' && (
            <SectionCard icon={Sun} title="Default Color Mode" subtitle="Choose the default theme for users">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Dark theme by default' },
                  { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Light theme by default' },
                  { id: 'system', label: 'System Default', icon: Monitor, desc: 'Follow device preference' },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = local.defaultMode === opt.id;
                  return (
                    <button key={opt.id} onClick={() => update({ defaultMode: opt.id as any })} className={`p-4 rounded-xl border-2 text-center transition-all ${
                      active ? 'border-icc-500 bg-icc-500/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${active ? 'text-icc-400' : 'text-gray-400'}`} />
                      <p className={`text-sm font-semibold ${active ? 'text-icc-400' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* ── 7. HOMEPAGE SECTIONS ─────────────────── */}
          {activeSection === 'layout' && (
            <SectionCard icon={Layout} title="Homepage Layout Controls" subtitle="Toggle visibility of homepage sections">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ToggleRow label="Hero Section" checked={local.showHero} onChange={(v) => update({ showHero: v })} />
                <ToggleRow label="Featured Audio" checked={local.showFeaturedAudio} onChange={(v) => update({ showFeaturedAudio: v })} />
                <ToggleRow label="Featured Videos" checked={local.showFeaturedVideos} onChange={(v) => update({ showFeaturedVideos: v })} />
                <ToggleRow label="Featured PDFs" checked={local.showFeaturedPdfs} onChange={(v) => update({ showFeaturedPdfs: v })} />
                <ToggleRow label="Live Stream Section" checked={local.showLiveStream} onChange={(v) => update({ showLiveStream: v })} />
                <ToggleRow label="Categories" checked={local.showCategories} onChange={(v) => update({ showCategories: v })} />
                <ToggleRow label="Biography" checked={local.showBiography} onChange={(v) => update({ showBiography: v })} />
                <ToggleRow label="Statistics" checked={local.showStatistics} onChange={(v) => update({ showStatistics: v })} />
                <ToggleRow label="Newsletter" checked={local.showNewsletter} onChange={(v) => update({ showNewsletter: v })} />
              </div>
            </SectionCard>
          )}

          {/* ── 8. FOOTER BRANDING ───────────────────── */}
          {activeSection === 'footer' && (
            <SectionCard icon={Pen} title="Footer Branding" subtitle="Edit the platform name, description, and copyright text">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
                  <input type="text" value={local.platformName} onChange={(e) => update({ platformName: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Footer Description</label>
                  <textarea value={local.footerDescription} onChange={(e) => update({ footerDescription: e.target.value })} className="input-field w-full h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright Text</label>
                  <input type="text" value={local.copyrightText} onChange={(e) => update({ copyrightText: e.target.value })} className="input-field w-full" />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── 9. CUSTOM LOGO ───────────────────────── */}
          {activeSection === 'logo' && (
            <SectionCard icon={ImageOff} title="Custom Logo Upload" subtitle="Upload logo, favicon, and mobile icon">
              <div className="space-y-5">
                <LogoField label="Logo Image" value={local.logoUrl} onChange={(v) => update({ logoUrl: v })} inputRef={logoInputRef} />
                <LogoField label="Favicon" value={local.faviconUrl} onChange={(v) => update({ faviconUrl: v })} inputRef={faviconInputRef} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Icon</label>
                  <div className="flex gap-2">
                    <input type="text" value={local.mobileIconUrl} onChange={(e) => update({ mobileIconUrl: e.target.value })} placeholder="/uploads/images/icon.png" className="input-field flex-1" />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── 10. BACKGROUND BEHAVIOR ──────────────── */}
          {activeSection === 'behavior' && (
            <SectionCard icon={GripHorizontal} title="Background Behavior" subtitle="How the background image behaves when scrolling">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'fixed', label: 'Fixed', desc: 'Stays in place' },
                  { id: 'parallax', label: 'Parallax', desc: 'Slow movement' },
                  { id: 'scroll', label: 'Scroll', desc: 'Moves with page' },
                  { id: 'zoom', label: 'Zoom', desc: 'Gentle zoom anim' },
                ].map((opt) => {
                  const active = local.backgroundBehavior === opt.id;
                  return (
                    <button key={opt.id} onClick={() => update({ backgroundBehavior: opt.id as any })} className={`p-4 rounded-xl border-2 text-center transition-all ${
                      active ? 'border-icc-500 bg-icc-500/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}>
                      <p className={`text-sm font-semibold ${active ? 'text-icc-400' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* ── 11. RESOURCE CARD APPEARANCE ─────────── */}
          {activeSection === 'cards' && (
            <SectionCard icon={GlassWater} title="Resource Card Appearance" subtitle="Customize how content cards look across the platform">
              <div className="space-y-5">
                <ToggleRow label="Glass Effect" desc="Frosted glass transparency on cards" checked={local.glassEffect} onChange={(v) => update({ glassEffect: v })} />
                <RangeRow label="Border Radius" desc="Card corner roundness" value={local.borderRadius} min={4} max={24} step={2} format={(v) => `${v}px`} onChange={(v) => update({ borderRadius: v })} />
                <RangeRow label="Shadow Strength" desc="Card drop shadow intensity" value={local.shadowStrength} min={0} max={100} step={5} format={(v) => `${v}%`} onChange={(v) => update({ shadowStrength: v })} />
                <ToggleRow label="Hover Animation" desc="Scale effect when hovering cards" checked={local.hoverAnimation} onChange={(v) => update({ hoverAnimation: v })} />
                <RangeRow label="Card Opacity" desc="Background transparency of glass cards" value={local.cardOpacity} min={0.1} max={0.8} step={0.05} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => update({ cardOpacity: v })} />
              </div>
            </SectionCard>
          )}

          {/* ── 12. STATISTICS DESIGN ────────────────── */}
          {activeSection === 'stats' && (
            <SectionCard icon={Monitor} title="Statistics Design" subtitle="Style the animated counters on the homepage">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Counter Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={local.counterColor} onChange={(e) => update({ counterColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                    <span className="text-sm font-mono text-gray-500">{local.counterColor}</span>
                  </div>
                </div>
                <RangeRow label="Animation Speed" desc="How fast counters count up" value={local.animationSpeed} min={500} max={5000} step={100} format={(v) => `${(v / 1000).toFixed(1)}s`} onChange={(v) => update({ animationSpeed: v })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Style</label>
                  <div className="flex gap-3">
                    {(['default', 'glass', 'solid'] as const).map((style) => (
                      <button key={style} onClick={() => update({ counterCardStyle: style })} className={`px-4 py-2 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                        local.counterCardStyle === style ? 'border-icc-500 bg-icc-500/5 text-icc-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>{style}</button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Live Preview Panel */}
        <div className="w-72 shrink-0 hidden xl:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-icc-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Live Preview</span>
              </div>
              <div className="p-4">
                <div className="w-full aspect-[3/4] rounded-xl relative overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
                  style={{
                    backgroundImage: local.backgroundEnabled && local.backgroundImage ? `url("${local.backgroundImage}")` : undefined,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: local.backgroundEnabled ? undefined : '#020617',
                  }}
                >
                  {(local.backgroundEnabled && local.enableOverlay) && (
                    <div className="absolute inset-0 pointer-events-none transition-all duration-300 z-0"
                      style={{
                        background: local.overlayGradient
                          ? `linear-gradient(135deg, ${local.overlayColor}dd, ${local.overlayColor}99 40%, transparent 100%)`
                          : local.overlayColor,
                        opacity: local.overlayOpacity,
                        backdropFilter: `blur(${local.blurStrength}px) brightness(${local.brightness})`,
                        WebkitBackdropFilter: `blur(${local.blurStrength}px) brightness(${local.brightness})`,
                      }}
                    />
                  )}
                  <div className="relative z-10 p-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {local.logoUrl ? (
                        <img src={local.logoUrl} className="w-5 h-5 rounded" alt="" />
                      ) : (
                        <div className="w-4 h-4 rounded bg-icc-500" />
                      )}
                      <span className="text-[7px] font-bold text-white drop-shadow-lg truncate max-w-[80px]">{local.platformName.substring(0, 30)}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-sm bg-white/20" />
                      <div className="w-2 h-2 rounded-sm bg-white/20" />
                    </div>
                  </div>
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-3 gap-1.5">
                    <div className="text-[9px] font-bold text-white drop-shadow-lg" style={{ fontFamily: local.fontFamily }}>Welcome to Islamic Learning</div>
                    <div className="w-full rounded" style={{
                      backgroundColor: `rgba(0,0,0,${local.cardOpacity})`,
                      backdropFilter: local.glassEffect ? `blur(${local.blurStrength}px)` : 'none',
                      borderRadius: `${local.borderRadius}px`,
                      boxShadow: `0 2px ${1 + local.shadowStrength / 25}px rgba(0,0,0,${0.1 + local.shadowStrength / 1000})`,
                      padding: '6px 8px',
                    }}>
                      <div className="flex items-center gap-2">
                        <Music className="w-3 h-3 text-icc-400 shrink-0" />
                        <span className="text-[7px] text-white truncate">Tafsir Surah Al-Fatihah — Lesson 7</span>
                      </div>
                    </div>
                    <div className="w-full rounded flex gap-1" style={{
                      backgroundColor: `rgba(0,0,0,${local.cardOpacity})`,
                      backdropFilter: local.glassEffect ? `blur(${local.blurStrength}px)` : 'none',
                      borderRadius: `${local.borderRadius}px`,
                      padding: '4px 6px',
                    }}>
                      <Video className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="text-[6px] text-white truncate">Seerah — The Birth of the Prophet</span>
                    </div>
                    <div className="w-full rounded flex gap-1" style={{
                      backgroundColor: `rgba(0,0,0,${local.cardOpacity})`,
                      backdropFilter: local.glassEffect ? `blur(${local.blurStrength}px)` : 'none',
                      borderRadius: `${local.borderRadius}px`,
                      padding: '4px 6px',
                    }}>
                      <FileText className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="text-[6px] text-white truncate">Riyadus Salihin — Book of Sincerity</span>
                    </div>
                  </div>
                  <div className="relative z-10 p-2 border-t border-white/10">
                    <div className="flex justify-between text-[6px] text-white/50">
                      <span>&copy; {local.platformName.substring(0, 25)}</span>
                      <span>Audio Player</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Real-time preview of appearance changes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function SectionCard({ icon: Icon, title, subtitle, children }: { icon: any; title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-icc-500/10 text-icc-400">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</label>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-icc-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function RangeRow({ label, desc, value, min, max, step, format, onChange }: {
  label: string; desc?: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          {desc && <p className="text-xs text-gray-400">{desc}</p>}
        </div>
        <span className="text-xs font-mono font-bold text-icc-500">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-icc-500"
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="flex gap-2 items-center">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="input-field flex-1 font-mono text-sm" />
      </div>
    </div>
  );
}

function LogoField({ label, value, onChange, inputRef }: { label: string; value: string; onChange: (v: string) => void; inputRef: React.Ref<HTMLInputElement> }) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('title', label);
    fd.append('category', 'General'); fd.append('resourceType', 'IMAGE');
    try {
      const res = await adminApi.upload(fd);
      if (res.data?.url) onChange(res.data.url);
    } catch {} finally { setUploading(false); }
  };
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="flex gap-2 items-center">
        <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
          {value ? <img src={value} alt={label} className="w-full h-full object-contain" /> : <ImageIcon className="w-5 h-5 text-gray-300" />}
        </div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/images/logo.png" className="input-field flex-1 text-sm font-mono" />
        <label className="cursor-pointer p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors">
          <Upload className="w-4 h-4 text-gray-500" />
          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
        {value && (
          <button onClick={() => onChange('')} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 transition-colors">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}
