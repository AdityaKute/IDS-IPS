-- Migration 003: Unrecognized attacks and learning/proposals

CREATE TABLE IF NOT EXISTS unrecognized_attacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NULL,
  telemetry JSON,
  assigned_severity VARCHAR(10) DEFAULT 'LOW',
  status VARCHAR(20) DEFAULT 'PENDING',
  cluster_id VARCHAR(100),
  learning_score FLOAT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (agent_id),
  INDEX (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proposed_patterns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  pattern JSON,
  proposed_by VARCHAR(150),
  status VARCHAR(20) DEFAULT 'PENDING',
  linked_attack_type_id INT NULL,
  votes INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS learning_jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'QUEUED',
  details JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
