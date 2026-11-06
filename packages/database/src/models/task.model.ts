import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITask extends Document {
  vendorId: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    dueDate: {
      type: Date,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ vendorId: 1, status: 1 });

const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);

export default Task;
export { Task };

