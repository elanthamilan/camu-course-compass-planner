
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, List, ListFilter, ChevronDown, ChevronUp, Wand2, ShoppingCart, Clock, Users, MapPin, Zap, RefreshCw, Heart, Trash2, Eye, Settings } from "lucide-react";
import ScheduleCalendarView from "./ScheduleCalendarView";
import ScheduleListView from "./ScheduleListView";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ViewScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semesterName: string;
  courses: any[];
}

const ViewScheduleDialog = ({
  open,
  onOpenChange,
  semesterName,
  courses
}: ViewScheduleDialogProps) => {
  const [activeTab, setActiveTab] = useState("build");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [generatedSchedules, setGeneratedSchedules] = useState<any[]>([]);
  const [scheduleCart, setScheduleCart] = useState<any[]>([]);
  const [busyTimes, setBusyTimes] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [favoriteSchedules, setFavoriteSchedules] = useState<string[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Initialize selected courses when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedCourses(courses.map(course => course.id));
      setGeneratedSchedules([]);
      setScheduleCart([]);
    }
  }, [open, courses]);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleGenerateSchedules = () => {
    if (selectedCourses.length === 0) {
      toast.error("Please select at least one course to generate schedules");
      return;
    }

    setIsGenerating(true);

    // Simulate schedule generation with multiple options
    setTimeout(() => {
      const mockSchedules = [
        {
          id: "schedule-1",
          name: "Morning Focus",
          description: "All classes before 2 PM",
          courses: selectedCourses.slice(0, 3),
          conflicts: 0,
          rating: 4.8,
          tags: ["Early Bird", "Afternoon Free"]
        },
        {
          id: "schedule-2",
          name: "Balanced Day",
          description: "Classes spread throughout the day",
          courses: selectedCourses.slice(0, 4),
          conflicts: 1,
          rating: 4.5,
          tags: ["Balanced", "Short Breaks"]
        },
        {
          id: "schedule-3",
          name: "Compact Schedule",
          description: "Classes clustered on fewer days",
          courses: selectedCourses,
          conflicts: 0,
          rating: 4.9,
          tags: ["3-Day Week", "Long Weekends"]
        }
      ];

      setGeneratedSchedules(mockSchedules);
      setIsGenerating(false);
      setActiveTab("explore");
      toast.success(`Generated ${mockSchedules.length} preview schedules! Use "Build Schedule" button for full features.`);
    }, 2000);
  };

  const addToCart = (schedule: any) => {
    if (!scheduleCart.find(s => s.id === schedule.id)) {
      setScheduleCart(prev => [...prev, schedule]);
      toast.success(`"${schedule.name}" added to your cart!`);
    } else {
      toast.info("This schedule is already in your cart");
    }
  };

  const removeFromCart = (scheduleId: string) => {
    setScheduleCart(prev => prev.filter(s => s.id !== scheduleId));
    toast.success("Schedule removed from cart");
  };

  const toggleFavorite = (scheduleId: string) => {
    setFavoriteSchedules(prev => {
      if (prev.includes(scheduleId)) {
        return prev.filter(id => id !== scheduleId);
      } else {
        return [...prev, scheduleId];
      }
    });
  };

  const addBusyTime = () => {
    const newBusyTime = {
      id: `busy-${Date.now()}`,
      name: "Busy Time",
      days: ["M", "W"],
      startTime: "12:00",
      endTime: "13:00",
      description: "Lunch break"
    };
    setBusyTimes(prev => [...prev, newBusyTime]);
    toast.success("Busy time added! This will be avoided in schedule generation.");
  };

  // Filter courses based on selection
  // const filteredCourses = courses.filter(course =>
  //   selectedCourses.includes(course.id)
  // );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Zap className="h-6 w-6 mr-2 text-blue-600" />
            Schedule Playground - {semesterName}
          </DialogTitle>
          <DialogDescription className="text-base">
            🎯 Experiment with different schedule combinations! Select courses, add busy times, generate multiple options, and save your favorites to compare before registering.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 py-2 bg-gray-50 rounded-lg">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${activeTab === "build" ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}>
            <Settings className="h-4 w-4" />
            <span>1. Build</span>
          </div>
          <div className="h-1 w-8 bg-gray-300 rounded"></div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${activeTab === "explore" ? "bg-green-100 text-green-700" : "text-gray-500"}`}>
            <Eye className="h-4 w-4" />
            <span>2. Explore</span>
          </div>
          <div className="h-1 w-8 bg-gray-300 rounded"></div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${activeTab === "cart" ? "bg-purple-100 text-purple-700" : "text-gray-500"}`}>
            <ShoppingCart className="h-4 w-4" />
            <span>3. Compare ({scheduleCart.length})</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="build" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Build Schedule
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Explore Options
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              My Cart ({scheduleCart.length})
            </TabsTrigger>
          </TabsList>

          {/* Build Tab - Course Selection & Preferences */}
          <TabsContent value="build" className="flex-1 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Course Selection */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ListFilter className="h-5 w-5 mr-2" />
                    Select Your Courses
                  </CardTitle>
                  <p className="text-sm text-gray-600">Choose which courses you want to include in your schedule</p>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {courses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Checkbox
                            id={`course-${course.id}`}
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={() => handleCourseToggle(course.id)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`course-${course.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {course.code}
                            </label>
                            <p className="text-sm text-gray-600">{course.name}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {course.credits} credits
                              </span>
                              {course.sections && (
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {course.sections.length} sections
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={selectedCourses.includes(course.id) ? "default" : "outline"}>
                            {selectedCourses.includes(course.id) ? "Selected" : "Available"}
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences & Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Preferences
                  </CardTitle>
                  <p className="text-sm text-gray-600">Set your scheduling preferences</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Busy Times */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Busy Times
                    </h4>
                    <div className="space-y-2">
                      {busyTimes.map((busyTime) => (
                        <div key={busyTime.id} className="flex items-center justify-between p-2 bg-red-50 rounded border">
                          <div>
                            <p className="text-sm font-medium">{busyTime.name}</p>
                            <p className="text-xs text-gray-600">{busyTime.days.join(", ")} {busyTime.startTime}-{busyTime.endTime}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setBusyTimes(prev => prev.filter(bt => bt.id !== busyTime.id))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addBusyTime} className="w-full">
                        + Add Busy Time
                      </Button>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateSchedules}
                    disabled={selectedCourses.length === 0 || isGenerating}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {isGenerating ? (
                      <span className="flex items-center">
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Generating Magic...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Wand2 className="h-5 w-5 mr-2" />
                        🎯 Generate Schedule Options
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Selected {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} • {busyTimes.length} busy time{busyTimes.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Explore Tab - Generated Schedule Options */}
          <TabsContent value="explore" className="flex-1 mt-4">
            {generatedSchedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Wand2 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No schedules generated yet</h3>
                <p className="text-gray-500 mb-4">Go to the Build tab to select courses and generate schedule options</p>
                <Button onClick={() => setActiveTab("build")} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Build Schedule
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedSchedules.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{schedule.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(schedule.id)}
                            className="p-1"
                          >
                            <Heart className={`h-4 w-4 ${favoriteSchedules.includes(schedule.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          </Button>
                          <Badge variant={schedule.conflicts === 0 ? "default" : "destructive"}>
                            ⭐ {schedule.rating}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{schedule.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {schedule.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-sm">
                          <p className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {schedule.courses.length} courses
                          </p>
                          {schedule.conflicts > 0 && (
                            <p className="flex items-center text-red-600">
                              ⚠️ {schedule.conflicts} conflict{schedule.conflicts !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            onClick={() => addToCart(schedule)}
                            size="sm"
                            className="flex-1"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Cart Tab - Compare Selected Schedules */}
          <TabsContent value="cart" className="flex-1 mt-4">
            {scheduleCart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-4">Add schedule options from the Explore tab to compare them here</p>
                <Button onClick={() => setActiveTab("explore")} variant="outline" disabled={generatedSchedules.length === 0}>
                  <Eye className="h-4 w-4 mr-2" />
                  Explore Schedules
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Compare Schedules ({scheduleCart.length})</h3>
                  <Button variant="outline" onClick={() => setScheduleCart([])}>
                    Clear Cart
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {scheduleCart.map((schedule) => (
                    <Card key={schedule.id} className="border-2 border-blue-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{schedule.name}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">{schedule.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant={schedule.conflicts === 0 ? "default" : "destructive"}>
                              ⭐ {schedule.rating}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {schedule.courses.length} courses
                            </span>
                          </div>

                          <Button className="w-full" size="lg">
                            🎓 Register for This Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ViewScheduleDialog;
