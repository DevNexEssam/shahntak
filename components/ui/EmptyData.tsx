"use client"

import { HiOutlineCalendar } from "react-icons/hi2";

interface EmptyDataProps {
  message?: string;
  icon?: React.ElementType;
}

const EmptyData = ({
  message = "لا توجد بيانات متاحة",
  icon: Icon = HiOutlineCalendar
}: EmptyDataProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 bg-muted/5 rounded-md border-2 border-dashed border-zinc-200">
      <div className="p-4 bg-muted/10 rounded-sm">
        <Icon className="w-12 h-12 text-body-text" />
      </div>
      <p className="text-body-text font-medium text-sm">{message}</p>
    </div>
  );
};

export default EmptyData;