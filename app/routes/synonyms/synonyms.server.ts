/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'

import type { Synonym } from './synonyms.lib'

export async function getSynonym(synonymId: string) {
  const db = await tables()
  const result = await db.synonyms.get({ synonymId })

  return result as Synonym
}

// export async function searchSynonymsByEventId({
//   limit = 10,
//   page,
//   eventId,
// }: {
//   limit?: number
//   page: number
//   eventId?: string
// }): Promise<{
//   synonyms: Synonym[]
//   totalItems: number
//   totalPages: number
//   page: number
// }> {
//   const client = await getSearchClient()
//   const query: any = {
//     bool: {
//       should: [
//         {
//           match_all: {},
//         },
//       ],
//       minimum_should_match: 1,
//     },
//   }

//   if (eventId) {
//     query.bool.should.push({
//       match: {
//         eventId: {
//           query: eventId,
//           fuzziness: 'AUTO',
//         },
//       },
//     })
//   }

//   const {
//     body: {
//       hits: {
//         total: { value: totalItems },
//         hits,
//       },
//     },
//   } = await client.search({
//     index: 'synonyms',
//     from: page && limit && (page - 1) * limit,
//     size: limit,
//     body: {
//       query,
//     },
//   })
//   const totalPages: number = Math.ceil(totalItems / limit)
//   // const results = [] as Synonym[]
//   const results = hits.map(
//     ({
//       _source: body,
//     }: {
//       _source: Synonym
//       fields: { eventId: string; synonymId: string }
//     }) => {
//       return body
//     }
//   )
//   return {
//     synonyms: results as Synonym[],
//     totalItems,
//     totalPages,
//     page,
//   }
// }

export async function searchSynonymsByEventId({
  limit = 10,
  page,
  eventId,
}: {
  limit?: number
  page: number
  eventId?: string
}): Promise<{
  synonyms: Synonym[]
  totalItems: number
  totalPages: number
  page: number
}> {
  const client = await getSearchClient()
  const query: any = {
    bool: {
      should: [],
      minimum_should_match: 1,
    },
  }

  if (eventId) {
    query.bool.should.push({
      match: {
        eventIds: eventId,
      },
    })
  }

  const { body } = await client.search({
    index: 'synonyms',
    from: page && limit ? (page - 1) * limit : 0,
    size: limit,
    body: {
      query,
    },
  })

  const { total, hits } = body.hits
  const results = hits.map(({ _source }: { _source: Synonym }) => _source)
  const totalPages = Math.ceil(total.value / limit)

  return {
    synonyms: results,
    totalItems: total.value,
    totalPages,
    page,
  }
}

export async function putSynonyms({
  synonymId,
  synonyms,
}: {
  synonymId: string
  synonyms?: string[]
}) {
  const db = await tables()
  await db.synonyms.put({
    synonymId,
    eventId: synonyms,
  })
}

export async function deleteSynonyms(synonymId: string) {
  const db = await tables()
  await db.synonyms.delete({ synonymId })
}
