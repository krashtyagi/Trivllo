import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function WarningDialog({
    open,
    onOpenChange,
    loading,
    title,
    description,
    func,
    trigger,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    title: string;
    description: string;
    func: () => void;
    trigger: React.ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={() => {
                            func();
                        }}
                        className={title.toLowerCase().includes('reject') ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                        {loading ? "Processing..." : title}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}