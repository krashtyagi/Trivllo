import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertOverlay, DeleteProfileRequestDialog } from "@/components/ui/alert-dialouge";
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogOverlay, DialogPortal, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import React from "react";
import { VisuallyHidden } from "radix-ui";
import AuthContextProvider from "@/context/auth/auth-form-provider";
import ResetPasswordContextProvider from "@/context/auth/resetpasswordsteps";
import { ResetPassword, SignInForm, SignupForm } from "@/components/auth/_components/sign-in-hover";
import { cn } from "@/lib/utils";
import { useLanguageStore, type Language } from "@/store/language.store";
import { useTranslation } from "@/hooks/useTranslation";
import { DeleteRequest } from "@/services/personal/profile.service";
import { toast } from "sonner";


export default function SettingsPage() {
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  return (
    <Card className="rounded-xl shadow-sm bg-background">
      <CardHeader>
        <CardTitle className="text-xl">
          {t("settings.title")}
        </CardTitle>

      </CardHeader>
      <Separator />

      <CardContent className="space-y-6">
        {/* <SettingRow
          title={t("settings.currency")}
          description={t("settings.currencyDesc")}
        >
          <Select defaultValue="usd">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">U.S. Dollar</SelectItem>
              <SelectItem value="eur">Euro</SelectItem>
              <SelectItem value="inr">Indian Rupee</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow> */}

        {/* <Separator /> */}

        <SettingRow
          title={t("settings.language")}
          description={t("settings.languageDesc")}
        >
          <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        {/* <Separator />

        <SettingRow
          title={t("settings.recommendations")}
          description={t("settings.recommendationsDesc")}
        >
          <Switch defaultChecked />
        </SettingRow> */}

        <Separator />

        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-1">{t("settings.security")}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("settings.securityDesc")}
          </p>

          <SettingRow
            title={t("settings.password")}
            description={t("settings.passwordDesc")}
          >
            <ResetPasswordDialog tag="ResetPassword" />
          </SettingRow>

          <Separator className="my-6" />

          <SettingRow
            title={t("settings.removeAccount")}
            description={t("settings.removeAccountDesc")}
          >
            <DeleteProfile />
          </SettingRow>
        </div>
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
const DeleteProfile = () => {
  const { t } = useTranslation();
  const handelDeleteProfile = () => {
  };
  return (
    <DeleteProfileRequestDialog
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


export function ResetPasswordDialog({
  forLike,
  tag: tg,
  variant,
  className
}: {
  forLike?: {
    content: React.ReactNode;
    id?: string;
    type: string;
    do: string;
  }
  className?: string;
  tag: "Log-in" | "Sign-up" | "ResetPassword";
  variant?:
  | "link"
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost";
}) {
  // console.log("trigger menu");
  const [tag, setTag] = React.useState<"Log-in" | "Sign-up" | "ResetPassword">(tg);
  const { type: t, do: d } = forLike || {};


  return (
    <Dialog >
      <DialogTrigger asChild >

        <Button variant={variant} className={cn("w-full flex justify-start", className)}>{tg}</Button>
      </DialogTrigger>
      <DialogContent className="md:w-[500px]  p-0 rounded-2xl overflow-hidden pb-4 w-[340px] z-65">
        <DialogTitle className="sr-only hidden">Login</DialogTitle>


        <ResetPasswordContextProvider>
          <ResetPassword setTag={setTag} hideTag={true} />
        </ResetPasswordContextProvider>

      </DialogContent>
    </Dialog>
  );
}