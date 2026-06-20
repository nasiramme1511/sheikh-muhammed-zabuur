import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
const Layout = lazy(() => import('./components/Layout'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Lazy-loaded public pages
const AudioLibrary = lazy(() => import('./pages/AudioLibrary'));
const VideoLibrary = lazy(() => import('./pages/VideoLibrary'));
const LiveStream = lazy(() => import('./pages/LiveStream'));
const Recordings = lazy(() => import('./pages/Recordings'));
const LessonDetail = lazy(() => import('./pages/LessonDetail'));
const TelegramChannels = lazy(() => import('./pages/TelegramChannels'));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail'));
const SeriesPage = lazy(() => import('./pages/SeriesPage'));
const ResourcesPage = lazy(() => import('./pages/Resources'));

const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/Home'));
const ContinueListening = lazy(() => import('./pages/dashboard/ContinueListening'));
const ContinueWatching = lazy(() => import('./pages/dashboard/ContinueWatching'));
const SavedLessons = lazy(() => import('./pages/dashboard/SavedLessons'));
const DownloadedAudio = lazy(() => import('./pages/dashboard/DownloadedAudio'));
const ListeningHistory = lazy(() => import('./pages/dashboard/ListeningHistory'));
const WatchHistory = lazy(() => import('./pages/dashboard/WatchHistory'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const DashboardSettings = lazy(() => import('./pages/dashboard/Settings'));

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminSeries = lazy(() => import('./pages/admin/SeriesManagement'));
const AdminAudio = lazy(() => import('./pages/admin/AudioManagement'));
const AdminVideos = lazy(() => import('./pages/admin/VideoManagement'));
const AdminLiveStream = lazy(() => import('./pages/admin/LiveStream'));
const AdminRecordings = lazy(() => import('./pages/admin/RecordingArchive'));
const AdminTelegramChannels = lazy(() => import('./pages/admin/TelegramChannels'));
const AdminHomepage = lazy(() => import('./pages/admin/Homepage'));
const AdminScholarProfile = lazy(() => import('./pages/admin/ScholarProfile'));
const AdminSiteSettings = lazy(() => import('./pages/admin/SiteSettings'));
const AdminSeo = lazy(() => import('./pages/admin/SeoSettings'));
const AdminBulkUpload = lazy(() => import('./pages/admin/BulkUpload'));

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

export default function App() {
  return (
    <Routes>
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
        <Route path="series" element={<Suspense fallback={<AdminFallback />}><AdminSeries /></Suspense>} />
        <Route path="audio" element={<Suspense fallback={<AdminFallback />}><AdminAudio /></Suspense>} />
        <Route path="videos" element={<Suspense fallback={<AdminFallback />}><AdminVideos /></Suspense>} />
        <Route path="live" element={<Suspense fallback={<AdminFallback />}><AdminLiveStream /></Suspense>} />
        <Route path="recordings" element={<Suspense fallback={<AdminFallback />}><AdminRecordings /></Suspense>} />
        <Route path="telegram" element={<Suspense fallback={<AdminFallback />}><AdminTelegramChannels /></Suspense>} />
        <Route path="homepage" element={<Suspense fallback={<AdminFallback />}><AdminHomepage /></Suspense>} />
        <Route path="scholar" element={<Suspense fallback={<AdminFallback />}><AdminScholarProfile /></Suspense>} />
        <Route path="site-settings" element={<Suspense fallback={<AdminFallback />}><AdminSiteSettings /></Suspense>} />
        <Route path="seo" element={<Suspense fallback={<AdminFallback />}><AdminSeo /></Suspense>} />
        <Route path="bulk-upload" element={<Suspense fallback={<AdminFallback />}><AdminBulkUpload /></Suspense>} />
      </Route>

      {/* DASHBOARD ROUTES */}
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<PageFallback />}>
            <DashboardLayout />
          </Suspense>
        }
      >
        <Route index element={<Suspense fallback={<PageFallback />}><DashboardHome /></Suspense>} />
        <Route path="continue-listening" element={<Suspense fallback={<PageFallback />}><ContinueListening /></Suspense>} />
        <Route path="continue-watching" element={<Suspense fallback={<PageFallback />}><ContinueWatching /></Suspense>} />
        <Route path="saved-lessons" element={<Suspense fallback={<PageFallback />}><SavedLessons /></Suspense>} />
        <Route path="downloaded-audio" element={<Suspense fallback={<PageFallback />}><DownloadedAudio /></Suspense>} />
        <Route path="listening-history" element={<Suspense fallback={<PageFallback />}><ListeningHistory /></Suspense>} />
        <Route path="watch-history" element={<Suspense fallback={<PageFallback />}><WatchHistory /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageFallback />}><Profile /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageFallback />}><DashboardSettings /></Suspense>} />
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
        <Route path="/audio" element={<Suspense fallback={<PageFallback />}><AudioLibrary /></Suspense>} />
        <Route path="/videos" element={<Suspense fallback={<PageFallback />}><VideoLibrary /></Suspense>} />
        <Route path="/live" element={<Suspense fallback={<PageFallback />}><LiveStream /></Suspense>} />
        <Route path="/recordings" element={<Suspense fallback={<PageFallback />}><Recordings /></Suspense>} />
        <Route path="/series" element={<Suspense fallback={<PageFallback />}><SeriesPage /></Suspense>} />
        <Route path="/series/:slug" element={<Suspense fallback={<PageFallback />}><SeriesDetail /></Suspense>} />
        <Route path="/resources" element={<Suspense fallback={<PageFallback />}><ResourcesPage /></Suspense>} />
        <Route path="/lessons/:slug" element={<Suspense fallback={<PageFallback />}><LessonDetail /></Suspense>} />
        <Route path="/telegram" element={<Suspense fallback={<PageFallback />}><TelegramChannels /></Suspense>} />
        <Route path="/search" element={<Suspense fallback={<PageFallback />}><SearchPage /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFound /></Suspense>} />
      </Route>
    </Routes>
  );
}
