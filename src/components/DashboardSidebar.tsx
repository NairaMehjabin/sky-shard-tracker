'use client';

import { DateTime } from 'luxon';
import ShardCountdownSection from '@/components/Countdown';

interface Occurrence {
  start: DateTime;
  end: DateTime;
}

interface ShardInfo {
  hasShard: boolean;
  isRed?: boolean;
  rewardAC?: number;
  locationName?: string;
  realmName?: string;
  memoryType?: string;
  wingedLightLocation?: string;
  occurrences: Occurrence[];
}

interface DashboardSidebarProps {
  info: ShardInfo | null;
  now: DateTime;
  isRedShard: boolean | undefined;
  rewardAmount: string;
  rewardType: string;
}

export default function DashboardSidebar({
  info,
  now,
  isRedShard,
  rewardAmount,
  rewardType,
}: DashboardSidebarProps) {
  const blockLabels = [
    '1st Eruption',
    '2nd Eruption',
    '3rd Eruption (Last)',
  ];

  const allEnded =
    info?.occurrences &&
    info.occurrences.length > 0 &&
    info.occurrences.every((occ) => occ.end < now);

  const displayRewardType = info?.hasShard 
    ? (info.isRed ? 'Ascended Candles' : 'Regular Candles (Wax)') 
    : 'No Rewards';

  const displayRewardAmount = info?.hasShard 
    ? (info.isRed ? `${info.rewardAC ?? '2~3.5'} AC` : 'Regular Wax Event') 
    : '0';

  return (
    <aside className="hidden lg:flex w-full lg:w-96 bg-[#E9D5E6] p-6 md:p-8 pt-24 lg:pt-28 border-t lg:border-t-0 lg:border-l border-[#754A70]/20 shrink-0 flex-col gap-6 z-20 shadow-2xl relative overflow-hidden">
      {/* Brand Asset Overlay */}
      <div
        className="absolute inset-0 opacity-[0.60] pointer-events-none select-none z-0 bg-cover bg-center bg-no-repeat mix-blend-multiply"
        style={{
          backgroundImage: `url('/images/dashboard-bg.png')`,
        }}
      />

      <div className="relative z-10 space-y-6 flex flex-col h-full justify-between">
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#3F303D] border border-[#754A70]/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#17191D] border border-[#754A70]/30 flex items-center justify-center text-lg">
                ✨
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F8F3E6] tracking-tight">Sky Kid Traveler</h4>
                <p className="text-[11px] text-[#BDB2BC]/60 font-mono">Status: Offline Workspace</p>
              </div>
            </div>
          </div>

          {/* Live Countdown Wrapper */}
          <div className="space-y-2">
            <span className="block text-center text-base font-bold text-[#F8F3E6] uppercase tracking-wider">
              {!info?.hasShard ? 'Shard Status' : allEnded ? 'All Shards Has Ended' : 'Shard Landing Countdown'}
            </span>
            <div className="bg-[#3F303D] rounded-2xl p-6 shadow-xl text-[#F8F3E6] border border-[#754A70]/20 relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] text-7xl opacity-[0.02] select-none pointer-events-none">
                ⏳
              </div>
              {!info?.hasShard ? (
                <div className="w-full text-center py-4 text-base font-bold text-[#BDB2BC] font-mono tracking-wide">
                  No Shards Landing :D
                </div>
              ) : (
                <ShardCountdownSection info={info} />
              )}
            </div>
          </div>

          {/* Dynamic Shard Reward Card Module */}
          <div className="space-y-2">
            <span className="block text-center text-base font-bold text-[#F8F3E6] uppercase tracking-wider">
              Shard Reward Pool
            </span>
            <div className={`rounded-2xl p-5 border shadow-xl flex items-center gap-4 transition-all bg-[#3F303D] text-[#F8F3E6] ${
              info?.hasShard && info.isRed ? 'border-[#ED5E62]/40' : 'border-[#754A70]/30'
            }`}>
              <div className="text-2xl drop-shadow-md">
                {!info?.hasShard ? '💤' : info.isRed ? '✨' : '🕯️'}
              </div>
              <div className="flex-1">
                <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${info?.isRed ? 'text-[#ED5E62]' : 'text-[#BDB2BC]'}`}>
                  {displayRewardType}
                </span>
                <p className="text-lg font-black tracking-tight mt-0.5 leading-tight text-[#F8F3E6]">
                  {displayRewardAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Associated Light Form */}
          <div className="space-y-2">
            <span className="block text-center text-base font-bold text-[#F8F3E6] uppercase tracking-wider">
              Spirit Memory Type
            </span>
            <div className={`rounded-2xl p-5 border shadow-xl flex items-center gap-4 transition-all bg-[#3F303D] text-[#F8F3E6] ${
              info?.hasShard && info.isRed ? 'border-[#ED5E62]/40' : 'border-[#754A70]/30'
            }`}>
              <div className="text-2xl drop-shadow-md">
                {!info?.hasShard ? '💤' : info.isRed ? '🦐' : '🦋'}
              </div>
              <div className="flex-1">
                <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${info?.isRed ? 'text-[#ED5E62]' : 'text-[#BDB2BC]'}`}>
                  Report Reported Memory Context
                </span>
                <p className="text-sm font-bold tracking-tight mt-0.5 leading-tight text-[#F8F3E6]">
                  {info?.hasShard 
                    ? (info.memoryType || 'Awaiting daily report...') 
                    : 'Peaceful Horizon'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Interval Blocks Grid Module (Asia/Dhaka) */}
        {info?.hasShard && (
          <div className="space-y-2.5 mt-4">
            <span className="block text-center text-base font-bold text-[#F8F3E6] uppercase tracking-wider">
              Shard Eruptions
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {info.occurrences.map((occ, i) => {
                const localStartStr = occ.start.setZone('Asia/Dhaka').toFormat('hh:mm:ss a');
                const localEndStr = occ.end.setZone('Asia/Dhaka').toFormat('hh:mm:ss a');
                const landed = occ.start < now;
                const ended = occ.end < now;
                
                return (
                  <div 
                    key={i} 
                    className={`rounded-xl p-4 flex flex-col gap-1 text-xs border shadow-lg transition-all ${
                      i === 2 
                        ? 'bg-[#754A70] border-[#3F303D]/30 text-[#F8F3E6]' 
                        : i === 1 
                          ? 'bg-[#3F303D] border-[#754A70]/30 text-[#BDB2BC]' 
                          : 'bg-[#17191D] border-[#754A70]/20 text-[#BDB2BC]'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-black/10 pb-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-[#F8F3E6]' : i === 1 ? 'bg-[#754A70]' : 'bg-[#BDB2BC]/40'}`} />
                        <span className={`font-mono font-bold uppercase tracking-wide text-[10px] ${i === 2 ? 'text-[#F8F3E6]/70' : 'text-[#BDB2BC]/60'}`}>
                          {blockLabels[i]}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] bg-black/20 text-[#F8F3E6] px-1.5 py-0.5 rounded font-bold border border-black/10">
                        Eruption {i + 1}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <div className="flex flex-col">
                        <span className="text-[9px] opacity-50 font-sans uppercase">Start</span>
                        <span className={`font-bold text-[#F8F3E6] tracking-tight ${landed ? 'line-through opacity-50' : ''}`}>
                          {localStartStr}
                        </span>
                      </div>
                      <div className="opacity-40 font-light px-2">→</div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] opacity-50 font-sans uppercase">End</span>
                        <span className={`font-bold text-[#F8F3E6] tracking-tight ${ended ? 'line-through opacity-50' : ''}`}>
                          {localEndStr}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}