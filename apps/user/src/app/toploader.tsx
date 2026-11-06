'use client'
import NextTopLoader from 'nextjs-toploader'
import React from 'react'

type Props = {}

const TopLoader = (props: Props) => {
    return (
        <NextTopLoader
            color="#067529ff"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={500}
            shadow="0 0 10px #21d469ff,0 0 5px #31ba58ff"
        />
    )
}

export default TopLoader