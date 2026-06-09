import { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  USERS,
  deleteDocument,
  getCurrentUser,
  getDocument,
  setCurrentUser,
  updateDocument,
} from "../services/documentStorage";

function Editor() {
  const navigate = useNavigate();
  const { id } = useParams();
  // State for document data
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // State for editor
  const [currentUser, setEditorUser] = useState(() => getCurrentUser());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedAt, setSavedAt] = useState("");
  // State for save/delete operations
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Fetch document on component mount
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const fetchedDocument = await getDocument(id);
        if (!fetchedDocument) {
          setLoadError("Document not found");
          return;
        }
        setDocument(fetchedDocument);
        setTitle(fetchedDocument.title || "");
        setContent(fetchedDocument.content || "");
        setSavedAt(fetchedDocument.updatedAt || "");
      } catch (error) {
        setLoadError(`Failed to load document: ${error.message}`);
        console.error("Error fetching document:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const canEdit = document?.owner === currentUser;

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "bullet" }, { list: "ordered" }],
        ["clean"],
      ],
    }),
    [],
  );

  const formats = ["header", "bold", "italic", "underline", "list"];

  // Handle saving document
  async function handleSave() {
    if (!canEdit || !document) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError("");
      const updatedDocument = await updateDocument(id, {
        title: title.trim() || "Untitled document",
        content,
      });

      if (updatedDocument) {
        setTitle(updatedDocument.title);
        setSavedAt(updatedDocument.updatedAt);
      }
    } catch (error) {
      setSaveError(`Failed to save: ${error.message}`);
      console.error("Error saving document:", error);
    } finally {
      setIsSaving(false);
    }
  }

  // Handle deleting document
  async function handleDelete() {
    if (!canEdit || !document) {
      return;
    }

    try {
      setIsDeleting(true);
      setSaveError("");
      await deleteDocument(id);
      navigate("/");
    } catch (error) {
      setSaveError(`Failed to delete: ${error.message}`);
      console.error("Error deleting document:", error);
      setIsDeleting(false);
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="empty-state">
          <p>Loading document...</p>
        </section>
      </main>
    );
  }

  // Show error if document not found
  if (!document) {
    return (
      <main className="app-shell">
        <section className="empty-state">
          <h1>Document not found</h1>
          {loadError && <p>{loadError}</p>}
          <Link className="primary-link" to="/">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell editor-shell">
      <header className="editor-header">
        <Link className="back-link" to="/">
          Back
        </Link>
        <div className="editor-actions">
          <label className="user-selector">
            <span>User</span>
            <select
              value={currentUser}
              onChange={(event) => {
                setEditorUser(event.target.value);
                setCurrentUser(event.target.value);
              }}
            >
              {USERS.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </label>
          {savedAt && (
            <span className="save-status">
              Saved {new Date(savedAt).toLocaleString()}
            </span>
          )}
          {canEdit ? (
            <>
              <button
                className="ghost-button danger"
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <span className="permission-pill">View only</span>
          )}
        </div>
      </header>

      {/* Show error messages */}
      {saveError && (
        <p className="validation-message" role="alert">
          {saveError}
        </p>
      )}

      <input
        className="title-input"
        aria-label="Document title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={handleSave}
        placeholder="Untitled document"
        readOnly={!canEdit}
      />

      <section className="editor-card">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Start writing..."
          readOnly={!canEdit}
        />
      </section>
    </main>
  );
}

export default Editor;
