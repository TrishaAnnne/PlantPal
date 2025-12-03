import { useState, useEffect } from "react";
import { Trash2, ChevronDown } from "lucide-react";
import BackgroundImage from "../assets/background.png";

type UserType = {
  id: string;
  full_name: string;
  email: string;
  date_joined: string;
};

export default function UserAccount() {
  const API_BASE = "http://127.0.0.1:8000/api/";

  const [users, setUsers] = useState<UserType[]>([]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const accessToken = localStorage.getItem("access_token") || "";

  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  const fetchUsers = () => {
    fetch(`${API_BASE}get_users/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch((err) => console.error("Error fetching users:", err));
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      const res = await fetch(`${API_BASE}delete_user/${deleteUserId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to delete user, status: ${res.status}`);
      setDeleteUserId(null);
      setShowSuccessModal(true); // show success modal
      fetchUsers(); // refresh table
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime();
      case "oldest":
        return new Date(a.date_joined).getTime() - new Date(b.date_joined).getTime();
      case "name-asc":
        return a.full_name.localeCompare(b.full_name);
      case "name-desc":
        return b.full_name.localeCompare(a.full_name);
      default:
        return 0;
    }
  });

  return (
    <div
      className="flex h-screen font-['Poppins'] bg-cover bg-center relative"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <main className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm overflow-y-auto p-10">
        <section>
          <div className="bg-white/30 rounded-2xl shadow-md p-6 mb-4">
            <h2 className="text-xl font-semibold text-[#2F4F2F] mb-4">
              Registered Users
            </h2>

            {/* Filter Dropdown */}
            <div className="relative inline-block mb-4">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg shadow-sm transition"
              >
                Filter
                <ChevronDown size={16} />
              </button>
              {filterOpen && (
                <div className="absolute mt-2 w-40 bg-white shadow-lg rounded-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-green-100"
                    onClick={() => {
                      setSortBy("newest");
                      setFilterOpen(false);
                    }}
                  >
                    Date: Newest
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-green-100"
                    onClick={() => {
                      setSortBy("oldest");
                      setFilterOpen(false);
                    }}
                  >
                    Date: Oldest
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-green-100"
                    onClick={() => {
                      setSortBy("name-asc");
                      setFilterOpen(false);
                    }}
                  >
                    Name: A → Z
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-green-100"
                    onClick={() => {
                      setSortBy("name-desc");
                      setFilterOpen(false);
                    }}
                  >
                    Name: Z → A
                  </button>
                </div>
              )}
            </div>

            {/* Users Table */}
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[#2F4F2F] font-semibold text-sm">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Date Joined</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, index) => (
                  <tr
                    key={index}
                    className="bg-white/70 hover:bg-white/90 rounded-xl text-[#2F4F2F] shadow-sm"
                  >
                    <td className="px-4 py-3 font-medium">{user.full_name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{formatDate(user.date_joined)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="bg-red-400 hover:bg-red-500 text-white p-2 rounded-full transition"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-[#2F4F2F] py-6 italic">
                      No user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Confirmation Modal */}
        {deleteUserId && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg text-center">
              <p className="mb-4 text-[#2F4F2F]">
                Are you sure you want to delete this user?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
                  onClick={() => setDeleteUserId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[350px] shadow-lg text-center">
              <p className="mb-4 text-[#2F4F2F]">User deleted successfully!</p>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
