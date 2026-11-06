import { Building2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export const MessageModal = ({title,description}: {title: string, description: string}) => {
  return (
    <div className="flex items-center justify-center min-full ">
      <Card className="w-full  shadow-lg rounded-2xl border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-muted-foreground" />

          <h2 className="text-2xl font-semibold tracking-tight">
            {title}
          </h2>

          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};