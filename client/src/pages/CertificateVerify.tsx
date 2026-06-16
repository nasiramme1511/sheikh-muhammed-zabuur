import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiBadgeCheck, HiXCircle, HiSearch, HiAcademicCap, HiUser, HiCalendar, HiShieldCheck } from 'react-icons/hi';
import { useTranslation } from '../i18n';
import api from '../lib/api';

interface CertificateData {
  verified: boolean;
  studentName: string;
  courseName: string;
  teacherName: string;
  issueDate: string;
  verificationCode: string;
}

export default function CertificateVerify() {
  const { code } = useParams<{ code: string }>();
  const { t } = useTranslation();
  const [inputCode, setInputCode] = useState(code || '');
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const verify = async (verificationCode: string) => {
    if (!verificationCode.trim()) return;
    setLoading(true);
    setError(false);
    setCert(null);
    setSearched(false);
    try {
      const res = await api.get('/certificates/verify/' + verificationCode.trim());
      const data = res.data as CertificateData;
      if (data.verified) {
        setCert(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    if (code) {
      setInputCode(code);
      verify(code);
    }
  }, [code]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify(inputCode);
  };

  const handleReset = () => {
    setCert(null);
    setError(false);
    setSearched(false);
    setInputCode('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-icc-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold-500/5 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-icc-500 to-icc-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-icc-500/20">
            <HiShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            {t('certificate_verify.title')}
          </h1>
          <p className="text-white/50 mt-2 text-sm max-w-md mx-auto">
            {t('certificate_verify.header_desc')}
          </p>
        </div>

        {/* Search Form */}
        {!cert && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-premium p-6 md:p-8 mb-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-icc-500/50 focus:ring-1 focus:ring-icc-500/30 transition-all text-sm"
                  placeholder={t('certificate_verify.enter_code')}
                  autoFocus={!code}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading || !inputCode.trim()}
                className="btn-icc w-full py-3.5 justify-center font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('certificate_verify.verifying')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <HiShieldCheck className="w-4 h-4" />
                    {t('certificate_verify.verify')}
                  </span>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-icc-500/30 border-t-icc-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Verified Certificate */}
        {cert && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Verified Badge */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-icc-500/20 border-2 border-icc-400/40 flex items-center justify-center mx-auto mb-4"
              >
                <HiBadgeCheck className="w-10 h-10 text-icc-400" />
              </motion.div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400 text-sm font-bold">
                <HiBadgeCheck className="w-4 h-4" />
                {t('certificate_verify.verified')}
              </div>
            </div>

            {/* Certificate Card */}
            <div className="glass-card-premium p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-icc-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              {/* Issuer */}
              <div className="text-center mb-8 border-b border-white/5 pb-8">
                <HiAcademicCap className="w-10 h-10 text-icc-400 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-white/80">
                  {t('certificate_verify.issuer')}
                </h2>
              </div>

              {/* Issued To */}
              <div className="text-center mb-8">
                <p className="text-sm text-white/40 mb-1">{t('certificate_verify.issued_to')}</p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                  {cert.studentName}
                </h3>
              </div>

              <div className="text-center mb-8">
                <p className="text-sm text-white/40 mb-1">{t('certificate_verify.has_completed')}</p>
                <h4 className="text-xl md:text-2xl font-bold text-icc-400">
                  {cert.courseName}
                </h4>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl bg-white/5 border border-white/5 p-4 flex items-center gap-3">
                  <HiUser className="w-5 h-5 text-icc-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      {t('certificate_verify.teacher')}
                    </p>
                    <p className="text-sm font-semibold text-white truncate">
                      {cert.teacherName}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/5 p-4 flex items-center gap-3">
                  <HiCalendar className="w-5 h-5 text-icc-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      {t('certificate_verify.issue_date')}
                    </p>
                    <p className="text-sm font-semibold text-white truncate">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Code */}
              <div className="text-center border-t border-white/5 pt-6">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">
                  {t('certificate_verify.verification_code')}
                </p>
                <div className="inline-block px-5 py-2.5 rounded-xl bg-dark-900/60 border border-white/5">
                  <code className="text-sm font-mono font-bold tracking-wider text-icc-400">
                    {cert.verificationCode}
                  </code>
                </div>
              </div>

              {/* Valid Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-icc-400/70">
                  {t('certificate_verify.valid')}
                </p>
              </div>
            </div>

            {/* Check Another */}
            <div className="text-center mt-6">
              <motion.button
                onClick={handleReset}
                className="btn-outline px-6 py-3 text-sm font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HiSearch className="w-4 h-4" />
                {t('certificate_verify.check_another')}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-premium p-8 md:p-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-400/20 flex items-center justify-center mx-auto mb-4">
              <HiXCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('certificate_verify.not_found')}
            </h2>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
              {t('certificate_verify.invalid')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                onClick={handleReset}
                className="btn-icc px-6 py-3 text-sm font-bold justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HiSearch className="w-4 h-4" />
                {t('certificate_verify.check_another')}
              </motion.button>
              <Link to="/" className="btn-outline px-6 py-3 text-sm font-bold justify-center">
                {t('common.back_to_home')}
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
