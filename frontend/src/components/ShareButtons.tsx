import { FaTelegramPlane, FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';
import { HiLink } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useTranslation } from '../i18n';

interface Props {
  url: string;
  title: string;
  description?: string;
}

export default function ShareButtons({ url, title }: Props) {
  const { t } = useTranslation();
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success(t('share.copied'));
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-[#0088cc] hover:bg-[#0077b5] text-white flex items-center justify-center transition-colors"
        title={t('share.telegram')}
      >
        <FaTelegramPlane className="w-4 h-4" />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#20bd5c] text-white flex items-center justify-center transition-colors"
        title={t('share.whatsapp')}
      >
        <FaWhatsapp className="w-4 h-4" />
      </a>
      <a
        href={`https://facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-colors"
        title={t('share.facebook')}
      >
        <FaFacebook className="w-4 h-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white flex items-center justify-center transition-colors"
        title={t('share.twitter')}
      >
        <FaTwitter className="w-4 h-4" />
      </a>
      <button
        onClick={copyLink}
        className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors"
        title={t('share.copy_link')}
      >
        <HiLink className="w-4 h-4" />
      </button>
    </div>
  );
}
