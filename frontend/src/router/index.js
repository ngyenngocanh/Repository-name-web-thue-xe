import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  // Mỗi lần chuyển trang đưa viewport về đầu (tránh “tự kéo xuống” / giữ scroll cũ)
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
        top: 80,
      };
    }
    return { left: 0, top: 0 };
  },
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
      meta: { title: "Trang chủ" },
    },
    {
      path: "/cars",
      name: "CarList",
      component: () => import("@/views/cars/CarList.vue"),
      meta: { title: "Danh sách xe" },
    },
    {
      path: "/cars/:id/self-drive",
      name: "CarDetailSelfDrive",
      component: () => import("@/views/cars/CarDetailSelfDrive.vue"),
      meta: { title: "Thuê xe tự lái" },
    },
    {
      path: "/cars/:id/with-driver",
      name: "CarDetailWithDriver",
      component: () => import("@/views/cars/CarDetailWithDriver.vue"),
      meta: { title: "Thuê xe kèm tài xế" },
    },
    {
      path: "/cars/:id/trip",
      name: "CarDetailTrip",
      component: () => import("@/views/cars/CarDetailTrip.vue"),
      meta: { title: "Thuê xe theo chuyến" },
    },
    {
      path: "/drivers",
      name: "DriverList",
      component: () => import("@/views/drivers/DriverList.vue"),
      meta: { title: "Danh sách tài xế" },
    },
    {
      path: "/drivers/:id",
      name: "DriverDetail",
      component: () => import("@/views/drivers/DriverDetail.vue"),
      meta: { title: "Chi tiết tài xế" },
    },
    {
      path: "/cars/:id/self-drive/booking",
      name: "BookingSelfDrive",
      component: () => import("@/views/booking/BookingSelfDrive.vue"),
      meta: { title: "Đặt xe tự lái", requiresAuth: true },
    },
    {
      path: "/cars/:id/with-driver/booking",
      name: "BookingWithDriver",
      component: () => import("@/views/booking/BookingWithDriver.vue"),
      meta: { title: "Đặt xe kèm tài xế", requiresAuth: true },
    },
    {
      path: "/cars/:id/trip/booking",
      name: "BookingTrip",
      component: () => import("@/views/booking/BookingTrip.vue"),
      meta: { title: "Đặt xe theo chuyến", requiresAuth: true },
    },
    {
      path: "/drivers/:id/booking",
      name: "BookingDriver",
      component: () => import("@/views/booking/BookingDriver.vue"),
      meta: { title: "Đặt tài xế", requiresAuth: true },
    },
    {
      path: "/profile",
      name: "Profile",
      component: () => import("@/views/profile/Profile.vue"),
      meta: { title: "Hồ sơ", requiresAuth: true },
    },
    {
      path: "/payment/vnpay_return",
      name: "VNPayReturn",
      component: () => import("@/views/payment/PaymentResult.vue"),
      meta: { title: "Kết quả thanh toán" },
    },
    {
      path: "/payment/momo_return",
      name: "MoMoReturn",
      component: () => import("@/views/payment/PaymentResult.vue"),
      meta: { title: "Kết quả thanh toán" },
    },
    {
      path: "/payment/payos_return",
      name: "PayOSReturn",
      component: () => import("@/views/payment/PaymentResult.vue"),
      meta: { title: "Kết quả thanh toán" },
    },
    {
      path: "/payment/checkout/:id",
      name: "PaymentCheckout",
      component: () => import("@/views/payment/PaymentCheckout.vue"),
      meta: { title: "Thanh toán đơn hàng", requiresAuth: true },
    },
    {
      path: "/my-cars",
      name: "MyCars",
      component: () => import("@/views/cars/MyCars.vue"),
      meta: { title: "Xe của tôi", requiresAuth: true },
    },
    {
      path: "/car-details/:id",
      name: "CarDetails",
      component: () => import("@/views/cars/CarDetails.vue"),
      meta: { title: "Chi tiết xe", requiresAuth: true },
    },
    {
      path: "/car-contract/:id",
      name: "CarContract",
      component: () => import("@/views/cars/CarContract.vue"),
      meta: { title: "Hợp đồng xe", requiresAuth: true },
    },
    {
      path: "/add-car",
      name: "AddCar",
      component: () => import("@/views/cars/AddCar.vue"),
      meta: { title: "Đăng xe", requiresAuth: true },
    },
    {
      path: "/edit-car/:id",
      name: "EditCar",
      component: () => import("@/views/cars/AddCar.vue"),
      meta: { title: "Chỉnh sửa xe", requiresAuth: true },
    },
    {
      path: "/my-bookings",
      name: "MyBookings",
      component: () => import("@/views/bookings/MyBookings.vue"),
      meta: { title: "Chuyến đi của tôi", requiresAuth: true },
    },
    {
      path: "/bookings/:id",
      name: "BookingDetail",
      component: () => import("@/views/bookings/BookingDetail.vue"),
      meta: { title: "Chi tiết chuyến đi", requiresAuth: true },
    },
    {
      path: "/bookings/driver/:id",
      name: "BookingDriverDetail",
      component: () => import("@/views/bookings/BookingDriverDetail.vue"),
      meta: { title: "Chi tiết tài xế riêng", requiresAuth: true },
    },
    {
      path: "/bookings/:id/review",
      name: "BookingReview",
      component: () => import("@/views/bookings/BookingReview.vue"),
      meta: { title: "Đánh giá chuyến đi", requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/auth/Login.vue"),
      meta: { title: "Đăng nhập", hideNavigation: true },
    },
    {
      path: "/register",
      name: "Register",
      component: () => import("@/views/auth/Register.vue"),
      meta: { title: "Đăng ký", hideNavigation: true },
    },
    {
      path: "/auth/social/callback",
      name: "SocialAuthCallback",
      component: () => import("@/views/auth/SocialAuthCallback.vue"),
      meta: { title: "Đăng nhập mạng xã hội", hideNavigation: true },
    },
    {
      path: "/about",
      name: "About",
      component: () => import("@/views/About.vue"),
      meta: { title: "Về chúng tôi" },
    },
    {
      path: "/become-collaborator",
      name: "BecomeCollaborator",
      component: () => import("@/views/auth/BecomeCollaborator.vue"),
      meta: { title: "Trở thành cộng tác viên", requiresAuth: true },
    },
    {
      path: "/contact",
      name: "Contact",
      component: () => import("@/views/Contact.vue"),
      meta: { title: "Liên hệ" },
    },
    {
      path: "/admin",
      component: () => import("@/views/admin/AdminLayout.vue"),
      meta: { requiresAuth: true, requiresRole: "admin" },
      children: [
        {
          path: "",
          name: "AdminDashboard",
          component: () => import("@/views/admin/AdminOverview.vue"),
          meta: { title: "Admin Dashboard" },
        },
        {
          path: "users",
          name: "AdminUsers",
          component: () => import("@/views/admin/AdminUsers.vue"),
          meta: { title: "Quản lý người dùng" },
        },
        {
          path: "cars",
          name: "AdminCars",
          component: () => import("@/views/admin/AdminCars.vue"),
          meta: { title: "Quản lý xe" },
        },
        {
          path: "bookings",
          name: "AdminBookings",
          component: () => import("@/views/admin/AdminBookings.vue"),
          meta: { title: "Quản lý đặt xe" },
        },
        {
          path: "prebookings",
          name: "AdminPreBookings",
          component: () => import("@/views/admin/AdminPreBookings.vue"),
          meta: { title: "Quản lý đặt trước" },
        },

        {
          path: "reports",
          name: "AdminReports",
          component: () => import("@/views/admin/AdminReports.vue"),
          meta: { title: "Báo cáo" },
        },
        {
          path: "settings",
          name: "AdminSettings",
          component: () => import("@/views/admin/AdminSettings.vue"),
          meta: { title: "Cài đặt" },
        },
        {
          path: "drivers",
          name: "AdminDrivers",
          component: () => import("@/views/admin/AdminDrivers.vue"),
          meta: { title: "Quản lý tài xế" },
        },
        {
          path: "car-approvals",
          name: "AdminCarApprovals",
          component: () => import("@/views/admin/AdminCarApprovals.vue"),
          meta: { title: "Phê duyệt xe" },
        },
        {
          path: "user-approvals",
          name: "AdminUserApprovals",
          component: () => import("@/views/admin/AdminUserApprovals.vue"),
          meta: { title: "Phê duyệt người dùng" },
        },
        {
          path: "system-settings",
          name: "AdminSystemSettings",
          component: () => import("@/views/admin/AdminSystemSettings.vue"),
          meta: { title: "Cài đặt hệ thống" },
        },
        {
          path: "contracts",
          name: "AdminContracts",
          component: () => import("@/views/admin/AdminContracts.vue"),
          meta: { title: "Quản lý hợp đồng" },
        },
        {
          path: "trips",
          name: "AdminTrips",
          component: () => import("@/views/admin/AdminTrips.vue"),
          meta: { title: "Quản lý chuyến" },
        },
        {
          path: "payouts",
          name: "AdminPayouts",
          component: () => import("@/views/admin/AdminPayouts.vue"),
          meta: { title: "Trả Lương / Hoa Hồng" },
        },
      ],
    },
    {
      path: "/driver",
      component: () => import("@/views/driver/DriverLayout.vue"),
      meta: { requiresAuth: true, requiresRole: ["driver", "collaborator", "admin"] },
      children: [
        {
          path: "",
          name: "DriverDashboard",
          component: () => import("@/views/driver/DriverDashboard.vue"),
          meta: { title: "Driver Dashboard" },
        },
        {
          path: "trips",
          name: "DriverTrips",
          component: () => import("@/views/driver/DriverTrips.vue"),
          meta: { title: "Danh sách chuyến đi" },
        },
        {
          path: "trips/:id",
          name: "DriverTripDetails",
          component: () => import("@/views/driver/DriverTripDetails.vue"),
          meta: { title: "Chi tiết chuyến đi" },
        },
        {
          path: "earnings",
          name: "DriverEarnings",
          component: () => import("@/views/driver/DriverEarnings.vue"),
          meta: { title: "Thu nhập của tôi" },
        },
        {
          path: "earnings-ctv",
          name: "CollaboratorEarnings",
          component: () => import("@/views/collaborator/CollaboratorEarnings.vue"),
          meta: { title: "Hoa hồng CTV" },
        },
        {
          path: "cars",
          name: "DriverCars",
          component: () => import("@/views/driver/DriverCars.vue"),
          meta: { title: "Xe của tôi" },
        },
        {
          path: "cars/add",
          name: "DriverAddCar",
          component: () => import("@/views/cars/AddCar.vue"),
          meta: { title: "Đăng xe mới" },
        },
        {
          path: "cars/:id",
          name: "DriverCarDetail",
          component: () => import("@/views/cars/CarDetails.vue"),
          meta: { title: "Chi tiết xe" },
        },
        {
          path: "cars/:id/contract",
          name: "DriverCarContract",
          component: () => import("@/views/cars/CarContract.vue"),
          meta: { title: "Hợp đồng xe" },
        },
        {
          path: "profile",
          name: "DriverProfile",
          component: () => import("@/views/driver/DriverProfile.vue"),
          meta: { title: "Hồ sơ cá nhân" },
        },
        {
          path: "schedule",
          name: "DriverSchedule",
          component: () => import("@/views/driver/DriverSchedule.vue"),
          meta: { title: "Lịch làm việc" },
        },
      ],
    },
    {
      path: "/contracts/self-drive/:id",
      name: "SelfDriveContract",
      component: () => import("@/views/contracts/SelfDriveContract.vue"),
      meta: { title: "Hợp đồng thuê xe tự lái", requiresAuth: true },
    },
    {
      path: "/contracts/with-driver/:id",
      name: "WithDriverContract",
      component: () => import("@/views/contracts/WithDriverContract.vue"),
      meta: { title: "Hợp đồng thuê xe có tài xế", requiresAuth: true },
    },
    {
      path: "/contracts/trip-driver/:id",
      name: "TripDriverContract",
      component: () => import("@/views/contracts/TripDriverContract.vue"),
      meta: { title: "Hợp đồng tài xế theo chuyến", requiresAuth: true },
    },
    {
      path: "/contracts/solo-driver/:id",
      name: "SoloDriverContract",
      component: () => import("@/views/contracts/SoloDriverContract.vue"),
      meta: { title: "Hợp đồng thuê tài xế riêng", requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/NotFound.vue"),
      meta: { title: "Không tìm thấy" },
    },
  ],
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - CarRental`;
  }

  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next(`/login?redirect=${to.fullPath}`);
    return;
  }

  // Check role
  if (to.meta.requiresRole) {
    // If user data isn't loaded yet, fetch it from the server
    if (!authStore.user && authStore.token) {
      try {
        await authStore.fetchUser();
      } catch (e) {
        console.error('Failed to fetch user for role check:', e);
        next('/login');
        return;
      }
    }

    const userRole = authStore.user?.role;
    const requiredRoles = Array.isArray(to.meta.requiresRole) 
      ? to.meta.requiresRole 
      : [to.meta.requiresRole];

    console.log('Router guard - userRole:', userRole, 'requiredRoles:', requiredRoles);

    if (!requiredRoles.includes(userRole)) {
      console.warn(`Access denied: role "${userRole}" not in`, requiredRoles);
      next("/");
      return;
    }
  }

  next();
});

export default router;
