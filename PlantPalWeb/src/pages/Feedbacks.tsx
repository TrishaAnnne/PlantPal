import { useState, useEffect } from "react";
import { Eye, X } from "lucide-react";
import BackgroundImage from "../assets/background.png";

type FeedbackType = {
  id: string;
  user_name: string;
  email: string;
  message: string;
  date_submitted: string;
};

export default function UserFeedbacks() {
  const API_BASE = "http://127.0.0.1:8000/api/";

  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}get_feedbacks/`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFeedbacks(data);
      })
      .catch((err) => console.error("Error fetching feedbacks:", err));
  }, []);

  const handleView = (feedback: FeedbackType) => {
    setSelectedFeedback(feedback);
    setShowViewModal(true);
  };

  return (
    <div
      className="flex h-screen font-['Poppins'] bg-cover bg-center relative"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <main className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm overflow-y-auto p-10">
        {/* Feedback Table */}
        <section>
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            

            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[#2F4F2F] font-semibold text-sm">
                  <th className="px-4 py-2">User Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Message</th>
                  <th className="px-4 py-2">Date Submitted</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb, index) => (
                  <tr
                    key={index}
                    className="bg-white/70 hover:bg-white/90 rounded-xl text-[#2F4F2F] shadow-sm"
                  >
                    <td className="px-4 py-3 font-medium">{fb.user_name}</td>
                    <td className="px-4 py-3">{fb.email}</td>
                    <td className="px-4 py-3 truncate max-w-[250px]">
                      {fb.message}
                    </td>
                    <td className="px-4 py-3">{fb.date_submitted}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="flex items-center justify-center gap-2 bg-[#E6E6E6] hover:bg-[#dcdcdc] text-[#2F4F2F] px-3 py-2 rounded-lg shadow-sm transition"
                        onClick={() => handleView(fb)}
                      >
                        <Eye size={18} /> View
                      </button>
                    </td>
                  </tr>
                ))}

                {feedbacks.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-[#2F4F2F] py-6 italic"
                    >
                      No feedbacks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>


      {showViewModal && selectedFeedback && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[500px] max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-3 right-3 text-[#2F4F2F] hover:text-gray-600"
            >
              <X size={22} />
            </button>
            <h3 className="text-xl font-semibold text-[#2F4F2F] mb-4">
              Feedback from {selectedFeedback.user_name}
            </h3>
            <div className="space-y-3 text-[#2F4F2F]">
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedFeedback.email}</p>
              </div>
              <div>
                <p className="font-semibold">Date Submitted:</p>
                <p>{selectedFeedback.date_submitted}</p>
              </div>
              <div>
                <p className="font-semibold">Message:</p>
                <p className="bg-[#f9f9f9] p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
