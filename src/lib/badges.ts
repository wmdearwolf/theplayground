import { supabase } from './supabase'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  points_required: number
}

export interface UserStats {
  totalQuizzes: number
  totalPoints: number
  savedResearch: number
  perfectScores: {
    math: number
    science: number
    history: number
    geography: number
  }
}

// Check and award badges based on user achievements
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  try {
    // Get user stats
    const stats = await getUserStats(userId)
    
    // Get all available badges
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')
      .order('points_required', { ascending: true })
    
    if (!allBadges) return []
    
    // Get user's current badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId)
    
    const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || [])
    const newlyEarnedBadges: Badge[] = []
    
    // Check each badge requirement
    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue // Already earned
      
      let shouldAward = false
      
      switch (badge.name) {
        case 'First Steps':
          shouldAward = stats.totalQuizzes >= 1
          break
          
        case 'Quiz Master':
          shouldAward = stats.totalQuizzes >= 10
          break
          
        case 'Researcher':
          shouldAward = stats.savedResearch >= 5
          break
          
        case 'Math Whiz':
          shouldAward = stats.perfectScores.math >= 5
          break
          
        case 'Scientist':
          shouldAward = stats.perfectScores.science >= 5
          break
          
        case 'Historian':
          shouldAward = stats.perfectScores.history >= 5
          break
          
        case 'Explorer':
          shouldAward = stats.perfectScores.geography >= 5
          break
          
        default:
          // Points-based badges
          shouldAward = stats.totalPoints >= badge.points_required
      }
      
      if (shouldAward) {
        // Award the badge
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id
          })
        
        if (!error) {
          newlyEarnedBadges.push(badge)
        }
      }
    }
    
    return newlyEarnedBadges
  } catch (error) {
    console.error('Error checking badges:', error)
    return []
  }
}

// Get comprehensive user statistics
async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Get total completed quizzes
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*, quiz:quizzes(subject:subjects(name))')
      .eq('user_id', userId)
      .eq('completed', true)
    
    // Get user points
    const { data: userData } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single()
    
    // Get saved research count
    const { data: savedData } = await supabase
      .from('saved_research')
      .select('id')
      .eq('user_id', userId)
    
    const totalQuizzes = progressData?.length || 0
    const totalPoints = userData?.points || 0
    const savedResearch = savedData?.length || 0
    
    // Count perfect scores by subject
    const perfectScores = {
      math: 0,
      science: 0,
      history: 0,
      geography: 0
    }
    
    if (progressData) {
      for (const progress of progressData) {
        if (progress.score === 100) {
          const subjectName = progress.quiz?.subject?.name?.toLowerCase()
          if (subjectName === 'mathematics' || subjectName === 'math') {
            perfectScores.math++
          } else if (subjectName === 'science') {
            perfectScores.science++
          } else if (subjectName === 'history') {
            perfectScores.history++
          } else if (subjectName === 'geography') {
            perfectScores.geography++
          }
        }
      }
    }
    
    return {
      totalQuizzes,
      totalPoints,
      savedResearch,
      perfectScores
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return {
      totalQuizzes: 0,
      totalPoints: 0,
      savedResearch: 0,
      perfectScores: { math: 0, science: 0, history: 0, geography: 0 }
    }
  }
}

// Get user's earned badges
export async function getUserBadges(userId: string): Promise<Badge[]> {
  try {
    const { data } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
    
    return data?.map(ub => ub.badge) || []
  } catch (error) {
    console.error('Error getting user badges:', error)
    return []
  }
}