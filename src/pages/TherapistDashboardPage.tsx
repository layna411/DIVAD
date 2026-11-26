import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { DataService } from '../services/firebase/dataService';
import { ReportService } from '../services/reports/ReportService';
import { ChildProfile, ActivitySession, ActivityType, ASSISTANCE_LEVELS, AssistanceLevel } from '../types';
import { ACTIVITIES_DATA } from '../data/activitiesData';
import {
  Users,
  Activity,
  Award,
  Download,
  FileText,
  Plus,
  Play,
  Calendar,
  Clock,
  Sparkles,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
  LogOut,
  FolderOpen,
  TrendingUp,
} from 'lucide-react';
import { soundEffects } from '../services/audio/SoundEffects';
import { TherapistAnalysisGraph } from '../components/analytics/TherapistAnalysisGraph';
import { CongratsCelebrationModal } from '../components/common/CongratsCelebrationModal';

export const TherapistDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { therapist, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const {
    childrenList,
    currentChild,
    selectChild,
    startSession,
  } = useSession();

  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'sessions' | 'analytics' | 'reports'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [allSessions, setAllSessions] = useState<ActivitySession[]>([]);
  const [showCelebrationPreview, setShowCelebrationPreview] = useState(false);

  // Form State for Child Profile CRUD
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState(6);
  const [formGender, setFormGender] = useState<'male' | 'female' | 'other'>('male');
  const [formAssistance, setFormAssistance] = useState<AssistanceLevel>(2);
  const [formLanguage, setFormLanguage] = useState<'en' | 'ta'>('en');
  const [formNotes, setFormNotes] = useState('');
  const [formColor, setFormColor] = useState('#EAB308');

  // Route protection: If not logged in, redirect to login page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/therapist/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Real-time sessions subscription (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    let unsubscribeSessions: (() => void) | undefined;
    try {
      unsubscribeSessions = DataService.subscribeSessions((sessions) => {
        setAllSessions(sessions);
      });
    } catch (e) {
      console.warn('[TherapistDashboard] Failed to subscribe to sessions:', e);
    }

    return () => {
      if (unsubscribeSessions) {
        try {
          unsubscribeSessions();
        } catch (e) {
          // Safe unmount
        }
      }
    };
  }, [isAuthenticated]);

  const handleOpenAddModal = () => {
    setEditingChild(null);
    setFormName('');
    setFormAge(6);
    setFormGender('male');
    setFormAssistance(2);
    setFormLanguage('en');
    setFormNotes('');
    setFormColor('#EAB308');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (child: ChildProfile) => {
    setEditingChild(child);
    setFormName(child.name);
    setFormAge(child.age);
    setFormGender(child.gender);
    setFormAssistance(child.baselineAssistanceLevel);
    setFormLanguage(child.preferredLanguage);
    setFormNotes(child.notes || '');
    setFormColor(child.favoriteColor || '#EAB308');
    setIsModalOpen(true);
  };

  const handleSaveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    await DataService.saveChild({
      id: editingChild?.id,
      name: formName.trim(),
      age: Number(formAge),
      gender: formGender,
      avatar: 'bear',
      therapistId: therapist?.uid || 'therapist',
      baselineAssistanceLevel: formAssistance,
      preferredLanguage: formLanguage,
      notes: formNotes,
      favoriteColor: formColor,
      active: true,
    });

    setIsModalOpen(false);
    soundEffects.playSuccessChime();
  };

  const handleDeleteChild = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this child profile from the database?')) {
      await DataService.deleteChild(id);
    }
  };

  const handleLaunchChildMode = (childId: string) => {
    selectChild(childId);
    soundEffects.playTap();
    navigate('/activities');
  };

  const handleExportPDF = (child: ChildProfile) => {
    const sessions = allSessions.filter((s) => s.childId === child.id);
    ReportService.exportChildReportPDF(child, sessions, therapist);
    soundEffects.playStarPop();
  };

  const handleExportCSV = () => {
    ReportService.exportSessionsToCSV(allSessions, childrenList);
    soundEffects.playStarPop();
  };

  const handleLogout = async () => {
    await logout();
    soundEffects.playTap();
    navigate('/therapist/login');
  };

  const filteredChildren = childrenList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-sm">
        Loading therapist session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Return to Welcome"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src="/logo-icon.png"
              alt="DIVAD Logo"
              className="w-10 h-10 object-contain rounded-xl border border-slate-200/80 shadow-sm p-0.5 bg-white cursor-pointer hover:scale-105 transition"
              onClick={() => navigate('/')}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl text-slate-900 tracking-tight">DIVAD</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Therapist Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {therapist?.displayName || therapist?.email} • {therapist?.organization || 'SIMATS Center'}
              </p>
            </div>
          </div>

          {/* Action buttons & Sign Out */}
          <div className="flex items-center space-x-2.5">
            {currentChild && (
              <button
                onClick={() => handleLaunchChildMode(currentChild.id)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Launch Child Mode ({currentChild.name.split(' ')[0]})</span>
              </button>
            )}

            <button
              onClick={() => setShowCelebrationPreview(true)}
              className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-sm"
              title="Preview Animated Boy & Girl Baby Celebration"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Celebration</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={allSessions.length === 0}
              className="hidden sm:flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition disabled:opacity-40"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold border border-slate-200 transition"
              title="Log out of therapist session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 flex space-x-6 text-sm font-semibold border-t border-slate-100">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Activity },
            { id: 'children', label: `Child Profiles (${childrenList.length})`, icon: Users },
            { id: 'sessions', label: `Sessions Log (${allSessions.length})`, icon: Calendar },
            { id: 'analytics', label: 'Progression & Analysis', icon: TrendingUp },
            { id: 'reports', label: 'Clinical Reports', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex items-center space-x-2 border-b-2 transition ${
                  isActive
                    ? 'border-sky-600 text-sky-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* --- TAB 1: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolled Children
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1">{childrenList.length}</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Live Clinical Sync
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Live Sessions
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1">{allSessions.length}</div>
                <div className="text-[11px] text-sky-600 font-semibold mt-1">Real-time dynamic logs</div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Stars Earned
                </div>
                <div className="text-3xl font-black text-amber-500 mt-1">
                  {allSessions.reduce((acc, s) => acc + s.totalStars, 0)} ⭐
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1">
                  Positive reinforcement
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Board Hardware
                </div>
                <div className="text-2xl font-black text-slate-800 mt-1">6 Sections</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  Physical BLE Active
                </div>
              </div>
            </div>

            {/* Interactive Clinical Analytics Callout Banner */}
            <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-teal-600 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Clinical Progression Analytics</span>
                </div>
                <h3 className="text-lg font-black tracking-tight">Interactive Developmental Analysis Graph</h3>
                <p className="text-xs text-sky-100 max-w-xl">
                  Analyze child success progression curves, monitor the fading of physical assistance prompts, and inspect fastener section mastery.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-900 font-black text-xs shadow-md transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2 whitespace-nowrap"
              >
                <span>Open Analysis Graph</span>
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Child Selector & Fastener Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Children Quick List (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-slate-900">Select Child Profile</h3>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center space-x-1 text-xs font-bold text-sky-600 hover:text-sky-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Child</span>
                  </button>
                </div>

                {childrenList.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                    <Users className="w-10 h-10 text-slate-400 mx-auto" />
                    <div>
                      <div className="font-bold text-sm text-slate-800">No Children Enrolled Yet</div>
                      <div className="text-xs text-slate-500">
                        Add your first child profile to begin dressing training.
                      </div>
                    </div>
                    <button
                      onClick={handleOpenAddModal}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      + Add Child Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {childrenList.map((c) => {
                      const isSelected = currentChild?.id === c.id;
                      const sessionCount = allSessions.filter((s) => s.childId === c.id).length;
                      return (
                        <div
                          key={c.id}
                          onClick={() => selectChild(c.id)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                              style={{ backgroundColor: c.favoriteColor || '#0284C7' }}
                            >
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900">{c.name}</div>
                              <div className="text-[11px] text-slate-500">
                                Age: {c.age} • Level {c.baselineAssistanceLevel} (
                                {ASSISTANCE_LEVELS[c.baselineAssistanceLevel]?.label || 'Independent'})
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-700">{sessionCount} sessions</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchChildMode(c.id);
                              }}
                              className="mt-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[10px] transition"
                            >
                              Start
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Physical Board Fastener Breakdown (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-black text-base text-slate-900">
                  DIVAD Physical Board Fasteners
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted occupational therapy skills aligned with board hardware sections
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ACTIVITIES_DATA.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl border border-slate-200 flex items-center space-x-3"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 text-xs shadow-sm flex-shrink-0"
                        style={{ backgroundColor: act.hexColor }}
                      >
                        {act.sectionNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-800 truncate">{act.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{act.hardwareSection}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          {act.steps.length} sequential steps
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: CHILDREN PROFILE MANAGEMENT --- */}
        {activeTab === 'children' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search child name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <button
                onClick={handleOpenAddModal}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Child</span>
              </button>
            </div>

            {filteredChildren.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-black text-base text-slate-800">No Child Profiles Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No children matching "${searchQuery}".`
                    : 'Get started by creating your first child profile. It will be stored securely in the clinical system.'}
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow transition"
                >
                  + Add Child Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChildren.map((c) => {
                  const childSessions = allSessions.filter((s) => s.childId === c.id);
                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-sm"
                              style={{ backgroundColor: c.favoriteColor || '#0284C7' }}
                            >
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-black text-base text-slate-900">{c.name}</h4>
                              <p className="text-xs text-slate-500">
                                {c.age} years old • {c.gender}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChild(c.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Assistance Baseline:</span>
                            <span className="font-bold text-slate-800">
                              Level {c.baselineAssistanceLevel} ({ASSISTANCE_LEVELS[c.baselineAssistanceLevel]?.label || 'Independent'})
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Preferred Language:</span>
                            <span className="font-bold text-slate-800">
                              {c.preferredLanguage === 'ta' ? 'தமிழ் (Tamil)' : 'English'}
                            </span>
                          </div>

                          {c.notes && (
                            <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] leading-relaxed">
                              {c.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => handleLaunchChildMode(c.id)}
                          className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Launch Session</span>
                        </button>

                        <button
                          onClick={() => handleExportPDF(c)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Download PDF Report"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: SESSIONS LOG --- */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900">Training Session Logs (Live Sync)</h3>
              <button
                onClick={handleExportCSV}
                disabled={allSessions.length === 0}
                className="flex items-center space-x-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {allSessions.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-black text-base text-slate-800">No Training Sessions Recorded Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When a session is conducted in Child Mode, attempts and outcomes will automatically stream here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Child</th>
                      <th className="px-6 py-3">Activities</th>
                      <th className="px-6 py-3">Attempts</th>
                      <th className="px-6 py-3">Stars</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {allSessions.map((s) => {
                      const child = childrenList.find((c) => c.id === s.childId);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-3.5 text-slate-600">
                            {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-900">
                            {child?.name || s.childId}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {s.selectedActivities.map((a) => (
                                <span
                                  key={a}
                                  className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-slate-700">
                            {s.attempts.filter((a) => a.isCorrect).length} / {s.attempts.length}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-amber-500">
                            {s.totalStars} ⭐
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                s.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: CLINICAL PROGRESSION & ANALYSIS GRAPH --- */}
        {activeTab === 'analytics' && (
          <TherapistAnalysisGraph
            sessions={allSessions}
            children={childrenList}
            selectedChildId={currentChild?.id}
            onSelectChild={(childId) => selectChild(childId)}
          />
        )}

        {/* --- TAB 5: CLINICAL REPORTS --- */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  Pediatric Occupational Therapy Reports
                </h3>
                <p className="text-xs text-slate-500 max-w-xl mt-1">
                  Export standardized progress reports including assistance level breakdown, correct vs
                  incorrect attempts, sensor verification history, and clinical documentation notes.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportCSV}
                  disabled={allSessions.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow transition flex items-center space-x-2 disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>Export All CSV</span>
                </button>
              </div>
            </div>

            {childrenList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">No Child Records Found</h4>
                <p className="text-xs text-slate-500">Add child profiles to generate and download clinical PDF reports.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {childrenList.map((c) => {
                  const childSessions = allSessions.filter((s) => s.childId === c.id);
                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-sm"
                          style={{ backgroundColor: c.favoriteColor || '#0284C7' }}
                        >
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-base text-slate-900">{c.name}</h4>
                          <p className="text-xs text-slate-500">
                            {childSessions.length} sessions logged • Baseline Lvl {c.baselineAssistanceLevel}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleExportPDF(c)}
                        className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition border border-sky-200 flex items-center space-x-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add / Edit Child Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900">
                {editingChild ? 'Edit Child Profile' : 'Add New Child Profile'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChild} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Aarav Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    min="3"
                    max="16"
                    required
                    value={formAge}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Baseline Assistance</label>
                  <select
                    value={formAssistance}
                    onChange={(e) => setFormAssistance(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value={1}>Level 1: Independent</option>
                    <option value={2}>Level 2: Verbal Cue</option>
                    <option value={3}>Level 3: Visual Cue</option>
                    <option value={4}>Level 4: Physical Assistance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Preferred Language</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="en">English</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Favorite Color Accent</label>
                <div className="flex items-center space-x-3">
                  {['#EAB308', '#8D6E63', '#0284C7', '#DB2777', '#16A34A', '#DC2626'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setFormColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        formColor === col ? 'border-slate-900 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Clinical Notes & Goals</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Practicing bilateral hand coordination on buttons"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition shadow"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Animated Boy & Girl Baby Celebration Preview Modal */}
      <CongratsCelebrationModal
        isOpen={showCelebrationPreview}
        onClose={() => setShowCelebrationPreview(false)}
        activityTitle="Zipper Dressing Mastery"
        activityTitleTamil="ஜிப் ஆடை பயிற்சி"
        starsEarned={3}
        language="en"
        childName={currentChild?.name || 'Aarav'}
      />
    </div>
  );
};
