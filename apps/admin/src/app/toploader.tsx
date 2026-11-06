'use client'
import NextTopLoader from 'nextjs-toploader'

type Props = {}

const TopLoader = (props: Props) => {
    return (
        <NextTopLoader
            color="var(--primary)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={500}
            shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
        />
    )
}

export default TopLoader