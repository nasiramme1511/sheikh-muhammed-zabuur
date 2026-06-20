import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
const Layout = lazy(() => import('./components/Layout'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const MyDownloads = lazy(() => import('./pages/MyDownloads'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import GuestRoute from './components/GuestRoute';

// Lazy-loaded public pages
const AudioLibrary = lazy(() => import('./pages/AudioLibrary'));
const VideoLibrary = lazy(() => import('./pages/VideoLibrary'));
const PdfLibrary = lazy(() => import('./pages/PdfLibrary'));
const LiveStream = lazy(() => import('./pages/LiveStream'));
const Recordings = lazy(() => import('./pages/Recordings'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const ResourceCategoryPage = lazy(() => import('./pages/ResourceCategory'));
const CategoriesPage = lazy(() => import('./pages/Categories'));
const LessonDetail = lazy(() => import('./pages/LessonDetail'));
const TelegramChannels = lazy(() => import('./pages/TelegramChannels'));
const OfflineVideoPlayer = lazy(() => import('./pages/OfflineVideoPlayer'));
const OfflinePdfReader = lazy(() => import('./pages/OfflinePdfReader'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const SeriesPage = lazy(() => import('./pages/SeriesPage'));

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminSeries = lazy(() => import('./pages/admin/SeriesManagement'));
const AdminAudio = lazy(() => import('./pages/admin/AudioManagement'));
const AdminVideos = lazy(() => import('./pages/admin/VideoManagement'));
const AdminPdfs = lazy(() => import('./pages/admin/PdfManagement'));
const AdminLiveStream = lazy(() => import('./pages/admin/LiveStream'));
const AdminStreamSchedule = lazy(() => import('./pages/admin/StreamSchedule'));
const AdminTelegramChannels = lazy(() => import('./pages/admin/TelegramChannels'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const AdminHomepage = lazy(() => import('./pages/admin/Homepage'));
const AdminScholarProfile = lazy(() => import('./pages/admin/ScholarProfile'));
const AdminMedia = lazy(() => import('./pages/admin/MediaLibrary'));
const AdminSiteSettings = lazy(() => import('./pages/admin/SiteSettings'));
const AdminSeo = lazy(() => import('./pages/admin/SeoSettings'));

// Lazy-loaded dashboard pages
const DashboardHome = lazy(() => import('./pages/dashboard/Home'));
const DashboardContinueListening = lazy(() => import('./pages/dashboard/ContinueListening'));
const DashboardContinueWatching = lazy(() => import('./pages/dashboard/ContinueWatching'));
const DashboardSavedLessons = lazy(() => import('./pages/dashboard/SavedLessons'));
const DashboardDownloadedAudio = lazy(() => import('./pages/dashboard/DownloadedAudio'));
const DashboardListeningHistory = lazy(() => import('./pages/dashboard/ListeningHistory'));
const DashboardWatchHistory = lazy(() => import('./pages/dashboard/WatchHistory'));
const DashboardProfile = lazy(() => import('./pages/dashboard/Profile'));
const DashboardSettings = lazy(() => import('./pages/dashboard/Settings'));

function PageFallback() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}

function DashboardFallback() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
        <div className="w-2 h-2 rounded-full bg-icc-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* MY LIBRARY ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<DashboardFallback />}>
              <DashboardLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<DashboardFallback />}><DashboardHome /></Suspense>} />
        <Route path="continue-listening" element={<Suspense fallback={<DashboardFallback />}><DashboardContinueListening /></Suspense>} />
        <Route path="continue-watching" element={<Suspense fallback={<DashboardFallback />}><DashboardContinueWatching /></Suspense>} />
        <Route path="saved-lessons" element={<Suspense fallback={<DashboardFallback />}><DashboardSavedLessons /></Suspense>} />
        <Route path="downloaded-audio" element={<Suspense fallback={<DashboardFallback />}><DashboardDownloadedAudio /></Suspense>} />
        <Route path="listening-history" element={<Suspense fallback={<DashboardFallback />}><DashboardListeningHistory /></Suspense>} />
        <Route path="watch-history" element={<Suspense fallback={<DashboardFallback />}><DashboardWatchHistory /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<DashboardFallback />}><DashboardProfile /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<DashboardFallback />}><DashboardSettings /></Suspense>} />
      </Route>

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
        {/* Content */}
        <Route path="series" element={<Suspense fallback={<AdminFallback />}><AdminSeries /></Suspense>} />
        <Route path="audio" element={<Suspense fallback={<AdminFallback />}><AdminAudio /></Suspense>} />
        <Route path="videos" element={<Suspense fallback={<AdminFallback />}><AdminVideos /></Suspense>} />
        <Route path="pdfs" element={<Suspense fallback={<AdminFallback />}><AdminPdfs /></Suspense>} />
        {/* Live */}
        <Route path="live" element={<Suspense fallback={<AdminFallback />}><AdminLiveStream /></Suspense>} />
        <Route path="stream-schedule" element={<Suspense fallback={<AdminFallback />}><AdminStreamSchedule /></Suspense>} />
        {/* Community */}
        <Route path="telegram" element={<Suspense fallback={<AdminFallback />}><AdminTelegramChannels /></Suspense>} />
        <Route path="announcements" element={<Suspense fallback={<AdminFallback />}><AdminAnnouncements /></Suspense>} />
        {/* Website */}
        <Route path="homepage" element={<Suspense fallback={<AdminFallback />}><AdminHomepage /></Suspense>} />
        <Route path="scholar" element={<Suspense fallback={<AdminFallback />}><AdminScholarProfile /></Suspense>} />
        <Route path="media" element={<Suspense fallback={<AdminFallback />}><AdminMedia /></Suspense>} />
        <Route path="site-settings" element={<Suspense fallback={<AdminFallback />}><AdminSiteSettings /></Suspense>} />
        <Route path="seo" element={<Suspense fallback={<AdminFallback />}><AdminSeo /></Suspense>} />
      </Route>

      {/* PUBLIC ROUTES */}
      <Route element={<Suspense fallback={<PageFallback />}><Layout /></Suspense>}>
        <Route path="/" element={<Suspense fallback={<PageFallback />}><Home /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<PageFallback />}><About /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageFallback />}><Contact /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageFallback />}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageFallback />}><Terms /></Suspense>} />
        <Route path="/cookies" element={<Suspense fallback={<PageFallback />}><Cookies /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<PageFallback />}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageFallback />}><Register /></Suspense>} />
        <Route path="/audio" element={<GuestRoute><Suspense fallback={<PageFallback />}><AudioLibrary /></Suspense></GuestRoute>} />
        <Route path="/videos" element={<GuestRoute><Suspense fallback={<PageFallback />}><VideoLibrary /></Suspense></GuestRoute>} />
        <Route path="/pdfs" element={<GuestRoute><Suspense fallback={<PageFallback />}><PdfLibrary /></Suspense></GuestRoute>} />
        <Route path="/live" element={<GuestRoute><Suspense fallback={<PageFallback />}><LiveStream /></Suspense></GuestRoute>} />
        <Route path="/recordings" element={<GuestRoute><Suspense fallback={<PageFallback />}><Recordings /></Suspense></GuestRoute>} />
        <Route path="/collections/:slug" element={<GuestRoute><Suspense fallback={<PageFallback />}><CollectionDetail /></Suspense></GuestRoute>} />
        <Route path="/series" element={<GuestRoute><Suspense fallback={<PageFallback />}><SeriesPage /></Suspense></GuestRoute>} />
        <Route path="/series/:slug" element={<GuestRoute><Suspense fallback={<PageFallback />}><SeriesDetail /></Suspense></GuestRoute>} />
        <Route path="/category/:slug" element={<GuestRoute><Suspense fallback={<PageFallback />}><ResourceCategoryPage /></Suspense></GuestRoute>} />
        <Route path="/categories" element={<GuestRoute><Suspense fallback={<PageFallback />}><CategoriesPage /></Suspense></GuestRoute>} />
        <Route path="/lessons/:slug" element={<GuestRoute><Suspense fallback={<PageFallback />}><LessonDetail /></Suspense></GuestRoute>} />
        <Route path="/telegram" element={<GuestRoute><Suspense fallback={<PageFallback />}><TelegramChannels /></Suspense></GuestRoute>} />
        <Route path="/search" element={<GuestRoute><Suspense fallback={<PageFallback />}><SearchPage /></Suspense></GuestRoute>} />
        <Route path="/my-downloads" element={<Suspense fallback={<PageFallback />}><MyDownloads /></Suspense>} />
        <Route path="/offline/video/:id" element={<Suspense fallback={<PageFallback />}><OfflineVideoPlayer /></Suspense>} />
        <Route path="/offline/pdf/:id" element={<Suspense fallback={<PageFallback />}><OfflinePdfReader /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFound /></Suspense>} />
      </Route>
    </Routes>
  );
}
