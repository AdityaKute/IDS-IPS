"""
Initial threat intelligence database seeder.
Populates known attack patterns and threat types.
Run this once to initialize the threat database.
"""

from sqlalchemy.orm import Session
from app.db import engine, SessionLocal
from app import models

def seed_threat_database():
    """Seed the database with known attack patterns."""
    db: Session = SessionLocal()
    
    try:
        # Create threat types
        threat_types = [
            ("Port Scanning", "Systematic scanning of network ports to identify open services"),
            ("Brute Force Login", "Repeated login attempts with various credentials"),
            ("DDoS Attack", "Distributed denial of service attack"),
            ("SQL Injection", "SQL injection attack through vulnerable input fields"),
            ("Malware Execution", "Execution of malicious code/executable"),
            ("Suspicious Process Spawning", "Unusual process creation from known malicious parent"),
            ("Data Exfiltration", "Unauthorized data transfer outside network"),
            ("Privilege Escalation", "Attempt to gain elevated system privileges"),
            ("Lateral Movement", "Movement within network after initial compromise"),
            ("Service Exploit", "Exploitation of known service vulnerabilities"),
        ]
        
        threat_type_objs = []
        for name, desc in threat_types:
            existing = db.query(models.AttackType).filter(models.AttackType.name == name).first()
            if not existing:
                obj = models.AttackType(name=name, description=desc)
                db.add(obj)
                threat_type_objs.append(obj)
        
        db.commit()
        print(f"[*] Created {len(threat_type_objs)} threat types")
        
        # Fetch all threat types for pattern creation
        all_types = db.query(models.AttackType).all()
        type_map = {t.name: t.id for t in all_types}
        
        # Create attack patterns for each threat type
        patterns_to_create = [
            # Port Scanning
            {
                "attack_type": "Port Scanning",
                "process_name": None,
                "cmdline_regex": r"nmap|nessus|masscan|zmap|portscan",
                "ip_pattern": None,
                "frequency_threshold": 1,
                "severity": "HIGH",
                "recommended_action": "block_ip"
            },
            # Brute Force
            {
                "attack_type": "Brute Force Login",
                "process_name": None,
                "cmdline_regex": r"hydra|john|hashcat|medusa",
                "ip_pattern": None,
                "frequency_threshold": 5,
                "severity": "HIGH",
                "recommended_action": "block_ip"
            },
            # Malware patterns
            {
                "attack_type": "Malware Execution",
                "process_name": None,
                "cmdline_regex": r"powershell.*-enc|-nop|-Hidden|-NoProfile",
                "ip_pattern": None,
                "frequency_threshold": 1,
                "severity": "CRITICAL",
                "recommended_action": "kill_process"
            },
            {
                "attack_type": "Malware Execution",
                "process_name": None,
                "cmdline_regex": r"cmd\.exe.*\/c.*curl|wget|powershell",
                "ip_pattern": None,
                "frequency_threshold": 1,
                "severity": "CRITICAL",
                "recommended_action": "kill_process"
            },
            # Suspicious processes
            {
                "attack_type": "Suspicious Process Spawning",
                "process_name": "explorer.exe",
                "cmdline_regex": r"powershell|cmd\.exe|psexec|wmic",
                "ip_pattern": None,
                "frequency_threshold": 1,
                "severity": "HIGH",
                "recommended_action": "kill_process"
            },
            {
                "attack_type": "Suspicious Process Spawning",
                "process_name": "svchost.exe",
                "cmdline_regex": r"powershell|cmd\.exe",
                "ip_pattern": None,
                "frequency_threshold": 1,
                "severity": "CRITICAL",
                "recommended_action": "alert"
            },
            # Data Exfiltration
            {
                "attack_type": "Data Exfiltration",
                "process_name": None,
                "cmdline_regex": r"curl|wget|powershell.*http|invoke-webrequest",
                "ip_pattern": None,
                "frequency_threshold": 3,
                "severity": "HIGH",
                "recommended_action": "block_ip"
            },
            # Privilege Escalation
            {
                "attack_type": "Privilege Escalation",
                "process_name": None,
                "cmdline_regex": r"runas|psexec|sudo|dism.*admin",
                "ip_pattern": None,
                "frequency_threshold": 1,
                "severity": "CRITICAL",
                "recommended_action": "alert"
            },
        ]
        
        pattern_count = 0
        for pattern_data in patterns_to_create:
            attack_type = pattern_data.pop("attack_type")
            type_id = type_map.get(attack_type)
            if not type_id:
                continue
            
            # Check if pattern already exists
            existing = db.query(models.AttackPattern).filter(
                models.AttackPattern.attack_type_id == type_id,
                models.AttackPattern.cmdline_regex == pattern_data.get("cmdline_regex"),
                models.AttackPattern.process_name == pattern_data.get("process_name")
            ).first()
            
            if not existing:
                obj = models.AttackPattern(
                    attack_type_id=type_id,
                    **pattern_data
                )
                db.add(obj)
                pattern_count += 1
        
        db.commit()
        print(f"[*] Created {pattern_count} attack patterns")
        
        # Create IPS Actions
        ips_actions = [
            ("kill_process", "Terminate malicious process", "kill_process", {"pid": "integer"}),
            ("block_ip", "Block IP address via firewall", "block_ip", {"ip": "string"}),
            ("block_port", "Block network port", "block_port", {"port": "integer", "protocol": "string"}),
            ("quarantine_file", "Move file to quarantine", "quarantine_file", {"path": "string"}),
            ("stop_service", "Stop Windows service", "stop_service", {"service": "string"}),
            ("alert", "Generate alert", "alert", {}),
        ]
        
        action_count = 0
        for name, desc, sys_action, params in ips_actions:
            existing = db.query(models.IPSAction).filter(models.IPSAction.name == name).first()
            if not existing:
                obj = models.IPSAction(
                    name=name,
                    description=desc,
                    system_action=sys_action,
                    params=params
                )
                db.add(obj)
                action_count += 1
        
        db.commit()
        print(f"[*] Created {action_count} IPS actions")
        
        print("[+] Threat database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"[-] Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_threat_database()
