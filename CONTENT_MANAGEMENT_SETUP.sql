-- Content Management System Database Schema
-- This schema supports versioned content management for safe deployments

-- Content Items Table
CREATE TABLE IF NOT EXISTS content_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('quiz', 'research_article', 'badge_config')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    CONSTRAINT content_items_title_check CHECK (char_length(title) > 0),
    CONSTRAINT content_items_version_check CHECK (version > 0)
);

-- Content Versions Table (for version history)
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Ensure unique version per content item
    UNIQUE(content_id, version),
    CONSTRAINT content_versions_version_check CHECK (version > 0)
);

-- Content Deployment Log (track deployments)
CREATE TABLE IF NOT EXISTS content_deployments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deployment_name TEXT NOT NULL,
    content_snapshot JSONB NOT NULL, -- Snapshot of all published content at deployment time
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'rollback')),
    notes TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON content_items(created_at);
CREATE INDEX IF NOT EXISTS idx_content_items_updated_at ON content_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_version ON content_versions(version);
CREATE INDEX IF NOT EXISTS idx_content_deployments_deployed_at ON content_deployments(deployed_at);

-- Full-text search index for content
CREATE INDEX IF NOT EXISTS idx_content_items_search ON content_items USING gin(
    to_tsvector('english', title || ' ' || (content->>'title') || ' ' || (content->>'description'))
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_deployments ENABLE ROW LEVEL SECURITY;

-- Content Items Policies
-- Anyone can read published content
CREATE POLICY "Anyone can read published content" ON content_items
    FOR SELECT USING (status = 'published');

-- Authenticated users can read all content
CREATE POLICY "Authenticated users can read all content" ON content_items
    FOR SELECT TO authenticated USING (true);

-- Only authenticated users can create content
CREATE POLICY "Authenticated users can create content" ON content_items
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Users can update their own content or admins can update any
CREATE POLICY "Users can update own content" ON content_items
    FOR UPDATE TO authenticated USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (users.email LIKE '%@admin.%' OR users.username = 'admin')
        )
    );

-- Content Versions Policies
-- Users can read versions of content they can read
CREATE POLICY "Users can read content versions" ON content_versions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM content_items 
            WHERE id = content_versions.content_id
        )
    );

-- Users can create versions for content they can update
CREATE POLICY "Users can create content versions" ON content_versions
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM content_items 
            WHERE id = content_versions.content_id 
            AND (created_by = auth.uid() OR 
                 EXISTS (
                     SELECT 1 FROM users 
                     WHERE id = auth.uid() 
                     AND (users.email LIKE '%@admin.%' OR users.username = 'admin')
                 )
            )
        )
    );

-- Content Deployments Policies
-- Only admins can read deployment logs
CREATE POLICY "Admins can read deployments" ON content_deployments
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (users.email LIKE '%@admin.%' OR users.username = 'admin')
        )
    );

-- Only admins can create deployment logs
CREATE POLICY "Admins can create deployments" ON content_deployments
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (users.email LIKE '%@admin.%' OR users.username = 'admin')
        ) AND auth.uid() = deployed_by
    );

-- Functions for content management

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_content_items_updated_at 
    BEFORE UPDATE ON content_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get published content by type
CREATE OR REPLACE FUNCTION get_published_content(content_type TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    content JSONB,
    version INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    IF content_type IS NULL THEN
        RETURN QUERY
        SELECT ci.id, ci.type, ci.title, ci.content, ci.version, ci.created_at, ci.updated_at
        FROM content_items ci
        WHERE ci.status = 'published'
        ORDER BY ci.updated_at DESC;
    ELSE
        RETURN QUERY
        SELECT ci.id, ci.type, ci.title, ci.content, ci.version, ci.created_at, ci.updated_at
        FROM content_items ci
        WHERE ci.status = 'published' AND ci.type = content_type
        ORDER BY ci.updated_at DESC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create content deployment snapshot
CREATE OR REPLACE FUNCTION create_deployment_snapshot(
    deployment_name TEXT,
    deployed_by_id UUID,
    deployment_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    deployment_id UUID;
    content_snapshot JSONB;
BEGIN
    -- Create snapshot of all published content
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'type', type,
            'title', title,
            'content', content,
            'version', version
        )
    ) INTO content_snapshot
    FROM content_items
    WHERE status = 'published';

    -- Insert deployment record
    INSERT INTO content_deployments (deployment_name, content_snapshot, deployed_by, notes)
    VALUES (deployment_name, content_snapshot, deployed_by_id, deployment_notes)
    RETURNING id INTO deployment_id;

    RETURN deployment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rollback to a previous deployment
CREATE OR REPLACE FUNCTION rollback_to_deployment(
    deployment_id UUID,
    rolled_back_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    deployment_record RECORD;
    content_item JSONB;
BEGIN
    -- Get the deployment record
    SELECT * INTO deployment_record
    FROM content_deployments
    WHERE id = deployment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deployment not found';
    END IF;

    -- Archive all current published content
    UPDATE content_items 
    SET status = 'archived', updated_at = NOW()
    WHERE status = 'published';

    -- Restore content from snapshot
    FOR content_item IN SELECT * FROM jsonb_array_elements(deployment_record.content_snapshot)
    LOOP
        -- Check if content item exists
        IF EXISTS (SELECT 1 FROM content_items WHERE id = (content_item->>'id')::UUID) THEN
            -- Update existing item
            UPDATE content_items
            SET 
                content = content_item->'content',
                version = (content_item->>'version')::INTEGER + 1,
                status = 'published',
                updated_at = NOW()
            WHERE id = (content_item->>'id')::UUID;
        ELSE
            -- Insert new item (in case it was deleted)
            INSERT INTO content_items (id, type, title, content, version, status, created_by)
            VALUES (
                (content_item->>'id')::UUID,
                content_item->>'type',
                content_item->>'title',
                content_item->'content',
                (content_item->>'version')::INTEGER + 1,
                'published',
                rolled_back_by
            );
        END IF;
    END LOOP;

    -- Log the rollback
    INSERT INTO content_deployments (deployment_name, content_snapshot, deployed_by, status, notes)
    VALUES (
        'Rollback to ' || deployment_record.deployment_name,
        deployment_record.content_snapshot,
        rolled_back_by,
        'rollback',
        'Rolled back to deployment: ' || deployment_record.deployment_name
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some initial content management data
INSERT INTO content_items (type, title, content, status, created_by) VALUES
('badge_config', 'First Steps Badge', '{"name": "First Steps", "description": "Complete your first quiz", "icon": "🎯", "requirement": {"type": "quiz_completion", "count": 1}}', 'published', (SELECT id FROM auth.users LIMIT 1)),
('badge_config', 'Knowledge Seeker Badge', '{"name": "Knowledge Seeker", "description": "Complete 5 quizzes", "icon": "📚", "requirement": {"type": "quiz_completion", "count": 5}}', 'published', (SELECT id FROM auth.users LIMIT 1)),
('badge_config', 'Research Explorer Badge', '{"name": "Research Explorer", "description": "Save 3 research articles", "icon": "🔬", "requirement": {"type": "research_saved", "count": 3}}', 'published', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON content_items TO authenticated;
GRANT ALL ON content_versions TO authenticated;
GRANT ALL ON content_deployments TO authenticated;
GRANT EXECUTE ON FUNCTION get_published_content TO authenticated;
GRANT EXECUTE ON FUNCTION create_deployment_snapshot TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_to_deployment TO authenticated;