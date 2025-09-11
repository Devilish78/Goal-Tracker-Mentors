// AI suggestions with robust fallbacks - no API dependency
import { setupAIPrompt, applyPromptToData } from './api'

// Initialize AI prompts on app startup - NOW EXPORTED
export async function initializeAIPrompts() {
  try {
    // Set up contextual goal suggestions prompt
    await setupAIPrompt(
      'contextual_goal_suggestions',
      ['user_context', 'existing_goals', 'user_preferences'],
      `Based on the user's context: {user_context}, existing goals: {existing_goals}, and preferences: {user_preferences}, suggest 3 relevant goals in JSON format. Each goal should have: title, description, goal_type (daily/weekly/yearly), and reasoning. Return as a JSON array.`
    )

    // Set up habit stacking suggestions prompt
    await setupAIPrompt(
      'habit_stacking_suggestions',
      ['existing_habits', 'new_goal', 'user_schedule'],
      `Given existing habits: {existing_habits}, new goal: {new_goal}, and schedule: {user_schedule}, suggest 3 habit stacking combinations in the format "After I [existing habit], I will [work on new goal]". Return as plain text, one per line.`
    )

    // Set up micro goal breakdown prompt
    await setupAIPrompt(
      'micro_goal_breakdown',
      ['yearly_goal', 'timeline', 'constraints'],
      `Break down this yearly goal: {yearly_goal} into 3-5 micro goals over timeline: {timeline} with constraints: {constraints}. Return JSON array with objects containing: title, description, target_date, order_index.`
    )

    // Set up reflection prompts
    await setupAIPrompt(
      'reflection_prompts',
      ['goal_progress', 'challenges', 'goal_type'],
      `Generate 3 thoughtful reflection questions based on goal progress: {goal_progress}, challenges: {challenges}, and goal type: {goal_type}. Return JSON array with objects containing: question, purpose.`
    )

    console.log('AI prompts initialized successfully')
    return { success: true }
  } catch (error) {
    console.warn('Failed to initialize AI prompts, using fallback mode:', error)
    return { success: false, error: error.message }
  }
}

export async function getContextualSuggestions(userContext, existingGoals) {
  // Always use fallback suggestions to avoid API dependency
  console.log('Using fallback contextual suggestions')
  return getFallbackContextualSuggestions(userContext)
}

export async function getHistoryBasedSuggestions(goalHistory, userPreferences) {
  // Always use fallback suggestions to avoid API dependency
  console.log('Using fallback history-based suggestions')
  return getFallbackHistorySuggestions(goalHistory, userPreferences)
}

export async function getHabitStackingSuggestions(existingHabits, newGoal, userSchedule) {
  // Always use fallback suggestions to avoid API dependency
  console.log('Using fallback habit stacking suggestions')
  return getFallbackHabitSuggestions(newGoal)
}

export async function generateMicroGoals(yearlyGoal, timeline, constraints) {
  // Always use fallback suggestions to avoid API dependency
  console.log('Using fallback micro goals')
  return getFallbackMicroGoals(yearlyGoal)
}

export async function generateReflectionPrompts(goalProgress, challenges, goalType) {
  // Always use fallback suggestions to avoid API dependency
  console.log('Using fallback reflection prompts')
  return getFallbackReflectionPrompts()
}

