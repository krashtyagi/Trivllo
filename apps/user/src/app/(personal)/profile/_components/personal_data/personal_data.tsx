import {
  FieldGroup,
  FieldSet,
  FieldSeparator,
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserUpdateSchema, type UserUpdateProps } from "@/schema/user";
import { toast } from "sonner";
import React, { useEffect } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser } from "@/services/hotel/querys";
import { PageSkeleton } from "@/components/loader/skeleton";
import { MessageModal } from "@/components/messagemodal";
import { useTranslation } from "@/hooks/useTranslation";

export function UserProfileFields({
  currUser,
  refetch,
}: {
  currUser: { data: any };
  refetch: () => void;
}) {
  const { updateUser } = useAuthStore();
  const { t } = useTranslation();
  // console.log(currUser);

  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserUpdateProps>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      firstName: currUser?.data?.firstName || "",
      lastName: currUser?.data?.lastName || "",
      // email: currUser?.data?.email || "",
      phoneNumber: currUser?.data?.phoneNumber || "",
      gender:
        (currUser?.data?.gender as "male" | "female" | "other") || "other",
      country: currUser?.data?.country || "India",
      address: currUser?.data?.address || "",
      zipcCode: (currUser as any)?.zipcCode || "",
    },
  });

  useEffect(() => {
    if (currUser) {
      reset({
        firstName: currUser?.data?.firstName || "",
        lastName: currUser?.data?.lastName || "",
        // email: currUser?.data?.email || "",
        phoneNumber: currUser?.data?.phoneNumber || "",

        gender:
          (currUser?.data?.gender as "male" | "female" | "other") || "other",
        country: currUser?.data?.country || "India",
        address: currUser?.data?.address || "",
        zipcCode: (currUser as any)?.data?.zipcCode || "",
      });
    }
  }, [currUser, reset]);

  const onHandleSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {

      const result = await updateUser(data);
      if (result.success) {
        toast.success(result.message);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="w-full ">
      <form onSubmit={onHandleSubmit}>
        <FieldGroup>
          <FieldSet>
            <FieldGroup className="flex flex-grid">
              <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                <Field>
                  <FieldLabel>{t("personal.firstName")}</FieldLabel>
                  <Input
                    {...register("firstName")}
                    placeholder={t("personal.enterFirstName")}
                  />
                  {errors.firstName && (
                    <span className="text-destructive text-xs">
                      {errors.firstName.message}
                    </span>
                  )}
                </Field>
                <Field>
                  <FieldLabel>{t("personal.lastName")}</FieldLabel>
                  <Input
                    {...register("lastName")}
                    placeholder={t("personal.enterLastName")}
                  />
                  {errors.lastName && (
                    <span className="text-destructive text-xs">
                      {errors.lastName.message}
                    </span>
                  )}
                </Field>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                <Field>
                  <FieldLabel>{t("personal.email")}</FieldLabel>
                  <Input
                    disabled
                    defaultValue={currUser?.data?.email || ""}
                    placeholder={t("personal.enterEmail")}
                    className="bg-muted cursor-not-allowed"
                  />
                  {/* <span className="text-destructive text-xs">
                    {"Can't update email"}
                  </span> */}
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">{t("personal.phone")}</FieldLabel>
                  <Input
                    {...register("phoneNumber")}
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                  {errors.phoneNumber && (
                    <span className="text-destructive text-xs">
                      {errors.phoneNumber.message}
                    </span>
                  )}
                </Field>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                <Field>
                  <FieldLabel>{t("personal.gender")}</FieldLabel>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t("personal.chooseGender")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t("personal.male")}</SelectItem>
                          <SelectItem value="female">{t("personal.female")}</SelectItem>
                          <SelectItem value="other">{t("personal.other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel>{t("personal.country")}</FieldLabel>
                  <Controller
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t("personal.selectCountry")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="United States">
                            United States
                          </SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">
                            United Kingdom
                          </SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                <Field>
                  <FieldLabel>{t("personal.address")}</FieldLabel>
                  <Input
                    {...register("address")}
                    placeholder={t("personal.enterAddress")}
                  />
                </Field>
                <Field>
                  <FieldLabel>{t("personal.zipCode")}</FieldLabel>
                  <Input
                    {...register("zipcCode")}
                    placeholder={t("personal.enterZipCode")}
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />

          <Field orientation="horizontal" className="md:flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => reset()}>
              {t("personal.discard")}
            </Button>
            <Button type="submit" variant={"secondary"} disabled={loading}>
              {loading ? t("personal.saving") : t("personal.saveChanges")}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}

export const UserProfileUpdateForm = ({
  className,
  currUser,
  refetch,
}: {
  className?: string;
  currUser: { data: any };
  refetch: () => void;
}) => {
  return (
    <div className={cn(" w-full", className)}>
      <UserProfileFields currUser={currUser} refetch={refetch} />
    </div>
  );
};

export const PersonProfilePersonalData = ({
  className,
}: {
  className?: string;
}) => {
  const { data: currUser, isLoading, isError, refetch } = useCurrentUser();
  const { t } = useTranslation();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return <MessageModal title={t("auth.unauthorized")} description={t("auth.loginToContinue")} />;
  }

  return (
    <PersonalData
      className="w-full "
      avatat={
        <ProfileAvatar
          className="rounded-xl shadow-sm border border-border"
          currUser={currUser}
          refetch={refetch}
        />
      }
      form={
        <UserProfileUpdateForm
          className="rounded-xl shadow-sm p-3  border border-border "
          currUser={currUser}
          refetch={refetch}
        />
      }
    />
  );
};

const PersonalData = ({
  avatat,
  form,
  className: cc,
}: {
  className?: string;
  avatat: React.ReactNode;
  form: React.ReactNode;
}) => {
  return (
    <div className={cn("flex flex-col gap-4 w-full", cc)}>
      {avatat}
      {form}
    </div>
  );
};

const ProfileAvatar = ({
  className,
  currUser,
  refetch,
}: {
  className?: string;
  currUser: { data: any };
  refetch: () => void;
}) => {
  const { uploadFile, updateUser } = useAuthStore();
  const { t } = useTranslation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (result.success && result.url) {
        const updateResult = await updateUser({ avatar: result.url });
        if (updateResult.success) {
          toast.success("Profile image updated");
          refetch();
        } else {
          toast.error(updateResult.message);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };
  // console.log(currUser);

  return (
    <div className={cn("flex items-center gap-3 px-2 py-3 w-full ", className)}>
      <div className="relative group cursor-pointer" onClick={handleImageClick}>
        <Image
          src={currUser?.data?.avatar || "/icons/user.png"}
          alt="user"
          width={100}
          height={100}
          className={cn(
            "rounded-full object-cover w-[100px] h-[100px] transition-opacity",
            uploading ? "opacity-50" : "group-hover:opacity-75",
          )}
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {!uploading && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
              {t("personal.update")}
            </span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <p className="text-xl font-medium">
          {currUser
            ? `${currUser.data.firstName || ""} ${currUser.data.lastName || ""}`.trim() ||
            currUser.data.email
            : t("auth.guestUser")}
        </p>
        <p className="text-lg text-muted-foreground">
          {currUser?.data?.role || "User"}
        </p>
      </div>
    </div>
  );
};
