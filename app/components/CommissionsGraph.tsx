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
import { CommissionHistory } from "~/data/types";

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

interface CommissionsGraphProps {
  commisionHistory: CommissionHistory[]
}

export const CommissionsGraph: React.FC<CommissionsGraphProps> = ({ commisionHistory }) => {
  const labels = commisionHistory.map((history) => history.era);

  const data = {
    labels,
    datasets: [
      {
        label: "Commission History",
        data: commisionHistory.map((data) => data.commission),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <Line options={options} data={data} />
  );
};
