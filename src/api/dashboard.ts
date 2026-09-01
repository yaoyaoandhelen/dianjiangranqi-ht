import { dashboardData } from "@/mock/dashboard";

export async function fetchDashboardData() {
  return Promise.resolve(dashboardData);
}
