// src/pages/canteen/NearbyServices.jsx
import { useState, useEffect } from "react";
import { Utensils, Dumbbell, Bus, ShoppingCart, Heart, Coffee, MapPin, Navigation } from "lucide-react";
import api from "../../api/api";

const categoryConfig = {
  Restaurant: { icon: <Utensils size={18} />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  Gym:        { icon: <Dumbbell size={18} />, color: "text-sky-600 bg-sky-50 border-sky-200" },
  Transport:  { icon: <Bus size={18} />,      color: "text-amber-600 bg-amber-50 border-amber-200" },
  Shop:       { icon: <ShoppingCart size={18} />, color: "text-purple-600 bg-purple-50 border-purple-200" },
  Medical:    { icon: <Heart size={18} />,    color: "text-red-600 bg-red-50 border-red-200" },
  Cafe:       { icon: <Coffee size={18} />,   color: "text-orange-600 bg-orange-50 border-orange-200" },
};

// ✅ Opens Google Maps directions from The Bunker to the service
const getDirections = (serviceName) => {
  const destination = encodeURIComponent(serviceName + " Watareka Sri Lanka");
  const url = `https://www.google.com/maps/dir/?api=1&origin=The+Bunker+Watareka+Sri+Lanka&destination=${destination}&travelmode=walking`;
  window.open(url, "_blank");
};

export default function NearbyServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/api/nearby-services");
        setServices(res.data);
      } catch (err) {
        console.error("Failed to load nearby services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Nearby Services</h1>
        <p className="text-gray-500 mt-1">Quick view of restaurants, gyms and transport near The Bunker Hostel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Services List */}
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
              Loading services...
            </div>
          )}

          {!loading && services.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No nearby services added yet.</p>
              <p className="text-xs text-gray-400 mt-1">Check back later.</p>
            </div>
          )}

          {!loading && services.map((s) => {
            const config = categoryConfig[s.category] || {
              icon: <MapPin size={18} />,
              color: "text-gray-600 bg-gray-50 border-gray-200"
            };
            return (
              <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                {/* Name + Category */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    {config.icon}
                    {s.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                    {s.category}
                  </span>
                </div>

                {/* Description */}
                {s.description && (
                  <p className="text-sm text-gray-500 mb-2">{s.description}</p>
                )}

                {/* Distance + Directions */}
                <div className="flex items-center justify-between mt-2">
                  {s.distance ? (
                    <p className="text-xs text-gray-400">
                      Distance: <span className="text-gray-700 font-medium">{s.distance}</span>
                    </p>
                  ) : <span />}

                  {/* ✅ Directions button */}
                  <button
                    onClick={() => getDirections(s.name)}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-50 transition font-medium"
                  >
                    <Navigation size={12} />
                    Directions
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Real Google Maps */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">📍 The Bunker — Location</h3>
          <p className="text-gray-400 text-sm mb-4">Hostel location on Google Maps.</p>
          <div className="rounded-xl overflow-hidden border border-gray-200 h-[380px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.5620644137216!2d80.0365366753166!3d6.822994493174801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253ed07449f6d%3A0x2c5639ddd7c1819e!2sThe%20Bunker!5e0!3m2!1sen!2slk!4v1777919155679!5m2!1sen!2slk"
              width="100%" height="100%" style={{ border: 0 }}
              allowFullScreen="" loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Bunker Hostel Location"
            />
          </div>
        </div>

      </div>
    </div>
  );
}