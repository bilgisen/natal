"use client"

import * as React from "react"
import { CalendarIcon, Clock, ChevronDownIcon, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

/* ------------------- Date helpers ------------------- */

function toDate(input: unknown): Date | undefined {
  if (!input) return undefined
  if (input instanceof Date) return isNaN(input.getTime()) ? undefined : input
  try {
    const d = new Date(input as string)
    return isNaN(d.getTime()) ? undefined : d
  } catch {
    return undefined
  }
}

function formatDate(input: unknown) {
  const date = toDate(input)
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  return date instanceof Date && !isNaN(date.getTime())
}

function toValidDate(value: Date | string | undefined, baseDate?: Date): Date {
  const now = baseDate || new Date();
  
  // If it's already a valid Date, return a new Date with the same date but local time
  if (value instanceof Date && !isNaN(value.getTime())) {
    const d = new Date(now);
    d.setHours(value.getHours(), value.getMinutes(), 0, 0);
    return d;
  }

  // If it's a string in "HH:mm" format
  if (typeof value === "string") {
    const [h, m] = value.split(":").map((v) => parseInt(v, 10));
    const d = new Date(now);
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }

  // Default to 00:00 (midnight) if no time is provided
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* ------------------- DateTimePicker ------------------- */

interface DateTimePickerProps {
  date: Date | undefined
  time: Date | undefined
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: Date) => void
  dateLabel?: string
  timeLabel?: string
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const initialDate = toDate(date)
  const [month, setMonth] = React.useState<Date | undefined>(initialDate)
  const [dateValue, setDateValue] = React.useState(formatDate(initialDate))

  // Default time 12:30
  const defaultTime = React.useMemo(() => {
    const t = new Date()
    t.setHours(12, 30, 0, 0)
    return t
  }, [])

  // Eğer time undefined ise, defaultTime tetikle
  React.useEffect(() => {
    if (!time) {
      onTimeChange(defaultTime)
    }
  }, [time, onTimeChange, defaultTime])

  React.useEffect(() => {
    const d = toDate(date)
    setDateValue(formatDate(d))
    setMonth(d)
  }, [date])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, 0, 0, 0
      )
      onDateChange(newDate)
      setMonth(newDate)
    } else {
      onDateChange(selectedDate)
      setMonth(selectedDate)
    }
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setDateValue(input)
    const parsedDate = new Date(input)
    if (isValidDate(parsedDate)) {
      onDateChange(parsedDate)
      setMonth(parsedDate)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {/* DATE PICKER */}
        <div className="relative flex-1">
          <Label className="px-1 text-xs">{dateLabel}</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  value={dateValue}
                  placeholder="Select date"
                  className="pr-10 bg-background"
                  onChange={handleInputChange}
                  onClick={() => setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") setOpen(true)
                  }}
                />
                <Button
                  variant="ghost"
                  className="absolute top-9 right-2 size-6 -translate-y-1/2"
                  type="button"
                  onClick={() => setOpen(!open)}
                >
                  <CalendarIcon className="size-3.5" />
                  <span className="sr-only">Select date</span>
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" alignOffset={-8} sideOffset={10}>
              <Calendar
                mode="single"
                selected={toDate(date)}
                captionLayout="dropdown"
                month={month}
                onMonthChange={setMonth}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* TIME PICKER */}
        <div className="flex-1">
          <Label className="px-1 text-xs">{timeLabel}</Label>
          <SimpleTimePicker
            value={toValidDate(time)}
            onChange={(newTime) => onTimeChange(newTime)}
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------- SimpleTimePicker (HH:mm) ------------------- */

function SimpleTimePicker({
  value,
  onChange,
  disabled,
  modal,
}: {
  value: Date
  onChange: (date: Date) => void
  disabled?: boolean
  modal?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  // Display always comes from the prop value
  const display = format(value, "HH:mm")

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  const minutes = React.useMemo(() => Array.from({ length: 60 }, (_, i) => i), [])

  const updateTime = (h: number, m: number) => {
    // Create a new date maintaining the date from value prop
    const updated = new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      h,
      m,
      0,
      0
    )
    
    onChange(updated)
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex h-9 items-center justify-between px-3 text-sm border border-input rounded-md shadow-sm cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Clock className="mr-2 size-4" />
          {display}
          <ChevronDownIcon className="ml-2 size-4 opacity-50" />
        </div>
      </PopoverTrigger>

      <PopoverContent className="p-0" side="top">
        <div className="flex h-56 p-2 gap-2">
          {/* Hours */}
          <ScrollArea className="flex-1">
            {hours.map((h) => (
              <TimeItem
                key={h}
                label={String(h).padStart(2, "0")}
                selected={h === value.getHours()}
                onClick={() => updateTime(h, value.getMinutes())}
              />
            ))}
          </ScrollArea>

          {/* Minutes */}
          <ScrollArea className="flex-1">
            {minutes.map((m) => (
              <TimeItem
                key={m}
                label={String(m).padStart(2, "0")}
                selected={m === value.getMinutes()}
                onClick={() => updateTime(value.getHours(), m)}
              />
            ))}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ------------------- TimeItem ------------------- */

function TimeItem({
  label,
  selected,
  onClick,
}: {
  label: string
  selected?: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-center text-sm rounded-md h-8",
        selected && "bg-accent text-accent-foreground"
      )}
      onClick={onClick}
    >
      {selected && <CheckIcon className="w-3 h-3 mr-1" />}
      {label}
    </Button>
  )
}
