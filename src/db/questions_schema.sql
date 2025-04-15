
-- Sample Questions Table for Hamaspeak
CREATE TABLE IF NOT EXISTS sample_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO sample_questions (question, response, category, difficulty, tags)
VALUES 
  ('Do you have a favorite teacher from school? Why did you like them?', 
   'Yes, I do. My favorite teacher was my high school literature instructor. She was genuinely passionate about teaching and always encouraged us to develop a variety of skills and abilities beyond the core subjects.',
   'Education', 'intermediate', ARRAY['school', 'teachers']),
  
  ('What kind of music do you enjoy listening to?', 
   'I enjoy listening to various genres, but I particularly like jazz and classical music. They help me relax after a long day and improve my focus when I'm working or studying.',
   'Entertainment', 'beginner', ARRAY['music', 'hobbies']),
  
  ('Do you prefer living in a city or in the countryside?', 
   'I prefer living in the city because of the convenience and opportunities it offers. Cities have better access to services, entertainment options, and career possibilities that align with my interests.',
   'Lifestyle', 'beginner', ARRAY['living', 'preferences']),
  
  ('How do you usually spend your weekends?', 
   'I usually spend my weekends catching up with friends or family. I also enjoy pursuing my hobbies like photography and trying new restaurants or cafes in different parts of the city.',
   'Daily Life', 'beginner', ARRAY['free time', 'routines']),
  
  ('What changes would you like to see in your hometown?', 
   'I'd like to see more green spaces and improved public transportation in my hometown. These changes would make the city more livable and environmentally friendly for all residents.',
   'Society', 'intermediate', ARRAY['environment', 'community']),

  ('What are the benefits of learning a foreign language?', 
   'Learning a foreign language opens up many opportunities for personal and professional growth. It helps you understand different cultures, communicate with more people, and even improves your cognitive abilities.',
   'Education', 'intermediate', ARRAY['languages', 'learning']),
   
  ('How important is technology in your daily life?', 
   'Technology is extremely important in my daily life. I use it for work, communication, entertainment, and learning, which makes many tasks more efficient and helps me stay connected with people around the world.',
   'Technology', 'intermediate', ARRAY['modern life', 'digital']),
   
  ('What do you think are the qualities of a good friend?', 
   'I believe the qualities of a good friend include trustworthiness, loyalty, and empathy. A good friend should be someone who supports you during difficult times and celebrates your successes.',
   'Relationships', 'intermediate', ARRAY['friendship', 'personal']),
   
  ('How do you think education will change in the future?', 
   'I think education will become more personalized and technology-driven in the future. Online learning will continue to grow, and there will be more emphasis on developing practical skills alongside theoretical knowledge.',
   'Education', 'advanced', ARRAY['future', 'development']),
   
  ('What are some ways to reduce environmental pollution?', 
   'Some effective ways to reduce environmental pollution include using public transportation, reducing plastic consumption, and supporting renewable energy. Individual actions combined with policy changes can make a significant difference.',
   'Environment', 'advanced', ARRAY['climate', 'sustainability']);
   
-- Create an index on category for faster searches
CREATE INDEX IF NOT EXISTS sample_questions_category_idx ON sample_questions(category);

-- Create an index on difficulty level
CREATE INDEX IF NOT EXISTS sample_questions_difficulty_idx ON sample_questions(difficulty);

-- Create a GIN index for the tags array
CREATE INDEX IF NOT EXISTS sample_questions_tags_idx ON sample_questions USING GIN(tags);
