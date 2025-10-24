"use client";

import React, { useState, useRef } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Database, Save, RefreshCw, Upload, CheckCircle, Clock, ToggleRight, Download } from "lucide-react";

const mockHistory = [
  {
    id: 1,
    date: "2024-04-10 14:30",
    size: "12MB",
    status: "Completed",
    file: "backup-2024-04-10.zip",
  },
  {
    id: 2,
    date: "2024-04-03 09:15",
    size: "11.8MB",
    status: "Completed",
    file: "backup-2024-04-03.zip",
  },
  {
    id: 3,
    date: "2024-03-27 16:45",
    size: "11.5MB",
    status: "Completed",
    file: "backup-2024-03-27.zip",
  },
];

const BackupPage = () => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [backupDone, setBackupDone] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreDone, setRestoreDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  };

  const handleBackup = () => {
    setBackingUp(true);
    setTimeout(() => {
      setBackingUp(false);
      setBackupDone(true);
      setTimeout(() => setBackupDone(false), 2000);
    }, 1500);
  };

  const handleRestore = (e: React.FormEvent) => {
    e.preventDefault();
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      setRestoreDone(true);
      setTimeout(() => setRestoreDone(false), 2000);
    }, 2000);
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Database className="w-7 h-7 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Restore</h1>
        </div>
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-8">
          {/* Manual Backup */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-500" /> Manual Backup
            </h2>
            <button
              type="button"
              onClick={handleBackup}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
              disabled={backingUp}
            >
              <Download className="w-4 h-4" />
              {backingUp ? "Backing Up..." : "Backup Now"}
            </button>
            {backupDone && <span className="ml-4 text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Backup completed!</span>}
          </div>
          {/* Backup History */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" /> Backup History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {mockHistory.map((backup) => (
                    <tr key={backup.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{backup.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{backup.file}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{backup.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{backup.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-1"><Download className="w-4 h-4" /> Download</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Restore from Backup */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-500" /> Restore from Backup
            </h2>
            <form onSubmit={handleRestore} className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".zip,.tar,.gz"
                required
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
                disabled={restoring}
              >
                <Upload className="w-4 h-4" />
                {restoring ? "Restoring..." : "Restore"}
              </button>
              {restoreDone && <span className="text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Restore completed!</span>}
            </form>
          </div>
          {/* Automatic Backup Toggle */}
          <div className="flex items-center gap-2">
            <input
              id="autoBackup"
              name="autoBackup"
              type="checkbox"
              checked={autoBackup}
              onChange={() => setAutoBackup((v) => !v)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoBackup" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <ToggleRight className="w-4 h-4 text-blue-500" />
              Enable Automatic Backups
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {saved && <span className="ml-4 text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Settings saved!</span>}
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default BackupPage; 