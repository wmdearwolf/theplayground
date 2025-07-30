# Learning Adventure

An educational web application designed for kids to learn and have fun! This app features three main components: Knowledge Testing (Quizzes), Research Discovery, and Calculator & Reference tools, all with gamification elements to make learning engaging.

## Features

- **Knowledge Testing**: Interactive quizzes with gamification elements
- **Research Discovery**: Age-appropriate educational content discovery
- **Calculator & Reference**: Scientific calculator and reference materials

## Tech Stack

- **Frontend**: Next.js 13 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a Supabase account at [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your Supabase URL and anon key
   - Create a `.env.local` file in the root directory and add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Home page
├── components/          # React components
│   └── ui/              # UI components
├── lib/                 # Utility functions
│   └── supabase.ts      # Supabase client configuration
```

## Deployment

This project can be deployed to various platforms:

- **Netlify** (Recommended)
- **Railway**
- **Render**

### Netlify Deployment

1. Push your code to a GitHub repository
2. Connect your GitHub account to Netlify
3. Select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in Netlify dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

This project is licensed under the MIT License.