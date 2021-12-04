import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { SPSP } from "./ABIs/SPSP";
import "./styles.css";
import "react-loading-skeleton/dist/skeleton.css";

const provider = new ethers.providers.CloudflareProvider();
const poolsDataURL = "https://api.paraswap.io/staking/pools/1";

const poolsAddresses = {
  0: "0x55A68016910A7Bcb0ed63775437e04d2bB70D570",
  1: "0xea02DF45f56A690071022c45c95c46E7F61d3eAb",
  2: "0x6b1D394Ca67fDB9C90BBd26FE692DdA4F4f53ECD",
  3: "0x37b1E4590638A266591a9C11d6f945fe7A1adAA7",
  4: "0x03c1eaff32c4bd67ee750ab75ce85ba7e5aa65fb",
  5: "0xC3359DbdD579A3538Ea49669002e8E8eeA191433"
};

export default function App() {
  const [address, setAddress] = useState();
  const [selectedPool, setSelectedPool] = useState(0);
  const [poolsData, setPoolsData] = useState(null);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [APY, setAPY] = useState(0);
  const [dailyRewards, setDailyRewards] = useState(0);
  const [epochRewards, setEpochRewards] = useState(0);
  const [epochAPR, setEpochAPR] = useState(0);
  const [loading, setLoading] = useState(false);

  let contract = new ethers.Contract(
    poolsAddresses[selectedPool],
    SPSP,
    provider
  );

  useEffect(() => {
    async function getRewards() {
      setLoading(true);
      let _stakedBalance;

      try {
        let response = await contract.PSPBalance(address);
        _stakedBalance = ethers.utils.formatEther(response);
        setStakedBalance(ethers.utils.formatEther(response));
      } catch (e) {
        console.error(e);
        _stakedBalance = 0;
        setStakedBalance(0);
      }

      try {
        const response = await fetch(poolsDataURL);
        const json = await response.json();
        setPoolsData(json.pools); // all pools info

        let _APY = json.pools[selectedPool].APY.current;
        let _APR = ((_APY / 100 + 1) ** (1 / (365 / 14)) - 1) * (365 / 14);
        let _epochAPR = _APR / (365 / 14);
        let _epochRewards = ((_APR * _stakedBalance) / 365) * 14;
        let _dailyRewards = (_stakedBalance * _APR) / 365;

        setAPY(_APY);
        setEpochAPR(_epochAPR);
        setEpochRewards(_epochRewards);
        setDailyRewards(_dailyRewards);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }

    getRewards();
  }, [selectedPool, address]);

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handlePoolChange = (e) => {
    setSelectedPool(e.target.value);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>PSP STAKING REWARDS CALCULATOR</h1>
      </div>
      <div className="container">
        <div className="inputs">
          <input
            name="address"
            placeholder="Address or ENS"
            onChange={handleAddressChange}
            value={address}
          />
          <select id="pools" onChange={handlePoolChange}>
            <option value="0">ParaSwapPool1</option>
            <option value="1">ParaSwapPool3</option>
            <option value="2">ParaSwapPool4</option>
            <option value="3">ParaSwapPool7</option>
            <option value="4">ParaSwapPool8</option>
            <option value="5">ParaSwapPool9</option>
          </select>
        </div>
        <div className="output">
          <SkeletonTheme baseColor="#005ede" highlightColor="#1b2160">
            {loading ? (
              <Skeleton count={5} />
            ) : (
              <div>
                <p>
                  Staked:{" "}
                  {stakedBalance != null
                    ? Number(stakedBalance).toFixed(2)
                    : null}{" "}
                  <img src="https://paraswap.io/psp.svg" alt="PSP" />
                </p>

                <p>
                  Pool APY: {APY != null ? Number(APY).toFixed(2) + "%" : null}
                </p>
                <p>Pool APR: {(epochAPR * 100).toFixed(2)}%</p>
                <p>
                  Epoch rewards: {epochRewards.toFixed(2)}{" "}
                  <img src="https://paraswap.io/psp.svg" alt="PSP" />
                </p>
                <p>
                  Daily rewards: {dailyRewards.toFixed(2)}{" "}
                  <img src="https://paraswap.io/psp.svg" alt="PSP" />
                </p>
              </div>
            )}
          </SkeletonTheme>
        </div>
      </div>
    </div>
  );
}