// Enhanced fallback functions with more variety and intelligence
function getFallbackContextualSuggestions(userContext) {
  const timeOfDay = userContext?.timeOfDay || 'morning'
  const season = userContext?.season || 'spring'
  
  const allSuggestions = [
    // Morning suggestions
    {
      title: 'Morning Meditation',
      description: 'Start your day with 10 minutes of mindfulness and deep breathing',
      goal_type: 'daily',
      reasoning: 'Morning routines help set a positive tone for the day and reduce stress',
      timeContext: 'morning'
    },
    {
      title: 'Sunrise Walk',
      description: 'Take a 20-minute walk outside to energize your morning',
      goal_type: 'daily',
      reasoning: 'Morning sunlight helps regulate circadian rhythms and boosts mood',
      timeContext: 'morning'
    },
    {
      title: 'Healthy Breakfast Routine',
      description: 'Prepare and eat a nutritious breakfast every morning',
      goal_type: 'daily',
      reasoning: 'A good breakfast provides energy and nutrients for the day ahead',
      timeContext: 'morning'
    },
    
    // Afternoon suggestions
    {
      title: 'Midday Movement Break',
      description: 'Take a 15-minute movement break during your workday',
      goal_type: 'daily',
      reasoning: 'Regular movement breaks improve focus and reduce physical strain',
      timeContext: 'afternoon'
    },
    {
      title: 'Lunch Hour Learning',
      description: 'Spend 30 minutes learning something new during lunch',
      goal_type: 'daily',
      reasoning: 'Continuous learning keeps your mind sharp and opens opportunities',
      timeContext: 'afternoon'
    },
    
    // Evening suggestions
    {
      title: 'Evening Gratitude Journal',
      description: 'Write down 3 things you\'re grateful for each evening',
      goal_type: 'daily',
      reasoning: 'Gratitude practice improves mental well-being and life satisfaction',
      timeContext: 'evening'
    },
    {
      title: 'Digital Sunset',
      description: 'Put away all screens 1 hour before bedtime',
      goal_type: 'daily',
      reasoning: 'Reducing blue light exposure improves sleep quality',
      timeContext: 'evening'
    },
    
    // Weekly goals
    {
      title: 'Weekly Nature Adventure',
      description: 'Spend at least 2 hours in nature each week',
      goal_type: 'weekly',
      reasoning: 'Time in nature reduces stress and improves mental health'
    },
    {
      title: 'Social Connection Time',
      description: 'Have a meaningful conversation with a friend or family member',
      goal_type: 'weekly',
      reasoning: 'Strong social connections are essential for happiness and longevity'
    },
    {
      title: 'Creative Expression',
      description: 'Dedicate time to a creative hobby or artistic pursuit',
      goal_type: 'weekly',
      reasoning: 'Creative activities reduce stress and provide a sense of accomplishment'
    },
    
    // Yearly goals
    {
      title: 'Learn a New Language',
      description: 'Achieve conversational level in a language you\'ve always wanted to learn',
      goal_type: 'yearly',
      reasoning: 'Language learning improves cognitive function and opens cultural doors'
    },
    {
      title: 'Complete a Fitness Challenge',
      description: 'Train for and complete a marathon, triathlon, or fitness milestone',
      goal_type: 'yearly',
      reasoning: 'Long-term fitness goals provide motivation and improve overall health'
    },
    {
      title: 'Master a New Skill',
      description: 'Become proficient in a skill that interests you or advances your career',
      goal_type: 'yearly',
      reasoning: 'Skill development keeps you competitive and provides personal satisfaction'
    },
    
    // Seasonal suggestions
    {
      title: 'Spring Garden Project',
      description: 'Start and maintain a small garden or herb collection',
      goal_type: 'yearly',
      reasoning: 'Gardening connects you with nature and provides fresh, healthy food',
      season: 'spring'
    },
    {
      title: 'Summer Outdoor Adventures',
      description: 'Try 5 new outdoor activities this summer',
      goal_type: 'yearly',
      reasoning: 'Summer is perfect for exploring new outdoor experiences',
      season: 'summer'
    },
    {
      title: 'Fall Learning Project',
      description: 'Take an online course or workshop in something that interests you',
      goal_type: 'yearly',
      reasoning: 'Fall is traditionally a time for learning and personal growth',
      season: 'fall'
    },
    {
      title: 'Winter Wellness Focus',
      description: 'Develop a consistent self-care routine for the winter months',
      goal_type: 'yearly',
      reasoning: 'Winter wellness routines help combat seasonal mood changes',
      season: 'winter'
    }
  ]

  // Filter suggestions based on context
  let filteredSuggestions = allSuggestions

  if (timeOfDay && timeOfDay !== 'morning') {
    filteredSuggestions = filteredSuggestions.filter(s => 
      !s.timeContext || s.timeContext === timeOfDay || s.goal_type !== 'daily'
    )
  }

  if (season) {
    filteredSuggestions = filteredSuggestions.filter(s => 
      !s.season || s.season === season
    )
  }

  // Return 3 random suggestions from the filtered list
  const shuffled = filteredSuggestions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3)
}

