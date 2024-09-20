/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Circular } from '../circulars/circulars.lib'

/* Data structure in DynamoDB */
export interface Synonym {
  eventId: string
  synonymId: string
}

/* Layout of materialized view in OpenSearch */
export interface SynonymGroup {
  synonymId: string
  eventIds: string[]
}

export interface SynonymGroupWithMembers {
  group: SynonymGroup
  members: Circular[]
}
export interface SynonymValidityCheck {
  eventId: string
  count: number
}

export interface PutSynonymResponse {
  success: boolean
  synonymId: null | string
  error: null | string
}
