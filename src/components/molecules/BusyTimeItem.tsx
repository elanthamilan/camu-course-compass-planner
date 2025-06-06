
import React from "react";
import { Button } from "@/components/atoms/button";
import { BusyTime } from "../../lib/types";
import { 
  Briefcase, BookOpen, Heart, Calendar, Users, GraduationCap, Bell, Bookmark,
  Edit, Trash2 
} from "lucide-react";
import { useSchedule } from "../../contexts/ScheduleContext";
import { cn } from "../../lib/utils";

interface BusyTimeItemProps {
  busyTime: BusyTime;
  onEdit: (busyTime: BusyTime) => void;
}

const BusyTimeItem: React.FC<BusyTimeItemProps> = ({ busyTime, onEdit }) => {
  const { removeBusyTime } = useSchedule();
  
  // Updated color scheme for better contrast and Shadcn alignment
  const busyTypeStyles: Record<string, { icon: JSX.Element; itemBg: string; iconBg: string; textClass: string; titleClass: string }> = {
    work: { icon: <Briefcase className="h-4 w-4" />, itemBg: "bg-slate-50 hover:bg-slate-100", iconBg: "bg-slate-200", textClass: "text-slate-600", titleClass: "text-slate-800 font-medium" },
    study: { icon: <BookOpen className="h-4 w-4" />, itemBg: "bg-blue-50 hover:bg-blue-100", iconBg: "bg-blue-200", textClass: "text-blue-600", titleClass: "text-blue-800 font-medium" },
    personal: { icon: <Heart className="h-4 w-4" />, itemBg: "bg-rose-50 hover:bg-rose-100", iconBg: "bg-rose-200", textClass: "text-rose-600", titleClass: "text-rose-800 font-medium" },
    event: { icon: <Calendar className="h-4 w-4" />, itemBg: "bg-indigo-50 hover:bg-indigo-100", iconBg: "bg-indigo-200", textClass: "text-indigo-600", titleClass: "text-indigo-800 font-medium" },
    meeting: { icon: <Users className="h-4 w-4" />, itemBg: "bg-amber-50 hover:bg-amber-100", iconBg: "bg-amber-200", textClass: "text-amber-600", titleClass: "text-amber-800 font-medium" },
    class: { icon: <GraduationCap className="h-4 w-4" />, itemBg: "bg-emerald-50 hover:bg-emerald-100", iconBg: "bg-emerald-200", textClass: "text-emerald-600", titleClass: "text-emerald-800 font-medium" },
    reminder: { icon: <Bell className="h-4 w-4" />, itemBg: "bg-yellow-50 hover:bg-yellow-100", iconBg: "bg-yellow-200", textClass: "text-yellow-600", titleClass: "text-yellow-800 font-medium" },
    other: { icon: <Bookmark className="h-4 w-4" />, itemBg: "bg-violet-50 hover:bg-violet-100", iconBg: "bg-violet-200", textClass: "text-violet-600", titleClass: "text-violet-800 font-medium" }
  };

  const currentStyle = busyTypeStyles[busyTime.type] || busyTypeStyles.other;

  return (
    <div 
      className={cn(
        "p-3 rounded-lg flex items-start justify-between mb-2 group transition-all shadow-sm animate-fade-in", // Added shadow-sm directly
        currentStyle.itemBg 
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn("p-2 rounded-full flex items-center justify-center", currentStyle.iconBg, currentStyle.textClass)}>
          {currentStyle.icon}
        </div>
        
        <div>
          <h4 className={cn("text-sm", currentStyle.titleClass)}>{busyTime.title}</h4>
          <div className={cn("text-xs", currentStyle.textClass)}> {/* Adjusted for consistency */}
            {busyTime.days.join(", ")} • {busyTime.startTime} - {busyTime.endTime}
          </div>
          <div className={cn("text-xs capitalize", currentStyle.textClass, "opacity-80")}>{busyTime.type}</div> {/* Adjusted for consistency */}
        </div>
      </div>
      
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          onClick={() => onEdit(busyTime)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => removeBusyTime(busyTime.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BusyTimeItem;
