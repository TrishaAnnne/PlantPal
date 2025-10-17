import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search, Leaf, Globe2, MapPin, BookOpenText, XCircle,
  Link2, Trees, ImagePlus, Sprout, TreePalm, FlaskConical, Layers, CheckCircle 
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext"; 

export default function PlantDatabase() {
  const { accessToken, refreshAccessToken } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null);
  const [plantImages, setPlantImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [plantToDelete, setPlantToDelete] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPlant, setViewingPlant] = useState<any | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [formData, setFormData] = useState({
    plant_name: "",
    scientific_name: "",
    common_names: "",
    link: "",
    origin: "",
    distribution: "",
    habitat: "",
    plant_type: "",
    herbal_benefits: "",
    kingdom: "",
    order: "",
    family: "",
    genus: "",
  });

  // ------------------- FETCH PLANTS -------------------
  const fetchPlants = async () => {
  try {
    let token = accessToken;

    const sendRequest = async () =>
      await fetch("http://127.0.0.1:8000/api/get_plants/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    let response = await sendRequest();

    // Auto-refresh if token expired
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        token = newToken;
        response = await sendRequest();
      } else {
        toast.error("Session expired. Please log in again.", {
          position: "top-center",
        });
        return;
      }
    }

    const data = await response.json();

    if (response.ok) {
      const formattedPlants = data.map((plant: any) => ({
        ...plant,
        displayImage:
          plant.images && plant.images.length > 0
            ? plant.images[0]
            : "/placeholder.png",
      }));

      setPlants(formattedPlants);
    } else {
      console.error("Failed to fetch plants:", data);
      toast.error("Failed to load plants", { position: "top-center" });
    }
  } catch (err) {
    console.error("Error fetching plants:", err);
    toast.error("Error loading plants", { position: "top-center" });
  }
};

  useEffect(() => {
    fetchPlants();
  }, []);

  // 🔍 Filter plants based on search query
