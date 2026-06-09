import axios from "axios";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to convert snake_case from API to camelCase for frontend
function camelizeKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => camelizeKeys(item));
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      acc[camelKey] = camelizeKeys(obj[key]);
      return acc;
    }, {});
  }

  return obj;
}

// Helper function to convert camelCase from frontend to snake_case for API
function snakifyKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => snakifyKeys(item));
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
      acc[snakeKey] = snakifyKeys(obj[key]);
      return acc;
    }, {});
  }

  return obj;
}

/**
 * Document API Service
 * Handles all API communication with the FastAPI backend
 */
export const documentApi = {
  /**
   * Fetch all documents
   * GET /documents
   */
  async getDocuments() {
    try {
      const response = await apiClient.get("/documents");
      // Convert snake_case responses to camelCase
      return camelizeKeys(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to fetch documents"
      );
    }
  },

  /**
   * Fetch a single document by ID
   * GET /documents/{id}
   */
  async getDocument(id) {
    try {
      const response = await apiClient.get(`/documents/${id}`);
      // Convert snake_case response to camelCase
      return camelizeKeys(response.data);
    } catch (error) {
      console.error("Error fetching document:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to fetch document"
      );
    }
  },

  /**
   * Create a new document
   * POST /documents
   */
  async createDocument(title = "Untitled document", owner = "Akash") {
    try {
      const payload = {
        title,
        content: "",
        owner,
        shared_with: [],
      };
      const response = await apiClient.post("/documents", payload);
      // Convert snake_case response to camelCase
      return camelizeKeys(response.data);
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to create document"
      );
    }
  },

  /**
   * Update a document
   * PUT /documents/{id}
   */
  async updateDocument(id, updates) {
    try {
      // Convert camelCase to snake_case for API
      const payload = snakifyKeys(updates);
      const response = await apiClient.put(`/documents/${id}`, payload);
      // Convert snake_case response to camelCase
      return camelizeKeys(response.data);
    } catch (error) {
      console.error("Error updating document:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to update document"
      );
    }
  },

  /**
   * Delete a document
   * DELETE /documents/{id}
   */
  async deleteDocument(id) {
    try {
      await apiClient.delete(`/documents/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to delete document"
      );
    }
  },

  /**
   * Share a document with another user
   * POST /documents/{id}/share
   */
  async shareDocument(id, user) {
    try {
      const payload = { user };
      const response = await apiClient.post(`/documents/${id}/share`, payload);
      // Convert snake_case response to camelCase
      return camelizeKeys(response.data);
    } catch (error) {
      console.error("Error sharing document:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to share document"
      );
    }
  },

  /**
   * Upload a text file
   * POST /documents/upload
   * Expects FormData with "owner" and "file" fields
   */
  async uploadFile(file, owner = "Akash") {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("owner", owner);

      const response = await apiClient.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Convert snake_case response to camelCase
      return camelizeKeys(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(
        error.response?.data?.detail || "Failed to upload file"
      );
    }
  },
};

export default documentApi;
