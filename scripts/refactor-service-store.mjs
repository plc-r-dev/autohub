import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("apps/web");
const SKIP_DIRS = new Set(["node_modules", ".next", "lib/generated", "prisma/migrations"]);
const EXT = new Set([".ts", ".tsx", ".md", ".json"]);

const REPLACEMENTS = [
  ["MerchantOnboardingRequest", "ServiceStoreOnboardingRequest"],
  ["merchantOnboardingRequests", "serviceStoreOnboardingRequests"],
  ["merchantOnboardingRequest", "serviceStoreOnboardingRequest"],
  ["MerchantOnboarding", "ServiceStoreOnboarding"],
  ["MERCHANT_ACCESS_STATUS", "SERVICE_STORE_ACCESS_STATUS"],
  ["MerchantAccessStatus", "ServiceStoreAccessStatus"],
  ["MerchantAccessState", "ServiceStoreAccessState"],
  ["getMerchantAccessState", "getServiceStoreAccessState"],
  ["isApprovedMerchant", "isApprovedServiceStore"],
  ["isPendingMerchant", "isPendingServiceStore"],
  ["isMerchantUser", "isServiceStoreUser"],
  ["requireApprovedMerchantUser", "requireApprovedServiceStoreUser"],
  ["requireMerchantDomainUser", "requireServiceStoreDomainUser"],
  ["requireMerchantSession", "requireServiceStoreSession"],
  ["requireMerchantOnboardingContext", "requireServiceStoreOnboardingContext"],
  ["MerchantRequestActionState", "ServiceStoreRequestActionState"],
  ["approveMerchantOnboardingRequest", "approveServiceStoreOnboardingRequest"],
  ["rejectMerchantOnboardingRequest", "rejectServiceStoreOnboardingRequest"],
  ["approveMerchantClaim", "approveServiceStoreClaim"],
  ["rejectMerchantClaim", "rejectServiceStoreClaim"],
  ["searchMerchantsAction", "searchServiceStoresAction"],
  ["getMerchantDashboardMetrics", "getServiceStoreDashboardMetrics"],
  ["getMerchantBookingsPaginated", "getServiceStoreBookingsPaginated"],
  ["getMerchantBooking", "getServiceStoreBooking"],
  ["getMerchantBillingsPaginated", "getServiceStoreBillingsPaginated"],
  ["getMerchantBilling", "getServiceStoreBilling"],
  ["searchMerchantCustomersPaginated", "searchServiceStoreCustomersPaginated"],
  ["getMerchantCustomerDetail", "getServiceStoreCustomerDetail"],
  ["getMerchantVehicleDetail", "getServiceStoreVehicleDetail"],
  ["cancelBookingAsMerchant", "cancelBookingAsServiceStore"],
  ["MerchantStatus", "ServiceStoreStatus"],
  ["MerchantClaim", "ServiceStoreClaim"],
  ["merchantClaims", "serviceStoreClaims"],
  ["merchantClaim", "serviceStoreClaim"],
  ["MerchantMember", "ServiceStoreMember"],
  ["merchantMembers", "serviceStoreMembers"],
  ["merchantMember", "serviceStoreMember"],
  ["MerchantPortalShell", "ServiceStorePortalShell"],
  ["MerchantPublicLayout", "ServiceStorePublicLayout"],
  ["MerchantSidebarNav", "ServiceStoreSidebarNav"],
  ["MerchantMobileNav", "ServiceStoreMobileNav"],
  ["MerchantOnboardingForm", "ServiceStoreOnboardingForm"],
  ["MerchantProfileForm", "ServiceStoreProfileForm"],
  ["MerchantBookingActions", "ServiceStoreBookingActions"],
  ["MerchantPaymentSlipForm", "ServiceStorePaymentSlipForm"],
  ["MerchantSubmitBillingButton", "ServiceStoreSubmitBillingButton"],
  ["MerchantRequestActions", "ServiceStoreRequestActions"],
  ["MerchantRequestManagement", "ServiceStoreRequestManagement"],
  ["MerchantCard", "ServiceStoreCard"],
  ["MerchantButtonLink", "ServiceStoreButtonLink"],
  ["MerchantButton", "ServiceStoreButton"],
  ["MerchantFormField", "ServiceStoreFormField"],
  ["MerchantStatusBadge", "ServiceStoreStatusBadge"],
  ["merchantInputClassName", "serviceStoreInputClassName"],
  ["merchantSelectClassName", "serviceStoreSelectClassName"],
  ["merchantTextareaClassName", "serviceStoreTextareaClassName"],
  ["merchantLabelClassName", "serviceStoreLabelClassName"],
  ["merchantFormErrorClassName", "serviceStoreFormErrorClassName"],
  ["merchantTokens", "serviceStoreTokens"],
  ["merchantNav", "serviceStoreNav"],
  ["merchantProfileSchema", "serviceStoreProfileSchema"],
  ["updateMerchantProfile", "updateServiceStoreProfile"],
  ["sendMerchantApproved", "sendServiceStoreApproved"],
  ["isMerchantBookable", "isServiceStoreBookable"],
  ["getMerchantBookingFactsByBranchId", "getServiceStoreBookingFactsByBranchId"],
  ["listBrowseMerchantsPaginated", "listBrowseServiceStoresPaginated"],
  ["MarketplaceMerchantFacts", "MarketplaceServiceStoreFacts"],
  ["prisma.merchant", "prisma.serviceStore"],
  ["prisma.merchantClaim", "prisma.serviceStoreClaim"],
  ["prisma.merchantOnboardingRequest", "prisma.serviceStoreOnboardingRequest"],
  ["@/lib/merchant/", "@/lib/service-store/"],
  ["@/components/merchant/", "@/components/service-store/"],
  ["@/components/customer/merchant/", "@/components/customer/service-store/"],
  ["components/merchant/", "components/service-store/"],
  ["lib/merchant/", "lib/service-store/"],
  ["/merchant-requests", "/service-store-requests"],
  ["/merchant/", "/service-store/"],
  ['"/merchant"', '"/service-store"'],
  ["'/merchant'", "'/service-store'"],
  ["`/merchant", "`/service-store"],
  ["startsWith(\"/merchant\")", "startsWith(\"/service-store\")"],
  ["startsWith('/merchant')", "startsWith('/service-store')"],
  ["portal=\"merchant\"", "portal=\"service-store\""],
  ["PORTALS.merchant", "PORTALS.serviceStore"],
  ["merchant:", "serviceStore:"],
  ["merchantId", "serviceStoreId"],
  ["merchant.", "serviceStore."],
  [" merchant ", " serviceStore "],
  ["{ merchant", "{ serviceStore"],
  ["(merchant", "(serviceStore"],
  [", merchant", ", serviceStore"],
  ["Merchant", "ServiceStore"],
  ["merchant", "serviceStore"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (EXT.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function apply(content) {
  let out = content;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, "utf8");
  const updated = apply(original);
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changed++;
  }
}

// Also update docs at repo root
const docsRoot = path.resolve("docs");
if (fs.existsSync(docsRoot)) {
  for (const file of walk(docsRoot)) {
    const original = fs.readFileSync(file, "utf8");
    const updated = apply(original);
    if (updated !== original) {
      fs.writeFileSync(file, updated);
      changed++;
    }
  }
}

console.log(`Updated ${changed} files`);
