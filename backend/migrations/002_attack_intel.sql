-- Migration 002: Attack intelligence, IPS actions, audit logs
-- Add attack_types, attack_patterns, ips_actions, audit_logs
-- Add api_token and network_range to agents table

ALTER TABLE agents
  ADD COLUMN api_token VARCHAR(255) NULL,
  ADD COLUMN network_range VARCHAR(100) NULL;

CREATE TABLE IF NOT EXISTS attack_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attack_patterns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attack_type_id INT NOT NULL,
  process_name VARCHAR(200),
  cmdline_regex VARCHAR(500),
  url_pattern VARCHAR(500),
  ip_pattern VARCHAR(255),
  frequency_threshold INT DEFAULT 0,
  severity VARCHAR(10) DEFAULT 'MEDIUM',
  recommended_action VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (attack_type_id) REFERENCES attack_types(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ips_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  system_action VARCHAR(100),
  params JSON
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action_type VARCHAR(100),
  actor VARCHAR(150),
  target VARCHAR(255),
  details JSON,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
