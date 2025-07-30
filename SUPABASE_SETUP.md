# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Learning Adventure educational app.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click on "Start your project" or "Sign Up"
3. Sign up using your GitHub account or email
4. Verify your email if required

## Step 2: Create a New Project

1. After logging in, click on "New Project"
2. Enter a name for your project (e.g., "learning-adventure")
3. Choose a strong database password
4. Select a region closest to your users
5. Click "Create new project"

Wait a few minutes for your project to be provisioned.

## Step 3: Get Your Project Credentials

1. Once your project is ready, go to Project Settings > API
2. Copy the Project URL and the anon public key
3. Create a `.env.local` file in the root of your project
4. Add the following to the file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Step 4: Set Up Database Tables

We need to create tables for our three main features. Go to the SQL Editor in your Supabase dashboard and run the following SQL commands:

### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### Subjects Table
```sql
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'book',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Quizzes Table
```sql
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Questions Table
```sql
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Answers Table
```sql
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Answers Table
```sql
CREATE TABLE user_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES answers(id),
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Progress Table
```sql
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Badges Table
```sql
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'star',
  color TEXT DEFAULT '#F59E0B',
  points_required INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Badges Table
```sql
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

### Research Items Table
```sql
CREATE TABLE research_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
  image_url TEXT,
  source TEXT,
  category TEXT DEFAULT 'general',
  age_appropriate BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Saved Research Table
```sql
CREATE TABLE saved_research (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  research_item_id UUID REFERENCES research_items(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, research_item_id)
);
```

### Reference Materials Table
```sql
CREATE TABLE reference_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Bookmarked References Table
```sql
CREATE TABLE bookmarked_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reference_id UUID REFERENCES reference_materials(id) ON DELETE CASCADE,
  bookmarked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reference_id)
);
```

## Step 5: Set Up Row Level Security (RLS)

Enable RLS on all tables to ensure data security:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_references ENABLE ROW LEVEL SECURITY;
```

## Step 6: Create RLS Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can view subjects
CREATE POLICY "Everyone can view subjects" ON subjects
  FOR SELECT USING (true);

-- Everyone can view quizzes
CREATE POLICY "Everyone can view quizzes" ON quizzes
  FOR SELECT USING (true);

-- Everyone can view questions
CREATE POLICY "Everyone can view questions" ON questions
  FOR SELECT USING (true);

-- Everyone can view answers
CREATE POLICY "Everyone can view answers" ON answers
  FOR SELECT USING (true);

-- Users can view their own answers
CREATE POLICY "Users can view own answers" ON user_answers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own answers
CREATE POLICY "Users can insert own answers" ON user_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Everyone can view badges
CREATE POLICY "Everyone can view badges" ON badges
  FOR SELECT USING (true);

-- Users can view their own badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own badges
CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Everyone can view research items
CREATE POLICY "Everyone can view research items" ON research_items
  FOR SELECT USING (true);

-- Users can view their saved research
CREATE POLICY "Users can view saved research" ON saved_research
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their saved research
CREATE POLICY "Users can insert saved research" ON saved_research
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their saved research
CREATE POLICY "Users can delete saved research" ON saved_research
  FOR DELETE USING (auth.uid() = user_id);

-- Everyone can view reference materials
CREATE POLICY "Everyone can view reference materials" ON reference_materials
  FOR SELECT USING (true);

-- Users can view their bookmarked references
CREATE POLICY "Users can view bookmarked references" ON bookmarked_references
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their bookmarked references
CREATE POLICY "Users can insert bookmarked references" ON bookmarked_references
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their bookmarked references
CREATE POLICY "Users can delete bookmarked references" ON bookmarked_references
  FOR DELETE USING (auth.uid() = user_id);
```

## Step 7: Insert Sample Data

```sql
-- Insert sample subjects
INSERT INTO subjects (name, description, color, icon) VALUES
('Math', 'Mathematics quizzes and problems', '#3B82F6', 'calculator'),
('Science', 'Science quizzes and facts', '#10B981', 'flask'),
('History', 'History quizzes and timelines', '#F59E0B', 'landmark'),
('Geography', 'Geography quizzes and maps', '#8B5CF6', 'globe');

-- Insert sample badges
INSERT INTO badges (name, description, icon, color, points_required) VALUES
('First Steps', 'Complete your first quiz', 'star', '#F59E0B', 0),
('Quiz Master', 'Complete 10 quizzes', 'trophy', '#8B5CF6', 100),
('Researcher', 'Save 5 research items', 'search', '#10B981', 50),
('Math Whiz', 'Score 100% on 5 math quizzes', 'calculator', '#3B82F6', 200),
('Scientist', 'Score 100% on 5 science quizzes', 'flask', '#10B981', 200),
('Historian', 'Score 100% on 5 history quizzes', 'landmark', '#F59E0B', 200),
('Explorer', 'Score 100% on 5 geography quizzes', 'globe', '#8B5CF6', 200);

-- Insert sample reference materials
INSERT INTO reference_materials (title, content, category, subject_id) VALUES
('Basic Math Formulas', 'Area of a rectangle: length × width\nArea of a circle: π × r²\nPerimeter of a rectangle: 2 × (length + width)\nCircumference of a circle: 2 × π × r', 'formulas', (SELECT id FROM subjects WHERE name = 'Math')),
('Scientific Method', '1. Ask a question\n2. Do background research\n3. Construct a hypothesis\n4. Test with an experiment\n5. Analyze results and draw conclusions\n6. Communicate results', 'method', (SELECT id FROM subjects WHERE name = 'Science')),
('World War II Timeline', '1939: Germany invades Poland\n1941: Pearl Harbor attacked\n1944: D-Day\n1945: War ends in Europe\n1945: Atomic bombs dropped on Japan', 'timeline', (SELECT id FROM subjects WHERE name = 'History')),
('Continents and Oceans', 'Continents: Asia, Africa, North America, South America, Antarctica, Europe, Australia\nOceans: Pacific, Atlantic, Indian, Southern, Arctic', 'geography', (SELECT id FROM subjects WHERE name = 'Geography'));
```

## Step 8: Create a User Profile Trigger

```sql
-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to execute the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Next Steps

After completing the Supabase setup, you can proceed with implementing the authentication system in your Next.js application.