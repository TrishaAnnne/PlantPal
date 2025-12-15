import { useState, useEffect } from "react";
import { Eye, Plus, CheckCircle, X, AlertCircle } from "lucide-react";
import BackgroundImage from "../assets/background.png";

// ✅ Define type for versions
type VersionType = {
  version: string;
  is_active: boolean;
  effective_date: string;
  content: string;
};

export default function TermsAndConditions() {
  const API_BASE = "http://127.0.0.1:8000/api/";

  // ✅ Explicitly type the versions array
  const [versions, setVersions] = useState<VersionType[]>([]);
  const [version, setVersion] = useState("");
  const [content, setContent] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // ✅ For modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionType | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false); // ⚠️ Added error modal state

  // ✅ Fetch all versions on load
  useEffect(() => {
    fetch(`${API_BASE}get_terms_conditions/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVersions(data);
      })
      .catch((err) => console.error("Error fetching versions:", err));
  }, []);

  // ✅ Admin clicks Add New
  const handleAddNew = () => {
    setVersion("");
    setEffectiveDate(new Date().toISOString().split("T")[0]);
    setContent("");
    setIsAddingNew(true);
  };

  // ✅ Save new version
  const handleSave = async () => {
    if (!version.trim() || !content.trim()) {
      alert("Please enter version and content.");
      return;
    }

    // ⚠️ Check for duplicate version number
    const duplicate = versions.some((v) => v.version === version);
    if (duplicate) {
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}add_terms_conditions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version,
          content,
          effective_date: effectiveDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setVersions((prev) => [
          { version, is_active: true, effective_date: effectiveDate, content },
          ...prev.map((v) => ({ ...v, is_active: false })),
        ]);
        setIsAddingNew(false);
        setShowSuccessModal(true);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ View button handler
  const handleView = (v: VersionType) => {
    setSelectedVersion(v);
    setShowViewModal(true);
  };

  return (
    <div
      className="flex h-screen font-['Poppins'] bg-cover bg-center relative"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <main className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm overflow-y-auto p-10">
        {/* Versions Table */}
        <section>
          <div className="bg-[#b8d4a8] rounded-2xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#2F4F2F]">
                Terms & Conditions Versions
              </h2>

              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-[#C9E4C5] hover:bg-[#b4d9ae] text-[#2F4F2F] font-medium px-4 py-2 rounded-lg shadow-sm transition"
              >
                <Plus size={18} /> Add New Version
              </button>
            </div>

            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[#2F4F2F] font-semibold text-sm">
                  <th className="px-4 py-2">Version</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Effective Date</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v, index) => (
                  <tr
                    key={index}
                    className="bg-[#d6e4cc] hover:bg-[#cde0bf] rounded-xl text-[#2F4F2F]"
                  >
                    <td className="px-4 py-3 font-medium">{v.version}</td>
                    <td className="px-4 py-3">
                      {v.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="px-4 py-3">{v.effective_date}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="flex items-center justify-center gap-2 bg-[#C9E4C5] hover:bg-[#b4d9ae] text-[#2F4F2F] px-3 py-2 rounded-lg shadow-sm transition"
                        onClick={() => handleView(v)}
                      >
                        <Eye size={18} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add New Version Form */}
        {isAddingNew && (
          <section>
            <div className="bg-[#b8d4a8] rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[#2F4F2F] mb-5">
                Add New Version
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* ✅ Admin inputs version manually */}
                <div>
                  <label className="text-sm font-semibold text-[#2F4F2F] block mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g., v2.0"
                    className="w-full p-2 rounded-md bg-white/70 border border-green-200 text-[#2F4F2F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#2F4F2F] block mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full p-2 rounded-md bg-white/70 border border-green-200 text-[#2F4F2F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-semibold text-[#2F4F2F] block mb-1">
                  Content
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the full Terms & Conditions text here..."
                  className="w-full p-3 rounded-md bg-white/70 border border-green-200 text-[#2F4F2F] resize-none focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  disabled={loading}
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-[#C9E4C5] hover:bg-[#b4d9ae] text-[#2F4F2F] font-medium px-5 py-2 rounded-lg shadow-sm transition"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="flex items-center gap-2 bg-[#C9E4C5] hover:bg-[#b4d9ae] text-[#2F4F2F] font-medium px-5 py-2 rounded-lg shadow-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center w-96">
            <CheckCircle className="text-green-600 mx-auto mb-3" size={48} />
            <h2 className="text-lg font-semibold text-[#2F4F2F] mb-2">
              Terms and Conditions Successfully Added!
            </h2>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 bg-[#C9E4C5] hover:bg-[#b4d9ae] text-[#2F4F2F] font-medium px-5 py-2 rounded-lg shadow-sm transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ❌ Error Modal (Duplicate Version) */}
      {showErrorModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center w-96">
            <AlertCircle className="text-red-600 mx-auto mb-3" size={48} />
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              Duplicate Version Detected
            </h2>
            <p className="text-[#2F4F2F] mb-4">
              The version number you entered already exists. Please use a unique version number.
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2 rounded-lg shadow-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 📄 View Modal */}
      {showViewModal && selectedVersion && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[600px] max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-3 right-3 text-[#2F4F2F] hover:text-green-700"
            >
              <X size={22} />
            </button>
            <h3 className="text-xl font-semibold text-[#2F4F2F] mb-4">
              Terms & Conditions - {selectedVersion.version}
            </h3>
            <p className="text-sm text-[#2F4F2F] mb-2">
              <strong>Effective Date:</strong> {selectedVersion.effective_date}
            </p>
            <div className="bg-[#f3f9f0] p-4 rounded-lg text-[#2F4F2F] whitespace-pre-wrap leading-relaxed">
              {selectedVersion.content || "No content found."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
