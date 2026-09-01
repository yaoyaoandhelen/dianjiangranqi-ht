import { createRouter, createWebHashHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ThirdPartyConfirmationView from "@/views/ThirdPartyConfirmationView.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/manual-confirmation",
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
      meta: { title: "天然气全链条安全智管智能体" },
    },
    {
      path: "/manual-confirmation",
      name: "manual-confirmation",
      component: ThirdPartyConfirmationView,
      meta: { title: "第三方施工人工确认平台" },
    },
  ],
});

export default router;
