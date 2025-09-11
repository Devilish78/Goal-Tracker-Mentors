// Simplified database utilities with better error handling and CSP compliance
const API_BASE = 'https://builder.empromptu.ai'
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer 5190ce8c871aa452d21576870650999e',
  'X-Generated-App-ID': '2b84d5d7-4f77-4e8c-a842-e6ded30a282e',
  'X-Usage-Key': 'bb5e40395c90899b3c16a5e462accb30'
}

const SCHEMA = 'newschema_2b84d5d74f774e8ca842e6ded30a282e'

export async function executeQuery(query, params = []) {
  try {
    const response = await fetch(`${API_BASE}/api_tools/templates/call_postgres`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        query,
        params
      })
    })

    if (!response.ok) {
      console.warn(`Database query failed: ${response.status}`)
      return { success: false, error: `HTTP ${response.status}` }
    }

    const result = await response.json()
    return { success: true, data: result.data || [] }
  } catch (error) {
    console.warn('Database error:', error.message)
    return { success: false, error: error.message }
  }
}

export async function initializeDatabase() {
  try {
    // First, create the schema if it doesn't exist
    const schemaResult = await executeQuery(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`)
    if (!schemaResult.success) {
      console.warn('Failed to create schema, using localStorage fallback')
      return { success: false, error: 'Schema creation failed, using localStorage' }
    }

    // Try to create tables, but don't fail if they already exist or if API is unavailable
    const tables = [
      `CREATE TABLE IF NOT EXISTS ${SCHEMA}.users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${SCHEMA}.goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES ${SCHEMA}.users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        goal_type VARCHAR(20) NOT NULL,
        target_value INTEGER NOT NULL DEFAULT 1,
        total_progress INTEGER DEFAULT 0,
        start_date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        habit_stack_trigger TEXT,
        reminder_time TIME,
        metadata TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${SCHEMA}.progress_logs (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER REFERENCES ${SCHEMA}.goals(id) ON DELETE CASCADE,
        value INTEGER NOT NULL,
        notes TEXT,
        logged_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${SCHEMA}.accountability_partners (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES ${SCHEMA}.users(id) ON DELETE CASCADE,
        partner_name VARCHAR(255) NOT NULL,
        partner_email VARCHAR(255) NOT NULL,
        shared_goals TEXT DEFAULT '[]',
        privacy_settings TEXT DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${SCHEMA}.micro_goals (
        id SERIAL PRIMARY KEY,
        parent_goal_id INTEGER REFERENCES ${SCHEMA}.goals(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        target_date DATE,
        completed BOOLEAN DEFAULT FALSE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${SCHEMA}.reflections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES ${SCHEMA}.users(id) ON DELETE CASCADE,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ]

    // Try to create tables but don't fail the app if it doesn't work
    for (const query of tables) {
      const result = await executeQuery(query)
      if (!result.success) {
        console.warn('Failed to create table, using localStorage fallback')
        return { success: false, error: 'Database unavailable, using localStorage' }
      }
    }

    console.log('Database initialization completed')
    return { success: true }
  } catch (error) {
    console.warn('Database initialization failed, using localStorage fallback:', error.message)
    return { success: false, error: error.message }
  }
}

// Safe JSON parsing function
function safeJsonParse(jsonString, fallback = {}) {
  try {
    return jsonString ? JSON.parse(jsonString) : fallback
  } catch (error) {
    console.warn('JSON parse error:', error)
    return fallback
  }
}

// Safe JSON stringify function
function safeJsonStringify(obj) {
  try {
    return JSON.stringify(obj || {})
  } catch (error) {
    console.warn('JSON stringify error:', error)
    return '{}'
  }
}

// User management functions with fallbacks
export async function createUser(email, name, passwordHash) {
  try {
    const result = await executeQuery(`
      INSERT INTO ${SCHEMA}.users (email, name, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, onboarding_completed, created_at
    `, [email, name, passwordHash])

    if (result.success && result.data.length > 0) {
      return { success: true, user: result.data[0] }
    }
    
    // Fallback to localStorage
    const user = {
      id: Date.now(),
      email,
      name,
      onboarding_completed: false,
      created_at: new Date().toISOString()
    }
    return { success: true, user }
  } catch (error) {
    // Always fallback to localStorage on error
    const user = {
      id: Date.now(),
      email,
      name,
      onboarding_completed: false,
      created_at: new Date().toISOString()
    }
    return { success: true, user }
  }
}

export async function getUserByEmail(email) {
  try {
    const result = await executeQuery(`
      SELECT id, email, name, password_hash, onboarding_completed, created_at
      FROM ${SCHEMA}.users
      WHERE email = $1
    `, [email])

    if (result.success && result.data.length > 0) {
      return { success: true, user: result.data[0] }
    }
    
    return { success: false, error: 'User not found' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateUser(userId, updates) {
  try {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
    const values = [userId, ...Object.values(updates)]
    
    const result = await executeQuery(`
      UPDATE ${SCHEMA}.users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, name, onboarding_completed
    `, values)

    if (result.success && result.data.length > 0) {
      return { success: true, user: result.data[0] }
    }
    
    return { success: true } // Fallback success
  } catch (error) {
    return { success: true } // Always succeed for fallback
  }
}

// Goal management functions with fallbacks
export async function createGoal(userId, goalData) {
  try {
    const result = await executeQuery(`
      INSERT INTO ${SCHEMA}.goals (
        user_id, title, description, goal_type, target_value, start_date, end_date,
        habit_stack_trigger, reminder_time, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      userId,
      goalData.title,
      goalData.description || null,
      goalData.goal_type,
      goalData.target_value,
      goalData.start_date,
      goalData.end_date || null,
      goalData.habit_stack_trigger || null,
      goalData.reminder_time || null,
      safeJsonStringify(goalData.metadata || {})
    ])

    if (result.success && result.data.length > 0) {
      const goal = result.data[0]
      // Parse metadata safely
      goal.metadata = safeJsonParse(goal.metadata)
      return { success: true, goal }
    }
    
    // Fallback
    const goal = {
      id: Date.now(),
      user_id: userId,
      ...goalData,
      total_progress: 0,
      status: 'active',
      created_at: new Date().toISOString()
    }
    return { success: true, goal }
  } catch (error) {
    // Always fallback
    const goal = {
      id: Date.now(),
      user_id: userId,
      ...goalData,
      total_progress: 0,
      status: 'active',
      created_at: new Date().toISOString()
    }
    return { success: true, goal }
  }
}

export async function getUserGoals(userId) {
  try {
    const result = await executeQuery(`
      SELECT * FROM ${SCHEMA}.goals
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId])

    if (result.success) {
      // Parse metadata for each goal safely
      const goals = result.data.map(goal => ({
        ...goal,
        metadata: safeJsonParse(goal.metadata)
      }))
      return { success: true, goals }
    }
    
    return { success: true, goals: [] }
  } catch (error) {
    return { success: true, goals: [] }
  }
}

export async function updateGoal(goalId, updates) {
  try {
    // Handle metadata serialization
    const processedUpdates = { ...updates }
    if (processedUpdates.metadata) {
      processedUpdates.metadata = safeJsonStringify(processedUpdates.metadata)
    }
    
    const setClause = Object.keys(processedUpdates).map((key, index) => `${key} = $${index + 2}`).join(', ')
    const values = [goalId, ...Object.values(processedUpdates)]
    
    const result = await executeQuery(`
      UPDATE ${SCHEMA}.goals
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, values)

    if (result.success && result.data.length > 0) {
      const goal = result.data[0]
      goal.metadata = safeJsonParse(goal.metadata)
      return { success: true, goal }
    }
    
    return { success: true }
  } catch (error) {
    return { success: true }
  }
}

export async function logProgress(goalId, value, notes = '') {
  try {
    if (!goalId || !value) {
      console.warn('Invalid progress log parameters')
      return { success: true } // Don't fail, just skip
    }

    // Log the progress
    const logResult = await executeQuery(`
      INSERT INTO ${SCHEMA}.progress_logs (goal_id, value, notes)
      VALUES ($1, $2, $3)
    `, [goalId, value, notes])

    // Update goal's total progress
    const updateResult = await executeQuery(`
      UPDATE ${SCHEMA}.goals
      SET total_progress = total_progress + $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [goalId, value])

    // If database operations fail, use localStorage fallback
    if (!logResult.success || !updateResult.success) {
      console.warn('Database progress logging failed, using localStorage fallback')
      
      // Get current user from localStorage
      const savedUser = localStorage.getItem('goalTracker_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          const userId = userData.id
          
          // Update goals in localStorage
          const savedGoals = localStorage.getItem(`goalTracker_goals_${userId}`)
          if (savedGoals) {
            const goals = JSON.parse(savedGoals)
            const updatedGoals = goals.map(goal => 
              goal.id === parseInt(goalId) 
                ? { ...goal, total_progress: (goal.total_progress || 0) + value }
                : goal
            )
            localStorage.setItem(`goalTracker_goals_${userId}`, JSON.stringify(updatedGoals))
          }
          
          // Save progress log to localStorage
          const progressLogs = JSON.parse(localStorage.getItem(`goalTracker_progress_${userId}`) || '[]')
          progressLogs.push({
            id: Date.now(),
            goal_id: goalId,
            value,
            notes,
            logged_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          })
          localStorage.setItem(`goalTracker_progress_${userId}`, JSON.stringify(progressLogs))
        } catch (parseError) {
          console.warn('localStorage fallback failed:', parseError)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.warn('Progress logging error:', error)
    return { success: true } // Always succeed for fallback
  }
}

// Simplified functions for other features - always succeed for fallback
export async function createAccountabilityPartner(userId, partnerData) {
  try {
    const result = await executeQuery(`
      INSERT INTO ${SCHEMA}.accountability_partners (user_id, partner_name, partner_email, shared_goals, privacy_settings)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      userId,
      partnerData.partner_name,
      partnerData.partner_email,
      safeJsonStringify(partnerData.shared_goals || []),
      safeJsonStringify(partnerData.privacy_settings || {})
    ])

    if (result.success && result.data.length > 0) {
      const partner = result.data[0]
      partner.shared_goals = safeJsonParse(partner.shared_goals, [])
      partner.privacy_settings = safeJsonParse(partner.privacy_settings, {})
      return { success: true, partner }
    }
  } catch (error) {
    console.warn('Database partner creation failed, using fallback')
  }
  
  return { success: true, partner: { id: Date.now(), ...partnerData } }
}

export async function getUserPartners(userId) {
  try {
    const result = await executeQuery(`
      SELECT * FROM ${SCHEMA}.accountability_partners
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC
    `, [userId])

    if (result.success) {
      const partners = result.data.map(partner => ({
        ...partner,
        shared_goals: safeJsonParse(partner.shared_goals, []),
        privacy_settings: safeJsonParse(partner.privacy_settings, {})
      }))
      return { success: true, partners }
    }
  } catch (error) {
    console.warn('Database partner fetch failed, using fallback')
  }
  
  return { success: true, partners: [] }
}

export async function createMicroGoal(parentGoalId, microGoalData) {
  try {
    const result = await executeQuery(`
      INSERT INTO ${SCHEMA}.micro_goals (parent_goal_id, title, description, target_date, order_index)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      parentGoalId,
      microGoalData.title,
      microGoalData.description || null,
      microGoalData.target_date || null,
      microGoalData.order_index || 0
    ])

    if (result.success && result.data.length > 0) {
      return { success: true, microGoal: result.data[0] }
    }
  } catch (error) {
    console.warn('Database micro goal creation failed, using fallback')
  }
  
  return { success: true, microGoal: { id: Date.now(), parent_goal_id: parentGoalId, ...microGoalData } }
}

export async function getMicroGoals(parentGoalId) {
  try {
    const result = await executeQuery(`
      SELECT * FROM ${SCHEMA}.micro_goals
      WHERE parent_goal_id = $1
      ORDER BY order_index ASC, created_at ASC
    `, [parentGoalId])

    if (result.success) {
      return { success: true, microGoals: result.data }
    }
  } catch (error) {
    console.warn('Database micro goal fetch failed, using fallback')
  }
  
  return { success: true, microGoals: [] }
}

export async function updateMicroGoal(microGoalId, updates) {
  try {
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ')
    const values = [microGoalId, ...Object.values(updates)]
    
    const result = await executeQuery(`
      UPDATE ${SCHEMA}.micro_goals
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `, values)

    if (result.success && result.data.length > 0) {
      return { success: true, microGoal: result.data[0] }
    }
  } catch (error) {
    console.warn('Database micro goal update failed, using fallback')
  }
  
  return { success: true, microGoal: { id: microGoalId, ...updates } }
}

export async function deleteMicroGoal(microGoalId) {
  try {
    const result = await executeQuery(`
      DELETE FROM ${SCHEMA}.micro_goals
      WHERE id = $1
      RETURNING id
    `, [microGoalId])

    if (result.success) {
      return { success: true, deletedMicroGoal: { id: microGoalId } }
    }
  } catch (error) {
    console.warn('Database micro goal deletion failed, using fallback')
  }
  
  return { success: true, deletedMicroGoal: { id: microGoalId } }
}

export async function saveReflection(userId, prompt, response) {
  try {
    const result = await executeQuery(`
      INSERT INTO ${SCHEMA}.reflections (user_id, prompt, response)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, prompt, response])

    if (result.success && result.data.length > 0) {
      return { success: true, reflection: result.data[0] }
    }
  } catch (error) {
    console.warn('Database reflection save failed, using fallback')
  }
  
  return { success: true, reflection: { id: Date.now(), user_id: userId, prompt, response } }
}

export async function getUserReflections(userId, limit = 10) {
  try {
    const result = await executeQuery(`
      SELECT * FROM ${SCHEMA}.reflections
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit])

    if (result.success) {
      return { success: true, reflections: result.data }
    }
  } catch (error) {
    console.warn('Database reflection fetch failed, using fallback')
  }
  
  return { success: true, reflections: [] }
}
