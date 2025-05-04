import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type HighlightedDate = {
  day: number;
  icon: "star" | "circle";
  tooltip: string;
};

const PayrollCalendar: React.FC = () => {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    t("january"), t("february"), t("march"), t("april"),
    t("may"), t("june"), t("july"), t("august"),
    t("september"), t("october"), t("november"), t("december")
  ];
  
  const dayNames = [
    t("sunday"), t("monday"), t("tuesday"), 
    t("wednesday"), t("thursday"), t("friday"), t("saturday")
  ];

  // Get the days in the current month
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  
  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Define highlighted dates
  const getHighlightedDates = (): HighlightedDate[] => {
    return [
      { day: 15, icon: "star", tooltip: t("payPeriodStart") },
      { day: daysInMonth, icon: "star", tooltip: t("payPeriodStart") },
      { day: 5, icon: "circle", tooltip: t("payDay") },
      { day: 20, icon: "circle", tooltip: t("payDay") },
    ];
  };

  const highlightedDates = getHighlightedDates();
  
  // Check if a day is highlighted
  const getHighlight = (day: number): HighlightedDate | undefined => {
    return highlightedDates.find(date => date.day === day);
  };

  // Generate calendar days
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day invisible"></div>);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const highlight = getHighlight(day);
    const isHighlighted = !!highlight;
    const iconType = highlight?.icon;
    
    days.push(
      <div key={`day-${day}`} className="calendar-day-wrapper">
        {isHighlighted ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "calendar-day relative",
                  iconType === "circle" && "pay-date"
                )}
              >
                {day}
                {iconType === "star" && (
                  <Star className="h-3 w-3 text-brand-accent absolute -top-1 -right-1" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{highlight.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="calendar-day">
            {day}
          </div>
        )}
      </div>
    );
  }
  
  const navigateMonth = (change: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + change);
    setCurrentDate(newDate);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{t("calendar")}</CardTitle>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded-full hover:bg-muted"
          >
            ←
          </button>
          <span className="text-sm font-medium">
            {`${monthNames[month]} ${year}`}
          </span>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-1 rounded-full hover:bg-muted"
          >
            →
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {dayNames.map((day, index) => (
            <div key={index} className="text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        <div className="flex flex-col space-y-1 mt-4 text-sm">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-brand-accent mr-2" />
            <span>{t("payPeriodStart")}</span>
          </div>
          <div className="flex items-center">
            <Circle className="h-4 w-4 text-paydate mr-2" />
            <span>{t("payDay")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayrollCalendar;
