// src/pages/students/StudentMenu.jsx
import { useState, useEffect } from "react";
import api from "../../api/api";

export default function StudentMenu() {
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayMenu();
  }, []);

  const fetchTodayMenu = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/canteen/menu/today");
      
      // Group items by meal type
      const grouped = response.data.reduce((acc, item) => {
        const type = item.mealType; // BREAKFAST, LUNCH, DINNER
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});

      setMenuData(grouped);
      setError(null);
    } catch (err) {
      setError("Failed to load today's menu.");
    } finally {
      setLoading(false);
    }
  };

  const mealOrder = ["BREAKFAST", "LUNCH", "DINNER"];
  const mealLabels = {
    BREAKFAST: "Breakfast",
    LUNCH: "Lunch",
    DINNER: "Dinner",
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Canteen Menu</h2>
          <p className="text-sm text-slate-400 mt-1">
            Today's meals available at the Green Hostel canteen.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-[#0d1733]/70 border border-slate-700 px-3 py-2 rounded-lg">
          📅 {today}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-slate-400 text-sm">Loading menu...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* No Menu */}
      {!loading && !error && Object.keys(menuData).length === 0 && (
        <div className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-10 text-center">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-slate-300 font-medium">No menu available for today.</p>
          <p className="text-slate-500 text-sm mt-1">
            Check back later or contact canteen staff.
          </p>
        </div>
      )}

      {/* Menu Sections */}
      {!loading && !error && Object.keys(menuData).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mealOrder.map((type) =>
            menuData[type] ? (
              <div
                key={type}
                className="bg-[#0d1733]/70 border border-slate-800 rounded-xl p-5 shadow-lg"
              >
                <p className="text-xs font-semibold text-blue-300 uppercase mb-4 tracking-wide">
                  {mealLabels[type]}
                </p>

                <ul className="space-y-3 text-sm">
                  {menuData[type].map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between text-slate-200"
                    >
                      <span>{item.itemName}</span>
                      <span className="text-xs font-medium text-slate-400">
                        Rs. {Number(item.price).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}

      <p className="text-xs text-slate-500 pt-2">
        * Menu is updated daily by canteen staff.
      </p>
    </div>
  );
}