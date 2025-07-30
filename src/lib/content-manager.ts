import { supabase } from './supabase'

export interface ContentItem {
  id: string
  type: 'quiz' | 'research_article' | 'badge_config'
  title: string
  content: any
  version: number
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  created_by: string
}

export interface ContentVersion {
  id: string
  content_id: string
  version: number
  content: any
  created_at: string
  created_by: string
}

export class ContentManager {
  /**
   * Create new content item
   */
  static async createContent(
    type: ContentItem['type'],
    title: string,
    content: any,
    createdBy: string
  ): Promise<{ data: ContentItem | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .insert({
          type,
          title,
          content,
          version: 1,
          status: 'draft',
          created_by: createdBy,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Create initial version
      if (data) {
        await this.createVersion(data.id, 1, content, createdBy)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error creating content:', error)
      return { data: null, error }
    }
  }

  /**
   * Update content item (creates new version)
   */
  static async updateContent(
    contentId: string,
    updates: Partial<Pick<ContentItem, 'title' | 'content' | 'status'>>,
    updatedBy: string
  ): Promise<{ data: ContentItem | null; error: any }> {
    try {
      // Get current content
      const { data: currentContent, error: fetchError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentId)
        .single()

      if (fetchError) throw fetchError

      const newVersion = currentContent.version + 1

      // Update content with new version
      const { data, error } = await supabase
        .from('content_items')
        .update({
          ...updates,
          version: newVersion,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .select()
        .single()

      if (error) throw error

      // Create version record
      if (data && updates.content) {
        await this.createVersion(contentId, newVersion, updates.content, updatedBy)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error updating content:', error)
      return { data: null, error }
    }
  }

  /**
   * Get content by type and status
   */
  static async getContent(
    type?: ContentItem['type'],
    status: ContentItem['status'] = 'published'
  ): Promise<{ data: ContentItem[] | null; error: any }> {
    try {
      let query = supabase
        .from('content_items')
        .select('*')
        .eq('status', status)
        .order('updated_at', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Error fetching content:', error)
      return { data: null, error }
    }
  }

  /**
   * Get content by ID
   */
  static async getContentById(id: string): Promise<{ data: ContentItem | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching content by ID:', error)
      return { data: null, error }
    }
  }

  /**
   * Publish content (make it live)
   */
  static async publishContent(
    contentId: string,
    publishedBy: string
  ): Promise<{ data: ContentItem | null; error: any }> {
    return this.updateContent(contentId, { status: 'published' }, publishedBy)
  }

  /**
   * Archive content (remove from live site)
   */
  static async archiveContent(
    contentId: string,
    archivedBy: string
  ): Promise<{ data: ContentItem | null; error: any }> {
    return this.updateContent(contentId, { status: 'archived' }, archivedBy)
  }

  /**
   * Get content versions
   */
  static async getContentVersions(contentId: string): Promise<{ data: ContentVersion[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', contentId)
        .order('version', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Error fetching content versions:', error)
      return { data: null, error }
    }
  }

  /**
   * Rollback to previous version
   */
  static async rollbackToVersion(
    contentId: string,
    version: number,
    rolledBackBy: string
  ): Promise<{ data: ContentItem | null; error: any }> {
    try {
      // Get the version content
      const { data: versionData, error: versionError } = await supabase
        .from('content_versions')
        .select('content')
        .eq('content_id', contentId)
        .eq('version', version)
        .single()

      if (versionError) throw versionError

      // Update content with version data
      return this.updateContent(
        contentId,
        { content: versionData.content },
        rolledBackBy
      )
    } catch (error) {
      console.error('Error rolling back content:', error)
      return { data: null, error }
    }
  }

  /**
   * Create version record
   */
  private static async createVersion(
    contentId: string,
    version: number,
    content: any,
    createdBy: string
  ): Promise<void> {
    try {
      await supabase
        .from('content_versions')
        .insert({
          content_id: contentId,
          version,
          content,
          created_by: createdBy
        })
    } catch (error) {
      console.error('Error creating content version:', error)
    }
  }

  /**
   * Bulk import content (for migrations)
   */
  static async bulkImportContent(
    items: Array<{
      type: ContentItem['type']
      title: string
      content: any
    }>,
    importedBy: string
  ): Promise<{ success: number; errors: any[] }> {
    let success = 0
    const errors: any[] = []

    for (const item of items) {
      const { data, error } = await this.createContent(
        item.type,
        item.title,
        item.content,
        importedBy
      )

      if (error) {
        errors.push({ item: item.title, error })
      } else {
        success++
        // Auto-publish imported content
        if (data) {
          await this.publishContent(data.id, importedBy)
        }
      }
    }

    return { success, errors }
  }

  /**
   * Search content
   */
  static async searchContent(
    query: string,
    type?: ContentItem['type'],
    status: ContentItem['status'] = 'published'
  ): Promise<{ data: ContentItem[] | null; error: any }> {
    try {
      let dbQuery = supabase
        .from('content_items')
        .select('*')
        .eq('status', status)
        .or(`title.ilike.%${query}%,content->>title.ilike.%${query}%`)
        .order('updated_at', { ascending: false })

      if (type) {
        dbQuery = dbQuery.eq('type', type)
      }

      const { data, error } = await dbQuery

      return { data, error }
    } catch (error) {
      console.error('Error searching content:', error)
      return { data: null, error }
    }
  }

  /**
   * Get content statistics
   */
  static async getContentStats(): Promise<{
    data: {
      total: number
      published: number
      draft: number
      archived: number
      byType: Record<string, number>
    } | null
    error: any
  }> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('type, status')

      if (error) throw error

      const stats = {
        total: data.length,
        published: data.filter(item => item.status === 'published').length,
        draft: data.filter(item => item.status === 'draft').length,
        archived: data.filter(item => item.status === 'archived').length,
        byType: data.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching content stats:', error)
      return { data: null, error }
    }
  }
}

// Helper functions for specific content types

export class QuizManager {
  static async createQuiz(quiz: any, createdBy: string) {
    return ContentManager.createContent('quiz', quiz.title, quiz, createdBy)
  }

  static async getPublishedQuizzes() {
    return ContentManager.getContent('quiz', 'published')
  }

  static async updateQuiz(quizId: string, updates: any, updatedBy: string) {
    return ContentManager.updateContent(quizId, { content: updates }, updatedBy)
  }
}

export class ResearchManager {
  static async createArticle(article: any, createdBy: string) {
    return ContentManager.createContent('research_article', article.title, article, createdBy)
  }

  static async getPublishedArticles() {
    return ContentManager.getContent('research_article', 'published')
  }

  static async updateArticle(articleId: string, updates: any, updatedBy: string) {
    return ContentManager.updateContent(articleId, { content: updates }, updatedBy)
  }
}

export class BadgeManager {
  static async createBadgeConfig(config: any, createdBy: string) {
    return ContentManager.createContent('badge_config', config.name, config, createdBy)
  }

  static async getBadgeConfigs() {
    return ContentManager.getContent('badge_config', 'published')
  }

  static async updateBadgeConfig(configId: string, updates: any, updatedBy: string) {
    return ContentManager.updateContent(configId, { content: updates }, updatedBy)
  }
}