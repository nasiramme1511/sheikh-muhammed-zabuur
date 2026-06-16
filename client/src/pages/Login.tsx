import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { useSEO } from '../seo/metadata';
import toast from 'react-hot-toast';

export default function Login() {
  useSEO({
    title: 'Login',
    description: 'Sign in to your account on Sheikh Mohammed Zabuur Iman Chercher College to access bookmarks, downloads, and learning history.',
  });

  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('auth.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-icc-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card-premium p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-icc-500/20">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{t('auth.welcome_back')}</h1>
            <p className="text-sm text-white/50 mt-1">{t('auth.sign_in_to_account')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm"
                  placeholder={t('auth.email_placeholder')}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm"
                  placeholder={t('auth.password_placeholder')}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn-icc w-full py-3.5"
              disabled={loading}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('auth.signing_in')}
                </span>
              ) : (
                t('auth.sign_in')
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-icc-400 hover:text-icc-300 font-medium transition-colors">
              {t('auth.sign_up_link')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
