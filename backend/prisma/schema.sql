-- schema.sql
-- Raw DDL matching backend/prisma/schema.prisma
-- This is generated for reference / submission purposes.
-- To actually create the schema, prefer `npx prisma migrate dev` in backend/,
-- which will produce and apply migrations automatically from schema.prisma.

CREATE TYPE "Role" AS ENUM ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');
CREATE TYPE "EquipmentCategory" AS ENUM ('WEAPON', 'VEHICLE', 'AMMUNITION');
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'COMPLETED');

CREATE TABLE bases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role "Role" NOT NULL,
    base_id INT REFERENCES bases(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category "EquipmentCategory" NOT NULL
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL,
    purchased_by INT NOT NULL REFERENCES users(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_purchases_base_id ON purchases(base_id);
CREATE INDEX idx_purchases_equipment_type_id ON purchases(equipment_type_id);
CREATE INDEX idx_purchases_created_at ON purchases(created_at);

CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    source_base_id INT NOT NULL REFERENCES bases(id),
    destination_base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    status "TransferStatus" DEFAULT 'COMPLETED',
    initiated_by INT NOT NULL REFERENCES users(id),
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transfers_source_base_id ON transfers(source_base_id);
CREATE INDEX idx_transfers_destination_base_id ON transfers(destination_base_id);
CREATE INDEX idx_transfers_equipment_type_id ON transfers(equipment_type_id);
CREATE INDEX idx_transfers_created_at ON transfers(created_at);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL,
    assigned_to VARCHAR(150) NOT NULL,
    assigned_by INT NOT NULL REFERENCES users(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_assignments_base_id ON assignments(base_id);
CREATE INDEX idx_assignments_equipment_type_id ON assignments(equipment_type_id);
CREATE INDEX idx_assignments_created_at ON assignments(created_at);

CREATE TABLE expenditures (
    id SERIAL PRIMARY KEY,
    base_id INT NOT NULL REFERENCES bases(id),
    equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
    quantity INT NOT NULL,
    reason TEXT,
    recorded_by INT NOT NULL REFERENCES users(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_expenditures_base_id ON expenditures(base_id);
CREATE INDEX idx_expenditures_equipment_type_id ON expenditures(equipment_type_id);
CREATE INDEX idx_expenditures_created_at ON expenditures(created_at);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
