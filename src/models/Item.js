import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    machineName: {
      type: String,
      required: [true, "Machine Name is required"],
      trim: true,
    },

    sapCode: {
      type: String,
      trim: true,
    },
    materialDescription: {
      type: String,
      trim: true,
    },

    storeLocation: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "An item can have at most 10 images.",
      },
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance

ItemSchema.index({ machineName: 1 });

ItemSchema.index({ sapCode: 1 });
ItemSchema.index({ createdAt: -1 });

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
