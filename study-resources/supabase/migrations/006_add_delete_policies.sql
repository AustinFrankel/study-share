-- Add missing DELETE policies for resources and related tables
-- Users can delete their own resources
CREATE POLICY "Users can delete own resources" ON resources
    FOR DELETE USING (auth.uid() = uploader_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- System/authenticated users can delete files (for cleanup)
CREATE POLICY "Authenticated users can delete files" ON files
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- System can delete AI derivatives (for cleanup)
CREATE POLICY "System can delete AI derivatives" ON ai_derivatives
    FOR DELETE USING (true);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON votes
    FOR DELETE USING (auth.uid() = voter_id);

-- Allow deletion of points ledger entries for cleanup
CREATE POLICY "System can delete points ledger entries" ON points_ledger
    FOR DELETE USING (true);
