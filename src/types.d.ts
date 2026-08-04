import { IconType } from "react-icons/lib";
// types/leaflet-draw.d.ts
import "leaflet";
declare module "leaflet" {
  namespace Control {
    class Draw extends Control {
      constructor(options?: any);
    }
  }

  namespace Draw {
    namespace Event {
      const CREATED: string;
      const EDITED: string;
      const DELETED: string;
    }
  }
}

interface MenuItem {
  path: string;
  title: string;
}

interface NavMenuItem extends MenuItem {
  icon: React.ElementType;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalNormalUsers: number;
  totalActiveUsers: number;
  totalInactiveUsers: number;
  totalBlockedUsers: number;
  totalUnblockedUsers: number;
}

type DashboardStat = {
  title: string;
  value: number | string;
  icon: IconType;
  bgColor: string;
  path?: string;
};

interface UserOTP {
  isVerified: boolean;
  code: string;
  expiry: string;
}

interface StripeInfo {
  connectedAccountId: string;
  connectedAccountLink: string;
  customerId: string;
}

type UserStatus = "active" | "inactive" | "blocked" | "unblocked";

type Document = {
  _id: string;
  name: string;
  fileUrl: string;
  expiryDate?: string;
  status: "pending" | "approved" | "rejected" | "expired";
  reason?: string;
  reminderSent?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  dob?: string;
  nationality?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
  status: UserStatus;
  otp?: UserOTP;
  stripe?: StripeInfo;
  allowAccess?: EmployeeRole;
  documents?: Document[];
}

type Login = {
  email: string;
  password: string;
  role: "admin" | "staff";
};

type Signup = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  user_type: "admin";
  phone?: string;
  dob?: string;
  nationality?: string;
  image?: File;
};

type ErrorFieldDetail = {
  path: string[];
  message: string;
};

type ErrorDetails = {
  message: string;
  errors?: ErrorFieldDetail[] | null;
  statusCode?: number | null;
};

type AsyncResponse<T> = {
  data: T | null;
  error: ErrorDetails | null;
  status: "success" | "error";
};

interface LoginSuccessData {
  data: {
    token: string;
    user: User;
  };
}

interface Polygon {
  lat: number;
  lng: number;
  _id: string;
}

interface ZoneFormSetting {
  commissionType: "fixed" | "percentage";
  leaserCommission: {
    value: number;
    min: number;
    max: number;
  };
  renterCommission: {
    value: number;
    min: number;
    max: number;
  };
  tax: number;
  expiry: string;
}

interface ZoneFormField {
  _id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  isMultiple: boolean;
  options?: string[];
  order?: number;
  tooltip?: string;
  visible: boolean;
  defaultValue?: string;
  readonly: boolean;
  validation?: {
    required?: boolean;
  };
  min?: number;
  max?: number;
  language: string;
  languages?: any[];
}

interface Language {
  locale: string;
  translations: {
    name: string;
    description: string;
  };
  _id: string;
}

interface ZoneForm {
  _id: string;
  name: string;
  description: string;
  language: string;
  subCategory: string | any;
  zone: string | any;
  fields: ZoneFormField[];
  setting: ZoneFormSetting;
  languages?: Language[];
  userDocuments?: string[];
  leaserDocuments?: string[];
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ZoneLanguage {
  locale: string;
  translations: {
    name: string;
  };
  _id: string;
}

interface SubCategory {
  _id: string;
  name: string;
  thumbnail: string;
  icon: string;
  description: string;
  language: string;
  type: string;
  category: Category;
  languages: any[]; // refine later if needed
  slug: string;
  createdAt: string;
  updatedAt: string;

