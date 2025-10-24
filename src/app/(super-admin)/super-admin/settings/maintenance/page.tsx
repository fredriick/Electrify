"use client";

import React, { useState } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { AlertTriangle, Save, Calendar, CheckCircle } from "lucide-react";

const defaultSettings = {
  maintenanceMode: false,
  message: "We are currently undergoing scheduled maintenance. Please check back soon.",
  schedule: "",
};

const MaintenancePage = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setSettings((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <AlertTriangle className="w-7 h-7 text-yellow-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Mode</h1>
        </div>
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="flex items-center gap-2">
            <input
              id="maintenanceMode"
              name="maintenanceMode"
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
            />
            <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Enable Maintenance Mode
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="message">
              Maintenance Message
            </label>
            <textarea
              id="message"
              name="message"
              value={settings.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="schedule">
              Schedule Maintenance (optional)
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                id="schedule"
                name="schedule"
                type="datetime-local"
                value={settings.schedule}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
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

export default MaintenancePage; 