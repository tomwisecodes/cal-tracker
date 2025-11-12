"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import FoodInput from "../components/FoodInput";
import TodaysSummary from "../components/TodaysSummary";
import EntryHistory from "../components/EntryHistory";
import StatsChart from "../components/StatsChart";
import WeightTracker from "../components/WeightTracker";
import PooDiary from "../components/PooDiary";

type TabType = "calories" | "weight" | "poo" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("calories");

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "calories" && (
        <>
          <TodaysSummary />
          <FoodInput />
          <StatsChart />
          <EntryHistory />
        </>
      )}

      {activeTab === "weight" && (
        <>
          <WeightTracker />
        </>
      )}

      {activeTab === "poo" && (
        <>
          <PooDiary />
        </>
      )}
    </Layout>
  );
}
