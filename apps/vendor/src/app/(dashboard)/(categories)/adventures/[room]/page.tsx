
import { Verify } from "@/app/(auth)/authMiddleware"
import AddRoomForm from "../../rooms/new/page"

const page = () => {
  return (
    <div className="min-h-screen bg-muted/30 ">
      <AddRoomForm />
    </div>
  )
}

export default page