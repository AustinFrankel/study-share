-- Create indexes for performance and search

-- Trigram indexes for fuzzy search
CREATE INDEX idx_schools_name_trgm ON schools USING gin (name gin_trgm_ops);
CREATE INDEX idx_teachers_name_trgm ON teachers USING gin (name gin_trgm_ops);
CREATE INDEX idx_classes_title_trgm ON classes USING gin (title gin_trgm_ops);
CREATE INDEX idx_classes_code_trgm ON classes USING gin (code gin_trgm_ops);
CREATE INDEX idx_resources_title_trgm ON resources USING gin (title gin_trgm_ops);

-- Time-based indexes for feeds
CREATE INDEX idx_resources_created_at_desc ON resources (created_at DESC);
CREATE INDEX idx_comments_created_at_desc ON comments (created_at DESC);

-- Foreign key indexes for joins
CREATE INDEX idx_teachers_school_id ON teachers (school_id);
CREATE INDEX idx_classes_school_id ON classes (school_id);
CREATE INDEX idx_classes_subject_id ON classes (subject_id);
CREATE INDEX idx_classes_teacher_id ON classes (teacher_id);
CREATE INDEX idx_resources_class_id ON resources (class_id);
CREATE INDEX idx_resources_uploader_id ON resources (uploader_id);
CREATE INDEX idx_files_resource_id ON files (resource_id);
CREATE INDEX idx_ai_derivatives_resource_id ON ai_derivatives (resource_id);
CREATE INDEX idx_comments_resource_id ON comments (resource_id);
CREATE INDEX idx_votes_resource_id ON votes (resource_id);
CREATE INDEX idx_votes_voter_id ON votes (voter_id);
CREATE INDEX idx_flags_resource_id ON flags (resource_id);
CREATE INDEX idx_points_ledger_user_id ON points_ledger (user_id);

-- Composite indexes for common queries
CREATE INDEX idx_resources_class_created ON resources (class_id, created_at DESC);
CREATE INDEX idx_ai_derivatives_status ON ai_derivatives (status);
CREATE INDEX idx_resources_type ON resources (type);
