# 1. Create the database

sudo -u postgres psql -c "CREATE DATABASE your_app_db;"

# 2. (If needed) enable extensions

sudo -u postgres psql -d your_app_db -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
sudo -u postgres psql -d your_app_db -c "CREATE EXTENSION IF NOT EXISTS btree_gist;"

# 3. Run the schema

sudo -u postgres psql -d your_app_db -f schema.sql

# 4. Verify

sudo -u postgres psql -d your_app_db -c "\dt"
