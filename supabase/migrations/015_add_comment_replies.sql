-- Add support for comment replies
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS reply_count int DEFAULT 0;

-- Create index for better performance when fetching replies
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_resource_parent ON comments(resource_id, parent_id);

-- Create a function to update reply count when a reply is added/removed
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment reply count for parent comment
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET reply_count = reply_count + 1 
            WHERE id = NEW.parent_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement reply count for parent comment
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET reply_count = GREATEST(reply_count - 1, 0) 
            WHERE id = OLD.parent_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update reply counts
DROP TRIGGER IF EXISTS trigger_update_comment_reply_count ON comments;
CREATE TRIGGER trigger_update_comment_reply_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_reply_count();
