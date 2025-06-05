import React from "react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  AlertTriangle,
  Plus,
  Check
} from "lucide-react"
import { Course, CourseSection } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"

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
        </div>

        <Separator />

        {/* Available Sections */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            Available Sections ({course.sections?.length || 0})
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {course.sections?.map((section: CourseSection) => (
              <div
                key={section.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      Section {section.sectionNumber}
                    </span>
                    {section.sectionType && section.sectionType !== 'Standard' && (
                      <Badge variant="outline" className="text-xs">
                        {section.sectionType}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    CRN: {section.crn || 'N/A'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-2" />
                    <span>
                      {section.instructors?.join(', ') || 'TBA'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-2" />
                    <span>
                      {section.schedule?.[0]?.room || section.location || 'TBA'}
                    </span>
                  </div>

                  {section.schedule?.map((sch, idx) => (
                    <div key={idx} className="flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      <span>
                        {sch.days} {sch.startTime} - {sch.endTime}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between pt-1">
                    <span>
                      Enrolled: {section.enrolled}/{section.capacity}
                    </span>
                    {section.waitlisted !== undefined && (
                      <span className={
                        section.waitlisted > 0 
                          ? "text-orange-600" 
                          : "text-green-600"
                      }>
                        Waitlist: {section.waitlisted}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {onAddCourse && (
          <div className="sticky bottom-0 bg-white pt-4 border-t">
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
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

export default CourseDetailBottomSheet
