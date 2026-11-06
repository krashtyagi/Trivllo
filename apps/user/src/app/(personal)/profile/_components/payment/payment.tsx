import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Switch } from "@/components/ui/switch";
import { AlertOverlay } from "@/components/ui/alert-dialouge";
import { useTranslation } from "@/hooks/useTranslation";

export default function PaymentPage() {
  const { t } = useTranslation();

  return (
      <Card className="rounded-xl shadow-sm bg-background">
        <CardHeader>
          <CardTitle className="text-xl">
            {t("payment.title")}
          </CardTitle>
          <CardDescription>
            {t("payment.subtitle")}
          </CardDescription>
        </CardHeader>
        <Separator />

        <CardContent className="space-y-6">
          <SettingRow
            title={t("payment.title")}
            description={t("payment.addMethod")}
          >
           <div>{t("payment.add")}</div>
          </SettingRow>

          <Separator />

          <SettingRow
            title={t("payment.giftCredit")}
            description={t("payment.giftCreditDesc")}
          >
            <p>{t("payment.addGiftCard")}</p>
          </SettingRow>

          <Separator />

          <SettingRow
            title={t("settings.recommendations")}
            description={t("settings.recommendationsDesc")}
          >
            <Switch defaultChecked />
          </SettingRow>

          <Separator />

          
        </CardContent>
      </Card>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="max-w-[70%]">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
export const DeleteProfile = () => {
  const { t } = useTranslation();
  const handelDeleteProfile = () => {
  };
  return (
    <AlertOverlay
      trigger={t("settings.deleteProfile")}
      variant="destructive"
      handelSumbit={handelDeleteProfile}
      title={t("settings.deleteProfile")}
      description={t("settings.deleteProfileConfirm")}
      continueTitle={t("settings.delete")}
      canecelTitle={t("settings.cancel")}
    />
  );
};
