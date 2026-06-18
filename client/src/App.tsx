import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import SearchPage from './pages/SearchPage';
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

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminResources = lazy(() => import('./pages/admin/Resources'));
const AdminImport = lazy(() => import('./pages/admin/Import'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminLiveStream = lazy(() => import('./pages/admin/LiveStream'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminAppearance = lazy(() => import('./pages/admin/Appearance'));
const AdminAudio = lazy(() => import('./pages/admin/AudioManagement'));
const AdminVideos = lazy(() => import('./pages/admin/VideoManagement'));
const AdminPdfs = lazy(() => import('./pages/admin/PdfManagement'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const AdminMedia = lazy(() => import('./pages/admin/MediaLibrary'));
const AdminRecordings = lazy(() => import('./pages/admin/RecordingsPage'));
const AdminStreamSchedule = lazy(() => import('./pages/admin/StreamSchedule'));
const AdminRecordingArchive = lazy(() => import('./pages/admin/RecordingArchive'));
const AdminRoles = lazy(() => import('./pages/admin/Roles'));
const AdminPermissions = lazy(() => import('./pages/admin/Permissions'));
const AdminHomepage = lazy(() => import('./pages/admin/Homepage'));
const AdminNavigation = lazy(() => import('./pages/admin/NavigationMenu'));
const AdminFooter = lazy(() => import('./pages/admin/FooterSettings'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminNewsletter = lazy(() => import('./pages/admin/Newsletter'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminUserAnalytics = lazy(() => import('./pages/admin/UserAnalytics'));
const AdminDownloadReports = lazy(() => import('./pages/admin/DownloadReports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminBackup = lazy(() => import('./pages/admin/Backup'));
const AdminActivity = lazy(() => import('./pages/admin/ActivityLogs'));
const AdminCollections = lazy(() => import('./pages/admin/Collections'));
const AdminBulkUpload = lazy(() => import('./pages/admin/BulkUpload'));
const AdminTelegramChannels = lazy(() => import('./pages/admin/TelegramChannels'));
const AdminScholarProfile = lazy(() => import('./pages/admin/ScholarProfile'));
const AdminSiteSettings = lazy(() => import('./pages/admin/SiteSettings'));

// Lazy-loaded dashboard pages
const DashboardHome = lazy(() => import('./pages/dashboard/Home'));
const DashboardBookmarks = lazy(() => import('./pages/dashboard/Bookmarks'));
const DashboardDownloads = lazy(() => import('./pages/dashboard/Downloads'));
const DashboardProfile = lazy(() => import('./pages/dashboard/Profile'));
const DashboardSettings = lazy(() => import('./pages/dashboard/Settings'));
const DashboardAudioHistory = lazy(() => import('./pages/dashboard/AudioHistory'));
const DashboardVideoHistory = lazy(() => import('./pages/dashboard/VideoHistory'));
const DashboardPdfHistory = lazy(() => import('./pages/dashboard/PdfHistory'));

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
      {/* DASHBOARD ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<DashboardFallback />}><DashboardHome /></Suspense>} />
        <Route path="bookmarks" element={<Suspense fallback={<DashboardFallback />}><DashboardBookmarks /></Suspense>} />
        <Route path="downloads" element={<Suspense fallback={<DashboardFallback />}><DashboardDownloads /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<DashboardFallback />}><DashboardProfile /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<DashboardFallback />}><DashboardSettings /></Suspense>} />
        <Route path="audio-history" element={<Suspense fallback={<DashboardFallback />}><DashboardAudioHistory /></Suspense>} />
        <Route path="video-history" element={<Suspense fallback={<DashboardFallback />}><DashboardVideoHistory /></Suspense>} />
        <Route path="pdf-history" element={<Suspense fallback={<DashboardFallback />}><DashboardPdfHistory /></Suspense>} />
      </Route>

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
        <Route path="resources" element={<Suspense fallback={<AdminFallback />}><AdminResources /></Suspense>} />
        <Route path="import" element={<Suspense fallback={<AdminFallback />}><AdminImport /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<AdminFallback />}><AdminUsers /></Suspense>} />
        <Route path="live" element={<Suspense fallback={<AdminFallback />}><AdminLiveStream /></Suspense>} />
        <Route path="categories" element={<Suspense fallback={<AdminFallback />}><AdminCategories /></Suspense>} />
        <Route path="appearance" element={<Suspense fallback={<AdminFallback />}><AdminAppearance /></Suspense>} />
        {/* Content Management */}
        <Route path="audio" element={<Suspense fallback={<AdminFallback />}><AdminAudio /></Suspense>} />
        <Route path="videos" element={<Suspense fallback={<AdminFallback />}><AdminVideos /></Suspense>} />
        <Route path="pdfs" element={<Suspense fallback={<AdminFallback />}><AdminPdfs /></Suspense>} />
        <Route path="gallery" element={<Suspense fallback={<AdminFallback />}><AdminGallery /></Suspense>} />
        <Route path="recordings" element={<Suspense fallback={<AdminFallback />}><AdminRecordings /></Suspense>} />
        {/* Content Tools */}
        <Route path="bulk-upload" element={<Suspense fallback={<AdminFallback />}><AdminBulkUpload /></Suspense>} />
        <Route path="collections" element={<Suspense fallback={<AdminFallback />}><AdminCollections /></Suspense>} />
        <Route path="media" element={<Suspense fallback={<AdminFallback />}><AdminMedia /></Suspense>} />
        {/* Live Broadcasting */}
        <Route path="stream-schedule" element={<Suspense fallback={<AdminFallback />}><AdminStreamSchedule /></Suspense>} />
        <Route path="recording-archive" element={<Suspense fallback={<AdminFallback />}><AdminRecordingArchive /></Suspense>} />
        {/* Users & Access */}
        <Route path="roles" element={<Suspense fallback={<AdminFallback />}><AdminRoles /></Suspense>} />
        <Route path="permissions" element={<Suspense fallback={<AdminFallback />}><AdminPermissions /></Suspense>} />
        {/* Website Management */}
        <Route path="homepage" element={<Suspense fallback={<AdminFallback />}><AdminHomepage /></Suspense>} />
        <Route path="navigation" element={<Suspense fallback={<AdminFallback />}><AdminNavigation /></Suspense>} />
        <Route path="footer" element={<Suspense fallback={<AdminFallback />}><AdminFooter /></Suspense>} />
        {/* Communication */}
        <Route path="announcements" element={<Suspense fallback={<AdminFallback />}><AdminAnnouncements /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<AdminFallback />}><AdminNotifications /></Suspense>} />
        <Route path="newsletter" element={<Suspense fallback={<AdminFallback />}><AdminNewsletter /></Suspense>} />
        {/* Analytics */}
        <Route path="analytics" element={<Suspense fallback={<AdminFallback />}><AdminAnalytics /></Suspense>} />
        <Route path="user-analytics" element={<Suspense fallback={<AdminFallback />}><AdminUserAnalytics /></Suspense>} />
        <Route path="download-reports" element={<Suspense fallback={<AdminFallback />}><AdminDownloadReports /></Suspense>} />
        {/* System */}
        <Route path="settings" element={<Suspense fallback={<AdminFallback />}><AdminSettings /></Suspense>} />
        <Route path="backup" element={<Suspense fallback={<AdminFallback />}><AdminBackup /></Suspense>} />
        <Route path="activity" element={<Suspense fallback={<AdminFallback />}><AdminActivity /></Suspense>} />
        <Route path="telegram" element={<Suspense fallback={<AdminFallback />}><AdminTelegramChannels /></Suspense>} />
        <Route path="scholar" element={<Suspense fallback={<AdminFallback />}><AdminScholarProfile /></Suspense>} />
        <Route path="site-settings" element={<Suspense fallback={<AdminFallback />}><AdminSiteSettings /></Suspense>} />
      </Route>

      {/* PUBLIC ROUTES */}
      <Route element={<Layout />}>
        {/* Public pages - accessible without login */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Suspense fallback={<PageFallback />}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageFallback />}><Terms /></Suspense>} />
        <Route path="/cookies" element={<Suspense fallback={<PageFallback />}><Cookies /></Suspense>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected content - requires login (shows login wall for guests) */}
        <Route path="/audio" element={<GuestRoute><Suspense fallback={<PageFallback />}><AudioLibrary /></Suspense></GuestRoute>} />
        <Route path="/videos" element={<GuestRoute><Suspense fallback={<PageFallback />}><VideoLibrary /></Suspense></GuestRoute>} />
        <Route path="/pdfs" element={<GuestRoute><Suspense fallback={<PageFallback />}><PdfLibrary /></Suspense></GuestRoute>} />
        <Route path="/live" element={<GuestRoute><Suspense fallback={<PageFallback />}><LiveStream /></Suspense></GuestRoute>} />
        <Route path="/recordings" element={<GuestRoute><Suspense fallback={<PageFallback />}><Recordings /></Suspense></GuestRoute>} />
        <Route path="/collections/:slug" element={<GuestRoute><Suspense fallback={<PageFallback />}><CollectionDetail /></Suspense></GuestRoute>} />
        <Route path="/category/:slug" element={<GuestRoute><Suspense fallback={<PageFallback />}><ResourceCategoryPage /></Suspense></GuestRoute>} />
        <Route path="/categories" element={<GuestRoute><Suspense fallback={<PageFallback />}><CategoriesPage /></Suspense></GuestRoute>} />
        <Route path="/lessons/:slug" element={<GuestRoute><Suspense fallback={<PageFallback />}><LessonDetail /></Suspense></GuestRoute>} />
        <Route path="/telegram" element={<GuestRoute><Suspense fallback={<PageFallback />}><TelegramChannels /></Suspense></GuestRoute>} />
        <Route path="/search" element={<GuestRoute><SearchPage /></GuestRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
