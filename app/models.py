from datetime import datetime, timezone
from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db

class Cars(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    model: so.Mapped[str] = so.mapped_column(sa.String(200))
    make: so.Mapped[str] = so.mapped_column(sa.String(200))
    year: so.Mapped[int] = so.mapped_column(sa.Integer)

    def __repr__(self):
        return f"Car = Make: {self.make} Model: {self.model} Year: {self.year}"