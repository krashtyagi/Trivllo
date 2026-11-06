'use client'
import React from 'react'
import { Input } from './ui/input'
import { type LucideIcon } from 'lucide-react'

type searchbarProps = {
  Icon: LucideIcon
  placeholder?: string
}

const SearchBar = ({Icon, placeholder}: searchbarProps) => {
  return (
    <div className="relative sm:w-full lg:w-1/2">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder={placeholder} className="pl-10" />
        </div>
  )
}

export default SearchBar
