from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from database.session import Base
from datetime import datetime, timezone

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    severity = Column(String, default="Moderate") # Critical, High, Moderate, Low
    emergency_type = Column(String, default="General") # Flood, Fire, Medical, etc.
    victims = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    status = Column(String, default="Active") # Active, Resolved
    ai_summary = Column(Text, nullable=True)
    ai_recommendation = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # Ambulance, Firetruck, Rescue Boat, Shelter
    capacity = Column(Integer, default=1)
    available = Column(Boolean, default=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
