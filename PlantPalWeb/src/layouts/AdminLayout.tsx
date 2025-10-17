import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Leaf, Monitor, User, MessageSquare, FileText } from "lucide-react";
import DashboardLogo from "../assets/dashboard-logo.png";
import BackgroundImage from "../assets/background.png";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Redirect to login if admin is missing (safety check)
  useEffect(() => {
    if (!admin) {
      navigate("/login", { replace: true });
    }
  }, [admin, navigate]);

  // ✅ Dynamic Page Title
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "DASHBOARD";
      case "/dashboard/plant-database":
        return "PLANT DATABASE";
      case "/dashboard/users-account":
        return "USERS ACCOUNT";
      case "/dashboard/feedbacks":
        return "FEEDBACKS";
      case "/dashboard/terms":
        return "TERMS & CONDITIONS";
      default:
        return "DASHBOARD";
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="flex h-screen font-['Poppins'] bg-cover bg-center"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* ===== Sidebar ===== */}
      <aside className="w-72 bg-[#bcd1ab] flex flex-col shadow-lg">
        <div className="flex flex-col items-center mt-4 px-6">
          <img
            src={DashboardLogo}
            alt="Dashboard Logo"
            className="w-48 h-auto object-contain"
          />
        </div>

        <nav className="flex-1 px-5 space-y-2 mt-4">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-lg font-semibold shadow-md border-l-4 transition ${
                isActive
                  ? "bg-[#a8c496] text-[#1f331f] border-[#2F4F2F]"
                  : "text-[#2F4F2F] hover:bg-[#a8c496]/50 border-transparent"
              }`
            }
          >
            <Monitor size={22} />
            <span>DASHBOARD</span>
          </NavLink>

          <NavLink
            to="/dashboard/plant-database"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-lg font-semibold tracking-wide transition ${
                isActive
                  ? "bg-[#a8c496] text-[#1f331f] border-l-4 border-[#2F4F2F]"
                  : "text-[#2F4F2F] hover:bg-[#a8c496]/50"
              }`
            }
          >
            <Leaf size={22} />
            <span>PLANT DATABASE</span>
          </NavLink>

          <NavLink
            to="/dashboard/users-account"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-lg font-semibold tracking-wide transition ${
                isActive
                  ? "bg-[#a8c496] text-[#1f331f] border-l-4 border-[#2F4F2F]"
                  : "text-[#2F4F2F] hover:bg-[#a8c496]/50"
              }`
            }
          >
            <User size={22} />
            <span>USERS ACCOUNT</span>
          </NavLink>

          <NavLink
            to="/dashboard/feedbacks"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-lg font-semibold tracking-wide transition ${
                isActive
                  ? "bg-[#a8c496] text-[#1f331f] border-l-4 border-[#2F4F2F]"
                  : "text-[#2F4F2F] hover:bg-[#a8c496]/50"
              }`
            }
          >
            <MessageSquare size={22} />
            <span>FEEDBACKS</span>
          </NavLink>

          <NavLink
            to="/dashboard/terms"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-lg font-semibold tracking-wide transition ${
                isActive
                  ? "bg-[#a8c496] text-[#1f331f] border-l-4 border-[#2F4F2F]"
                  : "text-[#2F4F2F] hover:bg-[#a8c496]/50"
              }`
            }
          >
            <FileText size={22} />
            <span>TERMS & CONDITIONS</span>
          </NavLink>
        </nav>

        {/* ===== Logout Button ===== */}
        <div className="p-5">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-[#2F4F2F] text-white rounded-lg font-semibold hover:bg-[#244024] transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
    <main className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm overflow-y-auto">
        {/* Header */}
    <header className="flex justify-between items-center px-10 py-5 bg-[#E7EED9] shadow-sm">
          <h2 className="text-3xl font-bold text-[#2F4F2F] tracking-wider">
            {getPageTitle()}
          </h2>

          <div className="flex items-center gap-4">
            <span className="text-base font-semibold text-gray-800 tracking-wider">
              {admin?.user_name || "Unknown Admin"}
            </span>
            <div className="w-12 h-12 rounded-full bg-[#e07856] flex items-center justify-center">
              <User size={24} color="white" />
            </div>
          </div>
        </header>

        {/* Nested Page Content */}
        <section >
          <Outlet />
        </section>
      </main>
    </div>
  );
}
