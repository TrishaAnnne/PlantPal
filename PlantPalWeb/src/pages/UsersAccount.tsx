import { useState, useEffect } from "react";
import { Eye, X } from "lucide-react";
import BackgroundImage from "../assets/background.png";

type UserType = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  date_joined: string;
};

export default function UserAccount() {
  const API_BASE = "http://127.0.0.1:8000/api/";

  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}get_users/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleView = (user: UserType) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  return (
    <div
      className="flex h-screen font-['Poppins'] bg-cover bg-center relative"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <main className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm overflow-y-auto p-10">
        {/* User Accounts Table */}
        <section>
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            

            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[#2F4F2F] font-semibold text-sm">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Date Joined</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={index}
                    className="bg-white/70 hover:bg-white/90 rounded-xl text-[#2F4F2F] shadow-sm"
                  >
                    <td className="px-4 py-3 font-medium">{user.full_name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3">{user.date_joined}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="flex items-center justify-center gap-2 bg-[#E6E6E6] hover:bg-[#dcdcdc] text-[#2F4F2F] px-3 py-2 rounded-lg shadow-sm transition"
                        onClick={() => handleView(user)}
                      >
                        <Eye size={18} /> View
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-[#2F4F2F] py-6 italic"
                    >
                      No user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 📄 View Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[500px] max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-3 right-3 text-[#2F4F2F] hover:text-gray-600"
            >
              <X size={22} />
            </button>
            <h3 className="text-xl font-semibold text-[#2F4F2F] mb-4">
              User Information
            </h3>
            <div className="space-y-3 text-[#2F4F2F]">
              <div>
                <p className="font-semibold">Full Name:</p>
                <p>{selectedUser.full_name}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <p className="font-semibold">Role:</p>
                <p className="capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <p className="font-semibold">Date Joined:</p>
                <p>{selectedUser.date_joined}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
