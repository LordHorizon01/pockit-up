-- =============================================================================
-- PockitUp Future Authentication & Authorization Schema
-- (Architecture ready for subsequent Login/Signup implementation)
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120),
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'pro', 'admin'
    plan_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(36),
    action VARCHAR(50) NOT NULL, -- 'login_success', 'login_failure', 'password_reset', 'file_processed'
    ip_address VARCHAR(45),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_workspaces (
    workspace_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    tool_id VARCHAR(50) NOT NULL, -- 'ai-file-summarizer', 'pdf-merger', etc.
    workspace_title VARCHAR(150),
    encrypted_payload BLOB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
