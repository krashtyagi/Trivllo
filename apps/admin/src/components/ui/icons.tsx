import {
  Wifi, Utensils, Wind, Ban, Waves, Dumbbell, Sparkles, Car, Shirt, Bell,
  ConciergeBell, Briefcase, Bus, Baby, Umbrella, Tv, Coffee, Lock,
  Refrigerator, DoorOpen, ArrowUpDown, Accessibility, Martini, Plane,
  Speaker, Bath, Map, Users, CreditCard, Building, Activity, Trees,
  CloudSun, Laptop, Luggage, Clock, Thermometer, Snowflake, VolumeX,
  Key, Armchair, ShowerHead, CigaretteOff,
  MapPin
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const FoodAndDrinks: Record<string, LucideIcon> = {
  breakfast: Utensils,
  restaurant: Utensils,
  bar: Martini,
  coffee: Coffee,
  room_service: Bell,
  minibar: Refrigerator,
  kitchen: Utensils,
  kitchenette: Utensils,
};

export const ConnectivityAndBusiness: Record<string, LucideIcon> = {
  wifi: Wifi,
  business_center: Briefcase,
  meeting_rooms: Users,
  workspace: Laptop,
  desk: Laptop,
  parking: Car,
  restaurant: Utensils,
  swimming_pool: Waves,
  room_service: Bell,
};

export const ComfortAndClimate: Record<string, LucideIcon> = {
  ac: Wind,
  air_conditioning: Snowflake,
  heating: Thermometer,
  soundproof_rooms: VolumeX,
  fan: Wind,
};

export const RulesAndAccess: Record<string, LucideIcon> = {
  no_smoking: Ban,
  non_smoking_rooms: CigaretteOff,
  pets_allowed: Activity,
  wheelchair_accessible: Accessibility,
  elevator: ArrowUpDown,
  lift: ArrowUpDown,
  private_entrance: Key,
  "24_hour_front_desk": Clock,
  luggage_storage: Luggage,
};

export const Facilities: Record<string, LucideIcon> = {
  pool: Waves,
  swimming_pool: Waves,
  gym: Dumbbell,
  fitness_center: Dumbbell,
  spa: Sparkles,
  wellness_center: Sparkles,
  parking: Car,
  free_parking: Car,
  laundry: Shirt,
  daily_housekeeping: Sparkles,
  dry_cleaning: Shirt,
  concierge: ConciergeBell,
};

export const RoomFeatures: Record<string, LucideIcon> = {
  tv: Tv,
  flat_screen_tv: Tv,
  safe: Lock,
  safety_deposit_box: Lock,
  balcony: DoorOpen,
  terrace: CloudSun,
  sea_view: Waves,
  garden_view: Trees,
  city_view: Building,
  mountain_view: Trees,
  private_bathroom: Bath,
  shower: ShowerHead,
  bath: Bath,
  sofa: Armchair,
  seating_area: Armchair,
  wardrobe_or_closet: Shirt,
};
export const Locations: Record<string, LucideIcon> = {
  private_beach_area: Waves,
  waterfront: MapPin,
  balcony: DoorOpen,
};
export const onsite: Record<string, LucideIcon> = {
  private_beach_area: Waves,
  waterfront: MapPin,
  balcony: DoorOpen,
};

export const Transport: Record<string, LucideIcon> = {
  shuttle: Bus,
  airport_shuttle: Plane,
};

export const Family: Record<string, LucideIcon> = {
  family_rooms: Baby,
  kids_club: Activity,
};

export const amenityIconMap: Record<string, LucideIcon> = {
  ...FoodAndDrinks,
  ...ConnectivityAndBusiness,
  ...ComfortAndClimate,
  ...RulesAndAccess,
  ...Facilities,
  ...RoomFeatures,
  ...Transport,
  ...Family,
  ...Locations
};