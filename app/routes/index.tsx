import type { MetaFunction } from "remix";
import { ValidatorsDashboard } from "~/components/ValidatorsDashboard";


export let meta: MetaFunction = () => {
  return {
    title: "PolkStakes - Polkadot Staking Dashboard",
    description: "Polkadot Staking Dashboard"
  };
};

export default function Index() {
  return (
    <div className="remix__page">
      <ValidatorsDashboard />
    </div>
  );
}
