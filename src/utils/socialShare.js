export const socialPlatforms = {
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    params: (url, text) => ({ u: url, quote: text })
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    shareUrl: 'https://twitter.com/intent/tweet',
    params: (url, text) => ({ url, text })
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0A66C2',
    shareUrl: 'https://www.linkedin.com/sharing/share-offsite/',
    params: (url, text) => ({ url, summary: text })
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    shareUrl: 'https://www.instagram.com/',
    params: (url, text) => ({ url }) // Instagram doesn't support direct text sharing
  }
}

export function shareToSocialMedia(platform, url, text, hashtags = []) {
  const platformConfig = socialPlatforms[platform]
  if (!platformConfig) {
    console.error('Unsupported platform:', platform)
    return
  }

  const params = platformConfig.params(url, text)
  
  if (hashtags.length > 0 && platform === 'twitter') {
    params.hashtags = hashtags.join(',')
  }

  const queryString = new URLSearchParams(params).toString()
  const shareUrl = `${platformConfig.shareUrl}?${queryString}`

  window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
}

export function generateShareText(goal, progress) {
  const progressPercentage = Math.round((progress.current / progress.target) * 100)
  
  return `🎯 Making progress on my goal: "${goal.title}"! Currently at ${progressPercentage}% completion. ${progress.current}/${progress.target} done! #GoalTracker #Progress #Achievement`
}

export function generateShareImage(goal, progress) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = 800
    canvas.height = 600
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#0ea5e9')
    gradient.addColorStop(1, '#0369a1')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Goal title
    ctx.fillStyle = 'white'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(goal.title, canvas.width / 2, 150)
    
    // Progress circle
    const centerX = canvas.width / 2
    const centerY = 350
    const radius = 100
    const progressAngle = (progress.current / progress.target) * 2 * Math.PI
    
    // Background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 20
    ctx.stroke()
    
    // Progress arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progressAngle)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 20
    ctx.stroke()
    
    // Progress text
    const progressPercentage = Math.round((progress.current / progress.target) * 100)
    ctx.font = 'bold 36px Arial'
    ctx.fillText(`${progressPercentage}%`, centerX, centerY + 10)
    
    // Convert to blob
    canvas.toBlob(resolve, 'image/png')
  })
}
