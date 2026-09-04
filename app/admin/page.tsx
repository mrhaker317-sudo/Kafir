'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RotateCw,
  Copy,
  Check,
  GraduationCap,
  X,
  FileText
} from "lucide-react";
import { StudentResult, SubjectGrade } from "@/lib/types";

const BOARD_OPTIONS = [
  { value: "barisal", label: "Barisal" },
  { value: "chittagong", label: "Chittagong" },
  { value: "comilla", label: "Comilla" },
  { value: "dhaka", label: "Dhaka" },
  { value: "dinajpur", label: "Dinajpur" },
  { value: "jessore", label: "Jessore" },
  { value: "mymensingh", label: "Mymensingh" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "sylhet", label: "Sylhet" },
  { value: "madrasah", label: "Madrasah" },
  { value: "tec", label: "Technical" },
  { value: "dibs", label: "DIBS(Dhaka)" },
];

const EXAM_OPTIONS = [
  { value: "ssc", label: "SSC/Dakhil/Equivalent" },
  { value: "jsc", label: "JSC/JDC" },
  { value: "ssc_voc", label: "SSC(Vocational)" },
  { value: "hsc", label: "HSC/Alim/Equivalent" },
  { value: "hsc_voc", label: "HSC(Vocational)" },
  { value: "hsc_bm", label: "HSC(BM)" },
  { value: "dc", label: "Diploma in Commerce" },
  { value: "dbs", label: "Diploma in Business Studies" },
];

const SCIENCE_PRESET: SubjectGrade[] = [
  { code: "101", name: "BANGLA", grade: "A+" },
  { code: "107", name: "ENGLISH", grade: "A+" },
  { code: "109", name: "MATHEMATICS", grade: "A+" },
  { code: "136", name: "PHYSICS", grade: "A+" },
  { code: "137", name: "CHEMISTRY", grade: "A+" },
  { code: "138", name: "BIOLOGY", grade: "A+" },
  { code: "126", name: "HIGHER MATHEMATICS", grade: "A+" },
];

const COMMERCE_PRESET: SubjectGrade[] = [
  { code: "101", name: "BANGLA", grade: "A+" },
  { code: "107", name: "ENGLISH", grade: "A+" },
  { code: "109", name: "MATHEMATICS", grade: "A+" },
  { code: "146", name: "ACCOUNTING", grade: "A+" },
  { code: "152", name: "FINANCE & BANKING", grade: "A+" },
  { code: "153", name: "BUSINESS ENTREPRENEURSHIP", grade: "A+" },
  { code: "150", name: "GENERAL SCIENCE", grade: "A+" },
];

const HUMANITIES_PRESET: SubjectGrade[] = [
  { code: "101", name: "BANGLA", grade: "A+" },
  { code: "107", name: "ENGLISH", grade: "A+" },
  { code: "109", name: "MATHEMATICS", grade: "A+" },
  { code: "150", name: "GENERAL SCIENCE", grade: "A+" },
  { code: "110", name: "GEOGRAPHY & ENVIRONMENT", grade: "A+" },
  { code: "140", name: "CIVICS & CITIZENSHIP", grade: "A+" },
  { code: "153", name: "ECONOMICS", grade: "A+" },
];

const SUPABASE_SCHEMA_SQL = `-- Run this in your Supabase SQL Editor to create the results table:
create table if not exists student_results (
  id uuid default gen_random_uuid() primary key,
  exam text not null,
  year text not null,
  board text not null,
  roll text not null,
  reg text,
  name text not null,
  father_name text,
  mother_name text,
  "group" text,
  type text,
  dob text,
  result text,
  gpa text,
  institute text,
  center text,
  subjects jsonb default '[]'::jsonb,
  raw_html text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(exam, year, board, roll)
);

-- Row Level Security policies
alter table student_results enable row level security;
create policy "Public read" on student_results for select using (true);
create policy "Public insert" on student_results for insert with check (true);
create policy "Public update" on student_results for update using (true);
create policy "Public delete" on student_results for delete using (true);`;

