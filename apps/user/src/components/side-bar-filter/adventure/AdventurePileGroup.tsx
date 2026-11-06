'use client'
import PillGroup, { type PillOption } from '../pillGroup'
import PriceRange from '../priceRange'
import CheckboxGroup from '../checkBoxGroup'

export const AdventurePileGroupOfFeatures = ({ values }: { values: PillOption }) => {
  return (
    <PillGroup options={values} queryKey='features' />
  )
}

export const AdventurePileGroupOfAmenities = ({ values }: { values: PillOption }) => {
  return (
    <PillGroup options={values} queryKey='amenities' />
  )
}

export const AdventurePriceRange = () => {
  return (
    <PriceRange />
  )
}

export const AdventureCheckBoxGroupOfScore = ({ values, stars }: { values: { value: number, label: string }[], stars?: boolean }) => {
  return (
    <CheckboxGroup
      queryKey='score'
      stars={stars}
      options={values || []}
    />
  )
}
