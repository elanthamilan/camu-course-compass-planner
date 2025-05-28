
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchedule } from "@/contexts/ScheduleContext";
import { BusyTime, BusyTimeType } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { XCircle, Save } from "lucide-react"; // Added XCircle, Save

interface EditBusyTimeDialogProps {
  busyTime: BusyTime | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBusyTimeDialog: React.FC<EditBusyTimeDialogProps> = ({ busyTime, open, onOpenChange }) => {
  const { updateBusyTime } = useSchedule();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [type, setType] = useState<BusyTimeType>("study");
  const [days, setDays] = useState<Record<string, boolean>>({
    M: false, T: false, W: false, Th: false, F: false, Sa: false, Su: false
  });

  // Initialize form when busyTime changes
  useEffect(() => {
    if (busyTime) {
      setTitle(busyTime.title);
      setStartTime(busyTime.startTime);
      setEndTime(busyTime.endTime);
      setType(busyTime.type);
      
      const newDays: Record<string, boolean> = {
        M: false, T: false, W: false, Th: false, F: false, Sa: false, Su: false
      };
      
      busyTime.days.forEach(day => {
        newDays[day] = true;
      });
      
      setDays(newDays);
    }
  }, [busyTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!busyTime) return;
    
    const selectedDays = Object.entries(days)
      .filter(([_, selected]) => selected)
      .map(([day]) => day);
    
    if (selectedDays.length === 0) {
      alert("Please select at least one day");
      return;
    }
    
    const updatedBusyTime: BusyTime = {
      ...busyTime,
      title,
      days: selectedDays,
      startTime,
      endTime,
      type
    };
    
    updateBusyTime(updatedBusyTime);
    onOpenChange(false);
  };

  const handleDayChange = (day: string, checked: boolean) => {
    setDays(prev => ({ ...prev, [day]: checked }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>Edit Busy Time</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this busy time"
              required
              className="focus-ring"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="focus-ring"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="focus-ring"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as BusyTimeType)}>
              <SelectTrigger id="type" className="focus-ring">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Days</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries({
                M: "Monday", 
                T: "Tuesday", 
                W: "Wednesday", 
                Th: "Thursday", 
                F: "Friday", 
                Sa: "Saturday", 
                Su: "Sunday"
              }).map(([day, _fullName]) => (
                <div key={day} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-md">
                  <Checkbox
                    id={`day-${day}`}
                    checked={days[day]}
                    onCheckedChange={(checked) => handleDayChange(day, checked === true)}
                    className="focus-ring"
                  />
                  <label
                    htmlFor={`day-${day}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="focus-ring"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="focus-ring">
              <Save className="h-4 w-4 mr-2" />
              Update Busy Time
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBusyTimeDialog;