function getFallbackHistorySuggestions(goalHistory, userPreferences) {
  const completedCount = goalHistory?.completed?.length || 0
  const currentCount = goalHistory?.current?.length || 0
  const preferredType = userPreferences?.preferredGoalTypes || 'daily'

  const suggestions = [
    {
      title: 'Improve Sleep Schedule',
      description: 'Go to bed and wake up at consistent times every day',
      goal_type: 'daily',
      reasoning: 'Good sleep is the foundation of all other healthy habits'
    },
    {
      title: 'Weekly Meal Prep',
      description: 'Prepare healthy meals for the week every Sunday',
      goal_type: 'weekly',
      reasoning: 'Meal prep saves time and helps maintain healthy eating habits'
    },
    {
      title: 'Monthly Budget Review',
      description: 'Review and optimize your budget every month',
      goal_type: 'weekly',
      reasoning: 'Regular financial check-ins help you stay on track with money goals'
    },
    {
      title: 'Daily Reading Habit',
      description: 'Read for at least 20 minutes every day',
      goal_type: 'daily',
      reasoning: 'Reading expands knowledge and improves focus and vocabulary'
    },
    {
      title: 'Exercise Consistency',
      description: 'Work out at least 3 times per week',
      goal_type: 'weekly',
      reasoning: 'Regular exercise improves physical and mental health'
    },
    {
      title: 'Learn a Professional Skill',
      description: 'Develop a skill that will advance your career this year',
      goal_type: 'yearly',
      reasoning: 'Professional development opens new opportunities and increases earning potential'
    }
  ]

  // If user has completed many goals, suggest more challenging ones
  if (completedCount > 5) {
    suggestions.push({
      title: 'Mentor Someone',
      description: 'Share your knowledge by mentoring someone in your field',
      goal_type: 'yearly',
      reasoning: 'Based on your success with goals, you could help others achieve theirs'
    })
  }

  // If user has many current goals, suggest simpler ones
  if (currentCount > 3) {
    suggestions.unshift({
      title: 'Daily Mindfulness Check-in',
      description: 'Take 5 minutes each day to check in with yourself',
      goal_type: 'daily',
      reasoning: 'With many active goals, mindfulness can help you stay focused and balanced'
    })
  }

  // Filter by preferred type if specified
  let filtered = suggestions
  if (preferredType && preferredType !== 'mixed') {
    filtered = suggestions.filter(s => s.goal_type === preferredType)
    // If not enough of preferred type, add some others
    if (filtered.length < 2) {
      filtered = suggestions.slice(0, 3)
    }
  }

  return filtered.slice(0, 3)
}

function getFallbackHabitSuggestions(newGoal) {
  const goalTitle = newGoal?.title?.toLowerCase() || ''
  
  const suggestions = []
  
  // Exercise-related suggestions
  if (goalTitle.includes('exercise') || goalTitle.includes('workout') || goalTitle.includes('fitness')) {
    suggestions.push(
      'After I brush my teeth in the morning, I will do 10 push-ups',
      'After I finish my morning coffee, I will do a 5-minute stretch routine',
      'After I get home from work, I will change into workout clothes immediately'
    )
  }
  // Reading-related suggestions
  else if (goalTitle.includes('read') || goalTitle.includes('book') || goalTitle.includes('learn')) {
    suggestions.push(
      'After I eat breakfast, I will read for 15 minutes',
      'After I finish work, I will read instead of checking social media',
      'After I get into bed, I will read for 10 minutes before sleep'
    )
  }
  // Health/wellness suggestions
  else if (goalTitle.includes('health') || goalTitle.includes('meditat') || goalTitle.includes('mindful')) {
    suggestions.push(
      'After I wake up, I will drink a glass of water',
      'After I sit down at my desk, I will take 3 deep breaths',
      'After I finish lunch, I will take a 5-minute walk'
    )
  }
  // Productivity suggestions
  else if (goalTitle.includes('work') || goalTitle.includes('productiv') || goalTitle.includes('focus')) {
    suggestions.push(
      'After I start my computer, I will review my daily priorities',
      'After I finish a task, I will take a 2-minute break',
      'After I eat lunch, I will organize my workspace'
    )
  }
  // Creative suggestions
  else if (goalTitle.includes('creat') || goalTitle.includes('write') || goalTitle.includes('art')) {
    suggestions.push(
      'After I finish dinner, I will spend 20 minutes on my creative project',
      'After I drink my morning coffee, I will write in my journal',
      'After I complete my work tasks, I will work on my creative goal'
    )
  }
  // Generic suggestions for any goal
  else {
    suggestions.push(
      'After I check my phone in the morning, I will work on my goal for 10 minutes',
      'After I eat lunch, I will spend 15 minutes on my goal',
      'After I finish work, I will dedicate 20 minutes to my goal'
    )
  }

  // Add some universal good habits if we need more suggestions
  while (suggestions.length < 3) {
    const universalSuggestions = [
      'After I brush my teeth, I will review my goal progress',
      'After I drink my morning coffee, I will work on my goal',
      'After I finish dinner, I will spend time on personal development',
      'After I get ready for bed, I will reflect on my goal progress'
    ]
    
    for (const suggestion of universalSuggestions) {
      if (!suggestions.includes(suggestion)) {
        suggestions.push(suggestion)
        break
      }
    }
  }

  return suggestions.slice(0, 3)
}

