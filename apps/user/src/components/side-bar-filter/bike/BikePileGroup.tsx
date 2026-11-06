'use client'
import PillGroup, { type PillOption } from '../pillGroup'
import PriceRange from '../priceRange'
import CheckboxGroup from '../checkBoxGroup'

export const BikePileGroupOfFeatures = ({ values }: { values: PillOption }) => {
  return (
    <PillGroup options={values} queryKey='features' />
  )
}

export const BikePileGroupOfAmenities = ({ values }: { values: PillOption }) => {
  return (
    <PillGroup options={values} queryKey='amenities' />
  )
}

export const BikePriceRange = () => {
  return (
    <PriceRange />
  )
}

export const BikeCheckBoxGroupOfScore = ({ values, stars }: { values: { value: number, label: string }[], stars?: boolean }) => {
  return (
    <CheckboxGroup
      queryKey='score'
      stars={stars}
      options={values || []}
    />
  )
}
