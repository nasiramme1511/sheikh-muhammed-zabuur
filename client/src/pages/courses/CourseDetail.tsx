import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Globe, Clock, ArrowLeft, Play, CheckCircle2, ChevronRight, UserPlus, ShieldAlert } from 'lucide-react';
import { courses as coursesApi } from '../../lib/api';
import { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.getBySlug(slug || '');
      const c = res.data as Course;
      setCourse(c);

      // Check enrollment status if logged in
      if (user) {
        const enrollRes = await coursesApi.getMyEnrollments();
        const myEnrollments = enrollRes.data as any[];
        const found = myEnrollments.find((e) => e.courseId === c.id);
        if (found) {
          setIsEnrolled(true);
          setProgress(found.progress);
        }
      }
    } catch (err) {
      console.error('Failed to load course details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [slug, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please sign in to enroll in courses');
      navigate('/login');
      return;
    }

    if (!course) return;

    setEnrolling(true);
    try {
      await coursesApi.enroll(course.id);
      toast.success('Successfully enrolled in course!');
      setIsEnrolled(true);
      loadCourse(); // reload details to show correct progress state
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-icc-500/30 border-t-icc-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
        <Link to="/courses" className="text-icc-400 font-semibold inline-flex items-center gap-2 mt-2">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
      </div>
    );
  }

  return (
    <main id="main-content" className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      {/* Back button */}
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Details & Modules */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wider uppercase">
              <span className="px-2.5 py-1 rounded-full bg-icc-500/10 border border-icc-500/20 text-icc-400">
                {course.category?.name || 'General'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                {course.level?.name || 'All Levels'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                {course.language.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {course.title}
            </h1>
            <p className="text-white/70 text-base leading-relaxed whitespace-pre-wrap">
              {course.description}
            </p>
          </div>

          {/* Syllabus Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-2">Syllabus Curriculum</h2>
            {course.modules && course.modules.length === 0 ? (
              <p className="text-white/40 text-sm">No modules are currently added to this course.</p>
            ) : (
              <div className="space-y-4">
                {course.modules?.map((mod) => (
                  <div key={mod.id} className="rounded-xl border border-white/5 bg-dark-800/40 overflow-hidden">
                    <div className="px-5 py-4 bg-dark-900/50 border-b border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-icc-400 tracking-wide uppercase">Module {mod.order}</span>
                        <h3 className="text-base font-bold text-white mt-0.5">{mod.title}</h3>
                      </div>
                      <span className="text-xs text-white/40">{mod.lessons?.length || 0} lessons</span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {mod.lessons?.map((les, index) => (
                        <div key={les.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/2 transition-colors">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="text-xs text-white/30 font-semibold w-5 text-right">{index + 1}.</span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate max-w-sm sm:max-w-md">{les.title}</h4>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-white/30">
                                {les.duration && <span>{les.duration} mins</span>}
                                {les.duration && les.pdfUrl && <span>·</span>}
                                {les.pdfUrl && <span>PDF text</span>}
                              </div>
                            </div>
                          </div>

                          {isEnrolled ? (
                            <Link
                              to={`/lessons/${les.slug}`}
                              className="w-8 h-8 rounded-full bg-icc-500/10 border border-icc-500/20 flex items-center justify-center text-icc-400 hover:bg-icc-500 hover:text-white transition-all shadow-md"
                            >
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            </Link>
                          ) : (
                            <span className="text-[10px] text-white/35 font-semibold bg-white/5 px-2 py-1 rounded border border-white/10 uppercase">Locked</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Enrollment Card & Teacher Profile */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <div className="rounded-2xl border border-white/8 bg-dark-800/80 p-6 shadow-xl sticky top-24 backdrop-blur-md">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-xl mb-6 shadow-md" />
            ) : (
              <div className="w-full h-40 rounded-xl bg-gradient-to-br from-icc-500/15 to-emerald-950/20 border border-icc-500/20 flex items-center justify-center mb-6">
                <BookOpen className="w-12 h-12 text-icc-500/40" />
              </div>
            )}

            {isEnrolled ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                    <span className="font-semibold">Your Progress</span>
                    <span className="font-bold text-icc-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-icc-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {progress >= 100 ? (
                  <div className="flex items-center gap-2 text-xs text-icc-400 bg-icc-500/10 border border-icc-500/20 rounded-xl p-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>You completed this course! Your certificate is available in your dashboard.</span>
                  </div>
                ) : null}

                <Link
                  to="/dashboard"
                  className="btn-primary w-full py-3 text-center justify-center font-bold text-sm tracking-wide"
                >
                  Resume Learning
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2 text-sm text-white/60">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Lessons</span>
                    <span className="font-semibold text-white">{course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} lessons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Language</span>
                    <span className="font-semibold text-white uppercase">{course.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Level</span>
                    <span className="font-semibold text-white">{course.level?.name || 'Beginner'}</span>
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary w-full py-3 text-center justify-center font-bold text-sm tracking-wide shadow-lg shadow-icc-500/20 transition-all hover:scale-[1.01]"
                >
                  {enrolling ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Enroll in Course
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Teacher Profile Card */}
          {course.teacher && (
            <div className="rounded-2xl border border-white/5 bg-dark-800/40 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-icc-500/20 border border-icc-500/30 flex items-center justify-center text-icc-400 font-bold overflow-hidden shrink-0">
                {course.teacher.image ? (
                  <img src={course.teacher.image} alt={course.teacher.name} className="w-full h-full object-cover" />
                ) : (
                  course.teacher.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide">Instructor</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{course.teacher.name}</h4>
                <p className="text-white/50 text-xs mt-1 line-clamp-3 leading-relaxed">{course.teacher.bio}</p>
                <Link
                  to={`/teachers/${course.teacher.slug}`}
                  className="text-xs font-bold text-icc-400 hover:text-white mt-2.5 inline-flex items-center gap-1.5 transition-colors"
                >
                  View Profile
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
