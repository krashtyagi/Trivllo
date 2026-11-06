import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import ChangelogContent from '@/components/ui/itenary_timeline'
import { ItineraryDay } from '../tours/services/[serviceid]/_components/HotelItems'



const ChangelogComponentPage = ({ releses = [] }: { releses?: ItineraryDay[] }) => {
    return (
        <ChangelogContent releases={releses} />
    )
}

export default ChangelogComponentPage




