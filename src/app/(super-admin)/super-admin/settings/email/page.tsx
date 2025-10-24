"use client";

import React, { useState } from "react";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import { Mail, Save, Server, Lock, Send, CheckCircle } from "lucide-react";

const defaultConfig = {
  smtpHost: "smtp.example.com",
  smtpPort: 587,
  smtpUser: "admin@electrify.com",
  smtpPass: "",
  fromEmail: "noreply@electrify.com",
  encryption: "STARTTLS",
};

const EmailConfigPage = () => {
  const [config, setConfig] = useState(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
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

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult("success");
    }, 1500);
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Mail className="w-7 h-7 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Configuration</h1>
        </div>
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="smtpHost">
              SMTP Host
            </label>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-400" />
              <input
                id="smtpHost"
                name="smtpHost"
                type="text"
                value={config.smtpHost}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="smtpPort">
              SMTP Port
            </label>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-400" />
              <input
                id="smtpPort"
                name="smtpPort"
                type="number"
                value={config.smtpPort}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                min={1}
                max={65535}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="smtpUser">
              SMTP Username
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                id="smtpUser"
                name="smtpUser"
                type="text"
                value={config.smtpUser}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="smtpPass">
              SMTP Password
            </label>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                id="smtpPass"
                name="smtpPass"
                type="password"
                value={config.smtpPass}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                autoComplete="new-password"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="fromEmail">
              From Email
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                id="fromEmail"
                name="fromEmail"
                type="email"
                value={config.fromEmail}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="encryption">
              Encryption
            </label>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <select
                id="encryption"
                name="encryption"
                value={config.encryption}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="STARTTLS">STARTTLS</option>
                <option value="SSL/TLS">SSL/TLS</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4 mt-6">
            <button
              type="button"
              onClick={handleTest}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
              disabled={testing}
            >
              <Send className="w-4 h-4" />
              {testing ? "Testing..." : "Send Test Email"}
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-60"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
          {saved && <div className="mt-4 text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Configuration saved!</div>}
          {testResult === "success" && <div className="mt-4 text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Test email sent successfully!</div>}
        </form>
      </div>
    </SuperAdminLayout>
  );
};

export default EmailConfigPage; 