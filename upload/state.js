(function(){
  const DATA = window.EvolutionData;
  const M = {};

  M.state = {
    running:true,
    speedIndex:0,
    ui:{
      tab:"actions",
      systemsCategory:"",
      automationCategory:"",
      techCategory:"",
      debug:false,
      compact:false,
      optionsOpen:false,
      betweenRuns:false,
      betweenRunsStep:"review",
      previewAffinity:null,
      inputActive:false,
      focusOverlayMinimized:false,
      focusCategory:"all",
      mobileLayoutPrimed:false,
      focusAutoMinimizedOnce:false,
      focusAutoMinimizedStage:"",
      showLockedContent:false,
      stageObjectivesExpanded:false,
      archiveFilter:"all",
      archiveSearch:"",
      storyFilter:"all",
      resourceBreakdown:"",
      universeSummaryOpen:false,
      debugStageTarget:"cell",
      debugFrontierTarget:"cell",
      debugLayerTarget:"evolution"
    },
    game:null
  };

  M.emptyResources = function(){
    return Object.fromEntries(DATA.RESOURCES.map(function(item){ return [item.id,0]; }));
  };

  M.emptyCapacities = function(){
    const caps={};
    DATA.RESOURCES.forEach(function(item){ caps[item.id]=25; });
    caps.atp=30;
    caps.happiness=100;
    return caps;
  };

  M.createMeta = function(){
    const futureLayers=Object.fromEntries((DATA.PRESTIGE_LAYERS||[]).filter(function(layer){ return layer.id!=="evolution"; }).map(function(layer){
      return [layer.id,{unlocked:false,count:0}];
    }));
    const futureCurrencies=Object.fromEntries((DATA.PRESTIGE_LAYERS||[]).filter(function(layer){
      return !["evolution","enlightenment","transcendence"].includes(layer.id);
    }).map(function(layer){ return [layer.id,0]; }));
    const futureLayerUpgrades=Object.fromEntries((DATA.PRESTIGE_LAYERS||[]).filter(function(layer){
      return !["evolution","enlightenment","transcendence"].includes(layer.id);
    }).map(function(layer){
      const defs=(DATA[(layer.id||"").toUpperCase()+"_UPGRADES"]||((DATA.FUTURE_LAYER_UPGRADES||{})[layer.id])||[]);
      return [layer.id,Object.fromEntries(defs.map(function(up){ return [up.id,0]; }))];
    }));
    return {
      evolutionPoints:0,
      enlightenmentPoints:0,
      transcendencePoints:0,
      galacticWins:0,
      frontierStageIndex:0,
      stageClearCounts:{},
      upgrades:Object.fromEntries(DATA.SHOP_UPGRADES.map(function(up){ return [up.id,0]; })),
      enlightenmentUpgrades:Object.fromEntries((DATA.ENLIGHTENMENT_UPGRADES||[]).map(function(up){ return [up.id,0]; })),
      transcendenceUpgrades:Object.fromEntries((DATA.TRANSCENDENCE_UPGRADES||[]).map(function(up){ return [up.id,0]; })),
      autoOrganelleTarget:"humanoid",
      automationSettings:{organellesEnabled:true,infrastructureEnabled:true},
      revealedArchetypes:{},
      unlockedRareArchetypes:{ lithoid:false, necroid:false, toxoid:false, extremophile:false },
      archetypeWins:{},
      seenSpecializations:{},
      seenEvents:{},
      seenContent:{},
      completedContracts:{},
      threatScars:{},
      crisisHistory:{events:{},stages:{},responses:[],affinity:{},resolvedTotal:0},
      completedProjects:{},
      transformedScars:{},
      museumRewards:{},
      legacyTier:"standard",
      eraLegacies:{},
      vassals:{},
      cosmeticTheme:"",
      lastRunReview:null,
      rivalEndings:[],
      lineageChronicles:[],
      storyEntries:{first_spark:true},
      storyMoments:[{id:"first_spark",time:Date.now()}],
      storyAcknowledged:{},
      finalTestaments:[],
      foresightLedger:{predicted:{},solved:{},solvedCount:0,routeWins:{},bottlenecksSolved:0},
      offeringLedger:{totalOfferings:0,divinityFromOfferings:0,byOffering:{},byChannel:{}},
      heresyHistory:{responses:{},types:{}},
      lastMilestoneWins:0,
      victoryLog:[],
      artifacts:{},
      artifactEvolutions:{},
      rivalDossiers:{},
      stageMastery:{},
      stageLayouts:{},
      completedMasteryChallenges:{},
      activeEvolutionChallenge:"",
      archiveFavorites:{},
      evolvedDoctrines:{},
      masteryRelics:{},
      congressSeasons:{},
      wornArtifacts:{},
      restoredArtifacts:{},
      restorationHistory:{},
      activeRelics:{},
      congressInstitutionLevels:{},
      templates:{},
      templateDefaults:{global:"",frontier:{}},
      seedAutopilotEnabled:true,
      guidanceEnabled:true,
      crisisIntensity:"normal",
      divinityFocus:"growth",
      futureCurrencies:futureCurrencies,
      futureLayerUpgrades:futureLayerUpgrades,
      genesisChoices:{},
      worshipMode:"devotion",
      divineLaws:[],
      hybridLineages:[],
      hybridLegacies:{},
      instabilityStance:"contained",
      divineMask:"radiant_sovereign",
      prayerPolarity:"reverence",
      divinityPreset:"balanced",
      prayerRouting:{growth:17,harmony:17,conquest:16,wealth:16,knowledge:17,transcendence:17},
      boundEchoes:[],
      futureDebtTier:"none",
      activeFork:"",
        activeForkBranch:null,
        forkArchives:[],
        mergedForkLessons:[],
        testamentClauses:[],
        canonEntries:[],
        permanenceWeaves:[],
        eternalInheritances:{law:"",lineage:"",relic:"",memory:""},
        genesisMastery:{cradleWins:{},awakenedSeeds:{},primeSeen:{},geographySeen:{}},
        apotheosisMastery:{worshipWins:{},miraclesUsed:{},heresyOutcomes:{},lawsEnacted:{}},
        divinityMastery:{maskWins:{},polarityWins:{},channelsUnlocked:{},routingRuns:0},
        omnipotenceMastery:{hybridPairs:{},instabilityEvents:{}},
        infinityMastery:{echoBindings:{},debtTiers:{},mergedForks:{},forkFamilies:{},branchLegacies:{scars:0,blessings:0}},
        eternityMastery:{clausesSealed:{},canonKinds:{},weavesSealed:{},preservedUniverses:0,resets:0},
        compressedStageBands:{},
        logicCore:"balanced",
        activeScripts:{},
        preservedUniverses:[],
      universeResetCount:0,
      universePreserveCount:0,
      selectedUniverseBoon:"",
      universeBoons:{},
      mapPresets:{},
      futureLayers:futureLayers
    };
  };

  M.createRun = function(meta){
    const resources=M.emptyResources();
    const capacities=M.emptyCapacities();
    const warmStart=(meta.upgrades.start||0)*2;
    resources.atp=5+warmStart;
    resources.happiness=75;
    return {
      stageIndex:0,
      time:0,
      population:8,
      resources:resources,
      capacities:capacities,
      ownedSystems:{},
      automation:{},
      technologies:{},
      archive:[],
      lockedArchetype:null,
      secondaryArchetype:null,
      specialization:null,
      lineageEvents:{},
      claimedGoals:{},
      mapSlots:{},
      expandedSlots:{},
      mutatorDrafts:{},
      activeMutators:{},
      lineageLaws:{},
      worldEvents:{},
      worldEventChoices:{},
      congressChoice:"",
      mapWonders:{},
      mapWonderLevels:{},
      wonderMaintenanceTimer:0,
      rivalDefections:{},
      vassalDemands:{},
      specialProject:null,
      pendingProjectChoice:null,
      ascensionPath:"",
      activeEvolutionChallenge:meta.activeEvolutionChallenge||"",
      doctrine:"",
      miracleCharges:1,
      miracleChargeProgress:0,
      heresyResponses:{},
      eraModifiers:{},
      eraRerolls:0,
      rivals:null,
      rivalEvents:{},
      threatProjects:{},
      activeContract:"",
      automationPolicy:meta.logicCore||"balanced",
      seedTemplateName:"",
      seedPreferredAscensionPath:"",
      seedPreferredCongressBloc:"",
      seedPreferredFTLMethod:"",
      resourceFailures:{},
      ritualCooldowns:{},
      ritualSurges:[],
      divinityGeneratedTotal:0,
      divinityGeneratedFromOfferings:0,
      foresightPredictions:{},
      log:["New run started."],
      strategic:{},
      luxury:{},
      autoTimers:{organelles:0,infrastructure:0,generators:0}
    };
  };

  M.createGame = function(){
    const meta=M.createMeta();
    return { meta:meta, run:M.createRun(meta) };
  };

  M.saveGame = function(){
    localStorage.setItem(DATA.STORAGE_KEY, JSON.stringify(M.state.game));
  };

  function migrateMeta(meta){
    if(!meta.upgrades) meta.upgrades=Object.fromEntries(DATA.SHOP_UPGRADES.map(function(up){ return [up.id,0]; }));
    if(!meta.enlightenmentUpgrades) meta.enlightenmentUpgrades=Object.fromEntries((DATA.ENLIGHTENMENT_UPGRADES||[]).map(function(up){ return [up.id,0]; }));
    if(!meta.transcendenceUpgrades) meta.transcendenceUpgrades=Object.fromEntries((DATA.TRANSCENDENCE_UPGRADES||[]).map(function(up){ return [up.id,0]; }));
    if(!meta.futureCurrencies) meta.futureCurrencies={};
    if(!meta.futureLayerUpgrades) meta.futureLayerUpgrades={};
    (DATA.PRESTIGE_LAYERS||[]).filter(function(layer){ return !["evolution","enlightenment","transcendence"].includes(layer.id); }).forEach(function(layer){
      if(meta.futureCurrencies[layer.id]==null) meta.futureCurrencies[layer.id]=0;
      if(!meta.futureLayerUpgrades[layer.id]) meta.futureLayerUpgrades[layer.id]={};
      const defs=(DATA[(layer.id||"").toUpperCase()+"_UPGRADES"]||((DATA.FUTURE_LAYER_UPGRADES||{})[layer.id])||[]);
      defs.forEach(function(up){ if(meta.futureLayerUpgrades[layer.id][up.id]==null) meta.futureLayerUpgrades[layer.id][up.id]=0; });
    });
    if(meta.enlightenmentPoints==null) meta.enlightenmentPoints=0;
    if(meta.transcendencePoints==null) meta.transcendencePoints=0;
    if(meta.frontierStageIndex==null) meta.frontierStageIndex=0;
    if(!meta.stageClearCounts) meta.stageClearCounts={};
    DATA.SHOP_UPGRADES.forEach(function(up){ if(meta.upgrades[up.id]==null) meta.upgrades[up.id]=0; });
    (DATA.ENLIGHTENMENT_UPGRADES||[]).forEach(function(up){ if(meta.enlightenmentUpgrades[up.id]==null) meta.enlightenmentUpgrades[up.id]=0; });
    (DATA.TRANSCENDENCE_UPGRADES||[]).forEach(function(up){ if(meta.transcendenceUpgrades[up.id]==null) meta.transcendenceUpgrades[up.id]=0; });
    if(!meta.autoOrganelleTarget) meta.autoOrganelleTarget="humanoid";
    if(!meta.automationSettings) meta.automationSettings={organellesEnabled:true,infrastructureEnabled:true};
    if(meta.automationSettings.organellesEnabled==null) meta.automationSettings.organellesEnabled=true;
    if(meta.automationSettings.infrastructureEnabled==null) meta.automationSettings.infrastructureEnabled=true;
    if(!meta.revealedArchetypes) meta.revealedArchetypes={};
    if(!meta.unlockedRareArchetypes) meta.unlockedRareArchetypes={ lithoid:false, necroid:false, toxoid:false, extremophile:false };
    if(!meta.archetypeWins) meta.archetypeWins={};
    if(!meta.seenSpecializations) meta.seenSpecializations={};
    if(!meta.seenEvents) meta.seenEvents={};
    if(!meta.seenContent) meta.seenContent={};
    if(!meta.completedContracts) meta.completedContracts={};
    if(!meta.threatScars) meta.threatScars={};
    if(!meta.crisisHistory) meta.crisisHistory={events:{},stages:{},responses:[],affinity:{},resolvedTotal:0};
    if(!meta.crisisHistory.events) meta.crisisHistory.events={};
    if(!meta.crisisHistory.stages) meta.crisisHistory.stages={};
    if(!meta.crisisHistory.responses) meta.crisisHistory.responses=[];
    if(!meta.crisisHistory.affinity) meta.crisisHistory.affinity={};
    if(meta.crisisHistory.resolvedTotal==null) meta.crisisHistory.resolvedTotal=meta.crisisHistory.responses.length||0;
    if(!meta.completedProjects) meta.completedProjects={};
    if(!meta.transformedScars) meta.transformedScars={};
    if(!meta.museumRewards) meta.museumRewards={};
    if(!meta.legacyTier) meta.legacyTier="standard";
    if(!meta.eraLegacies) meta.eraLegacies={};
    if(!meta.vassals) meta.vassals={};
    if(!meta.cosmeticTheme) meta.cosmeticTheme="";
    if(!meta.lastRunReview) meta.lastRunReview=null;
    if(!meta.rivalEndings) meta.rivalEndings=[];
    if(!meta.lineageChronicles) meta.lineageChronicles=[];
    if(!meta.storyEntries) meta.storyEntries={first_spark:true};
    if(!meta.storyMoments) meta.storyMoments=[{id:"first_spark",time:Date.now()}];
    if(!meta.storyAcknowledged) meta.storyAcknowledged={};
    if(!meta.finalTestaments) meta.finalTestaments=[];
    if(meta.lastMilestoneWins==null) meta.lastMilestoneWins=0;
    if(!meta.victoryLog) meta.victoryLog=[];
    if(!meta.artifacts) meta.artifacts={};
      if(!meta.artifactEvolutions) meta.artifactEvolutions={};
      if(!meta.rivalDossiers) meta.rivalDossiers={};
      if(!meta.stageMastery) meta.stageMastery={};
    if(!meta.stageLayouts) meta.stageLayouts={};
    if(!meta.completedMasteryChallenges) meta.completedMasteryChallenges={};
    if(!meta.activeEvolutionChallenge) meta.activeEvolutionChallenge="";
    if(!meta.archiveFavorites) meta.archiveFavorites={};
    if(!meta.evolvedDoctrines) meta.evolvedDoctrines={};
    if(!meta.masteryRelics) meta.masteryRelics={};
    if(!meta.congressSeasons) meta.congressSeasons={};
    if(!meta.wornArtifacts) meta.wornArtifacts={};
    if(!meta.restoredArtifacts) meta.restoredArtifacts={};
    if(!meta.restorationHistory) meta.restorationHistory={};
    if(!meta.activeRelics) meta.activeRelics={};
    if(!meta.congressInstitutionLevels) meta.congressInstitutionLevels={};
    if(!meta.templates) meta.templates={};
    if(!meta.templateDefaults) meta.templateDefaults={global:"",frontier:{}};
    if(meta.templateDefaults.global==null) meta.templateDefaults.global="";
    if(!meta.templateDefaults.frontier) meta.templateDefaults.frontier={};
    if(meta.seedAutopilotEnabled==null) meta.seedAutopilotEnabled=true;
    if(meta.guidanceEnabled==null) meta.guidanceEnabled=true;
    if(!meta.crisisIntensity) meta.crisisIntensity="normal";
    if(!meta.divinityFocus) meta.divinityFocus=meta.enlightenmentAxiom||"growth";
    if(!meta.mapPresets) meta.mapPresets={};
    if(!meta.genesisChoices) meta.genesisChoices={};
    if(!meta.worshipMode) meta.worshipMode="devotion";
    if(!meta.divineLaws) meta.divineLaws=[];
    if(!meta.hybridLineages) meta.hybridLineages=[];
    if(!meta.instabilityStance) meta.instabilityStance="contained";
    if(!meta.divineMask) meta.divineMask="radiant_sovereign";
    if(!meta.prayerPolarity) meta.prayerPolarity="reverence";
    if(!meta.divinityPreset) meta.divinityPreset="balanced";
    if(!meta.prayerRouting) meta.prayerRouting={growth:17,harmony:17,conquest:16,wealth:16,knowledge:17,transcendence:17};
      if(!meta.boundEchoes) meta.boundEchoes=[];
      if(!meta.futureDebtTier) meta.futureDebtTier="none";
      if(!meta.activeFork) meta.activeFork="";
      if(meta.activeForkBranch===undefined) meta.activeForkBranch=null;
      if(!meta.forkArchives) meta.forkArchives=[];
      if(!meta.mergedForkLessons) meta.mergedForkLessons=[];
        if(!meta.testamentClauses) meta.testamentClauses=[];
        if(!meta.canonEntries) meta.canonEntries=[];
        if(!meta.permanenceWeaves) meta.permanenceWeaves=[];
        if(!meta.eternalInheritances) meta.eternalInheritances={law:"",lineage:"",relic:"",memory:""};
      if(!meta.genesisMastery) meta.genesisMastery={cradleWins:{},awakenedSeeds:{},primeSeen:{},geographySeen:{}};
      if(!meta.genesisMastery.cradleWins) meta.genesisMastery.cradleWins={};
      if(!meta.genesisMastery.awakenedSeeds) meta.genesisMastery.awakenedSeeds={};
      if(!meta.genesisMastery.primeSeen) meta.genesisMastery.primeSeen={};
      if(!meta.genesisMastery.geographySeen) meta.genesisMastery.geographySeen={};
      if(!meta.apotheosisMastery) meta.apotheosisMastery={worshipWins:{},miraclesUsed:{},heresyOutcomes:{},lawsEnacted:{}};
      if(!meta.apotheosisMastery.worshipWins) meta.apotheosisMastery.worshipWins={};
      if(!meta.apotheosisMastery.miraclesUsed) meta.apotheosisMastery.miraclesUsed={};
      if(!meta.apotheosisMastery.heresyOutcomes) meta.apotheosisMastery.heresyOutcomes={};
      if(!meta.apotheosisMastery.lawsEnacted) meta.apotheosisMastery.lawsEnacted={};
      if(!meta.divinityMastery) meta.divinityMastery={maskWins:{},polarityWins:{},channelsUnlocked:{},routingRuns:0};
      if(!meta.divinityMastery.maskWins) meta.divinityMastery.maskWins={};
      if(!meta.divinityMastery.polarityWins) meta.divinityMastery.polarityWins={};
      if(!meta.divinityMastery.channelsUnlocked) meta.divinityMastery.channelsUnlocked={};
      if(meta.divinityMastery.routingRuns==null) meta.divinityMastery.routingRuns=0;
      if(!meta.omnipotenceMastery) meta.omnipotenceMastery={hybridPairs:{},instabilityEvents:{}};
      if(!meta.omnipotenceMastery.hybridPairs) meta.omnipotenceMastery.hybridPairs={};
      if(!meta.omnipotenceMastery.instabilityEvents) meta.omnipotenceMastery.instabilityEvents={};
      if(!meta.infinityMastery) meta.infinityMastery={echoBindings:{},debtTiers:{},mergedForks:{},forkFamilies:{},branchLegacies:{scars:0,blessings:0}};
      if(!meta.infinityMastery.echoBindings) meta.infinityMastery.echoBindings={};
      if(!meta.infinityMastery.debtTiers) meta.infinityMastery.debtTiers={};
      if(!meta.infinityMastery.mergedForks) meta.infinityMastery.mergedForks={};
      if(!meta.infinityMastery.forkFamilies) meta.infinityMastery.forkFamilies={};
      if(!meta.infinityMastery.branchLegacies) meta.infinityMastery.branchLegacies={scars:0,blessings:0};
      if(meta.infinityMastery.branchLegacies.scars==null) meta.infinityMastery.branchLegacies.scars=0;
      if(meta.infinityMastery.branchLegacies.blessings==null) meta.infinityMastery.branchLegacies.blessings=0;
      if(!meta.eternityMastery) meta.eternityMastery={clausesSealed:{},canonKinds:{},weavesSealed:{},preservedUniverses:0,resets:0};
      if(!meta.eternityMastery.clausesSealed) meta.eternityMastery.clausesSealed={};
      if(!meta.eternityMastery.canonKinds) meta.eternityMastery.canonKinds={};
      if(!meta.eternityMastery.weavesSealed) meta.eternityMastery.weavesSealed={};
      if(meta.eternityMastery.preservedUniverses==null) meta.eternityMastery.preservedUniverses=0;
      if(meta.eternityMastery.resets==null) meta.eternityMastery.resets=0;
      if(!meta.compressedStageBands) meta.compressedStageBands={};
    if(!meta.logicCore) meta.logicCore="balanced";
    if(!meta.hybridLegacies) meta.hybridLegacies={};
    if(!meta.activeScripts) meta.activeScripts={};
    if(!meta.preservedUniverses) meta.preservedUniverses=[];
    if(meta.universeResetCount==null) meta.universeResetCount=0;
    if(meta.universePreserveCount==null) meta.universePreserveCount=0;
    if(meta.selectedUniverseBoon==null) meta.selectedUniverseBoon="";
    if(!meta.universeBoons) meta.universeBoons={};
    if(!meta.futureLayers) meta.futureLayers={};
    (DATA.PRESTIGE_LAYERS||[]).filter(function(layer){ return layer.id!=="evolution"; }).forEach(function(layer){
      if(!meta.futureLayers[layer.id]) meta.futureLayers[layer.id]={unlocked:false,count:0};
    });
    meta.frontierStageIndex=Math.max(0,Math.min(DATA.STAGES.length-1,meta.frontierStageIndex||0));
  }

  function migrateRun(run){
    if(run.stageIndex>=DATA.STAGES.length) run.stageIndex=0;
    if(!run.resources) run.resources=M.emptyResources();
    if(!run.capacities) run.capacities=M.emptyCapacities();
    Object.keys(M.emptyResources()).forEach(function(key){ if(run.resources[key]==null) run.resources[key]=0; });
    Object.entries(M.emptyCapacities()).forEach(function(entry){ if(run.capacities[entry[0]]==null) run.capacities[entry[0]]=entry[1]; });
    migrateLegacyMaterial(run);
    if(!run.ownedSystems) run.ownedSystems={};
    if(!run.automation) run.automation={};
    if(!run.technologies) run.technologies={};
    if(!run.archive) run.archive=[];
    if(!run.strategic) run.strategic={};
    if(!run.luxury) run.luxury={};
    if(!run.lineageEvents) run.lineageEvents={};
    if(!run.claimedGoals) run.claimedGoals={};
    if(!run.mapSlots) run.mapSlots={};
    if(!run.expandedSlots) run.expandedSlots={};
    if(!run.mutatorDrafts) run.mutatorDrafts={};
    if(!run.activeMutators) run.activeMutators={};
    if(!run.lineageLaws) run.lineageLaws={};
    if(!run.worldEvents) run.worldEvents={};
    if(!run.worldEventChoices) run.worldEventChoices={};
    if(!run.congressChoice) run.congressChoice="";
    if(!run.mapWonders) run.mapWonders={};
    if(!run.mapWonderLevels) run.mapWonderLevels={};
    if(run.wonderMaintenanceTimer==null) run.wonderMaintenanceTimer=0;
    if(!run.rivalDefections) run.rivalDefections={};
    if(!run.vassalDemands) run.vassalDemands={};
    if(!run.specialProject) run.specialProject=null;
    if(!run.pendingProjectChoice) run.pendingProjectChoice=null;
    if(run.ascensionPath==null) run.ascensionPath="";
    if(!run.doctrine) run.doctrine="";
    if(!run.eraModifiers) run.eraModifiers={};
    if(run.eraRerolls==null) run.eraRerolls=0;
    if(!run.rivalEvents) run.rivalEvents={};
    if(!run.threatProjects) run.threatProjects={};
    if(run.activeContract==null) run.activeContract="";
    if(!run.automationPolicy) run.automationPolicy="balanced";
    if(!run.seedTemplateName) run.seedTemplateName="";
    if(!run.seedPreferredAscensionPath) run.seedPreferredAscensionPath="";
    if(!run.seedPreferredCongressBloc) run.seedPreferredCongressBloc="";
    if(!run.seedPreferredFTLMethod) run.seedPreferredFTLMethod="";
    if(!run.resourceFailures) run.resourceFailures={};
    if(run.miracleCharges==null) run.miracleCharges=1;
    if(run.miracleChargeProgress==null) run.miracleChargeProgress=0;
    if(!run.heresyResponses) run.heresyResponses={};
    if(!run.ritualCooldowns) run.ritualCooldowns={};
    if(!run.ritualSurges) run.ritualSurges=[];
    if(run.secondaryArchetype==null) run.secondaryArchetype=null;
    if(!run.autoTimers) run.autoTimers={organelles:0,infrastructure:0,generators:0};
    if(run.autoTimers.infrastructure==null) run.autoTimers.infrastructure=run.autoTimers.generators||0;
    if(run.lockedArchetype==null){
      const creatureArchive=run.archive.find(function(entry){ return entry.stageId==="creature"&&entry.archetype; });
      run.lockedArchetype=creatureArchive?creatureArchive.archetype:null;
    }
  }

  function migrateLegacyMaterial(run){
    const stage=(DATA.STAGES||[])[run.stageIndex]||DATA.STAGES[0];
    const stock=Number(run.resources.material||0);
    const cap=Number(run.capacities.material||0);
    if(stock>0){
      if(stage && stage.id==="creature"){
        run.resources.materials=(run.resources.materials||0)+stock;
      } else if(stage && stage.id==="tribal"){
        run.resources.wood=(run.resources.wood||0)+stock*0.5;
        run.resources.stone=(run.resources.stone||0)+stock*0.3;
        run.resources.clay=(run.resources.clay||0)+stock*0.2;
      } else if(stage && ["civilization","empire","solar","galactic"].includes(stage.id)){
        run.resources.production=(run.resources.production||0)+stock;
      }
    }
    if(cap>0){
      if(stage && stage.id==="creature"){
        run.capacities.materials=Math.max(run.capacities.materials||25,cap);
      } else if(stage && stage.id==="tribal"){
        run.capacities.wood=Math.max(run.capacities.wood||25,Math.round(cap*0.5));
        run.capacities.stone=Math.max(run.capacities.stone||25,Math.round(cap*0.3));
        run.capacities.clay=Math.max(run.capacities.clay||25,Math.round(cap*0.2));
      } else if(stage && ["civilization","empire","solar","galactic"].includes(stage.id)){
        run.capacities.production=Math.max(run.capacities.production||25,cap);
      }
    }
    delete run.resources.material;
    delete run.capacities.material;
  }

  M.loadGame = function(){
    try{
      const raw=localStorage.getItem(DATA.STORAGE_KEY);
      M.state.game=raw?JSON.parse(raw):M.createGame();
      if(!M.state.game||!M.state.game.meta||!M.state.game.run) M.state.game=M.createGame();
      migrateMeta(M.state.game.meta);
      migrateRun(M.state.game.run);
      M.state.game.run.archive.forEach(function(entry){
        if(entry.archetype) M.state.game.meta.revealedArchetypes[entry.archetype]=true;
      });
    }catch(e){
      M.state.game=M.createGame();
    }
  };

  M.hardReset = function(){
    localStorage.removeItem(DATA.STORAGE_KEY);
    M.state.game=M.createGame();
    M.state.ui.tab="actions";
    M.state.ui.betweenRuns=false;
    M.state.ui.betweenRunsStep="review";
  };

  window.EvolutionState = M;
})();
