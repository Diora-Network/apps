// Copyright 2017-2022 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppProps } from '@polkadot/react-components/types';
import type { Option, StorageKey, u32 } from '@polkadot/types';
import type { Perbill } from '@polkadot/types/interfaces/runtime';
import type { CandidateState, ParachainStakingCandidateMetadata, ParachainStakingDelegations, ParachainStakingInflationInflationInfo, ParachainStakingParachainBondConfig, ParachainStakingRoundInfo, ParachainStakingSetOrderedSetBond } from './types';

import React, { useEffect, useMemo, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Tabs } from '@polkadot/react-components';
import { useApi, useBestNumber, useCall } from '@polkadot/react-hooks';
import { BN } from '@polkadot/util';

import { useTranslation } from '../translate';
import CandidatesList from './CandidatesList';
import Summary from './Summary';
import UserDelegations from './UserDelegations';

function ParachainStakingApp ({ basePath, className = '' }: AppProps): React.ReactElement<AppProps> {
  const { api } = useApi();
  const { t } = useTranslation();

  // summary info
  const roundInfo = useCall<ParachainStakingRoundInfo>(api.query.parachainStaking.round);
  const totalSelected = useCall<u32>(api.query.parachainStaking.totalSelected)?.toNumber();
  const totalSelectedStaked = useCall<BN>(api.query.parachainStaking.staked, [roundInfo?.current]);
  const inflation = useCall<ParachainStakingInflationInflationInfo>(api.query.parachainStaking.inflationConfig);
  const inflationPrct = inflation?.annual.ideal.toHuman();
  const parachainBondInfo = useCall<ParachainStakingParachainBondConfig>(api.query.parachainStaking.parachainBondInfo);
  const parachainBondInfoPrct = parachainBondInfo?.percent.toHuman();
  const bestNumberFinalized = useBestNumber();
  const collatorCommission = useCall<Perbill>(api.query.parachainStaking.collatorCommission);
  // Fetch all candidates states using entries
  const allCandidates = useCall<[StorageKey, Option<ParachainStakingCandidateMetadata>][]>((api.query.parachainStaking.candidateInfo).entries, []);
  const allCandidatesTopDelegations = useCall<[StorageKey, Option<ParachainStakingDelegations>][]>((api.query.parachainStaking.topDelegations).entries, []);
  const allCandidatesBottomDelegations = useCall<[StorageKey, Option<ParachainStakingDelegations>][]>((api.query.parachainStaking.bottomDelegations).entries, []);
  // Sort them and extract delegations numbers
  const [allCandidatesSorted, setAllCandidatesSorted] = useState<CandidateState[]>([]);
  const [activeDelegatorsCount, setActiveDelegatorsCount] = useState(-1);
  const [allDelegatorsCount, setAllDelegatorsCount] = useState(-1);

  // list info
  const candidatePool = useCall<ParachainStakingSetOrderedSetBond>(api.query.parachainStaking.candidatePool);
  const selectedCandidates = useCall<string[]>(api.query.parachainStaking.selectedCandidates);

  useEffect(() => {
    let _allDelegatorCount = 0;
    let _activeDelegatorCount = 0;

    if (!allCandidates || !allCandidatesTopDelegations || !allCandidatesBottomDelegations || !selectedCandidates) {
      return;
    }

    // unwrap output
    const sorted = allCandidates.map(([storageKey, candidateInfoRaw], i) => {
      const topDelegations = allCandidatesTopDelegations[i][1].unwrap();
      const bottomDelegations = allCandidatesBottomDelegations[i][1].unwrap();
      const candidateInfo = candidateInfoRaw.unwrap();
      const candidateAddress = (storageKey.toHuman() as string[])[0];

      // extract relevant nominator stats
      if (selectedCandidates.includes(candidateAddress)) {
        _activeDelegatorCount += candidateInfo.delegationCount.toNumber();
      }

      _allDelegatorCount += candidateInfo.delegationCount.toNumber();

      return {
        bottomDelegations: bottomDelegations.delegations,
        id: candidateAddress,
        topDelegations: topDelegations.delegations,
        totalBacking: candidateInfo.bond.add(topDelegations.total).add(bottomDelegations.total),
        ...candidateInfo
      } as CandidateState;
    });

    // sort by total staked
    sorted.sort((a, b) => {
      return a.totalCounted.lt(b.totalCounted) ? 1 : -1;
    });
    setAllCandidatesSorted(sorted);
    setActiveDelegatorsCount(_activeDelegatorCount);
    setAllDelegatorsCount(_allDelegatorCount);
  }, [allCandidates, selectedCandidates, allCandidatesTopDelegations, allCandidatesBottomDelegations]);

  const items = useMemo(() => [
    {
      isRoot: true,
      name: 'overview',
      text: t<string>('Overview')
    },
    {
      name: 'delegations',
      text: t<string>('Voting/Staking')
    }
  ]
  , [t]);

  return (
    <main className={`staking--App ${className}`}>
      <Tabs
        basePath={basePath}
        items={items}
      />
      <Switch>
        <Route path={`${basePath}/delegations`}>
          <UserDelegations
            roundInfo={roundInfo}
          />
        </Route>
        <Route path={`${basePath}`}>
          <Summary
            bestNumberFinalized={bestNumberFinalized}
            roundInfo={roundInfo}
            stakingInfo={{
              activeDelegatorsCount,
              allDelegatorsCount,
              collatorCommission: collatorCommission?.toHuman(),
              inflationPrct,
              parachainBondInfoPrct,
              selectedCollatorCount: selectedCandidates?.length,
              totalCollatorCount: candidatePool?.length,
              totalSelected,
              totalSelectedStaked
            }}
          />
          <CandidatesList
            allCandidatesSorted={allCandidatesSorted}
          />
        </Route>
      </Switch>
    </main>
  );
}

export const ParachainStakingPanel = React.memo(ParachainStakingApp);
