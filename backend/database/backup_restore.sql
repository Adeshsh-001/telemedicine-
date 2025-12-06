-- PostgreSQL Backup and Restore Script
-- Usage: psql -U username -d healthcare_db -f backup_restore.sql

-- Backup command (run from terminal):
-- pg_dump -U username -d healthcare_db > backup_healthcare_$(date +%Y%m%d_%H%M%S).sql

-- Restore from backup (run from terminal):
-- psql -U username -d healthcare_db < backup_file.sql

-- Export tables to CSV
COPY users TO '/tmp/users_backup.csv' WITH CSV HEADER;
COPY medicines TO '/tmp/medicines_backup.csv' WITH CSV HEADER;
COPY pharmacies TO '/tmp/pharmacies_backup.csv' WITH CSV HEADER;
COPY prescriptions TO '/tmp/prescriptions_backup.csv' WITH CSV HEADER;
