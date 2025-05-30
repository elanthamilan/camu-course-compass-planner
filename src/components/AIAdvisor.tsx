
import React, { useState } from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSchedule } from "@/contexts/ScheduleContext";
import { cn } from "@/lib/utils";
import { Send, LogOut, HelpCircle, MessageSquare, BookOpen } from "lucide-react";
import { useLocation } from "react-router-dom";

interface AIAdvisorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// FAQ Data
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

// Page-specific help content
const getPageSpecificHelp = (pathname: string) => {
  switch (pathname) {
    case '/':
      return {
        title: "Academic Planning Dashboard",
        tips: [
          "View your graduation progress and required courses in the top cards",
          "Plan courses by semester using the timeline view",
          "Click 'Build Schedule' to create detailed timetables",
          "Use 'Browse All Classes' to explore available courses"
        ]
      };
    case '/schedule':
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
    case '/cart':
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
  const location = useLocation();
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const pageHelp = getPageSpecificHelp(location.pathname);

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

  // Enhanced response generation with FAQ integration
  const generateAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase();

    // Check if the question matches any FAQ
    const matchingFaq = faqData.find(faq =>
      input.includes(faq.question.toLowerCase().split(' ').slice(0, 3).join(' ')) ||
      faq.question.toLowerCase().includes(input.split(' ')[0])
    );

    if (matchingFaq) {
      return `${matchingFaq.answer}\n\n💡 You can find more answers in the FAQ section of this chat!`;
    }

    // Page-specific help
    if (input.includes("help") || input.includes("how to use")) {
      return `Here's how to use the ${pageHelp.title}:\n\n${pageHelp.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\nNeed more specific help? Just ask!`;
    }

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

    if (input.includes("conflict") || input.includes("time")) {
      return `Schedule conflicts happen! Here's what you can do:\n\n1. Try different course sections with different times\n2. Adjust your busy times if they're flexible\n3. Consider taking conflicting courses in different semesters\n4. Use the 'Lock' feature to preserve courses you must keep\n\nThe Schedule Planner automatically detects and highlights conflicts for you.`;
    }

    // Default response
    return `I'd be happy to help with that! As your AI advisor, I can provide personalized recommendations based on your academic history, major requirements, and preferences.\n\n🤖 Try asking about:\n• Course recommendations\n• Prerequisites\n• Schedule conflicts\n• Credit requirements\n• Registration process\n\nOr check out the FAQ section for common questions!`;
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
              <span key={i}>
                {line}
                {i < message.content.split("\n").length - 1 && <br />}
              </span>
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-[400px] sm:w-[600px] max-h-[90vh] flex flex-col">
        <DrawerHeader>
          <DrawerTitle>AI Course Advisor</DrawerTitle>
          <DrawerDescription>
            Get personalized help, browse FAQs, and chat with your AI advisor for course planning guidance.
          </DrawerDescription>
        </DrawerHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4">
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Page Help
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col px-4">
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
          </TabsContent>

          <TabsContent value="faq" className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Find quick answers to common questions about course planning and registration.
              </div>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="help" className="flex-1 overflow-y-auto px-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="outline">{pageHelp.title}</Badge>
              </div>
              <div className="space-y-3">
                {pageHelp.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  💡 <strong>Need more help?</strong> Switch to the Chat tab to ask specific questions or browse the FAQ section for common answers.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DrawerFooter className="sm:justify-between border-t pt-4">
          <div className="text-xs text-gray-500">
            Your AI advisor has access to your academic record and program requirements.
          </div>
          <DrawerClose asChild>
            <Button variant="outline" className="text-sm">
              <LogOut className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AIAdvisor;