const filteredPlants = plants
  .filter((plant) => {
    if (!searchQuery.trim()) return true;
    return plant.plant_name?.toLowerCase().includes(searchQuery.toLowerCase());
  })
  .sort((a, b) => {
    switch (sortBy) {
      case "newest":
        // Sort by created_at timestamp (newest first)
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        
      case "oldest":
        // Sort by created_at timestamp (oldest first)
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        
      case "name-asc":
        // Plant Name: A to Z
        return (a.plant_name || "").localeCompare(b.plant_name || "");
        
      case "name-desc":
        // Plant Name: Z to A
        return (b.plant_name || "").localeCompare(a.plant_name || "");
        
      case "scientific-asc":
        // Scientific Name: A to Z
        return (a.scientific_name || "").localeCompare(b.scientific_name || "");
        
      case "scientific-desc":
        // Scientific Name: Z to A
        return (b.scientific_name || "").localeCompare(a.scientific_name || "");
        
      default:
        return 0;
    }
  });

  // ------------------- FORM HANDLERS -------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setPlantImages((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPlantImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ------------------- OPEN EDIT MODAL -------------------
  const handleEdit = (plant: any) => {
    setEditMode(true);
    setEditingPlantId(plant.id);
    setShowModal(true);
    
    // Populate form with plant data
    setFormData({
      plant_name: plant.plant_name || "",
      scientific_name: plant.scientific_name || "",
      common_names: Array.isArray(plant.common_names) 
        ? plant.common_names.join(", ") 
        : plant.common_names || "",
      link: plant.link || "",
      origin: plant.origin || "",
      distribution: plant.distribution || "",
      habitat: plant.habitat || "",
      plant_type: plant.plant_type || "",
      herbal_benefits: plant.herbal_benefits || "",
      kingdom: plant.kingdom || "",
      order: plant.order || "",
      family: plant.family || "",
      genus: plant.genus || "",
    });

    // Load existing images
    if (plant.images && Array.isArray(plant.images)) {
      setExistingImages(plant.images);
    } else {
      setExistingImages([]);
    }
    
    // Clear any new uploads and deleted images
    setPlantImages([]);
    setPreviewUrls([]);
    setDeletedImages([]);
  };

  // ------------------- OPEN VIEW MODAL -------------------
  const handleView = (plant: any) => {
    setViewingPlant(plant);
    setSelectedImageIndex(0);
    setShowViewModal(true);
  };

  // ------------------- RESET FORM -------------------
  const resetForm = () => {
    setFormData({
      plant_name: "",
      scientific_name: "",
      common_names: "",
      link: "",
      origin: "",
      distribution: "",
      habitat: "",
      plant_type: "",
      herbal_benefits: "",
      kingdom: "",
      order: "",
      family: "",
      genus: "",
    });
    setPlantImages([]);
    setPreviewUrls([]);
    setExistingImages([]);
    setEditMode(false);
    setEditingPlantId(null);
  };

  // Remove existing image (when clicking X button)
  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    setDeletedImages((prev) => [...prev, imageUrl]);
  };

  // ------------------- DELETE -------------------
  const handleDeletePlant = async () => {
  if (!plantToDelete) return;
  setDeleting(true);

  try {
    let token = accessToken;
    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const sendRequest = async () =>
      await fetch(`${apiUrl}/api/delete_plant/${plantToDelete.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    let response = await sendRequest();

    // Handle token refresh
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        token = newToken;
        response = await sendRequest();
      } else {
        toast.error("Session expired. Please log in again.", {
          position: "top-center",
        });
        return;
      }
    }

    if (response.ok) {
      setPlants((prev) => prev.filter((p) => p.id !== plantToDelete.id));
      setShowDeleteModal(false);
      setPlantToDelete(null);

      toast.success("Plant deleted successfully!", {
        position: "top-center",
        icon: <CheckCircle size={20} color="#fff" />,
      });
    } else {
      const text = await response.text();
      try {
        const err = JSON.parse(text);
        toast.error(err.error || "Failed to delete plant.", {
          position: "top-center",
          icon: <XCircle size={20} color="#fff" />,
        });
      } catch {
        console.error("Non-JSON error:", text);
        toast.error("Server error occurred.", {
          position: "top-center",
          icon: <XCircle size={20} color="#fff" />,
        });
      }
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Something went wrong. Try again.", {
      position: "top-center",
      icon: <XCircle size={20} color="#fff" />,
    });
  } finally {
    setDeleting(false);
  }
};

  // ------------------- SUBMIT -------------------
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    let token = accessToken;
    if (!token) {
      toast.error("No access token found. Please log in.", {
        position: "top-center",
      });
      return;
    }

    const form = new FormData();
    for (const key in formData) {
      if ((formData as any)[key]) {
        let value = (formData as any)[key];
        if (typeof value === "string") value = value.trim();
        form.append(key, value);
      }
    }
    plantImages.forEach((image) => form.append("images", image));

    if (editMode) {
      form.append("existing_images", JSON.stringify(existingImages));
      form.append("deleted_images", JSON.stringify(deletedImages));
    }

    const url = editMode
      ? `http://127.0.0.1:8000/api/update_plant/${editingPlantId}/`
      : "http://127.0.0.1:8000/api/add_plant/";

    const method = editMode ? "PATCH" : "POST";

    const sendRequest = async () =>
      await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

    let response = await sendRequest();

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        token = newToken;
        response = await sendRequest();
      } else {
        toast.error("Session expired. Please log in again.", {
          position: "top-center",
        });
        return;
      }
    }

    const data = await response.json();
    
    if (response.ok) {
      toast.success(
        editMode ? "Plant updated successfully!" : "Plant added successfully!",
        { position: "top-center" }
      );
      resetForm();
      fetchPlants();
      setShowModal(false);
    } else {
      toast.error(
        `Failed to ${editMode ? "update" : "add"} plant: ${
          data.error || "Unknown error"
        }`,
        { position: "top-center" }
      );
    }
  } catch (err) {
    console.error(`Error ${editMode ? "updating" : "submitting"} plant:`, err);
    toast.error(
      `An error occurred while ${editMode ? "updating" : "adding"} the plant.`,
      { position: "top-center" }
    );
  } finally {
    setLoading(false);
  }
};

