-- 1. CREATE NEW TABLE FOR FOOD CATEGORIES (for Level 2)
CREATE TABLE food_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL,
    category_name TEXT NOT NULL, -- E.g. 'Proteins', 'Carbohydrates', 'Vegetables'
    parent_category_id UUID REFERENCES food_categories(id), -- For subcategories, e.g. 'Lean white meat' is subcategory of 'Proteins'
    avg_calories NUMERIC, -- Average values for easier planning
    avg_protein NUMERIC,
    avg_carbs NUMERIC,
    avg_fat NUMERIC,
    standard_portion_size TEXT, -- E.g. '1 cup', '150g', '1 handful'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Coaches can manage their food categories" 
ON food_categories 
FOR ALL 
USING (coach_id = auth.uid());

CREATE POLICY "Users can view food categories" 
ON food_categories 
FOR SELECT 
USING (true);

-- 2. MODIFY EXISTING 'meal_plans' TABLE
ALTER TABLE meal_plans
ADD COLUMN plan_level INT NOT NULL DEFAULT 3, -- 3: Specific, 2: Flexible, 1: Habits
ADD COLUMN weekly_focus TEXT, -- For Level 1: Weekly focus, e.g. 'Increase fiber intake'
ADD COLUMN weekly_habit_ids UUID[], -- Array of habit IDs for that week
ADD COLUMN weekly_recipe_ids UUID[]; -- Array of recommended recipe IDs for the week

-- 3. MODIFY EXISTING 'meal_plan_entries' TO BE MORE FLEXIBLE
-- This table will now only be used for Level 3 and Level 2
ALTER TABLE meal_plan_entries
ADD COLUMN food_category_id UUID REFERENCES food_categories(id);

-- Add trigger for timestamps on food_categories
CREATE TRIGGER update_food_categories_updated_at
BEFORE UPDATE ON food_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_food_categories_coach_id ON food_categories(coach_id);
CREATE INDEX idx_food_categories_parent_id ON food_categories(parent_category_id);
CREATE INDEX idx_meal_plans_level ON meal_plans(plan_level);
CREATE INDEX idx_meal_plan_entries_category ON meal_plan_entries(food_category_id);