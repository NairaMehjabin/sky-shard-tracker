'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Settings as LuxonSettings, DateTime } from 'luxon';
import { motion, AnimatePresence } from 'framer-motion';
import { useNow } from '@/context/Now';

import { Countdown } from '@/components/Clock'; 
import { getShardInfo } from '@/lib/shard';

LuxonSettings.defaultLocale = 'en';

function SyncedCuteAnalogClock({ date }: { date: DateTime }) {
  const localDate = date?.setZone ? date.setZone('Asia/Dhaka') : date;
  
  const seconds = localDate?.second ?? 0;
  const minutes = localDate?.minute ?? 0;
  const hours = ((localDate?.hour ?? 0) % 12) + minutes / 60;

  const secDeg = seconds * 6;
  const minDeg = minutes * 6;
  const hourDeg = hours * 30;

  return (
    <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full bg-[#FFFDF7] border-4 md:border-[6px] border-[#3D2B1F]/15 shadow-[0_10px_25px_rgba(61,43,31,0.15)] flex items-center justify-center shrink-0 z-10">
      <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#E2B4BD]" />
      
      <span className="absolute top-2 text-[10px] md:text-xs font-black text-[#5C4033]">12</span>
      <span className="absolute right-2.5 text-[10px] md:text-xs font-black text-[#5C4033]">3</span>
      <span className="absolute bottom-2 text-[10px] md:text-xs font-black text-[#5C4033]">6</span>
      <span className="absolute left-2.5 text-[10px] md:text-xs font-black text-[#5C4033]">9</span>

      {/* Hand Animations */}
      <div 
        className="absolute w-1.5 bg-[#3D2B1F] rounded-full origin-bottom" 
        style={{ height: '28%', bottom: '50%', transform: `rotate(${hourDeg}deg)` }}
      />
      <div 
        className="absolute w-1 bg-[#8A9A5B] rounded-full origin-bottom" 
        style={{ height: '38%', bottom: '50%', transform: `rotate(${minDeg}deg)` }}
      />
      <div 
        className="absolute w-0.5 bg-[#E2B4BD] rounded-full origin-bottom" 
        style={{ height: '42%', bottom: '50%', transform: `rotate(${secDeg}deg)` }}
      />
      
      <div className="w-3 h-3 rounded-full bg-[#3D2B1F] border-2 border-[#FFFDF7] z-10 shadow-sm" />
    </div>
  );
}

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="p-8 max-w-sm bg-white rounded-3xl border-2 border-dashed border-[#E2B4BD] shadow-2xl space-y-3">
        <h2 className="text-xl font-black text-[#3D2B1F]">Tracker Interrupted 🌸</h2>
        <p className="text-xs text-[#5C4033]">Something went wrong calculating today's shard schedule.</p>
        <button 
          onClick={resetErrorBoundary || (() => window.location.reload())} 
          className="mt-4 px-6 py-2.5 bg-[#3D2B1F] text-[#E2B4BD] text-xs font-black rounded-full uppercase tracking-widest hover:bg-[#8A9A5B] hover:text-[#3D2B1F] transition-all"
        >
          Reload Tracker
        </button>
      </div>
    </div>
  );
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

type MonitorTab = 'map' | 'data' | 'memory';

