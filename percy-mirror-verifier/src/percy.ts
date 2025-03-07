/**
 * Copyright 2022 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {request} from 'undici';

export type PercySnapshot = {
  type: 'snapshots';
  id: string;
  attributes: {
    name: string;
    fingerprint: string | null;
    'review-state':
      | 'approved'
      | 'unreviewed'
      | 'changes_requested'
      | 'failed'
      | null;
  };
};

export type PercySnapshotsResponse = {
  data: PercySnapshot[];
};

export type PercySnapshotMap = Map<string, PercySnapshot>;

export async function getSnapshots(buildId: number): Promise<PercySnapshotMap> {
  const {statusCode, body} = await request(
    `https://percy.io/api/v1/builds/${buildId}/snapshots`,
    {
      method: 'GET',
      headers: {Authorization: `Token token=${process.env.PERCY_TOKEN}`},
    }
  );

  if (statusCode != 200) {
    console.error('Response from Percy was:', statusCode, await body.json());
    throw new Error(`Failed to fetch snapshots for build #${buildId}`);
  }

  const response: PercySnapshotsResponse = await body.json();
  return new Map(
    response.data.map(percySnapshot => [
      percySnapshot.attributes.name,
      percySnapshot,
    ])
  );
}
