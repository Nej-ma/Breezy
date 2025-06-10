import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
}

export function Stats({ label, value, icon }: StatsProps) {
  return (
    <Card className="w-18 md:w-22 text-center border-0 shadow-none bg-transparent">
      <CardHeader className="p-0 flex flex-col items-center">
        {icon && <div className="text-gray-500">{icon}</div>}
        <div className="text-lg font-bold">{value}</div>
      </CardHeader>
      <CardContent className="p-0 text-sm text-gray-500">{label}</CardContent>
    </Card>
  );
}
