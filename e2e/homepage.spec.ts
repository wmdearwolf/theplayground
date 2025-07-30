import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check if the main heading is visible
    await expect(page.locator('h1')).toContainText('The Playground')
    
    // Check if the main description is visible
    await expect(page.locator('text=Where curiosity meets discovery!')).toBeVisible()
    
    // Check if the main CTA button is visible
    await expect(page.locator('text=Start Learning Now!')).toBeVisible()
  })

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation items
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('text=Home')).toBeVisible()
    await expect(page.locator('text=Quizzes')).toBeVisible()
    await expect(page.locator('text=Research')).toBeVisible()
    await expect(page.locator('text=Calculator')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Profile')).toBeVisible()
  })

  test('should display feature cards', async ({ page }) => {
    await page.goto('/')
    
    // Check feature cards
    await expect(page.locator('text=Quiz Center')).toBeVisible()
    await expect(page.locator('text=Research Discovery')).toBeVisible()
    await expect(page.locator('text=Scientific Calculator')).toBeVisible()
    await expect(page.locator('text=Your Dashboard')).toBeVisible()
  })

  test('should display fun facts carousel', async ({ page }) => {
    await page.goto('/')
    
    // Check fun facts section
    await expect(page.locator('text=Fun Fact of the Moment')).toBeVisible()
    
    // Check if at least one fun fact is visible
    const funFactText = page.locator('text=/Did you know|Fun fact|Amazing|Cool|Wow|Incredible/')
    await expect(funFactText.first()).toBeVisible()
  })

  test('should display learning tips section', async ({ page }) => {
    await page.goto('/')
    
    // Check learning tips section
    await expect(page.locator('text=Learning Tips for Success!')).toBeVisible()
    await expect(page.locator('text=Set Goals')).toBeVisible()
    await expect(page.locator('text=Practice Daily')).toBeVisible()
    await expect(page.locator('text=Ask Questions')).toBeVisible()
    await expect(page.locator('text=Read More')).toBeVisible()
    await expect(page.locator('text=Celebrate Wins')).toBeVisible()
    await expect(page.locator('text=Have Fun')).toBeVisible()
  })

  test('should navigate to auth page when clicking CTA', async ({ page }) => {
    await page.goto('/')
    
    // Click the main CTA button
    await page.click('text=Start Learning Now!')
    
    // Should navigate to auth page
    await expect(page).toHaveURL('/auth')
  })

  test('should navigate to feature pages', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation to quizzes
    await page.click('text=Quizzes')
    await expect(page).toHaveURL('/quizzes')
    
    // Go back to home
    await page.goto('/')
    
    // Test navigation to research
    await page.click('text=Research')
    await expect(page).toHaveURL('/research')
    
    // Go back to home
    await page.goto('/')
    
    // Test navigation to calculator
    await page.click('text=Calculator')
    await expect(page).toHaveURL('/calculator')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check if main content is still visible
    await expect(page.locator('h1')).toContainText('The Playground')
    
    // Check if navigation is responsive (might be collapsed)
    await expect(page.locator('nav')).toBeVisible()
    
    // Check if feature cards are stacked properly
    await expect(page.locator('text=Quiz Center')).toBeVisible()
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/The Playground|Learning Adventure/)
    
    // Check meta description (if present)
    const metaDescription = page.locator('meta[name="description"]')
    if (await metaDescription.count() > 0) {
      await expect(metaDescription).toHaveAttribute('content', /.+/)
    }
  })
})