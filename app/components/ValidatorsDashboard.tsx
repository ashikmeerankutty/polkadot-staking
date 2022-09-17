/** @jsx jsx */
import { useRankingData } from "~/hooks/useRankingData";
import { Layout, Modal, Progress } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { css, jsx } from "@emotion/react";
import {
  selectedAccountIdAtom,
  showCommissionChartAtom,
  showRewardsChartAtom,
  toDOT,
  ValidatorsTable,
} from "./ValidatorsTable";
import BigNumber from "bignumber.js";
import { useAtom } from "jotai";
import { RewardsGraph } from "./RewardsGraph";
import { CommissionsGraph } from "./CommissionsGraph";

const headerStyle = css`
  display: flex;
  alignitems: center;
  justify-content: center;
  padding: 30px 0px;
  h3 {
    font-weight: normal;
    color: #080b2d;
    font-size: 32px;
    letter-spacing: 1px;
  }
`;

const headerTitleStyle = css`
  text-align: center;
`;

const containerStyle = css`
  padding: 0 15px;
  display: flex;
  align-items: center;
  margin: 0 auto;
  flex-direction: column;
  height: 100%;
  @media (min-width: 1200px) {
    max-width: 1140px;
  }
  padding-bottom: 50px;
`;

const statsStyle = css`
  padding: 0 15px;
  box-shadow: rgb(255 255 255 / 30%) 0px -10px 15px 0px,
    rgb(0 0 0 / 7%) 0px 30px 60px 0px;
  margin-bottom: 50px;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 30px 60px;
  h3 {
    font-size: 14px;
    color: rgb(72, 72, 72);
  }
  span {
    font-size: 36px;
    font-weight: 600;
    letter-spacing: -0.3px;
    color: #080b2d;
  }
  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid rgb(210, 210, 210);
    &:last-child {
      border: none;
    }
  }
`;

export function ValidatorsDashboard() {
  const { rankingData, loading, info } = useRankingData();

  const avgCommission =
    rankingData.reduce((acc, curr) => {
      return acc + curr.commission;
    }, 0) / rankingData.length;

  const avgRating =
    rankingData.reduce((acc, curr) => {
      return acc + curr.totalRating;
    }, 0) / rankingData.length;

  const totalRewarded =
    rankingData
      .reduce((acc, curr) => {
        return BigNumber.sum(acc, curr.averageRewarded);
      }, new BigNumber(0));

  const totalRewardedDot = toDOT(totalRewarded, 2);

  const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountIdAtom);
  const [showRewards, setShowRewards] = useAtom(showRewardsChartAtom);
  const [showCommission, setShowCommission] = useAtom(showCommissionChartAtom);

  const selectedAccountInfo: any = selectedAccount
    ? rankingData.find((data) => data.accountId === selectedAccount)
    : {};

  return (
    <div css={containerStyle}>
      <div>
        <div css={headerStyle} className="header">
          <h3 css={headerTitleStyle}>
            <strong>POLKSTAKES</strong> Ranking
          </h3>
        </div>
        <div css={statsStyle}>
          <div>
            <h3>Validators</h3>
            <span>{rankingData.length}</span>
          </div>
          <div>
            <h3>Avg Commission</h3>
            <span>{avgCommission ? avgCommission.toFixed(2) : 0}%</span>
          </div>
          <div>
            <h3>Avg Polkstakes Rating</h3>
            <span>{avgRating ? avgRating.toFixed(2): 0}</span>
          </div>
          <div>
            <h3>Total Rewarded</h3>
            <span>{totalRewardedDot}</span>
          </div>
        </div>
        {loading && (
          <div>
            {info.text}
            <Progress
              size="small"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={info.progress}
            />
          </div>
        )}
        {selectedAccount && (
          <Modal width={600} visible={showRewards} footer={null} onCancel={() => {
            setShowRewards(false);
            setSelectedAccount('')
          }}>
            <RewardsGraph rewarded={selectedAccountInfo.rewarded || []} />
          </Modal>
        )}
        {selectedAccount && (
          <Modal width={600} visible={showCommission} footer={null} onCancel={() => {
            setShowCommission(false);
            setSelectedAccount('')
          }}>
            <CommissionsGraph commisionHistory={selectedAccountInfo.commissionHistory || []} />
          </Modal>
        )}
        <div>
          <ValidatorsTable loading={loading} rankingData={rankingData} />
        </div>
      </div>
    </div>
  );
}
