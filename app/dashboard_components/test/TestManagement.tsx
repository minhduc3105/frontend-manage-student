"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter } from "lucide-react";
import { useTest } from "../../../src/hooks/useTest";
import { useAuth } from "../../../src/contexts/AuthContext";
import { ConfirmModal } from "../../../components/common/ConfirmModal";
import { useConfirmDialog } from "../../../src/hooks/useConfirmDialog";
import CreateTestForm from "./CreateTestForm";
import { Input } from "../../../components/ui/input";
import { TestDetailPanel } from "./test-detail-panel";

export default function TestManagement() {
  const { user } = useAuth();
  const { tests, loading, fetchTests, removeTest } = useTest();
  const { isOpen, message, onConfirm, openConfirm, closeConfirm } = useConfirmDialog();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters state
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    test_name: "",
    student_name: "",
    class_name: "",
    test_type: "",
    min_score: "",
    max_score: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    if (user) fetchTests();
  }, [user, fetchTests]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((s) => ({ ...s, [key]: value }));
  };

  // Combined filtered results (search + filter)
  const filteredTests = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tests.filter((t) => {
      // search by test name (as before)
      if (q && !(t.test_name ?? "").toLowerCase().includes(q)) return false;

      // filters:
      if (filters.test_name && !(t.test_name ?? "").toLowerCase().includes(filters.test_name.toLowerCase())) return false;
      if (filters.student_name && !((t.student_name ?? "").toLowerCase().includes(filters.student_name.toLowerCase()))) return false;
      if (filters.class_name && !((t.class_name ?? "").toLowerCase().includes(filters.class_name.toLowerCase()))) return false;
      if (filters.test_type && !((t.test_type ?? "").toLowerCase().includes(filters.test_type.toLowerCase()))) return false;

      // score range
      const s = Number(t.score ?? 0);
      if (filters.min_score && !isNaN(Number(filters.min_score)) && s < Number(filters.min_score)) return false;
      if (filters.max_score && !isNaN(Number(filters.max_score)) && s > Number(filters.max_score)) return false;

      // date range (YYYY-MM-DD)
      if (filters.date_from) {
        const df = new Date(filters.date_from);
        const te = new Date(t.exam_date);
        if (te < df) return false;
      }
      if (filters.date_to) {
        const dt = new Date(filters.date_to);
        const te = new Date(t.exam_date);
        if (te > dt) return false;
      }

      return true;
    });
  }, [tests, searchTerm, filters]);

  const handleDelete = useCallback(async () => {
    if (!selectedTest) return;
    try {
      await removeTest(selectedTest.test_id);
      await fetchTests();
    } catch (err) {
      console.error(err);
    } finally {
      closeConfirm();
      setSelectedTest(null);
    }
  }, [selectedTest, removeTest, fetchTests, closeConfirm]);

  // Open create modal
  const handleOpenCreate = () => {
    setSelectedTest(null);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedTest(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative p-6 bg-background rounded-lg shadow-md min-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Test Management</h2>
      </div>

      {/* Search + Buttons */}
      <div className="relative w-full mb-6 flex items-start gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tests by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Buttons: Filter + Create */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilter((s) => !s)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 cursor-pointer"
              title="Filter tests"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filter</span>
            </button>

            {/* Filter panel */}
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, translateY: -6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -6 }}
                  className="absolute right-0 mt-2 w-[360px] z-40 bg-background border border-gray-200 rounded-lg shadow-lg p-4"
                >
                  <div className="space-y-3 text-foreground">
                    {/* Test name */}
                    <div>
                      <label className="text-xs text-muted-foreground">Test name</label>
                      <Input
                        value={filters.test_name}
                        onChange={(e) => handleFilterChange("test_name", e.target.value)}
                        className="w-full border px-2 py-1 rounded-md text-foreground"
                      />
                    </div>

                    {/* Student Name */}
                    <div>
                      <label className="text-xs text-muted-foreground">Student name</label>
                      <select
                        aria-label="Select student"
                        value={filters.student_name}
                        onChange={(e) => handleFilterChange("student_name", e.target.value)}
                        className="w-full border px-2 py-1 rounded-md text-foreground bg-background"
                      >
                        <option value="">All</option>
                        {[...new Set(tests.map((t) => t.student_name ?? t.student_user_id))].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Class Name */}
                    <div>
                      <label className="text-xs text-muted-foreground">Class name</label>
                      <select
                        aria-label="Select class"
                        value={filters.class_name}
                        onChange={(e) => handleFilterChange("class_name", e.target.value)}
                        className="w-full border px-2 py-1 rounded-md text-foreground bg-background"
                      >
                        <option value="">All</option>
                        {[...new Set(tests.map((t) => t.class_name))].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Test Type */}
                    <div>
                      <label className="text-xs text-muted-foreground">Test type</label>
                      <select
                        aria-label="Select test type"
                        value={filters.test_type}
                        onChange={(e) => handleFilterChange("test_type", e.target.value)}
                        className="w-full border px-2 py-1 rounded-md text-foreground bg-background"
                      >
                        <option value="">All</option>
                        {[...new Set(tests.map((t) => t.test_type))].map((tt) => (
                          <option key={tt} value={tt}>{tt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Score range */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Min score</label>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          value={filters.min_score}
                          onChange={(e) => handleFilterChange("min_score", e.target.value)}
                          className="w-full border px-2 py-1 rounded-md text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Max score</label>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          value={filters.max_score}
                          onChange={(e) => handleFilterChange("max_score", e.target.value)}
                          className="w-full border px-2 py-1 rounded-md text-foreground"
                        />
                      </div>
                    </div>

                    {/* Date range */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Date from</label>
                        <Input
                          type="date"
                          value={filters.date_from}
                          onChange={(e) => handleFilterChange("date_from", e.target.value)}
                          className="w-full border px-2 py-1 rounded-md text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Date to</label>
                        <Input
                          type="date"
                          value={filters.date_to}
                          onChange={(e) => handleFilterChange("date_to", e.target.value)}
                          className="w-full border px-2 py-1 rounded-md text-foreground"
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-4 pt-3">
                    <button
                      onClick={() => {
                        setFilters({
                          test_name: "",
                          student_name: "",
                          class_name: "",
                          test_type: "",
                          min_score: "",
                          max_score: "",
                          date_from: "",
                          date_to: "",
                        });
                        setShowFilter(false); // 🔹 đóng modal sau khi clear
                      }}
                      className="px-4 py-1.5 rounded-md border text-sm text-foreground hover:bg-gray-100 cursor-pointer"
                    >
                      Clear
                    </button>
                      <button
                        onClick={() => setShowFilter(false)}
                        className="px-4 py-1.5 rounded-md bg-cyan-500 text-white text-sm hover:bg-cyan-600 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user?.roles?.includes("teacher") && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-cyan-500 text-white hover:bg-cyan-600 cursor-pointer"
              title="Create test"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Create</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <p className="text-center text-muted-foreground">Loading tests...</p>
      ) : filteredTests.length === 0 ? (
        <p className="text-center text-muted-foreground">No tests found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((t, index) => (
              <motion.div
                  key={t.test_id}
                  whileHover={{ y: -5 }}
                  // 👇 Đã sửa dòng này: thêm "dark:border-white"
                  className="group relative flex flex-col gap-4 border border-black dark:border-white bg-background p-6 rounded-2xl transition-all duration-200 cursor-pointer animate-fadeIn hover:shadow-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                      setSelectedTest(t);
                      setShowInfo(true);
                  }}
              >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

              <h3 className="text-lg font-semibold text-foreground line-clamp-2 transition-transform duration-200 origin-left group-hover:scale-105">
                {t.test_name}
              </h3>

              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground font-medium">Student</span>
                  <span className="text-sm text-foreground font-medium group-hover:scale-105">
                    {t.student_name ?? t.student_user_id}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground font-medium">Score</span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border transition-all duration-200 ${
                      t.score >= 8
                        ? "bg-green-50 text-green-700 border-green-200"
                        : t.score >= 7
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    } group-hover:scale-105`}
                  >
                    {t.score}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gblack font-medium">Exam Date</span>
                  <span className="text-sm text-foreground font-medium group-hover:scale-105">
                    {formatDate(t.exam_date)}
                  </span>
                </div>
              </div>

              {(user?.roles?.includes("teacher") || user?.roles?.includes("manager")) && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTest(t);
                      setShowCreateModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 border border-black dark:border-white rounded-md px-2 py-1 text-sm hover:bg-yellow-400 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTest(t);
                      openConfirm(`Delete test "${t.test_name}"?`, async () => {
                          try {
                            await removeTest(t.test_id);
                            await fetchTests();
                          } catch (err) {
                            console.error(err);
                          } finally {
                            closeConfirm();
                            setSelectedTest(null);
                          }
                        });
                    }}
                              className="flex-1 flex items-center justify-center gap-2 border border-black dark:border-white  rounded-md px-2 py-1 text-sm hover:bg-red-400 hover:text-red-600 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Floating Add Button (giữ nguyên) */}
      {user?.roles?.includes("teacher") && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handleOpenCreate}
          className="fixed bottom-8 right-8 bg-cyan-500 text-white p-4 rounded-full shadow-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      {/* Test Detail Panel */}
      <TestDetailPanel
        test={selectedTest}
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        onEdit={(test) => {
          setSelectedTest(test);
          setShowCreateModal(true);
        }}
        onDelete={async () => {
          await handleDelete();
          setShowInfo(false);
        }}
      />

      {/* Create/Edit Test Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CreateTestForm
              onClose={handleCloseModal}
              initialData={selectedTest} // null nếu create
              onCreated={fetchTests}
              onUpdated={fetchTests}
              // khi edit: không cho chỉnh class và student (CreateTestForm cần đọc prop này)
              isEdit={Boolean(selectedTest)}
              disableStudentClassEdit={Boolean(selectedTest)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={isOpen}
        message={message}
        onConfirm={onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
