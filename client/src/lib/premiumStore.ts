/*
 * Fashion Runway Worlds — premium commerce boundary.
 * Keep the web build safe: Google Play Billing is only invoked on native Android.
 */
import { Capacitor } from "@capacitor/core";
import { NativePurchases, PURCHASE_TYPE } from "@capgo/native-purchases";

export const PREMIUM_PRODUCT_ID = "frw_premium_unlock";

export type PremiumProduct = {
  title: string;
  description: string;
  priceString: string;
};

export type PremiumStoreState = {
  supported: boolean;
  owned: boolean;
  product?: PremiumProduct;
  loading: boolean;
  error?: string;
};

const isAndroidNative = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

export async function loadPremiumState(): Promise<PremiumStoreState> {
  if (!isAndroidNative()) {
    return { supported: false, owned: localStorage.getItem("frw-premium-preview") === "true", loading: false };
  }
  try {
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) return { supported: false, owned: false, loading: false, error: "Google Play課金に対応していません。" };
    const [{ products }, { purchases }] = await Promise.all([
      NativePurchases.getProducts({ productIdentifiers: [PREMIUM_PRODUCT_ID], productType: PURCHASE_TYPE.INAPP }),
      NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP, onlyCurrentEntitlements: true }),
    ]);
    const product = products.find((item) => item.identifier === PREMIUM_PRODUCT_ID);
    const owned = purchases.some((item) => item.productIdentifier === PREMIUM_PRODUCT_ID);
    return {
      supported: true,
      owned,
      product: product ? { title: product.title, description: product.description, priceString: product.priceString } : undefined,
      loading: false,
      error: product ? undefined : "Play Consoleの商品がまだ有効化されていません。",
    };
  } catch (error) {
    console.warn("Premium store unavailable", error);
    return { supported: true, owned: false, loading: false, error: "商品情報を取得できませんでした。Playストア版の内部テストで確認してください。" };
  }
}

export async function purchasePremium(): Promise<{ owned: boolean; message?: string }> {
  if (!isAndroidNative()) return { owned: false, message: "購入はGoogle Play版Androidアプリで利用できます。" };
  try {
    const transaction = await NativePurchases.purchaseProduct({
      productIdentifier: PREMIUM_PRODUCT_ID,
      productType: PURCHASE_TYPE.INAPP,
      isConsumable: false,
      autoAcknowledgePurchases: true,
    });
    return transaction.productIdentifier === PREMIUM_PRODUCT_ID
      ? { owned: true }
      : { owned: false, message: "購入結果を確認できませんでした。" };
  } catch (error) {
    console.warn("Premium purchase cancelled or failed", error);
    return { owned: false, message: "購入は完了しませんでした。料金は請求されていません。" };
  }
}

export async function restorePremium(): Promise<boolean> {
  if (!isAndroidNative()) return localStorage.getItem("frw-premium-preview") === "true";
  try {
    await NativePurchases.restorePurchases();
    const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP, onlyCurrentEntitlements: true });
    return purchases.some((item) => item.productIdentifier === PREMIUM_PRODUCT_ID);
  } catch (error) {
    console.warn("Premium restore failed", error);
    return false;
  }
}
