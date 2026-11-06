"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// --- Mock Data ---
const earningsData = [
  { month: "Jan", income: 21000, expense: -18000 },
  { month: "Feb", income: 18000, expense: -22000 },
  { month: "Mar", income: 12000, expense: -15000 },
  { month: "Apr", income: 19000, expense: -19000 },
  { month: "May", income: 23000, expense: -24000 },
  { month: "Jun", income: 26000, expense: -26000 },
  { month: "Jul", income: 21500, expense: -15600 },
  { month: "Aug", income: 14000, expense: -10000 },
  { month: "Sep", income: 20000, expense: -17000 },
  { month: "Oct", income: 24000, expense: -23000 },
  { month: "Nov", income: 21000, expense: -19000 },
  { month: "Dec", income: 25000, expense: -16000 },
];

const expenseBreakdown = [
  { name: "Salaries", value: 15000, fill: "#d1fae5" },
  { name: "Utilities", value: 5000, fill: "#a7f3d0" },
  { name: "Maintenance", value: 4000, fill: "#d9f99d" },
  { name: "Supplies", value: 3000, fill: "#8b5cf6" },
  { name: "Marketing", value: 2000, fill: "#fef9c3" },
  { name: "Misc", value: 1000, fill: "#ecfdf5" },
];

export function FinancialDashboard() {
  return (
    <div className="flex p-8 gap-8 w-full justify-between">
      <div className=" bg-transparent  space-y-8  w-full">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Balance"
            amount="$15,650"
            trend="+3.56%"
            trendUp={true}
          />
          <StatCard
            title="Total Income"
            amount="$45,650"
            trend="-1.25%"
            trendUp={false}
          />
          <StatCard
            title="Total Expenses"
            amount="$30,000"
            trend="+4.79%"
            trendUp={true}
          />
        </div>

        <Card className="lg:col-span-2 ">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Earnings</CardTitle>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" /> Income
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#d1fae5]" /> Expense
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <BarChart data={earningsData} stackOffset="sign">
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar
                  dataKey="income"
                  fill="#d1fae5"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Bar
                  dataKey="expense"
                  fill="#8b5cf6"
                  radius={[0, 0, 4, 4]}
                  stackId="a"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex bg-muted p-1 rounded-lg mb-4">
            <button className="flex-1 text-sm py-1">Income</button>
            <button className="flex-1 text-sm py-1 bg-background rounded shadow-sm">
              Expense
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative h-[200px] w-full">
            <PieChart width={250} height={200} className="mx-auto">
              <Pie
                data={expenseBreakdown}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">$30,000</span>
              <span className="text-xs text-muted-foreground">
                Total Expense
              </span>
            </div>
          </div>

          {/* Legend List */}
          <div className="w-full mt-6 space-y-3">
            {expenseBreakdown.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, amount, trend, trendUp }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{amount}</div>
        <div
          className={`mt-2 flex items-center text-xs p-1 rounded-md w-fit ${trendUp ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700"}`}
        >
          {trendUp ? (
            <TrendingUp className="mr-1 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {trend} <span className="ml-1 opacity-70">from last week</span>
        </div>
      </CardContent>
    </Card>
  );
}
