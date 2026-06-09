# Document Editor Application

A full-stack web application for creating, editing, and sharing documents with real-time text editing capabilities. Built with a modern tech stack combining FastAPI backend and React frontend.

## Features

- 📝 **Document Creation & Editing** - Create and edit documents with rich text support
- 🎨 **Rich Text Editor** - Integrated Quill editor for formatted text editing
- 👥 **Document Sharing** - Share documents with other users
- 📁 **File Uploads** - Upload text files (.txt, .md) and convert them to editable documents
- 📊 **Dashboard** - View and manage all documents in one place
- ⚡ **Real-time Updates** - Instant synchronization of document changes
- 🔄 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🚀 **API Documentation** - Interactive Swagger UI for API exploration

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Database**: SQLite with SQLAlchemy ORM
- **Data Validation**: Pydantic
- **Features**: CORS support, file uploads, JSON serialization

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Editor**: React Quill (rich text editing)
- **Styling**: CSS

## Project Structure

```
.
├── backend/                      # FastAPI backend application
│   ├── main.py                  # Application entry point
│   ├── database.py              # SQLAlchemy database configuration
│   ├── models.py                # SQLAlchemy data models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── requirements.txt          # Python dependencies
│   └── routes/
│       └── documents.py         # Document API endpoints
│
├── frontend/                     # React + Vite frontend application
│   ├── src/
│   │   ├── App.jsx              # Main application component
│   │   ├── main.jsx             # React entry point
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Documents list page
│   │   │   └── Editor.jsx       # Document editor page
│   │   ├── components/          # Reusable React components
│   │   ├── services/
│   │   │   ├── api.js           # API client service
│   │   │   └── documentStorage.js # Local storage service
│   │   ├── assets/              # Static assets
│   │   └── styles/              # CSS files
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.js           # Vite configuration
│   └── index.html               # HTML entry point
│
└── package.json                 # Root package configuration
```

## Prerequisites

- **Python** 3.9 or higher
- **Node.js** 18.0 or higher and npm/yarn
- **SQLite** (included with Python)

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Development Server
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### 5. Access API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Endpoint
The frontend uses `http://localhost:8000/api` by default. You can configure this in `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Run Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

## API Documentation

The backend provides a comprehensive REST API for document management:

### Base URL
```
http://localhost:8000/api
```

### Main Endpoints

#### Documents
- `POST /documents` - Create a new document
- `GET /documents` - Get all documents
- `GET /documents/{id}` - Get a specific document
- `PUT /documents/{id}` - Update a document
- `DELETE /documents/{id}` - Delete a document

#### File Upload
- `POST /documents/upload` - Upload a text file (.txt or .md)

#### Health Check
- `GET /health` - Server health status

For detailed API documentation and to test endpoints interactively, visit the Swagger UI at `http://localhost:8000/docs` when the backend is running.

## How to Run Locally

### Option 1: Run Both Services in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
# Activate virtual environment (if not already activated)
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate      # Windows

# Start the server
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open your browser and navigate to `http://localhost:5173`

### Option 2: Using IDE Integration
- Use VS Code's terminal split feature or multiple terminal tabs
- Run backend: `cd backend && uvicorn main:app --reload`
- Run frontend: `cd frontend && npm run dev`

## Development Workflow

1. **Start Backend**: `uvicorn main:app --reload` (auto-reloads on file changes)
2. **Start Frontend**: `npm run dev` (includes hot module replacement)
3. **Access Application**: Open http://localhost:5173 in your browser
4. **Test APIs**: Use Swagger UI at http://localhost:8000/docs
5. **Linting**: `npm run lint` in the frontend directory

## Production Build

To create a production-ready build:

```bash
# Build frontend
cd frontend
npm run build

# Frontend dist files are ready for deployment
```

For production deployment:
- Deploy the `frontend/dist/` directory to a static hosting service
- Deploy the `backend/` directory to a Python-compatible hosting platform
- Update API endpoints in frontend configuration for production URLs

## Environment Variables

### Backend
- No required environment variables (uses SQLite locally)
- Database path: `sqlite:///./documents.db`

### Frontend
- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:8000/api`)

## Database

The application uses SQLite for data persistence:
- **Database File**: `backend/documents.db` (auto-created)
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Automatic on application startup

## Error Handling

The application includes comprehensive error handling:
- **Backend**: HTTP status codes with descriptive error messages
- **Frontend**: User-friendly error notifications
- **File Upload**: Validates file types and encoding

## Testing

### Manual Testing
1. Use Swagger UI at `http://localhost:8000/docs` to test API endpoints
2. Test frontend through the application UI
3. Verify file upload with .txt and .md files

### Linting
```bash
cd frontend
npm run lint
```

## Troubleshooting

### Backend Issues
- **Port 8000 already in use**: Change port with `uvicorn main:app --reload --port 8001`
- **Module not found**: Ensure virtual environment is activated and dependencies are installed
- **Database locked**: Remove `backend/documents.db` and restart

### Frontend Issues
- **Port 5173 already in use**: Vite will automatically use a different port
- **API connection error**: Verify backend is running and `VITE_API_BASE_URL` is correct
- **Module not found**: Run `npm install` to ensure all dependencies are installed

### CORS Issues
If you see CORS errors, verify that the frontend URL is in the backend's CORS allowed origins in `backend/main.py`.

## Contributing

1. Create a new branch for features or fixes
2. Make your changes
3. Ensure code quality with linting
4. Test thoroughly before committing
5. Create a pull request with clear description

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the API documentation at `http://localhost:8000/docs`
2. Review the application logs
3. Check that both backend and frontend services are running

---

**Last Updated**: June 2026
