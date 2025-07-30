# Testing Guide for Learning Adventure

This guide provides a comprehensive testing plan to ensure all features of the Learning Adventure application work together properly.

## Testing Overview

The Learning Adventure application consists of three main features:
1. Knowledge Testing (Quiz System)
2. Research Discovery
3. Calculator & Reference

This guide will help you test each feature individually and as an integrated system.

## Prerequisites

Before testing, ensure you have:
- A working development environment with all dependencies installed
- A configured Supabase project with the required tables and data
- A test user account for authentication testing

## Setting Up the Test Environment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and API key

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`

## Feature Testing

### 1. Authentication System Testing

#### User Registration
1. Navigate to `/auth`
2. Click on the "Sign Up" tab
3. Enter a valid email address and password
4. Verify that the user is created in Supabase
5. Check that the user is redirected to the dashboard

#### User Login
1. Navigate to `/auth`
2. Click on the "Sign In" tab
3. Enter the credentials of a registered user
4. Verify that the user is successfully logged in
5. Check that the user is redirected to the dashboard

#### User Logout
1. Log in as a user
2. Click the "Sign Out" button in the navigation
3. Verify that the user is logged out
4. Check that the user is redirected to the home page

#### Protected Routes
1. Try to access `/dashboard`, `/quizzes`, `/research`, or `/calculator` without being logged in
2. Verify that you are redirected to the auth page
3. Log in and try to access these routes again
4. Verify that you can now access them

### 2. Knowledge Testing (Quiz System) Testing

#### Quiz Listing
1. Navigate to `/quizzes`
2. Verify that all available quizzes are displayed
3. Check that each quiz shows the subject, difficulty, and question count
4. Verify that the "Start Quiz" button works for each quiz

#### Quiz Taking
1. Start a quiz
2. Verify that the first question is displayed correctly
3. Select an answer and click "Next"
4. Verify that the next question is displayed
5. Continue through all questions
6. Verify that the results page shows the correct score

#### Quiz Results
1. Complete a quiz
2. Verify that the score is calculated correctly
3. Check that the results show which questions were answered correctly/incorrectly
4. Verify that the score is saved to the user's progress

#### Progress Tracking
1. Navigate to `/dashboard`
2. Verify that completed quizzes are shown in the progress section
3. Check that the scores and completion dates are correct
4. Verify that the overall progress percentage is accurate

#### Gamification Elements
1. Take multiple quizzes to earn points
2. Verify that points are added to the user's total
3. Check if badges are awarded for reaching milestones
4. Verify that the user level increases with earned points

### 3. Research Discovery Testing

#### Search Functionality
1. Navigate to `/research`
2. Enter a search term in the search box
3. Click "Search"
4. Verify that relevant results are displayed
5. Check that the results include titles, descriptions, and sources

#### Content Filtering
1. Perform a search that might return non-age-appropriate content
2. Verify that the content is filtered appropriately
3. Check that all displayed content is suitable for a 12-year-old

#### Saving Research Items
1. Find a research item
2. Click the "Save" button
3. Verify that the item is added to the saved items list
4. Navigate to the saved items tab
5. Verify that the saved item appears there

#### Content Summarization
1. Find a research item with a long description
2. Verify that a summary is provided
3. Check that the summary is age-appropriate and easy to understand

### 4. Calculator & Reference Testing

#### Calculator Functionality
1. Navigate to `/calculator`
2. Test basic arithmetic operations (+, -, *, /)
3. Verify that the results are correct
4. Test more complex operations (parentheses, exponents, etc.)
5. Verify that the calculator handles errors gracefully

#### Reference Materials
1. Navigate to the reference section
2. Verify that reference materials are categorized by subject
3. Check that each reference item has a title and content
4. Verify that the content is displayed correctly

#### Saving Reference Items
1. Find a reference item
2. Click the "Bookmark" button
3. Verify that the item is added to the bookmarks
4. Navigate to the bookmarks tab
5. Verify that the bookmarked item appears there

#### Category and Subject Filtering
1. Select a category from the dropdown
2. Verify that only items from that category are displayed
3. Select a subject from the dropdown
4. Verify that only items from that subject are displayed

## Integration Testing

### Cross-Feature Integration
1. Take a quiz and earn points
2. Navigate to the dashboard
3. Verify that the points are reflected in the user's profile
4. Save research items and reference bookmarks
5. Verify that all saved items are accessible from the dashboard

### Navigation Testing
1. Test all navigation links from the main navigation
2. Verify that each link takes you to the correct page
3. Test the mobile navigation menu
4. Verify that all links work correctly on mobile devices

### Responsive Design Testing
1. Test the application on different screen sizes (mobile, tablet, desktop)
2. Verify that the layout adjusts correctly
3. Check that all interactive elements are accessible on all devices

## Performance Testing

### Page Load Times
1. Test the load time of each page
2. Verify that pages load within an acceptable time frame (under 3 seconds)
3. Check that images and other assets load properly

### Database Performance
1. Test operations that interact with the database
2. Verify that database queries execute quickly
3. Check that the application handles slow database responses gracefully

## User Acceptance Testing

### Target User Testing
1. Have a 12-year-old test the application
2. Observe their interaction with the interface
3. Collect feedback on usability and engagement
4. Note any areas of confusion or difficulty

### Parent/Guardian Testing
1. Have a parent or guardian test the application
2. Verify that they find the content appropriate
3. Collect feedback on educational value
4. Note any concerns or suggestions

## Bug Reporting

### Reporting Process
1. Document any bugs or issues found during testing
2. Include steps to reproduce the issue
3. Note the expected behavior vs. actual behavior
4. Include screenshots or screen recordings if applicable

### Common Issues to Check For
- Broken links or navigation elements
- Form validation errors
- Display issues on different browsers or devices
- Performance bottlenecks
- Security vulnerabilities

## Test Automation (Optional)

### Setting Up Automated Tests
1. Install testing frameworks (Jest, React Testing Library, Cypress)
2. Write unit tests for utility functions
3. Write integration tests for key user flows
4. Set up end-to-end tests for critical paths

### Continuous Integration
1. Configure automated tests to run on code changes
2. Set up test coverage reporting
3. Ensure tests pass before merging code

## Conclusion

By following this comprehensive testing guide, you can ensure that the Learning Adventure application provides a high-quality, engaging, and educational experience for its target audience. Regular testing and quality assurance will help maintain and improve the application over time.