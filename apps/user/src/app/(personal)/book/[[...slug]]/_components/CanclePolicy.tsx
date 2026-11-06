import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export function CancellationPolicyCard() {
    return (
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
            <CardContent className="p-6">
                <div className="flex gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">Cancellation Policy</h4>
                        <p className="text-xs text-blue-800/70 dark:text-blue-400">
                            Free cancellation before Aug 1. Get a partial refund if cancelled before Jul 10.
                        </p>
                        <Button variant="link" size="sm" className="h-auto p-0 text-blue-700 font-bold" onClick={(e) => {
                            e.preventDefault()
                        }}>View full policy</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}