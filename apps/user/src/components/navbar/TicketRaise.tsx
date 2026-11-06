// "use client";

// import React from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Send, Paperclip, LifeBuoy, Tag, MessageSquare } from "lucide-react";
// // import { ticketSchema, type TicketFormValues } from "./schema"; // Adjust path

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import * as z from "zod";

// export const ticketSchema = z.object({
//   subject: z.string().min(5, "Subject must be at least 5 characters"),
//   category: z.string({ message: "Please select a category" }),
//   urgency: z.string({ message: "Please select urgency level" }),
//   description: z.string().min(20, "Please provide more detail (min 20 chars)"),
// });

// export type TicketFormValues = z.infer<typeof ticketSchema>;
// export default function RaiseTicketForm() {
//   const form = useForm<TicketFormValues>({
//     resolver: zodResolver(ticketSchema),
//     defaultValues: {
//       subject: "",
//       description: "",
//     },
//   });

//   function onSubmit(values: TicketFormValues) {
//     console.log(values);
//     // Add your API logic here
//   }

//   return (
//     <div className="w-full   ">
//       <div className="space-y-1 pb-4 border-b border-border/50">
//         <div className="flex items-center gap-2 mb-1">
//           <div className="p-1.5 bg-primary/10 rounded-lg">
//             <LifeBuoy className="h-4 w-4 text-primary" />
//           </div>
//           <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tight">Support Ticket</Badge>
//         </div>
//         <h2 className="text-xl font-black tracking-tight text-foreground">How can we help?</h2>
//         <p className="text-xs text-muted-foreground">Describe your issue and we'll respond within 24 hours.</p>
//       </div>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          
//           {/* Subject */}
//           <FormField
//             control={form.control}
//             name="subject"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Subject</FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <Input {...field} placeholder="Summary of issue..." className="pl-8 h-10 bg-background" />
//                     <Tag className="absolute left-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
//                   </div>
//                 </FormControl>
//                 <FormMessage className="text-[10px]" />
//               </FormItem>
//             )}
//           />

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {/* Category */}
//             <FormField
//               control={form.control}
//               name="category"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Category</FormLabel>
//                   <Select onValueChange={field.onChange} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger className="h-10 bg-background">
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="booking">Booking Issue</SelectItem>
//                       <SelectItem value="payment">Payment & Refund</SelectItem>
//                       <SelectItem value="technical">Technical Glitch</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage className="text-[10px]" />
//                 </FormItem>
//               )}
//             />

//             {/* Urgency */}
//             <FormField
//               control={form.control}
//               name="urgency"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Urgency</FormLabel>
//                   <Select onValueChange={field.onChange} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger className="h-10 bg-background">
//                         <SelectValue placeholder="Priority" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="low">Low</SelectItem>
//                       <SelectItem value="medium">Medium</SelectItem>
//                       <SelectItem value="high">Urgent</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage className="text-[10px]" />
//                 </FormItem>
//               )}
//             />
//           </div>

//           {/* Description */}
//           <FormField
//             control={form.control}
//             name="description"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel className="text-[10px] font-black uppercase text-muted-foreground">Message</FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <Textarea 
//                       {...field} 
//                       placeholder="Include booking references..." 
//                       className="min-h-[100px] pl-8 pt-2 bg-background resize-none" 
//                     />
//                     <MessageSquare className="absolute left-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
//                   </div>
//                 </FormControl>
//                 <FormMessage className="text-[10px]" />
//               </FormItem>
//             )}
//           />

//           {/* Upload Placeholder */}
//           <div className="border border-dashed border-border rounded-lg p-3 flex flex-col items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
//             <Paperclip className="h-4 w-4 text-muted-foreground mb-1" />
//             <p className="text-[9px] font-bold text-muted-foreground uppercase">Attach Screenshots (Optional)</p>
//           </div>

//           <div className="flex gap-2 pt-2 ">
//             <Button type="submit" className="flex-1 h-10 bg-primary font-bold text-xs uppercase tracking-wider">
//               Submit Ticket <Send className="ml-2 h-3 w-3" />
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }