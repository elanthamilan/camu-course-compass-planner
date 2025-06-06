import React from "react"
import { BottomSheet } from "@/components/atoms/bottom-sheet"
import { Badge } from "@/components/atoms/badge"
import { Button } from "@/components/atoms/button"
import { Separator } from "@/components/atoms/separator"
import { 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  AlertTriangle,
  Plus,
  Check,
  Building, // For College/Campus
  Briefcase, // For Career
  Tags, // For Keywords/Attributes
  Info, // For various info items
  CalendarDays, // For Term/Dates
  Laptop, // For Instruction Mode
  Users2, // For instructor (already Users, maybe differentiate or stick to Users)
  Puzzle, // For Component
  CalendarRange, // For Class Dates
  FileText, // For notes/requirements etc.
  ListChecks // For Corequisites
} from "lucide-react"
import { Course, CourseSection } from "../../lib/types"
import { useIsMobile } from "../../hooks/use-mobile"
import { motion } from "framer-motion"

interface CourseDetailBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course | null
  onAddCourse?: (course: Course) => void
  isAdded?: boolean
}

const CourseDetailBottomSheet: React.FC<CourseDetailBottomSheetProps> = ({
  open,
  onOpenChange,
  course,
  onAddCourse,
  isAdded = false
}) => {
  const isMobile = useIsMobile()

  if (!course || !isMobile) return null

  const handleAddCourse = () => {
    if (onAddCourse && course) {
      onAddCourse(course)
      onOpenChange(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={course.code}
      description={course.name}
      snapPoints={[60, 85, 100]}
      defaultSnap={1}
    >
      <div className="p-4 space-y-6">
        {/* Course Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {course.credits} Credits
            </Badge>
            {course.department && (
              <Badge variant="outline" className="text-sm">
                {course.department}
              </Badge>
            )}
          </div>

          {course.description && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {course.description}
              </p>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Prerequisites
              </h3>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  {course.prerequisites.join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* New Course Level Fields */}
          {(course.college || course.campus || course.courseCareer) && (
            <div className="space-y-2">
              {course.college && (
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-700 mr-1">College:</span>
                  <span className="text-gray-600">{course.college}</span>
                </div>
              )}
              {course.campus && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-700 mr-1">Campus:</span>
                  <span className="text-gray-600">{course.campus}</span>
                </div>
              )}
              {course.courseCareer && (
                <div className="flex items-center text-sm">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-700 mr-1">Career:</span>
                  <span className="text-gray-600">{course.courseCareer}</span>
                </div>
              )}
            </div>
          )}

          {course.corequisites && course.corequisites.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <ListChecks className="h-4 w-4 mr-2 text-gray-500" />
                Corequisites
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.corequisites.map((coreq, index) => (
                  <Badge key={`coreq-${index}`} variant="outline">{coreq}</Badge>
                ))}
              </div>
            </div>
          )}

          {course.attributes && course.attributes.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Tags className="h-4 w-4 mr-2 text-gray-500" />
                Attributes
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.attributes.map((attr, index) => (
                  <Badge key={`attr-${index}`} variant="outline">{attr}</Badge>
                ))}
              </div>
            </div>
          )}

          {course.keywords && course.keywords.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Tags className="h-4 w-4 mr-2 text-gray-500" />
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.keywords.map((keyword, index) => (
                  <Badge key={`keyword-${index}`} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </div>
          )}

        </div>

        <Separator />

        {/* Available Sections */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Available Sections ({course.sections?.length || 0})
          </h3>
          
          <div className="space-y-4"> {/* Removed max-h-64 and overflow-y-auto, increased space-y */}
            {course.sections?.length > 0 ? course.sections.map((section: CourseSection) => (
              <div
                key={section.id}
                className="bg-gray-50 rounded-lg p-3.5 border border-gray-200 shadow-sm" // Added shadow-sm, adjusted padding
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <span className="font-semibold text-gray-800 text-base"> {/* Increased font-size */}
                      Section {section.sectionNumber}
                    </span>
                    {section.sectionType && section.sectionType !== 'Standard' && (
                      <Badge variant="outline" className="text-xs ml-2">{section.sectionType}</Badge>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    {section.classStatus && (
                      <Badge variant={
                        section.classStatus === 'Open' ? 'default' :
                        section.classStatus === 'Closed' ? 'destructive' :
                        section.classStatus === 'Waitlist' ? 'secondary' : 'outline'}
                        className="mb-1 text-xs"
                      >
                        {section.classStatus}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">CRN: {section.crn || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700"> {/* Increased base text size to sm */}
                  {/* Instructor, Location, Schedule Times (Existing but adjusted for new layout) */}
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" /> {/* Increased icon size */}
                    <span>
                      {section.instructor || 'TBA'} {/* types.ts shows instructor: string, not array */}
                    </span>
                  </div>
                  {section.schedule?.map((sch, idx) => (
                    <div key={idx} className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {sch.days} {sch.startTime} - {sch.endTime} @ {sch.location || section.location || 'TBA'}
                      </span>
                    </div>
                  ))}

                  {/* New Section-Level Fields */}
                  {section.term && (
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Term: {section.term}</span>
                    </div>
                  )}
                  {section.campus && course?.campus !== section.campus && ( // Show only if different from course campus
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Campus: {section.campus}</span>
                    </div>
                  )}
                  {section.instructionMode && (
                    <div className="flex items-center">
                      <Laptop className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Mode: {section.instructionMode}</span>
                    </div>
                  )}
                  {section.academicSession && (
                    <div className="flex items-center">
                      <CalendarRange className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Session: {section.academicSession}</span>
                    </div>
                  )}
                  {section.component && (
                    <div className="flex items-center">
                      <Puzzle className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Component: {section.component}</span>
                    </div>
                  )}
                  {(section.classStartDate || section.classEndDate) && (
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Dates: {section.classStartDate || 'N/A'} - {section.classEndDate || 'N/A'}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                    <span className="text-xs">
                      Seats: {section.availableSeats ?? 'N/A'} / {section.maxSeats ?? 'N/A'}
                    </span>
                    {(section.waitlistCount !== undefined && section.waitlistCount !== null) && (
                       <Badge
                        variant={section.waitlistCount > 0 ? "warning" : "default"}
                        className="text-xs"
                      >
                        Waitlist: {section.waitlistCount}
                      </Badge>
                    )}
                  </div>

                  {/* Textual Information Blocks */}
                  {section.courseControls && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <h4 className="font-medium text-xs text-gray-600 mb-1 flex items-center"><FileText className="h-3 w-3 mr-1.5"/>Course Controls</h4>
                      <p className="text-xs text-gray-500">{section.courseControls}</p>
                    </div>
                  )}
                  {section.enrollmentRequirements && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <h4 className="font-medium text-xs text-gray-600 mb-1 flex items-center"><FileText className="h-3 w-3 mr-1.5"/>Enrollment Requirements</h4>
                      <p className="text-xs text-gray-500">{section.enrollmentRequirements}</p>
                    </div>
                  )}
                  {section.additionalInformation && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <h4 className="font-medium text-xs text-gray-600 mb-1 flex items-center"><Info className="h-3 w-3 mr-1.5"/>Additional Information</h4>
                      <p className="text-xs text-gray-500">{section.additionalInformation}</p>
                    </div>
                  )}
                  {section.notes && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <h4 className="font-medium text-xs text-gray-600 mb-1 flex items-center"><FileText className="h-3 w-3 mr-1.5"/>Notes</h4>
                      <p className="text-xs text-gray-500 italic">{section.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">No sections available for this course.</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {onAddCourse && (
          <div className="sticky bottom-0 bg-white pt-4 border-t">
            <motion.div whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}>
              <Button
                onClick={handleAddCourse}
                disabled={isAdded}
                className="w-full h-12 text-base"
                variant={isAdded ? "outline" : "default"}
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Added to Schedule
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Schedule
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

export default CourseDetailBottomSheet
