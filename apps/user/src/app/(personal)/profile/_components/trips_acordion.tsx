'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icon } from "@tabler/icons-react";



export default function TripsAccordion({ content, Icon }: { content: React.ReactNode, Icon?: Icon }) {
  return (
    <Accordion className="w-full" collapsible type="single">
      <AccordionItem value={"bookings"}>
        <AccordionTrigger className="flex text-text text-sm px-3 py-1.5 justify-start items-center">
          {/* {Icon && <Icon className="h-5 w-5 bg-transparent" />} */}
          <p className="text-foreground">Bookings</p>
        </AccordionTrigger>
        <AccordionContent className="w-full flex flex-col justify-start px-0 ">{content}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}