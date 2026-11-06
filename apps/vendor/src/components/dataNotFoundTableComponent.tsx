import React from 'react'
import { TableCell, TableRow } from './ui/table'
import { Button } from './ui/button'



const DataNotFoundTableComponent = ({ columns, isLoading, table }: { columns: number, isLoading: boolean, table: any }) => {
    return (
        <TableRow>
            <TableCell colSpan={columns} className="h-80 text-center ">




                {
                    !isLoading && table.getRowModel().rows?.length === 0 && <>
                        <p className="text-muted-foreground">No reservations found.</p>
                        <Button
                            variant="link"
                            onClick={() => table.resetColumnFilters()}
                        >
                            Clear Filters
                        </Button></>
                }
            </TableCell>
        </TableRow>
    )
}

export default DataNotFoundTableComponent