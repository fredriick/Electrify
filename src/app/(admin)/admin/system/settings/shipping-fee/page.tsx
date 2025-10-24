"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, DollarSign } from "lucide-react";

const defaultFees = {
  minShippingFee: 0,
  maxShippingFee: 100,
};

export default function ShippingFeeSettingsPage() {
  const [fees, setFees] = useState(defaultFees);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFees((prev) => ({ ...prev, [name]: value.replace(/[^0-9.]/g, "") }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const min = parseFloat(fees.minShippingFee as any);
    const max = parseFloat(fees.maxShippingFee as any);
    if (isNaN(min) || isNaN(max) || min < 0 || max < 0 || min > max) {
      setError("Please enter valid min and max shipping fees. Min must be less than or equal to max, and both non-negative.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1200);
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center mb-6">
          <DollarSign className="w-7 h-7 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping Fee Settings</h1>
        </div>
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="minShippingFee">
              Minimum Shipping Fee
            </label>
            <input
              id="minShippingFee"
              name="minShippingFee"
              type="number"
              min="0"
              step="0.01"
              value={fees.minShippingFee}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="maxShippingFee">
              Maximum Shipping Fee
            </label>
            <input
              id="maxShippingFee"
              name="maxShippingFee"
              type="number"
              min="0"
              step="0.01"
              value={fees.maxShippingFee}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
            disabled={saving}
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
} 