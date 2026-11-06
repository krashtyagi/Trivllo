
"use client"

import * as React from "react"
import { useState, useEffect, useTransition } from "react"
import { Check, LogInIcon, Camera, UploadCloud, Building, Loader2, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconSwitch,
  IconUserCircle,
  IconPhoto,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useCurrentUser } from "@/services/queryes"
import { Spinner } from "./ui/spinner"
import { ScrollArea } from "./ui/scroll-area"
import { VendorAccountsConnectAccount } from "@/services/fetch.service"
import { toast } from "sonner"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useGetConnectedAccounts } from "@/services/tanstack.query"
import { useAuthStore } from "@/stores/auth.store"
import { vendorAccessToken } from "@/services/auth"
import { signOut } from "@/lib/auth-client"
import { axiosApi } from "@/lib/axios"

export function NavUser() {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const { data: vendor, isLoading, isRefetching } = useCurrentUser()
  const [mounted, setMounted] = useState(false)
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (isLoading || isRefetching) return <Spinner />

  const businessName =
    vendor?.data?.businessDetails?.businessName ||
    vendor?.data?.approvedData?.businessName ||
    vendor?.data?.serviceDetails?.name ||
    vendor?.data?.hotelDetails?.name ||
    "Vendor";

  const businessEmail =
    vendor?.data?.businessDetails?.businessEmail ||
    vendor?.data?.approvedData?.vendorEmail ||
    vendor?.data?.vendor?.email ||
    "";

  const currentLogo =
    vendor?.data?.businessDetails?.logo ||
    vendor?.data?.vendor?.logo ||
    vendor?.data?.approvedData?.logo ||
    vendor?.data?.serviceDetails?.images?.[0]?.url ||
    vendor?.data?.hotelDetails?.images?.[0]?.url ||
    "";

  const avatarSrc =
    currentLogo ||
    `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(businessName)}`;

  const initials =
    (businessName.charAt(0) || "V").toUpperCase() +
    (businessName.charAt(1) || "").toUpperCase();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground left-0"
              >
                <div className="relative group cursor-pointer">
                  <Avatar className="h-8 w-8 rounded-full border border-border">
                    <AvatarImage src={avatarSrc} alt={businessName} className="object-cover" />
                    <AvatarFallback className="rounded-full text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{businessName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {businessEmail}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl shadow-xl"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 p-2 text-left text-sm">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLogoModalOpen(true);
                    }}
                    className="relative group cursor-pointer"
                    title="Click to change logo"
                  >
                    <Avatar className="h-10 w-10 rounded-xl border-2 border-primary/20 group-hover:border-primary transition-all">
                      <AvatarImage src={avatarSrc} alt={businessName} className="object-cover" />
                      <AvatarFallback className="rounded-xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-semibold">{businessName}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {businessEmail}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setIsLogoModalOpen(true)}
                  className="gap-2 cursor-pointer"
                >
                  <IconPhoto className="size-4 text-primary shrink-0" />
                  <span>Update Company Logo</span>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <IconNotification className="size-4 shrink-0" />
                  <span>Notifications</span>
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0 focus:bg-transparent">
                  <div className="flex w-full items-center gap-2 px-2 py-1.5">
                    <IconSwitch className="size-4 text-muted-foreground shrink-0" />
                    <SwitchAccountButton />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await signOut();
                  } catch (e) {}
                  localStorage.removeItem(vendorAccessToken);
                  localStorage.removeItem("status");
                  localStorage.removeItem("category");
                  queryClient.clear();
                  router.push("/login");
                }}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <IconLogout className="size-4 shrink-0" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <UpdateLogoModal
        open={isLogoModalOpen}
        onOpenChange={setIsLogoModalOpen}
        currentLogo={currentLogo}
        businessName={businessName}
      />
    </>
  )
}

