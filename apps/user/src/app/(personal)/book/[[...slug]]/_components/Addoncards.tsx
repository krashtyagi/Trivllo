import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaymentProps } from "@/schema/payment.schema";
import { Info, Plus, Users } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { PhoneInput } from "./phoneinput";

export function AddOnsCard() {
    return (
        <Card className="shadow-sm border-dashed">
            <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex gap-3">
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                            <Info className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Travel Insurance</p>
                            <p className="text-xs text-muted-foreground italic">Add protection for your trip for ₹1,000</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full px-4" onClick={(e) => {
                        e.preventDefault()
                    }}><Plus className="h-3 w-3 mr-1" /> Add</Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function SpecialRequestCard({ methods }: { methods: UseFormReturn<PaymentProps> }) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Any Special Requests?</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Early check-in, dietary requirements, etc. (Optional)"
                    className="min-h-[100px] bg-muted/20"
                    {...methods.register("specialRequest")}
                />
            </CardContent>
        </Card>
    );
}


export function TripSummaryCard({ methods }: { methods: UseFormReturn<PaymentProps> }) {
    const checkin = methods.getValues("dates.checkin");
    const checkout = methods.getValues("dates.checkout");
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-xl">Your Trip Summary</CardTitle>
                    <p className="text-sm text-muted-foreground">Confirm your dates and guests</p>
                </div>
                {/* <DialougeEditDates methods={methods} trigger="Edit Trip" content={null} /> */}
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Check-in / Out</p>
                    <p className="text-sm font-medium">
                        {checkin ? format(new Date(checkin), "MMM dd") : "—"} - {checkout ? format(new Date(checkout), "MMM dd") : "—"}
                    </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Guests</p>
                    <p className="text-sm font-medium">
                        {methods.watch("guests.adults")} Adults, {methods.watch("guests.children")} Children
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export function GuestInfoCard({ methods }: { methods: UseFormReturn<PaymentProps> }) {
    const { control } = methods;
    const { fields } = useFieldArray({ control, name: "guestInformation" });

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Guest Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((field, index) => (
                    <div className="space-y-4 p-5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50" key={field.id}>
                        <p className="font-bold text-sm flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                                {index + 1}
                            </span>
                            {index === 0 ? "Primary Guest (Booking Holder)" : `Guest ${index + 1}`}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name={`guestInformation.${index}.firstname`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl><Input placeholder="John" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name={`guestInformation.${index}.lastname`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {index === 0 && (
                                <>
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl><Input type="email" placeholder="john@example.com" {...methods.register(`guestInformation.${index}.email`)} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <PhoneInput defaultCountry="IN" value={methods.watch(`guestInformation.${index}.phone`)} onChange={(val) => methods.setValue(`guestInformation.${index}.phone`, val)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}