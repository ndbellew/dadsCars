import os
import time


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or "Dad'sSecretKey"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://username:password@dad-postgres:5432/database_name"