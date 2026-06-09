import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  USERS,
  createDocument,
  deleteDocument,
  getCurrentUser,
  getDocuments,
  setCurrentUser,
  shareDocument,
  uploadFile,
} from "../services/documentStorage";

const SUPPORTED_FILE_TYPES = [".txt", ".md"];

function isSupportedFile(file) {
  return SUPPORTED_FILE_TYPES.some((extension) => file.name.toLowerCase().endsWith(extension));
}

function titleFromFileName(fileName) {
  return fileName.replace(/\.(txt|md)$/i, "") || "Uploaded document";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToEditorHtml(value) {
  return value
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
    .join("");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Dashboard() {
  const navigate = useNavigate();
  // State for documents list
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // State for upload
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  // State for current user
  const [currentUser, setDashboardUser] = useState(() => getCurrentUser());
  // State for share menu
  const [shareMenuId, setShareMenuId] = useState("");
  const [shareUser, setShareUser] = useState("John");
  const [isSharing, setIsSharing] = useState(false);

  // Fetch documents on component mount and when currentUser changes
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const fetchedDocuments = await getDocuments();
        setDocuments(fetchedDocuments);
      } catch (error) {
        setLoadError(`Failed to load documents: ${error.message}`);
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const ownedDocuments = documents.filter((document) => document.owner === currentUser);
  const sharedDocuments = documents.filter((document) => document.sharedWith.includes(currentUser));
  const shareableUsers = USERS.filter((user) => user !== currentUser);

  // Handle creating a new document
  async function handleCreateDocument() {
    try {
      setLoadError("");
      const document = await createDocument({ owner: currentUser });
      navigate(`/documents/${document.id}`);
    } catch (error) {
      setLoadError(`Failed to create document: ${error.message}`);
      console.error("Error creating document:", error);
    }
  }

  // Handle file upload
  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isSupportedFile(file)) {
      setUploadError("Unsupported file type. Please upload a .txt or .md file.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");
      // Upload file via API - the API handles text conversion
      const document = await uploadFile(file, currentUser);
      // Refresh documents list
      const updatedDocuments = await getDocuments();
      setDocuments(updatedDocuments);
      navigate(`/documents/${document.id}`);
    } catch (error) {
      setUploadError(`Upload failed: ${error.message}`);
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  }

  // Handle deleting a document
  async function handleDeleteDocument(event, id) {
    event.preventDefault();
    try {
      setLoadError("");
      await deleteDocument(id);
      // Remove deleted document from state
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      setLoadError(`Failed to delete document: ${error.message}`);
      console.error("Error deleting document:", error);
    }
  }

  // Handle sharing a document
  async function handleShareDocument(event, id) {
    event.preventDefault();
    try {
      setIsSharing(true);
      setLoadError("");
      await shareDocument(id, shareUser);
      // Refresh documents to get updated shared_with list
      const updatedDocuments = await getDocuments();
      setDocuments(updatedDocuments);
      setShareMenuId("");
    } catch (error) {
      setLoadError(`Failed to share document: ${error.message}`);
      console.error("Error sharing document:", error);
    } finally {
      setIsSharing(false);
    }
  }

  function renderDocumentCard(document, canManage = false) {
    return (
      <Link className="document-card" key={document.id} to={`/documents/${document.id}`}>
        <div>
          <h3>{document.title || "Untitled document"}</h3>
          <p>Owner: {document.owner}</p>
          <p>Updated {formatDate(document.updatedAt)}</p>
          {document.sharedWith.length > 0 && (
            <p className="shared-with">Shared with {document.sharedWith.join(", ")}</p>
          )}
        </div>

        {canManage && (
          <div className="card-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setShareMenuId(shareMenuId === document.id ? "" : document.id);
                setShareUser(shareableUsers[0] || "");
              }}
            >
              Share
            </button>
            <button
              className="ghost-button danger"
              type="button"
              onClick={(event) => handleDeleteDocument(event, document.id)}
            >
              Delete
            </button>
          </div>
        )}

        {canManage && shareMenuId === document.id && (
          <div className="share-popover" onClick={(event) => event.preventDefault()}>
            <label htmlFor={`share-${document.id}`}>Share with</label>
            <select
              id={`share-${document.id}`}
              value={shareUser}
              onChange={(event) => setShareUser(event.target.value)}
            >
              {shareableUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
            <button
              className="primary-button compact"
              type="button"
              onClick={(event) => handleShareDocument(event, document.id)}
            >
              Share document
            </button>
          </div>
        )}
      </Link>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Local workspace</p>
          <h1>Documents</h1>
        </div>
        <div className="dashboard-actions">
          <label className="user-selector">
            <span>User</span>
            <select
              value={currentUser}
              onChange={(event) => {
                setDashboardUser(event.target.value);
                setCurrentUser(event.target.value);
                setShareMenuId("");
                setUploadError("");
                setLoadError("");
              }}
            >
              {USERS.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </label>
          <label className="secondary-button" htmlFor="document-upload">
            {isUploading ? "Uploading..." : "Upload file"}
          </label>
          <input
            id="document-upload"
            className="file-input"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <button
            className="primary-button"
            type="button"
            onClick={handleCreateDocument}
            disabled={isLoading}
          >
            New document
          </button>
        </div>
      </header>

      {/* Show loading state */}
      {isLoading && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Loading documents...</p>
        </div>
      )}

      {/* Show load error if occurred */}
      {loadError && (
        <p className="validation-message" role="alert">
          {loadError}
        </p>
      )}

      {/* Show upload error if occurred */}
      {uploadError && (
        <p className="validation-message" role="alert">
          {uploadError}
        </p>
      )}

      {!isLoading && ownedDocuments.length === 0 && sharedDocuments.length === 0 ? (
        <section className="empty-state">
          <h2>No documents for {currentUser}</h2>
          <p>Create or upload a document. Shared documents will appear here too.</p>
          <button className="primary-button" type="button" onClick={handleCreateDocument}>
            Create document
          </button>
          <label className="secondary-button" htmlFor="empty-document-upload">
            Upload file
          </label>
          <input
            id="empty-document-upload"
            className="file-input"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </section>
      ) : (
        <div className="document-sections">
          <section className="document-section" aria-label="Owned documents">
            <div className="section-heading">
              <h2>Owned Documents</h2>
              <span>{ownedDocuments.length}</span>
            </div>
            {ownedDocuments.length === 0 ? (
              <p className="section-empty">No owned documents yet.</p>
            ) : (
              <div className="document-list">{ownedDocuments.map((document) => renderDocumentCard(document, true))}</div>
            )}
          </section>

          <section className="document-section" aria-label="Shared documents">
            <div className="section-heading">
              <h2>Shared Documents</h2>
              <span>{sharedDocuments.length}</span>
            </div>
            {sharedDocuments.length === 0 ? (
              <p className="section-empty">No documents have been shared with {currentUser}.</p>
            ) : (
              <div className="document-list">{sharedDocuments.map((document) => renderDocumentCard(document))}</div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
