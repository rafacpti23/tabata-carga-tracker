
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Stat {
  title: string;
  value: string;
  description: string;
  progress?: number;
  footer?: string;
  trend?: number;
  icon?: React.ReactNode;
  color?: string;
}

interface StatsProps {
  stats: Stat[];
}

export function StatsCards({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`overflow-hidden border-l-4 ${stat.color || "border-tabata-600"}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.icon && <span className="text-muted-foreground">{stat.icon}</span>}
            </div>
            <CardDescription className="text-2xl font-bold">
              {stat.value}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-xs text-muted-foreground">
              {stat.description}
            </div>
            {stat.progress !== undefined && (
              <div className="mt-2">
                <Progress value={stat.progress} className="h-1" />
              </div>
            )}
          </CardContent>
          {stat.footer && (
            <CardFooter className="pt-0 text-xs">
              <div className="flex items-center">
                {stat.trend !== undefined && (
                  <span
                    className={`mr-1 ${
                      stat.trend > 0
                        ? "text-green-500"
                        : stat.trend < 0
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {stat.trend > 0
                      ? "↑"
                      : stat.trend < 0
                      ? "↓"
                      : "→"}
                  </span>
                )}
                {stat.footer}
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
