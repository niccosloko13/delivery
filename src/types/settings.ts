export type RestaurantStatus = "open" | "closed" | "busy";

export type DeliveryZone = {
  id: string;
  nameAr: string;
  fee: number;
  minimumOrder: number;
  estimatedMinMinutes: number;
  estimatedMaxMinutes: number;
  freeDeliveryAbove?: number;
  enabled: boolean;
};

export type PaymentMethodType =
  | "cash"
  | "card_on_delivery"
  | "instapay"
  | "mobile_wallet"
  | "meeza"
  | "fawry"
  | "online";

export type PaymentMethodConfig = {
  id: string;
  type: PaymentMethodType;
  nameAr: string;
  descriptionAr?: string;
  enabled: boolean;
  order: number;
  requiresProof: boolean;
  instructions?: string;
  config: Record<string, unknown>;
};

export type WalletConfig = {
  id: string;
  nameAr: string;
  operatorAr?: string;
  number?: string;
  accountHolder?: string;
  enabled: boolean;
  requiresProof: boolean;
  instructions?: string;
};

export type CouponType = "percent" | "fixed";

export type CouponConfig = {
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number;
  minimumOrder?: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
  usageLimit?: number;
  firstOrderOnly?: boolean;
  areas?: string[];
};

export type WhatsAppMessageTemplate = {
  title: string;
  intro: string;
  outro: string;
  includeEmojis: boolean;
  includePrices: boolean;
  includeNotes: boolean;
  includeLocation: boolean;
  includePayment: boolean;
  includeCustomerNumber: boolean;
  includeTime: boolean;
  includeCoupon: boolean;
  body: string;
};

export type RestaurantSettings = {
  nameAr: string;
  nameEn: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  area: string;
  city: string;
  openTime: string;
  closeTime: string;
  minDeliveryTime: number;
  maxDeliveryTime: number;
  currency: string;
  minimumOrder: number;
  deliveryFee: number;
  status: RestaurantStatus;
  acceptScheduledOrders: boolean;
  closedMessage: string;
  paymentMethods: PaymentMethodConfig[];
  wallets: WalletConfig[];
  zones: DeliveryZone[];
  coupons: CouponConfig[];
  checkoutMessage: WhatsAppMessageTemplate;
};

export type PublicRestaurantSettings = Pick<
  RestaurantSettings,
  | "nameAr"
  | "nameEn"
  | "description"
  | "phone"
  | "whatsapp"
  | "address"
  | "area"
  | "city"
  | "openTime"
  | "closeTime"
  | "minDeliveryTime"
  | "maxDeliveryTime"
  | "currency"
  | "minimumOrder"
  | "deliveryFee"
  | "status"
  | "acceptScheduledOrders"
  | "closedMessage"
  | "paymentMethods"
  | "wallets"
  | "zones"
  | "coupons"
  | "checkoutMessage"
>;

export type PrivatePaymentGatewaySettings = {
  gateway?: string;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  mode?: "test" | "production";
};
