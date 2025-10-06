-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type varchar(50) NOT NULL, -- 'comment_reply', 'comment_vote', 'resource_rating', etc.
  title text NOT NULL,
  message text NOT NULL,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Function to create notifications for comment replies
CREATE OR REPLACE FUNCTION notify_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
    parent_author_id uuid;
    resource_title text;
    sender_handle text;
BEGIN
    -- Only create notification for replies (not top-level comments)
    IF NEW.parent_id IS NOT NULL THEN
        -- Get the author of the parent comment
        SELECT author_id INTO parent_author_id
        FROM comments 
        WHERE id = NEW.parent_id;
        
        -- Don't notify if user is replying to themselves
        IF parent_author_id != NEW.author_id THEN
            -- Get resource title and sender handle
            SELECT r.title INTO resource_title
            FROM resources r
            WHERE r.id = NEW.resource_id;
            
            SELECT u.handle INTO sender_handle
            FROM users u
            WHERE u.id = NEW.author_id;
            
            -- Create notification
            INSERT INTO notifications (
                recipient_id,
                sender_id,
                type,
                title,
                message,
                resource_id,
                comment_id
            ) VALUES (
                parent_author_id,
                NEW.author_id,
                'comment_reply',
                'New reply to your comment',
                sender_handle || ' replied to your comment on "' || COALESCE(resource_title, 'Unknown Resource') || '"',
                NEW.resource_id,
                NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment reply notifications
DROP TRIGGER IF EXISTS trigger_notify_comment_reply ON comments;
CREATE TRIGGER trigger_notify_comment_reply
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION notify_comment_reply();
