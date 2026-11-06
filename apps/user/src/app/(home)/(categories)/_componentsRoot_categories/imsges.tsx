"use client";

import Gallery from "@/app/(home)/(categories)/_componentsRoot_categories/gallery";
import { HotelImage } from "@/types";
import React, { Suspense } from "react";


export function LayoutGridDemo({ images: imagelist, v = "default" }: { images?: (HotelImage | any)[], v?: "base4" | "default" }) {
  if (!imagelist || imagelist.length === 0) {
    return (
      <div className="w-full py-8 text-center text-muted-foreground">
        No tour images available
      </div>
    );
  }

  const imageUrls = imagelist
    ?.map((img) => (typeof img === "string" ? img : (img as any)?.url))
    ?.filter(Boolean);

  const featuredImage = imageUrls[0];

  const gridImages = imageUrls
    .slice(1, 5)
    .map((src, idx) => ({
      src,
      alt: `Hotel view ${idx + 2}`,
    }));

  while (gridImages.length < 4) {
    gridImages.push({
      src: featuredImage,
      alt: "Featured hotel view (repeated)",
    });
  }

  const remainingImages = imageUrls.slice(5);
  const additionalSections = [];
  for (let i = 0; i < remainingImages.length; i += 4) {
    const chunk = remainingImages.slice(i, i + 4);
    additionalSections.push({
      type: "grid",
      images: chunk.map((src, idx) => ({
        src,
        alt: `Hotel view ${idx + 6 + i}`,
      })),
    });
  }

  const gallerySections = [
    {
      images: [
        {
          src: featuredImage,
          alt: "Featured hotel view",
        },
      ],
    },
    {
      type: "grid",
      images: gridImages,
    },
    ...additionalSections
  ];

  return (
    <div className="py-2 w-full ">

      <Gallery sections={gallerySections} variant={v === "default" ? "default" : "base4"} />

    </div>
  );
}