import Layout from "../components/Layout";
import FoodInput from "../components/FoodInput";
import TodaysSummary from "../components/TodaysSummary";
import EntryHistory from "../components/EntryHistory";
import SettingsModal from "../components/SettingsModal";
import StatsChart from "../components/StatsChart";

export default function Home() {
  return (
    <Layout>
      <TodaysSummary />
      <FoodInput />
      <StatsChart />
      <EntryHistory />
      <SettingsModal />
    </Layout>
  );
}
