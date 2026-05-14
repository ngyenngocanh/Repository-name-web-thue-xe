const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      data: Buffer,
      contentType: String,
      filename: String,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    idCard: {
      number: String,
      frontImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      backImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
    },
    drivingLicense: {
      number: String,
      type: { type: String }, // Using explicit { type: ... } because 'type' is a reserved keyword in Mongoose
      frontImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      backImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      expiryDate: Date,
    },
    role: {
      type: String,
      enum: ["user", "owner", "driver", "admin", "collaborator"], // 'collaborator' = CTV
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    totalTrips: {
      asRenter: {
        type: Number,
        default: 0,
      },
      asOwner: {
        type: Number,
        default: 0,
      },
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    bankAccount: {
      bankName: String,
      accountNumber: String,
      accountName: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    preferences: {
      language: {
        type: String,
        default: "vi",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    collaboratorRequest: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      note: { type: String, default: "" },
      requestedAt: { type: Date, default: Date.now },
      reviewedAt: Date,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
      idCardFrontImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      idCardBackImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      licenseImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      additionalDocs: [
        {
          data: Buffer,
          contentType: String,
          filename: String,
        },
      ],
      carSubmissions: [
        {
          make: String,
          model: String,
          year: String,
          licensePlate: String,
          photos: [
            {
              data: Buffer,
              contentType: String,
              filename: String,
            },
          ],
          registration: {
            data: Buffer,
            contentType: String,
            filename: String,
          },
          insurance: {
            data: Buffer,
            contentType: String,
            filename: String,
          },
        },
      ],
    },
    // E-Contract Document
    contract: {
      isAgreed: { type: Boolean, default: false },
      agreedAt: { type: Date },
      contractType: { type: String, enum: ["driver", "collaborator", "none"], default: "none" },
      signatureName: { type: String, trim: true }
    },
    // Driver specific information
    driverSchedules: [
      {
        type: {
          type: String,
          enum: ["parttime", "fulltime"],
          required: true,
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        shifts: [
          {
            dayOfWeek: {
              type: String,
              enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            },
            startTime: String, // HH:mm
            endTime: String, // HH:mm
          },
        ],
        isOnline: { type: Boolean, default: false },
      },
    ],
    driverInfo: {
      driverLicense: String,
      licenseExpiry: Date,
      experience: String,
      vehicleType: String,
      idCard: String,
      idCardFrontImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      idCardBackImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      licenseImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      isStandaloneDriver: {
        type: Boolean,
        default: false,
      },
      driverRatePerDay: {
        type: Number,
        default: 0,
      },
      driverRatePerHour: {
        type: Number,
        default: 0,
      },
      pricePerKm: {
        type: Number,
        default: 0,
      },
      driverStatus: {
        type: String,
        enum: ["available", "busy", "resting"],
        default: "available",
      },
      operatingCity: {
        type: String,
        default: "TP. Hồ Chí Minh",
      },
      driverExperienceDescription: {
        type: String,
        maxlength: 1000,
      },
      homeAddress: {
        type: String,
        default: "",
      },
    },
    // Owner specific information
    ownerInfo: {
      companyName: String,
      businessLicense: String,
      bankAccount: String,
      bankName: String,
      idCard: String,
      idCardFrontImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
      idCardBackImage: {
        data: Buffer,
        contentType: String,
        filename: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    avatar: this.avatar,
    rating: this.rating,
    totalTrips: this.totalTrips,
    isVerified: this.isVerified,
  };
};

module.exports = mongoose.model("User", userSchema);
