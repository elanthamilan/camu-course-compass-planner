
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSchedule } from "@/contexts/ScheduleContext";
import { PreferenceSettings } from "@/lib/types";
import { toast } from "sonner";

interface TunePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TunePreferencesDialog: React.FC<TunePreferencesDialogProps> = ({ open, onOpenChange }) => {
  const { preferences, updatePreferences, generateSchedules } = useSchedule();
  const [localPreferences, setLocalPreferences] = useState<PreferenceSettings>({
    ...preferences
  });

  const handleTimePreference = (time: "morning" | "afternoon" | "evening" | "anytime") => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredTimes: time
    }));
  };

  const handleDensityPreference = (density: "compact" | "balanced" | "spread") => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredDensity: density
    }));
  };

  const handleDayToggle = (day: string) => {
    setLocalPreferences(prev => {
      const currentDays = [...prev.preferredDays];
      
      if (currentDays.includes(day)) {
        return {
          ...prev,
          preferredDays: currentDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          preferredDays: [...currentDays, day]
        };
      }
    });
  };

  const handleInstructionModeChange = (mode: "in-person" | "online" | "hybrid" | "any") => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredInstructionMode: mode
    }));
  };

  const handleCampusPreference = (campus: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredCampus: campus
    }));
  };

  const handleSubmit = () => {
    updatePreferences(localPreferences);
    toast.success("Preferences updated");
    generateSchedules();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>Tune preference</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              The algorithm will not enforce but try its best to find sections at these
              times. It applies for all the schedule suggestions.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Preferred time</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "anytime", label: "Anytime" },
                    { value: "morning", label: "Morning (before 12PM)" },
                    { value: "afternoon", label: "Afternoon (12-5PM)" },
                    { value: "evening", label: "Evening (after 5PM)" }
                  ].map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={localPreferences.preferredTimes === option.value ? "default" : "outline"}
                      onClick={() => handleTimePreference(option.value as any)}
                      className="rounded-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Preferred density</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "compact", label: "Fewer days with classes" },
                    { value: "balanced", label: "Balanced" },
                    { value: "spread", label: "Fewer classes per day" }
                  ].map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={localPreferences.preferredDensity === option.value ? "default" : "outline"}
                      onClick={() => handleDensityPreference(option.value as any)}
                      className={option.value === "balanced" ? "rounded-full" : "rounded-full"}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Preferred days</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "Mon", label: "Mon" },
                    { value: "Tue", label: "Tue" },
                    { value: "Wed", label: "Wed" },
                    { value: "Thu", label: "Thu" },
                    { value: "Fri", label: "Fri" },
                    { value: "Sat", label: "Sat" },
                    { value: "Sun", label: "Sun" }
                  ].map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={localPreferences.preferredDays.includes(option.value) ? "default" : "outline"}
                      onClick={() => handleDayToggle(option.value)}
                      className="rounded-full w-14"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Preferred campus</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "current", label: "Current campus only" },
                    { value: "any", label: "Across any campus" }
                  ].map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={localPreferences.preferredCampus === option.value ? "default" : "outline"}
                      onClick={() => handleCampusPreference(option.value)}
                      className="rounded-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Preferred Instruction Mode</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "in-person", label: "In-person" },
                    { value: "online", label: "Online" },
                    { value: "hybrid", label: "Hybrid" },
                    { value: "any", label: "Any mode" }
                  ].map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={localPreferences.preferredInstructionMode === option.value ? "default" : "outline"}
                      onClick={() => handleInstructionModeChange(option.value as any)}
                      className="rounded-full"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Apply & generate
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TunePreferencesDialog;
