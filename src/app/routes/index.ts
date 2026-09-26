import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.router";
import { AdminRoutes } from "../module/admin/admin.route";
import { RagRoutes } from "../module/rag/rag.route";
import { SiteSettingRoutes } from "../module/site-setting/siteSetting.route";
import { NotificationRoutes } from "../module/notification/notification.route";
import { SmsSettingRoutes } from "../module/sms-setting/smsSetting.route";
import { PageContentRoutes } from "../module/page-content/pageContent.route";
import { FaqRoutes } from "../module/faq/faq.route";
import { BlogRoutes } from "../module/blog/blog.route";
import { LeadRoutes } from "../module/lead/lead.route";
import { ClientLogoRoutes } from "../module/client-logo/clientLogo.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/admin", AdminRoutes);
router.use("/rag", RagRoutes);
router.use("/site-settings", SiteSettingRoutes);
router.use("/notifications", NotificationRoutes);
router.use("/sms-settings", SmsSettingRoutes);
router.use("/pages", PageContentRoutes);
router.use("/faqs", FaqRoutes);
router.use("/blogs", BlogRoutes);
router.use("/leads", LeadRoutes);
router.use("/client-logos", ClientLogoRoutes);

export const IndexRoutes = router;
