import React, { useState, useEffect, useRef } from "react";
import { BottomSheet } from "@/components/atoms/bottom-sheet";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea"; // Changed from Input
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar"; // Added Avatar
import { Badge } from "@/components/atoms/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs"; // Added Tabs
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/atoms/accordion"; // Added Accordion
import { useSchedule } from "../../contexts/ScheduleContext"; // Added useSchedule
import { cn } from "../../lib/utils"; // Added cn
import { Sparkles, Send, User, Bot, MessageSquare, HelpCircle, BookOpen, LogOut } from "lucide-react"; // Added more icons
import { useLocation } from "react-router-dom"; // Added useLocation
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "../../hooks/use-mobile";


interface AIAdvisorBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: string;
}

// FAQ Data (Copied from AIAdvisor.tsx)
const faqData = [
  {
    id: "registration",
    question: "How do I register for classes?",
    answer: "Use the Schedule Planner to build your ideal schedule, then add it to your cart. From the cart, you can proceed to official registration through your student portal."
  },
  {
    id: "prerequisites",
    question: "What are prerequisites and how do I check them?",
    answer: "Prerequisites are courses you must complete before taking another course. Check course details in the Browse All Classes tab or expand course information in the Schedule Planner."
  },
  {
    id: "credits",
    question: "How many credits should I take per semester?",
    answer: "Most students take 12-18 credits per semester. 12 credits is considered full-time, while 15-16 credits is typical for graduating in 4 years."
  },
  {
    id: "conflicts",
    question: "What should I do if I have schedule conflicts?",
    answer: "The Schedule Planner automatically detects conflicts. Try different course sections, adjust your busy times, or consider taking conflicting courses in different semesters."
  },
  {
    id: "waitlist",
    question: "How does the waitlist work?",
    answer: "If a course is full, you can join the waitlist. You'll be automatically enrolled if a spot opens up. Check course availability in the Browse All Classes section."
  },
  {
    id: "major-requirements",
    question: "How do I track my major requirements?",
    answer: "Use the 'Explore Other Majors' tab to see detailed requirements for your current major or explore other programs. The Progress cards show your completion status."
  }
];

// Page-specific help content (Copied from AIAdvisor.tsx)
const getPageSpecificHelp = (pathname: string) => {
  switch (pathname) {
    case '/': // Assuming root path for dashboard, adjust if different for mobile context
      return {
        title: "Academic Planning Dashboard",
        tips: [
          "View your graduation progress and required courses in the top cards",
          "Plan courses by semester using the timeline view",
          "Click 'Build Schedule' to create detailed timetables",
          "Use 'Browse All Classes' to explore available courses"
        ]
      };
    case '/schedule': // Assuming this path for schedule tool
      return {
        title: "Schedule Planner",
        tips: [
          "Add courses using the 'Add Course' button in the left sidebar",
          "Lock courses to keep them in specific time slots during regeneration",
          "Use 'Preferences' to set your scheduling preferences",
          "Generate multiple schedule options and compare them",
          "Add your best schedule to cart for registration"
        ]
      };
    case '/cart': // Assuming this path for cart
      return {
        title: "Registration Cart",
        tips: [
          "Review your selected schedules before registration",
          "Compare different schedule options side by side",
          "Check for any remaining conflicts or issues",
          "Proceed to official registration through your student portal"
        ]
      };
    default:
      return {
        title: "General Help",
        tips: [
          "Use the navigation tabs to move between different planning tools",
          "Save your work frequently by adding schedules to your cart",
          "Check prerequisites before planning advanced courses",
          "Contact your academic advisor for personalized guidance"
        ]
      };
  }
};

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "ai",
    content: "Hello! I'm your AI Course Advisor. How can I help you with your course planning today?",
    timestamp: new Date().toISOString()
  }
];