export function UpdateLogoModal({
  open,
  onOpenChange,
  currentLogo,
  businessName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLogo?: string;
  businessName?: string;
}) {
  const { uploadFile } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setUploading(true);
    try {
      const uploadRes = await uploadFile(selectedFile);
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.message || "Failed to upload image");
      }

      const res = await axiosApi.patch("/vendors/logo", {
        logo: {
          url: uploadRes.url,
          public_id: uploadRes.public_id || "",
          resource_type: uploadRes.resource_type || "image",
        },
      });

      if (res.data?.success) {
        toast.success("Company logo updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["vendor-me"] });
        onOpenChange(false);
      } else {
        throw new Error(res.data?.message || "Failed to save logo");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update logo");
    } finally {
      setUploading(false);
    }
  };

  const activeDisplayImg =
    previewUrl ||
    currentLogo ||
    `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(businessName || "vendor")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card rounded-3xl border shadow-2xl p-6 sm:p-7">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Company Logo / Profile Image
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload or change your brand logo. This image will appear across your vendor portal and navigation bar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-muted shadow-xl bg-muted/30 flex items-center justify-center">
                <img
                  src={activeDisplayImg}
                  alt="Company Logo Preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <label
                htmlFor="avatar-file-input"
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-semibold gap-1 backdrop-blur-xs"
              >
                <Camera className="h-5 w-5" />
                <span>Change</span>
              </label>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">
              {selectedFile ? selectedFile.name : "Recommended: square PNG/JPG (at least 200x200px)"}
            </p>
          </div>

          {/* File input button */}
          <div className="relative">
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label
              htmlFor="avatar-file-input"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/50 border-border hover:border-primary/50 transition-all text-xs font-semibold"
            >
              <UploadCloud className="h-4 w-4 text-primary" />
              <span>{selectedFile ? "Choose Different Image" : "Select Image from Device"}</span>
            </label>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!selectedFile || uploading}
            className="rounded-xl gap-2 font-medium"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Image"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export function SwitchAccountButton() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = React.useState(false)
  const [activeId, setActiveId] = React.useState("hotel")
  const { data, isLoading, refetch } = useGetConnectedAccounts();
  const { switchAccount, switching } = useAuthStore()


  React.useEffect(() => {
    const savedCategory = localStorage.getItem("category")
    if (savedCategory) {
      setActiveId(savedCategory)
    }
  }, [])




  const handleSwitch = async (id: string, cat: string) => {
    const privid = activeId;
    setActiveId(id)
    setLoading(true);


    try {
      const res = await switchAccount(id, cat);

      if (res.success) {


        setTimeout(() => {
          setOpen(false)
          window.location.href = "/"
        }, 200)

      } else {
        setActiveId(privid);
      }


    } catch (error) {
      setActiveId(privid)
      toast.error("Something went wrong during Switching account")

    } finally {
      setLoading(false);
    }

  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={switching}
          className="w-full text-left text-sm font-normal text-foreground hover:text-foreground transition-colors"
        >
          {switching ? <Spinner /> : "Switch Account"}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-background border-border dark:border-zinc-800">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Switch Account
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select an account or property setup to toggle your active view.
          </DialogDescription>
          <DialogSignInDemo />
        </DialogHeader>

        <ScrollArea className="h-full max-h-[240px] px-6 pb-6 pr-5">
          <div className="space-y-2 pt-2">
            {
              isLoading && <Spinner />
            }
            {data?.data.map((account: {
              vendorId: string,
              businessName: string,
              serviceType?: string,
              status: string
            }

            ) => {
              const isActive = account.vendorId === activeId
              return (
                <button
                  disabled={loading}
                  key={account.vendorId}
                  onClick={() => handleSwitch(account.vendorId, account.serviceType || "hotel")}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border text-left",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent/60 border-primary/40 dark:bg-zinc-800/60 dark:border-zinc-700"
                      : "bg-transparent border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary dark:bg-zinc-800 dark:text-zinc-200">
                        {account.businessName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none text-foreground">
                        {account.businessName}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {account.status}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-primary dark:text-zinc-400 mt-0.5">
                        {account.serviceType || "hotel"}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground dark:bg-zinc-100 dark:text-zinc-900">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}




const DialogSignInDemo = () => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const { data: user } = useCurrentUser();
  const vendorId = user?.data?.vendor.vendorId;
  const { refetch } = useGetConnectedAccounts();

  const [formDataaa, setFormData] = useState({
    email: "",
    password: ""
  });

  const onchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formDataaa,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", formDataaa.email);
      formData.set("password", formDataaa.password);
      formData.set("vendorId", vendorId);
      try {
        const res = await VendorAccountsConnectAccount(formData);
        if (res?.error) {
          setError(res.error);
          toast.error(res.error);
        } else {
          setOpen(false);
          toast.success("Connected successfully!");
          setFormData({ email: "", password: "" });
          refetch();
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong. Please try again later.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Connect</Button>
      </DialogTrigger>

      <DialogContent className='to-card bg-gradient-to-b from-primary-100 to-40% [background-size:100%_101%] sm:max-w-sm dark:from-sky-900'>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className='items-center'>
            <div className='mb-4 flex size-12 items-center justify-center rounded-full bg-primary-600/10 sm:mx-0 dark:bg-sky-400/10'>
              <LogInIcon className='size-6 text-primary dark:text-primary-400' />
            </div>
            <DialogTitle>Switch Account</DialogTitle>
            <DialogDescription className='text-center'>
              Make a new doc to bring your words, data and teams together. For free.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4'>
            <div className='grid gap-3'>
              <Label htmlFor='email'>Email</Label>
              <Input
                type='email'
                id='email'
                name='email'
                value={formDataaa.email}
                placeholder='example@gmail.com'
                onChange={onchange}
                required
              />
            </div>
            <div className='grid gap-3'>
              <Label htmlFor='password'>Password</Label>
              <Input
                type='password'
                id='password'
                name='password'
                value={formDataaa.password}
                placeholder='Password'
                onChange={onchange}
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>

          <DialogFooter className='space-y-2 pt-4 sm:flex-col'>
            <Button
              type="submit"
              disabled={pending}
              className='w-full bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-600 dark:bg-sky-400 dark:text-slate-900 dark:hover:bg-sky-500 dark:focus-visible:ring-sky-400'
            >
              {pending ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSignInDemo




