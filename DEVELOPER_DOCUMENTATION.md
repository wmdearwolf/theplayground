# Developer Documentation for Learning Adventure

This documentation provides information for developers who will be maintaining, extending, or contributing to the Learning Adventure application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Development Workflow](#development-workflow)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Component Library](#component-library)
9. [Styling Guidelines](#styling-guidelines)
10. [Testing Guidelines](#testing-guidelines)
11. [Deployment Process](#deployment-process)
12. [Contributing Guidelines](#contributing-guidelines)
13. [Troubleshooting](#troubleshooting)

## Project Overview

Learning Adventure is an educational web application designed for 12-year-old students. It features three main components:

1. **Knowledge Testing (Quiz System)**: Interactive quizzes with gamification elements
2. **Research Discovery**: Age-appropriate content discovery and summarization
3. **Calculator & Reference**: Scientific calculator and reference materials

The application is built with a focus on making learning engaging and fun through gamification, colorful UI, and interactive elements.

## Technology Stack

### Frontend
- **Framework**: Next.js 13 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Supabase Auth

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint
- **Type Checking**: TypeScript

## Project Structure

```
learning-adventure/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── calculator/        # Calculator & Reference pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── quizzes/           # Quiz system pages
│   │   ├── research/          # Research discovery pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable React components
│   │   ├── ui/                # Base UI components
│   │   └── navigation.tsx     # Navigation component
│   ├── contexts/              # React contexts
│   │   └── auth-context.tsx   # Authentication context
│   └── lib/                   # Utility functions
│       └── supabase.ts        # Supabase client configuration
├── public/                    # Static assets
├── package.json               # Project dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project overview
```

## Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/learning-adventure.git
   cd learning-adventure
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Follow the instructions in `SUPABASE_SETUP.md` to set up your Supabase database
   - Run the SQL migrations to create the required tables

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Development Workflow

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `hotfix/*`: Emergency fixes

### Commit Convention
Use semantic commit messages:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

Example:
```
feat: add quiz timer functionality
fix: resolve issue with login redirect
docs: update API documentation
```

### Code Review Process
1. Create a pull request from your feature branch to `develop`
2. Ensure all tests pass
3. Request review from at least one team member
4. Address any feedback
5. Merge the pull request

## Database Schema

### Tables

#### users
Stores user account information.
- `id` (UUID): Primary key
- `email` (TEXT): User email address
- `created_at` (TIMESTAMP): Account creation date
- `updated_at` (TIMESTAMP): Last update date

#### subjects
Stores subject categories for quizzes and reference materials.
- `id` (UUID): Primary key
- `name` (TEXT): Subject name
- `description` (TEXT): Subject description
- `color` (TEXT): Subject color for UI
- `created_at` (TIMESTAMP): Creation date

#### quizzes
Stores quiz information.
- `id` (UUID): Primary key
- `subject_id` (UUID): Foreign key to subjects
- `title` (TEXT): Quiz title
- `description` (TEXT): Quiz description
- `difficulty` (INTEGER): Quiz difficulty (1-5)
- `created_at` (TIMESTAMP): Creation date

#### questions
Stores quiz questions.
- `id` (UUID): Primary key
- `quiz_id` (UUID): Foreign key to quizzes
- `question_text` (TEXT): Question text
- `question_type` (TEXT): Question type (multiple-choice, true-false)
- `created_at` (TIMESTAMP): Creation date

#### answers
Stores answer options for questions.
- `id` (UUID): Primary key
- `question_id` (UUID): Foreign key to questions
- `answer_text` (TEXT): Answer text
- `is_correct` (BOOLEAN): Whether this is the correct answer
- `created_at` (TIMESTAMP): Creation date

#### user_answers
Stores user's quiz answers.
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `question_id` (UUID): Foreign key to questions
- `answer_id` (UUID): Foreign key to answers
- `created_at` (TIMESTAMP): Answer date

#### user_progress
Stores user's overall progress.
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `total_points` (INTEGER): Total points earned
- `quizzes_completed` (INTEGER): Number of completed quizzes
- `current_level` (INTEGER): User's current level
- `created_at` (TIMESTAMP): Creation date
- `updated_at` (TIMESTAMP): Last update date

#### research_items
Stores research content.
- `id` (UUID): Primary key
- `title` (TEXT): Research item title
- `description` (TEXT): Research item description
- `content` (TEXT): Full content
- `summary` (TEXT): Content summary
- `source` (TEXT): Content source
- `url` (TEXT): Source URL
- `category` (TEXT): Content category
- `created_at` (TIMESTAMP): Creation date

#### saved_research
Stores user's saved research items.
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `research_item_id` (UUID): Foreign key to research_items
- `created_at` (TIMESTAMP): Creation date

#### reference_items
Stores reference materials.
- `id` (UUID): Primary key
- `title` (TEXT): Reference item title
- `content` (TEXT): Reference content
- `subject_id` (UUID): Foreign key to subjects
- `category` (TEXT): Reference category
- `created_at` (TIMESTAMP): Creation date

#### saved_references
Stores user's saved reference items.
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `reference_item_id` (UUID): Foreign key to reference_items
- `created_at` (TIMESTAMP): Creation date

## API Reference

### Authentication API

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Sign In
```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Sign Out
```
POST /api/auth/signout
```

### Quiz API

#### Get All Quizzes
```
GET /api/quizzes
```

#### Get Quiz by ID
```
GET /api/quizzes/[id]
```

#### Submit Quiz Answer
```
POST /api/quizzes/answer
Content-Type: application/json

{
  "questionId": "question-uuid",
  "answerId": "answer-uuid"
}
```

#### Get User Progress
```
GET /api/user/progress
```

### Research API

#### Search Research Items
```
GET /api/research/search?q=query
```

#### Get Research Item by ID
```
GET /api/research/[id]
```

#### Save Research Item
```
POST /api/research/save
Content-Type: application/json

{
  "researchItemId": "research-item-uuid"
}
```

### Reference API

#### Get Reference Items
```
GET /api/reference?category=category&subject=subject
```

#### Get Reference Item by ID
```
GET /api/reference/[id]
```

#### Save Reference Item
```
POST /api/reference/save
Content-Type: application/json

{
  "referenceItemId": "reference-item-uuid"
}
```

## Component Library

### Base UI Components

#### Button
A reusable button component with different variants.

```tsx
import { Button } from '@/components/ui/button'

// Basic button
<Button>Click me</Button>

// Primary button
<Button variant="primary">Primary Action</Button>

// Outline button
<Button variant="outline">Secondary Action</Button>
```

Props:
- `variant`: 'default' | 'primary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `onClick`: function

### Navigation Component

The main navigation component that displays different links based on authentication status.

```tsx
import { Navigation } from '@/components/navigation'

// Usage in layout
<Navigation />
```

### Page Components

#### QuizPage
Displays a list of available quizzes.

```tsx
// src/app/quizzes/page.tsx
export default function QuizPage() {
  // Component implementation
}
```

#### QuizDetailPage
Displays and handles a specific quiz.

```tsx
// src/app/quizzes/[id]/page.tsx
export default function QuizDetailPage({ params }) {
  // Component implementation
}
```

#### ResearchPage
Handles research discovery and search.

```tsx
// src/app/research/page.tsx
export default function ResearchPage() {
  // Component implementation
}
```

#### CalculatorPage
Provides calculator and reference materials.

```tsx
// src/app/calculator/page.tsx
export default function CalculatorPage() {
  // Component implementation
}
```

## Styling Guidelines

### Color Palette
- Primary: Blue (#3B82F6)
- Secondary: Red (#EF4444)
- Accent: Green (#22C55E)
- Background: Light gray (#F9FAFB)
- Text: Dark gray (#111827)

### Typography
- Font: Inter (system font stack)
- Headings: Bold, with gradient text for main headings
- Body: Regular, with good contrast for readability

### Spacing
- Use Tailwind's spacing scale (4px base unit)
- Consistent padding and margins for components
- Responsive spacing for different screen sizes

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test on various screen sizes

## Testing Guidelines

### Unit Testing
- Use Jest for unit tests
- Test utility functions and simple components
- Aim for high code coverage

### Integration Testing
- Test component interactions
- Test API routes
- Use React Testing Library

### End-to-End Testing
- Test critical user flows
- Use Cypress or Playwright
- Test authentication, quiz taking, and other key features

### Test Structure
```
src/
├── components/
│   └── __tests__/
├── lib/
│   └── __tests__/
└── app/
    └── __tests__/
```

## Deployment Process

### Environment Setup
1. Development: Local development environment
2. Staging: Preview deployments for testing
3. Production: Live application

### Deployment Steps
1. Push changes to the main branch
2. Automated tests run
3. If tests pass, deploy to staging
4. Manual approval for production deployment
5. Deploy to production

### Environment Variables
- Keep sensitive data in environment variables
- Use different variables for each environment
- Document required variables in `.env.local.example`

## Contributing Guidelines

### Code Style
- Follow the existing code style
- Use TypeScript for type safety
- Write clear, descriptive comments
- Keep functions small and focused

### Pull Request Process
1. Create a feature branch from `develop`
2. Make your changes
3. Write tests for new functionality
4. Update documentation if needed
5. Create a pull request
6. Address review feedback
7. Merge to `develop`

### Issue Reporting
- Use GitHub issues for bug reports and feature requests
- Provide clear steps to reproduce bugs
- Include screenshots if applicable
- Use the appropriate issue template

## Troubleshooting

### Common Issues

#### Build Errors
- Check TypeScript errors
- Verify all dependencies are installed
- Ensure environment variables are set correctly

#### Database Issues
- Verify Supabase connection
- Check database schema
- Review RLS policies

#### Authentication Issues
- Verify Supabase configuration
- Check environment variables
- Review auth context implementation

### Debugging Tips
- Use browser developer tools
- Check console for errors
- Use Next.js debugging features
- Log important actions and data

### Performance Optimization
- Optimize images and assets
- Use code splitting for large components
- Implement lazy loading where appropriate
- Monitor bundle size

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Community
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss)

### Tools
- [VS Code](https://code.visualstudio.com/) with recommended extensions
- [Git](https://git-scm.com/) for version control
- [npm](https://www.npmjs.com/) for package management

## Conclusion

This documentation provides a comprehensive guide for developers working on the Learning Adventure application. By following these guidelines and conventions, we can ensure a consistent, maintainable, and high-quality codebase.

For any questions or clarifications, please reach out to the project maintainers.