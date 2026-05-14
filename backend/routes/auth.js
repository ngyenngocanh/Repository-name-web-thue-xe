const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require("multer");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Address = require("../models/Address");
const auth = require("../middleware/auth");
const userRepo = require("../repositories/userRepo");
const addressRepo = require("../repositories/addressRepo");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh"), false);
    }
  },
});

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const getFrontendBaseUrl = (req) => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/+$/, "");
  }
  return `${req.protocol}://${req.get("host")}`;
};

const redirectSocialSuccess = (req, res, user) => {
  const id = user._id || user.id;
  const token = generateToken(id, user.role);
  const redirectUrl = `${getFrontendBaseUrl(req)}/auth/social/callback?token=${encodeURIComponent(token)}`;
  res.redirect(redirectUrl);
};

const redirectSocialError = (req, res, message) => {
  const redirectUrl = `${getFrontendBaseUrl(req)}/login?socialError=${encodeURIComponent(message)}`;
  res.redirect(redirectUrl);
};

const getOrCreateSocialUser = async ({ email, fullName, fallbackEmail }) => {
  const normalizedEmail = (email || fallbackEmail || "").toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Không lấy được email từ tài khoản mạng xã hội");
  }

  const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
  if (dbProvider === 'mssql') {
    const existing = await userRepo.getUserByEmail(normalizedEmail);
    if (existing) return existing;
  } else {
    let user = await User.findOne({ email: normalizedEmail });
    if (user) return user;
  }

  const randomPassword = crypto.randomBytes(24).toString("hex");
  if (dbProvider === 'mssql') {
    const id = crypto.randomBytes(12).toString('hex'); // 24-char string like ObjectId
    const user = await userRepo.createUser({
      id,
      fullName: fullName || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: randomPassword,
      phone: "0000000000",
      dateOfBirth: new Date("1990-01-01"),
      role: "user",
      isActive: true,
      isVerified: true,
      preferences: {
        language: "vi",
        notifications: { email: true, sms: false, push: true },
      },
    });
    return user;
  }

  const user = new User({
    fullName: fullName || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    password: randomPassword,
    phone: "0000000000",
    dateOfBirth: new Date("1990-01-01"),
    role: "user",
    isActive: true,
    isVerified: true,
    lastLogin: new Date(),
    preferences: {
      language: "vi",
      notifications: { email: true, sms: false, push: true },
    },
  });

  await user.save();
  return user;
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          const fullName = profile?.displayName;
          const user = await getOrCreateSocialUser({ email, fullName });
          
          const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
          if (dbProvider === 'mssql') {
            await userRepo.updateLastLogin(user.id, new Date());
            user.lastLogin = new Date(); // Update local object for done()
          } else {
            user.lastLogin = new Date();
            await user.save();
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || "/api/auth/facebook/callback",
        profileFields: ["id", "emails", "name", "displayName"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value;
          const fallbackEmail = profile?.id ? `facebook_${profile.id}@facebook.local` : "";
          const fullName = profile?.displayName || `${profile?.name?.familyName || ""} ${profile?.name?.givenName || ""}`.trim();
          const user = await getOrCreateSocialUser({ email, fullName, fallbackEmail });
          
          const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
          if (dbProvider === 'mssql') {
            await userRepo.updateLastLogin(user.id, new Date());
            user.lastLogin = new Date(); // Update local object
          } else {
            user.lastLogin = new Date();
            await user.save();
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

// Passport serialization (required for some strategies even if session: false)
passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
    const user = dbProvider === 'mssql' ? await userRepo.getUserById(id) : await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Helper function to convert English error messages to Vietnamese
const getVietnameseErrorMessage = (field, message) => {
  const errorMap = {
    fullName: {
      "Name must be 2-50 characters": "Họ và tên phải có từ 2-50 ký tự",
      "Invalid value": "Họ và tên không hợp lệ",
    },
    email: {
      "Valid email required": "Email không hợp lệ",
      "Invalid value": "Email không hợp lệ",
    },
    password: {
      "Password must be at least 6 characters":
        "Mật khẩu phải có ít nhất 6 ký tự",
      "Invalid value": "Mật khẩu không hợp lệ",
    },
    phone: {
      "Valid phone number required": "Số điện thoại không hợp lệ",
      "Invalid value": "Số điện thoại không hợp lệ",
    },
    dateOfBirth: {
      "Ngày sinh không hợp lệ": "Ngày sinh không hợp lệ",
      "Invalid value": "Ngày sinh không hợp lệ",
    },
    role: {
      "Vai trò không hợp lệ": "Vai trò không hợp lệ",
      "Invalid value": "Vai trò không hợp lệ",
    },
  };

  if (errorMap[field] && errorMap[field][message]) {
    return errorMap[field][message];
  }

  // Default Vietnamese messages
  const defaultMessages = {
    fullName: "Họ và tên không hợp lệ",
    email: "Email không hợp lệ",
    password: "Mật khẩu không hợp lệ",
    phone: "Số điện thoại không hợp lệ",
    dateOfBirth: "Ngày sinh không hợp lệ",
  };

  return defaultMessages[field] || "Dữ liệu không hợp lệ";
};

// Register with file uploads and role-specific information
router.post(
  "/register",
  upload.fields([
    { name: "idCardFrontImage", maxCount: 1 },
    { name: "idCardBackImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 },
  ]),
  [
    body("fullName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be 2-50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone")
      .matches(/^[0-9]{10,11}$/)
      .withMessage("Valid phone number required"),
    body("dateOfBirth").isISO8601({ strict: false }).withMessage("Ngày sinh không hợp lệ"),
    body("role")
      .isIn(["user", "driver", "owner", "collaborator"])
      .withMessage("Vai trò không hợp lệ"),
  ],
  async (req, res) => {
    try {
      // CRITICAL: Log received files to debug why idCardFrontImage is missing
      console.log("--- REGISTER REQUEST RECEIVED ---");
      console.log("Role:", req.body.role);
      console.log("Body fields:", Object.keys(req.body));
      console.log(
        "Files received:",
        req.files ? Object.keys(req.files) : "NONE",
      );

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const vietnameseErrors = errors.array().map((error) => ({
          field: error.path,
          message: getVietnameseErrorMessage(error.path, error.msg),
        }));
        console.log("Validation Errors:", vietnameseErrors); // NEW: Log errors to console
        return res
          .status(400)
          .json({ errors: vietnameseErrors, message: "Dữ liệu không hợp lệ" });
      }

      // Parse form data
      const {
        fullName,
        email,
        password,
        phone,
        dateOfBirth,
        role,
        driverInfo,
        ownerInfo,
        contract
      } = req.body;

      // Check if user exists
      const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
      const existingUser =
        dbProvider === 'mssql' ? await userRepo.getUserByEmail(email) : await User.findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({
            message: "Email đã được sử dụng. Vui lòng chọn email khác.",
          });
      }

      // Check age (must be 18+)
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        return res
          .status(400)
          .json({ message: "Bạn phải đủ 18 tuổi để đăng ký" });
      }

      // Create user object
      const userData = {
        fullName,
        email,
        password,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        role,
        isActive: true,
        isVerified: role === "user", // Auto-verify regular users, others need manual verification
      };

      if (contract) {
        try {
          const parsedContract = JSON.parse(contract);
          userData.contract = {
            isAgreed: parsedContract.isAgreed || false,
            agreedAt: parsedContract.isAgreed ? new Date() : null,
            contractType: role === "driver" || role === "collaborator" ? role : "none",
            signatureName: parsedContract.signatureName || ""
          };
        } catch(e) {
          console.error("Error parsing contract data:", e);
        }
      }

      // 🛠️ FIX: If registering as DRIVER, auto-approve as Collaborator (CTV)
      if (role === "driver") {
        userData.collaboratorRequest = {
          status: "approved",
          requestedAt: new Date(),
          reviewedAt: new Date(),
          note: "Hệ thống tự động phê duyệt vai trò Tài xế",
        };
      } else if (role === "collaborator") {
        const frontImg = req.files?.idCardFrontImage?.[0];
        const backImg = req.files?.idCardBackImage?.[0];
        
        let parsedIdCardNumber = "";
        try {
          if (req.body.idCard) {
            const parsed = JSON.parse(req.body.idCard);
            parsedIdCardNumber = parsed.number || "";
          }
        } catch(e) {}
        
        // Cập nhật lại số idCard gốc ở User record
        userData.idCard = { number: parsedIdCardNumber };

        userData.collaboratorRequest = {
          status: "pending",
          requestedAt: new Date(),
          idCardFrontImage: frontImg ? {
            data: frontImg.buffer,
            contentType: frontImg.mimetype,
            filename: frontImg.originalname,
          } : null,
          idCardBackImage: backImg ? {
            data: backImg.buffer,
            contentType: backImg.mimetype,
            filename: backImg.originalname,
          } : null
        };
      }

      // Add role-specific information
      if (driverInfo) {
        try {
          const driverData = JSON.parse(driverInfo);
          const frontImg = req.files?.idCardFrontImage?.[0];
          const backImg = req.files?.idCardBackImage?.[0];
          const licImg = req.files?.licenseImage?.[0];

          userData.driverInfo = {
            driverLicense: driverData.driverLicense || "",
            licenseExpiry:
              driverData.licenseExpiry &&
              !isNaN(new Date(driverData.licenseExpiry))
                ? new Date(driverData.licenseExpiry)
                : null,
            experience: driverData.experience || "",
            vehicleType: driverData.vehicleType || "",
            licenseClass: driverData.licenseClass || "",
            idCard: driverData.idCard || "",
            idCardFrontImage: frontImg ? {
                    data: frontImg.buffer,
                    contentType: frontImg.mimetype,
                    filename: frontImg.originalname,
                  } : null,
            idCardBackImage: backImg ? {
                    data: backImg.buffer,
                    contentType: backImg.mimetype,
                    filename: backImg.originalname,
                  } : null,
            licenseImage: licImg ? {
                    data: licImg.buffer,
                    contentType: licImg.mimetype,
                    filename: licImg.originalname,
                  } : null,
          };

          // Also populate collaborator images if driver
          if (role === "driver") {
            userData.collaboratorRequest.idCardFrontImage = userData.driverInfo.idCardFrontImage;
            userData.collaboratorRequest.idCardBackImage = userData.driverInfo.idCardBackImage;
            userData.collaboratorRequest.licenseImage = userData.driverInfo.licenseImage;
          }
        } catch (e) {
          console.error("Error parsing driverInfo:", e);
        }
      }

      if (ownerInfo) {
        try {
          const ownerData = JSON.parse(ownerInfo);
          userData.ownerInfo = {
            companyName: ownerData.companyName || "",
            businessLicense: ownerData.businessLicense || "",
            bankAccount: ownerData.bankAccount || "",
            bankName: ownerData.bankName || "",
            idCard: ownerData.idCard || "",
            idCardFrontImage:
              req.files && req.files.idCardFrontImage
                ? {
                    data: req.files.idCardFrontImage[0].buffer,
                    contentType: req.files.idCardFrontImage[0].mimetype,
                    filename: req.files.idCardFrontImage[0].originalname,
                  }
                : null,
            idCardBackImage:
              req.files && req.files.idCardBackImage
                ? {
                    data: req.files.idCardBackImage[0].buffer,
                    contentType: req.files.idCardBackImage[0].mimetype,
                    filename: req.files.idCardBackImage[0].originalname,
                  }
                : null,
          };
        } catch (e) {
          console.error("Error parsing ownerInfo:", e);
        }
      }

      // Validate required fields for drivers
      if (role === "driver") {
        const di = userData.driverInfo || {};
        if (!di.driverLicense)
          return res.status(400).json({ message: "Thiếu số bằng lái xe" });
        if (!di.licenseExpiry)
          return res
            .status(400)
            .json({ message: "Thiếu hoặc lỗi ngày hết hạn bằng lái" });
        if (!di.experience)
          return res.status(400).json({ message: "Thiếu số năm kinh nghiệm" });
        if (!di.vehicleType)
          return res.status(400).json({ message: "Thiếu loại xe sở trường" });
        if (!di.idCard)
          return res.status(400).json({ message: "Thiếu số CCCD/CMND" });
        if (!di.idCardFrontImage)
          return res.status(400).json({ message: "Thiếu ảnh CCCD mặt trước" });
        if (!di.idCardBackImage)
          return res.status(400).json({ message: "Thiếu ảnh CCCD mặt sau" });
        if (!di.licenseImage)
          return res.status(400).json({ message: "Thiếu ảnh bằng lái xe" });
      }

      if (role === "owner") {
        const oi = userData.ownerInfo || {};
        if (!oi.bankAccount)
          return res
            .status(400)
            .json({ message: "Thiếu số tài khoản ngân hàng" });
        if (!oi.bankName)
          return res.status(400).json({ message: "Thiếu tên ngân hàng" });
        if (!oi.idCard)
          return res.status(400).json({ message: "Thiếu số CCCD/CMND" });
        if (!oi.idCardFrontImage)
          return res.status(400).json({ message: "Thiếu ảnh CCCD mặt trước" });
        if (!oi.idCardBackImage)
          return res.status(400).json({ message: "Thiếu ảnh CCCD mặt sau" });
      }

      // Create user
      let user;
      if (dbProvider === 'mssql') {
        const id = crypto.randomBytes(12).toString('hex');
        // Store complex objects as JSON in SQL
        user = await userRepo.createUser({
          id,
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth,
          role: userData.role,
          isActive: userData.isActive,
          isVerified: userData.isVerified,
          preferences: userData.preferences,
          driverInfo: userData.driverInfo,
          ownerInfo: userData.ownerInfo,
          collaboratorRequest: userData.collaboratorRequest,
          contract: userData.contract,
          avatar: userData.avatar,
        });
      } else {
        user = new User(userData);
        await user.save();
      }

      // Generate token
      const token = generateToken(user._id || user.id, user.role);

      // Update last login
      if (dbProvider === 'mssql') {
        await userRepo.updateLastLogin(user.id, new Date());
      } else {
        user.lastLogin = new Date();
        await user.save();
      }

      res.status(201).json({
        message:
          role === "user"
            ? "Đăng ký thành công"
            : "Đăng ký thành công! Tài khoản của bạn đang chờ xác thực.",
        token,
        user: {
          id: user._id || user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          addressId: user.addressId,
        },
      });
    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({
        message: "Lỗi server. Vui lòng thử lại sau.",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  },
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Email không hợp lệ"),
    body("password").notEmpty().withMessage("Mật khẩu là bắt buộc"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const vietnameseErrors = errors.array().map((error) => ({
          field: error.path,
          message: getVietnameseErrorMessage(error.path, error.msg),
        }));
        return res
          .status(400)
          .json({ errors: vietnameseErrors, message: "Dữ liệu không hợp lệ" });
      }

      const { email, password } = req.body;
      console.log(`Login attempt for: ${email}`);

      // Find user
      const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
      console.log(`DB Provider: ${dbProvider}`);

      const user = dbProvider === 'mssql' ? await userRepo.getUserByEmail(email) : await User.findOne({ email });
      console.log(`User found: ${!!user}`);

      if (!user) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không chính xác" });
      }

      console.log(`User status: isActive=${user.isActive}, role=${user.role}`);

      if (!user.isActive) {
        return res
          .status(403)
          .json({
            message:
              "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
          });
      }

      // Check password
      const passwordHash = user.password || user.passwordHash;
      console.log(`Verifying password... Hash length: ${passwordHash?.length || 0}`);
      
      const isMatch = await bcrypt.compare(password, passwordHash);
      console.log(`Password match: ${isMatch}`);
      
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không chính xác" });
      }

      // Generate token
      const token = generateToken(user._id || user.id, user.role);

      // Update last login
      if (dbProvider === 'mssql') {
        console.log(`Updating last login for SQL user: ${user.id}`);
        await userRepo.updateLastLogin(user.id, new Date());
      } else {
        user.lastLogin = new Date();
        await user.save();
      }

      res.json({
        message: "Đăng nhập thành công",
        token,
        user: {
          id: user._id || user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          addressId: user.addressId,
        },
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      res.status(500).json({ 
        message: "Lỗi server. Vui lòng thử lại sau.",
        error: error.message,
        stack: error.stack
      });
    }
  },
);

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirectSocialError(req, res, "Google login chưa được cấu hình");
  }
  return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirectSocialError(req, res, "Google login chưa được cấu hình");
  }
  return passport.authenticate("google", { session: false }, (error, user) => {
    if (error || !user) {
      return redirectSocialError(req, res, "Đăng nhập Google thất bại");
    }
    return redirectSocialSuccess(req, res, user);
  })(req, res, next);
});