const AIAdvisorBottomSheet: React.FC<AIAdvisorBottomSheetProps> = ({
  open,
  onOpenChange
}) => {
  const isMobile = useIsMobile();
  const { studentInfo } = useSchedule(); // Added studentInfo
  const location = useLocation(); // Added location
  const [messages, setMessages] = useState<Message[]>(initialMessages); // Using new initialMessages
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // Added activeTab state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pageHelp = getPageSpecificHelp(location.pathname); // Derive pageHelp

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  useEffect(() => {
    // Reset to initial messages if chat is empty when opened, or if tab switched to chat and it's empty
    if (open && activeTab === "chat" && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [open, activeTab, messages.length]);


  // generateAIResponse (Copied and adapted from AIAdvisor.tsx)
  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    const matchingFaq = faqData.find(faq =>
      input.includes(faq.question.toLowerCase().split(' ').slice(0, 3).join(' ')) ||
      faq.question.toLowerCase().includes(input.split(' ')[0])
    );

    if (matchingFaq) {
      return `${matchingFaq.answer}\n\n💡 You can find more answers in the FAQ section!`;
    }

    if (input.includes("help") || input.includes("how to use this page")) {
      return `Here's how to use the ${pageHelp.title}:\n\n${pageHelp.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\nNeed more specific help? Just ask!`;
    }

    // Assuming studentInfo is available and has a structure like { name: string, totalCredits: number, requiredCredits: number, major: string }
    if (studentInfo) {
        if (input.includes("prerequisite") || input.includes("prereq")) {
            return `Based on your current progress, you need to complete CS101 before taking CS202. You've already completed CS101 so you're eligible to take CS202 next semester.\n\n💡 Tip: Check course prerequisites in the Browse All Classes tab or expand course details in the Schedule Planner.`;
        }

        if (input.includes("credit") || input.includes("how many")) {
            return `You currently have ${studentInfo.totalCredits} credits completed out of the ${studentInfo.requiredCredits} required for your ${studentInfo.major} degree. You need ${studentInfo.requiredCredits - studentInfo.totalCredits} more credits to graduate.\n\n📊 Track your progress using the cards on the main dashboard.`;
        }

        if (input.includes("schedule") || input.includes("recommendation")) {
            return `Based on your academic history and major requirements, I recommend taking:\n\n1. CS350: Database Systems (3 credits)\n2. MATH201: Calculus I (4 credits)\n3. ENG234: Composition II (3 credits)\n4. HIST101: World History I (3 credits)\n\nThis 13-credit schedule balances technical and general education requirements. Use the Schedule Planner to see how these fit into your weekly calendar!`;
        }
         if (input.includes("course load") || input.includes("too many")) {
            return `For your major in ${studentInfo.major}, I recommend taking 12-15 credits per semester for a balanced course load. Given your current commitments, 12-13 credits (typically 4 courses) would be optimal.\n\n⚖️ Remember: Quality over quantity - it's better to do well in fewer courses than struggle with too many.`;
        }

        if (input.includes("requirement") || input.includes("need to take")) {
            return `For your ${studentInfo.major} major, you still need to complete:\n\n- Advanced programming courses (CS350, DS442)\n- Mathematics requirements (MATH201, PHYS210)\n- General education electives (6 credits remaining)\n\nYou've already fulfilled your introductory programming and basic requirements. Check the 'Explore Other Majors' tab for detailed progress tracking!`;
        }
    }


    if (input.includes("conflict") || input.includes("time")) {
      return `Schedule conflicts happen! Here's what you can do:\n\n1. Try different course sections with different times\n2. Adjust your busy times if they're flexible\n3. Consider taking conflicting courses in different semesters\n4. Use the 'Lock' feature to preserve courses you must keep\n\nThe Schedule Planner automatically detects and highlights conflicts for you.`;
    }

    return `I'd be happy to help with that! As your AI advisor, I can provide personalized recommendations based on your academic history, major requirements, and preferences.\n\n🤖 Try asking about:\n• Course recommendations\n• Prerequisites\n• Schedule conflicts\n• Credit requirements\n• Registration process\n\nOr check out the FAQ section for common questions!`;
  };


  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsThinking(true);

    setTimeout(() => {
      const aiResponseContent = generateAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: aiResponseContent,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1500);
  };

  // renderMessages (Copied and adapted from AIAdvisor.tsx)
  const renderMessages = () => {
    return messages.map(message => (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "mb-4 max-w-[85%]", // Adjusted max-width for bottom sheet
          message.sender === "user" ? "ml-auto" : "mr-auto"
        )}
      >
        <div className="flex items-start gap-2.5"> {/* Adjusted gap */}
          {message.sender === "ai" && (
            <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-500 to-violet-500 text-white flex items-center justify-center flex-shrink-0">
               <Sparkles className="h-4 w-4" />
            </Avatar>
          )}
          <div
            className={cn(
              "rounded-lg px-3.5 py-2.5 text-sm shadow-sm", // Adjusted padding
              message.sender === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-900"
            )}
          >
            {message.content.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < message.content.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
          {message.sender === "user" && studentInfo && (
            <Avatar className="h-8 w-8 bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium">
                {studentInfo.name?.split(" ").map(n => n[0]).join("") || <User className="h-4 w-4"/>}
              </span>
            </Avatar>
          )}
           {message.sender === "user" && !studentInfo && (
             <Avatar className="h-8 w-8 bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4"/>
            </Avatar>
           )}
        </div>
      </motion.div>
    ));
  };


  if (!isMobile && open) { // if not mobile but open prop is true, call onOpenChange(false) to close it.
      onOpenChange(false);
      return null;
  }
  if (!isMobile) return null; // Default return null if not mobile

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="AI Academic Advisor"
      description="Get personalized academic guidance and course recommendations."
      snapPoints={[60, 85, 100]} // Adjusted snap points for potentially taller content
      defaultSnap={1} // Default to a larger snap point
      className="flex flex-col" // Ensure BottomSheet itself can be flex col
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 px-4 pt-2">
        <TabsList className="grid w-full grid-cols-3 mb-2 sticky top-0 bg-white z-10 py-1">
          <TabsTrigger value="chat" className="flex items-center text-sm">
            <MessageSquare className="h-4 w-4 mr-1.5" /> Chat
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center text-sm">
            <HelpCircle className="h-4 w-4 mr-1.5" /> FAQ
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center text-sm">
            <BookOpen className="h-4 w-4 mr-1.5" /> Page Help
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 py-4"> {/* Removed p-4 from here, added py-4 */}
            {renderMessages()}
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 bg-gradient-to-r from-purple-500 to-violet-500 text-white flex items-center justify-center flex-shrink-0">
                     <Sparkles className="h-4 w-4 animate-pulse" />
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
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
          <div className="border-t bg-white py-3"> {/* Adjusted padding */}
            <div className="flex space-x-2 items-end">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask a question..."
                className="flex-1 min-h-[48px] max-h-[120px] text-sm resize-none" // Adjusted input size
                disabled={isThinking}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isThinking}
                className="h-12 px-4" // Standardized button height
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="flex-1 overflow-y-auto py-4 space-y-3">
          <p className="text-sm text-gray-600 px-1">
            Find quick answers to common questions about course planning and registration.
          </p>
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left text-sm hover:no-underline px-1">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="help" className="flex-1 overflow-y-auto py-4 space-y-3">
          <Badge variant="outline" className="text-base font-semibold">{pageHelp.title}</Badge>
          <div className="space-y-3">
            {pageHelp.tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 shadow">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
           <div className="mt-4 p-3 bg-gray-100 rounded-lg border">
                <p className="text-sm text-gray-600">
                  💡 <strong>Need more help?</strong> Switch to the Chat tab to ask specific questions or browse the FAQ section for common answers.
                </p>
            </div>
        </TabsContent>
      </Tabs>
    </BottomSheet>
  );
};

export default AIAdvisorBottomSheet;
