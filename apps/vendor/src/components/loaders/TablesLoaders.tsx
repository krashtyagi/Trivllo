import React from 'react'
import { ReservationsRowSkeleton } from './tableSkeletons'
import { TableCell, TableRow } from '../ui/table'


const TablesLoaders = ({ loading, children, rows, columns }: { loading: boolean, children: React.ReactNode, rows: number, columns: number }) => {
    if (loading) {
        return (
            <TableRow>
                <TableCell colSpan={columns} className="h-80 text-center ">
                    <div className="w-full h-full flex flex-col  gap-2">
                        {Array.from({ length: rows || 10 }).map((_, i) => (
                            <ReservationsRowSkeleton key={i} />
                        ))}
                    </div></TableCell>
            </TableRow>
        )
    }
    return (
        children
    )
}

export default TablesLoaders