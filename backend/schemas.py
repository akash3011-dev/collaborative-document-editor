from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DocumentBase(BaseModel):
    title: str = Field(default="Untitled document", min_length=1, max_length=255)
    content: str = ""
    owner: str = Field(..., min_length=1, max_length=100)


class DocumentCreate(DocumentBase):
    shared_with: list[str] = Field(default_factory=list)


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = None
    owner: str | None = Field(default=None, min_length=1, max_length=100)
    shared_with: list[str] | None = None


class DocumentShare(BaseModel):
    user: str = Field(..., min_length=1, max_length=100)


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    owner: str
    shared_with: list[str]
    created_at: datetime
    updated_at: datetime


class UploadResponse(DocumentRead):
    filename: str
