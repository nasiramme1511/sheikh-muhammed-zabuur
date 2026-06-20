import { FaTelegramPlane } from 'react-icons/fa';

export default function FloatingTelegram() {
  return (
    <div className="fixed bottom-20 md:bottom-24 right-4 z-40 group">
      <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-lg bg-surface-900 border border-white/10 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
        <span className="text-xs text-white font-medium">Join us on Telegram</span>
        <div className="absolute top-full right-4 w-2 h-2 bg-surface-900 border-r border-b border-white/10 -rotate-45 -mt-1" />
      </div>
      <a
        href="https://t.me/sheikhmohammedzabuur"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#229ED9] to-[#0088cc] text-white shadow-lg shadow-[#0088cc]/30 hover:shadow-[#0088cc]/50 hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Join us on Telegram"
      >
        <FaTelegramPlane className="w-5 h-5 md:w-6 md:h-6" />
        <span className="absolute inset-0 rounded-full animate-ping-slow bg-[#0088cc]/30" />
      </a>
    </div>
  );
}
