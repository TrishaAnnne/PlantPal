
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Search, Leaf, Globe2, MapPin, BookOpenText, XCircle,
  Link2, Trees, ImagePlus, Sprout, TreePalm, FlaskConical, Layers, CheckCircle,
  AlertCircle, X, Edit2, ExternalLink } from "lucide-react";

import { toast, Toaster } from "react-hot-toast"
import { useAuth } from "../contexts/AuthContext"

export default function PlantDatabase() {
  const { accessToken, refreshAccessToken } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingPlantId, setEditingPlantId] = useState<number | null>(null)
  const [activeModalSection, setActiveModalSection] = useState<"plant-info" | "ailments">("plant-info")
  const [plantImages, setPlantImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [deletedImages, setDeletedImages] = useState<string[]>([])
  const [plantToDelete, setPlantToDelete] = useState<any | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingPlant, setViewingPlant] = useState<any | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [plants, setPlants] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([])
  const [selectedAilments, setSelectedAilments] = useState<
    { ailment: string; reference?: string; herbalBenefit?: string }[]
  >([])
  const [editingAilment, setEditingAilment] = useState<string | null>(null)
  const [tempReference, setTempReference] = useState("")
  const [tempHerbalBenefit, setTempHerbalBenefit] = useState("")
  const [initialFormData, setInitialFormData] = useState<any>(null)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    plant_name: "",
    scientific_name: "",
    common_names: "",
    link: "",
    origin: "",
    distribution: "",
    habitat: "",
    diseaseTypeUse: "",
    plant_type: "",
    herbal_benefits: "",
    kingdom: "",
    order: "",
    family: "",
    genus: "",
    ailment: [] as string[],
  })

  const ailmentOptions: Record<string, string[]> = {
    Digestive: ["Constipation", "Ulcer", "Diarrhea", "Indigestion", "Laxative", "Nausea", "Stomachache"],
    Skin: ["Cuts", "Wound", "Boils", "Rashes", "Eczema", "Animal Bites", "Insect Bites", "Acne", "Burns"],
    Respiratory: ["Cough", "Cold", "Asthma", "Flu", "Sore throat", "Bronchitis"],
    Immunity: ["Fever", "Allergy", "Hair loss", "Antioxidant", "Fatigue"],
    Reproductive: ["Dysmenorrhea", "Pregnancy", "Aphrodisiac", "Infertility"],
    Parasitic: ["Ringworm", "Amoebiasis", "Anti-parasitic", "Malaria"],
    Nervous: ["Headache", "Migraine", "Anxiety", "Insomnia", "Epilepsy", "Nervous Tension"],
    Excretory: ["Kidney Stones", "Urinary Tract Infection", "Diuretic", "Bladder Infection"],
    Eye: ["Eye Infection", "Conjunctivitis", "Sore Eyes", "Vision Problems"],
    Musculoskeletal: ["Arthritis", "Rheumatism", "Joint Pain", "Back Pain", "Muscle Cramps"],
    Inflammations: ["Swelling", "Pain Relief", "Anti-inflammatory", "Inflammation"],
    Oral: ["Toothache", "Gum Disease", "Mouth Ulcer", "Sore Throat"],
    Circulatory: ["Hypertension", "High Cholesterol", "Anemia", "Hematoma"],
  }

  // ✅ Extended disease types for tag badges
  const diseaseTypes = [
    { name: "Circulatory", color: "bg-red-100 text-red-700 border-red-300" },
    { name: "Digestive", color: "bg-green-100 text-green-700 border-green-300" },
    { name: "Excretory", color: "bg-teal-100 text-teal-700 border-teal-300" },
    { name: "Eye", color: "bg-cyan-100 text-cyan-700 border-cyan-300" },
    { name: "Immunity", color: "bg-purple-100 text-purple-700 border-purple-300" },
    { name: "Inflammations", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    { name: "Insect bites", color: "bg-lime-100 text-lime-700 border-lime-300" },
    { name: "Musculoskeletal", color: "bg-amber-100 text-amber-700 border-amber-300" },
    { name: "Nervous", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
    { name: "Oral", color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300" },
    { name: "Parasitic", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
    { name: "Reproductive", color: "bg-rose-100 text-rose-700 border-rose-300" },
    { name: "Respiratory", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { name: "Skin", color: "bg-pink-100 text-pink-700 border-pink-300" },
  ]

  const hasUnsavedChanges = (): boolean => {
    if (!initialFormData) return false

    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData.formData)
    const imagesChanged = plantImages.length > 0 || deletedImages.length > 0
    const ailmentsChanged = JSON.stringify(selectedAilments) !== JSON.stringify(initialFormData.selectedAilments)
    const diseasesChanged = JSON.stringify(selectedDiseases) !== JSON.stringify(initialFormData.selectedDiseases)

    return formChanged || imagesChanged || ailmentsChanged || diseasesChanged
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    const toastErrors: string[] = []

    if (!formData.plant_name.trim()) {
      errors["plant_name"] = "Plant name is required"
      toastErrors.push("Plant name is required")
    }
    if (!formData.scientific_name.trim()) {
      errors["scientific_name"] = "Scientific name is required"
      toastErrors.push("Scientific name is required")
    }

    const hasExistingImages = existingImages.length > 0
    const hasNewImages = plantImages.length > 0
    if (!hasExistingImages && !hasNewImages) {
      errors["images"] = "At least one plant image is required"
      toastErrors.push("At least one plant image is required")
    }

    // Check disease types
    if (selectedDiseases.length === 0) {
      errors["diseases"] = "At least one disease type must be selected"
      toastErrors.push("At least one disease type must be selected")
    }

    // Check ailments
    if (selectedAilments.length === 0) {
      errors["ailments"] = "At least one ailment must be selected"
      toastErrors.push("At least one ailment must be selected")
    }

    // Check if all ailments have reference and herbal benefit
    const incompleteAilments = selectedAilments.filter((a) => !a.reference?.trim() || !a.herbalBenefit?.trim())
    if (incompleteAilments.length > 0) {
      errors["ailmentDetails"] = "All ailments must have both a reference link and herbal benefit"
      toastErrors.push("All ailments must have both a reference link and herbal benefit")
    }

    setFieldErrors(errors)

    if (toastErrors.length > 0) {
      toastErrors.forEach((error) => {
        toast.error(error, { position: "top-center" })
      })
      return false
    }

    return true
  }

  const checkDuplicatePlantName = (): boolean => {
    const currentName = formData.plant_name.trim().toLowerCase()

    // When editing, exclude the current plant from the check
    const plantsToCheck = editMode ? plants.filter((p) => p.id !== editingPlantId) : plants

    const isDuplicate = plantsToCheck.some((p) => p.plant_name.toLowerCase() === currentName)

    if (isDuplicate) {
      toast.error(`A plant with the name "${formData.plant_name}" already exists`, {
        position: "top-center",
      })
      return false
    }

    return true
  }

  // ------------------- FETCH PLANTS -------------------
  const fetchPlants = async () => {
    try {
      let token = accessToken

      const sendRequest = async () =>
        await fetch("http://127.0.0.1:8000/api/get_plants/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

      let response = await sendRequest()

      // Auto-refresh if token expired
      if (response.status === 401) {
        const newToken = await refreshAccessToken()
        if (newToken) {
          token = newToken
          response = await sendRequest()
        } else {
          toast.error("Session expired. Please log in again.", {
            position: "top-center",
          })
          return
        }
      }

      const data = await response.json()

      if (response.ok) {
        const formattedPlants = data.map((plant: any) => ({
          ...plant,
          displayImage: plant.images && plant.images.length > 0 ? plant.images[0] : "/placeholder.png",
        }))

        setPlants(formattedPlants)
      } else {
        console.error("Failed to fetch plants:", data)
        toast.error("Failed to load plants", { position: "top-center" })
      }
    } catch (err) {
      console.error("Error fetching plants:", err)
      toast.error("Error loading plants", { position: "top-center" })
    }
  }

  useEffect(() => {
    fetchPlants()
  }, [])

  // 🔍 Filter plants based on search query
  const filteredPlants = plants
    .filter((plant) => {
      if (!searchQuery.trim()) return true
      return plant.plant_name?.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case "oldest":
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        case "name-asc":
          return (a.plant_name || "").localeCompare(b.plant_name || "")
        case "name-desc":
          return (b.plant_name || "").localeCompare(a.plant_name || "")
        case "scientific-asc":
          return (a.scientific_name || "").localeCompare(b.scientific_name || "")
        case "scientific-desc":
          return (b.scientific_name || "").localeCompare(a.scientific_name || "")
        default:
          return 0
      }
    })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setPlantImages((prev) => [...prev, ...newFiles])
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setPlantImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleDisease = (disease: string) => {
    if (selectedDiseases.includes(disease)) {
      const diseaseAilments = ailmentOptions[disease] || []
      setSelectedAilments(selectedAilments.filter((item) => !diseaseAilments.includes(item.ailment)))
      setSelectedDiseases(selectedDiseases.filter((d) => d !== disease))
    } else {
      setSelectedDiseases([...selectedDiseases, disease])
    }
  }

  const addAilment = (ailment: string) => {
    const exists = selectedAilments.find((item) => item.ailment === ailment)
    if (!exists) {
      setSelectedAilments([...selectedAilments, { ailment, reference: "", herbalBenefit: "" }])
      setEditingAilment(ailment)
      setTempReference("")
      setTempHerbalBenefit("")
    }
  }

  const removeAilment = (ailment: string) => {
    setSelectedAilments(selectedAilments.filter((item) => item.ailment !== ailment))
  }

  const startEditAilment = (ailment: string, reference?: string, herbalBenefit?: string) => {
    setEditingAilment(ailment)
    setTempReference(reference || "")
    setTempHerbalBenefit(herbalBenefit || "")
  }

  const saveAilment = () => {
    if (editingAilment) {
      setSelectedAilments(
        selectedAilments.map((item) =>
          item.ailment === editingAilment
            ? { ...item, reference: tempReference, herbalBenefit: tempHerbalBenefit }
            : item,
        ),
      )
      setEditingAilment(null)
      setTempReference("")
      setTempHerbalBenefit("")
    }
  }

  const getDiseaseColor = (name: string) => {
    return diseaseTypes.find((d) => d.name === name)?.color || "bg-gray-100 text-gray-700"
  }

  const getAilmentDiseaseType = (ailment: string): string | null => {
    for (const [disease, ailments] of Object.entries(ailmentOptions)) {
      if (ailments.includes(ailment)) {
        return disease
      }
    }
    return null
  }

  // ------------------- OPEN EDIT MODAL -------------------
  const handleEdit = (plant: any) => {
    setEditMode(true)
    setEditingPlantId(plant.id)
    setShowModal(true)

    setFormData({
      plant_name: plant.plant_name || "",
      scientific_name: plant.scientific_name || "",
      common_names: Array.isArray(plant.common_names) ? plant.common_names.join(", ") : plant.common_names || "",
      link: plant.link || "",
      origin: plant.origin || "",
      distribution: plant.distribution || "",
      habitat: plant.habitat || "",
      diseaseTypeUse: plant.diseaseTypeUse || "",
      ailment: Array.isArray(plant.ailment) ? plant.ailment : [],
      plant_type: plant.plant_type || "",
      herbal_benefits: plant.herbal_benefits || "",
      kingdom: plant.kingdom || "",
      order: plant.order || "",
      family: plant.family || "",
      genus: plant.genus || "",
    })

    let diseaseTypesFromAilments: string[] = []
    let ailmentsData: { ailment: string; reference?: string; herbalBenefit?: string }[] = []

    if (plant.ailmentsList && Array.isArray(plant.ailmentsList) && plant.ailmentsList.length > 0) {
      // Extract unique disease types from ailments
      diseaseTypesFromAilments = Array.from(
        new Set(plant.ailmentsList.map((a: any) => a.disease_type).filter(Boolean)),
      ) as string[]

      // Map ailments to the format expected by selectedAilments
      ailmentsData = plant.ailmentsList.map((a: any) => ({
        ailment: a.ailment,
        reference: a.reference || "",
        herbalBenefit: a.herbal_benefit || "",
      }))

      setSelectedAilments(ailmentsData)
    } else {
      setSelectedDiseases([])
      setSelectedAilments([])
    }
    setSelectedDiseases(diseaseTypesFromAilments)

    if (plant.images && Array.isArray(plant.images)) {
      setExistingImages(plant.images)
    } else {
      setExistingImages([])
    }

    setPlantImages([])
    setPreviewUrls([])
    setDeletedImages([])

    setInitialFormData({
      formData: {
        plant_name: plant.plant_name || "",
        scientific_name: plant.scientific_name || "",
        common_names: Array.isArray(plant.common_names) ? plant.common_names.join(", ") : plant.common_names || "",
        link: plant.link || "",
        origin: plant.origin || "",
        distribution: plant.distribution || "",
        habitat: plant.habitat || "",
        diseaseTypeUse: plant.diseaseTypeUse || "",
        ailment: Array.isArray(plant.ailment) ? plant.ailment : [],
        plant_type: plant.plant_type || "",
        herbal_benefits: plant.herbal_benefits || "",
        kingdom: plant.kingdom || "",
        order: plant.order || "",
        family: plant.family || "",
        genus: plant.genus || "",
      },
      selectedDiseases: diseaseTypesFromAilments || [],
      selectedAilments: ailmentsData || [],
    })
  }

  // ------------------- OPEN VIEW MODAL -------------------
  const handleView = (plant: any) => {
    setViewingPlant(plant)
    setSelectedImageIndex(0)
    setShowViewModal(true)
  }

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
      diseaseTypeUse: "",
      plant_type: "",
      herbal_benefits: "",
      kingdom: "",
      order: "",
      family: "",
      genus: "",
      ailment: [],
    })
    setPlantImages([])
    setPreviewUrls([])
    setExistingImages([])
    setSelectedDiseases([])
    setSelectedAilments([])
    setEditingAilment(null)
    setTempReference("")
    setTempHerbalBenefit("")
    setEditMode(false)
    setEditingPlantId(null)
    setActiveModalSection("plant-info")
    setInitialFormData(null)
    setFieldErrors({})
  }

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl))
    setDeletedImages((prev) => [...prev, imageUrl])
  }

  const handleCloseModal = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardConfirm(true)
    } else {
      setShowModal(false)
      resetForm()
    }
  }

  // ------------------- DELETE -------------------
  const handleDeletePlant = async () => {
    if (!plantToDelete) return
    setDeleting(true)

    try {
      let token = accessToken
      const apiUrl = "http://127.0.0.1:8000"

      const sendRequest = async () =>
        await fetch(`${apiUrl}/api/delete_plant/${plantToDelete.id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

      let response = await sendRequest()

      if (response.status === 401) {
        const newToken = await refreshAccessToken()
        if (newToken) {
          token = newToken
          response = await sendRequest()
        } else {
          toast.error("Session expired. Please log in again.", {
            position: "top-center",
          })
          return
        }
      }

      if (response.ok) {
        setPlants((prev) => prev.filter((p) => p.id !== plantToDelete.id))
        setShowDeleteModal(false)
        setPlantToDelete(null)

        toast.success("Plant deleted successfully!", {
          position: "top-center",
          icon: <CheckCircle size={20} color="#FF4C4C" />,
        })
      } else {
        const text = await response.text()
        try {
          const err = JSON.parse(text)
          toast.error(err.error || "Failed to delete plant.", {
            position: "top-center",
            icon: <XCircle size={20} color="#FF4C4C" />,
          })
        } catch {
          console.error("Non-JSON error:", text)
          toast.error("Server error occurred.", {
            position: "top-center",
            icon: <XCircle size={20} color="#FF4C4C" />,
          })
        }
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Something went wrong. Try again.", {
        position: "top-center",
        icon: <XCircle size={20} color="#FF4C4C" />,
      })
    } finally {
      setDeleting(false)
    }
  }

  // ------------------- SUBMIT -------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!checkDuplicatePlantName()) {
      return
    }

    setLoading(true)

    try {
      let token = accessToken
      if (!token) {
        toast.error("No access token found. Please log in.", {
          position: "top-center",
        })
        return
      }

      const form = new FormData()
      for (const key in formData) {
        if ((formData as any)[key]) {
          let value = (formData as any)[key]
          if (typeof value === "string") value = value.trim()
          form.append(key, value)
        }
      }
      plantImages.forEach((image) => form.append("images", image))

      if (selectedAilments.length > 0) {
        const ailmentsWithDiseaseType = selectedAilments.map((ailment) => ({
          ailment: ailment.ailment,
          reference: ailment.reference || "",
          herbalBenefit: ailment.herbalBenefit || "",
          diseaseType: getAilmentDiseaseType(ailment.ailment) || "",
        }))
        form.append("ailments", JSON.stringify(ailmentsWithDiseaseType))
      }

      if (editMode) {
        form.append("existing_images", JSON.stringify(existingImages))
        form.append("deleted_images", JSON.stringify(deletedImages))
      }

      const url = editMode
        ? `http://127.0.0.1:8000/api/update_plant/${editingPlantId}/`
        : "http://127.0.0.1:8000/api/add_plant/"

      const method = editMode ? "PATCH" : "POST"

      const sendRequest = async () =>
        await fetch(url, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        })

      let response = await sendRequest()

      if (response.status === 401) {
        const newToken = await refreshAccessToken()
        if (newToken) {
          token = newToken
          response = await sendRequest()
        } else {
          toast.error("Session expired. Please log in again.", {
            position: "top-center",
          })
          return
        }
      }

      const data = await response.json()

      if (response.ok) {
        toast.success(editMode ? "Plant updated successfully!" : "Plant added successfully!", {
          position: "top-center",
        })
        resetForm()
        fetchPlants()
        setShowModal(false)
      } else {
        toast.error(`Failed to ${editMode ? "update" : "add"} plant: ${data.error || "Unknown error"}`, {
          position: "top-center",
        })
      }
    } catch (err) {
      console.error(`Error ${editMode ? "updating" : "submitting"} plant:`, err)
      toast.error(`An error occurred while ${editMode ? "updating" : "adding"} the plant.`, {
        position: "top-center",
      })
    } finally {
      setLoading(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".relative")) {
        setShowSortDropdown(false)
      }
    }

    if (showSortDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showSortDropdown])

  return (
    <div className="bg-transparent font-['Poppins'] text-[#2F4F2F]">
      <Toaster />

      {/* Search, Add Button, and Filter */}
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
            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 ml-1">
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Right Side - Add Button + Filter */}
        <div className="flex items-center gap-3">
          {/* Add New Plant Button */}
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
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
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showSortDropdown ? "rotate-180" : ""}`}
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
                {[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "name-asc", label: "Plant Name: A to Z" },
                  { value: "name-desc", label: "Plant Name: Z to A" },
                  { value: "scientific-asc", label: "Scientific Name: A to Z" },
                  { value: "scientific-desc", label: "Scientific Name: Z to A" },
                ].map((option, idx, arr) => (
                  <div key={option.value}>
                    {idx === 2 || idx === 4 ? <div className="border-t border-gray-200 my-1"></div> : null}
                    <button
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-[#E7EED9] transition flex items-center gap-3 ${
                        idx === 0 ? "rounded-t-lg" : ""
                      } ${idx === arr.length - 1 ? "rounded-b-lg" : ""} ${
                        sortBy === option.value ? "bg-[#E7EED9] font-semibold" : ""
                      }`}
                    >
                      {sortBy === option.value && (
                        <svg className="w-5 h-5 text-[#579755]" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {sortBy !== option.value && <span className="w-5"></span>}
                      {option.label}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search results count */}
      {searchQuery && (
        <div className="px-10 pb-4">
          <p className="text-sm text-gray-600">
            Found <span className="font-semibold">{filteredPlants.length}</span> plant
            {filteredPlants.length !== 1 ? "s" : ""} matching "{searchQuery}"
          </p>
        </div>
      )}

     
      {/* Plant Cards */}
    <div className="px-10 pb-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filteredPlants.length > 0 ? (
        filteredPlants.map((plant, index) => (
          <div
            key={plant.id}
            className={`rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-[#E1E8DD] overflow-hidden
              ${index % 2 === 0 ? "bg-yellow-200" : "bg-violet-300"}
            `}
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
                className="bg-[#E7EED9] hover:bg-[#DCE7D3] text-[#2F4F2F] p-2 rounded-md transition shadow-sm"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={() => {
                  setPlantToDelete(plant)
                  setShowDeleteModal(true)
                }}
                className="bg-[#F7E2E0] hover:bg-[#F5D0CC] text-[#2F4F2F] p-2 rounded-md transition shadow-sm"
              >
                <Trash2 size={18} />
              </button>

              <button
                onClick={() => handleView(plant)}
                className="bg-[#E7EED9] hover:bg-[#DCE7D3] text-[#2F4F2F] p-2 rounded-md transition shadow-sm"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
    ))
  ) : (
    <div className="col-span-full text-center py-16">
      <Leaf size={48} className="mx-auto text-gray-300 mb-3" />
      <p className="text-gray-500 text-lg">
        {searchQuery
          ? `No plants found matching "${searchQuery}"`
          : "No plants available"}
      </p>
    </div>
  )}
