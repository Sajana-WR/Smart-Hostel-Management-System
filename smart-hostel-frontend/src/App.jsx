import { Routes, Route, Navigate } from "react-router-dom";

import Home           from "./pages/auth/Home.jsx";
import Login          from "./pages/auth/Login.jsx";
import Register       from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

import StudentLayout         from "./pages/students/StudentLayout.jsx";
import StudentDashboard      from "./pages/students/StudentDashboard.jsx";
import MyProfile             from "./pages/students/MyProfile.jsx";
import EditProfile           from "./pages/students/EditProfile.jsx";
import MyRoom                from "./pages/students/MyRoom.jsx";
import FloorChart            from "./pages/students/FloorChart.jsx";
import StudentMakePayment    from "./pages/students/StudentMakePayment.jsx";
import StudentPaymentHistory from "./pages/students/StudentPaymentHistory.jsx";
import SubmitComplaint       from "./pages/students/SubmitComplaint.jsx";
import MyComplaints          from "./pages/students/MyComplaints.jsx";
import StudentMenu           from "./pages/students/StudentMenu.jsx";
import StudentOrderMeal      from "./pages/students/StudentOrderMeal.jsx";
import StudentMyOrders       from "./pages/students/StudentMyOrders.jsx";
import Requests              from "./pages/students/Requests.jsx";
import RoommateQuestionnaire from "./pages/students/RoommateQuestionnaire.jsx";
import RoommateResults       from "./pages/students/RoommateResults.jsx";

import AdminLayout              from "./pages/admin/AdminLayout.jsx";
import Dashboard                from "./pages/admin/Dashboard.jsx";
import StudentList              from "./pages/admin/students/StudentList.jsx";
import StudentAdd               from "./pages/admin/students/StudentAdd.jsx";
import StudentEdit              from "./pages/admin/students/StudentEdit.jsx";
import StudentView              from "./pages/admin/students/StudentView.jsx";
import StudentSearch            from "./pages/admin/students/StudentSearch.jsx";
import AdminPendingApprovals    from "./pages/admin/students/AdminPendingApprovals.jsx"; // ✅ NEW
import RoomList                 from "./pages/admin/rooms/RoomList.jsx";
import RoomAdd                  from "./pages/admin/rooms/RoomAdd.jsx";
import RoomEdit                 from "./pages/admin/rooms/RoomEdit.jsx";
import RoomDetails              from "./pages/admin/rooms/RoomDetails.jsx";
import RoomAllocation           from "./pages/admin/rooms/RoomAllocation.jsx";
import PaymentList              from "./pages/admin/payments/PaymentList.jsx";
import PaymentHistory           from "./pages/admin/payments/PaymentHistory.jsx";
import PaymentVerification      from "./pages/admin/payments/PaymentVerification.jsx";
import FinancialReports         from "./pages/admin/payments/FinancialReports.jsx";
import ComplaintList            from "./pages/admin/complaints/ComplaintList.jsx";
import ComplaintView            from "./pages/admin/complaints/ComplaintView.jsx";
import ComplaintAnalytics       from "./pages/admin/complaints/ComplaintAnalytics.jsx";
import EnergyDataUpload         from "./pages/admin/ai/EnergyDataUpload.jsx";
import EnergyForecast           from "./pages/admin/ai/EnergyForecast.jsx";
import RoommateQues             from "./pages/admin/ai/RoommateQues.jsx";
import RoommateResult           from "./pages/admin/ai/RoommateResult.jsx";
import DailyMenu                from "./pages/canteen/DailyMenu.jsx";
import MealOrder                from "./pages/canteen/MealOrder.jsx";
import NearbyServices           from "./pages/canteen/NearbyServices.jsx";
import NearbyServicesManager    from "./pages/admin/canteen/NearbyServicesManager.jsx";
import NotificationCenter       from "./pages/admin/notifications/NotificationCenter.jsx";

import CanteenLayout  from "./pages/canteen/CanteenLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-700 mb-4">404</h1>
        <p className="text-slate-400 text-lg mb-6">Page not found.</p>
        <a href="/" className="text-sm text-blue-400 hover:text-blue-300 underline transition">
          Go back home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>

        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]} />}>
          <Route path="/students/profile/edit" element={<EditProfile />} />
          <Route path="/students" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"                 element={<StudentDashboard />} />
            <Route path="profile"                   element={<MyProfile />} />
            <Route path="my-room"                   element={<MyRoom />} />
            <Route path="floor-chart"               element={<FloorChart />} />
            <Route path="payments/make"             element={<StudentMakePayment />} />
            <Route path="payments/history"          element={<StudentPaymentHistory />} />
            <Route path="complaints/new"            element={<SubmitComplaint />} />
            <Route path="complaints"                element={<MyComplaints />} />
            <Route path="canteen/menu"              element={<StudentMenu />} />
            <Route path="canteen/order"             element={<StudentOrderMeal />} />
            <Route path="canteen/my-orders"         element={<StudentMyOrders />} />
            <Route path="canteen/nearby"            element={<NearbyServices />} />
            <Route path="requests"                  element={<Requests />} />
            <Route path="ai/roommate-questionnaire" element={<RoommateQuestionnaire />} />
            <Route path="ai/roommate-results"       element={<RoommateResults />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"                   element={<Dashboard />} />
            <Route path="students"                    element={<StudentList />} />
            <Route path="students/add"                element={<StudentAdd />} />
            <Route path="students/edit/:id"           element={<StudentEdit />} />
            <Route path="students/view/:id"           element={<StudentView />} />
            <Route path="students/search"             element={<StudentSearch />} />
            <Route path="students/approvals"          element={<AdminPendingApprovals />} /> {/* ✅ NEW */}
            <Route path="rooms"                       element={<RoomList />} />
            <Route path="rooms/add"                   element={<RoomAdd />} />
            <Route path="rooms/edit/:id"              element={<RoomEdit />} />
            <Route path="rooms/details/:id"           element={<RoomDetails />} />
            <Route path="rooms/allocation"            element={<RoomAllocation />} />
            <Route path="payments"                    element={<PaymentList />} />
            <Route path="payments/history"            element={<PaymentHistory />} />
            <Route path="payments/verification"       element={<PaymentVerification />} />
            <Route path="payments/reports"            element={<FinancialReports />} />
            <Route path="complaints"                  element={<ComplaintList />} />
            <Route path="complaints/view/:id"         element={<ComplaintView />} />
            <Route path="complaints/analytics"        element={<ComplaintAnalytics />} />
            <Route path="ai/energy-upload"            element={<EnergyDataUpload />} />
            <Route path="ai/energy-forecast"          element={<EnergyForecast />} />
            <Route path="ai/roommate-questions"       element={<RoommateQues />} />
            <Route path="ai/roommate-result"          element={<RoommateResult />} />
            <Route path="canteen/menu"                element={<DailyMenu />} />
            <Route path="canteen/orders"              element={<MealOrder />} />
            <Route path="canteen/nearby"              element={<NearbyServicesManager />} />
            <Route path="notifications"               element={<NotificationCenter />} />
          </Route>
        </Route>

        {/* Canteen Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={["CANTEEN_STAFF"]} />}>
          <Route path="/canteen" element={<CanteenLayout />}>
            <Route index element={<Navigate to="menu" replace />} />
            <Route path="menu"    element={<DailyMenu />} />
            <Route path="orders"  element={<MealOrder />} />
            <Route path="nearby"  element={<NearbyServices />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </div>
  );
}