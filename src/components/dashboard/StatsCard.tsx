import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "text-primary",
  className
}: StatsCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate flex-1 mr-2">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0", color)} />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{value}</div>
        {(description || trend) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-1 sm:gap-2">
            {description && (
              <p className="text-xs text-muted-foreground truncate flex-1">{description}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs font-medium flex-shrink-0",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}