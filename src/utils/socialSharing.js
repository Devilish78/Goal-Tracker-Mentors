// Social media sharing utilities - CSP compliant
export const socialPlatforms = {
  facebook: {
    name: 'Facebook',
    icon: '📘',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    params: (url, text) => ({ u: url, quote: text })
  },
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    shareUrl: 'https://twitter.com/intent/tweet',
    params: (url, text) => ({ url, text })
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '💼',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    params: (url, text) => ({ url, summary: text })
  },
  instagram: {
    name: 'Instagram',
    icon: '📷',
    shareUrl: null, // Instagram doesn't support direct URL sharing
    params: null
  }
}

export function generateShareText(goal, progress) {
  const templates = {
    daily: `🎯 Daily Goal Update: "${goal.title}" - ${progress}% complete! Every day counts towards building better habits. #GoalTracker #DailyGoals #Progress`,
    weekly: `📅 Weekly Goal Progress: "${goal.title}" - ${progress}% achieved this week! Consistency is key to success. #WeeklyGoals #Progress #Achievement`,
    yearly: `🚀 Yearly Goal Journey: "${goal.title}" - ${progress}% complete! Big dreams require persistent action. #YearlyGoals #BigDreams #Progress`
  }
  
  return templates[goal.goal_type] || `🎯 Goal Progress: "${goal.title}" - ${progress}% complete! #Goals #Progress #Achievement`
}

export function shareToSocialMedia(platform, url, text) {
  const platformConfig = socialPlatforms[platform]
  
  if (!platformConfig || !platformConfig.shareUrl) {
    // For Instagram, copy text to clipboard
    if (platform === 'instagram') {
      copyToClipboard(text)
      showNotification('Text copied to clipboard! You can now paste it in your Instagram post.')
      return
    }
    console.error('Platform not supported:', platform)
    return
  }

  const params = new URLSearchParams(platformConfig.params(url, text))
  const shareUrl = `${platformConfig.shareUrl}?${params.toString()}`
  
  // Use window.open with specific parameters for better CSP compliance
  const popup = window.open(
    shareUrl, 
    'share-popup',
    'width=600,height=400,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no'
  )
  
  if (!popup) {
    // Fallback if popup is blocked
    window.location.href = shareUrl
  }
}

// Helper function for clipboard operations
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
      } catch (err) {
        console.error('Fallback copy failed:', err)
        throw new Error('Copy failed')
      }
      
      document.body.removeChild(textArea)
    }
  } catch (error) {
    console.error('Failed to copy text:', error)
    throw error
  }
}

// Helper function for notifications
function showNotification(message) {
  // Create a simple notification element
  const notification = document.createElement('div')
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10B981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    max-width: 300px;
    word-wrap: break-word;
  `
  
  document.body.appendChild(notification)
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 3000)
}

export function generateShareableImage(goal, progress, canvas) {
  return new Promise((resolve, reject) => {
    try {
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      
      const width = 800
      const height = 600
      
      canvas.width = width
      canvas.height = height
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Goal title
      ctx.fillStyle = 'white'
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Wrap text if too long
      const maxWidth = width - 100
      const words = goal.title.split(' ')
      let line = ''
      let y = 150
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, width / 2, y)
          line = words[n] + ' '
          y += 60
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, width / 2, y)
      
      // Progress circle
      const centerX = width / 2
      const centerY = height / 2 + 50
      const radius = 100
      
      // Background circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 20
      ctx.stroke()
      
      // Progress arc
      const progressAngle = (progress / 100) * 2 * Math.PI - Math.PI / 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, progressAngle)
      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 20
      ctx.stroke()
      
      // Progress text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
      ctx.fillText(`${progress}%`, centerX, centerY + 10)
      
      // Goal type badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fillRect(50, 50, 200, 60)
      ctx.fillStyle = 'white'
      ctx.font = '24px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(goal.goal_type.toUpperCase(), 70, 85)
      
      // App branding
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '20px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GoalTracker App', width / 2, height - 50)
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to generate image blob'))
        }
      }, 'image/png', 0.9)
      
    } catch (error) {
      reject(error)
    }
  })
}
