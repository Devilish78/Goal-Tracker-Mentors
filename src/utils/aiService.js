export async function setupAIPrompt(promptName, inputVariables, promptText) {
  try {
    const response = await fetch('https://builder.empromptu.ai/api_tools/setup_ai_prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 5190ce8c871aa452d21576870650999e',
        'X-Generated-App-ID': '2b84d5d7-4f77-4e8c-a842-e6ded30a282e',
        'X-Usage-Key': 'bb5e40395c90899b3c16a5e462accb30'
      },
      body: JSON.stringify({
        prompt_name: promptName,
        input_variables: inputVariables,
        prompt_text: promptText
      })
    })

    if (!response.ok) {
      throw new Error(`AI prompt setup failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('AI prompt setup failed:', error)
    throw error
  }
}

export async function applyPromptToData(promptName, inputData, returnType = 'pretty_text') {
  try {
    const response = await fetch('https://builder.empromptu.ai/api_tools/apply_prompt_to_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 5190ce8c871aa452d21576870650999e',
        'X-Generated-App-ID': '2b84d5d7-4f77-4e8c-a842-e6ded30a282e',
        'X-Usage-Key': 'bb5e40395c90899b3c16a5e462accb30'
      },
      body: JSON.stringify({
        prompt_name: promptName,
        input_data: { ...inputData, return_type: returnType }
      })
    })

    if (!response.ok) {
      throw new Error(`AI prompt application failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('AI prompt application failed:', error)
    throw error
  }
}

export async function generateGoalSuggestions(userGoals, userContext) {
  try {
    const result = await applyPromptToData('goal_suggestions', {
      user_goals: JSON.stringify(userGoals),
      user_context: userContext
    }, 'json')

    return result.value || []
  } catch (error) {
    console.error('Goal suggestions generation failed:', error)
    return []
  }
}

export async function generateReflectionPrompt(goalData, progressData) {
  try {
    const result = await applyPromptToData('reflection_prompt', {
      goal_data: JSON.stringify(goalData),
      progress_data: JSON.stringify(progressData)
    }, 'pretty_text')

    return result.value || 'How do you feel about your progress today?'
  } catch (error) {
    console.error('Reflection prompt generation failed:', error)
    return 'How do you feel about your progress today?'
  }
}

export async function generateMicroGoals(yearlyGoal) {
  try {
    const result = await applyPromptToData('micro_goal_breakdown', {
      yearly_goal: JSON.stringify(yearlyGoal)
    }, 'json')

    return result.value || []
  } catch (error) {
    console.error('Micro goals generation failed:', error)
    return []
  }
}
