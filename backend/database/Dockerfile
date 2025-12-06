# PostgreSQL Database Container
FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=healthcare_db
ENV POSTGRES_USER=healthcare_user
ENV POSTGRES_PASSWORD=secure_password_123

# Copy initialization scripts
COPY init-db.sql /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD pg_isready -U healthcare_user -d healthcare_db
