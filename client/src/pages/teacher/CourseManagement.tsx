import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, BookOpen, Layers, Settings, X, PlusCircle, Trash, Check, ArrowLeft, Play } from 'lucide-react';
import { courses as coursesApi, categories as categoriesApi, levels as levelsApi, admin as adminApi } from '../../lib/api';
import { Course, Category, Level, Module } from '../../types';
import toast from 'react-hot-toast';

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Form Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    id: 0,
    title: '',
    slug: '',
    thumbnail: '',
    description: '',
    categoryId: '',
    levelId: '',
    language: 'en',
    duration: '',
    status: 'DRAFT',
  });

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, catRes, lvlRes] = await Promise.all([
        coursesApi.getAll({ status: 'All' }), // fetch all regardless of status
        categoriesApi.getAll(),
        levelsApi.getAll(),
      ]);
      setCourses(cRes.data as Course[]);
      setCategories(catRes.data.categories || catRes.data);
      setLevels(lvlRes.data.levels || lvlRes.data);
    } catch (err) {
      console.error('Failed to load courses data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...courseForm,
        categoryId: courseForm.categoryId ? Number(courseForm.categoryId) : undefined,
        levelId: courseForm.levelId ? Number(courseForm.levelId) : undefined,
        duration: courseForm.duration ? Number(courseForm.duration) : undefined,
      };

      if (courseForm.id > 0) {
        await coursesApi.update(courseForm.id, data);
        toast.success('Course updated successfully!');
      } else {
        await coursesApi.create(data);
        toast.success('Course created successfully!');
      }
      setShowCourseModal(false);
      loadData();
      // Reset form
      setCourseForm({
        id: 0,
        title: '',
        slug: '',
        thumbnail: '',
        description: '',
        categoryId: '',
        levelId: '',
        language: 'en',
        duration: '',
        status: 'DRAFT',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save course');
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await coursesApi.createModule(selectedCourse.id, moduleForm);
      toast.success('Module created successfully!');
      setShowModuleModal(false);
      setModuleForm({ title: '', description: '', order: 1 });
      
      // Reload detail view
      const detailRes = await coursesApi.getBySlug(selectedCourse.slug);
      setSelectedCourse(detailRes.data as Course);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create module');
    }
  };

  const selectForEdit = (c: Course) => {
    setCourseForm({
      id: c.id,
      title: c.title,
      slug: c.slug,
      thumbnail: c.thumbnail || '',
      description: c.description || '',
      categoryId: c.categoryId?.toString() || '',
      levelId: c.levelId?.toString() || '',
      language: c.language,
      duration: c.duration?.toString() || '',
      status: c.status,
    });
    setShowCourseModal(true);
  };

  const viewCourseCurriculum = async (c: Course) => {
    try {
      const res = await coursesApi.getBySlug(c.slug);
      setSelectedCourse(res.data as Course);
    } catch {
      toast.error('Failed to load course details');
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-icc-500/30 border-t-icc-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedCourse ? (
        // Curriculum editor panel
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModuleModal(true)}
                className="btn-primary inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add Module
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h1>
            <p className="text-white/40 text-sm">{selectedCourse.description}</p>
          </div>

          {/* Module lists */}
          <div className="space-y-4">
            {selectedCourse.modules && selectedCourse.modules.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-white/2 border border-white/5">
                <Layers className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white/60 mb-1">No modules added</h3>
                <p className="text-xs text-white/30 mb-4">Break down this course into modules to organize lessons.</p>
                <button
                  onClick={() => setShowModuleModal(true)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Create First Module
                </button>
              </div>
            ) : (
              selectedCourse.modules?.map((mod) => (
                <div key={mod.id} className="rounded-xl border border-white/5 bg-dark-800/40 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-icc-400 tracking-wider uppercase">Module {mod.order}</span>
                      <h3 className="text-base font-bold text-white mt-0.5">{mod.title}</h3>
                    </div>
                  </div>

                  {/* Lessons inside Module */}
                  <div className="space-y-2">
                    {mod.lessons && mod.lessons.length === 0 ? (
                      <p className="text-xs text-white/30 py-2">No lessons assigned. Edit lessons in the Lessons page to assign them here.</p>
                    ) : (
                      mod.lessons?.map((les) => (
                        <div key={les.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-dark-900/50 border border-white/2 hover:border-white/5 transition-all text-xs">
                          <span className="font-semibold text-white/80">{les.title}</span>
                          <span className="text-white/40">{les.duration || 0} mins</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Course manager view list
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Courses</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and organize structured syllabus curricula</p>
            </div>
            <button
              onClick={() => {
                setCourseForm({
                  id: 0,
                  title: '',
                  slug: '',
                  thumbnail: '',
                  description: '',
                  categoryId: '',
                  levelId: '',
                  language: 'en',
                  duration: '',
                  status: 'DRAFT',
                });
                setShowCourseModal(true);
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">No courses created</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create your first course structure to assign syllabus materials.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-dark-800 p-5 flex flex-col justify-between h-56 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                        c.status === 'PUBLISHED'
                          ? 'text-icc-500 bg-icc-50 border-icc-200'
                          : 'text-yellow-500 bg-yellow-50 border-yellow-200'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-xs text-gray-400 uppercase font-medium">{c.language}</span>
                    </div>

                    <h3 className="text-base font-bold truncate" title={c.title}>{c.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <button
                      onClick={() => viewCourseCurriculum(c)}
                      className="text-xs font-bold text-icc-500 hover:text-icc-400 inline-flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Curriculum ({c.modules?.length || 0})
                    </button>
                    <button
                      onClick={() => selectForEdit(c)}
                      className="text-xs font-bold text-gray-400 hover:text-white inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Course Modal */}
      <AnimatePresence>
        {showCourseModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-4 mb-4">
                <h3 className="font-bold text-lg">{courseForm.id > 0 ? 'Edit Course Details' : 'Create Course'}</h3>
                <button onClick={() => setShowCourseModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4 text-sm">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Course Title</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                    placeholder="e.g. Fundamental of Sunni Creed"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Course Slug</label>
                  <input
                    type="text"
                    value={courseForm.slug}
                    onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                    required
                    placeholder="e.g. aqeedah-foundations"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Thumbnail URL</label>
                  <input
                    type="text"
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    placeholder="e.g. /uploads/images/thumbnail.jpg"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    rows={4}
                    placeholder="Provide a overview of what students will learn..."
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Category</label>
                    <select
                      value={courseForm.categoryId}
                      onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })}
                      required
                      className="input-field"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Level</label>
                    <select
                      value={courseForm.levelId}
                      onChange={(e) => setCourseForm({ ...courseForm, levelId: e.target.value })}
                      required
                      className="input-field"
                    >
                      <option value="">Select Level</option>
                      {levels.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Language</label>
                    <select
                      value={courseForm.language}
                      onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })}
                      required
                      className="input-field"
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                      <option value="am">Amharic</option>
                      <option value="om">Oromiffa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Status</label>
                    <select
                      value={courseForm.status}
                      onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                      required
                      className="input-field"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <button type="button" onClick={() => setShowCourseModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save Course</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Module Modal */}
      <AnimatePresence>
        {showModuleModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-4 mb-4">
                <h3 className="font-bold text-lg">Add Module</h3>
                <button onClick={() => setShowModuleModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateModule} className="space-y-4 text-sm">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Module Title</label>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    required
                    placeholder="e.g. Intro to Aqeedah"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Order</label>
                  <input
                    type="number"
                    value={moduleForm.order}
                    onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })}
                    required
                    min={1}
                    className="input-field"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <button type="button" onClick={() => setShowModuleModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Add Module</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
