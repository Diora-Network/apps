// Copyright 2017-2022 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { InputAddress, Modal, TxButton } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

import { useTranslation } from '../../translate';

interface Props {
  className?: string;
  onClose: () => void;
  delegatorAddress: string | null;
  candidateAddress: string
}

function ExecuteActionModal ({ candidateAddress, className = '', delegatorAddress, onClose }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();

  return (
    <Modal
      className='app--accounts-Modal'
      header={t<string>('Execute request')}
      onClose={onClose}
      size='large'
    >
      <Modal.Content>
        <div className={className}>
          <Modal.Columns>
            <InputAddress
              defaultValue={delegatorAddress}
              help={t<string>('The account that will execute the request.')}
              isDisabled
              label={t<string>('staking account')}
              type='account'
            />
          </Modal.Columns>
          <Modal.Columns hint={t<string>('This is the address of the masternoe candidate with a pending execution.')}>
            <InputAddress
              defaultValue={candidateAddress}
              help={t<string>('Staked masternode candidate')}
              isDisabled
              label={t<string>('masternode candidate')}
              type='allPlus'
            />
          </Modal.Columns>

        </div>
      </Modal.Content>
      <Modal.Actions>
        <TxButton
          accountId={delegatorAddress}
          icon='paper-plane'
          label={t<string>('Execute action')}
          onStart={onClose}
          params={
            [delegatorAddress, candidateAddress]
          }
          tx={
            api.tx.parachainStaking.executeDelegationRequest
          }
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(ExecuteActionModal);
