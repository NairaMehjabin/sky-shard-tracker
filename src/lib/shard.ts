import { DateTime, Duration } from 'luxon';
import type { Translation } from '../i18n';
import type { Override } from './remoteConfig';

const landOffset = Duration.fromObject({ minutes: 8, seconds: 40 });
const endOffset = Duration.fromObject({ hours: 4 });

const blackShardInterval = Duration.fromObject({ hours: 8 });
const redShardInterval = Duration.fromObject({ hours: 6 });

const realms = ['prairie', 'forest', 'valley', 'wasteland', 'vault'] as const;
type Areas = keyof Translation['skyMaps'];

interface ShardConfig {
  noShardWkDay: number[];
  offset: Duration;
  interval: Duration;
  maps: [Areas, Areas, Areas, Areas, Areas];
  defRewardAC?: number;
}

const shardsInfo = [
  {
    noShardWkDay: [6, 7], // Sat; Sun
    interval: blackShardInterval,
    offset: Duration.fromObject({ hours: 1, minutes: 50 }),
    maps: ['prairie.butterfly', 'forest.brook', 'valley.rink', 'wasteland.temple', 'vault.starlight'],
  },
  {
    noShardWkDay: [7, 1], // Sun; Mon
    interval: blackShardInterval,
    offset: Duration.fromObject({ hours: 2, minutes: 10 }),
    maps: ['prairie.village', 'forest.boneyard', 'valley.rink', 'wasteland.battlefield', 'vault.starlight'],
  },
  {
    noShardWkDay: [1, 2], // Mon; Tue
    interval: redShardInterval,
    offset: Duration.fromObject({ hours: 7, minutes: 40 }),
    maps: ['prairie.cave', 'forest.end', 'valley.dreams', 'wasteland.graveyard', 'vault.jelly'],
    defRewardAC: 2,
  },
  {
    noShardWkDay: [2, 3], // Tue; Wed
    interval: redShardInterval,
    offset: Duration.fromObject({ hours: 2, minutes: 20 }),
    maps: ['prairie.bird', 'forest.tree', 'valley.dreams', 'wasteland.crab', 'vault.jelly'],
    defRewardAC: 2.5,
  },
  {
    noShardWkDay: [3, 4], // Wed; Thu
    interval: redShardInterval,
    offset: Duration.fromObject({ hours: 3, minutes: 30 }),
    maps: ['prairie.island', 'forest.sunny', 'valley.hermit', 'wasteland.ark', 'vault.jelly'],
    defRewardAC: 3.5,
  },
] satisfies ShardConfig[];

const overrideRewardAC: Record<string, number> = {
  'forest.end': 2.5,
  'valley.dreams': 2.5,
  'forest.tree': 3.5,
  'vault.jelly': 3.5,
};

export const numMapVarients = {
  'prairie.butterfly': 3,
  'prairie.village': 3,
  'prairie.bird': 2,
  'prairie.island': 3,
  'forest.brook': 2,
  'forest.end': 2,
  'valley.rink': 3,
  'valley.dreams': 2,
  'wasteland.temple': 3,
  'wasteland.battlefield': 3,
  'wasteland.graveyard': 2,
  'wasteland.crab': 2,
  'wasteland.ark': 4,
  'vault.starlight': 3,
  'vault.jelly': 2,
};

export const locationNames: Record<string, string> = {
  'prairie.butterfly': 'Butterfly Fields',
  'prairie.village': 'Village Islands',
  'prairie.cave': 'Prairie Caves',
  'prairie.bird': 'Bird Nest',
  'prairie.island': 'Sanctuary Islands',
  'forest.brook': 'Forest Brook',
  'forest.boneyard': 'Shivering Hollows (Boneyard)',
  'forest.end': 'Forest Garden',
  'forest.tree': 'The Treehouse',
  'forest.sunny': 'Elevated Clearing (Sunny Forest)',
  'valley.rink': 'Ice Rink',
  'valley.dreams': 'Village of Dreams',
  'valley.hermit': 'Hermit Valley',
  'wasteland.temple': 'Broken Temple',
  'wasteland.battlefield': 'The Battlefield',
  'wasteland.graveyard': 'The Graveyard',
  'wasteland.crab': 'Crab Fields (Shipwreck)',
  'wasteland.ark': 'Forgotten Ark',
  'vault.starlight': 'Starlight Desert',
  'vault.jelly': 'Jellyfish Cove',
};

export const realmNames: Record<string, string> = {
  prairie: 'Daylight Prairie',
  forest: 'Hidden Forest',
  valley: 'Valley of Triumph',
  wasteland: 'Golden Wasteland',
  vault: 'Vault of Knowledge',
};

