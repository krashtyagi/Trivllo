import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4 p-2 md:gap-6 md:p-2 rounded-xl">
            {children}
        </div>
    )
}

export default layout