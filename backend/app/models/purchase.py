from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import relationship
from app.database.session import Base


class Purchase(Base):
    """
    SQLAlchemy model mapping directly to the existing MySQL `purchases` table.
    Matches exact columns, datatypes, and constraints from production database.
    """
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_name = Column(String(100), nullable=False)
    item_price = Column(Numeric(10, 2), nullable=False)
    purchase_date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Optional ORM relationship
    user = relationship("User", backref="purchases")

    @property
    def user_name(self) -> str | None:
        return self.user.name if self.user else None

    def __repr__(self) -> str:
        return f"<Purchase id={self.id} user_id={self.user_id} item={self.item_name} price={self.item_price}>"
