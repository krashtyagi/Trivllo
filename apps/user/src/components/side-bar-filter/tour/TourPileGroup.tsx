'use client'
import PillGroup, { type PillOption } from '../pillGroup'
import PriceRange from '../priceRange'
import CheckboxGroup from '../checkBoxGroup'

export const TourPileGroupOfFeatures = ({ values }: { values: PillOption }) => {
  return (
    <PillGroup options={values} queryKey='features' />
  )
}

export const TourPileGroupOfAmenities = ({ values }: { values: PillOption }) => {
  return (
    <PillGroup options={values} queryKey='amenities' />
  )
}

export const TourPriceRange = () => {
  return (
    <PriceRange />
  )
}

export const TourCheckBoxGroupOfScore = ({ values, stars }: { values: { value: number, label: string }[], stars?: boolean }) => {
  return (
    <CheckboxGroup
      queryKey='score'
      stars={stars}
      options={values || []}
    />
  )
}