// Close dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      setShowSortDropdown(false);
    }
  };

  if (showSortDropdown) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showSortDropdown]);

return (
      <div className="bg-transparent font-['Poppins'] text-[#2F4F2F]">
      <Toaster />
     {/* Search, Add Button, and Filter - New Layout */}
<div className="flex justify-between items-center gap-4 px-10 py-6">
  
  {/* Left Side - Search */}
  <div className="flex items-center bg-white border border-[#D5E0CF] rounded-lg px-3 py-2 shadow-sm w-80">
    <Search size={18} className="text-gray-500" />
    <input
      type="text"
      placeholder="Search by plant name..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="bg-transparent outline-none text-sm w-full pl-2 text-[#2F4F2F]"
    />
    {searchQuery && (
      <button
        onClick={() => setSearchQuery("")}
        className="text-gray-400 hover:text-gray-600 ml-1"
      >
        <XCircle size={16} />
      </button>
    )}
  </div>

  {/* Right Side - Add Button + Filter */}
  <div className="flex items-center gap-3">
    
    {/* Add New Plant Button */}
    <button
      onClick={() => {
        resetForm();
        setShowModal(true);
      }}
      className="flex items-center gap-2 bg-[#C9E4C5] hover:bg-[#b4d9ae] text-[#2F4F2F] font-medium px-4 py-2 rounded-lg shadow-sm transition"
    >
      <Plus size={18} /> Add New Plant
    </button>


{/* Filter Dropdown */}
<div className="relative">
  <button
    onClick={() => setShowSortDropdown(!showSortDropdown)}
    className="flex items-center gap-2 bg-[#a8c496] hover:bg-[#99b887] text-[#2F4F2F] font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
  >
    Filter
    {/* Filter Funnel Icon */}
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  </button>


      {/* Dropdown Menu */}
      {showSortDropdown && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 w-64 z-50">
          
          {/* Newest First */}
          <button
            onClick={() => {
              setSortBy("newest");
              setShowSortDropdown(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-[#E7EED9] transition flex items-center gap-3 rounded-t-lg ${
              sortBy === "newest" ? "bg-[#E7EED9] font-semibold" : ""
            }`}
          >
            {sortBy === "newest" && (
              <svg className="w-5 h-5 text-[#579755]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {sortBy !== "newest" && <span className="w-5"></span>}
            Newest First
          </button>

          {/* Oldest First */}
          <button
            onClick={() => {
              setSortBy("oldest");
              setShowSortDropdown(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-[#E7EED9] transition flex items-center gap-3 ${
              sortBy === "oldest" ? "bg-[#E7EED9] font-semibold" : ""
            }`}
          >
            {sortBy === "oldest" && (
              <svg className="w-5 h-5 text-[#579755]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {sortBy !== "oldest" && <span className="w-5"></span>}
            Oldest First
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Plant Name: A to Z */}
          <button
            onClick={() => {
              setSortBy("name-asc");
              setShowSortDropdown(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-[#E7EED9] transition flex items-center gap-3 ${
              sortBy === "name-asc" ? "bg-[#E7EED9] font-semibold" : ""
            }`}
          >
            {sortBy === "name-asc" && (
              <svg className="w-5 h-5 text-[#579755]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {sortBy !== "name-asc" && <span className="w-5"></span>}
            Plant Name: A to Z
          </button>

          {/* Plant Name: Z to A */}
          <button
            onClick={() => {
              setSortBy("name-desc");
              setShowSortDropdown(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-[#E7EED9] transition flex items-center gap-3 ${
              sortBy === "name-desc" ? "bg-[#E7EED9] font-semibold" : ""
            }`}
          >
            {sortBy === "name-desc" && (
              <svg className="w-5 h-5 text-[#579755]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {sortBy !== "name-desc" && <span className="w-5"></span>}
            Plant Name: Z to A
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Scientific Name: A to Z */}
          <button
            onClick={() => {
              setSortBy("scientific-asc");
              setShowSortDropdown(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-[#E7EED9] transition flex items-center gap-3 ${
              sortBy === "scientific-asc" ? "bg-[#E7EED9] font-semibold" : ""
            }`}
          >
            {sortBy === "scientific-asc" && (
              <svg className="w-5 h-5 text-[#579755]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {sortBy !== "scientific-asc" && <span className="w-5"></span>}
            Scientific Name: A to Z
          </button>

          {/* Scientific Name: Z to A */}
          <button
            onClick={() => {
              setSortBy("scientific-desc");
              setShowSortDropdown(false);
            }}
            className={`w-full text-left px-4 py-3 hover:bg-[#E7EED9] transition flex items-center gap-3 rounded-b-lg ${
              sortBy === "scientific-desc" ? "bg-[#E7EED9] font-semibold" : ""
            }`}
          >
            {sortBy === "scientific-desc" && (
              <svg className="w-5 h-5 text-[#579755]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {sortBy !== "scientific-desc" && <span className="w-5"></span>}
            Scientific Name: Z to A
          </button>

        </div>
      )}
    </div>

  </div>
</div>



        {/* Search results count */}
        {searchQuery && (
          <div className="px-10 pb-4">
            <p className="text-sm text-gray-600">
              Found <span className="font-semibold">{filteredPlants.length}</span> plant{filteredPlants.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          </div>
        )}

      {/* Plant Cards */}
      <div className="px-10 pb-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredPlants.length > 0 ? (
          filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-[#E1E8DD] overflow-hidden"
          >
            <div className="h-40 w-full">
              <img
                  src={plant.displayImage || "https://via.placeholder.com/150"}
                  alt={plant.plant_name}
                  className="w-full h-full object-cover"
                />
            </div>

           <div className="text-center py-3 px-2">
            <h2 className="text-sm font-semibold">{plant.plant_name}</h2>
            <p className="text-gray-600 text-xs italic">
              {plant.scientific_name || "No scientific name available"}
            </p>

            </div>
            <div className="flex justify-center gap-3 pb-4">
              <button 
                onClick={() => handleEdit(plant)}
                className="bg-[#E7EED9] hover:bg-[#DCE7D3] text-[#2F4F2F] p-2 rounded-md transition shadow-sm">
                <Edit size={18} />
              </button>
              <button
                onClick={() => {
                  setPlantToDelete(plant);
                  setShowDeleteModal(true);
                }}
                className="bg-[#F7E2E0] hover:bg-[#F5D0CC] text-[#2F4F2F] p-2 rounded-md transition shadow-sm"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={() => handleView(plant)}
                className="bg-[#E7EED9] hover:bg-[#DCE7D3] text-[#2F4F2F] p-2 rounded-md transition shadow-sm">
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-16">
          <Leaf size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-lg">
            {searchQuery ? `No plants found matching "${searchQuery}"` : "No plants available"}
          </p>
        </div>
      )}
    </div>

      {/* Add/Edit Plant Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#F4F8ED] w-[92%] max-w-6xl rounded-2xl shadow-xl p-10 relative overflow-y-auto max-h-[85vh] border border-[#DDE5D2]">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="absolute top-4 right-5 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-3xl font-semibold text-[#3B5B3B] mb-8 tracking-wide flex items-center gap-2">
              <Sprout size={26} className="text-[#579755]" /> 
              {editMode ? "Edit Plant" : "Add New Plant"}
            </h2>

            {/* Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Row 1 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <TreePalm size={16} /> Plant Name
                  </label>
                  <input
                    name="plant_name"
                    value={formData.plant_name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter plant name"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <FlaskConical size={16} /> Scientific Name
                  </label>
                  <input
                    name="scientific_name"
                    value={formData.scientific_name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter scientific name"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <Trees size={16} /> Common Names
                  </label>
                  <input
                    name="common_names"
                    value={formData.common_names}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter common names (comma-separated)"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <Link2 size={16} /> Link
                  </label>
                  <input
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter reference link"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <Globe2 size={16} /> Origin
                  </label>
                  <input
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter origin"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <MapPin size={16} /> Distribution
                  </label>
                  <input
                    name="distribution"
                    value={formData.distribution}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter distribution"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <BookOpenText size={16} /> Habitat
                  </label>
                  <input
                    name="habitat"
                    value={formData.habitat}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter habitat"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <Leaf size={16} /> Plant Type
                  </label>
                  <input
                    name="plant_type"
                    value={formData.plant_type}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter plant type"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                    <BookOpenText size={16} /> Herbal Benefits
                  </label>
                  <input
                    name="herbal_benefits"
                    value={formData.herbal_benefits}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter herbal benefits"
                    className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                  />
                </div>
              </div>

              {/* Taxonomy */}
              <div>
                <h3 className="text-lg font-semibold text-[#3B5B3B] mb-3 mt-4 flex items-center gap-2">
                  <Layers size={18} className="text-[#579755]" /> Taxonomic Classification
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {["kingdom", "order", "family", "genus"].map((field) => (
                    <div key={field} className="flex flex-col">
                      <label className="text-[#3B5B3B] font-semibold mb-1 capitalize">
                        {field}
                      </label>
                      <input
                        name={field}
                        value={(formData as any)[field]}
                        onChange={handleChange}
                        type="text"
                        placeholder={`Enter ${field}`}
                        className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 🌿 Plant Images Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#3B5B3B] mb-3 flex items-center gap-2">
                  <ImagePlus size={18} className="text-[#579755]" /> Plant Images
                </h3>

                {/* Combined Existing + New Images Preview */}
                {(existingImages.length > 0 || previewUrls.length > 0) && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {/* Existing Images */}
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`Existing ${index}`}
                          className="w-28 h-28 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(url)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* New Uploaded Images */}
                    {previewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`New ${index}`}
                          className="w-28 h-28 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Input */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#A3B18A] rounded-lg p-5 cursor-pointer hover:bg-[#DDE5B6]/30 transition relative">
                  <ImagePlus size={28} className="text-[#579755] mb-1" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag & drop
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#579755] hover:bg-[#467945] text-white font-medium py-3 px-8 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : editMode ? "Update Plant" : "Save Plant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
   
      {/* Delete Confirmation Modal */}
      {showDeleteModal && plantToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[460px] rounded-2xl shadow-2xl p-6 relative text-center">
            {/* Trash icon */}
            <div className="mx-auto mb-2 w-14 h-14 flex items-center justify-center rounded-full bg-[#dc2626]/15">
              <Trash2 size={30} className="text-[#dc2626]" />
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Delete Plant</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {plantToDelete.plant_name}
              </span>
              ?<br />
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlant}
                disabled={deleting}
                className="px-5 py-2 rounded-lg bg-[#dc2626] text-white hover:bg-[#b91c1c] transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

 {/* View Plant Details Modal */}
{showViewModal && viewingPlant && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white w-[95%] max-w-5xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[87vh] flex flex-col">
      
      {/* Close Button */}
      <button
        onClick={() => setShowViewModal(false)}
        className="absolute top-5 right-5 z-10 text-gray-800 hover:text-gray-500 transition"
      >
        <XCircle size={30} />
      </button>

      {/* Header */}
      <div className="bg-[#a8c496] px-8 py-5">
        <h2 className="text-2xl font-semibold text-[#2F4F2F] flex items-center gap-3">
          <Leaf size={26} />
          Plant Details
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto flex-1 p-8">
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Left Column - Images */}
          <div className="md:col-span-1">
            <div className="space-y-3 sticky top-0">
              
              {/* Main Image */}
              <div className="overflow-hidden shadow-md rounded-2xl">
                <img
                  src={
                    (viewingPlant.images && viewingPlant.images.length > 0)
                      ? viewingPlant.images[selectedImageIndex]
                      : viewingPlant.image || "https://via.placeholder.com/300"
                  }
                  alt={viewingPlant.plant_name}
                  className="w-full h-60 object-cover rounded-2xl"
                />
              </div>

              {/* Additional Images */}
              {viewingPlant.images && viewingPlant.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                 {viewingPlant.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`overflow-hidden rounded-xl shadow-sm transition ${
                        selectedImageIndex === idx
                          ? 'ring-2 ring-[#a8c496]'
                          : 'opacity-90 hover:opacity-75'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${viewingPlant.plant_name} ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-xl"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="md:col-span-2 space-y-5">
            
            {/* Plant Name Section */}
            <div className="bg-[#f5f9f4] text-[#2F4F2F] py-4 px-6 rounded-2xl shadow-md">
              <h3 className="text-2xl font-bold mb-1">{viewingPlant.plant_name}</h3>
              <p className="text-lg italic font-light">{viewingPlant.scientific_name}</p>
            </div>

            {/* Common Names */}
            {viewingPlant.common_names && (
              <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                  <Trees size={18} className="text-[#6B9F6A]" /> Common Names
                </h4>
                <p className="text-base text-gray-700">
                  {Array.isArray(viewingPlant.common_names)
                    ? viewingPlant.common_names.join(", ")
                    : viewingPlant.common_names}
                </p>
              </div>
            )}

            {/* Scientific Classification */}
            {(viewingPlant.kingdom || viewingPlant.order || viewingPlant.family || viewingPlant.genus) && (
              <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                <h4 className="text-base font-bold text-[#2F4F2F] mb-3 flex items-center gap-2">
                  <FlaskConical size={18} className="text-[#6B9F6A]" /> Scientific Classification
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center text-base">
                  {viewingPlant.kingdom && (
                    <div>
                      <p className="font-semibold text-[#2F4F2F] mb-1">Kingdom</p>
                      <p className="text-gray-700">{viewingPlant.kingdom}</p>
                    </div>
                  )}
                  {viewingPlant.order && (
                    <div>
                      <p className="font-semibold text-[#2F4F2F] mb-1">Order</p>
                      <p className="text-gray-700">{viewingPlant.order}</p>
                    </div>
                  )}
                  {viewingPlant.family && (
                    <div>
                      <p className="font-semibold text-[#2F4F2F] mb-1">Family</p>
                      <p className="text-gray-700">{viewingPlant.family}</p>
                    </div>
                  )}
                  {viewingPlant.genus && (
                    <div>
                      <p className="font-semibold text-[#2F4F2F] mb-1">Genus</p>
                      <p className="text-gray-700">{viewingPlant.genus}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Origin */}
            {viewingPlant.origin && (
              <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                  <Globe2 size={18} className="text-[#6B9F6A]" /> Origin
                </h4>
                <p className="text-base text-gray-700">{viewingPlant.origin}</p>
              </div>
            )}

            {/* Distribution */}
            {viewingPlant.distribution && (
              <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-[#6B9F6A]" /> Distribution
                </h4>
                <p className="text-base text-gray-700">{viewingPlant.distribution}</p>
              </div>
            )}

            {/* Herbal Benefits */}
            {viewingPlant.herbal_benefits && (
              <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                  <Sprout size={18} className="text-[#6B9F6A]" /> Herbal Benefits
                </h4>
                <p className="text-base text-gray-700 leading-relaxed">{viewingPlant.herbal_benefits}</p>
              </div>
            )}

            {/* Reference Link */}
            {viewingPlant.link && (
              <div className="pt-2">
                <a
                  href={viewingPlant.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#6B9F6A] hover:text-[#5A8859] font-semibold text-base transition"
                >
                  <Link2 size={18} />
                  View Reference Link
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}



    </div>
  );
}