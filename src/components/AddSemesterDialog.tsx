import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
// import { Input } from "@/components/atoms/input"; // No longer needed for year
import { Label } from "@/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select"; // Added Select

interface AddSemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSemester: (data: { year: string; semesterType: string }) => void;
}

const AddSemesterDialog: React.FC<AddSemesterDialogProps> = ({ open, onOpenChange, onAddSemester }) => {
  const currentModelYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 4 }, (_, i) => {
    const startYear = currentModelYear + i;
    return {
      value: String(startYear),
      label: `${startYear} - ${startYear + 1}`, // Show academic year format
      startYear: startYear
    };
  });

  const [year, setYear] = useState<string>(yearOptions[0].value); // Initialize with the first option
  const [semesterType, setSemesterType] = useState<string>('Fall'); // Default semester type

  const handleSubmit = () => {
    if (year && semesterType) {
      onAddSemester({ year, semesterType });
      onOpenChange(false); // Close dialog on submit
    } else {
      // Basic validation: alert or inline message (optional for this step)
      alert("Please fill in all fields.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Semester</DialogTitle>
          <DialogDescription>
            Specify the academic year and type for the new semester.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="academicYearSelect" className="text-right">
              Academic Year
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="academicYearSelect" className="col-span-3">
                <SelectValue placeholder="Select academic year">
                  {year ? yearOptions.find(opt => opt.value === year)?.label : "Select academic year"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Semester Type</Label>
            <RadioGroup
              value={semesterType}
              onValueChange={setSemesterType}
              className="col-span-3 flex space-x-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Fall" id="fallRadio" />
                <Label htmlFor="fallRadio">Fall</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Spring" id="springRadio" />
                <Label htmlFor="springRadio">Spring</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Summer" id="summerRadio" />
                <Label htmlFor="summerRadio">Summer</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Semester</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSemesterDialog;
