-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_derivatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

-- Users: owner can read/write own row
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to insert their own user record on first login
CREATE POLICY "Users can insert self" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Schools, subjects, teachers, classes: readable by all
CREATE POLICY "Schools are viewable by everyone" ON schools
    FOR SELECT USING (true);

CREATE POLICY "Subjects are viewable by everyone" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "Teachers are viewable by everyone" ON teachers
    FOR SELECT USING (true);

CREATE POLICY "Classes are viewable by everyone" ON classes
    FOR SELECT USING (true);

-- Allow authenticated users to insert schools, subjects, teachers, classes for seeding
CREATE POLICY "Authenticated users can create schools" ON schools
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create subjects" ON subjects
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create teachers" ON teachers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create classes" ON classes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Resources: readable by all, writable by authenticated users
CREATE POLICY "Resources are viewable by everyone" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resources" ON resources
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own resources" ON resources
    FOR UPDATE USING (auth.uid() = uploader_id);

-- Files: readable by all, writable by authenticated users
CREATE POLICY "Files are viewable by everyone" ON files
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create files" ON files
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- AI derivatives: readable by all, writable by system
CREATE POLICY "AI derivatives are viewable by everyone" ON ai_derivatives
    FOR SELECT USING (true);

CREATE POLICY "System can manage AI derivatives" ON ai_derivatives
    FOR ALL USING (true);

-- Comments: readable by all, writable by authenticated users
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

-- Votes: readable by all, writable by authenticated users
CREATE POLICY "Votes are viewable by everyone" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own votes" ON votes
    FOR UPDATE USING (auth.uid() = voter_id);

CREATE POLICY "Users can delete own votes" ON votes
    FOR DELETE USING (auth.uid() = voter_id);

-- Tags and resource_tags: readable by all, writable by authenticated users
CREATE POLICY "Tags are viewable by everyone" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Resource tags are viewable by everyone" ON resource_tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can tag resources" ON resource_tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Flags: writable by authenticated users, readable by admins (for now, readable by all)
CREATE POLICY "Flags are viewable by everyone" ON flags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create flags" ON flags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Points ledger: owner can read, system can write
CREATE POLICY "Users can view own points" ON points_ledger
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage points" ON points_ledger
    FOR ALL USING (true);

-- Create a view for leaderboards (aggregate points)
CREATE VIEW user_points AS
SELECT 
    user_id,
    SUM(delta) as total_points,
    COUNT(*) as transaction_count
FROM points_ledger 
GROUP BY user_id;

-- Make the view accessible to everyone
GRANT SELECT ON user_points TO anon, authenticated;