function getFallbackMicroGoals(yearlyGoal) {
  const goalTitle = yearlyGoal?.title?.toLowerCase() || ''
  const currentDate = new Date()
  
  // Create dates for micro goals throughout the year
  const getTargetDate = (monthsFromNow) => {
    const date = new Date(currentDate)
    date.setMonth(date.getMonth() + monthsFromNow)
    return date.toISOString().split('T')[0]
  }

  let microGoals = []

  // Fitness-related micro goals
  if (goalTitle.includes('fitness') || goalTitle.includes('exercise') || goalTitle.includes('marathon') || goalTitle.includes('weight')) {
    microGoals = [
      {
        title: 'Establish Exercise Routine',
        description: 'Create a consistent workout schedule and stick to it for 30 days',
        target_date: getTargetDate(1),
        order_index: 0
      },
      {
        title: 'Build Endurance Base',
        description: 'Focus on building cardiovascular endurance and basic strength',
        target_date: getTargetDate(3),
        order_index: 1
      },
      {
        title: 'Increase Intensity',
        description: 'Add more challenging workouts and longer training sessions',
        target_date: getTargetDate(6),
        order_index: 2
      },
      {
        title: 'Peak Performance Phase',
        description: 'Reach your highest fitness level and maintain it',
        target_date: getTargetDate(9),
        order_index: 3
      },
      {
        title: 'Achieve Final Goal',
        description: 'Complete your fitness milestone and celebrate your achievement',
        target_date: getTargetDate(12),
        order_index: 4
      }
    ]
  }
  // Learning-related micro goals
  else if (goalTitle.includes('learn') || goalTitle.includes('language') || goalTitle.includes('skill') || goalTitle.includes('course')) {
    microGoals = [
      {
        title: 'Research and Plan',
        description: 'Research learning resources and create a structured learning plan',
        target_date: getTargetDate(1),
        order_index: 0
      },
      {
        title: 'Master the Basics',
        description: 'Learn and practice fundamental concepts and skills',
        target_date: getTargetDate(3),
        order_index: 1
      },
      {
        title: 'Intermediate Proficiency',
        description: 'Develop intermediate-level skills and start practical application',
        target_date: getTargetDate(6),
        order_index: 2
      },
      {
        title: 'Advanced Application',
        description: 'Apply your skills in real-world scenarios and complex projects',
        target_date: getTargetDate(9),
        order_index: 3
      },
      {
        title: 'Mastery and Teaching',
        description: 'Achieve proficiency and share your knowledge with others',
        target_date: getTargetDate(12),
        order_index: 4
      }
    ]
  }
  // Career-related micro goals
  else if (goalTitle.includes('career') || goalTitle.includes('job') || goalTitle.includes('promotion') || goalTitle.includes('business')) {
    microGoals = [
      {
        title: 'Assess Current Position',
        description: 'Evaluate your current skills, experience, and career trajectory',
        target_date: getTargetDate(1),
        order_index: 0
      },
      {
        title: 'Develop Key Skills',
        description: 'Identify and develop the skills needed for your career goal',
        target_date: getTargetDate(4),
        order_index: 1
      },
      {
        title: 'Build Network',
        description: 'Connect with professionals in your field and expand your network',
        target_date: getTargetDate(6),
        order_index: 2
      },
      {
        title: 'Gain Experience',
        description: 'Take on projects or roles that provide relevant experience',
        target_date: getTargetDate(9),
        order_index: 3
      },
      {
        title: 'Achieve Career Milestone',
        description: 'Reach your career goal and plan for continued growth',
        target_date: getTargetDate(12),
        order_index: 4
      }
    ]
  }
  // Financial micro goals
  else if (goalTitle.includes('save') || goalTitle.includes('money') || goalTitle.includes('financial') || goalTitle.includes('budget')) {
    microGoals = [
      {
        title: 'Create Financial Plan',
        description: 'Assess your current finances and create a detailed savings plan',
        target_date: getTargetDate(1),
        order_index: 0
      },
      {
        title: 'Optimize Expenses',
        description: 'Review and reduce unnecessary expenses to increase savings',
        target_date: getTargetDate(2),
        order_index: 1
      },
      {
        title: 'Increase Income',
        description: 'Explore ways to increase your income through side hustles or career advancement',
        target_date: getTargetDate(4),
        order_index: 2
      },
      {
        title: 'Build Emergency Fund',
        description: 'Establish a solid emergency fund before focusing on other financial goals',
        target_date: getTargetDate(6),
        order_index: 3
      },
      {
        title: 'Reach Savings Target',
        description: 'Achieve your financial goal and plan for future investments',
        target_date: getTargetDate(12),
        order_index: 4
      }
    ]
  }
  // Generic micro goals for any yearly goal
  else {
    microGoals = [
      {
        title: 'Define Specific Objectives',
        description: 'Break down your yearly goal into specific, measurable objectives',
        target_date: getTargetDate(1),
        order_index: 0
      },
      {
        title: 'Create Action Plan',
        description: 'Develop a detailed plan with timelines and milestones',
        target_date: getTargetDate(2),
        order_index: 1
      },
      {
        title: 'Build Momentum',
        description: 'Start implementation and build consistent daily habits',
        target_date: getTargetDate(4),
        order_index: 2
      },
      {
        title: 'Overcome Challenges',
        description: 'Address obstacles and adjust your approach as needed',
        target_date: getTargetDate(8),
        order_index: 3
      },
      {
        title: 'Achieve Your Goal',
        description: 'Complete your yearly goal and celebrate your success',
        target_date: getTargetDate(12),
        order_index: 4
      }
    ]
  }

  return microGoals
}