export const memoryAnimals: Record<string, string> = {
  'prairie.cave': 'Manta Memory',
  'prairie.bird': 'Manta / Bird Memory',
  'prairie.island': 'Jellyfish / Manta Memory',
  'forest.end': 'Jellyfish Memory',
  'forest.tree': 'Crab / Manta Memory',
  'forest.sunny': 'Manta Memory',
  'valley.dreams': 'Bird / Manta Memory',
  'valley.hermit': 'Whale Memory',
  'wasteland.graveyard': 'Krill Memory',
  'wasteland.crab': 'Crab / Krill Memory',
  'wasteland.ark': 'Crab / Manta Memory',
  'vault.jelly': 'Jellyfish Memory',
};

export const wingedLightGuides: Record<string, string> = {
  'prairie.cave': 'Look high up on the floating rock structures inside the ancient memory void.',
  'prairie.bird': 'Located directly on top of one of the broken stone pillar remnants.',
  'prairie.island': 'Hovering inside the translucent ring assembly right below the central whale entity.',
  'forest.end': 'Perched at the highest peak of the branching dark plant tree stalks.',
  'forest.tree': 'Floating inside the glowing jellyfish cluster grouping near the entry portal.',
  'forest.sunny': 'Suspended over a bright light ray stream near the center of the memory canvas.',
  'valley.dreams': 'Found tucked right behind the shimmering manta wing projection.',
  'valley.hermit': 'Perched straight on top of the ancient skeletal ribcage structures.',
  'wasteland.graveyard': 'Floating near the primary central dark crystal node cluster—watch for krill textures.',
  'wasteland.crab': 'Tucked carefully inside the undercarriage framework of the glowing phantom shipwreck.',
  'wasteland.ark': 'Hovering high directly over the grand arc path where the phantom light whales loop.',
  'vault.jelly': 'Suspended directly inside the translucent mantle core of the towering giant jellyfish.',
};

// Anchor date for ancient memory sequence rotation (Season of Shattering start reference)
const memoryEpoch = DateTime.fromISO('2022-07-11T00:00:00', { zone: 'America/Los_Angeles' });

export function getShardInfo(date: DateTime, override?: Override) {
  const today = date.setZone('America/Los_Angeles').startOf('day');
  const [dayOfMth, dayOfWk] = [today.day, today.weekday];
  const isRed = override?.isRed ?? dayOfMth % 2 === 1;
  const realmIdx = override?.realm ?? (dayOfMth - 1) % 5;
  const infoIndex = override?.group ?? (dayOfMth % 2 === 1 ? (((dayOfMth - 1) / 2) % 3) + 2 : (dayOfMth / 2) % 2);
  const { noShardWkDay, interval, offset, maps, defRewardAC } = shardsInfo[infoIndex];
  const hasShard = override?.hasShard ?? !noShardWkDay.includes(dayOfWk);
  const map = override?.map ?? maps[realmIdx];
  const rewardAC = isRed ? overrideRewardAC[map] ?? defRewardAC : undefined;
  const numVarient = numMapVarients[map as keyof typeof numMapVarients] ?? 1;
  
  let firstStart = today.plus(offset);
  if (dayOfWk === 7 && today.isInDST !== firstStart.isInDST) {
    firstStart = firstStart.plus({ hours: firstStart.isInDST ? -1 : 1 });
  }
  
  const occurrences = Array.from({ length: 3 }, (_, i) => {
    const start = firstStart.plus(interval.mapUnits(x => x * i));
    const land = start.plus(landOffset);
    const end = start.plus(endOffset);
    return { start, land, end };
  });

  const realmKey = realms[realmIdx];

  // 💡 Compute Ancient Memory Index (1 to 6) for Red Shard Days
  let memoryIndex = 0;
  if (isRed && hasShard) {
    const daysDiff = Math.floor(today.diff(memoryEpoch, 'days').days);
    memoryIndex = ((daysDiff % 6) + 6) % 6 + 1;
  }

  // 💡 Key formatted with dots removed to match image files (e.g., "prairiecave")
  const key = map.replace('.', '');

  return {
    date,
    isRed,
    hasShard,
    offset,
    interval,
    lastEnd: occurrences[2].end,
    realm: realmKey,
    map,
    key,
    memoryIndex,
    numVarient,
    rewardAC,
    occurrences,
    wasOverride: !!override,
    
    locationName: locationNames[map] || 'Unknown Location',
    realmName: realmNames[realmKey] || 'Unknown Realm',
    memoryType: isRed ? (memoryAnimals[map] || 'Ancient Light Memory') : 'No Memory Space (Regular Wax)',
    wingedLightLocation: isRed ? (wingedLightGuides[map] || 'No specific memory light found.') : 'None (Black shards do not have a Winged Light void)',
    imageKey: map.replace('.', '-'),
  };
}

export type ShardInfo = ReturnType<typeof getShardInfo>;

interface findShardOptions {
  only?: undefined | 'black' | 'red';
}

export function findNextShard(from: DateTime, opts: findShardOptions = {}): ShardInfo {
  const info = getShardInfo(from);
  const { hasShard, isRed, lastEnd } = info;
  const { only } = opts;
  if (hasShard && from < lastEnd && (!only || (only === 'red') === isRed)) {
    return info;
  } else {
    return findNextShard(from.plus({ days: 1 }), { only });
  }
}