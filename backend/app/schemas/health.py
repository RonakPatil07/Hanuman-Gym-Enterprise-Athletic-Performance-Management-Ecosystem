from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Current health status of the API", json_schema_extra={"example": "ok"})
