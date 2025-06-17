import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
}

export function Stats({ label, value, icon }: StatsProps) {
  return (
    <Card className="text-center bg-[var(--secondary-light)] rounded-xl p-3 min-w-[70px] shadow-none border-0 gap-0">
      <CardHeader className="p-0 flex flex-col items-center">
        {icon && <div className="mb-1 text-gray-500">{icon}</div>}
        <div className="font-extrabold text-lg text-gray-900">{value}</div>
      </CardHeader>
      <CardContent className="p-0 text-xs text-gray-600">{label}</CardContent>
    </Card>
  );
}
