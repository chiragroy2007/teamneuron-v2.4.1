-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    education TEXT,
    role TEXT,
    current_projects TEXT,
    linkedin_url TEXT,
    availability TEXT,
    skills TEXT, -- Stored as JSON string
    interests TEXT, -- Stored as JSON string
    expertise TEXT, -- Stored as JSON string
    collaboration_preferences TEXT, -- Stored as JSON string
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    banner_url TEXT,
    logo_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_id TEXT REFERENCES users(id),
    category_id TEXT REFERENCES categories(id),
    club_id TEXT REFERENCES clubs(id),
    tags TEXT, -- Stored as JSON string
    is_featured INTEGER DEFAULT 0,
    published_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT REFERENCES users(id),
    category_id TEXT REFERENCES categories(id),
    club_id TEXT REFERENCES clubs(id),
    tags TEXT, -- Stored as JSON string
    is_pinned INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    author_id TEXT REFERENCES users(id),
    article_id TEXT REFERENCES articles(id),
    discussion_id TEXT REFERENCES discussions(id),
    parent_id TEXT REFERENCES comments(id),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Club Members
CREATE TABLE IF NOT EXISTS club_members (
    id TEXT PRIMARY KEY,
    club_id TEXT REFERENCES clubs(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Club Posts
CREATE TABLE IF NOT EXISTS club_posts (
    id TEXT PRIMARY KEY,
    club_id TEXT REFERENCES clubs(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Post Templates
CREATE TABLE IF NOT EXISTS post_templates (
    id TEXT PRIMARY KEY,
    owner_id TEXT REFERENCES users(id),
    scope TEXT DEFAULT 'user', -- 'global' or 'user'
    title TEXT NOT NULL,
    content TEXT,
    default_tags TEXT, -- JSON
    default_skills TEXT, -- JSON
    default_commitment TEXT,
    default_collaboration_types TEXT, -- JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Hypes table
CREATE TABLE IF NOT EXISTS hypes (
    id TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Hype Counter for Synapse
INSERT OR IGNORE INTO hypes (id, count) VALUES ('synapse', 0);

-- Insert Initial Categories (if not exist)
INSERT OR IGNORE INTO categories (id, name, slug, color) VALUES 
('cat_1', 'Neuroscience', 'neuroscience', '#10b981'),
('cat_2', 'Biotechnology', 'biotech', '#3b82f6'),
('cat_3', 'Cognitive Science', 'cognitive-sci', '#8b5cf6'),
('cat_4', 'Neurology', 'neurology', '#f59e0b'),
('cat_5', 'Research', 'research', '#ec4899'),
('cat_6', 'General', 'general', '#6b7280');

-- Synapse Skills Table
CREATE TABLE IF NOT EXISTS synapse_skills (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    type TEXT NOT NULL, -- 'TEACH' or 'LEARN'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table for Chat System
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TEXT, -- Timestamp when read
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