function ScrapbookShardTracker() {
  const { application: now } = useNow();
  
  const dhakaNow = now ? now.setZone('Asia/Dhaka') : DateTime.now().setZone('Asia/Dhaka');
  const pacificNow = now ? now.setZone('America/Los_Angeles') : DateTime.now().setZone('America/Los_Angeles');

  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(0);

  const activePacificDate = pacificNow.plus({ days: selectedDateOffset });
  const activeDhakaDate = dhakaNow.plus({ days: selectedDateOffset });

  const currentShardData = getShardInfo(activePacificDate);

  const [activeTab, setActiveTab] = useState<'eruption' | 'wingedLight'>('eruption');
  const [monitorTab, setMonitorTab] = useState<MonitorTab>('map');

  const [mapFailed, setMapFailed] = useState<boolean>(false);
  const [variantFailed, setVariantFailed] = useState<boolean>(false);
  const [dataFailed, setDataFailed] = useState<boolean>(false);
  const [memoryFailed, setMemoryFailed] = useState<boolean>(false);
  const shardMapStr = currentShardData?.map || currentShardData?.key || 'no-shard-active';

  useEffect(() => {
    setMapFailed(false);
    setVariantFailed(false);
    setDataFailed(false);
    setMemoryFailed(false);
  }, [selectedDateOffset, shardMapStr, monitorTab]);

  const hasShard = Boolean(currentShardData?.hasShard);
  const isRedShard = hasShard && Boolean(currentShardData?.isRed);

  const rewardAmount = hasShard 
    ? (isRedShard ? `${currentShardData?.rewardAC ?? '2~3.5'} AC` : 'Wax') 
    : 'None';

  const occurrences = currentShardData?.occurrences || [];
  const upcomingIndex = occurrences.findIndex(({ end }) => end > dhakaNow);
  const upcoming = upcomingIndex >= 0 ? occurrences[upcomingIndex] : undefined;
  const landed = upcoming ? upcoming.land < dhakaNow : false;
  
  const countdownTarget = upcoming 
    ? (landed ? upcoming.end : upcoming.land) 
    : (currentShardData?.lastEnd ?? null);

  let dynamicStatusText = 'All eruptions ended today';
  if (hasShard && upcoming) {
    const shardOrdinal = getOrdinal(upcomingIndex + 1);
    dynamicStatusText = landed 
      ? `${shardOrdinal} Shard active until` 
      : `${shardOrdinal} Shard landing in`;
  } else if (!hasShard) {
    dynamicStatusText = 'No shards scheduled';
  }

  const horizonDays = Array.from({ length: 6 }).map((_, i) => ({
    offset: i,
    info: getShardInfo(pacificNow.plus({ days: i })),
    dhakaDate: dhakaNow.plus({ days: i })
  }));

  const blockLabels = ['1st Eruption', '2nd Eruption', '3rd Eruption (Last)'];
  
  const getFormattedKey = () => {
    const mapKey = currentShardData?.map || currentShardData?.key;
    if (!mapKey) return '';

    if (mapKey.includes('.')) {
      const imageOverrides: Record<string, string> = {
        'prairie.bird': 'plains.birdnest', 
      };
      return imageOverrides[mapKey] || mapKey;
    }
    
    const overrides: Record<string, string> = {
      wastelandark: 'wasteland.ark',
      wasteland_ark: 'wasteland.ark',
      wastelandgraveyard: 'wasteland.graveyard',
      wasteland_graveyard: 'wasteland.graveyard',
      wastelandbattlefield: 'wasteland.battlefield',
      wasteland_battlefield: 'wasteland.battlefield',
      plainsbirdnest: 'plains.birdnest',
      plains_birdnest: 'plains.birdnest',
      forestbrook: 'forest.brook',
      forest_brook: 'forest.brook'
    };

    const lookupKey = mapKey.toLowerCase().replace(/[^a-z]/g, '');
    if (overrides[lookupKey]) return overrides[lookupKey];

    return mapKey
      .replace(/([a-z])([A-Z])/g, '$1.$2')
      .replace(/_/g, '.')
      .toLowerCase();
  };

  const formattedKey = getFormattedKey();

  const primaryMapSrc = `/infographics/map_clement/${formattedKey}.webp`;
  const variantMap0Src = `/infographics/map_varient_clement/${formattedKey}.0.webp`;
  const dataMapSrc = `/infographics/data_gale/${formattedKey}.webp`;
  const rawMemoryIndex = typeof currentShardData?.memoryIndex === 'number' ? currentShardData.memoryIndex : 1;
  const memoryFileNumber = Math.min(Math.max(rawMemoryIndex, 1), 6);
  const memoryMapSrc = `/infographics/memory_clement/${memoryFileNumber}.webp`;

  return (
    <main className="min-h-screen pt-20 md:pt-28 pb-10 overflow-x-hidden font-sans text-[#FFFDF7] relative bg-[url('/images/dashboard-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed">
      {/* Background Accent */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-[#FFFDF7] opacity-25" 
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(226, 180, 189, 0.15) 0%, transparent 60%)`
        }}
      />

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[65vh] md:min-h-[75vh] flex flex-col items-center justify-center px-4 md:px-10 overflow-hidden pt-6 z-10">
        
        {/* Decorative Left Blobs */}
        <div className="absolute top-4 sm:top-10 -left-12 sm:-left-16 md:-left-24 w-32 sm:w-64 md:w-80 h-64 sm:h-72 pointer-events-none z-0 opacity-80 sm:opacity-100">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-24 h-24 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-[#E2B4BD]/40 backdrop-blur-md rounded-full border border-[#FFFDF7]/30 shadow-lg" />
            <div className="absolute top-8 left-2 w-16 h-16 sm:w-44 sm:h-44 md:w-56 md:h-56 bg-[#5C4033]/40 backdrop-blur-md rounded-full shadow-2xl border border-[#FFFDF7]/20" />
            <div className="absolute top-28 left-6 sm:top-56 sm:left-12 w-16 h-16 sm:w-32 sm:h-32 md:w-44 md:h-44 bg-[#8A9A5B]/40 backdrop-blur-md rounded-full border border-[#FFFDF7]/30" />
          </div>
        </div>

        {/* Decorative Right Blobs */}
        <div className="absolute top-12 -right-12 sm:-right-24 md:-right-45 w-44 sm:w-96 md:w-[560px] h-full pointer-events-none z-0 opacity-85 sm:opacity-100">
          <div className="relative h-full w-full flex items-center justify-end">
            <div className="absolute w-36 h-36 sm:w-80 sm:h-80 md:w-[440px] md:h-[440px] bg-[#5C4033]/30 backdrop-blur-md rounded-full border border-[#FFFDF7]/20" />
            <div className="absolute w-28 h-28 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-[#8A9A5B]/40 backdrop-blur-md rounded-full border border-[#FFFDF7]/30" />
            <div className="absolute w-20 h-20 sm:w-52 sm:h-52 md:w-72 md:h-72 bg-[#5C4033]/95 rounded-full shadow-2xl border-2 md:border-4 border-[#FFFDF7]" />

            <motion.img 
              initial={{ opacity: 0, x: 20, rotate: -90 }}
              animate={{ opacity: 1, x: 0, rotate: -90 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src="/cherry-blossom.png" 
              alt="Blossom Accent"
              className="absolute -right-6 sm:-right-5 md:-right-2 w-44 sm:w-80 md:w-[520px] object-contain z-20 drop-shadow-[-20px_0px_30px_rgba(0,0,0,0.15)] opacity-80 sm:opacity-90 md:opacity-100"
            />
          </div>
        </div>

        {/* Header Display */}
        <div className="text-center z-10 flex flex-col items-center w-full max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full flex flex-col items-center">
            <h1 
              className="text-[55px] sm:text-[80px] md:text-[110px] lg:text-[140px] font-curly text-[#E2B4BD] leading-none select-none tracking-normal pt-4 pb-2 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
              style={{
                WebkitTextStroke: '4px #FFFDF7',
                paintOrder: 'stroke fill',
              }}
            >
              SkyLit Compass
            </h1>
            
            <div className="flex flex-col items-center mt-0 md:-mt-2">
              <p className="font-buttons text-sm sm:text-xl md:text-3xl tracking-[0.2em] md:tracking-[0.5em] font-black text-[#FFFDF7] uppercase border-t-[2px] md:border-t-[4px] border-[#FFFDF7] pt-2 md:pt-4 leading-tight max-w-full break-words relative z-10 drop-shadow-md">
                Sky Shard Tracker
              </p>
            </div>
          </motion.div>
        </div>

        {/* Clock Section */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 mt-8 md:mt-12 z-20 relative w-full max-w-5xl px-2">
          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
            className="flex-shrink-0 relative flex flex-col items-center justify-center space-y-3 p-2"
          >
            <SyncedCuteAnalogClock date={dhakaNow} />
            <span className="text-[10px] md:text-xs font-typewriter font-bold uppercase tracking-widest text-[#3D2B1F] bg-[#FFFDF7] px-3.5 py-1 rounded-full border border-[#E2B4BD] shadow-md z-10">
              {dhakaNow.toFormat('hh:mm:ss a')}
            </span>
          </motion.div>

          <div className="max-w-md lg:text-left text-center px-2 space-y-4">
            <h2 className="text-[#FFFDF7] font-curly text-2xl md:text-4xl tracking-wide leading-tight relative z-10 drop-shadow-lg">
              "Even in the darkest fragments, <br /> 
              <span 
                className="text-[#E2B4BD] drop-shadow-md inline-block mt-1"
                style={{
                  WebkitTextStroke: '3px #FFFDF7',
                  paintOrder: 'stroke fill',
                }}
              >
                a spark of light remains."
              </span>
            </h2>
            
            <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start relative z-10">
              <div className="bg-[#3D2B1F] text-[#FFFDF7] text-[10px] md:text-xs py-2.5 px-5 rounded-full font-black uppercase tracking-widest shadow-md flex items-center gap-2 border border-[#FFFDF7]/20">
                <span>📍</span>
                <span className="text-[#FFFDF7]">
                  {hasShard ? `${currentShardData?.realmName} • ${currentShardData?.locationName}` : 'Clear Skies (No Shards)'}
                </span>
              </div>
              {hasShard && isRedShard && (
                <div className="flex bg-[#FFFDF7] border-2 border-[#3D2B1F] rounded-full p-1 shadow-sm">
                  <button 
                    onClick={() => setActiveTab('eruption')}
                    className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'eruption' ? 'bg-[#3D2B1F] text-[#E2B4BD]' : 'text-[#3D2B1F]'}`}
                  >
                    Location
                  </button>
                  <button 
                    onClick={() => setActiveTab('wingedLight')}
                    className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'wingedLight' ? 'bg-[#3D2B1F] text-[#E2B4BD]' : 'text-[#3D2B1F]'}`}
                  >
                    Winged Light
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE & DATA BOARD */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-12 space-y-8 z-20 relative">
        
        {/* Status Banner */}
        <div className="bg-[#FFFDF7]/90 backdrop-blur-sm rounded-3xl border-4 border-[#3D2B1F]/10 p-5 md:p-8 shadow-[0_15px_35px_rgba(61,43,31,0.08)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-typewriter uppercase tracking-widest font-black text-[#5C4033]">
              Eruption Status
            </span>
            <h3 className="text-xl md:text-3xl font-black text-[#3D2B1F] tracking-tight">
              {dynamicStatusText}
            </h3>
            <p className="text-xs font-semibold text-[#8A9A5B] uppercase tracking-wider">
              {hasShard 
                ? `${rewardAmount} • ${isRedShard ? 'Red' : 'Black'} Shard Day` 
                : 'No Shard Day'}
              {selectedDateOffset !== 0 ? ` • Viewing: ${activeDhakaDate.toFormat('LLL dd')}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedDateOffset !== 0 && (
              <button 
                onClick={() => setSelectedDateOffset(0)}
                className="bg-[#E2B4BD] text-[#3D2B1F] text-[10px] px-4 py-3 rounded-2xl font-black uppercase tracking-wider shadow-sm hover:bg-[#3D2B1F] hover:text-[#E2B4BD] transition-all"
              >
                Reset Today
              </button>
            )}
            
            <div className="bg-[#3D2B1F] text-[#E2B4BD] px-6 py-4 rounded-2xl border-2 border-[#E2B4BD]/40 shadow-md text-center min-w-[150px]">
              {selectedDateOffset === 0 && countdownTarget ? (
                <Countdown to={countdownTarget} minimal={true} />
              ) : (
                <span className="text-lg font-typewriter font-bold text-[#FFFDF7]">
                  {activeDhakaDate.toFormat('ccc, LLL dd')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MONITOR DISPLAY SCREEN */}
        <div className="bg-[#FFFDF7]/90 backdrop-blur-sm rounded-3xl border-4 border-[#3D2B1F]/15 p-4 sm:p-6 shadow-[0_15px_35px_rgba(61,43,31,0.1)] space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-dashed border-[#E2B4BD] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E2B4BD] shadow-sm animate-pulse" />
              <span className="font-typewriter text-xs uppercase font-bold text-[#5C4033] tracking-widest">
                Shard Monitor Screen
              </span>
            </div>

            <div className="flex bg-[#3D2B1F]/10 p-1 rounded-2xl border border-[#3D2B1F]/15 gap-1">
              <button
                onClick={() => setMonitorTab('map')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  monitorTab === 'map' 
                    ? 'bg-[#3D2B1F] text-[#FFFDF7] shadow-sm' 
                    : 'text-[#5C4033] hover:text-[#3D2B1F]'
                }`}
              >
                🗺️ Location Map
              </button>
              <button
                onClick={() => setMonitorTab('data')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  monitorTab === 'data' 
                    ? 'bg-[#3D2B1F] text-[#FFFDF7] shadow-sm' 
                    : 'text-[#5C4033] hover:text-[#3D2B1F]'
                }`}
              >
                📊 Rewards Map
              </button>
              {isRedShard && (
                <button
                  onClick={() => setMonitorTab('memory')}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    monitorTab === 'memory' 
                      ? 'bg-[#3D2B1F] text-[#FFFDF7] shadow-sm' 
                      : 'text-[#5C4033] hover:text-[#3D2B1F]'
                  }`}
                >
                  ✨ Spirit Memory
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full rounded-2xl bg-[#3D2B1F] border-2 border-[#3D2B1F] p-2 sm:p-3 overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[220px] sm:min-h-[360px]">
            <AnimatePresence mode="wait">
              {hasShard ? (
                <motion.div
                  key={`${formattedKey}-${monitorTab}-${selectedDateOffset}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  {/* TAB 1: LOCATION MAP */}
                  {monitorTab === 'map' && (
                    !mapFailed ? (
                      <img
                        key={primaryMapSrc}
                        src={primaryMapSrc}
                        alt={`Location map for ${currentShardData?.locationName}`}
                        className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-md"
                        onError={() => setMapFailed(true)}
                      />
                    ) : !variantFailed ? (
                      <img
                        key={variantMap0Src}
                        src={variantMap0Src}
                        alt={`Location map variant for ${currentShardData?.locationName}`}
                        className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-md"
                        onError={() => setVariantFailed(true)}
                      />
                    ) : (
                      <div className="text-center p-8 space-y-2">
                        <span className="text-4xl block">🗺️</span>
                        <p className="font-curly text-2xl text-[#E2B4BD]">Map Graphic Missing</p>
                        <p className="font-typewriter text-xs text-[#FFFDF7]/70 uppercase tracking-widest">
                          Could not locate map file for {formattedKey}
                        </p>
                      </div>
                    )
                  )}

                  {/* TAB 2: DATA MAP */}
                  {monitorTab === 'data' && (
                    !dataFailed ? (
                      <img
                        key={dataMapSrc}
                        src={dataMapSrc}
                        alt={`Rewards map for ${currentShardData?.locationName}`}
                        className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-md"
                        onError={() => setDataFailed(true)}
                      />
                    ) : (
                      <div className="text-center p-8 space-y-2">
                        <span className="text-4xl block">📊</span>
                        <p className="font-curly text-2xl text-[#E2B4BD]">Rewards Graphic Missing</p>
                        <p className="font-typewriter text-xs text-[#FFFDF7]/70 uppercase tracking-widest">
                          Could not locate data file for {formattedKey}
                        </p>
                      </div>
                    )
                  )}

                  {/* TAB 3: SPIRIT MEMORY */}
                  {monitorTab === 'memory' && (
                    !memoryFailed ? (
                      <img
                        key={memoryMapSrc}
                        src={memoryMapSrc}
                        alt={`Spirit memory ${memoryFileNumber}`}
                        className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-md"
                        onError={() => setMemoryFailed(true)}
                      />
                    ) : (
                      <div className="text-center p-8 space-y-2">
                        <span className="text-4xl block">✨</span>
                        <p className="font-curly text-2xl text-[#E2B4BD]">Memory Graphic Missing</p>
                        <p className="font-typewriter text-xs text-[#FFFDF7]/70 uppercase tracking-widest">
                          Could not locate memory file for index #{memoryFileNumber}
                        </p>
                      </div>
                    )
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="no-shard-monitor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center p-8 space-y-2"
                >
                  <span className="text-4xl block">☁️</span>
                  <p className="font-curly text-2xl text-[#E2B4BD]">Clear Skies Ahead</p>
                  <p className="font-typewriter text-xs text-[#FFFDF7]/70 uppercase tracking-widest">
                    No active shard infographic scheduled for this date
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center text-[10px] font-typewriter text-[#5C4033]/80 font-bold px-1">
            <span>
              {hasShard 
                ? `Viewing: ${currentShardData?.realmName} — ${currentShardData?.locationName}` 
                : 'Status: Idle'}
            </span>
            <span>Clement's Map, Gale's Data</span>
          </div>
        </div>

        {/* Eruption Time Slots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#FFFDF7]/30 pb-3">
            <h4 className="text-xs md:text-sm font-typewriter font-black text-[#FFFDF7] uppercase tracking-widest flex items-center gap-2 relative z-10 drop-shadow-sm">
              <span>🕯️</span> Today's Eruptions
            </h4>
            <span className="text-[10px] font-typewriter text-[#FFFDF7]/80 font-bold relative z-10">Timezone: Asia/Dhaka</span>
          </div>

          {!hasShard ? (
            <div className="bg-[#FFFDF7]/90 backdrop-blur-sm p-8 rounded-3xl border-2 border-dashed border-[#8A9A5B] text-center relative z-10">
              <p className="text-base md:text-lg font-black text-[#8A9A5B] uppercase tracking-wider">
                No shard eruptions reported for this date 🌱
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {occurrences.map((occ, i) => {
                const localStartStr = occ.start ? occ.start.setZone('Asia/Dhaka').toFormat('hh:mm:ss a') : '';
                const localEndStr = occ.end ? occ.end.setZone('Asia/Dhaka').toFormat('hh:mm:ss a') : '';
                const isLanded = occ.start < dhakaNow;
                const isEnded = occ.end < dhakaNow;

                return (
                  <div 
                    key={i} 
                    className={`rounded-3xl p-6 border-2 shadow-md flex flex-col justify-between space-y-4 transition-all ${
                      i === 2 
                        ? 'bg-[#3D2B1F]/95 text-[#E2B4BD] border-[#3D2B1F]' 
                        : 'bg-[#FFFDF7]/90 backdrop-blur-sm text-[#3D2B1F] border-[#3D2B1F]/15'
                    }`}
                  >
                    <div className="flex justify-between items-center border-b border-current/10 pb-3">
                      <span className="text-[10px] font-typewriter uppercase font-black tracking-widest opacity-80">
                        {blockLabels[i]}
                      </span>
                      <span className="text-[9px] font-typewriter font-bold px-2.5 py-1 rounded-full bg-[#E2B4BD]/20 border border-current/20">
                        Instance {i + 1}
                      </span>
                    </div>

                    <div className="space-y-2 font-typewriter">
                      <div className="flex justify-between items-center text-xs">
                        <span className="opacity-60 text-[10px] uppercase font-sans font-bold">Landing</span>
                        <span className={`font-bold ${isLanded && selectedDateOffset === 0 ? 'line-through opacity-50' : ''}`}>
                          {localStartStr}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="opacity-60 text-[10px] uppercase font-sans font-bold">Ending</span>
                        <span className={`font-bold ${isEnded && selectedDateOffset === 0 ? 'line-through opacity-50' : ''}`}>
                          {localEndStr}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Future Horizon Carousel*/}
        <div className="space-y-4 pt-4 relative z-10">
          <div className="flex justify-between items-center border-b-2 border-[#FFFDF7]/30 pb-3">
            <h4 className="text-xs md:text-sm font-typewriter font-black text-[#FFFDF7] uppercase tracking-widest flex items-center gap-2 relative z-10 drop-shadow-sm">
              <span>🌸</span> Upcoming Shards
            </h4>
            <span className="text-[10px] font-typewriter text-[#FFFDF7]/80 font-bold relative z-10">Select card to view details</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
            {horizonDays.map(({ offset, info: day, dhakaDate }) => {
              const isSelected = selectedDateOffset === offset;

              return (
                <div 
                  key={offset} 
                  onClick={() => setSelectedDateOffset(offset)}
                  className={`rounded-2xl p-4 border-2 shadow-sm flex flex-col justify-between h-36 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#FFFDF7] border-[#3D2B1F] ring-4 ring-[#E2B4BD] scale-[1.03] shadow-lg' 
                      : 'bg-[#FFFDF7]/90 backdrop-blur-sm border-[#3D2B1F]/10 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-typewriter font-black uppercase text-[#5C4033] block">
                      {offset === 0 ? 'Today' : dhakaDate.toFormat('ccc, LLL dd')}
                    </span>
                    <h5 className="text-xs font-black text-[#3D2B1F] mt-1 line-clamp-2">
                      {day?.hasShard ? day.locationName : 'No Shard'}
                    </h5>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#3D2B1F]/10 pt-2">
                    <span className={`w-2 h-2 rounded-full ${!day?.hasShard ? 'bg-[#8A9A5B]' : day.isRed ? 'bg-[#E2B4BD]' : 'bg-[#3D2B1F]'}`} />
                    <span className="text-[9px] font-typewriter uppercase font-bold text-[#5C4033]">
                      {day?.hasShard ? (day.isRed ? 'Red' : 'Black') : 'Rest'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* CREDITS & FOOTER SECTION */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-16 mb-8 z-20 relative">
        <div className="bg-[#FFFDF7]/95 backdrop-blur-md rounded-3xl border-2 border-dashed border-[#E2B4BD] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-8 justify-between items-start text-[#5C4033]">
          
          <div className="space-y-3 flex-1">
            <h4 className="font-black text-[#3D2B1F] text-sm uppercase tracking-widest font-typewriter border-b border-[#E2B4BD] pb-2 inline-block">
              About SkyLit Compass 🌸
            </h4>
            <p className="text-xs leading-relaxed">
              This is a community-driven, player-made website. It is <strong>not</strong> affiliated with, endorsed, or powered by thatgamecompany.
            </p>
            <p className="text-xs leading-relaxed">
              Concept inspired by the incredible <a href="https://sky-shards.pages.dev/en" target="_blank" rel="noreferrer" className="text-[#E2B4BD] font-bold hover:text-[#3D2B1F] transition-colors">Sky Shards</a> project 
              (GitHub: <a href="https://github.com/PlutoyDev/sky-shards" target="_blank" rel="noreferrer" className="text-[#8A9A5B] font-bold hover:text-[#3D2B1F] transition-colors">PlutoyDev</a>).
            </p>
            <p className="text-xs leading-relaxed pt-2">
              All infographics are graciously provided by the <a href="https://discord.gg/skyinfographicsdatabase" target="_blank" rel="noreferrer" className="text-[#E2B4BD] font-bold hover:text-[#3D2B1F] transition-colors">Sky Infographics Database Discord</a>. <br/>
              🗺️ Maps & Memories by <strong>Clement</strong> <br/>
              📊 Rewards Data by <strong>Galerowfylery</strong>
            </p>
            
            {/* Discord Contributors List */}
            <div className="pt-2 text-[10px] text-[#5C4033]/80 leading-relaxed border-t border-[#E2B4BD]/40">
              <span className="font-bold text-[#3D2B1F] block mb-1">Thanks to these Discord users for aiding in discovering shard eruption patterns:</span>
              <span className="font-typewriter tracking-tight">galerowfylery, zhii_zhem.4275, christiankingfu, kion_anzu, hucker_, ln.cookie, .stoat.</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-44 bg-[#E2B4BD]/40 mx-4 self-center" />
          <div className="block md:hidden w-full h-px bg-[#E2B4BD]/40" />

          <div className="space-y-3 flex-1">
            <h4 className="font-black text-[#3D2B1F] text-sm uppercase tracking-widest font-typewriter border-b border-[#E2B4BD] pb-2 inline-block">
              Developer Info 💻
            </h4>
            <p className="text-xs leading-relaxed">
              Designed & Coded with 🤍 by <strong>Naira</strong>. <br />
              Open to chats, bug reports, and feedback!
            </p>
            <ul className="text-xs space-y-2 pt-2 font-medium">
              <li className="flex items-center gap-2">
                <span className="opacity-80">Discord:</span> 
                <span className="font-typewriter bg-[#E2B4BD]/20 border border-[#E2B4BD] px-2 py-0.5 rounded-md text-[#3D2B1F]">
                  biryanir_tezpata
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="opacity-80">GitHub:</span> 
                <a href="https://github.com/NairaMehjabin" target="_blank" rel="noreferrer" className="text-[#8A9A5B] hover:text-[#3D2B1F] transition-colors">
                  @NairaMehjabin
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="opacity-80">Source Code:</span> 
                <a href="https://github.com/NairaMehjabin/sky-shard-tracker" target="_blank" rel="noreferrer" className="text-[#E2B4BD] italic hover:text-[#3D2B1F] transition-colors">
                  GitHub Repository of Skylit Compass.
                </a>
              </li>
            </ul>
          </div>

        </div>
      </footer>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ScrapbookShardTracker />
    </ErrorBoundary>
  );
}