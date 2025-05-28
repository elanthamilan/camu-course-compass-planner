import React, { useState, useEffect } from 'react'; // Added useEffect
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { useSchedule } from '@/contexts/ScheduleContext'; // Import useSchedule
import { TimePreference } from '@/lib/types'; // Import TimePreference
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface TunePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TunePreferencesDialog: React.FC<TunePreferencesDialogProps> = ({ open, onOpenChange }) => {
  const { schedulePreferences, updateSchedulePreferences } = useSchedule();
  
  // Local state for dialog, initialized from context when dialog opens
  const [localTimePreference, setLocalTimePreference] = useState<TimePreference>(schedulePreferences.timePreference);
  const [localAvoidFriday, setLocalAvoidFriday] = useState<boolean>(schedulePreferences.avoidFridayClasses);

  useEffect(() => {
    if (open) {
      setLocalTimePreference(schedulePreferences.timePreference);
      setLocalAvoidFriday(schedulePreferences.avoidFridayClasses);
    }
  }, [open, schedulePreferences]);

  const handleSave = () => {
    updateSchedulePreferences({
      timePreference: localTimePreference,
      avoidFridayClasses: localAvoidFriday,
    });
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tune Schedule Preferences</DialogTitle>
          <DialogDescription>
            Adjust your preferences to help generate a schedule that works for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Time Preference Section */}
          <div className="space-y-2">
            <Label className="font-semibold">Time Preference</Label>
            <RadioGroup 
              value={localTimePreference} 
              onValueChange={(value) => setLocalTimePreference(value as TimePreference)} 
              className="space-y-1"
            >
              <div>
                <RadioGroupItem value="none" id="time-none" className="mr-2" />
                <Label htmlFor="time-none">No preference</Label>
              </div>
              <div>
                <RadioGroupItem value="morning" id="time-morning" className="mr-2" />
                <Label htmlFor="time-morning">Prefer morning classes (until 12 PM)</Label>
              </div>
              <div>
                <RadioGroupItem value="afternoon" id="time-afternoon" className="mr-2" />
                <Label htmlFor="time-afternoon">Prefer afternoon classes (12 PM - 5 PM)</Label>
              </div>
              <div>
                <RadioGroupItem value="evening" id="time-evening" className="mr-2" />
                <Label htmlFor="time-evening">Prefer evening classes (after 5 PM)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Day Preference Section */}
          <div className="space-y-2">
            <Label className="font-semibold">Day Preferences</Label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="avoid-friday" 
                checked={localAvoidFriday} 
                onCheckedChange={(checked) => setLocalAvoidFriday(Boolean(checked))} 
              />
              <Label htmlFor="avoid-friday" className="font-normal">
                Avoid Friday classes if possible
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TunePreferencesDialog;
