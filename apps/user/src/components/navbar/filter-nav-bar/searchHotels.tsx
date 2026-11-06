import React from "react";
import roof from "@/assets/japanese-roof.jpg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
} from "@/components/ui/field";

type Props = {};

const SearchHotels = (props: Props) => {
  return <SearchPanel />;
};

export default SearchHotels;

export function SearchPanel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:px-8">
            <FieldGroup>
              <div className="flex flex-col ">
                <h1 className="text-2xl font-bold">Search Hotels</h1>
              </div>
              <Field className="border p-5 gap-6 py-6">
                <Field>
                  <SearchBar Icon={MapPin} placeholder="destinations" />
                </Field>
                <Field>
                  <div>
                    {/* <DialogeCalenderOverlay /> */}
                  </div>
                </Field>
                <Field className="flex justify-center xl:px-[100px]">
                  <Button type="submit">Search Hotels</Button>
                </Field>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            {/* <img
              src={roof}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8] dark:grayscale"
            /> */}
            <ImageCarousel />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import pillers from "@/assets/pillers.jpeg";
import Image, { StaticImageData } from "next/image";
const slides: { image: string | StaticImageData; title: string; subtitle: string; cta: string }[] = [
  {
    image: roof,
    title: "Explore our Seoul.",
    subtitle: "200+ hotels, 340 local flights and 234 bus providers",
    cta: "Explore",
  },
  {
    image:
      pillers,
    title: "Discover Japan.",
    subtitle: "Mount Fuji, Tokyo streets and ancient temples",
    cta: "Discover",
  },
  // {
  //   image:
  //     "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  //   title: "Visit Switzerland.",
  //   subtitle: "Alps, lakes and scenic train routes",
  //   cta: "Visit",
  // },
];

export function ImageCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <Image
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
              <h2 className="text-3xl md:text-4xl font-bold max-w-md">
                {slide.title}
              </h2>
              <p className="mt-3 max-w-md text-sm md:text-base text-white/90">
                {slide.subtitle}
              </p>

              <button className="mt-5 w-fit px-6 py-2 rounded-full border border-white hover:bg-white hover:text-black transition">
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition ${
              current === i ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