</div>


      {/* Add/Edit Plant Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F4F8ED] w-[92%] max-w-6xl rounded-2xl shadow-xl p-10 relative overflow-hidden max-h-[85vh] border border-[#DDE5D2] flex flex-col">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-5 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-3xl font-semibold text-[#3B5B3B] mb-6 tracking-wide flex items-center gap-2">
              <Sprout size={26} className="text-[#579755]" />
              {editMode ? "Edit Plant" : "Add New Plant"}
            </h2>

            <div className="flex gap-4 mb-6 border-b border-[#DDE5D2]">
              <button
                onClick={() => setActiveModalSection("plant-info")}
                className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeModalSection === "plant-info"
                    ? "text-[#579755] border-[#579755]"
                    : "text-gray-600 border-transparent hover:text-[#3B5B3B]"
                }`}
              >
                Plant Information
              </button>
              <button
                onClick={() => setActiveModalSection("ailments")}
                className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeModalSection === "ailments"
                    ? "text-[#579755] border-[#579755]"
                    : "text-gray-600 border-transparent hover:text-[#3B5B3B]"
                }`}
              >
                Disease Types & Ailments
              </button>
            </div>

            {/* Form */}
            <form className="space-y-8 overflow-y-auto flex-1" onSubmit={handleSubmit}>
              {activeModalSection === "plant-info" && (
                <div className="space-y-8">
                  {/* Row 1: Plant Name & Scientific Name */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                        <TreePalm size={16} /> Plant Name
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="plant_name"
                        value={formData.plant_name}
                        onChange={handleChange}
                        type="text"
                        placeholder="Enter plant name"
                        className={`p-2.5 border rounded-lg focus:ring-2 focus:outline-none ${
                          fieldErrors["plant_name"]
                            ? "border-red-500 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:ring-[#579755]"
                        }`}
                      />
                      {fieldErrors["plant_name"] && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle size={14} /> {fieldErrors["plant_name"]}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-1">
                        <FlaskConical size={16} /> Scientific Name
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="scientific_name"
                        value={formData.scientific_name}
                        onChange={handleChange}
                        type="text"
                        placeholder="Enter scientific name"
                        className={`p-2.5 border rounded-lg focus:ring-2 focus:outline-none ${
                          fieldErrors["scientific_name"]
                            ? "border-red-500 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:ring-[#579755]"
                        }`}
                      />
                      {fieldErrors["scientific_name"] && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle size={14} /> {fieldErrors["scientific_name"]}
                        </p>
                      )}
                    </div>
                  </div>

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
                        className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755] focus:outline-none"
                      />
                    </div>
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
                        className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Origin, Distribution, Habitat */}
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
                        className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755] focus:outline-none"
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
                        className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755] focus:outline-none"
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
                        className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755] focus:outline-none"
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
                          <label className="text-[#3B5B3B] font-semibold mb-1 capitalize">{field}</label>
                          <input
                            name={field}
                            value={formData[field as keyof typeof formData]}
                            onChange={handleChange}
                            type="text"
                            placeholder={`Enter ${field}`}
                            className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plant Images Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#3B5B3B] mb-3 flex items-center gap-2">
                      <ImagePlus size={18} className="text-[#579755]" /> Plant Images
                      <span className="text-red-500">*</span>
                    </h3>

                    {fieldErrors["images"] && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-sm">{fieldErrors["images"]}</p>
                      </div>
                    )}

                    {/* Existing Images (when editing) */}
                    {editMode && existingImages.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-4">
                          {existingImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative group w-36 h-36 rounded-md overflow-hidden border border-gray-200 bg-white"
                            >
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Existing ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(imageUrl)}
                                className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-[2px] shadow-sm opacity-0 group-hover:opacity-100 transition"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preview Images */}
                    {previewUrls.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-4">
                          {previewUrls.map((previewUrl, index) => (
                            <div
                              key={`preview-${index}`}
                              className="relative group w-36 h-36 rounded-md overflow-hidden border border-gray-200 bg-white"
                            >
                              <img
                                src={previewUrl || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-0.5 right-0.5 bg-white/80 hover:bg-white rounded-full p-[2px] shadow-sm opacity-0 group-hover:opacity-100 transition"
                              >
                                <X size={12} className="text-gray-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* File Upload Input */}
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#A3B18A] rounded-lg p-5 cursor-pointer hover:bg-[#DDE5B6]/30 transition">
                      <ImagePlus size={28} className="text-[#579755] mb-1" />
                      <span className="text-sm text-gray-600">Click to upload or drag & drop</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
              )}

              {activeModalSection === "ailments" && (
                <div className="space-y-8">
                  {/* Disease Types Section */}
                  <div>
                    <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-3">
                      <AlertCircle size={16} /> Disease Types
                      <span className="text-red-500">*</span>
                    </label>
                    {fieldErrors["diseases"] && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-sm">{fieldErrors["diseases"]}</p>
                      </div>
                    )}
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 min-h-[60px]">
                      {selectedDiseases.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedDiseases.map((disease) => (
                            <span
                              key={disease}
                              className={`${getDiseaseColor(disease)} border px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2`}
                            >
                              {disease}
                              <X
                                size={14}
                                className="cursor-pointer hover:opacity-70"
                                onClick={() => toggleDisease(disease)}
                              />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No disease types selected</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {diseaseTypes.map((disease) => (
                        <button
                          key={disease.name}
                          type="button"
                          onClick={() => toggleDisease(disease.name)}
                          className={`px-3 py-1.5 text-[13px] md:text-sm font-medium rounded-lg border-2 transition-all flex items-center gap-1.5 ${
                            selectedDiseases.includes(disease.name)
                              ? `${disease.color} border-current`
                              : "bg-white text-gray-600 border-gray-300 hover:border-[#579755]"
                          }`}
                        >
                          {selectedDiseases.includes(disease.name) ? "✓ " : "+ "}
                          {disease.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ailments, References & Herbal Benefits Section */}
                  <div>
                    <label className="flex items-center gap-2 text-[#3B5B3B] font-semibold mb-3">
                      <BookOpenText size={16} /> Herbal Uses & Benefits
                      <span className="text-red-500">*</span>
                    </label>

                    {fieldErrors["ailments"] && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-sm">{fieldErrors["ailments"]}</p>
                      </div>
                    )}
                    {fieldErrors["ailmentDetails"] && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-sm">{fieldErrors["ailmentDetails"]}</p>
                      </div>
                    )}

                    {selectedDiseases.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center bg-white">
                        <AlertCircle size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Please select at least one disease type first</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Selected Ailments with References & Benefits */}
                        {selectedAilments.length > 0 && (
                          <div className="bg-white border-2 border-gray-300 rounded-lg p-4 space-y-3">
                            <h4 className="text-xs font-semibold text-[#3B5B3B] uppercase">Selected Ailments</h4>
                            {selectedAilments.map((item) => {
                              const diseaseType = getAilmentDiseaseType(item.ailment)
                              const color = diseaseType ? getDiseaseColor(diseaseType) : "bg-gray-100 text-gray-700"
                              const isEditing = editingAilment === item.ailment

                              return (
                                <div
                                  key={item.ailment}
                                  className="bg-[#F4F8ED] border border-[#DDE5D2] rounded-lg p-4 space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={`${color} border px-3 py-1.5 rounded-lg text-sm font-medium`}>
                                      {item.ailment}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeAilment(item.ailment)}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  <div className="flex items-start gap-2">
                                    <ExternalLink size={14} className="text-[#579755] flex-shrink-0 mt-1" />
                                    {isEditing ? (
                                      <div className="flex-1 space-y-2">
                                        <input
                                          type="url"
                                          value={tempReference}
                                          onChange={(e) => setTempReference(e.target.value)}
                                          placeholder="https://example.com/reference"
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755] focus:outline-none"
                                          autoFocus
                                        />
                                        <textarea
                                          value={tempHerbalBenefit}
                                          onChange={(e) => setTempHerbalBenefit(e.target.value)}
                                          placeholder="Describe the herbal benefit for this ailment..."
                                          rows={5}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579755] focus:outline-none resize-y whitespace-pre-line"
                                        ></textarea>

                                        <button
                                          type="button"
                                          onClick={saveAilment}
                                          className="px-4 py-2 bg-[#579755] text-white text-sm rounded-lg hover:bg-[#467945] transition-all font-medium"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex-1 space-y-2 group">
                                        <div className="flex items-center justify-between">
                                          {item.reference ? (
                                            <a
                                              href={item.reference}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm text-blue-600 hover:underline truncate"
                                            >
                                              {item.reference}
                                            </a>
                                          ) : (
                                            <span className="text-sm text-red-500 italic">No reference added</span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              startEditAilment(item.ailment, item.reference, item.herbalBenefit)
                                            }
                                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                                          >
                                            <Edit2 size={14} className="text-gray-400 hover:text-[#579755]" />
                                          </button>
                                        </div>
                                        {item.herbalBenefit ? (
                                          <p className="text-sm text-gray-700 leading-relaxed">{item.herbalBenefit}</p>
                                        ) : (
                                          <p className="text-sm text-red-500 italic">No herbal benefit added</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Available Ailments to Add */}
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                          <h4 className="text-xs font-semibold text-[#3B5B3B] uppercase mb-3">Add Ailments</h4>
                          {selectedDiseases.map((disease) => {
                            const availableAilments = ailmentOptions[disease]?.filter(
                              (a) => !selectedAilments.find((item) => item.ailment === a),
                            )

                            if (!availableAilments || availableAilments.length === 0) return null

                            return (
                              <div key={disease} className="mb-4 last:mb-0">
                                <h5
                                  className={`text-xs font-semibold mb-2 ${getDiseaseColor(disease)} inline-block px-2 py-1 rounded`}
                                >
                                  {disease}
                                </h5>
                                <div className="flex flex-wrap gap-3">
                                  {availableAilments.map((ailment) => (
                                    <button
                                      key={ailment}
                                      type="button"
                                      onClick={() => addAilment(ailment)}
                                      className="px-3 py-1.5 text-[13px] md:text-sm font-medium text-[#3B5B3B] bg-white border-2 border-gray-300 rounded-lg hover:border-[#579755] hover:bg-[#E7EED9] transition-all flex items-center gap-1.5"
                                    >
                                      + {ailment}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <p className="text-xs text-gray-600 ml-1">
                          Selected: {selectedAilments.length} ailment(s) •
                          <span
                            className={
                              selectedAilments.filter((a) => !a.reference || !a.herbalBenefit).length > 0
                                ? "text-red-600 font-semibold"
                                : "text-green-600"
                            }
                          >
                            {" "}
                            {selectedAilments.filter((a) => a.reference && a.herbalBenefit).length}/
                            {selectedAilments.length} complete
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Warning if incomplete */}
                  {selectedAilments.some((a) => !a.reference || !a.herbalBenefit) && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                      <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">
                        All ailments must have both a reference link and herbal benefit before saving
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-[#DDE5D2]">
                <button
                  type="button"
                  onClick={() => setActiveModalSection(activeModalSection === "plant-info" ? "ailments" : "plant-info")}
                  className="px-6 py-2 text-[#579755] font-medium hover:bg-[#E7EED9] rounded-lg transition"
                >
                  {activeModalSection === "plant-info" ? "Next" : "Back"}
                </button>
                <button
                  type="submit"
                  disabled={
                    (existingImages.length === 0 && plantImages.length === 0) ||
                    selectedDiseases.length === 0 ||
                    selectedAilments.length === 0 ||
                    selectedAilments.some((a) => !a.reference || !a.herbalBenefit) ||
                    loading
                  }
                  className="bg-[#579755] hover:bg-[#467945] text-white font-medium py-2 px-8 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Plant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[460px] rounded-2xl shadow-2xl p-6 relative text-center">
            <div className="mx-auto mb-2 w-14 h-14 flex items-center justify-center rounded-full bg-yellow-100">
              <AlertCircle size={30} className="text-yellow-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-1">Unsaved Changes</h2>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to discard them and exit?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium text-sm"
              >
                Keep Editing
              </button>
              <button
                onClick={() => {
                  setShowDiscardConfirm(false)
                  setShowModal(false)
                  resetForm()
                }}
                className="px-5 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition font-medium text-sm"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && plantToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[460px] rounded-2xl shadow-2xl p-6 relative text-center">
            <div className="mx-auto mb-2 w-14 h-14 flex items-center justify-center rounded-full bg-[#dc2626]/15">
              <Trash2 size={30} className="text-[#dc2626]" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-1">Delete Plant</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">{plantToDelete.plant_name}</span>?
              <br />
              This action cannot be undone.
            </p>

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
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-5 right-5 z-10 text-gray-800 hover:text-gray-500 transition"
            >
              <XCircle size={30} />
            </button>

            <div className="bg-[#a8c496] px-8 py-5">
              <h2 className="text-2xl font-semibold text-[#2F4F2F] flex items-center gap-3">
                <Leaf size={26} />
                Plant Details
              </h2>
            </div>

            <div className="overflow-y-auto flex-1 p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Images */}
                <div className="md:col-span-1">
                  <div className="space-y-3 sticky top-0">
                    <div className="overflow-hidden shadow-md rounded-2xl">
                      <img
                        src={
                          viewingPlant.images && viewingPlant.images.length > 0
                            ? viewingPlant.images[selectedImageIndex]
                            : viewingPlant.image || "https://via.placeholder.com/300"
                        }
                        alt={viewingPlant.plant_name}
                        className="w-full h-60 object-cover rounded-2xl"
                      />
                    </div>

                    {viewingPlant.images && viewingPlant.images.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {viewingPlant.images.map((img: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`overflow-hidden rounded-xl shadow-sm transition ${
                              selectedImageIndex === idx ? "ring-2 ring-[#a8c496]" : "opacity-90 hover:opacity-75"
                            }`}
                          >
                            <img
                              src={img || "/placeholder.svg"}
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
                  <div className="bg-[#f5f9f4] text-[#2F4F2F] py-4 px-6 rounded-2xl shadow-md">
                    <h3 className="text-2xl font-bold mb-1">{viewingPlant.plant_name}</h3>
                    <p className="text-lg italic font-light">{viewingPlant.scientific_name}</p>
                  </div>

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

                  {viewingPlant.plant_type && (
                    <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                      <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                        <Leaf size={18} className="text-[#6B9F6A]" /> Plant Type
                      </h4>
                      <p className="text-base text-gray-700">{viewingPlant.plant_type}</p>
                    </div>
                  )}

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

                  {viewingPlant.origin && (
                    <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                      <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                        <Globe2 size={16} className="text-[#6B9F6A]" /> Origin
                      </h4>
                      <p className="text-base text-gray-700">{viewingPlant.origin}</p>
                    </div>
                  )}

                  {viewingPlant.distribution && (
                    <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                      <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                        <MapPin size={18} className="text-[#6B9F6A]" /> Distribution
                      </h4>
                      <p className="text-base text-gray-700">{viewingPlant.distribution}</p>
                    </div>
                  )}

                  {viewingPlant.herbal_benefits && (
                    <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                      <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                        <Sprout size={18} className="text-[#6B9F6A]" /> Herbal Benefits
                      </h4>
                      <p className="text-base text-gray-700 leading-relaxed">{viewingPlant.herbal_benefits}</p>
                    </div>
                  )}

                  {viewingPlant.ailmentsList && viewingPlant.ailmentsList.length > 0 ? (
                    <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                      <h4 className="text-base font-bold text-[#2F4F2F] mb-4 flex items-center gap-2">
                        <FlaskConical size={18} className="text-[#6B9F6A]" /> Herbal Uses & Benefits
                      </h4>

                      <div className="space-y-4">
                        {viewingPlant.ailmentsList.map((ailmentItem: any, idx: number) => {
                          const diseaseColor = getDiseaseColor(ailmentItem.disease_type)
                          return (
                            <div key={idx} className="bg-white border border-[#DDE5D2] rounded-lg p-4 space-y-3">
                              {/* Ailment name with disease type tag */}
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-base font-semibold text-[#2F4F2F]">{ailmentItem.ailment}</span>
                                <span
                                  className={`${diseaseColor} border px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0`}
                                >
                                  {ailmentItem.disease_type}
                                </span>
                              </div>

                              {/* Herbal benefit */}
                              {ailmentItem.herbal_benefit && (
                                <div className="bg-[#f9fdf7] p-3 rounded-lg">
                                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                                    {ailmentItem.herbal_benefit}
                                  </p>
                                </div>
                              )}

                              {/* Reference link INSIDE the same card (below herbal benefit) */}
                              {ailmentItem.reference && (
                                <div className="pt-2 mt-1 border-t border-[#DDE5D2]">
                                  <a
                                    href={ailmentItem.reference}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-[#6B9F6A] hover:text-[#5A8859] font-semibold transition"
                                  >
                                    <Link2 size={16} />
                                    View Reference Link
                                  </a>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : viewingPlant.ailment && viewingPlant.ailment.length > 0 ? (
                    <div className="bg-[#f5f9f4] p-5 rounded-xl shadow-sm">
                      <h4 className="text-base font-bold text-[#2F4F2F] mb-2 flex items-center gap-2">
                        <FlaskConical size={18} className="text-[#6B9F6A]" /> Ailments Treated
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(viewingPlant.ailment)
                          ? viewingPlant.ailment.map((a: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-[#dfeadb] text-[#2F4F2F] px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {a}
                              </span>
                            ))
                          : viewingPlant.ailment}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