function getFallbackReflectionPrompts() {
  const prompts = [
    {
      question: "What's one thing you learned about yourself while working on your goals this week?",
      purpose: "Self-awareness and personal growth"
    },
    {
      question: "Which goal brought you the most satisfaction when you made progress on it?",
      purpose: "Identifying motivation sources"
    },
    {
      question: "What obstacle did you overcome recently, and how did you do it?",
      purpose: "Building resilience strategies"
    },
    {
      question: "How has working on your goals changed your daily routine?",
      purpose: "Recognizing positive changes"
    },
    {
      question: "What would you tell someone who's struggling with the same goal you're working on?",
      purpose: "Consolidating lessons learned"
    },
    {
      question: "When you think about your progress, what are you most proud of?",
      purpose: "Celebrating achievements"
    },
    {
      question: "What's one small change you could make to improve your goal progress?",
      purpose: "Continuous improvement"
    },
    {
      question: "How do you feel when you complete a task related to your goals?",
      purpose: "Understanding emotional rewards"
    },
    {
      question: "What support or resources have been most helpful in your goal journey?",
      purpose: "Identifying success factors"
    },
    {
      question: "If you could go back and give yourself advice when you started this goal, what would it be?",
      purpose: "Reflecting on growth and learning"
    }
  ]

  // Return 3 random prompts
  const shuffled = prompts.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3)
}
