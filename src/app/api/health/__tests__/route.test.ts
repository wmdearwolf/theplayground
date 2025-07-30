/**
 * @jest-environment node
 */

import { GET, HEAD } from '../route'
import { NextRequest } from 'next/server'

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn(),
    })),
  },
}))

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up environment variables
    process.env.NODE_ENV = 'test'
    process.env.npm_package_version = '1.0.0'
  })

  describe('GET /api/health', () => {
    it('should return healthy status when database is connected', async () => {
      const { supabase } = require('@/lib/supabase')
      
      // Mock successful database query
      supabase.from().limit.mockResolvedValue({
        data: [],
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/health')
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data.database).toBe('connected')
      expect(data.version).toBe('1.0.0')
      expect(data.environment).toBe('test')
      expect(data.timestamp).toBeDefined()
    })

    it('should return unhealthy status when database query fails', async () => {
      const { supabase } = require('@/lib/supabase')
      
      // Mock database error
      supabase.from().limit.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.status).toBe('unhealthy')
      expect(data.database).toBe('disconnected')
      expect(data.error).toBe('Database connection failed')
      expect(data.environment).toBe('test')
    })

    it('should handle database connection exceptions', async () => {
      const { supabase } = require('@/lib/supabase')
      
      // Mock database exception
      supabase.from().limit.mockRejectedValue(new Error('Network timeout'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.status).toBe('unhealthy')
      expect(data.database).toBe('disconnected')
      expect(data.error).toBe('Network timeout')
    })

    it('should use default values when environment variables are missing', async () => {
      const { supabase } = require('@/lib/supabase')
      
      // Remove environment variables
      delete process.env.NODE_ENV
      delete process.env.npm_package_version
      
      supabase.from().limit.mockResolvedValue({
        data: [],
        error: null,
      })

      const response = await GET()
      const data = await response.json()

      expect(data.version).toBe('1.0.0')
      expect(data.environment).toBe('development')
    })
  })

  describe('HEAD /api/health', () => {
    it('should return 200 when database is connected', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from().limit.mockResolvedValue({
        data: [],
        error: null,
      })

      const response = await HEAD()

      expect(response.status).toBe(200)
      expect(response.body).toBeNull()
    })

    it('should return 500 when database query fails', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from().limit.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      })

      const response = await HEAD()

      expect(response.status).toBe(500)
      expect(response.body).toBeNull()
    })

    it('should return 500 when database throws exception', async () => {
      const { supabase } = require('@/lib/supabase')
      
      supabase.from().limit.mockRejectedValue(new Error('Network error'))

      const response = await HEAD()

      expect(response.status).toBe(500)
      expect(response.body).toBeNull()
    })
  })

  describe('Database Query Structure', () => {
    it('should query users table with correct parameters', async () => {
      const { supabase } = require('@/lib/supabase')
      
      const mockSelect = jest.fn().mockReturnThis()
      const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null })
      
      supabase.from.mockReturnValue({
        select: mockSelect,
        limit: mockLimit,
      })

      await GET()

      expect(supabase.from).toHaveBeenCalledWith('users')
      expect(mockSelect).toHaveBeenCalledWith('count')
      expect(mockLimit).toHaveBeenCalledWith(1)
    })
  })
})