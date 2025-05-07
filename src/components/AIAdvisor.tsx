
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useSchedule } from "@/contexts/ScheduleContext";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

interface AIAdvisorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Sample messages for the AI advisor
const initialMessages = [
  {
    id: "1",
    sender: "ai",
    content: "Hello! I'm your AI Course Advisor. How can I help you with your course planning today?",
    timestamp: new Date().toISOString()
  }
];

const AIAdvisor: React.FC<AIAdvisorProps> = ({ open, onOpenChange }) => {
  const { studentInfo } = useSchedule();
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Simulate AI thinking
    setIsThinking(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1500);
  };
  
  // Simple response generation based on keywords in the user's input
  const generateAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes("prerequisite") || input.includes("prereq")) {
      return `Based on your current progress, you need to complete CS101 before taking CS202. You've already completed CS101 so you're eligible to take CS202 next semester.`;
    }
    
    if (input.includes("credit") || input.includes("how many")) {
      return `You currently have ${studentInfo.totalCredits} credits completed out of the ${studentInfo.requiredCredits} required for your ${studentInfo.major} degree. You need ${studentInfo.requiredCredits - studentInfo.totalCredits} more credits to graduate.`;
    }
    
    if (input.includes("schedule") || input.includes("recommendation")) {
      return `Based on your academic history and major requirements, I recommend taking:\n\n1. CS202: Database Systems (3 credits)\n2. MATH202: Calculus II (4 credits)\n3. ENG205: Technical Writing (3 credits)\n\nThis schedule balances technical and general education requirements while maintaining a manageable 10 credit workload.`;
    }
    
    if (input.includes("course load") || input.includes("too many")) {
      return `For your major in ${studentInfo.major}, I recommend taking 12-15 credits per semester for a balanced course load. Given your current commitments, 12 credits (typically 4 courses) would be optimal.`;
    }
    
    if (input.includes("requirement") || input.includes("need to take")) {
      return `For your ${studentInfo.major} major, you still need to complete:\n\n- Advanced programming courses (CS202, CS301)\n- Mathematics requirements (MATH202, MATH301)\n- General education electives (6 credits remaining)\n\nYou've already fulfilled your introductory programming and basic math requirements.`;
    }
    
    // Default response
    return `I'd be happy to help with that. As your AI advisor, I can provide personalized recommendations based on your academic history, major requirements, and preferences. Could you tell me more specifically what you're looking for help with?`;
  };

  const renderMessages = () => {
    return messages.map(message => (
      <div
        key={message.id}
        className={cn(
          "mb-4 max-w-[80%] animate-fade-in",
          message.sender === "user" ? "ml-auto" : "mr-auto"
        )}
      >
        <div className="flex items-start gap-3">
          {message.sender === "ai" && (
            <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-600 to-violet-500 text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.7 14a2 2 0 0 0-1.7-1h-1.2a3 3 0 0 0-3 3v.7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V16" />
                <path d="M15.5 14h-.17c-.47.68-1.14 1.25-1.92 1.5" />
                <path d="M13.41 14.5c.87-1.98.87-4.02 0-6" />
                <path d="M18.24 9.5c2.13 2.13 2.13 5.57 0 7.7" />
                <path d="M18.24 6c3.53 3.53 3.53 9.24 0 12.77" />
                <path d="M11.5 9.5c-2.13 2.13-2.13 5.57 0 7.7" />
                <path d="M11.5 6c-3.53 3.53-3.53 9.24 0 12.77" />
                <path d="M8.35 8.35a4.8 4.8 0 0 0 0 7.3" />
                <path d="M4.9 4.9a8.5 8.5 0 0 0 0 14.2" />
              </svg>
            </Avatar>
          )}
          
          <div
            className={cn(
              "rounded-lg px-4 py-2 text-sm",
              message.sender === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            {message.content.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < message.content.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
          
          {message.sender === "user" && (
            <Avatar className="h-8 w-8 bg-blue-500 text-white flex items-center justify-center">
              <span className="text-xs font-medium">
                {studentInfo.name.split(" ").map(n => n[0]).join("")}
              </span>
            </Avatar>
          )}
        </div>
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col animate-scale-in">
        <DialogHeader>
          <DialogTitle>AI Course Advisor</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-md mb-4">
          {renderMessages()}
          
          {isThinking && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <div className="h-2 w-2 rounded-full bg-gray-400 animation-delay-200"></div>
              <div className="h-2 w-2 rounded-full bg-gray-400 animation-delay-400"></div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Textarea
            placeholder="Ask a question about your courses, requirements, or schedule..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 focus-ring min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <Button 
            className="self-end bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 transition-all duration-300"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isThinking}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <DialogFooter className="sm:justify-between border-t pt-2">
          <div className="text-xs text-gray-500">
            Your AI advisor has access to your academic record and program requirements.
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIAdvisor;
