
import React from "react";
import { Button } from "@/components/ui/button";
import { BusyTime } from "@/lib/types";
import { 
  Briefcase, BookOpen, Heart, Calendar, Users, GraduationCap, Bell, Bookmark,
  Edit, Trash2 
} from "lucide-react";
import { useSchedule } from "@/contexts/ScheduleContext";
import { cn } from "@/lib/utils";

interface BusyTimeItemProps {
  busyTime: BusyTime;
  onEdit: (busyTime: BusyTime) => void;
}

const BusyTimeItem: React.FC<BusyTimeItemProps> = ({ busyTime, onEdit }) => {
  const { removeBusyTime } = useSchedule();
  
  // Map busy time type to icon and color
  const iconMap: Record<string, { icon: any; bgColor: string; textColor: string }> = {
    work: { 
      icon: <Briefcase className="h-4 w-4" />, 
      bgColor: "bg-slate-500/10", 
      textColor: "text-slate-700" 
    },
    study: { 
      icon: <BookOpen className="h-4 w-4" />, 
      bgColor: "bg-blue-500/10", 
      textColor: "text-blue-700" 
    },
    personal: { 
      icon: <Heart className="h-4 w-4" />, 
      bgColor: "bg-rose-500/10", 
      textColor: "text-rose-700" 
    },
    event: { 
      icon: <Calendar className="h-4 w-4" />, 
      bgColor: "bg-indigo-500/10", 
      textColor: "text-indigo-700" 
    },
    meeting: { 
      icon: <Users className="h-4 w-4" />, 
      bgColor: "bg-amber-500/10", 
      textColor: "text-amber-700" 
    },
    class: { 
      icon: <GraduationCap className="h-4 w-4" />, 
      bgColor: "bg-emerald-500/10", 
      textColor: "text-emerald-700" 
    },
    reminder: { 
      icon: <Bell className="h-4 w-4" />, 
      bgColor: "bg-yellow-500/10", 
      textColor: "text-yellow-700" 
    },
    other: { 
      icon: <Bookmark className="h-4 w-4" />, 
      bgColor: "bg-violet-500/10", 
      textColor: "text-violet-700" 
    }
  };

  const { icon, bgColor, textColor } = iconMap[busyTime.type] || iconMap.other;

  return (
    <div 
      className={cn(
        "p-3 rounded-lg flex items-start justify-between mb-2 group transition-all hover:shadow-sm animate-fade-in",
        bgColor
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn("p-2 rounded-full", textColor, bgColor.replace('/10', '/20'))}>
          {icon}
        </div>
        
        <div>
          <h4 className={cn("font-medium", textColor)}>{busyTime.title}</h4>
          <div className="text-sm text-gray-600">
            {busyTime.days.join(", ")} • {busyTime.startTime} - {busyTime.endTime}
          </div>
          <div className="text-xs text-gray-500 capitalize">{busyTime.type}</div>
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