  id: string;
}

interface Zone {
  _id: string;
  name: string;
  currency: string;
  language: string;
  subCategories: SubCategory[];
  polygons: Polygon[][];
  languages: ZoneLanguage[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  type: string;
  slug: string;
  thumbnail?: string;
  icon?: string;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;
}

// types/ZoneSettings.ts

type CommissionType = "fixed" | "percentage";

interface Commission {
  type: CommissionType;
  leaser: number | { min: number; max: number };
  renter: number | { min: number; max: number };
}

interface SubcategorySettings {
  subcategory: string;
  fields: string[];
  commission: Commission;
  tax: number;
  expiry: string; // ISO string for date
}

interface ZoneSettingsFormData {
  zone: string;
  subcategories: SubcategorySettings[];
}

type SettingsPageName =
  | "businessInfo"
  | "paymentMethods"
  | "smsModule"
  | "mailConfig"
  | "mapAPI"
  | "socialLogins"
  | "recaptcha"
  | "firebase"
  | "pushNotifications"
  | "termsAndConditions"
  | "privacyPolicy"
  | "cancellationPolicy";

interface Subcategory {
  name: string;
  category: {
    name: string;
  };
}

type TicketStatus = "active" | "pending" | "rejected";
type Priority = "Low" | "Medium" | "High";

interface BookingLanguage {
  locale: string;
  translations: {
    roomType: string;
    bookingNote: string;
  };
  _id: string;
}

type Booking = {
  _id: string;
  status: "pending" | "approved" | "cancelled" | "in_progress" | string;
  renter: Renter | string;
  leaser: {
    name : string
  };
  marketplaceListingId: string | null;
  noOfGuests?: number;
  roomType?: string;
  phone?: string;
  language: string;
  languages?: {
    locale: string;
    translations: {
      roomType: string;
      bookingNote: string;
    };
    _id: string;
  }[];
  dates: {
    checkIn: string;
    checkOut: string;
  };
  otp: string;
  isVerified: boolean;
  priceDetails: {
    price: number;
    adminFee: number;
    tax: number;
    securityDeposit?: number;
    totalPrice: number;
  };
  pricingMeta: {
    priceFromListing: number;
    unit: "hour" | "day" | "month";
    duration: number;
  };
  extraRequestCharges: {
    additionalCharges: number;
    totalPrice?: number;
  };
  bookingDates?: {
    handover?: string | null;
    returnDate?: string | null;
  };
  extensionCharges?: {
    adminFee: number;
    additionalCharges: number;
    totalPrice: number;
  };
  isExtend: boolean;
  extensions: BookingExtension[];
  reviews: unknown[];
  paymentStatus: string | null;
  actualReturnedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BookingExtension = {
  _id: string;
  name?: string;
  extensionDate?: string | null;
  handover?: string | null;
  returnDate?: string | null;
  priceDetails?: {
    price: number;
    adminFee: number;
    tax: number;
    securityDeposit?: number;
    totalPrice: number;
  };
  pricingMeta?: {
    priceFromListing: number;
    unit: "hour" | "day" | "month";
    duration: number;
  };
  extraRequestCharges?: {
    additionalCharges: number;
    totalPrice?: number;
  };
  status?: string | null;
};

type Ticket = {
  _id: string;
  booking: Booking;
  user: User;
  rentalText: string;
  issueType: string;
  additionalFees: number;
  attachments: any[]; // If you have a defined attachment structure, replace 'any'
  damagedCharges: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type CommonStatus = "pending" | "approved" | "rejected";

interface RefundRequest {
  _id: string;
  booking: {
    marketplaceListingId: {
      name: string;
    };
    priceDetails: {
      securityDeposit: number;
      adminFee: number;
      platformFee: number;
      tax: number;
    };
  };
  user: {
    name: string;
  };
  createdAt: string;
  totalRefundAmount: number;
  status: CommonStatus;
}

interface Faq {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

interface Contact {
  _id: string;
  phone: string;
  email: string;
  address: string;
  order: number;
}

interface Query {
  _id: string;
  user: User;
  title: string;
  status: string;
  createdAt?: string;
}

interface Contact {
  _id: string;
  phone: string;
  email: string;
  address: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface Message {
  _id: string;
  chatId: string;
  sender: User;
  receiver: User;
  text: string;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

interface Chat {
  _id: string;
  participants: User[]; // usually 2 in 1-on-1 chat
  lastMessage?: Message;
  unreadCount?: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Field {
  _id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  isMultiple: boolean;
  options: string[];
  order: number;
  tooltip: string;
  visible: boolean;
  defaultValue: string;
  readonly: boolean;
  min: number;
  max: number;
  language: string;
  languages: string[];
  validation: {
    required: boolean;
    pattern: string;
    error: string;
    min: number;
    max: number;
  };
  isFixed: boolean;
  conditional?: {
    dependsOn: string;
    value: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Ticket {
  _id: string;
  user: User | null;
  title: string;
  status: "pending" | "inProgress" | "resolved";
  createdAt: string;
  updatedAt: string;
}

interface TicketList {
  _id: string;
  title: string;
  status: string;
}

type Ratings = {
  count: number;
  average: number;
};

interface RentalListing {
  _id: string;
  name: string;
  subtitle?: string;
  description?: string;
  price: number;
  images: string[];
  rentalImages: string[];
  address: string;
  leaserDocuments: string[];
  isActive: boolean;
  language: string;
  status: CommonStatus;
  zone: Zone;
  ratings: Ratings;
  leaser: User;
  renter: User;
  subCategory: SubCategory;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalNormalUsers: number;
  totalLeasers: number;
  totalMarketplaceListings: number;
  totalCategories: number;
  totalZones: number;
  bookingCount: number;
  totalEarning: number;
  pendingDocumentUsers: number;
}

type Trend = "up" | "down";

interface Change {
  value: number | string;
  trend: Trend;
}

interface UsersRecord {
  value: string;
  totalUsers: string;
}

interface EarningsRecord {
  value: string;
  totalEarning: string;
}

interface UsersChartRecord {
  change: Change;
  record: UsersRecord[];
}

interface EarningsChartRecord {
  change: Change;
  record: EarningsRecord[];
}

interface DashboardChart {
  users: UsersChartRecord;
  earnings: EarningsChartRecord;
}

type FilterOption = "week" | "month" | "year";

type IndicatorLabel =
  | "Total Revenue"
  | "Platform Commission"
  | "Owners Payouts"
  | "Refund Issued";

interface PerformanceIndicator {
  label: IndicatorLabel;
  value: number | string;
  change: Change;
}

// Chart Data
interface ChartRecord {
  value: string;
  amount: number;
}

interface Chart {
  record: ChartRecord[];
}

interface AnalyticsCharts {
  totalRevenue: Chart;
  platformCommission: Chart;
  ownersPayouts: Chart;
  refundIssued: Chart;
}

// Final Response
interface AnalyticsData {
  filter: FilterOption;
  performanceIndicators: PerformanceIndicator[];
  charts: AnalyticsCharts;
}

type AnalyticsResponse = ApiResponse<AnalyticsData>;

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: "active" | "blocked";
  role: string;
  allowAccess: EmployeeRole;
  images: string[];
  profileImage: string;
  address: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  access: string;
  operations: string[];
}

interface EmployeeRole {
  _id?: string;
  name: string;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

interface Message {
  _id: string;
  chatId: string;
  sender: User;
  receiver: User;
  text: string;
  attachments: string[];
  seen: boolean;
  deletedBy: string[];
  status: "sent" | "delivered" | "read";
  createdAt: string;
  updatedAt: string;
}

interface Chat {
  _id: string;
  participants: User[];
  createdAt: string;
  updatedAt: string;
  lastMessage: Message;
  unreadCount: number;
}

interface SendMessageData {
  chatId: string;
  receiver: string;
  text: string;
}

interface DropdownValue {
  _id?: string;
  name: string;
  value: string;
  hasExpiry: boolean;
  autoApproval: boolean;
}

interface Dropdown {
  _id: string;
  name: string;
  values: DropdownValue[];
}

interface ApiSuccessList<T> {
  success: true;
  pagination: Pagination;
  data: T[];
}

interface ApiSuccessItem<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  message: string;
}

interface ListDropdownsQuery {
  name?: string;
  page?: number;
  limit?: number;
}

interface Transaction {
  _id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  status: "pending" | "succeeded" | "failed";
  source: string;
  paymentIntentId: string;
  createdAt: string;
  requestedAt: string;
  __v: number;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string | Date;
  isRead: boolean;
  data: NotificationData;
}

interface SeasonalGraphWeek {
  week: string;
  totalBookings: number;
}

interface SeasonalGraphMonth {
  month: string;
  monthNumber: number;
  totalBookings: number;
  weeks: SeasonalGraphWeek[];
}

type ListDropdownsResponse = ApiSuccessList<Dropdown>;
type GetDropdownByIdResponse = ApiSuccessItem<Dropdown>;
type GetDropdownByNameResponse = ApiSuccessItem<Dropdown>;
