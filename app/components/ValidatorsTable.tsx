/** @jsx jsx */
import { Table, Tag, Space } from "antd";
import BigNumber from "bignumber.js";
import { RankingData } from "~/data/types";
import { LineChartOutlined } from "@ant-design/icons";
import { atom, useAtom } from "jotai";
import { css, jsx } from "@emotion/react";
import { Fragment } from "react";

export const selectedAccountIdAtom = atom<string>("");
export const showCommissionChartAtom = atom<boolean>(false);
export const showRewardsChartAtom = atom<boolean>(false);

const subTextStyles = css`
  color: #696969;
  display: block;
  margin-bottom: 100px;
`;

const toMDOT = (value: BigNumber) => {
  return `${new BigNumber(value)
    .dividedBy(new BigNumber(10000000000000000))
    .toFixed(4)}MDOT`;
};

export const toDOT = (value: BigNumber, decimals: number = 4) => {
  return `${new BigNumber(value)
    .dividedBy(new BigNumber(10000000000))
    .toFixed(decimals)}DOT`;
};

const columns = [
  {
    title: "#",
    dataIndex: "rank",
    key: "rank",
    width: 100,
    sorter: (a: { rank: number }, b: { rank: number }) => a.rank - b.rank,
  },
  {
    title: "Name / Account Id",
    dataIndex: "name",
    key: "name",
    width: 200,
    ellipsis: true,
  },
  {
    title: "Commission",
    dataIndex: "commission",
    key: "commission",
    render: (
      text: any,
      record: any
    ) => {
      const [, setSelectedAccount] = useAtom(selectedAccountIdAtom);
      const [, setShowCommssion] = useAtom(showCommissionChartAtom);
      return (
        <div>
          {text}{" "}
          <LineChartOutlined
            onClick={() => {
              setSelectedAccount(record.id);
              setShowCommssion(true);
            }}
          />
        </div>
      );
    },
  },
  {
    title: "Polkstakes Rating",
    dataIndex: "totalRating",
    key: "totalRating",
  },
  {
    title: "Total Stake",
    dataIndex: "totalStake",
    key: "totalStake",
  },
  {
    title: "Average Rewarded",
    dataIndex: "averageRewarded",
    key: "averegeRewarded",
    width: 200,
    sorter: (a: { averageRewardedValue: BigNumber }, b: { averageRewardedValue: BigNumber }) => a.averageRewardedValue.lt(b.averageRewardedValue) ? 1 : -1,
    render: (
      text: any,
      record: any
    ) => {
      const [, setSelectedAccount] = useAtom(selectedAccountIdAtom);
      const [, setShowRewards] = useAtom(showRewardsChartAtom);
      return (
        <div>
          {text}{" "}
          <LineChartOutlined
            onClick={() => {
              setSelectedAccount(record.id);
              setShowRewards(true);
            }}
          />
        </div>
      );
    },
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (tags: string[]) => (
      <div>
        {tags.map((tag) => {
          let color = "geekblue";
          if (tag === "Verified Identity") {
            color = "green";
          }
          if (tag === "Council Backing") {
            color = "geekblue";
          }
          if (tag === "Active In Governance") {
            color = "vlocano";
          }
          if (tag === "Part of cluster") {
            color = "gold-6";
          }
          if (tag === "Slashed") {
            color = "red-6";
          }
          return (
            <Tag className="table__tag" color={color} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          );
        })}
      </div>
    ),
  },
];

interface ValidatorsTableProps {
  rankingData: RankingData[];
  loading: boolean;
}

const getTags = (data: RankingData) => {
  const tags = [];
  if (data.verifiedIdentity) {
    tags.push("Verified Identity");
  }
  if (data.councilBacking) {
    tags.push("Council Backing");
  }
  if (data.activeInGovernance) {
    tags.push("Active In Governance");
  }
  if (data.partOfCluster) {
    tags.push("Part of cluster");
  }
  if (data.slashed) {
    tags.push("Slashed");
  }
  return tags;
};

export const ValidatorsTable: React.FC<ValidatorsTableProps> = ({
  rankingData = [],
  loading,
}) => {
  const tableData = rankingData.map((data, index) => {
    return {
      key: data.accountId,
      id: data.accountId,
      rank: index + 1,
      name: data.name || data.accountId.toString(),
      commission: `${data.commission.toFixed(2).toString()}%`,
      totalRating: data.totalRating.toString(),
      totalStake: toMDOT(data.totalStake),
      othersStake: toMDOT(data.otherStake),
      ownStake: toDOT(data.selfStake),
      activeEras: data.activeEras,
      tags: getTags(data),
      averageRewarded: toDOT(data.averageRewarded),
      averageRewardedValue: data.averageRewarded,
    };
  });

  return (
    <Fragment>
    <Table
      tableLayout="fixed"
      loading={loading}
      columns={columns}
      dataSource={tableData}
    />
    <span css={subTextStyles}>* Polkstakes ranking is based on last 5000 staking rewards. It's calculated based on previous era performance, commissions, payout, staking rewards, etc.</span>
    </Fragment>
  );
};
