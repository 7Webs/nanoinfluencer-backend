import { Shop } from "src/models/shop/entities/shop.entity";

// src/utils/approved-shop-helper.ts
export function isShopApproved(shop: Shop, dealCheck: boolean): boolean {
  
  if (shop.approved) {
    
    if(shop.subscriptionState === 'active'){
        const currentDealcount = 1;
        const subscriptionPlanSelected = shop.activeSubscriptionPlan;

        if (dealCheck) {
          if (currentDealcount < subscriptionPlanSelected.maxDeals) {
            return true;
          }else{
            return false;
          }
        }else{
          return true;
        }
    }else{
      return false;
    }
  }else{
    return false;
  }
}
