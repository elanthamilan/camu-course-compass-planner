import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useSchedule } from '@/contexts/ScheduleContext';
import { TimePreference } from '@/lib/types';
import { XCircle, Save } from 'lucide-react';

interface TunePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TunePreferencesDialog: React.FC<TunePreferencesDialogProps> = ({ open, onOpenChange }) => {
  const { schedulePreferences, updateSchedulePreferences } = useSchedule();
  
  const [localTimePreference, setLocalTimePreference] = useState<TimePreference>(schedulePreferences.timePreference);
  const [localAvoidFriday, setLocalAvoidFriday] = useState<boolean>(schedulePreferences.avoidFridayClasses);
  const [localAvoidBackToBack, setLocalAvoidBackToBack] = useState<boolean>(schedulePreferences.avoidBackToBack || false);
  const [localDayDistribution, setLocalDayDistribution] = useState<'spread' | 'compact' | 'none'>(schedulePreferences.dayDistribution || 'none');

  useEffect(() => {
    if (open) {
      setLocalTimePreference(schedulePreferences.timePreference);
      setLocalAvoidFriday(schedulePreferences.avoidFridayClasses);
      setLocalAvoidBackToBack(schedulePreferences.avoidBackToBack || false);
      setLocalDayDistribution(schedulePreferences.dayDistribution || 'none');
    }
  }, [open, schedulePreferences]);

  const handleSave = () => {
    updateSchedulePreferences({
      timePreference: localTimePreference,
      avoidFridayClasses: localAvoidFriday,
      avoidBackToBack: localAvoidBackToBack,
      dayDistribution: localDayDistribution,
    });
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Tune Schedule Preferences</DialogTitle>
          <DialogDescription>
            Adjust your preferences to help generate a schedule that works for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Time Preference Section */}
          <div>
            <Label className="font-semibold">Time Preference</Label>
            <RadioGroup
              value={localTimePreference}
              onValueChange={(value) => setLocalTimePreference(value as TimePreference)}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="time-none" />
                <Label htmlFor="time-none">No preference</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morning" id="time-morning" />
                <Label htmlFor="time-morning">Prefer morning classes (until 12 PM)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afternoon" id="time-afternoon" />
                <Label htmlFor="time-afternoon">Prefer afternoon classes (12 PM - 5 PM)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="evening" id="time-evening" />
                <Label htmlFor="time-evening">Prefer evening classes (after 5 PM)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Day Preference Section */}
          <div>
            <Label className="font-semibold">Day Preferences</Label>
            <div className="mt-2 flex items-center space-x-2">
              <Checkbox
                id="avoid-friday"
                checked={localAvoidFriday}
                onCheckedChange={(checked) => setLocalAvoidFriday(checked as boolean)}
              />
              <Label htmlFor="avoid-friday">Avoid Friday classes if possible</Label>
            </div>
          </div>

          {/* Class Pacing Section */}
          <div>
            <Label className="font-semibold">Class Pacing</Label>
            <div className="mt-2 flex items-center space-x-2">
              <Checkbox
                id="avoid-back-to-back"
                checked={localAvoidBackToBack}
                onCheckedChange={(checked) => setLocalAvoidBackToBack(checked as boolean)}
              />
              <Label htmlFor="avoid-back-to-back">Try to avoid back-to-back classes (e.g., allow for breaks)</Label>
            </div>
          </div>

          {/* Weekly Schedule Layout Section */}
          <div>
            <Label className="font-semibold">Weekly Schedule Layout</Label>
            <RadioGroup
              value={localDayDistribution}
              onValueChange={(value) => setLocalDayDistribution(value as 'spread' | 'compact' | 'none')}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="dist-none" />
                <Label htmlFor="dist-none">No preference</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spread" id="dist-spread" />
                <Label htmlFor="dist-spread">Prefer spreading classes throughout the week</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="dist-compact" />
                <Label htmlFor="dist-compact">Prefer a compact schedule (classes on fewer days)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex items-center">
            <XCircle className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TunePreferencesDialog;
