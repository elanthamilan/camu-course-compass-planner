import React, { useState, useEffect } from "react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { SlidersHorizontal, Save, X } from "lucide-react"
import { useSchedule } from "@/contexts/ScheduleContext"
import { TimePreference } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

interface TunePreferencesBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TunePreferencesBottomSheet: React.FC<TunePreferencesBottomSheetProps> = ({
  open,
  onOpenChange
}) => {
  const isMobile = useIsMobile()
  const { schedulePreferences, updateSchedulePreferences } = useSchedule()
  
  const [localTimePreference, setLocalTimePreference] = useState<TimePreference>(schedulePreferences.timePreference)
  const [localAvoidFriday, setLocalAvoidFriday] = useState<boolean>(schedulePreferences.avoidFridayClasses)
  const [localAvoidBackToBack, setLocalAvoidBackToBack] = useState<boolean>(schedulePreferences.avoidBackToBack || false)
  const [localDayDistribution, setLocalDayDistribution] = useState<'spread' | 'compact' | 'none'>(schedulePreferences.dayDistribution || 'none')

  useEffect(() => {
    if (open) {
      setLocalTimePreference(schedulePreferences.timePreference)
      setLocalAvoidFriday(schedulePreferences.avoidFridayClasses)
      setLocalAvoidBackToBack(schedulePreferences.avoidBackToBack || false)
      setLocalDayDistribution(schedulePreferences.dayDistribution || 'none')
    }
  }, [open, schedulePreferences])

  const handleSave = () => {
    updateSchedulePreferences({
      timePreference: localTimePreference,
      avoidFridayClasses: localAvoidFriday,
      avoidBackToBack: localAvoidBackToBack,
      dayDistribution: localDayDistribution,
    })
    onOpenChange(false)
    toast.success("Preferences saved successfully!")
  }

  if (!isMobile) return null

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Tune Preferences"
      description="Customize your schedule generation preferences"
      snapPoints={[70, 85, 95]}
      defaultSnap={1}
    >
      <div className="p-4 space-y-6">
        {/* Time Preference */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Time Preference</Label>
          <RadioGroup
            value={localTimePreference}
            onValueChange={(value: TimePreference) => setLocalTimePreference(value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="morning" id="morning" />
              <Label htmlFor="morning" className="text-sm">
                Morning (8:00 AM - 12:00 PM)
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="afternoon" id="afternoon" />
              <Label htmlFor="afternoon" className="text-sm">
                Afternoon (12:00 PM - 5:00 PM)
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="evening" id="evening" />
              <Label htmlFor="evening" className="text-sm">
                Evening (5:00 PM - 9:00 PM)
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="any" id="any" />
              <Label htmlFor="any" className="text-sm">
                Any time
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Day Distribution */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Day Distribution</Label>
          <RadioGroup
            value={localDayDistribution}
            onValueChange={(value: 'spread' | 'compact' | 'none') => setLocalDayDistribution(value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="spread" id="spread" />
              <Label htmlFor="spread" className="text-sm">
                Spread classes across more days
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact" className="text-sm">
                Compact classes into fewer days
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="text-sm">
                No preference
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Additional Preferences */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Additional Preferences</Label>
          
          <div className="flex items-center space-x-3">
            <Checkbox
              id="avoidFriday"
              checked={localAvoidFriday}
              onCheckedChange={(checked) => setLocalAvoidFriday(!!checked)}
            />
            <Label htmlFor="avoidFriday" className="text-sm">
              Avoid Friday classes when possible
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="avoidBackToBack"
              checked={localAvoidBackToBack}
              onCheckedChange={(checked) => setLocalAvoidBackToBack(!!checked)}
            />
            <Label htmlFor="avoidBackToBack" className="text-sm">
              Avoid back-to-back classes
            </Label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default TunePreferencesBottomSheet
