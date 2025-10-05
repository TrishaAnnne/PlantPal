import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api"; // or your Django server address

export const fetchAddressSuggestions = async (query) => {
  try {
    const response = await axios.get(`${API_BASE}/search-address/`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching address suggestions:", error);
    return [];
  }
};