export default function AdminPage() {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBoard, setFilterBoard] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<StudentResult>>({
    exam: "ssc",
    year: "2024",
    board: "dhaka",
    roll: "",
    reg: "",
    name: "",
    father_name: "",
    mother_name: "",
    group: "SCIENCE",
    type: "REGULAR",
    dob: "01/01/2007",
    result: "PASSED",
    gpa: "5.00",
    institute: "",
    center: "",
    subjects: SCIENCE_PRESET,
  });

  const fetchResults = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/admin/results");
      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setConfigured(data.configured);
      }
    } catch (e) {
      console.error("Failed to load results", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/results");
        const data = await res.json();
        if (!ignore && data.success) {
          setResults(data.results || []);
          setConfigured(data.configured);
        }
      } catch (e) {
        console.error("Failed to load results", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      exam: "ssc",
      year: "2024",
      board: "dhaka",
      roll: "",
      reg: "",
      name: "",
      father_name: "",
      mother_name: "",
      group: "SCIENCE",
      type: "REGULAR",
      dob: "01/01/2007",
      result: "PASSED",
      gpa: "5.00",
      institute: "",
      center: "",
      subjects: SCIENCE_PRESET,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: StudentResult) => {
    setFormData({
      ...student,
      subjects: student.subjects && student.subjects.length > 0 ? student.subjects : SCIENCE_PRESET,
    });
    setIsModalOpen(true);
  };

  const handleOpenPreview = (student: StudentResult) => {
    if (student.raw_html) {
      setPreviewHtml(student.raw_html);
      setIsPreviewOpen(true);
    }
  };

  const handleDelete = async (id: string, roll: string) => {
    if (!confirm(`Are you sure you want to delete result for Roll: ${roll}?`)) {
      return;
    }
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/results?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setResults((prev) => prev.filter((r) => r.id !== id && r.roll !== id));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Error deleting record");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roll?.trim() || !formData.name?.trim()) {
      alert("Please enter Roll number and Student Name");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchResults();
      } else {
        alert(data.error || "Failed to save record");
      }
    } catch {
      alert("Failed to connect to server");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubjectRow = () => {
    setFormData((prev) => ({
      ...prev,
      subjects: [...(prev.subjects || []), { code: "", name: "", grade: "A+" }],
    }));
  };

  const handleSubjectChange = (idx: number, field: keyof SubjectGrade, val: string) => {
    setFormData((prev) => {
      const updated = [...(prev.subjects || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, subjects: updated };
    });
  };

  const handleRemoveSubjectRow = (idx: number) => {
    setFormData((prev) => {
      const updated = [...(prev.subjects || [])];
      updated.splice(idx, 1);
      return { ...prev, subjects: updated };
    });
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Filter results
  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.reg && r.reg.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.institute && r.institute.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBoard = filterBoard === "all" || r.board.toLowerCase() === filterBoard.toLowerCase();

    return matchesSearch && matchesBoard;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Header */}
      <header className="bg-[#007814] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 hover:bg-white/10 rounded-md transition text-white/90 hover:text-white inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase"
              title="Go to Search Portal"
            >
              <ArrowLeft className="w-4 h-4" />
              Search Portal
            </Link>
            <div className="h-5 w-[1px] bg-white/30 hidden sm:block" />
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-yellow-300" />
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                Education Board Results — Admin Control Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              id="btnAddStudent"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs font-bold rounded shadow transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Student Result
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status & SQL Schema Banner */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Database Status
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-bold text-gray-900">
                  {configured ? "Supabase Connected" : "Local Sync / In-Memory"}
                </span>
              </div>
              <button
                onClick={() => setShowConfigGuide(!showConfigGuide)}
                className="mt-1.5 text-[11px] font-semibold text-[#007814] hover:underline cursor-pointer block"
              >
                {showConfigGuide ? "Hide File Config" : "Render / File Config Guide"}
              </button>
            </div>
            <div>
              {configured ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live Cloud
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Fallback Ready
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Saved Results
              </p>
              <p className="text-2xl font-black text-[#007814] mt-1">{results.length}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-300" />
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Database Schema
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {configured
                  ? "Schema configured"
                  : "Copy SQL code to setup table in Supabase"}
              </p>
            </div>
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="text-xs font-semibold text-[#007814] hover:underline cursor-pointer"
            >
              {showSqlGuide ? "Hide SQL" : "View SQL"}
            </button>
          </div>
        </div>

        {/* File Config Guide Panel */}
        {showConfigGuide && (
          <div className="mb-6 bg-emerald-950 text-emerald-100 p-4 rounded-lg shadow border border-emerald-800">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-800 mb-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                Render এ কোনো Environment Variable ছাড়া সরাসরি ফাইলে কী (Keys) বসানোর নিয়ম
              </span>
              <button
                onClick={() => setShowConfigGuide(false)}
                className="text-xs text-emerald-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="text-xs text-emerald-200 space-y-2">
              <p>
                Render-এ বারবার environment variable অ্যাড না করে সরাসরি নিচের যেকোনো একটি ফাইলে আপনার Supabase URL ও Key পেস্ট করে দিতে পারেন:
              </p>
              <div className="bg-black/40 p-2.5 rounded font-mono text-[11px] text-emerald-300">
                <p className="font-bold text-white mb-1">Option 1 (সর্বাধিক নির্ভরযোগ্য): <span className="text-yellow-300">lib/config.ts</span> ফাইলে সরাসরি বসান:</p>
                <pre>{`export const APP_CONFIG = {
  SUPABASE_URL: "https://your-project.supabase.co",
  SUPABASE_ANON_KEY: "your-anon-key-here",
};`}</pre>
              </div>
              <div className="bg-black/40 p-2.5 rounded font-mono text-[11px] text-emerald-300">
                <p className="font-bold text-white mb-1">Option 2: প্রজেক্টের রুট ডিরেক্টরির <span className="text-yellow-300">.env</span> ফাইলে বসান:</p>
                <pre>{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}</pre>
              </div>
              <p className="text-[11px] text-emerald-300">
                আমরা <code className="bg-black/30 px-1 py-0.5 rounded">.gitignore</code> ফাইলে <code className="bg-black/30 px-1 py-0.5 rounded">.env</code> ফাইলটিকে অনুমোদন দিয়েছি, ফলে GitHub বা Render ডিপ্লয়মেন্টে এই ফাইলটি স্বয়ংক্রিয়ভাবে আপলোড হবে এবং কাজ করবে।
              </p>
            </div>
          </div>
        )}

        {/* Supabase Schema Code Panel */}
        {showSqlGuide && (
          <div className="mb-6 bg-slate-900 text-slate-100 p-4 rounded-lg shadow relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
              <span className="text-xs font-mono font-bold text-slate-300">
                Supabase SQL Editor Snippet (Table: student_results)
              </span>
              <button
                onClick={copySql}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy SQL
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono overflow-x-auto text-emerald-400 p-2 bg-slate-950 rounded">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Roll, Name, Reg, or Institute..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#007814]"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterBoard}
              onChange={(e) => setFilterBoard(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#007814]"
            >
              <option value="all">All Boards</option>
              {BOARD_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchResults(true)}
              title="Refresh Data"
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-600 transition cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-100/80 border-b border-gray-200 text-gray-700 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-3 px-4">Exam & Year</th>
                  <th className="py-3 px-4">Board</th>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">GPA / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#007814]" />
                      Loading student records...
                    </td>
                  </tr>
                )}

                {!loading && filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No student results found. Click{" "}
                      <button
                        onClick={handleOpenAdd}
                        className="text-[#007814] font-bold hover:underline"
                      >
                        Add Student Result
                      </button>{" "}
                      to create one or search on the main portal to auto-save!
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredResults.map((r) => (
                    <tr key={r.id || r.roll} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-bold text-gray-900 uppercase">
                        {r.exam} {r.year}
                      </td>
                      <td className="py-3 px-4 capitalize text-gray-800">{r.board}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#007814]">{r.roll}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">{r.reg || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 block">{r.name}</span>
                        {r.institute && (
                          <span className="text-[11px] text-gray-500 block truncate max-w-[200px]">
                            {r.institute}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            r.result?.toUpperCase() === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {r.gpa ? `GPA: ${r.gpa}` : r.result}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenPreview(r)}
                            title="Preview Official Marksheet"
                            className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r)}
                            title="Edit Result"
                            className="p-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id || r.roll, r.roll)}
                            title="Delete Result"
                            disabled={isDeleting === (r.id || r.roll)}
                            className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#007814] text-white px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-yellow-300" />
                {formData.id ? "Edit Student Result" : "Add New Student Result"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto p-5 space-y-4 flex-1">
              {/* Row 1: Exam, Year, Board */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Examination
                  </label>
                  <select
                    value={formData.exam}
                    onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  >
                    {EXAM_OPTIONS.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  >
                    {Array.from({ length: 2026 - 1996 + 1 }, (_, i) => 2026 - i).map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Board</label>
                  <select
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  >
                    {BOARD_OPTIONS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Roll & Reg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123456"
                    value={formData.roll}
                    onChange={(e) => setFormData({ ...formData, roll: e.target.value.replace(/\D/g, "") })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234567890"
                    value={formData.reg}
                    onChange={(e) => setFormData({ ...formData, reg: e.target.value.replace(/\D/g, "") })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  />
                </div>
              </div>

              {/* Row 3: Student Name, Father & Mother */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MD. AL-AMIN"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Father&apos;s Name</label>
                  <input
                    type="text"
                    placeholder="MD. ABDUL MOTIN"
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Mother&apos;s Name</label>
                  <input
                    type="text"
                    placeholder="NASIMA BEGUM"
                    value={formData.mother_name}
                    onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  />
                </div>
              </div>

              {/* Row 4: Group, Type, DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Group</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  >
                    <option value="SCIENCE">SCIENCE</option>
                    <option value="HUMANITIES">HUMANITIES</option>
                    <option value="BUSINESS STUDIES">BUSINESS STUDIES</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  >
                    <option value="REGULAR">REGULAR</option>
                    <option value="IRREGULAR">IRREGULAR</option>
                    <option value="IMPROVEMENT">IMPROVEMENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="text"
                    placeholder="12/04/2007"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  />
                </div>
              </div>

              {/* Row 5: Institute & Center */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Institute Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NOTRE DAME COLLEGE"
                    value={formData.institute}
                    onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Center</label>
                  <input
                    type="text"
                    placeholder="e.g. DHAKA-20"
                    value={formData.center}
                    onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814]"
                  />
                </div>
              </div>

              {/* Row 6: Result Status & GPA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Result Status
                  </label>
                  <select
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814] font-bold"
                  >
                    <option value="PASSED">PASSED</option>
                    <option value="FAILED">FAILED</option>
                    <option value="WITHHELD">WITHHELD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    GPA (Grade Point Average)
                  </label>
                  <input
                    type="text"
                    placeholder="5.00"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#007814] font-bold text-[#007814]"
                  />
                </div>
              </div>

              {/* Subject Wise Grades Section */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Subject-Wise Grade Sheet
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-500">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, subjects: SCIENCE_PRESET })}
                      className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition"
                    >
                      Science
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, subjects: COMMERCE_PRESET })}
                      className="px-2 py-0.5 bg-green-50 hover:bg-green-100 text-green-700 rounded text-[11px] font-semibold transition"
                    >
                      Commerce
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, subjects: HUMANITIES_PRESET })}
                      className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[11px] font-semibold transition"
                    >
                      Humanities
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50/50">
                  {(formData.subjects || []).map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Code"
                        value={sub.code}
                        onChange={(e) => handleSubjectChange(idx, "code", e.target.value)}
                        className="w-16 p-1.5 text-xs border border-gray-300 rounded text-center"
                      />
                      <input
                        type="text"
                        placeholder="Subject Name"
                        value={sub.name}
                        onChange={(e) => handleSubjectChange(idx, "name", e.target.value)}
                        className="flex-1 p-1.5 text-xs border border-gray-300 rounded"
                      />
                      <select
                        value={sub.grade}
                        onChange={(e) => handleSubjectChange(idx, "grade", e.target.value)}
                        className="w-20 p-1.5 text-xs border border-gray-300 rounded font-bold"
                      >
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectRow(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Subject"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddSubjectRow}
                  className="mt-2 text-xs font-semibold text-[#007814] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Subject
                </button>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#007814] hover:bg-[#006010] text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Result to Database"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Marksheet Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#007814] text-white px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-300" />
                Live Result Marksheet Preview
              </h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-white flex-1">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
            <div className="bg-gray-100 px-5 py-3 text-right">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold rounded transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
