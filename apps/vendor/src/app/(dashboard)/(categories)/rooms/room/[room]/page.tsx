import AddRoomForm from "../../new/page"
import { Verify } from "@/app/(auth)/authMiddleware"

const page = () => {
  return (
    <div className="min-h-screen bg-muted/30 ">
      <AddRoomForm  />
    </div>
  )
}

export default page