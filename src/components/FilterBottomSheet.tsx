import React, { useState, useEffect } from "react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Filter, X, RotateCcw, Search } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface FilterBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: {
    searchTerm: string
    department: string
    level: string
    credits: string
    classStatus: string
    attributes: string[]
    meetingDays: string[]
    startTime: string
    instructionMode: string
  }
  onFiltersChange: (filters: any) => void
  onApplyFilters: () => void
  onClearFilters: () => void
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters
}) => {
  const isMobile = useIsMobile()
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    if (open) {
      setLocalFilters(filters)
    }
  }, [open, filters])

  const handleLocalFilterChange = (key: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApplyFilters()
    onOpenChange(false)
  }

  const handleClear = () => {
    const clearedFilters = {
      searchTerm: "",
      department: "all",
      level: "all", 
      credits: "all",
      classStatus: "all",
      attributes: [],
      meetingDays: [],
      startTime: "all",
      instructionMode: "all"
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    onClearFilters()
  }

  const handleAttributeToggle = (attribute: string) => {
    const newAttributes = localFilters.attributes.includes(attribute)
      ? localFilters.attributes.filter(a => a !== attribute)
      : [...localFilters.attributes, attribute]
    handleLocalFilterChange('attributes', newAttributes)
  }

  const handleMeetingDayToggle = (day: string) => {
    const newDays = localFilters.meetingDays.includes(day)
      ? localFilters.meetingDays.filter(d => d !== day)
      : [...localFilters.meetingDays, day]
    handleLocalFilterChange('meetingDays', newDays)
  }

  if (!isMobile) return null

  const activeFiltersCount = Object.entries(localFilters).reduce((count, [key, value]) => {
    if (key === 'searchTerm' && value) return count + 1
    if (key === 'attributes' && Array.isArray(value) && value.length > 0) return count + 1
    if (key === 'meetingDays' && Array.isArray(value) && value.length > 0) return count + 1
    if (typeof value === 'string' && value !== 'all' && value !== '') return count + 1
    return count
  }, 0)

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filter Courses"
      description={`${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`}
      snapPoints={[70, 85, 95]}
      defaultSnap={1}
    >
      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Course name, code, or description..."
              value={localFilters.searchTerm}
              onChange={(e) => handleLocalFilterChange('searchTerm', e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Department</Label>
          <Select value={localFilters.department} onValueChange={(value) => handleLocalFilterChange('department', value)}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="CS">Computer Science</SelectItem>
              <SelectItem value="MATH">Mathematics</SelectItem>
              <SelectItem value="ENG">English</SelectItem>
              <SelectItem value="HIST">History</SelectItem>
              <SelectItem value="BIO">Biology</SelectItem>
              <SelectItem value="CHEM">Chemistry</SelectItem>
              <SelectItem value="PHYS">Physics</SelectItem>
              <SelectItem value="ECON">Economics</SelectItem>
              <SelectItem value="PSYC">Psychology</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Level */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Course Level</Label>
          <Select value={localFilters.level} onValueChange={(value) => handleLocalFilterChange('level', value)}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="100">100-level (Introductory)</SelectItem>
              <SelectItem value="200">200-level (Intermediate)</SelectItem>
              <SelectItem value="300">300-level (Advanced)</SelectItem>
              <SelectItem value="400">400-level (Senior)</SelectItem>
              <SelectItem value="500">500+ level (Graduate)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Credits */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Credits</Label>
          <Select value={localFilters.credits} onValueChange={(value) => handleLocalFilterChange('credits', value)}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Credits</SelectItem>
              <SelectItem value="1">1 Credit</SelectItem>
              <SelectItem value="2">2 Credits</SelectItem>
              <SelectItem value="3">3 Credits</SelectItem>
              <SelectItem value="4">4 Credits</SelectItem>
              <SelectItem value="5+">5+ Credits</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Class Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Class Status</Label>
          <Select value={localFilters.classStatus} onValueChange={(value) => handleLocalFilterChange('classStatus', value)}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="waitlist">Waitlist Available</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Meeting Days */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Meeting Days</Label>
          <div className="grid grid-cols-4 gap-2">
            {['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={localFilters.meetingDays.includes(day)}
                  onCheckedChange={() => handleMeetingDayToggle(day)}
                />
                <Label htmlFor={`day-${day}`} className="text-sm">
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Course Attributes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Course Attributes</Label>
          <div className="space-y-2">
            {['Honors', 'Writing Intensive', 'Lab Required', 'Online', 'Hybrid'].map((attribute) => (
              <div key={attribute} className="flex items-center space-x-2">
                <Checkbox
                  id={`attr-${attribute}`}
                  checked={localFilters.attributes.includes(attribute)}
                  onCheckedChange={() => handleAttributeToggle(attribute)}
                />
                <Label htmlFor={`attr-${attribute}`} className="text-sm">
                  {attribute}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters ({activeFiltersCount})</Label>
            <div className="flex flex-wrap gap-2">
              {localFilters.searchTerm && (
                <Badge variant="secondary">Search: {localFilters.searchTerm}</Badge>
              )}
              {localFilters.department !== 'all' && (
                <Badge variant="secondary">Dept: {localFilters.department}</Badge>
              )}
              {localFilters.level !== 'all' && (
                <Badge variant="secondary">Level: {localFilters.level}</Badge>
              )}
              {localFilters.credits !== 'all' && (
                <Badge variant="secondary">Credits: {localFilters.credits}</Badge>
              )}
              {localFilters.attributes.map(attr => (
                <Badge key={attr} variant="secondary">{attr}</Badge>
              ))}
              {localFilters.meetingDays.map(day => (
                <Badge key={day} variant="secondary">{day}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1 h-12"
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-12"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default FilterBottomSheet
