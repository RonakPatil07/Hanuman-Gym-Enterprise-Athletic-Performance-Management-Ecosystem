"""initial_postgresql_schema

Revision ID: eeb3d8a8ba23
Revises: 
Create Date: 2026-08-16 15:00:08.676227

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eeb3d8a8ba23'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=True),
        sa.Column('role', sa.String(length=20), server_default='user', nullable=False),
        sa.Column('phone', sa.String(length=25), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('current_weight', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('target_weight', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('water_goal', sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column('calorie_goal', sa.Integer(), nullable=True),
        sa.Column('workout_days', sa.Integer(), nullable=True),
        sa.Column('fitness_goal', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    
    op.create_table('purchases',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('item_name', sa.String(length=100), nullable=False),
        sa.Column('item_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('purchase_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_purchases_id'), 'purchases', ['id'], unique=False)
    op.create_index(op.f('ix_purchases_user_id'), 'purchases', ['user_id'], unique=False)
    
    op.create_table('workout_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('workout_date', sa.Date(), nullable=False),
        sa.Column('exercise_name', sa.String(length=100), server_default='Exercise', nullable=False),
        sa.Column('sets', sa.Integer(), server_default='3', nullable=False),
        sa.Column('reps', sa.Integer(), server_default='10', nullable=False),
        sa.Column('weight', sa.Numeric(precision=6, scale=2), server_default='0.00', nullable=False),
        sa.Column('water_intake', sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column('calories_consumed', sa.Integer(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), server_default='60', nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workout_logs_id'), 'workout_logs', ['id'], unique=False)
    op.create_index(op.f('ix_workout_logs_user_id'), 'workout_logs', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_workout_logs_user_id'), table_name='workout_logs')
    op.drop_index(op.f('ix_workout_logs_id'), table_name='workout_logs')
    op.drop_table('workout_logs')
    op.drop_index(op.f('ix_purchases_user_id'), table_name='purchases')
    op.drop_index(op.f('ix_purchases_id'), table_name='purchases')
    op.drop_table('purchases')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
