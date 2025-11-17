import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Leaf,
  Monitor,
  User,
  MessageSquare,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import DashboardLogo from "../assets/dashboard-logo.png";
import BackgroundImage from "../assets/background.png";
import { useAuth } from "../contexts/AuthContext";
import { toast, Toaster } from "react-hot-toast";

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState(admin?.user_name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // keep local fields in sync if admin changes (when component mounts or admin updates)
  useEffect(() => {
    if (!admin) {
      navigate("/login", { replace: true });
    } else {
      setUsername(admin.user_name ?? "");
      setEmail(admin.email ?? "");
    }
  }, [admin, navigate]);

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
      case "/dashboard/terms-conditions":
        return "TERMS & CONDITIONS";
      default:
        return "DASHBOARD";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !email) {
      toast.error("⚠️ Please fill all required fields");
      return;
    }

    // MUST provide current password to save any change (name/email or password)
    if (!currentPassword) {
      toast.error("🔒 Please enter your current password to save changes");
      return;
    }

    // If attempting to change password, validate new password fields
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        toast.error("❌ New password and confirmation do not match");
        return;
      }

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        toast.error(
          "🔑 New password must be at least 8 characters long and contain letters and numbers"
        );
        return;
      }
    }

    setLoading(true);

    // Build payload exactly as backend expects
    const payload: Record<string, any> = {
      email: email.trim().toLowerCase(),
      user_name: username.trim(),
      current_password: currentPassword,
    };
    if (newPassword) payload.new_password = newPassword;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/update-admin-profile/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // show backend-provided message if available
        const errMsg = data.error || data.message || "Update failed";
        if (typeof errMsg === "string" && errMsg.toLowerCase().includes("incorrect")) {
          toast.error("🚫 Current password is incorrect");
        } else {
          toast.error(errMsg);
        }
        return;
      }

      // Success: update local UI (we cannot modify context admin here unless useAuth provides setter)
      toast.success("✅ Profile updated successfully!");

      // Clear passwords and close modal
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsModalOpen(false);

      // If your useAuth provides a refresh or setter to update admin context, call it here.
      // Fallback: if you're storing admin in localStorage, update it there, or refresh page.
      // Example (uncomment if you use localStorage for admin):
      // const stored = JSON.parse(localStorage.getItem("admin") || "{}");
      // stored.user_name = username;
      // stored.email = email;
      // localStorage.setItem("admin", JSON.stringify(stored));
      //
      // If you want the change to reflect immediately in the header/sidebar, update local state:
      // (we already set username/email state above and they are used for display)

    } catch (err) {
      console.error("Update error:", err);
      toast.error("⚠️ Unable to update profile. Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen font-['Poppins'] bg-cover bg-center"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Toast Bubble Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
            fontSize: "15px",
            padding: "10px 16px",
          },
        }}
      />

      {/* Sidebar */}
      <aside className="w-72 bg-[#bcd1ab] flex flex-col shadow-lg">
        <div className="flex flex-col items-center mt-4 px-6">
          <img
            src={DashboardLogo}
            alt="Dashboard Logo"
            className="w-48 h-auto object-contain"
          />
        </div>

        <nav className="flex-1 px-5 space-y-2 mt-4">
          {[
            { to: "/dashboard", icon: Monitor, label: "DASHBOARD" },
            { to: "/dashboard/plant-database", icon: Leaf, label: "PLANT DATABASE" },
            { to: "/dashboard/users-account", icon: User, label: "USERS ACCOUNT" },
            { to: "/dashboard/feedbacks", icon: MessageSquare, label: "FEEDBACKS" },
            { to: "/dashboard/terms-conditions", icon: FileText, label: "TERMS & CONDITIONS" },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                [
                  "relative w-full flex items-center gap-4 px-4 py-3 rounded-lg font-semibold transition-all duration-200 border-l-4 group",
                  isActive
                    ? "bg-[#9ebe88] text-[#1f331f] border-[#1f331f] shadow-sm"
                    : "text-[#1f331f] border-transparent hover:bg-[#aacb93] hover:border-[#1f331f]/40 hover:text-[#1f331f]",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-[#1f331f] rounded-r-md transition-all duration-300" />
                  )}
                  <Icon
                    size={22}
                    className="transition-transform group-hover:scale-110 duration-150"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-5">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-[#2F4F2F] text-white rounded-lg font-semibold hover:bg-[#244024] transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm overflow-y-auto">
        <header className="flex justify-between items-center px-10 py-5 bg-[#E7EED9] shadow-sm">
          <h2 className="text-3xl font-bold text-[#2F4F2F] tracking-wider">
            {getPageTitle()}
          </h2>

          {/* Admin Info */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-4 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-[#d8e6ca] hover:shadow-md"
          >
            <span className="text-base font-semibold text-gray-800 tracking-wider">
              {username || admin?.user_name || "Unknown Admin"}
            </span>
            <div className="w-12 h-12 rounded-full bg-[#e07856] flex items-center justify-center">
              <User size={24} color="white" />
            </div>
          </div>
        </header>

        <section>
          <Outlet />
        </section>

        {/* Edit Profile Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-[90%] max-w-md animate-fadeIn">
              <h3 className="text-2xl font-bold text-[#2F4F2F] mb-6 text-center">
                Edit Admin Profile
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Username */}
                <div className="flex items-center bg-[#e1e9d7] rounded-full px-4 py-3">
                  <input
                    type="text"
                    placeholder="Username"
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex items-center bg-[#e1e9d7] rounded-full px-4 py-3">
                  <input
                    type="email"
                    placeholder="Email"
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Current Password */}
                <div className="flex items-center bg-[#e1e9d7] rounded-full px-4 py-3">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Current Password"
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-2"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="w-10 h-10 rounded-full bg-[#faffef] flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* New Password (optional) */}
                <div className="flex items-center bg-[#e1e9d7] rounded-full px-4 py-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password (optional)"
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-2"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-10 h-10 rounded-full bg-[#faffef] flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="flex items-center bg-[#e1e9d7] rounded-full px-4 py-3">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base pl-2"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="w-10 h-10 rounded-full bg-[#faffef] flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-lg bg-[#2F4F2F] text-white font-semibold hover:bg-[#244024] transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
