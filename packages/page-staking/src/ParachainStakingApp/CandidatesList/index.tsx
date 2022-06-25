// Copyright 2017-2022 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useRef } from 'react';

import { Table } from '@polkadot/react-components';
import { useLoadingDelay } from '@polkadot/react-hooks';

import { useTranslation } from '../../translate';
import { CandidateState } from '../types';
import CandidateDetails from './CandidateDetails';

interface Props {
  allCandidatesSorted: CandidateState[]
}

function CandidatesList ({ allCandidatesSorted }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const isLoading = useLoadingDelay();

  const headerRef = useRef(
    [
      [t('Masternode candidates'), 'start'],
      [t('counted stake'), 'media--1100'],
      [t('total ammount staked'), 'media--1100'],
      [t('# of voters'), 'media--1100'],
      [t('own stake'), 'media--1100'],
      [t('min contribution'), 'media--1100'],
      [t('action'), 'media--1100']
    ]
  );

  return (
    <Table
      header={headerRef.current}
    >
      {!isLoading && (
        allCandidatesSorted.map((collatorInfo): React.ReactNode => (
          <CandidateDetails
            candidateState={collatorInfo}
            key={collatorInfo.id}
          />
        )))}
    </Table>
  );
}

export default React.memo(CandidatesList);
