// src/pages/canteen/DailyMenu.jsx
import { useState, useEffect } from "react";
import api from "../../api/api";

export default function DailyMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: "", mealType: "BREAKFAST", price: "" });
  const [error, setError] = useState(null);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/canteen/admin/menu/all");
      setMenuItems(res.data);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError(null);
    if (!newItem.itemName.trim()) return setError("Item name is required.");
    if (!newItem.price || Number(newItem.price) <= 0) return setError("Valid price is required.");
    try {
      await api.post("/api/canteen/menu", {
        itemName: newItem.itemName.trim(),
        mealType: newItem.mealType,
        price: Number(newItem.price),
        date: new Date().toISOString().split("T")[0],
        available: true,
      });
      setNewItem({ itemName: "", mealType: "BREAKFAST", price: "" });
      setShowAddForm(false);
      fetchMenu();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item.");
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/api/canteen/admin/menu/${id}/toggle`);
      fetchMenu();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/canteen/admin/menu/${id}`);
      fetchMenu();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const grouped = menuItems.reduce((acc, item) => {
    const type = item.mealType || "OTHER";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  const mealOrder = ["BREAKFAST", "LUNCH", "DINNER"];
  const sortedTypes = [
    ...mealOrder.filter((t) => grouped[t]),
    ...Object.keys(grouped).filter((t) => !mealOrder.includes(t)),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-500 text-sm">Loading menu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Daily Canteen Menu</h1>
          <p className="text-sm text-gray-500">View and manage today's menu. ({menuItems.length} items)</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
        >
          {showAddForm ? "Cancel" : "+ Add Item"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Add New Menu Item</h2>
          {error && <p className="text-red-500 text-xs mb-2">❌ {error}</p>}
          <form onSubmit={handleAddItem} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Item Name</label>
              <input
                type="text"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                placeholder="e.g. Rice & Curry"
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Meal Type</label>
              <select
                value={newItem.mealType}
                onChange={(e) => setNewItem({ ...newItem, mealType: e.target.value })}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Price (LKR)</label>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="350"
                min="1"
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">
              Save
            </button>
          </form>
        </div>
      )}

      {/* Menu Grid */}
      {sortedTypes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-400">No menu items yet. Add some above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedTypes.map((type) => (
            <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </h2>
              <ul className="space-y-2 text-sm">
                {grouped[type].map((item) => (
                  <li key={item.id} className={`flex items-center justify-between ${!item.available ? "opacity-40" : ""}`}>
                    <span className="text-gray-700">{item.itemName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-emerald-600">
                        LKR {Number(item.price).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleToggle(item.id)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                          item.available
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-red-100 text-red-600 border-red-200"
                        }`}
                        title={item.available ? "Mark unavailable" : "Mark available"}
                      >
                        {item.available ? "ON" : "OFF"}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.itemName)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}