"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Crown, Zap, Star } from "lucide-react";

type Usage = {
  planName: string;
  usedTokens: number;
  monthlyQuota: number;
  usagePercent: number;
  remainingTokens: number;
  periodEnd: string | null;
};

export default function TokenUsageWidgetPremium() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/ai/usage");
        const data = await res.json();
        setUsage(data);
      } catch (err) {
        console.error("Error fetching usage:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  // Plan'a göre renk paleti ve icon
  const getPlanStyle = (planName: string) => {
    if (planName === "Ultimate 5M") {
      return {
        color: "text-emerald-600",
        bgColor: "bg-card-50",
        borderColor: "border-emerald-200",
        icon: <Crown className="h-4 w-4" />,
      };
    } else if (planName === "Pro 1M") {
      return {
        color: "text-amber-600",
        bgColor: "bg-card-30",
        borderColor: "border-amber-200",
        icon: <Star className="h-4 w-4" />,
      };
    } else {
      return {
        color: "text-blue-600",
        bgColor: "bg-card",
        borderColor: "border-card",
        icon: <Zap className="h-4 w-4" />,
      };
    }
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-md rounded-2xl">
        <CardTitle className="flex items-center gap-2">
          <div className="animate-pulse bg-card h-4 w-4 rounded"></div>
          AI Token Usage
        </CardTitle>
        <CardContent>
          <div className="animate-pulse bg-card h-2 w-full rounded mt-4"></div>
          <div className="animate-pulse bg-card h-4 w-3/4 rounded mt-2"></div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card className="p-6 shadow-md rounded-2xl border-red-200 bg-red-50">
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Zap className="h-4 w-4" />
          AI Token Usage
        </CardTitle>
        <CardContent>
          <p className="text-red-600">Kullanım verisi bulunamadı.</p>
          <p className="text-sm text-red-500 mt-1">
            Lütfen daha sonra tekrar deneyin veya destek ekibiyle iletişime geçin.
          </p>
        </CardContent>
      </Card>
    );
  }

  const planStyle = getPlanStyle(usage.planName);
  const formattedDate = usage.periodEnd
    ? new Date(usage.periodEnd).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
      })
    : "—";

  // %80 üstü kullanım için uyarı stili
  const isWarning = (usage.usagePercent || 0) >= 80;
  // Note: progressColor variable is calculated but not currently used in the UI
  // const progressColor = isWarning ? "bg-red-500" : "bg-blue-500";

  return (
    <Card className={`p-6 shadow-lg rounded-2xl border-2 ${planStyle.borderColor} ${planStyle.bgColor} transition-all duration-300 hover:shadow-xl`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="flex items-center gap-2">
            <span className={planStyle.color}>{planStyle.icon}</span>
            AI Token Usage
          </span>
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${planStyle.color} ${planStyle.bgColor}`}>
            {usage.planName}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {(usage.usedTokens || 0).toLocaleString()} /{" "}
            {(usage.monthlyQuota || 0).toLocaleString()} tokens
          </span>
          <span className={`font-semibold ${isWarning ? 'text-red-600' : 'text-gray-600'}`}>
            {(usage.usagePercent || 0)}%
          </span>
        </div>

        <div className="relative">
          <Progress
            value={usage.usagePercent || 0}
            className="h-3 rounded-full"
          />
          {isWarning && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-green-600">
              {(usage.remainingTokens || 0).toLocaleString()}
            </span>{" "}
            tokens remaining
          </p>
          <p className="text-xs text-muted-foreground">
            Reset on <span className="font-semibold text-blue-600">{formattedDate}</span>
          </p>
        </div>

        {isWarning && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">
              ⚠️ Token limitiniz dolmak üzere!
            </p>
            <p className="text-xs text-red-500 mt-1">
              Daha fazla kullanım için planınızı yükseltin.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          variant="outline"
          className={`w-full flex items-center justify-center gap-2 hover:${planStyle.color} transition-colors`}
          onClick={() => (window.location.href = "/pricing")}
        >
          <ArrowUpRight size={16} />
          {isWarning ? "Upgrade Now" : "Upgrade Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
