"use client";

import { useState, useEffect } from "react";
import { usePayrolls } from "../../../src/hooks/usePayroll";
import { useSchedules } from "../../../src/contexts/ScheduleContext";
import { ActionModal } from "./action_modal";
import {
  Tuition,
  getTuitions,
  deleteTuition,
} from "../../../src/services/api/tuition";
import { Payroll, deletePayroll } from "../../../src/services/api/payroll";
import { Schedule, deleteSchedule } from "../../../src/services/api/schedule";

{
  /*test*/
}
import { Test, getTests, deleteTest } from "../../../src/services/api/test";

import { ShowInfoModal, ModalDataType } from "./ShowInfoModal";

export function ShowInfoFlow() {
  const { payrolls, fetchPayrolls } = usePayrolls();
  const { schedules, fetchSchedules } = useSchedules();

  const [tuitionRows, setTuitionRows] = useState<Tuition[]>([]);
  const [selectedRow, setSelectedRow] = useState<ModalDataType | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [testRows, setTestRows] = useState<Test[]>([]);
  const [selectedType, setSelectedType] = useState<
    "tuition" | "payroll" | "schedule" | "test"
  >("tuition");

  const fetchTuitionData = async () => {
    try {
      const data = await getTuitions();
      setTuitionRows(data);
    } catch (error) {
      console.error("Failed to fetch tuitions:", error);
    }
  };

  const fetchTestData = async () => {
    try {
      const data = await getTests();
      setTestRows(data);
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    }
  };

  useEffect(() => {
    fetchTuitionData();
    fetchPayrolls();
    fetchSchedules();
    fetchTestData();
  }, []);

  const handleRowClick = (
    row: ModalDataType,
    type: "tuition" | "payroll" | "schedule" | "test"
  ) => {
    setSelectedRow(row);
    setSelectedType(type);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    try {
      if (selectedType === "tuition") {
        await deleteTuition((selectedRow as Tuition).id);
        await fetchTuitionData();
        alert("Tuition deleted successfully!");
      } else if (selectedType === "payroll") {
        await deletePayroll((selectedRow as Payroll).id);
        await fetchPayrolls();
        alert("Payroll deleted successfully!");
      } else if (selectedType === "schedule") {
        await deleteSchedule((selectedRow as Schedule).id);
        await fetchSchedules();
        alert("Schedule deleted successfully!");
      } else if (selectedType === "test") {
        await deleteTest((selectedRow as Test).test_id);
        await fetchTestData();
        alert("Test deleted successfully!");
      }
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  const handleUpdated = async () => {
    await fetchTuitionData();
    await fetchPayrolls();
    await fetchSchedules();
    await fetchTestData();
  };

  return (
    <div className="text-white">
      <h3 className="text-lg font-bold mb-2">Tuitions</h3>
      <table className="w-full mb-6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
          </tr>
        </thead>
        <tbody>
          {tuitionRows.map((t) => (
            <tr
              key={t.id}
              className="hover:bg-gray-700 cursor-pointer"
              onClick={() => handleRowClick(t, "tuition")}
            >
              <td>{t.id}</td>
              <td>{t.student}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-bold mb-2">Payrolls</h3>
      <table className="w-full mb-6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Teacher</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-gray-700 cursor-pointer"
              onClick={() => handleRowClick(p, "payroll")}
            >
              <td>{p.id}</td>
              <td>{p.teacher}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-bold mb-2">Schedules</h3>
      <table className="w-full mb-6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Class</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => (
            <tr
              key={s.id}
              className="hover:bg-gray-700 cursor-pointer"
              onClick={() => handleRowClick(s, "schedule")}
            >
              <td>{s.id}</td>
              <td>{s.class_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-bold mb-2">Tests</h3>
      <table className="w-full mb-6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {testRows.map((t) => (
            <tr
              key={t.test_id}
              className="hover:bg-gray-700 cursor-pointer"
              onClick={() => handleRowClick(t, "test")}
            >
              <td>{t.test_id}</td>
              <td>{t.test_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Action Modal */}
      {showConfirm && selectedRow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <ActionModal
            onClose={() => setShowConfirm(false)}
            onShowInfo={() => {
              setShowConfirm(false);
              setShowInfo(true);
            }}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Show Info Modal */}
      {showInfo && selectedRow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <ShowInfoModal
            type={selectedType}
            data={selectedRow}
            onClose={() => setShowInfo(false)}
            onUpdated={handleUpdated}
          />
        </div>
      )}
    </div>
  );
}
