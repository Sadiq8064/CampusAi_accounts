import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    className?: string;
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
    const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(
        date
    );
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (date) {
            setSelectedDateTime(date);
        }
    }, [date]);

    const handleSelect = (day: Date | undefined) => {
        if (!day) {
            setSelectedDateTime(undefined);
            setDate(undefined);
            return;
        }
        const newDateTime = new Date(day);
        if (selectedDateTime) {
            newDateTime.setHours(selectedDateTime.getHours());
            newDateTime.setMinutes(selectedDateTime.getMinutes());
        } else {
            // Default to 12:00 AM if no time was selected previously
            newDateTime.setHours(0, 0, 0, 0);
        }
        setSelectedDateTime(newDateTime);
        setDate(newDateTime);
    };

    const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string) => {
        if (!selectedDateTime) return;
        const newDateTime = new Date(selectedDateTime);

        if (type === "hour") {
            const currentHours = newDateTime.getHours();
            const isPM = currentHours >= 12;
            let newHours = parseInt(value);
            if (isPM && newHours !== 12) newHours += 12;
            if (!isPM && newHours === 12) newHours = 0;
            newDateTime.setHours(newHours);
        } else if (type === "minute") {
            newDateTime.setMinutes(parseInt(value));
        } else if (type === "ampm") {
            const currentHours = newDateTime.getHours();
            if (value === "PM" && currentHours < 12) {
                newDateTime.setHours(currentHours + 12);
            } else if (value === "AM" && currentHours >= 12) {
                newDateTime.setHours(currentHours - 12);
            }
        }

        setSelectedDateTime(newDateTime);
        setDate(newDateTime);
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP p") : <span>Pick a date and time</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex divide-x divide-border">
                    <Calendar
                        mode="single"
                        selected={selectedDateTime}
                        onSelect={handleSelect}
                        initialFocus
                        className="p-3"
                    />
                    <div className="flex flex-col p-3 w-[200px]">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Time</span>
                        </div>
                        <div className="flex h-[280px] divide-x divide-border border rounded-md overflow-hidden">
                            {/* Hours */}
                            <ScrollArea className="flex-1">
                                <div className="flex flex-col p-1">
                                    {hours.map((hour) => {
                                        const currentHours = selectedDateTime ? selectedDateTime.getHours() : 0;
                                        const displayHour = currentHours % 12 || 12;
                                        const isSelected = selectedDateTime && displayHour === hour;
                                        return (
                                            <Button
                                                key={hour}
                                                variant={isSelected ? "default" : "ghost"}
                                                size="sm"
                                                className={cn("w-full justify-center shrink-0", isSelected && "bg-primary text-primary-foreground")}
                                                onClick={() => handleTimeChange("hour", hour.toString())}
                                                disabled={!selectedDateTime}
                                            >
                                                {hour.toString().padStart(2, '0')}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                            {/* Minutes */}
                            <ScrollArea className="flex-1">
                                <div className="flex flex-col p-1">
                                    {minutes.map((minute) => {
                                        const isSelected = selectedDateTime && selectedDateTime.getMinutes() === minute;
                                        return (
                                            <Button
                                                key={minute}
                                                variant={isSelected ? "default" : "ghost"}
                                                size="sm"
                                                className={cn("w-full justify-center shrink-0", isSelected && "bg-primary text-primary-foreground")}
                                                onClick={() => handleTimeChange("minute", minute.toString())}
                                                disabled={!selectedDateTime}
                                            >
                                                {minute.toString().padStart(2, '0')}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                            {/* AM/PM */}
                            <ScrollArea className="flex-1">
                                <div className="flex flex-col p-1">
                                    {["AM", "PM"].map((ampm) => {
                                        const currentHours = selectedDateTime ? selectedDateTime.getHours() : 0;
                                        const isPM = currentHours >= 12;
                                        const isSelected = selectedDateTime && ((ampm === "PM" && isPM) || (ampm === "AM" && !isPM));
                                        return (
                                            <Button
                                                key={ampm}
                                                variant={isSelected ? "default" : "ghost"}
                                                size="sm"
                                                className={cn("w-full justify-center shrink-0", isSelected && "bg-primary text-primary-foreground")}
                                                onClick={() => handleTimeChange("ampm", ampm)}
                                                disabled={!selectedDateTime}
                                            >
                                                {ampm}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
