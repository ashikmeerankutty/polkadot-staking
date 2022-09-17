import BigNumber from "bignumber.js";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
  import { Line } from "react-chartjs-2";
  import { Rewarded } from "~/data/types";
import { toDOT } from "./ValidatorsTable";
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  
  export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };
  
  interface RewardsGraphProps {
    rewarded: Rewarded[]
  }
  
  export const RewardsGraph: React.FC<RewardsGraphProps> = ({ rewarded }) => {
    const labels = rewarded.map((reward) => new Date(reward.date).toLocaleString().split(',')[0]);
  
    const data = {
      labels,
      datasets: [
        {
          label: "Staking Rewards (DOT)",
          data: rewarded.map((reward) => reward.balance / 10000000000),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };
  
    return (
      <Line options={options} data={data} />
    );
  };
  