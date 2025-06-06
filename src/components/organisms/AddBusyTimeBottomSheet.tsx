import React, { useState } from "react"
import { BottomSheet } from "@/components/atoms/bottom-sheet"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select"
import { Checkbox } from "@/components/atoms/checkbox"
import { Clock, Plus, X } from "lucide-react"
import { useSchedule } from "../../contexts/ScheduleContext"
import { BusyTime, BusyTimeType } from "../../lib/types"
import { useIsMobile } from "../../hooks/use-mobile"
import { v4 as uuidv4 } from 'uuid'
import { toast } from "sonner"
import { motion } from "framer-motion"

interface AddBusyTimeBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AddBusyTimeBottomSheet: React.FC<AddBusyTimeBottomSheetProps> = ({
  open,
  onOpenChange
}) => {
  const isMobile = useIsMobile()
  const { addBusyTime } = useSchedule()
  
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [type, setType] = useState<BusyTimeType>("study")
  const [days, setDays] = useState<Record<string, boolean>>({
    M: false, T: false, W: false, Th: false, F: false, Sa: false, Su: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedDays = Object.entries(days)
      .filter(([_, selected]) => selected)
      .map(([day]) => day)
    
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day")
      return
    }
    
    if (!title.trim()) {
      toast.error("Please enter a title for your busy time")
      return
    }
    
    const newBusyTime: BusyTime = {
      id: uuidv4(),
      title: title.trim(),
      days: selectedDays,
      startTime,
      endTime,
      type
    }
    
    addBusyTime(newBusyTime)
    handleReset()
    onOpenChange(false)
    toast.success(`"${title.trim()}" added to your busy times.`)
  }

  const handleReset = () => {
    setTitle("")
    setStartTime("09:00")
    setEndTime("10:00")
    setType("study")
    setDays({
      M: false, T: false, W: false, Th: false, F: false, Sa: false, Su: false
    })
  }

  const handleDayChange = (day: string, checked: boolean) => {
    setDays(prev => ({ ...prev, [day]: checked }))
  }

  if (!isMobile) return null

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add Busy Time"
      description="Block time in your schedule for work, study, or other commitments"
      snapPoints={[60, 80, 95]}
      defaultSnap={1}
    >
      <div className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Work, Study Time, Gym"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <Select value={type} onValueChange={(value: BusyTimeType) => setType(value)}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          {/* Days Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Days *</Label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { key: 'M', label: 'Mon' },
                { key: 'T', label: 'Tue' },
                { key: 'W', label: 'Wed' },
                { key: 'Th', label: 'Thu' },
                { key: 'F', label: 'Fri' },
                { key: 'Sa', label: 'Sat' },
                { key: 'Su', label: 'Sun' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${key}`}
                    checked={days[key]}
                    onCheckedChange={(checked) => handleDayChange(key, !!checked)}
                  />
                  <Label htmlFor={`day-${key}`} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <motion.div whileTap={{ scale: 0.97, transition: { duration: 0.1 } }} className="flex-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full h-12"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97, transition: { duration: 0.1 } }} className="flex-1">
              <Button
                type="submit"
                className="w-full h-12"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Busy Time
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </BottomSheet>
  )
}

export default AddBusyTimeBottomSheet
