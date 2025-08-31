import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const DashboardCard = ({
  title,
  description,
  endAngle,
  totalValue,
  lastMonthValue,
  footerText,
  chartData,
  chartConfig,
}) => {
  // ✅ Calculate percentage change
  let percentChange = 0;
  let trend = "no-change";

  if (lastMonthValue === 0 && totalValue > 0) {
    percentChange = 100;
    trend = "up";
  } else if (lastMonthValue === 0 && totalValue === 0) {
    percentChange = 0;
    trend = "no-change";
  } else {
    percentChange = ((totalValue - lastMonthValue) / lastMonthValue) * 100;
    trend = percentChange > 0 ? "up" : percentChange < 0 ? "down" : "no-change";
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[200px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={endAngle}
            innerRadius={80}
            outerRadius={100}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {totalValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          This Month
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {trend === "up" && (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">
                Trending up by {percentChange.toFixed(1)}% this month
              </span>
            </>
          )}
          {trend === "down" && (
            <>
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-red-600">
                Trending down by {Math.abs(percentChange).toFixed(1)}% this month
              </span>
            </>
          )}
          {trend === "no-change" && (
            <span className="text-gray-500">No change compared to last month</span>
          )}
        </div>
        <div className="text-muted-foreground leading-none">{footerText}</div>
      </CardFooter>
    </Card>
  );
};

export default DashboardCard;