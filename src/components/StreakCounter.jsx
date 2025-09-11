import React from 'react'
import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

function StreakCounter({ streak }) {
  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-2 rounded-lg"
    >
      <motion.div
        animate={{ rotate: streak > 0 ? [0, 10, -10, 0] : 0 }}
        transition={{ duration: 0.5, repeat: streak > 0 ? Infinity : 0, repeatDelay: 2 }}
      >
        <Flame className="w-4 h-4" />
      </motion.div>
      <span className="font-semibold text-sm">
        {streak} day{streak !== 1 ? 's' : ''}
      </span>
    </motion.div>
  )
}

export default StreakCounter
