-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    handle text NOT NULL,
    handle_version int DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- Schools table
CREATE TABLE schools (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    city text,
    state text
);

-- Subjects table
CREATE TABLE subjects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL
);

-- Teachers table
CREATE TABLE teachers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id uuid REFERENCES schools(id),
    name text NOT NULL
);

-- Classes table
CREATE TABLE classes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id uuid REFERENCES schools(id),
    subject_id uuid REFERENCES subjects(id),
    teacher_id uuid REFERENCES teachers(id),
    code text,
    title text,
    term text
);

-- Resources table
CREATE TABLE resources (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id uuid REFERENCES classes(id),
    uploader_id uuid REFERENCES users(id),
    type text CHECK (type IN ('notes', 'past_material', 'study_guide', 'practice_set')),
    title text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Files table
CREATE TABLE files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id uuid REFERENCES resources(id),
    storage_path text NOT NULL,
    original_filename text,
    mime text,
    pages_json jsonb
);

-- AI derivatives table
CREATE TABLE ai_derivatives (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id uuid REFERENCES resources(id),
    status text CHECK (status IN ('pending', 'ready', 'blocked')) DEFAULT 'pending',
    summary text,
    structured_json jsonb,
    html_render text,
    reasons text[]
);

-- Comments table
CREATE TABLE comments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id uuid REFERENCES resources(id),
    author_id uuid REFERENCES users(id),
    body text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Votes table
CREATE TABLE votes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id uuid REFERENCES resources(id),
    voter_id uuid REFERENCES users(id),
    value int CHECK (value IN (-1, 1)),
    created_at timestamptz DEFAULT now(),
    UNIQUE(resource_id, voter_id)
);

-- Tags table
CREATE TABLE tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE
);

-- Resource tags junction table
CREATE TABLE resource_tags (
    resource_id uuid REFERENCES resources(id),
    tag_id uuid REFERENCES tags(id),
    PRIMARY KEY(resource_id, tag_id)
);

-- Flags table
CREATE TABLE flags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id uuid REFERENCES resources(id),
    flagger_id uuid REFERENCES users(id),
    reason text CHECK (reason IN ('wrong_info', 'copyright', 'live_exam', 'spam')),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Points ledger table
CREATE TABLE points_ledger (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES users(id),
    delta int NOT NULL,
    reason text,
    created_at timestamptz DEFAULT now()
);
