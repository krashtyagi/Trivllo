// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import React, { useEffect, useRef } from 'react'
// import { MoreHorizontal } from "lucide-react"
// import { Button } from "@/components/ui/button"
// // @ts-ignore
// import jsVectorMap from 'jsvectormap'
// import 'jsvectormap/dist/maps/world'
// import 'jsvectormap/dist/jsvectormap.min.css'

// const countryData = [
//   { id: "US", name: "United States of America", percentage: "23%", color: "#CFE29D" },
//   { id: "CN", name: "China", percentage: "20%", color: "#8B5CF6" },
//   { id: "GB", name: "United Kingdom", percentage: "18%", color: "#F5FCD2" },
//   { id: "NL", name: "Netherlands", percentage: "13%", color: "#C2D9C8" },
//   { id: "AU", name: "Australia", percentage: "11%", color: "#D1FAE5" },
//   { id: "SA", name: "Saudi Arabia", percentage: "9%", color: "#E2FBEF" },
//   { id: "AE", name: "Uni Emirates Arab", percentage: "8%", color: "#A3A3A3" },
//   { id: "ID", name: "Indonesia", percentage: "4%", color: "#D4D4D4" },
// ]

// export function ReviewsMap() {
//   return (
//     <Card className="rounded-2xl shadow-sm w-full overflow-hidden flex flex-col">
//       <CardHeader className="flex flex-row items-center justify-between shrink-0">
//         <CardTitle className="text-lg font-bold">Reviews by Country</CardTitle>
//         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
//           <MoreHorizontal className="h-4 w-4" />
//         </Button>
//       </CardHeader>
      
//       {/* ADDED: flex flex-1 to make this area fill the card */}
//       <CardContent className="p-0 border-t flex flex-1">
//         <div className="flex flex-col lg:flex-row w-full min-h-[450px]">
          
//           {/* LEFT SECTION: flex flex-col to allow map to fill vertical space */}
//           <div className="flex-[2] p-4 border-r flex flex-col">
//             <WorldMap />
//           </div>

//           {/* RIGHT SECTION */}
//           <div className="flex-1 p-6 space-y-6 bg-slate-50/30">
//             <div className="space-y-1">
//               <p className="text-xs font-medium text-muted-foreground">Total Customers</p>
//               <p className="text-3xl font-bold tracking-tight">17,850</p>
//             </div>
            
//             <div className="space-y-4 border-t pt-4">
//               {countryData.map((country) => (
//                 <div key={country.id} className="flex items-center justify-between group">
//                   <div className="flex items-center gap-3">
//                     <div 
//                       className="h-4 w-4 rounded-md shadow-sm border border-black/5" 
//                       style={{ backgroundColor: country.color }}
//                     />
//                     <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
//                       {country.name}
//                     </span>
//                   </div>
//                   <span className="text-[13px] font-bold text-foreground">{country.percentage}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// const WorldMap = () => {
//   const mapRef = useRef<HTMLDivElement>(null)
//   const mapInstance = useRef<any>(null)

//   useEffect(() => {
//     if (mapRef.current && !mapInstance.current) {
//       const mapValues = countryData.reduce((acc: any, curr) => {
//         acc[curr.id] = parseInt(curr.percentage);
//         return acc;
//       }, {});

//       mapInstance.current = new jsVectorMap({
//         selector: mapRef.current,
//         map: 'world',
//         draggable: true,
//         zoomButtons: false,
//         bindTouchEvents: true,
//         regionStyle: {
//           initial: { fill: '#D1D5DB', fillOpacity: 1, stroke: 'none' },
//         },
//         series: {
//           regions: [{
//             values: mapValues,
//             attribute: 'fill',
//             scale: {
//               "US": "#CFE29D", "CN": "#8B5CF6", "GB": "#F5FCD2",
//               "NL": "#C2D9C8", "AU": "#D1FAE5", "SA": "#8B5CF6",
//               "AE": "#A3A3A3", "ID": "#D4D4D4"
//             }
//           }]
//         },
//         backgroundColor: 'transparent',
//       })

//       // Ensure it resizes when the window or container changes
//       // window.addEventListener('resize', () => mapInstance.current?.updateSize());
      
//       // Initial forced update
//       setTimeout(() => mapInstance.current?.updateSize(), 50);
//     }

//     return () => {
//       if (mapInstance.current) {
//         mapInstance.current.destroy()
//         mapInstance.current = null
//       }
//     }
//   }, [])

//   return (
//     // h-full here now works because parent has flex flex-col
//     <div className="w-full bg-card group">
//       <div 
//         ref={mapRef} 
//         style={{ height: '350px', width: '100%' }} // height is mandatory for jsVectorMap
//         className="w-full"
//       />
      
//       {/* Optional: Simple Custom Legend to match your image style */}
//       <div className="flex gap-4 p-4 border-t text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
//         <div className="flex items-center gap-1.5">
//           <span className="h-2 w-2 rounded-full bg-[#8B5CF6]" /> High Reviews
//         </div>
//         <div className="flex items-center gap-1.5">
//           <span className="h-2 w-2 rounded-full bg-[#D1FAE5]" /> Medium Reviews
//         </div>
//       </div>

//       <style jsx global>{`
//         /* Remove the annoying attribution label if you want a cleaner dashboard */
//         .jvm-container .jvm-zoom-btn {
//           background: var(--muted);
//           color: var(--foreground);
//           border-radius: 4px;
//         }
//         .jvm-tooltip {
//           background: var(--primary);
//           font-family: inherit;
//           font-size: 12px;
//           border-radius: 6px;
//           padding: 4px 8px;
//         }
//       `}</style>
//     </div>
//   )
// }