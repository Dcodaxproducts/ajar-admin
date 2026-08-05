import { MenuItem, NavMenuItem } from "@/types";
import {
  FaCalendarCheck,
  FaChartBar,
  FaClipboardList,
  FaEnvelope,
  FaList,
  FaMoneyCheckAlt,
  FaQuestion,
  FaRegBell,
  FaShapes,
  FaTicketAlt,
  FaUndo,
  FaUserFriends,
  FaUsers,
  FaVectorSquare,
  FaWallet 
} from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { PiQuestionMarkFill } from "react-icons/pi";
import { TbAdjustmentsHorizontal } from "react-icons/tb";

export const sidebarMenu: NavMenuItem[] = [
  { title: "dashboard", path: "/", icon: MdOutlineDashboard },
  { title: "zoneManagement", path: "/zone-management", icon: FaVectorSquare },
  {
    title: "categoryManagement",
    path: "/category-management",
    icon: FaShapes,
  },
  {
    title: "fieldManagement",
    path: "/field-management",
    icon: TbAdjustmentsHorizontal,
  },
  { title: "userVerification", path: "/user-verification", icon: FaUsers },
  { title: "rentalListing", path: "/rental-listing", icon: FaClipboardList },
  { title: "bookings", path: "/bookings", icon: FaCalendarCheck },
  {
    title: "businessSettings",
    path: "/business-settings",
    icon: FaMoneyCheckAlt,
  },
  { title: "tickets", path: "/tickets", icon: FaTicketAlt },
  { title: "refundManagement", path: "/refund-management", icon: FaUndo },
  {
    title: "employeeManagement",
    path: "/employee-management",
    icon: FaUserFriends,
  },
  {
    title: "analytics",
    path: "/analytics",
    icon: FaChartBar,
  },
  {title : "wallet", path: "/wallet", icon: FaWallet },
  { title: "messages", path: "/messages", icon: FaEnvelope },
  { title: "reminderSettings", path: "/reminder-settings", icon: FaRegBell },
  { title: "helpSupport", path: "/help-support", icon: FaQuestion },
  { title: "faqs", path: "/faqs", icon: PiQuestionMarkFill },
  { title: "dropdowns", path: "/dropdowns", icon: FaList },
  // { title: "Administration", path: "/administration", icon: FaBuilding },
];

// Navigation items with icons
export const navMenu: MenuItem[] = [
  { path: "/user-verification", title: "user" },
  { path: "/analytics", title: "reports" },
  { path: "/rental-listing", title: "listing" },
  { path: "/rental-policies", title: "rentalPolicies" },
  { path: "/terms-and-conditions", title: "termsAndConditions" },
  { path: "/privacy-policy", title: "privacyPolicy" },
  { path: "/cancellation-policy", title: "cancellationPolicy" },
];

export const businessNavMenu: MenuItem[] = [
  { path: "/", title: "businessInformation" },
  { path: "/payment-methods", title: "paymentMethods" },
  { path: "/sms-module", title: "smsModule" },
  { path: "/mail-config", title: "mailConfig" },
  { path: "/map-apis", title: "mapApis" },
  { path: "/social-logins", title: "socialLogins" },
  { path: "/recaptcha", title: "recaptcha" },
  { path: "/firebase", title: "firebase" },
  // { path: "/storage", title: "Storage" },
];
