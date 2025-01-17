// Copyright 2017-2022 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TFunction } from 'i18next';
import type { Route } from './types';

import { ParachainStakingPanel } from '@polkadot/app-staking/ParachainStakingApp';

export default function create (t: TFunction): Route {
  return {
    Component: ParachainStakingPanel,
    display: {
      needsApi: [
        ['tx.parachainStaking.joinCandidates']
      ]
    },
    group: 'network',
    icon: 'certificate',
    name: 'parachainStaking',
    text: t('nav.parachainStaking', 'Staking', { ns: 'apps-routing' })
  };
}
