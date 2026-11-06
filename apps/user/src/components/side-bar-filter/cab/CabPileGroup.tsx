'use client'
import PillGroup, { type PillOption } from '../pillGroup'
import PriceRange from '../priceRange'
import CheckboxGroup from '../checkBoxGroup'

export const CabPileGroupOfFeatures = ({ values }: { values: PillOption }) => {
  return (
    <PillGroup options={values} queryKey='features' />
  )
}

export const CabPileGroupOfAmenities = ({ values }: { values: PillOption }) => {
  return (
    <PillGroup options={values} queryKey='amenities' />
  )
}

export const CabPriceRange = () => {
  return (
    <PriceRange />
  )
}

export const CabCheckBoxGroupOfScore = ({ values, stars }: { values: { value: number, label: string }[], stars?: boolean }) => {
  return (
    <CheckboxGroup
      queryKey='score'
      stars={stars}
      options={values || []}
    />
  )
}
