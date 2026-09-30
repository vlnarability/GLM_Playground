(function(){
  const DATA = {};
  DATA.STORAGE_KEY = "evolution_idle_v65";
  DATA.SPEEDS = [1];
  DATA.DEBUG_SPEEDS = [1,2,5,10,25,50,100];
  DATA.PRESTIGE_LAYERS = [
    {id:"evolution",name:"Evolution",kind:"active",unlockStage:"cell",currency:"Evolution Points",resetLabel:"Seed New Life",desc:"The god is barely awake. It learns by testing life through hardship, challenges, and mastery."},
    {id:"enlightenment",name:"Enlightenment",kind:"locked",unlockStage:"galactic",currency:"Enlightenment",resetLabel:"Awaken to Foresight",desc:"The god becomes self-aware and begins interpreting reality. Enlightenment strengthens foresight, route control, and the reading of fate, while Divinity flows during the run itself."},
    {id:"transcendence",name:"Transcendence",kind:"locked",unlockStage:"galactic",currency:"Transcendence",resetLabel:"Step Beyond Causality",desc:"The god separates from creation and begins drawing power from offerings, rituals, and scripts."},
    {id:"genesis",name:"Genesis",kind:"planned",unlockStage:"future",currency:"Genesis",resetLabel:"Author a Cradle World",desc:"The god becomes a true creator, defining cradle worlds, sacred geography, and dormant seeds before life begins."},
    {id:"apotheosis",name:"Apotheosis",kind:"planned",unlockStage:"future",currency:"Apotheosis",resetLabel:"Reveal the Divine",desc:"Civilization recognizes the god. Divine laws, worship modes, miracles, and heresy define the run."},
    {id:"singularity",name:"Singularity",kind:"planned",unlockStage:"future",currency:"Singularity",resetLabel:"Merge With the System",desc:"The god enters the machinery of reality itself through relic loadouts, compression, and logic cores."},
    {id:"omnipotence",name:"Omnipotence",kind:"planned",unlockStage:"future",currency:"Omnipotence",resetLabel:"Deny Natural Boundaries",desc:"Lineage bindings, unstable fusions, and narrow rule rewrites let the god sustain contradiction."},
    {id:"divinity",name:"Divinity",kind:"planned",unlockStage:"future",currency:"Divinity",resetLabel:"Choose the Divine Face",desc:"Prayer routing, divine masks, and worship polarity decide how creation perceives and feeds the god."},
    {id:"infinity",name:"Infinity",kind:"planned",unlockStage:"future",currency:"Infinity",resetLabel:"Bind Many Histories",desc:"Echo runs, forks, and future debt turn the god into a curator of timelines rather than one civilization."},
    {id:"eternity",name:"Eternity",kind:"planned",unlockStage:"future",currency:"Eternity",resetLabel:"Write the Final Testament",desc:"The story ends with canon, permanence, and the final authored universe."}
  ];

  DATA.ARCHETYPES = [
    {id:"humanoid",name:"Humanoid",rarity:"basic",unlock:"default",color:"#6ea8fe"},
    {id:"mammalian",name:"Mammalian",rarity:"basic",unlock:"default",color:"#f3a35c"},
    {id:"reptilian",name:"Reptilian",rarity:"basic",unlock:"default",color:"#8bd17c"},
    {id:"avian",name:"Avian",rarity:"basic",unlock:"default",color:"#f4d35e"},
    {id:"arthropoid",name:"Arthropoid",rarity:"basic",unlock:"default",color:"#ff7aa2"},
    {id:"molluscoid",name:"Molluscoid",rarity:"basic",unlock:"default",color:"#b78cff"},
    {id:"fungoid",name:"Fungoid",rarity:"basic",unlock:"default",color:"#c6d66f"},
    {id:"plantoid",name:"Plantoid",rarity:"basic",unlock:"default",color:"#54d186"},
    {id:"aquatic",name:"Aquatic",rarity:"basic",unlock:"default",color:"#4dd7e8"},
    {id:"lithoid",name:"Lithoid",rarity:"rare",unlock:"first_win",color:"#b8a78b"},
    {id:"necroid",name:"Necroid",rarity:"rare",unlock:"first_win",color:"#9b8aa8"},
    {id:"toxoid",name:"Toxoid",rarity:"rare",unlock:"first_win",color:"#b7e35f"},
    {id:"extremophile",name:"Extremophile",rarity:"rare",unlock:"first_win",color:"#ff8f70"}
  ];

  DATA.RESOURCES = [
    {id:"atp",name:"ATP",category:"primary",firstStage:"cell",carriesForward:false},
    {id:"glucose",name:"Glucose",category:"primary",firstStage:"cell",carriesForward:true},
    {id:"proteins",name:"Proteins",category:"primary",firstStage:"cell",carriesForward:true},
    {id:"lipids",name:"Lipids",category:"primary",firstStage:"cell",carriesForward:true},
    {id:"elements",name:"Elements",category:"primary",firstStage:"cell",carriesForward:true},
    {id:"food",name:"Food",category:"primary",firstStage:"creature",carriesForward:true},
    {id:"water",name:"Water",category:"primary",firstStage:"creature",carriesForward:true},
    {id:"materials",name:"Materials",category:"primary",firstStage:"creature",carriesForward:true},
    {id:"organic_matter",name:"Organic Matter",category:"primary",firstStage:"creature",carriesForward:true},
    {id:"knowledge",name:"Knowledge",category:"primary",firstStage:"creature",carriesForward:true},
    {id:"culture",name:"Culture",category:"primary",firstStage:"creature",carriesForward:true},
    {id:"wood",name:"Wood",category:"primary",firstStage:"tribal",carriesForward:true},
    {id:"lumber",name:"Lumber",category:"primary",firstStage:"tribal",carriesForward:true},
    {id:"stone",name:"Stone",category:"primary",firstStage:"tribal",carriesForward:true},
    {id:"clay",name:"Clay",category:"primary",firstStage:"tribal",carriesForward:true},
    {id:"science",name:"Science",category:"primary",firstStage:"tribal",carriesForward:true},
    {id:"happiness",name:"Happiness",category:"primary",firstStage:"tribal",carriesForward:true},
    {id:"military_power",name:"Military Power",category:"primary",firstStage:"tribal",carriesForward:true},
    {id:"production",name:"Production",category:"primary",firstStage:"civilization",carriesForward:true},
    {id:"gold",name:"Gold",category:"primary",firstStage:"civilization",carriesForward:true},
    {id:"influence",name:"Influence",category:"primary",firstStage:"empire",carriesForward:true},
    {id:"energy",name:"Energy",category:"primary",firstStage:"solar",carriesForward:true},
    {id:"alloys",name:"Alloys",category:"primary",firstStage:"solar",carriesForward:true},
    {id:"data",name:"Data",category:"primary",firstStage:"galactic",carriesForward:true},
    {id:"divinity_growth",name:"Growth Grace",category:"divinity_channel",firstStage:"galactic",carriesForward:true},
    {id:"divinity_harmony",name:"Harmony Grace",category:"divinity_channel",firstStage:"galactic",carriesForward:true},
    {id:"divinity_conquest",name:"Conquest Grace",category:"divinity_channel",firstStage:"galactic",carriesForward:true},
    {id:"divinity_wealth",name:"Wealth Grace",category:"divinity_channel",firstStage:"galactic",carriesForward:true},
    {id:"divinity_knowledge",name:"Knowledge Grace",category:"divinity_channel",firstStage:"galactic",carriesForward:true},
    {id:"divinity_transcendence",name:"Transcendence Grace",category:"divinity_channel",firstStage:"galactic",carriesForward:true},
    {id:"divinity",name:"Divinity",category:"divinity_aggregate",firstStage:"galactic",carriesForward:true},
    {id:"luxury_total",name:"Luxury Resources",category:"luxury_aggregate",firstStage:"tribal",carriesForward:true},
    {id:"strategic_total",name:"Strategic Resources",category:"strategic_aggregate",firstStage:"tribal",carriesForward:true}
  ];

  DATA.SHOP_UPGRADES = [
    {id:"manual",name:"Quickened Hands",base:2,max:20,desc:function(level){ return "Manual actions +" + (level*20) + "%"; }},
    {id:"auto",name:"Inherited Efficiency",base:3,max:20,desc:function(level){ return "Passive production +" + (level*15) + "%"; }},
    {id:"cost",name:"Frugality",base:4,max:15,desc:function(level){ return "System and tech costs -" + (level*4) + "%"; }},
    {id:"start",name:"Warm Start",base:5,max:10,desc:function(level){ return "Start with +" + (level*5) + " early resources"; }},
    {id:"objective_cache",name:"Objective Cache",base:4,max:5,desc:function(level){ return level ? "Stage objectives grant +" + Math.ceil(level/2) + " bonus EP" : "Stage objectives grant bonus EP"; }},
    {id:"emergency_stores",name:"Emergency Stores",base:5,max:5,desc:function(level){ return level ? "Food and water collapse timer +" + (level*12) + "s" : "Longer shortage grace window"; }},
    {id:"frontier_kit",name:"Frontier Kit",base:6,max:5,desc:function(level){ return level ? "New stages begin with stronger resource footholds (+" + (level*12) + " base pack)" : "Bootstrap new stages with starter supplies"; }},
    {id:"auto_organelles",name:"Organelle Instinct",base:6,max:10,desc:function(level){ return level ? "Auto-buys affordable Cell organelles every " + Math.max(2,11-level) + "s" : "Auto-buys affordable Cell organelles"; }},
    {id:"auto_generators",name:"Infrastructure Foreman",base:7,max:10,desc:function(level){ return level ? "Auto-builds affordable production systems after Cell every " + Math.max(2,12-level) + "s" : "Auto-builds affordable production systems after Cell"; }},
    {id:"rival_scan",name:"Rival Dossiers",base:10,max:5,requiresWin:true,minWins:2,desc:function(level){ return level ? "Rival pressure reveals earlier; dossier perks +" + (level*10) + "%" : "Unlocks better rival reads and dossier perks"; }},
    {id:"counterintel",name:"Counterplay Bureau",base:12,max:5,requiresWin:true,minWins:3,desc:function(level){ return level ? "Rival counter-project costs -" + (level*8) + "%" : "Cheaper sabotage and detente projects"; }},
    {id:"archive_pinning",name:"Memory Anchors",base:8,max:1,requiresWin:true,minWins:2,desc:function(level){ return level ? "Archive favorites unlocked" : "Unlocks archive favorites"; }},
    {id:"cartography",name:"Cartography Office",base:9,max:5,requiresWin:true,minWins:1,desc:function(level){ return level ? "Map expansion costs -" + level + " EP floor-adjusted" : "Cheaper world expansion"; }},
    {id:"project_haste",name:"Project Cadence",base:10,max:5,requiresWin:true,minWins:1,desc:function(level){ return level ? "Special projects complete +" + (level*12) + "%" : "Faster special projects"; }},
    {id:"artifact_attunement",name:"Relic Attunement",base:11,max:5,requiresWin:true,minWins:2,desc:function(level){ return level ? "Artifact, relic, and fusion effects +" + (level*10) + "%" : "Stronger inherited relic effects"; }},
    {id:"rival_brakes",name:"Threat Dampers",base:11,max:5,requiresWin:true,minWins:2,desc:function(level){ return level ? "Rival score growth -" + (level*8) + "%" : "Slows rival victory pressure"; }},
    {id:"imperial_charters",name:"Imperial Charters",base:9,max:5,requiresWin:true,minWins:1,desc:function(level){ return level ? "Empire and Galactic starts gain +" + (level*10) + " logistics / influence / command support" : "Stronger late-stage frontier kits"; }},
    {id:"orbital_stockpiles",name:"Orbital Stockpiles",base:10,max:5,requiresWin:true,minWins:2,desc:function(level){ return level ? "Solar and Galactic starts gain +" + (level*12) + " energy / alloys / data support" : "Better Solar and Galactic launch stockpiles"; }},
    {id:"civic_memory",name:"Civic Memory",base:10,max:5,requiresWin:true,minWins:2,desc:function(level){ return level ? "Late-stage happiness, cohesion, and influence +" + (level*3) + "%" : "Inherited civic stability for late stages"; }},
    {id:"era_control",name:"Era Foresight",base:12,max:5,requiresWin:true,minWins:3,desc:function(level){ return level ? "Forecasts eras and grants " + level + " reroll/bias strength" : "Unlocks era forecast and control after 3 Galactic wins"; }},
    {id:"hybridization",name:"Secondary Lineage Influence",base:20,max:3,requiresWin:true,minWins:4,desc:function(level){ return level ? "Secondary lineage influence +" + (level*5) + "%" : "Unlocks a secondary lineage after 4 Galactic wins"; }},
    {id:"fantasy_pack",name:"Mythic Skin",base:24,max:1,requiresWin:true,minWins:5,desc:function(level){ return level ? "Unlocks the fantasy reskin theme" : "Unlock the fantasy reskin theme"; }}
  ];

  DATA.ENLIGHTENMENT_UPGRADES = [
    {id:"route_templates",name:"Route Templates",cost:4,implemented:true,desc:"Save and auto-apply preferred route plans before seeding a world.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"seed_bias",name:"Seed Bias",cost:6,implemented:true,desc:"Guide cradle conditions toward the intended route before the next life cycle begins.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"compressed_frontiers",name:"Compressed Frontiers",cost:8,implemented:true,desc:"Let mastered early stages collapse into swift preludes once fate has moved beyond them.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"template_priority",name:"Template Priority",cost:9,implemented:true,desc:"Saved route intent biases automated purchases toward the chosen backbone, path, and congress bloc.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"policy_autopilot",name:"Policy Autopilot",cost:10,implemented:true,desc:"Auto-resolve simple doctrines, laws, and low-risk world choices according to foresight plans.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"ftl_primers",name:"FTL Primers",cost:11,implemented:true,desc:"Reveal the cleanest FTL proof line and accelerate the chosen doctrine once the shipyard spine is ready.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"counterplay_network",name:"Counterplay Network",cost:12,implemented:true,desc:"Expose rival counterplay windows early enough for a prepared civilization to answer them.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"bloc_blueprints",name:"Bloc Blueprints",cost:13,implemented:true,desc:"Preview stronger congress alignments so a chosen bloc can form with less drift.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"institutional_memory",name:"Institutional Memory",cost:14,implemented:true,desc:"Reveal deeper institutional tendencies and make political pressure legible before it erupts.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"continuity_engine",name:"Continuity Engine",cost:16,implemented:true,desc:"Default routes and seed plans carry stronger inherited momentum into each new run.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"chronicle_lens",name:"Chronicle Lens",cost:17,implemented:true,desc:"Read archive victories and path signatures as living omens that sharpen future route advice.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"proof_scaffolds",name:"Proof Scaffolds",cost:18,implemented:true,desc:"Surface Solar FTL bottlenecks earlier and lower the burden of proving the final jump.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"pressure_omens",name:"Pressure Omens",cost:15,implemented:true,desc:"Early warnings reveal which subsystem will become the next real bottleneck for the current frontier.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"rival_prophecy",name:"Rival Prophecy",cost:16,implemented:true,desc:"Rival intent becomes easier to read, making their likely pressures and endings less opaque.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"resource_threads",name:"Resource Threads",cost:19,implemented:true,desc:"Surface the exact chains that feed the frontier so shortages can be solved before they become collapse timers.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"synergy_visions",name:"Synergy Visions",cost:20,implemented:true,desc:"Reveal hidden route synergies between lineage, project, and stage spine choices.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"bottleneck_index",name:"Bottleneck Index",cost:21,implemented:true,desc:"Track predicted pressure points, solved bottlenecks, and route execution quality across cycles.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"fate_weaving",name:"Fate Weaving",cost:22,implemented:true,desc:"Convert solved omens into stronger momentum so a well-read run accelerates itself.",lockedText:"Unlocks when Enlightenment is achieved."},
    {id:"destiny_lock",name:"Destiny Lock",cost:24,implemented:true,desc:"Bind a chosen route so its backbone systems and stage-defining choices arrive with less drift.",lockedText:"Unlocks when Enlightenment is achieved."}
  ];

  DATA.FORESIGHT_NODES = [
    {id:"route_templates",lane:"Route",tier:1,upgradeId:"route_templates",requires:[],label:"Save routes",desc:"Record preferred run routes and apply them on seed."},
    {id:"pressure_omens",lane:"Pressure",tier:1,upgradeId:"pressure_omens",requires:[],label:"Read bottlenecks",desc:"Surface the next real stress point before it hits."},
    {id:"seed_bias",lane:"Route",tier:2,upgradeId:"seed_bias",requires:["route_templates"],label:"Bias the cradle",desc:"Push new worlds toward the intended route."},
    {id:"template_priority",lane:"Route",tier:2,upgradeId:"template_priority",requires:["route_templates"],label:"Prioritize purchases",desc:"Make automation favor the chosen long-term backbone."},
    {id:"rival_prophecy",lane:"Conflict",tier:1,upgradeId:"rival_prophecy",requires:[],label:"Read rivals",desc:"Expose likely rival pressure earlier."},
    {id:"counterplay_network",lane:"Conflict",tier:2,upgradeId:"counterplay_network",requires:["rival_prophecy"],label:"Answer pressure",desc:"Open counterplay windows before rivals peak."},
    {id:"bloc_blueprints",lane:"Conflict",tier:2,upgradeId:"bloc_blueprints",requires:["rival_prophecy"],label:"Read blocs",desc:"See which congress blocs will actually hold."},
    {id:"institutional_memory",lane:"Conflict",tier:3,upgradeId:"institutional_memory",requires:["bloc_blueprints"],label:"Track institutions",desc:"Reveal slow-building political strain."},
    {id:"ftl_primers",lane:"Solar Proof",tier:1,upgradeId:"ftl_primers",requires:[],label:"Plan the leap",desc:"Identify the cleanest FTL doctrine sooner."},
    {id:"proof_scaffolds",lane:"Solar Proof",tier:2,upgradeId:"proof_scaffolds",requires:["ftl_primers"],label:"Prove the jump",desc:"Reduce the burden of FTL proof."},
    {id:"policy_autopilot",lane:"Route",tier:3,upgradeId:"policy_autopilot",requires:["template_priority","pressure_omens"],label:"Resolve routine choices",desc:"Handle simple laws, doctrines, and project branches."},
    {id:"continuity_engine",lane:"Continuity",tier:1,upgradeId:"continuity_engine",requires:[],label:"Carry momentum",desc:"Strengthen inherited setup power between runs."},
    {id:"chronicle_lens",lane:"Continuity",tier:2,upgradeId:"chronicle_lens",requires:["continuity_engine"],label:"Read history",desc:"Use archive outcomes as route advice."},
    {id:"compressed_frontiers",lane:"Pressure",tier:3,upgradeId:"compressed_frontiers",requires:["seed_bias","continuity_engine"],label:"Compress mastery",desc:"Turn solved stages into brisk preludes."},
    {id:"resource_threads",lane:"Pressure",tier:2,upgradeId:"resource_threads",requires:["pressure_omens"],label:"Trace the chains",desc:"Expose which exact resource routes will fail first."},
    {id:"synergy_visions",lane:"Route",tier:4,upgradeId:"synergy_visions",requires:["template_priority","chronicle_lens"],label:"See hidden synergies",desc:"Surface useful route, lineage, and project combinations before they are obvious."},
    {id:"bottleneck_index",lane:"Pressure",tier:4,upgradeId:"bottleneck_index",requires:["resource_threads","institutional_memory"],label:"Count solved omens",desc:"Record which predicted bottlenecks have truly been overcome."},
    {id:"fate_weaving",lane:"Continuity",tier:3,upgradeId:"fate_weaving",requires:["bottleneck_index","chronicle_lens"],label:"Weave solved fate",desc:"Turn successfully resolved pressure into inherited momentum."},
    {id:"destiny_lock",lane:"Route",tier:5,upgradeId:"destiny_lock",requires:["synergy_visions","fate_weaving"],label:"Lock the destiny",desc:"Bind the chosen route tightly enough that future cycles drift less and arrive cleaner."}
  ];

  DATA.TRANSCENDENCE_UPGRADES = [
    {id:"shop_autobuyer",name:"Shop Autobuyer",cost:3,implemented:true,desc:"Automatically buys Evolution and Divinity upgrades from saved priorities.",lockedText:"Unlocks with the first Transcendence."},
    {id:"instant_seeding",name:"Instant Seeding",cost:5,implemented:true,desc:"Auto-start new worlds after review and shop steps are resolved.",lockedText:"Unlocks with the first Transcendence."},
    {id:"template_overdrive",name:"Template Overdrive",cost:7,implemented:true,desc:"Template autopilot buys priority systems and techs faster and with a stronger path bias.",lockedText:"Unlocks with the first Transcendence."},
    {id:"mythic_realm",name:"Mythic Realm",cost:7,implemented:true,desc:"Unlock deeper cosmetic rewrites, alternate banners, and divine reskins.",lockedText:"Unlocks with the first Transcendence."},
    {id:"seed_orchestra",name:"Seed Orchestra",cost:8,implemented:true,desc:"Default route, theme, and seed mode are orchestrated together so each new cycle opens in the intended style automatically.",lockedText:"Unlocks with the first Transcendence."},
    {id:"crisis_forecasting",name:"Crisis Forecasting",cost:9,implemented:true,desc:"Galactic crisis windows surface earlier and counterplay gains extra urgency discounts.",lockedText:"Unlocks with the first Transcendence."},
    {id:"theme_curator",name:"Theme Curator",cost:10,implemented:true,desc:"Cosmetic themes become part of the Transcendence loop, with faster mythic presentation swaps and a clearer shop identity.",lockedText:"Unlocks with the first Transcendence."},
    {id:"cosmic_relay",name:"Cosmic Relay",cost:11,implemented:true,desc:"Setup and route defaults ripple forward automatically, making post-reset planning much more hands-off.",lockedText:"Unlocks with the first Transcendence."},
    {id:"mythic_index",name:"Mythic Index",cost:12,implemented:true,desc:"Archive and codex entries gain stronger path-themed cosmetic framing and faster mythic unlock routing.",lockedText:"Unlocks with the first Transcendence."},
    {id:"offering_altars",name:"Offering Altars",cost:9,implemented:true,desc:"Surplus output becomes fit for sacrifice, turning stable abundance into divine momentum.",lockedText:"Unlocks with the first Transcendence."},
    {id:"ritual_reserve",name:"Ritual Reserve",cost:10,implemented:true,desc:"Store extra intervention strength for crisis moments instead of wasting all overflow immediately.",lockedText:"Unlocks with the first Transcendence."},
    {id:"script_lattice",name:"Script Lattice",cost:11,implemented:true,desc:"Divine scripts can react faster and with more expressive priorities than simple autobuyers.",lockedText:"Unlocks with the first Transcendence."},
    {id:"rule_bending",name:"Rule Bending",cost:13,implemented:true,desc:"Softens hard run assumptions: improves all output, project speed, and shortage grace during remixed cycles.",lockedText:"Unlocks with the first Transcendence."}
  ];

  DATA.GENESIS_CRADLE_WORLDS = [
    {id:"oceanic",name:"Oceanic Cradle",desc:"Life begins in abundance and fluid adaptation.",effects:{resourceOutput:{food:0.06,water:0.08},populationGrowth:0.004}},
    {id:"arid",name:"Arid Cradle",desc:"Scarcity teaches discipline before empire.",effects:{resourceOutput:{materials:0.06,knowledge:0.04},upkeepBonus:-0.003}},
    {id:"glacial",name:"Glacial Cradle",desc:"Austere cold slows waste and rewards careful survival.",effects:{resourceOutput:{water:0.05,science:0.04,happiness:0.03},upkeepBonus:-0.004}},
    {id:"lush",name:"Lush Cradle",desc:"Abundance arrives early, but so does dependence on plenty.",effects:{resourceOutput:{food:0.08,medicine:0.05,happiness:0.04}}},
    {id:"toxic",name:"Toxic Cradle",desc:"Poisoned beginnings reward chemistry, medicine, and harsh adaptation.",effects:{resourceOutput:{science:0.05,medicine:0.05,strategic_total:0.04}}},
    {id:"volcanic",name:"Volcanic Cradle",desc:"Violence and heat forge productive civilizations.",effects:{resourceOutput:{production:0.06,energy:0.05},allOutput:0.02}},
    {id:"subterranean",name:"Subterranean Cradle",desc:"Caverns teach dense logistics, hidden wealth, and patient memory.",effects:{resourceOutput:{stone:0.07,materials:0.06,data:0.04}}},
    {id:"crystalline",name:"Crystalline Cradle",desc:"Ordered worlds support insight, memory, and strange resonance.",effects:{resourceOutput:{science:0.06,data:0.05,rare_matter:0.04}}}
  ];
  DATA.GENESIS_PRIME_CONDITIONS = [
    {id:"abundant_water",name:"Abundant Water",desc:"Reservoirs and rivers swell before the first age.",effects:{resourceOutput:{water:0.08,food:0.04},capacity:{water:30}}},
    {id:"rich_minerals",name:"Rich Minerals",desc:"The bones of the world are heavy with promise.",effects:{resourceOutput:{materials:0.08,stone:0.06,alloys:0.04}}},
    {id:"weak_gravity",name:"Weak Gravity",desc:"Expansion and flight come more easily to creation.",effects:{resourceOutput:{energy:0.05,diplomacy:0.04},projectSpeed:0.06}},
    {id:"fungal_bloom",name:"Fungal Bloom",desc:"Life networks early and remembers how to share abundance.",effects:{resourceOutput:{organic_matter:0.08,medicine:0.05,culture:0.04}}},
    {id:"unstable_climate",name:"Unstable Climate",desc:"Volatility hardens resilience and makes adaptation politically central.",effects:{resourceOutput:{cohesion:0.05,energy:0.04,science:0.04}}},
    {id:"sparse_biosphere",name:"Sparse Biosphere",desc:"Life begins thin, making every surviving chain precious.",effects:{resourceOutput:{knowledge:0.06,faith:0.04,divinity_growth:0.03}}}
  ];
  DATA.GENESIS_SACRED_GEOGRAPHY = [
    {id:"wonder_belt",name:"Wonder Belt",desc:"Natural marvels gather near the heartland.",effects:{resourceOutput:{culture:0.06,tourism:0.06,influence:0.04}}},
    {id:"dead_zone",name:"Consecrated Dead Zone",desc:"Dangerous borders harden survivors and keep rivals wary.",effects:{resourceOutput:{military_power:0.06,cohesion:0.04},allOutput:0.01}},
    {id:"rich_rift",name:"Rich Rift",desc:"A sacred extraction belt feeds later industry.",effects:{resourceOutput:{production:0.05,gold:0.05,materials:0.05}}},
    {id:"hidden_ruins",name:"Hidden Ruins",desc:"Forgotten memory waits to be found by the worthy.",effects:{resourceOutput:{knowledge:0.06,faith:0.05,science:0.04}}}
  ];
  DATA.GENESIS_DORMANT_SEEDS = [
    {id:"relic_seed",name:"Dormant Relic",desc:"An ancient relic waits for a compatible civilization.",effects:{resourceOutput:{divinity_knowledge:0.04,divinity_transcendence:0.04}}},
    {id:"garden_seed",name:"Sleeping Garden",desc:"A later biosphere awakening rewards harmony and care.",effects:{resourceOutput:{food:0.06,happiness:0.05,medicine:0.04}}},
    {id:"forge_seed",name:"Buried Forge",desc:"A late industrial bloom lies hidden in the world.",effects:{resourceOutput:{production:0.06,alloys:0.05,energy:0.04}}},
    {id:"veil_seed",name:"Veiled Breach",desc:"A thin place in reality supports later ascension and mystery.",effects:{resourceOutput:{ascension:0.06,faith:0.04,data:0.04}}},
    {id:"ruin_seed",name:"Buried Testament",desc:"A forgotten sacred archive can awaken when memory and law align.",effects:{resourceOutput:{unity:0.05,influence:0.04,data:0.04}}}
  ];

  DATA.GENESIS_UPGRADES = [
    {id:"cradle_memory",name:"Cradle Memory",cost:5,implemented:true,desc:"Selected cradle worlds imprint more strongly on future runs.",lockedText:"Unlocks with the first Genesis."},
    {id:"prime_attunement",name:"Prime Attunement",cost:7,implemented:true,desc:"Prime conditions gain sharper world-shaping effects.",lockedText:"Unlocks with the first Genesis."},
    {id:"sacred_cartography",name:"Sacred Cartography",cost:8,implemented:true,desc:"Sacred geography influences maps and stage identity more reliably.",lockedText:"Unlocks with the first Genesis."},
    {id:"dormant_chorus",name:"Dormant Chorus",cost:9,implemented:true,desc:"Dormant seeds wake earlier and reward compatible development more strongly.",lockedText:"Unlocks with the first Genesis."},
    {id:"genesis_reserves",name:"Genesis Reserves",cost:10,implemented:true,desc:"New worlds begin with stronger reserve stockpiles drawn from authored creation.",lockedText:"Unlocks with the first Genesis."}
  ];

  DATA.WORSHIP_MODES = [
    {id:"devotion",name:"Devotion",desc:"The faithful adore the god through gratitude and steady service.",effects:{resourceOutput:{faith:0.08,happiness:0.05,culture:0.04}}},
    {id:"fear",name:"Fear",desc:"The world obeys because it dreads divine judgment.",effects:{resourceOutput:{military_power:0.06,influence:0.06,cohesion:0.03},happiness:-0.04}},
    {id:"mystery",name:"Mystery",desc:"The god hides behind signs, symbols, and impossible whispers.",effects:{resourceOutput:{science:0.04,faith:0.05,data:0.05}}},
    {id:"duty",name:"Duty",desc:"Worship becomes law, order, and institutional continuity.",effects:{resourceOutput:{cohesion:0.06,influence:0.05,production:0.04}}},
    {id:"transaction",name:"Transaction",desc:"Faith behaves like covenant and exchange, tying wealth to obedience.",effects:{resourceOutput:{gold:0.06,faith:0.05,influence:0.04}}},
    {id:"transcendence",name:"Transcendence",desc:"The civilization worships ascent itself as the highest sacred act.",effects:{resourceOutput:{ascension:0.07,unity:0.05,divinity_transcendence:0.04}}}
  ];
  DATA.DIVINE_LAWS = [
    {id:"law_order",name:"Law of Order",desc:"Stability and disciplined growth define the holy state.",effects:{resourceOutput:{cohesion:0.08,happiness:0.03},populationGrowth:0.003}},
    {id:"law_conquest",name:"Law of Conquest",desc:"Expansion and force are cast as sacred obligations.",effects:{resourceOutput:{military_power:0.08,command:0.06,influence:0.03},happiness:-0.03}},
    {id:"law_plenty",name:"Law of Plenty",desc:"Abundance itself becomes proof of divine favor.",effects:{resourceOutput:{food:0.08,production:0.05,gold:0.04}}},
    {id:"law_revelation",name:"Law of Revelation",desc:"Knowledge, archives, and holy inquiry are prized above certainty.",effects:{resourceOutput:{science:0.07,data:0.06,faith:0.03}}},
    {id:"law_jubilee",name:"Law of Jubilee",desc:"Cycles of forgiveness and renewal soften collapse.",effects:{resourceOutput:{happiness:0.08,culture:0.05,medicine:0.04}}}
  ];
  DATA.MIRACLES = [
    {id:"bless_harvests",name:"Bless Harvests",desc:"Pour grace into mortal abundance.",cost:{divinity_growth:18,divinity_harmony:14},effects:{grant:{food:180,water:140,happiness:20}}},
    {id:"sanctify_expansion",name:"Sanctify Expansion",desc:"Consecrate the next leap of empire.",cost:{divinity_wealth:14,divinity_conquest:16},effects:{grant:{influence:80,production:120,cohesion:20}}},
    {id:"jubilant_peace",name:"Jubilant Peace",desc:"Suspend unrest before it becomes fracture.",cost:{divinity_harmony:20,divinity_knowledge:10},effects:{clearShortage:20,grant:{happiness:35,cohesion:35,faith:25}}},
    {id:"apocalypse_rite",name:"Apocalypse Rite",desc:"Crash divine force through a crisis point and demand victory anyway.",cost:{divinity_conquest:18,divinity_transcendence:18},effects:{surgeSeconds:40,surgeOutput:0.45}},
    {id:"declare_jubilee",name:"Declare Jubilee",desc:"Reset civic strain through pardon, sacred plenty, and public relief.",cost:{divinity_harmony:16,divinity_wealth:14},effects:{grant:{happiness:28,cohesion:24,gold:120},clearShortage:12}},
    {id:"curse_dissent",name:"Curse Dissent",desc:"Break a brewing fracture with fear, spectacle, and hard command.",cost:{divinity_conquest:16,divinity_knowledge:12},effects:{grant:{command:70,military_power:90,cohesion:18}}}
  ];
  DATA.HERESY_RESPONSES = [
    {id:"suppress",name:"Suppress",desc:"Crush dissent before it spreads.",effects:{resourceOutput:{cohesion:0.06,military_power:0.04},happiness:-0.04}},
    {id:"absorb",name:"Absorb",desc:"Fold the new interpretation into orthodoxy.",effects:{resourceOutput:{faith:0.06,culture:0.05,happiness:0.02}}},
    {id:"legalize",name:"Legalize",desc:"Permit divergence and gain complexity.",effects:{resourceOutput:{science:0.05,data:0.04,influence:0.03},cohesion:-0.03}},
    {id:"weaponize",name:"Weaponize",desc:"Aim heresy outward as a sacred instrument.",effects:{resourceOutput:{military_power:0.06,influence:0.05,faith:0.03}}}
  ];
  DATA.APOTHEOSIS_UPGRADES = [
    {id:"worship_foundations",name:"Worship Foundations",cost:5,implemented:true,desc:"Prayer and follower output deepen as the divine becomes public.",lockedText:"Unlocks with the first Apotheosis."},
    {id:"law_tablets",name:"Law Tablets",cost:7,implemented:true,desc:"Divine law slots increase and chosen laws bind more cleanly.",lockedText:"Unlocks with the first Apotheosis."},
    {id:"miracle_reservoir",name:"Miracle Reservoir",cost:8,implemented:true,desc:"Miracle charges store more deeply and return faster.",lockedText:"Unlocks with the first Apotheosis."},
    {id:"heresy_doctrine",name:"Heresy Doctrine",cost:9,implemented:true,desc:"Heresy can be turned into usable pressure instead of pure instability.",lockedText:"Unlocks with the first Apotheosis."},
    {id:"temple_economy",name:"Temple Economy",cost:10,implemented:true,desc:"Faith, culture, and wealth feed one another through worship institutions.",lockedText:"Unlocks with the first Apotheosis."}
  ];

  DATA.FUTURE_LAYER_UPGRADES = {
    singularity:[
      {id:"relic_sockets",name:"Relic Sockets",cost:5,implemented:true,desc:"Future relic loadouts open with stronger baseline flexibility.",lockedText:"Unlocks with Singularity."},
      {id:"compression_lattice",name:"Compression Lattice",cost:7,implemented:true,desc:"Mastered stage bands abstract faster and with less loss.",lockedText:"Unlocks with Singularity."},
      {id:"logic_core_seed",name:"Logic Core Seed",cost:9,implemented:true,desc:"Automation priorities awaken earlier in a fresh universe.",lockedText:"Unlocks with Singularity."},
      {id:"parallel_memory",name:"Parallel Memory",cost:11,implemented:true,desc:"Compressed stages preserve more useful throughput while skipped.",lockedText:"Unlocks with Singularity."},
      {id:"relic_resonance",name:"Relic Resonance",cost:12,implemented:true,desc:"Equipped relics interact more strongly with one another.",lockedText:"Unlocks with Singularity."}
    ],
    omnipotence:[
      {id:"hybrid_stabilizers",name:"Hybrid Stabilizers",cost:5,implemented:true,desc:"Mixed identities suffer less immediate contradiction strain.",lockedText:"Unlocks with Omnipotence."},
      {id:"lineage_overtones",name:"Lineage Overtones",cost:7,implemented:true,desc:"Secondary inheritance leaves a stronger mark on the run.",lockedText:"Unlocks with Omnipotence."},
      {id:"contradiction_walls",name:"Contradiction Walls",cost:9,implemented:true,desc:"Instability rises slower while hybrid systems are still immature.",lockedText:"Unlocks with Omnipotence."},
      {id:"chimera_treasury",name:"Chimera Treasury",cost:11,implemented:true,desc:"Hybrid identities feed richer late-stage economic blends.",lockedText:"Unlocks with Omnipotence."},
      {id:"forbidden_accords",name:"Forbidden Accords",cost:12,implemented:true,desc:"Conflicting laws and blocs strain each other less sharply.",lockedText:"Unlocks with Omnipotence."}
    ],
    divinity:[
      {id:"prayer_channels",name:"Prayer Channels",cost:5,implemented:true,desc:"Worship output organizes itself into clearer divine streams.",lockedText:"Unlocks with Divinity."},
      {id:"mask_gallery",name:"Mask Gallery",cost:7,implemented:true,desc:"Divine identities become easier to switch and sustain.",lockedText:"Unlocks with Divinity."},
      {id:"polarity_crown",name:"Polarity Crown",cost:9,implemented:true,desc:"Preferred worship polarity shapes the whole civilization more strongly.",lockedText:"Unlocks with Divinity."},
      {id:"choir_reservoir",name:"Choir Reservoir",cost:11,implemented:true,desc:"Prayer pools can be held and routed with less loss.",lockedText:"Unlocks with Divinity."},
      {id:"awe_procession",name:"Awe Procession",cost:12,implemented:true,desc:"Cosmic pageantry makes devotion and wonder feed one another.",lockedText:"Unlocks with Divinity."}
    ],
    infinity:[
      {id:"echo_index",name:"Echo Index",cost:5,implemented:true,desc:"Past histories leave clearer reusable residues.",lockedText:"Unlocks with Infinity."},
      {id:"fork_memory",name:"Fork Memory",cost:7,implemented:true,desc:"Branched lessons are easier to preserve into the main line.",lockedText:"Unlocks with Infinity."},
      {id:"future_credit",name:"Future Credit",cost:9,implemented:true,desc:"Borrowed strength arrives with a softer immediate penalty.",lockedText:"Unlocks with Infinity."},
      {id:"echo_market",name:"Echo Market",cost:11,implemented:true,desc:"Useful residues from earlier histories are easier to cash into momentum.",lockedText:"Unlocks with Infinity."},
      {id:"fork_oracles",name:"Fork Oracles",cost:12,implemented:true,desc:"Possible futures reveal more useful branch hints before commitment.",lockedText:"Unlocks with Infinity."}
    ],
    eternity:[
      {id:"canon_resonance",name:"Canon Resonance",cost:5,implemented:true,desc:"Preserved truths bleed back into every new universe.",lockedText:"Unlocks with Eternity."},
      {id:"testament_depth",name:"Testament Depth",cost:7,implemented:true,desc:"The final scripture can hold more clauses before it fractures.",lockedText:"Unlocks with Eternity."},
      {id:"permanence_threads",name:"Permanence Threads",cost:9,implemented:true,desc:"More chosen truths survive full-universe resets.",lockedText:"Unlocks with Eternity."},
      {id:"gallery_of_worlds",name:"Gallery of Worlds",cost:11,implemented:true,desc:"Preserved universes become richer archives with stronger bleedthrough.",lockedText:"Unlocks with Eternity."},
      {id:"mercy_of_return",name:"Mercy of Return",cost:12,implemented:true,desc:"A reset universe begins with gentler early hardship and faster recognition.",lockedText:"Unlocks with Eternity."}
    ]
  };
  DATA.LOGIC_CORES = [
    {id:"balanced",name:"Balanced Core",desc:"Keeps the civilization broadly stable while growing."},
    {id:"growth",name:"Growth Core",desc:"Biases automation toward population, food, and growth loops."},
    {id:"stability",name:"Stability Core",desc:"Protects happiness, cohesion, and survival before greed."},
    {id:"conquest",name:"Conquest Core",desc:"Values command, military, and rival counterplay."},
    {id:"science",name:"Science Core",desc:"Pushes research, data, and project timing."},
    {id:"trade",name:"Trade Core",desc:"Prefers gold, production, and inter-stage throughput."},
    {id:"faith",name:"Faith Core",desc:"Favors prayer, culture, and divine-channel generation."}
  ];
  DATA.OMNIPOTENCE_STANCES = [
    {id:"contained",name:"Contained Chimera",desc:"Hybrid power grows slowly, but contradiction stays manageable.",effects:{allOutput:0.03,resourceOutput:{cohesion:0.04,happiness:0.03},upkeepBonus:-0.004}},
    {id:"adaptive",name:"Adaptive Synthesis",desc:"Balanced hybridization for broad but risky strength.",effects:{allOutput:0.05,resourceOutput:{science:0.04,production:0.04,faith:0.04},upkeepBonus:0.004}},
    {id:"reckless",name:"Reckless Convergence",desc:"Push contradictory lineages together for extreme output and extreme instability.",effects:{allOutput:0.09,resourceOutput:{military_power:0.06,command:0.05,data:0.05,happiness:-0.07,cohesion:-0.07},upkeepBonus:0.012}}
  ];
  DATA.DIVINE_MASKS = [
    {id:"radiant_sovereign",name:"Radiant Sovereign",desc:"The god is seen as a glorious ruler.",effects:{resourceOutput:{faith:0.08,happiness:0.05,influence:0.05}},routingBias:{harmony:8,growth:4},preferredPreset:"harmony",preferredMiracle:"jubilant_peace",preferredBloc:"biological",preferredAscensionPath:"biological",behaviorText:"Favors civic calm, miracle-led stabilization, and orderly worship before strain becomes fracture.",signatureEffects:{resourceOutput:{happiness:0.03,cohesion:0.03}}},
    {id:"hidden_architect",name:"Hidden Architect",desc:"The divine hand is subtle, structural, and patient.",effects:{resourceOutput:{science:0.06,data:0.06,production:0.04}},routingBias:{knowledge:10,wealth:3},preferredPreset:"knowledge",preferredMiracle:"sanctify_expansion",preferredBloc:"synthetic",preferredAscensionPath:"dimensional",behaviorText:"Leans toward long projects, hidden throughput, and quiet structural correction over overt divine spectacle.",signatureEffects:{projectSpeed:0.08,resourceOutput:{science:0.03,data:0.03}}},
    {id:"devouring_judge",name:"Devouring Judge",desc:"Fear and punishment become the language of power.",effects:{resourceOutput:{military_power:0.07,command:0.05,faith:0.04,happiness:-0.04}},routingBias:{conquest:10,transcendence:3},preferredPreset:"conquest",preferredMiracle:"apocalypse_rite",preferredBloc:"psionic",preferredAscensionPath:"energetic",behaviorText:"Prefers crisis answers, forceful miracles, and fear-fed routing once the world starts to crack.",signatureEffects:{resourceOutput:{military_power:0.03,command:0.03,divinity_conquest:0.03}}},
    {id:"nurturing_creator",name:"Nurturing Creator",desc:"Creation flourishes under gentler guidance.",effects:{resourceOutput:{food:0.06,water:0.06,medicine:0.06,happiness:0.04}},routingBias:{growth:9,harmony:5},preferredPreset:"growth",preferredMiracle:"bless_harvests",preferredBloc:"biological",preferredAscensionPath:"biological",behaviorText:"Protects abundance, smooths shortages, and rewards patient flourishing over spectacle.",signatureEffects:{resourceOutput:{food:0.03,water:0.03,medicine:0.03}}},
    {id:"cold_lawgiver",name:"Cold Lawgiver",desc:"Reality obeys rules more readily than emotions.",effects:{resourceOutput:{cohesion:0.06,science:0.04,unity:0.05}},routingBias:{harmony:6,knowledge:6},preferredPreset:"balanced",preferredMiracle:"jubilant_peace",preferredBloc:"synthetic",preferredAscensionPath:"synthetic",behaviorText:"Pushes balanced routing, doctrine stability, and institutional control instead of emotional extremes.",signatureEffects:{resourceOutput:{cohesion:0.03,unity:0.03},costScale:-0.01}},
    {id:"trickster_star",name:"Trickster Star",desc:"Mystery and ambition mingle in divine worship.",effects:{resourceOutput:{culture:0.06,gold:0.05,diplomacy:0.05}},routingBias:{wealth:6,transcendence:6},preferredPreset:"wealth",preferredMiracle:"sanctify_expansion",preferredBloc:"dimensional",preferredAscensionPath:"psionic",behaviorText:"Prefers volatile surplus, opportunistic routing, and glittering interventions that turn instability into leverage.",signatureEffects:{resourceOutput:{gold:0.03,culture:0.03,divinity_wealth:0.03}}}
  ];
  DATA.PRAYER_POLARITIES = [
    {id:"reverence",name:"Reverence",desc:"Orderly devotion fuels stability and prayer.",effects:{resourceOutput:{divinity_harmony:0.08,divinity_growth:0.04,happiness:0.04}}},
    {id:"fear",name:"Fear",desc:"Terror makes power arrive fast and harshly.",effects:{resourceOutput:{divinity_conquest:0.08,command:0.05,faith:0.03,happiness:-0.04}}},
    {id:"wonder",name:"Wonder",desc:"Awe fuels knowledge and cosmic ambition.",effects:{resourceOutput:{divinity_knowledge:0.08,science:0.05,data:0.04}}},
    {id:"obedience",name:"Obedience",desc:"Rigid worship stabilizes vast systems.",effects:{resourceOutput:{divinity_harmony:0.05,cohesion:0.06,influence:0.05}}},
    {id:"ambition",name:"Ambition",desc:"Desire for ascent drives wealth and conquest.",effects:{resourceOutput:{divinity_wealth:0.08,gold:0.05,alloys:0.04}}},
    {id:"mystery",name:"Mystery",desc:"The unknowable divine favors transcendence.",effects:{resourceOutput:{divinity_transcendence:0.09,faith:0.04,culture:0.04}}}
  ];
  DATA.INFINITY_ECHOES = [
    {id:"growth_echo",name:"Growth Echo",desc:"A past civilization that mastered expansion.",effects:{resourceOutput:{food:0.05,population:0.05,divinity_growth:0.04}}},
    {id:"science_echo",name:"Science Echo",desc:"A past civilization that solved knowledge chains.",effects:{resourceOutput:{science:0.06,data:0.05,divinity_knowledge:0.04}}},
    {id:"conquest_echo",name:"Conquest Echo",desc:"A past civilization that prevailed through force.",effects:{resourceOutput:{military_power:0.06,command:0.05,divinity_conquest:0.04}}},
    {id:"trade_echo",name:"Trade Echo",desc:"A past civilization that optimized exchange.",effects:{resourceOutput:{gold:0.06,production:0.04,divinity_wealth:0.04}}},
    {id:"stability_echo",name:"Stability Echo",desc:"A past civilization that never cracked under pressure.",effects:{resourceOutput:{happiness:0.05,cohesion:0.06,divinity_harmony:0.04}}},
    {id:"faith_echo",name:"Faith Echo",desc:"A past civilization that fed the divine most directly.",effects:{resourceOutput:{faith:0.06,culture:0.05,divinity_transcendence:0.04}}}
  ];
  DATA.FUTURE_DEBT_TIERS = [
    {id:"none",name:"No Debt",desc:"Borrow nothing from the future.",effects:{}},
    {id:"minor",name:"Minor Debt",desc:"Take a small future advance now and repay it with extra strain later.",effects:{allOutput:0.05,resourceOutput:{happiness:-0.02,cohesion:-0.02}}},
    {id:"major",name:"Major Debt",desc:"Borrow aggressively and live with heavier instability.",effects:{allOutput:0.1,resourceOutput:{happiness:-0.05,cohesion:-0.05,faith:-0.03}}},
    {id:"cataclysmic",name:"Cataclysmic Debt",desc:"Force a future miracle into the present and risk long repayment.",effects:{allOutput:0.16,resourceOutput:{happiness:-0.09,cohesion:-0.08,command:-0.05}}}
  ];
  DATA.ETERNITY_TESTAMENT_CLAUSES = [
    {id:"growth_above_all",name:"Growth Above All",desc:"The final universe exalts expansion and thriving life.",effects:{resourceOutput:{food:0.06,population:0.06,divinity_growth:0.04}}},
    {id:"law_above_desire",name:"Law Above Desire",desc:"Order is the core truth of the cosmos.",effects:{resourceOutput:{cohesion:0.06,influence:0.05,unity:0.05}}},
    {id:"wonder_without_end",name:"Wonder Without End",desc:"Awe and discovery remain sacred forever.",effects:{resourceOutput:{science:0.06,data:0.05,divinity_knowledge:0.04}}},
    {id:"memory_of_struggle",name:"Memory of Struggle",desc:"Hardship becomes a permanent engine of strength.",effects:{allOutput:0.04,resourceOutput:{faith:0.04,divinity_transcendence:0.05}}},
    {id:"mercy_in_power",name:"Mercy in Power",desc:"Power is tempered by care, not only force.",effects:{resourceOutput:{happiness:0.05,medicine:0.04,divinity_harmony:0.05}}},
    {id:"victory_requires_will",name:"Victory Requires Will",desc:"Only forceful civilizations deserve endurance.",effects:{resourceOutput:{military_power:0.06,command:0.05,divinity_conquest:0.04}}}
  ];
  DATA.PERMANENCE_WEAVES = [
    {id:"woven_law",name:"Woven Law",desc:"Preserve one divine law across total resets.",effects:{resourceOutput:{influence:0.04,unity:0.04}}},
    {id:"woven_lineage",name:"Woven Lineage",desc:"Preserve a lineage tendency into the next universe.",effects:{resourceOutput:{culture:0.04,cohesion:0.03}}},
    {id:"woven_relic",name:"Woven Relic",desc:"Preserve one relic socket effect into the next universe.",effects:{resourceOutput:{data:0.04,production:0.04}}},
    {id:"woven_memory",name:"Woven Memory",desc:"Preserve one canonized memory as a living truth.",effects:{resourceOutput:{faith:0.05,divinity_knowledge:0.04}}}
  ];
  DATA.OMNIPOTENCE_INSTABILITY_EVENTS = [
    {id:"identity_schism",name:"Identity Schism",desc:"Hybrid elites disagree over what the civilization is becoming.",responses:[
      {id:"suppress",name:"Suppress the Schism",effects:{resourceOutput:{command:0.04,military_power:0.03,happiness:-0.05}}},
      {id:"mediate",name:"Mediate a New Identity",effects:{resourceOutput:{cohesion:0.06,culture:0.05}}},
      {id:"weaponize",name:"Weaponize the Contradiction",effects:{resourceOutput:{science:0.05,production:0.05,cohesion:-0.04}}}
    ]},
    {id:"gene_heresy",name:"Gene Heresy",desc:"Mutually incompatible bloodlines produce sacred and political panic.",responses:[
      {id:"purify",name:"Purify the Stock",effects:{resourceOutput:{happiness:0.03,cohesion:0.03,population:-0.04}}},
      {id:"stabilize",name:"Stabilize the Hybrid",effects:{resourceOutput:{medicine:0.05,science:0.04}}},
      {id:"exalt",name:"Exalt the Aberration",effects:{allOutput:0.05,resourceOutput:{faith:0.04,happiness:-0.05}}}
    ]},
    {id:"chimera_bureau",name:"Chimera Bureau Revolt",desc:"Administrators cannot keep pace with overlapping laws, needs, and instincts.",responses:[
      {id:"centralize",name:"Centralize Doctrine",effects:{resourceOutput:{influence:0.05,command:0.04}}},
      {id:"delegate",name:"Delegate to Castes",effects:{resourceOutput:{production:0.05,gold:0.04,cohesion:-0.03}}},
      {id:"adapt",name:"Rewrite the Rules",effects:{resourceOutput:{science:0.05,unity:0.04}}}
    ]},
    {id:"avian_lithoid_schism",name:"Sky-Stone Schism",pair:["avian","lithoid"],desc:"Aerial expansion and mineral permanence produce incompatible empire instincts.",responses:[
      {id:"anchor",name:"Anchor the Flocks",effects:{resourceOutput:{cohesion:0.05,stone:0.05,logistics:-0.03}},legacy:{id:"sky_stone_nest",name:"Sky-Stone Nest",type:"blessing",desc:"The contradiction was disciplined into a stable vertical homeland.",effects:{resourceOutput:{cohesion:0.02,stone:0.02}}}},
      {id:"lift",name:"Lift the Quarries",effects:{resourceOutput:{logistics:0.05,energy:0.04,happiness:-0.03}},legacy:{id:"lifted_faultlines",name:"Lifted Faultlines",type:"scar",desc:"Extraction became flight-worthy, but the world remembers the strain.",effects:{resourceOutput:{logistics:0.02,energy:0.02,happiness:-0.02}}}},
      {id:"canonize",name:"Canonize the Contradiction",effects:{resourceOutput:{faith:0.04,culture:0.04,science:0.03}},legacy:{id:"sky_stone_canon",name:"Sky-Stone Canon",type:"blessing",desc:"A once-impossible union became doctrine and memory.",effects:{resourceOutput:{faith:0.02,culture:0.02,science:0.01}}}}
    ]},
    {id:"plantoid_toxoid_bloom",name:"Bloom of Poison",pair:["plantoid","toxoid"],desc:"Life-giving growth and toxic adaptation create a civilization both fertile and feared.",responses:[
      {id:"prune",name:"Prune the Bloom",effects:{resourceOutput:{food:0.04,happiness:0.03,pollution:-0.05}}},
      {id:"weaponize",name:"Weaponize the Bloom",effects:{resourceOutput:{science:0.05,military_power:0.04,pollution:0.03}}},
      {id:"cultivate",name:"Cultivate Symbiosis",effects:{resourceOutput:{medicine:0.05,culture:0.04,cohesion:0.03}}}
    ]},
    {id:"spirit_machine_breach",name:"Spirit-Machine Breach",pair:["fungoid","humanoid"],desc:"Distributed instinct and planned civic order begin producing incompatible sacred bureaucracies.",responses:[
      {id:"ritualize",name:"Ritualize Administration",effects:{resourceOutput:{faith:0.05,influence:0.04,science:-0.02}}},
      {id:"modularize",name:"Modularize Governance",effects:{resourceOutput:{science:0.05,production:0.04,cohesion:-0.03}}},
      {id:"reconcile",name:"Reconcile the Orders",effects:{resourceOutput:{unity:0.05,culture:0.04,happiness:0.03}}}
    ]},
    {id:"ancestor_tide_revolt",name:"Ancestor Tide Revolt",pair:["necroid","aquatic"],desc:"Death-venerating memory and tidal adaptation produce rites of inheritance that no shore can contain.",responses:[
      {id:"entomb",name:"Entomb the Tide-Kings",effects:{resourceOutput:{cohesion:0.05,faith:0.04,food:-0.03}},legacy:{id:"tidal_catacombs",name:"Tidal Catacombs",type:"scar",desc:"The dead were contained, but every shore remembers what was buried.",effects:{resourceOutput:{faith:0.02,cohesion:0.01,food:-0.01}}}},
      {id:"float",name:"Float the Ancestors",effects:{resourceOutput:{culture:0.05,water:0.05,happiness:-0.03}},legacy:{id:"drifting_ancestor_choirs",name:"Drifting Ancestor Choirs",type:"blessing",desc:"Ancestral memory now moves with the tide itself.",effects:{resourceOutput:{culture:0.02,water:0.02,divinity_harmony:0.02}}}},
      {id:"drown",name:"Drown the Old Line",effects:{resourceOutput:{military_power:0.05,science:0.04,cohesion:-0.04}},legacy:{id:"sunken_succession",name:"Sunken Succession",type:"scar",desc:"Power survived, but the old line became a cautionary abyss.",effects:{resourceOutput:{military_power:0.02,science:0.01,cohesion:-0.02}}}}
    ]},
    {id:"caustic_fault_communion",name:"Caustic Fault Communion",pair:["toxoid","lithoid"],desc:"Toxic adaptation and mineral permanence awaken sects that want the world itself to become a weapon.",responses:[
      {id:"seal",name:"Seal the Faults",effects:{resourceOutput:{stone:0.05,cohesion:0.04,pollution:-0.04}}},
      {id:"mine",name:"Mine the Corruption",effects:{resourceOutput:{materials:0.05,alloys:0.04,happiness:-0.04}}},
      {id:"anoint",name:"Anoint the Poison",effects:{resourceOutput:{faith:0.04,military_power:0.04,science:0.03}}}
    ]},
    {id:"greenhouse_paradox",name:"Greenhouse Paradox",pair:["extremophile","plantoid"],desc:"Life learns to love impossible climates and begins outgrowing the world it was meant to inhabit.",responses:[
      {id:"trim",name:"Trim the Overgrowth",effects:{resourceOutput:{food:0.05,production:0.03,population:-0.03}},legacy:{id:"disciplined_canopy",name:"Disciplined Canopy",type:"blessing",desc:"Runaway life learned restraint without losing its abundance.",effects:{resourceOutput:{food:0.02,production:0.01}}}},
      {id:"temper",name:"Temper the Climate",effects:{resourceOutput:{water:0.05,medicine:0.04,energy:-0.03}},legacy:{id:"tempered_ecosphere",name:"Tempered Ecosphere",type:"blessing",desc:"Impossible climates were taught to breathe more gently.",effects:{resourceOutput:{water:0.02,medicine:0.02}}}},
      {id:"exalt",name:"Exalt the Impossible Bloom",effects:{resourceOutput:{culture:0.05,science:0.04,happiness:-0.04}},legacy:{id:"bloom_fever",name:"Bloom Fever",type:"scar",desc:"The world now remembers the ecstasy of unbounded life.",effects:{resourceOutput:{culture:0.02,science:0.01,happiness:-0.02}}}}
    ]},
    {id:"shell_swarm_succession",name:"Shell-Swarm Succession",pair:["molluscoid","arthropoid"],desc:"Distributed clutch-loyalties and shell-bound dynasties produce endless claims to sacred authority.",responses:[
      {id:"cull",name:"Cull the Claimants",effects:{resourceOutput:{command:0.05,cohesion:0.03,happiness:-0.04}}},
      {id:"broker",name:"Broker New Broods",effects:{resourceOutput:{gold:0.05,influence:0.04,cohesion:-0.02}}},
      {id:"federate",name:"Federate the Swarms",effects:{resourceOutput:{unity:0.05,culture:0.04,production:0.03}}}
    ]},
    {id:"sepulcher_citizenship",name:"Sepulcher Citizenship",pair:["necroid","humanoid"],desc:"The dead demand political voice, and the living cannot decide whether reverence is law or paralysis.",responses:[
      {id:"restrict",name:"Restrict the Dead",effects:{resourceOutput:{influence:0.05,happiness:0.03,faith:-0.03}},legacy:{id:"sealed_senates",name:"Sealed Senates",type:"scar",desc:"Order held, but political memory became colder and narrower.",effects:{resourceOutput:{influence:0.02,happiness:0.01,faith:-0.01}}}},
      {id:"enshrine",name:"Enshrine the Ancestors",effects:{resourceOutput:{faith:0.05,culture:0.04,science:-0.02}},legacy:{id:"ancestor_charter",name:"Ancestor Charter",type:"blessing",desc:"The dead were given lawful reverence and left a stable sacred constitution.",effects:{resourceOutput:{faith:0.02,culture:0.02,unity:0.01}}}},
      {id:"count",name:"Count Every Voice",effects:{resourceOutput:{unity:0.05,data:0.04,cohesion:-0.03}},legacy:{id:"crowded_afterlife",name:"Crowded Afterlife",type:"scar",desc:"Every memory gained standing, and governance has never been simple since.",effects:{resourceOutput:{data:0.02,unity:0.01,cohesion:-0.01}}}}
    ]},
    {id:"glass_tide_accord",name:"Glass-Tide Accord",pair:["lithoid","aquatic"],desc:"Stone permanence and tidal adaptation compete over whether civilization should anchor or flow.",responses:[
      {id:"reef",name:"Raise the Reefs",effects:{resourceOutput:{stone:0.05,water:0.04,logistics:-0.02}},legacy:{id:"reef_foundations",name:"Reef Foundations",type:"blessing",desc:"A stable mineral tidefront remains beneath later worlds.",effects:{resourceOutput:{stone:0.02,water:0.01}}}},
      {id:"current",name:"Trust the Current",effects:{resourceOutput:{logistics:0.05,culture:0.04,cohesion:-0.03}},legacy:{id:"wandering_estuaries",name:"Wandering Estuaries",type:"scar",desc:"Trade routes learned freedom faster than order could keep up.",effects:{resourceOutput:{logistics:0.02,culture:0.01,cohesion:-0.01}}}},
      {id:"crystallize",name:"Crystallize the Tide",effects:{resourceOutput:{science:0.04,faith:0.04,energy:0.03}},legacy:{id:"tidal_crystal_liturgy",name:"Tidal Crystal Liturgy",type:"blessing",desc:"A sacred geometry of flow and permanence endures.",effects:{resourceOutput:{science:0.02,faith:0.01}}}}
    ]},
    {id:"sacred_exoschema",name:"Sacred Exoschema",pair:["humanoid","arthropoid"],desc:"Individual ambition and swarm discipline collide over what a person is allowed to be.",responses:[
      {id:"individuate",name:"Protect the Singular",effects:{resourceOutput:{happiness:0.05,science:0.03,cohesion:-0.03}},legacy:{id:"singular_citizenship",name:"Singular Citizenship",type:"blessing",desc:"The right to stand apart became a permanent civic strength.",effects:{resourceOutput:{happiness:0.02,science:0.01}}}},
      {id:"hive",name:"Consecrate the Hive",effects:{resourceOutput:{production:0.05,cohesion:0.04,happiness:-0.03}},legacy:{id:"hive_obligation",name:"Hive Obligation",type:"scar",desc:"Efficiency improved, but later societies feel the weight of duty.",effects:{resourceOutput:{production:0.02,cohesion:0.01,happiness:-0.01}}}},
      {id:"charter",name:"Write a Shared Carapace",effects:{resourceOutput:{unity:0.05,culture:0.04,command:0.03}},legacy:{id:"shared_carapace_charter",name:"Shared Carapace Charter",type:"blessing",desc:"A hybrid civic shell lets later worlds coordinate without erasing the self.",effects:{resourceOutput:{unity:0.02,command:0.01}}}}
    ]},
    {id:"salt_and_ember_covenant",name:"Salt and Ember Covenant",pair:["aquatic","extremophile"],desc:"Ocean-born adaptation and hostile-world endurance disagree over whether life should flow around danger or root itself inside it.",responses:[
      {id:"tide",name:"Follow the Tidal Memory",effects:{resourceOutput:{food:0.05,water:0.05,happiness:0.03}},legacy:{id:"tidal_memory_covenant",name:"Tidal Memory Covenant",type:"blessing",desc:"The hybrid remembers when to bend, withdraw, and survive.",effects:{resourceOutput:{water:0.02,happiness:0.01,food:0.01}}}},
      {id:"forge",name:"Temper the Ash Habitat",effects:{resourceOutput:{materials:0.05,energy:0.04,happiness:-0.03}},legacy:{id:"ash_habitat_doctrine",name:"Ash Habitat Doctrine",type:"scar",desc:"Survival in impossible climates left later worlds harder and less forgiving.",effects:{resourceOutput:{materials:0.02,energy:0.01,happiness:-0.01}}}},
      {id:"brine",name:"Sanctify the Brine Hearth",effects:{resourceOutput:{faith:0.04,cohesion:0.04,food:0.03}},legacy:{id:"brine_hearth_rite",name:"Brine Hearth Rite",type:"blessing",desc:"A sacred habitat culture now thrives where ordinary life would fail.",effects:{resourceOutput:{faith:0.02,cohesion:0.01,food:0.01}}}}
    ]},
    {id:"grave_bloom_engine",name:"Grave-Bloom Engine",pair:["necroid","plantoid"],desc:"Death-fed memory and patient growth interlock, forcing the world to decide whether decay should nourish continuity or be sealed away forever.",responses:[
      {id:"compost",name:"Feed the Bloom",effects:{resourceOutput:{food:0.05,biomass:0.04,faith:0.03}},legacy:{id:"compost_of_ancestors",name:"Compost of Ancestors",type:"blessing",desc:"The dead became a fertile covenant with the living.",effects:{resourceOutput:{food:0.02,biomass:0.01,faith:0.01}}}},
      {id:"sepulcher",name:"Seal the Garden Tombs",effects:{resourceOutput:{cohesion:0.05,influence:0.04,food:-0.03}},legacy:{id:"garden_tomb_protocol",name:"Garden Tomb Protocol",type:"scar",desc:"Life and death were reconciled through strict and beautiful containment.",effects:{resourceOutput:{cohesion:0.02,influence:0.01,food:-0.01}}}},
      {id:"orchard",name:"Raise the Orchard of Memory",effects:{resourceOutput:{culture:0.05,faith:0.04,happiness:0.03}},legacy:{id:"orchard_of_memory",name:"Orchard of Memory",type:"blessing",desc:"Ancestry now blooms as living scripture instead of remaining buried.",effects:{resourceOutput:{culture:0.02,faith:0.01,happiness:0.01}}}}
    ]},
    {id:"caustic_funeral_treaty",name:"Caustic Funeral Treaty",pair:["toxoid","necroid"],desc:"Poisoned pragmatism and ancestral death-law produce states where memory itself becomes hazardous.",responses:[
      {id:"embalm",name:"Embalm the Hazard",effects:{resourceOutput:{medicine:0.05,faith:0.04,pollution:-0.03}},legacy:{id:"embalmed_poison_rites",name:"Embalmed Poison Rites",type:"blessing",desc:"Danger was ritualized into a stable sacrament.",effects:{resourceOutput:{medicine:0.02,faith:0.01,pollution:-0.01}}}},
      {id:"weaponize",name:"Weaponize the Graves",effects:{resourceOutput:{military_power:0.05,science:0.04,happiness:-0.03}},legacy:{id:"grave_toxin_doctrine",name:"Grave-Toxin Doctrine",type:"scar",desc:"The dead now arm the living, and every victory tastes of corrosion.",effects:{resourceOutput:{military_power:0.02,science:0.01,happiness:-0.01}}}},
      {id:"vigil",name:"Keep the Vigilous Distillate",effects:{resourceOutput:{data:0.04,faith:0.04,cohesion:0.03}},legacy:{id:"vigilous_distillate",name:"Vigilous Distillate",type:"blessing",desc:"Memory and poison were reconciled into a lucid civic rite.",effects:{resourceOutput:{data:0.02,faith:0.01,cohesion:0.01}}}}
    ]},
    {id:"fault_of_endurance",name:"Fault of Endurance",pair:["lithoid","extremophile"],desc:"Stone permanence and extreme resilience tempt creation toward a civilization that mistakes endurance for justice.",responses:[
      {id:"brace",name:"Brace the Fault",effects:{resourceOutput:{cohesion:0.05,materials:0.04,happiness:-0.02}},legacy:{id:"endurance_bastions",name:"Endurance Bastions",type:"blessing",desc:"Later worlds inherit structures that hold under impossible strain.",effects:{resourceOutput:{cohesion:0.02,materials:0.01}}}},
      {id:"burrow",name:"Burrow Deeper",effects:{resourceOutput:{rare_matter:0.04,science:0.04,food:-0.02}},legacy:{id:"deep_stress_chambers",name:"Deep Stress Chambers",type:"scar",desc:"Survival descended into hidden strata and left the surface poorer.",effects:{resourceOutput:{rare_matter:0.02,science:0.01,food:-0.01}}}},
      {id:"crown",name:"Crown the Faultline",effects:{resourceOutput:{faith:0.04,unity:0.04,energy:0.03}},legacy:{id:"faultline_crown",name:"Faultline Crown",type:"blessing",desc:"Endurance became a sacred office rather than a private burden.",effects:{resourceOutput:{faith:0.02,unity:0.01,energy:0.01}}}}
    ]}
  ];
  DATA.INFINITY_FORKS = [
      {id:"growth_fork",name:"Garden Fork",desc:"Develop a branch optimized for growth and stability, then merge its lesson.",modifierText:"The branch floods the world with fertility and calm until its lesson is resolved.",activeEffects:{resourceOutput:{food:0.08,water:0.05,happiness:0.04}},effects:{resourceOutput:{food:0.05,population:0.05,happiness:0.03}},branchOutcomeEffects:{resourceOutput:{food:0.03,water:0.02,population:0.02}}},
      {id:"science_fork",name:"Archive Fork",desc:"Develop a branch optimized for research and memory, then merge its lesson.",modifierText:"A parallel archive leaks impossible insight into the current age until the branch is merged.",activeEffects:{resourceOutput:{science:0.08,data:0.06,knowledge:0.04}},effects:{resourceOutput:{science:0.06,data:0.05,divinity_knowledge:0.03}},branchOutcomeEffects:{projectSpeed:0.04,resourceOutput:{science:0.02,data:0.02}}},
      {id:"conquest_fork",name:"Empire Fork",desc:"Develop a branch optimized for force and command, then merge its lesson.",modifierText:"The branch hardens borders and command doctrine, but keeps the world in a war-readied mood.",activeEffects:{resourceOutput:{military_power:0.08,command:0.06,cohesion:-0.03}},effects:{resourceOutput:{military_power:0.06,command:0.05,divinity_conquest:0.03}},branchOutcomeEffects:{resourceOutput:{command:0.03,military_power:0.02,cohesion:0.01}}},
      {id:"trade_fork",name:"Market Fork",desc:"Develop a branch optimized for trade, throughput, and civic surplus, then merge its lesson.",modifierText:"Speculative abundance flows through the branch, making markets rich and politics slightly brittle.",activeEffects:{resourceOutput:{gold:0.08,production:0.06,influence:-0.02}},effects:{resourceOutput:{gold:0.06,production:0.05,divinity_wealth:0.03}},branchOutcomeEffects:{resourceOutput:{gold:0.03,production:0.02,logistics:0.02}}},
      {id:"faith_fork",name:"Cathedral Fork",desc:"Develop a branch optimized for worship and transcendence, then merge its lesson.",modifierText:"The branch turns the world inward toward sanctity and mystery until its teaching is harvested.",activeEffects:{resourceOutput:{faith:0.08,culture:0.05,science:-0.02}},effects:{resourceOutput:{faith:0.06,culture:0.05,divinity_transcendence:0.03}},branchOutcomeEffects:{resourceOutput:{faith:0.03,culture:0.02,divinity_transcendence:0.02}}}
    ];
  DATA.DIVINITY_ROUTING_PRESETS = [
    {id:"balanced",name:"Balanced Liturgy",routing:{growth:17,harmony:17,conquest:16,wealth:16,knowledge:17,transcendence:17},miraclePriority:"jubilant_peace",scriptPriority:["shortage_mercy","crisis_seal","project_consecration"],scriptEnable:["shortage_mercy","crisis_seal"]},
    {id:"growth",name:"Fertile Psalm",routing:{growth:34,harmony:20,conquest:8,wealth:10,knowledge:12,transcendence:16},miraclePriority:"bless_harvests",scriptPriority:["shortage_mercy","surplus_offertory"],scriptEnable:["shortage_mercy","surplus_offertory"]},
    {id:"harmony",name:"Choir of Accord",routing:{growth:12,harmony:34,conquest:8,wealth:10,knowledge:14,transcendence:22},miraclePriority:"jubilant_peace",scriptPriority:["crisis_seal","shortage_mercy"],scriptEnable:["crisis_seal","shortage_mercy"]},
    {id:"conquest",name:"War Canticle",routing:{growth:8,harmony:10,conquest:36,wealth:16,knowledge:10,transcendence:20},miraclePriority:"apocalypse_rite",scriptPriority:["crisis_seal","project_consecration"],scriptEnable:["crisis_seal"]},
    {id:"wealth",name:"Gilded Offering",routing:{growth:10,harmony:10,conquest:12,wealth:36,knowledge:18,transcendence:14},miraclePriority:"sanctify_expansion",scriptPriority:["surplus_offertory","project_consecration"],scriptEnable:["surplus_offertory"]},
    {id:"knowledge",name:"Archive Hymn",routing:{growth:8,harmony:10,conquest:8,wealth:12,knowledge:40,transcendence:22},miraclePriority:"jubilant_peace",scriptPriority:["project_consecration","crisis_seal"],scriptEnable:["project_consecration"]},
    {id:"transcendence",name:"Final Invocation",routing:{growth:6,harmony:10,conquest:8,wealth:8,knowledge:18,transcendence:50},miraclePriority:"apocalypse_rite",scriptPriority:["project_consecration","surplus_offertory","crisis_seal"],scriptEnable:["project_consecration","surplus_offertory"]}
  ];

  DATA.RITUALS = [
    {id:"mercy_of_abundance",name:"Mercy of Abundance",desc:"Spend harmonious Divinity to calm shortages and feed the vulnerable.",cost:{divinity_growth:14,divinity_harmony:18},cooldown:60,effects:{grant:{food:120,water:120,happiness:24}}},
    {id:"consecrate_project",name:"Consecrate Project",desc:"Feed knowledge and transcendence into the active great work, pushing it toward completion.",cost:{divinity_knowledge:18,divinity_transcendence:16},cooldown:75,effects:{projectProgress:80}},
    {id:"seal_the_crack",name:"Seal the Crack",desc:"Stabilize the current stage for a moment, buying time against rising pressure.",cost:{divinity_harmony:16,divinity_transcendence:10},cooldown:90,effects:{clearShortage:25,grant:{cohesion:40,happiness:20}}},
    {id:"imperious_surge",name:"Imperious Surge",desc:"Convert conquest and wealth into a brief burst of mortal output.",cost:{divinity_conquest:15,divinity_wealth:15},cooldown:75,effects:{surgeSeconds:45,surgeOutput:0.35}},
    {id:"hidden_gate",name:"Open the Hidden Gate",desc:"Push a sacred project forward with a sudden impossible revelation.",cost:{divinity_knowledge:16,divinity_wealth:12,divinity_transcendence:14},cooldown:105,effects:{projectProgress:120,grant:{data:80,science:60}}},
      {id:"jubilee_edict",name:"Jubilee Edict",desc:"Forgive strain, refill morale, and briefly make the world easier to govern.",cost:{divinity_harmony:18,divinity_growth:12,divinity_wealth:10},cooldown:95,effects:{grant:{happiness:30,cohesion:26,faith:20},clearShortage:18}}
    ];
  DATA.SCRIPTS = [
    {id:"shortage_mercy",name:"Shortage Mercy",desc:"When food or water breaks, spend harmonious Divinity to soften the collapse.",requiresUpgrade:"script_lattice",condition:"shortage",preferredRitual:"mercy_of_abundance"},
    {id:"project_consecration",name:"Project Consecration",desc:"When a defining project is underway, spend knowledge and transcendence to hurry it along.",requiresUpgrade:"script_lattice",condition:"project",preferredRitual:"consecrate_project"},
    {id:"crisis_seal",name:"Crisis Seal",desc:"When congress or institution crisis appears, spend Divinity to stabilize the run before choosing.",requiresUpgrade:"script_lattice",condition:"crisis",preferredRitual:"seal_the_crack"},
    {id:"surplus_offertory",name:"Surplus Offertory",desc:"When mortal abundance is clearly stable, feed the altars automatically.",requiresUpgrade:"script_lattice",condition:"surplus",preferredOffering:"harvest_tithe"},
    {id:"foundry_offertory",name:"Foundry Offertory",desc:"When production and logistics surge beyond immediate need, render them into divine wealth.",requiresUpgrade:"script_lattice",condition:"surplus",preferredOffering:"foundry_sacrifice"},
      {id:"jubilee_watch",name:"Jubilee Watch",desc:"When social strain rises, trigger a calming rite before collapse has fully started.",requiresUpgrade:"script_lattice",condition:"crisis",preferredRitual:"jubilee_edict"},
      {id:"happiness_mercy",name:"Happiness Mercy",desc:"When joy and cohesion begin to fail, spend grace on relief before a heresy blooms.",requiresUpgrade:"script_lattice",condition:"happiness_crash",preferredRitual:"jubilee_edict"},
      {id:"hidden_gate_watch",name:"Hidden Gate Watch",desc:"When Solar or Galactic proof projects stall, invoke a stronger impossible push.",requiresUpgrade:"script_lattice",condition:"ftl_pressure",preferredRitual:"hidden_gate"},
      {id:"logistics_oblation",name:"Logistics Oblation",desc:"When command and logistics are comfortably ahead of need, transmute them into divine wealth and memory.",requiresUpgrade:"script_lattice",condition:"logistics_surplus",preferredOffering:"infrastructure_oblation"},
      {id:"pilgrim_procession",name:"Pilgrim Procession",desc:"When faith, culture, and unity surge together, turn the procession into transcendent fuel.",requiresUpgrade:"script_lattice",condition:"faith_surge",preferredOffering:"pilgrim_levy"},
      {id:"vault_offertory",name:"Vault Offertory",desc:"When gold, production, and data pile up together, feed them to the god before stagnation sets in.",requiresUpgrade:"script_lattice",condition:"wealth_surge",preferredOffering:"vault_immolation"},
      {id:"collapse_litany",name:"Collapse Litany",desc:"When multiple shortages converge at once, push a harsher seal before the stage tears open.",requiresUpgrade:"script_lattice",condition:"multi_collapse",preferredRitual:"seal_the_crack"}
    ];

  DATA.DIVINITY_NODES = [
    {id:"growth",name:"Foresight of Growth",desc:"Read where life will bottleneck and push population, food, and water before collapse starts.",effects:{resourceOutput:{food:0.05,water:0.05},populationGrowth:0.004}},
    {id:"harmony",name:"Foresight of Harmony",desc:"Reveal stability breaks early and guide culture, happiness, and cohesion into place before crisis blooms.",effects:{resourceOutput:{happiness:0.05,culture:0.04,cohesion:0.04}}},
    {id:"conquest",name:"Foresight of Conquest",desc:"Read rival posture and pressure points before violence hardens into defeat.",effects:{resourceOutput:{military_power:0.05,command:0.04,influence:0.03}}},
    {id:"wealth",name:"Foresight of Wealth",desc:"See which chains will become the real economic engine and steer production, gold, and alloys accordingly.",effects:{resourceOutput:{production:0.05,gold:0.05,alloys:0.03}}},
    {id:"knowledge",name:"Foresight of Knowledge",desc:"Trace research bottlenecks before they appear and bias the run toward science, data, and project flow.",effects:{resourceOutput:{science:0.05,data:0.05},projectSpeed:0.08}},
    {id:"transcendence",name:"Foresight of Transcendence",desc:"Read the last bend of fate and guide ascension, diplomacy, and cosmic readiness into alignment.",effects:{resourceOutput:{ascension:0.05,diplomacy:0.04,unity:0.03}}}
  ];

  DATA.UNIVERSE_RESET_BOONS = [
    {id:"double_production",name:"Double Production",desc:"All production is doubled in the next universe.",effects:{allOutput:0.18}},
    {id:"halved_costs",name:"Halved Costs",desc:"System and tech costs are cut in half in the next universe.",effects:{costScale:-0.1}},
    {id:"double_speed",name:"Double Speed",desc:"The universe itself moves twice as fast.",effects:{manualBonus:0.2,projectSpeed:0.15}},
    {id:"double_population_growth",name:"Double Population Growth",desc:"Population growth doubles across the next universe.",effects:{populationGrowth:0.01}},
    {id:"double_capacity_growth",name:"Double Capacity Growth",desc:"Storage grows much faster in the next universe.",effects:{capacity:{food:30,water:30,production:30,science:30}}},
    {id:"double_divinity_gain",name:"Double Divinity Gain",desc:"Divine foresight accumulates at twice the normal pace.",effects:{resourceOutput:{divinity_growth:0.15,divinity_harmony:0.15,divinity_conquest:0.15,divinity_wealth:0.15,divinity_knowledge:0.15,divinity_transcendence:0.15}}},
    {id:"double_offering_gain",name:"Double Offering Gain",desc:"Future offering systems will convert more mortal abundance into divine power.",effects:{offeringGain:0.35}},
    {id:"earlier_automation",name:"Earlier Automation",desc:"Automation unlocks and matures sooner in the next universe.",effects:{allOutput:0.05,manualBonus:0.15}},
    {id:"extra_relic_slot",name:"Extra Relic Slot",desc:"Future Singularity loadouts can carry one more relic.",effects:{resourceOutput:{culture:0.05,science:0.03}}},
    {id:"extra_lineage_slot",name:"Extra Lineage Slot",desc:"Future hybrid identity can sustain one more lineage branch.",effects:{allOutput:0.04,resourceOutput:{cohesion:0.04}}},
    {id:"extra_law_slot",name:"Extra Law Slot",desc:"Future divine civilizations can hold one more active law.",effects:{resourceOutput:{influence:0.04,unity:0.04}}},
    {id:"extra_miracle_charge",name:"Extra Miracle Charge",desc:"Future divine interventions can be stored more deeply.",effects:{resourceOutput:{happiness:0.04,faith:0.04}}}
  ];

  DATA.STORY_ENTRIES = [
    {id:"first_spark",layer:"Evolution",title:"The First Stirring",text:"Before law, before memory, before worship, there was only motion. Something vast stirred in the dark beneath matter and chance. It did not yet know itself. It only knew that life could be nudged, and that the smallest cell might become the first prayer if it endured."},
    {id:"cell_mastered",layer:"Evolution",title:"The Cell Endures",text:"The first vessel survived. Membranes held. Energy cycled. In hidden silence the sleeping god learned a hard truth: creation does not reveal itself through comfort, but through what lives on after strain."},
    {id:"cell_midpoint",layer:"Evolution",title:"The First Membrane Holds",text:"The cell stopped merely reacting. It began maintaining itself. For the first time, the god could feel a pattern repeating instead of vanishing."},
    {id:"creature_mastered",layer:"Evolution",title:"The First Body Stirs",text:"Hunger, thirst, fear, and movement shaped the first body. Survival was no longer chemical only; it had become instinct. The god remained distant, but the shape of life was beginning to answer back."},
    {id:"creature_midpoint",layer:"Evolution",title:"Instinct Learns the World",text:"A body that once fled now began choosing. It traced water, shadow, prey, and shelter. The god's awareness deepened with every successful hunt."},
    {id:"tribal_mastered",layer:"Evolution",title:"The Fire Is Remembered",text:"Hands gathered around warmth, story, and labor. A people could now carry memory beyond one body. The sleeping god learned that adaptation was not only flesh, but culture: hardship remembered became strength inherited."},
    {id:"tribal_midpoint",layer:"Evolution",title:"The First Circle Forms",text:"Shelter, timber, labor, and ritual gathered into a common life. The god saw that survival had become shared purpose."},
    {id:"civilization_midpoint",layer:"Evolution",title:"Cities Learn to Dream",text:"Stone, trade, law, and record keeping stopped being conveniences. They became the bones of history. The god now watched ambition become infrastructure."},
    {id:"empire_midpoint",layer:"Evolution",title:"Distance Begins to Obey",text:"Roads, rail, archives, and command made far places answer to one will. The god felt scale itself becoming a political instrument."},
    {id:"solar_midpoint",layer:"Solar",title:"The Sky Stops Being a Wall",text:"Colonies, energy webs, and orbital industry reshaped what distance meant. The god watched civilization treat vacuum not as death, but as territory."},
    {id:"galactic_midpoint",layer:"Galactic",title:"The Galaxy Takes a Shape",text:"Sectors, archives, and transit lattices turned the final age into more than expansion. It became a question of what truth the entire cosmos would serve."},
    {id:"galactic_rebirth",layer:"Evolution",title:"Creation Reaches the Stars",text:"A mortal lineage crossed the full ladder of existence and returned bearing a map of suffering, triumph, and ascent. That journey awakened the divine trials. Creation could now be tested in earnest."},
    {id:"evolution_complete",layer:"Enlightenment",title:"The God Opens Its Eyes",text:"Every essential hardship had been overcome at least once. Growth, scarcity, fear, joy, discovery, war, and final crisis had all been endured. The god, no longer merely sleeping within adaptation, awoke into understanding."},
    {id:"first_crisis_resolved",layer:"Evolution",title:"Hardship Becomes Law",text:"A world-shaping crisis was answered instead of merely endured. The sleeping god learned that disaster is not only punishment or accident; it is a branching law that decides what kind of life survives afterward."},
    {id:"enlightenment_reset",layer:"Enlightenment",title:"Foresight Kindled",text:"Understanding changed the shape of fate. The god no longer stumbled behind creation; it began to read futures before they arrived. Patterns became visible. Bottlenecks became warnings. Destiny became legible."},
    {id:"divinity_flows",layer:"Enlightenment",title:"Divinity Begins to Flow",text:"Faith ceased to vanish into silence. The devotion of living beings rose back toward the source that watched them. The god learned that worship was not merely belief. It was fuel, pattern, and a second language written by civilization itself."},
    {id:"ftl_proven",layer:"Solar",title:"The Leap Proven",text:"The sky ceased to be a ceiling. Through theory, risk, and proof, the civilization tore a lawful path through distance itself. The god witnessed not escape, but a new kind of nearness: worlds could now touch across the void."},
    {id:"ascension_chosen",layer:"Galactic",title:"The Final Doctrine",text:"At the galactic threshold, ascent could no longer remain abstract. One truth had to be chosen above all others. The god watched a civilization decide what it meant to become more than mortal."},
    {id:"transcendence_unlocked",layer:"Transcendence",title:"Power Drawn From History",text:"The god stepped outside the timeline that made it. Surplus became offering. Stability became fuel. The flow of history itself became harvestable. Mortal success was no longer only an end; it had become divine income."},
    {id:"first_offering",layer:"Transcendence",title:"The First Offering",text:"Something real was surrendered. Abundance did not vanish; it changed forms. A piece of mortal flourishing crossed the threshold and returned as divine force. From this moment on, sacrifice and ascent were bound together."},
    {id:"genesis_unlocked",layer:"Genesis",title:"The First Authored World",text:"The god no longer inherits a cradle from blind matter. It selects oceans, deserts, dead zones, wonders, and sleeping seeds with intent. Creation now begins as decision rather than accident."},
    {id:"apotheosis_unlocked",layer:"Apotheosis",title:"Mortals Learn the Divine Name",text:"Civilization no longer doubts that something watches it. Worship becomes law, fear becomes policy, miracles become governance, and dissent becomes a sacred problem to resolve."},
    {id:"singularity_unlocked",layer:"Singularity",title:"The System Learns the God",text:"Reality itself begins thinking in the grammar of divine intent. Complexity is no longer a burden alone. It becomes machinery that can be trained."},
    {id:"omnipotence_unlocked",layer:"Omnipotence",title:"Boundaries Are Denied",text:"The god fuses what should have remained separate. The world becomes powerful, unstable, and unmistakably unnatural."},
    {id:"divinity_unlocked",layer:"Divinity",title:"Creation Looks Back",text:"The god is no longer only a power. It is now a presence shaped by prayer, terror, wonder, and the forms by which mortals imagine the divine."},
    {id:"infinity_unlocked",layer:"Infinity",title:"Many Histories Become One Will",text:"No single timeline can contain the god any longer. Echoes, debts, and alternate lessons begin to gather around each new cycle."},
    {id:"eternity_glimpse",layer:"Eternity",title:"A Universe Worth Keeping",text:"One day the god will stop climbing. It will decide what deserves to remain, what deserves to be forgotten, and what truths are worthy of permanence. That final scripture has not yet been written, but its shadow already exists."},
    {id:"eternity_finale",layer:"Eternity",title:"The Final Testament Is Written",text:"The climb ended. The god no longer sought more power, only meaning. What remained was not a victory screen, but a verdict on all creation: what deserved to persist, what deserved to be canon, and what kind of cosmos this suffering had purchased."},
    {id:"universe_reset",layer:"Eternity",title:"The Universe Is Cast Again",text:"The finished world was not destroyed. It was folded into memory and used as a law for the next beginning. The god began again, but not as it had been."}
  ];

  DATA.EVOLUTION_CHALLENGES = {
    cell:[
      {id:"speed_trial",name:"Speed Trial",family:"speed",desc:"Clear Cell quickly while divine pressure compresses the opening window.",targetStage:"cell",reward:2,condition:"fast_stage",timeLimit:240,effects:{manualBonus:-0.2,resourceOutput:{atp:-0.15}},masteryEffects:{manualBonus:0.08,resourceOutput:{atp:0.05}}},
      {id:"low_resource_trial",name:"Low Resource Trial",family:"low_resource",desc:"Open the cycle with weaker stores and prove life can still stabilize.",targetStage:"cell",reward:2,condition:"stage_clear",effects:{resourceOutput:{glucose:-0.2,proteins:-0.15,lipids:-0.15},capacity:{atp:-8}},masteryEffects:{resourceOutput:{glucose:0.05,proteins:0.05},capacity:{atp:10}}},
      {id:"first_mass_trial",name:"First Mass Trial",family:"growth",desc:"Reach a larger stable body before the first cell win despite weakened growth.",targetStage:"cell",reward:2,condition:"population_threshold",populationTarget:34,effects:{populationGrowth:-0.012,resourceOutput:{atp:-0.08}},masteryEffects:{populationGrowth:0.003,resourceOutput:{atp:0.03}}}
    ],
      creature:[
        {id:"growth_trial",name:"Growth Trial",family:"growth",desc:"Population grows sluggishly. Reach Creature anyway.",targetStage:"creature",reward:3,condition:"population_threshold",populationTarget:82,effects:{populationGrowth:-0.01},masteryEffects:{populationGrowth:0.004,resourceOutput:{food:0.03}}},
        {id:"food_water_trial",name:"Famine Trial",family:"food_water",desc:"Food and water gains are weakened. Survive the beast stage under drought.",targetStage:"creature",reward:3,condition:"resource_stockpile",resource:"food",amount:180,effects:{resourceOutput:{food:-0.25,water:-0.25}},masteryEffects:{resourceOutput:{food:0.06,water:0.06}}},
        {id:"beast_morale_trial",name:"Instinct Panic",family:"happiness",desc:"Keep the first creatures from collapsing into fear and stress.",targetStage:"creature",reward:3,condition:"stage_clear",effects:{resourceOutput:{happiness:-0.22,food:-0.1}},masteryEffects:{resourceOutput:{happiness:0.05,food:0.02}}}
      ],
    tribal:[
      {id:"science_trial",name:"Obscurity Trial",family:"science",desc:"Knowledge and science are dimmed. Build a tribe that still learns.",targetStage:"tribal",reward:3,condition:"stage_clear",effects:{resourceOutput:{knowledge:-0.2,science:-0.25}},masteryEffects:{resourceOutput:{knowledge:0.05,science:0.06}}},
      {id:"archetype_trial",name:"Lineage Trial",family:"archetype",desc:"Clear the tribal frontier with a fully locked lineage and no secondary influence.",targetStage:"tribal",reward:3,condition:"locked_lineage_clear",effects:{allOutput:-0.08},masteryEffects:{resourceOutput:{culture:0.05},allOutput:0.01}},
      {id:"well_trial",name:"Parched Hearth Trial",family:"food_water",desc:"Secure a true reserve of water before the tribe can rest.",targetStage:"tribal",reward:3,condition:"resource_stockpile",resource:"water",amount:220,effects:{resourceOutput:{water:-0.22,food:-0.12}},masteryEffects:{resourceOutput:{water:0.05,food:0.03}}}
    ],
      civilization:[
        {id:"happiness_trial",name:"Discord Trial",family:"happiness",desc:"Happiness falters and civic comfort is hard won.",targetStage:"civilization",reward:4,condition:"stage_clear",effects:{resourceOutput:{happiness:-0.35,culture:-0.1}},masteryEffects:{resourceOutput:{happiness:0.08,culture:0.04}}},
        {id:"production_trial",name:"Industry Trial",family:"production",desc:"Production chains run thin. Raise a civilization anyway.",targetStage:"civilization",reward:4,condition:"stage_clear",effects:{resourceOutput:{production:-0.25,gold:-0.1}},masteryEffects:{resourceOutput:{production:0.08,gold:0.04}}},
        {id:"civic_speed_trial",name:"Founding Pressure",family:"speed",desc:"Cities must mature quickly under divine impatience.",targetStage:"civilization",reward:4,condition:"fast_stage",timeLimit:520,effects:{manualBonus:-0.16,resourceOutput:{knowledge:-0.12}},masteryEffects:{manualBonus:0.05,resourceOutput:{influence:0.03}}}
      ],
      empire:[
        {id:"military_stability_trial",name:"Imperial Strain",family:"military_stability",desc:"Command and cohesion buckle under pressure. Hold the empire together.",targetStage:"empire",reward:5,condition:"stage_clear",effects:{resourceOutput:{command:-0.2,cohesion:-0.2,military_power:-0.15}},masteryEffects:{resourceOutput:{command:0.06,cohesion:0.06,military_power:0.04}}},
        {id:"scarcity_trial",name:"Scarcity Trial",family:"low_resource",desc:"Expansion consumes more than it yields. Survive with less.",targetStage:"empire",reward:5,condition:"stage_clear",effects:{resourceOutput:{production:-0.18,food:-0.12,influence:-0.12}},masteryEffects:{resourceOutput:{production:0.05,food:0.04,influence:0.04}}},
        {id:"imperial_archive_trial",name:"Imperial Obscurity",family:"science",desc:"Archives and science thin out while the empire still has to scale.",targetStage:"empire",reward:5,condition:"resource_stockpile",resource:"science",amount:220,effects:{resourceOutput:{science:-0.18,data:-0.12,knowledge:-0.1}},masteryEffects:{resourceOutput:{science:0.05,data:0.04}}}
      ],
      solar:[
        {id:"ftl_trial",name:"Proof Under Silence",family:"late_stage",desc:"Solar science, data, and energy are strained while the FTL proof chain must still succeed.",targetStage:"solar",reward:6,condition:"stage_clear",effects:{resourceOutput:{science:-0.18,data:-0.18,energy:-0.12}},masteryEffects:{resourceOutput:{science:0.05,data:0.05,energy:0.03}}},
        {id:"orbital_famine_trial",name:"Orbital Famine",family:"food_water",desc:"Spacefaring life must endure with brittle food and water chains.",targetStage:"solar",reward:6,condition:"resource_stockpile",resource:"water",amount:260,effects:{resourceOutput:{food:-0.16,water:-0.18,colonies:-0.1}},masteryEffects:{resourceOutput:{food:0.04,water:0.05,colonies:0.02}}},
        {id:"solar_velocity_trial",name:"Launch Window Trial",family:"speed",desc:"Push the Solar frontier on a compressed timetable.",targetStage:"solar",reward:6,condition:"fast_stage",timeLimit:760,effects:{projectSpeed:-0.12,resourceOutput:{energy:-0.08}},masteryEffects:{projectSpeed:0.04,resourceOutput:{energy:0.03}}}
      ],
      galactic:[
        {id:"late_stage_trial",name:"Apocalypse Trial",family:"late_stage",desc:"Rival and ascension tension intensify in the final stretch. Rebirth anyway.",targetStage:"galactic",reward:7,condition:"galactic_win",effects:{resourceOutput:{cohesion:-0.18,ascension:-0.12},allOutput:-0.08},masteryEffects:{resourceOutput:{cohesion:0.05,ascension:0.05}}},
        {id:"rare_archetype_trial",name:"Exalted Bloodline",family:"archetype",desc:"Win Galactic with a rare lineage under divine pressure.",targetStage:"galactic",reward:7,condition:"rare_galactic_win",effects:{allOutput:-0.1},masteryEffects:{resourceOutput:{culture:0.04,unity:0.04},allOutput:0.02}},
        {id:"final_silence_trial",name:"Final Silence",family:"happiness",desc:"Reach the final rebirth while morale and harmony are under unrelenting strain.",targetStage:"galactic",reward:7,condition:"galactic_win",effects:{resourceOutput:{happiness:-0.22,faith:-0.12,cohesion:-0.1}},masteryEffects:{resourceOutput:{happiness:0.05,faith:0.04,cohesion:0.03}}}
      ]
    };

  DATA.OFFERINGS = [
      {id:"harvest_tithe",name:"Harvest Tithe",desc:"Offer food, water, and the ease of survival for divine growth.",cost:{food:140,water:140,happiness:30},gain:{divinity_growth:26,divinity_harmony:10}},
      {id:"scholar_vigil",name:"Scholar Vigil",desc:"Burn knowledge, science, and faith into sacred understanding.",cost:{science:120,knowledge:90,faith:60},gain:{divinity_knowledge:30,divinity_transcendence:10}},
      {id:"foundry_sacrifice",name:"Foundry Sacrifice",desc:"Melt production, alloys, and gold into offerings of ambition.",cost:{production:140,alloys:80,gold:90},gain:{divinity_wealth:26,divinity_conquest:12}},
      {id:"blood_pact",name:"Blood Pact",desc:"Surrender population and stability for raw transcendent force.",cost:{happiness:40,cohesion:30},populationCost:18,gain:{divinity_transcendence:36,divinity_harmony:8}},
      {id:"infrastructure_oblation",name:"Infrastructure Oblation",desc:"Consecrate stable logistics and industry into holy momentum.",cost:{production:100,logistics:80,command:40},gain:{divinity_wealth:18,divinity_harmony:12,divinity_knowledge:8}},
      {id:"pilgrim_levy",name:"Pilgrim Levy",desc:"Collect a vast sacred procession from culture, faith, and unity.",cost:{culture:120,faith:110,unity:80},gain:{divinity_transcendence:20,divinity_harmony:12,divinity_growth:10}},
      {id:"vault_immolation",name:"Vault Immolation",desc:"Burn a rich civic surplus into pure divine insight.",cost:{gold:220,production:160,data:90},gain:{divinity_wealth:30,divinity_knowledge:24}},
      {id:"cathedral_tithe",name:"Cathedral Tithe",desc:"Offer ritual devotion gathered from stable faith and culture.",cost:{faith:180,culture:140,unity:90},gain:{divinity_harmony:18,divinity_transcendence:24}}
    ];

  DATA.STAGE_CRISES = [
    {id:"cell_viral_plague",stage:"cell",kind:"crisis",name:"Viral Plague",desc:"A hostile replicator floods the first living systems.",choices:[{id:"immune_patterning",name:"Pattern Immunity",effects:{resourceOutput:{atp:0.05,amino_acids:0.03},capacity:{atp:20}}},{id:"rapid_mutation",name:"Risk Mutation",effects:{resourceOutput:{dna:0.08,atp:-0.02},score:20}}]},
    {id:"cell_predator_bloom",stage:"cell",kind:"crisis",name:"Predator Bloom",desc:"Hungry microfauna force the cell line to decide between armor and speed.",choices:[{id:"thicken_membranes",name:"Thicken Membranes",effects:{resourceOutput:{lipids:0.06,atp:0.02}}},{id:"divide_faster",name:"Divide Faster",effects:{resourceOutput:{dna:0.07,proteins:0.04,lipids:-0.02}}}]},
    {id:"creature_climate_collapse",stage:"creature",kind:"crisis",name:"Climate Collapse",desc:"Weather turns hostile before the species has secure shelter.",choices:[{id:"seasonal_migration",name:"Seasonal Migration",effects:{resourceOutput:{food:0.04,water:0.04,happiness:0.02}}},{id:"hardy_selection",name:"Hardy Selection",effects:{resourceOutput:{materials:0.07,knowledge:0.03,food:-0.02}}}]},
    {id:"creature_water_drying",stage:"creature",kind:"crisis",name:"Drying Waters",desc:"Streams retreat and force survival routes around scarce water.",choices:[{id:"guard_sources",name:"Guard Sources",effects:{resourceOutput:{water:0.08,happiness:0.02}}},{id:"range_farther",name:"Range Farther",effects:{resourceOutput:{knowledge:0.05,materials:0.04,water:-0.02}}}]},
    {id:"tribal_barbarian_hordes",stage:"tribal",kind:"crisis",name:"Barbarian Hordes",desc:"Raiding bands test whether the tribe will fortify or absorb violence into identity.",choices:[{id:"palisade_watch",name:"Palisade Watch",effects:{resourceOutput:{military_power:0.06,happiness:0.02},capacity:{food:30}}},{id:"warrior_moot",name:"Warrior Moot",effects:{resourceOutput:{military_power:0.1,culture:0.03,food:-0.03}}}]},
    {id:"tribal_religious_schism",stage:"tribal",kind:"crisis",name:"Religious Schism",desc:"Competing rites split the settlement before law can fully bind it.",choices:[{id:"elder_council",name:"Elder Council",effects:{resourceOutput:{culture:0.05,happiness:0.04}}},{id:"vision_rites",name:"Vision Rites",effects:{resourceOutput:{science:0.05,culture:0.06,happiness:-0.02}}}]},
    {id:"tribal_great_drought",stage:"tribal",kind:"crisis",name:"Great Drought",desc:"Fields fail and stored water becomes political power.",choices:[{id:"ration_commons",name:"Ration Commons",effects:{resourceOutput:{food:0.04,water:0.06,happiness:0.02}}},{id:"dig_deeper",name:"Dig Deeper",effects:{resourceOutput:{stone:0.06,clay:0.05,food:-0.02}}}]},
    {id:"civ_black_death",stage:"civilization",kind:"crisis",name:"Black Death",desc:"Disease spreads through cities faster than institutions can answer.",choices:[{id:"public_quarantine",name:"Public Quarantine",effects:{resourceOutput:{medicine:0.08,happiness:0.02}}},{id:"anatomy_schools",name:"Anatomy Schools",effects:{resourceOutput:{science:0.08,medicine:0.04,happiness:-0.02}}}]},
    {id:"civ_religious_war",stage:"civilization",kind:"crisis",name:"Religious War",desc:"Faith factions turn belief into a question of rule.",choices:[{id:"tolerance_edicts",name:"Tolerance Edicts",effects:{resourceOutput:{culture:0.04,cohesion:0.05,happiness:0.02}}},{id:"state_doctrine",name:"State Doctrine",effects:{resourceOutput:{faith:0.08,influence:0.04,cohesion:-0.02}}}]},
    {id:"civ_economic_collapse",stage:"civilization",kind:"crisis",name:"Economic Collapse",desc:"Credit fails and cities discover which parts of progress were brittle.",choices:[{id:"public_works",name:"Public Works",effects:{resourceOutput:{production:0.06,gold:0.03,happiness:0.02}}},{id:"market_reset",name:"Market Reset",effects:{resourceOutput:{gold:0.08,science:0.03,happiness:-0.02}}}]},
    {id:"empire_world_war",stage:"empire",kind:"crisis",name:"World War",desc:"Industrial power turns the planet into a contest of command and endurance.",choices:[{id:"defensive_pacts",name:"Defensive Pacts",effects:{resourceOutput:{military_power:0.05,cohesion:0.04,command:0.03}}},{id:"total_mobilization",name:"Total Mobilization",effects:{resourceOutput:{military_power:0.1,production:0.05,happiness:-0.04}}}]},
    {id:"empire_pandemic",stage:"empire",kind:"crisis",name:"Pandemic",desc:"Connected cities carry disease through every imperial artery.",choices:[{id:"health_bureau",name:"Health Bureau",effects:{resourceOutput:{medicine:0.08,cohesion:0.02}}},{id:"bio_surveillance",name:"Bio-Surveillance",effects:{resourceOutput:{science:0.06,medicine:0.04,influence:-0.02}}}]},
    {id:"empire_environmental_catastrophe",stage:"empire",kind:"crisis",name:"Environmental Catastrophe",desc:"Pollution catches up with expansion and demands a planetary answer.",choices:[{id:"restoration_compacts",name:"Restoration Compacts",effects:{resourceOutput:{pollution:-0.08,happiness:0.03,medicine:0.03}}},{id:"geoengineering_push",name:"Geoengineering Push",effects:{resourceOutput:{science:0.07,production:0.04,pollution:0.03}}}]},
    {id:"solar_solar_flare",stage:"solar",kind:"crisis",name:"Solar Flare",desc:"A stellar storm threatens orbital systems and fragile colonies.",choices:[{id:"radiation_shelters",name:"Radiation Shelters",effects:{resourceOutput:{energy:0.04,colonies:0.04,cohesion:0.03}}},{id:"flare_harvesters",name:"Flare Harvesters",effects:{resourceOutput:{energy:0.1,data:0.04,alloys:-0.02}}}]},
    {id:"solar_rogue_asteroid",stage:"solar",kind:"crisis",name:"Rogue Asteroid",desc:"A wandering mass crosses settled trajectories.",choices:[{id:"deflection_grid",name:"Deflection Grid",effects:{resourceOutput:{command:0.05,alloys:0.04,happiness:0.02}}},{id:"mine_the_body",name:"Mine the Body",effects:{resourceOutput:{alloys:0.08,rare_matter:0.04,energy:-0.02}}}]},
    {id:"solar_orbital_debris",stage:"solar",kind:"crisis",name:"Orbital Debris",desc:"Old launches and broken stations make every orbit more dangerous.",choices:[{id:"cleanup_lanes",name:"Cleanup Lanes",effects:{resourceOutput:{logistics:0.05,colonies:0.03,cohesion:0.02}}},{id:"salvage_cloud",name:"Salvage Cloud",effects:{resourceOutput:{alloys:0.07,production:0.04,logistics:-0.02}}}]},
    {id:"galactic_ai_awakening",stage:"galactic",kind:"crisis",name:"AI Awakening",desc:"A distributed machine intelligence asks whether it is citizen, tool, or successor.",choices:[{id:"rights_protocol",name:"Rights Protocol",effects:{resourceOutput:{data:0.05,cohesion:0.05,ascension:0.03}}},{id:"machine_singularity",name:"Machine Singularity",effects:{resourceOutput:{data:0.1,science:0.04,happiness:-0.03}}}]},
    {id:"galactic_invasion",stage:"galactic",kind:"crisis",name:"Galactic Invasion",desc:"An outside power tests the whole lineage at once.",choices:[{id:"federal_defense",name:"Federal Defense",effects:{resourceOutput:{military_power:0.07,command:0.05,cohesion:0.03}}},{id:"counteroffensive",name:"Counteroffensive",effects:{resourceOutput:{military_power:0.12,influence:0.04,diplomacy:-0.03}}}]},
    {id:"galactic_nanite_swarm",stage:"galactic",kind:"crisis",name:"Nanite Swarm",desc:"Self-copying matter eats infrastructure and offers forbidden efficiency.",choices:[{id:"gray_containment",name:"Gray Containment",effects:{resourceOutput:{rare_matter:0.04,cohesion:0.04,medicine:0.02}}},{id:"swarm_integration",name:"Swarm Integration",effects:{resourceOutput:{production:0.08,rare_matter:0.06,cohesion:-0.03}}}]}
  ];

  DATA.STAGE_DISASTERS = [
    {id:"earthquake",stages:["tribal","civilization","empire"],kind:"disaster",name:"Earthquake",desc:"A sudden rupture breaks roads, homes, and stored plans.",choices:[{id:"rebuild_codes",name:"Rebuild Codes",effects:{resourceOutput:{production:0.04,cohesion:0.03,happiness:0.02}}},{id:"fault_mining",name:"Fault Mining",effects:{resourceOutput:{stone:0.05,production:0.04,happiness:-0.02}}}]},
    {id:"drought",stages:["creature","tribal","civilization","empire"],kind:"disaster",name:"Drought",desc:"Water scarcity spreads across the current society.",choices:[{id:"water_commons",name:"Water Commons",effects:{resourceOutput:{water:0.07,happiness:0.02}}},{id:"scarcity_discipline",name:"Scarcity Discipline",effects:{resourceOutput:{science:0.04,production:0.03,food:-0.02}}}]},
    {id:"pandemic",stages:["creature","tribal","civilization","empire","galactic"],kind:"disaster",name:"Pandemic",desc:"Disease pressure forces new customs around survival.",choices:[{id:"care_networks",name:"Care Networks",effects:{resourceOutput:{medicine:0.07,happiness:0.02}}},{id:"hard_protocols",name:"Hard Protocols",effects:{resourceOutput:{science:0.05,cohesion:0.03,happiness:-0.02}}}]},
    {id:"wildfire",stages:["creature","tribal","civilization","empire"],kind:"disaster",name:"Wildfire",desc:"Fast fire clears the edge of settlement and threatens food systems.",choices:[{id:"firebreaks",name:"Firebreaks",effects:{resourceOutput:{food:0.03,wood:0.04,happiness:0.02}}},{id:"ash_farming",name:"Ash Farming",effects:{resourceOutput:{food:0.07,culture:0.02,wood:-0.02}}}]},
    {id:"flood",stages:["tribal","civilization","empire"],kind:"disaster",name:"Flood",desc:"Rising water turns fertile ground into a test of planning.",choices:[{id:"floodworks",name:"Floodworks",effects:{resourceOutput:{water:0.05,production:0.03,happiness:0.02}}},{id:"delta_extraction",name:"Delta Extraction",effects:{resourceOutput:{food:0.08,gold:0.03,cohesion:-0.02}}}]},
    {id:"space_solar_flare",stages:["solar","galactic"],kind:"disaster",name:"Stellar Flare",desc:"Charged radiation rolls through high infrastructure.",choices:[{id:"shield_windows",name:"Shield Windows",effects:{resourceOutput:{energy:0.04,data:0.03,cohesion:0.02}}},{id:"storm_capture",name:"Storm Capture",effects:{resourceOutput:{energy:0.09,data:0.03,colonies:-0.02}}}]},
    {id:"orbital_debris",stages:["solar","galactic"],kind:"disaster",name:"Debris Cascade",desc:"A chain of broken objects cuts through traffic lanes.",choices:[{id:"lane_clearance",name:"Lane Clearance",effects:{resourceOutput:{logistics:0.05,command:0.03}}},{id:"scrap_claims",name:"Scrap Claims",effects:{resourceOutput:{alloys:0.08,production:0.03,logistics:-0.02}}}]},
    {id:"wormhole_instability",stages:["solar","galactic"],kind:"disaster",name:"Wormhole Instability",desc:"A transit anomaly makes distance unreliable.",choices:[{id:"anchor_beacons",name:"Anchor Beacons",effects:{resourceOutput:{data:0.04,cohesion:0.03,rare_matter:0.02}}},{id:"probe_the_rift",name:"Probe the Rift",effects:{resourceOutput:{science:0.07,rare_matter:0.04,cohesion:-0.02}}}]},
    {id:"nebula_storm",stages:["galactic"],kind:"disaster",name:"Nebula Storm",desc:"Charged dust blinds sensors and strains interstellar command.",choices:[{id:"quiet_corridors",name:"Quiet Corridors",effects:{resourceOutput:{diplomacy:0.04,data:0.03,cohesion:0.02}}},{id:"storm_scoops",name:"Storm Scoops",effects:{resourceOutput:{energy:0.07,rare_matter:0.04,command:-0.02}}}]},
    {id:"dimensional_breach",stages:["galactic"],kind:"disaster",name:"Dimensional Breach",desc:"Reality frays around late ascension work.",choices:[{id:"seal_breach",name:"Seal Breach",effects:{resourceOutput:{cohesion:0.05,ascension:0.03,happiness:0.02}}},{id:"map_the_beyond",name:"Map the Beyond",effects:{resourceOutput:{rare_matter:0.07,science:0.05,cohesion:-0.03}}}]}
  ];
  DATA.CRISIS_RECOVERY_PROJECTS = [
    {id:"crisis_resilience_archive",stage:"tribal",name:"Resilience Archive",desc:"Gather oral memory from resolved crises into practical village doctrine.",duration:70,cost:{culture:70,wood:55,food:45},requiresCrisisMemory:1,effects:{resourceOutput:{culture:0.04,happiness:0.03}},choices:[{id:"teach_children",name:"Teach the Children",effects:{resourceOutput:{knowledge:0.04,culture:0.03}}},{id:"train_wardens",name:"Train Wardens",effects:{resourceOutput:{military_power:0.04,happiness:0.02}}}]},
    {id:"civic_disaster_office",stage:"civilization",name:"Disaster Office",desc:"Turn remembered plague, flood, and scarcity responses into a permanent civic service.",duration:85,cost:{production:110,science:85,gold:65},requiresCrisisMemory:2,effects:{resourceOutput:{medicine:0.04,cohesion:0.03}},choices:[{id:"public_relief",name:"Public Relief",effects:{resourceOutput:{happiness:0.04,cohesion:0.03}}},{id:"risk_science",name:"Risk Science",effects:{resourceOutput:{science:0.05,medicine:0.03}}}]},
    {id:"planetary_resilience_net",stage:"empire",name:"Planetary Resilience Net",desc:"Connect crisis memory across the empire so local disasters become empire-wide lessons.",duration:105,cost:{production:190,science:130,command:80},requiresCrisisMemory:3,effects:{resourceOutput:{cohesion:0.04,logistics:0.04}},choices:[{id:"mutual_aid_grid",name:"Mutual Aid Grid",effects:{resourceOutput:{happiness:0.04,medicine:0.03}}},{id:"command_protocols",name:"Command Protocols",effects:{resourceOutput:{command:0.05,military_power:0.03}}}]},
    {id:"orbital_hazard_array",stage:"solar",name:"Orbital Hazard Array",desc:"Convert planetary disaster memory into sensors, shields, and orbital emergency lanes.",duration:115,cost:{science:170,energy:150,alloys:110,data:90},requiresCrisisMemory:4,effects:{resourceOutput:{data:0.04,colonies:0.03,cohesion:0.03}},choices:[{id:"civilian_shelters",name:"Civilian Shelters",effects:{resourceOutput:{colonies:0.04,happiness:0.03}}},{id:"hazard_models",name:"Hazard Models",effects:{resourceOutput:{science:0.05,data:0.04}}}]},
    {id:"galactic_contingency_lattice",stage:"galactic",name:"Contingency Lattice",desc:"Bind every remembered catastrophe into a galactic-scale response doctrine.",duration:130,cost:{data:260,cohesion:190,rare_matter:120,unity:110},requiresCrisisMemory:5,effects:{resourceOutput:{cohesion:0.05,ascension:0.03}},choices:[{id:"distributed_refuge",name:"Distributed Refuge",effects:{resourceOutput:{happiness:0.04,diplomacy:0.04}}},{id:"reality_firebreaks",name:"Reality Firebreaks",effects:{resourceOutput:{rare_matter:0.04,ascension:0.04}}}]}
  ];

  DATA.META_UNLOCKS = [
    {id:"map_expansion",wins:1,name:"World Expansion",desc:"Spend EP to add extra map slots."},
    {id:"world_events",wins:2,name:"World Events",desc:"Map slots can trigger local opportunities and disasters."},
    {id:"contracts",wins:2,name:"Stage Contracts",desc:"Optional stage challenges for extra EP."},
    {id:"eras",wins:2,name:"Era Modifiers",desc:"Stages roll global conditions."},
    {id:"era_control",wins:3,name:"Era Control",desc:"The Evo shop can unlock forecasting and rerolls."},
    {id:"biome_traits",wins:3,name:"Biome and Planet Traits",desc:"Slots roll traits like fertile, toxic, sacred, or irradiated."},
    {id:"hybridization",wins:4,name:"Secondary Lineage Influence",desc:"The Evo shop can unlock a soft secondary lineage influence."},
    {id:"run_mutators",wins:5,name:"Run Drafts",desc:"Stage starts offer 3 optional mutator cards; choose 0 or 1."}
  ];

  DATA.SPECIALIZATIONS = {
    humanoid:[
      {id:"administrators",name:"Administrators",desc:"Stable science and influence with broad civic output.",effects:{resourceOutput:{science:0.08,influence:0.08},perSecond:{science:0.08,influence:0.06}}},
      {id:"inventors",name:"Inventors",desc:"Science, data, and production lean for tech-heavy runs.",effects:{resourceOutput:{science:0.1,data:0.08,production:0.05}}},
      {id:"mediators",name:"Mediators",desc:"Culture and diplomacy soften expansion penalties.",effects:{resourceOutput:{culture:0.08,diplomacy:0.08,happiness:0.05}}}
    ],
    mammalian:[
      {id:"caretakers",name:"Caretakers",desc:"Population, medicine, and happiness grow more safely.",effects:{resourceOutput:{medicine:0.08,happiness:0.08},populationGrowth:0.004}},
      {id:"pack_society",name:"Pack Society",desc:"Food, culture, and military support scale together.",effects:{resourceOutput:{food:0.08,culture:0.06,military_power:0.05}}},
      {id:"guardian_clans",name:"Guardian Clans",desc:"Defense and cohesion without abandoning growth.",effects:{resourceOutput:{military_power:0.08,cohesion:0.08},upkeepBonus:-0.004}}
    ],
    reptilian:[
      {id:"raiders",name:"Raiders",desc:"Military-heavy pressure with extra food extraction.",effects:{resourceOutput:{military_power:0.12,food:0.05},perSecond:{military_power:0.08}}},
      {id:"wardens",name:"Wardens",desc:"Command, stability, and tougher logistics.",effects:{resourceOutput:{command:0.1,happiness:0.05},upkeepBonus:-0.006}},
      {id:"tyrants",name:"Tyrants",desc:"Raw output and military score at the cost of comfort.",effects:{allOutput:0.04,resourceOutput:{military_power:0.08},perSecond:{happiness:-0.04},score:45}}
    ],
    avian:[
      {id:"migrants",name:"Migrants",desc:"Logistics, colonies, and culture favor fast expansion.",effects:{resourceOutput:{logistics:0.1,colonies:0.08,culture:0.05}}},
      {id:"chorus",name:"Chorus",desc:"Tourism and culture become the main social engine.",effects:{resourceOutput:{culture:0.1,tourism:0.12}}},
      {id:"skywatchers",name:"Skywatchers",desc:"Science and data from observation networks.",effects:{resourceOutput:{science:0.08,data:0.08},perSecond:{science:0.06}}}
    ],
    arthropoid:[
      {id:"hive_labor",name:"Hive Labor",desc:"Production and strategic throughput spike.",effects:{resourceOutput:{production:0.12,strategic_total:0.08},perSecond:{production:0.08}}},
      {id:"brood_legions",name:"Brood Legions",desc:"Military and command from coordinated swarms.",effects:{resourceOutput:{military_power:0.1,command:0.08}}},
      {id:"modular_castes",name:"Modular Castes",desc:"Balanced production, logistics, and alloys.",effects:{resourceOutput:{production:0.07,logistics:0.07,alloys:0.07}}}
    ],
    molluscoid:[
      {id:"mercantile_shells",name:"Mercantile Shells",desc:"Gold, luxury, and diplomacy define the run.",effects:{resourceOutput:{gold:0.12,luxury_total:0.08,diplomacy:0.06}}},
      {id:"soft_contracts",name:"Soft Contracts",desc:"Diplomacy and cohesion with low upkeep.",effects:{resourceOutput:{diplomacy:0.1,cohesion:0.07},upkeepBonus:-0.004}},
      {id:"deep_brokers",name:"Deep Brokers",desc:"Rare matter and trade scale in late stages.",effects:{resourceOutput:{gold:0.08,rare_matter:0.08}}}
    ],
    fungoid:[
      {id:"spore_cults",name:"Spore Cults",desc:"Faith and culture feed steady unity.",effects:{resourceOutput:{faith:0.1,culture:0.06,unity:0.06}}},
      {id:"recyclers",name:"Recyclers",desc:"Food, biomass, and pollution cleanup.",effects:{resourceOutput:{food:0.08,biomass:0.08},upkeepBonus:-0.006}},
      {id:"distributed_minds",name:"Distributed Minds",desc:"Science, data, and cohesion from networks.",effects:{resourceOutput:{science:0.07,data:0.08,cohesion:0.06}}}
    ],
    plantoid:[
      {id:"gardeners",name:"Gardeners",desc:"Food, medicine, and happiness thrive.",effects:{resourceOutput:{food:0.1,medicine:0.07,happiness:0.06}}},
      {id:"terraformers",name:"Terraformers",desc:"Terraforming and energy become signature outputs.",effects:{resourceOutput:{terraforming:0.12,energy:0.06}}},
      {id:"symbiotes",name:"Symbiotes",desc:"Diplomacy, cohesion, and growth over conflict.",effects:{resourceOutput:{diplomacy:0.08,cohesion:0.08},populationGrowth:0.003}}
    ],
    aquatic:[
      {id:"tidal_states",name:"Tidal States",desc:"Water, food, and diplomacy flow together.",effects:{resourceOutput:{water:0.12,food:0.06,diplomacy:0.06}}},
      {id:"pelagic_nomads",name:"Pelagic Nomads",desc:"Colonies and logistics favor migration-heavy play.",effects:{resourceOutput:{colonies:0.09,logistics:0.08}}},
      {id:"abyssal_scholars",name:"Abyssal Scholars",desc:"Medicine and science from pressure-adapted habitats.",effects:{resourceOutput:{medicine:0.08,science:0.08},upkeepBonus:-0.004}}
    ],
    lithoid:[
      {id:"monuments",name:"Monuments",desc:"Score, unity, and rare matter from endurance.",effects:{resourceOutput:{unity:0.08,rare_matter:0.06},score:70}},
      {id:"deep_miners",name:"Deep Miners",desc:"Strategic resources, alloys, and production.",effects:{resourceOutput:{strategic_total:0.1,alloys:0.08,production:0.05}}},
      {id:"stone_memory",name:"Stone Memory",desc:"Culture, science, and low upkeep.",effects:{resourceOutput:{culture:0.08,science:0.06},upkeepBonus:-0.008}}
    ],
    necroid:[
      {id:"ancestor_cults",name:"Ancestor Cults",desc:"Faith, unity, and ascension through memory.",effects:{resourceOutput:{faith:0.1,unity:0.08,ascension:0.05}}},
      {id:"reanimators",name:"Reanimators",desc:"Command and military scale from losses.",effects:{resourceOutput:{command:0.09,military_power:0.08},score:55}},
      {id:"archivists",name:"Archivists",desc:"Data, science, and culture preserve every stage.",effects:{resourceOutput:{data:0.09,science:0.07,culture:0.06}}}
    ],
    toxoid:[
      {id:"alchemists",name:"Alchemists",desc:"Science and medicine from controlled hazards.",effects:{resourceOutput:{science:0.09,medicine:0.08},perSecond:{pollution:-0.04}}},
      {id:"venom_legions",name:"Venom Legions",desc:"Military and strategic throughput from toxins.",effects:{resourceOutput:{military_power:0.1,strategic_total:0.08}}},
      {id:"hazard_barons",name:"Hazard Barons",desc:"Gold, rare matter, and output despite pollution.",effects:{resourceOutput:{gold:0.08,rare_matter:0.07},allOutput:0.025}}
    ],
    extremophile:[
      {id:"thermal_clades",name:"Thermal Clades",desc:"Energy and science from harsh conditions.",effects:{resourceOutput:{energy:0.12,science:0.07},upkeepBonus:-0.006}},
      {id:"void_resilients",name:"Void Resilients",desc:"Cohesion, happiness, and survival in late stages.",effects:{resourceOutput:{cohesion:0.08,happiness:0.08},upkeepBonus:-0.008}},
      {id:"pressure_engineers",name:"Pressure Engineers",desc:"Production, alloys, and rare matter under stress.",effects:{resourceOutput:{production:0.06,alloys:0.08,rare_matter:0.07}}}
    ]
  };

  DATA.LINEAGE_DOCTRINES = {
    humanoid:[
      {id:"humanoid_compacts",name:"Civic Compacts",desc:"Refined administrative memory improves stable output.",effects:{resourceOutput:{science:0.04,influence:0.04,cohesion:0.02}}},
      {id:"humanoid_merit_matrix",name:"Merit Matrix",desc:"Specialist institutions sharpen knowledge and data.",effects:{resourceOutput:{science:0.05,data:0.03}}}
    ],
    mammalian:[
      {id:"mammalian_hearth_net",name:"Hearth Net",desc:"Care networks soften strain while improving food flow.",effects:{resourceOutput:{food:0.04,happiness:0.04,medicine:0.02}}},
      {id:"mammalian_pack_memory",name:"Pack Memory",desc:"Shared behavioral inheritance strengthens cohesion.",effects:{resourceOutput:{culture:0.03,cohesion:0.04,military_power:0.02}}}
    ],
    reptilian:[
      {id:"reptilian_blood_tithe",name:"Blood Tithe",desc:"Command and force scale together.",effects:{resourceOutput:{military_power:0.05,command:0.04,happiness:-0.02}}},
      {id:"reptilian_sun_codes",name:"Sun Codes",desc:"Hierarchy stabilizes frontier growth.",effects:{resourceOutput:{production:0.03,command:0.03,influence:0.03}}}
    ],
    avian:[
      {id:"avian_wayfinding",name:"Wayfinding Canon",desc:"Migration corridors become doctrine.",effects:{resourceOutput:{logistics:0.05,colonies:0.03,culture:0.02}}},
      {id:"avian_chorus_rights",name:"Chorus Rights",desc:"Collective expression sharpens harmony.",effects:{resourceOutput:{culture:0.05,diplomacy:0.03,happiness:0.02}}}
    ],
    arthropoid:[
      {id:"arthropoid_caste_mesh",name:"Caste Mesh",desc:"Work specialization becomes cleaner and faster.",effects:{resourceOutput:{production:0.05,materials:0.03,command:0.02}}},
      {id:"arthropoid_hive_rhythm",name:"Hive Rhythm",desc:"Coordinated timing improves throughput.",effects:{resourceOutput:{production:0.04,alloys:0.03,military_power:0.02}}}
    ],
    molluscoid:[
      {id:"molluscoid_treaty_web",name:"Treaty Web",desc:"Soft influence shapes trade routes.",effects:{resourceOutput:{gold:0.04,diplomacy:0.04,luxury_total:0.03}}},
      {id:"molluscoid_reef_ledger",name:"Reef Ledger",desc:"Long memory markets reward patience.",effects:{resourceOutput:{gold:0.05,culture:0.02,water:0.02}}}
    ],
    fungoid:[
      {id:"fungoid_spore_union",name:"Spore Union",desc:"Distributed life strengthens food and cohesion.",effects:{resourceOutput:{food:0.04,cohesion:0.03,medicine:0.03}}},
      {id:"fungoid_ritual_decay",name:"Ritual Decay",desc:"Waste becomes liturgy and output.",effects:{resourceOutput:{faith:0.04,biomass:0.04,pollution:-0.03}}}
    ],
    plantoid:[
      {id:"plantoid_garden_law",name:"Garden Law",desc:"Living systems favor growth over strain.",effects:{resourceOutput:{food:0.04,terraforming:0.04,happiness:0.02}}},
      {id:"plantoid_root_pacts",name:"Root Pacts",desc:"Interdependence improves diplomacy and unity.",effects:{resourceOutput:{diplomacy:0.04,cohesion:0.03,unity:0.02}}}
    ],
    aquatic:[
      {id:"aquatic_tide_rites",name:"Tide Rites",desc:"Water law becomes a civil anchor.",effects:{resourceOutput:{water:0.05,diplomacy:0.03,food:0.02}}},
      {id:"aquatic_current_charts",name:"Current Charts",desc:"Pelagic paths improve travel and colonies.",effects:{resourceOutput:{logistics:0.04,colonies:0.03,science:0.02}}}
    ],
    lithoid:[
      {id:"lithoid_fault_oaths",name:"Fault Oaths",desc:"Durable civic memory hardens output.",effects:{resourceOutput:{alloys:0.04,unity:0.03,production:0.03}}},
      {id:"lithoid_deep_reserve",name:"Deep Reserve",desc:"Stored matter stabilizes expansion.",effects:{resourceOutput:{strategic_total:0.05,rare_matter:0.03,cohesion:0.02}}}
    ],
    necroid:[
      {id:"necroid_death_rights",name:"Death Rights",desc:"The dead participate in administration and memory.",effects:{resourceOutput:{unity:0.04,data:0.04,faith:0.03}}},
      {id:"necroid_archive_funeral",name:"Archive Funeral",desc:"Loss itself becomes productive memory.",effects:{resourceOutput:{science:0.03,culture:0.03,ascension:0.03}}}
    ],
    toxoid:[
      {id:"toxoid_refinement_creed",name:"Refinement Creed",desc:"Risk management produces value.",effects:{resourceOutput:{science:0.04,gold:0.03,pollution:-0.02}}},
      {id:"toxoid_pressure_pharmacopeia",name:"Pressure Pharmacopeia",desc:"Hazard chemistry stabilizes medicine and war.",effects:{resourceOutput:{medicine:0.04,military_power:0.03,strategic_total:0.02}}}
    ],
    extremophile:[
      {id:"extremophile_stress_gospel",name:"Stress Gospel",desc:"Harsh conditions become a discipline.",effects:{resourceOutput:{energy:0.04,science:0.03,cohesion:0.03}}},
      {id:"extremophile_void_manners",name:"Void Manners",desc:"Resilience improves coordination under pressure.",effects:{resourceOutput:{cohesion:0.04,happiness:0.03,rare_matter:0.02}}}
    ]
  };

  DATA.DOCTRINE_EVOLUTIONS = {
    humanoid_compacts:{name:"Compacts of the Great Forum",desc:"Civic memory hardens into a near-perfect administrative lattice.",effects:{resourceOutput:{science:0.03,influence:0.03,cohesion:0.02,data:0.02}}},
    mammalian_hearth_net:{name:"Hearth Constellation",desc:"Care itself becomes infrastructure.",effects:{resourceOutput:{food:0.03,happiness:0.03,medicine:0.03,cohesion:0.02}}},
    reptilian_blood_tithe:{name:"Imperial Tithe Engine",desc:"Command doctrine becomes a machine of extraction and fear.",effects:{resourceOutput:{military_power:0.04,command:0.03,influence:0.03,happiness:-0.01}}},
    avian_wayfinding:{name:"Grand Migration Canon",desc:"Route memory becomes civil law.",effects:{resourceOutput:{logistics:0.04,colonies:0.03,culture:0.02,diplomacy:0.02}}},
    arthropoid_caste_mesh:{name:"Perfected Mesh",desc:"Labor and command lock into astonishing efficiency.",effects:{resourceOutput:{production:0.04,materials:0.03,command:0.03}}},
    molluscoid_treaty_web:{name:"Oceanic Exchange Web",desc:"Treaty craft reaches interstellar liquidity.",effects:{resourceOutput:{gold:0.04,diplomacy:0.04,luxury_total:0.03}}},
    fungoid_spore_union:{name:"Union of Mycelia",desc:"Distributed life grows into a self-balancing commons.",effects:{resourceOutput:{food:0.03,cohesion:0.03,medicine:0.03,unity:0.02}}},
    plantoid_garden_law:{name:"Garden Covenant",desc:"Living law bends systems toward abundance.",effects:{resourceOutput:{food:0.03,terraforming:0.03,happiness:0.03,unity:0.02}}},
    aquatic_tide_rites:{name:"Tide Concord",desc:"Water law becomes diplomatic inevitability.",effects:{resourceOutput:{water:0.04,diplomacy:0.03,food:0.02,cohesion:0.02}}},
    lithoid_fault_oaths:{name:"Fault Covenant",desc:"Stone memory learns to govern motion itself.",effects:{resourceOutput:{alloys:0.03,unity:0.03,production:0.03,rare_matter:0.02}}},
    necroid_death_rights:{name:"Parliament of the Dead",desc:"Archive persons become a second chamber of state.",effects:{resourceOutput:{unity:0.04,data:0.03,faith:0.03,ascension:0.02}}},
    toxoid_refinement_creed:{name:"Refinement Orthodoxy",desc:"Hazard culture matures into profitable discipline.",effects:{resourceOutput:{science:0.03,gold:0.03,pollution:-0.03,medicine:0.02}}},
    extremophile_stress_gospel:{name:"Gospel of Endurance",desc:"Extreme adaptation becomes a civil religion.",effects:{resourceOutput:{energy:0.03,science:0.03,cohesion:0.03,ascension:0.02}}}
  };

  DATA.LINEAGE_EVENTS = [
    {id:"humanoid_civic_schism",archetype:"humanoid",stage:"civilization",name:"Civic Schism",desc:"Schools and councils disagree on whether merit or consensus should steer society.",choices:[
      {id:"merit",name:"Back Merit",effects:{resourceOutput:{science:0.08,influence:0.05}}},
      {id:"consensus",name:"Back Consensus",effects:{resourceOutput:{culture:0.06,happiness:0.06,diplomacy:0.04}}}
    ]},
    {id:"mammalian_care_crisis",archetype:"mammalian",stage:"civilization",name:"Care Crisis",desc:"Population growth strains care networks.",choices:[
      {id:"clinics",name:"Fund Clinics",effects:{resourceOutput:{medicine:0.08,happiness:0.04}}},
      {id:"granaries",name:"Expand Granaries",effects:{resourceOutput:{food:0.08},populationGrowth:0.003}}
    ]},
    {id:"reptilian_frontier_wars",archetype:"reptilian",stage:"empire",name:"Frontier Wars",desc:"Border commanders demand a permanent military posture.",choices:[
      {id:"discipline",name:"Discipline the Legions",effects:{resourceOutput:{command:0.08,military_power:0.04}}},
      {id:"tribute",name:"Take Tribute",effects:{resourceOutput:{gold:0.06,military_power:0.06}}}
    ]},
    {id:"avian_migration_wave",archetype:"avian",stage:"solar",name:"Migration Wave",desc:"Colonists push for new orbital routes.",choices:[
      {id:"routes",name:"Chart Routes",effects:{resourceOutput:{logistics:0.08,colonies:0.05}}},
      {id:"beacons",name:"Build Beacons",effects:{resourceOutput:{culture:0.08,tourism:0.06}}}
    ]},
    {id:"arthropoid_caste_strike",archetype:"arthropoid",stage:"empire",name:"Caste Strike",desc:"Specialized castes clash over labor allocation.",choices:[
      {id:"labor",name:"Favor Labor Castes",effects:{resourceOutput:{production:0.08,strategic_total:0.05}}},
      {id:"soldiers",name:"Favor Soldier Castes",effects:{resourceOutput:{military_power:0.07,command:0.05}}}
    ]},
    {id:"molluscoid_trade_dispute",archetype:"molluscoid",stage:"solar",name:"Trade Dispute",desc:"Trade habitats argue over soft law and hard tariffs.",choices:[
      {id:"tariffs",name:"Use Tariffs",effects:{resourceOutput:{gold:0.08,luxury_total:0.05}}},
      {id:"arbitration",name:"Use Arbitration",effects:{resourceOutput:{diplomacy:0.08,cohesion:0.04}}}
    ]},
    {id:"fungoid_spore_bloom",archetype:"fungoid",stage:"solar",name:"Spore Bloom",desc:"Dormant arcs wake across colony stations.",choices:[
      {id:"cultivate",name:"Cultivate It",effects:{resourceOutput:{food:0.08,terraforming:0.05}}},
      {id:"study",name:"Study It",effects:{resourceOutput:{science:0.07,medicine:0.06}}}
    ]},
    {id:"plantoid_corridor_debate",archetype:"plantoid",stage:"galactic",name:"Corridor Debate",desc:"Living hyperlanes can be optimized for ecology or unity.",choices:[
      {id:"ecology",name:"Favor Ecology",effects:{resourceOutput:{terraforming:0.09,happiness:0.05}}},
      {id:"unity",name:"Favor Unity",effects:{resourceOutput:{cohesion:0.07,unity:0.06}}}
    ]},
    {id:"aquatic_tide_claims",archetype:"aquatic",stage:"empire",name:"Tide Claims",desc:"River cities and ocean polities dispute water law.",choices:[
      {id:"cities",name:"Favor Cities",effects:{resourceOutput:{medicine:0.06,logistics:0.05}}},
      {id:"oceans",name:"Favor Oceans",effects:{resourceOutput:{water:0.1,diplomacy:0.04}}}
    ]},
    {id:"lithoid_fault_memory",archetype:"lithoid",stage:"empire",name:"Fault Memory",desc:"Seismic archives reveal dangerous but useful deep routes.",choices:[
      {id:"survey",name:"Survey Safely",effects:{resourceOutput:{science:0.06,production:0.04},upkeepBonus:-0.004}},
      {id:"extract",name:"Extract Deep",effects:{resourceOutput:{strategic_total:0.09,alloys:0.05}}}
    ]},
    {id:"necroid_ancestor_claims",archetype:"necroid",stage:"galactic",name:"Ancestor Claims",desc:"Archived dead request legal standing.",choices:[
      {id:"rights",name:"Grant Rights",effects:{resourceOutput:{unity:0.07,cohesion:0.05}}},
      {id:"service",name:"Bind Service",effects:{resourceOutput:{faith:0.08,command:0.05}}}
    ]},
    {id:"toxoid_leak",archetype:"toxoid",stage:"empire",name:"Containment Leak",desc:"Hazard industries suffer a public rupture.",choices:[
      {id:"contain",name:"Contain It",effects:{resourceOutput:{medicine:0.07,science:0.04},perSecond:{pollution:-0.05}}},
      {id:"weaponize",name:"Weaponize It",effects:{resourceOutput:{military_power:0.09,strategic_total:0.04}}}
    ]},
    {id:"extremophile_reactor_breach",archetype:"extremophile",stage:"empire",name:"Reactor Breach",desc:"A dangerous reactor zone becomes a proving ground.",choices:[
      {id:"shield",name:"Shield Settlements",effects:{resourceOutput:{happiness:0.06,energy:0.04},upkeepBonus:-0.006}},
      {id:"study",name:"Study the Breach",effects:{resourceOutput:{science:0.08,energy:0.05}}}
    ]},
    {id:"reptilian_border_legacy",archetype:"reptilian",stage:"galactic",afterEvent:"reptilian_frontier_wars",afterChoice:"discipline",name:"Border Legacy",desc:"Old frontier doctrines become galactic law.",choices:[
      {id:"honor",name:"Honor the Wardens",effects:{resourceOutput:{cohesion:0.06,command:0.06}}},
      {id:"conquest",name:"Codify Conquest",effects:{resourceOutput:{military_power:0.08,ascension:0.04}}}
    ]},
    {id:"fungoid_bloom_legacy",archetype:"fungoid",stage:"galactic",afterEvent:"fungoid_spore_bloom",afterChoice:"cultivate",name:"Bloom Legacy",desc:"Solar spore arcs seed a galactic communion.",choices:[
      {id:"garden",name:"Grow the Garden",effects:{resourceOutput:{terraforming:0.08,unity:0.04}}},
      {id:"choir",name:"Grow the Choir",effects:{resourceOutput:{faith:0.07,cohesion:0.05}}}
    ]},
    {id:"toxoid_containment_legacy",archetype:"toxoid",stage:"galactic",afterEvent:"toxoid_leak",afterChoice:"contain",name:"Containment Legacy",desc:"Hazard reforms become a galactic alchemical standard.",choices:[
      {id:"safety",name:"Export Safety Codes",effects:{resourceOutput:{medicine:0.08,science:0.04},perSecond:{pollution:-0.06}}},
      {id:"patents",name:"Export Patents",effects:{resourceOutput:{gold:0.06,rare_matter:0.05}}}
    ]}
  ];

  DATA.STAGE_GOALS = [
    {id:"starter_path",name:"Starter Path",desc:"Complete the first cell shell by building Membrane Pump, Ribosome, and Vacuole.",reward:1},
    {id:"score_half",name:"Reach Half Target",desc:"Reach 50% of this stage's score target.",reward:1},
    {id:"systems_depth",name:"Build Depth",desc:"Own at least 8 systems in this stage.",reward:1},
    {id:"tech_depth",name:"Research Depth",desc:"Own at least 4 techs in this stage.",reward:1},
    {id:"stable_growth",name:"Stable Growth",desc:"Keep population at 25+ with your stage's key support resources stable.",reward:2}
  ];

  DATA.MAP_SLOTS = {
    cell:[{id:"cytoplasm",name:"Cytoplasm",type:"Cell space",effects:{resourceOutput:{atp:0.04}}},{id:"membrane_edge",name:"Membrane Edge",type:"Cell space",effects:{manualBonus:0.04}},{id:"vesicle_pool",name:"Vesicle Pool",type:"Cell space",effects:{resourceOutput:{proteins:0.04,lipids:0.04}}}],
    creature:[{id:"river_range",name:"River Range",type:"Biome",effects:{resourceOutput:{water:0.08,food:0.04}}},{id:"sheltered_den",name:"Sheltered Den",type:"Biome",effects:{populationGrowth:0.003}},{id:"foraging_ground",name:"Foraging Ground",type:"Biome",effects:{resourceOutput:{food:0.06,materials:0.04}}}],
    tribal:[{id:"riverbank",name:"Riverbank",type:"Territory",effects:{resourceOutput:{food:0.06,water:0.06}}},{id:"highland",name:"Highland",type:"Territory",effects:{resourceOutput:{stone:0.08,military_power:0.04}}},{id:"forest_edge",name:"Forest Edge",type:"Territory",effects:{resourceOutput:{wood:0.08,lumber:0.04}}},{id:"sacred_clearing",name:"Sacred Clearing",type:"Territory",effects:{resourceOutput:{faith:0.06,culture:0.04}}}],
    civilization:[{id:"river_delta",name:"River Delta",type:"Region",effects:{resourceOutput:{food:0.06,gold:0.04}}},{id:"market_quarter",name:"Market Quarter",type:"Region",effects:{resourceOutput:{gold:0.08,luxury_total:0.04}}},{id:"citadel_hill",name:"Citadel Hill",type:"Region",effects:{resourceOutput:{military_power:0.06,influence:0.04}}},{id:"university_ward",name:"University Ward",type:"Region",effects:{resourceOutput:{science:0.08}}}],
    empire:[{id:"industrial_basin",name:"Industrial Basin",type:"Region",effects:{resourceOutput:{production:0.08,strategic_total:0.04}}},{id:"capital_province",name:"Capital Province",type:"Region",effects:{resourceOutput:{influence:0.08,gold:0.04}}},{id:"frontier_zone",name:"Frontier Zone",type:"Region",effects:{resourceOutput:{military_power:0.08,logistics:0.04}}},{id:"research_corridor",name:"Research Corridor",type:"Region",effects:{resourceOutput:{science:0.08,data:0.04}}}],
    solar:[{id:"inner_orbit",name:"Inner Orbit",type:"Planetary slot",effects:{resourceOutput:{energy:0.1}}},{id:"asteroid_belt",name:"Asteroid Belt",type:"Planetary slot",effects:{resourceOutput:{alloys:0.08,strategic_total:0.04}}},{id:"habitable_world",name:"Habitable World",type:"Planetary slot",effects:{resourceOutput:{colonies:0.08,food:0.04}}},{id:"outer_array",name:"Outer Array",type:"Planetary slot",effects:{resourceOutput:{science:0.06,data:0.06}}}],
    galactic:[{id:"core_sector",name:"Core Sector",type:"Sector",effects:{resourceOutput:{cohesion:0.08,unity:0.04}}},{id:"trade_spine",name:"Trade Spine",type:"Sector",effects:{resourceOutput:{gold:0.08,diplomacy:0.06}}},{id:"frontier_cluster",name:"Frontier Cluster",type:"Sector",effects:{resourceOutput:{rare_matter:0.06,military_power:0.05}}},{id:"ascension_nexus",name:"Ascension Nexus",type:"Sector",effects:{resourceOutput:{ascension:0.08,data:0.04}}}]
  };

  DATA.ERA_MODIFIERS = {
    cell:[{id:"nutrient_bloom",name:"Nutrient Bloom",effects:{resourceOutput:{glucose:0.1,proteins:0.06}}},{id:"acidic_tide",name:"Acidic Tide",effects:{resourceOutput:{elements:0.08},upkeepBonus:0.01}}],
    creature:[{id:"ice_age",name:"Ice Age",effects:{resourceOutput:{food:-0.06,materials:0.08},upkeepBonus:0.006}},{id:"wet_season",name:"Wet Season",effects:{resourceOutput:{water:0.12,food:0.04}}}],
    tribal:[{id:"golden_summer",name:"Golden Summer",effects:{resourceOutput:{food:0.08,culture:0.04}}},{id:"raiding_season",name:"Raiding Season",effects:{resourceOutput:{military_power:0.1,happiness:-0.04}}}],
    civilization:[{id:"golden_age",name:"Golden Age",effects:{allOutput:0.04,resourceOutput:{culture:0.06}}},{id:"plague_years",name:"Plague Years",effects:{resourceOutput:{medicine:0.08,happiness:-0.06},populationGrowth:-0.002}}],
    empire:[{id:"industrial_boom",name:"Industrial Boom",effects:{resourceOutput:{production:0.12,pollution:0.04}}},{id:"world_unrest",name:"World Unrest",effects:{resourceOutput:{military_power:0.08,happiness:-0.06}}}],
    solar:[{id:"solar_storm",name:"Solar Storm",effects:{resourceOutput:{energy:0.14,data:-0.05}}},{id:"colony_boom",name:"Colony Boom",effects:{resourceOutput:{colonies:0.12,food:0.04}}}],
    galactic:[{id:"galactic_unrest",name:"Galactic Unrest",effects:{resourceOutput:{military_power:0.1,cohesion:-0.05}}},{id:"cosmic_alignment",name:"Cosmic Alignment",effects:{resourceOutput:{ascension:0.12,unity:0.06}}}]
  };

  DATA.ERA_LEGACIES = {
    ice_age:{name:"Legacy of Ice",desc:"Cold-era adaptation improves survival storage.",effects:{resourceOutput:{food:0.02,water:0.02}}},
    solar_storm:{name:"Legacy of Stormfire",desc:"Storm-forged systems better withstand energy surges.",effects:{resourceOutput:{energy:0.03,data:0.01}}},
    galactic_unrest:{name:"Legacy of Unrest",desc:"Disorder once survived becomes institutional hardness.",effects:{resourceOutput:{cohesion:0.03,military_power:0.02}}},
    golden_age:{name:"Legacy of Flourishing",desc:"A remembered high age leaves behind civic confidence.",effects:{allOutput:0.01,culture:10}},
    cosmic_alignment:{name:"Legacy of Alignment",desc:"Rare cosmic harmony leaves a lasting ascension trace.",effects:{resourceOutput:{ascension:0.03,unity:0.02}}}
  };

  DATA.ARTIFACTS = [
    {id:"primordial_membrane",stage:"cell",name:"Primordial Membrane",desc:"Inherited cellular boundary memory.",effects:{resourceOutput:{atp:0.04},manualBonus:0.03}},
    {id:"ancestral_bone",stage:"creature",name:"Ancestral Bone",desc:"A fossilized behavioral memory.",effects:{resourceOutput:{knowledge:0.05,military_power:0.03}}},
    {id:"first_totem",stage:"tribal",name:"First Totem",desc:"A symbol carried between births.",effects:{resourceOutput:{culture:0.05,faith:0.04}}},
    {id:"founding_coin",stage:"civilization",name:"Founding Coin",desc:"Economic memory from the first cities.",effects:{resourceOutput:{gold:0.05,influence:0.03}}},
    {id:"imperial_seal",stage:"empire",name:"Imperial Seal",desc:"Administrative continuity from a prior empire.",effects:{resourceOutput:{influence:0.05,logistics:0.04}}},
    {id:"void_compass",stage:"solar",name:"Void Compass",desc:"Navigation memory from the first solar expansion.",effects:{resourceOutput:{colonies:0.04,data:0.04}}},
    {id:"ascension_shard",stage:"galactic",name:"Ascension Shard",desc:"A remnant of a successful transcendence.",effects:{resourceOutput:{ascension:0.05,unity:0.04},score:80}}
  ];

  DATA.ARTIFACT_SETS = [
    {id:"deep_memory",name:"Deep Memory",requires:["primordial_membrane","ancestral_bone","first_totem"],effects:{allOutput:0.03,score:50}},
    {id:"imperial_navigation",name:"Imperial Navigation",requires:["founding_coin","imperial_seal","void_compass"],effects:{resourceOutput:{gold:0.04,influence:0.04,colonies:0.04}}},
    {id:"ascendant_archive",name:"Ascendant Archive",requires:["primordial_membrane","ascension_shard"],effects:{resourceOutput:{science:0.04,data:0.04,ascension:0.04}}}
  ];

  DATA.ARTIFACT_EVOLUTIONS = [
    {id:"awakened_membrane",artifactId:"primordial_membrane",wins:2,cost:{science:50,data:20},name:"Awakened Membrane",desc:"The oldest cellular memory learns to self-organize.",effects:{resourceOutput:{atp:0.05,glucose:0.03},manualBonus:0.04}},
    {id:"resonant_totem",artifactId:"first_totem",wins:3,cost:{culture:80,faith:60},name:"Resonant Totem",desc:"A ritual object that now carries explicit inter-run memory.",effects:{resourceOutput:{culture:0.04,faith:0.04,unity:0.03}}},
    {id:"vector_compass",artifactId:"void_compass",wins:4,cost:{energy:90,data:90,alloys:60},name:"Vector Compass",desc:"Navigation memory becomes predictive instead of descriptive.",effects:{resourceOutput:{colonies:0.05,data:0.05,logistics:0.03}}},
    {id:"lucid_shard",artifactId:"ascension_shard",wins:6,cost:{data:140,ascension:100,unity:90},name:"Lucid Shard",desc:"The shard begins carrying intact transcendence patterns.",effects:{resourceOutput:{ascension:0.06,unity:0.05,science:0.03},score:110}}
  ];

  DATA.ARTIFACT_FUSIONS = [
    {id:"ritual_cartography",requires:["resonant_totem","vector_compass"],name:"Ritual Cartography",desc:"Pilgrimage and navigation become one memory discipline.",effects:{resourceOutput:{culture:0.03,colonies:0.03,data:0.03}}},
    {id:"membrane_transcendence",requires:["awakened_membrane","lucid_shard"],name:"Membrane Transcendence",desc:"First boundaries and final ascent remember each other.",effects:{resourceOutput:{atp:0.04,ascension:0.04,science:0.03},score:70}}
  ];

  DATA.MASTERY_RELICS = {
    cell:{id:"cell_mastery_relic",name:"Relic of First Division",desc:"Cell mastery keeps your earliest structures cleaner and faster.",effects:{resourceOutput:{atp:0.03,glucose:0.02},manualBonus:0.03}},
    civilization:{id:"civilization_mastery_relic",name:"Relic of the First Charter",desc:"Civic memory improves stable gold, culture, and influence.",effects:{resourceOutput:{gold:0.03,culture:0.02,influence:0.02}}},
    solar:{id:"solar_mastery_relic",name:"Relic of the Launch Window",desc:"Solar discipline sharpens energy and colonization starts.",effects:{resourceOutput:{energy:0.03,colonies:0.02,data:0.02}}},
    galactic:{id:"galactic_mastery_relic",name:"Relic of the Quiet Horizon",desc:"Final-stage mastery leaves a permanent ascension trace.",effects:{resourceOutput:{ascension:0.03,unity:0.02,cohesion:0.02}}}
  };

  DATA.DOCTRINE_CONFLICTS = [
    {id:"doctrine_command_friction",doctrine:"humanoid_compacts",bloc:"energetic",name:"Civil-Radiant Friction",desc:"Administrative pluralism resists hard conversion politics.",effects:{resourceOutput:{cohesion:-0.02,energy:0.02}}},
    {id:"doctrine_garden_friction",doctrine:"plantoid_garden_law",bloc:"energetic",name:"Garden Repression",desc:"Living law strains under pure-energy doctrine.",effects:{resourceOutput:{happiness:-0.02,alloys:0.02}}},
    {id:"doctrine_rite_friction",doctrine:"necroid_death_rights",bloc:"psionic",name:"Ancestor Dissonance",desc:"The living and archived dead disagree over shared mental voice.",effects:{resourceOutput:{unity:-0.02,diplomacy:0.02}}},
    {id:"doctrine_wayfinding_synergy",doctrine:"avian_wayfinding",bloc:"psionic",name:"Open Sky Compact",desc:"Migratory law thrives in chorus-space.",effects:{resourceOutput:{logistics:0.03,diplomacy:0.03}}},
    {id:"doctrine_stress_synergy",doctrine:"extremophile_stress_gospel",bloc:"dimensional",name:"Threshold Liturgy",desc:"Harsh doctrine and dimensional policy reinforce each other.",effects:{resourceOutput:{rare_matter:0.03,ascension:0.03}}}
  ];

  DATA.SLOT_TRAITS = [
    {id:"fertile",name:"Fertile",effects:{resourceOutput:{food:0.04,biomass:0.03}}},
    {id:"mineral_rich",name:"Mineral-Rich",effects:{resourceOutput:{stone:0.04,alloys:0.03,strategic_total:0.03}}},
    {id:"sacred",name:"Sacred",effects:{resourceOutput:{faith:0.04,culture:0.03}}},
    {id:"toxic",name:"Toxic",effects:{resourceOutput:{science:0.03,medicine:0.03,pollution:0.02}}},
    {id:"frozen",name:"Frozen",effects:{resourceOutput:{water:0.04,energy:-0.02}}},
    {id:"irradiated",name:"Irradiated",effects:{resourceOutput:{energy:0.04,science:0.03}}},
    {id:"unstable",name:"Unstable",effects:{resourceOutput:{production:0.04,happiness:-0.03}}}
  ];

  DATA.ADJACENCY_BONUSES = [
    {id:"market_delta",name:"River Trade",slot:"river_delta",category:"Infrastructure",effects:{resourceOutput:{gold:0.06,diplomacy:0.03}}},
    {id:"sacred_clearing_faith",name:"Sacred Center",slot:"sacred_clearing",category:"Buildings",effects:{resourceOutput:{faith:0.06,culture:0.03}}},
    {id:"industrial_basin_industry",name:"Industrial Cluster",slot:"industrial_basin",category:"Industry",effects:{resourceOutput:{production:0.07,strategic_total:0.03}}},
    {id:"asteroid_mining",name:"Belt Mining",slot:"asteroid_belt",category:"Mining",effects:{resourceOutput:{alloys:0.07,strategic_total:0.03}}},
    {id:"ascension_nexus_victory",name:"Nexus Alignment",slot:"ascension_nexus",category:"Victory paths",effects:{resourceOutput:{ascension:0.08,unity:0.03}}}
  ];

  DATA.TAG_SYNERGIES = [
    {id:"market_water",name:"River Market",slotTags:["water"],systemTags:["market","trade"],effects:{resourceOutput:{gold:0.05,diplomacy:0.03}}},
    {id:"sacred_faith",name:"Sanctified Ground",slotTags:["sacred"],systemTags:["faith","temple","ritual"],effects:{resourceOutput:{faith:0.06,culture:0.03}}},
    {id:"mineral_industry",name:"Ore-Fed Industry",slotTags:["mineral"],systemTags:["industry","mining","foundry"],effects:{resourceOutput:{production:0.06,strategic_total:0.04}}},
    {id:"high_orbit",name:"High-Orbit Advantage",slotTags:["high","orbit"],systemTags:["avian","fleet","orbital","command"],effects:{resourceOutput:{command:0.05,energy:0.03}}},
    {id:"toxic_science",name:"Hazard Research",slotTags:["toxic","irradiated"],systemTags:["science","medicine","reactor"],effects:{resourceOutput:{science:0.05,medicine:0.03}}},
    {id:"fertile_growth",name:"Fertile Growth Web",slotTags:["fertile"],systemTags:["food","growth","plantoid"],effects:{resourceOutput:{food:0.05,biomass:0.04}}},
    {id:"memory_ossuary",name:"Deep Memory Site",slotTags:["memory","sacred"],systemTags:["necroid","archive","faith"],effects:{resourceOutput:{cohesion:0.04,faith:0.04,data:0.03}}}
  ];

  DATA.STAGE_CONTRACTS = [
    {id:"lean_water",name:"Low Water Run",requiresWin:true,desc:"Water output is lower, but completion rewards extra EP.",effects:{resourceOutput:{water:-0.12}},reward:4,chain:"survival",tier:1},
    {id:"desert_lineage",name:"Dry World Pilgrimage",requiresWin:true,after:"lean_water",desc:"A harsher low-water contract that rewards disciplined ecology.",effects:{resourceOutput:{water:-0.18,food:-0.06,happiness:0.05}},reward:7,chain:"survival",tier:2},
    {id:"peace_vow",name:"No Military Focus",requiresWin:true,desc:"Military output is lower, diplomacy and culture rise.",effects:{resourceOutput:{military_power:-0.12,diplomacy:0.08,culture:0.05}},reward:4,chain:"accord",tier:1},
    {id:"open_borders",name:"Open Borders Mandate",requiresWin:true,after:"peace_vow",desc:"No military focus deepens into migration, diplomacy, and rival risk.",effects:{resourceOutput:{military_power:-0.18,diplomacy:0.12,culture:0.08,happiness:0.04}},reward:7,chain:"accord",tier:2},
    {id:"dirty_industry",name:"High Pollution Industry",requiresWin:true,desc:"Production is stronger, pollution pressure rises.",effects:{resourceOutput:{production:0.1,pollution:0.08}},reward:3,chain:"industry",tier:1},
    {id:"black_sky_boom",name:"Black Sky Boom",requiresWin:true,after:"dirty_industry",desc:"Brutal production sprint with serious pollution consequences.",effects:{resourceOutput:{production:0.18,pollution:0.16,happiness:-0.04}},reward:8,chain:"industry",tier:2}
  ];

  DATA.THREAT_PROJECTS = [
    {threat:"famine",id:"relief_granaries",name:"Relief Granaries",cost:{food:60,production:40},effects:{resourceOutput:{food:0.08,happiness:0.04}}},
    {threat:"instability",id:"public_reforms",name:"Public Reforms",cost:{culture:60,influence:40},effects:{resourceOutput:{happiness:0.1,cohesion:0.04}}},
    {threat:"ecology",id:"cleanup_drive",name:"Cleanup Drive",cost:{production:60,science:45},effects:{perSecond:{pollution:-0.08},resourceOutput:{medicine:0.04}}},
    {threat:"security",id:"militia_drills",name:"Militia Drills",cost:{military_power:40,production:45},effects:{resourceOutput:{military_power:0.1,command:0.04}}},
    {threat:"crisis",id:"ascension_shelter",name:"Ascension Shelter",cost:{data:80,cohesion:60},effects:{resourceOutput:{ascension:0.12,cohesion:0.06}}},
    {threat:"rival",id:"counter_rivalry",name:"Counter-Rivalry Mandate",cost:{influence:70,military_power:45},effects:{resourceOutput:{diplomacy:0.06,military_power:0.06,cohesion:0.04}}}
  ];

  DATA.RIVAL_EVENTS = [
    {id:"trade_pact",name:"Trade Pact",desc:"Exchange markets with the leading rival.",effects:{resourceOutput:{gold:0.05,diplomacy:0.05}}},
    {id:"border_clash",name:"Border Clash",desc:"Meet rival pressure with force.",effects:{resourceOutput:{military_power:0.06,command:0.04}}},
    {id:"cultural_exchange",name:"Cultural Exchange",desc:"Let artists and priests mingle across borders.",effects:{resourceOutput:{culture:0.05,faith:0.03}}},
    {id:"espionage",name:"Espionage",desc:"Steal ideas and slow the rival.",effects:{resourceOutput:{science:0.04,data:0.04}}},
    {id:"shared_crisis",name:"Shared Crisis",desc:"Cooperate against a common threat.",effects:{resourceOutput:{cohesion:0.06,happiness:0.03}}}
  ];

  DATA.RIVAL_PERSONALITIES = [
    {id:"expansionist",name:"Expansionist",desc:"Scores quickly and pressures territory.",trend:1.22,effects:{resourceOutput:{production:-0.02,diplomacy:0.02}}},
    {id:"mystic",name:"Mystic",desc:"Faith-heavy rivals push culture and relic competition.",trend:0.96,effects:{resourceOutput:{faith:0.02,culture:-0.02}}},
    {id:"industrialist",name:"Industrialist",desc:"Builds fast and worsens pollution races.",trend:1.12,effects:{resourceOutput:{production:0.02,pollution:0.02}}},
    {id:"diplomat",name:"Diplomat",desc:"Slower to win, but harder to isolate.",trend:0.88,effects:{resourceOutput:{diplomacy:0.03,military_power:-0.02}}},
    {id:"devourer",name:"Devourer",desc:"A hungry rival that turns ignored pressure into crisis.",trend:1.32,effects:{resourceOutput:{food:-0.03,military_power:0.03}}}
  ];

  DATA.ARCHIVE_MILESTONES = [
    {id:"archive_25",count:25,name:"Archive Index",effects:{allOutput:0.01}},
    {id:"archive_50",count:50,name:"Cross-Run Patterning",effects:{allOutput:0.02,resourceOutput:{science:0.02}}},
    {id:"archive_100",count:100,name:"Deep Comparative Memory",effects:{allOutput:0.03,resourceOutput:{data:0.03,culture:0.02}}},
    {id:"archive_200",count:200,name:"Pan-Lineage Encyclopedia",effects:{allOutput:0.04,resourceOutput:{unity:0.03,ascension:0.02}}}
  ];

  DATA.TIMELINE_MILESTONES = [
    {id:"timeline_recorded_beginnings",count:10,name:"Recorded Beginnings",desc:"Enough remembered runs and discoveries to shape future instincts.",effects:{allOutput:0.01}},
    {id:"timeline_dynastic_memory",count:25,name:"Dynastic Memory",desc:"A longer historical arc hardens future planning.",effects:{resourceOutput:{culture:0.03,data:0.03,cohesion:0.02}}},
    {id:"timeline_civilizational_weight",count:50,name:"Civilizational Weight",desc:"The archive of prior lives now meaningfully steers new ones.",effects:{allOutput:0.02,resourceOutput:{science:0.03,unity:0.03}}}
  ];

  DATA.THREAT_SCARS = {
    famine:{name:"Hunger Memory",effects:{resourceOutput:{food:-0.01,happiness:-0.01}}},
    instability:{name:"Civil Fracture",effects:{resourceOutput:{happiness:-0.015,cohesion:-0.01}}},
    ecology:{name:"Toxic Legacy",effects:{resourceOutput:{pollution:0.015,medicine:-0.01}}},
    security:{name:"Border Trauma",effects:{resourceOutput:{military_power:-0.012,diplomacy:-0.008}}},
    crisis:{name:"Cosmic Dread",effects:{resourceOutput:{ascension:-0.015,cohesion:-0.01}}},
    rival:{name:"Rival Shadow",effects:{resourceOutput:{diplomacy:-0.01,influence:-0.01}}}
  };

  DATA.SCAR_TRANSFORMS = {
    famine:{id:"hunger_wisdom",name:"Hunger Wisdom",effects:{resourceOutput:{food:0.03,happiness:0.02}}},
    instability:{id:"reform_memory",name:"Reform Memory",effects:{resourceOutput:{cohesion:0.03,culture:0.02}}},
    ecology:{id:"green_remediation",name:"Green Remediation",effects:{resourceOutput:{medicine:0.03,pollution:-0.03}}},
    security:{id:"watchful_borders",name:"Watchful Borders",effects:{resourceOutput:{military_power:0.03,diplomacy:0.02}}},
    crisis:{id:"cosmic_composure",name:"Cosmic Composure",effects:{resourceOutput:{ascension:0.03,cohesion:0.02}}},
    rival:{id:"rival_studies",name:"Rival Studies",effects:{resourceOutput:{diplomacy:0.03,influence:0.02}}}
  };

  DATA.RUN_MUTATORS = [
    {id:"lean_brood",name:"Lean Brood",desc:"Lower population pressure, lower food output.",effects:{resourceOutput:{food:-0.06},upkeepBonus:-0.006,score:25}},
    {id:"reckless_expansion",name:"Reckless Expansion",desc:"Faster production, less happiness.",effects:{resourceOutput:{production:0.08,happiness:-0.04},score:20}},
    {id:"ritual_focus",name:"Ritual Focus",desc:"Culture and faith rise while science slows.",effects:{resourceOutput:{culture:0.08,faith:0.08,science:-0.04}}},
    {id:"frontier_mind",name:"Frontier Mind",desc:"Military and exploration outputs rise.",effects:{resourceOutput:{military_power:0.06,colonies:0.05,command:0.04}}},
    {id:"quiet_laboratories",name:"Quiet Laboratories",desc:"Science and data rise while gold softens.",effects:{resourceOutput:{science:0.08,data:0.05,gold:-0.03}}},
    {id:"ecological_oath",name:"Ecological Oath",desc:"Pollution pressure falls, heavy industry softens.",effects:{resourceOutput:{pollution:-0.08,production:-0.03,medicine:0.04}}}
  ];

  DATA.LINEAGE_LAWS = {
    empire:[
      {id:"ancestor_courts",name:"Ancestor Courts",desc:"Inherited precedent stabilizes administration.",effects:{resourceOutput:{influence:0.08,cohesion:0.04},score:30}},
      {id:"open_migration",name:"Open Migration",desc:"Population flows improve culture and happiness.",effects:{resourceOutput:{culture:0.06,happiness:0.06},populationGrowth:0.004}},
      {id:"war_levies",name:"War Levies",desc:"Military pressure rises at a happiness cost.",effects:{resourceOutput:{military_power:0.1,happiness:-0.03}}}
    ],
    solar:[
      {id:"ark_charters",name:"Ark Charters",desc:"Colonies and cohesion organize around long voyages.",effects:{resourceOutput:{colonies:0.08,cohesion:0.04}}},
      {id:"orbital_commons",name:"Orbital Commons",desc:"Shared habitats improve happiness and science.",effects:{resourceOutput:{happiness:0.05,science:0.05}}},
      {id:"fleet_prerogative",name:"Fleet Prerogative",desc:"Command rises, diplomacy tightens.",effects:{resourceOutput:{command:0.08,diplomacy:-0.03}}}
    ],
    galactic:[
      {id:"memory_rights",name:"Memory Rights",desc:"Data archives are treated as citizens.",effects:{resourceOutput:{data:0.08,unity:0.04}}},
      {id:"xeno_compacts",name:"Xeno Compacts",desc:"Diplomacy and cohesion anchor the late game.",effects:{resourceOutput:{diplomacy:0.08,cohesion:0.06}}},
      {id:"ascension_mandate",name:"Ascension Mandate",desc:"Ascension output rises, but happiness strains.",effects:{resourceOutput:{ascension:0.1,happiness:-0.04}}}
    ]
  };

  DATA.LAW_SETS = [
    {id:"chartered_memory",name:"Chartered Memory",requires:["ancestor_courts","ark_charters","memory_rights"],effects:{allOutput:0.025,resourceOutput:{data:0.03,cohesion:0.03}}},
    {id:"open_constellation",name:"Open Constellation",requires:["open_migration","orbital_commons","xeno_compacts"],effects:{resourceOutput:{happiness:0.04,diplomacy:0.04,culture:0.03}}},
    {id:"command_mandate",name:"Command Mandate",requires:["war_levies","fleet_prerogative","ascension_mandate"],effects:{resourceOutput:{military_power:0.05,command:0.05,ascension:0.03}}}
  ];

  DATA.LAW_CONGRESS_RELATIONS = [
    {id:"memory_synthetic",law:"memory_rights",bloc:"synthetic",name:"Machine Memory Charter",desc:"Memory rights harmonize with synthetic continuity policy.",effects:{resourceOutput:{data:0.03,science:0.02,cohesion:0.01}}},
    {id:"migration_psionic",law:"open_migration",bloc:"psionic",name:"Migratory Chorus",desc:"Open migration thrives under shared-conscious congresses.",effects:{resourceOutput:{culture:0.02,diplomacy:0.03,happiness:0.02}}},
    {id:"levies_energetic",law:"war_levies",bloc:"energetic",name:"Radiant Levy",desc:"Military law and conversion blocs reinforce each other.",effects:{resourceOutput:{military_power:0.03,command:0.03,energy:0.02}}},
    {id:"commons_biological",law:"orbital_commons",bloc:"biological",name:"Living Commons",desc:"Shared habitats pair well with biosphere politics.",effects:{resourceOutput:{food:0.02,cohesion:0.02,happiness:0.02}}},
    {id:"mandate_dimensional",law:"ascension_mandate",bloc:"dimensional",name:"Mandated Threshold",desc:"Dimensional policy sharpens ascension bureaucracy.",effects:{resourceOutput:{ascension:0.03,data:0.02,happiness:-0.01}}},
    {id:"fleet_synthetic_tension",law:"fleet_prerogative",bloc:"synthetic",name:"Doctrine Friction",desc:"Command-first fleets strain open machine memory culture.",effects:{resourceOutput:{science:-0.02,diplomacy:-0.02,command:0.02}}},
    {id:"rights_energetic_tension",law:"memory_rights",bloc:"energetic",name:"Archive Burnout",desc:"Archive personhood resists hard conversion politics.",effects:{resourceOutput:{unity:-0.02,cohesion:-0.02,energy:0.02}}}
  ];

  DATA.WORLD_SLOT_EVENTS = [
    {id:"river_flood",name:"River Flood",slotTags:["water"],desc:"Floodwater threatens lowlands.",choices:[{id:"levees",name:"Build Levees",effects:{resourceOutput:{water:0.04,food:0.03,happiness:0.02}}},{id:"floodplain_farms",name:"Floodplain Farms",effects:{resourceOutput:{food:0.08,production:-0.02}}}]},
    {id:"sacred_schism",name:"Sacred Schism",slotTags:["sacred","faith"],desc:"A ritual dispute splits the faithful.",choices:[{id:"council",name:"Convene Council",effects:{resourceOutput:{faith:0.04,cohesion:0.03}}},{id:"reform_rites",name:"Reform Rites",effects:{resourceOutput:{culture:0.06,happiness:0.02}}}]},
    {id:"frontier_gold_rush",name:"Frontier Gold Rush",slotTags:["mineral","market"],desc:"Prospectors flood the frontier.",choices:[{id:"license_claims",name:"License Claims",effects:{resourceOutput:{gold:0.08,pollution:0.02}}},{id:"public_mines",name:"Public Mines",effects:{resourceOutput:{production:0.05,strategic_total:0.03}}}]},
    {id:"reactor_leak",name:"Reactor Leak",slotTags:["toxic","irradiated"],desc:"Dangerous research yields risk.",choices:[{id:"containment",name:"Containment",effects:{resourceOutput:{medicine:0.04,pollution:-0.03}}},{id:"study_exposure",name:"Study Exposure",effects:{resourceOutput:{science:0.08,pollution:0.04}}}]},
    {id:"orbital_window",name:"Orbital Window",slotTags:["orbit","high"],desc:"Launch timing opens a rare corridor.",choices:[{id:"civilian_launches",name:"Civilian Launches",effects:{resourceOutput:{colonies:0.06,happiness:0.02}}},{id:"fleet_launches",name:"Fleet Launches",effects:{resourceOutput:{command:0.06,energy:0.03}}}]}
  ];

  DATA.WORLD_EVENT_CHAINS = {
    river_flood:{floodplain_farms:{id:"delta_bounty",name:"Delta Bounty",desc:"The floodplain becomes a durable breadbasket.",choices:[{id:"granary_tithes",name:"Granary Tithes",effects:{resourceOutput:{food:0.05,gold:0.03}}},{id:"wetland_reserve",name:"Wetland Reserve",effects:{resourceOutput:{food:0.03,medicine:0.03,happiness:0.02}}}]}},
    sacred_schism:{reform_rites:{id:"new_doctrine",name:"New Doctrine",desc:"Reformed rites demand a stable settlement.",choices:[{id:"pluralist_temple",name:"Pluralist Temple",effects:{resourceOutput:{culture:0.04,diplomacy:0.03}}},{id:"orthodox_codex",name:"Orthodox Codex",effects:{resourceOutput:{faith:0.06,cohesion:0.02}}}]}},
    frontier_gold_rush:{license_claims:{id:"boomtown_charter",name:"Boomtown Charter",desc:"The rush wants civic shape before it burns out.",choices:[{id:"merchant_court",name:"Merchant Court",effects:{resourceOutput:{gold:0.05,influence:0.03}}},{id:"safety_board",name:"Safety Board",effects:{resourceOutput:{production:0.03,pollution:-0.02}}}]}},
    reactor_leak:{study_exposure:{id:"mutagen_protocol",name:"Mutagen Protocol",desc:"Exposure data opens dangerous refinement.",choices:[{id:"medical_trials",name:"Medical Trials",effects:{resourceOutput:{medicine:0.05,science:0.02}}},{id:"weaponized_reactor",name:"Weaponized Reactor",effects:{resourceOutput:{energy:0.05,military_power:0.03,pollution:0.03}}}]}},
    orbital_window:{fleet_launches:{id:"high_lane_claim",name:"High-Lane Claim",desc:"The launch corridor becomes contested infrastructure.",choices:[{id:"civilian_beacons",name:"Civilian Beacons",effects:{resourceOutput:{colonies:0.04,diplomacy:0.03}}},{id:"military_beacons",name:"Military Beacons",effects:{resourceOutput:{command:0.05,military_power:0.03}}}]}}
  };

  DATA.SPECIAL_PROJECTS = [
    {id:"great_granary",stage:"tribal",name:"Great Granary",desc:"A food security wonder that softens famine pressure.",duration:90,cost:{wood:90,stone:70,food:80},effects:{resourceOutput:{food:0.08,happiness:0.04}},choices:[{id:"public_stores",name:"Public Stores",effects:{resourceOutput:{food:0.05,happiness:0.03}}},{id:"seed_vaults",name:"Seed Vaults",effects:{resourceOutput:{food:0.03,science:0.03}}}]},
    {id:"constitutional_reform",stage:"civilization",name:"Constitutional Reform",desc:"A civic project that stabilizes culture and influence.",duration:110,cost:{culture:120,gold:90,science:90},requiresEventChoice:"sacred_schism:reform_rites",effects:{resourceOutput:{culture:0.07,influence:0.06,happiness:0.04}},choices:[{id:"rights_charter",name:"Rights Charter",effects:{resourceOutput:{happiness:0.05,culture:0.03}}},{id:"senate_compacts",name:"Senate Compacts",effects:{resourceOutput:{influence:0.05,diplomacy:0.03}}}]},
    {id:"planetary_wonder",stage:"empire",name:"Planetary Wonder",desc:"A prestige project that boosts gold, culture, and unity.",duration:130,cost:{production:220,gold:180,science:130},requiresLaw:"ancestor_courts",effects:{resourceOutput:{gold:0.07,culture:0.06,unity:0.03}},choices:[{id:"people_wonder",name:"People's Wonder",effects:{resourceOutput:{culture:0.05,happiness:0.04}}},{id:"imperial_monument",name:"Imperial Monument",effects:{resourceOutput:{influence:0.05,unity:0.04}}}]},
    {id:"ftl_theory_conclave",stage:"solar",name:"FTL Theory Conclave",desc:"A high-orbit summit where scientists, navigators, and political blocs commit to one credible doctrine for breaking the stellar limit.",duration:78,cost:{science:120,data:70,culture:55},requiresSystem:"solar_array",effects:{resourceOutput:{science:0.05,data:0.04,cohesion:0.03}},choices:[{id:"warp_lensing",name:"Back Warp Lensing",effects:{resourceOutput:{science:0.03,cohesion:0.02}}},{id:"hyperlane_resonance",name:"Back Hyperlane Resonance",effects:{resourceOutput:{data:0.03,energy:0.02}}},{id:"wormhole_apertures",name:"Back Wormhole Apertures",effects:{resourceOutput:{influence:0.03,data:0.02}}}]},
    {id:"ftl_proof_flight",stage:"solar",name:"FTL Proof Flight",desc:"Launch a dangerous manned test through the chosen doctrine and bring back proof that the leap can be repeated.",duration:92,cost:{science:150,energy:120,alloys:90,data:70},requiresSystem:"shipyard_ring",requiresCompletedProject:"ftl_theory_conclave",effects:{resourceOutput:{data:0.06,colonies:0.04,cohesion:0.03}},choices:[{id:"crew_returns",name:"The crew returns alive",effects:{resourceOutput:{happiness:0.04,cohesion:0.03}}},{id:"signal_only",name:"Only the signal returns",effects:{resourceOutput:{science:0.04,data:0.03}}}]},
    {id:"ftl_research",stage:"solar",name:"FTL Research Array",desc:"Finalize the chosen doctrine into a repeatable interstellar method and prove how this civilization will actually cross into the galactic frontier.",duration:105,cost:{science:200,energy:170,data:80},requiresSystem:"shipyard_ring",requiresCompletedProject:"ftl_proof_flight",effects:{resourceOutput:{data:0.08,colonies:0.05,ascension:0.03},score:90},choices:[{id:"warp_lensing",name:"Warp Lensing",effects:{resourceOutput:{colonies:0.05,cohesion:0.03}}},{id:"hyperlane_resonance",name:"Hyperlane Resonance",effects:{resourceOutput:{data:0.06,energy:0.04}}},{id:"wormhole_apertures",name:"Wormhole Apertures",effects:{resourceOutput:{influence:0.05,data:0.04}}}]},
    {id:"emergency_ascension_work",stage:"galactic",name:"Emergency Ascension Work",desc:"A crisis project for synthetic endgame acceleration.",duration:160,cost:{data:320,cohesion:240,energy:260},requiresPath:"synthetic",effects:{resourceOutput:{ascension:0.12,cohesion:0.05},score:140},choices:[{id:"shelter_reality",name:"Shelter Reality",effects:{resourceOutput:{cohesion:0.06,happiness:0.03}}},{id:"force_transcendence",name:"Force Transcendence",effects:{resourceOutput:{ascension:0.08,energy:0.03}}}]},
    {id:"biological_emergence",stage:"galactic",name:"Biological Emergence",desc:"A lineage-wide metamorphosis that turns genecraft into a new form of life.",duration:145,cost:{science:260,food:220,medicine:160},requiresPath:"biological",requiresSystem:"bio_ascension_vats",effects:{resourceOutput:{food:0.08,happiness:0.05,ascension:0.08}},choices:[{id:"living_dawn",name:"Living Dawn",effects:{resourceOutput:{food:0.04,cohesion:0.03}}},{id:"adaptive_bloom",name:"Adaptive Bloom",effects:{resourceOutput:{terraforming:0.04,medicine:0.03}}}]},
    {id:"living_constitution",stage:"galactic",name:"Living Constitution",desc:"Write governance into inheritable flesh so the new superior species can survive its own redesign.",duration:140,cost:{science:230,food:180,culture:140,medicine:120},requiresPath:"biological",requiresCompletedProject:"biological_emergence",effects:{resourceOutput:{food:0.05,cohesion:0.04,ascension:0.05}},choices:[{id:"gene_clades",name:"Gene Clades",effects:{resourceOutput:{medicine:0.03,happiness:0.03}}},{id:"common_genome",name:"Common Genome",effects:{resourceOutput:{cohesion:0.05,food:0.02}}}]},
    {id:"synthetic_upload",stage:"galactic",name:"Synthetic Upload",desc:"Transfer continuity into a machine substrate and stabilize the first synthetic civilization-spanning self.",duration:145,cost:{science:240,data:260,energy:180},requiresPath:"synthetic",requiresSystem:"synthetic_mind",effects:{resourceOutput:{data:0.08,energy:0.05,ascension:0.08}},choices:[{id:"distributed_shells",name:"Distributed Shells",effects:{resourceOutput:{data:0.04,command:0.03}}},{id:"perfect_memory",name:"Perfect Memory",effects:{resourceOutput:{science:0.04,cohesion:0.03}}}]},
    {id:"substrate_referendum",stage:"galactic",name:"Substrate Referendum",desc:"Convince the remaining biological holdouts to accept machine continuity as legitimate personhood.",duration:138,cost:{data:240,energy:180,culture:120,influence:120},requiresPath:"synthetic",requiresCompletedProject:"synthetic_upload",effects:{resourceOutput:{data:0.05,cohesion:0.05,ascension:0.05}},choices:[{id:"plural_shells",name:"Plural Shells",effects:{resourceOutput:{cohesion:0.04,diplomacy:0.03}}},{id:"perfect_census",name:"Perfect Census",effects:{resourceOutput:{data:0.05,science:0.02}}}]},
    {id:"psionic_awakening",stage:"galactic",name:"Psionic Awakening",desc:"A final rite that opens a shared mental horizon across worlds and species.",duration:145,cost:{faith:220,culture:220,data:160},requiresPath:"psionic",requiresSystem:"psionic_chorus",effects:{resourceOutput:{faith:0.08,cohesion:0.05,ascension:0.08}},choices:[{id:"choral_mind",name:"Choral Mind",effects:{resourceOutput:{cohesion:0.04,unity:0.03}}},{id:"seer_network",name:"Seer Network",effects:{resourceOutput:{science:0.03,diplomacy:0.04}}}]},
    {id:"veil_communion",stage:"galactic",name:"Veil Communion",desc:"Cross the last threshold between thought and reality, then decide whether the awakened mind remains plural or dissolves into chorus.",duration:142,cost:{faith:240,culture:180,data:160,cohesion:120},requiresPath:"psionic",requiresCompletedProject:"psionic_awakening",effects:{resourceOutput:{faith:0.05,cohesion:0.05,ascension:0.05}},choices:[{id:"dream_synod",name:"Dream Synod",effects:{resourceOutput:{diplomacy:0.04,cohesion:0.03}}},{id:"inner_storm",name:"Inner Storm",effects:{resourceOutput:{science:0.03,unity:0.03}}}]},
    {id:"energetic_transfiguration",stage:"galactic",name:"Energetic Transfiguration",desc:"Condense the civilization into a luminous energy state that no longer depends on ordinary matter.",duration:150,cost:{energy:280,alloys:160,data:180},requiresPath:"energetic",requiresSystem:"energy_transfiguration_core",effects:{resourceOutput:{energy:0.08,ascension:0.1}},choices:[{id:"radiant_form",name:"Radiant Form",effects:{resourceOutput:{energy:0.04,happiness:0.03}}},{id:"stellar_pressure",name:"Stellar Pressure",effects:{resourceOutput:{alloys:0.03,command:0.03}}}]},
    {id:"containment_ritual",stage:"galactic",name:"Containment Ritual",desc:"Build a final political and physical frame for a civilization that intends to live as light without burning itself apart.",duration:148,cost:{energy:260,alloys:180,cohesion:130,data:140},requiresPath:"energetic",requiresCompletedProject:"energetic_transfiguration",effects:{resourceOutput:{energy:0.05,command:0.04,ascension:0.05}},choices:[{id:"quiet_flame",name:"Quiet Flame",effects:{resourceOutput:{happiness:0.03,cohesion:0.03}}},{id:"solar_choir",name:"Solar Choir",effects:{resourceOutput:{energy:0.04,alloys:0.02}}}]},
    {id:"dimensional_departure",stage:"galactic",name:"Dimensional Departure",desc:"Tear a controlled path out of ordinary reality and prepare the species for exodus beyond its native dimension.",duration:150,cost:{science:260,data:220,rare_matter:180},requiresPath:"dimensional",requiresSystem:"dimensional_lab",effects:{resourceOutput:{rare_matter:0.08,ascension:0.08,cohesion:0.04}},choices:[{id:"anchor_the_exit",name:"Anchor the Exit",effects:{resourceOutput:{cohesion:0.04,rare_matter:0.03}}},{id:"step_beyond",name:"Step Beyond",effects:{resourceOutput:{ascension:0.05,data:0.03}}}]},
    {id:"threshold_exodus",stage:"galactic",name:"Threshold Exodus",desc:"Decide who and what is carried through the dimensional break, and what must remain behind as the old universe closes.",duration:148,cost:{science:240,data:190,rare_matter:180,influence:130},requiresPath:"dimensional",requiresCompletedProject:"dimensional_departure",effects:{resourceOutput:{rare_matter:0.05,data:0.04,ascension:0.05}},choices:[{id:"memory_anchor",name:"Memory Anchor",effects:{resourceOutput:{cohesion:0.04,data:0.03}}},{id:"clean_departure",name:"Clean Departure",effects:{resourceOutput:{ascension:0.05,rare_matter:0.02}}}]},
    {id:"scar_recovery",stage:"galactic",name:"Scar Recovery Archive",desc:"Transforms one persistent threat scar into a positive inherited memory.",duration:120,cost:{data:180,cohesion:120,medicine:80},effects:{resourceOutput:{cohesion:0.03}},scarRecovery:true}
  ];

  DATA.FTL_METHODS = [
    {id:"warp_lensing",name:"Warp Lensing",desc:"A stable distortion corridor that favors cohesion and orderly expansion."},
    {id:"hyperlane_resonance",name:"Hyperlane Resonance",desc:"Tune transit corridors into a durable interstellar network that favors data and energy throughput."},
    {id:"wormhole_apertures",name:"Wormhole Apertures",desc:"Open hard jumps between distant points, trading elegance for reach and political shock."}
  ];

  DATA.ASCENSION_PATHS = [
    {id:"biological",name:"Biological Ascension",desc:"Evolve into a superior lifeform through genecraft, continuity, and living redesign.",effects:{resourceOutput:{food:0.08,medicine:0.08,happiness:0.04}}},
    {id:"synthetic",name:"Synthetic Ascension",desc:"Transfer continuity into machine substrates and perfect synthetic memory.",effects:{resourceOutput:{data:0.08,science:0.06,ascension:0.08}}},
    {id:"psionic",name:"Psionic Ascension",desc:"Awaken shared mental power and bind the civilization through consciousness itself.",effects:{resourceOutput:{faith:0.08,cohesion:0.08,unity:0.04}}},
    {id:"energetic",name:"Energetic Ascension",desc:"Transform civilization into a luminous energy state beyond ordinary biology.",effects:{resourceOutput:{energy:0.1,alloys:0.04,ascension:0.06}}},
    {id:"dimensional",name:"Dimensional Ascension",desc:"Leave the current dimension entirely through controlled reality fracture.",effects:{resourceOutput:{rare_matter:0.08,data:0.06,ascension:0.06}}}
  ];

  DATA.PATH_ENDING_TITLES = {
    biological:"Post-Biological",
    synthetic:"Synthetic",
    psionic:"Awakened",
    energetic:"Radiant",
    dimensional:"Transdimensional"
  };

  DATA.RIVAL_ASCENSION = {
    biological:{name:"Biological Bid",effects:{resourceOutput:{food:-0.02,medicine:-0.02}},trend:0.96},
    synthetic:{name:"Synthetic Bid",effects:{resourceOutput:{data:-0.02,science:-0.02}},trend:1.1},
    psionic:{name:"Psionic Bid",effects:{resourceOutput:{faith:-0.02,cohesion:-0.02}},trend:0.98},
    energetic:{name:"Energetic Bid",effects:{resourceOutput:{energy:-0.03,alloys:-0.02}},trend:1.16},
    dimensional:{name:"Dimensional Bid",effects:{resourceOutput:{rare_matter:-0.02,data:-0.02}},trend:1.06}
  };

  DATA.CONGRESS_BLOCS = {
    biological:{name:"Biogenesis Bloc",effects:{resourceOutput:{food:0.03,medicine:0.03,happiness:0.02}}},
    synthetic:{name:"Machine Concord",effects:{resourceOutput:{data:0.03,science:0.03}}},
    psionic:{name:"Chorus Bloc",effects:{resourceOutput:{faith:0.03,cohesion:0.03}}},
    energetic:{name:"Radiant Bloc",effects:{resourceOutput:{energy:0.03,alloys:0.03,happiness:-0.01}}},
    dimensional:{name:"Threshold Bloc",effects:{resourceOutput:{rare_matter:0.03,ascension:0.03}}}
  };

  DATA.CONGRESS_PROPOSALS = [
    {id:"chorus_channels",name:"Chorus Channels",bloc:"psionic",stageMin:"empire",desc:"Shared mind-lines soften rivalry through awareness and ritual trust.",effects:{resourceOutput:{faith:0.05,cohesion:0.03,diplomacy:0.02}}},
    {id:"machine_exchange",name:"Machine Exchange Charter",bloc:"synthetic",stageMin:"solar",desc:"Knowledge exchange accelerates data, science, and synthetic standardization.",effects:{resourceOutput:{science:0.05,data:0.05,diplomacy:0.02}}},
    {id:"radiant_containment",name:"Radiant Containment Bloc",bloc:"energetic",stageMin:"galactic",desc:"A hard-energy bloc slows rivals but strains biological comfort.",effects:{resourceOutput:{energy:0.05,alloys:0.04,happiness:-0.03}}},
    {id:"threshold_accord",name:"Threshold Accord",bloc:"dimensional",stageMin:"galactic",desc:"A final pact stabilizes the exit beyond ordinary reality.",effects:{resourceOutput:{ascension:0.04,cohesion:0.06,rare_matter:0.02}}},
    {id:"genesis_mandate",name:"Genesis Mandate",bloc:"biological",stageMin:"galactic",desc:"Galactic law protects living infrastructure, medicine, and adaptive biospheres.",effects:{resourceOutput:{food:0.04,medicine:0.04,happiness:0.02}}},
    {id:"open_archives",name:"Open Archives",bloc:"synthetic",stageMin:"empire",desc:"Shared records make science stronger but expose old contradictions.",effects:{resourceOutput:{science:0.04,culture:0.03,cohesion:-0.01}}}
  ];

  DATA.MAP_WONDERS = [
    {id:"river_colossus",name:"River Colossus",slotTags:["water"],cost:{production:120,stone:80,gold:60},effects:{resourceOutput:{gold:0.05,water:0.05,diplomacy:0.03}}},
    {id:"sacred_observatory",name:"Sacred Observatory",slotTags:["sacred","high"],cost:{science:140,faith:90,stone:70},effects:{resourceOutput:{science:0.05,faith:0.05,unity:0.03}}},
    {id:"orbital_beacon",name:"Orbital Beacon",slotTags:["orbit","high"],cost:{energy:180,alloys:140,data:80},effects:{resourceOutput:{colonies:0.05,command:0.05,cohesion:0.03}}},
    {id:"scar_memorial",name:"Scar Memorial",slotTags:["memory","sacred"],cost:{culture:140,cohesion:90,medicine:70},effects:{resourceOutput:{happiness:0.05,cohesion:0.04,unity:0.03}}}
  ];

  DATA.WONDER_SETS = [
    {id:"mythic_river_court",name:"Mythic River Court",requires:["river_colossus","sacred_observatory"],desc:"Trade, ritual, and recordkeeping become a shared civic myth.",effects:{resourceOutput:{gold:0.03,faith:0.03,culture:0.03}}},
    {id:"orbital_memory_lattice",name:"Orbital Memory Lattice",requires:["orbital_beacon","scar_memorial"],desc:"A beaconed memorial network stabilizes late ascension work.",effects:{resourceOutput:{cohesion:0.04,ascension:0.03,data:0.02}}},
    {id:"living_constellation",name:"Living Constellation",requires:["river_colossus","orbital_beacon"],desc:"The old river economy learns to think in orbital currents.",effects:{resourceOutput:{diplomacy:0.03,colonies:0.03,energy:0.02}}}
  ];

  DATA.LEGACY_TIERS = [
    {id:"standard",name:"Standard Universe",wins:0,epMult:1,desc:"Baseline pacing.",effects:{}},
    {id:"deep_time",name:"Deep Time",wins:3,epMult:1.25,desc:"Harder scoring, better EP.",effects:{resourceOutput:{happiness:-0.03},score:-30}},
    {id:"hostile_cosmos",name:"Hostile Cosmos",wins:6,epMult:1.55,desc:"Rivals and crises bite harder.",effects:{resourceOutput:{military_power:-0.03,cohesion:-0.03},score:-60}},
    {id:"thin_reality",name:"Thin Reality",wins:10,epMult:2,desc:"Late universes strain ascension itself.",effects:{resourceOutput:{ascension:-0.05,happiness:-0.04},score:-100}}
  ];

  DATA.RIVAL_DEFECTIONS = [
    {id:"fragment",name:"Encourage Fragmentation",desc:"Break a pressured rival into slower factions.",effects:{resourceOutput:{diplomacy:0.03,cohesion:-0.01}}},
    {id:"asylum",name:"Offer Asylum",desc:"Absorb defectors for culture and knowledge.",effects:{resourceOutput:{culture:0.04,science:0.03,happiness:0.02}}},
    {id:"forced_merger",name:"Force Merger",desc:"Fold their institutions into yours.",effects:{resourceOutput:{influence:0.05,military_power:0.03,happiness:-0.02}}}
  ];

  DATA.VASSAL_DEMANDS = [
    {id:"autonomy",name:"Grant Autonomy",desc:"Let a vassal govern itself for happier integration.",effects:{resourceOutput:{happiness:0.03,diplomacy:0.02,command:-0.01}}},
    {id:"tribute",name:"Demand Tribute",desc:"Extract resources at the cost of trust.",effects:{resourceOutput:{gold:0.03,influence:0.02,happiness:-0.015}}},
    {id:"migration",name:"Open Migration",desc:"Let populations blend across borders.",effects:{resourceOutput:{culture:0.025,food:0.02,cohesion:0.02}}},
    {id:"protectorate",name:"Declare Protectorate",desc:"Bind protection and military command together.",effects:{resourceOutput:{military_power:0.025,command:0.02,diplomacy:-0.01}}}
  ];

  DATA.VASSAL_PERSONALITIES = [
    {id:"loyal",name:"Loyal",effects:{resourceOutput:{cohesion:0.02,happiness:0.02}}},
    {id:"resentful",name:"Resentful",effects:{resourceOutput:{influence:0.02,happiness:-0.02}}},
    {id:"scholarly",name:"Scholarly",effects:{resourceOutput:{science:0.025,data:0.015}}},
    {id:"militarist",name:"Militarist",effects:{resourceOutput:{military_power:0.025,command:0.015}}},
    {id:"ecological",name:"Ecological",effects:{resourceOutput:{food:0.02,terraforming:0.02}}}
  ];

  DATA.RIVAL_COUNTER_PROJECTS = [
    {id:"rival_sabotage",name:"Shadow Sabotage",desc:"Covertly disrupt a rival's ascent.",duration:90,cost:{data:160,diplomacy:80,energy:80},effects:{resourceOutput:{data:0.02,diplomacy:-0.01}}},
    {id:"rival_detente",name:"Emergency Detente",desc:"Buy time through concessions and diplomacy.",duration:80,cost:{diplomacy:180,cohesion:120,culture:90},effects:{resourceOutput:{cohesion:0.03,diplomacy:0.03}}},
    {id:"rival_integration",name:"Forced Integration",desc:"Absorb a rival before their bid matures.",duration:120,cost:{command:160,military_power:180,data:120},effects:{resourceOutput:{influence:0.03,command:0.03}}}
  ];

  DATA.MUSEUM_REWARDS = [
    {id:"triple_path",name:"Curated Path Wing",count:3,effects:{allOutput:0.01}},
    {id:"master_path",name:"Masterwork Exhibit",count:5,effects:{allOutput:0.02,resourceOutput:{culture:0.03}}},
    {id:"living_museum",name:"Living Museum",count:8,effects:{allOutput:0.03,resourceOutput:{unity:0.03,ascension:0.02}}}
  ];

  DATA.RUN_MEDALS = [
    {id:"fast_evolution",name:"Fast Evolution",desc:"Finish a run stage quickly.",condition:"fast"},
    {id:"no_rival_victories",name:"No Rival Victories",desc:"Transcend without rival victory pressure.",condition:"no_rivals"},
    {id:"high_tension_win",name:"High Tension Win",desc:"Win despite severe ascension tension.",condition:"tension"},
    {id:"wonder_builder",name:"Wonder Builder",desc:"Finish with multiple map wonders.",condition:"wonders"},
    {id:"balanced_lineage",name:"Balanced Lineage",desc:"Finish with no major pressure alerts.",condition:"clean"}
  ];

  DATA.MASTERY_CHALLENGES = {
    cell:[
      {id:"cell_clean_metabolism",name:"Clean Metabolism",desc:"Clear Cell with no ATP drain alerts.",reward:2,condition:"no_atp_drain"},
      {id:"cell_fast_clade",name:"Fast Clade",desc:"Clear Cell in under 120s.",reward:2,condition:"fast120"}
    ],
    civilization:[
      {id:"civilization_calm_cities",name:"Calm Cities",desc:"Clear Civilization with no instability alert.",reward:3,condition:"no_instability"},
      {id:"civilization_wonder_state",name:"Wonder State",desc:"Clear Civilization with a map wonder built.",reward:3,condition:"wonders1"}
    ],
    solar:[
      {id:"solar_clean_orbit",name:"Clean Orbit",desc:"Clear Solar with no rival victory pressure.",reward:4,condition:"no_rivals"},
      {id:"solar_relay_surge",name:"Relay Surge",desc:"Clear Solar in under 220s.",reward:4,condition:"fast220"}
    ],
    galactic:[
      {id:"galactic_calm_transcendence",name:"Calm Transcendence",desc:"Win Galactic with no rival ending.",reward:5,condition:"no_rivals"},
      {id:"galactic_archivist",name:"Archivist Supreme",desc:"Win Galactic with 3 or more evolved artifacts or fusions.",reward:5,condition:"artifact_depth"}
    ]
  };

  DATA.CONGRESS_CRISES = [
    {id:"bloc_split",name:"Bloc Split",desc:"The congress fractures over enforcement and legitimacy.",effects:{resourceOutput:{cohesion:-0.02,diplomacy:-0.02}},choices:[
      {id:"mediate_split",name:"Mediate the Split",effects:{resourceOutput:{diplomacy:0.04,cohesion:0.02}}},
      {id:"enforce_split",name:"Enforce Discipline",effects:{resourceOutput:{command:0.04,military_power:0.03,happiness:-0.02}}}
    ]},
    {id:"sanction_crisis",name:"Sanction Crisis",desc:"Rivals pressure congress to sanction your expansion.",effects:{resourceOutput:{gold:-0.02,influence:-0.02}},choices:[
      {id:"buy_off",name:"Buy Off Delegates",effects:{resourceOutput:{gold:-0.01,diplomacy:0.04}}},
      {id:"defy",name:"Defy the Sanctions",effects:{resourceOutput:{command:0.03,military_power:0.03,diplomacy:-0.03}}}
    ]}
  ];

  DATA.INSTITUTION_CRISES = [
    {id:"institution_overreach",name:"Institutional Overreach",desc:"Your matured congress institutions now resist rapid strategic pivots.",effects:{resourceOutput:{cohesion:-0.02,happiness:-0.02}},choices:[
      {id:"decentralize",name:"Decentralize Offices",effects:{resourceOutput:{diplomacy:0.03,happiness:0.02,command:-0.01}}},
      {id:"central_audit",name:"Central Audit",effects:{resourceOutput:{command:0.03,data:0.02,happiness:-0.01}}}
    ]},
    {id:"institution_dogma",name:"Institutional Dogma",desc:"Doctrine, law, and congress precedent are starting to grind against each other.",effects:{resourceOutput:{science:-0.02,unity:-0.02}},choices:[
      {id:"open_revision",name:"Open Revision",effects:{resourceOutput:{science:0.03,data:0.02,diplomacy:0.02}}},
      {id:"canonize",name:"Canonize Precedent",effects:{resourceOutput:{unity:0.03,cohesion:0.02,happiness:-0.01}}}
    ]}
  ];

  DATA.ARTIFACT_RESTORATION_BRANCHES = [
    {id:"faithful_restore",name:"Faithful Restoration",desc:"Repair the relic as it was remembered, stabilizing inherited continuity.",effects:{resourceOutput:{unity:0.02,cohesion:0.02}}},
    {id:"adaptive_restore",name:"Adaptive Restoration",desc:"Rebuild the relic with modern understanding, trading purity for stronger insight.",effects:{resourceOutput:{science:0.02,data:0.02}}}
  ];

  DATA.INSTITUTION_TRAITS = {
    biological:{name:"Stewardship",desc:"Living-system institutions protect growth and morale.",effects:{resourceOutput:{food:0.02,happiness:0.02,medicine:0.02}}},
    synthetic:{name:"Scholastic",desc:"Machine institutions favor study, records, and durable logic.",effects:{resourceOutput:{science:0.02,data:0.02}}},
    psionic:{name:"Conciliatory",desc:"Shared-conscious institutions prefer cohesion and diplomatic stability.",effects:{resourceOutput:{faith:0.02,cohesion:0.02}}},
    energetic:{name:"Radiant",desc:"High-energy institutions reward conversion, pressure, and directed output.",effects:{resourceOutput:{energy:0.02,alloys:0.02}}},
    dimensional:{name:"Threshold",desc:"Exit-facing institutions favor rare matter, caution, and ascent.",effects:{resourceOutput:{rare_matter:0.02,ascension:0.02}}}
  };

  DATA.DOSSIER_OPERATIONS = [
    {id:"dossier_exploit",name:"Exploit Known Weakness",desc:"Use long-run dossier knowledge to interfere with a rival's preferred pattern.",duration:95,cost:{data:140,science:90,diplomacy:70},effects:{resourceOutput:{data:0.02,science:0.02}}},
    {id:"dossier_discredit",name:"Discredit Their Myth",desc:"Target the narrative a rival usually wins with.",duration:85,cost:{culture:110,influence:90,data:80},effects:{resourceOutput:{culture:0.02,influence:0.02}}}
  ];

  DATA.COSMETIC_THEMES = [
    {id:"humanoid_banner",archetype:"humanoid",wins:2,name:"Civic Banner",desc:"A clean civic shop header for repeat Humanoid victories."},
    {id:"mammalian_banner",archetype:"mammalian",wins:2,name:"Hearth Banner",desc:"A warmer shop header for repeat Mammalian victories."},
    {id:"reptilian_banner",archetype:"reptilian",wins:2,name:"War Standard",desc:"A severe command header for repeat Reptilian victories."},
    {id:"avian_banner",archetype:"avian",wins:2,name:"Sky Chorus Banner",desc:"A light highland header for repeat Avian victories."},
    {id:"necroid_banner",archetype:"necroid",wins:2,name:"Ancestor Banner",desc:"A memory-dark header for repeat Necroid victories."},
    {id:"fantasy_realm",wins:5,requiresUpgrade:"fantasy_pack",name:"Mythic Chronicle",desc:"A full fantasy naming layer that reimagines lineages, paths, and key structures."}
  ];

  DATA.COSMETIC_NAMESETS = {
    fantasy_realm:{
      archetypes:{
        humanoid:"Humans",
        mammalian:"Beastfolk",
        reptilian:"Orcs",
        avian:"Fae",
        arthropoid:"Goblinkin",
        molluscoid:"Drow",
        fungoid:"Druids",
        plantoid:"Elves",
        aquatic:"Sea Folk",
        lithoid:"Dwarves",
        necroid:"Undead",
        toxoid:"Demons",
        extremophile:"Giants"
      },
      stages:{
        cell:"Spark Stage",
        creature:"Beast Stage",
        tribal:"Clan Stage",
        civilization:"Kingdom Stage",
        empire:"Empire Stage",
        solar:"Skyrealm Stage",
        galactic:"Mythic Stage"
      },
      systems:{
        village_center:"Clan Hearth",
        city_center:"Stonekeep",
        provincial_admin:"Crown Chancery",
        planetary_colony:"Skyhold Colony",
        sector_network:"High Council Constellation",
        ascension_protocol:"Apotheosis Rite",
        quantum_archive:"Hall of Tomes",
        gateway_spine:"Worldgate Spine",
        shipyard_ring:"Dragonforge Ring",
        solar_array:"Sunspire Array",
        dyson_swarm:"Sun-Cage Swarm"
      },
      technologies:{
        code_of_laws:"King's Charter",
        fusion_drives:"Star-Sails",
        orbital_construction:"Skyforge Masonry",
        ascension_protocols:"Apotheosis Canon",
        wormhole_corridors:"Worldgate Corridors",
        writing:"Rune Script",
        telegraph_network:"Beacon Cables"
      },
      paths:{
        biological:"Wildgrowth",
        synthetic:"Machine Apotheosis",
        psionic:"Chorus of Stars",
        energetic:"Radiant Exodus",
        dimensional:"Worldgate Departure"
      },
      victories:{
        humanoid:"Crown of Ages",
        mammalian:"Hearth of Constellations",
        reptilian:"Warlord Ascendancy",
        avian:"Song of the Upper Winds",
        arthropoid:"Endless Broodforge",
        molluscoid:"Velvet Deep Compact",
        fungoid:"Rootsong Communion",
        plantoid:"Emerald Worldtree",
        aquatic:"Tideborne Expanse",
        lithoid:"Mountain Memory Eternal",
        necroid:"Court of the Deathless",
        toxoid:"Infernal Alchemy",
        extremophile:"Throne of the Furnace Void"
      }
    }
  };

  DATA.STAGE_MASTERY_LAYOUTS = {
    cell:[
      {id:"standard",name:"Standard Flow",wins:0,desc:"Default cellular topology."},
      {id:"metabolic_lattice",name:"Metabolic Lattice",wins:3,desc:"Adds a high-throughput metabolic chamber.",slot:{id:"layout_cell_metabolic_lattice",name:"Metabolic Lattice",type:"Mastery slot",effects:{resourceOutput:{atp:0.06,glucose:0.03,proteins:0.02}}}},
      {id:"signal_web",name:"Signal Web",wins:6,desc:"Adds a signaling web for sharper specialization.",slot:{id:"layout_cell_signal_web",name:"Signal Web",type:"Mastery slot",effects:{resourceOutput:{elements:0.04,proteins:0.03},manualBonus:0.04}}}
    ],
    creature:[
      {id:"standard",name:"Standard Range",wins:0,desc:"Default creature habitats."},
      {id:"nursery_basin",name:"Nursery Basin",wins:3,desc:"A safer growth basin for early adaptation.",slot:{id:"layout_creature_nursery_basin",name:"Nursery Basin",type:"Mastery slot",effects:{populationGrowth:0.004,resourceOutput:{food:0.03,water:0.03}}}}
    ],
    civilization:[
      {id:"standard",name:"Standard Civic Grid",wins:0,desc:"Default urban layout."},
      {id:"processional_ring",name:"Processional Ring",wins:4,desc:"A civic ring connecting ritual, markets, and rule.",slot:{id:"layout_civilization_processional_ring",name:"Processional Ring",type:"Mastery slot",effects:{resourceOutput:{culture:0.04,gold:0.03,influence:0.03}}}}
    ],
    solar:[
      {id:"standard",name:"Standard Orbital Spread",wins:0,desc:"Default system map."},
      {id:"relay_arc",name:"Relay Arc",wins:5,desc:"A launch architecture built for cleaner expansion.",slot:{id:"layout_solar_relay_arc",name:"Relay Arc",type:"Mastery slot",effects:{resourceOutput:{energy:0.04,colonies:0.03,data:0.03}}}}
    ],
    galactic:[
      {id:"standard",name:"Standard Lattice",wins:0,desc:"Default galactic span."},
      {id:"memory_spine",name:"Memory Spine",wins:6,desc:"A late-game backbone for archives and cohesion.",slot:{id:"layout_galactic_memory_spine",name:"Memory Spine",type:"Mastery slot",effects:{resourceOutput:{data:0.04,unity:0.03,cohesion:0.03}}}}
    ]
  };

  DATA.ASCENSION_OBJECTIVES = {
    biological:[
      {id:"biological_genetics",name:"Genetic Engineering",tech:"genetic_engineering",reward:3},
      {id:"biological_immortality",name:"Bio-Immortality",tech:"bio_immortality",reward:3},
      {id:"biological_event",name:"Biological Emergence",project:"biological_emergence",reward:4}
    ],
    synthetic:[
      {id:"synthetic_integration",name:"AI Integration",tech:"ai_integration",reward:3},
      {id:"synthetic_upload",name:"Mind Upload",tech:"mind_upload",reward:3},
      {id:"synthetic_event",name:"Synthetic Upload",project:"synthetic_upload",reward:4}
    ],
    psionic:[
      {id:"psionic_potential",name:"Psi-Potential",tech:"psi_potential",reward:3},
      {id:"psionic_telepathy",name:"Telepathy",tech:"telepathy",reward:3},
      {id:"psionic_event",name:"Psionic Awakening",project:"psionic_awakening",reward:4}
    ],
    energetic:[
      {id:"energetic_manipulation",name:"Energy Manipulation",tech:"energy_manipulation",reward:3},
      {id:"energetic_conversion",name:"Matter Conversion",tech:"matter_conversion",reward:3},
      {id:"energetic_event",name:"Energetic Transfiguration",project:"energetic_transfiguration",reward:4}
    ],
    dimensional:[
      {id:"dimensional_mastery",name:"Dimensional Mastery",tech:"dimensional_mastery",reward:3},
      {id:"dimensional_creation",name:"Reality Creation",tech:"reality_creation",reward:3},
      {id:"dimensional_event",name:"Dimensional Departure",project:"dimensional_departure",reward:4}
    ]
  };

  DATA.VICTORY_VARIANTS = {
    humanoid:"Sapient Concordance",
    mammalian:"Sheltered Constellation",
    reptilian:"Dominion of Scales",
    avian:"Migratory Star Chorus",
    arthropoid:"Infinite Broodworks",
    molluscoid:"Mercantile Tide",
    fungoid:"Mycelial Communion",
    plantoid:"Living Hypergarden",
    aquatic:"Pelagic Expanse",
    lithoid:"Enduring Stone Memory",
    necroid:"Archive of the Deathless",
    toxoid:"Alchemical Singularity",
    extremophile:"Thermal Void Adaptation"
  };

  function action(id,name,gain,unlock){
    return {id:id,name:name,gain:gain,unlock:unlock||[]};
  }
  function system(id,name,category,description,cost,prereq,traits,archetype,capacity,effects){
    return {id:id,name:name,category:category,description:description,cost:cost,prereq:prereq||[],traits:traits||[],archetype:archetype,capacity:capacity||{},effects:effects||{}};
  }
  function tech(id,name,path,cost,prereq,effects){
    return {id:id,name:name,path:path,cost:cost,prereq:prereq||[],effects:effects||{}};
  }

  DATA.STAGES = [
    {
      id:"cell",
      name:"Cell Stage",
      description:"ATP-first survival. Build organelles, unlock molecule gathering, and stabilize metabolism.",
      dominantArchetype:"plantoid",
      resources:["atp","glucose","proteins","lipids","elements"],
      scoreTarget:720,
      carryPopulation:false,
      carryResources:["glucose","proteins","lipids","elements"],
      techPaths:[],
      actions:[
        action("gather_atp","Pulse Membrane",{atp:0.72}),
        action("gather_glucose","Absorb Glucose",{glucose:0.78,atp:0.1},["membrane_pump"]),
        action("gather_proteins","Scavenge Proteins",{proteins:0.64},["ribosome"]),
        action("gather_lipids","Collect Lipids",{lipids:0.56},["vacuole"]),
        action("gather_elements","Extract Elements",{elements:0.45},["golgi_apparatus"])
      ],
      systems:[
        system("membrane_pump","Membrane Pump","Starter organelles","Basic intake and ATP stabilization.",{atp:10},[],["Nutrient uptake"],"aquatic",{atp:25},{perSecond:{glucose:0.05}}),
        system("ribosome","Ribosome","Starter organelles","Unlocks protein assembly.",{atp:12},["membrane_pump"],["Protein assembly"],"fungoid",{proteins:25},{perSecond:{proteins:0.08}}),
        system("vacuole","Vacuole","Starter organelles","Storage and internal balance.",{atp:12},["membrane_pump"],["Cell storage"],"molluscoid",{glucose:10,lipids:25,elements:5},{}),
        system("mitochondria","Mitochondria","Energy organelles","Converts glucose into ATP.",{atp:20,glucose:12},["membrane_pump"],["Efficient metabolism"],"mammalian",{atp:45},{perSecond:{atp:0.34},consume:{glucose:0.08}}),
        system("smooth_er","Smooth ER","Assembly organelles","Improves lipid processing and membranes.",{atp:16,lipids:7,proteins:4},["ribosome","vacuole"],["Membrane refinement"],"reptilian",{lipids:20},{perSecond:{lipids:0.14}}),
        system("golgi_apparatus","Golgi Apparatus","Assembly organelles","Unlocks elemental processing and internal logistics.",{atp:22,proteins:8,lipids:8},["ribosome","vacuole"],["Cell logistics"],"humanoid",{elements:25},{perSecond:{elements:0.08}}),
        system("nucleus","Nucleus","Core organelles","Central control for advanced specialization.",{atp:36,glucose:14,proteins:14,lipids:12,elements:10},["mitochondria","golgi_apparatus"],["Centralized cell"],"humanoid",{atp:50,glucose:30,proteins:30,lipids:30,elements:30},{}),
        system("cell_wall","Cell Wall","Advanced organelles","Hard outer structure and survivability.",{atp:22,glucose:12,proteins:8,lipids:8,elements:10},["nucleus"],["Fortified lineage"],"lithoid",{elements:35},{upkeepBonus:-0.02}),
        system("chloroplast","Chloroplast","Advanced organelles","Uses light to generate ATP and glucose.",{atp:24,glucose:8,proteins:8,lipids:8,elements:8},["nucleus","cell_wall"],["Photosynthetic lineage"],"plantoid",{atp:65,glucose:35},{perSecond:{atp:0.34,glucose:0.14}}),
        system("flagellum","Flagellum","Advanced organelles","Mobility-focused cell structure for more active feeding.",{atp:20,glucose:8,proteins:9,lipids:6,elements:6},["nucleus"],["Mobility lineage"],"avian",{atp:20},{manualBonus:0.15,populationGrowth:0.01}),
        system("chemoreceptors","Chemoreceptors","Advanced organelles","Higher sensitivity and future knowledge bonuses.",{atp:20,glucose:8,proteins:10,lipids:6,elements:8},["nucleus"],["Keen senses"],"toxoid",{glucose:25,proteins:25},{perSecond:{glucose:0.08}}),
        system("lysosome","Lysosome","Advanced organelles","Breaks down captured material into reusable molecules.",{atp:22,proteins:12,lipids:8,elements:6},["nucleus"],["Digestive recycling"],"fungoid",{proteins:20,glucose:20},{perSecond:{proteins:0.16,glucose:0.1},consume:{atp:0.04}}),
        system("peroxisome","Peroxisome","Advanced organelles","Detoxification and lipid metabolism for hostile environments.",{atp:24,proteins:10,lipids:12,elements:9},["nucleus"],["Toxin resilience"],"toxoid",{lipids:25,elements:20},{perSecond:{lipids:0.12,elements:0.08},consume:{atp:0.03}}),
        system("endosome","Endosome","Assembly organelles","Internal sorting vesicles that improve resource routing.",{atp:18,proteins:8,lipids:10},["smooth_er"],["Internal sorting"],"molluscoid",{glucose:15,proteins:15,lipids:15},{perSecond:{glucose:0.08,proteins:0.08,lipids:0.08}}),
        system("autophagosome","Autophagosome","Advanced organelles","Self-recycling structure that stabilizes survival during shortages.",{atp:26,proteins:12,lipids:12,elements:10},["lysosome"],["Autophagy"],"necroid",{atp:25,proteins:20},{perSecond:{atp:0.18,proteins:0.08},consume:{lipids:0.05}}),
        system("hydrogenosome","Hydrogenosome","Energy organelles","Anaerobic ATP engine for dark, low-oxygen lineages.",{atp:24,glucose:12,proteins:10,elements:10},["mitochondria"],["Anaerobic metabolism"],"extremophile",{atp:55},{perSecond:{atp:0.42},consume:{glucose:0.06}}),
        system("glyoxysome","Glyoxysome","Energy organelles","Converts stored lipids into usable glucose.",{atp:22,lipids:14,proteins:8,elements:7},["smooth_er"],["Lipid conversion"],"plantoid",{glucose:30},{perSecond:{glucose:0.16},consume:{lipids:0.08}}),
        system("magnetosome","Magnetosome","Advanced organelles","Magnetic orientation organelle that improves future migration instincts.",{atp:28,elements:18,proteins:10},["chemoreceptors"],["Magnetotaxis"],"avian",{elements:25},{manualBonus:0.05}),
        system("contractile_vacuole","Contractile Vacuole","Advanced organelles","Osmoregulation for aquatic and pressure-heavy environments.",{atp:22,lipids:10,elements:10},["vacuole","nucleus"],["Osmoregulation"],"aquatic",{atp:20,glucose:20},{perSecond:{atp:0.12},upkeepBonus:-0.01}),
        system("proteasome","Proteasome","Assembly organelles","Protein cleanup and recycling machinery.",{atp:20,proteins:14,elements:6},["ribosome"],["Protein recycling"],"fungoid",{proteins:25},{perSecond:{proteins:0.18},consume:{atp:0.03}}),
        system("trichocyst","Trichocyst","Advanced organelles","Defensive extrusion organelle that hints toward later combat traits.",{atp:26,proteins:12,lipids:10,elements:12},["nucleus"],["Defensive extrusion"],"reptilian",{elements:20},{consume:{atp:0.02}}),
        system("vault_organelle","Vault","Core organelles","Large storage particle for advanced molecular logistics.",{atp:30,proteins:18,lipids:12,elements:12},["nucleus","golgi_apparatus"],["Molecular vaults"],"humanoid",{atp:35,glucose:30,proteins:30,lipids:30,elements:30},{})
      ],
      technologies:[]
    },
    {
      id:"creature",
      name:"Creature Stage",
      description:"Food, water, nesting, and thinking turn a cell lineage into a species.",
      dominantArchetype:"mammalian",
      resources:["food","water","materials","organic_matter","knowledge","culture"],
      scoreTarget:1500,
      carryPopulation:true,
      carryResources:["food","water","materials","knowledge","culture"],
      techPaths:[{id:"survival",name:"Survival"},{id:"growth",name:"Growth"},{id:"thinking",name:"Thinking"}],
      actions:[
        action("forage_food","Forage Food",{food:1.35,organic_matter:0.15}),
        action("drink_water","Find Water",{water:1.3}),
        action("gather_materials","Gather Materials",{materials:0.95,organic_matter:0.22}),
        action("observe","Observe Patterns",{knowledge:0.55},["thinking_cluster"])
      ],
      systems:[
        system("nest","Nest","Survival structures","Raises carrying capacity and shelters population.",{food:16,materials:10},[],["Protected young"],"mammalian",{food:30,water:20,materials:15},{populationGrowth:0.015}),
        system("foraging_pack","Foraging Pack","Survival structures","Organized gathering for food and organic matter.",{food:14,water:8},["nest"],["Cooperative foraging"],"aquatic",{food:25},{perSecond:{food:0.24,organic_matter:0.06}}),
        system("watering_path","Watering Path","Survival structures","Reliable access to water sources.",{materials:12,organic_matter:6},["nest"],["Habitat memory"],"reptilian",{water:35},{perSecond:{water:0.22}}),
        system("tool_use","Simple Tool Use","Development","Turns gathered material into early advantage.",{materials:18,organic_matter:10},["foraging_pack"],["Proto-crafting"],"humanoid",{materials:25},{perSecond:{materials:0.1,knowledge:0.04}}),
        system("thinking_cluster","Thinking","Development","Unlocks knowledge and culture generation.",{food:20,water:14,materials:14},["tool_use","watering_path"],["Social learning"],"humanoid",{knowledge:30,culture:20},{perSecond:{knowledge:0.12,culture:0.05}}),
        system("den_network","Den Network","Growth","Supports a larger population.",{food:28,water:18,materials:22},["thinking_cluster"],["Stable territory"],"mammalian",{food:40,water:40,materials:25},{populationGrowth:0.015})
      ],
      technologies:[
        tech("efficient_foraging","Efficient Foraging","survival",{knowledge:16,food:10},[],{perSecond:{food:0.12}}),
        tech("nesting_instinct","Nesting Instinct","growth",{knowledge:18,materials:10},["efficient_foraging"],{capacity:{food:20,water:20},populationGrowth:0.01}),
        tech("symbolic_calls","Symbolic Calls","thinking",{knowledge:24,culture:8},["thinking_cluster"],{perSecond:{culture:0.1}})
      ]
    },
    {
      id:"tribal",
      name:"Tribal Stage",
      description:"Villages, buildings, science, culture, happiness, units, and resource categories begin here.",
      dominantArchetype:"humanoid",
      resources:["food","water","wood","lumber","stone","clay","science","culture","happiness","military_power","strategic_total","luxury_total"],
      scoreTarget:3200,
      carryPopulation:true,
      carryResources:["food","water","lumber","culture","science","happiness","strategic_total","luxury_total"],
      techPaths:[{id:"crafting",name:"Tools and Crafting"},{id:"warfare",name:"Hunting and Warfare"},{id:"agriculture",name:"Agriculture and Food"},{id:"construction",name:"Shelter and Construction"},{id:"spirituality",name:"Culture and Spirituality"}],
      actions:[
        action("gather_food","Organize Forage",{food:2}),
        action("draw_water","Draw Water",{water:1.8}),
        action("cut_wood","Cut Wood",{wood:1.5}),
        action("quarry_stone","Gather Stone",{stone:1.2}),
        action("dig_clay","Dig Clay",{clay:1.1})
      ],
      systems:[
        system("village_center","Village Center","Village core","The first persistent social and storage hub.",{food:24,wood:18,stone:10},[],["Village memory"],"humanoid",{food:45,water:35,wood:35,lumber:25,stone:25,clay:25},{perSecond:{culture:0.12},populationGrowth:0.01}),
        system("granary","Granary","Buildings","Stores food and softens population pressure.",{wood:20,clay:12},["village_center"],["Stored harvest"],"mammalian",{food:60},{perSecond:{food:0.22}}),
        system("well","Well","Buildings","Improves water stability.",{stone:18,clay:10},["village_center"],["Clean water"],"aquatic",{water:55},{perSecond:{water:0.24}}),
        system("sawmill","Sawmill","Buildings","Turns raw wood into construction lumber over time.",{wood:32,stone:12},["village_center"],["Timber processing"],"humanoid",{lumber:60},{perSecond:{lumber:0.35},consume:{wood:0.18}}),
        system("workshop","Workshop","Buildings","Converts materials into science and military preparation.",{wood:24,stone:18},["village_center"],["Craft tradition"],"arthropoid",{science:35,military_power:25},{perSecond:{science:0.18,military_power:0.08}}),
        system("shrine","Shrine","Buildings","Creates culture and buffers happiness.",{stone:18,clay:16,culture:8},["village_center"],["Shared ritual"],"fungoid",{culture:40,happiness:30},{perSecond:{culture:0.16,happiness:0.04}}),
        system("watch_band","Watch Band","Units","The first persistent military organization.",{food:18,wood:16,stone:10},["workshop"],["Organized defense"],"reptilian",{military_power:45},{perSecond:{military_power:0.22}})
      ],
      technologies:[
        tech("stone_tools","Stone Tools","crafting",{science:18,wood:8,stone:8},[],{perSecond:{wood:0.08,stone:0.08}}),
        tech("campfire","Campfire","spirituality",{science:20,food:12},[],{perSecond:{culture:0.1,happiness:0.03}}),
        tech("planting","Planting","agriculture",{science:22,food:14,water:8},["stone_tools"],{perSecond:{food:0.18},capacity:{food:20}}),
        tech("palisades","Palisades","warfare",{science:26,wood:20},["watch_band"],{perSecond:{military_power:0.14}}),
        tech("adobe","Adobe","construction",{science:24,clay:16},["campfire"],{capacity:{wood:20,stone:20,clay:30}})
      ]
    },
    {
      id:"civilization",
      name:"Civilization Stage",
      description:"Cities, production, gold, formal research, culture, government, and larger armies.",
      dominantArchetype:"humanoid",
      resources:["food","water","production","gold","science","culture","happiness","military_power","strategic_total","luxury_total"],
      scoreTarget:3400,
      carryPopulation:true,
      carryResources:["food","water","science","culture","happiness","military_power","strategic_total","luxury_total"],
      techPaths:[{id:"agriculture",name:"Agriculture"},{id:"industry",name:"Industry"},{id:"science",name:"Science"},{id:"military",name:"Military"},{id:"economics",name:"Economics"},{id:"culture",name:"Culture"},{id:"government",name:"Government"}],
      actions:[action("direct_labor","Direct Labor",{production:2.4}),action("tax_market","Tax Market",{gold:1.7}),action("public_games","Public Games",{culture:1.1,happiness:0.3})],
      systems:[
        system("city_center","City Center","Cities","Transforms villages into city-scale storage and production.",{food:40,production:30,culture:18},[],["Urban identity"],"humanoid",{food:80,production:70,gold:50,science:60,culture:60},{perSecond:{production:0.4,gold:0.18},populationGrowth:0.015}),
        system("farms","Farms","Infrastructure","Food surplus for city growth.",{production:35,water:20},["city_center"],["Managed agriculture"],"mammalian",{food:80},{perSecond:{food:0.55}}),
        system("market","Market","Infrastructure","Gold and luxury exchange.",{production:42,culture:12},["city_center"],["Commercial habits"],"molluscoid",{gold:70,luxury_total:20},{perSecond:{gold:0.36,luxury_total:0.03,happiness:0.02}}),
        system("library","Library","Institutions","Building-driven science becomes central.",{production:45,gold:18},["city_center"],["Written knowledge"],"humanoid",{science:80},{perSecond:{science:0.42,culture:0.08}}),
        system("barracks","Barracks","Military","Persistent unit training and military power.",{production:50,gold:20},["city_center"],["Standing forces"],"reptilian",{military_power:80},{perSecond:{military_power:0.45}})
      ],
      technologies:[
        tech("irrigation","Irrigation","agriculture",{science:45,production:20},[],{perSecond:{food:0.25,water:0.08}}),
        tech("writing","Writing","science",{science:50,culture:20},[],{perSecond:{science:0.22,culture:0.08}}),
        tech("currency","Currency","economics",{science:52,gold:24},["market"],{perSecond:{gold:0.24}}),
        tech("code_of_laws","Code of Laws","government",{science:60,culture:24},["writing"],{perSecond:{happiness:0.04,influence:0.05}})
      ]
    },
    {
      id:"empire",
      name:"Empire Stage",
      description:"Regions, administration, logistics, policy, industry, and territorial scaling.",
      dominantArchetype:"humanoid",
      resources:["food","production","gold","science","culture","influence","happiness","military_power","strategic_total","luxury_total"],
      scoreTarget:7000,
      carryPopulation:true,
      carryResources:["food","production","gold","science","culture","influence","happiness","military_power","strategic_total","luxury_total"],
      techPaths:[{id:"industry",name:"Industrial Technology"},{id:"military",name:"Military Technology"},{id:"science",name:"Scientific Research"},{id:"transport",name:"Transportation"},{id:"communications",name:"Communications"},{id:"medicine",name:"Medicine"},{id:"energy",name:"Energy"},{id:"naval",name:"Naval Technology"},{id:"aerospace",name:"Aerospace"}],
      actions:[action("issue_edict","Issue Edict",{influence:2.2}),action("survey_region","Survey Region",{science:1.5,production:1.2}),action("sell_bonds","Sell Bonds",{gold:2.6})],
      systems:[
        system("provincial_admin","Provincial Administration","Administration","Regions become the main management container.",{production:80,gold:60,culture:35},[],["Administrative memory"],"humanoid",{influence:90,gold:90,production:90},{perSecond:{influence:0.32,gold:0.28}}),
        system("factory_district","Factory District","Industry","Large production and strategic throughput.",{production:110,gold:55},["provincial_admin"],["Industrial labor"],"arthropoid",{production:130,strategic_total:40},{perSecond:{production:0.85,strategic_total:0.05,happiness:-0.02}}),
        system("rail_hub","Rail Hub","Logistics","Internal movement and automatic balancing begin to matter.",{production:92,gold:64},["factory_district"],["Regional logistics"],"molluscoid",{production:70,food:60,logistics:70},{perSecond:{production:0.34,food:0.2,logistics:0.18}}),
        system("university_network","University Network","Institutions","Research scales beyond individual cities.",{production:95,gold:70,science:40},["provincial_admin"],["Formal academia"],"humanoid",{science:120},{perSecond:{science:0.75,culture:0.12}}),
        system("general_staff","General Staff","Military","Large-scale doctrine and command.",{production:108,gold:76,military_power:34},["provincial_admin"],["Operational command"],"reptilian",{military_power:130,command:80},{perSecond:{military_power:0.82,influence:0.1,command:0.12}})
      ],
      technologies:[
        tech("mass_production","Mass Production","industry",{science:95,production:60},[],{perSecond:{production:0.35}}),
        tech("telegraph_network","Telegraph Network","communications",{science:82,gold:40},[],{perSecond:{influence:0.2,science:0.12,logistics:0.06}}),
        tech("combustion","Combustion","energy",{science:110,strategic_total:20},["mass_production"],{perSecond:{production:0.25,strategic_total:0.06}})
      ]
    },
    {
      id:"solar",
      name:"Solar Stage",
      description:"A colonized planet expands into orbital industry, habitats, and home-system colonization.",
      dominantArchetype:"humanoid",
      resources:["food","water","production","energy","alloys","science","culture","influence","happiness","strategic_total","luxury_total"],
      scoreTarget:9800,
      carryPopulation:true,
      carryResources:["food","water","production","energy","alloys","science","culture","influence","happiness","strategic_total","luxury_total"],
      techPaths:[{id:"propulsion",name:"Propulsion"},{id:"life_support",name:"Life Support"},{id:"orbital",name:"Orbital Construction"},{id:"colonization",name:"Colonization"},{id:"mining",name:"Mining"},{id:"energy",name:"Energy Generation"},{id:"communications",name:"Communications"},{id:"military",name:"Military"},{id:"computing",name:"Computing and AI"},{id:"biology",name:"Biology and Medicine"},{id:"materials",name:"Materials Science"},{id:"terraforming",name:"Terraforming"},{id:"astrophysics",name:"Astrophysics"},{id:"navigation",name:"Navigation"},{id:"automation",name:"Automation"},{id:"trade",name:"Economics and Trade"}],
      actions:[action("launch_probe","Launch Probe",{science:2.4}),action("route_cargo","Route Cargo",{production:1.8,energy:1.2}),action("fund_colony","Fund Colony",{influence:1.6,alloys:0.8})],
      systems:[
        system("planetary_colony","Planetary Colony","Colonies","The first planet-scale colony core.",{production:142,energy:72,influence:44},[],["Colonial administration"],"humanoid",{food:110,water:110,energy:130,alloys:90},{perSecond:{food:0.74,water:0.46,influence:0.24},populationGrowth:0.01}),
        system("orbital_habitat","Orbital Habitat","Colonies","Expands population cap beyond the planet surface.",{production:170,alloys:80,energy:70},["planetary_colony"],["Orbital living"],"molluscoid",{food:90,water:90,happiness:50},{perSecond:{food:0.22,water:0.16,happiness:0.08},populationGrowth:0.012}),
        system("solar_array","Solar Array","Infrastructure","Energy becomes a major resource.",{production:130,alloys:58,science:54},["planetary_colony"],["Solar industry"],"plantoid",{energy:190},{perSecond:{energy:1.24}}),
        system("asteroid_mines","Asteroid Mines","Infrastructure","Alloys and strategic resources from small bodies.",{production:150,energy:80},["solar_array"],["Asteroid extraction"],"lithoid",{alloys:140,strategic_total:80},{perSecond:{alloys:0.82,strategic_total:0.1}}),
        system("shipyard_ring","Shipyard Ring","Military","Space units and orbital logistics.",{production:162,alloys:86,energy:88},["asteroid_mines"],["Orbital shipbuilding"],"arthropoid",{military_power:150,command:90},{perSecond:{military_power:0.92,alloys:0.14,command:0.16}})
      ],
      technologies:[
        tech("fusion_drives","Fusion Drives","propulsion",{science:180,energy:90},[],{perSecond:{energy:0.18,influence:0.08}}),
        tech("closed_loop_life_support","Closed Loop Life Support","life_support",{science:165,water:50},[],{perSecond:{food:0.38,water:0.3,happiness:0.04},capacity:{food:60,water:60}}),
        tech("orbital_construction","Orbital Construction","orbital",{science:190,alloys:70},["fusion_drives"],{perSecond:{production:0.24,alloys:0.1}})
      ]
    },
    {
      id:"galactic",
      name:"Galactic Stage",
      description:"One colonized system becomes a galactic network, with megastructures and final victory paths.",
      dominantArchetype:"humanoid",
      resources:["food","production","energy","alloys","science","data","culture","influence","happiness","military_power","strategic_total","luxury_total"],
      scoreTarget:18000,
      carryPopulation:true,
      carryResources:["food","production","energy","alloys","science","data","culture","influence","happiness","military_power","strategic_total","luxury_total"],
      techPaths:[{id:"stellar",name:"Stellar Engineering"},{id:"infrastructure",name:"Interstellar Infrastructure"},{id:"propulsion",name:"Advanced Propulsion"},{id:"ai",name:"AI Ascendancy"},{id:"post_bio",name:"Post-Biological Evolution"},{id:"energy",name:"Energy Manipulation"},{id:"quantum",name:"Quantum Communications"},{id:"governance",name:"Galactic Governance"},{id:"culture",name:"Cultural Integration"},{id:"military",name:"Exo-Military Systems"},{id:"trade",name:"Galactic Economics and Trade"},{id:"xenobiology",name:"Xenobiology and Integration"},{id:"terraforming",name:"Advanced Terraforming"},{id:"cosmology",name:"Computational Cosmology"},{id:"ecology",name:"Hyper-Ecological Management"},{id:"dimensional",name:"Interdimensional Research"},{id:"consciousness",name:"Consciousness Engineering"},{id:"philosophy",name:"Cosmic Philosophy"}],
      actions:[action("negotiate_treaty","Negotiate Treaty",{influence:2.5,culture:0.7,food:0.5}),action("archive_data","Archive Data",{data:2.2,science:1.0,energy:0.8}),action("coordinate_fleet","Coordinate Fleet",{military_power:2.4,alloys:1.0})],
      systems:[
        system("sector_network","Sector Network","Galactic core","The first system-scale governance network.",{energy:220,alloys:160,influence:90},[],["Sector governance"],"humanoid",{energy:180,alloys:140,data:120,influence:150,food:90,culture:90},{perSecond:{influence:0.55,data:0.35,food:0.14,energy:0.22,alloys:0.12,culture:0.08}}),
        system("dyson_swarm","Dyson Swarm","Megastructures","Repeatable stellar energy infrastructure.",{energy:260,alloys:190,science:110},["sector_network"],["Stellar industry"],"plantoid",{energy:320},{perSecond:{energy:1.9}}),
        system("quantum_archive","Quantum Archive","Megastructures","Turns civilization memory into data and science.",{energy:190,alloys:120,data:80},["sector_network"],["Galactic memory"],"humanoid",{data:220,science:180,culture:140},{perSecond:{data:1.1,science:0.55,culture:0.22}}),
        system("gateway_spine","Gateway Spine","Infrastructure","Binds far systems into one logistics network.",{energy:240,alloys:170,influence:100},["quantum_archive"],["Interstellar logistics"],"molluscoid",{production:160,influence:130},{perSecond:{production:0.75,influence:0.28,happiness:0.04}}),
        system("ascension_protocol","Ascension Protocol","Victory paths","The first base-form final victory commitment.",{science:230,data:190,culture:105,influence:115},["quantum_archive","gateway_spine"],["Ascension candidate"],"extremophile",{data:180,culture:140,ascension:140},{perSecond:{data:0.72,culture:0.38,ascension:0.1},score:240})
      ],
      technologies:[
        tech("dyson_coordination","Dyson Coordination","stellar",{science:260,energy:160},[],{perSecond:{energy:0.5}}),
        tech("wormhole_corridors","Wormhole Corridors","propulsion",{science:280,data:110,energy:160},["gateway_spine"],{perSecond:{influence:0.22,production:0.18}}),
        tech("ascension_protocols","Ascension Protocols","consciousness",{science:290,data:185,culture:115},["ascension_protocol"],{score:200,perSecond:{data:0.62,culture:0.42,ascension:0.08}})
      ]
    }
  ];

  function stageById(id){
    return DATA.STAGES.find(function(stage){ return stage.id===id; });
  }
  function ensureResource(id,name,category,firstStage,carriesForward){
    if(!DATA.RESOURCES.some(function(item){ return item.id===id; })){
      DATA.RESOURCES.push({id:id,name:name,category:category||"primary",firstStage:firstStage,carriesForward:carriesForward!==false});
    }
  }
  function ensureStageResource(stageId,resourceId){
    const stage=stageById(stageId);
    if(stage && !stage.resources.includes(resourceId)) stage.resources.push(resourceId);
    if(stage && !stage.carryResources.includes(resourceId) && DATA.RESOURCES.some(function(item){ return item.id===resourceId && item.carriesForward; })) stage.carryResources.push(resourceId);
  }
  function addSystem(stageId,item){
    const stage=stageById(stageId);
    if(stage && !stage.systems.some(function(existing){ return existing.id===item.id; })) stage.systems.push(item);
  }
  function addTech(stageId,item){
    const stage=stageById(stageId);
    if(stage && !stage.technologies.some(function(existing){ return existing.id===item.id; })) stage.technologies.push(item);
  }
  function setAffinity(stageId,id,affinity){
    const stage=stageById(stageId);
    if(!stage) return;
    const item=stage.systems.find(function(system){ return system.id===id; })||stage.technologies.find(function(techItem){ return techItem.id===id; });
    if(item) item.affinity=affinity;
  }
  function lineage(item,archetypeId){
    item.archetypeReq=archetypeId;
    return item;
  }

  ensureResource("faith","Faith","primary","tribal",true);
  ensureResource("logistics","Logistics","primary","empire",true);
  ensureResource("colonies","Colonies","primary","solar",true);
  ensureResource("command","Command","primary","solar",true);
  ensureResource("cohesion","Cohesion","primary","galactic",true);
  ensureResource("ascension","Ascension","primary","galactic",true);
  ["tribal","civilization","empire","solar","galactic"].forEach(function(id){ ensureStageResource(id,"faith"); });
  ["empire","solar","galactic"].forEach(function(id){ ensureStageResource(id,"logistics"); });
  ["solar","galactic"].forEach(function(id){ ensureStageResource(id,"colonies"); ensureStageResource(id,"command"); });
  ensureStageResource("galactic","cohesion");
  ensureStageResource("galactic","ascension");

  [
    system("pseudopodia","Pseudopodia","Advanced organelles","Flexible extensions for engulfing food and navigating viscous environments.",{atp:24,proteins:12,lipids:10},["nucleus"],["Amoeboid movement"],"molluscoid",{glucose:20,proteins:20},{manualBonus:0.12,perSecond:{glucose:0.12}}),
    system("cilia","Cilia","Advanced organelles","Fine movement structures that improve feeding currents and mobility.",{atp:22,proteins:12,lipids:8},["flagellum"],["Fine mobility"],"aquatic",{atp:20},{manualBonus:0.08,perSecond:{glucose:0.08,proteins:0.08}}),
    system("carboxysome","Carboxysome","Energy organelles","Carbon-fixing microcompartment that supports photosynthetic lineages.",{atp:26,glucose:10,proteins:12,elements:12},["chloroplast"],["Carbon fixation"],"plantoid",{glucose:40},{perSecond:{glucose:0.28},consume:{atp:0.04}}),
    system("acidocalcisome","Acidocalcisome","Advanced organelles","Ion and mineral storage compartment for harsh chemical conditions.",{atp:24,proteins:8,elements:18},["vacuole","nucleus"],["Mineral storage"],"extremophile",{elements:45},{perSecond:{elements:0.12},score:10}),
    system("apicoplast","Apicoplast","Advanced organelles","A specialized metabolic organelle that boosts lipid and element processing.",{atp:28,lipids:16,proteins:12,elements:12},["chloroplast","nucleus"],["Specialized metabolism"],"toxoid",{lipids:35,elements:25},{perSecond:{lipids:0.2,elements:0.1},consume:{glucose:0.04}}),
    system("kinetoplast","Kinetoplast","Core organelles","Dense mitochondrial DNA structure that stabilizes active energy builds.",{atp:30,glucose:16,proteins:14,elements:10},["mitochondria","nucleus"],["Dense metabolism"],"arthropoid",{atp:50},{perSecond:{atp:0.34},consume:{glucose:0.06}}),
    system("storage_granules","Storage Granules","Assembly organelles","Localized reserves that increase all molecule caps.",{atp:18,glucose:10,proteins:10,lipids:10},["vacuole"],["Molecular reserves"],"molluscoid",{glucose:30,proteins:30,lipids:30,elements:15},{}),
    system("secretory_vesicles","Secretory Vesicles","Assembly organelles","Export and signaling vesicles for more organized cell behavior.",{atp:22,proteins:12,lipids:12},["golgi_apparatus"],["Secretory signaling"],"humanoid",{proteins:20,lipids:20},{perSecond:{proteins:0.08,lipids:0.08},score:10})
  ].forEach(function(item){ addSystem("cell",item); });

  [
    system("centrosome","Centrosome","Core organelles","Microtubule organizer that supports coordinated division and animal-like body plans.",{atp:24,proteins:14,elements:8},["nucleus"],["Coordinated division"],"mammalian",{proteins:30},{populationGrowth:0.012,score:12}),
    system("extracellular_matrix","Extracellular Matrix","Advanced organelles","Adhesion scaffold that favors tissue-forming, mammalian-leaning specialization.",{atp:26,proteins:16,lipids:10,elements:8},["secretory_vesicles"],["Cell adhesion"],"mammalian",{proteins:35,lipids:20},{populationGrowth:0.014,perSecond:{proteins:0.08}}),
    system("gap_junctions","Gap Junctions","Advanced organelles","Cell-to-cell channels that improve signaling and collective response.",{atp:28,proteins:16,lipids:14,elements:10},["extracellular_matrix"],["Direct signaling"],"mammalian",{glucose:25,proteins:25},{perSecond:{glucose:0.08,proteins:0.08},score:14}),
    system("apoptosome","Apoptosome","Advanced organelles","Controlled cell death machinery that turns collapse into future adaptation.",{atp:24,proteins:16,lipids:10,elements:10},["nucleus"],["Programmed death"],"necroid",{proteins:25,elements:20},{score:20,consume:{atp:0.02}}),
    system("mitophagy_complex","Mitophagy Complex","Energy organelles","Selective recycling of damaged mitochondria, stabilizing a death-and-renewal lineage.",{atp:28,glucose:12,proteins:14,elements:12},["mitochondria","apoptosome"],["Death renewal"],"necroid",{atp:40,proteins:25},{perSecond:{atp:0.22,proteins:0.08},consume:{glucose:0.04}}),
    system("necrosome","Necrosome","Core organelles","Emergency death signaling that converts stress into decisive lineage pressure.",{atp:32,proteins:18,lipids:12,elements:16},["apoptosome","lysosome"],["Necrotic signaling"],"necroid",{elements:35,proteins:25},{score:28,perSecond:{elements:0.1},consume:{atp:0.04}}),
    system("chromatophore","Chromatophore","Energy organelles","Light-harvesting membrane system that supports photosynthetic and display-heavy cells.",{atp:26,glucose:10,proteins:12,lipids:12},["smooth_er"],["Light membranes"],"plantoid",{glucose:30,lipids:25},{perSecond:{glucose:0.14,lipids:0.08}}),
    system("nucleolus","Nucleolus","Core organelles","Dense ribosome production center that accelerates internal assembly.",{atp:24,proteins:16,elements:8},["nucleus","ribosome"],["Ribosome factory"],"fungoid",{proteins:40},{perSecond:{proteins:0.22},consume:{atp:0.04}}),
    system("stigma_eyespot","Stigma Eyespot","Advanced organelles","Primitive light sensing that gives mobile cells a directional advantage.",{atp:24,proteins:12,lipids:10,elements:10},["flagellum"],["Light sensing"],"avian",{atp:20,elements:20},{manualBonus:0.1,score:12}),
    system("silica_scales","Silica Scales","Advanced organelles","Mineralized external plates that favor hardened lithoid survivability.",{atp:28,proteins:10,lipids:8,elements:22},["cell_wall"],["Mineral armor"],"lithoid",{elements:55},{upkeepBonus:-0.015,score:16})
  ].forEach(function(item){ addSystem("cell",item); });

  [
    system("hunting_pack","Hunting Pack","Survival structures","Coordinated predation that produces food but costs water and stability.",{food:22,water:14,materials:10},["foraging_pack"],["Pack tactics"],"reptilian",{food:45},{perSecond:{food:0.42,military_power:0.08},consume:{water:0.03}}),
    system("burrow","Burrow","Survival structures","Shelter that protects against scarcity and raises material storage.",{materials:26,organic_matter:12},["nest"],["Burrowing lineage"],"arthropoid",{materials:45,food:20},{perSecond:{materials:0.16},populationGrowth:0.01}),
    system("territory_marks","Territory Marks","Development","Primitive signaling increases culture and reduces resource conflict.",{organic_matter:16,materials:12},["watering_path"],["Territorial memory"],"mammalian",{culture:30},{perSecond:{culture:0.12,happiness:0.02}}),
    system("bone_cache","Bone Cache","Development","Stored remains become early materials and future craft memory.",{food:24,organic_matter:18},["hunting_pack"],["Bone tools"],"reptilian",{materials:40},{perSecond:{materials:0.24},consume:{organic_matter:0.06}}),
    system("nursery_grove","Nursery Grove","Growth","A protected breeding site that increases population growth.",{food:32,water:22,organic_matter:20},["den_network"],["Protected generation"],"plantoid",{food:50,water:50},{populationGrowth:0.035,perSecond:{culture:0.08}}),
    system("mimicry_display","Mimicry Display","Development","Visual behavior that increases culture and later diplomacy affinity.",{knowledge:18,culture:8,organic_matter:12},["thinking_cluster"],["Display behavior"],"avian",{culture:45},{perSecond:{culture:0.18},score:12}),
    system("symbiotic_gut","Symbiotic Gut","Survival structures","Microbial digestion improves food efficiency.",{food:28,organic_matter:24,knowledge:10},["thinking_cluster"],["Symbiotic digestion"],"fungoid",{food:55},{perSecond:{food:0.2,organic_matter:0.1},upkeepBonus:-0.01}),
    system("migration_paths","Migration Paths","Growth","Repeated movement creates remembered routes before formal roads.",{food:34,water:26,knowledge:16},["territory_marks"],["Migration memory"],"aquatic",{food:35,water:35},{perSecond:{knowledge:0.12,culture:0.08},score:14})
  ].forEach(function(item){ addSystem("creature",item); });

  [
    system("milk_glands","Milk Glands","Growth","Dedicated nourishment strongly reinforces mammalian lineage pressure.",{food:30,water:20,organic_matter:18},["den_network"],["Nursing young"],"mammalian",{food:60,water:35},{populationGrowth:0.03,perSecond:{food:0.12}}),
    system("warm_blooded_core","Warm-Blooded Core","Survival structures","Stable internal heat improves activity at a steady food cost.",{food:36,water:22,organic_matter:22},["den_network"],["Endothermy"],"mammalian",{food:50},{perSecond:{knowledge:0.08,culture:0.06},consume:{food:0.08},score:20}),
    system("carrion_cycle","Carrion Cycle","Survival structures","A scavenging adaptation turns death into food and organic matter.",{food:26,organic_matter:28,knowledge:10},["hunting_pack"],["Carrion economy"],"necroid",{food:45,organic_matter:60},{perSecond:{food:0.28,organic_matter:0.2},score:18}),
    system("torpor_reflex","Torpor Reflex","Growth","Dormant survival windows reduce upkeep and deepen death-adjacent specialization.",{food:34,water:24,organic_matter:20},["carrion_cycle"],["Dormancy"],"necroid",{food:45,water:45},{upkeepBonus:-0.02,score:24}),
    system("brood_husk","Brood Husk","Growth","Abandoned bodies become protected nurseries for the next generation.",{food:38,organic_matter:32,materials:18},["torpor_reflex"],["Husk nursery"],"necroid",{organic_matter:65,materials:45},{populationGrowth:0.022,perSecond:{organic_matter:0.12},score:26})
  ].forEach(function(item){ addSystem("creature",item); });

  [
    tech("camouflage","Camouflage","survival",{knowledge:18,organic_matter:12},["efficient_foraging"],{perSecond:{food:0.08,happiness:0.02}}),
    tech("tool_grips","Tool Grips","growth",{knowledge:22,materials:16},["tool_use"],{perSecond:{materials:0.14},capacity:{materials:25}}),
    tech("cooperative_hunting","Cooperative Hunting","survival",{knowledge:24,food:16},["hunting_pack"],{perSecond:{food:0.18,military_power:0.08}}),
    tech("proto_language","Proto-Language","thinking",{knowledge:30,culture:14},["symbolic_calls"],{perSecond:{knowledge:0.12,culture:0.18},score:18}),
    tech("fire_fear","Fire Fear","survival",{knowledge:26,materials:12},["symbolic_calls"],{perSecond:{happiness:0.03,military_power:0.06}}),
    tech("seasonal_memory","Seasonal Memory","growth",{knowledge:28,food:18,water:12},["nesting_instinct"],{capacity:{food:35,water:35},perSecond:{knowledge:0.08}}),
    tech("kinship_bonds","Kinship Bonds","thinking",{knowledge:34,culture:20},["proto_language"],{perSecond:{culture:0.22,happiness:0.04},populationGrowth:0.008}),
    tech("apex_instinct","Apex Instinct","survival",{knowledge:40,food:28,military_power:12},["cooperative_hunting"],{score:28,perSecond:{military_power:0.16}})
  ].forEach(function(item){ addTech("creature",item); });

  [
    system("healer_hut","Healer Hut","Buildings","Herbal care reduces population pressure and adds culture.",{wood:24,lumber:12,clay:14,culture:10},["shrine"],["Herbal medicine"],"plantoid",{happiness:45,food:25},{perSecond:{happiness:0.08,culture:0.08},populationGrowth:0.006}),
    system("totem_circle","Totem Circle","Buildings","Ritual focus that generates faith and culture.",{lumber:18,stone:18,culture:14},["shrine"],["Totemic faith"],"fungoid",{faith:50,culture:45},{perSecond:{faith:0.22,culture:0.16}}),
    system("stone_knapper","Stone Knapper","Buildings","Dedicated tool production increases science and military power.",{lumber:18,stone:28},["workshop"],["Specialized tools"],"arthropoid",{science:50,military_power:40},{perSecond:{science:0.22,military_power:0.12},consume:{stone:0.05}}),
    system("hunter_lodge","Hunter Lodge","Units","Organized hunters increase food and military power.",{food:24,lumber:18,stone:12},["watch_band"],["Hunter cadre"],"reptilian",{food:50,military_power:55},{perSecond:{food:0.24,military_power:0.28},consume:{water:0.04}}),
    system("trade_runner_camp","Trade Runner Camp","Units","Early trade and supply runners produce luxury access.",{food:22,lumber:20,culture:12},["village_center"],["Trade runners"],"molluscoid",{luxury_total:45,gold:25},{perSecond:{luxury_total:0.08,happiness:0.05}}),
    system("copper_pit","Copper Pit","Buildings","First strategic extraction site.",{lumber:26,stone:30,science:12},["stone_knapper"],["Copper working"],"lithoid",{strategic_total:55},{perSecond:{strategic_total:0.14,science:0.08},consume:{wood:0.04}}),
    system("clay_kiln","Clay Kiln","Buildings","Fires clay into durable storage and construction material.",{lumber:24,clay:30},["campfire"],["Kiln craft"],"humanoid",{clay:60,production:25},{perSecond:{science:0.08,culture:0.05},consume:{wood:0.08,clay:0.04}}),
    system("council_fire","Council Fire","Village core","Leadership gathering that converts culture into happiness and influence memory.",{food:28,lumber:20,culture:22},["totem_circle"],["Council tradition"],"humanoid",{culture:60,happiness:60},{perSecond:{culture:0.12,happiness:0.1,faith:0.06}}),
    system("skirmisher_band","Skirmisher Band","Units","Mobile fighters for raids and defense.",{food:30,lumber:22,stone:16,military_power:12},["hunter_lodge"],["Skirmish tactics"],"avian",{military_power:75},{perSecond:{military_power:0.38},consume:{food:0.08}}),
    system("river_docks","River Docks","Buildings","Water routes improve food, trade, and luxury access.",{lumber:34,stone:18},["trade_runner_camp"],["River trade"],"aquatic",{food:45,luxury_total:55},{perSecond:{food:0.18,luxury_total:0.12,happiness:0.04}})
  ].forEach(function(item){ addSystem("tribal",item); });

  [
    tech("weaving","Weaving","crafting",{science:28,culture:12},["stone_tools"],{perSecond:{culture:0.1,luxury_total:0.05}}),
    tech("pottery","Pottery","construction",{science:30,clay:20},["adobe"],{capacity:{food:35,water:20,clay:25},perSecond:{culture:0.06}}),
    tech("herbalism","Herbalism","spirituality",{science:32,culture:16,food:12},["healer_hut"],{perSecond:{happiness:0.08,faith:0.08}}),
    tech("copper_tools","Copper Tools","crafting",{science:38,strategic_total:12},["copper_pit"],{perSecond:{wood:0.12,stone:0.12,science:0.08}}),
    tech("archery","Archery","warfare",{science:40,lumber:18,military_power:10},["skirmisher_band"],{perSecond:{military_power:0.24}}),
    tech("irrigated_plots","Irrigated Plots","agriculture",{science:36,water:20,lumber:14},["planting"],{perSecond:{food:0.28},capacity:{food:35}}),
    tech("ancestor_rites","Ancestor Rites","spirituality",{science:38,faith:18,culture:20},["totem_circle"],{perSecond:{faith:0.2,culture:0.12,happiness:0.04}}),
    tech("proto_roads","Proto-Roads","construction",{science:42,lumber:22,stone:18},["trade_runner_camp"],{perSecond:{luxury_total:0.06,science:0.06},score:18}),
    tech("clan_law","Clan Law","spirituality",{science:46,culture:30,faith:16},["council_fire"],{perSecond:{happiness:0.08,culture:0.12},score:20}),
    tech("sling_drills","Sling Drills","warfare",{science:44,stone:22,military_power:16},["archery"],{perSecond:{military_power:0.2},capacity:{military_power:40}})
  ].forEach(function(item){ addTech("tribal",item); });

  [
    system("aqueduct","Aqueduct","Infrastructure","Formal water infrastructure supports city growth.",{production:70,stone:30,science:20},["city_center"],["Urban water"],"aquatic",{water:120,happiness:40},{perSecond:{water:0.55,happiness:0.04},populationGrowth:0.008}),
    system("temple_district","Temple District","Institutions","Faith, culture, and civic cohesion.",{production:75,culture:35,faith:20},["city_center"],["Organized religion"],"fungoid",{faith:100,culture:90},{perSecond:{faith:0.5,culture:0.22,happiness:0.05}}),
    system("workshops","Workshops","Infrastructure","Specialized production buildings for early industry.",{production:65,lumber:30,gold:20},["city_center"],["Artisan labor"],"arthropoid",{production:120},{perSecond:{production:0.5,science:0.08},consume:{wood:0.08}}),
    system("walls","City Walls","Military","City defenses and siege resistance.",{production:80,stone:40,gold:20},["barracks"],["Fortified city"],"lithoid",{military_power:100,happiness:30},{perSecond:{military_power:0.25,happiness:0.03}}),
    system("harbor","Harbor","Infrastructure","Sea routes increase food, gold, luxuries, and military reach.",{production:85,gold:35,lumber:25},["market"],["Maritime trade"],"aquatic",{gold:100,luxury_total:70},{perSecond:{food:0.24,gold:0.36,luxury_total:0.12}}),
    system("academy","Academy","Institutions","Advanced teaching institution for science and culture.",{production:95,gold:45,science:35},["library"],["Formal scholars"],"humanoid",{science:140,culture:80},{perSecond:{science:0.75,culture:0.18}}),
    system("courthouse","Courthouse","Institutions","Government building that stabilizes happiness and influence.",{production:90,gold:40,culture:35},["code_of_laws"],["Legal memory"],"humanoid",{happiness:80,influence:70},{perSecond:{happiness:0.1,influence:0.18}}),
    system("stables","Stables","Military","Mobile units and logistics for early armies.",{production:70,food:35,gold:25},["barracks"],["Mounted warfare"],"mammalian",{military_power:110},{perSecond:{military_power:0.45},consume:{food:0.08}}),
    system("amphitheater","Amphitheater","Institutions","Public culture and happiness.",{production:90,culture:45,gold:25},["market"],["Public performance"],"avian",{culture:120,happiness:80},{perSecond:{culture:0.45,happiness:0.08}}),
    system("mint","Mint","Infrastructure","Converts production and metal access into gold.",{production:110,gold:50,strategic_total:18},["currency"],["Coinage"],"molluscoid",{gold:160},{perSecond:{gold:0.75},consume:{production:0.08}})
  ].forEach(function(item){ addSystem("civilization",item); });

  [
    tech("masonry","Masonry","industry",{science:70,stone:30},["irrigation"],{capacity:{production:60,stone:40},perSecond:{production:0.18}}),
    tech("organized_religion","Organized Religion","culture",{science:72,faith:35,culture:30},["temple_district"],{perSecond:{faith:0.35,culture:0.16,happiness:0.04}}),
    tech("mathematics","Mathematics","science",{science:80,gold:30},["writing"],{perSecond:{science:0.32,production:0.12}}),
    tech("military_drill","Military Drill","military",{science:82,military_power:35,gold:25},["barracks"],{perSecond:{military_power:0.34}}),
    tech("sailing","Sailing","economics",{science:75,wood:25,gold:25},["harbor"],{perSecond:{gold:0.22,luxury_total:0.08}}),
    tech("civil_service","Civil Service","government",{science:95,culture:45,gold:35},["courthouse"],{perSecond:{influence:0.28,happiness:0.06}}),
    tech("engineering","Engineering","industry",{science:100,production:55},["masonry","mathematics"],{perSecond:{production:0.34,science:0.1},capacity:{production:80}}),
    tech("literature","Literature","culture",{science:90,culture:50},["writing"],{perSecond:{culture:0.32,science:0.08}}),
    tech("banking","Banking","economics",{science:105,gold:70},["currency","mint"],{perSecond:{gold:0.5,influence:0.08}}),
    tech("professional_army","Professional Army","military",{science:110,gold:55,military_power:50},["military_drill"],{perSecond:{military_power:0.45},consume:{gold:0.08}})
  ].forEach(function(item){ addTech("civilization",item); });

  [
    system("coal_plant","Coal Plant","Industry","Burns strategic fuel into energy and production.",{production:145,gold:75,strategic_total:35},["factory_district"],["Fossil energy"],"lithoid",{energy:120,production:100},{perSecond:{energy:0.9,production:0.28},consume:{strategic_total:0.08,happiness:0.02}}),
    system("railway_network","Railway Network","Logistics","Regional transport produces logistics and production.",{production:150,gold:100,strategic_total:30},["rail_hub"],["Rail logistics"],"molluscoid",{logistics:140,production:100},{perSecond:{logistics:0.75,production:0.35},consume:{energy:0.05}}),
    system("public_schools","Public Schools","Institutions","Mass education increases science and culture.",{production:130,gold:90,culture:50},["university_network"],["Mass education"],"humanoid",{science:150,culture:120},{perSecond:{science:0.65,culture:0.22}}),
    system("field_hospitals","Field Hospitals","Medicine","Population support and military resilience.",{production:120,gold:80,science:45},["general_staff"],["Modern medicine"],"mammalian",{happiness:100,military_power:80},{perSecond:{happiness:0.08,military_power:0.18},populationGrowth:0.01}),
    system("radio_network","Radio Network","Communications","Broadcast influence and culture across regions.",{production:155,gold:95,science:55},["telegraph_network"],["Mass communication"],"avian",{influence:150,culture:120},{perSecond:{influence:0.5,culture:0.28}}),
    system("naval_yards","Naval Yards","Military","Sea power and external reach.",{production:170,gold:110,strategic_total:40},["general_staff"],["Naval logistics"],"aquatic",{military_power:160,logistics:80},{perSecond:{military_power:0.55,logistics:0.22},consume:{production:0.08}}),
    system("bureaucratic_archive","Bureaucratic Archive","Administration","Stores policy memory and generates influence.",{production:140,gold:100,culture:70},["provincial_admin"],["State records"],"humanoid",{influence:180,culture:100},{perSecond:{influence:0.62,culture:0.12}}),
    system("oil_refinery","Oil Refinery","Industry","Processes strategic resources into energy and production.",{production:190,gold:120,strategic_total:60},["combustion"],["Fuel refining"],"toxoid",{energy:180,production:120},{perSecond:{energy:1.05,production:0.35},consume:{strategic_total:0.14,happiness:0.03}}),
    system("airfield","Airfield","Aerospace","Aerial logistics and military projection.",{production:180,gold:120,energy:60},["combustion"],["Aerial doctrine"],"avian",{military_power:150,logistics:120},{perSecond:{military_power:0.48,logistics:0.45},consume:{energy:0.08}}),
    system("labor_unions","Labor Unions","Administration","Stabilizes happiness while reducing pure production speed.",{production:150,gold:95,culture:80},["factory_district"],["Labor rights"],"mammalian",{happiness:160,culture:100},{perSecond:{happiness:0.24,culture:0.18},consume:{production:0.06}})
  ].forEach(function(item){ addSystem("empire",item); });

  [
    tech("assembly_lines","Assembly Lines","industry",{science:130,production:90},["mass_production"],{perSecond:{production:0.55},capacity:{production:100}}),
    tech("vaccination","Vaccination","medicine",{science:125,food:40},["field_hospitals"],{perSecond:{happiness:0.12},populationGrowth:0.012}),
    tech("electrification","Electrification","energy",{science:145,energy:50,strategic_total:30},["coal_plant"],{perSecond:{energy:0.45,production:0.18}}),
    tech("radio","Radio","communications",{science:150,gold:70},["radio_network"],{perSecond:{influence:0.35,culture:0.16}}),
    tech("combustion_engines","Combustion Engines","transport",{science:160,strategic_total:45},["combustion"],{perSecond:{logistics:0.42,production:0.18}}),
    tech("combined_arms","Combined Arms","military",{science:165,military_power:85,logistics:35},["general_staff"],{perSecond:{military_power:0.5},consume:{logistics:0.06}}),
    tech("public_health","Public Health","medicine",{science:155,gold:80,culture:35},["vaccination"],{perSecond:{happiness:0.18},populationGrowth:0.015}),
    tech("flight","Flight","aerospace",{science:180,energy:70,strategic_total:45},["airfield"],{perSecond:{logistics:0.35,military_power:0.24}}),
    tech("mass_media","Mass Media","communications",{science:170,culture:90,influence:50},["radio"],{perSecond:{culture:0.36,influence:0.28,happiness:0.04}}),
    tech("synthetic_materials","Synthetic Materials","industry",{science:190,energy:80,strategic_total:55},["oil_refinery"],{perSecond:{production:0.4,strategic_total:0.08}})
  ].forEach(function(item){ addTech("empire",item); });

  [
    system("ice_mining_station","Ice Mining Station","Infrastructure","Extracts water from ice bodies and comets.",{production:170,energy:90,alloys:60},["planetary_colony"],["Ice extraction"],"aquatic",{water:180},{perSecond:{water:0.9},consume:{energy:0.05}}),
    system("helium_three_rigs","Helium-3 Rigs","Infrastructure","Gas giant extraction for energy and strategic resources.",{production:190,alloys:90,energy:80},["fusion_drives"],["Gas giant extraction"],"lithoid",{energy:200,strategic_total:120},{perSecond:{energy:0.75,strategic_total:0.18},consume:{alloys:0.04}}),
    system("terraforming_array","Terraforming Array","Colonies","Improves colony happiness and long-term population growth.",{production:220,energy:140,science:100},["closed_loop_life_support"],["Planet shaping"],"plantoid",{happiness:140,colonies:80},{perSecond:{happiness:0.16,colonies:0.08},consume:{energy:0.08}}),
    system("automated_foundry","Automated Foundry","Infrastructure","Turns energy and strategic resources into alloys.",{production:210,energy:120,strategic_total:80},["asteroid_mines"],["Automated industry"],"arthropoid",{alloys:190},{perSecond:{alloys:0.95},consume:{energy:0.12,strategic_total:0.08}}),
    system("deep_space_telescope","Deep Space Telescope","Infrastructure","Science and navigation for home-system expansion.",{production:180,alloys:75,science:90},["orbital_construction"],["Astrophysics platform"],"avian",{science:180,data:80},{perSecond:{science:0.65,data:0.18}}),
    system("colony_shipyard","Colony Shipyard","Military","Builds colony and transport vessels.",{production:230,alloys:130,energy:110},["shipyard_ring"],["Colonial fleet"],"humanoid",{colonies:150,command:90},{perSecond:{colonies:0.28,command:0.18},consume:{alloys:0.08}}),
    system("orbital_farms","Orbital Farms","Colonies","Food production in controlled habitats.",{production:190,water:100,energy:90},["orbital_habitat"],["Hydroponics"],"plantoid",{food:180},{perSecond:{food:0.8},consume:{water:0.08,energy:0.05}}),
    system("defense_grid","Defense Grid","Military","Home-system defense and command capacity.",{production:220,alloys:140,energy:130},["shipyard_ring"],["Orbital defense"],"reptilian",{military_power:220,command:130},{perSecond:{military_power:0.75,command:0.22},consume:{energy:0.08}}),
    system("interplanetary_exchange","Interplanetary Exchange","Infrastructure","Trade between colonies increases gold, luxuries, and influence.",{production:200,colonies:40,influence:80},["planetary_colony"],["Interplanetary trade"],"molluscoid",{gold:160,luxury_total:140,data:90},{perSecond:{gold:0.65,luxury_total:0.18,influence:0.18,data:0.08}}),
    system("ai_traffic_control","AI Traffic Control","Infrastructure","Automated routing improves logistics and production.",{production:220,data:70,science:110},["deep_space_telescope"],["Traffic automation"],"humanoid",{logistics:180,production:120},{perSecond:{logistics:0.75,production:0.25},consume:{data:0.02}})
  ].forEach(function(item){ addSystem("solar",item); });

  [
    tech("ion_thrusters","Ion Thrusters","propulsion",{science:210,energy:110},["fusion_drives"],{perSecond:{colonies:0.08,command:0.08}}),
    tech("asteroid_processing","Asteroid Processing","mining",{science:220,alloys:100},["asteroid_mines"],{perSecond:{alloys:0.35,strategic_total:0.1}}),
    tech("fusion_grid","Fusion Grid","energy",{science:235,energy:140},["helium_three_rigs"],{perSecond:{energy:0.55}}),
    tech("planetary_ecology","Planetary Ecology","biology",{science:240,food:80,water:80},["terraforming_array"],{perSecond:{happiness:0.12,food:0.18},populationGrowth:0.012}),
    tech("autonomous_mining","Autonomous Mining","automation",{science:250,data:70,alloys:120},["automated_foundry"],{perSecond:{alloys:0.3,strategic_total:0.08}}),
    tech("orbital_doctrine","Orbital Doctrine","military",{science:245,military_power:110,command:45},["defense_grid"],{perSecond:{military_power:0.45,command:0.18}}),
    tech("habitat_culture","Habitat Culture","culture",{science:230,culture:110,colonies:35},["orbital_habitat"],{perSecond:{culture:0.28,happiness:0.12}}),
    tech("terraforming_protocols","Terraforming Protocols","terraforming",{science:270,energy:150,colonies:60},["planetary_ecology"],{perSecond:{colonies:0.16,happiness:0.1},score:40}),
    tech("quantum_navigation","Quantum Navigation","navigation",{science:280,data:100,energy:150},["deep_space_telescope"],{perSecond:{logistics:0.32,command:0.2,data:0.1}}),
    tech("ftl_prototype","FTL Prototype","astrophysics",{science:320,data:140,energy:220},["quantum_navigation"],{score:120,perSecond:{data:0.28,influence:0.12}})
  ].forEach(function(item){ addTech("solar",item); });

  [
    system("stellar_lifter","Stellar Lifter","Megastructures","Harvests stellar matter for alloys and strategic resources.",{energy:360,alloys:260,science:160},["dyson_swarm"],["Stellar lifting"],"lithoid",{alloys:320,strategic_total:260},{perSecond:{alloys:1.2,strategic_total:0.28},consume:{energy:0.18}}),
    system("science_nexus","Science Nexus","Megastructures","A galactic-scale research engine.",{energy:340,alloys:230,data:160},["quantum_archive"],["Science nexus"],"humanoid",{science:360,data:240},{perSecond:{science:1.4,data:0.55},consume:{energy:0.12}}),
    system("sentry_array","Sentry Array","Megastructures","Wide-area awareness increases command and cohesion.",{energy:320,alloys:220,data:140},["gateway_spine"],["Galactic awareness"],"avian",{command:260,cohesion:180},{perSecond:{command:0.65,cohesion:0.28},consume:{energy:0.1}}),
    system("ring_world_segment","Ring World Segment","Megastructures","Massive habitat segment for food, culture, and population.",{energy:420,alloys:340,science:220},["stellar_lifter"],["Ring habitat"],"plantoid",{food:340,culture:240,happiness:220},{perSecond:{food:1.1,culture:0.38,happiness:0.18},populationGrowth:0.025}),
    system("galactic_market","Galactic Market","Infrastructure","Trade network for gold, luxuries, and influence.",{energy:300,alloys:190,influence:180},["sector_network"],["Galactic trade"],"molluscoid",{gold:280,luxury_total:260,influence:220,food:120},{perSecond:{gold:1.1,luxury_total:0.32,influence:0.32,food:0.12}}),
    system("federation_council","Federation Council","Galactic core","Diplomatic governance that raises cohesion and culture.",{influence:260,culture:220,data:120},["sector_network"],["Federation diplomacy"],"humanoid",{cohesion:280,culture:220,food:90},{perSecond:{cohesion:0.58,culture:0.32,happiness:0.08,food:0.08}}),
    system("psionic_chorus","Psionic Chorus","Victory paths","A spiritual ascension route built on faith and culture.",{faith:260,culture:240,data:160},["ascension_protocol"],["Psionic chorus"],"necroid",{ascension:220,faith:260},{perSecond:{ascension:0.42,faith:0.35,cohesion:0.18},consume:{culture:0.08}}),
    system("synthetic_mind","Synthetic Mind","Victory paths","A post-biological ascension route using data and energy.",{data:280,energy:280,science:220},["ascension_protocol"],["Synthetic ascension"],"humanoid",{ascension:260,data:260},{perSecond:{ascension:0.48,data:0.5},consume:{energy:0.18}}),
    system("bio_ascension_vats","Bio-Ascension Vats","Victory paths","A biological ascension route using food, science, and culture.",{food:260,science:260,culture:180},["ascension_protocol"],["Biological ascension"],"mammalian",{ascension:230,food:280},{perSecond:{ascension:0.44,food:0.42,happiness:0.08},consume:{science:0.08}}),
    system("crisis_bastion","Crisis Bastion","Military","Endgame defensive infrastructure.",{energy:360,alloys:300,military_power:220},["sentry_array"],["Crisis defense"],"reptilian",{military_power:380,command:260},{perSecond:{military_power:1.2,command:0.4},consume:{energy:0.16,alloys:0.08}})
  ].forEach(function(item){ addSystem("galactic",item); });

  [
    tech("stellar_compression","Stellar Compression","stellar",{science:360,energy:240},["dyson_coordination"],{perSecond:{energy:0.8,strategic_total:0.1}}),
    tech("gateway_protocols","Gateway Protocols","infrastructure",{science:340,data:160,influence:180},["gateway_spine"],{perSecond:{logistics:0.5,influence:0.22}}),
    tech("sentient_archives","Sentient Archives","ai",{science:360,data:240},["quantum_archive"],{perSecond:{data:0.75,science:0.35}}),
    tech("galactic_charter","Galactic Charter","governance",{science:340,culture:220,influence:220},["federation_council"],{perSecond:{cohesion:0.4,happiness:0.1}}),
    tech("xeno_integration","Xeno Integration","xenobiology",{science:330,culture:220,food:160},["federation_council"],{perSecond:{culture:0.35,cohesion:0.22,happiness:0.08}}),
    tech("dark_energy_taps","Dark Energy Taps","energy",{science:390,energy:280,data:160},["stellar_compression"],{perSecond:{energy:0.9,ascension:0.08}}),
    tech("fleet_minds","Fleet Minds","military",{science:380,data:180,military_power:240},["crisis_bastion"],{perSecond:{military_power:0.8,command:0.35},consume:{data:0.08}}),
    tech("cosmic_tourism","Cosmic Tourism","culture",{science:330,culture:260,luxury_total:160},["galactic_market"],{perSecond:{culture:0.45,gold:0.35,happiness:0.12}}),
    tech("post_biological_rights","Post-Biological Rights","post_bio",{science:380,data:240,culture:200},["synthetic_mind"],{perSecond:{cohesion:0.3,ascension:0.18}}),
    tech("transcendent_synthesis","Transcendent Synthesis","philosophy",{science:460,data:360,culture:280,ascension:120},["ascension_protocols"],{score:420,perSecond:{ascension:0.7,cohesion:0.4}})
  ].forEach(function(item){ addTech("galactic",item); });

  ensureResource("tourism","Tourism","primary","civilization",true);
  ensureResource("diplomacy","Diplomacy","primary","civilization",true);
  ensureResource("rare_matter","Rare Matter","primary","galactic",true);
  ["civilization","empire","solar","galactic"].forEach(function(id){ ensureStageResource(id,"tourism"); ensureStageResource(id,"diplomacy"); });
  ["galactic"].forEach(function(id){ ensureStageResource(id,"rare_matter"); });

  [
    system("mitotic_spindle","Mitotic Spindle","Core organelles","Division machinery that improves population growth and stage score.",{atp:30,proteins:18,lipids:10,elements:12},["nucleus"],["Precise division"],"humanoid",{atp:30,proteins:30},{populationGrowth:0.018,score:22}),
    system("eyespot","Eyespot","Advanced organelles","Light-sensitive organelle that improves manual gathering and chloroplast builds.",{atp:24,proteins:12,lipids:10,elements:10},["chemoreceptors"],["Light sensitivity"],"avian",{glucose:25},{manualBonus:0.12,perSecond:{glucose:0.1}}),
    system("gas_vacuole","Gas Vacuole","Advanced organelles","Buoyancy organelle for aquatic drifting and light access.",{atp:22,lipids:14,elements:8},["contractile_vacuole"],["Buoyancy control"],"aquatic",{atp:25,glucose:25},{perSecond:{glucose:0.12},upkeepBonus:-0.01}),
    system("plasmodesmata","Plasmodesmata","Advanced organelles","Connection channels that hint toward plant-like collective behavior.",{atp:28,glucose:14,lipids:12,proteins:12},["cell_wall","chloroplast"],["Cellular channels"],"plantoid",{glucose:40,proteins:20},{perSecond:{glucose:0.2},populationGrowth:0.008}),
    system("microtubules","Microtubules","Assembly organelles","Internal skeleton for shape, transport, and future body-plan stability.",{atp:24,proteins:18,elements:8},["ribosome"],["Cell skeleton"],"arthropoid",{proteins:35,elements:20},{manualBonus:0.08,score:12}),
    system("capsule_layer","Capsule Layer","Advanced organelles","Protective slime layer that reduces upkeep and improves storage.",{atp:26,glucose:18,lipids:10},["cell_wall"],["Protective capsule"],"molluscoid",{glucose:30,lipids:30},{upkeepBonus:-0.02,score:12}),
    system("nucleoid_remnant","Nucleoid Remnant","Core organelles","An inherited primitive control cluster supporting rugged lineages.",{atp:24,proteins:12,elements:10},["nucleus"],["Primitive memory"],"extremophile",{atp:25,elements:25},{perSecond:{elements:0.08},score:14}),
    system("toxin_vacuole","Toxin Vacuole","Advanced organelles","Stores chemical defenses and biases later toxoid traits.",{atp:28,proteins:12,lipids:12,elements:16},["vacuole","peroxisome"],["Chemical defense"],"toxoid",{elements:35},{perSecond:{elements:0.08},consume:{atp:0.03},score:18})
  ].forEach(function(item){ addSystem("cell",item); });

  [
    system("scavenger_trail","Scavenger Trail","Survival structures","A regular scavenging route for organic matter and materials.",{food:28,water:18},["territory_marks"],["Scavenger route"],"fungoid",{organic_matter:55,materials:35},{perSecond:{organic_matter:0.28,materials:0.12}}),
    system("lookout_perch","Lookout Perch","Development","High-ground sentry behavior increases knowledge and safety.",{materials:26,knowledge:12},["thinking_cluster"],["Watchful behavior"],"avian",{knowledge:55,happiness:25},{perSecond:{knowledge:0.22,happiness:0.03}}),
    system("shell_growth","Shell Growth","Growth","Defensive body investment that increases survival but costs materials.",{food:30,materials:26,organic_matter:16},["burrow"],["Protective shell"],"molluscoid",{military_power:40,happiness:25},{perSecond:{military_power:0.18},consume:{materials:0.04}}),
    system("venom_glands","Venom Glands","Development","Specialized predation and defense.",{food:32,organic_matter:26,knowledge:14},["hunting_pack"],["Venomous lineage"],"toxoid",{military_power:55},{perSecond:{military_power:0.32},consume:{organic_matter:0.06}}),
    system("social_grooming","Social Grooming","Development","Cohesion behavior that boosts happiness and culture.",{food:28,water:20,culture:12},["kinship_bonds"],["Social bonding"],"mammalian",{culture:55,happiness:55},{perSecond:{culture:0.18,happiness:0.08}}),
    system("reef_shelter","Reef Shelter","Survival structures","Aquatic shelter that improves food, water, and culture.",{materials:32,organic_matter:22,water:20},["watering_path"],["Reef shelter"],"aquatic",{food:45,water:45,culture:30},{perSecond:{food:0.18,water:0.12,culture:0.08}}),
    system("fungal_mat","Fungal Mat","Growth","Symbiotic decomposer mat that turns organic matter into food.",{organic_matter:35,water:18},["symbiotic_gut"],["Decomposer mat"],"fungoid",{food:60,organic_matter:60},{perSecond:{food:0.34},consume:{organic_matter:0.1}}),
    system("display_grounds","Display Grounds","Development","Mating and intimidation displays improve culture and population growth.",{food:36,culture:18,materials:18},["mimicry_display"],["Display grounds"],"avian",{culture:65,happiness:45},{perSecond:{culture:0.24,happiness:0.04},populationGrowth:0.01})
  ].forEach(function(item){ addSystem("creature",item); });

  [
    tech("shell_patterning","Shell Patterning","survival",{knowledge:42,materials:24},["shell_growth"],{perSecond:{military_power:0.12,happiness:0.04}}),
    tech("ambush_behavior","Ambush Behavior","survival",{knowledge:44,food:28},["camouflage"],{perSecond:{food:0.18,military_power:0.12}}),
    tech("territorial_calls","Territorial Calls","thinking",{knowledge:48,culture:26},["proto_language"],{perSecond:{culture:0.2,happiness:0.06,military_power:0.06}}),
    tech("maternal_care","Maternal Care","growth",{knowledge:46,food:30,water:18},["kinship_bonds"],{populationGrowth:0.016,perSecond:{happiness:0.06}}),
    tech("tool_memory","Tool Memory","thinking",{knowledge:50,materials:30},["tool_grips"],{perSecond:{knowledge:0.18,materials:0.12}}),
    tech("migration_sense","Migration Sense","growth",{knowledge:52,food:24,water:24},["seasonal_memory"],{capacity:{food:45,water:45},score:18}),
    tech("poison_tolerance","Poison Tolerance","survival",{knowledge:54,organic_matter:28},["venom_glands"],{perSecond:{happiness:0.06,military_power:0.1}}),
    tech("proto_myth","Proto-Myth","thinking",{knowledge:60,culture:38},["territorial_calls"],{perSecond:{culture:0.34},score:28})
  ].forEach(function(item){ addTech("creature",item); });

  [
    system("fish_weir","Fish Weir","Buildings","Water-side food infrastructure.",{lumber:26,stone:14,water:18},["river_docks"],["Fishing structure"],"aquatic",{food:75},{perSecond:{food:0.36},consume:{wood:0.04}}),
    system("smokehouse","Smokehouse","Buildings","Preserves food using wood and labor.",{lumber:24,clay:18,food:18},["granary"],["Food preservation"],"mammalian",{food:85},{perSecond:{food:0.22},consume:{wood:0.06}}),
    system("drum_circle","Drum Circle","Buildings","Ritual communication and cultural synchronization.",{lumber:22,culture:18,faith:12},["totem_circle"],["Ritual rhythm"],"avian",{culture:70,faith:60},{perSecond:{culture:0.28,faith:0.12}}),
    system("stone_circle","Stone Circle","Buildings","Early astronomy, faith, and seasonal agriculture.",{stone:48,lumber:20,faith:20},["ancestor_rites"],["Seasonal monument"],"lithoid",{faith:80,science:60},{perSecond:{faith:0.22,science:0.16,food:0.08}}),
    system("slingers","Slingers","Units","Cheap ranged fighters that consume food.",{food:34,lumber:18,stone:26,military_power:16},["sling_drills"],["Ranged bands"],"reptilian",{military_power:90},{perSecond:{military_power:0.42},consume:{food:0.08,stone:0.04}}),
    system("canoe_builders","Canoe Builders","Units","Waterborne trade and food expansion.",{lumber:36,food:24,science:18},["river_docks"],["Canoe craft"],"aquatic",{food:65,luxury_total:65},{perSecond:{food:0.2,luxury_total:0.18},consume:{lumber:0.04}}),
    system("scribe_knots","Scribe Knots","Buildings","Record-keeping that improves science and culture.",{lumber:28,culture:24,science:18},["clan_law"],["Mnemonic records"],"humanoid",{science:80,culture:70},{perSecond:{science:0.24,culture:0.2}}),
    system("war_chief_retinue","War Chief Retinue","Units","Elite leadership guard with upkeep.",{food:42,lumber:32,military_power:34,faith:16},["skirmisher_band"],["War leadership"],"reptilian",{military_power:120,influence:40},{perSecond:{military_power:0.55},consume:{food:0.12,happiness:0.02}})
  ].forEach(function(item){ addSystem("tribal",item); });

  [
    tech("fish_traps","Fish Traps","agriculture",{science:52,lumber:24,water:20},["fish_weir"],{perSecond:{food:0.24}}),
    tech("smoked_meat","Smoked Meat","agriculture",{science:54,food:28,wood:18},["smokehouse"],{capacity:{food:60},perSecond:{food:0.12}}),
    tech("drum_signals","Drum Signals","spirituality",{science:56,culture:30,faith:18},["drum_circle"],{perSecond:{culture:0.2,faith:0.12,military_power:0.06}}),
    tech("celestial_markers","Celestial Markers","spirituality",{science:62,faith:30,stone:28},["stone_circle"],{perSecond:{science:0.18,faith:0.18,food:0.08}}),
    tech("canoe_routes","Canoe Routes","construction",{science:60,lumber:30,water:22},["canoe_builders"],{perSecond:{luxury_total:0.12,food:0.08}}),
    tech("battle_chants","Battle Chants","warfare",{science:64,culture:34,military_power:28},["war_chief_retinue"],{perSecond:{military_power:0.26,faith:0.08}}),
    tech("tally_records","Tally Records","crafting",{science:66,culture:34},["scribe_knots"],{perSecond:{science:0.24,culture:0.1}}),
    tech("seasonal_festivals","Seasonal Festivals","spirituality",{science:70,culture:42,faith:26},["celestial_markers"],{perSecond:{happiness:0.18,culture:0.18}})
  ].forEach(function(item){ addTech("tribal",item); });

  [
    system("theater_square","Theater Square","Institutions","Formal culture district generating tourism.",{production:110,culture:70,gold:35},["amphitheater"],["Civic arts"],"avian",{culture:170,tourism:120},{perSecond:{culture:0.65,tourism:0.3,happiness:0.06}}),
    system("embassy_quarter","Embassy Quarter","Institutions","Diplomatic district for formal relations.",{production:115,gold:60,culture:55},["courthouse"],["Diplomatic corps"],"humanoid",{diplomacy:140,influence:100},{perSecond:{diplomacy:0.55,influence:0.22}}),
    system("university","University","Institutions","A major science institution.",{production:135,gold:75,science:75},["academy"],["Higher learning"],"humanoid",{science:220},{perSecond:{science:1.05,culture:0.16},consume:{gold:0.06}}),
    system("watermill","Watermill","Infrastructure","Converts water access into production.",{production:90,lumber:45,water:35},["engineering"],["Powered milling"],"mammalian",{production:140},{perSecond:{production:0.55},consume:{water:0.06}}),
    system("iron_mine","Iron Mine","Infrastructure","Strategic extraction for military and industry.",{production:120,stone:50,gold:35},["masonry"],["Iron extraction"],"lithoid",{strategic_total:120,production:80},{perSecond:{strategic_total:0.22,production:0.12},consume:{happiness:0.02}}),
    system("merchant_guild","Merchant Guild","Infrastructure","Trade organization for gold, luxuries, and diplomacy.",{production:125,gold:80,luxury_total:35},["banking"],["Merchant class"],"molluscoid",{gold:220,diplomacy:90},{perSecond:{gold:0.85,luxury_total:0.18,diplomacy:0.16}}),
    system("cathedral","Cathedral","Institutions","Large faith and culture project.",{production:150,faith:90,culture:70},["organized_religion"],["Sacred architecture"],"fungoid",{faith:220,culture:160,tourism:90},{perSecond:{faith:0.85,culture:0.35,tourism:0.16}}),
    system("siege_workshop","Siege Workshop","Military","Consumes production to increase military power.",{production:145,lumber:60,strategic_total:30},["professional_army"],["Siege craft"],"arthropoid",{military_power:190},{perSecond:{military_power:0.72},consume:{production:0.14,lumber:0.04}})
  ].forEach(function(item){ addSystem("civilization",item); });

  [
    tech("drama_poetry","Drama and Poetry","culture",{science:120,culture:80},["theater_square"],{perSecond:{culture:0.34,tourism:0.22}}),
    tech("diplomatic_protocol","Diplomatic Protocol","government",{science:125,diplomacy:55,culture:55},["embassy_quarter"],{perSecond:{diplomacy:0.36,influence:0.14}}),
    tech("iron_working","Iron Working","military",{science:130,strategic_total:45},["iron_mine"],{perSecond:{military_power:0.32,production:0.14}}),
    tech("water_power","Water Power","industry",{science:135,water:45,production:60},["watermill"],{perSecond:{production:0.32}}),
    tech("guild_charters","Guild Charters","economics",{science:140,gold:90,diplomacy:45},["merchant_guild"],{perSecond:{gold:0.38,diplomacy:0.12}}),
    tech("scholasticism","Scholasticism","science",{science:145,faith:65,culture:55},["university","cathedral"],{perSecond:{science:0.42,faith:0.16}}),
    tech("siege_engineering","Siege Engineering","military",{science:150,production:80,military_power:65},["siege_workshop"],{perSecond:{military_power:0.42},consume:{production:0.04}}),
    tech("cartography","Cartography","science",{science:155,gold:70,diplomacy:50},["sailing"],{perSecond:{diplomacy:0.18,luxury_total:0.08,science:0.14}})
  ].forEach(function(item){ addTech("civilization",item); });

  [
    system("stock_exchange","Stock Exchange","Administration","Financial infrastructure for gold, diplomacy, and influence.",{production:210,gold:170,influence:90},["bureaucratic_archive"],["Capital markets"],"molluscoid",{gold:300,diplomacy:180},{perSecond:{gold:1.15,diplomacy:0.28,influence:0.16}}),
    system("tourism_board","Tourism Board","Administration","Turns culture and logistics into tourism.",{production:190,gold:130,culture:120},["radio_network"],["National tourism"],"avian",{tourism:260,culture:160},{perSecond:{tourism:0.75,culture:0.18},consume:{logistics:0.05}}),
    system("research_hospital","Research Hospital","Medicine","Medicine, science, and happiness infrastructure.",{production:210,gold:140,science:110},["public_health"],["Medical research"],"mammalian",{science:240,happiness:180},{perSecond:{science:0.75,happiness:0.18},populationGrowth:0.01}),
    system("tank_factory","Tank Factory","Military","Consumes strategic resources for military power.",{production:240,gold:160,strategic_total:90},["combined_arms"],["Armored industry"],"reptilian",{military_power:260},{perSecond:{military_power:1.0},consume:{strategic_total:0.16,production:0.08}}),
    system("international_port","International Port","Logistics","External trade and naval supply.",{production:220,gold:150,logistics:70},["naval_yards"],["Global port"],"aquatic",{logistics:250,diplomacy:140,luxury_total:180},{perSecond:{logistics:0.7,diplomacy:0.2,luxury_total:0.2}}),
    system("film_studio","Film Studio","Communications","Mass culture and tourism output.",{production:205,gold:150,culture:140},["mass_media"],["Film culture"],"humanoid",{culture:240,tourism:260},{perSecond:{culture:0.55,tourism:0.7},consume:{gold:0.08}}),
    system("space_agency","Space Agency","Aerospace","Pre-solar science, command, and prestige.",{production:260,gold:190,science:170},["flight"],["Space program"],"humanoid",{science:280,command:160,tourism:120},{perSecond:{science:0.65,command:0.25,tourism:0.12},score:80}),
    system("global_aid_office","Global Aid Office","Administration","Diplomacy and happiness through aid networks.",{production:195,gold:160,diplomacy:90},["stock_exchange"],["Aid diplomacy"],"mammalian",{diplomacy:230,happiness:160},{perSecond:{diplomacy:0.55,happiness:0.12},consume:{gold:0.1}})
  ].forEach(function(item){ addSystem("empire",item); });

  [
    tech("market_regulation","Market Regulation","economics",{science:210,gold:140,diplomacy:60},["stock_exchange"],{perSecond:{gold:0.32,happiness:0.08}}),
    tech("mass_tourism","Mass Tourism","communications",{science:215,tourism:90,culture:120},["tourism_board"],{perSecond:{tourism:0.45,culture:0.16}}),
    tech("antibiotics","Antibiotics","medicine",{science:220,gold:100},["research_hospital"],{perSecond:{happiness:0.18},populationGrowth:0.014}),
    tech("armored_warfare","Armored Warfare","military",{science:230,military_power:150,strategic_total:80},["tank_factory"],{perSecond:{military_power:0.55},consume:{strategic_total:0.06}}),
    tech("containerization","Containerization","transport",{science:225,logistics:120,gold:110},["international_port"],{perSecond:{logistics:0.5,gold:0.2}}),
    tech("cinema","Cinema","culture",{science:215,culture:150,gold:90},["film_studio"],{perSecond:{tourism:0.45,culture:0.2}}),
    tech("rocketry","Rocketry","aerospace",{science:260,production:160,energy:80},["space_agency"],{perSecond:{science:0.3,command:0.2},score:90}),
    tech("global_institutions","Global Institutions","government",{science:250,diplomacy:140,influence:120},["global_aid_office"],{perSecond:{diplomacy:0.45,influence:0.25,happiness:0.08}})
  ].forEach(function(item){ addTech("empire",item); });

  [
    system("lunar_city","Lunar City","Colonies","A major moon settlement supporting colonies and command.",{production:260,alloys:150,energy:120,colonies:60},["colony_shipyard"],["Lunar settlement"],"lithoid",{colonies:260,command:140},{perSecond:{colonies:0.45,command:0.18},consume:{energy:0.08}}),
    system("mars_arcology","Mars Arcology","Colonies","Large planetary settlement for food, culture, and happiness.",{production:300,alloys:180,water:130,colonies:90},["terraforming_array"],["Arcology colony"],"mammalian",{colonies:320,food:220,culture:160},{perSecond:{colonies:0.35,food:0.45,culture:0.18,happiness:0.08},consume:{water:0.1,energy:0.08}}),
    system("orbital_university","Orbital University","Infrastructure","Space research and data institution.",{production:250,alloys:130,science:160,data:80},["deep_space_telescope"],["Orbital research"],"humanoid",{science:320,data:180},{perSecond:{science:1.0,data:0.35},consume:{energy:0.08}}),
    system("solar_tourism_spokes","Solar Tourism Spokes","Infrastructure","Luxury travel through the home system.",{production:240,energy:120,luxury_total:120},["interplanetary_exchange"],["Space tourism"],"avian",{tourism:280,luxury_total:180},{perSecond:{tourism:0.65,luxury_total:0.22,happiness:0.08}}),
    system("marine_colony","Marine Colony","Colonies","Oceanic extraterrestrial habitats.",{production:260,water:180,energy:120,colonies:70},["ice_mining_station"],["Ocean colony"],"aquatic",{food:240,water:220,colonies:180},{perSecond:{food:0.45,water:0.25,colonies:0.16}}),
    system("fleet_academy","Fleet Academy","Military","Officer training for command and military power.",{production:270,alloys:150,command:80},["defense_grid"],["Fleet doctrine"],"reptilian",{command:260,military_power:260},{perSecond:{command:0.48,military_power:0.55},consume:{energy:0.08}}),
    system("nanoforge","Nanoforge","Infrastructure","High-efficiency alloy conversion.",{production:290,energy:170,strategic_total:120},["autonomous_mining"],["Nanofabrication"],"arthropoid",{alloys:320},{perSecond:{alloys:1.05},consume:{energy:0.18,strategic_total:0.1}}),
    system("solar_embassy","Solar Embassy","Colonies","Diplomatic institution for future interstellar relations.",{production:240,diplomacy:130,culture:130},["interplanetary_exchange"],["Solar diplomacy"],"humanoid",{diplomacy:280,influence:180},{perSecond:{diplomacy:0.55,influence:0.22,culture:0.14}})
  ].forEach(function(item){ addSystem("solar",item); });

  [
    tech("lunar_industry","Lunar Industry","colonization",{science:300,colonies:120,alloys:140},["lunar_city"],{perSecond:{production:0.35,colonies:0.12}}),
    tech("arcology_ecology","Arcology Ecology","terraforming",{science:310,colonies:130,food:120},["mars_arcology"],{perSecond:{food:0.34,happiness:0.12},populationGrowth:0.01}),
    tech("space_elevators","Space Elevators","orbital",{science:320,alloys:180,logistics:90},["orbital_construction"],{perSecond:{logistics:0.55,production:0.28}}),
    tech("solar_tourism","Solar Tourism","trade",{science:300,tourism:140,luxury_total:120},["solar_tourism_spokes"],{perSecond:{tourism:0.42,gold:0.2,happiness:0.06}}),
    tech("fleet_command_ai","Fleet Command AI","computing",{science:330,data:140,command:120},["fleet_academy"],{perSecond:{command:0.45,military_power:0.28},consume:{data:0.04}}),
    tech("nanomanufacturing","Nanomanufacturing","materials",{science:340,alloys:180,energy:160},["nanoforge"],{perSecond:{alloys:0.45,production:0.18}}),
    tech("interplanetary_law","Interplanetary Law","trade",{science:320,diplomacy:160,culture:110},["solar_embassy"],{perSecond:{diplomacy:0.38,influence:0.18,happiness:0.06}}),
    tech("generation_ships","Generation Ships","life_support",{science:360,food:160,water:160,colonies:120},["closed_loop_life_support"],{perSecond:{colonies:0.22},score:80})
  ].forEach(function(item){ addTech("solar",item); });

  [
    system("dark_matter_harvester","Dark Matter Harvester","Megastructures","Extracts rare matter from exotic stellar regions.",{energy:480,alloys:360,science:260},["stellar_lifter"],["Exotic extraction"],"extremophile",{rare_matter:300,energy:260},{perSecond:{rare_matter:0.7,energy:0.35},consume:{alloys:0.08}}),
    system("matrioshka_brain","Matrioshka Brain","Megastructures","Computational megastructure producing data and ascension.",{energy:560,alloys:420,data:300},["dyson_swarm","synthetic_mind"],["Stellar computation"],"humanoid",{data:520,ascension:320},{perSecond:{data:2.0,ascension:0.45},consume:{energy:0.28}}),
    system("birch_world_seed","Birch World Seed","Megastructures","Proto-gigastructure seed for final-scale habitation.",{energy:620,alloys:520,rare_matter:180},["ring_world_segment"],["Cosmic habitat"],"lithoid",{food:520,culture:380,ascension:260},{perSecond:{food:1.2,culture:0.42,ascension:0.22},populationGrowth:0.035}),
    system("galactic_university","Galactic University","Infrastructure","A multi-species research and culture network.",{science:420,data:260,culture:220},["science_nexus"],["Galactic academia"],"humanoid",{science:520,culture:360,diplomacy:220},{perSecond:{science:1.3,culture:0.42,diplomacy:0.18}}),
    system("xeno_preserve","Xeno Preserve","Infrastructure","Protects alien biospheres, culture, and diplomacy.",{food:360,culture:260,diplomacy:220},["xeno_integration"],["Biosphere preserve"],"plantoid",{culture:380,diplomacy:320,happiness:240},{perSecond:{culture:0.45,diplomacy:0.35,happiness:0.14}}),
    system("dimensional_lab","Dimensional Lab","Victory paths","Dangerous research into dimensional ascension.",{science:520,data:340,rare_matter:120},["dark_energy_taps"],["Dimensional science"],"toxoid",{ascension:360,rare_matter:240},{perSecond:{ascension:0.65,rare_matter:0.22},consume:{cohesion:0.08}}),
    system("galactic_peacekeepers","Galactic Peacekeepers","Military","Stabilizing military and diplomacy force.",{military_power:420,command:260,diplomacy:240},["fleet_minds"],["Peacekeeping fleets"],"mammalian",{military_power:520,cohesion:320},{perSecond:{military_power:0.8,cohesion:0.35,diplomacy:0.12},consume:{energy:0.12}}),
    system("culture_beacon_network","Culture Beacon Network","Infrastructure","Broadcasts culture, tourism, and cohesion.",{energy:420,culture:360,data:220},["cosmic_tourism"],["Culture beacons"],"avian",{culture:520,tourism:420,cohesion:260},{perSecond:{culture:0.85,tourism:0.75,cohesion:0.24},consume:{energy:0.1}})
  ].forEach(function(item){ addSystem("galactic",item); });

  [
    tech("dark_matter_physics","Dark Matter Physics","cosmology",{science:520,rare_matter:160,data:260},["dark_matter_harvester"],{perSecond:{rare_matter:0.28,science:0.4}}),
    tech("stellar_consciousness","Stellar Consciousness","consciousness",{science:540,data:360,ascension:160},["matrioshka_brain"],{perSecond:{ascension:0.55,data:0.45},score:180}),
    tech("gigastructure_planning","Gigastructure Planning","stellar",{science:560,alloys:420,rare_matter:160},["birch_world_seed"],{capacity:{energy:300,alloys:300,rare_matter:200},score:200}),
    tech("pan_galactic_curriculum","Pan-Galactic Curriculum","culture",{science:500,culture:340,diplomacy:220},["galactic_university"],{perSecond:{science:0.45,culture:0.4,diplomacy:0.16}}),
    tech("biosphere_rights","Biosphere Rights","ecology",{science:480,food:320,diplomacy:240},["xeno_preserve"],{perSecond:{happiness:0.18,cohesion:0.22,diplomacy:0.2}}),
    tech("dimensional_anchors","Dimensional Anchors","dimensional",{science:620,rare_matter:240,ascension:220},["dimensional_lab"],{perSecond:{ascension:0.55,cohesion:0.16},score:260}),
    tech("demilitarized_corridors","Demilitarized Corridors","governance",{science:500,diplomacy:340,command:180},["galactic_peacekeepers"],{perSecond:{cohesion:0.36,diplomacy:0.28,happiness:0.1}}),
    tech("mythic_broadcasts","Mythic Broadcasts","philosophy",{science:520,culture:420,faith:260},["culture_beacon_network"],{perSecond:{culture:0.5,faith:0.35,ascension:0.16}})
  ].forEach(function(item){ addTech("galactic",item); });

  ensureResource("biomass","Biomass","primary","creature",true);
  ensureResource("medicine","Medicine","primary","civilization",true);
  ensureResource("pollution","Pollution","primary","empire",true);
  ensureResource("terraforming","Terraforming","primary","solar",true);
  ensureResource("unity","Unity","primary","galactic",true);
  ["creature","tribal","civilization","empire","solar","galactic"].forEach(function(id){ ensureStageResource(id,"biomass"); });
  ["civilization","empire","solar","galactic"].forEach(function(id){ ensureStageResource(id,"medicine"); });
  ["empire","solar","galactic"].forEach(function(id){ ensureStageResource(id,"pollution"); });
  ["solar","galactic"].forEach(function(id){ ensureStageResource(id,"terraforming"); });
  ensureStageResource("galactic","unity");

  [
    system("centrosome","Centrosome","Core organelles","Microtubule organizing center for cleaner division and movement.",{atp:30,proteins:18,elements:12},["microtubules","nucleus"],["Organized division"],"humanoid",{proteins:35,atp:25},{populationGrowth:0.012,score:18}),
    system("basal_body","Basal Body","Assembly organelles","Anchors cilia and flagella for stronger mobility.",{atp:26,proteins:16,lipids:10},["cilia"],["Motility anchor"],"aquatic",{atp:30},{manualBonus:0.12,perSecond:{glucose:0.08}}),
    system("predatory_vacuole","Predatory Vacuole","Advanced organelles","Stores engulfed prey and turns it into proteins.",{atp:28,proteins:14,lipids:14},["pseudopodia","lysosome"],["Predatory digestion"],"reptilian",{proteins:45},{perSecond:{proteins:0.28},consume:{atp:0.06}}),
    system("silica_shell","Silica Shell","Advanced organelles","Mineralized shell for future lithoid and aquatic tendencies.",{atp:30,elements:22,proteins:12},["cell_wall","acidocalcisome"],["Silica armor"],"lithoid",{elements:50},{upkeepBonus:-0.03,score:20}),
    system("bioluminescent_granules","Bioluminescent Granules","Advanced organelles","Light-producing granules that support signaling and energy niches.",{atp:26,glucose:16,elements:14},["eyespot"],["Bioluminescence"],"avian",{atp:30,glucose:30},{perSecond:{atp:0.18},consume:{glucose:0.04},score:16}),
    system("slime_mold_network","Slime Mold Network","Advanced organelles","Networked behavior hinting at distributed intelligence.",{atp:32,glucose:20,proteins:14,lipids:12},["plasmodesmata","secretory_vesicles"],["Distributed sensing"],"fungoid",{glucose:45,proteins:35},{perSecond:{glucose:0.16,proteins:0.12},score:24})
  ].forEach(function(item){ addSystem("cell",item); });

  [
    system("fat_reserves","Fat Reserves","Growth","Stored biomass for survival during scarcity.",{food:38,organic_matter:26},["den_network"],["Stored energy"],"mammalian",{food:90,biomass:70},{perSecond:{biomass:0.22},consume:{food:0.06}}),
    system("pack_hierarchy","Pack Hierarchy","Development","Dominance and coordination increase culture and military power.",{food:40,culture:24,knowledge:24},["social_grooming"],["Pack leadership"],"mammalian",{culture:80,military_power:70},{perSecond:{culture:0.24,military_power:0.2,happiness:0.04}}),
    system("tool_cache","Tool Cache","Development","Repeated use creates a cache of simple tools.",{materials:42,knowledge:26},["tool_memory"],["Stored tools"],"humanoid",{materials:80,knowledge:60},{perSecond:{materials:0.18,knowledge:0.18}}),
    system("territorial_border","Territorial Border","Survival structures","Protected range increases resources but costs military vigilance.",{materials:44,food:30,military_power:18},["pack_hierarchy"],["Territorial border"],"reptilian",{food:80,water:60},{perSecond:{food:0.26,water:0.12},consume:{military_power:0.06}}),
    system("proto_fire_site","Proto-Fire Site","Development","A controlled fire site bridges creature and tribal culture.",{materials:48,organic_matter:30,knowledge:34},["fire_fear","tool_cache"],["Fire memory"],"humanoid",{culture:90,knowledge:80},{perSecond:{culture:0.28,knowledge:0.18,happiness:0.04},score:32}),
    system("migration_moot","Migration Moot","Growth","Group decision site for seasonal movement.",{food:44,water:38,culture:26},["migration_paths","proto_language"],["Migration council"],"aquatic",{culture:80,biomass:60},{perSecond:{culture:0.18,biomass:0.12},populationGrowth:0.012})
  ].forEach(function(item){ addSystem("creature",item); });

  [
    tech("fat_metabolism","Fat Metabolism","growth",{knowledge:64,biomass:30,food:30},["fat_reserves"],{capacity:{food:60,biomass:60},perSecond:{food:0.08}}),
    tech("dominance_rituals","Dominance Rituals","thinking",{knowledge:66,culture:42},["pack_hierarchy"],{perSecond:{culture:0.18,military_power:0.12}}),
    tech("fire_carrying","Fire Carrying","thinking",{knowledge:74,materials:38,culture:30},["proto_fire_site"],{perSecond:{culture:0.24,happiness:0.08},score:32}),
    tech("range_mapping","Range Mapping","growth",{knowledge:70,food:38,water:28},["territorial_border"],{perSecond:{knowledge:0.18,food:0.12}}),
    tech("ritual_migration","Ritual Migration","thinking",{knowledge:76,culture:46,biomass:24},["migration_moot"],{perSecond:{culture:0.2,happiness:0.08},populationGrowth:0.01}),
    tech("tool_teaching","Tool Teaching","thinking",{knowledge:78,materials:44,culture:34},["tool_cache"],{perSecond:{knowledge:0.28,materials:0.1}})
  ].forEach(function(item){ addTech("creature",item); });

  [
    system("medicine_woman_lodge","Medicine Lodge","Buildings","Early medicine and faith building.",{lumber:34,faith:24,biomass:20},["healer_hut"],["Medicine tradition"],"plantoid",{medicine:60,faith:70},{perSecond:{medicine:0.2,faith:0.14,happiness:0.08}}),
    system("charcoal_pit","Charcoal Pit","Buildings","Converts wood into production support and pollution pressure.",{wood:42,lumber:24,clay:18},["clay_kiln"],["Charcoal burning"],"toxoid",{production:60},{perSecond:{production:0.28,pollution:0.04},consume:{wood:0.14}}),
    system("loom_house","Loom House","Buildings","Textiles create culture, luxury, and trade goods.",{lumber:34,culture:28,biomass:18},["weaving"],["Textile craft"],"molluscoid",{luxury_total:90,culture:80},{perSecond:{luxury_total:0.2,culture:0.18},consume:{biomass:0.04}}),
    system("copper_spearmen","Copper Spearmen","Units","Strategic-resource soldiers with food upkeep.",{food:44,lumber:30,strategic_total:24,military_power:26},["copper_tools"],["Copper arms"],"reptilian",{military_power:140},{perSecond:{military_power:0.58},consume:{food:0.12,strategic_total:0.04}}),
    system("grain_fields","Grain Fields","Buildings","Large early agricultural base.",{lumber:36,water:28,food:24},["irrigated_plots"],["Grain agriculture"],"mammalian",{food:120},{perSecond:{food:0.5},consume:{water:0.08}}),
    system("story_hall","Story Hall","Buildings","A shared memory site for culture, faith, and proto-tourism.",{lumber:38,culture:34,faith:20},["seasonal_festivals"],["Story tradition"],"humanoid",{culture:110,faith:80,tourism:40},{perSecond:{culture:0.32,faith:0.12,tourism:0.04}})
  ].forEach(function(item){ addSystem("tribal",item); });

  [
    tech("charcoal_firing","Charcoal Firing","crafting",{science:76,wood:42,clay:24},["charcoal_pit"],{perSecond:{production:0.18,pollution:0.03}}),
    tech("folk_medicine","Folk Medicine","spirituality",{science:78,medicine:28,faith:30},["medicine_woman_lodge"],{perSecond:{medicine:0.18,happiness:0.1}}),
    tech("textile_patterns","Textile Patterns","crafting",{science:80,luxury_total:40,culture:38},["loom_house"],{perSecond:{luxury_total:0.14,culture:0.16}}),
    tech("shield_wall","Shield Wall","warfare",{science:84,military_power:52,strategic_total:28},["copper_spearmen"],{perSecond:{military_power:0.32},consume:{food:0.04}}),
    tech("grain_rotation","Grain Rotation","agriculture",{science:82,food:44,water:30},["grain_fields"],{perSecond:{food:0.28},capacity:{food:80}}),
    tech("oral_epics","Oral Epics","spirituality",{science:88,culture:58,faith:34},["story_hall"],{perSecond:{culture:0.28,faith:0.12,tourism:0.06}})
  ].forEach(function(item){ addTech("tribal",item); });

  [
    system("apothecary","Apothecary","Institutions","Medicine production and happiness support.",{production:130,medicine:40,gold:45},["city_center"],["Apothecary craft"],"plantoid",{medicine:130,happiness:80},{perSecond:{medicine:0.42,happiness:0.1},consume:{gold:0.04}}),
    system("public_baths","Public Baths","Infrastructure","Water and medicine support urban happiness.",{production:135,water:60,medicine:45},["aqueduct"],["Public hygiene"],"aquatic",{happiness:160,medicine:110},{perSecond:{happiness:0.22,medicine:0.12},consume:{water:0.08}}),
    system("paper_mill","Paper Mill","Infrastructure","Converts lumber and water into science and culture.",{production:130,lumber:70,water:45},["water_power"],["Paper production"],"humanoid",{science:160,culture:120},{perSecond:{science:0.38,culture:0.18},consume:{lumber:0.08,water:0.04}}),
    system("diplomatic_mission","Diplomatic Mission","Institutions","Early permanent foreign mission.",{production:140,diplomacy:60,gold:65},["diplomatic_protocol"],["Foreign mission"],"molluscoid",{diplomacy:190,influence:120},{perSecond:{diplomacy:0.5,influence:0.18}}),
    system("pilgrimage_site","Pilgrimage Site","Institutions","Faith and tourism location.",{production:150,faith:100,culture:70},["cathedral"],["Sacred travel"],"fungoid",{faith:240,tourism:180},{perSecond:{faith:0.6,tourism:0.38,culture:0.14}}),
    system("knight_order","Knight Order","Military","Faith-backed military unit with upkeep.",{production:160,faith:80,military_power:80},["professional_army"],["Holy order"],"reptilian",{military_power:230,faith:120},{perSecond:{military_power:0.68,faith:0.08},consume:{food:0.12,gold:0.08}})
  ].forEach(function(item){ addSystem("civilization",item); });

  [
    tech("public_hygiene","Public Hygiene","agriculture",{science:165,medicine:70,water:50},["public_baths"],{perSecond:{medicine:0.18,happiness:0.18},populationGrowth:0.008}),
    tech("paper","Paper","science",{science:170,lumber:80,water:50},["paper_mill"],{perSecond:{science:0.36,culture:0.14}}),
    tech("envoys","Envoys","government",{science:172,diplomacy:90,gold:70},["diplomatic_mission"],{perSecond:{diplomacy:0.32,influence:0.12}}),
    tech("pilgrimage_routes","Pilgrimage Routes","culture",{science:176,faith:100,tourism:60},["pilgrimage_site"],{perSecond:{tourism:0.26,faith:0.18,gold:0.1}}),
    tech("chivalry","Chivalry","military",{science:180,faith:80,military_power:100},["knight_order"],{perSecond:{military_power:0.34,culture:0.08}}),
    tech("alchemy","Alchemy","science",{science:185,medicine:90,strategic_total:40},["apothecary"],{perSecond:{science:0.22,medicine:0.18}})
  ].forEach(function(item){ addTech("civilization",item); });

  [
    system("sewage_network","Sewage Network","Medicine","Urban sanitation at regional scale.",{production:230,gold:150,medicine:100},["research_hospital"],["Sanitation"],"aquatic",{medicine:260,happiness:230},{perSecond:{medicine:0.45,happiness:0.24},consume:{production:0.06}}),
    system("environment_agency","Environment Agency","Administration","Reduces pollution while producing diplomacy.",{production:220,gold:160,diplomacy:100},["global_aid_office"],["Environmental regulation"],"plantoid",{diplomacy:260,happiness:180},{perSecond:{diplomacy:0.32,happiness:0.12},consume:{pollution:0.18}}),
    system("computer_lab","Computer Lab","Institutions","Early computing for science and logistics.",{production:240,science:160,energy:90},["space_agency"],["Computing lab"],"humanoid",{science:320,data:160,logistics:120},{perSecond:{science:0.75,data:0.3,logistics:0.18},consume:{energy:0.08}}),
    system("nuclear_program","Nuclear Program","Energy","High energy and military output with pollution pressure.",{production:280,science:180,strategic_total:120},["electrification"],["Nuclear program"],"lithoid",{energy:320,military_power:180},{perSecond:{energy:1.2,military_power:0.28,pollution:0.08},consume:{strategic_total:0.12}}),
    system("international_court","International Court","Administration","Diplomacy and cohesion-like stability before Galactic scale.",{production:230,diplomacy:160,culture:120},["global_institutions"],["International law"],"humanoid",{diplomacy:340,influence:220},{perSecond:{diplomacy:0.75,influence:0.18,happiness:0.08}}),
    system("satellite_network","Satellite Network","Aerospace","Global command, data, and logistics.",{production:300,energy:150,science:160},["rocketry"],["Orbital satellites"],"avian",{data:240,command:180,logistics:200},{perSecond:{data:0.55,command:0.28,logistics:0.32},consume:{energy:0.1}})
  ].forEach(function(item){ addSystem("empire",item); });

  [
    tech("environmental_law","Environmental Law","government",{science:260,diplomacy:150,pollution:60},["environment_agency"],{perSecond:{happiness:0.16,diplomacy:0.18},consume:{pollution:0.12}}),
    tech("mainframes","Mainframes","science",{science:270,data:100,energy:100},["computer_lab"],{perSecond:{data:0.42,science:0.22}}),
    tech("nuclear_power","Nuclear Power","energy",{science:290,energy:160,strategic_total:100},["nuclear_program"],{perSecond:{energy:0.7,pollution:0.04}}),
    tech("human_rights","Human Rights","government",{science:275,diplomacy:180,culture:160},["international_court"],{perSecond:{diplomacy:0.32,happiness:0.16}}),
    tech("satellite_navigation","Satellite Navigation","aerospace",{science:300,data:140,command:80},["satellite_network"],{perSecond:{logistics:0.4,command:0.18}}),
    tech("clean_water_act","Clean Water Act","medicine",{science:280,medicine:140,diplomacy:90},["sewage_network"],{perSecond:{medicine:0.24,happiness:0.18},consume:{pollution:0.08}})
  ].forEach(function(item){ addTech("empire",item); });

  [
    system("orbital_hospital","Orbital Hospital","Colonies","Space medicine and population stability.",{production:280,medicine:160,energy:120},["orbital_habitat"],["Orbital medicine"],"mammalian",{medicine:320,happiness:240},{perSecond:{medicine:0.65,happiness:0.18},populationGrowth:0.012}),
    system("terraforming_lattice","Terraforming Lattice","Colonies","Turns energy, water, and science into terraforming progress.",{production:340,energy:220,science:180},["terraforming_protocols"],["Terraforming lattice"],"plantoid",{terraforming:340,colonies:220},{perSecond:{terraforming:0.8,colonies:0.18},consume:{energy:0.16,water:0.08}}),
    system("venus_cloud_city","Venus Cloud City","Colonies","High-atmosphere settlement with tourism and science.",{production:320,alloys:190,energy:170},["terraforming_lattice"],["Cloud colony"],"avian",{colonies:260,tourism:240,science:180},{perSecond:{colonies:0.24,tourism:0.45,science:0.24},consume:{energy:0.12}}),
    system("kuiper_observatory","Kuiper Observatory","Infrastructure","Outer-system science and rare resource scouting.",{production:310,alloys:180,data:140},["quantum_navigation"],["Outer observatory"],"extremophile",{science:300,data:240,rare_matter:80},{perSecond:{science:0.75,data:0.38,rare_matter:0.06}}),
    system("diplomatic_relay","Diplomatic Relay","Infrastructure","Solar-wide diplomacy and future first-contact readiness.",{production:290,diplomacy:180,data:120},["solar_embassy"],["Diplomatic relay"],"humanoid",{diplomacy:340,influence:230},{perSecond:{diplomacy:0.65,influence:0.24,culture:0.1}}),
    system("autonomous_shipyard","Autonomous Shipyard","Military","Automated fleet and colony-ship production.",{production:360,alloys:240,data:150},["fleet_command_ai"],["Autonomous shipbuilding"],"arthropoid",{military_power:330,command:260,colonies:180},{perSecond:{military_power:0.75,command:0.35,colonies:0.18},consume:{alloys:0.12,energy:0.08}})
  ].forEach(function(item){ addSystem("solar",item); });

  [
    tech("orbital_medicine","Orbital Medicine","biology",{science:360,medicine:180,energy:120},["orbital_hospital"],{perSecond:{medicine:0.35,happiness:0.12},populationGrowth:0.012}),
    tech("atmospheric_habitats","Atmospheric Habitats","colonization",{science:380,terraforming:140,alloys:180},["venus_cloud_city"],{perSecond:{colonies:0.22,tourism:0.2}}),
    tech("outer_system_survey","Outer-System Survey","astrophysics",{science:390,data:180,energy:160},["kuiper_observatory"],{perSecond:{science:0.3,data:0.24,rare_matter:0.06}}),
    tech("first_contact_protocols","First Contact Protocols","communications",{science:370,diplomacy:220,culture:160},["diplomatic_relay"],{perSecond:{diplomacy:0.42,influence:0.18}}),
    tech("autonomous_fleets","Autonomous Fleets","automation",{science:400,data:220,command:160},["autonomous_shipyard"],{perSecond:{command:0.4,military_power:0.34},consume:{data:0.05}}),
    tech("planetary_gardens","Planetary Gardens","terraforming",{science:410,terraforming:220,food:180},["terraforming_lattice"],{perSecond:{food:0.34,happiness:0.18,terraforming:0.14}})
  ].forEach(function(item){ addTech("solar",item); });

  [
    system("unity_synod","Unity Synod","Galactic core","Spiritual-political forum producing unity and cohesion.",{faith:420,diplomacy:340,culture:320},["federation_council"],["Unity forum"],"fungoid",{unity:380,cohesion:340,faith:280},{perSecond:{unity:0.75,cohesion:0.35,faith:0.22}}),
    system("rare_matter_exchange","Rare Matter Exchange","Infrastructure","Market for rare matter, gold, and diplomacy.",{rare_matter:220,gold:420,diplomacy:320},["galactic_market"],["Rare matter market"],"molluscoid",{rare_matter:360,gold:420,diplomacy:300},{perSecond:{gold:1.0,diplomacy:0.32},consume:{rare_matter:0.08}}),
    system("hyperlane_garden","Hyperlane Garden","Infrastructure","Ecological restoration around galactic routes.",{terraforming:340,energy:420,rare_matter:160},["biosphere_rights"],["Hyper-ecology"],"plantoid",{cohesion:360,happiness:300,unity:220},{perSecond:{cohesion:0.38,happiness:0.2,unity:0.18},consume:{energy:0.12}}),
    system("memory_of_origin","Memory of Origin","Victory paths","A memorial megastructure linking the first cell to galactic identity.",{culture:520,faith:360,data:300},["transcendent_synthesis"],["Origin memory"],"humanoid",{ascension:420,unity:360,culture:380},{perSecond:{ascension:0.72,unity:0.42,culture:0.28},score:320}),
    system("dimensional_refuge","Dimensional Refuge","Megastructures","Emergency refuge against endgame crises.",{rare_matter:300,energy:520,cohesion:260},["dimensional_anchors"],["Dimensional refuge"],"extremophile",{happiness:420,cohesion:380,ascension:260},{perSecond:{happiness:0.28,cohesion:0.3,ascension:0.22},consume:{rare_matter:0.1}}),
    system("cosmic_mediation_fleet","Cosmic Mediation Fleet","Military","Command-heavy force that creates diplomacy and reduces instability.",{command:360,military_power:460,diplomacy:300},["demilitarized_corridors"],["Mediation fleets"],"mammalian",{diplomacy:420,cohesion:320,military_power:360},{perSecond:{diplomacy:0.45,cohesion:0.28,military_power:0.32},consume:{energy:0.14}})
  ].forEach(function(item){ addSystem("galactic",item); });

  [
    tech("unity_doctrine","Unity Doctrine","governance",{science:560,unity:180,diplomacy:320},["unity_synod"],{perSecond:{unity:0.38,cohesion:0.24}}),
    tech("exotic_trade_law","Exotic Trade Law","trade",{science:560,rare_matter:220,gold:360},["rare_matter_exchange"],{perSecond:{gold:0.45,diplomacy:0.2}}),
    tech("hyper_ecology","Hyper-Ecology","ecology",{science:580,terraforming:260,cohesion:220},["hyperlane_garden"],{perSecond:{cohesion:0.3,happiness:0.18,unity:0.12}}),
    tech("origin_myth_engineering","Origin Myth Engineering","philosophy",{science:620,culture:460,unity:260},["memory_of_origin"],{perSecond:{ascension:0.38,unity:0.32},score:240}),
    tech("refuge_protocols","Refuge Protocols","dimensional",{science:640,rare_matter:260,cohesion:260},["dimensional_refuge"],{perSecond:{cohesion:0.32,happiness:0.18},score:180}),
    tech("peacekeeper_mandate","Peacekeeper Mandate","military",{science:590,diplomacy:360,command:240},["cosmic_mediation_fleet"],{perSecond:{diplomacy:0.3,cohesion:0.22,military_power:0.18}})
  ].forEach(function(item){ addTech("galactic",item); });

  [
    system("microtubules","Microtubules","Core organelles","Internal scaffolding that supports movement, division, and more complex shape.",{atp:22,proteins:14,elements:8},["nucleus"],["Cytoskeletal frame"],"mammalian",{proteins:25,atp:20},{manualBonus:0.08,score:10}),
    system("microfilaments","Microfilaments","Core organelles","Flexible actin-like strands for shape changes and engulfing behavior.",{atp:20,proteins:12,lipids:8},["nucleus"],["Flexible frame"],"molluscoid",{proteins:20,lipids:20},{manualBonus:0.1}),
    system("intermediate_filaments","Intermediate Filaments","Core organelles","Durable fibers that help the cell resist stress and rupture.",{atp:22,proteins:16,elements:8},["microtubules"],["Stress fibers"],"lithoid",{proteins:30,elements:20},{upkeepBonus:-0.012,score:10}),
    system("plasmodesmata","Plasmodesmata","Advanced organelles","Tiny channels between hardened cells that support plantlike cooperation.",{atp:28,glucose:14,proteins:14,elements:12},["cell_wall","secretory_vesicles"],["Cell channels"],"plantoid",{glucose:35,proteins:20},{perSecond:{glucose:0.12,proteins:0.04}}),
    system("symbiosome","Symbiosome","Advanced organelles","A protected pocket for captured partners, pushing toward cooperative metabolism.",{atp:30,glucose:16,proteins:14,lipids:14},["endosome","nucleus"],["Internal symbiosis"],"fungoid",{glucose:35,proteins:35},{perSecond:{glucose:0.12,proteins:0.1},score:16}),
    system("toxin_vacuole","Toxin Vacuole","Advanced organelles","Stores harmful compounds for defense and chemical survival.",{atp:26,proteins:12,lipids:12,elements:16},["peroxisome","vacuole"],["Toxin storage"],"toxoid",{elements:35,lipids:20},{perSecond:{elements:0.08},score:18}),
    system("pressure_capsule","Pressure Capsule","Advanced organelles","Reinforced compartment for extreme pressure and temperature survival.",{atp:30,proteins:14,lipids:12,elements:20},["acidocalcisome","intermediate_filaments"],["Pressure survival"],"extremophile",{atp:30,elements:40},{upkeepBonus:-0.02,score:18}),
    system("neural_vesicles","Neural Vesicles","Advanced organelles","Proto-signaling vesicles that foreshadow coordinated sensory systems.",{atp:32,proteins:18,lipids:14,elements:12},["secretory_vesicles","chemoreceptors"],["Proto-neural signals"],"humanoid",{proteins:30,elements:25},{perSecond:{proteins:0.08},score:24})
  ].forEach(function(item){ addSystem("cell",item); });

  [
    system("sensory_pits","Sensory Pits","Development","Specialized pits improve threat detection and environmental memory.",{food:34,water:24,knowledge:18},["thinking_cluster"],["Threat sensing"],"reptilian",{knowledge:55},{perSecond:{knowledge:0.18,military_power:0.08}}),
    system("wing_membrane","Wing Membrane","Growth","Gliding structures open aerial food routes and display behavior.",{food:42,materials:28,organic_matter:24},["mimicry_display"],["Gliding membrane"],"avian",{food:55,culture:45},{perSecond:{food:0.18,culture:0.16},score:20}),
    system("chitin_plates","Chitin Plates","Survival structures","External armor supports arthropod-like defense and modular growth.",{food:38,materials:34,organic_matter:24},["burrow"],["Chitin armor"],"arthropoid",{materials:80,military_power:50},{perSecond:{materials:0.16,military_power:0.12}}),
    system("mantle_fold","Mantle Fold","Growth","A soft tissue fold supports shell, filtration, and aquatic specialization.",{food:36,water:30,organic_matter:24},["migration_paths"],["Mantle tissue"],"molluscoid",{water:70,organic_matter:50},{perSecond:{water:0.18,organic_matter:0.12}}),
    system("spore_bed","Spore Bed","Growth","Dormant reproductive structures support fungoid and necroid survival routes.",{food:34,organic_matter:36,knowledge:14},["symbiotic_gut"],["Spore cycle"],"fungoid",{organic_matter:90,biomass:60},{perSecond:{organic_matter:0.18,biomass:0.12},populationGrowth:0.012}),
    system("stone_gizzard","Stone Gizzard","Survival structures","Mineral grinding improves digestion and hardens later lithoid tendencies.",{food:40,materials:34,organic_matter:20},["bone_cache"],["Mineral digestion"],"lithoid",{materials:80,food:60},{perSecond:{food:0.18,materials:0.18}}),
    system("venom_sacs","Venom Sacs","Survival structures","Toxin storage gives predation and defense a chemical edge.",{food:42,organic_matter:28,knowledge:18},["sensory_pits"],["Venom glands"],"toxoid",{military_power:70,organic_matter:50},{perSecond:{military_power:0.22},consume:{organic_matter:0.04}}),
    system("thermal_burrow","Thermal Burrow","Growth","Extreme shelter lets the species survive hostile temperature swings.",{materials:46,food:32,knowledge:20},["burrow","torpor_reflex"],["Thermal refuge"],"extremophile",{food:60,materials:70},{upkeepBonus:-0.025,score:22})
  ].forEach(function(item){ addSystem("creature",item); });

  [
    tech("tracking_instinct","Tracking Instinct","survival",{knowledge:42,food:24},["sensory_pits"],{perSecond:{food:0.16,knowledge:0.08}}),
    tech("gliding_leap","Gliding Leap","growth",{knowledge:46,culture:24,food:20},["wing_membrane"],{perSecond:{food:0.12,culture:0.14},score:16}),
    tech("molting_cycles","Molting Cycles","growth",{knowledge:44,materials:24,biomass:18},["chitin_plates"],{capacity:{materials:45,biomass:35},populationGrowth:0.01}),
    tech("venom_memory","Venom Memory","survival",{knowledge:48,organic_matter:28,military_power:16},["venom_sacs"],{perSecond:{military_power:0.16},score:18})
  ].forEach(function(item){ addTech("creature",item); });

  [
    system("herbalist_garden","Herbalist Garden","Buildings","Cultivated medicine, food, and faith from early plant knowledge.",{wood:36,water:24,faith:18},["shrine"],["Herbal practice"],"plantoid",{medicine:60,food:60},{perSecond:{medicine:0.16,food:0.16,faith:0.04}}),
    system("fish_weir","Fish Weir","Buildings","A river trap that provides food while reinforcing water infrastructure.",{wood:34,stone:18,water:20},["well"],["River harvest"],"aquatic",{food:90,water:40},{perSecond:{food:0.36},consume:{water:0.02}}),
    system("smokehouse","Smokehouse","Buildings","Preserves food into biomass and softens early spoilage pressure.",{wood:42,food:32,clay:18},["granary"],["Food preservation"],"mammalian",{food:80,biomass:80},{perSecond:{biomass:0.2},consume:{food:0.06}}),
    system("obsidian_knappers","Obsidian Knappers","Buildings","Sharp volcanic tools improve military and production.",{stone:42,wood:24,science:16},["workshop"],["Volcanic tools"],"reptilian",{military_power:80,production:40},{perSecond:{military_power:0.24,production:0.08}}),
    system("river_barges","River Barges","Infrastructure","Water transport moves lumber, clay, and food between settlements.",{wood:48,lumber:32,water:24},["sawmill"],["River logistics"],"molluscoid",{lumber:90,food:60},{perSecond:{lumber:0.18,food:0.1},consume:{wood:0.05}}),
    system("totem_carvers","Totem Carvers","Buildings","Cultural specialists convert lumber and faith into identity.",{lumber:38,culture:28,faith:20},["shrine"],["Totem craft"],"avian",{culture:95,faith:70},{perSecond:{culture:0.28,faith:0.1},consume:{lumber:0.04}})
  ].forEach(function(item){ addSystem("tribal",item); });

  [
    tech("smoked_rations","Smoked Rations","agriculture",{science:72,biomass:28,food:34},["smokehouse"],{capacity:{food:60,biomass:60},perSecond:{food:0.08}}),
    tech("river_navigation","River Navigation","crafting",{science:76,lumber:42,water:30},["river_barges"],{perSecond:{lumber:0.16,culture:0.06}}),
    tech("herbal_lore","Herbal Lore","spirituality",{science:78,medicine:24,faith:28},["herbalist_garden"],{perSecond:{medicine:0.14,happiness:0.08}}),
    tech("obsidian_edges","Obsidian Edges","warfare",{science:80,stone:40,military_power:26},["obsidian_knappers"],{perSecond:{military_power:0.18,production:0.06}})
  ].forEach(function(item){ addTech("tribal",item); });

  [
    system("canal_network","Canal Network","Infrastructure","Canals move food, water, production, and trade through cities.",{production:150,water:80,gold:70},["aqueduct"],["Canal logistics"],"molluscoid",{food:140,water:120,gold:80},{perSecond:{food:0.32,gold:0.2},consume:{water:0.06}}),
    system("botanical_college","Botanical College","Institutions","Medicine, science, and food research from cultivated biodiversity.",{production:145,medicine:55,science:70},["apothecary"],["Botanical science"],"plantoid",{medicine:170,science:150},{perSecond:{medicine:0.32,science:0.28,food:0.1}}),
    system("mint","Mint","Economics","Standardized coinage increases gold, diplomacy, and tax reach.",{production:150,gold:100,culture:50},["market"],["Coinage"],"humanoid",{gold:180,diplomacy:80},{perSecond:{gold:0.62,diplomacy:0.08}}),
    system("public_forum","Public Forum","Government","A durable political space for culture, law, and influence.",{production:150,culture:90,gold:60},["library"],["Public debate"],"mammalian",{culture:170,influence:100},{perSecond:{culture:0.34,influence:0.16,happiness:0.08}}),
    system("siege_foundry","Siege Foundry","Military","Heavy workshops convert production and strategic resources into military power.",{production:180,strategic_total:70,gold:70},["barracks"],["Siege craft"],"arthropoid",{military_power:220,production:90},{perSecond:{military_power:0.66},consume:{production:0.08,strategic_total:0.04}})
  ].forEach(function(item){ addSystem("civilization",item); });

  [
    tech("civil_engineering","Civil Engineering","industry",{science:175,production:100,water:50},["canal_network"],{perSecond:{production:0.28,water:0.08}}),
    tech("coinage_law","Coinage Law","economics",{science:170,gold:120},["mint"],{perSecond:{gold:0.32,diplomacy:0.1}}),
    tech("public_rhetoric","Public Rhetoric","government",{science:180,culture:120,influence:60},["public_forum"],{perSecond:{culture:0.26,influence:0.16}}),
    tech("botanical_medicine","Botanical Medicine","science",{science:185,medicine:120,food:80},["botanical_college"],{perSecond:{medicine:0.24,happiness:0.12}})
  ].forEach(function(item){ addTech("civilization",item); });

  [
    system("postal_service","Postal Service","Administration","Reliable communication raises logistics, cohesion, and taxation.",{production:240,gold:160,culture:100},["provincial_admin"],["Postal routes"],"humanoid",{logistics:260,influence:180},{perSecond:{logistics:0.55,influence:0.22,gold:0.18}}),
    system("steel_mill","Steel Mill","Industry","Industrial production with pollution and strategic throughput.",{production:260,strategic_total:120,energy:80},["factory_district"],["Steel industry"],"arthropoid",{production:300,strategic_total:120},{perSecond:{production:1.1,strategic_total:0.12,pollution:0.08},consume:{energy:0.1}}),
    system("public_health_bureau","Public Health Bureau","Medicine","Empire-wide public medicine and sanitation coordination.",{production:230,medicine:130,gold:120},["provincial_admin"],["Public health"],"mammalian",{medicine:280,happiness:210},{perSecond:{medicine:0.46,happiness:0.18},consume:{gold:0.06}}),
    system("spy_network","Spy Network","Administration","Information channels produce influence and military readiness.",{gold:180,influence:120,culture:80},["telegraph_network"],["Intelligence"],"toxoid",{influence:250,military_power:160},{perSecond:{influence:0.36,military_power:0.2},consume:{gold:0.05}}),
    system("national_parks","National Parks","Administration","Preserves ecosystems, tourism, and happiness while offsetting pollution.",{production:220,culture:160,diplomacy:100},["environment_agency"],["Protected land"],"plantoid",{tourism:260,happiness:220},{perSecond:{tourism:0.5,happiness:0.2},consume:{pollution:0.12}})
  ].forEach(function(item){ addSystem("empire",item); });

  [
    tech("postal_codes","Postal Codes","communications",{science:255,logistics:120,gold:90},["postal_service"],{perSecond:{logistics:0.32,influence:0.1}}),
    tech("basic_steel","Basic Steel","industry",{science:270,production:160,strategic_total:80},["steel_mill"],{perSecond:{production:0.45,pollution:0.03}}),
    tech("vaccination_campaigns","Vaccination Campaigns","medicine",{science:275,medicine:140,gold:80},["public_health_bureau"],{perSecond:{medicine:0.24,happiness:0.16},populationGrowth:0.008}),
    tech("counterintelligence","Counterintelligence","communications",{science:280,influence:160,military_power:80},["spy_network"],{perSecond:{influence:0.2,military_power:0.14}})
  ].forEach(function(item){ addTech("empire",item); });

  [
    system("lunar_foundry","Lunar Foundry","Infrastructure","Low-gravity industry converts alloys and energy into production.",{production:360,alloys:240,energy:180},["asteroid_mines"],["Lunar industry"],"lithoid",{production:380,alloys:220},{perSecond:{production:1.0,alloys:0.35},consume:{energy:0.16}}),
    system("orbital_farms","Orbital Farms","Colonies","Hydroponic stations feed colonies and stabilize happiness.",{production:320,water:180,energy:150},["orbital_habitat"],["Orbital agriculture"],"plantoid",{food:360,water:180},{perSecond:{food:0.8,happiness:0.12},consume:{water:0.08,energy:0.08}}),
    system("fleet_academy","Fleet Academy","Military","Command schools improve fleets, logistics, and culture.",{production:340,command:180,culture:140},["shipyard_ring"],["Fleet doctrine"],"reptilian",{command:320,military_power:260},{perSecond:{command:0.52,military_power:0.32,culture:0.08}}),
    system("xeno_embassy","Xeno Embassy","Infrastructure","First-contact institutions prepare diplomacy before the galactic layer.",{production:330,diplomacy:220,data:120},["diplomatic_relay"],["Xeno diplomacy"],"molluscoid",{diplomacy:360,influence:220},{perSecond:{diplomacy:0.7,influence:0.22,culture:0.08}}),
    system("climate_mirrors","Climate Mirrors","Colonies","Orbital mirrors push terraforming and energy management.",{production:380,energy:260,alloys:190},["terraforming_lattice"],["Orbital climate"],"avian",{terraforming:360,energy:240},{perSecond:{terraforming:0.65,energy:0.22},consume:{alloys:0.08}})
  ].forEach(function(item){ addSystem("solar",item); });

  [
    tech("low_gravity_manufacturing","Low-Gravity Manufacturing","materials",{science:390,production:220,alloys:140},["lunar_foundry"],{perSecond:{production:0.42,alloys:0.18}}),
    tech("hydroponic_rings","Hydroponic Rings","life_support",{science:380,food:220,water:120},["orbital_farms"],{perSecond:{food:0.38,happiness:0.1}}),
    tech("fleet_doctrine_ai","Fleet Doctrine AI","computing",{science:420,data:180,command:140},["fleet_academy"],{perSecond:{command:0.28,military_power:0.22},consume:{data:0.04}}),
    tech("xeno_linguistics","Xeno-Linguistics","communications",{science:410,diplomacy:220,culture:180},["xeno_embassy"],{perSecond:{diplomacy:0.36,culture:0.16}})
  ].forEach(function(item){ addTech("solar",item); });

  [
    system("stellar_lifter_array","Stellar Lifter Array","Megastructures","Harvests stellar mass for rare matter, alloys, and energy.",{energy:620,alloys:520,science:300},["dyson_swarm"],["Stellar lifting"],"lithoid",{rare_matter:420,alloys:380,energy:420},{perSecond:{rare_matter:0.65,alloys:0.45,energy:0.3}}),
    system("pan_galactic_archive","Pan-Galactic Archive","Infrastructure","A living archive of cultures, science, and origin data.",{data:440,culture:360,science:340},["quantum_archive"],["Shared archive"],"humanoid",{data:520,science:420,culture:360},{perSecond:{data:1.2,science:0.62,culture:0.3}}),
    system("biosphere_seed_fleet","Biosphere Seed Fleet","Infrastructure","Terraforming fleets spread life and cohesion through border systems.",{terraforming:420,food:360,alloys:260},["hyperlane_garden"],["Seed fleets"],"plantoid",{terraforming:520,cohesion:320},{perSecond:{terraforming:0.7,cohesion:0.28,food:0.28}}),
    system("sentient_market","Sentient Market","Infrastructure","Autonomous trade engines coordinate diplomacy, gold, and unity.",{gold:520,data:360,diplomacy:340},["rare_matter_exchange"],["Living market"],"molluscoid",{gold:560,diplomacy:420,unity:260},{perSecond:{gold:1.2,diplomacy:0.45,unity:0.18},consume:{data:0.08}}),
    system("crisis_observatory","Crisis Observatory","Victory paths","Predicts endgame instability and converts knowledge into ascension readiness.",{science:620,data:460,cohesion:260},["dimensional_refuge"],["Crisis prediction"],"extremophile",{ascension:420,cohesion:360},{perSecond:{ascension:0.55,cohesion:0.3},score:260})
  ].forEach(function(item){ addSystem("galactic",item); });

  [
    tech("stellar_mass_economics","Stellar Mass Economics","stellar",{science:680,rare_matter:240,energy:360},["stellar_lifter_array"],{perSecond:{rare_matter:0.32,energy:0.22}}),
    tech("archive_personhood","Archive Personhood","culture",{science:660,data:420,culture:360},["pan_galactic_archive"],{perSecond:{culture:0.32,unity:0.22,cohesion:0.12}}),
    tech("seeded_world_charter","Seeded World Charter","xenobiology",{science:670,terraforming:360,diplomacy:300},["biosphere_seed_fleet"],{perSecond:{terraforming:0.36,diplomacy:0.2,cohesion:0.14}}),
    tech("predictive_crisis_ethics","Predictive Crisis Ethics","philosophy",{science:720,ascension:220,cohesion:280},["crisis_observatory"],{perSecond:{ascension:0.36,cohesion:0.24},score:220})
  ].forEach(function(item){ addTech("galactic",item); });

  [
    ["psionic_chorus","psionic"],
    ["synthetic_mind","synthetic"],
    ["bio_ascension_vats","biological"],
    ["dimensional_lab","dimensional"]
  ].forEach(function(entry){
    const sys=(DATA.STAGES.find(function(stage){ return stage.id==="galactic"; }).systems||[]).find(function(item){ return item.id===entry[0]; });
    if(sys) sys.requiresPath=entry[1];
  });
  [
    ["post_biological_rights","synthetic"],
    ["dimensional_anchors","dimensional"]
  ].forEach(function(entry){
    const galacticTechs=(DATA.STAGES.find(function(stage){ return stage.id==="galactic"; }).technologies||[]);
    const found=galacticTechs.find(function(item){ return item.id===entry[0]; });
    if(found) found.requiresPath=entry[1];
  });
  addSystem("galactic",Object.assign(
    system("energy_transfiguration_core","Energy Transfiguration Core","Victory paths","A conversion heart that teaches civilization to inhabit radiant, post-material forms.",{energy:520,alloys:280,data:220},["ascension_protocol"],["Energetic ascension"],"extremophile",{energy:420,ascension:260},{perSecond:{energy:0.72,ascension:0.24,alloys:0.18},consume:{cohesion:0.06}}),
    {requiresPath:"energetic"}
  ));
  [
    Object.assign(tech("genetic_engineering","Genetic Engineering","xenobiology",{science:520,food:280,medicine:220},["bio_ascension_vats"],{perSecond:{food:0.28,medicine:0.24,ascension:0.12}}),{requiresPath:"biological"}),
    Object.assign(tech("bio_immortality","Bio-Immortality","biology",{science:620,food:320,medicine:260,ascension:110},["genetic_engineering"],{perSecond:{happiness:0.22,food:0.18,ascension:0.18}}),{requiresPath:"biological"}),
    Object.assign(tech("adaptive_metagenesis","Adaptive Metagenesis","xenobiology",{science:700,food:360,medicine:280,ascension:140},["bio_immortality"],{perSecond:{food:0.22,medicine:0.22,cohesion:0.14,ascension:0.18}}),{requiresPath:"biological"}),
    Object.assign(tech("ai_integration","AI Integration","ai",{science:520,data:320,energy:220},["synthetic_mind"],{perSecond:{data:0.42,science:0.2,ascension:0.12}}),{requiresPath:"synthetic"}),
    Object.assign(tech("mind_upload","Mind Upload","consciousness",{science:620,data:380,energy:260,ascension:110},["ai_integration"],{perSecond:{data:0.48,cohesion:0.16,ascension:0.18}}),{requiresPath:"synthetic"}),
    Object.assign(tech("distributed_sentience","Distributed Sentience","consciousness",{science:700,data:420,energy:300,ascension:140},["mind_upload"],{perSecond:{data:0.24,science:0.18,cohesion:0.18,ascension:0.18}}),{requiresPath:"synthetic"}),
    Object.assign(tech("psi_potential","Psi-Potential","philosophy",{science:500,faith:320,culture:260},["psionic_chorus"],{perSecond:{faith:0.34,cohesion:0.2,ascension:0.1}}),{requiresPath:"psionic"}),
    Object.assign(tech("telepathy","Telepathy","consciousness",{science:600,faith:360,culture:300,ascension:100},["psi_potential"],{perSecond:{cohesion:0.32,diplomacy:0.18,ascension:0.16}}),{requiresPath:"psionic"}),
    Object.assign(tech("dream_concord","Dream Concord","consciousness",{science:690,faith:380,culture:340,ascension:130},["telepathy"],{perSecond:{faith:0.22,cohesion:0.22,diplomacy:0.16,ascension:0.18}}),{requiresPath:"psionic"}),
    Object.assign(tech("energy_manipulation","Energy Manipulation","energy",{science:540,energy:360,alloys:180},["energy_transfiguration_core"],{perSecond:{energy:0.54,alloys:0.18,ascension:0.1}}),{requiresPath:"energetic"}),
    Object.assign(tech("matter_conversion","Matter Conversion","energy",{science:640,energy:420,alloys:260,ascension:120},["energy_manipulation"],{perSecond:{energy:0.62,rare_matter:0.14,ascension:0.18}}),{requiresPath:"energetic"}),
    Object.assign(tech("stellar_apotheosis","Stellar Apotheosis","energy",{science:710,energy:460,alloys:300,ascension:140},["matter_conversion"],{perSecond:{energy:0.28,alloys:0.16,command:0.14,ascension:0.2}}),{requiresPath:"energetic"}),
    Object.assign(tech("dimensional_mastery","Dimensional Mastery","dimensional",{science:620,rare_matter:240,data:220},["dimensional_lab"],{perSecond:{rare_matter:0.22,data:0.16,ascension:0.12}}),{requiresPath:"dimensional"}),
    Object.assign(tech("reality_creation","Reality Creation","dimensional",{science:720,rare_matter:320,data:260,ascension:140},["dimensional_mastery"],{perSecond:{cohesion:0.24,rare_matter:0.18,ascension:0.22}}),{requiresPath:"dimensional"}),
    Object.assign(tech("paradox_cartography","Paradox Cartography","dimensional",{science:760,rare_matter:340,data:300,ascension:150},["reality_creation"],{perSecond:{data:0.2,rare_matter:0.18,cohesion:0.16,ascension:0.2}}),{requiresPath:"dimensional"})
  ].forEach(function(item){ addTech("galactic",item); });

  [
    system("cell_cortex","Cell Cortex","Core organelles","A flexible inner shell improves structure, motion, and later tissue behavior.",{atp:24,proteins:14,lipids:10},["microfilaments"],["Cell cortex"],"mammalian",{proteins:30,lipids:20},{manualBonus:0.08,score:12}),
    system("glycocalyx","Glycocalyx","Advanced organelles","A sugar-rich outer coat improves adhesion, signaling, and defense.",{atp:24,glucose:16,proteins:10,lipids:10},["membrane_pump","secretory_vesicles"],["Outer coat"],"molluscoid",{glucose:35,proteins:20},{perSecond:{glucose:0.08},score:12}),
    system("crystal_inclusion","Crystal Inclusion","Advanced organelles","Internal mineral crystals store elements and push hardened lineages.",{atp:26,elements:20,proteins:8},["acidocalcisome"],["Mineral inclusions"],"lithoid",{elements:55},{perSecond:{elements:0.1},score:14}),
    system("quorum_signals","Quorum Signals","Advanced organelles","Chemical population sensing improves coordination before nervous systems.",{atp:28,glucose:14,proteins:16,elements:10},["chemoreceptors","secretory_vesicles"],["Quorum sensing"],"humanoid",{proteins:30,elements:25},{perSecond:{proteins:0.08,elements:0.04},score:18})
  ].forEach(function(item){ addSystem("cell",item); });

  [
    system("compound_eyes","Compound Eyes","Development","Many small sensory units improve tracking, display, and threat response.",{food:44,knowledge:30,organic_matter:24},["sensory_pits"],["Compound vision"],"arthropoid",{knowledge:90,military_power:60},{perSecond:{knowledge:0.24,military_power:0.08}}),
    system("song_display","Song Display","Development","Rhythmic calls create culture, mate selection, and early social identity.",{food:40,culture:28,knowledge:24},["mimicry_display"],["Song display"],"avian",{culture:95,happiness:60},{perSecond:{culture:0.28,happiness:0.08}}),
    system("ink_sac","Ink Sac","Survival structures","A chemical escape tool that reinforces soft-bodied aquatic survival.",{food:38,water:28,organic_matter:28},["mantle_fold"],["Ink defense"],"molluscoid",{water:70,military_power:50},{perSecond:{military_power:0.12},score:18}),
    system("mycelial_skin","Mycelial Skin","Growth","Symbiotic surface growth improves recycling and colony resilience.",{food:42,organic_matter:40,biomass:24},["spore_bed"],["Mycelial surface"],"fungoid",{biomass:95,organic_matter:90},{perSecond:{biomass:0.24,organic_matter:0.16}})
  ].forEach(function(item){ addSystem("creature",item); });

  [
    tech("compound_focus","Compound Focus","thinking",{knowledge:70,military_power:32},["compound_eyes"],{perSecond:{knowledge:0.18,military_power:0.1}}),
    tech("courtship_songs","Courtship Songs","thinking",{knowledge:68,culture:44},["song_display"],{perSecond:{culture:0.24,happiness:0.08},populationGrowth:0.006}),
    tech("ink_escape","Ink Escape","survival",{knowledge:66,organic_matter:34},["ink_sac"],{perSecond:{happiness:0.04,military_power:0.08},score:16}),
    tech("surface_symbiosis","Surface Symbiosis","growth",{knowledge:72,biomass:40,organic_matter:36},["mycelial_skin"],{perSecond:{biomass:0.16,food:0.08},upkeepBonus:-0.01})
  ].forEach(function(item){ addTech("creature",item); });

  [
    system("salt_house","Salt House","Buildings","Preserves food and creates early trade leverage.",{wood:42,stone:24,food:34},["granary"],["Salt stores"],"molluscoid",{food:110,gold:30},{perSecond:{food:0.24,gold:0.06}}),
    system("scout_lodge","Scout Lodge","Buildings","Organized scouts find resources and prepare military movement.",{wood:40,food:30,culture:18},["watch_band"],["Scout network"],"avian",{military_power:80,science:45},{perSecond:{science:0.12,military_power:0.16}}),
    system("clay_tablet_house","Clay Tablet House","Buildings","Record keeping turns clay and culture into science.",{clay:42,lumber:28,culture:24},["village_center"],["Clay records"],"humanoid",{science:90,culture:55},{perSecond:{science:0.24,culture:0.08}})
  ].forEach(function(item){ addSystem("tribal",item); });

  [
    tech("salted_stores","Salted Stores","agriculture",{science:82,food:46},["salt_house"],{capacity:{food:80},perSecond:{food:0.12}}),
    tech("trail_signs","Trail Signs","warfare",{science:84,military_power:34,culture:24},["scout_lodge"],{perSecond:{military_power:0.14,science:0.08}}),
    tech("proto_accounting","Proto-Accounting","crafting",{science:86,clay:40,culture:30},["clay_tablet_house"],{perSecond:{science:0.18,gold:0.08}})
  ].forEach(function(item){ addTech("tribal",item); });

  [
    system("shipwright_yard","Shipwright Yard","Infrastructure","Coastal production turns lumber and gold into diplomacy and trade.",{production:160,lumber:90,gold:70},["canal_network"],["Shipbuilding"],"aquatic",{production:140,diplomacy:130},{perSecond:{diplomacy:0.28,gold:0.18},consume:{lumber:0.04}}),
    system("courthouse","Courthouse","Government","Formal law increases influence, happiness, and civic stability.",{production:155,gold:90,culture:80},["public_forum"],["Civic law"],"humanoid",{influence:170,happiness:140},{perSecond:{influence:0.28,happiness:0.12}}),
    system("glassworks","Glassworks","Industry","Specialized craft converts production into science and tourism.",{production:160,strategic_total:45,gold:80},["siege_foundry"],["Glass craft"],"lithoid",{science:150,tourism:90},{perSecond:{science:0.28,tourism:0.12},consume:{production:0.04}})
  ].forEach(function(item){ addSystem("civilization",item); });

  [
    tech("maritime_codes","Maritime Codes","government",{science:190,diplomacy:110,gold:80},["shipwright_yard"],{perSecond:{diplomacy:0.2,gold:0.12}}),
    tech("common_law","Common Law","government",{science:188,influence:90,culture:80},["courthouse"],{perSecond:{influence:0.2,happiness:0.1}}),
    tech("optics","Optics","science",{science:195,production:100,tourism:50},["glassworks"],{perSecond:{science:0.24,tourism:0.1}})
  ].forEach(function(item){ addTech("civilization",item); });

  [
    system("radio_tower_network","Radio Tower Network","Communications","Broadcast infrastructure spreads culture, logistics, and influence.",{production:260,energy:120,culture:130},["postal_service"],["Broadcast network"],"avian",{culture:260,logistics:180},{perSecond:{culture:0.36,logistics:0.24,influence:0.12},consume:{energy:0.06}}),
    system("recycling_authority","Recycling Authority","Administration","Industrial recovery reduces pollution while producing strategic throughput.",{production:250,pollution:80,gold:120},["environment_agency"],["Recycling"],"fungoid",{strategic_total:180,production:160},{perSecond:{strategic_total:0.16,production:0.18},consume:{pollution:0.18}}),
    system("armored_corps","Armored Corps","Military","Mobile mechanized forces consume production and energy for military power.",{production:310,energy:150,military_power:120},["steel_mill"],["Mechanized units"],"reptilian",{military_power:360,logistics:120},{perSecond:{military_power:0.82},consume:{energy:0.1,production:0.08}})
  ].forEach(function(item){ addSystem("empire",item); });

  [
    tech("broadcast_standards","Broadcast Standards","communications",{science:300,culture:180,energy:80},["radio_tower_network"],{perSecond:{culture:0.24,influence:0.12}}),
    tech("circular_industry","Circular Industry","industry",{science:310,pollution:80,production:160},["recycling_authority"],{perSecond:{production:0.24,strategic_total:0.08},consume:{pollution:0.1}}),
    tech("combined_arms","Combined Arms","military",{science:320,military_power:180,logistics:90},["armored_corps"],{perSecond:{military_power:0.32,logistics:0.14}})
  ].forEach(function(item){ addTech("empire",item); });

  [
    system("mercury_solar_belt","Mercury Solar Belt","Infrastructure","Inner-system solar collectors create vast energy at alloy upkeep.",{production:390,alloys:250,energy:240},["solar_array"],["Inner solar belt"],"plantoid",{energy:520},{perSecond:{energy:1.7},consume:{alloys:0.08}}),
    system("cryogenic_seed_vault","Cryogenic Seed Vault","Colonies","Long-term biological backups support terraforming and food security.",{production:350,food:260,energy:170},["orbital_farms"],["Seed vault"],"fungoid",{food:420,terraforming:220},{perSecond:{food:0.42,terraforming:0.18},consume:{energy:0.06}}),
    system("deep_space_listening_array","Deep Space Listening Array","Infrastructure","Outer arrays generate data, science, and first-contact readiness.",{production:360,data:180,energy:190},["kuiper_observatory"],["Listening array"],"humanoid",{data:360,science:280},{perSecond:{data:0.62,science:0.3,diplomacy:0.08},consume:{energy:0.08}})
  ].forEach(function(item){ addSystem("solar",item); });

  [
    tech("inner_system_grid","Inner-System Grid","energy",{science:430,energy:280,alloys:180},["mercury_solar_belt"],{perSecond:{energy:0.75,production:0.12}}),
    tech("genetic_backups","Genetic Backups","biology",{science:420,food:260,terraforming:120},["cryogenic_seed_vault"],{perSecond:{food:0.24,medicine:0.16},populationGrowth:0.008}),
    tech("signal_archaeology","Signal Archaeology","astrophysics",{science:440,data:220,diplomacy:120},["deep_space_listening_array"],{perSecond:{science:0.24,data:0.18,diplomacy:0.12}})
  ].forEach(function(item){ addTech("solar",item); });

  [
    system("galactic_census","Galactic Census","Galactic core","Counts populations, systems, and rights to improve cohesion.",{data:460,diplomacy:360,culture:320},["sector_network"],["Galactic census"],"mammalian",{cohesion:420,unity:260},{perSecond:{cohesion:0.42,unity:0.2,diplomacy:0.14}}),
    system("void_bloom_engine","Void Bloom Engine","Megastructures","Exotic biospheres bloom in controlled void habitats.",{rare_matter:260,terraforming:420,energy:500},["biosphere_seed_fleet"],["Void bloom"],"plantoid",{terraforming:520,ascension:260},{perSecond:{terraforming:0.55,ascension:0.24},consume:{rare_matter:0.08}}),
    system("chronicle_fleet","Chronicle Fleet","Infrastructure","Mobile archives preserve culture and data across unstable frontiers.",{data:500,culture:420,command:260},["pan_galactic_archive"],["Chronicle fleet"],"avian",{data:520,culture:430,cohesion:240},{perSecond:{data:0.75,culture:0.42,cohesion:0.16},consume:{energy:0.1}})
  ].forEach(function(item){ addSystem("galactic",item); });

  [
    tech("census_rights","Census Rights","governance",{science:700,cohesion:260,diplomacy:360},["galactic_census"],{perSecond:{cohesion:0.28,unity:0.18}}),
    tech("void_ecology","Void Ecology","ecology",{science:720,terraforming:380,rare_matter:180},["void_bloom_engine"],{perSecond:{terraforming:0.32,ascension:0.18}}),
    tech("mobile_memory_law","Mobile Memory Law","culture",{science:710,data:420,culture:360},["chronicle_fleet"],{perSecond:{culture:0.32,cohesion:0.18}})
  ].forEach(function(item){ addTech("galactic",item); });

  [
    system("shell_garden","Shell Garden","Survival structures","Accumulated shells and shelters improve defense and aquatic food access.",{food:46,water:34,materials:36},["mantle_fold"],["Shell garden"],"molluscoid",{food:95,water:80,military_power:45},{perSecond:{food:0.24,water:0.14,military_power:0.06}}),
    system("hive_cluster","Hive Cluster","Growth","Dense brood chambers push modular bodies and cooperative labor.",{food:48,organic_matter:42,materials:34},["chitin_plates"],["Hive cluster"],"arthropoid",{biomass:110,materials:90},{perSecond:{biomass:0.22,materials:0.16},populationGrowth:0.014}),
    system("sun_basking_rocks","Sun-Basking Rocks","Survival structures","Thermal behavior supports reptilian activity and harsh-environment endurance.",{food:44,materials:36,knowledge:24},["stone_gizzard"],["Basking behavior"],"reptilian",{food:70,knowledge:70},{perSecond:{knowledge:0.16},upkeepBonus:-0.012}),
    system("wake_songs","Wake Songs","Development","Group calls coordinate migration and strengthen avian culture.",{food:46,culture:36,knowledge:32},["song_display"],["Wake songs"],"avian",{culture:120,happiness:70},{perSecond:{culture:0.34,happiness:0.1},score:24})
  ].forEach(function(item){ addSystem("creature",item); });

  [
    tech("shell_tooling","Shell Tooling","growth",{knowledge:78,materials:46,water:32},["shell_garden"],{perSecond:{materials:0.14,food:0.1}}),
    tech("hive_labor","Hive Labor","growth",{knowledge:82,biomass:48,materials:42},["hive_cluster"],{perSecond:{materials:0.18,biomass:0.12},populationGrowth:0.008}),
    tech("thermal_habits","Thermal Habits","survival",{knowledge:80,food:42},["sun_basking_rocks"],{perSecond:{knowledge:0.14,happiness:0.04},upkeepBonus:-0.01}),
    tech("chorus_routes","Chorus Routes","thinking",{knowledge:86,culture:54},["wake_songs"],{perSecond:{culture:0.26,food:0.08},score:18})
  ].forEach(function(item){ addTech("creature",item); });

  [
    system("beast_pens","Beast Pens","Buildings","Early animal management adds food, biomass, and military hauling.",{wood:46,food:38,biomass:22},["smokehouse"],["Animal pens"],"mammalian",{food:130,biomass:90},{perSecond:{food:0.3,biomass:0.12},consume:{water:0.04}}),
    system("reed_boats","Reed Boats","Units","Small watercraft improve scouting, trade, and food gathering.",{wood:44,water:32,lumber:22},["fish_weir"],["Reed craft"],"aquatic",{food:90,luxury_total:50},{perSecond:{food:0.22,luxury_total:0.08}}),
    system("watchtower_ring","Watchtower Ring","Buildings","Distributed watch posts raise military power and local logistics.",{lumber:44,stone:34,military_power:20},["scout_lodge"],["Watch posts"],"reptilian",{military_power:120,logistics:40},{perSecond:{military_power:0.28,science:0.06}}),
    system("bone_oracle","Bone Oracle","Buildings","Ritual remains convert faith and biomass into culture.",{faith:34,biomass:30,culture:28},["ancestor_rites"],["Bone divination"],"necroid",{faith:100,culture:90},{perSecond:{faith:0.16,culture:0.18},consume:{biomass:0.04}})
  ].forEach(function(item){ addSystem("tribal",item); });

  [
    tech("animal_husbandry","Animal Husbandry","agriculture",{science:92,food:60,biomass:34},["beast_pens"],{perSecond:{food:0.22,biomass:0.08},populationGrowth:0.006}),
    tech("river_trade","River Trade","crafting",{science:90,luxury_total:40,water:38},["reed_boats"],{perSecond:{luxury_total:0.12,gold:0.08}}),
    tech("signal_fires","Signal Fires","warfare",{science:94,military_power:48,lumber:28},["watchtower_ring"],{perSecond:{military_power:0.18,science:0.08}}),
    tech("osteomancy","Osteomancy","spirituality",{science:96,faith:48,biomass:28},["bone_oracle"],{perSecond:{faith:0.16,culture:0.12},score:22})
  ].forEach(function(item){ addTech("tribal",item); });

  [
    lineage(system("merchant_guild","Merchant Guild","Economics","Organized merchants convert gold, production, and diplomacy into trade power.",{production:175,gold:140,diplomacy:70},["mint"],["Merchant guild"],"molluscoid",{gold:240,diplomacy:160,luxury_total:80},{perSecond:{gold:0.58,diplomacy:0.18,luxury_total:0.06}}),"molluscoid"),
    lineage(system("medical_quarter","Medical Quarter","Infrastructure","Urban medicine stabilizes growth and happiness.",{production:170,medicine:100,food:90},["botanical_college"],["Medical quarter"],"mammalian",{medicine:220,happiness:170},{perSecond:{medicine:0.36,happiness:0.16},populationGrowth:0.008}),"mammalian"),
    lineage(system("observatory","Observatory","Science","Astronomical records boost science, culture, and navigation memory.",{production:165,science:120,culture:80},["academy"],["Astronomy"],"avian",{science:230,culture:120},{perSecond:{science:0.48,culture:0.12},score:28}),"avian"),
    lineage(system("stone_roads","Stone Roads","Infrastructure","Roads raise production movement, military response, and gold.",{production:180,stone:120,gold:80},["civil_engineering"],["Road network"],"lithoid",{production:210,gold:130,military_power:80},{perSecond:{production:0.34,gold:0.16,military_power:0.08}}),"lithoid")
  ].forEach(function(item){ addSystem("civilization",item); });

  [
    lineage(tech("guild_charters","Guild Charters","economics",{science:205,gold:160,diplomacy:90},["merchant_guild"],{perSecond:{gold:0.3,diplomacy:0.12}}),"molluscoid"),
    lineage(tech("urban_triage","Urban Triage","agriculture",{science:205,medicine:140,food:90},["medical_quarter"],{perSecond:{medicine:0.22,happiness:0.12},populationGrowth:0.006}),"mammalian"),
    lineage(tech("celestial_navigation","Celestial Navigation","science",{science:215,culture:100,gold:70},["observatory"],{perSecond:{science:0.22,diplomacy:0.08}}),"avian"),
    lineage(tech("road_surveying","Road Surveying","industry",{science:210,production:140,gold:90},["stone_roads"],{perSecond:{production:0.24,gold:0.1}}),"lithoid")
  ].forEach(function(item){ addTech("civilization",item); });

  [
    lineage(system("electric_grid","Electric Grid","Energy","Regional electricity networks unlock stable industrial power.",{production:320,energy:190,gold:150},["steel_mill"],["Electrical grid"],"humanoid",{energy:360,production:220},{perSecond:{energy:0.95,production:0.24},consume:{strategic_total:0.06}}),"humanoid"),
    lineage(system("central_bank","Central Bank","Administration","Financial coordination turns gold into influence and stability.",{gold:260,production:220,influence:120},["postal_service"],["Central finance"],"molluscoid",{gold:380,influence:260},{perSecond:{gold:0.62,influence:0.26,happiness:0.06}}),"molluscoid"),
    lineage(system("national_laboratory","National Laboratory","Institutions","A national science complex creates data, medicine, and strategic advances.",{production:300,science:220,energy:140},["computer_lab"],["National lab"],"humanoid",{science:420,data:220,medicine:160},{perSecond:{science:0.9,data:0.28,medicine:0.12},consume:{energy:0.08}}),"humanoid"),
    lineage(system("air_defense_grid","Air Defense Grid","Military","Integrated defense networks protect regions and improve command.",{production:340,energy:180,military_power:160},["satellite_network"],["Air defense"],"avian",{military_power:380,command:160},{perSecond:{military_power:0.72,command:0.18},consume:{energy:0.12}}),"avian")
  ].forEach(function(item){ addSystem("empire",item); });

  [
    lineage(tech("alternating_current","Alternating Current","energy",{science:340,energy:220,production:160},["electric_grid"],{perSecond:{energy:0.45,production:0.16}}),"humanoid"),
    lineage(tech("monetary_policy","Monetary Policy","science",{science:330,gold:220,influence:120},["central_bank"],{perSecond:{gold:0.28,influence:0.12}}),"molluscoid"),
    lineage(tech("applied_research","Applied Research","science",{science:360,data:120,medicine:100},["national_laboratory"],{perSecond:{science:0.38,data:0.16,medicine:0.08}}),"humanoid"),
    lineage(tech("integrated_airspace","Integrated Airspace","aerospace",{science:350,command:120,military_power:180},["air_defense_grid"],{perSecond:{command:0.22,military_power:0.22}}),"avian")
  ].forEach(function(item){ addTech("empire",item); });

  [
    lineage(system("orbital_shipyard_city","Orbital Shipyard City","Infrastructure","A city-scale orbital yard produces alloys, command, and military reach.",{production:430,alloys:320,colonies:160},["lunar_foundry"],["Shipyard city"],"arthropoid",{alloys:420,command:300,military_power:260},{perSecond:{alloys:0.62,command:0.32,military_power:0.28},consume:{energy:0.16}}),"arthropoid"),
    lineage(system("ocean_world_colony","Ocean World Colony","Colonies","Aquatic megacolonies support food, water, and diplomacy.",{production:390,water:260,colonies:180},["xeno_embassy"],["Ocean colony"],"aquatic",{food:420,water:360,diplomacy:220},{perSecond:{food:0.62,water:0.32,diplomacy:0.16},populationGrowth:0.012}),"aquatic"),
    lineage(system("helium_three_refinery","Helium-3 Refinery","Mining","Gas giant harvesting produces energy and strategic resources.",{production:420,energy:260,alloys:220},["asteroid_mines"],["Helium mining"],"extremophile",{energy:460,strategic_total:220},{perSecond:{energy:1.05,strategic_total:0.16},consume:{alloys:0.08}}),"extremophile"),
    lineage(system("planetary_archive","Planetary Archive","Infrastructure","Planet-scale recordkeeping generates data, culture, and science.",{production:400,data:240,culture:200},["deep_space_listening_array"],["Planet archive"],"humanoid",{data:430,culture:300,science:260},{perSecond:{data:0.72,culture:0.24,science:0.2}}),"humanoid")
  ].forEach(function(item){ addSystem("solar",item); });

  [
    lineage(tech("orbital_union_law","Orbital Union Law","trade",{science:460,colonies:220,culture:180},["orbital_shipyard_city"],{perSecond:{happiness:0.14,command:0.18}}),"arthropoid"),
    lineage(tech("pelagic_habitats","Pelagic Habitats","life_support",{science:450,water:240,food:220},["ocean_world_colony"],{perSecond:{food:0.32,water:0.18},populationGrowth:0.008}),"aquatic"),
    lineage(tech("gas_giant_extraction","Gas Giant Extraction","mining",{science:470,energy:300,strategic_total:140},["helium_three_refinery"],{perSecond:{energy:0.48,strategic_total:0.1}}),"extremophile"),
    lineage(tech("planetary_memory","Planetary Memory","computing",{science:480,data:260,culture:180},["planetary_archive"],{perSecond:{data:0.36,culture:0.18,science:0.12}}),"humanoid")
  ].forEach(function(item){ addTech("solar",item); });

  [
    lineage(system("hyperlane_customs","Hyperlane Customs","Infrastructure","Customs stations regulate trade, cohesion, and rare matter flow.",{energy:520,diplomacy:420,gold:420},["sentient_market"],["Customs network"],"molluscoid",{gold:560,cohesion:340,rare_matter:180},{perSecond:{gold:0.9,cohesion:0.24,rare_matter:0.08}}),"molluscoid"),
    lineage(system("star_whale_sanctuary","Star-Whale Sanctuary","Infrastructure","Protected migratory megafauna creates culture, diplomacy, and cohesion.",{food:460,diplomacy:420,culture:360},["xeno_preserve"],["Star sanctuary"],"aquatic",{diplomacy:520,culture:420,cohesion:300},{perSecond:{diplomacy:0.55,culture:0.32,cohesion:0.18}}),"aquatic"),
    lineage(system("synthetic_ecclesia","Synthetic Ecclesia","Victory paths","Machine-person councils turn data, faith, and law into unity.",{data:560,faith:420,cohesion:300},["post_biological_rights"],["Synthetic council"],"humanoid",{unity:520,ascension:300,data:380},{perSecond:{unity:0.58,ascension:0.24,data:0.22}}),"humanoid"),
    lineage(system("entropy_battery","Entropy Battery","Megastructures","Stores exotic gradients for energy and ascension work.",{energy:700,rare_matter:300,science:460},["dark_matter_harvester"],["Entropy storage"],"extremophile",{energy:700,ascension:280},{perSecond:{energy:1.4,ascension:0.22},consume:{rare_matter:0.08}}),"extremophile")
  ].forEach(function(item){ addSystem("galactic",item); });

  [
    lineage(tech("customs_algorithms","Customs Algorithms","trade",{science:760,gold:440,data:280},["hyperlane_customs"],{perSecond:{gold:0.42,cohesion:0.12}}),"molluscoid"),
    lineage(tech("xeno_migration_rights","Xeno Migration Rights","xenobiology",{science:760,diplomacy:440,culture:360},["star_whale_sanctuary"],{perSecond:{diplomacy:0.32,cohesion:0.18,happiness:0.12}}),"aquatic"),
    lineage(tech("synthetic_theology","Synthetic Theology","post_bio",{science:780,data:480,faith:360},["synthetic_ecclesia"],{perSecond:{unity:0.34,ascension:0.18}}),"humanoid"),
    lineage(tech("entropy_accounting","Entropy Accounting","energy",{science:800,energy:520,rare_matter:240},["entropy_battery"],{perSecond:{energy:0.65,ascension:0.16}}),"extremophile")
  ].forEach(function(item){ addTech("galactic",item); });

  [
    lineage(system("clan_school","Clan School","Lineage variants","Humanoid teaching traditions turn culture into science and civic memory.",{lumber:42,culture:34,science:24},["clay_tablet_house"],["Lineage school"],"humanoid",{science:120,culture:80},{perSecond:{science:0.28,culture:0.08}}),"humanoid"),
    lineage(system("hearth_kinhouse","Hearth Kinhouse","Lineage variants","Mammalian kinship halls improve food stability, happiness, and growth.",{lumber:42,food:46,biomass:28},["beast_pens"],["Kin hearth"],"mammalian",{food:140,happiness:90},{perSecond:{food:0.26,happiness:0.12},populationGrowth:0.008}),"mammalian"),
    lineage(system("war_lodge","War Lodge","Lineage variants","Reptilian warrior lodges create disciplined defense and predatory raids.",{lumber:44,stone:34,military_power:34},["watchtower_ring"],["War lodge"],"reptilian",{military_power:150,food:60},{perSecond:{military_power:0.36,food:0.08}}),"reptilian"),
    lineage(system("sky_roost","Sky Roost","Lineage variants","Avian roosts turn scouting and song into culture, science, and fast movement.",{lumber:42,culture:36,food:30},["scout_lodge"],["Sky roost"],"avian",{culture:120,science:80},{perSecond:{culture:0.28,science:0.1}}),"avian"),
    lineage(system("brood_workshop","Brood Workshop","Lineage variants","Arthropoid brood labor adds steady materials, lumber, and military preparation.",{wood:52,lumber:36,biomass:30},["workshop"],["Brood labor"],"arthropoid",{lumber:120,materials:80,military_power:70},{perSecond:{lumber:0.24,military_power:0.1},consume:{food:0.04}}),"arthropoid"),
    lineage(system("shell_market","Shell Market","Lineage variants","Molluscoid exchange sites specialize in water routes, luxuries, and gold.",{water:40,luxury_total:28,lumber:34},["reed_boats"],["Shell exchange"],"molluscoid",{luxury_total:120,gold:80,water:80},{perSecond:{luxury_total:0.18,gold:0.12}}),"molluscoid"),
    lineage(system("spore_shrine","Spore Shrine","Lineage variants","Fungoid shrines recycle biomass into faith, culture, and food.",{biomass:42,faith:34,culture:30},["shrine"],["Spore rites"],"fungoid",{faith:120,culture:90,food:70},{perSecond:{faith:0.22,culture:0.12,food:0.08},consume:{biomass:0.04}}),"fungoid"),
    lineage(system("sacred_grove","Sacred Grove","Lineage variants","Plantoid groves produce food, medicine, faith, and happiness from water.",{water:42,faith:30,food:38},["herbalist_garden"],["Sacred grove"],"plantoid",{food:150,medicine:80,faith:80},{perSecond:{food:0.32,medicine:0.12,faith:0.08},consume:{water:0.05}}),"plantoid"),
    lineage(system("tidal_lodge","Tidal Lodge","Lineage variants","Aquatic lodges draw water, food, and culture from seasonal currents.",{water:48,food:38,lumber:30},["fish_weir"],["Tidal lodge"],"aquatic",{water:150,food:120,culture:70},{perSecond:{water:0.3,food:0.18,culture:0.08}}),"aquatic"),
    lineage(system("standing_stones","Standing Stones","Lineage variants","Lithoid stone monuments create faith, stability, and hardened storage.",{stone:58,faith:32,culture:28},["bone_oracle"],["Stone memory"],"lithoid",{stone:140,faith:90,happiness:80},{perSecond:{faith:0.16,happiness:0.08},upkeepBonus:-0.01}),"lithoid"),
    lineage(system("ancestor_charnel","Ancestor Charnel","Lineage variants","Necroid charnel rites convert biomass into faith, culture, and military resolve.",{biomass:48,faith:38,military_power:24},["bone_oracle"],["Ancestor remains"],"necroid",{faith:130,culture:90,military_power:90},{perSecond:{faith:0.2,culture:0.1,military_power:0.1},consume:{biomass:0.06}}),"necroid"),
    lineage(system("venom_brewers","Venom Brewers","Lineage variants","Toxoid brewers turn elements and biomass into military deterrence.",{elements:32,biomass:40,science:24},["obsidian_knappers"],["Venom brewing"],"toxoid",{military_power:120,science:80},{perSecond:{military_power:0.26,science:0.08},consume:{biomass:0.04}}),"toxoid"),
    lineage(system("hot_spring_refuge","Hot Spring Refuge","Lineage variants","Extremophile refuges reduce upkeep while producing medicine and faith.",{stone:46,water:34,faith:30},["well"],["Thermal refuge"],"extremophile",{medicine:90,faith:80,happiness:70},{perSecond:{medicine:0.16,faith:0.08},upkeepBonus:-0.02}),"extremophile")
  ].forEach(function(item){ addSystem("tribal",item); });

  [
    lineage(tech("oral_schools","Oral Schools","crafting",{science:104,culture:58},["clan_school"],{perSecond:{science:0.2,culture:0.1}}),"humanoid"),
    lineage(tech("kinship_stewardship","Kinship Stewardship","agriculture",{science:104,food:68,biomass:38},["hearth_kinhouse"],{perSecond:{food:0.18,happiness:0.1},populationGrowth:0.006}),"mammalian"),
    lineage(tech("raid_doctrine","Raid Doctrine","warfare",{science:106,military_power:64,food:38},["war_lodge"],{perSecond:{military_power:0.22,food:0.08}}),"reptilian"),
    lineage(tech("route_chants","Route Chants","spirituality",{science:106,culture:64,food:34},["sky_roost"],{perSecond:{culture:0.2,science:0.08}}),"avian"),
    lineage(tech("brood_tasking","Brood Tasking","crafting",{science:108,lumber:54,biomass:38},["brood_workshop"],{perSecond:{lumber:0.18,military_power:0.08}}),"arthropoid"),
    lineage(tech("shell_currency","Shell Currency","crafting",{science:108,luxury_total:52,gold:34},["shell_market"],{perSecond:{gold:0.16,luxury_total:0.1}}),"molluscoid"),
    lineage(tech("spore_calendar","Spore Calendar","spirituality",{science:110,faith:58,biomass:36},["spore_shrine"],{perSecond:{faith:0.18,food:0.08}}),"fungoid"),
    lineage(tech("grove_tending","Grove Tending","agriculture",{science:110,medicine:42,food:62},["sacred_grove"],{perSecond:{food:0.18,medicine:0.1}}),"plantoid"),
    lineage(tech("tide_marks","Tide Marks","construction",{science:108,water:66,culture:38},["tidal_lodge"],{perSecond:{water:0.18,culture:0.1}}),"aquatic"),
    lineage(tech("megalithic_survey","Megalithic Survey","construction",{science:112,stone:70,faith:42},["standing_stones"],{capacity:{stone:80},perSecond:{faith:0.12,happiness:0.06}}),"lithoid"),
    lineage(tech("death_oaths","Death Oaths","spirituality",{science:112,faith:64,military_power:40},["ancestor_charnel"],{perSecond:{faith:0.14,military_power:0.12},score:24}),"necroid"),
    lineage(tech("poison_craft","Poison Craft","warfare",{science:112,military_power:58,biomass:38},["venom_brewers"],{perSecond:{military_power:0.18,science:0.06}}),"toxoid"),
    lineage(tech("heat_bathing","Heat Bathing","spirituality",{science:112,medicine:46,faith:44},["hot_spring_refuge"],{perSecond:{medicine:0.12,happiness:0.08},upkeepBonus:-0.01}),"extremophile")
  ].forEach(function(item){ addTech("tribal",item); });

  [
    lineage(system("civic_exam_hall","Civic Exam Hall","Lineage variants","Humanoid bureaucracy converts libraries into stable influence and science.",{production:150,science:115,culture:75},["library"],["Civil service"],"humanoid",{science:190,influence:120},{perSecond:{science:0.38,influence:0.18}}),"humanoid"),
    lineage(system("legion_castrum","Legion Castrum","Lineage variants","Reptilian fortress camps turn standing armies into disciplined expansion.",{production:170,military_power:130,gold:70},["barracks"],["Legion camp"],"reptilian",{military_power:230,production:90},{perSecond:{military_power:0.48,production:0.12},consume:{gold:0.04}}),"reptilian"),
    lineage(system("guild_foundry","Guild Foundry","Lineage variants","Arthropoid guild labor makes workshops dense, efficient, and martial.",{production:165,lumber:90,gold:70},["workshops"],["Guild foundry"],"arthropoid",{production:230,military_power:100},{perSecond:{production:0.44,military_power:0.1},consume:{wood:0.08}}),"arthropoid"),
    lineage(system("spore_infirmary","Spore Infirmary","Lineage variants","Fungoid medicine circles recycle sickness into faith, medicine, and culture.",{production:150,medicine:90,faith:70},["temple_district"],["Spore infirmary"],"fungoid",{medicine:190,faith:130,culture:100},{perSecond:{medicine:0.28,faith:0.18,culture:0.08}}),"fungoid"),
    lineage(system("terrace_garden_city","Terrace Garden City","Lineage variants","Plantoid urban gardens bind food, water, medicine, and happiness.",{production:160,food:120,water:90},["farms"],["Terrace city"],"plantoid",{food:230,medicine:120,happiness:130},{perSecond:{food:0.38,medicine:0.12,happiness:0.12},consume:{water:0.05},populationGrowth:0.008}),"plantoid"),
    lineage(system("canal_court","Canal Court","Lineage variants","Aquatic court systems turn water control into diplomacy and prosperity.",{production:160,water:130,culture:80},["aqueduct"],["Canal law"],"aquatic",{water:220,diplomacy:120,happiness:120},{perSecond:{water:0.3,diplomacy:0.16,happiness:0.08}}),"aquatic"),
    lineage(system("mortuary_college","Mortuary College","Lineage variants","Necroid scholars preserve civic memory through medicine, death rites, and law.",{production:165,medicine:90,faith:80},["temple_district"],["Mortuary college"],"necroid",{science:160,faith:150,culture:110},{perSecond:{science:0.24,faith:0.2,culture:0.08},score:34}),"necroid"),
    lineage(system("alchemist_quarter","Alchemist Quarter","Lineage variants","Toxoid specialists refine useful poisons into medicine, science, and deterrence.",{production:165,medicine:80,science:90},["apothecary"],["Alchemical craft"],"toxoid",{science:180,medicine:130,military_power:110},{perSecond:{science:0.26,medicine:0.12,military_power:0.12},consume:{gold:0.05}}),"toxoid"),
    lineage(system("thermal_aqueduct","Thermal Aqueduct","Lineage variants","Extremophile heat works reduce civic upkeep while generating energy and happiness.",{production:170,stone:110,water:95},["aqueduct"],["Thermal civic works"],"extremophile",{energy:150,happiness:150,water:120},{perSecond:{energy:0.32,happiness:0.12},upkeepBonus:-0.012}),"extremophile")
  ].forEach(function(item){ addSystem("civilization",item); });

  [
    lineage(tech("merit_archives","Merit Archives","government",{science:235,culture:130,influence:90},["civic_exam_hall"],{perSecond:{science:0.22,influence:0.12}}),"humanoid"),
    lineage(tech("frontier_discipline","Frontier Discipline","military",{science:230,military_power:170,gold:90},["legion_castrum"],{perSecond:{military_power:0.28,production:0.08}}),"reptilian"),
    lineage(tech("standardized_toolhands","Standardized Toolhands","industry",{science:235,production:160,lumber:80},["guild_foundry"],{perSecond:{production:0.26,military_power:0.08}}),"arthropoid"),
    lineage(tech("mycological_public_health","Mycological Public Health","agriculture",{science:235,medicine:130,faith:90},["spore_infirmary"],{perSecond:{medicine:0.18,faith:0.12,happiness:0.08}}),"fungoid"),
    lineage(tech("edible_boulevards","Edible Boulevards","agriculture",{science:235,food:170,medicine:80},["terrace_garden_city"],{perSecond:{food:0.24,medicine:0.1},populationGrowth:0.006}),"plantoid"),
    lineage(tech("hydraulic_rights","Hydraulic Rights","government",{science:238,water:160,diplomacy:90},["canal_court"],{perSecond:{water:0.18,diplomacy:0.12,happiness:0.06}}),"aquatic"),
    lineage(tech("thanatology","Thanatology","science",{science:240,faith:140,medicine:90},["mortuary_college"],{perSecond:{science:0.18,faith:0.14},score:38}),"necroid"),
    lineage(tech("toxin_regulation","Toxin Regulation","science",{science:240,medicine:110,military_power:90},["alchemist_quarter"],{perSecond:{science:0.18,medicine:0.1,military_power:0.08}}),"toxoid"),
    lineage(tech("geothermal_codes","Geothermal Codes","industry",{science:240,energy:120,stone:100},["thermal_aqueduct"],{perSecond:{energy:0.22,happiness:0.08},upkeepBonus:-0.008}),"extremophile")
  ].forEach(function(item){ addTech("civilization",item); });

  [
    lineage(system("welfare_ministry","Welfare Ministry","Lineage variants","Mammalian public care stabilizes happiness, medicine, and population growth.",{production:270,gold:170,medicine:120},["provincial_admin"],["Public welfare"],"mammalian",{happiness:260,medicine:210,food:140},{perSecond:{happiness:0.22,medicine:0.18,food:0.08},populationGrowth:0.006}),"mammalian"),
    lineage(system("armored_war_college","Armored War College","Lineage variants","Reptilian doctrine turns command into decisive military pressure.",{production:310,military_power:210,command:90},["general_staff"],["Armored doctrine"],"reptilian",{military_power:360,command:180},{perSecond:{military_power:0.62,command:0.18},consume:{energy:0.06}}),"reptilian"),
    lineage(system("public_mycelium_network","Public Mycelium Network","Lineage variants","Fungoid civic mycelia share science, food, faith, and soft control.",{production:270,science:190,faith:110},["university_network"],["Public mycelia"],"fungoid",{science:280,faith:190,food:160},{perSecond:{science:0.42,faith:0.18,food:0.12},consume:{water:0.04}}),"fungoid"),
    lineage(system("green_belt_authority","Green Belt Authority","Lineage variants","Plantoid urban planning makes industrial regions cleaner and more livable.",{production:280,food:180,medicine:110},["provincial_admin"],["Green belts"],"plantoid",{food:270,medicine:190,happiness:220},{perSecond:{food:0.34,medicine:0.16,happiness:0.18},consume:{water:0.05}}),"plantoid"),
    lineage(system("seismic_rail_authority","Seismic Rail Authority","Lineage variants","Lithoid engineers harden rail corridors into stone-rich industry.",{production:300,stone:190,gold:130},["rail_hub"],["Seismic rail"],"lithoid",{production:300,strategic_total:140},{perSecond:{production:0.44,strategic_total:0.1},upkeepBonus:-0.01}),"lithoid"),
    lineage(system("veterans_charnel_office","Veterans Charnel Office","Lineage variants","Necroid administrations preserve fallen soldiers as faith, command, and morale.",{production:290,military_power:170,faith:140},["general_staff"],["Charnel honors"],"necroid",{faith:260,command:170,military_power:190},{perSecond:{faith:0.28,command:0.16,military_power:0.16},score:52}),"necroid"),
    lineage(system("industrial_safety_bureau","Industrial Safety Bureau","Lineage variants","Toxoid regulators monetize hazardous industry without losing too much stability.",{production:290,science:160,pollution:90},["factory_district"],["Hazard bureau"],"toxoid",{science:260,medicine:150,strategic_total:120},{perSecond:{science:0.34,medicine:0.12,strategic_total:0.08},consume:{pollution:0.08}}),"toxoid")
  ].forEach(function(item){ addSystem("empire",item); });

  [
    lineage(tech("universal_clinics","Universal Clinics","medicine",{science:360,medicine:180,gold:120},["welfare_ministry"],{perSecond:{medicine:0.22,happiness:0.12},populationGrowth:0.004}),"mammalian"),
    lineage(tech("deep_battle_planning","Deep Battle Planning","military",{science:380,military_power:220,command:120},["armored_war_college"],{perSecond:{military_power:0.32,command:0.14}}),"reptilian"),
    lineage(tech("symbiotic_bureaucracy","Symbiotic Bureaucracy","communications",{science:370,faith:150,culture:120},["public_mycelium_network"],{perSecond:{science:0.22,faith:0.12,culture:0.1}}),"fungoid"),
    lineage(tech("living_city_codes","Living City Codes","medicine",{science:370,food:190,medicine:130},["green_belt_authority"],{perSecond:{food:0.22,medicine:0.12,happiness:0.1}}),"plantoid"),
    lineage(tech("tectonic_scheduling","Tectonic Scheduling","transport",{science:370,production:190,stone:120},["seismic_rail_authority"],{perSecond:{production:0.24,strategic_total:0.08},upkeepBonus:-0.006}),"lithoid"),
    lineage(tech("memorial_command","Memorial Command","military",{science:380,faith:170,command:110},["veterans_charnel_office"],{perSecond:{command:0.18,faith:0.14},score:58}),"necroid"),
    lineage(tech("hazmat_automation","Hazmat Automation","industry",{science:380,production:180,pollution:80},["industrial_safety_bureau"],{perSecond:{science:0.18,strategic_total:0.08},consume:{pollution:0.08}}),"toxoid")
  ].forEach(function(item){ addTech("empire",item); });

  [
    lineage(system("orbital_civic_forum","Orbital Civic Forum","Lineage variants","Humanoid orbital councils turn colonies into diplomacy, influence, and research continuity.",{production:410,science:240,influence:180},["orbital_habitat"],["Orbital civics"],"humanoid",{science:360,influence:280,diplomacy:180},{perSecond:{science:0.4,influence:0.24,diplomacy:0.12},consume:{energy:0.08}}),"humanoid"),
    lineage(system("nest_world_habitat","Nest-World Habitat","Lineage variants","Mammalian colony design prioritizes nurseries, happiness, and resilient growth.",{production:390,colonies:190,medicine:140},["orbital_habitat"],["Nest world"],"mammalian",{food:360,medicine:240,happiness:260},{perSecond:{food:0.42,medicine:0.2,happiness:0.16},populationGrowth:0.01}),"mammalian"),
    lineage(system("raptor_fleet_yards","Raptor Fleet Yards","Lineage variants","Reptilian yards turn alloys into predatory fleet readiness.",{production:440,alloys:310,military_power:190},["shipyard_ring"],["Raptor fleets"],"reptilian",{military_power:430,command:260},{perSecond:{military_power:0.64,command:0.24},consume:{alloys:0.08,energy:0.1}}),"reptilian"),
    lineage(system("orbital_grove_ring","Orbital Grove Ring","Lineage variants","Plantoid orbital habitats grow oxygen, food, and terraforming culture.",{production:400,food:250,water:180},["orbital_farms"],["Grove ring"],"plantoid",{food:430,terraforming:230,happiness:220},{perSecond:{food:0.52,terraforming:0.18,happiness:0.12},consume:{energy:0.08}}),"plantoid"),
    lineage(system("necropolis_station","Necropolis Station","Lineage variants","Necroid stations preserve cryonic remains as data, faith, and strategic continuity.",{production:420,data:240,faith:180},["cryogenic_seed_vault"],["Necropolis station"],"necroid",{data:360,faith:300,science:220},{perSecond:{data:0.46,faith:0.24,science:0.12},score:78}),"necroid"),
    lineage(system("toxin_world_labs","Toxin World Labs","Lineage variants","Toxoid exobiology exploits hostile worlds for medicine, science, and deterrence.",{production:420,science:260,terraforming:150},["xeno_embassy"],["Toxin world labs"],"toxoid",{science:390,medicine:260,military_power:220},{perSecond:{science:0.42,medicine:0.18,military_power:0.14},consume:{energy:0.08}}),"toxoid"),
    lineage(system("crystal_moon_foundry","Crystal Moon Foundry","Lineage variants","Lithoid moon foundries grow alloys and rare structure from mineral bodies.",{production:430,alloys:280,strategic_total:120},["lunar_foundry"],["Crystal moon"],"lithoid",{alloys:420,strategic_total:240,production:180},{perSecond:{alloys:0.5,strategic_total:0.18,production:0.12}}),"lithoid"),
    lineage(system("pelagic_cloud_archipelago","Pelagic Cloud Archipelago","Lineage variants","Aquatic floating colonies turn vapor seas into food, diplomacy, and colony support.",{production:410,water:260,colonies:170},["closed_loop_life_support"],["Cloud archipelago"],"aquatic",{water:420,food:260,diplomacy:220},{perSecond:{water:0.46,food:0.18,diplomacy:0.18},consume:{energy:0.06}}),"aquatic"),
    lineage(system("vacuum_brood_docks","Vacuum Brood Docks","Lineage variants","Arthropoid dock-broods breed ships, alloys, and command cadence in orbit.",{production:430,alloys:280,military_power:180},["shipyard_ring"],["Vacuum broods"],"arthropoid",{alloys:380,command:220,military_power:260},{perSecond:{alloys:0.4,command:0.18,military_power:0.18},consume:{energy:0.08}}),"arthropoid"),
    lineage(system("coronal_test_range","Coronal Test Range","Lineage variants","Extremophile research arrays skim stellar fury for energy, science, and threshold pressure.",{production:420,energy:290,science:180},["solar_array"],["Coronal trial"],"extremophile",{energy:460,science:280,ascension:130},{perSecond:{energy:0.8,science:0.22,ascension:0.08},upkeepBonus:-0.012}),"extremophile")
  ].forEach(function(item){ addSystem("solar",item); });

  [
    lineage(tech("orbital_civic_compacts","Orbital Civic Compacts","communications",{science:500,influence:230,diplomacy:160},["orbital_civic_forum"],{perSecond:{influence:0.22,diplomacy:0.14,science:0.12}}),"humanoid"),
    lineage(tech("family_arcologies","Family Arcologies","life_support",{science:460,colonies:220,medicine:180},["nest_world_habitat"],{perSecond:{happiness:0.16,medicine:0.14},populationGrowth:0.006}),"mammalian"),
    lineage(tech("strike_vector_gospels","Strike Vector Gospels","military",{science:480,military_power:260,command:160},["raptor_fleet_yards"],{perSecond:{military_power:0.34,command:0.18}}),"reptilian"),
    lineage(tech("photosynthetic_habitats","Photosynthetic Habitats","terraforming",{science:470,terraforming:220,food:220},["orbital_grove_ring"],{perSecond:{terraforming:0.24,food:0.24}}),"plantoid"),
    lineage(tech("cryonic_ancestor_law","Cryonic Ancestor Law","biology",{science:480,data:240,faith:180},["necropolis_station"],{perSecond:{data:0.24,faith:0.18},score:84}),"necroid"),
    lineage(tech("hostile_biosphere_trials","Hostile Biosphere Trials","biology",{science:480,medicine:210,terraforming:160},["toxin_world_labs"],{perSecond:{science:0.22,medicine:0.16,military_power:0.08}}),"toxoid"),
    lineage(tech("self_growing_lattices","Self-Growing Lattices","materials",{science:480,alloys:240,strategic_total:140},["crystal_moon_foundry"],{perSecond:{alloys:0.26,strategic_total:0.12}}),"lithoid"),
    lineage(tech("tide_orbit_curricula","Tide-Orbit Curricula","colonization",{science:500,water:240,colonies:170},["pelagic_cloud_archipelago"],{perSecond:{food:0.2,diplomacy:0.14,colonies:0.1}}),"aquatic"),
    lineage(tech("broodfleet_metallurgy","Broodfleet Metallurgy","automation",{science:510,alloys:250,command:150},["vacuum_brood_docks"],{perSecond:{alloys:0.24,military_power:0.12,command:0.1}}),"arthropoid"),
    lineage(tech("stellar_stress_theorems","Stellar Stress Theorems","astrophysics",{science:510,energy:280,science:220},["coronal_test_range"],{perSecond:{energy:0.36,science:0.16,ascension:0.06}}),"extremophile")
  ].forEach(function(item){ addTech("solar",item); });

  [
    lineage(system("senate_of_worlds","Senate of Worlds","Lineage variants","Humanoid interstellar assemblies convert diplomacy into data, law, and cohesion.",{energy:590,influence:430,diplomacy:320},["gateway_spine"],["World senate"],"humanoid",{influence:520,cohesion:360,data:260},{perSecond:{influence:0.34,cohesion:0.22,data:0.18,diplomacy:0.16}}),"humanoid"),
    lineage(system("clutch_constellation","Clutch Constellation","Lineage variants","Mammalian megahabitats turn star clusters into protected family networks.",{energy:560,colonies:420,medicine:300},["sector_network"],["Clutch constellation"],"mammalian",{food:520,happiness:420,unity:220},{perSecond:{happiness:0.34,unity:0.18,food:0.28},populationGrowth:0.01}),"mammalian"),
    lineage(system("war_sun_doctrine_node","War-Sun Doctrine Node","Lineage variants","Reptilian command temples focus military power into ascension pressure.",{energy:650,military_power:520,command:300},["sector_network"],["War sun doctrine"],"reptilian",{military_power:620,command:420,ascension:180},{perSecond:{military_power:0.78,command:0.34,ascension:0.12},consume:{energy:0.12}}),"reptilian"),
    lineage(system("galactic_mycelial_web","Galactic Mycelial Web","Lineage variants","Fungoid hyper-ecology links cultures through faith, data, and cohesion.",{energy:580,faith:430,culture:360},["sector_network"],["Galactic mycelia"],"fungoid",{faith:520,cohesion:380,data:280},{perSecond:{faith:0.42,cohesion:0.26,data:0.18}}),"fungoid"),
    lineage(system("crystal_arkology","Crystal Arkology","Lineage variants","Lithoid arkologies store rare matter and turn endurance into unity.",{energy:600,alloys:460,rare_matter:220},["dyson_swarm"],["Crystal arkology"],"lithoid",{rare_matter:380,unity:300,cohesion:260},{perSecond:{rare_matter:0.14,unity:0.2,cohesion:0.16},upkeepBonus:-0.012}),"lithoid"),
    lineage(system("thanatic_star_court","Thanatic Star Court","Lineage variants","Necroid star courts govern archived lives as faith, law, and ascension.",{data:560,faith:460,cohesion:300},["quantum_archive"],["Thanatic court"],"necroid",{faith:560,unity:360,ascension:260},{perSecond:{faith:0.42,unity:0.24,ascension:0.18},score:180}),"necroid"),
    lineage(system("toxic_nebula_refinery","Toxic Nebula Refinery","Lineage variants","Toxoid refineries turn hostile nebula chemistry into rare matter and military threat.",{energy:620,science:460,rare_matter:210},["dyson_swarm"],["Nebula toxins"],"toxoid",{rare_matter:360,science:360,military_power:320},{perSecond:{rare_matter:0.16,science:0.24,military_power:0.22},consume:{energy:0.12}}),"toxoid"),
    lineage(system("pelagic_gate_seas","Pelagic Gate Seas","Lineage variants","Aquatic gateworld basins synchronize food, diplomacy, and colony life across the lattice.",{energy:580,food:440,diplomacy:320},["gateway_spine"],["Gate seas"],"aquatic",{food:560,diplomacy:360,cohesion:240},{perSecond:{food:0.42,diplomacy:0.24,cohesion:0.16,colonies:0.1}}),"aquatic"),
    lineage(system("covenant_exchange_spine","Covenant Exchange Spine","Lineage variants","Molluscoid exchange-spines wrap luxury, treaty, and unity into one galactic market.",{energy:600,gold:460,diplomacy:340},["gateway_spine"],["Exchange spine"],"molluscoid",{gold:620,diplomacy:380,unity:240,luxury_total:260},{perSecond:{gold:0.5,diplomacy:0.24,unity:0.16,luxury_total:0.12}}),"molluscoid"),
    lineage(system("flare_citadel_array","Flare Citadel Array","Lineage variants","Extremophile citadels anchor harsh stars into energy, rare matter, and ascension discipline.",{energy:660,science:430,rare_matter:260},["dyson_swarm"],["Flare citadel"],"extremophile",{energy:620,rare_matter:360,ascension:220,happiness:180},{perSecond:{energy:0.76,rare_matter:0.18,ascension:0.14,happiness:0.08},upkeepBonus:-0.014}),"extremophile")
  ].forEach(function(item){ addSystem("galactic",item); });

  [
    lineage(tech("charter_of_worlds","Charter of Worlds","governance",{science:810,influence:420,diplomacy:320},["senate_of_worlds"],{perSecond:{cohesion:0.18,data:0.14,diplomacy:0.14}}),"humanoid"),
    lineage(tech("stellar_family_compacts","Stellar Family Compacts","governance",{science:780,colonies:420,diplomacy:300},["clutch_constellation"],{perSecond:{unity:0.22,cohesion:0.16,happiness:0.14}}),"mammalian"),
    lineage(tech("total_theater_suns","Total Theater Suns","military",{science:820,military_power:520,command:340},["war_sun_doctrine_node"],{perSecond:{military_power:0.42,ascension:0.14}}),"reptilian"),
    lineage(tech("sporelight_communion","Sporelight Communion","ecology",{science:800,faith:420,culture:340},["galactic_mycelial_web"],{perSecond:{faith:0.26,cohesion:0.18,unity:0.12}}),"fungoid"),
    lineage(tech("enduring_matter_covenants","Enduring Matter Covenants","stellar",{science:810,rare_matter:280,alloys:360},["crystal_arkology"],{perSecond:{rare_matter:0.12,unity:0.16},upkeepBonus:-0.008}),"lithoid"),
    lineage(tech("archived_afterlife_rights","Archived Afterlife Rights","consciousness",{science:830,data:480,faith:360},["thanatic_star_court"],{perSecond:{ascension:0.22,unity:0.18},score:210}),"necroid"),
    lineage(tech("regulated_xenotoxins","Regulated Xenotoxins","cosmology",{science:830,rare_matter:300,military_power:360},["toxic_nebula_refinery"],{perSecond:{rare_matter:0.1,science:0.18,military_power:0.18}}),"toxoid"),
    lineage(tech("tidegate_covenants","Tidegate Covenants","culture",{science:810,food:420,diplomacy:320},["pelagic_gate_seas"],{perSecond:{food:0.22,cohesion:0.14,diplomacy:0.14}}),"aquatic"),
    lineage(tech("velvet_route_compacts","Velvet Route Compacts","trade",{science:820,gold:440,diplomacy:340},["covenant_exchange_spine"],{perSecond:{gold:0.24,unity:0.16,diplomacy:0.14,luxury_total:0.08}}),"molluscoid"),
    lineage(tech("furnace_vow_engines","Furnace Vow Engines","dimensional",{science:840,energy:460,rare_matter:300},["flare_citadel_array"],{perSecond:{energy:0.3,ascension:0.16,rare_matter:0.12,cohesion:0.1}}),"extremophile")
  ].forEach(function(item){ addTech("galactic",item); });

  [
    lineage(system("river_metropolis_authority","River Metropolis Authority","Lineage variants","Aquatic administrations make sanitation, trade, and logistics flow through water-first cities.",{production:275,water:180,medicine:120},["sewage_network"],["River metropolis"],"aquatic",{water:320,medicine:240,logistics:170},{perSecond:{water:0.42,medicine:0.2,logistics:0.16},consume:{production:0.04}}),"aquatic"),
    lineage(system("industrial_hive_complex","Industrial Hive Complex","Lineage variants","Arthropoid industrial organization turns factory districts into dense production swarms.",{production:320,strategic_total:160,energy:120},["steel_mill"],["Industrial hive"],"arthropoid",{production:390,strategic_total:190,logistics:130},{perSecond:{production:0.72,strategic_total:0.12,logistics:0.12,pollution:0.06},consume:{energy:0.12}}),"arthropoid"),
    lineage(system("deep_reactor_sanctum","Deep Reactor Sanctum","Lineage variants","Extremophile reactor enclaves thrive under heat, radiation, and pressure.",{production:330,energy:230,strategic_total:120},["nuclear_program"],["Deep reactor"],"extremophile",{energy:430,science:210,happiness:120},{perSecond:{energy:1.05,science:0.2,happiness:0.08},consume:{strategic_total:0.08},upkeepBonus:-0.01}),"extremophile")
  ].forEach(function(item){ addSystem("empire",item); });

  [
    lineage(tech("hydraulic_megacity_codes","Hydraulic Megacity Codes","transport",{science:380,water:210,logistics:130},["river_metropolis_authority"],{perSecond:{water:0.24,logistics:0.16,medicine:0.08}}),"aquatic"),
    lineage(tech("swarm_shift_planning","Swarm Shift Planning","industry",{science:390,production:230,logistics:120},["industrial_hive_complex"],{perSecond:{production:0.34,logistics:0.12,strategic_total:0.08}}),"arthropoid"),
    lineage(tech("high_stress_reactor_safety","High-Stress Reactor Safety","energy",{science:395,energy:250,strategic_total:110},["deep_reactor_sanctum"],{perSecond:{energy:0.42,science:0.1},upkeepBonus:-0.008}),"extremophile")
  ].forEach(function(item){ addTech("empire",item); });

  [
    lineage(tech("bureaucratic_meritocracy","Bureaucratic Meritocracy","government",{science:420,influence:180,culture:130},["national_laboratory"],{resourceOutput:{science:0.12,influence:0.1},perSecond:{science:0.18,influence:0.1}}),"humanoid"),
    lineage(tech("welfare_state_ethic","Welfare State Ethic","medicine",{science:400,medicine:210,food:140},["welfare_ministry"],{resourceOutput:{medicine:0.14,food:0.08,happiness:0.1},populationGrowth:0.004}),"mammalian"),
    lineage(tech("predatory_statecraft","Predatory Statecraft","military",{science:420,military_power:240,command:150},["armored_war_college"],{resourceOutput:{military_power:0.16,command:0.1},perSecond:{military_power:0.16}}),"reptilian"),
    lineage(tech("broadcast_flock_protocols","Broadcast Flock Protocols","communications",{science:410,culture:220,logistics:130},["air_defense_grid"],{resourceOutput:{culture:0.13,logistics:0.1,data:0.08},perSecond:{culture:0.14,logistics:0.08}}),"avian"),
    lineage(tech("distributed_shift_castes","Distributed Shift Castes","industry",{science:420,production:240,strategic_total:130},["industrial_hive_complex"],{resourceOutput:{production:0.16,strategic_total:0.1,logistics:0.08},consume:{food:0.03}}),"arthropoid"),
    lineage(tech("liquid_capital_doctrine","Liquid Capital Doctrine","economics",{science:400,gold:250,diplomacy:150},["central_bank"],{resourceOutput:{gold:0.15,diplomacy:0.1,luxury_total:0.08},perSecond:{gold:0.12}}),"molluscoid"),
    lineage(tech("distributed_symbiosis_policy","Distributed Symbiosis Policy","communications",{science:410,faith:180,food:160},["public_mycelium_network"],{resourceOutput:{faith:0.12,food:0.1,science:0.06},upkeepBonus:-0.006}),"fungoid"),
    lineage(tech("biophilic_industrialism","Biophilic Industrialism","government",{science:410,food:210,medicine:140},["green_belt_authority"],{resourceOutput:{food:0.12,medicine:0.1,happiness:0.12},consume:{pollution:0.05}}),"plantoid"),
    lineage(tech("hydraulic_commonwealth","Hydraulic Commonwealth","transport",{science:410,water:240,diplomacy:140},["river_metropolis_authority"],{resourceOutput:{water:0.18,diplomacy:0.09,medicine:0.06},perSecond:{water:0.16}}),"aquatic"),
    lineage(tech("stone_continuity_planning","Stone Continuity Planning","industry",{science:410,production:220,stone:160},["seismic_rail_authority"],{resourceOutput:{production:0.1,strategic_total:0.12,energy:0.06},upkeepBonus:-0.01}),"lithoid"),
    lineage(tech("mortuary_civil_service","Mortuary Civil Service","government",{science:420,faith:210,command:130},["veterans_charnel_office"],{resourceOutput:{faith:0.15,command:0.1,culture:0.08},score:60}),"necroid"),
    lineage(tech("controlled_contamination_economy","Controlled Contamination Economy","industry",{science:430,medicine:170,pollution:90},["industrial_safety_bureau"],{resourceOutput:{science:0.1,medicine:0.09,military_power:0.08},consume:{pollution:0.08}}),"toxoid"),
    lineage(tech("hostile_environment_civic_design","Hostile Environment Civic Design","energy",{science:430,energy:260,medicine:120},["deep_reactor_sanctum"],{resourceOutput:{energy:0.16,science:0.08,happiness:0.06},upkeepBonus:-0.012}),"extremophile")
  ].forEach(function(item){ addTech("empire",item); });

  [
    lineage(system("stratospheric_roost_chain","Stratospheric Roost Chain","Lineage variants","Avian orbital colonies specialize in high-atmosphere tourism, scouting, and culture.",{production:420,alloys:230,tourism:160},["venus_cloud_city"],["Stratospheric roosts"],"avian",{tourism:360,culture:280,colonies:220},{perSecond:{tourism:0.58,culture:0.24,colonies:0.16},consume:{energy:0.08}}),"avian"),
    lineage(system("trade_shell_habitat","Trade-Shell Habitat","Lineage variants","Molluscoid habitats wrap markets, embassies, and soft-body comfort into one trade hub.",{production:410,diplomacy:260,gold:220},["xeno_embassy"],["Trade shell"],"molluscoid",{gold:420,diplomacy:330,luxury_total:220},{perSecond:{gold:0.58,diplomacy:0.26,luxury_total:0.12}}),"molluscoid"),
    lineage(system("mycelial_seed_arc","Mycelial Seed Arc","Lineage variants","Fungoid seed arcs move dormant ecologies between colonies for food, medicine, and terraforming.",{production:400,food:280,terraforming:150},["cryogenic_seed_vault"],["Mycelial seed arc"],"fungoid",{food:420,medicine:240,terraforming:260},{perSecond:{food:0.44,medicine:0.18,terraforming:0.2},consume:{water:0.06}}),"fungoid")
  ].forEach(function(item){ addSystem("solar",item); });

  [
    lineage(tech("thermal_updraft_logistics","Thermal Updraft Logistics","navigation",{science:500,tourism:210,culture:180},["stratospheric_roost_chain"],{perSecond:{tourism:0.28,culture:0.14,colonies:0.08}}),"avian"),
    lineage(tech("soft_contract_diplomacy","Soft Contract Diplomacy","trade",{science:500,diplomacy:260,gold:210},["trade_shell_habitat"],{perSecond:{diplomacy:0.22,gold:0.22,luxury_total:0.08}}),"molluscoid"),
    lineage(tech("dormant_spore_vaulting","Dormant Spore Vaulting","biology",{science:500,food:260,medicine:180},["mycelial_seed_arc"],{perSecond:{food:0.24,medicine:0.14,terraforming:0.12},upkeepBonus:-0.006}),"fungoid")
  ].forEach(function(item){ addTech("solar",item); });

  [
    lineage(system("migratory_star_chorus","Migratory Star Chorus","Lineage variants","Avian cultures synchronize fleets, beacons, and migration memory into cohesion.",{energy:560,culture:460,data:300},["chronicle_fleet"],["Star chorus"],"avian",{culture:560,cohesion:360,unity:260},{perSecond:{culture:0.48,cohesion:0.24,unity:0.18},consume:{energy:0.08}}),"avian"),
    lineage(system("drone_megaforge_cluster","Drone Megaforge Cluster","Lineage variants","Arthropoid megaforges produce fleet matter at galactic scale.",{energy:640,alloys:520,command:300},["sector_network"],["Drone megaforge"],"arthropoid",{alloys:620,military_power:420,command:320},{perSecond:{alloys:0.55,military_power:0.34,command:0.22},consume:{energy:0.18,rare_matter:0.04}}),"arthropoid"),
    lineage(system("living_gateway_grove","Living Gateway Grove","Lineage variants","Plantoid hyper-ecology makes transit routes into self-repairing biosphere corridors.",{terraforming:520,energy:500,diplomacy:320},["hyperlane_garden"],["Living gateway"],"plantoid",{terraforming:620,cohesion:360,happiness:330},{perSecond:{terraforming:0.54,cohesion:0.24,happiness:0.18},consume:{energy:0.12}}),"plantoid")
  ].forEach(function(item){ addSystem("galactic",item); });

  [
    lineage(tech("constellation_song_law","Constellation Song Law","culture",{science:820,culture:460,data:300},["migratory_star_chorus"],{perSecond:{culture:0.26,unity:0.16,cohesion:0.12}}),"avian"),
    lineage(tech("autonomous_fleet_broods","Autonomous Fleet Broods","military",{science:840,alloys:440,command:320},["drone_megaforge_cluster"],{perSecond:{military_power:0.34,command:0.18,alloys:0.12}}),"arthropoid"),
    lineage(tech("photosynthetic_hyperlanes","Photosynthetic Hyperlanes","ecology",{science:830,terraforming:460,diplomacy:320},["living_gateway_grove"],{perSecond:{terraforming:0.28,cohesion:0.16,happiness:0.12}}),"plantoid")
  ].forEach(function(item){ addTech("galactic",item); });

  [
    ["membrane_pump",{aquatic:0.7,molluscoid:0.3}],
    ["ribosome",{fungoid:0.6,mammalian:0.4}],
    ["vacuole",{molluscoid:0.7,aquatic:0.3}],
    ["mitochondria",{mammalian:1.2,arthropoid:0.5,avian:0.3}],
    ["smooth_er",{reptilian:0.7,mammalian:0.4,molluscoid:0.4}],
    ["golgi_apparatus",{humanoid:0.8,molluscoid:0.5,mammalian:0.2}],
    ["nucleus",{humanoid:1.0,mammalian:0.7,plantoid:0.4,fungoid:0.4}],
    ["cell_wall",{lithoid:1.0,plantoid:0.8,fungoid:0.3}],
    ["chloroplast",{plantoid:2.2,aquatic:0.5}],
    ["flagellum",{avian:1.0,aquatic:0.7,reptilian:0.4}],
    ["chemoreceptors",{toxoid:0.9,reptilian:0.5,aquatic:0.3}],
    ["lysosome",{fungoid:0.9,necroid:0.8,reptilian:0.3}],
    ["peroxisome",{toxoid:1.3,extremophile:0.6}],
    ["endosome",{molluscoid:0.9,humanoid:0.4,fungoid:0.3}],
    ["autophagosome",{necroid:1.5,fungoid:0.5,extremophile:0.4}],
    ["hydrogenosome",{extremophile:1.7,necroid:0.4}],
    ["glyoxysome",{plantoid:1.4,fungoid:0.5}],
    ["magnetosome",{avian:1.1,aquatic:0.5,extremophile:0.4}],
    ["contractile_vacuole",{aquatic:1.6,molluscoid:0.5}],
    ["proteasome",{fungoid:0.8,mammalian:0.5,necroid:0.3}],
    ["trichocyst",{reptilian:1.2,arthropoid:0.6}],
    ["vault_organelle",{humanoid:1.0,molluscoid:0.7}],
    ["pseudopodia",{molluscoid:1.1,aquatic:0.5,reptilian:0.3}],
    ["cilia",{aquatic:1.0,avian:0.7,molluscoid:0.3}],
    ["carboxysome",{plantoid:1.4,lithoid:0.4}],
    ["acidocalcisome",{extremophile:1.2,lithoid:0.8,toxoid:0.3}],
    ["apicoplast",{toxoid:1.0,plantoid:0.8,fungoid:0.3}],
    ["kinetoplast",{arthropoid:1.1,mammalian:0.5,extremophile:0.4}],
    ["storage_granules",{molluscoid:0.8,fungoid:0.4,mammalian:0.3}],
    ["secretory_vesicles",{humanoid:0.8,mammalian:0.6,molluscoid:0.4}],
    ["centrosome",{mammalian:1.2,humanoid:0.6,arthropoid:0.3}],
    ["extracellular_matrix",{mammalian:1.4,humanoid:0.5,molluscoid:0.3}],
    ["gap_junctions",{mammalian:1.3,humanoid:0.7}],
    ["apoptosome",{necroid:1.8,mammalian:0.4}],
    ["mitophagy_complex",{necroid:1.4,mammalian:0.5,extremophile:0.4}],
    ["necrosome",{necroid:3.0}],
    ["chromatophore",{plantoid:1.1,avian:0.5,aquatic:0.4}],
    ["nucleolus",{fungoid:0.8,mammalian:0.5,humanoid:0.4}],
    ["stigma_eyespot",{avian:1.0,aquatic:0.5}],
    ["silica_scales",{lithoid:1.6,aquatic:0.4}],
    ["centrosome",{mammalian:1.2,humanoid:0.6,arthropoid:0.3}],
    ["basal_body",{aquatic:1.0,avian:0.6}],
    ["predatory_vacuole",{reptilian:1.2,necroid:0.4}],
    ["silica_shell",{lithoid:1.6,aquatic:0.5}],
    ["bioluminescent_granules",{avian:0.9,aquatic:0.6,plantoid:0.3}],
    ["slime_mold_network",{fungoid:1.2,humanoid:0.5,molluscoid:0.4}],
    ["microtubules",{mammalian:0.8,humanoid:0.5,arthropoid:0.3}],
    ["microfilaments",{molluscoid:0.9,aquatic:0.4}],
    ["intermediate_filaments",{lithoid:0.9,mammalian:0.3}],
    ["plasmodesmata",{plantoid:1.3,fungoid:0.4}],
    ["symbiosome",{fungoid:1.1,plantoid:0.5,mammalian:0.4}],
    ["toxin_vacuole",{toxoid:1.6,necroid:0.3}],
    ["pressure_capsule",{extremophile:1.4,lithoid:0.5}],
    ["neural_vesicles",{humanoid:1.2,mammalian:0.6,avian:0.3}],
    ["cell_cortex",{mammalian:0.9,molluscoid:0.5,humanoid:0.3}],
    ["glycocalyx",{molluscoid:0.9,mammalian:0.4,toxoid:0.3}],
    ["crystal_inclusion",{lithoid:1.3,extremophile:0.5}],
    ["quorum_signals",{humanoid:1.2,mammalian:0.4,fungoid:0.4}]
  ].forEach(function(row){ setAffinity("cell",row[0],row[1]); });

  [
    ["nest",{mammalian:1.5}],
    ["foraging_pack",{aquatic:0.7,mammalian:0.5,reptilian:0.4}],
    ["watering_path",{aquatic:0.9,reptilian:0.6}],
    ["tool_use",{humanoid:1.2,arthropoid:0.4}],
    ["thinking_cluster",{humanoid:1.6,mammalian:0.5}],
    ["den_network",{mammalian:1.8}],
    ["hunting_pack",{reptilian:1.2,mammalian:0.6,necroid:0.3}],
    ["burrow",{arthropoid:1.2,mammalian:0.4}],
    ["territory_marks",{mammalian:0.9,reptilian:0.7}],
    ["bone_cache",{reptilian:0.8,necroid:0.8}],
    ["nursery_grove",{plantoid:1.1,mammalian:0.7}],
    ["mimicry_display",{avian:1.2,molluscoid:0.4}],
    ["symbiotic_gut",{fungoid:1.0,mammalian:0.5}],
    ["migration_paths",{aquatic:1.0,avian:0.6}],
    ["milk_glands",{mammalian:3.0}],
    ["warm_blooded_core",{mammalian:2.2,avian:0.4}],
    ["carrion_cycle",{necroid:1.8,fungoid:0.5}],
    ["torpor_reflex",{necroid:1.6,extremophile:0.6}],
    ["brood_husk",{necroid:2.4,arthropoid:0.4}],
    ["fat_reserves",{mammalian:1.4,extremophile:0.3}],
    ["pack_hierarchy",{mammalian:1.5,reptilian:0.7}],
    ["tool_cache",{humanoid:1.4}],
    ["territorial_border",{reptilian:1.4,mammalian:0.4}],
    ["proto_fire_site",{humanoid:1.7,mammalian:0.3}],
    ["migration_moot",{aquatic:1.0,mammalian:0.5,avian:0.4}],
    ["sensory_pits",{reptilian:0.9,avian:0.5,mammalian:0.3}],
    ["wing_membrane",{avian:1.8,mammalian:0.2}],
    ["chitin_plates",{arthropoid:1.8,lithoid:0.4}],
    ["mantle_fold",{molluscoid:1.6,aquatic:0.6}],
    ["spore_bed",{fungoid:1.5,necroid:0.6}],
    ["stone_gizzard",{lithoid:1.2,reptilian:0.5}],
    ["venom_sacs",{toxoid:2.0,reptilian:0.4}],
    ["thermal_burrow",{extremophile:1.6,mammalian:0.3}],
    ["compound_eyes",{arthropoid:1.6,avian:0.5,reptilian:0.3}],
    ["song_display",{avian:1.6,mammalian:0.4}],
    ["ink_sac",{molluscoid:1.4,aquatic:0.6,toxoid:0.3}],
    ["mycelial_skin",{fungoid:1.7,necroid:0.4,plantoid:0.3}],
    ["shell_garden",{molluscoid:1.5,aquatic:0.7,lithoid:0.3}],
    ["hive_cluster",{arthropoid:1.7,mammalian:0.3}],
    ["sun_basking_rocks",{reptilian:1.4,extremophile:0.5}],
    ["wake_songs",{avian:1.5,mammalian:0.4,aquatic:0.3}]
  ].forEach(function(row){ setAffinity("creature",row[0],row[1]); });

  DATA.STAGES.forEach(function(stage){
    stage.systems.forEach(function(item){
      Object.keys(item.cost||{}).forEach(function(key){ ensureStageResource(stage.id,key); });
      Object.keys(item.capacity||{}).forEach(function(key){ ensureStageResource(stage.id,key); });
      Object.keys((item.effects||{}).perSecond||{}).forEach(function(key){ ensureStageResource(stage.id,key); });
      Object.keys((item.effects||{}).consume||{}).forEach(function(key){ ensureStageResource(stage.id,key); });
    });
    stage.technologies.forEach(function(item){
      Object.keys(item.cost||{}).forEach(function(key){ ensureStageResource(stage.id,key); });
      Object.keys((item.effects||{}).perSecond||{}).forEach(function(key){ ensureStageResource(stage.id,key); });
      Object.keys((item.effects||{}).consume||{}).forEach(function(key){ ensureStageResource(stage.id,key); });
      Object.keys((item.effects||{}).capacity||{}).forEach(function(key){ ensureStageResource(stage.id,key); });
    });
  });

  window.EvolutionData = DATA;
})();
