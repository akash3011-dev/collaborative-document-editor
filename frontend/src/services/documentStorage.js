import { documentApi } from "./api";

const CURRENT_USER_KEY = "takehome.currentUser.v1";
export const USERS = ["Akash", "John", "Sarah"];

/**
 * getCurrentUser - Get the current active user from localStorage
 * Falls back to "Akash" if no valid user is set
 */
export function getCurrentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return USERS.includes(user) ? user : "Akash";
}

/**
 * setCurrentUser - Set the current active user in localStorage
 * Only allows valid users from the USERS list
 */
export function setCurrentUser(user) {
  if (USERS.includes(user)) {
    localStorage.setItem(CURRENT_USER_KEY, user);
  }
}

/**
 * getDocuments - Fetch all documents from the FastAPI backend
 * Documents are sorted by updatedAt in descending order
 * @async
 * @returns {Promise<Array>} Array of document objects
 */
export async function getDocuments() {
  try {
    const documents = await documentApi.getDocuments();
    // Sort by updatedAt descending (most recent first)
    return documents.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    throw error;
  }
}

/**
 * getDocument - Fetch a single document by ID from the FastAPI backend
 * @async
 * @param {number} id - Document ID
 * @returns {Promise<Object|null>} Document object or null if not found
 */
export async function getDocument(id) {
  try {
    return await documentApi.getDocument(id);
  } catch (error) {
    console.error(`Failed to fetch document ${id}:`, error);
    return null;
  }
}

/**
 * createDocument - Create a new document via the FastAPI backend
 * @async
 * @param {Object} overrides - Optional overrides for title and owner
 * @returns {Promise<Object>} Created document object
 */
export async function createDocument(overrides = {}) {
  try {
    const title = overrides.title || "Untitled document";
    const owner = overrides.owner || "Akash";
    const document = await documentApi.createDocument(title, owner);
    return document;
  } catch (error) {
    console.error("Failed to create document:", error);
    throw error;
  }
}

/**
 * updateDocument - Update an existing document via the FastAPI backend
 * @async
 * @param {number} id - Document ID
 * @param {Object} updates - Fields to update (title, content, etc.)
 * @returns {Promise<Object>} Updated document object
 */
export async function updateDocument(id, updates) {
  try {
    const updatedDocument = await documentApi.updateDocument(id, updates);
    return updatedDocument;
  } catch (error) {
    console.error(`Failed to update document ${id}:`, error);
    throw error;
  }
}

/**
 * deleteDocument - Delete a document via the FastAPI backend
 * @async
 * @param {number} id - Document ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteDocument(id) {
  try {
    return await documentApi.deleteDocument(id);
  } catch (error) {
    console.error(`Failed to delete document ${id}:`, error);
    throw error;
  }
}

/**
 * shareDocument - Share a document with another user via the FastAPI backend
 * @async
 * @param {number} id - Document ID
 * @param {string} user - Username to share with
 * @returns {Promise<Object>} Updated document object
 */
export async function shareDocument(id, user) {
  try {
    const sharedDocument = await documentApi.shareDocument(id, user);
    return sharedDocument;
  } catch (error) {
    console.error(`Failed to share document ${id}:`, error);
    throw error;
  }
}

/**
 * uploadFile - Upload a text file (.txt or .md) via the FastAPI backend
 * @async
 * @param {File} file - File object from input
 * @param {string} owner - Document owner username
 * @returns {Promise<Object>} Created document from uploaded file
 */
export async function uploadFile(file, owner = "Akash") {
  try {
    return await documentApi.uploadFile(file, owner);
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error;
  }
}
