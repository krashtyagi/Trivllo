import { ChevronDown, Mail, X } from "lucide-react";
import { Button } from "../ui/button";
import { LofinFormFields, Sign_in_hover } from "../auth/_components/sign-in-hover";
import { useIsMobile } from "@/hooks/use-mobile";
import { RouterPush } from "../RouterPush";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const PopLogin = ({
    setHasDismissed,
    setShowAdPopup
}: {
    setHasDismissed: React.Dispatch<React.SetStateAction<boolean>>,
    setShowAdPopup: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const isMobile = useIsMobile();
    const router = useRouter();

    const handleClose = () => {
        setHasDismissed(true);
        setShowAdPopup(false);
    };

    return (
        <div
            className="fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm z-[70] p-4 md:p-6"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-[400px] md:max-w-[850px] max-h-[90vh] md:max-h-none bg-background rounded-2xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 md:top-4 md:right-4 z-[80] p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all"
                >
                    <X className="w-5 h-5 text-foreground md:text-white md:dark:text-foreground" />
                </button>

                <div className="hidden md:block md:w-1/2 relative bg-blue-50">
                    <img
                        src="/story/key.png"
                        alt="The Great Summer Escape Sale"

                        className="w-full h-full object-cover object-top min-h-[300px]"
                    />

                    <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-md p-5 rounded-xl shadow-xl border border-border/50">
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">Save on Summer Trips:</p>
                        <p className="text-sm md:text-lg font-extrabold leading-tight mt-1">
                            Up to 40% OFF* on Stays, Flights, Buses & More.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto custom-scrollbar">
                    <div className="md:hidden w-full h-32 mb-6 rounded-xl overflow-hidden relative">
                        <img src="/story/key.png" className="w-full h-full object-cover object-top" alt="promo" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                            <span className="text-white text-xs font-bold">Summer Escape Sale Live!</span>
                        </div>
                    </div>

                    <div className="w-full space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome Back</h2>
                            <p className="text-xs text-muted-foreground">Login to access your bookings and offers.</p>
                        </div>

                        <div className="space-y-4">
                            {isMobile ? (

                                <Link href={"/login"}>

                                    <Button size="sm" className="w-full h-8 mt-1 text-xs">

                                        Log In Now

                                    </Button>

                                </Link>

                            ) : (

                                <LofinFormFields handelClose={() => {
                                    setHasDismissed(true);
                                    setShowAdPopup(false);
                                }} />
                            )}

                        </div>

                        <div className="flex items-center justify-center gap-2 text-center text-sm">
                            <span className="text-muted-foreground">Don&apos;t have an account?</span>
                            <span
                                onClick={() => RouterPush(router, '/login')}
                                className="text-primary font-bold cursor-pointer hover:underline"
                            >
                                Sign up
                            </span>
                        </div>

                        {/* <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="flex-shrink mx-4 text-muted-foreground text-[10px] font-medium uppercase tracking-tighter">
                                Or Login With
                            </span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border hover:bg-accent transition-all">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            </Button>
                            <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-border hover:bg-accent transition-all">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div> */}
                    </div>

                    <p className="mt-8 md:mt-12 text-[10px] text-muted-foreground text-center leading-relaxed">
                        By proceeding, you agree to our
                        <a href="/privacy-policy" className="text-primary font-semibold mx-1">Privacy Policy</a>,
                        <a href="/terms-of-services" className="text-primary font-semibold mx-1">User Agreement</a> and
                        <a href="/terms-of-services" className="text-primary font-semibold mx-1">T&Cs</a>
                    </p>
                </div>
            </div>
        </div>
    );
};