router.get("/facebook", (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return redirectSocialError(req, res, "Facebook login chưa được cấu hình");
  }
  // Do not force "email" scope because some Facebook apps
  // are not allowed to request it and will fail with "Invalid Scopes: email".
  return passport.authenticate("facebook")(req, res, next);
});

router.get("/facebook/callback", (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return redirectSocialError(req, res, "Facebook login chưa được cấu hình");
  }
  return passport.authenticate("facebook", { session: false }, (error, user) => {
    if (error || !user) {
      return redirectSocialError(req, res, "Đăng nhập Facebook thất bại");
    }
    return redirectSocialSuccess(req, res, user);
  })(req, res, next);
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();
    let user;
    if (dbProvider === 'mssql') {
      user = await userRepo.getUserById(req.userId);
      if (user?.addressId) {
        const address = await addressRepo.getAddressById(user.addressId);
        user.addressId = address;
      }
    } else {
      user = await User.findById(req.userId)
        .select("-password")
        .populate("addressId");
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Serialize any binary files in collaboratorRequest / driverInfo / ownerInfo to data URLs
    const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return undefined;
      if (typeof fileObj.data === 'string') return `data:${fileObj.contentType};base64,${fileObj.data}`;
      let buffer;
      if (Buffer.isBuffer(fileObj.data)) {
        buffer = fileObj.data;
      } else if (fileObj.data.type === 'Buffer' && Array.isArray(fileObj.data.data)) {
        buffer = Buffer.from(fileObj.data.data);
      } else {
        buffer = Buffer.from(fileObj.data);
      }
      return `data:${fileObj.contentType};base64,${buffer.toString("base64")}`;
    };

    const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };

    // Top-level Profile Files
    userObj.avatar = toDataUrl(userObj.avatar) || "";
    if (userObj.idCard) {
      userObj.idCard.frontImage = toDataUrl(userObj.idCard.frontImage) || "";
      userObj.idCard.backImage = toDataUrl(userObj.idCard.backImage) || "";
    }
    if (userObj.drivingLicense) {
      userObj.drivingLicense.frontImage = toDataUrl(userObj.drivingLicense.frontImage) || "";
      userObj.drivingLicense.backImage = toDataUrl(userObj.drivingLicense.backImage) || "";
    }

    if (userObj.collaboratorRequest) {
      const cr = userObj.collaboratorRequest;
      cr.idCardFrontImage = toDataUrl(cr.idCardFrontImage) || "";
      cr.idCardBackImage = toDataUrl(cr.idCardBackImage) || "";
      cr.licenseImage = toDataUrl(cr.licenseImage) || "";
      if (cr.additionalDocs && Array.isArray(cr.additionalDocs))
        cr.additionalDocs = cr.additionalDocs.map((d) => toDataUrl(d) || "");
      if (cr.carSubmissions && Array.isArray(cr.carSubmissions)) {
        cr.carSubmissions = cr.carSubmissions.map((c) => ({
          make: c.make,
          model: c.model,
          year: c.year,
          licensePlate: c.licensePlate,
          photos: (c.photos || []).map((p) => toDataUrl(p) || ""),
          registration: toDataUrl(c.registration) || "",
          insurance: toDataUrl(c.insurance) || "",
        }));
      }
    }
    if (userObj.driverInfo) {
      if (userObj.driverInfo.idCardFrontImage)
        userObj.driverInfo.idCardFrontImage =
          toDataUrl(userObj.driverInfo.idCardFrontImage) || "";
      if (userObj.driverInfo.idCardBackImage)
        userObj.driverInfo.idCardBackImage =
          toDataUrl(userObj.driverInfo.idCardBackImage) || "";
      if (userObj.driverInfo.licenseImage)
        userObj.driverInfo.licenseImage =
          toDataUrl(userObj.driverInfo.licenseImage) || "";
    }
    if (userObj.ownerInfo) {
      if (userObj.ownerInfo.idCardFrontImage)
        userObj.ownerInfo.idCardFrontImage =
          toDataUrl(userObj.ownerInfo.idCardFrontImage) || "";
      if (userObj.ownerInfo.idCardBackImage)
        userObj.ownerInfo.idCardBackImage =
          toDataUrl(userObj.ownerInfo.idCardBackImage) || "";
    }

    res.json({ user: userObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile with binary images and object address
router.put(
  "/profile",
  auth,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "idCardFront", maxCount: 1 },
    { name: "idCardBack", maxCount: 1 },
    { name: "drivingLicenseFront", maxCount: 1 },
    { name: "drivingLicenseBack", maxCount: 1 },
  ]),
  (req, res, next) => {
    ["address", "idCard", "drivingLicense", "driverInfo", "bankAccount"].forEach((key) => {
      if (typeof req.body[key] === "string") {
        try { req.body[key] = JSON.parse(req.body[key]); } catch (e) {}
      }
    });
    next();
  },
  [
    body("fullName").optional().trim().isLength({ min: 2, max: 50 }),
    body("phone").optional().matches(/^[0-9]{10,11}$/),
    body("dateOfBirth").optional({ checkFalsy: true }).isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const dbProvider = (process.env.DB_PROVIDER || 'mongo').toLowerCase();

      // Serialization helper (DataURL for frontend)
      const toDataUrl = (fileObj) => {
        if (!fileObj || !fileObj.data) return undefined;
        if (typeof fileObj.data === 'string') return `data:${fileObj.contentType};base64,${fileObj.data}`;
        let buffer;
        if (Buffer.isBuffer(fileObj.data)) {
          buffer = fileObj.data;
        } else if (fileObj.data.type === 'Buffer' && Array.isArray(fileObj.data.data)) {
          buffer = Buffer.from(fileObj.data.data);
        } else {
          buffer = Buffer.from(fileObj.data);
        }
        return `data:${fileObj.contentType};base64,${buffer.toString('base64')}`;
      };

      const toFileObj = (file) => ({
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
      });

      // ── MSSQL BRANCH ────────────────────────────────────────────────
      if (dbProvider === 'mssql') {
        let mssqlUser = await userRepo.getUserById(req.userId);
        if (!mssqlUser) {
          return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const updates = {};

        if (req.body.fullName) updates.fullName = req.body.fullName;
        if (req.body.phone) updates.phone = req.body.phone;

        // Avatar file
        if (req.files?.avatar?.length) {
          updates.avatar = toFileObj(req.files.avatar[0]);
        }

        // ID Card images
        const currentIdCard = mssqlUser.idCard || {};
        let idCardChanged = false;
        if (req.files?.idCardFront?.length) {
          currentIdCard.frontImage = toFileObj(req.files.idCardFront[0]);
          idCardChanged = true;
        }
        if (req.files?.idCardBack?.length) {
          currentIdCard.backImage = toFileObj(req.files.idCardBack[0]);
          idCardChanged = true;
        }
        if (req.body.idCard?.number) {
          currentIdCard.number = req.body.idCard.number;
          idCardChanged = true;
        }
        if (idCardChanged) updates.idCard = currentIdCard;

        // Driving license images
        const currentLicense = mssqlUser.drivingLicense || {};
        let licenseChanged = false;
        if (req.files?.drivingLicenseFront?.length) {
          currentLicense.frontImage = toFileObj(req.files.drivingLicenseFront[0]);
          licenseChanged = true;
        }
        if (req.files?.drivingLicenseBack?.length) {
          currentLicense.backImage = toFileObj(req.files.drivingLicenseBack[0]);
          licenseChanged = true;
        }
        if (req.body.driverInfo?.licenseNumber) {
          currentLicense.number = req.body.driverInfo.licenseNumber;
          licenseChanged = true;
        }
        if (req.body.driverInfo?.licenseClass) {
          currentLicense.type = req.body.driverInfo.licenseClass;
          licenseChanged = true;
        }
        if (licenseChanged) updates.drivingLicense = currentLicense;

        // Address (skip update - addressRepo doesn't have updateAddress)
        // Address changes via /users/profile or dedicated address endpoint

        // Bank account
        if (req.body.bankAccount) {
          const bk = req.body.bankAccount;
          const currentBank = mssqlUser.bankAccount || {};
          if (bk.bankName) currentBank.bankName = bk.bankName;
          if (bk.accountNumber) currentBank.accountNumber = bk.accountNumber;
          if (bk.accountName) currentBank.accountName = bk.accountName;
          updates.bankAccount = currentBank;
        }

        // Save to MSSQL
        const updatedMssqlUser = await userRepo.updateUser(req.userId, updates);

        // Build response user object with serialized images
        const userObj = { ...(updatedMssqlUser || mssqlUser) };
        userObj.avatar = toDataUrl(userObj.avatar) || '';
        if (userObj.idCard) {
          userObj.idCard = { ...userObj.idCard };
          userObj.idCard.frontImage = toDataUrl(userObj.idCard.frontImage) || '';
          userObj.idCard.backImage = toDataUrl(userObj.idCard.backImage) || '';
        }
        if (userObj.drivingLicense) {
          userObj.drivingLicense = { ...userObj.drivingLicense };
          userObj.drivingLicense.frontImage = toDataUrl(userObj.drivingLicense.frontImage) || '';
          userObj.drivingLicense.backImage = toDataUrl(userObj.drivingLicense.backImage) || '';
        }

        return res.json({ message: 'Cập nhật hồ sơ thành công', user: userObj });
      }

      // ── MONGODB BRANCH ───────────────────────────────────────────────
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      // 1. Handle Basic Fields
      if (req.body.fullName) user.fullName = req.body.fullName;
      if (req.body.phone) user.phone = req.body.phone;
      if (req.body.dateOfBirth) {
        const d = new Date(req.body.dateOfBirth);
        if (!isNaN(d.valueOf())) user.dateOfBirth = d;
      }

      // 2. Handle Binary Images
      if (req.files) {
        if (req.files.avatar?.length) user.avatar = toFileObj(req.files.avatar[0]);
        
        if (!user.idCard) user.idCard = {};
        if (req.files.idCardFront?.length) user.idCard.frontImage = toFileObj(req.files.idCardFront[0]);
        if (req.files.idCardBack?.length) user.idCard.backImage = toFileObj(req.files.idCardBack[0]);

        if (!user.drivingLicense) user.drivingLicense = {};
        if (req.files.drivingLicenseFront?.length) user.drivingLicense.frontImage = toFileObj(req.files.drivingLicenseFront[0]);
        if (req.files.drivingLicenseBack?.length) user.drivingLicense.backImage = toFileObj(req.files.drivingLicenseBack[0]);
      }

      // Handle ID Card number and License info
      if (req.body.idCard) {
        const idData = req.body.idCard;
        if (!user.idCard) user.idCard = {};
        if (idData.number) user.idCard.number = idData.number;
      }

      if (req.body.driverInfo) {
        const dInfo = req.body.driverInfo;
        if (!user.drivingLicense) user.drivingLicense = {};
        if (!user.driverInfo) user.driverInfo = {};
        if (dInfo.licenseNumber) user.drivingLicense.number = dInfo.licenseNumber;
        if (dInfo.licenseClass) user.drivingLicense.type = dInfo.licenseClass;
        if (dInfo.expiryDate) {
          const exp = new Date(dInfo.expiryDate);
          if (!isNaN(exp.valueOf())) user.drivingLicense.expiryDate = exp;
        }
        if (dInfo.idCard) user.driverInfo.idCard = dInfo.idCard;
      }

      // 3. Handle Object Address
      if (req.body.address) {
        const addrData = req.body.address;
        
        let address;
        if (user.addressId) {
          address = await Address.findById(user.addressId);
        }

        const st = addrData.street || 'Chưa cập nhật';
        const wa = addrData.district || addrData.ward || 'Chưa cập nhật';
        const pr = addrData.city || addrData.province || 'Chưa cập nhật';

        if (!address) {
          address = new Address({
            owner: user._id,
            street: st,
            ward: { name: wa },
            province: { name: pr },
            referenceType: 'User',
            referenceId: user._id,
            isDefault: true
          });
          await address.save();
          user.addressId = address._id;
        } else {
          address.street = st;
          address.ward.name = wa;
          address.province.name = pr;
          await address.save();
        }
      }

      // 4. Handle Bank Account
      if (req.body.bankAccount) {
        const bk = req.body.bankAccount;
        if (!user.bankAccount) user.bankAccount = {};
        if (bk.bankName) user.bankAccount.bankName = bk.bankName;
        if (bk.accountNumber) user.bankAccount.accountNumber = bk.accountNumber;
        if (bk.accountName) user.bankAccount.accountName = bk.accountName;
      }

      await user.save();

      const updatedUser = await User.findById(user._id).populate("addressId").select("-password");
      const userObj = updatedUser.toObject();
      
      // Serialize binary fields for response
      userObj.avatar = toDataUrl(userObj.avatar) || "";
      if (userObj.idCard) {
        userObj.idCard.frontImage = toDataUrl(userObj.idCard.frontImage) || "";
        userObj.idCard.backImage = toDataUrl(userObj.idCard.backImage) || "";
      }
      if (userObj.drivingLicense) {
        userObj.drivingLicense.frontImage = toDataUrl(userObj.drivingLicense.frontImage) || "";
        userObj.drivingLicense.backImage = toDataUrl(userObj.drivingLicense.backImage) || "";
      }

      res.json({
        message: "Cập nhật hồ sơ thành công",
        user: userObj,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
    }
  },
);

// Change password
router.put(
  "/password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
