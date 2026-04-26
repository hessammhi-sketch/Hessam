import { HealthOsApp } from "@/components/health-os-app";
import { getDashboardData } from "@/lib/data";

export default async function HomePage() {
  const data = await getDashboardData();
  return <HealthOsApp data={data} />;
}
