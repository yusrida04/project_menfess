from pydantic import BaseModel, Field

class MenfessCreate(BaseModel):
    tag: str | None = None
    content: str = Field(..., min_length=1, max_length=280)

class VoteCreate(BaseModel):
    value: int = Field(..., ge=-1, le=1)  # -1, 0, atau 1
    
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=250)
    
class MenfessCreate(BaseModel):
    tag: str = "Umum"
    content: str
    music_data: dict | None = None
    image_url: str | None = None

class MenfessModeratorUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=280)
    tag: str = Field(..., min_length=1, max_length=20)
    approve: bool = True