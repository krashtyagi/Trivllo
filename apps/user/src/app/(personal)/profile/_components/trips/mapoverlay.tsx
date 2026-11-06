"use client";
import React, { Suspense } from "react";

import Image from "next/image";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import MapLeaf from "@/components/map/leaf-map";

export const AnimatedModalDemo = ({
  cordinates,
}: {
  cordinates: [number, number];
}) => {
  return (
    <div className="  flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black h-40 w-60 p-0 dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <div className="relative w-full h-full rounded-md overflow-hidden group">
            {/* The Map Image with Blur */}
            <Image
              src="/map-icons/map.png"
              alt="Hotel Arts Barcelona"
              fill
              className="object-cover blur-[2px] brightness-75 transition-all duration-300 group-hover:blur-sm group-hover:scale-110"
            />

            {/* The Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
              <span className="text-white text-sm font-bold uppercase tracking-wider px-4 py-2 border border-white/50 rounded-lg backdrop-blur-md shadow-2xl">
                See Location on Map
              </span>
            </div>
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent className="overflow-hidden p-0 ">
            {/* Add overflow-hidden and remove padding to let the map take full space */}
            <div
              onWheel={(e) => e.stopPropagation()}
              className="h-[400px] w-full"
            >
              <Suspense fallback={<div>Loading...</div>}>
                <MapLeaf cordinates={cordinates} className="-z-20" />
              </Suspense>
            </div>
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
};
