"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type MonthCaptionProps, useDayPicker } from "react-day-picker"

import { Button, buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2024, month, 1))
)

function CalendarCaption({ calendarMonth, className }: MonthCaptionProps) {
  const { goToMonth, previousMonth, nextMonth, dayPickerProps } = useDayPicker()
  const month = calendarMonth.date
  const startYear = dayPickerProps.startMonth?.getFullYear() ?? month.getFullYear() - 100
  const endYear = dayPickerProps.endMonth?.getFullYear() ?? month.getFullYear() + 10
  const years = Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)

  const changeMonth = (value: string) => {
    goToMonth(new Date(month.getFullYear(), Number(value), 1))
  }

  const changeYear = (value: string) => {
    goToMonth(new Date(Number(value), month.getMonth(), 1))
  }

  return (
    <div className={cn("mb-4 flex items-center justify-between gap-1.5", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        aria-label="Previous month"
        className="size-8 shrink-0 rounded-full border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <ChevronLeft className="size-3.5" />
      </Button>
      <div className="flex min-w-0 flex-1 justify-center gap-1.5">
        <Select value={String(month.getMonth())} onValueChange={changeMonth}>
          <SelectTrigger
            aria-label="Choose month"
            className="h-8 w-[4.75rem] rounded-full border-slate-700 bg-slate-950 px-3 text-sm font-semibold text-white shadow-none hover:border-slate-500 focus:ring-sky-500 [&>svg]:size-3.5 [&>svg]:shrink-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[80] min-w-[4.75rem] border-slate-800 bg-slate-950 text-white">
            {MONTHS.map((label, value) => (
              <SelectItem key={label} value={String(value)}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(month.getFullYear())} onValueChange={changeYear}>
          <SelectTrigger
            aria-label="Choose year"
            className="h-8 w-[5.25rem] rounded-full border-slate-700 bg-slate-950 px-3 text-sm font-semibold text-white shadow-none hover:border-slate-500 focus:ring-sky-500 [&>svg]:size-3.5 [&>svg]:shrink-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[80] min-w-[5.25rem] border-slate-800 bg-slate-950 text-white">
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        aria-label="Next month"
        className="size-8 shrink-0 rounded-full border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  )
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      hideNavigation
      className={cn("w-full p-1", className)}
      classNames={{
        root: "w-full",
        months: "flex flex-col space-y-4",
        month: "w-full space-y-3",
        month_caption: "w-full",
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7",
        weekday: "py-1.5 text-center text-xs font-medium text-slate-500",
        weeks: "block w-full",
        week: "grid w-full grid-cols-7",
        day: "relative p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "mx-auto size-8 rounded-full p-0 text-xs font-normal text-slate-200 hover:bg-slate-800 hover:text-white"
        ),
        selected: "[&>button]:bg-sky-600 [&>button]:text-white [&>button]:hover:bg-sky-600 [&>button]:hover:text-white",
        today: "[&>button]:border [&>button]:border-sky-500/50 [&>button]:text-sky-300",
        outside: "[&>button]:text-slate-600",
        disabled: "[&>button]:text-slate-700 [&>button]:opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        MonthCaption: CalendarCaption,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
