from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db


router = APIRouter(prefix="/api/documents", tags=["documents"])

SUPPORTED_UPLOAD_EXTENSIONS = {".txt", ".md"}


def get_document_or_404(document_id: int, db: Session) -> models.Document:
    document = db.get(models.Document, document_id)
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    return document


@router.post("", response_model=schemas.DocumentRead, status_code=status.HTTP_201_CREATED)
def create_document(payload: schemas.DocumentCreate, db: Session = Depends(get_db)):
    document = models.Document(
        title=payload.title,
        content=payload.content,
        owner=payload.owner,
        shared_with=payload.shared_with,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("", response_model=list[schemas.DocumentRead])
def get_documents(db: Session = Depends(get_db)):
    return db.query(models.Document).order_by(models.Document.updated_at.desc()).all()


@router.post("/upload", response_model=schemas.UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_text_file(
    owner: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    extension = Path(file.filename or "").suffix.lower()

    if extension not in SUPPORTED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Upload a .txt or .md file.",
        )

    raw_content = await file.read()

    try:
        content = raw_content.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be valid UTF-8 text.",
        ) from exc

    title = Path(file.filename or "Uploaded document").stem or "Uploaded document"
    document = models.Document(title=title, content=content, owner=owner, shared_with=[])

    db.add(document)
    db.commit()
    db.refresh(document)

    response = schemas.DocumentRead.model_validate(document).model_dump()
    return {**response, "filename": file.filename or title}


@router.get("/{document_id}", response_model=schemas.DocumentRead)
def get_document(document_id: int, db: Session = Depends(get_db)):
    return get_document_or_404(document_id, db)


@router.put("/{document_id}", response_model=schemas.DocumentRead)
def update_document(
    document_id: int,
    payload: schemas.DocumentUpdate,
    db: Session = Depends(get_db),
):
    document = get_document_or_404(document_id, db)
    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    document = get_document_or_404(document_id, db)
    db.delete(document)
    db.commit()
    return None


@router.post("/{document_id}/share", response_model=schemas.DocumentRead)
def share_document(
    document_id: int,
    payload: schemas.DocumentShare,
    db: Session = Depends(get_db),
):
    document = get_document_or_404(document_id, db)

    if payload.user == document.owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner already has access to this document",
        )

    if payload.user not in document.shared_with:
        document.shared_with = [*document.shared_with, payload.user]

    db.commit()
    db.refresh(document)
    return document
