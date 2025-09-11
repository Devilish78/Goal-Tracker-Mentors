const API_BASE = 'https://builder.empromptu.ai'
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer 5190ce8c871aa452d21576870650999e',
  'X-Generated-App-ID': '2b84d5d7-4f77-4e8c-a842-e6ded30a282e',
  'X-Usage-Key': 'bb5e40395c90899b3c16a5e462accb30'
}

export async function apiCall(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      console.warn(`API call failed: ${response.status} - Using fallback mode`)
      throw new Error(`API call failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.warn('API call error, using fallback mode:', error.message)
    throw error
  }
}

export async function setupAIPrompt(promptName, inputVariables, promptText) {
  try {
    return await apiCall('/api_tools/setup_ai_prompt', {
      prompt_name: promptName,
      input_variables: inputVariables,
      prompt_text: promptText
    })
  } catch (error) {
    console.warn('Failed to setup AI prompt, using fallback mode:', error.message)
    return { success: false, error: error.message }
  }
}

export async function applyPromptToData(promptName, inputData, returnType = 'pretty_text') {
  try {
    return await apiCall('/api_tools/apply_prompt_to_data', {
      prompt_name: promptName,
      input_data: { ...inputData, return_type: returnType }
    })
  } catch (error) {
    console.warn('Failed to apply prompt to data, using fallback mode:', error.message)
    return { success: false, error: error.message }
  }
}
