import {
  Users,
  Crown,
  Leaf,
  User,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import BackgroundImage from "../assets/background.png";



export default function Dashboard() {
  return (
    <div
      className="flex h-screen font-['Poppins'] bg-cover bg-center"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Sidebar */}
      

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm">
        {/* Header */}
        

        {/* Stats Cards */}
        <section className="grid grid-cols-3 gap-6 px-10 py-8 bg-transparent">
          {/* Total Users */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-[#b8d4a8] shadow-md">
            <div>
              <p className="text-xs font-semibold text-gray-700 tracking-wider mb-1">TOTAL USERS</p>
              <h3 className="text-5xl font-bold text-[#2F4F2F]">51</h3>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center">
              <Users className="text-[#2F4F2F]" size={32} strokeWidth={2} />
            </div>
          </div>

          {/* Subscribed Users */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-[#c4d1b0] shadow-md">
            <div>
              <p className="text-xs font-semibold text-gray-700 tracking-wider mb-1">SUBSCRIBED USERS</p>
              <h3 className="text-5xl font-bold text-[#2F4F2F]">18</h3>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center">
              <Crown className="text-[#2F4F2F]" size={32} strokeWidth={2} />
            </div>
          </div>

          {/* Total Plant Scans */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-[#acd19a] shadow-md">
            <div>
              <p className="text-xs font-semibold text-gray-700 tracking-wider mb-1">TOTAL PLANTS SCAN</p>
              <h3 className="text-5xl font-bold text-[#2F4F2F]">504</h3>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center">
              <Leaf className="text-[#2F4F2F]" size={32} strokeWidth={2} />
            </div>
          </div>
        </section>

        {/* Content Area */}
        <section className="grid grid-cols-2 gap-6 px-10 py-6 flex-1 overflow-y-auto bg-transparent">
          {/* System Logs */}
          <div className="bg-[#b8cba8] rounded-2xl shadow-lg p-6 h-fit">
            <h3 className="text-xl font-bold text-[#2F4F2F] mb-5 tracking-wide">
              SYSTEM LOGS
            </h3>
            <div className="space-y-3">
              <div className="bg-[#c8dbbb] rounded-xl p-4 shadow-sm">
                <p className="text-sm text-[#2F4F2F] leading-relaxed">
                  <span className="font-semibold">[2025-05-21 08:06:01]</span> INFO: Plant scan request submitted by User ID 045 – Image ID: IMG10234.jpg
                </p>
              </div>
              <div className="bg-[#c8dbbb] rounded-xl p-4 shadow-sm">
                <p className="text-sm text-[#2F4F2F] leading-relaxed">
                  <span className="font-semibold">[2025-05-21 09:12:11]</span> ERROR: Failed to connect to image classifier service (Server not responding).
                </p>
              </div>
              <div className="bg-[#c8dbbb] rounded-xl p-4 shadow-sm">
                <p className="text-sm text-[#2F4F2F] leading-relaxed">
                  <span className="font-semibold">[2025-05-21 09:45:07]</span> INFO: New user registered – User ID 046 (rcastro@yahoo.com).
                </p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#c8dbbb] rounded-2xl shadow-lg p-6 h-fit">
            <h3 className="text-xl font-bold text-[#2F4F2F] mb-5 tracking-wide">
              NOTIFICATIONS
            </h3>
            <div className="space-y-3">
              {/* New User Account */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-[#d8e8cb] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-[#2F4F2F]" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-[#2F4F2F] font-medium">New User Account Created.</span>
                </div>
                <button className="text-[#2F4F2F] hover:bg-white/30 rounded-full p-1 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Incorrect Plant Info */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-[#f5e8da] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-[#2F4F2F]" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-[#2F4F2F] font-medium">A user reported incorrect plant information.</span>
                </div>
                <button className="text-[#2F4F2F] hover:bg-white/30 rounded-full p-1 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Successful Scan */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-[#d5ead8] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-[#2F4F2F]" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-[#2F4F2F] font-medium">A plant has been successfully scanned.</span>
                </div>
                <button className="text-[#2F4F2F] hover:bg-white/30 rounded-full p-1 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* New User Account (Duplicate) */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-[#d8e8cb] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-[#2F4F2F]" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-[#2F4F2F] font-medium">New User Account Created.</span>
                </div>
                <button className="text-[#2F4F2F] hover:bg-white/30 rounded-full p-1 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>

              {/* Successful Scan (Duplicate) */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-[#d5ead8] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-[#2F4F2F]" strokeWidth={2} />
                  </div>
                  <span className="text-sm text-[#2F4F2F] font-medium">A plant has been successfully scanned.</span>
                </div>
                <button className="text-[#2F4F2F] hover:bg-white/30 rounded-full p-1 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}