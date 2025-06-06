import React, { useState, useEffect, useRef } from "react"
import { BottomSheet } from "@/components/atoms/bottom-sheet"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Badge } from "@/components/atoms/badge"
import { Sparkles, Send, User, Bot, MessageCircle, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"

interface AIAdvisorBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Message {
  id: string
  sender: "user" | "ai"
  content: string
  timestamp: string
}

const AIAdvisorBottomSheet: React.FC<AIAdvisorBottomSheetProps> = ({
  open,
  onOpenChange
}) => {
  const isMobile = useIsMobile()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (open && messages.length === 0) {
      // Add welcome message when opening for the first time
      const welcomeMessage: Message = {
        id: "welcome",
        sender: "ai",
        content: "Hi! I'm your AI Academic Advisor. I can help you with course selection, schedule planning, and academic guidance. What would you like to know?",
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
    }
  }, [open, messages.length])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsThinking(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
      setIsThinking(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase()

    if (input.includes("schedule") || input.includes("plan")) {
      return "I can help you create an optimal schedule! Based on your courses, I recommend:\n\n• Spreading classes across different days\n• Avoiding back-to-back classes when possible\n• Considering your time preferences\n\nWould you like me to suggest specific courses or help with time management?"
    }

    if (input.includes("course") || input.includes("class")) {
      return "For course selection, I consider:\n\n• Your major requirements\n• Prerequisites you've completed\n• Course difficulty and workload\n• Professor ratings and teaching styles\n\nWhat specific courses or subjects are you interested in?"
    }

    if (input.includes("credit") || input.includes("workload")) {
      return "For a balanced semester, I typically recommend:\n\n• 12-15 credits for full-time students\n• Mix of challenging and easier courses\n• Consider your work/life commitments\n• Leave time for studying and activities\n\nWhat's your target credit load this semester?"
    }

    if (input.includes("help") || input.includes("what can you do")) {
      return "I can assist you with:\n\n📚 Course recommendations\n⏰ Schedule optimization\n📋 Degree planning\n🎯 Academic goal setting\n📊 Workload balancing\n\nJust ask me anything about your academic planning!"
    }

    return "That's a great question! I'm here to help with your academic planning. Could you provide more details about what you're looking for? I can assist with course selection, scheduling, degree requirements, and academic strategies."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isMobile) return null

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="AI Academic Advisor"
      description="Get personalized academic guidance and course recommendations"
      snapPoints={[70, 85, 95]}
      defaultSnap={1}
    >
      <div className="flex flex-col h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 text-white flex items-center justify-center">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about courses, schedules, or academic planning..."
              className="flex-1 h-12"
              disabled={isThinking}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isThinking}
              className="h-12 px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}

export default AIAdvisorBottomSheet
