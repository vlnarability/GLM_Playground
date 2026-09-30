(function(){
  const DATA=window.EvolutionData, State=window.EvolutionState, state=State.state, L={};

  L.fmt=function(v){
    const n=Math.abs(v||0);
    const digits=n>=100?0:(n>=10?1:(n>=1?2:3));
    return new Intl.NumberFormat("en-US",{maximumFractionDigits:digits,minimumFractionDigits:n>0&&n<10?Math.min(2,digits):0}).format(v||0);
  };
  L.rateText=function(v){
    const value=v||0;
    if(Math.abs(value)<0.005) return "";
    return (value>=0?"+":"")+L.fmt(value)+"/s";
  };
  L.resourceDef=function(id){ return DATA.RESOURCES.find(function(item){ return item.id===id; }); };
  L.resourceName=function(id){ const f=L.resourceDef(id); return f?f.name:id; };
  L.divinityChannelIds=function(){ return ["divinity_growth","divinity_harmony","divinity_conquest","divinity_wealth","divinity_knowledge","divinity_transcendence"]; };
  L.storyEntryDef=function(id){ return (DATA.STORY_ENTRIES||[]).find(function(item){ return item.id===id; })||null; };
  L.unlockStoryEntry=function(id){
    const def=L.storyEntryDef(id);
    if(!def) return false;
    const seen=state.game.meta.storyEntries||(state.game.meta.storyEntries={});
    if(seen[id]) return false;
    seen[id]=true;
    (state.game.meta.storyMoments||(state.game.meta.storyMoments=[])).push({id:id,time:Date.now()});
    L.pushLog("Scripture recorded: "+def.title);
    return true;
  };
  L.storyEntries=function(){
    const seen=state.game.meta.storyEntries||{};
    const moments=state.game.meta.storyMoments||[];
    const dynamic=(state.game.meta.finalTestaments||[]).map(function(entry){
      return {id:"testament:"+entry.id,layer:"Eternity",title:entry.title,text:entry.text,lines:(entry.lines||[]).slice(),time:entry.time||0,dynamic:true};
    });
    return (DATA.STORY_ENTRIES||[]).filter(function(entry){ return !!seen[entry.id]; }).map(function(entry){
      const moment=moments.find(function(item){ return item.id===entry.id; })||null;
      return Object.assign({time:moment?moment.time:0},entry);
    }).concat(dynamic).sort(function(a,b){ return (a.time||0)-(b.time||0); });
  };
  L.pendingStoryEntries=function(){
    const acknowledged=state.game.meta.storyAcknowledged||{};
    return L.storyEntries().filter(function(entry){ return !acknowledged[entry.id]; });
  };
  L.currentStoryPrompt=function(){
    return L.pendingStoryEntries()[0] || null;
  };
  L.dismissStoryEntry=function(id){
    const def=L.storyEntryDef(id);
    const dynamic=(state.game.meta.finalTestaments||[]).some(function(entry){ return ("testament:"+entry.id)===id; });
    if(!def && !dynamic) return false;
    if(!state.game.meta.storyAcknowledged) state.game.meta.storyAcknowledged={};
    state.game.meta.storyAcknowledged[id]=true;
    return true;
  };
  L.storySummary=function(){
    const entries=L.storyEntries();
    const layers={};
    entries.forEach(function(entry){ layers[entry.layer]=(layers[entry.layer]||0)+1; });
    return {
      entries:entries,
      total:entries.length,
      layers:layers,
      latest:entries.length?entries[entries.length-1]:null,
      pending:L.pendingStoryEntries()
    };
  };
  L.storyLayers=function(){
    const layers=(DATA.STORY_ENTRIES||[]).map(function(entry){ return entry.layer; });
    return Array.from(new Set(layers));
  };
  L.divinityUnlocked=function(){ return !!(L.futureLayerState("enlightenment").unlocked || state.ui.debug); };
  L.divinityChannelVisible=function(id){
    const output=L.automationOutputPerSecond();
    return !!((state.game.run.resources[id]||0)>0 || Math.abs(output[id]||0)>=0.001 || state.ui.debug);
  };
  L.divinityBreakdown=function(){
    const output=L.automationOutputPerSecond();
    return L.divinityChannelIds().map(function(id){
      return {
        id:id,
        name:L.resourceName(id),
        value:state.game.run.resources[id]||0,
        perSecond:output[id]||0,
        capacity:L.capacityFor(id)
      };
    }).filter(function(row){ return L.divinityChannelVisible(row.id); });
  };
  L.divinityTotals=function(){
    const rows=L.divinityBreakdown();
    return {
      value:rows.reduce(function(sum,row){ return sum+row.value; },0),
      perSecond:rows.reduce(function(sum,row){ return sum+row.perSecond; },0),
      capacity:rows.reduce(function(sum,row){ return sum+row.capacity; },0),
      rows:rows
    };
  };
  L.divinityVisible=function(){
    const total=L.divinityTotals();
    return !!((total.value||0)>0 || Math.abs(total.perSecond||0)>=0.001 || state.ui.debug);
  };
  L.foresightNodeDefs=function(){ return DATA.FORESIGHT_NODES||[]; };
  L.foresightNodeState=function(id){
    const def=L.foresightNodeDefs().find(function(item){ return item.id===id; });
    if(!def) return null;
    const owned=!!L.enlightenmentUpgradeLevel(def.upgradeId);
    const missing=(def.requires||[]).filter(function(reqId){
      const req=L.foresightNodeDefs().find(function(item){ return item.id===reqId; });
      return req && !L.enlightenmentUpgradeLevel(req.upgradeId);
    });
    const upgrade=(DATA.ENLIGHTENMENT_UPGRADES||[]).find(function(item){ return item.id===def.upgradeId; })||null;
    return Object.assign({},def,{
      owned:owned,
      missing:missing,
      cost:upgrade?upgrade.cost:0,
      canBuy:!owned && !missing.length && !!upgrade && (state.ui.debug || ((state.game.meta.enlightenmentPoints||0)>=upgrade.cost))
    });
  };
  L.foresightNodesByLane=function(){
    const lanes={};
    L.foresightNodeDefs().forEach(function(node){
      if(!lanes[node.lane]) lanes[node.lane]=[];
      lanes[node.lane].push(L.foresightNodeState(node.id));
    });
    return lanes;
  };
  L.buyForesightNode=function(id){
    const node=L.foresightNodeState(id);
    if(!node || node.owned || node.missing.length) return false;
    return L.buyEnlightenmentUpgrade(node.upgradeId);
  };
  L.foresightLedger=function(){
    const ledger=state.game.meta.foresightLedger||(state.game.meta.foresightLedger={predicted:{},solved:{},solvedCount:0,routeWins:{},bottlenecksSolved:0});
    ledger.predicted||(ledger.predicted={});
    ledger.solved||(ledger.solved={});
    ledger.routeWins||(ledger.routeWins={});
    ledger.solvedCount=ledger.solvedCount||0;
    ledger.bottlenecksSolved=ledger.bottlenecksSolved||0;
    return ledger;
  };
  L.currentRouteKey=function(){
    return state.game.meta.divinityFocus || "growth";
  };
  L.foresightSignals=function(){
    if(!L.futureLayerState("enlightenment").unlocked && !state.ui.debug) return [];
    const stage=L.currentStage(), resources=state.game.run.resources||{}, output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    const alerts=L.pressureAlerts();
    const signals=[];
    function push(id,lane,severity,title,detail){
      signals.push({id:id,lane:lane,severity:severity,title:title,detail:detail});
    }
    if(L.enlightenmentUpgradeLevel("pressure_omens")>0){
      alerts.slice(0,3).forEach(function(alert,idx){
        push("pressure:"+alert.resource+":"+idx,"Pressure",alert.kind==="shortage"?3:2,alert.title,alert.detail);
      });
    }
    if(L.enlightenmentUpgradeLevel("resource_threads")>0){
      stage.resources.forEach(function(key){
        const net=(output[key]||0)-(upkeep[key]||0);
        const cap=L.capacityFor(key)||25;
        const value=resources[key]||0;
        if((upkeep[key]||0)>0 && net<=0.02 && value<cap*0.35){
          push("thread:"+key,"Pressure",2,"Weak resource chain",L.resourceName(key)+" is close to stalling. Strengthen the route feeding it.");
        }
      });
    }
    if(L.enlightenmentUpgradeLevel("synergy_visions")>0){
      if(stage.id==="solar" && !state.game.meta.completedProjects.ftl_theory_conclave) push("synergy:solar-theory","Route",2,"Solar route synergy","Shipyard-first economies pair best with an early FTL doctrine commitment.");
      if(stage.id==="galactic" && !state.game.run.ascensionPath) push("synergy:galactic-path","Route",2,"Galactic route synergy","Choose an ascension path before overbuilding side systems so the late spine pulls together.");
      if(stage.id==="civilization" && !state.game.run.technologies.code_of_laws) push("synergy:civ-law","Route",1,"Civic hinge","Law and economy are drifting apart. Code of Laws will steady the run.");
    }
    if(L.enlightenmentUpgradeLevel("rival_prophecy")>0){
      (state.game.run.rivals||[]).filter(function(rival){ return !rival.victory && rival.score>=70; }).slice(0,2).forEach(function(rival){
        push("rival:"+rival.archetype,"Conflict",3,"Rival pressure rising",L.displayArchetypeName(rival.archetype)+" is trending toward a victory window.");
      });
    }
    if(L.enlightenmentUpgradeLevel("institutional_memory")>0){
      if(L.activeCongressCrisis()) push("congress:crisis","Conflict",3,"Congress fracture","The congress is entering an unstable decision window.");
      if(L.activeInstitutionCrisis()) push("institution:crisis","Conflict",3,"Institution fracture","A long-built institution is now a real pressure source.");
    }
    if(L.enlightenmentUpgradeLevel("ftl_primers")>0 && stage.id==="solar"){
      if(!state.game.meta.completedProjects.ftl_theory_conclave) push("solar:ftl-theory","Solar Proof",2,"Unproven doctrine","Solar still needs a committed FTL theory line.");
      else if(!state.game.meta.completedProjects.ftl_proof_flight) push("solar:ftl-proof","Solar Proof",3,"Proof flight pending","The civilization has a doctrine, but not a proven jump.");
      else if(!L.currentFTLMethodId()) push("solar:ftl-array","Solar Proof",3,"FTL not secured","A proven launch method still has to be formalized.");
    }
    return signals;
  };
  L.updateForesightLedger=function(){
    const ledger=L.foresightLedger(), activeMap={}, runMap=state.game.run.foresightPredictions||(state.game.run.foresightPredictions={});
    L.foresightSignals().forEach(function(signal){
      activeMap[signal.id]=signal;
      if(!ledger.predicted[signal.id]){
        ledger.predicted[signal.id]={count:1,lastTitle:signal.title,lastSeen:Date.now(),lane:signal.lane};
      } else {
        ledger.predicted[signal.id].count=(ledger.predicted[signal.id].count||0)+1;
        ledger.predicted[signal.id].lastSeen=Date.now();
        ledger.predicted[signal.id].lastTitle=signal.title;
      }
      runMap[signal.id]=true;
    });
    Object.keys(runMap).forEach(function(id){
      if(activeMap[id]) return;
      if(!ledger.solved[id]){
        ledger.solved[id]=1;
        ledger.solvedCount=(ledger.solvedCount||0)+1;
        ledger.bottlenecksSolved=(ledger.bottlenecksSolved||0)+1;
      } else ledger.solved[id]+=1;
      delete runMap[id];
    });
  };
  L.foresightStatus=function(){
    const ledger=L.foresightLedger(), nodes=L.foresightNodeDefs();
    return {
      nodesUnlocked:nodes.filter(function(node){ return !!L.enlightenmentUpgradeLevel(node.upgradeId); }).length,
      totalNodes:nodes.length,
      activeSignals:L.foresightSignals(),
      solvedCount:ledger.solvedCount||0,
      routeKey:L.currentRouteKey()
    };
  };
  L.foresightMomentumBonus=function(){
    if(L.enlightenmentUpgradeLevel("fate_weaving")<=0) return 0;
    const solved=L.foresightLedger().solvedCount||0;
    return Math.min(0.08,solved*0.004);
  };
  L.destinyLockBias=function(){
    if(L.enlightenmentUpgradeLevel("destiny_lock")<=0) return 0;
    return 0.18;
  };
  L.aggregateResourceBreakdown=function(id){
    if(id==="divinity"){
      return L.divinityTotals().rows.map(function(item){
        return {
          name:item.name,
          value:item.value,
          perSecond:item.perSecond,
          text:item.name+" "+L.fmt(item.value)+" / "+L.fmt(item.capacity)+" ("+(L.rateText(item.perSecond)||"steady")+")"
        };
      });
    }
    if(id==="luxury_total"){
      const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond(), value=state.game.run.resources[id]||0, produced=output[id]||0, consumed=upkeep[id]||0, net=produced-consumed;
      const rows=[{name:"Stored luxuries",value:value,perSecond:net,text:"Stock "+L.fmt(value)+" / "+L.fmt(L.capacityFor(id))+" | Production "+(L.rateText(produced)||"0/s")+" | Consumption "+(L.rateText(-consumed)||"0/s")+" | Net "+(L.rateText(net)||"steady")}];
      return rows.concat(Object.entries(L.diversifiedLuxuryBreakdown()||{}).map(function(entry){
        return {name:L.resourceName(entry[0])||entry[0],value:entry[1]||0,perSecond:0,text:(L.resourceName(entry[0])||entry[0])+" "+L.fmt(entry[1]||0)};
      }));
    }
    if(id==="strategic_total"){
      const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond(), value=state.game.run.resources[id]||0, produced=output[id]||0, consumed=upkeep[id]||0, net=produced-consumed;
      const rows=[{name:"Stored strategic reserves",value:value,perSecond:net,text:"Stock "+L.fmt(value)+" / "+L.fmt(L.capacityFor(id))+" | Production "+(L.rateText(produced)||"0/s")+" | Consumption "+(L.rateText(-consumed)||"0/s")+" | Net "+(L.rateText(net)||"steady")}];
      return rows.concat(Object.entries(L.diversifiedStrategicBreakdown()||{}).map(function(entry){
        return {name:L.resourceName(entry[0])||entry[0],value:entry[1]||0,perSecond:0,text:(L.resourceName(entry[0])||entry[0])+" "+L.fmt(entry[1]||0)};
      }));
    }
    return [];
  };
  L.aggregateContributionBreakdown=function(resourceId){
    const total=state.game.run.resources[resourceId]||0, rows={};
    L.activeEffectSources().forEach(function(source){
      const perSecond=((source.effects||{}).perSecond||{})[resourceId]||0;
      const output=((source.effects||{}).resourceOutput||{})[resourceId]||0;
      const capacity=((source.effects||{}).capacity||{})[resourceId]||0;
      const weight=Math.max(0,perSecond) + Math.max(0,output)*2 + Math.max(0,capacity)*0.02;
      if(weight<=0) return;
      const label=source.path?source.path:source.name;
      rows[label]=(rows[label]||0)+weight;
    });
    const weightTotal=Object.values(rows).reduce(function(sum,value){ return sum+value; },0);
    if(weightTotal>0 && total>0){
      Object.keys(rows).forEach(function(label){ rows[label]=total*(rows[label]/weightTotal); });
      return rows;
    }
    if(total>0) rows[resourceId==="luxury_total"?"Stored luxuries":"Stored strategic reserves"]=total;
    return rows;
  };
  L.diversifiedLuxuryBreakdown=function(){
    return L.aggregateContributionBreakdown("luxury_total");
  };
  L.diversifiedStrategicBreakdown=function(){
    return L.aggregateContributionBreakdown("strategic_total");
  };
  L.activeEvolutionChallengeDef=function(){
    const id=state.game.meta.activeEvolutionChallenge||state.game.run.activeEvolutionChallenge||"";
    let found=null;
    Object.values(DATA.EVOLUTION_CHALLENGES||{}).some(function(list){
      found=(list||[]).find(function(item){ return item.id===id; })||null;
      return !!found;
    });
    return found;
  };
  L.completedEvolutionChallengeDefs=function(){
    const done=state.game.meta.completedMasteryChallenges||{};
    return Object.values(DATA.EVOLUTION_CHALLENGES||{}).flat().filter(function(item){
      return !!done[L.archiveFavoriteKey(item.targetStage,item.id)];
    });
  };
  L.setActiveEvolutionChallenge=function(id){
    if(id){
      const found=Object.values(DATA.EVOLUTION_CHALLENGES||{}).flat().find(function(item){ return item.id===id; });
      if(!found) return false;
    }
    state.game.meta.activeEvolutionChallenge=id||"";
    state.game.run.activeEvolutionChallenge=id||"";
    L.pushLog(id?("Evolution challenge prepared: "+((L.activeEvolutionChallengeDef()||{}).name||id)):("Evolution challenge cleared."));
    return true;
  };
  L.activeEvolutionChallengeSource=function(){
    const challenge=L.activeEvolutionChallengeDef();
    if(!challenge || !L.evolutionChallengesUnlocked()) return [];
    return [{id:"evolution_challenge:"+challenge.id,name:challenge.name,path:"Evolution Challenge",desc:challenge.desc,effects:challenge.effects||{}}];
  };
  L.completedEvolutionMasterySources=function(){
    return L.completedEvolutionChallengeDefs().map(function(challenge){
      return {id:"evolution_mastery:"+challenge.id,name:challenge.name+" Mastery",path:"Evolution Mastery",desc:"Permanent blessing earned by overcoming "+challenge.family+".",effects:challenge.masteryEffects||{}};
    });
  };
  L.availableOfferings=function(){
    if(!((L.futureLayerState("transcendence").unlocked && L.transcendenceUpgradeLevel("offering_altars")>0) || state.ui.debug)) return [];
    return (DATA.OFFERINGS||[]).map(function(item){
      const canPay=L.canAfford(item.cost||{}) && (!item.populationCost || state.game.run.population>item.populationCost+6);
      return Object.assign({canPay:canPay},item);
    });
  };
  L.offeringLedger=function(){
    const ledger=state.game.meta.offeringLedger||(state.game.meta.offeringLedger={totalOfferings:0,divinityFromOfferings:0,byOffering:{},byChannel:{}});
    ledger.byOffering||(ledger.byOffering={});
    ledger.byChannel||(ledger.byChannel={});
    ledger.totalOfferings=ledger.totalOfferings||0;
    ledger.divinityFromOfferings=ledger.divinityFromOfferings||0;
    return ledger;
  };
  L.offeringGainMultiplier=function(){
    return 1+(L.sumScalarEffect("offeringGain")||0);
  };
  L.offeringShare=function(){
    const total=Math.max(0,state.game.run.divinityGeneratedTotal||0);
    const offering=Math.max(0,state.game.run.divinityGeneratedFromOfferings||0);
    return total>0 ? offering/total : 0;
  };
  L.makeOffering=function(id){
    if(!((L.futureLayerState("transcendence").unlocked && L.transcendenceUpgradeLevel("offering_altars")>0) || state.ui.debug)) return false;
    const offering=(DATA.OFFERINGS||[]).find(function(item){ return item.id===id; });
    if(!offering) return false;
    if(!L.canAfford(offering.cost||{})) return false;
    if(offering.populationCost && state.game.run.population<=offering.populationCost+6) return false;
    if(!L.spend(offering.cost||{})) return false;
    if(offering.populationCost) state.game.run.population=Math.max(1,state.game.run.population-offering.populationCost);
    const multiplier=L.offeringGainMultiplier();
    const totalGain=Object.values(offering.gain||{}).reduce(function(sum,value){ return sum+value; },0)*multiplier;
    const ledger=L.offeringLedger();
    ledger.totalOfferings=(ledger.totalOfferings||0)+1;
    ledger.byOffering[id]=(ledger.byOffering[id]||0)+1;
    Object.entries(offering.gain||{}).forEach(function(entry){
      ledger.byChannel[entry[0]]=(ledger.byChannel[entry[0]]||0)+(entry[1]*multiplier);
    });
    ledger.divinityFromOfferings=(ledger.divinityFromOfferings||0)+totalGain;
    state.game.run.divinityGeneratedFromOfferings=(state.game.run.divinityGeneratedFromOfferings||0)+totalGain;
    state.game.run.divinityGeneratedTotal=(state.game.run.divinityGeneratedTotal||0)+totalGain;
    L.gain(offering.gain||{},multiplier);
    L.unlockStoryEntry("first_offering");
    L.pushLog("Offering accepted: "+offering.name);
    return true;
  };
  L.availableRituals=function(){
    if(!((L.futureLayerState("transcendence").unlocked && L.transcendenceUpgradeLevel("ritual_reserve")>0) || state.ui.debug)) return [];
    const cooldowns=state.game.run.ritualCooldowns||(state.game.run.ritualCooldowns={});
    return (DATA.RITUALS||[]).map(function(item){
      const cd=Math.max(0,(cooldowns[item.id]||0));
      return Object.assign({cooldownRemaining:cd, canPay:cd<=0 && L.canAfford(item.cost||{})},item);
    });
  };
  L.performRitual=function(id){
    const ritual=(DATA.RITUALS||[]).find(function(item){ return item.id===id; });
    if(!ritual) return false;
    const cooldowns=state.game.run.ritualCooldowns||(state.game.run.ritualCooldowns={});
    if((cooldowns[id]||0)>0) return false;
    if(!L.canAfford(ritual.cost||{})) return false;
    if(!L.spend(ritual.cost||{})) return false;
    const effects=ritual.effects||{};
    if(effects.grant) L.gain(effects.grant,1);
    if(effects.projectProgress && state.game.run.specialProject){
      state.game.run.specialProject.progress=Math.min(L.specialProjectDef().duration,state.game.run.specialProject.progress+effects.projectProgress);
    }
    if(effects.clearShortage){
      Object.keys(state.game.run.resourceFailures||{}).forEach(function(key){
        state.game.run.resourceFailures[key]=Math.max(0,(state.game.run.resourceFailures[key]||0)-effects.clearShortage);
      });
    }
    if(effects.surgeSeconds && effects.surgeOutput){
      state.game.run.ritualSurges||(state.game.run.ritualSurges=[]);
      state.game.run.ritualSurges.push({id:id,time:effects.surgeSeconds,output:effects.surgeOutput});
    }
    cooldowns[id]=ritual.cooldown||60;
    L.pushLog("Ritual invoked: "+ritual.name);
    return true;
  };
  L.availableScripts=function(){
    if(!((L.futureLayerState("transcendence").unlocked && L.transcendenceUpgradeLevel("script_lattice")>0) || state.ui.debug)) return [];
    const active=state.game.meta.activeScripts||{};
    return (DATA.SCRIPTS||[]).map(function(item){
      return Object.assign({enabled:!!active[item.id]},item);
    });
  };
  L.toggleScript=function(id){
    const def=(DATA.SCRIPTS||[]).find(function(item){ return item.id===id; });
    if(!def) return false;
    const active=state.game.meta.activeScripts||(state.game.meta.activeScripts={});
    active[id]=!active[id];
    L.pushLog((active[id]?"Script enabled: ":"Script disabled: ")+def.name);
    return true;
  };
  L.archetypeDef=function(id){ return DATA.ARCHETYPES.find(function(item){ return item.id===id; }); };
  L.themeDef=function(){ return ((DATA.COSMETIC_NAMESETS||{})[state.game.meta.cosmeticTheme])||null; };
  L.applyCosmeticThemeNames=function(){
    const theme=L.themeDef()||{};
    DATA.ARCHETYPES.forEach(function(item){
      if(item.baseName==null) item.baseName=item.name;
      item.name=((theme.archetypes||{})[item.id])||item.baseName;
    });
    DATA.STAGES.forEach(function(stage){
      if(stage.baseName==null) stage.baseName=stage.name;
      stage.name=((theme.stages||{})[stage.id])||stage.baseName;
      (stage.systems||[]).forEach(function(item){
        if(item.baseName==null) item.baseName=item.name;
        item.name=((theme.systems||{})[item.id])||item.baseName;
      });
      (stage.technologies||[]).forEach(function(item){
        if(item.baseName==null) item.baseName=item.name;
        item.name=((theme.technologies||{})[item.id])||item.baseName;
      });
    });
    (DATA.ASCENSION_PATHS||[]).forEach(function(item){
      if(item.baseName==null) item.baseName=item.name;
      item.name=((theme.paths||{})[item.id])||item.baseName;
    });
    if(!DATA._baseVictoryVariants) DATA._baseVictoryVariants=Object.assign({},DATA.VICTORY_VARIANTS||{});
    Object.keys(DATA._baseVictoryVariants||{}).forEach(function(id){
      DATA.VICTORY_VARIANTS[id]=((theme.victories||{})[id])||(DATA._baseVictoryVariants[id]);
    });
  };
  L.archetypeName=function(id){ const f=L.archetypeDef(id); return f?f.name:id; };
  L.archetypeColor=function(id){ const f=L.archetypeDef(id); return f&&f.color?f.color:"#8da5c4"; };
  L.isArchetypeRevealed=function(id){ return !!(id&&state.game.meta.revealedArchetypes&&state.game.meta.revealedArchetypes[id]); };
  L.displayArchetypeName=function(id){ return L.isArchetypeRevealed(id)?L.archetypeName(id):"???"; };
  L.currentStage=function(){ return DATA.STAGES[state.game.run.stageIndex]||DATA.STAGES[0]; };
  L.stageIndexById=function(id){ return DATA.STAGES.findIndex(function(stage){ return stage.id===id; }); };
  L.isFinalStage=function(){ return state.game.run.stageIndex>=DATA.STAGES.length-1; };
  L.frontierStageIndex=function(){ return Math.max(0,Math.min(DATA.STAGES.length-1,state.game.meta.frontierStageIndex||0)); };
  L.frontierStage=function(){ return DATA.STAGES[L.frontierStageIndex()]||DATA.STAGES[0]; };
  L.isFrontierStage=function(){ return state.game.run.stageIndex>=L.frontierStageIndex(); };
  L.nextFrontierStage=function(){ return DATA.STAGES[Math.min(DATA.STAGES.length-1,L.frontierStageIndex()+1)]||DATA.STAGES[DATA.STAGES.length-1]; };
  L.futureLayerState=function(id){ return ((state.game.meta.futureLayers||{})[id])||{unlocked:false,count:0}; };
  L.enlightenmentUpgradeLevel=function(id){ return ((state.game.meta.enlightenmentUpgrades||{})[id])||0; };
  L.transcendenceUpgradeLevel=function(id){ return ((state.game.meta.transcendenceUpgrades||{})[id])||0; };
  L.futureLayerOrder=function(){ return ["genesis","apotheosis","singularity","omnipotence","divinity","infinity","eternity"]; };
  L.futureLayerCurrency=function(id){ return ((state.game.meta.futureCurrencies||{})[id])||0; };
  L.futureLayerUpgradeLevel=function(layerId,id){ return ((((state.game.meta.futureLayerUpgrades||{})[layerId])||{})[id])||0; };
  L.futureLayerDefs=function(layerId){
    if(layerId==="genesis") return DATA.GENESIS_UPGRADES||[];
    if(layerId==="apotheosis") return DATA.APOTHEOSIS_UPGRADES||[];
    return ((DATA.FUTURE_LAYER_UPGRADES||{})[layerId])||[];
  };
  L.futureLayerDef=function(id){ return (DATA.PRESTIGE_LAYERS||[]).find(function(layer){ return layer.id===id; })||null; };
  L.futureLayerIndex=function(id){ return L.futureLayerOrder().indexOf(id); };
  L.previousLayerId=function(id){
    if(id==="genesis") return "transcendence";
    const idx=L.futureLayerIndex(id);
    return idx>0?L.futureLayerOrder()[idx-1]:"transcendence";
  };
  L.nextLayerId=function(id){
    if(id==="transcendence") return "genesis";
    const idx=L.futureLayerIndex(id);
    return idx>=0 && idx<L.futureLayerOrder().length-1 ? L.futureLayerOrder()[idx+1] : "";
  };
  L.buyFutureLayerUpgrade=function(layerId,id){
    const def=L.futureLayerDefs(layerId).find(function(item){ return item.id===id; });
    if(!def || def.implemented===false) return false;
    if(!L.futureLayerState(layerId).unlocked && !state.ui.debug) return false;
    if(L.futureLayerUpgradeLevel(layerId,id)>0) return false;
    if(L.futureLayerCurrency(layerId)<def.cost && !state.ui.debug) return false;
    if(!state.ui.debug) state.game.meta.futureCurrencies[layerId]-=def.cost;
    if(!state.game.meta.futureLayerUpgrades[layerId]) state.game.meta.futureLayerUpgrades[layerId]={};
    state.game.meta.futureLayerUpgrades[layerId][id]=1;
    return true;
  };
  L.divinityFocusDef=function(){
    return ((DATA.DIVINITY_NODES||[]).find(function(item){ return item.id===(state.game.meta.divinityFocus||""); })) || (DATA.DIVINITY_NODES||[])[0] || null;
  };
  L.chooseDivinityFocus=function(id){
    const found=(DATA.DIVINITY_NODES||[]).find(function(item){ return item.id===id; });
    if(!found) return false;
    state.game.meta.divinityFocus=id;
    L.pushLog("Divinity focus aligned: "+found.name);
    return true;
  };
  L.divinityPoints=function(){ return state.game.meta.enlightenmentPoints||0; };
  L.genesisChoiceDefs=function(){
    return {
      cradleWorlds:DATA.GENESIS_CRADLE_WORLDS||[],
      primeConditions:DATA.GENESIS_PRIME_CONDITIONS||[],
      sacredGeographies:DATA.GENESIS_SACRED_GEOGRAPHY||[],
      dormantSeeds:DATA.GENESIS_DORMANT_SEEDS||[]
    };
  };
  L.defaultGenesisChoices=function(){ return {cradleWorld:"oceanic",primeCondition:"abundant_water",sacredGeography:"wonder_belt",dormantSeed:"relic_seed"}; };
  L.genesisChoices=function(){
    if(!L.futureLayerState("genesis").unlocked && !state.ui.debug) return {};
    const choices=state.game.meta.genesisChoices||(state.game.meta.genesisChoices={});
    return Object.assign({},L.defaultGenesisChoices(),choices);
  };
  L.chooseGenesisOption=function(kind,id){
      if(!L.futureLayerState("genesis").unlocked && !state.ui.debug) return false;
      const defs=L.genesisChoiceDefs();
      const map={cradleWorld:"cradleWorlds",primeCondition:"primeConditions",sacredGeography:"sacredGeographies",dormantSeed:"dormantSeeds"};
      const list=defs[map[kind]]||[];
      if(!list.some(function(item){ return item.id===id; })) return false;
      if(!state.game.meta.genesisChoices) state.game.meta.genesisChoices={};
      state.game.meta.genesisChoices[kind]=id;
      const mastery=state.game.meta.genesisMastery||(state.game.meta.genesisMastery={cradleWins:{},awakenedSeeds:{},primeSeen:{},geographySeen:{}});
      if(kind==="primeCondition") mastery.primeSeen[id]=true;
      if(kind==="sacredGeography") mastery.geographySeen[id]=true;
      return true;
    };
  L.selectedGenesisDef=function(kind){
    const defs=L.genesisChoiceDefs(), chosen=L.genesisChoices();
    const map={cradleWorld:"cradleWorlds",primeCondition:"primeConditions",sacredGeography:"sacredGeographies",dormantSeed:"dormantSeeds"};
    return (defs[map[kind]]||[]).find(function(item){ return item.id===chosen[kind]; }) || null;
  };
  L.genesisStageConsequenceSources=function(){
    if(!L.futureLayerState("genesis").unlocked && !state.ui.debug) return [];
    const stage=L.currentStage().id, chosen=L.genesisChoices(), sources=[];
    function push(id,name,desc,effects){
      sources.push({id:id,name:name,path:"Genesis Consequence",desc:desc,effects:effects||{}});
    }
    if(chosen.cradleWorld==="oceanic" && ["cell","creature","tribal","solar"].includes(stage)) push("genesis:cradle:oceanic","Oceanic Drift","The authored cradle keeps feeding aquatic abundance into pivotal growth stages.",{resourceOutput:stage==="solar"?{colonies:0.05,diplomacy:0.04,water:0.04}:{food:0.05,water:0.06},populationGrowth:stage==="creature"?0.002:0});
    if(chosen.cradleWorld==="arid" && ["tribal","civilization","empire","solar"].includes(stage)) push("genesis:cradle:arid","Arid Discipline","Scarcity keeps training efficiency into later societies.",{resourceOutput:{materials:0.04,energy:0.04,logistics:0.03},upkeepBonus:-0.003});
    if(chosen.cradleWorld==="glacial" && ["creature","civilization","solar"].includes(stage)) push("genesis:cradle:glacial","Glacial Reserve","Cold-authored worlds waste less and think more carefully under pressure.",{resourceOutput:{water:0.04,science:0.04,happiness:0.03},upkeepBonus:-0.003});
    if(chosen.cradleWorld==="lush" && ["cell","creature","tribal","civilization"].includes(stage)) push("genesis:cradle:lush","Lush Inheritance","The world keeps rewarding fertile, populous early development.",{resourceOutput:{food:0.05,medicine:0.04,happiness:0.04},populationGrowth:0.002});
    if(chosen.cradleWorld==="toxic" && ["creature","tribal","civilization","galactic"].includes(stage)) push("genesis:cradle:toxic","Toxic Adaptation","Hazard-forged worlds keep turning adversity into chemistry and strategic value.",{resourceOutput:{science:0.04,medicine:0.04,strategic_total:0.04}});
    if(chosen.cradleWorld==="volcanic" && ["civilization","empire","solar"].includes(stage)) push("genesis:cradle:volcanic","Volcanic Forge","Violent beginnings keep echoing as industrial hunger.",{resourceOutput:{production:0.05,energy:0.04,alloys:0.04}});
    if(chosen.cradleWorld==="subterranean" && ["civilization","empire","solar","galactic"].includes(stage)) push("genesis:cradle:subterranean","Subterranean Memory","Cavern worlds keep paying out dense logistics, materials, and hidden information.",{resourceOutput:{materials:0.05,logistics:0.04,data:0.04}});
    if(chosen.cradleWorld==="crystalline" && ["solar","galactic"].includes(stage)) push("genesis:cradle:crystalline","Crystalline Resonance","Ordered matter harmonizes with late science, data, and ascension systems.",{resourceOutput:{science:0.04,data:0.05,ascension:0.04}});
    if(chosen.primeCondition==="unstable_climate" && ["tribal","civilization","empire"].includes(stage)) push("genesis:prime:unstable_climate","Climate Instability Doctrine","The world still rewards adaptation, buffering brittle midgame chains.",{resourceOutput:{cohesion:0.04,science:0.03,energy:0.03}});
    if(chosen.primeCondition==="sparse_biosphere" && ["cell","creature","galactic"].includes(stage)) push("genesis:prime:sparse_biosphere","Sparse Reverence","Thin life keeps making survival, faith, and knowledge unusually precious.",{resourceOutput:{knowledge:0.05,faith:0.04,divinity_growth:0.03}});
    if(chosen.sacredGeography==="hidden_ruins" && ["tribal","civilization","empire"].includes(stage)) push("genesis:geo:hidden_ruins","Ruin Corridors","Authored ruins keep seeding memory, law, and rediscovery through the middle game.",{resourceOutput:{knowledge:0.04,science:0.04,influence:0.03}});
    if(chosen.sacredGeography==="rich_rift" && ["empire","solar"].includes(stage)) push("genesis:geo:rich_rift","Rift Economy","Sacred extraction belts keep propping up industrial and orbital throughput.",{resourceOutput:{production:0.04,gold:0.04,alloys:0.03}});
    if(chosen.primeCondition==="abundant_water" && ["cell","creature","tribal","civilization"].includes(stage)) push("genesis:prime:abundant_water","Flooded Mercy","The authored world still opens with deep hydrology and forgiving growth chains.",{resourceOutput:{water:0.05,food:0.03,happiness:0.02}});
    if(chosen.primeCondition==="rich_minerals" && ["civilization","empire","solar","galactic"].includes(stage)) push("genesis:prime:rich_minerals","Mineral Testament","The world's bones keep underwriting later metallurgy and strategic wealth.",{resourceOutput:{materials:0.05,alloys:0.04,strategic_total:0.03}});
    if(chosen.primeCondition==="weak_gravity" && ["creature","tribal","solar","galactic"].includes(stage)) push("genesis:prime:weak_gravity","Weak-Gravity Reach","Movement, launch, and orbital lift keep coming a little easier than they should.",{resourceOutput:{energy:0.04,colonies:0.03,diplomacy:0.03},projectSpeed:0.04});
    if(chosen.primeCondition==="fungal_bloom" && ["cell","creature","tribal","galactic"].includes(stage)) push("genesis:prime:fungal_bloom","Mycelial Providence","Interdependence and recovery stay unusually strong in this authored ecology.",{resourceOutput:{organic_matter:0.05,medicine:0.04,culture:0.03}});
    if(chosen.sacredGeography==="wonder_belt" && ["civilization","empire","solar","galactic"].includes(stage)) push("genesis:geo:wonder_belt","Wonder Belt Processions","Natural marvels continue shaping late legitimacy and spectacle.",{resourceOutput:{culture:0.04,tourism:0.04,influence:0.03,faith:0.02}});
    if(chosen.sacredGeography==="dead_zone" && ["tribal","empire","galactic"].includes(stage)) push("genesis:geo:dead_zone","Consecrated Marches","Dangerous borders keep toughening the frontier psychology of the world.",{resourceOutput:{military_power:0.04,cohesion:0.03,command:0.02}});
    return sources;
  };
    L.awakenedDormantSeedSources=function(){
      if(!L.futureLayerState("genesis").unlocked && !state.ui.debug) return [];
      const chosen=L.genesisChoices().dormantSeed, stage=L.currentStage().id, res=state.game.run.resources||{}, out=[];
      function awake(id,name,desc,effects){
        const mastery=state.game.meta.genesisMastery||(state.game.meta.genesisMastery={cradleWins:{},awakenedSeeds:{},primeSeen:{},geographySeen:{}});
        mastery.awakenedSeeds[id]=true;
        out.push({id:id,name:name,path:"Awakened Seed",desc:desc,effects:effects||{}});
      }
    if(chosen==="relic_seed" && ["civilization","empire","solar","galactic"].includes(stage) && ((res.faith||0)>=30 || (res.data||0)>=30)) awake("seed:relic","Awakened Relic","The buried relic now feeds memory into later civilization.",{resourceOutput:{divinity_knowledge:0.05,data:0.04,faith:0.03}});
    if(chosen==="garden_seed" && ["tribal","civilization","empire"].includes(stage) && ((res.happiness||0)>=35 || (res.food||0)>=120)) awake("seed:garden","Awakened Garden","A sleeping biosphere opens and makes harmony self-reinforcing.",{resourceOutput:{food:0.05,medicine:0.04,happiness:0.04}});
    if(chosen==="forge_seed" && ["empire","solar","galactic"].includes(stage) && ((res.production||0)>=60 || (res.alloys||0)>=30)) awake("seed:forge","Awakened Forge","A buried industrial heart starts paying out once the world can bear it.",{resourceOutput:{production:0.05,alloys:0.04,energy:0.03}});
    if(chosen==="veil_seed" && ["solar","galactic"].includes(stage) && ((res.ascension||0)>=18 || !!state.game.run.ascensionPath)) awake("seed:veil","Awakened Veil","The authored breach finally answers a civilization ready for more than matter.",{resourceOutput:{ascension:0.05,faith:0.03,data:0.03,divinity_transcendence:0.03}});
    if(chosen==="ruin_seed" && ["civilization","empire","solar","galactic"].includes(stage) && ((res.influence||0)>=30 || !!state.game.run.congressChoice)) awake("seed:ruin","Awakened Testament","The buried testament becomes a living institution once power and memory align.",{resourceOutput:{unity:0.04,influence:0.04,data:0.03}});
    return out;
  };
    L.availableWorshipModes=function(){ return DATA.WORSHIP_MODES||[]; };
    L.currentWorshipModeDef=function(){ return (DATA.WORSHIP_MODES||[]).find(function(item){ return item.id===(state.game.meta.worshipMode||"devotion"); }) || (DATA.WORSHIP_MODES||[])[0] || null; };
    L.chooseWorshipMode=function(id){
      if(!(DATA.WORSHIP_MODES||[]).some(function(item){ return item.id===id; })) return false;
      state.game.meta.worshipMode=id;
    return true;
  };
  L.maxDivineLawSlots=function(){ return 1 + L.futureLayerUpgradeLevel("apotheosis","law_tablets"); };
  L.availableDivineLaws=function(){ return DATA.DIVINE_LAWS||[]; };
    L.toggleDivineLaw=function(id){
      if(!(DATA.DIVINE_LAWS||[]).some(function(item){ return item.id===id; })) return false;
      const laws=state.game.meta.divineLaws||(state.game.meta.divineLaws=[]);
      const mastery=state.game.meta.apotheosisMastery||(state.game.meta.apotheosisMastery={worshipWins:{},miraclesUsed:{},heresyOutcomes:{},lawsEnacted:{}});
      const idx=laws.indexOf(id);
      if(idx>=0){ laws.splice(idx,1); return true; }
      if(laws.length>=L.maxDivineLawSlots()) return false;
      laws.push(id);
      mastery.lawsEnacted[id]=true;
      return true;
    };
  L.evolutionChallengesUnlocked=function(){ return !!(state.ui.debug || state.game.meta.galacticWins>0); };
  L.totalEvolutionChallenges=function(){
    return Object.values(DATA.EVOLUTION_CHALLENGES||{}).reduce(function(sum,list){
      return sum+((list||[]).length);
    },0);
  };
  L.completedEvolutionChallengeCount=function(){
    if(!L.evolutionChallengesUnlocked()) return 0;
    return Object.keys(state.game.meta.completedMasteryChallenges||{}).length;
  };
  L.allEvolutionChallengesCompleted=function(){
    const total=L.totalEvolutionChallenges();
    return total>0 && L.completedEvolutionChallengeCount()>=total;
  };
  L.refreshPrestigeUnlocks=function(){
    if(L.evolutionChallengesUnlocked() && L.allEvolutionChallengesCompleted()){
      state.game.meta.futureLayers.enlightenment.unlocked=true;
      L.unlockStoryEntry("evolution_complete");
    }
    if((state.game.meta.futureLayers.enlightenment.count||0)>0 && (state.game.meta.enlightenmentPoints||0)>=24){
      state.game.meta.futureLayers.transcendence.unlocked=true;
      L.unlockStoryEntry("transcendence_unlocked");
    }
    if((state.game.meta.futureLayers.transcendence.count||0)>0 && (state.game.meta.transcendencePoints||0)>=18){
      state.game.meta.futureLayers.genesis.unlocked=true;
      L.unlockStoryEntry("genesis_unlocked");
    }
    if((state.game.meta.futureLayers.genesis.count||0)>0 && L.futureLayerCurrency("genesis")>=14){
      state.game.meta.futureLayers.apotheosis.unlocked=true;
      L.unlockStoryEntry("apotheosis_unlocked");
    }
    if((state.game.meta.futureLayers.apotheosis.count||0)>0 && L.futureLayerCurrency("apotheosis")>=14){
      state.game.meta.futureLayers.singularity.unlocked=true;
      L.unlockStoryEntry("singularity_unlocked");
    }
    if((state.game.meta.futureLayers.singularity.count||0)>0 && L.futureLayerCurrency("singularity")>=12){
      state.game.meta.futureLayers.omnipotence.unlocked=true;
      L.unlockStoryEntry("omnipotence_unlocked");
    }
    if((state.game.meta.futureLayers.omnipotence.count||0)>0 && L.futureLayerCurrency("omnipotence")>=12){
      state.game.meta.futureLayers.divinity.unlocked=true;
      L.unlockStoryEntry("divinity_unlocked");
    }
    if((state.game.meta.futureLayers.divinity.count||0)>0 && L.futureLayerCurrency("divinity")>=12){
      state.game.meta.futureLayers.infinity.unlocked=true;
      L.unlockStoryEntry("infinity_unlocked");
    }
    if((state.game.meta.futureLayers.infinity.count||0)>0 && L.futureLayerCurrency("infinity")>=12){
      state.game.meta.futureLayers.eternity.unlocked=true;
      L.unlockStoryEntry("eternity_glimpse");
    }
  };
  L.guidanceEnabled=function(){ return state.game.meta.guidanceEnabled!==false; };
  L.setGuidanceEnabled=function(enabled){ state.game.meta.guidanceEnabled=!!enabled; return true; };
  L.currentFTLMethodId=function(){
    const value=state.game.meta.completedProjects.ftl_research;
    return typeof value==="string"?value:"";
  };
  L.plannedFTLMethodId=function(){
    const value=state.game.meta.completedProjects.ftl_theory_conclave;
    return typeof value==="string"?value:"";
  };
  L.plannedFTLMethodName=function(){
    const id=L.plannedFTLMethodId();
    const def=((DATA.FTL_METHODS||[]).find(function(item){ return item.id===id; }))||null;
    return def?def.name:"";
  };
  L.currentFTLMethodDef=function(){
    const id=L.currentFTLMethodId();
    return ((DATA.FTL_METHODS||[]).find(function(item){ return item.id===id; }))||null;
  };
  L.currentFTLMethodName=function(){
    const def=L.currentFTLMethodDef();
    return def?def.name:"Unproven";
  };
  L.evolveActionLabel=function(){
    if(L.isFinalStage()) return "Rebirth";
    if(L.isFrontierStage()) return "Complete Stage";
    return "Evolve";
  };
  L.stageClearReward=function(stageId){
    const index=Math.max(0,L.stageIndexById(stageId));
    const scorePart=L.currentScore()/Math.max(1,L.currentStage().scoreTarget);
    return Math.max(3,Math.round(3+index*2.5+scorePart*1.2));
  };
  L.nextFrontierRewardPreview=function(){
    const nextStage=L.nextFrontierStage();
    if(!nextStage || nextStage.id===L.frontierStage().id) return 0;
    const nextIndex=Math.max(0,L.stageIndexById(nextStage.id));
    return Math.max(4,4+Math.round(nextIndex*2.5));
  };
  L.unlockDef=function(id){ return (DATA.META_UNLOCKS||[]).find(function(item){ return item.id===id; })||null; };
  L.totalEvolutionUpgradeLevels=function(){
    return Object.values(state.game.meta.upgrades||{}).reduce(function(sum,value){ return sum+(value||0); },0);
  };
  L.canEnlighten=function(){
    return !!L.futureLayerState("enlightenment").unlocked && !!state.ui.betweenRuns;
  };
  L.enlightenmentGain=function(){
    if(!L.canEnlighten()) return 0;
    const review=state.game.meta.lastRunReview||{};
    const epBank=state.game.meta.evolutionPoints||0;
    const upgradeMass=L.totalEvolutionUpgradeLevels()*5;
    const frontierMass=L.frontierStageIndex()*18;
    const masteryMass=L.completedEvolutionChallengeCount()*22;
    const victoryMass=(state.game.meta.galacticWins||0)*18;
    const cleanReview=(review.alerts||[]).length===0?18:0;
    const medalMass=((review.medals||[]).length||0)*8;
    const objectiveMass=(review.objectiveAward||0)*2;
    return Math.max(1,Math.floor((epBank+upgradeMass+frontierMass+masteryMass+victoryMass+cleanReview+medalMass+objectiveMass)/150));
  };
  L.buildResetMeta=function(kind){
    const oldMeta=state.game.meta;
    const fresh=State.createMeta();
    const preserveKeys=[
      "enlightenmentPoints","transcendencePoints","galacticWins","revealedArchetypes","unlockedRareArchetypes","archetypeWins",
      "seenSpecializations","seenEvents","seenContent","completedContracts","threatScars","crisisHistory","completedProjects","transformedScars",
        "museumRewards","legacyTier","eraLegacies","vassals","cosmeticTheme","rivalEndings","lineageChronicles","lastMilestoneWins",
        "victoryLog","artifacts","artifactEvolutions","rivalDossiers","stageMastery","stageLayouts","completedMasteryChallenges",
        "archiveFavorites","evolvedDoctrines","masteryRelics","congressSeasons","wornArtifacts","restoredArtifacts","restorationHistory",
        "activeRelics","congressInstitutionLevels","templates","templateDefaults","seedAutopilotEnabled","guidanceEnabled","crisisIntensity",
          "mapPresets","futureLayers","enlightenmentUpgrades","transcendenceUpgrades","divinityFocus","activeScripts","foresightLedger","offeringLedger","heresyHistory",
          "futureCurrencies","futureLayerUpgrades","genesisChoices","worshipMode","divineLaws",
          "genesisMastery","apotheosisMastery","divinityMastery","infinityMastery","eternityMastery",
          "preservedUniverses","universeResetCount","universePreserveCount","selectedUniverseBoon","universeBoons",
        "finalTestaments","boundEchoes","futureDebtTier","mergedForkLessons","forkArchives","testamentClauses","canonEntries","permanenceWeaves","eternalInheritances"
      ];
    preserveKeys.forEach(function(key){
      if(key==="completedProjects") return;
      if(oldMeta[key]!==undefined) fresh[key]=JSON.parse(JSON.stringify(oldMeta[key]));
    });
    if(kind==="enlightenment"){
      fresh.evolutionPoints=0;
      fresh.upgrades=Object.fromEntries(DATA.SHOP_UPGRADES.map(function(up){ return [up.id,0]; }));
      fresh.frontierStageIndex=0;
      fresh.stageClearCounts={};
      fresh.lastRunReview=null;
    }
    if(kind==="transcendence"){
      fresh.evolutionPoints=0;
      fresh.upgrades=Object.fromEntries(DATA.SHOP_UPGRADES.map(function(up){ return [up.id,0]; }));
      fresh.frontierStageIndex=0;
      fresh.stageClearCounts={};
      fresh.lastRunReview=null;
      fresh.enlightenmentPoints=0;
      fresh.enlightenmentUpgrades=Object.fromEntries((DATA.ENLIGHTENMENT_UPGRADES||[]).map(function(up){ return [up.id,0]; }));
      fresh.futureLayers.enlightenment.unlocked=true;
      fresh.futureLayers.transcendence.unlocked=true;
    }
    if(L.futureLayerOrder().includes(kind)){
      fresh.evolutionPoints=0;
      fresh.upgrades=Object.fromEntries(DATA.SHOP_UPGRADES.map(function(up){ return [up.id,0]; }));
      fresh.frontierStageIndex=0;
      fresh.stageClearCounts={};
      fresh.lastRunReview=null;
      fresh.enlightenmentPoints=0;
      fresh.enlightenmentUpgrades=Object.fromEntries((DATA.ENLIGHTENMENT_UPGRADES||[]).map(function(up){ return [up.id,0]; }));
      fresh.transcendencePoints=0;
      fresh.transcendenceUpgrades=Object.fromEntries((DATA.TRANSCENDENCE_UPGRADES||[]).map(function(up){ return [up.id,0]; }));
      const idx=L.futureLayerIndex(kind);
      L.futureLayerOrder().forEach(function(layerId,layerIdx){
        if(layerIdx<idx){
          fresh.futureCurrencies[layerId]=0;
          fresh.futureLayerUpgrades[layerId]=Object.fromEntries(L.futureLayerDefs(layerId).map(function(up){ return [up.id,0]; }));
        } else {
          fresh.futureLayers[layerId].unlocked = oldMeta.futureLayers && oldMeta.futureLayers[layerId] ? !!oldMeta.futureLayers[layerId].unlocked : fresh.futureLayers[layerId].unlocked;
        }
      });
      fresh.futureLayers.enlightenment.unlocked=true;
      fresh.futureLayers.transcendence.unlocked=true;
    }
    return fresh;
  };
  L.enlighten=function(){
    if(!L.canEnlighten()) return false;
    const gain=L.enlightenmentGain();
    const oldReview=state.game.meta.lastRunReview;
    const nextMeta=L.buildResetMeta("enlightenment");
    nextMeta.enlightenmentPoints=(nextMeta.enlightenmentPoints||0)+gain;
    nextMeta.futureLayers.enlightenment.unlocked=true;
    nextMeta.futureLayers.enlightenment.count=(nextMeta.futureLayers.enlightenment.count||0)+1;
    nextMeta.lastRunReview=Object.assign({}, oldReview||{}, {
      kind:"Enlightenment",
      enlightenmentAward:gain,
      optionalReset:true,
      resetLabel:"Kindle a New Cycle",
      victoryName:(oldReview&&oldReview.victoryName)||"Enlightenment reset completed",
      unlocks:((oldReview&&oldReview.unlocks)||[]).concat(["Your Divinity focus remains active"])
    });
    state.game.meta=nextMeta;
    L.unlockStoryEntry("enlightenment_reset");
    state.game.run=State.createRun(nextMeta);
    L.autoApplySeedTemplate(L.frontierStage().id);
    state.ui.betweenRuns=true;
    state.ui.betweenRunsStep="review";
    state.game.run.log.push("Enlightenment reset complete. "+gain+" Enlightenment awarded.");
    return true;
  };
  L.canTranscend=function(){
    return !!L.futureLayerState("transcendence").unlocked && !!state.ui.betweenRuns;
  };
  L.transcendenceGain=function(){
    if(!L.canTranscend()) return 0;
    const divinityMomentum=Math.floor(L.divinityTotals().value/120);
    const enlightenmentBank=state.game.meta.enlightenmentPoints||0;
    const foresightOwned=Object.values(state.game.meta.enlightenmentUpgrades||{}).reduce(function(sum,v){ return sum+(v||0); },0);
    const wins=state.game.meta.galacticWins||0;
    const offeringMass=Math.floor(L.offeringShare()*100);
    return Math.max(1,Math.floor((enlightenmentBank + foresightOwned*8 + wins*10 + divinityMomentum*12 + offeringMass*1.4)/60));
  };
  L.transcend=function(){
    if(!L.canTranscend()) return false;
    const gain=L.transcendenceGain();
    const oldReview=state.game.meta.lastRunReview;
    const nextMeta=L.buildResetMeta("transcendence");
    nextMeta.transcendencePoints=(nextMeta.transcendencePoints||0)+gain;
    nextMeta.futureLayers.transcendence.unlocked=true;
    nextMeta.futureLayers.transcendence.count=(nextMeta.futureLayers.transcendence.count||0)+1;
    nextMeta.lastRunReview=Object.assign({}, oldReview||{}, {
      kind:"Transcendence",
      transcendenceAward:gain,
      optionalReset:true,
      resetLabel:"Step Beyond Causality",
      victoryName:(oldReview&&oldReview.victoryName)||"Transcendence completed",
      unlocks:((oldReview&&oldReview.unlocks)||[]).concat(["Offerings, rituals, and scripts now define the next cycle"])
    });
    state.game.meta=nextMeta;
    L.unlockStoryEntry("transcendence_unlocked");
    state.game.run=State.createRun(nextMeta);
    L.autoApplySeedTemplate(L.frontierStage().id);
    state.ui.betweenRuns=true;
    state.ui.betweenRunsStep="review";
    state.game.run.log.push("Transcendence complete. "+gain+" Transcendence awarded.");
    return true;
  };
  L.futureLayerGain=function(layerId){
    if(!L.futureLayerOrder().includes(layerId) || !state.ui.betweenRuns) return 0;
    const prev=L.previousLayerId(layerId);
    if(layerId==="genesis"){
      const source=(state.game.meta.transcendencePoints||0) + Object.values(state.game.meta.transcendenceUpgrades||{}).reduce(function(sum,v){ return sum+(v||0)*6; },0) + Math.floor(L.divinityTotals().value/180);
      return Math.max(1,Math.floor(source/40));
    }
    const prevCurrency=prev==="transcendence"?(state.game.meta.transcendencePoints||0):(prev==="enlightenment"?(state.game.meta.enlightenmentPoints||0):L.futureLayerCurrency(prev));
    const prevCount=L.futureLayerState(prev).count||0;
    return Math.max(1,Math.floor((prevCurrency + prevCount*18 + (state.game.meta.galacticWins||0)*6)/55));
  };
  L.canAscendFutureLayer=function(layerId){
    return !!L.futureLayerState(layerId).unlocked && !!state.ui.betweenRuns;
  };
  L.ascendFutureLayer=function(layerId){
    if(!L.canAscendFutureLayer(layerId)) return false;
    const gain=L.futureLayerGain(layerId);
    const oldReview=state.game.meta.lastRunReview;
    const nextMeta=L.buildResetMeta(layerId);
    nextMeta.futureCurrencies[layerId]=(nextMeta.futureCurrencies[layerId]||0)+gain;
    nextMeta.futureLayers[layerId].unlocked=true;
    nextMeta.futureLayers[layerId].count=(nextMeta.futureLayers[layerId].count||0)+1;
    const nextLayer=L.nextLayerId(layerId);
    if(nextLayer) nextMeta.futureLayers[nextLayer].unlocked=true;
    nextMeta.lastRunReview=Object.assign({},oldReview||{},{
      kind:(L.futureLayerDef(layerId)||{}).name||layerId,
      optionalReset:true,
      resetLabel:(L.futureLayerDef(layerId)||{}).resetLabel||"Ascend",
      victoryName:(oldReview&&oldReview.victoryName)||(((L.futureLayerDef(layerId)||{}).name||layerId)+" rite completed"),
      unlocks:((oldReview&&oldReview.unlocks)||[]).concat(nextLayer?[""+((L.futureLayerDef(nextLayer)||{}).name||nextLayer)+" now glimmers on the horizon"]:[]),
      futureLayerAward:{layerId:layerId,gain:gain}
    });
    state.game.meta=nextMeta;
    if(layerId==="eternity") L.unlockStoryEntry("eternity_finale");
    L.refreshPrestigeUnlocks();
    state.game.run=State.createRun(nextMeta);
    L.autoApplySeedTemplate(L.frontierStage().id);
    state.ui.betweenRuns=true;
    state.ui.betweenRunsStep="review";
    state.game.run.log.push(((L.futureLayerDef(layerId)||{}).name||layerId)+" complete. "+gain+" "+((L.futureLayerDef(layerId)||{}).currency||layerId)+" awarded.");
    return true;
  };
  L.unlockWins=function(id){ const def=L.unlockDef(id); return def?def.wins:0; };
  L.hasMetaUnlock=function(id){ return state.ui.debug || state.game.meta.galacticWins>=L.unlockWins(id); };
  L.unlockText=function(id){ const def=L.unlockDef(id); return def?("Unlocks after "+def.wins+" Galactic wins: "+def.name):"Locked"; };
  L.systemOwnedCount=function(id){ return ((state.game.run.ownedSystems[id]||{}).count)||0; };
  L.repeatableSystem=function(item){
    const stageId=((state.game.run.ownedSystems[item.id]||{}).stageId)||L.currentStage().id;
    if(["cell","creature"].includes(stageId)) return false;
    const blocked=["Village core","Cities","Administration","Colonies","Galactic core","Victory paths","Megastructures"];
    return blocked.indexOf(item.category)<0;
  };
  L.systemEffectiveCount=function(id){
    const count=L.systemOwnedCount(id);
    if(count<=0) return 0;
    return count*L.generatorMultiplier(count);
  };
  L.decorateOwnedSystem=function(item,owned){
    const count=(owned&&owned.count)||1;
    return Object.assign({},item,{ownedCount:count,effectiveCount:L.repeatableSystem(item)?L.systemEffectiveCount(item.id):count,stageId:owned.stageId||L.currentStage().id});
  };
  L.ownedSystemsForStage=function(){ const stageId=L.currentStage().id; return (L.currentStage().systems||[]).filter(function(item){ return state.game.run.ownedSystems[item.id]&&state.game.run.ownedSystems[item.id].stageId===stageId; }).map(function(item){ return L.decorateOwnedSystem(item,state.game.run.ownedSystems[item.id]); }); };
  L.ownedSystemsAll=function(){
    return Object.keys(state.game.run.ownedSystems||{}).map(function(id){
      const owned=state.game.run.ownedSystems[id]||{};
      const stage=(DATA.STAGES||[]).find(function(row){ return (row.systems||[]).some(function(item){ return item.id===id; }); });
      const item=stage&&(stage.systems||[]).find(function(row){ return row.id===id; });
      return item?L.decorateOwnedSystem(item,owned):null;
    }).filter(Boolean);
  };
  L.ownedTechForStage=function(){ return (L.currentStage().technologies||[]).filter(function(item){ return !!state.game.run.technologies[item.id]; }); };
  L.ownedTechAll=function(){
    return Object.keys(state.game.run.technologies||{}).map(function(id){
      return (DATA.STAGES||[]).flatMap(function(stage){ return stage.technologies||[]; }).find(function(item){ return item.id===id; })||null;
    }).filter(Boolean);
  };
  L.specializationDef=function(){
    const arch=state.game.run.lockedArchetype, id=state.game.run.specialization;
    return ((DATA.SPECIALIZATIONS[arch]||[]).find(function(item){ return item.id===id; }))||null;
  };
  L.chosenLineageEvents=function(){
    const chosen=state.game.run.lineageEvents||{};
    return DATA.LINEAGE_EVENTS.map(function(event){
      const choiceId=chosen[event.id], choice=(event.choices||[]).find(function(item){ return item.id===choiceId; });
      return choice?{id:event.id+":"+choice.id,name:event.name+": "+choice.name,path:"Lineage Event",effects:choice.effects||{}}:null;
    }).filter(Boolean);
  };
  L.artifactSources=function(){ return DATA.ARTIFACTS.filter(function(item){ return !!state.game.meta.artifacts[item.id]; }).map(function(item){ return Object.assign({},item,{effects:L.scaleEffects(item.effects||{},L.artifactPowerMultiplier())}); }); };
  L.artifactSetSources=function(){
    return (DATA.ARTIFACT_SETS||[]).filter(function(set){
      return (set.requires||[]).every(function(id){ return !!state.game.meta.artifacts[id]; });
    }).map(function(set){ return Object.assign({path:"Artifact Set"},set,{effects:L.scaleEffects(set.effects||{},L.artifactPowerMultiplier())}); });
  };
  L.artifactEvolutionSources=function(){
    return Object.keys(state.game.meta.artifactEvolutions||{}).map(function(id){
      const evo=(DATA.ARTIFACT_EVOLUTIONS||[]).find(function(item){ return item.id===id; });
      return evo?Object.assign({path:"Artifact Evolution"},evo,{effects:L.scaleEffects(evo.effects||{},L.artifactPowerMultiplier())}):null;
    }).filter(Boolean);
  };
  L.artifactFusionSources=function(){
    return (DATA.ARTIFACT_FUSIONS||[]).filter(function(fusion){
      return (fusion.requires||[]).every(function(id){ return !!state.game.meta.artifactEvolutions[id]; });
    }).map(function(fusion){ return Object.assign({path:"Artifact Fusion"},fusion,{effects:L.scaleEffects(fusion.effects||{},L.artifactPowerMultiplier())}); });
  };
  L.restoredArtifactSources=function(){
    return Object.entries(state.game.meta.restoredArtifacts||{}).map(function(entry){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===entry[0]; });
      const branch=(DATA.ARTIFACT_RESTORATION_BRANCHES||[]).find(function(item){ return item.id===entry[1]; });
      if(!artifact || !branch) return null;
      return {id:"restored_artifact:"+entry[0],name:artifact.name+" - "+branch.name,path:"Artifact Restoration",effects:L.scaleEffects(branch.effects||{},L.artifactPowerMultiplier()),desc:branch.desc||""};
    }).filter(Boolean);
  };
  L.restorationChainSources=function(){
    return Object.entries(state.game.meta.restorationHistory||{}).map(function(entry){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===entry[0]; });
      const history=Array.from(new Set(entry[1]||[]));
      if(!artifact || history.length<2) return null;
      return {id:"restoration_chain:"+entry[0],name:artifact.name+" Synthesis",path:"Restoration Chain",desc:"Repeated restorations have produced a blended lineage memory.",effects:L.scaleEffects({resourceOutput:{science:0.02,unity:0.02,data:0.02}},L.artifactPowerMultiplier())};
    }).filter(Boolean);
  };
  L.masteryRelicSources=function(){
    return Object.keys(state.game.meta.masteryRelics||{}).filter(function(stageId){
      return state.game.meta.activeRelics[stageId]!==false;
    }).map(function(stageId){
      const relic=(DATA.MASTERY_RELICS||{})[stageId];
      return relic?Object.assign({id:"mastery_relic:"+stageId,path:"Mastery Relic"},relic,{effects:L.scaleEffects(relic.effects||{},L.artifactPowerMultiplier())}):null;
    }).filter(Boolean);
  };
  L.toggleMasteryRelic=function(stageId){
    if(!state.game.meta.masteryRelics[stageId]) return false;
    const enabling=state.game.meta.activeRelics[stageId]===false;
    if(enabling && L.equippedRelicStageIds().length>=L.maxRelicSlots()) return false;
    state.game.meta.activeRelics[stageId]=enabling?true:false;
    return true;
  };
  L.archiveBoostValue=function(){
    const count=Object.keys(state.game.meta.seenContent||{}).length;
    const bonus=L.enlightenmentUpgradeLevel("chronicle_lens")>0?0.03:0;
    return Math.min(0.4,count*0.0006+bonus);
  };
  L.archiveBoostSource=function(){
    const boost=L.archiveBoostValue();
    return boost>0?[{id:"archive_memory",name:"Archive Memory",path:"Codex",effects:{allOutput:boost}}]:[];
  };
  L.archiveMilestoneSources=function(){
    const count=Object.keys(state.game.meta.seenContent||{}).length;
    return (DATA.ARCHIVE_MILESTONES||[]).filter(function(item){ return count>=item.count; }).map(function(item){ return Object.assign({path:"Archive Milestone"},item); });
  };
  L.timelineRecordCount=function(){
    return (state.game.meta.victoryLog||[]).length + (state.game.meta.lineageChronicles||[]).length + Object.keys(state.game.meta.seenContent||{}).length;
  };
  L.timelineMilestoneSources=function(){
    const count=L.timelineRecordCount();
    return (DATA.TIMELINE_MILESTONES||[]).filter(function(item){ return count>=item.count; }).map(function(item){ return Object.assign({path:"Timeline Milestone"},item); });
  };
  L.timelineAnchorSources=function(){
    const favorites=Object.entries(state.game.meta.archiveFavorites||{}).filter(function(entry){ return entry[0].indexOf("archive|")===0; });
    if(!favorites.length) return [];
    return [{id:"timeline_anchor",name:"Timeline Anchors",path:"Archive Anchors",desc:"Pinned archive entries feed future continuity.",effects:{resourceOutput:{cohesion:0.01*favorites.length,data:0.01*Math.min(3,favorites.length)}}}];
  };
  L.threatScarSources=function(){
    return Object.entries(state.game.meta.threatScars||{}).map(function(entry){
      if((state.game.meta.transformedScars||{})[entry[0]]) return null;
      const def=(DATA.THREAT_SCARS||{})[entry[0]];
      if(!def) return null;
      const scale=Math.min(5,entry[1]||1), effects={resourceOutput:{}};
      Object.entries((def.effects||{}).resourceOutput||{}).forEach(function(effect){ effects.resourceOutput[effect[0]]=effect[1]*scale; });
      return {id:"scar:"+entry[0],name:def.name+" x"+scale+(entry[1]>=3?" (Mutated)":""),path:entry[1]>=3?"Mutated Scar":"Threat Scar",mutated:entry[1]>=3,effects:effects};
    }).filter(Boolean);
  };
  L.crisisHistory=function(){
    const history=state.game.meta.crisisHistory||(state.game.meta.crisisHistory={events:{},stages:{},responses:[],affinity:{},resolvedTotal:0});
    if(!history.events) history.events={};
    if(!history.stages) history.stages={};
    if(!history.responses) history.responses=[];
    if(!history.affinity) history.affinity={};
    if(history.resolvedTotal==null) history.resolvedTotal=history.responses.length||0;
    return history;
  };
  L.crisisChoiceAffinity=function(event,choice){
    const effects=(choice&&choice.effects)||{}, out={};
    function add(id,value){ out[id]=(out[id]||0)+value; }
    Object.entries((effects.resourceOutput)||{}).concat(Object.entries((effects.perSecond)||{})).forEach(function(entry){
      const key=entry[0], value=entry[1]||0, mag=Math.max(0.25,Math.min(2,Math.abs(value)*16));
      if(["food","medicine","happiness"].includes(key)) add("mammalian",mag);
      if(["water","colonies","diplomacy"].includes(key)) add("aquatic",mag);
      if(["materials","stone","clay","alloys","rare_matter"].includes(key)) add("lithoid",mag);
      if(["military_power","command"].includes(key)) add("reptilian",mag);
      if(["science","knowledge","data"].includes(key)) add("humanoid",mag);
      if(["culture","faith","unity","cohesion"].includes(key)) add("fungoid",mag);
      if(["energy","logistics","tourism"].includes(key)) add("avian",mag);
      if(["production","wood","lumber"].includes(key)) add("arthropoid",mag);
      if(["gold","luxury_total","influence"].includes(key)) add("molluscoid",mag);
      if(key==="pollution") add(value>0?"toxoid":"plantoid",mag);
      if(key==="organic_matter" || key==="biomass") add("plantoid",mag);
      if(key==="ascension") add("necroid",mag);
    });
    if(event&&event.kind==="disaster") add("extremophile",0.35);
    return out;
  };
  L.recordCrisisMemory=function(event,choice){
    if(!event || !choice || (event.kind!=="crisis" && event.kind!=="disaster")) return;
    const history=L.crisisHistory(), stageId=event.stage||L.currentStage().id;
    const eventRow=history.events[event.id]||(history.events[event.id]={id:event.id,count:0,choices:{},stage:stageId,kind:event.kind,name:event.name});
    eventRow.count+=1;
    eventRow.choices[choice.id]=(eventRow.choices[choice.id]||0)+1;
    history.stages[stageId]=(history.stages[stageId]||0)+1;
    history.resolvedTotal=(history.resolvedTotal||0)+1;
    history.responses.unshift({eventId:event.id,choiceId:choice.id,stage:stageId,kind:event.kind,eventName:event.name,choiceName:choice.name,time:Date.now(),affinity:L.crisisChoiceAffinity(event,choice)});
    L.addAffinity(history.affinity,L.crisisChoiceAffinity(event,choice));
    history.responses=history.responses.slice(0,60);
    L.invalidateEffectSourceCache();
  };
  L.crisisMemorySources=function(){
    const history=L.crisisHistory(), stageId=L.currentStage().id;
    return Object.entries(history.events||{}).map(function(entry){
      const row=entry[1]||{}, def=L.worldEventDef(entry[0]);
      if(!def) return null;
      const applies=def.stage===stageId || (def.stages||[]).includes(stageId);
      if(!applies) return null;
      const topChoiceId=Object.entries(row.choices||{}).sort(function(a,b){ return b[1]-a[1]; })[0];
      const choice=topChoiceId&&(def.choices||[]).find(function(item){ return item.id===topChoiceId[0]; });
      if(!choice) return null;
      const recoveryBoost=Object.keys(state.game.meta.completedProjects||{}).filter(function(id){ return (DATA.CRISIS_RECOVERY_PROJECTS||[]).some(function(project){ return project.id===id; }); }).length*0.03;
      const scale=Math.min(0.42,0.08*Math.min(4,row.count||1)+recoveryBoost);
      return {id:"crisis_memory:"+def.id,name:def.name+" Memory",path:def.kind==="disaster"?"Disaster Memory":"Crisis Memory",desc:"Resolved pressure leaves a small inherited habit for this stage.",effects:L.scaleEffects(choice.effects||{},scale)};
    }).filter(Boolean).slice(0,4);
  };
  L.transformedScarSources=function(){
    return Object.keys(state.game.meta.transformedScars||{}).map(function(id){
      const def=(DATA.SCAR_TRANSFORMS||{})[id];
      return def?Object.assign({path:"Transformed Scar"},def):null;
    }).filter(Boolean);
  };
  L.rivalPersonalitySources=function(){
    return (state.game.run.rivals||[]).map(function(rival){
      const def=(DATA.RIVAL_PERSONALITIES||[]).find(function(item){ return item.id===rival.personality; });
      return def?Object.assign({id:"rival_personality:"+rival.archetype,name:L.displayArchetypeName(rival.archetype)+" "+def.name,path:"Rival Pressure"},def):null;
    }).filter(Boolean);
  };
  L.rivalAscensionSources=function(){
    return (state.game.run.rivals||[]).map(function(rival){
      const def=(DATA.RIVAL_ASCENSION||{})[rival.path];
      return def?Object.assign({id:"rival_path:"+rival.archetype,name:L.displayArchetypeName(rival.archetype)+" "+def.name,path:"Rival Ascension"},def):null;
    }).filter(Boolean);
  };
  L.mutatorSources=function(){
    const stageId=L.currentStage().id, id=(state.game.run.activeMutators||{})[stageId];
    const mutator=(DATA.RUN_MUTATORS||[]).find(function(item){ return item.id===id; });
    return mutator?[Object.assign({path:"Run Mutator"},mutator)]:[];
  };
  L.lineageLawSources=function(){
    return Object.entries(state.game.run.lineageLaws||{}).map(function(entry){
      const law=((DATA.LINEAGE_LAWS||{})[entry[0]]||[]).find(function(item){ return item.id===entry[1]; });
      return law?Object.assign({path:"Lineage Law"},law):null;
    }).filter(Boolean);
  };
  L.doctrineSources=function(){
    const arch=state.game.run.lockedArchetype, id=state.game.run.doctrine;
    const doctrine=((DATA.LINEAGE_DOCTRINES||{})[arch]||[]).find(function(item){ return item.id===id; });
    if(!doctrine) return [];
    const evolved=(state.game.meta.evolvedDoctrines||{})[id], evo=(DATA.DOCTRINE_EVOLUTIONS||{})[id];
    if(evolved && evo){
      const effects={resourceOutput:Object.assign({},(doctrine.effects||{}).resourceOutput||{},(evo.effects||{}).resourceOutput||{})};
      Object.keys(doctrine.effects||{}).forEach(function(key){ if(key!=="resourceOutput") effects[key]=(effects[key]||0)+(doctrine.effects[key]||0); });
      Object.keys(evo.effects||{}).forEach(function(key){ if(key!=="resourceOutput") effects[key]=(effects[key]||0)+(evo.effects[key]||0); });
      return [Object.assign({path:"Doctrine Evolution"},doctrine,{name:evo.name,desc:evo.desc,effects:effects})];
    }
    return [Object.assign({path:"Lineage Doctrine"},doctrine)];
  };
  L.doctrineConflictSources=function(){
    const proposal=(DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; });
    const doctrine=state.game.run.doctrine;
    if(!proposal || !doctrine) return [];
    return (DATA.DOCTRINE_CONFLICTS||[]).filter(function(item){
      return item.doctrine===doctrine && item.bloc===proposal.bloc;
    }).map(function(item){ return Object.assign({path:"Doctrine and Congress"},item); });
  };
  L.lawCongressSources=function(){
    const chosen=Object.values(state.game.run.lineageLaws||{}), proposal=(DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; });
    if(!proposal) return [];
    return (DATA.LAW_CONGRESS_RELATIONS||[]).filter(function(item){
      return chosen.includes(item.law) && item.bloc===proposal.bloc;
    }).map(function(item){ return Object.assign({path:"Law and Congress"},item); });
  };
  L.lawSetSources=function(){
    const chosen=Object.values(state.game.run.lineageLaws||{});
    return (DATA.LAW_SETS||[]).filter(function(set){ return (set.requires||[]).every(function(id){ return chosen.includes(id); }); }).map(function(set){ return Object.assign({path:"Law Set"},set); });
  };
  L.worldEventSources=function(){
    const stageId=L.currentStage().id, events=state.game.run.worldEvents[stageId]||{}, choices=state.game.run.worldEventChoices[stageId]||{};
    return Object.entries(events).map(function(entry){
      const slotId=entry[0], id=entry[1], choiceId=choices[slotId];
      const event=L.worldEventDef(id);
      if(!event) return null;
      const choice=(event.choices||[]).find(function(item){ return item.id===choiceId; });
      const path=event.kind==="disaster"?"Disaster":(event.kind==="crisis"?"Stage Crisis":"World Event");
      const effects=(event.kind==="disaster" || event.kind==="crisis")?L.scaleEffects(choice?choice.effects:null,L.crisisIntensityMultiplier()):(choice?choice.effects:{});
      return choice?Object.assign({id:event.id+":"+choice.id,name:event.name+": "+choice.name,path:path,effects:effects||{}}):null;
    }).filter(Boolean);
  };
  L.worldEventDef=function(id){
    const base=(DATA.WORLD_SLOT_EVENTS||[]).find(function(item){ return item.id===id; }) ||
      (DATA.STAGE_CRISES||[]).find(function(item){ return item.id===id; }) ||
      (DATA.STAGE_DISASTERS||[]).find(function(item){ return item.id===id; });
    if(base) return base;
    let found=null;
    Object.values(DATA.WORLD_EVENT_CHAINS||{}).forEach(function(branches){
      Object.values(branches||{}).forEach(function(event){ if(event.id===id) found=event; });
    });
    return found;
  };
  L.stageEventCatalog=function(stageId){
    const crises=(DATA.STAGE_CRISES||[]).filter(function(item){ return item.stage===stageId; });
    const disasters=(DATA.STAGE_DISASTERS||[]).filter(function(item){
      return item.stage===stageId || (item.stages||[]).includes(stageId);
    });
    return crises.concat(disasters);
  };
  L.crisisIntensityOptions=function(){
    return [
      {id:"gentle",name:"Gentle",mult:0.7,desc:"Softer crisis and disaster consequences."},
      {id:"normal",name:"Normal",mult:1,desc:"Baseline design-doc pressure."},
      {id:"harsh",name:"Harsh",mult:1.35,desc:"Sharper boons and sharper drawbacks."}
    ];
  };
  L.crisisIntensityDef=function(){
    const id=state.game.meta.crisisIntensity||"normal";
    return L.crisisIntensityOptions().find(function(item){ return item.id===id; }) || L.crisisIntensityOptions()[1];
  };
  L.crisisIntensityMultiplier=function(){ return L.crisisIntensityDef().mult||1; };
  L.setCrisisIntensity=function(id){
    if(!L.crisisIntensityOptions().some(function(item){ return item.id===id; })) return false;
    state.game.meta.crisisIntensity=id;
    L.invalidateEffectSourceCache();
    return true;
  };
  L.worldEventChoicePreview=function(event,choice){
    if(!choice) return null;
    if(!event || (event.kind!=="crisis" && event.kind!=="disaster")) return choice;
    return Object.assign({},choice,{effects:L.scaleEffects(choice.effects||{},L.crisisIntensityMultiplier())});
  };
  L.hasEventChoice=function(key){
    return Object.entries(state.game.run.worldEventChoices||{}).some(function(stageEntry){
      const stageId=stageEntry[0], stageChoices=stageEntry[1]||{}, events=state.game.run.worldEvents[stageId]||{};
      return Object.entries(stageChoices).some(function(choiceEntry){
        const slotId=choiceEntry[0], choiceId=choiceEntry[1];
        return events[slotId]+":"+choiceId===key;
      });
    });
  };
  L.completedProjectSources=function(){
    return Object.keys(state.game.meta.completedProjects||{}).map(function(id){
      const project=(DATA.SPECIAL_PROJECTS||[]).find(function(item){ return item.id===id; });
      if(!project) return null;
      const choiceId=state.game.meta.completedProjects[id]===true?"":state.game.meta.completedProjects[id];
      const choice=(project.choices||[]).find(function(item){ return item.id===choiceId; });
      const effects=Object.assign({},project.effects||{});
      if(choice){
        effects.resourceOutput=Object.assign({},(effects.resourceOutput||{}),((choice.effects||{}).resourceOutput||{}));
        Object.keys(choice.effects||{}).forEach(function(key){ if(key!=="resourceOutput") effects[key]=(effects[key]||0)+choice.effects[key]; });
      }
      return Object.assign({path:"Special Project",effects:effects,choiceName:choice?choice.name:""},project);
    }).filter(Boolean);
  };
  L.ascensionPathSource=function(){
    const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===state.game.run.ascensionPath; });
    return path?[Object.assign({path:"Ascension Path"},path)]:[];
  };
  L.legacyTierDef=function(){
    return (DATA.LEGACY_TIERS||[]).find(function(item){ return item.id===state.game.meta.legacyTier; }) || (DATA.LEGACY_TIERS||[])[0] || null;
  };
  L.legacyTierSource=function(){
    const tier=L.legacyTierDef();
    return tier&&tier.effects&&Object.keys(tier.effects).length?[Object.assign({path:"Legacy Universe"},tier)]:[];
  };
  L.eraLegacySources=function(){
    return Object.keys(state.game.meta.eraLegacies||{}).map(function(id){
      const def=(DATA.ERA_LEGACIES||{})[id];
      return def?Object.assign({id:"era_legacy:"+id,path:"Era Legacy"},def):null;
    }).filter(Boolean);
  };
  L.congressSource=function(){
    const proposal=(DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; });
    return proposal?[Object.assign({path:"Diplomatic Congress"},proposal)]:[];
  };
  L.congressBlocSource=function(){
    const proposal=(DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; });
    const bloc=proposal&&(DATA.CONGRESS_BLOCS||{})[proposal.bloc];
    if(!proposal || !bloc || proposal.bloc!==state.game.run.ascensionPath) return [];
    return [Object.assign({id:"congress_bloc:"+proposal.bloc,path:"Congress Bloc"},bloc)];
  };
  L.congressCrisisSource=function(){
    const crisis=L.activeCongressCrisis(), picked=(state.game.run.rivalEvents||{}).congressCrisis;
    if(!crisis) return [];
    const choice=(crisis.choices||[]).find(function(item){ return item.id===picked; });
    return [Object.assign({path:"Congress Crisis"},crisis,{effects:choice?choice.effects:(crisis.effects||{})})];
  };
  L.scaleEffects=function(effects,scale){
    const out={};
    Object.entries(effects||{}).forEach(function(entry){
      if(entry[1] && typeof entry[1]==="object"){
        out[entry[0]]={};
        Object.entries(entry[1]).forEach(function(inner){ out[entry[0]][inner[0]]=inner[1]*scale; });
      } else out[entry[0]]=entry[1]*scale;
    });
    return out;
  };
  L.goalRewardBonus=function(){ return Math.ceil((L.upgradeLevel("objective_cache")||0)/2); };
  L.shortageGraceSeconds=function(){ return 60+(L.upgradeLevel("emergency_stores")||0)*12+(L.transcendenceUpgradeLevel("rule_bending")>0?18:0); };
  L.survivalFailureResources=function(stageId){
    const resources=(DATA.STAGES[L.stageIndexById(stageId||L.currentStage().id)]||L.currentStage()).resources||[];
    return ["food","water"].filter(function(id){ return resources.includes(id); });
  };
  L.projectSpeedMultiplier=function(){
    let mult=1+(L.upgradeLevel("project_haste")||0)*0.12;
    const project=L.specialProjectDef&&L.specialProjectDef();
    if(project && L.currentStage().id==="solar" && project.id==="ftl_research"){
      mult*=1+(L.enlightenmentUpgradeLevel("ftl_primers")||0)*0.14;
    }
    if(project && L.currentStage().id==="solar" && ["ftl_theory_conclave","ftl_proof_flight","ftl_research"].includes(project.id)){
      mult*=1+(L.enlightenmentUpgradeLevel("proof_scaffolds")||0)*0.1;
    }
    const crisisWindow=L.currentStage().id==="galactic" && (!!L.activeCongressCrisis() || !!L.activeInstitutionCrisis() || (state.game.run.rivals||[]).some(function(rival){ return (rival.score||0)>=80 && !rival.victory; }));
    if(project && crisisWindow && (project.id.indexOf("rival_")===0 || project.id.indexOf("dossier_")===0)){
      mult*=1.18 + (L.enlightenmentUpgradeLevel("counterplay_network")||0)*0.08;
      if(L.transcendenceUpgradeLevel("crisis_forecasting")>0) mult*=1.1;
    }
    const focus=L.divinityFocusDef();
    if(focus && ((focus.effects||{}).projectSpeed||0)>0) mult*=1+((focus.effects||{}).projectSpeed||0);
    return mult;
  };
  L.rivalTrendMultiplier=function(){ return Math.max(0.55,1-(L.upgradeLevel("rival_brakes")||0)*0.08); };
  L.artifactPowerMultiplier=function(){ return 1+(L.upgradeLevel("artifact_attunement")||0)*0.1; };
  L.expandMapCost=function(count){ return Math.max(1,(2+count*2)-(L.upgradeLevel("cartography")||0)); };
  L.frontierKitBundle=function(stageId){
    const level=L.upgradeLevel("frontier_kit")||0;
    if(level<=0) return {};
    const seedBias=(L.enlightenmentUpgradeLevel("seed_bias")>0?1.25:1)+(L.enlightenmentUpgradeLevel("continuity_engine")||0)*0.08;
    const base=Math.round(level*12*seedBias);
    if(stageId==="creature") return {food:base,water:base,materials:Math.round(base*0.75)};
    if(stageId==="tribal") return {food:base,water:base,wood:base,stone:Math.round(base*0.75)};
    if(stageId==="civilization") return {food:base,production:base,gold:Math.round(base*0.75)};
    if(stageId==="empire"){
      const bonus=(L.upgradeLevel("imperial_charters")||0)*10;
      return {production:base+8,gold:base,influence:Math.round(base*0.7)+bonus,logistics:bonus};
    }
    if(stageId==="solar"){
      const bonus=(L.upgradeLevel("orbital_stockpiles")||0)*12;
      return {production:base+12,energy:base+12+bonus,alloys:Math.round(base*0.8)+Math.round(bonus*0.8),data:Math.round(bonus*0.6)};
    }
    if(stageId==="galactic"){
      const lateBonus=(L.upgradeLevel("imperial_charters")||0)*8;
      const orbitalBonus=(L.upgradeLevel("orbital_stockpiles")||0)*12;
      return {energy:base+18+orbitalBonus,data:base+Math.round(orbitalBonus*0.7),influence:Math.round(base*0.75)+lateBonus,command:lateBonus};
    }
    return {};
  };
  L.shopBonusSources=function(){
    const civicLevel=L.upgradeLevel("civic_memory")||0;
    const out=[];
    if(civicLevel>0 && ["empire","solar","galactic"].includes(L.currentStage().id)){
      out.push({id:"shop:civic_memory",name:"Civic Memory",path:"Evolution Shop",effects:{resourceOutput:{happiness:civicLevel*0.03,cohesion:civicLevel*0.03,influence:civicLevel*0.02}}});
    }
    if(L.enlightenmentUpgradeLevel("route_templates")>0){
      out.push({id:"enlightenment:route_templates",name:"Route Templates",path:"Enlightenment Shop",effects:{allOutput:0.05}});
    }
    if(L.enlightenmentUpgradeLevel("continuity_engine")>0){
      out.push({id:"enlightenment:continuity_engine",name:"Continuity Engine",path:"Enlightenment Shop",effects:{allOutput:0.03,manualBonus:0.12,populationGrowth:0.003}});
    }
    if(L.enlightenmentUpgradeLevel("ftl_primers")>0){
      out.push({id:"enlightenment:ftl_primers",name:"FTL Primers",path:"Enlightenment Shop",effects:{resourceOutput:{science:0.02,data:0.02,energy:0.02}}});
    }
    if(L.enlightenmentUpgradeLevel("bloc_blueprints")>0){
      out.push({id:"enlightenment:bloc_blueprints",name:"Bloc Blueprints",path:"Enlightenment Shop",effects:{resourceOutput:{cohesion:0.02,diplomacy:0.02,influence:0.02}}});
    }
    if(L.enlightenmentUpgradeLevel("chronicle_lens")>0){
      out.push({id:"enlightenment:chronicle_lens",name:"Chronicle Lens",path:"Enlightenment Shop",effects:{resourceOutput:{science:0.02,culture:0.02,data:0.02}}});
    }
    if(L.enlightenmentUpgradeLevel("proof_scaffolds")>0){
      out.push({id:"enlightenment:proof_scaffolds",name:"Proof Scaffolds",path:"Enlightenment Shop",effects:{resourceOutput:{science:0.02,energy:0.02,data:0.02}}});
    }
    if(L.enlightenmentUpgradeLevel("pressure_omens")>0){
      out.push({id:"enlightenment:pressure_omens",name:"Pressure Omens",path:"Enlightenment Shop",effects:{resourceOutput:{happiness:0.02,production:0.02,data:0.02}}});
    }
    if(L.enlightenmentUpgradeLevel("rival_prophecy")>0){
      out.push({id:"enlightenment:rival_prophecy",name:"Rival Prophecy",path:"Enlightenment Shop",effects:{resourceOutput:{diplomacy:0.02,command:0.02,science:0.01}}});
    }
    if(L.transcendenceUpgradeLevel("cosmic_relay")>0){
      out.push({id:"transcendence:cosmic_relay",name:"Cosmic Relay",path:"Transcendence Shop",effects:{allOutput:0.03,resourceOutput:{cohesion:0.02,influence:0.02}}});
    }
    if(L.transcendenceUpgradeLevel("mythic_index")>0){
      out.push({id:"transcendence:mythic_index",name:"Mythic Index",path:"Transcendence Shop",effects:{resourceOutput:{culture:0.03,unity:0.02,data:0.02}}});
    }
    if(L.transcendenceUpgradeLevel("offering_altars")>0){
      out.push({id:"transcendence:offering_altars",name:"Offering Altars",path:"Transcendence Shop",effects:{allOutput:0.03,resourceOutput:{ascension:0.03,unity:0.02}}});
    }
    if(L.transcendenceUpgradeLevel("ritual_reserve")>0){
      out.push({id:"transcendence:ritual_reserve",name:"Ritual Reserve",path:"Transcendence Shop",effects:{resourceOutput:{happiness:0.02,cohesion:0.02,energy:0.02}}});
    }
    if(L.transcendenceUpgradeLevel("script_lattice")>0){
      out.push({id:"transcendence:script_lattice",name:"Script Lattice",path:"Transcendence Shop",effects:{allOutput:0.02,manualBonus:0.15,projectSpeed:0.05}});
    }
    if(L.transcendenceUpgradeLevel("rule_bending")>0){
      out.push({id:"transcendence:rule_bending",name:"Rule Bending",path:"Transcendence Shop",effects:{allOutput:0.025,projectSpeed:0.04,resourceOutput:{cohesion:0.02,ascension:0.02,rare_matter:0.02}}});
    }
    const levels=state.game.meta.congressInstitutionLevels||{};
    Object.entries(levels).forEach(function(entry){
      const level=entry[1]||0;
      if(level<=0) return;
      const effects={resourceOutput:{}};
      if(entry[0]==="biological"){ effects.resourceOutput.food=0.01*level; effects.resourceOutput.medicine=0.01*level; effects.resourceOutput.happiness=0.005*level; }
      if(entry[0]==="synthetic"){ effects.resourceOutput.science=0.01*level; effects.resourceOutput.data=0.01*level; }
      if(entry[0]==="psionic"){ effects.resourceOutput.faith=0.01*level; effects.resourceOutput.cohesion=0.01*level; }
      if(entry[0]==="energetic"){ effects.resourceOutput.energy=0.01*level; effects.resourceOutput.alloys=0.01*level; }
      if(entry[0]==="dimensional"){ effects.resourceOutput.rare_matter=0.01*level; effects.resourceOutput.ascension=0.01*level; }
      out.push({id:"congress_institution:"+entry[0],name:(entry[0].charAt(0).toUpperCase()+entry[0].slice(1))+" Institution Lv "+level,path:"Congress Institution",effects:effects});
    });
    return out;
  };
  L.divinityFocusSource=function(){
    const focus=L.divinityFocusDef();
    if(!focus || !L.futureLayerState("enlightenment").unlocked) return [];
    return [{id:"divinity_focus:"+focus.id,name:focus.name,path:"Divinity Focus",desc:focus.desc,effects:focus.effects||{}}];
  };
  L.genesisChoiceSources=function(){
    if(!L.futureLayerState("genesis").unlocked && !state.ui.debug) return [];
    return ["cradleWorld","primeCondition","sacredGeography","dormantSeed"].map(function(kind){
      const def=L.selectedGenesisDef(kind);
      return def?{id:"genesis:"+kind+":"+def.id,name:def.name,path:"Genesis",desc:def.desc,effects:def.effects||{}}:null;
    }).filter(Boolean);
  };
  L.apotheosisSources=function(){
    if(!L.futureLayerState("apotheosis").unlocked && !state.ui.debug) return [];
    const mode=L.currentWorshipModeDef();
    const laws=(state.game.meta.divineLaws||[]).map(function(id){
      const def=(DATA.DIVINE_LAWS||[]).find(function(item){ return item.id===id; });
      return def?{id:"apotheosis:law:"+def.id,name:def.name,path:"Divine Law",desc:def.desc,effects:def.effects||{}}:null;
    }).filter(Boolean);
    const modeSource=mode?[{id:"apotheosis:mode:"+mode.id,name:mode.name,path:"Worship Mode",desc:mode.desc,effects:mode.effects||{}}]:[];
    return modeSource.concat(laws);
  };
  L.foresightMomentumSources=function(){
    const bonus=L.foresightMomentumBonus();
    if(bonus<=0) return [];
    return [{id:"foresight:fate_weaving",name:"Fate Weaving",path:"Enlightenment",desc:"Solved omens are now feeding future momentum.",effects:{allOutput:bonus,projectSpeed:bonus*0.75}}];
  };
  L.futureLayerUpgradeSources=function(){
    return L.futureLayerOrder().flatMap(function(layerId){
      return L.futureLayerDefs(layerId).filter(function(up){ return L.futureLayerUpgradeLevel(layerId,up.id)>0; }).map(function(up){
        const effects=up.effects||{};
        if(Object.keys(effects).length) return {id:layerId+":upgrade:"+up.id,name:up.name,path:(L.futureLayerDef(layerId)||{}).name||layerId,desc:up.desc,effects:effects};
        const inferred={};
        if(layerId==="genesis"){
          if(up.id==="cradle_memory") inferred.resourceOutput={food:0.03,water:0.03,materials:0.02,science:0.02};
          if(up.id==="prime_attunement") inferred.resourceOutput={production:0.03,energy:0.03,knowledge:0.03};
          if(up.id==="sacred_cartography") inferred.resourceOutput={culture:0.03,influence:0.03,tourism:0.03};
          if(up.id==="dormant_chorus") inferred.resourceOutput={divinity_knowledge:0.03,divinity_transcendence:0.03,ascension:0.03};
          if(up.id==="genesis_reserves") inferred.capacity={food:25,water:25,materials:20,energy:20};
        } else if(layerId==="apotheosis"){
          if(up.id==="worship_foundations") inferred.resourceOutput={faith:0.05,happiness:0.03,divinity_harmony:0.03};
          if(up.id==="law_tablets") inferred.resourceOutput={cohesion:0.04,influence:0.04};
          if(up.id==="miracle_reservoir") inferred.resourceOutput={divinity_growth:0.03,divinity_conquest:0.03};
          if(up.id==="heresy_doctrine") inferred.resourceOutput={culture:0.04,science:0.03,faith:0.03};
          if(up.id==="temple_economy") inferred.resourceOutput={gold:0.04,faith:0.05,production:0.03};
        }
        else if(layerId==="singularity"){
          if(up.id==="relic_sockets") inferred.resourceOutput={culture:0.03,science:0.03,data:0.03};
          if(up.id==="compression_lattice") inferred.projectSpeed=0.04;
          if(up.id==="logic_core_seed") inferred.manualBonus=0.1;
          if(up.id==="parallel_memory") inferred.allOutput=0.02;
          if(up.id==="relic_resonance") inferred.allOutput=0.025;
        }
        else if(layerId==="omnipotence") inferred.allOutput=0.02;
        else if(layerId==="divinity") inferred.resourceOutput={divinity_growth:0.03,divinity_harmony:0.03,divinity_knowledge:0.03};
        else if(layerId==="infinity") inferred.allOutput=0.025;
        else if(layerId==="eternity") inferred.costScale=-0.02;
        return {id:layerId+":upgrade:"+up.id,name:up.name,path:(L.futureLayerDef(layerId)||{}).name||layerId,desc:up.desc,effects:inferred};
      });
    });
  };
  L.maxMiracleCharges=function(){ return 1 + L.futureLayerUpgradeLevel("apotheosis","miracle_reservoir") + L.universeBoonLevel("extra_miracle_charge"); };
  L.availableMiracles=function(){
    if(!L.futureLayerState("apotheosis").unlocked && !state.ui.debug) return [];
    return (DATA.MIRACLES||[]).map(function(item){
      return Object.assign({canPay:L.canAfford(item.cost||{}) && (state.game.run.miracleCharges||0)>0},item);
    });
  };
    L.invokeMiracle=function(id){
      const miracle=(DATA.MIRACLES||[]).find(function(item){ return item.id===id; });
      if(!miracle || !L.canAfford(miracle.cost||{}) || (state.game.run.miracleCharges||0)<=0) return false;
      if(!L.spend(miracle.cost||{})) return false;
      const mastery=state.game.meta.apotheosisMastery||(state.game.meta.apotheosisMastery={worshipWins:{},miraclesUsed:{},heresyOutcomes:{},lawsEnacted:{}});
      state.game.run.miracleCharges=Math.max(0,(state.game.run.miracleCharges||0)-1);
      mastery.miraclesUsed[id]=(mastery.miraclesUsed[id]||0)+1;
      if(miracle.effects&&miracle.effects.grant){
      Object.entries(miracle.effects.grant).forEach(function(entry){
        state.game.run.resources[entry[0]]=(state.game.run.resources[entry[0]]||0)+entry[1];
      });
    }
    if(miracle.effects&&miracle.effects.clearShortage){
      Object.keys(state.game.run.resourceFailures||{}).forEach(function(key){
        state.game.run.resourceFailures[key]=Math.max(0,(state.game.run.resourceFailures[key]||0)-miracle.effects.clearShortage);
      });
    }
      if(miracle.effects&&miracle.effects.surgeSeconds){
        state.game.run.ritualSurges.push({id:"miracle:"+id,remaining:miracle.effects.surgeSeconds,effects:{allOutput:miracle.effects.surgeOutput||0}});
      }
      if(id==="declare_jubilee") state.game.meta.completedProjects.miracle_jubilee=true;
      if(id==="curse_dissent") state.game.meta.completedProjects.miracle_dissent=true;
      if(id==="bless_harvests") state.game.meta.completedProjects.miracle_harvests=true;
      if(id==="apocalypse_rite") state.game.meta.completedProjects.miracle_apocalypse=true;
      return true;
    };
  L.apotheosisInterplaySources=function(){
    if(!L.futureLayerState("apotheosis").unlocked && !state.ui.debug) return [];
    const mode=(state.game.meta.worshipMode||"devotion"), laws=state.game.meta.divineLaws||[], sources=[];
    function push(id,name,desc,effects){
      sources.push({id:id,name:name,path:"Apotheosis Interplay",desc:desc,effects:effects||{}});
    }
    if(mode==="devotion" && laws.includes("law_jubilee")) push("apo:devotion_jubilee","Devotional Jubilee","Gentle worship and renewal law reinforce one another across the entire society.",{resourceOutput:{happiness:0.05,faith:0.04,culture:0.03}});
    if(mode==="fear" && laws.includes("law_conquest")) push("apo:fear_conquest","Sacred Terror State","Fearful worship and conquest doctrine harden command at a real civic cost.",{resourceOutput:{military_power:0.05,command:0.04,influence:0.03,happiness:-0.03}});
    if(mode==="mystery" && laws.includes("law_revelation")) push("apo:mystery_revelation","Hidden Revelation","Mystery and revelation turn faith into inquiry instead of certainty.",{resourceOutput:{science:0.05,data:0.04,faith:0.03}});
    if(mode==="transaction" && laws.includes("law_plenty")) push("apo:transaction_plenty","Temple Exchange","Abundance and covenant make wealth, faith, and production feed one another.",{resourceOutput:{gold:0.05,faith:0.04,production:0.03}});
    if(mode==="duty" && laws.includes("law_order")) push("apo:duty_order","Liturgical Order","Duty and order reinforce disciplined infrastructure.",{resourceOutput:{cohesion:0.05,influence:0.04,production:0.03}});
    if(mode==="transcendence" && laws.includes("law_revelation")) push("apo:trans_revelation","Ascent Theology","The civilization now treats discovery and ascent as the same holy act.",{resourceOutput:{ascension:0.05,unity:0.04,divinity_transcendence:0.03}});
    if(mode==="fear" && laws.includes("law_jubilee")) push("apo:fear_jubilee","Mercy Through Terror","The state alternates dread and pardon, creating volatile but effective legitimacy.",{resourceOutput:{influence:0.04,faith:0.03,command:0.02,happiness:-0.01}});
    if(mode==="transaction" && laws.includes("law_revelation")) push("apo:transaction_revelation","Market of Revelation","Knowledge itself becomes something bought, tithed, and canonized.",{resourceOutput:{gold:0.03,data:0.04,science:0.03,faith:0.02}});
    if(mode==="mystery" && laws.includes("law_jubilee")) push("apo:mystery_jubilee","Secret Jubilee","Renewal arrives through signs and omens rather than policy alone.",{resourceOutput:{happiness:0.04,culture:0.03,faith:0.03}});
    if(mode==="devotion" && laws.includes("law_order")) push("apo:devotion_order","Ordered Reverence","Gratitude and discipline mature into a stable holy administration.",{resourceOutput:{cohesion:0.04,faith:0.04,influence:0.03}});
    const history=state.game.meta.heresyHistory||{responses:{},types:{}};
    if((history.responses.absorb||0)>0) push("apo:heresy_absorbed","Absorbed Heresies","Past dissent widened orthodoxy instead of breaking it.",{resourceOutput:{faith:0.03,culture:0.03,science:0.02}});
    if((history.responses.legalize||0)>0) push("apo:heresy_legalized","Legalized Divergence","Permitted interpretations left the civilization more inventive and more unstable.",{resourceOutput:{data:0.03,influence:0.03,cohesion:-0.01}});
    if((history.responses.weaponize||0)>0) push("apo:heresy_weaponized","Weaponized Heresy","Past sacred fractures still make the state harsher and more dangerous.",{resourceOutput:{military_power:0.03,command:0.03,faith:0.02}});
    if(state.game.meta.completedProjects.miracle_jubilee) push("apo:miracle_jubilee","Memory of Jubilee","A remembered jubilee still softens collapse and keeps people receptive to grace.",{resourceOutput:{happiness:0.03,cohesion:0.02,faith:0.02}});
    if(state.game.meta.completedProjects.miracle_dissent) push("apo:miracle_dissent","Memory of Dissent","Cursed dissent leaves the state feared and administratively sharper.",{resourceOutput:{command:0.03,military_power:0.02,influence:0.02}});
    if(state.game.meta.completedProjects.miracle_harvests) push("apo:miracle_harvests","Memory of Harvest","Blessed abundance keeps worship tied to visible provision.",{resourceOutput:{food:0.03,water:0.02,faith:0.02}});
    if(state.game.meta.completedProjects.miracle_apocalypse) push("apo:miracle_apocalypse","Memory of Apocalypse","Having once invoked the end, the civilization now governs with a darker certainty.",{resourceOutput:{ascension:0.03,command:0.02,divinity_conquest:0.02}});
    return sources;
  };
  L.activeHeresy=function(){
    if(!L.futureLayerState("apotheosis").unlocked && !state.ui.debug) return null;
    if(!["civilization","empire","solar","galactic"].includes(L.currentStage().id)) return null;
    if(state.game.run.heresyResponses&&state.game.run.heresyResponses[L.currentStage().id]) return null;
    const faith=state.game.run.resources.faith||0, happiness=state.game.run.resources.happiness||0, influence=state.game.run.resources.influence||0;
    if(faith<30 && !state.ui.debug) return null;
    const mode=state.game.meta.worshipMode||"devotion", laws=state.game.meta.divineLaws||[];
    const types=[
      {id:"schism",name:"Schism of Interpretation",desc:"Competing schools claim the god has different intentions."},
      {id:"zealotry",name:"Zeal of the Outer Choir",desc:"A faction wants harsher sacred policy and public trials."},
      {id:"mercantile",name:"Temple Ledger Revolt",desc:"Priests and merchants disagree over whether wealth itself is holy."}
    ];
    if(mode==="mystery" || laws.includes("law_revelation")) types.push({id:"oracle",name:"Oracle Fragmentation",desc:"Too many visions now claim to be the true reading of the divine will."});
    if(mode==="fear" || laws.includes("law_conquest")) types.push({id:"martial",name:"Crusade Schism",desc:"Militant believers want the civilization to resolve every tension through holy force."});
    if(mode==="transaction" || laws.includes("law_plenty")) types.push({id:"covenant",name:"Covenant Price Revolt",desc:"The wealthy begin treating grace itself like a tariffed commodity."});
    return Object.assign({},types[(Math.floor((faith+happiness+influence)/25))%types.length],{responses:DATA.HERESY_RESPONSES||[]});
  };
    L.resolveHeresy=function(id){
      const response=(DATA.HERESY_RESPONSES||[]).find(function(item){ return item.id===id; });
      const heresy=L.activeHeresy();
      if(!response || !heresy) return false;
      const mastery=state.game.meta.apotheosisMastery||(state.game.meta.apotheosisMastery={worshipWins:{},miraclesUsed:{},heresyOutcomes:{},lawsEnacted:{}});
      if(!state.game.run.heresyResponses) state.game.run.heresyResponses={};
      state.game.run.heresyResponses[L.currentStage().id]=id;
      state.game.run.ritualSurges.push({id:"heresy:"+id,remaining:180,effects:response.effects||{}});
      const history=state.game.meta.heresyHistory||(state.game.meta.heresyHistory={responses:{},types:{}});
      history.responses[id]=(history.responses[id]||0)+1;
      history.types[heresy.id]=(history.types[heresy.id]||0)+1;
      mastery.heresyOutcomes[id]=(mastery.heresyOutcomes[id]||0)+1;
      if(id==="weaponize" && !state.game.meta.completedProjects.weaponized_heresy) state.game.meta.completedProjects.weaponized_heresy=true;
      return true;
    };
  L.compressedFrontiersActive=function(){
    return L.enlightenmentUpgradeLevel("compressed_frontiers")>0;
  };
  L.maxRelicSlots=function(){
    return 1 + L.futureLayerUpgradeLevel("singularity","relic_sockets") + L.universeBoonLevel("extra_relic_slot");
  };
  L.equippedRelicStageIds=function(){
    return Object.keys(state.game.meta.masteryRelics||{}).filter(function(stageId){ return state.game.meta.activeRelics[stageId]!==false; });
  };
  L.availableCompressionBands=function(){
    return DATA.STAGES.filter(function(stage){
      return stage.id!==L.frontierStage().id && (state.game.meta.stageMastery[stage.id]||0)>0;
    }).map(function(stage){
      return {id:stage.id,name:stage.name,active:!!(state.game.meta.compressedStageBands||{})[stage.id],mastery:state.game.meta.stageMastery[stage.id]||0};
    });
  };
  L.toggleCompressionBand=function(stageId){
    if(!L.futureLayerState("singularity").unlocked && !state.ui.debug) return false;
    if(!state.game.meta.compressedStageBands) state.game.meta.compressedStageBands={};
    state.game.meta.compressedStageBands[stageId]=!state.game.meta.compressedStageBands[stageId];
    return true;
  };
  L.logicCoreDefs=function(){ return DATA.LOGIC_CORES||[]; };
  L.currentLogicCoreDef=function(){ return (DATA.LOGIC_CORES||[]).find(function(item){ return item.id===(state.game.meta.logicCore||"balanced"); }) || (DATA.LOGIC_CORES||[])[0] || null; };
  L.chooseLogicCore=function(id){
    if(!(DATA.LOGIC_CORES||[]).some(function(item){ return item.id===id; })) return false;
    state.game.meta.logicCore=id;
    state.game.run.automationPolicy=id;
    return true;
  };
  L.omnipotenceStances=function(){ return DATA.OMNIPOTENCE_STANCES||[]; };
  L.currentInstabilityStanceDef=function(){ return L.omnipotenceStances().find(function(item){ return item.id===(state.game.meta.instabilityStance||"contained"); }) || L.omnipotenceStances()[0] || null; };
  L.chooseInstabilityStance=function(id){
    if(!L.omnipotenceStances().some(function(item){ return item.id===id; })) return false;
    state.game.meta.instabilityStance=id;
    return true;
  };
  L.maxHybridLineageSlots=function(){
    return 1 + L.futureLayerUpgradeLevel("omnipotence","lineage_forge") + ((state.game.meta.universeBoons||{})["extra_lineage_slot"]||0);
  };
  L.toggleHybridLineage=function(id){
    if(!L.futureLayerState("omnipotence").unlocked && !state.ui.debug) return false;
    if(!DATA.ARCHETYPES.some(function(arch){ return arch.id===id; })) return false;
    const current=(state.game.meta.hybridLineages||[]).slice();
    const idx=current.indexOf(id);
    if(idx>=0){
      current.splice(idx,1);
      state.game.meta.hybridLineages=current;
      return true;
    }
    if(current.length>=L.maxHybridLineageSlots()) return false;
    current.push(id);
    state.game.meta.hybridLineages=current;
    if(current.length>1){
      const mastery=state.game.meta.omnipotenceMastery||(state.game.meta.omnipotenceMastery={hybridPairs:{},instabilityEvents:{}});
      const primary=state.game.run.lockedArchetype||state.game.run.archetype||"primary";
      mastery.hybridPairs[[primary].concat(current).filter(Boolean).sort().join("+")]=true;
    }
    return true;
  };
  L.divineMasks=function(){ return DATA.DIVINE_MASKS||[]; };
  L.currentDivineMaskDef=function(){ return L.divineMasks().find(function(item){ return item.id===(state.game.meta.divineMask||"radiant_sovereign"); }) || L.divineMasks()[0] || null; };
    L.chooseDivineMask=function(id){
      if(!L.divineMasks().some(function(item){ return item.id===id; })) return false;
      state.game.meta.divineMask=id;
    const mask=L.currentDivineMaskDef();
    if(mask && mask.preferredPreset) L.applyPrayerRoutingPreset(mask.preferredPreset);
    if(mask && mask.preferredMiracle) state.game.meta.preferredMiracle=mask.preferredMiracle;
    if(mask && mask.preferredBloc) state.game.run.seedPreferredCongressBloc=mask.preferredBloc;
    if(mask && mask.preferredAscensionPath) state.game.run.seedPreferredAscensionPath=mask.preferredAscensionPath;
    return true;
  };
  L.prayerPolarities=function(){ return DATA.PRAYER_POLARITIES||[]; };
  L.currentPrayerPolarityDef=function(){ return L.prayerPolarities().find(function(item){ return item.id===(state.game.meta.prayerPolarity||"reverence"); }) || L.prayerPolarities()[0] || null; };
    L.choosePrayerPolarity=function(id){
      if(!L.prayerPolarities().some(function(item){ return item.id===id; })) return false;
      state.game.meta.prayerPolarity=id;
      return true;
  };
  L.prayerRoutingKeys=function(){ return ["growth","harmony","conquest","wealth","knowledge","transcendence"]; };
  L.divinityRoutingPresets=function(){ return DATA.DIVINITY_ROUTING_PRESETS||[]; };
  L.currentDivinityPresetDef=function(){
    return L.divinityRoutingPresets().find(function(item){ return item.id===(state.game.meta.divinityPreset||"balanced"); }) || L.divinityRoutingPresets()[0] || null;
  };
  L.normalizePrayerRouting=function(){
    if(!state.game.meta.prayerRouting) state.game.meta.prayerRouting={};
    const routing=state.game.meta.prayerRouting;
    let total=0;
    L.prayerRoutingKeys().forEach(function(key){
      routing[key]=Math.max(0,Math.round(routing[key]||0));
      total+=routing[key];
    });
    if(total<=0){
      const base={growth:17,harmony:17,conquest:16,wealth:16,knowledge:17,transcendence:17};
      state.game.meta.prayerRouting=base;
      return base;
    }
    const normalized={};
    let used=0;
    L.prayerRoutingKeys().forEach(function(key,idx){
      if(idx===L.prayerRoutingKeys().length-1) normalized[key]=100-used;
      else {
        normalized[key]=Math.round((routing[key]/total)*100);
        used+=normalized[key];
      }
    });
    state.game.meta.prayerRouting=normalized;
    return normalized;
  };
  L.prayerRouting=function(){ return L.normalizePrayerRouting(); };
  L.adjustPrayerRouting=function(id,delta){
    if(!L.prayerRoutingKeys().includes(id)) return false;
    const routing=Object.assign({},L.prayerRouting());
    const next=Math.max(0,Math.min(100,(routing[id]||0)+delta));
    const actualDelta=next-(routing[id]||0);
    if(!actualDelta) return false;
    const others=L.prayerRoutingKeys().filter(function(key){ return key!==id; });
    routing[id]=next;
    if(actualDelta>0){
      let remaining=actualDelta;
      others.sort(function(a,b){ return (routing[b]||0)-(routing[a]||0); }).forEach(function(key){
        const take=Math.min(remaining,routing[key]||0);
        routing[key]-=take;
        remaining-=take;
      });
    } else {
      let remaining=-actualDelta;
      others.forEach(function(key){
        const add=Math.floor(remaining/others.length) + (remaining%others.length>0?1:0);
        routing[key]+=add;
        remaining-=add;
      });
    }
    state.game.meta.prayerRouting=routing;
    L.normalizePrayerRouting();
    return true;
  };
    L.applyPrayerRoutingPreset=function(id){
      const preset=L.divinityRoutingPresets().find(function(item){ return item.id===id; });
      if(!preset) return false;
      state.game.meta.divinityPreset=id;
      state.game.meta.prayerRouting=Object.assign({},preset.routing);
      L.normalizePrayerRouting();
      L.applyDivinityPresetPriorities(preset);
      return true;
  };
  L.applyDivinityPresetPriorities=function(preset){
    const active=state.game.meta.activeScripts||(state.game.meta.activeScripts={});
    if(!preset) return false;
    state.game.meta.preferredMiracle=preset.miraclePriority||"";
    if((L.transcendenceUpgradeLevel("script_lattice")>0) || state.ui.debug){
      Object.keys(active).forEach(function(id){ active[id]=false; });
      (preset.scriptEnable||[]).forEach(function(id){ active[id]=true; });
    }
    return true;
  };
  L.applyMaskPrayerBias=function(){
      const mask=L.currentDivineMaskDef();
      if(!mask || !mask.routingBias) return false;
      const base=L.divinityRoutingPresets().find(function(item){ return item.id==="balanced"; });
      state.game.meta.prayerRouting=Object.assign({},(base&&base.routing)||L.prayerRouting());
    Object.entries(mask.routingBias||{}).forEach(function(entry){
      L.adjustPrayerRouting(entry[0],entry[1]);
    });
      L.applyDivinityPresetPriorities(L.currentDivinityPresetDef());
      return true;
    };
    L.trackDivinityChannelUnlocks=function(){
      const mastery=state.game.meta.divinityMastery||(state.game.meta.divinityMastery={maskWins:{},polarityWins:{},channelsUnlocked:{},routingRuns:0});
      ["growth","harmony","conquest","wealth","knowledge","transcendence"].forEach(function(key){
        const resKey="divinity_"+key;
        if((state.game.run.resources[resKey]||0)>0.01) mastery.channelsUnlocked[key]=true;
      });
      return mastery.channelsUnlocked;
    };
    L.genesisMasterySummary=function(){
      const mastery=state.game.meta.genesisMastery||{cradleWins:{},awakenedSeeds:{},primeSeen:{},geographySeen:{}};
      return {
        cradleWins:Object.keys(mastery.cradleWins||{}).length,
        cradleTotal:(DATA.GENESIS_CRADLE_WORLDS||[]).length,
        awakenedSeeds:Object.keys(mastery.awakenedSeeds||{}).length,
        awakenedSeedTotal:(DATA.GENESIS_DORMANT_SEEDS||[]).length,
        primesSeen:Object.keys(mastery.primeSeen||{}).length,
        primeTotal:(DATA.GENESIS_PRIME_CONDITIONS||[]).length,
        geographiesSeen:Object.keys(mastery.geographySeen||{}).length,
        geographyTotal:(DATA.GENESIS_SACRED_GEOGRAPHY||[]).length
      };
    };
    L.apotheosisMasterySummary=function(){
      const mastery=state.game.meta.apotheosisMastery||{worshipWins:{},miraclesUsed:{},heresyOutcomes:{},lawsEnacted:{}};
      return {
        worshipWins:Object.keys(mastery.worshipWins||{}).length,
        worshipTotal:(DATA.WORSHIP_MODES||[]).length,
        miraclesUsed:Object.keys(mastery.miraclesUsed||{}).length,
        miracleTotal:(DATA.MIRACLES||[]).length,
        heresyOutcomes:Object.keys(mastery.heresyOutcomes||{}).length,
        heresyTotal:(DATA.HERESY_RESPONSES||[]).length,
        lawsEnacted:Object.keys(mastery.lawsEnacted||{}).length,
        lawTotal:(DATA.DIVINE_LAWS||[]).length
      };
    };
    L.divinityMasterySummary=function(){
      const mastery=state.game.meta.divinityMastery||{maskWins:{},polarityWins:{},channelsUnlocked:{},routingRuns:0};
      return {
        maskWins:Object.keys(mastery.maskWins||{}).length,
        maskTotal:(DATA.DIVINE_MASKS||[]).length,
        polarityWins:Object.keys(mastery.polarityWins||{}).length,
        polarityTotal:(DATA.PRAYER_POLARITIES||[]).length,
        channelUnlocks:Object.keys(mastery.channelsUnlocked||{}).length,
        channelTotal:6,
        routingRuns:mastery.routingRuns||0
      };
    };
    L.omnipotenceMasterySummary=function(){
      const mastery=state.game.meta.omnipotenceMastery||{hybridPairs:{},instabilityEvents:{}};
      return {
        hybridPairs:Object.keys(mastery.hybridPairs||{}).length,
        instabilityEvents:Object.keys(mastery.instabilityEvents||{}).length,
        instabilityTotal:(DATA.OMNIPOTENCE_INSTABILITY_EVENTS||[]).length
      };
    };
    L.infinityMasterySummary=function(){
      const mastery=state.game.meta.infinityMastery||{echoBindings:{},debtTiers:{},mergedForks:{},forkFamilies:{},branchLegacies:{scars:0,blessings:0}};
      return {
        echoesBound:Object.keys(mastery.echoBindings||{}).length,
        echoTotal:(DATA.INFINITY_ECHOES||[]).length,
        debtTiers:Object.keys(mastery.debtTiers||{}).length,
        debtTotal:Math.max(0,(DATA.FUTURE_DEBT_TIERS||[]).length-1),
        mergedForks:Object.keys(mastery.mergedForks||{}).length,
        forkTotal:(DATA.INFINITY_FORKS||[]).length,
        forkFamilies:Object.keys(mastery.forkFamilies||{}).length,
        branchScars:(mastery.branchLegacies||{}).scars||0,
        branchBlessings:(mastery.branchLegacies||{}).blessings||0
      };
    };
    L.eternityMasterySummary=function(){
      const mastery=state.game.meta.eternityMastery||{clausesSealed:{},canonKinds:{},weavesSealed:{},preservedUniverses:0,resets:0};
      return {
        clausesSealed:Object.keys(mastery.clausesSealed||{}).length,
        clauseTotal:(DATA.ETERNITY_TESTAMENT_CLAUSES||[]).length,
        canonKinds:Object.keys(mastery.canonKinds||{}).length,
        weaveTotal:(DATA.PERMANENCE_WEAVES||[]).length,
        weavesSealed:Object.keys(mastery.weavesSealed||{}).length,
        preservedUniverses:mastery.preservedUniverses||0,
        resets:mastery.resets||0
      };
    };
    L.completionGuidance=function(layerId){
      if(layerId==="divinity"){
        const m=L.divinityMasterySummary();
        return {
          title:"Divinity Completion",
          complete:m.maskWins>=m.maskTotal && m.polarityWins>=m.polarityTotal && m.channelUnlocks>=m.channelTotal && m.routingRuns>=1,
          requirements:[
            "Complete a successful run with every Divine Mask ("+m.maskWins+" / "+m.maskTotal+").",
            "Complete a successful run with every prayer polarity ("+m.polarityWins+" / "+m.polarityTotal+").",
            "Awaken all six prayer channels ("+m.channelUnlocks+" / "+m.channelTotal+").",
            "Complete one run where prayer routing is the main engine of divine power ("+m.routingRuns+" / 1)."
          ],
          reward:"Unlock Infinity. Prayer-routing presets and divine identity loadouts become permanent."
        };
      }
      if(layerId==="infinity"){
        const m=L.infinityMasterySummary();
        return {
          title:"Infinity Completion",
          complete:m.echoesBound>=m.echoTotal && m.debtTiers>=m.debtTotal && m.mergedForks>=m.forkTotal && m.forkFamilies>=4 && m.branchScars>=1 && m.branchBlessings>=1,
          requirements:[
            "Bind every Echo type at least once ("+m.echoesBound+" / "+m.echoTotal+").",
            "Survive every Future Debt tier ("+m.debtTiers+" / "+m.debtTotal+").",
            "Merge every fork type ("+m.mergedForks+" / "+m.forkTotal+").",
            "Shape all four branch families ("+m.forkFamilies+" / 4).",
            "Preserve at least one branch scar and one branch blessing ("+m.branchScars+" scars, "+m.branchBlessings+" blessings)."
          ],
          reward:"Unlock Eternity. Echo libraries and selected branch histories remain available forever."
        };
      }
      if(layerId==="eternity"){
        const m=L.eternityMasterySummary();
        return {
          title:"Eternity Completion",
          complete:m.clausesSealed>=m.clauseTotal && m.weavesSealed>=m.weaveTotal && m.canonKinds>=4 && m.preservedUniverses>=1,
          requirements:[
            "Seal every Testament clause family ("+m.clausesSealed+" / "+m.clauseTotal+").",
            "Canonize at least four kinds of remembered truth ("+m.canonKinds+" / 4).",
            "Seal every Permanence Weave ("+m.weavesSealed+" / "+m.weaveTotal+").",
            "Preserve a final universe under the completed Testament ("+m.preservedUniverses+" / 1)."
          ],
          reward:"Win the game. Preserve the completed cosmos or reset it with a stacking cosmic boon."
        };
      }
      return null;
    };
    L.preferredMiracleDef=function(){
    const id=state.game.meta.preferredMiracle || ((L.currentDivinityPresetDef()||{}).miraclePriority) || "";
    return (DATA.MIRACLES||[]).find(function(item){ return item.id===id; }) || null;
  };
  L.isMiraclePriorityReady=function(id){
    const failures=state.game.run.resourceFailures||{}, stageId=L.currentStage().id, crisis=!!(L.activeCongressCrisis() || L.activeInstitutionCrisis());
    if(id==="bless_harvests") return (failures.food||0)>4 || (failures.water||0)>4 || (state.game.run.resources.food||0)<35 || (state.game.run.resources.water||0)<35;
    if(id==="sanctify_expansion") return ["civilization","empire","solar","galactic"].includes(stageId) && (((state.game.run.resources.production||0)<70) || ((state.game.run.resources.influence||0)<40));
    if(id==="jubilant_peace") return crisis || (state.game.run.resources.happiness||0)<35 || (state.game.run.resources.cohesion||0)<35;
    if(id==="apocalypse_rite") return (L.ascensionTension()>=55) || L.pressureAlerts().some(function(alert){ return ["rival","institution","congress"].includes(alert.group); });
    if(id==="declare_jubilee") return (state.game.run.resources.happiness||0)<45 || (state.game.run.resources.cohesion||0)<40 || (state.game.run.resourceFailures.happiness||0)>3;
    if(id==="curse_dissent") return !!L.activeHeresy() || crisis || (state.game.run.resources.command||0)<25;
    return false;
  };
  L.infinityEchoes=function(){ return DATA.INFINITY_ECHOES||[]; };
  L.maxEchoSlots=function(){ return 2 + L.futureLayerUpgradeLevel("infinity","echo_index"); };
    L.toggleBoundEcho=function(id){
      if(!L.futureLayerState("infinity").unlocked && !state.ui.debug) return false;
      if(!L.infinityEchoes().some(function(item){ return item.id===id; })) return false;
      const mastery=state.game.meta.infinityMastery||(state.game.meta.infinityMastery={echoBindings:{},debtTiers:{},mergedForks:{},forkFamilies:{},branchLegacies:{scars:0,blessings:0}});
      const current=(state.game.meta.boundEchoes||[]).slice();
      const idx=current.indexOf(id);
      if(idx>=0){
        current.splice(idx,1);
        state.game.meta.boundEchoes=current;
        return true;
      }
      if(current.length>=L.maxEchoSlots()) return false;
      current.push(id);
      state.game.meta.boundEchoes=current;
      mastery.echoBindings[id]=true;
      return true;
    };
  L.futureDebtTiers=function(){ return DATA.FUTURE_DEBT_TIERS||[]; };
  L.currentFutureDebtDef=function(){ return L.futureDebtTiers().find(function(item){ return item.id===(state.game.meta.futureDebtTier||"none"); }) || L.futureDebtTiers()[0] || null; };
    L.chooseFutureDebtTier=function(id){
      if(!L.futureDebtTiers().some(function(item){ return item.id===id; })) return false;
      state.game.meta.futureDebtTier=id;
      if(id!=="none"){
        const mastery=state.game.meta.infinityMastery||(state.game.meta.infinityMastery={echoBindings:{},debtTiers:{},mergedForks:{},forkFamilies:{},branchLegacies:{scars:0,blessings:0}});
        mastery.debtTiers[id]=true;
      }
      return true;
    };
  L.testamentClauses=function(){ return DATA.ETERNITY_TESTAMENT_CLAUSES||[]; };
  L.maxTestamentClauses=function(){ return 2 + L.futureLayerUpgradeLevel("eternity","testament_depth"); };
  L.toggleTestamentClause=function(id){
    if(!L.futureLayerState("eternity").unlocked && !state.ui.debug) return false;
    if(!L.testamentClauses().some(function(item){ return item.id===id; })) return false;
    const current=(state.game.meta.testamentClauses||[]).slice();
    const idx=current.indexOf(id);
    if(idx>=0){
      current.splice(idx,1);
      state.game.meta.testamentClauses=current;
      return true;
    }
    if(current.length>=L.maxTestamentClauses()) return false;
    current.push(id);
    state.game.meta.testamentClauses=current;
    return true;
  };
  L.permanenceWeaveDefs=function(){ return DATA.PERMANENCE_WEAVES||[]; };
  L.maxPermanenceWeaves=function(){ return 1 + L.futureLayerUpgradeLevel("eternity","permanence_threads"); };
  L.togglePermanenceWeave=function(id){
    if(!L.futureLayerState("eternity").unlocked && !state.ui.debug) return false;
    if(!L.permanenceWeaveDefs().some(function(item){ return item.id===id; })) return false;
    const current=(state.game.meta.permanenceWeaves||[]).slice();
    const idx=current.indexOf(id);
    if(idx>=0){
      current.splice(idx,1);
      state.game.meta.permanenceWeaves=current;
      return true;
    }
    if(current.length>=L.maxPermanenceWeaves()) return false;
    current.push(id);
    state.game.meta.permanenceWeaves=current;
    return true;
  };
  L.activeInstabilityEvent=function(){
    if(!L.futureLayerState("omnipotence").unlocked && !state.ui.debug) return null;
    const hybrids=(state.game.meta.hybridLineages||[]).length;
    const stance=state.game.meta.instabilityStance||"contained";
    if(hybrids<=0) return null;
    const score=hybrids + (stance==="adaptive"?0.5:(stance==="reckless"?1.5:0));
    if(score<1.5 && !state.ui.debug) return null;
    const key="omnipotence:"+L.currentStage().id;
    if((state.game.run.heresyResponses||{})[key]) return null;
    const activeLineages=(state.game.meta.hybridLineages||[]).slice(), allEvents=(DATA.OMNIPOTENCE_INSTABILITY_EVENTS||[]);
    const matchedPairs=allEvents.filter(function(item){
      return item.pair && item.pair.every(function(id){ return activeLineages.includes(id); });
    });
    const genericPool=allEvents.filter(function(item){ return !item.pair; });
    const pool=matchedPairs.length?matchedPairs.concat(genericPool):allEvents;
    return pool.length?pool[Math.floor((state.game.run.time/30 + hybrids + L.currentStage().index)%pool.length)]:null;
  };
  L.hybridLegacySources=function(){
    return Object.entries(state.game.meta.hybridLegacies||{}).map(function(entry){
      const record=entry[1]||{}, count=Math.max(1,record.count||1), base=record.effects||{}, effects={};
      if(base.resourceOutput){
        effects.resourceOutput={};
        Object.entries(base.resourceOutput).forEach(function(effect){ effects.resourceOutput[effect[0]]=effect[1]*count; });
      }
      if(base.allOutput) effects.allOutput=base.allOutput*count;
      if(base.costScale) effects.costScale=base.costScale*count;
      if(base.projectSpeed) effects.projectSpeed=base.projectSpeed*count;
      return {
        id:"hybrid-legacy:"+entry[0],
        name:record.name+(count>1?(" x"+count):""),
        path:record.type==="scar"?"Hybrid Scar":"Hybrid Blessing",
        desc:record.desc||"",
        effects:effects
      };
    }).filter(function(item){ return Object.keys(item.effects||{}).length>0; });
  };
  L.resolveInstabilityEvent=function(id){
    const event=L.activeInstabilityEvent();
    if(!event) return false;
    const response=(event.responses||[]).find(function(item){ return item.id===id; });
    if(!response) return false;
    if(!state.game.run.heresyResponses) state.game.run.heresyResponses={};
    state.game.run.heresyResponses["omnipotence:"+L.currentStage().id]=id;
    state.game.run.ritualSurges.push({id:"instability:"+event.id+":"+id,remaining:210,effects:response.effects||{}});
    if(response.legacy){
      const legacies=state.game.meta.hybridLegacies||(state.game.meta.hybridLegacies={});
      const current=legacies[response.legacy.id]||{count:0,name:response.legacy.name,type:response.legacy.type,desc:response.legacy.desc,effects:response.legacy.effects||{}};
      current.count=(current.count||0)+1;
      current.name=response.legacy.name;
      current.type=response.legacy.type;
      current.desc=response.legacy.desc;
      current.effects=response.legacy.effects||{};
      legacies[response.legacy.id]=current;
      L.markSeenContent("hybrid_legacy",{id:response.legacy.id,name:response.legacy.name});
      if(response.legacy.type==="scar") L.pushLog("Hybrid scar recorded: "+response.legacy.name+".");
      else L.pushLog("Hybrid blessing retained: "+response.legacy.name+".");
    }
    L.pushLog("Instability resolved: "+event.name+" - "+response.name);
    const mastery=state.game.meta.omnipotenceMastery||(state.game.meta.omnipotenceMastery={hybridPairs:{},instabilityEvents:{}});
    mastery.instabilityEvents[event.id]=true;
    return true;
  };
  L.infinityForkDefs=function(){
    const stageId=L.frontierStage().id;
    const base=DATA.INFINITY_FORKS||[];
    if(stageId==="cell" || stageId==="creature") return base.filter(function(item){ return ["growth_fork","faith_fork"].includes(item.id); });
    if(stageId==="tribal" || stageId==="civilization") return base.filter(function(item){ return ["growth_fork","science_fork","faith_fork"].includes(item.id); });
    if(stageId==="empire") return base.filter(function(item){ return ["conquest_fork","trade_fork","science_fork"].includes(item.id); });
    if(stageId==="solar") return base.filter(function(item){ return ["science_fork","trade_fork","faith_fork"].includes(item.id); });
    if(stageId==="galactic") return base;
    return base;
  };
  L.forkStagePlans=function(forkId,stageId){
    const plans={
      growth_fork:{
        early:[
          {id:"waters",label:"Bank water",desc:"Hold enough water for a safer branch ecology.",resource:"water",amount:90},
          {id:"food",label:"Bank food",desc:"Stockpile food to prove the branch can sustain life.",resource:"food",amount:120}
        ],
        mid:[
          {id:"housing",label:"Stabilize happiness",desc:"Keep morale high long enough for the branch to root.",resource:"happiness",amount:82},
          {id:"unity",label:"Gather unity",desc:"Demonstrate shared civic growth.",resource:"unity",amount:80}
        ],
        late:[
          {id:"population",label:"Reach thriving population",desc:"Let the branch prove it can hold a larger civilization.",population:140},
          {id:"capacity",label:"Expand reserves",desc:"Show that abundance can be stored without collapse.",capacity:"food",amount:180}
        ]
      },
      science_fork:{
        early:[
          {id:"science",label:"Bank science",desc:"Fund parallel inquiry.",resource:"science",amount:100},
          {id:"data",label:"Bank data",desc:"Archive enough insight to stabilize the branch.",resource:"data",amount:80}
        ],
        mid:[
          {id:"project",label:"Advance a project",desc:"Drive a major work far enough that the branch diverges meaningfully.",projectProgress:0.45},
          {id:"knowledge",label:"Hold knowledge surplus",desc:"Keep the branch fed by interpretation instead of panic.",resource:"knowledge",amount:60}
        ],
        late:[
          {id:"archive",label:"Reach archive maturity",desc:"Carry the branch into deep records and theory.",resource:"data",amount:180},
          {id:"proof",label:"Sustain research morale",desc:"Keep happiness and science aligned while the branch learns.",combo:[{resource:"science",amount:140},{resource:"happiness",amount:78}]}
        ]
      },
      conquest_fork:{
        early:[
          {id:"command",label:"Bank command",desc:"A fork of empire needs disciplined command.",resource:"command",amount:55},
          {id:"power",label:"Bank military power",desc:"Prove the fork can defend its claims.",resource:"military_power",amount:90}
        ],
        mid:[
          {id:"logistics",label:"Secure logistics",desc:"An empire branch without supply is only noise.",resource:"logistics",amount:95},
          {id:"influence",label:"Project influence",desc:"Make neighboring powers feel the branch.",resource:"influence",amount:90}
        ],
        late:[
          {id:"rivals",label:"Survive pressure",desc:"Hold together while rivals rise.",rivalPressure:78},
          {id:"victory",label:"Forge cohesion",desc:"Keep the war-state from eating itself.",combo:[{resource:"command",amount:75},{resource:"cohesion",amount:70}]}
        ]
      },
      trade_fork:{
        early:[
          {id:"gold",label:"Bank gold",desc:"Build enough circulation for a live market branch.",resource:"gold",amount:140},
          {id:"production",label:"Bank production",desc:"Keep the branch supplied.",resource:"production",amount:110}
        ],
        mid:[
          {id:"logistics",label:"Reach logistics surplus",desc:"Trade must move before it can matter.",resource:"logistics",amount:85},
          {id:"luxury",label:"Accumulate luxury",desc:"Civic excess makes the branch distinct.",resource:"luxury",amount:35}
        ],
        late:[
          {id:"wealth",label:"Reach a wealthy state",desc:"The branch must prove surplus can stay political.",combo:[{resource:"gold",amount:220},{resource:"influence",amount:90}]},
          {id:"contracts",label:"Hold stable throughput",desc:"Keep markets open without cracking morale.",combo:[{resource:"production",amount:160},{resource:"happiness",amount:74}]}
        ]
      },
      faith_fork:{
        early:[
          {id:"faith",label:"Bank faith",desc:"Gather enough worship to feed the branch.",resource:"faith",amount:110},
          {id:"culture",label:"Bank culture",desc:"Let the branch become a liturgy, not just a panic.",resource:"culture",amount:95}
        ],
        mid:[
          {id:"divinity",label:"Generate Divinity",desc:"The branch should prove it can feed the god directly.",divinityTotal:60},
          {id:"offering",label:"Make an offering",desc:"History must cross the threshold to matter here.",offerings:1}
        ],
        late:[
          {id:"ascension",label:"Reach transcendence pressure",desc:"Let the branch lean toward the final questions.",resource:"ascension",amount:24},
          {id:"miracle",label:"Hold worship stability",desc:"Keep faith and happiness from splitting apart.",combo:[{resource:"faith",amount:140},{resource:"happiness",amount:75}]}
        ]
      }
    };
    const bucket=(stageId==="cell" || stageId==="creature")?"early":((stageId==="tribal" || stageId==="civilization")?"mid":"late");
    return (((plans[forkId]||{})[bucket])||[]).slice(0,2);
  };
  L.forkBranchPlan=function(forkId){
    const def=(DATA.INFINITY_FORKS||[]).find(function(item){ return item.id===forkId; });
    if(!def) return null;
    const stageId=L.frontierStage().id;
    return {
      id:forkId,
      name:def.name,
      stageId:stageId,
      lessons:L.forkStagePlans(forkId,stageId),
      required:2,
      outcomeName:def.name+" Lesson",
      outcomeDesc:def.desc
    };
  };
  L.stageFamilyForFork=function(stageId){
    if(["cell","creature"].includes(stageId)) return "origin";
    if(["tribal","civilization"].includes(stageId)) return "society";
    if(["empire","solar"].includes(stageId)) return "expansion";
    if(stageId==="galactic") return "apotheosis";
    return "origin";
  };
  L.forkStageOutcome=function(fork,stageId){
    const family=L.stageFamilyForFork(stageId);
    const stageDef=(DATA.STAGES||[]).find(function(item){ return item.id===stageId; }) || {name:stageId};
    const names={
      origin:"First Divergence",
      society:"Civil Lesson",
      expansion:"Imperial Lesson",
      apotheosis:"Cosmic Lesson"
    };
    const overlays={
      origin:{resourceOutput:{food:0.02,water:0.02,happiness:0.01}},
      society:{resourceOutput:{culture:0.02,unity:0.02,cohesion:0.01}},
      expansion:{resourceOutput:{production:0.02,logistics:0.02,command:0.01}},
      apotheosis:{resourceOutput:{ascension:0.02,faith:0.02,data:0.02}}
    };
    const stageOverlays={
      cell:{name:"Cellular Divergence",resourceOutput:{atp:0.02,glucose:0.02,proteins:0.01}},
      creature:{name:"Instinctive Divergence",resourceOutput:{food:0.02,water:0.01,knowledge:0.01}},
      tribal:{name:"Hearth Lesson",resourceOutput:{wood:0.02,culture:0.02,faith:0.01}},
      civilization:{name:"Civic Lesson",resourceOutput:{production:0.02,gold:0.02,influence:0.01}},
      empire:{name:"Imperial Lesson",resourceOutput:{logistics:0.02,command:0.02,military_power:0.01}},
      solar:{name:"Solar Lesson",resourceOutput:{energy:0.02,alloys:0.02,data:0.01}},
      galactic:{name:"Galactic Lesson",resourceOutput:{ascension:0.02,unity:0.02,diplomacy:0.01}}
    };
    const stageOverlay=stageOverlays[stageId]||{};
    const baseResource=((fork.branchOutcomeEffects||{}).resourceOutput)||{};
    const familyResource=((overlays[family]||{}).resourceOutput)||{};
    return {
      family:family,
      name:fork.name+" "+(stageOverlay.name||names[family]),
      desc:"A "+family+"-era branch outcome from the "+(stageDef.name||stageId)+" frontier that keeps shaping future runs.",
      effects:Object.assign({},fork.branchOutcomeEffects||{}, {resourceOutput:Object.assign({},baseResource,familyResource,stageOverlay.resourceOutput||{})})
    };
  };
  L.forkStageLegacy=function(fork,stageId){
    const family=L.stageFamilyForFork(stageId);
    const legacyTable={
      growth_fork:{
        origin:{type:"blessing",name:"First Garden Mercy",desc:"That branch learned how to feed beginnings without panic.",effects:{resourceOutput:{food:0.02,water:0.01,happiness:0.01}}},
        society:{type:"blessing",name:"Pastoral Concord",desc:"Its civic lesson lingers as a culture of sufficiency.",effects:{resourceOutput:{culture:0.01,food:0.02,cohesion:0.01}}},
        expansion:{type:"blessing",name:"Granary Armada",desc:"Expansion remembers how to move plenty instead of scarcity.",effects:{resourceOutput:{logistics:0.02,food:0.02}}},
        apotheosis:{type:"blessing",name:"Eucharistic World",desc:"Abundance itself became a holy grammar.",effects:{resourceOutput:{faith:0.02,divinity_harmony:0.02}}}
      },
      science_fork:{
        origin:{type:"scar",name:"Merciless Curiosity",desc:"The branch learned by cutting too deep, leaving colder beginnings behind.",effects:{resourceOutput:{science:0.02,data:0.01,happiness:-0.01}}},
        society:{type:"blessing",name:"Archive Civics",desc:"Its libraries taught institutions to remember before they judged.",effects:{resourceOutput:{science:0.02,unity:0.01,data:0.01}}},
        expansion:{type:"blessing",name:"Surveyor Dominion",desc:"Empire learned to conquer by knowing first.",effects:{resourceOutput:{data:0.02,projectSpeed:0.02}}},
        apotheosis:{type:"blessing",name:"Revelatory Engine",desc:"The branch translated impossible memory into sacred method.",effects:{resourceOutput:{science:0.02,divinity_knowledge:0.02}}}
      },
      conquest_fork:{
        origin:{type:"scar",name:"Predator Memory",desc:"The earliest lesson was that survival and violence can become indistinguishable.",effects:{resourceOutput:{military_power:0.02,food:0.01,happiness:-0.02}}},
        society:{type:"scar",name:"Triumphal Bureaucracy",desc:"Civil order learned to speak in campaigns and decrees.",effects:{resourceOutput:{command:0.02,influence:0.01,happiness:-0.01}}},
        expansion:{type:"blessing",name:"Disciplined March",desc:"The branch proved force could be made precise instead of merely brutal.",effects:{resourceOutput:{military_power:0.02,command:0.02,cohesion:0.01}}},
        apotheosis:{type:"scar",name:"Litany of Siege",desc:"A cosmic empire remained powerful, but prayer never forgot its wars.",effects:{resourceOutput:{divinity_conquest:0.02,faith:0.01,happiness:-0.01}}}
      },
      trade_fork:{
        origin:{type:"blessing",name:"Open-Handed Camp",desc:"The earliest branch survived by exchange rather than hoarding.",effects:{resourceOutput:{gold:0.02,food:0.01,happiness:0.01}}},
        society:{type:"scar",name:"Tariff Memory",desc:"Civic abundance came with a habit of pricing every mercy.",effects:{resourceOutput:{gold:0.02,production:0.01,faith:-0.01}}},
        expansion:{type:"blessing",name:"Mercantile Constellation",desc:"The branch learned to make distance itself profitable.",effects:{resourceOutput:{gold:0.02,logistics:0.02,production:0.01}}},
        apotheosis:{type:"blessing",name:"Covenant Treasury",desc:"Even devotion learned to circulate as trust rather than tribute.",effects:{resourceOutput:{divinity_wealth:0.02,faith:0.01,influence:0.01}}}
      },
      faith_fork:{
        origin:{type:"blessing",name:"Totem of First Awe",desc:"The branch kept alive a gentler terror before civilization named it worship.",effects:{resourceOutput:{faith:0.02,happiness:0.01}}},
        society:{type:"blessing",name:"Processional Memory",desc:"Cities inherited ritual rhythms that soothed fracture.",effects:{resourceOutput:{faith:0.02,culture:0.02,cohesion:0.01}}},
        expansion:{type:"scar",name:"Missionary Exhaustion",desc:"Holiness expanded faster than it could care for what it claimed.",effects:{resourceOutput:{faith:0.02,influence:0.01,happiness:-0.01}}},
        apotheosis:{type:"blessing",name:"Choir Beyond History",desc:"Its worship escaped the timeline and remained as pure liturgy.",effects:{resourceOutput:{divinity_transcendence:0.02,divinity_harmony:0.01,faith:0.01}}}
      }
    };
    return ((legacyTable[fork.id]||{})[family]) || {type:"blessing",name:fork.name+" Residue",desc:"An alternate branch left a small permanent mark on reality.",effects:{resourceOutput:{data:0.01}}};
  };
  L.activeForkBranch=function(){ return state.game.meta.activeForkBranch||null; };
  L.forkRequirementMet=function(req){
    if(!req) return false;
    const res=state.game.run.resources||{};
    if(req.resource) return (res[req.resource]||0)>=req.amount;
    if(req.population) return (state.game.run.population||0)>=req.population;
    if(req.capacity) return ((state.game.run.capacities||{})[req.capacity]||0)>=req.amount;
    if(req.projectProgress!=null){
      const project=state.game.run.specialProject;
      if(!project) return false;
      const def=L.specialProjectDef();
      if(!def || !def.duration) return false;
      return (project.progress||0) >= def.duration*req.projectProgress;
    }
    if(req.rivalPressure!=null) return (state.game.run.rivals||[]).some(function(rival){ return (rival.score||0)>=req.rivalPressure; });
    if(req.divinityTotal!=null) return (state.game.run.divinityGeneratedTotal||0)>=req.divinityTotal;
    if(req.offerings!=null) return (((state.game.meta.offeringLedger||{}).totalOfferings)||0)>=req.offerings;
    if(req.combo) return req.combo.every(function(part){ return (res[part.resource]||0)>=part.amount; });
    return false;
  };
  L.advanceForkBranch=function(){
    const branch=L.activeForkBranch();
    if(!branch) return false;
    const index=branch.progress||0;
    const req=(branch.lessons||[])[index];
    if(!req || !L.forkRequirementMet(req)) return false;
    branch.progress=index+1;
    branch.completedLessons=(branch.completedLessons||[]);
    branch.completedLessons.push(req.id);
    state.game.meta.activeForkBranch=branch;
    L.pushLog("Branch lesson fulfilled: "+req.label);
    return true;
  };
  L.canMergeFork=function(){
    const branch=L.activeForkBranch();
    return !!(branch && (branch.progress||0) >= (branch.required||0));
  };
  L.currentForkDef=function(){ return (DATA.INFINITY_FORKS||[]).find(function(item){ return item.id===(state.game.meta.activeFork||""); }) || null; };
  L.startFork=function(id){
    if(!L.futureLayerState("infinity").unlocked && !state.ui.debug) return false;
    const def=L.infinityForkDefs().find(function(item){ return item.id===id; });
    if(!def) return false;
    if(state.game.meta.activeFork) return false;
    state.game.meta.activeFork=id;
    state.game.meta.activeForkBranch=Object.assign({progress:0,completedLessons:[],openedAt:Date.now()},L.forkBranchPlan(id));
    L.pushLog("Fork opened: "+def.name);
    return true;
  };
  L.mergeFork=function(){
      const fork=L.currentForkDef();
      const branch=L.activeForkBranch();
      if(!fork || !branch || !L.canMergeFork()) return false;
      const outcome=L.forkStageOutcome(fork,branch.stageId||L.frontierStage().id);
      const legacy=L.forkStageLegacy(fork,branch.stageId||L.frontierStage().id);
      const mastery=state.game.meta.infinityMastery||(state.game.meta.infinityMastery={echoBindings:{},debtTiers:{},mergedForks:{},forkFamilies:{},branchLegacies:{scars:0,blessings:0}});
      if(!(state.game.meta.mergedForkLessons||[]).includes(fork.id)) state.game.meta.mergedForkLessons.push(fork.id);
      mastery.mergedForks[fork.id]=true;
      mastery.forkFamilies[outcome.family]=true;
      if(legacy.type==="scar") mastery.branchLegacies.scars=(mastery.branchLegacies.scars||0)+1;
      else mastery.branchLegacies.blessings=(mastery.branchLegacies.blessings||0)+1;
      (state.game.meta.forkArchives||(state.game.meta.forkArchives=[])).push({
        id:fork.id+":"+Date.now(),
        forkId:fork.id,
        name:fork.name,
        stageId:branch.stageId||L.frontierStage().id,
        family:outcome.family,
        completedLessons:(branch.completedLessons||[]).slice(),
        outcomeName:outcome.name,
        outcomeDesc:outcome.desc,
        effects:outcome.effects||fork.effects||{},
        legacy:legacy
      });
      state.game.meta.activeFork="";
      state.game.meta.activeForkBranch=null;
      L.pushLog("Fork merged: "+fork.name);
      return true;
  };
  L.activeForkSource=function(){
    const fork=L.currentForkDef();
    const branch=L.activeForkBranch();
    if(!fork) return [];
    return [{
      id:"active-fork:"+fork.id,
      name:fork.name+" Branch",
      path:"Infinity",
      desc:(branch && branch.lessons && branch.lessons[branch.progress||0] ? "Current lesson: "+branch.lessons[branch.progress||0].label+". " : "")+(fork.modifierText||"An alternate history is bending the current world until it is merged."),
      effects:fork.activeEffects||fork.effects||{}
    }];
  };
  L.forkArchiveSources=function(){
      return (state.game.meta.forkArchives||[]).reduce(function(out,entry){
        out.push({id:"fork-archive:"+entry.id,name:entry.outcomeName||entry.name,path:"Infinity",desc:(entry.family?entry.family.charAt(0).toUpperCase()+entry.family.slice(1)+" branch: ":"")+(entry.outcomeDesc||""),effects:entry.effects||{}});
        if(entry.legacy){
          out.push({id:"fork-legacy:"+entry.id,name:entry.legacy.name,path:"Infinity "+(entry.legacy.type==="scar"?"Scar":"Blessing"),desc:entry.legacy.desc,effects:entry.legacy.effects||{}});
        }
        return out;
      },[]);
    };
  L.activeCanonRewriteEffects=function(entry){
    if(!entry) return {};
    if(entry.kind==="Story") return {resourceOutput:{faith:0.03,divinity_knowledge:0.03,divinity_harmony:0.02}};
    if(entry.kind==="Victory") return {resourceOutput:{unity:0.03,ascension:0.03,command:0.02}};
    if(entry.kind==="Artifact") return {resourceOutput:{data:0.03,production:0.03,science:0.02}};
    if(entry.kind==="Chronicle") return {resourceOutput:{culture:0.03,faith:0.02,cohesion:0.02}};
    return entry.effects||{};
  };
  L.activePermanenceInheritance=function(){
    const inherit=state.game.meta.eternalInheritances||{};
    return {
      law:inherit.law||"",
      lineage:inherit.lineage||"",
      relic:inherit.relic||"",
      memory:inherit.memory||""
    };
  };
  L.eternalInheritanceSources=function(){
    const inherit=L.activePermanenceInheritance();
    const out=[];
    if(inherit.law){
      const law=(DATA.DIVINE_LAWS||[]).find(function(item){ return item.id===inherit.law; });
      if(law) out.push({id:"eternal-law:"+law.id,name:"Eternal Law: "+law.name,path:"Eternity",effects:{resourceOutput:{influence:0.03,unity:0.03,cohesion:0.02}}});
    }
    if(inherit.lineage){
      out.push({id:"eternal-lineage:"+inherit.lineage,name:"Eternal Lineage: "+L.displayArchetypeName(inherit.lineage),path:"Eternity",effects:{resourceOutput:{culture:0.03,faith:0.02,science:0.02}}});
    }
    if(inherit.relic){
      out.push({id:"eternal-relic:"+inherit.relic,name:"Eternal Relic Memory",path:"Eternity",effects:{resourceOutput:{data:0.03,production:0.03},projectSpeed:0.03}});
    }
    if(inherit.memory){
      out.push({id:"eternal-memory:"+inherit.memory,name:"Eternal Memory",path:"Eternity",effects:{resourceOutput:{faith:0.03,divinity_transcendence:0.03,happiness:0.02}}});
    }
    return out;
  };
  L.testamentSynergySources=function(){
    const chosen=state.game.meta.testamentClauses||[];
    const out=[];
    if(chosen.includes("growth_above_all") && chosen.includes("mercy_in_power")) out.push({id:"testament:flourishing",name:"Flourishing Verdict",path:"Eternity",effects:{resourceOutput:{food:0.03,happiness:0.03,medicine:0.02}}});
    if(chosen.includes("law_above_desire") && chosen.includes("victory_requires_will")) out.push({id:"testament:iron-cosmos",name:"Iron Cosmos",path:"Eternity",effects:{resourceOutput:{command:0.03,cohesion:0.03,influence:0.02}}});
    if(chosen.includes("wonder_without_end") && chosen.includes("memory_of_struggle")) out.push({id:"testament:remembered-stars",name:"Remembered Stars",path:"Eternity",effects:{resourceOutput:{science:0.03,data:0.03,faith:0.02}}});
    return out;
  };
  L.resolveEternalInheritance=function(){
    const active=state.game.meta.permanenceWeaves||[];
    const out={law:"",lineage:"",relic:"",memory:""};
    if(active.includes("woven_law")) out.law=(state.game.meta.divineLaws||[])[0]||"";
    if(active.includes("woven_lineage")) out.lineage=(state.game.meta.hybridLineages||[])[0] || state.game.run.lockedArchetype || "";
    if(active.includes("woven_relic")) out.relic=(Object.keys(state.game.meta.activeRelics||{})[0]) || (Object.keys(state.game.meta.restoredArtifacts||{})[0]) || "";
    if(active.includes("woven_memory")) out.memory=(state.game.meta.canonEntries||[])[0]||"";
    return out;
  };
  L.canonCandidates=function(){
    const codex=L.codexSummary();
    const candidates=[];
    (state.game.meta.storyMoments||[]).slice(-12).forEach(function(row){
      const entry=(DATA.STORY_ENTRIES||[]).find(function(item){ return item.id===row.id; });
      if(entry) candidates.push({id:"story:"+entry.id,name:entry.title,kind:"Story",desc:entry.text,effects:{resourceOutput:{faith:0.02,divinity_knowledge:0.02}}});
    });
    (state.game.meta.victoryLog||[]).slice(0,8).forEach(function(row,idx){
      candidates.push({id:"victory:"+idx+":"+row.name,name:row.name,kind:"Victory",desc:"A completed ascension by "+L.displayArchetypeName(row.archetype)+".",effects:{resourceOutput:{unity:0.02,ascension:0.02}}});
    });
    Object.keys(state.game.meta.restoredArtifacts||{}).slice(0,8).forEach(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      if(artifact) candidates.push({id:"artifact:"+id,name:artifact.name,kind:"Artifact",desc:"A restored artifact declared as permanent truth.",effects:{resourceOutput:{data:0.02,production:0.02}}});
    });
    (state.game.meta.lineageChronicles||[]).slice(0,8).forEach(function(row,idx){
      candidates.push({id:"chronicle:"+idx+":"+row.name,name:row.name,kind:"Chronicle",desc:row.text||"A remembered lineage chronicle.",effects:{resourceOutput:{culture:0.02,faith:0.02}}});
    });
    return candidates.filter(function(item,idx,self){ return self.findIndex(function(other){ return other.id===item.id; })===idx; });
  };
  L.canonizedEntries=function(){
    return (state.game.meta.canonEntries||[]).map(function(id){
      return L.canonCandidates().find(function(item){ return item.id===id; }) || null;
    }).filter(Boolean);
  };
  L.maxCanonEntries=function(){ return 2 + L.futureLayerUpgradeLevel("eternity","canon_resonance"); };
  L.toggleCanonEntry=function(id){
    if(!L.futureLayerState("eternity").unlocked && !state.ui.debug) return false;
    const candidates=L.canonCandidates();
    if(!candidates.some(function(item){ return item.id===id; })) return false;
    const current=(state.game.meta.canonEntries||[]).slice();
    const idx=current.indexOf(id);
    if(idx>=0){
      current.splice(idx,1);
      state.game.meta.canonEntries=current;
      return true;
    }
    if(current.length>=L.maxCanonEntries()) return false;
    current.push(id);
    state.game.meta.canonEntries=current;
    return true;
  };
  L.isCompressedStage=function(stageId){
    const idx=L.stageIndexById(stageId||L.currentStage().id);
    const chosen=!!((state.game.meta.compressedStageBands||{})[stageId||L.currentStage().id]);
    return L.compressedFrontiersActive() && idx>=0 && idx < L.frontierStageIndex() && (!L.futureLayerState("singularity").unlocked || chosen);
  };
  L.compressedFrontierBundle=function(stageId){
    if(!L.isCompressedStage(stageId)) return {};
    const stage=DATA.STAGES[L.stageIndexById(stageId)];
    const amount=18+L.frontierStageIndex()*8+(L.futureLayerUpgradeLevel("singularity","compression_lattice")*6)+(L.futureLayerUpgradeLevel("singularity","parallel_memory")*8);
    return Object.fromEntries((stage.resources||[]).slice(0,4).map(function(id,idx){
      return [id,Math.round(amount*(idx===0?1.2:0.85))];
    }));
  };
  L.compressedFrontierSource=function(){
    if(!L.isCompressedStage()) return [];
    const gap=Math.max(1,L.frontierStageIndex()-L.stageIndexById(L.currentStage().id));
    return [{
      id:"enlightenment:compressed_frontiers",
      name:"Compressed Frontiers",
      path:"Enlightenment Shop",
      effects:{
        allOutput:Math.min(0.9,0.35+gap*0.12),
        manualBonus:0.35+gap*0.1,
        populationGrowth:0.004*gap
      }
    }];
  };
  L.ritualSurgeSources=function(){
    return (state.game.run.ritualSurges||[]).filter(function(item){ return (item.remaining||0)>0; }).map(function(item){
      return {id:"ritual_surge:"+item.id,name:"Ritual Surge",path:"Divine Intervention",effects:item.effects||{allOutput:item.output||0}};
    });
  };
  L.universeBoonSources=function(){
    return (DATA.UNIVERSE_RESET_BOONS||[]).map(function(boon){
      const count=L.universeBoonLevel(boon.id);
      if(!count) return null;
      return {id:"universe_boon:"+boon.id,name:boon.name+" x"+count,path:"Universe Reset",effects:boon.effects||{},effectiveCount:count};
    }).filter(Boolean);
  };
  L.debugSetSpeed=function(mult){
    const list=state.ui.debug?DATA.DEBUG_SPEEDS:DATA.SPEEDS;
    const idx=list.indexOf(mult);
    if(idx<0) return false;
    state.speedIndex=idx;
    return true;
  };
  L.debugGrantMeta=function(kind,amount){
    const key=kind+"Points";
    if(state.game.meta[key]==null) return false;
    state.game.meta[key]=Math.max(0,(state.game.meta[key]||0)+(amount||0));
    return true;
  };
  L.debugSetFrontier=function(stageId){
    const idx=L.stageIndexById(stageId);
    if(idx<0) return false;
    state.game.meta.frontierStageIndex=idx;
    return true;
  };
  L.debugUnlockLayer=function(layerId){
    if(layerId==="evolution"){
      state.game.meta.frontierStageIndex=Math.max(state.game.meta.frontierStageIndex||0,0);
      return true;
    }
    if(layerId==="enlightenment"){
      state.game.meta.galacticWins=Math.max(1,state.game.meta.galacticWins||0);
      state.game.meta.frontierStageIndex=Math.max(DATA.STAGES.length-1,state.game.meta.frontierStageIndex||0);
      state.game.meta.futureLayers.enlightenment.unlocked=true;
      state.game.meta.enlightenmentPoints=Math.max(25,state.game.meta.enlightenmentPoints||0);
      L.unlockStoryEntry("evolution_complete");
      return true;
    }
    if(layerId==="transcendence"){
      state.game.meta.galacticWins=Math.max(5,state.game.meta.galacticWins||0);
      state.game.meta.frontierStageIndex=Math.max(DATA.STAGES.length-1,state.game.meta.frontierStageIndex||0);
      state.game.meta.futureLayers.enlightenment.unlocked=true;
      state.game.meta.futureLayers.transcendence.unlocked=true;
      state.game.meta.enlightenmentPoints=Math.max(100,state.game.meta.enlightenmentPoints||0);
      state.game.meta.transcendencePoints=Math.max(20,state.game.meta.transcendencePoints||0);
      L.unlockStoryEntry("transcendence_unlocked");
      return true;
    }
    if(["genesis","apotheosis","singularity","omnipotence","divinity","infinity"].includes(layerId)){
      state.game.meta.futureLayers.enlightenment.unlocked=true;
      state.game.meta.futureLayers.transcendence.unlocked=true;
      state.game.meta.enlightenmentPoints=Math.max(140,state.game.meta.enlightenmentPoints||0);
      state.game.meta.transcendencePoints=Math.max(40,state.game.meta.transcendencePoints||0);
      state.game.meta.futureLayers[layerId].unlocked=true;
      state.game.meta.futureCurrencies[layerId]=Math.max(20,state.game.meta.futureCurrencies[layerId]||0);
      const idx=L.futureLayerIndex(layerId);
      L.futureLayerOrder().slice(0,idx).forEach(function(id){
        state.game.meta.futureLayers[id].unlocked=true;
        state.game.meta.futureCurrencies[id]=Math.max(20,state.game.meta.futureCurrencies[id]||0);
      });
      const storyId=layerId+"_unlocked";
      if((DATA.STORY_ENTRIES||[]).some(function(entry){ return entry.id===storyId; })) L.unlockStoryEntry(storyId);
      return true;
    }
    if(layerId==="eternity"){
      state.game.meta.futureLayers.enlightenment.unlocked=true;
      state.game.meta.futureLayers.transcendence.unlocked=true;
      L.futureLayerOrder().forEach(function(id){
        state.game.meta.futureLayers[id].unlocked=true;
        state.game.meta.futureCurrencies[id]=Math.max(30,state.game.meta.futureCurrencies[id]||0);
      });
      state.game.meta.futureLayers.eternity.unlocked=true;
      state.game.meta.enlightenmentPoints=Math.max(200,state.game.meta.enlightenmentPoints||0);
      state.game.meta.transcendencePoints=Math.max(80,state.game.meta.transcendencePoints||0);
      L.unlockStoryEntry("eternity_glimpse");
      return true;
    }
    return false;
  };
  L.buyEnlightenmentUpgrade=function(id){
    const def=(DATA.ENLIGHTENMENT_UPGRADES||[]).find(function(item){ return item.id===id; });
    if(!def) return false;
    if(def.implemented===false) return false;
    if(!L.futureLayerState("enlightenment").unlocked && !state.ui.debug) return false;
    const node=(DATA.FORESIGHT_NODES||[]).find(function(item){ return item.upgradeId===id; });
    if(node){
      const blocked=(node.requires||[]).some(function(reqId){
        const req=(DATA.FORESIGHT_NODES||[]).find(function(item){ return item.id===reqId; });
        return req && !L.enlightenmentUpgradeLevel(req.upgradeId);
      });
      if(blocked) return false;
    }
    if(L.enlightenmentUpgradeLevel(id)>0) return false;
    if(state.game.meta.enlightenmentPoints<def.cost && !state.ui.debug) return false;
    if(!state.ui.debug) state.game.meta.enlightenmentPoints-=def.cost;
    state.game.meta.enlightenmentUpgrades[id]=1;
    return true;
  };
  L.buyTranscendenceUpgrade=function(id){
    const def=(DATA.TRANSCENDENCE_UPGRADES||[]).find(function(item){ return item.id===id; });
    if(!def) return false;
    if(def.implemented===false) return false;
    if(!L.futureLayerState("transcendence").unlocked && !state.ui.debug) return false;
    if(L.transcendenceUpgradeLevel(id)>0) return false;
    if(state.game.meta.transcendencePoints<def.cost && !state.ui.debug) return false;
    if(!state.ui.debug) state.game.meta.transcendencePoints-=def.cost;
    state.game.meta.transcendenceUpgrades[id]=1;
    if(id==="mythic_realm" && !state.game.meta.cosmeticTheme && L.availableCosmeticThemes().some(function(theme){ return theme.id==="fantasy_realm"; })){
      L.chooseCosmeticTheme("fantasy_realm");
    }
    return true;
  };
  L.universeBoonLevel=function(id){ return ((state.game.meta.universeBoons||{})[id])||0; };
  L.chooseUniverseBoon=function(id){
    const def=(DATA.UNIVERSE_RESET_BOONS||[]).find(function(item){ return item.id===id; });
    if(!def) return false;
    state.game.meta.selectedUniverseBoon=id;
    L.unlockStoryEntry("eternity_glimpse");
    return true;
  };
  L.preserveUniverse=function(){
      const story=L.storySummary();
      const canonized=L.canonizedEntries();
      const eternityMastery=state.game.meta.eternityMastery||(state.game.meta.eternityMastery={clausesSealed:{},canonKinds:{},weavesSealed:{},preservedUniverses:0,resets:0});
      const mask=L.currentDivineMaskDef(), polarity=L.currentPrayerPolarityDef(), preset=L.currentDivinityPresetDef();
      const inherit=L.resolveEternalInheritance();
    const testamentNames=(state.game.meta.testamentClauses||[]).map(function(id){
      return ((DATA.ETERNITY_TESTAMENT_CLAUSES||[]).find(function(item){ return item.id===id; })||{}).name || id;
    });
    const weaveNames=(state.game.meta.permanenceWeaves||[]).map(function(id){
      return ((DATA.PERMANENCE_WEAVES||[]).find(function(item){ return item.id===id; })||{}).name || id;
    });
    const snapshot={
      time:Date.now(),
      frontier:L.frontierStage().id,
      wins:state.game.meta.galacticWins||0,
      theme:state.game.meta.cosmeticTheme||"",
      themeLabel:((L.availableCosmeticThemes().find(function(theme){ return theme.id===(state.game.meta.cosmeticTheme||""); })||{}).name)||"",
      focus:(L.divinityFocusDef()||{}).name||"",
      maskName:mask?mask.name:"",
      polarityName:polarity?polarity.name:"",
      routingPreset:preset?preset.name:"",
      paths:Object.keys((L.codexSummary().pathEntries||[]).reduce(function(map,row){ map[row.path]=true; return map; },{})),
      artifacts:Object.keys(state.game.meta.restoredArtifacts||{}),
      testamentClauses:(state.game.meta.testamentClauses||[]).slice(),
      testamentNames:testamentNames,
      permanenceWeaves:(state.game.meta.permanenceWeaves||[]).slice(),
      weaveNames:weaveNames,
      eternalInheritance:inherit,
      canonSourceStories:(story.entries||[]).slice(-8).map(function(entry){ return entry.id; }),
      storyTitles:(story.entries||[]).slice(-8).map(function(entry){ return entry.title; }),
      canonized:canonized.map(function(entry){ return {id:entry.id,name:entry.name,kind:entry.kind}; }),
      canonSummary:canonized.length?canonized.map(function(entry){ return entry.name; }).join(", "):"No canonized truths",
      endingText:"The universe closed beneath the "+(mask?mask.name:"nameless face")+" with "+(polarity?polarity.name.toLowerCase():"unknown")+" worship, guided by "+((L.divinityFocusDef()||{}).name||"an unchosen focus")+", and remembered through "+(preset?preset.name:"unshaped liturgy")+"."
      };
      eternityMastery.preservedUniverses=(eternityMastery.preservedUniverses||0)+1;
      (state.game.meta.testamentClauses||[]).forEach(function(id){ eternityMastery.clausesSealed[id]=true; });
      (state.game.meta.permanenceWeaves||[]).forEach(function(id){ eternityMastery.weavesSealed[id]=true; });
      canonized.forEach(function(entry){ if(entry.kind) eternityMastery.canonKinds[entry.kind]=true; });
      (state.game.meta.preservedUniverses||(state.game.meta.preservedUniverses=[])).push(snapshot);
    state.game.meta.universePreserveCount=(state.game.meta.universePreserveCount||0)+1;
    L.unlockStoryEntry("eternity_glimpse");
    L.pushLog("Universe preserved in canon.");
    return true;
  };
  L.resetUniverse=function(){
      const boonId=state.game.meta.selectedUniverseBoon||"";
      if(!boonId) return false;
      const eternityMastery=state.game.meta.eternityMastery||(state.game.meta.eternityMastery={clausesSealed:{},canonKinds:{},weavesSealed:{},preservedUniverses:0,resets:0});
      eternityMastery.resets=(eternityMastery.resets||0)+1;
      const preserved={
      preservedUniverses:state.game.meta.preservedUniverses||[],
      universeBoons:Object.assign({},state.game.meta.universeBoons||{}),
      universeResetCount:(state.game.meta.universeResetCount||0)+1,
      universePreserveCount:state.game.meta.universePreserveCount||0,
      storyEntries:Object.assign({},state.game.meta.storyEntries||{}),
      storyMoments:(state.game.meta.storyMoments||[]).slice(),
      storyAcknowledged:Object.assign({},state.game.meta.storyAcknowledged||{}),
      finalTestaments:(state.game.meta.finalTestaments||[]).slice(),
        eternalInheritances:L.resolveEternalInheritance(),
        eternityMastery:JSON.parse(JSON.stringify(eternityMastery))
      };
    preserved.universeBoons[boonId]=(preserved.universeBoons[boonId]||0)+1;
    state.game=State.createGame();
    state.game.meta.preservedUniverses=preserved.preservedUniverses;
    state.game.meta.universeBoons=preserved.universeBoons;
    state.game.meta.universeResetCount=preserved.universeResetCount;
    state.game.meta.universePreserveCount=preserved.universePreserveCount;
      state.game.meta.storyEntries=preserved.storyEntries;
      state.game.meta.storyMoments=preserved.storyMoments;
        state.game.meta.storyAcknowledged=preserved.storyAcknowledged;
        state.game.meta.finalTestaments=preserved.finalTestaments;
        state.game.meta.eternalInheritances=preserved.eternalInheritances;
        state.game.meta.eternityMastery=preserved.eternityMastery;
        state.game.meta.selectedUniverseBoon="";
    L.unlockStoryEntry("universe_reset");
    state.ui.betweenRuns=false;
    state.ui.betweenRunsStep="review";
    L.pushLog("Universe reset. Cosmic boon chosen: "+(L.universeBoonLevel(boonId)>0 ? ((DATA.UNIVERSE_RESET_BOONS||[]).find(function(item){ return item.id===boonId; })||{}).name : boonId));
    return true;
  };
  L.templatePriorityEnabled=function(){
    return L.enlightenmentUpgradeLevel("template_priority")>0 || L.enlightenmentUpgradeLevel("policy_autopilot")>0 || L.transcendenceUpgradeLevel("template_overdrive")>0;
  };
  L.transcendenceTemplatePriority=function(){
    const path=state.game.run.seedPreferredAscensionPath||"";
    if(path==="synthetic" || path==="dimensional") return "research";
    if(path==="energetic") return "force";
    if(path==="psionic" || path==="biological") return "stability";
    return state.game.run.automationPolicy||"balanced";
  };
  L.templatePriorityScore=function(item,kind){
    if(!item) return 0;
    const stageId=L.currentStage().id, path=state.game.run.seedPreferredAscensionPath||state.game.run.ascensionPath||"", bloc=state.game.run.seedPreferredCongressBloc||"", preferredFTL=state.game.run.seedPreferredFTLMethod||"", policy=state.game.run.automationPolicy||"balanced";
    const id=item.id||"", category=(item.category||"").toLowerCase(), effects=item.effects||{}, per=effects.perSecond||{}, output=effects.resourceOutput||{};
    let score=0;
    if(stageId==="solar"){
      if(id==="planetary_colony") score+=16;
      if(id==="solar_array") score+=20;
      if(id==="shipyard_ring") score+=28;
      if(id==="ftl_research") score+=32;
      if(id==="interplanetary_exchange" || id==="quantum_navigation") score+=10;
      if(preferredFTL==="warp_lensing" && (id==="planetary_colony" || id==="shipyard_ring" || id==="orbital_habitats")) score+=8;
      if(preferredFTL==="hyperlane_resonance" && (id==="solar_array" || id==="interplanetary_exchange" || id==="quantum_navigation")) score+=10;
      if(preferredFTL==="wormhole_apertures" && (id==="shipyard_ring" || id==="xeno_embassy" || id==="deep_space_telescope")) score+=8;
      if(path==="synthetic" && (id==="quantum_navigation" || id==="ai_traffic_control")) score+=10;
      if(path==="psionic" && (id==="orbital_habitats" || id==="biosphere_rings")) score+=8;
      if(path==="energetic" && (id==="solar_array" || id==="nanoforge")) score+=10;
      if(path==="dimensional" && (id==="deep_space_telescope" || id==="xeno_embassy")) score+=8;
    }
    if(stageId==="galactic"){
      if(id==="sector_network") score+=18;
      if(id==="quantum_archive") score+=(path==="synthetic" || path==="dimensional" || bloc==="synthetic")?30:20;
      if(id==="gateway_spine") score+=26;
      if(id==="ascension_protocol") score+=34;
      if(id==="ascension_protocols") score+=40;
      if(id==="gateway_protocols" || id==="wormhole_corridors") score+=12;
      if(path==="synthetic" && ["synthetic_mind","ai_integration","mind_upload","emergency_ascension_work","transcendent_synthesis"].includes(id)) score+=18;
      if(path==="psionic" && ["federation_council","psionic_chorus","psi_potential","telepathy"].includes(id)) score+=18;
      if(path==="biological" && ["bio_ascension_vats","genetic_engineering","bio_immortality","biosphere_seed_fleet"].includes(id)) score+=18;
      if(path==="energetic" && ["energy_transfiguration_core","energy_manipulation","matter_conversion","dyson_swarm"].includes(id)) score+=18;
      if(path==="dimensional" && ["dimensional_lab","dimensional_mastery","reality_creation","dimensional_refuge"].includes(id)) score+=18;
      if(bloc==="synthetic" && ((category.indexOf("infrastructure")>=0 || id.indexOf("archive")>=0) || (per.data||0)>0)) score+=10;
      if(bloc==="energetic" && ((category.indexOf("military")>=0 || category.indexOf("defense")>=0 || (per.command||0)>0 || (per.energy||0)>0))) score+=10;
      if(bloc==="psionic" && ((per.cohesion||0)>0 || (per.diplomacy||0)>0 || (output.cohesion||0)>0 || (per.faith||0)>0)) score+=10;
      if(bloc==="dimensional" && ((per.data||0)>0 || (per.science||0)>0 || (per.rare_matter||0)>0 || category.indexOf("megastructures")>=0)) score+=10;
      if(bloc==="biological" && ((per.food||0)>0 || (per.medicine||0)>0 || (per.terraforming||0)>0)) score+=10;
    }
      if(policy==="science") score+=(per.science||0)*20+(per.data||0)*18+(output.science||0)*8+(output.data||0)*8;
      if(policy==="food") score+=(per.food||0)*18+(per.water||0)*14+(output.food||0)*6+(output.water||0)*6;
      if(policy==="lineage" && item.archetypeReq===state.game.run.lockedArchetype) score+=10;
      if(L.enlightenmentUpgradeLevel("destiny_lock")>0 && path){
        if(item.requiresPath===path) score+=16;
        if(bloc && item.bloc===bloc) score+=10;
      }
      if(L.transcendenceUpgradeLevel("template_overdrive")>0) score*=1.25;
      return score;
    };
  L.pickTemplatePriorityPurchase=function(){
    if(!L.templatePriorityEnabled()) return null;
    const systems=(L.currentStage().systems||[]).filter(function(item){
      if(L.repeatableSystem(item)) return !L.lockReasonForSystem(item) && L.canAfford(L.scaledCost(item.cost,L.systemOwnedCount(item.id)));
      return !state.game.run.ownedSystems[item.id] && !L.lockReasonForSystem(item) && L.canAfford(L.discountedCost(item.cost));
    }).map(function(item){
      return {kind:"system",item:item,priority:L.templatePriorityScore(item,"system"),weight:L.purchaseWeight(L.repeatableSystem(item)?L.scaledCost(item.cost,L.systemOwnedCount(item.id)):L.discountedCost(item.cost))};
    });
    const techs=(L.currentStage().technologies||[]).filter(function(item){
      return !state.game.run.technologies[item.id] && !L.lockReasonForTech(item) && L.canAfford(L.discountedCost(item.cost));
    }).map(function(item){
      return {kind:"tech",item:item,priority:L.templatePriorityScore(item,"tech"),weight:L.purchaseWeight(L.discountedCost(item.cost))};
    });
    const choice=systems.concat(techs).sort(function(a,b){
      return b.priority-a.priority || a.weight-b.weight;
    })[0];
    return choice&&choice.priority>0?choice:null;
  };
  L.preferredProjectForTemplate=function(){
    const priority=L.transcendenceTemplatePriority();
    const projects=L.availableSpecialProjects();
    if(!projects.length) return null;
    if(L.currentStage().id==="galactic" && !state.game.run.technologies.ascension_protocols) return null;
    if(L.currentStage().id==="solar" && !state.game.meta.completedProjects.ftl_theory_conclave){
      return projects.find(function(project){ return project.id==="ftl_theory_conclave"; }) || projects[0] || null;
    }
    if(L.currentStage().id==="solar" && !state.game.meta.completedProjects.ftl_proof_flight){
      return projects.find(function(project){ return project.id==="ftl_proof_flight"; }) || projects[0] || null;
    }
    if(priority==="research"){
      return projects.find(function(project){ return project.id==="ftl_research" || project.id.indexOf("dossier_exploit:")===0 || project.id.indexOf("rival_sabotage:")===0; }) || null;
    }
    if(priority==="stability"){
      return projects.find(function(project){ return project.id.indexOf("rival_detente:")===0 || project.id==="emergency_ascension_work"; }) || null;
    }
    if(priority==="force"){
      return projects.find(function(project){ return project.id.indexOf("rival_integration:")===0 || project.id.indexOf("rival_sabotage:")===0; }) || null;
    }
    return projects[0]||null;
  };
  L.recommendedEnlightenmentUpgrades=function(){
    const order=["route_templates","pressure_omens","seed_bias","resource_threads","template_priority","policy_autopilot","rival_prophecy","ftl_primers","proof_scaffolds","counterplay_network","bloc_blueprints","institutional_memory","continuity_engine","chronicle_lens","synergy_visions","bottleneck_index","fate_weaving","compressed_frontiers","destiny_lock"];
    return order.map(function(id){ return (DATA.ENLIGHTENMENT_UPGRADES||[]).find(function(item){ return item.id===id; }); }).filter(function(item){ return item && !L.enlightenmentUpgradeLevel(item.id); });
  };
  L.recommendedTranscendenceUpgrades=function(){
    const order=["shop_autobuyer","instant_seeding","template_overdrive","offering_altars","ritual_reserve","script_lattice","seed_orchestra","crisis_forecasting","theme_curator","cosmic_relay","mythic_realm","mythic_index"];
    return order.map(function(id){ return (DATA.TRANSCENDENCE_UPGRADES||[]).find(function(item){ return item.id===id; }); }).filter(function(item){ return item && item.implemented!==false && !L.transcendenceUpgradeLevel(item.id); });
  };
  L.runTranscendenceAutomation=function(){
    if(!L.futureLayerState("transcendence").unlocked) return false;
    let changed=false;
    if(state.ui.betweenRuns){
      if(L.transcendenceUpgradeLevel("cosmic_relay")>0 && state.ui.betweenRunsStep==="setup" && !state.game.run.seedTemplateName){
        changed=L.autoApplySeedTemplate(L.frontierStage().id) || changed;
      }
      if(L.transcendenceUpgradeLevel("shop_autobuyer")>0 && state.ui.betweenRunsStep==="shop"){
        let loopGuard=0;
        while(loopGuard<20){
          loopGuard+=1;
          let bought=false;
          const evo=L.recommendedEvolutionUpgrades().find(function(item){ return item.affordable; });
          if(evo && L.buyUpgrade(evo.id)){ bought=true; changed=true; }
          const enlighten=L.recommendedEnlightenmentUpgrades().find(function(item){ return (state.game.meta.enlightenmentPoints||0)>=item.cost; });
          if(enlighten && L.buyEnlightenmentUpgrade(enlighten.id)){ bought=true; changed=true; }
          const transcend=L.recommendedTranscendenceUpgrades().find(function(item){ return (state.game.meta.transcendencePoints||0)>=item.cost; });
          if(transcend && L.buyTranscendenceUpgrade(transcend.id)){ bought=true; changed=true; }
          if(!bought) break;
        }
      }
      if(L.transcendenceUpgradeLevel("instant_seeding")>0){
        if(state.ui.betweenRunsStep==="review"){ state.ui.betweenRunsStep="shop"; changed=true; }
        else if(state.ui.betweenRunsStep==="shop"){ state.ui.betweenRunsStep="setup"; changed=true; }
        else if(state.ui.betweenRunsStep==="setup"){
          const canAutoSeed=L.seedAutopilotEnabled() || L.enlightenmentUpgradeLevel("route_templates")<=0 || !!state.game.run.seedTemplateName;
          if(canAutoSeed){
            state.ui.betweenRuns=false;
            state.ui.betweenRunsStep="review";
            changed=true;
          }
        }
      }
      return changed;
    }
    if(L.transcendenceUpgradeLevel("mythic_realm")>0 && !state.game.meta.cosmeticTheme && L.availableCosmeticThemes().some(function(theme){ return theme.id==="fantasy_realm"; })){
      changed=L.chooseCosmeticTheme("fantasy_realm") || changed;
    }
    if(L.transcendenceUpgradeLevel("script_lattice")>0){
      const congress=L.activeCongressCrisis();
      if(congress && !state.game.run.rivalEvents.congressCrisis && (congress.choices||[])[0]){
        changed=L.chooseCongressCrisisResponse(congress.choices[0].id) || changed;
      }
      const institution=L.activeInstitutionCrisis();
      if(institution && !state.game.run.rivalEvents.institutionCrisis && (institution.choices||[])[0]){
        changed=L.chooseInstitutionCrisisResponse(institution.choices[0].id) || changed;
      }
      if(state.game.run.pendingProjectChoice){
        const pending=L.pendingProjectDef();
        if(pending && (pending.choices||[])[0]){
          changed=L.chooseProjectCompletion(pending.choices[0].id) || changed;
        }
      }
    }
    if(L.enlightenmentUpgradeLevel("policy_autopilot")>0 && !state.game.run.specialProject && !state.game.run.pendingProjectChoice){
      const preferred=L.preferredProjectForTemplate();
      if(preferred) changed=L.startSpecialProject(preferred.id) || changed;
    }
    return changed;
  };
  L.runScriptAutomation=function(dt){
    if(!((L.futureLayerState("transcendence").unlocked && L.transcendenceUpgradeLevel("script_lattice")>0) || state.ui.debug)) return false;
    let changed=false;
    const active=state.game.meta.activeScripts||{};
    const failures=state.game.run.resourceFailures||{}, preset=L.currentDivinityPresetDef(), order=(preset&&preset.scriptPriority&&preset.scriptPriority.length)?preset.scriptPriority:["shortage_mercy","project_consecration","crisis_seal","surplus_offertory"];
    const activeProject=L.specialProjectDef(), hasCrisis=!!(L.activeCongressCrisis() || L.activeInstitutionCrisis());
      order.forEach(function(id){
        if(!active[id]) return;
        if(id==="shortage_mercy" && ((failures.food||0)>6 || (failures.water||0)>6 || (state.game.run.resources.food||0)<30 || (state.game.run.resources.water||0)<30)){
          changed=L.performRitual("mercy_of_abundance") || changed;
      } else if(id==="project_consecration" && state.game.run.specialProject && state.game.run.specialProject.progress<((L.specialProjectDef()||{}).duration||0)){
        changed=L.performRitual((activeProject && ["ftl_proof_flight","ftl_research","ascension_protocols"].includes(activeProject.id))?"hidden_gate":"consecrate_project") || changed;
      } else if(id==="crisis_seal" && hasCrisis){
        changed=L.performRitual("seal_the_crack") || changed;
      } else if(id==="surplus_offertory"){
        const stable=(state.game.run.resources.food||0)>120 && (state.game.run.resources.water||0)>120 && (state.game.run.resources.happiness||0)>40;
        if(stable) changed=L.makeOffering("harvest_tithe") || changed;
      } else if(id==="foundry_offertory"){
        const industrial=(state.game.run.resources.production||0)>120 && (state.game.run.resources.alloys||0)>60 && (state.game.run.resources.gold||0)>80;
        if(industrial) changed=L.makeOffering("foundry_sacrifice") || changed;
      } else if(id==="jubilee_watch"){
        if((state.game.run.resources.happiness||0)<42 || (state.game.run.resources.cohesion||0)<40 || hasCrisis) changed=L.performRitual("jubilee_edict") || changed;
      } else if(id==="happiness_mercy"){
        if((state.game.run.resources.happiness||0)<32 || (state.game.run.resources.cohesion||0)<30) changed=L.performRitual("jubilee_edict") || changed;
      } else if(id==="hidden_gate_watch"){
        const ftlProject=activeProject && ["ftl_theory_conclave","ftl_proof_flight","ftl_research","ascension_protocols"].includes(activeProject.id);
        if(ftlProject && state.game.run.specialProject && state.game.run.specialProject.progress<((activeProject||{}).duration||0)*0.7) changed=L.performRitual("hidden_gate") || changed;
      } else if(id==="logistics_oblation"){
        const surplus=(state.game.run.resources.production||0)>95 && (state.game.run.resources.logistics||0)>70 && (state.game.run.resources.command||0)>35;
        if(surplus) changed=L.makeOffering("infrastructure_oblation") || changed;
        } else if(id==="pilgrim_procession"){
          const faithful=(state.game.run.resources.culture||0)>100 && (state.game.run.resources.faith||0)>100 && (state.game.run.resources.unity||0)>70;
          if(faithful) changed=L.makeOffering("pilgrim_levy") || changed;
        } else if(id==="vault_offertory"){
          const wealthy=(state.game.run.resources.gold||0)>180 && (state.game.run.resources.production||0)>130 && (state.game.run.resources.data||0)>75;
          if(wealthy) changed=L.makeOffering("vault_immolation") || changed;
        } else if(id==="collapse_litany"){
          const heavyFailures=Object.keys(failures).filter(function(key){ return (failures[key]||0)>8; }).length>=2;
          if(heavyFailures) changed=L.performRitual("seal_the_crack") || changed;
        }
      });
    const preferredMiracle=L.preferredMiracleDef();
    if(preferredMiracle && L.isMiraclePriorityReady(preferredMiracle.id)){
      changed=L.invokeMiracle(preferredMiracle.id) || changed;
    }
    return changed;
  };
  L.debugFillCurrentResources=function(){
    const stage=L.currentStage();
    stage.resources.forEach(function(id,idx){
      const cap=L.capacityFor(id)||25;
      const fill=idx===0?0.85:0.72;
      state.game.run.resources[id]=Math.max(state.game.run.resources[id]||0,Math.round(cap*fill));
      state.game.run.capacities[id]=Math.max(state.game.run.capacities[id]||25,cap);
    });
    if(stage.resources.includes("happiness")) state.game.run.resources.happiness=Math.max(state.game.run.resources.happiness||0,80);
    return true;
  };
  L.debugClaimAllGoals=function(){
    L.stageGoals().filter(function(goal){ return goal.done && !goal.claimed; }).forEach(function(goal){ L.claimStageGoal(goal.id); });
    return true;
  };
  L.debugCompleteProject=function(){
    if(state.game.run.pendingProjectChoice){
      const def=L.pendingProjectDef();
      const choice=((def&&def.choices)||[])[0];
      if(choice) return L.chooseProjectCompletion(choice.id);
      return false;
    }
    if(!state.game.run.specialProject) return false;
    state.game.run.specialProject.progress=state.game.run.specialProject.duration;
    return true;
  };
  L.debugStartAtStage=function(stageId){
    const idx=L.stageIndexById(stageId);
    if(idx<0) return false;
    const meta=state.game.meta;
    const run=State.createRun(meta);
    run.stageIndex=idx;
    run.population=idx===0?8:Math.max(12,10+idx*8);
    const stage=DATA.STAGES[idx];
    stage.resources.forEach(function(id,resourceIndex){
      run.capacities[id]=Math.max(run.capacities[id]||25,140+idx*30);
      run.resources[id]=Math.round((run.capacities[id]||25)*(resourceIndex===0?0.48:0.34));
    });
    Object.entries(L.frontierKitBundle(stage.id)).forEach(function(entry){
      run.resources[entry[0]]=Math.max(run.resources[entry[0]]||0,entry[1]);
      run.capacities[entry[0]]=Math.max(run.capacities[entry[0]]||25,Math.round(entry[1]*2.5));
    });
    Object.entries(L.compressedFrontierBundle(stage.id)).forEach(function(entry){
      run.resources[entry[0]]=Math.max(run.resources[entry[0]]||0,entry[1]);
      run.capacities[entry[0]]=Math.max(run.capacities[entry[0]]||25,Math.round(entry[1]*2.5));
    });
    if(stage.id==="creature"){
      run.resources.food=Math.max(run.resources.food||0,28);
      run.resources.water=Math.max(run.resources.water||0,28);
      run.resources.materials=Math.max(run.resources.materials||0,18);
    }
    if(stage.resources.includes("happiness")) run.resources.happiness=Math.max(run.resources.happiness||0,80);
    if(idx>=1){
      const known=Object.keys(state.game.meta.revealedArchetypes||{}).find(function(id){ return state.game.meta.revealedArchetypes[id]; })||"humanoid";
      run.lockedArchetype=known;
      run.archive=[{stageId:"cell",archetype:known,traits:[],affinity:{[known]:1}}];
    }
    if(stageId==="galactic") meta.completedProjects.ftl_research=true;
    state.game.run=run;
    state.ui.betweenRuns=false;
    state.ui.betweenRunsStep="review";
    state.running=true;
    L.autoApplySeedTemplate(L.frontierStage().id);
    L.ensureWorldState();
    return true;
  };
  L.mapWonderSources=function(){
    const slots=L.mapSlotsForStage();
    return Object.entries(state.game.run.mapWonders||{}).map(function(entry){
      const slot=slots.find(function(item){ return item.id===entry[0]; });
      const wonder=(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===entry[1]; });
      const level=(state.game.run.mapWonderLevels||{})[entry[0]]||1;
      return wonder?Object.assign({},wonder,{path:"Map Wonder",slotName:slot?slot.name:entry[0],level:level,effects:L.scaleEffects(wonder.effects||{},1+(level-1)*0.5)}):null;
    }).filter(Boolean);
  };
  L.wonderSetSources=function(){
    const built=Object.values(state.game.run.mapWonders||{});
    return (DATA.WONDER_SETS||[]).filter(function(set){
      return (set.requires||[]).every(function(id){ return built.includes(id); });
    }).map(function(set){ return Object.assign({path:"Wonder Set"},set); });
  };
  L.rivalDefectionSources=function(){
    return Object.entries(state.game.run.rivalDefections||{}).map(function(entry){
      const def=(DATA.RIVAL_DEFECTIONS||[]).find(function(item){ return item.id===entry[1]; });
      return def?Object.assign({id:"defection:"+entry[0],name:L.displayArchetypeName(entry[0])+": "+def.name,path:"Rival Defection"},def):null;
    }).filter(Boolean);
  };
  L.museumRewardSources=function(){
    const rows=L.codexSummary().museum||[];
    const best=rows.reduce(function(max,row){ return Math.max(max,row.count||0); },0);
    return (DATA.MUSEUM_REWARDS||[]).filter(function(reward){ return best>=reward.count; }).map(function(reward){ return Object.assign({path:"Victory Museum"},reward); });
  };
  L.vassalSources=function(){
    return Object.entries(state.game.meta.vassals||{}).map(function(entry){
      const arch=entry[0], row=entry[1]||{}, resourceMap={
        humanoid:{science:0.02,influence:0.02}, mammalian:{food:0.02,happiness:0.02}, reptilian:{military_power:0.025,command:0.015},
        avian:{culture:0.02,logistics:0.02}, arthropoid:{production:0.025,materials:0.015}, molluscoid:{gold:0.02,diplomacy:0.02},
        fungoid:{medicine:0.02,organic_matter:0.02}, plantoid:{food:0.02,terraforming:0.02}, aquatic:{water:0.02,diplomacy:0.015},
        lithoid:{stone:0.02,alloys:0.02}, necroid:{faith:0.02,unity:0.02}, toxoid:{science:0.015,pollution:0.02}, extremophile:{energy:0.02,rare_matter:0.02}
      };
      const personality=(DATA.VASSAL_PERSONALITIES||[]).find(function(item){ return item.id===row.personality; });
      const effects={resourceOutput:resourceMap[arch]||{culture:0.015},score:Math.min(30,(row.count||1)*8)};
      if(personality && personality.effects){
        effects.resourceOutput=Object.assign({},effects.resourceOutput,personality.effects.resourceOutput||{});
      }
      return {id:"vassal:"+arch,name:L.displayArchetypeName(arch)+" Vassal Lineage"+(personality?(" - "+personality.name):""),path:"Vassal",effects:effects,personality:personality?personality.name:""};
    });
  };
  L.vassalDemandSources=function(){
    return Object.entries(state.game.run.vassalDemands||{}).map(function(entry){
      const demand=(DATA.VASSAL_DEMANDS||[]).find(function(item){ return item.id===entry[1]; });
      return demand?Object.assign({id:"vassal_demand:"+entry[0],name:L.displayArchetypeName(entry[0])+": "+demand.name,path:"Vassal Demand"},demand):null;
    }).filter(Boolean);
  };
  L.rivalDossierSources=function(){
    return Object.entries(state.game.meta.rivalDossiers||{}).map(function(entry){
      const row=entry[1]||{}, scale=1+(L.upgradeLevel("rival_scan")||0)*0.1, effects={resourceOutput:{}};
      if(row.studied>=2) effects.resourceOutput.diplomacy=0.01*scale;
      if(row.defections>=1) effects.resourceOutput.influence=0.01*scale;
      if(row.victories>=1) effects.resourceOutput.military_power=0.01*scale;
      if((row.collapses||0)>=1) effects.resourceOutput.cohesion=0.01*scale;
      return Object.keys(effects.resourceOutput).length?{id:"dossier:"+entry[0],name:L.displayArchetypeName(entry[0])+" Dossier",path:"Rival Dossier",effects:effects}:null;
    }).filter(Boolean);
  };
  L.rivalCounterDoctrineSources=function(){
    return Object.entries(state.game.meta.rivalDossiers||{}).map(function(entry){
      const row=entry[1]||{}, effects={resourceOutput:{}};
      if((row.victories||0)>=2){
        effects.resourceOutput.military_power=-0.01;
        effects.resourceOutput.diplomacy=-0.01;
      }
      if((row.victories||0)>=3){
        effects.resourceOutput.cohesion=-0.01;
      }
      return Object.keys(effects.resourceOutput).length?{id:"rival_counter_doctrine:"+entry[0],name:L.displayArchetypeName(entry[0])+" Counter-Doctrine",path:"Rival Legacy",effects:effects}:null;
    }).filter(Boolean);
  };
  L.congressInstitutionSources=function(){
    return Object.entries(state.game.meta.congressInstitutionLevels||{}).map(function(entry){
      const level=entry[1]||0;
      if(level<=0) return null;
      const effects={resourceOutput:{}};
      if(entry[0]==="biological"){ effects.resourceOutput.food=0.01*level; effects.resourceOutput.medicine=0.01*level; effects.resourceOutput.happiness=0.005*level; }
      if(entry[0]==="synthetic"){ effects.resourceOutput.science=0.01*level; effects.resourceOutput.data=0.01*level; }
      if(entry[0]==="psionic"){ effects.resourceOutput.faith=0.01*level; effects.resourceOutput.cohesion=0.01*level; }
      if(entry[0]==="energetic"){ effects.resourceOutput.energy=0.01*level; effects.resourceOutput.alloys=0.01*level; }
      if(entry[0]==="dimensional"){ effects.resourceOutput.rare_matter=0.01*level; effects.resourceOutput.ascension=0.01*level; }
      return {id:"congress_institution:"+entry[0],name:(entry[0].charAt(0).toUpperCase()+entry[0].slice(1))+" Institution Lv "+level,path:"Congress Institution",effects:effects};
    }).filter(Boolean);
  };
  L.institutionTraitSources=function(){
    const levels=state.game.meta.congressInstitutionLevels||{};
    return Object.entries(levels).map(function(entry){
      if((entry[1]||0)<2) return null;
      const trait=(DATA.INSTITUTION_TRAITS||{})[entry[0]];
      return trait?Object.assign({id:"institution_trait:"+entry[0],path:"Institution Trait"},trait):null;
    }).filter(Boolean);
  };
  L.activeInstitutionCrisis=function(){
    const levels=state.game.meta.congressInstitutionLevels||{}, total=Object.values(levels).reduce(function(sum,value){ return sum+(value||0); },0);
    const topRival=(state.game.run.rivals||[]).reduce(function(max,rival){ return Math.max(max,rival.score||0); },0);
    const memoryBonus=L.enlightenmentUpgradeLevel("institutional_memory")>0;
    const forecastBonus=L.transcendenceUpgradeLevel("crisis_forecasting")>0;
    const galacticEarly=L.currentStage().id==="galactic" && state.game.run.technologies.ascension_protocols && total>=(memoryBonus?1:2) && (L.ascensionTension()>=(memoryBonus?(forecastBonus?38:42):(forecastBonus?48:54)) || topRival>=(forecastBonus?86:90));
    if((total<4 && !galacticEarly) || !state.game.run.congressChoice) return null;
    if(L.doctrineConflictSources().length){
      return (DATA.INSTITUTION_CRISES||[]).find(function(item){ return item.id==="institution_dogma"; })||null;
    }
    if(Object.values(levels).some(function(value){ return (value||0)>=3; }) || galacticEarly){
      return (DATA.INSTITUTION_CRISES||[]).find(function(item){ return item.id==="institution_overreach"; })||null;
    }
    return null;
  };
  L.chooseInstitutionCrisisResponse=function(choiceId){
    const crisis=L.activeInstitutionCrisis();
    if(!crisis || state.game.run.rivalEvents.institutionCrisis) return false;
    const choice=(crisis.choices||[]).find(function(item){ return item.id===choiceId; });
    if(!choice) return false;
    state.game.run.rivalEvents.institutionCrisis=choice.id;
    L.pushLog("Institution crisis resolved: "+crisis.name+" - "+choice.name);
    return true;
  };
  L.institutionCrisisSource=function(){
    const crisis=L.activeInstitutionCrisis(), picked=(state.game.run.rivalEvents||{}).institutionCrisis;
    if(!crisis) return [];
    const choice=(crisis.choices||[]).find(function(item){ return item.id===picked; });
    return [Object.assign({path:"Institution Crisis"},crisis,{effects:choice?choice.effects:(crisis.effects||{})})];
  };
  L.resourceFailureSources=function(){
    const timers=state.game.run.resourceFailures||{}, out=[];
    if((timers.wood||0)>0){
      out.push({id:"wood_shortage",name:"Wood Shortage",path:"Resource Failure",effects:{resourceOutput:{production:-0.18,lumber:-0.25}}});
    }
    return out;
  };
  L.ascensionTension=function(){
    if(L.currentStage().id!=="galactic" || !state.game.run.ascensionPath) return 0;
    const rivalWins=(state.game.run.rivals||[]).filter(function(rival){ return rival.victory; }).length;
    const scars=Object.values(state.game.meta.threatScars||{}).reduce(function(sum,value){ return sum+(value||0); },0);
    const remaining=L.ascensionObjectives().filter(function(obj){ return !obj.done; }).length;
    const cohesion=state.game.run.resources.cohesion||0, happiness=state.game.run.resources.happiness||0;
    const phaseBase=state.game.run.technologies.ascension_protocols?28:22;
    let tension=phaseBase+remaining*3+rivalWins*16+scars*3-Math.min(20,cohesion*0.12)-Math.min(12,happiness*0.08);
    if(state.game.run.congressChoice==="threshold_accord") tension-=14;
    return Math.max(0,Math.round(tension));
  };
  L.ascensionTensionSource=function(){
    const tension=L.ascensionTension();
    if(tension<45) return [];
    const scale=Math.min(0.12,(tension-40)/500);
    return [{id:"ascension_tension",name:"Ascension Tension",path:"Endgame Pressure",effects:{resourceOutput:{ascension:-scale,cohesion:-scale*0.8,happiness:-scale*0.6}}}];
  };
  L.currentEra=function(){
    const stageId=L.currentStage().id, id=state.game.run.eraModifiers[stageId];
    return ((DATA.ERA_MODIFIERS[stageId]||[]).find(function(item){ return item.id===id; }))||null;
  };
  L.nextEraForecast=function(){
    if(!L.hasMetaUnlock("era_control") || L.upgradeLevel("era_control")<=0) return null;
    const next=DATA.STAGES[Math.min(DATA.STAGES.length-1,state.game.run.stageIndex+1)];
    const eras=(DATA.ERA_MODIFIERS[next.id]||[]);
    return eras.length?eras[(state.game.run.stageIndex+1+state.game.meta.galacticWins+state.game.run.eraRerolls)%eras.length]:null;
  };
  L.stageHasMapSlots=function(stageId){
    return (stageId||L.currentStage().id)!=="cell";
  };
  L.mapSlotsForStage=function(){
    const stageId=L.currentStage().id;
    if(!L.stageHasMapSlots(stageId)) return [];
    return state.game.run.mapSlots[stageId]||[];
  };
  L.mapEffectSources=function(){
    const placed=L.mapSlotsForStage().filter(function(slot){ return !!slot.systemId; }).map(function(slot){
      return {id:"map:"+slot.id,name:slot.name,path:"Map Slot",effects:slot.effects||{}};
    });
    const traits=L.mapSlotsForStage().filter(function(slot){ return !!slot.traitId; }).map(function(slot){
      const trait=(DATA.SLOT_TRAITS||[]).find(function(item){ return item.id===slot.traitId; });
      return trait?{id:"trait:"+slot.id,name:slot.name+" - "+trait.name,path:"Slot Trait",effects:trait.effects||{}}:null;
    }).filter(Boolean);
    return placed.concat(traits);
  };
  L.adjacencySources=function(){
    const stageSystems=L.currentStage().systems||[];
    return L.mapSlotsForStage().map(function(slot){
      const system=stageSystems.find(function(item){ return item.id===slot.systemId; });
      if(!system) return null;
      const bonus=(DATA.ADJACENCY_BONUSES||[]).find(function(item){
        return item.slot===slot.id && (item.category===system.category || system.name.indexOf(item.category)>=0);
      });
      return bonus?Object.assign({path:"Adjacency",slotName:slot.name,systemName:system.name},bonus):null;
    }).filter(Boolean);
  };
  L.tokenTags=function(text){
    const haystack=(" "+(text||"").toLowerCase()+" "), tags=[];
    [
      ["market",["market","trade","gold","merchant","commerce","guild"]],
      ["trade",["trade","diplomacy","embassy","contract"]],
      ["water",["river","water","aquatic","irrigation","hydraulic","delta","tide","ice"]],
      ["sacred",["sacred","shrine","temple","faith","ritual","totem"]],
      ["faith",["faith","temple","shrine","ritual","totem"]],
      ["mineral",["stone","mineral","alloy","asteroid","ore","crystal","lithoid"]],
      ["industry",["industry","factory","foundry","forge","workshop","production","mill","plant"]],
      ["mining",["mine","mining","pit","asteroid","lifter"]],
      ["high",["high","sky","avian","orbit","strato","roost"]],
      ["orbit",["orbit","orbital","solar","planet","station","fleet","shipyard"]],
      ["fleet",["fleet","shipyard","command","sentry","gateway"]],
      ["toxic",["toxic","pollution","hazard","reactor","waste"]],
      ["irradiated",["irradiated","radiation","reactor","nuclear","solar"]],
      ["science",["science","research","university","archive","laboratory","data"]],
      ["medicine",["medicine","hospital","clinic","healer","infirmary"]],
      ["fertile",["fertile","food","farm","grove","garden","plantoid","growth"]],
      ["growth",["growth","population","nest","nursery","habitat","food"]],
      ["memory",["memory","archive","bone","ancestor","necroid","ossuary","crypt"]],
      ["necroid",["necroid","death","bone","ossuary","crypt","necropolis"]],
      ["plantoid",["plantoid","plant","grove","garden","photosynthetic"]],
      ["avian",["avian","sky","roost","flock","chorus"]]
    ].forEach(function(rule){
      if(rule[1].some(function(word){ return haystack.indexOf(word)>=0; })) tags.push(rule[0]);
    });
    return [...new Set(tags)];
  };
  L.slotTags=function(slot){
    const trait=(DATA.SLOT_TRAITS||[]).find(function(item){ return item.id===slot.traitId; });
    return L.tokenTags([slot.id,slot.name,slot.type,trait&&trait.name].filter(Boolean).join(" "));
  };
  L.systemTags=function(system){
    return L.tokenTags([system.id,system.name,system.category,system.description,system.archetype,(system.traits||[]).join(" ")].filter(Boolean).join(" "));
  };
  L.tagSynergySources=function(){
    const systems=L.currentStage().systems||[];
    return L.mapSlotsForStage().map(function(slot){
      const system=systems.find(function(item){ return item.id===slot.systemId; });
      if(!system) return null;
      const slotTags=L.slotTags(slot), systemTags=L.systemTags(system);
      const synergy=(DATA.TAG_SYNERGIES||[]).find(function(item){
        return (item.slotTags||[]).some(function(tag){ return slotTags.includes(tag); }) && (item.systemTags||[]).some(function(tag){ return systemTags.includes(tag); });
      });
      return synergy?Object.assign({path:"Tag Synergy",slotName:slot.name,systemName:system.name},synergy):null;
    }).filter(Boolean);
  };
  L.contractSource=function(){
    const id=state.game.run.activeContract;
    const contract=(DATA.STAGE_CONTRACTS||[]).find(function(item){ return item.id===id; });
    return contract?[Object.assign({path:"Stage Contract"},contract)]:[];
  };
  L.threatProjectSources=function(){
    return Object.keys(state.game.run.threatProjects||{}).map(function(id){
      const project=(DATA.THREAT_PROJECTS||[]).find(function(item){ return item.id===id; });
      return project?Object.assign({path:"Threat Project"},project):null;
    }).filter(Boolean);
  };
  L.rivalEventSources=function(){
    return Object.keys(state.game.run.rivalEvents||{}).map(function(key){
      const id=state.game.run.rivalEvents[key], event=(DATA.RIVAL_EVENTS||[]).find(function(item){ return item.id===id; });
      return event?Object.assign({path:"Rival Accord"},event):null;
    }).filter(Boolean);
  };
  L.hybridSource=function(){
    const id=state.game.run.secondaryArchetype, level=L.upgradeLevel("hybridization");
    if(!id || level<=0) return [];
    const resourceMap={
      aquatic:{water:0.04,food:0.03}, lithoid:{stone:0.04,alloys:0.03}, avian:{diplomacy:0.03,energy:0.03},
      plantoid:{food:0.04,biomass:0.03}, necroid:{medicine:0.03,cohesion:0.03}, toxoid:{science:0.03,pollution:0.03},
      humanoid:{science:0.03,influence:0.03}, mammalian:{happiness:0.03,food:0.03}, reptilian:{military_power:0.03,production:0.03},
      arthropoid:{materials:0.03,production:0.03}, molluscoid:{culture:0.03,water:0.03}, fungoid:{organic_matter:0.03,medicine:0.03},
      extremophile:{energy:0.03,rare_matter:0.03}
    };
    const effects={allOutput:level*0.01,resourceOutput:{}};
    Object.entries(resourceMap[id]||{}).forEach(function(entry){ effects.resourceOutput[entry[0]]=entry[1]*level; });
    return [{id:"hybrid:"+id,name:"Secondary Influence: "+L.archetypeName(id),path:"Evolution Shop",effects:effects}];
  };
  L.omnipotenceSources=function(){
    if(!L.futureLayerState("omnipotence").unlocked && !state.ui.debug) return [];
    const active=(state.game.meta.hybridLineages||[]).filter(Boolean);
    const stance=L.currentInstabilityStanceDef();
    if(!active.length && !stance) return [];
    const contradiction=0.008*Math.max(0,active.length-1)*Math.max(0,1-L.futureLayerUpgradeLevel("omnipotence","contradiction_walls")*0.12);
    const stability=0.01*L.futureLayerUpgradeLevel("omnipotence","hybrid_stabilizers");
    const out=[];
    if(stance) out.push({id:"omni-stance:"+stance.id,name:"Instability Stance: "+stance.name,path:"Omnipotence",effects:stance.effects});
    active.forEach(function(id,index){
      out.push({id:"omni-hybrid:"+id,name:"Lineage Binding "+(index+1)+": "+L.archetypeName(id),path:"Omnipotence",effects:{allOutput:0.03+stability,resourceOutput:{culture:0.02,science:0.02,production:0.02,happiness:-contradiction,cohesion:-contradiction}}});
    });
    return out;
  };
  L.divinityLayerSources=function(){
    if(!L.futureLayerState("divinity").unlocked && !state.ui.debug) return [];
    const out=[];
    const mask=L.currentDivineMaskDef();
    const polarity=L.currentPrayerPolarityDef();
    if(mask) out.push({id:"divine-mask:"+mask.id,name:"Divine Mask: "+mask.name,path:"Divinity",effects:mask.effects});
    if(polarity) out.push({id:"prayer-polarity:"+polarity.id,name:"Prayer Polarity: "+polarity.name,path:"Divinity",effects:polarity.effects});
    const preset=L.currentDivinityPresetDef();
    if(preset) out.push({id:"divinity-preset:"+preset.id,name:preset.name,path:"Divinity Routing",effects:{}});
    if(mask && mask.signatureEffects) out.push({id:"divine-mask-signature:"+mask.id,name:mask.name+" Signature",path:"Divine Mask",desc:mask.behaviorText||"",effects:mask.signatureEffects});
    return out;
  };
  L.infinitySources=function(){
    if(!L.futureLayerState("infinity").unlocked && !state.ui.debug) return [];
    const out=[];
    L.activeForkSource().forEach(function(source){ out.push(source); });
    (state.game.meta.boundEchoes||[]).forEach(function(id){
      const echo=L.infinityEchoes().find(function(item){ return item.id===id; });
      if(echo) out.push({id:"echo:"+id,name:echo.name,path:"Infinity",effects:echo.effects});
    });
    (state.game.meta.mergedForkLessons||[]).forEach(function(id){
      const fork=(DATA.INFINITY_FORKS||[]).find(function(item){ return item.id===id; });
      if(fork) out.push({id:"fork:"+id,name:fork.name+" Lesson",path:"Infinity",effects:fork.effects});
    });
    L.forkArchiveSources().forEach(function(source){ out.push(source); });
    const debt=L.currentFutureDebtDef();
    if(debt && debt.id!=="none") out.push({id:"future-debt:"+debt.id,name:debt.name,path:"Infinity",effects:debt.effects});
    return out;
  };
  L.eternitySources=function(){
    if(!L.futureLayerState("eternity").unlocked && !state.ui.debug) return [];
    const out=[];
    (state.game.meta.testamentClauses||[]).forEach(function(id){
      const clause=L.testamentClauses().find(function(item){ return item.id===id; });
      if(clause) out.push({id:"testament:"+id,name:clause.name,path:"Eternity",effects:clause.effects});
    });
    (state.game.meta.permanenceWeaves||[]).forEach(function(id){
      const weave=L.permanenceWeaveDefs().find(function(item){ return item.id===id; });
      if(weave) out.push({id:"weave:"+id,name:weave.name,path:"Eternity",effects:weave.effects});
    });
    (state.game.meta.canonEntries||[]).forEach(function(id){
      const entry=L.canonCandidates().find(function(item){ return item.id===id; });
      if(entry) out.push({id:"canon:"+id,name:entry.name+" Canon",path:"Eternity",effects:L.activeCanonRewriteEffects(entry)});
    });
    L.testamentSynergySources().forEach(function(source){ out.push(source); });
    L.eternalInheritanceSources().forEach(function(source){ out.push(source); });
    return out;
  };
  L.latestUniverseSummary=function(){
    const rows=(state.game.meta.preservedUniverses||[]);
    return rows.length?rows[rows.length-1]:null;
  };
  L.latestUniverseSummarySections=function(summary){
    if(!summary) return [];
    return [
      {title:"Identity",rows:[
        "Theme: "+(summary.themeLabel||summary.theme||"None"),
        "Divine face: "+(summary.maskName||"Unknown"),
        "Worship polarity: "+(summary.polarityName||"Unknown"),
        "Foresight focus: "+(summary.focus||"Unchosen")
      ]},
        {title:"Canonized Truths",rows:(summary.canonized||[]).length?(summary.canonized||[]).map(function(entry){ return entry.kind+": "+entry.name; }):["No canonized truths were sealed."]},
        {title:"Final Ruleset",rows:[
          "Testament clauses: "+(((summary.testamentNames||[]).length?(summary.testamentNames||[]).join(", "):"none")),
          "Permanence weaves: "+(((summary.weaveNames||[]).length?(summary.weaveNames||[]).join(", "):"none")),
          "Inheritance kept: "+(function(){
            const kept=Object.keys(summary.eternalInheritance||{}).filter(function(key){ return !!summary.eternalInheritance[key]; });
            return kept.length?kept.join(", "):"none";
          })()
        ]},
        {title:"Enduring Histories",rows:[
          "Paths retained: "+(((summary.paths||[]).length?(summary.paths||[]).join(", "):"none")),
          "Artifacts retained: "+(((summary.artifacts||[]).length?(summary.artifacts||[]).join(", "):"none")),
        "Recent scripture: "+(((summary.storyTitles||[]).length?(summary.storyTitles||[]).join(" | "):"none"))
      ]}
    ];
  };
  L.exportLatestUniverseTestament=function(){
    const summary=L.latestUniverseSummary();
    if(!summary) return false;
    const testamentId="preserved_"+(state.game.meta.finalTestaments||[]).length;
    const title="Final Testament: "+(summary.themeLabel||summary.theme||"Unnamed Cosmos");
      const lines=[
        summary.endingText||"A universe was preserved in canon.",
        "Canonized truths: "+(summary.canonSummary||"None"),
        "Testament clauses: "+(((summary.testamentNames||[]).length?(summary.testamentNames||[]).join(", "):"none")),
        "Permanence weaves: "+(((summary.weaveNames||[]).length?(summary.weaveNames||[]).join(", "):"none")),
        "Paths retained: "+(((summary.paths||[]).length?(summary.paths||[]).join(", "):"none")),
        "Artifacts retained: "+(((summary.artifacts||[]).length?(summary.artifacts||[]).join(", "):"none")),
        "Recent scripture: "+(((summary.storyTitles||[]).length?(summary.storyTitles||[]).join(" | "):"none"))
    ];
      const record={id:testamentId,title:title,text:lines.join(" | "),lines:lines,time:Date.now(),summary:summary};
    (state.game.meta.finalTestaments||(state.game.meta.finalTestaments=[])).push(record);
    if(!state.game.meta.storyEntries) state.game.meta.storyEntries={};
    if(!state.game.meta.storyAcknowledged) state.game.meta.storyAcknowledged={};
    state.game.meta.storyEntries["testament:"+testamentId]=true;
    (state.game.meta.storyMoments||(state.game.meta.storyMoments=[])).push({id:"testament:"+testamentId,time:record.time});
    L.markSeenContent("testament",{id:testamentId,name:title});
    L.pushLog("Final testament exported: "+title);
    return true;
  };
  L.markSeenContent=function(kind,item){
    if(!item) return;
    const seen=state.game.meta.seenContent||(state.game.meta.seenContent={});
    seen[kind+":"+item.id]={kind:kind,id:item.id,name:item.name,stage:L.currentStage().id,time:Date.now()};
  };
  L.goalKey=function(goal){ return L.currentStage().id+":"+goal.id; };
  L.invalidateEffectSourceCache=function(){
    state.ui.effectSourceEpoch=(state.ui.effectSourceEpoch||0)+1;
    L._activeEffectSourceCache=null;
  };
  L.activeEffectSources=function(){
    const cacheKey=[
      state.ui.effectSourceEpoch||0,
      state.game.run.stageIndex||0,
      state.game.meta.crisisIntensity||"normal",
      state.ui.debug?1:0,
      state.ui.betweenRuns?1:0
    ].join(":");
    if(L._activeEffectSourceCache && L._activeEffectSourceCache.key===cacheKey) return L._activeEffectSourceCache.sources;
    const spec=L.specializationDef();
    const specSource=spec?[{id:"specialization:"+spec.id,name:spec.name,path:"Specialization",effects:spec.effects||{}}]:[];
    const era=L.currentEra(), eraSource=era?[{id:"era:"+era.id,name:era.name,path:"Era",effects:era.effects||{}}]:[];
    const sources=L.ownedSystemsAll().concat(
      L.ownedTechAll(),
      specSource,
      L.chosenLineageEvents(),
      L.mutatorSources(),
      L.lineageLawSources(),
      L.doctrineSources(),
      L.doctrineConflictSources(),
      L.lawCongressSources(),
      L.lawSetSources(),
      L.artifactSources(),
      L.artifactSetSources(),
      L.artifactEvolutionSources(),
      L.artifactFusionSources(),
      L.restoredArtifactSources(),
      L.restorationChainSources(),
      L.masteryRelicSources(),
      L.archiveMilestoneSources(),
      L.timelineMilestoneSources(),
      L.timelineAnchorSources(),
      eraSource,
      L.mapEffectSources(),
      L.adjacencySources(),
      L.tagSynergySources(),
      L.worldEventSources(),
      L.completedProjectSources(),
      L.ascensionPathSource(),
      L.contractSource(),
      L.threatProjectSources(),
      L.rivalEventSources(),
      L.rivalPersonalitySources(),
      L.rivalAscensionSources(),
      L.rivalDefectionSources(),
      L.congressSource(),
      L.congressBlocSource(),
      L.congressCrisisSource(),
      L.institutionCrisisSource(),
      L.resourceFailureSources(),
      L.mapWonderSources(),
      L.wonderSetSources(),
      L.hybridSource(),
      L.omnipotenceSources(),
      L.divinityLayerSources(),
        L.infinitySources(),
        L.eternitySources(),
        L.foresightMomentumSources(),
        L.vassalSources(),
      L.vassalDemandSources(),
      L.rivalDossierSources(),
      L.rivalCounterDoctrineSources(),
      L.legacyTierSource(),
      L.eraLegacySources(),
      L.museumRewardSources(),
      L.congressInstitutionSources(),
      L.institutionTraitSources(),
      L.ascensionTensionSource(),
      L.threatScarSources(),
      L.crisisMemorySources(),
        L.transformedScarSources(),
        L.hybridLegacySources(),
        L.archiveBoostSource(),
        L.divinityFocusSource(),
        L.genesisChoiceSources(),
        L.genesisStageConsequenceSources(),
        L.awakenedDormantSeedSources(),
        L.apotheosisSources(),
        L.apotheosisInterplaySources(),
        L.activeEvolutionChallengeSource(),
      L.completedEvolutionMasterySources(),
      L.shopBonusSources(),
      L.futureLayerUpgradeSources(),
      L.compressedFrontierSource(),
      L.ritualSurgeSources(),
      L.universeBoonSources()
    );
    L._activeEffectSourceCache={key:cacheKey,sources:sources};
    return sources;
  };
  L.sumScalarEffect=function(effectKey){ return L.activeEffectSources().reduce(function(sum,item){ return sum+(((item.effects||{})[effectKey]||0)*(item.effectiveCount||1)); },0); };

  L.inheritedTraits=function(){ const traits=[]; state.game.run.archive.forEach(function(entry){ (entry.traits||[]).forEach(function(t){ if(!traits.includes(t)) traits.push(t); }); }); return traits; };
  L.lineageStages=function(){ return ["cell","creature"]; };
  L.itemAffinity=function(item){ return Object.assign({},(item&&item.affinity)||((item&&item.archetype)?{[item.archetype]:1}:{})); };
  L.addAffinity=function(target,source,mult){
    const scale=mult==null?1:mult;
    Object.entries(source||{}).forEach(function(entry){ target[entry[0]]=(target[entry[0]]||0)+entry[1]*scale; });
  };
  L.archetypeScores=function(){
    const counts={};
    state.game.run.archive.forEach(function(entry){ if(L.lineageStages().includes(entry.stageId)) L.addAffinity(counts,entry.affinity||((entry.archetype)?{[entry.archetype]:1}:{})); });
    if(L.lineageStages().includes(L.currentStage().id)) L.ownedSystemsForStage().forEach(function(item){ L.addAffinity(counts,L.itemAffinity(item)); });
    if(!state.game.run.lockedArchetype && L.lineageStages().includes(L.currentStage().id)) L.addAffinity(counts,(L.crisisHistory().affinity||{}),0.35);
    DATA.ARCHETYPES.forEach(function(arch){ if(counts[arch.id]==null) counts[arch.id]=0; });
    return counts;
  };
  L.dominantArchetype=function(){
    if(state.game.run.lockedArchetype) return state.game.run.lockedArchetype;
    const counts=L.archetypeScores();
    const best=Object.entries(counts).sort(function(a,b){ return b[1]-a[1]; })[0];
    return best&&best[1]>0?best[0]:L.currentStage().dominantArchetype;
  };
  L.dominantArchetypeLabel=function(){ const id=L.dominantArchetype(); return L.isArchetypeRevealed(id)?L.archetypeName(id):"Unknown Lineage Emerging"; };
  L.lineageRequirementMet=function(item){ return !item.archetypeReq || L.dominantArchetype()===item.archetypeReq; };
  L.lineageRequirementText=function(item){ return item.archetypeReq?("Requires "+L.displayArchetypeName(item.archetypeReq)+" lineage"):""; };
  L.lineageContentVisible=function(item){ return !item.archetypeReq || L.lineageRequirementMet(item); };
  L.pathRequirementMet=function(item){ return !item.requiresPath || state.game.run.ascensionPath===item.requiresPath; };
  L.pathRequirementText=function(item){
    if(!item.requiresPath) return "";
    const found=(DATA.ASCENSION_PATHS||[]).find(function(path){ return path.id===item.requiresPath; });
    return "Requires "+(found?found.name:item.requiresPath)+" ascension";
  };
  L.hasLockedLineage=function(){ return !!state.game.run.lockedArchetype; };

  L.upgradeLevel=function(id){ return state.game.meta.upgrades[id]||0; };
  L.manualMultiplier=function(){ return 1+L.upgradeLevel("manual")*0.2+L.sumScalarEffect("manualBonus"); };
  L.automationMultiplier=function(){ return 1+L.upgradeLevel("auto")*0.15; };
  L.resourceOutputMultiplier=function(resourceId){
    return 1+L.activeEffectSources().reduce(function(sum,item){
      const effects=item.effects||{}, resourceOutput=effects.resourceOutput||{};
      const quantity=item.effectiveCount||1;
      return sum+((effects.allOutput||0)+(resourceOutput[resourceId]||0))*quantity;
    },0);
  };
  L.costMultiplier=function(){ return Math.max(0.25,1-L.upgradeLevel("cost")*0.04-L.sumScalarEffect("costScale")); };
  L.discountedCost=function(cost){ const mult=L.costMultiplier(), out={}; Object.entries(cost||{}).forEach(function(entry){ out[entry[0]]=Math.max(1,Math.round(entry[1]*mult)); }); return out; };
  L.populationScaleMultiplier=function(){
    const stageId=L.currentStage().id;
    const extra=Math.sqrt(Math.max(0,state.game.run.population-8));
    const baseMap={cell:0.03,creature:0.018,tribal:0.014,civilization:0.012,empire:0.009,solar:0.006,galactic:0.005};
    const capMap={cell:5,creature:4,tribal:3.5,civilization:3,empire:2.6,solar:2.1,galactic:1.9};
    const scalar=L.sumScalarEffect("populationScale");
    return 1+Math.min(capMap[stageId]||2.5,extra*(baseMap[stageId]||0.01)+scalar);
  };
  L.bundleText=function(bundle){ return Object.entries(bundle||{}).map(function(entry){ return L.resourceName(entry[0])+" "+L.fmt(entry[1]); }).join(" | "); };
  L.stageActions=function(){ return (L.currentStage().actions||[]).filter(function(action){ return !action.unlock || action.unlock.every(function(req){ return !!state.game.run.ownedSystems[req] || !!state.game.run.technologies[req]; }); }); };
  L.cellStarterComplete=function(){ const stage=L.currentStage(); return stage.id!=="cell" || ["membrane_pump","ribosome","vacuole"].every(function(id){ return !!state.game.run.ownedSystems[id]; }); };
  L.cellBridgeSystems=function(){ return ["membrane_pump","ribosome","vacuole","mitochondria","smooth_er","golgi_apparatus","nucleus"]; };
  L.creatureBridgeSystems=function(){ return ["nest","foraging_pack","watering_path","tool_use","thinking_cluster","den_network"]; };
  L.stageSpineIds=function(stageId){
    const id=stageId||L.currentStage().id;
    if(id==="cell") return ["membrane_pump","ribosome","vacuole","mitochondria","golgi_apparatus","nucleus"];
    if(id==="creature") return ["nest","foraging_pack","watering_path","thinking_cluster","den_network"];
    if(id==="tribal") return ["village_center","sawmill","workshop","watch_band"];
    if(id==="civilization") return ["city_center","market","library","barracks"];
    if(id==="empire") return ["provincial_admin","rail_hub","general_staff"];
    if(id==="solar") return ["planetary_colony","solar_array","shipyard_ring"];
    if(id==="galactic") return ["sector_network","quantum_archive","gateway_spine","ascension_protocol"];
    return [];
  };
  L.stageSpineProgress=function(stageId){
    const ids=L.stageSpineIds(stageId);
    const complete=ids.filter(function(id){ return !!state.game.run.ownedSystems[id] || !!state.game.run.technologies[id]; }).length;
    return {complete:complete,total:ids.length,remaining:Math.max(0,ids.length-complete)};
  };
  L.stageSurfaceLevel=function(stageId){
    const id=stageId||L.currentStage().id;
    const progress=L.stageSpineProgress(id);
    if(!["empire","solar","galactic"].includes(id)) return 2;
    if(id==="galactic"){
      if(progress.complete<2) return 0;
      if(progress.complete<4 || !state.game.run.ascensionPath) return 1;
      return 2;
    }
    if(progress.complete<2) return 0;
    if(progress.complete<L.stageSpineIds(id).length) return 1;
    return 2;
  };
  L.deepSystemsDeferred=function(stageId){
    return L.stageSurfaceLevel(stageId)===0;
  };
  L.stageRevealVisible=function(item,showLocked){
    if(showLocked) return true;
    const stageId=L.currentStage().id;
    if(stageId==="cell"){
      if(!L.cellStarterComplete()) return L.cellStarterSequence().some(function(row){ return row.id===item.id; }) || !!state.game.run.ownedSystems[item.id];
      if(!state.game.run.ownedSystems.nucleus) return L.cellBridgeSystems().includes(item.id) || !!state.game.run.ownedSystems[item.id];
      if(L.ownedSystemsForStage().length<12 && !state.game.run.ownedSystems[item.id] && (item.prereq||[]).includes("nucleus")){
        return ["cell_wall","flagellum","chemoreceptors","lysosome","peroxisome","contractile_vacuole"].includes(item.id);
      }
    }
    if(stageId==="creature"){
      if(!state.game.run.ownedSystems.thinking_cluster) return L.creatureBridgeSystems().includes(item.id) || !!state.game.run.ownedSystems[item.id];
      if(!state.game.run.ownedSystems.den_network && !state.game.run.ownedSystems[item.id]) return L.creatureBridgeSystems().includes(item.id);
    }
    if(stageId==="tribal"){
      const starter=L.tribalStarterSequence().map(function(row){ return row.id; });
      if(!state.game.run.ownedSystems.village_center) return starter.includes(item.id) || !!state.game.run.ownedSystems[item.id];
      if(!state.game.run.ownedSystems.workshop && !state.game.run.ownedSystems[item.id]){
        return ["village_center","granary","well","sawmill","workshop"].includes(item.id);
      }
      if(!state.game.run.ownedSystems.watch_band && !state.game.run.ownedSystems[item.id]){
        return ["village_center","granary","well","sawmill","workshop","watch_band","shrine"].includes(item.id);
      }
    }
    if(stageId==="civilization"){
      const starter=L.civilizationStarterSequence().map(function(row){ return row.id; });
      if(!state.game.run.ownedSystems.city_center) return starter.includes(item.id) || !!state.game.run.ownedSystems[item.id];
      if(!state.game.run.ownedSystems.library && !state.game.run.ownedSystems[item.id]){
        return ["city_center","farms","market","library"].includes(item.id);
      }
      if(!state.game.run.technologies.code_of_laws && !state.game.run.ownedSystems[item.id]){
        return ["city_center","farms","market","library","barracks"].includes(item.id);
      }
    }
    if(stageId==="empire"){
      const starter=L.empireStarterSequence().map(function(row){ return row.id; });
      if(!state.game.run.ownedSystems.provincial_admin) return starter.includes(item.id) || !!state.game.run.ownedSystems[item.id];
      if(!state.game.run.ownedSystems.rail_hub && !state.game.run.ownedSystems[item.id]){
        return ["provincial_admin","factory_district","rail_hub","university_network"].includes(item.id);
      }
      if(!state.game.run.ownedSystems.general_staff && !state.game.run.ownedSystems[item.id]){
        return ["provincial_admin","factory_district","rail_hub","university_network","general_staff","bureaucratic_archive"].includes(item.id);
      }
    }
    if(stageId==="solar"){
      const starter=L.solarStarterSequence().map(function(row){ return row.id; });
      if(!state.game.run.ownedSystems.planetary_colony) return starter.includes(item.id) || !!state.game.run.ownedSystems[item.id];
      if(!state.game.run.ownedSystems.solar_array && !state.game.run.ownedSystems[item.id]){
        return ["planetary_colony","orbital_habitat","solar_array"].includes(item.id);
      }
      if(!state.game.run.ownedSystems.shipyard_ring && !state.game.run.ownedSystems[item.id]){
        return ["planetary_colony","orbital_habitat","solar_array","asteroid_mines","shipyard_ring","deep_space_telescope"].includes(item.id);
      }
    }
    if(stageId==="galactic"){
      const starter=L.galacticStarterSequence().map(function(row){ return row.id; });
      if(!state.game.run.ownedSystems.sector_network) return starter.includes(item.id) || !!state.game.run.ownedSystems[item.id];
      if(!state.game.run.ownedSystems.quantum_archive && !state.game.run.ownedSystems[item.id]){
        return ["sector_network","dyson_swarm","quantum_archive","federation_council"].includes(item.id);
      }
      if(!state.game.run.ownedSystems.gateway_spine && !state.game.run.ownedSystems[item.id]){
        return ["sector_network","dyson_swarm","quantum_archive","gateway_spine","federation_council","galactic_market"].includes(item.id);
      }
      if(!state.game.run.ownedSystems.ascension_protocol && !state.game.run.ownedSystems[item.id]){
        return ["sector_network","dyson_swarm","quantum_archive","gateway_spine","ascension_protocol","federation_council","galactic_market"].includes(item.id);
      }
    }
    return true;
  };
  L.systemCategory=function(item){
    if(item.category!=="Lineage variants") return item.category;
    const stage=L.currentStage();
    const parent=(stage.systems||[]).find(function(row){ return (item.prereq||[]).includes(row.id); });
    return parent?parent.category:"Buildings";
  };
  L.visibleSystemCategories=function(){
    const stage=L.currentStage(), cats=[...new Set((stage.systems||[]).map(function(item){ return L.systemCategory(item); }))];
    if(stage.id==="tribal"){
      if(!state.game.run.ownedSystems.village_center) return ["Village core","Buildings"];
      if(!state.game.run.ownedSystems.workshop) return ["Village core","Buildings"];
      if(!state.game.run.ownedSystems.watch_band) return ["Village core","Buildings","Units"];
      return cats;
    }
    if(stage.id==="civilization"){
      if(!state.game.run.ownedSystems.city_center) return ["Cities","Infrastructure"];
      if(!state.game.run.ownedSystems.library) return ["Cities","Infrastructure","Institutions"];
      if(!state.game.run.technologies.code_of_laws) return ["Cities","Infrastructure","Institutions","Military"];
      return cats;
    }
    if(stage.id==="empire"){
      if(!state.game.run.ownedSystems.provincial_admin) return ["Administration","Industry"];
      if(!state.game.run.ownedSystems.rail_hub) return ["Administration","Industry","Logistics","Institutions"];
      if(!state.game.run.ownedSystems.general_staff) return ["Administration","Industry","Logistics","Institutions","Military"];
      return cats;
    }
    if(stage.id==="solar"){
      if(!state.game.run.ownedSystems.planetary_colony) return ["Colonies","Infrastructure"];
      if(!state.game.run.ownedSystems.solar_array) return ["Colonies","Infrastructure"];
      if(!state.game.run.ownedSystems.shipyard_ring) return ["Colonies","Infrastructure","Military"];
      return cats;
    }
    if(stage.id==="galactic"){
      if(!state.game.run.ownedSystems.sector_network) return ["Galactic core","Megastructures"];
      if(!state.game.run.ownedSystems.quantum_archive) return ["Galactic core","Megastructures"];
      if(!state.game.run.ownedSystems.gateway_spine) return ["Galactic core","Megastructures","Infrastructure"];
      if(!state.game.run.ownedSystems.ascension_protocol) return ["Galactic core","Megastructures","Infrastructure","Victory paths"];
      return cats;
    }
    if(stage.id!=="cell") return cats;
    if(!L.cellStarterComplete()) return ["Starter organelles"];
    if(!state.game.run.ownedSystems.nucleus) return ["Starter organelles","Energy organelles","Assembly organelles","Core organelles"];
    return ["All organelles"].concat(cats.filter(function(cat){ return cat!=="Starter organelles"; }));
  };
  L.visibleTechPaths=function(){ return L.currentStage().techPaths||[]; };

  L.automationDefsForStage=function(){ return []; };

  L.automationCount=function(id){ return state.game.run.automation[id]||0; };
  L.generatorMultiplier=function(count){ return Math.pow(2,Math.floor(count/10)); };
  L.scaledCost=function(cost,owned){ const mult=L.costMultiplier(), growth=Math.pow(1.14,owned), out={}; Object.entries(cost||{}).forEach(function(entry){ out[entry[0]]=Math.max(1,Math.round(entry[1]*growth*mult)); }); return out; };
  L.capacityFor=function(id){
    if(id==="divinity"){
      return L.divinityChannelIds().reduce(function(sum,key){ return sum+(state.game.run.capacities[key]||25); },0);
    }
    return state.game.run.capacities[id]||25;
  };
  L.canAfford=function(cost){ if(state.ui.debug) return true; return Object.entries(cost||{}).every(function(entry){ return (state.game.run.resources[entry[0]]||0)>=entry[1]; }); };
  L.spend=function(cost){
    if(state.ui.debug) return true;
    Object.entries(cost||{}).forEach(function(entry){ state.game.run.resources[entry[0]]=Math.max(0,(state.game.run.resources[entry[0]]||0)-entry[1]); });
    return true;
  };
  L.addCapacity=function(bundle){ Object.entries(bundle||{}).forEach(function(entry){ state.game.run.capacities[entry[0]]=(state.game.run.capacities[entry[0]]||0)+entry[1]; }); };
  L.gain=function(bundle,mult){
    const useMult=mult==null?1:mult;
    Object.entries(bundle||{}).forEach(function(entry){
      const key=entry[0], value=entry[1]*useMult, cap=L.capacityFor(key);
      state.game.run.resources[key]=Math.max(0,Math.min(cap,(state.game.run.resources[key]||0)+value));
    });
  };
  L.pushLog=function(text){ state.game.run.log.push(text); if(state.game.run.log.length>120) state.game.run.log=state.game.run.log.slice(-120); };
  L.seedIndex=function(list,salt){ return list.length?Math.abs(Math.floor((state.game.run.time*997+state.game.run.stageIndex*37+salt)%list.length)):0; };
  L.extraSlotForStage=function(stageId,index){
    const arch=state.game.run.secondaryArchetype||state.game.run.lockedArchetype||L.dominantArchetype();
    const prefs={
      aquatic:{name:"Tidal Annex",type:"Water territory",effects:{resourceOutput:{water:0.08,food:0.03}}},
      lithoid:{name:"Mineral Annex",type:"Stone territory",effects:{resourceOutput:{stone:0.08,alloys:0.03}}},
      avian:{name:"Highland Annex",type:"High territory",effects:{resourceOutput:{diplomacy:0.04,energy:0.04}}},
      plantoid:{name:"Fertile Annex",type:"Growth territory",effects:{resourceOutput:{food:0.08,biomass:0.03}}},
      necroid:{name:"Ossuary Annex",type:"Memory territory",effects:{resourceOutput:{medicine:0.04,cohesion:0.04}}},
      toxoid:{name:"Toxic Annex",type:"Hazard territory",effects:{resourceOutput:{science:0.05,pollution:0.04}}},
      reptilian:{name:"Basking Annex",type:"War territory",effects:{resourceOutput:{military_power:0.05,production:0.04}}},
      humanoid:{name:"Civic Annex",type:"Planning territory",effects:{resourceOutput:{science:0.04,influence:0.04}}}
    };
    const pref=prefs[arch]||{name:"Frontier Annex",type:"Open territory",effects:{resourceOutput:{production:0.04,culture:0.03}}};
    return Object.assign({id:"expanded_"+stageId+"_"+index,systemId:""},pref);
  };
  L.stageMasteryCount=function(stageId){ return (state.game.meta.stageMastery||{})[stageId]||0; };
  L.availableStageLayouts=function(stageId){
    return ((DATA.STAGE_MASTERY_LAYOUTS||{})[stageId]||[]).filter(function(item){
      return state.ui.debug || L.stageMasteryCount(stageId)>=item.wins;
    });
  };
  L.activeStageLayout=function(stageId){
    const chosen=(state.game.meta.stageLayouts||{})[stageId]||"standard";
    return L.availableStageLayouts(stageId).find(function(item){ return item.id===chosen; }) || (((DATA.STAGE_MASTERY_LAYOUTS||{})[stageId]||[])[0]) || null;
  };
  L.chooseStageLayout=function(stageId,id){
    if(!L.stageHasMapSlots(stageId)) return false;
    const layout=L.availableStageLayouts(stageId).find(function(item){ return item.id===id; });
    if(!layout) return false;
    state.game.meta.stageLayouts[stageId]=id;
    delete state.game.run.mapSlots[stageId];
    L.ensureWorldState();
    L.pushLog("Stage layout selected: "+layout.name);
    return true;
  };
  L.ensureWorldState=function(){
    const stage=L.currentStage(), stageId=stage.id;
    if(!L.stageHasMapSlots(stageId)){
      state.game.run.mapSlots[stageId]=[];
      state.game.run.expandedSlots[stageId]=0;
    } else {
    if(!state.game.run.mapSlots[stageId]) state.game.run.mapSlots[stageId]=(DATA.MAP_SLOTS[stageId]||[]).map(function(slot){ return Object.assign({systemId:""},slot); });
    const desiredExtra=state.game.run.expandedSlots[stageId]||0, slots=state.game.run.mapSlots[stageId];
    for(let i=0;i<desiredExtra;i++){
      const id="expanded_"+stageId+"_"+i;
      if(!slots.some(function(slot){ return slot.id===id; })) slots.push(L.extraSlotForStage(stageId,i));
    }
    const layout=L.activeStageLayout(stageId);
    if(layout && layout.slot && !slots.some(function(slot){ return slot.id===layout.slot.id; })){
      slots.push(Object.assign({systemId:""},layout.slot));
    }
    if(L.hasMetaUnlock("biome_traits")){
      const traits=DATA.SLOT_TRAITS||[];
      slots.forEach(function(slot,i){
        if(traits.length && !slot.traitId) slot.traitId=traits[(state.game.run.stageIndex+i+state.game.meta.galacticWins)%traits.length].id;
      });
    }
    }
    if(L.hasMetaUnlock("eras") && !state.game.run.eraModifiers[stageId]){
      const eras=DATA.ERA_MODIFIERS[stageId]||[];
      if(eras.length) state.game.run.eraModifiers[stageId]=eras[(state.game.run.stageIndex+state.game.meta.galacticWins)%eras.length].id;
    }
    if(!state.game.run.rivals){
      const personalities=DATA.RIVAL_PERSONALITIES||[];
      const paths=DATA.ASCENSION_PATHS||[];
      state.game.run.rivals=DATA.ARCHETYPES.filter(function(arch){ return arch.id!==state.game.run.lockedArchetype; }).slice(0,3).map(function(arch,i){
        const personality=personalities.length?personalities[(i+state.game.run.stageIndex+state.game.meta.galacticWins)%personalities.length]:null;
        const path=paths.length?paths[(i+state.game.meta.galacticWins)%paths.length].id:"";
        const pathDef=(DATA.RIVAL_ASCENSION||{})[path];
        return {archetype:arch.id,score:30+i*12,trend:(0.018+i*0.007)*(personality?personality.trend:1)*(pathDef?pathDef.trend:1),personality:personality?personality.id:"",path:path};
      });
    } else {
      const personalities=DATA.RIVAL_PERSONALITIES||[];
      const paths=DATA.ASCENSION_PATHS||[];
      state.game.run.rivals.forEach(function(rival,i){
        if(!rival.personality && personalities.length){
          const personality=personalities[(i+state.game.run.stageIndex+state.game.meta.galacticWins)%personalities.length];
          rival.personality=personality.id;
          rival.trend=(rival.trend||0.018)*(personality.trend||1);
        }
        if(!rival.path && paths.length){
          const path=paths[(i+state.game.meta.galacticWins)%paths.length].id, pathDef=(DATA.RIVAL_ASCENSION||{})[path];
          rival.path=path;
          rival.trend=(rival.trend||0.018)*(pathDef?pathDef.trend:1);
        }
      });
    }
    L.ensureMutatorDraft();
    L.ensureWorldEvents();
  };

  L.performAction=function(actionId){
    if(state.ui.betweenRuns) return false;
    const action=L.stageActions().find(function(item){ return item.id===actionId; });
    if(!action) return false;
    L.gain(action.gain,L.manualMultiplier());
    if(L.currentStage().id==="cell") state.game.run.population+=0.012;
    L.pushLog("Action: "+action.name);
    return true;
  };

  L.requirementMet=function(id){ return !!state.game.run.ownedSystems[id] || !!state.game.run.technologies[id]; };
  L.prereqsMet=function(item){ return (item.prereq||[]).every(function(id){ return L.requirementMet(id); }); };
  L.contentVisible=function(item,showLocked){ return L.lineageContentVisible(item) && (showLocked || L.pathRequirementMet(item)) && L.stageRevealVisible(item,showLocked) && (showLocked || L.prereqsMet(item)); };
  L.lockReasonForSystem=function(item){
    if(!L.lineageRequirementMet(item)) return L.lineageRequirementText(item);
    if(!L.pathRequirementMet(item)) return L.pathRequirementText(item);
    const missing=(item.prereq||[]).filter(function(id){ return !L.requirementMet(id); });
    if(missing.length){
      const names=missing.map(function(id){ const found=(L.currentStage().systems||[]).find(function(sys){ return sys.id===id; })||(L.currentStage().technologies||[]).find(function(tech){ return tech.id===id; }); return found?found.name:id; });
      return "Needs "+names.join(", ");
    }
    const cost=L.repeatableSystem(item)?L.scaledCost(item.cost,L.systemOwnedCount(item.id)):L.discountedCost(item.cost);
    if(!L.canAfford(cost)) return "Need "+L.bundleText(cost);
    return "";
  };
  L.buySystem=function(systemId){
    if(state.ui.betweenRuns) return false;
    const item=(L.currentStage().systems||[]).find(function(system){ return system.id===systemId; });
    const owned=state.game.run.ownedSystems[item.id];
    if(!item || (owned && !L.repeatableSystem(item))) return false;
    if(!L.lineageRequirementMet(item) && !state.ui.debug) return false;
    if(!L.pathRequirementMet(item) && !state.ui.debug) return false;
    if(!L.prereqsMet(item) && !state.ui.debug) return false;
    const cost=L.repeatableSystem(item)?L.scaledCost(item.cost,L.systemOwnedCount(item.id)):L.discountedCost(item.cost);
    if(!L.canAfford(cost)) return false;
    L.spend(cost);
    if(!owned) state.game.run.ownedSystems[item.id]={stageId:L.currentStage().id,boughtAt:state.game.run.time,count:0};
    state.game.run.ownedSystems[item.id].count=(state.game.run.ownedSystems[item.id].count||0)+1;
    L.markSeenContent("system",item);
    if((state.game.run.ownedSystems[item.id].count||0)===1) L.autoPlaceSystem(item.id);
    L.addCapacity(item.capacity);
    L.pushLog("Built system: "+item.name+(L.repeatableSystem(item)?" x"+state.game.run.ownedSystems[item.id].count:""));
    return true;
  };
  L.autoPlaceSystem=function(systemId){
    L.ensureWorldState();
    if(!L.stageHasMapSlots(L.currentStage().id)) return false;
    const slot=L.mapSlotsForStage().find(function(item){ return !item.systemId; });
    if(slot) slot.systemId=systemId;
    return !!slot;
  };
  L.placeSystemInSlot=function(systemId,slotId){
    L.ensureWorldState();
    if(!L.stageHasMapSlots(L.currentStage().id)) return false;
    const owned=state.game.run.ownedSystems[systemId];
    if(systemId && (!owned || owned.stageId!==L.currentStage().id)) return false;
    const slots=L.mapSlotsForStage(), slot=slots.find(function(item){ return item.id===slotId; });
    if(!slot) return false;
    if(systemId) slots.forEach(function(item){ if(item.systemId===systemId) item.systemId=""; });
    slot.systemId=systemId;
    return true;
  };
  L.ensureMutatorDraft=function(){
    if(!L.hasMetaUnlock("run_mutators")) return;
    const stageId=L.currentStage().id;
    if((state.game.run.mutatorDrafts||{})[stageId]) return;
    const list=DATA.RUN_MUTATORS||[];
    state.game.run.mutatorDrafts[stageId]=[0,1,2].map(function(offset){ return list[(state.game.run.stageIndex+state.game.meta.galacticWins+offset)%list.length].id; });
  };
  L.mutatorDraft=function(){ L.ensureMutatorDraft(); return ((state.game.run.mutatorDrafts||{})[L.currentStage().id]||[]).map(function(id){ return (DATA.RUN_MUTATORS||[]).find(function(item){ return item.id===id; }); }).filter(Boolean); };
  L.chooseMutator=function(id){
    if(!L.hasMetaUnlock("run_mutators")) return false;
    const stageId=L.currentStage().id;
    if(Object.prototype.hasOwnProperty.call(state.game.run.activeMutators||{},stageId)) return false;
    if(id && !L.mutatorDraft().some(function(item){ return item.id===id; })) return false;
    if(id) state.game.run.activeMutators[stageId]=id;
    else state.game.run.activeMutators[stageId]="";
    L.pushLog(id?("Run mutator chosen: "+((DATA.RUN_MUTATORS||[]).find(function(item){ return item.id===id; })||{}).name):"Run mutator skipped.");
    return true;
  };
  L.expandMap=function(){
    L.ensureWorldState();
    if(!L.stageHasMapSlots(L.currentStage().id)) return false;
    if(!L.hasMetaUnlock("map_expansion")) return false;
    const stageId=L.currentStage().id, count=state.game.run.expandedSlots[stageId]||0, max=3;
    if(count>=max) return false;
    const cost=L.expandMapCost(count);
    if(state.game.meta.evolutionPoints<cost && !state.ui.debug) return false;
    if(!state.ui.debug) state.game.meta.evolutionPoints-=cost;
    state.game.run.expandedSlots[stageId]=count+1;
    state.game.run.mapSlots[stageId].push(L.extraSlotForStage(stageId,count));
    L.pushLog("Map expanded: "+L.currentStage().name+" gained a new slot.");
    return true;
  };
  L.availableContracts=function(){
    if(!L.hasMetaUnlock("contracts")) return [];
    return (DATA.STAGE_CONTRACTS||[]).filter(function(contract){
      const winOk=!contract.requiresWin || state.game.meta.galacticWins>0 || state.ui.debug;
      const chainOk=!contract.after || !!(state.game.meta.completedContracts||{})[contract.after] || state.ui.debug;
      return winOk && chainOk;
    });
  };
  L.chooseContract=function(id){
    if(state.game.run.activeContract) return false;
    if(L.ownedSystemsForStage().length>0 && !state.ui.debug) return false;
    const contract=L.availableContracts().find(function(item){ return item.id===id; });
    if(!contract) return false;
    state.game.run.activeContract=id;
    L.pushLog("Stage contract accepted: "+contract.name);
    return true;
  };
  L.availableThreatProjects=function(){
    const activeThreats=L.threats().map(function(threat){ return threat.id; });
    return (DATA.THREAT_PROJECTS||[]).filter(function(project){
      return activeThreats.includes(project.threat) || state.game.run.threatProjects[project.id];
    });
  };
  L.resolveThreatProject=function(id){
    const project=(DATA.THREAT_PROJECTS||[]).find(function(item){ return item.id===id; });
    if(!project || state.game.run.threatProjects[id]) return false;
    if(!L.canAfford(project.cost)) return false;
    L.spend(project.cost);
    state.game.run.threatProjects[id]=true;
    L.pushLog("Threat project completed: "+project.name);
    return true;
  };
  L.availableRivalInteractions=function(){
    if(!state.game.run.rivals || !state.game.run.rivals.length) return [];
    const key=L.currentStage().id, used=state.game.run.rivalEvents||{};
    return (DATA.RIVAL_EVENTS||[]).map(function(event){ return Object.assign({chosen:!!used[key],available:!used[key]},event); });
  };
  L.chooseRivalInteraction=function(id){
    L.ensureWorldState();
    const key=L.currentStage().id;
    if(state.game.run.rivalEvents[key]) return false;
    const event=(DATA.RIVAL_EVENTS||[]).find(function(item){ return item.id===id; });
    if(!event) return false;
    state.game.run.rivalEvents[key]=id;
    if(id==="espionage"){
      const rival=(state.game.run.rivals||[]).sort(function(a,b){ return b.score-a.score; })[0];
      if(rival){ rival.score=Math.max(0,rival.score-12-(L.upgradeLevel("rival_scan")||0)*2); L.noteRivalStudy(rival.archetype); }
    }
    if(id==="trade_pact"){
      const rival=(state.game.run.rivals||[]).sort(function(a,b){ return b.score-a.score; })[0];
      if(rival){ rival.trend*=0.9; L.noteRivalStudy(rival.archetype); }
    }
    L.pushLog("Rival interaction chosen: "+event.name);
    return true;
  };
  L.availableCongressProposals=function(){
    const currentIndex=state.game.run.stageIndex;
    return (DATA.CONGRESS_PROPOSALS||[]).filter(function(item){
      const min=L.stageIndexById(item.stageMin);
      return min>=0 && currentIndex>=min;
    });
  };
  L.chooseCongressProposal=function(id){
    if(state.game.run.congressChoice) return false;
    const proposal=L.availableCongressProposals().find(function(item){ return item.id===id; });
    if(!proposal) return false;
    state.game.run.congressChoice=id;
    if(L.currentStage().id==="galactic" && proposal.bloc){
      const institutionBonus=(L.enlightenmentUpgradeLevel("institutional_memory")>0?1:0)+(L.enlightenmentUpgradeLevel("bloc_blueprints")>0 && state.game.run.seedPreferredCongressBloc===proposal.bloc?1:0);
      state.game.meta.congressInstitutionLevels[proposal.bloc]=(state.game.meta.congressInstitutionLevels[proposal.bloc]||0)+1+institutionBonus;
    }
    L.pushLog("Congress proposal passed: "+proposal.name);
    return true;
  };
  L.activeCongressCrisis=function(){
    if(!state.game.run.congressChoice) return null;
    const forecastBonus=L.transcendenceUpgradeLevel("crisis_forecasting")>0;
    const rivalThreshold=L.currentStage().id==="galactic"?(state.game.run.technologies.ascension_protocols?(forecastBonus?76:80):(state.game.run.ascensionPath?(forecastBonus?80:84):(forecastBonus?86:90))):90;
    const rivalPressure=(state.game.run.rivals||[]).some(function(rival){ return rival.score>=rivalThreshold || rival.victory; });
    const severe=((state.game.run.resources.cohesion||100)<18) || ((state.game.run.resources.happiness||100)<18) || L.survivalFailureResources().some(function(id){ return (state.game.run.resourceFailures[id]||0)>0; });
    const tensionPressure=L.currentStage().id==="galactic" && state.game.run.ascensionPath && L.ascensionTension()>=(forecastBonus?44:48);
    if(!rivalPressure && !severe && !tensionPressure) return null;
    const list=DATA.CONGRESS_CRISES||[];
    return list.length?list[(state.game.run.stageIndex+(state.game.meta.galacticWins||0))%list.length]:null;
  };
  L.currentCongressProposal=function(){
    return (DATA.CONGRESS_PROPOSALS||[]).find(function(item){ return item.id===state.game.run.congressChoice; })||null;
  };
  L.preferredFTLMethodId=function(){
    return state.game.run.seedPreferredFTLMethod || "";
  };
  L.preferredFTLMethodName=function(){
    const id=L.preferredFTLMethodId();
    const method=(DATA.FTL_METHODS||[]).find(function(item){ return item.id===id; });
    return method?method.name:"";
  };
  L.nextCongressSeason=function(){
    const proposal=L.currentCongressProposal();
    if(!proposal) return null;
    const proposals=L.availableCongressProposals().filter(function(item){ return item.id!==proposal.id; });
    if(!proposals.length) return null;
    const season=((state.game.meta.congressSeasons||{})[L.currentStage().id]||0)+1;
    return proposals[season%proposals.length];
  };
  L.rotateCongressSeason=function(){
    if(!state.game.run.congressChoice) return false;
    const current=L.currentCongressProposal();
    const next=L.nextCongressSeason();
    if(!next) return false;
    state.game.meta.congressSeasons[L.currentStage().id]=((state.game.meta.congressSeasons||{})[L.currentStage().id]||0)+1;
    if(current && current.bloc){
      state.game.meta.congressInstitutionLevels[current.bloc]=(state.game.meta.congressInstitutionLevels[current.bloc]||0)+1;
    }
    state.game.run.congressChoice=next.id;
    delete state.game.run.rivalEvents.congressCrisis;
    L.pushLog("Congress season rotated to "+next.name+".");
    return true;
  };
  L.chooseCongressCrisisResponse=function(id){
    const crisis=L.activeCongressCrisis();
    if(!crisis || state.game.run.rivalEvents.congressCrisis) return false;
    const choice=(crisis.choices||[]).find(function(item){ return item.id===id; });
    if(!choice) return false;
    state.game.run.rivalEvents.congressCrisis=id;
    L.pushLog("Congress crisis resolved: "+crisis.name+" - "+choice.name);
    return true;
  };
  L.availableArtifactEvolutions=function(){
    return (DATA.ARTIFACT_EVOLUTIONS||[]).filter(function(item){
      return !!state.game.meta.artifacts[item.artifactId] && !state.game.meta.artifactEvolutions[item.id] && (state.game.meta.galacticWins>=item.wins || state.ui.debug);
    });
  };
  L.evolveArtifact=function(id){
    const evo=L.availableArtifactEvolutions().find(function(item){ return item.id===id; });
    if(!evo || !L.canAfford(evo.cost)) return false;
    L.spend(evo.cost);
    state.game.meta.artifactEvolutions[id]=true;
    L.pushLog("Artifact reassembled: "+evo.name);
    return true;
  };
  L.applyArtifactWear=function(){
    const tier=L.legacyTierDef();
    if(!tier || !["hostile_cosmos","thin_reality"].includes(tier.id)) return;
    const bases=Object.keys(state.game.meta.artifacts||{}), evolved=state.game.meta.artifactEvolutions||{};
    const vulnerable=bases.filter(function(id){ return !Object.values(DATA.ARTIFACT_EVOLUTIONS||[]).some(function(item){ return item.artifactId===id && evolved[item.id]; }); });
    if(!vulnerable.length) return;
    const worn=vulnerable[0];
    state.game.meta.wornArtifacts[worn]=true;
    delete state.game.meta.artifacts[worn];
    L.pushLog("Artifact wear: "+(((DATA.ARTIFACTS||[]).find(function(item){ return item.id===worn; })||{}).name||worn)+" degraded in the harsh universe.");
  };
  L.archiveFavoriteKey=function(kind,id){ return kind+":"+id; };
  L.toggleArchiveFavorite=function(kind,id){
    if(L.upgradeLevel("archive_pinning")<=0 && !state.ui.debug) return false;
    const key=L.archiveFavoriteKey(kind,id), favs=state.game.meta.archiveFavorites||(state.game.meta.archiveFavorites={});
    favs[key]=!favs[key];
    if(!favs[key]) delete favs[key];
    return true;
  };
  L.isArchiveFavorite=function(kind,id){
    return !!((state.game.meta.archiveFavorites||{})[L.archiveFavoriteKey(kind,id)]);
  };
  L.availableMapWonders=function(slotId){
    L.ensureWorldState();
    const slot=L.mapSlotsForStage().find(function(item){ return item.id===slotId; });
    if(!slot || state.game.run.mapWonders[slotId]) return [];
    const tags=L.slotTags(slot);
    return (DATA.MAP_WONDERS||[]).filter(function(wonder){
      const unused=!Object.values(state.game.run.mapWonders||{}).includes(wonder.id);
      const tagOk=!(wonder.slotTags||[]).length || (wonder.slotTags||[]).some(function(tag){ return tags.includes(tag); });
      return unused && tagOk;
    });
  };
  L.buildMapWonder=function(wonderId,slotId){
    const wonder=L.availableMapWonders(slotId).find(function(item){ return item.id===wonderId; });
    if(!wonder || !L.canAfford(wonder.cost)) return false;
    L.spend(wonder.cost);
    state.game.run.mapWonders[slotId]=wonder.id;
    state.game.run.mapWonderLevels[slotId]=1;
    L.markSeenContent("wonder",wonder);
    L.pushLog("Map wonder built: "+wonder.name);
    return true;
  };
  L.mapWonderUpgradeCost=function(slotId){
    const wonder=(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===(state.game.run.mapWonders||{})[slotId]; });
    const level=(state.game.run.mapWonderLevels||{})[slotId]||1, out={};
    Object.entries((wonder&&wonder.cost)||{}).forEach(function(entry){ out[entry[0]]=Math.max(1,Math.round(entry[1]*(0.45+level*0.35))); });
    return out;
  };
  L.maxMapWonderLevel=function(){ return 3+Math.min(3,Math.floor((state.game.meta.galacticWins||0)/4)); };
  L.upgradeMapWonder=function(slotId){
    const wonderId=(state.game.run.mapWonders||{})[slotId], wonder=(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===wonderId; });
    if(!wonder) return false;
    const level=(state.game.run.mapWonderLevels||{})[slotId]||1;
    if(level>=L.maxMapWonderLevel()) return false;
    const cost=L.mapWonderUpgradeCost(slotId);
    if(!L.canAfford(cost)) return false;
    L.spend(cost);
    state.game.run.mapWonderLevels[slotId]=level+1;
    L.pushLog("Map wonder upgraded: "+wonder.name+" level "+(level+1));
    return true;
  };
  L.availableLegacyTiers=function(){
    return (DATA.LEGACY_TIERS||[]).filter(function(tier){ return state.game.meta.galacticWins>=tier.wins || state.ui.debug; });
  };
  L.chooseLegacyTier=function(id){
    const tier=L.availableLegacyTiers().find(function(item){ return item.id===id; });
    if(!tier) return false;
    state.game.meta.legacyTier=id;
    L.pushLog("Legacy universe selected: "+tier.name);
    return true;
  };
  L.availableRivalDefections=function(){
    L.ensureWorldState();
    if(!["empire","solar","galactic"].includes(L.currentStage().id)) return [];
    const used=state.game.run.rivalDefections||{};
    const forecastBonus=L.transcendenceUpgradeLevel("crisis_forecasting")>0;
    const threshold=L.currentStage().id==="galactic"?(state.game.run.technologies.ascension_protocols?(forecastBonus?70:74):(forecastBonus?74:78)):70;
    const pressured=(state.game.run.rivals||[]).filter(function(rival){ return rival.score>=threshold && !used[rival.archetype]; });
    return pressured.flatMap(function(rival){
      return (DATA.RIVAL_DEFECTIONS||[]).map(function(defection){ return {rival:rival,defection:defection}; });
    });
  };
  L.assignVassalPersonality=function(archetype){
    const list=DATA.VASSAL_PERSONALITIES||[];
    if(!list.length) return "";
    const idx=Math.abs((state.game.meta.galacticWins||0)+L.stageIndexById(L.currentStage().id)+archetype.length)%list.length;
    return list[idx].id;
  };
  L.rivalDossier=function(archetype){
    const dossiers=state.game.meta.rivalDossiers||(state.game.meta.rivalDossiers={});
    if(!dossiers[archetype]) dossiers[archetype]={studied:0,victories:0,defections:0,vassals:0,lastPath:"",paths:{},eras:{},collapses:0};
    if(!dossiers[archetype].paths) dossiers[archetype].paths={};
    if(!dossiers[archetype].eras) dossiers[archetype].eras={};
    if(dossiers[archetype].collapses==null) dossiers[archetype].collapses=0;
    return dossiers[archetype];
  };
  L.noteRivalStudy=function(archetype){
    const row=L.rivalDossier(archetype);
    row.studied=(row.studied||0)+1;
  };
  L.noteRivalVictory=function(rival){
    const row=L.rivalDossier(rival.archetype);
    row.victories=(row.victories||0)+1;
    row.lastPath=rival.path||row.lastPath||"";
    if(rival.path) row.paths[rival.path]=(row.paths[rival.path]||0)+1;
    const era=L.currentEra();
    if(era) row.eras[era.id]=(row.eras[era.id]||0)+1;
  };
  L.noteRivalDefection=function(archetype,vassalized){
    const row=L.rivalDossier(archetype);
    row.defections=(row.defections||0)+1;
    if(vassalized) row.vassals=(row.vassals||0)+1;
    row.collapses=(row.collapses||0)+1;
  };
  L.availableVassalDemands=function(){
    if(!["empire","solar","galactic"].includes(L.currentStage().id)) return [];
    return Object.entries(state.game.meta.vassals||{}).flatMap(function(entry){
      const arch=entry[0];
      if((state.game.run.vassalDemands||{})[arch]) return [];
      return (DATA.VASSAL_DEMANDS||[]).map(function(demand){ return {archetype:arch,vassal:entry[1],demand:demand}; });
    });
  };
  L.chooseVassalDemand=function(archetype,id){
    const demand=(DATA.VASSAL_DEMANDS||[]).find(function(item){ return item.id===id; });
    if(!demand || !state.game.meta.vassals[archetype] || state.game.run.vassalDemands[archetype]) return false;
    state.game.run.vassalDemands[archetype]=id;
    L.pushLog("Vassal demand resolved: "+L.displayArchetypeName(archetype)+" - "+demand.name);
    return true;
  };
  L.chooseRivalDefection=function(archetype,id){
    const rival=(state.game.run.rivals||[]).find(function(item){ return item.archetype===archetype; });
    const defection=(DATA.RIVAL_DEFECTIONS||[]).find(function(item){ return item.id===id; });
    if(!rival || !defection || rival.score<70 || state.game.run.rivalDefections[archetype]) return false;
    state.game.run.rivalDefections[archetype]=id;
    if(id==="fragment"){ rival.score=Math.max(0,rival.score-22); rival.trend*=0.82; }
    if(id==="asylum"){ rival.score=Math.max(0,rival.score-12); rival.trend*=0.92; }
    if(id==="forced_merger"){ rival.score=Math.max(0,rival.score-30); rival.trend*=0.75; }
    if(id==="asylum" || id==="forced_merger"){
      const vassal=state.game.meta.vassals[archetype]||{mode:id,count:0,personality:L.assignVassalPersonality(archetype)};
      vassal.mode=id;
      vassal.count=(vassal.count||0)+1;
      if(!vassal.personality) vassal.personality=L.assignVassalPersonality(archetype);
      state.game.meta.vassals[archetype]=vassal;
    }
    L.noteRivalDefection(archetype,id==="asylum" || id==="forced_merger");
    L.pushLog("Rival defection resolved: "+L.displayArchetypeName(archetype)+" - "+defection.name);
    return true;
  };
  L.availableCosmeticThemes=function(){
    return (DATA.COSMETIC_THEMES||[]).filter(function(theme){
      const transUnlock=theme.id==="fantasy_realm" && L.transcendenceUpgradeLevel("mythic_realm")>0;
      if(theme.requiresUpgrade && L.upgradeLevel(theme.requiresUpgrade)<=0 && !transUnlock && !state.ui.debug) return false;
      if(L.transcendenceUpgradeLevel("theme_curator")>0 && theme.id!=="fantasy_realm") return true;
      if(theme.archetype) return (state.game.meta.archetypeWins[theme.archetype]||0)>=theme.wins || state.ui.debug;
      return (state.game.meta.galacticWins>=(theme.wins||0)) || state.ui.debug;
    });
  };
  L.chooseCosmeticTheme=function(id){
    if(id && !L.availableCosmeticThemes().some(function(theme){ return theme.id===id; })) return false;
    state.game.meta.cosmeticTheme=id||"";
    L.applyCosmeticThemeNames();
    return true;
  };
  L.rivalEndingName=function(rival){
    const path=(DATA.RIVAL_ASCENSION||{})[rival.path];
    return L.displayArchetypeName(rival.archetype)+" "+(path?path.name:"Ascension Bid");
  };
  L.wonderMaintenanceCost=function(){
    const tier=L.legacyTierDef();
    if(!tier || !["hostile_cosmos","thin_reality"].includes(tier.id)) return null;
    const wonders=Object.keys(state.game.run.mapWonders||{}).length;
    if(!wonders) return null;
    const scale=tier.id==="thin_reality"?1.4:1;
    const resources=L.currentStage().resources||[];
    return Object.fromEntries([
      [resources[0]||"production",Math.round(30*wonders*scale)],
      [resources[Math.min(1,resources.length-1)]||"gold",Math.round(22*wonders*scale)],
      [resources[Math.min(2,resources.length-1)]||"science",Math.round(18*wonders*scale)]
    ]);
  };
  L.maintainWonders=function(){
    const cost=L.wonderMaintenanceCost();
    if(!cost) return false;
    if(L.canAfford(cost)){ L.spend(cost); L.pushLog("Wonder maintenance completed."); return true; }
    const highest=Object.entries(state.game.run.mapWonderLevels||{}).sort(function(a,b){ return b[1]-a[1]; })[0];
    if(!highest) return false;
    state.game.run.mapWonderLevels[highest[0]]=Math.max(1,(state.game.run.mapWonderLevels[highest[0]]||1)-1);
    L.pushLog("Wonder maintenance failed; a landmark lost one level.");
    return true;
  };
  L.rivalCounterProjectDefs=function(){
    if(!["solar","galactic"].includes(L.currentStage().id)) return [];
    const forecastBonus=L.transcendenceUpgradeLevel("crisis_forecasting")>0;
    const threshold=L.currentStage().id==="galactic"?(state.game.run.technologies.ascension_protocols?(forecastBonus?72:76):(state.game.run.ascensionPath?(forecastBonus?76:80):(forecastBonus?82:86))):85;
    return (state.game.run.rivals||[]).filter(function(rival){ return rival.score>=threshold && !rival.victory; }).flatMap(function(rival){
      return (DATA.RIVAL_COUNTER_PROJECTS||[]).map(function(project){
        return Object.assign({},project,{stage:L.currentStage().id,id:project.id+":"+rival.archetype,targetArchetype:rival.archetype,name:project.name+" - "+L.displayArchetypeName(rival.archetype)});
      });
    });
  };
  L.dossierOperationDefs=function(){
    if(!["solar","galactic"].includes(L.currentStage().id)) return [];
    return Object.entries(state.game.meta.rivalDossiers||{}).flatMap(function(entry){
      const arch=entry[0], row=entry[1]||{}, rival=(state.game.run.rivals||[]).find(function(item){ return item.archetype===arch && !item.victory; });
      if(!rival || (row.studied||0)<2) return [];
      return (DATA.DOSSIER_OPERATIONS||[]).map(function(project){
        return Object.assign({},project,{stage:L.currentStage().id,id:project.id+":"+arch,targetArchetype:arch,name:project.name+" - "+L.displayArchetypeName(arch)});
      });
    });
  };
  L.artifactRecoveryProjectDefs=function(){
    return Object.keys(state.game.meta.wornArtifacts||{}).map(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      if(!artifact) return null;
      return {id:"recover_artifact:"+id,stage:L.currentStage().id,name:"Recover "+artifact.name,desc:"Restore a worn inherited relic through careful reconstruction.",duration:90,cost:{science:90,data:70,unity:50},recoverArtifact:id,effects:{resourceOutput:{science:0.02,unity:0.02}},choices:DATA.ARTIFACT_RESTORATION_BRANCHES||[]};
    }).filter(Boolean);
  };
  L.projectDefById=function(id){
    return (DATA.SPECIAL_PROJECTS||[]).find(function(item){ return item.id===id; }) || (DATA.CRISIS_RECOVERY_PROJECTS||[]).find(function(item){ return item.id===id; }) || L.rivalCounterProjectDefs().find(function(item){ return item.id===id; }) || L.dossierOperationDefs().find(function(item){ return item.id===id; }) || L.artifactRecoveryProjectDefs().find(function(item){ return item.id===id; }) || null;
  };
  L.discountedProjectCost=function(cost){
    let scale=Math.max(0.55,1-(L.upgradeLevel("counterintel")||0)*0.08);
    const project=L.specialProjectDef&&L.specialProjectDef();
    if(project && L.currentStage().id==="solar" && project.id==="ftl_research"){
      scale*=Math.max(0.7,1-(L.enlightenmentUpgradeLevel("ftl_primers")||0)*0.08);
    }
    if(project && L.currentStage().id==="solar" && ["ftl_theory_conclave","ftl_proof_flight","ftl_research"].includes(project.id)){
      scale*=Math.max(0.72,1-(L.enlightenmentUpgradeLevel("proof_scaffolds")||0)*0.06);
    }
    if(L.currentStage().id==="galactic"){
      const crisisWindow=!!L.activeCongressCrisis() || !!L.activeInstitutionCrisis() || (state.game.run.rivals||[]).some(function(rival){ return (rival.score||0)>=80 && !rival.victory; });
      if(crisisWindow) scale*=Math.max(0.72,0.88-(L.enlightenmentUpgradeLevel("counterplay_network")||0)*0.03);
      if(L.transcendenceUpgradeLevel("crisis_forecasting")>0 && crisisWindow) scale*=0.9;
    }
    const out={};
    Object.entries(cost||{}).forEach(function(entry){ out[entry[0]]=Math.max(1,Math.round(entry[1]*scale)); });
    return out;
  };
  L.completeRivalCounterProject=function(project){
    const rival=(state.game.run.rivals||[]).find(function(item){ return item.archetype===project.targetArchetype; });
    if(!rival) return;
    if(project.id.indexOf("rival_sabotage:")===0){ rival.score=Math.max(0,rival.score-18); rival.trend*=0.86; }
    if(project.id.indexOf("rival_detente:")===0){ rival.score=Math.max(0,rival.score-10); rival.trend*=0.9; }
    if(project.id.indexOf("rival_integration:")===0){
      rival.score=Math.max(0,rival.score-25); rival.trend*=0.72;
      const vassal=state.game.meta.vassals[project.targetArchetype]||{mode:"integration",count:0,personality:L.assignVassalPersonality(project.targetArchetype)};
      vassal.mode="integration";
      vassal.count=(vassal.count||0)+1;
      state.game.meta.vassals[project.targetArchetype]=vassal;
    }
    if(project.id.indexOf("dossier_exploit:")===0){ rival.score=Math.max(0,rival.score-16); rival.trend*=0.88; }
    if(project.id.indexOf("dossier_discredit:")===0){ rival.score=Math.max(0,rival.score-12); rival.trend*=0.9; }
  };
  L.rerollEra=function(){
    if(!L.hasMetaUnlock("era_control") || (L.upgradeLevel("era_control")<=0 && !state.ui.debug)) return false;
    const stageId=L.currentStage().id, eras=DATA.ERA_MODIFIERS[stageId]||[];
    if(!eras.length) return false;
    const current=state.game.run.eraModifiers[stageId], index=Math.max(0,eras.findIndex(function(item){ return item.id===current; }));
    state.game.run.eraModifiers[stageId]=eras[(index+1)%eras.length].id;
    state.game.run.eraRerolls+=1;
    L.pushLog("Era shifted to "+L.currentEra().name+".");
    return true;
  };
  L.chooseSecondaryArchetype=function(id){
    if(!L.hasMetaUnlock("hybridization") || (L.upgradeLevel("hybridization")<=0 && !state.ui.debug)) return false;
    if(state.game.run.secondaryArchetype) return false;
    if(id===state.game.run.lockedArchetype) return false;
    if(!DATA.ARCHETYPES.some(function(item){ return item.id===id; })) return false;
    state.game.run.secondaryArchetype=id;
    L.pushLog("Hybrid influence selected: "+L.archetypeName(id));
    return true;
  };
  L.setAutomationPolicy=function(id){
    const policies=["balanced","food","science","low_pollution","lineage"];
    if(!policies.includes(id)) return false;
    state.game.run.automationPolicy=id;
    return true;
  };
  L.ensureWorldEvents=function(){
    const stageId=L.currentStage().id;
    const events=state.game.run.worldEvents[stageId]||{};
    const stageEvents=L.stageEventCatalog(stageId);
    if(stageEvents.length && !events["stage:crisis"] && !events["stage:disaster"]){
      const clears=(state.game.meta.stageClearCounts||{})[stageId]||0;
      const index=(state.game.run.stageIndex+clears+(state.game.meta.galacticWins||0))%stageEvents.length;
      const event=stageEvents[index];
      events[event.kind==="disaster"?"stage:disaster":"stage:crisis"]=event.id;
    }
    if(L.hasMetaUnlock("world_events")){
      L.mapSlotsForStage().forEach(function(slot,i){
        const slotTags=L.slotTags(slot), event=(DATA.WORLD_SLOT_EVENTS||[]).find(function(item){ return (item.slotTags||[]).some(function(tag){ return slotTags.includes(tag); }); });
        if(event && i%2===0 && !events[slot.id]) events[slot.id]=event.id;
      });
    }
    state.game.run.worldEvents[stageId]=events;
  };
  L.chooseWorldEventResponse=function(slotId,choiceId){
    const stageId=L.currentStage().id, eventId=(state.game.run.worldEvents[stageId]||{})[slotId];
    if(!eventId) return false;
    if(!state.game.run.worldEventChoices[stageId]) state.game.run.worldEventChoices[stageId]={};
    if(state.game.run.worldEventChoices[stageId][slotId]) return false;
    const event=L.worldEventDef(eventId);
    const choice=event&&(event.choices||[]).find(function(item){ return item.id===choiceId; });
    if(!choice) return false;
    state.game.run.worldEventChoices[stageId][slotId]=choiceId;
    const follow=((DATA.WORLD_EVENT_CHAINS||{})[event.id]||{})[choice.id];
    if(follow){
      const chainSlot=slotId+":chain";
      state.game.run.worldEvents[stageId][chainSlot]=follow.id;
    }
    state.game.meta.seenEvents[event.id+":"+choice.id]=true;
    L.markSeenContent(event.kind==="disaster"?"disaster":(event.kind==="crisis"?"crisis":"world_event"),event);
    if(event.kind==="disaster" || event.kind==="crisis"){
      L.recordCrisisMemory(event,choice);
      L.unlockStoryEntry("first_crisis_resolved");
    }
    L.pushLog("World event response: "+event.name+" - "+choice.name);
    return true;
  };
  L.availableLineageLaws=function(){
    const stageId=L.currentStage().id;
    if(!L.hasLockedLineage() || !["empire","solar","galactic"].includes(stageId)) return [];
    if(state.game.run.lineageLaws[stageId]) return [];
    return (DATA.LINEAGE_LAWS||{})[stageId]||[];
  };
  L.availableDoctrines=function(){
    const arch=state.game.run.lockedArchetype;
    if(!arch || state.game.run.doctrine) return [];
    if((state.game.meta.archetypeWins[arch]||0)<3 && !state.ui.debug) return [];
    return (DATA.LINEAGE_DOCTRINES||{})[arch]||[];
  };
  L.availableDoctrineEvolutions=function(){
    const id=state.game.run.doctrine, arch=state.game.run.lockedArchetype;
    if(!id || (state.game.meta.evolvedDoctrines||{})[id]) return [];
    if((state.game.meta.archetypeWins[arch]||0)<5 && !state.ui.debug) return [];
    const evo=(DATA.DOCTRINE_EVOLUTIONS||{})[id];
    return evo?[Object.assign({id:id,baseDoctrine:id},evo)]:[];
  };
  L.evolveDoctrine=function(id){
    const evo=L.availableDoctrineEvolutions().find(function(item){ return item.baseDoctrine===id; });
    if(!evo) return false;
    state.game.meta.evolvedDoctrines[id]=true;
    L.pushLog("Doctrine evolved: "+evo.name);
    return true;
  };
  L.chooseDoctrine=function(id){
    const doctrine=L.availableDoctrines().find(function(item){ return item.id===id; });
    if(!doctrine) return false;
    state.game.run.doctrine=id;
    L.pushLog("Doctrine chosen: "+doctrine.name);
    return true;
  };
  L.chooseLineageLaw=function(id){
    const stageId=L.currentStage().id, law=L.availableLineageLaws().find(function(item){ return item.id===id; });
    if(!law) return false;
    state.game.run.lineageLaws[stageId]=id;
    L.pushLog("Lineage law adopted: "+law.name);
    return true;
  };
  L.availableSpecialProjects=function(){
    return (DATA.SPECIAL_PROJECTS||[]).concat(DATA.CRISIS_RECOVERY_PROJECTS||[],L.rivalCounterProjectDefs(),L.dossierOperationDefs(),L.artifactRecoveryProjectDefs()).filter(function(item){
      if(item.stage!==L.currentStage().id) return false;
      if(item.scarRecovery) return Object.keys(state.game.meta.threatScars||{}).some(function(id){ return !state.game.meta.transformedScars[id]; });
      if(item.requiresCrisisMemory && ((L.crisisHistory().resolvedTotal||0)<item.requiresCrisisMemory)) return false;
      if(item.requiresSystem && !state.game.run.ownedSystems[item.requiresSystem]) return false;
      if(item.requiresCompletedProject && !state.game.meta.completedProjects[item.requiresCompletedProject]) return false;
      if(item.requiresLaw && !Object.values(state.game.run.lineageLaws||{}).includes(item.requiresLaw)) return false;
      if(item.requiresPath && state.game.run.ascensionPath!==item.requiresPath) return false;
      if(item.requiresEventChoice && !L.hasEventChoice(item.requiresEventChoice)) return false;
      if(item.requiresArtifactSet && !L.artifactSetSources().some(function(set){ return set.id===item.requiresArtifactSet; })) return false;
      if(item.recoverArtifact && !state.game.meta.wornArtifacts[item.recoverArtifact]) return false;
      return !state.game.meta.completedProjects[item.id];
    });
  };
  L.projectLockReason=function(project){
    if(project.scarRecovery && !Object.keys(state.game.meta.threatScars||{}).some(function(id){ return !state.game.meta.transformedScars[id]; })) return "Needs a recoverable scar.";
    if(project.requiresCrisisMemory && ((L.crisisHistory().resolvedTotal||0)<project.requiresCrisisMemory)) return "Needs "+project.requiresCrisisMemory+" resolved crisis memories.";
    if(project.requiresSystem && !state.game.run.ownedSystems[project.requiresSystem]) return "Needs "+project.requiresSystem+".";
    if(project.requiresCompletedProject && !state.game.meta.completedProjects[project.requiresCompletedProject]){
      const prereq=L.projectDefById(project.requiresCompletedProject);
      return "Needs "+(prereq?prereq.name:project.requiresCompletedProject)+".";
    }
    if(project.requiresLaw && !Object.values(state.game.run.lineageLaws||{}).includes(project.requiresLaw)) return "Needs law "+project.requiresLaw+".";
    if(project.requiresPath && state.game.run.ascensionPath!==project.requiresPath) return "Needs "+project.requiresPath+" ascension path.";
    if(project.requiresEventChoice && !L.hasEventChoice(project.requiresEventChoice)) return "Needs event choice "+project.requiresEventChoice+".";
    if(project.requiresArtifactSet && !L.artifactSetSources().some(function(set){ return set.id===project.requiresArtifactSet; })) return "Needs artifact set "+project.requiresArtifactSet+".";
    if(state.game.meta.completedProjects[project.id] && !project.scarRecovery) return "Already complete.";
    if(!L.canAfford(L.discountedProjectCost(project.cost))) return "Need "+L.bundleText(L.discountedProjectCost(project.cost));
    return "";
  };
  L.startSpecialProject=function(id){
    if(state.game.run.specialProject) return false;
    const project=L.availableSpecialProjects().find(function(item){ return item.id===id; });
    const cost=L.discountedProjectCost((project||{}).cost);
    if(!project || !L.canAfford(cost)) return false;
    L.spend(cost);
    state.game.run.specialProject={id:id,progress:0};
    L.pushLog("Special project started: "+project.name);
    return true;
  };
  L.specialProjectDef=function(){ return state.game.run.specialProject?L.projectDefById(state.game.run.specialProject.id):null; };
  L.pendingProjectDef=function(){ return state.game.run.pendingProjectChoice?L.projectDefById(state.game.run.pendingProjectChoice.id):null; };
  L.chooseProjectCompletion=function(choiceId){
    const pending=state.game.run.pendingProjectChoice, project=L.pendingProjectDef();
    if(!pending || !project) return false;
    if(project.scarRecovery){
      const scarId=choiceId;
      if(!state.game.meta.threatScars[scarId] || (state.game.meta.transformedScars||{})[scarId]) return false;
      state.game.meta.transformedScars[scarId]=true;
      state.game.meta.completedProjects[project.id]=(state.game.meta.completedProjects[project.id]||0)+1;
      L.pushLog("Scar transformed: "+((DATA.SCAR_TRANSFORMS||{})[scarId]||{}).name);
    } else if(project.recoverArtifact){
      const branch=(DATA.ARTIFACT_RESTORATION_BRANCHES||[]).find(function(item){ return item.id===choiceId; });
      if(!branch || !state.game.meta.wornArtifacts[project.recoverArtifact]) return false;
      state.game.meta.restoredArtifacts[project.recoverArtifact]=branch.id;
      if(!state.game.meta.restorationHistory[project.recoverArtifact]) state.game.meta.restorationHistory[project.recoverArtifact]=[];
      state.game.meta.restorationHistory[project.recoverArtifact].push(branch.id);
      state.game.meta.artifacts[project.recoverArtifact]=true;
      delete state.game.meta.wornArtifacts[project.recoverArtifact];
      state.game.meta.completedProjects[project.id]=branch.id;
      L.pushLog("Artifact restored: "+(((DATA.ARTIFACTS||[]).find(function(item){ return item.id===project.recoverArtifact; })||{}).name||project.recoverArtifact)+" - "+branch.name);
    } else {
      const choice=(project.choices||[]).find(function(item){ return item.id===choiceId; });
      if(!choice) return false;
      state.game.meta.completedProjects[project.id]=choice.id;
      if(project.id==="ftl_theory_conclave") L.pushLog("FTL doctrine chosen: "+choice.name);
      else if(project.id==="ftl_proof_flight") L.pushLog("FTL proof flight result: "+choice.name);
      else if(project.id==="ftl_research"){ L.pushLog("FTL method proven: "+choice.name); L.unlockStoryEntry("ftl_proven"); }
      else L.pushLog("Project completion chosen: "+project.name+" - "+choice.name);
    }
    state.game.run.pendingProjectChoice=null;
    return true;
  };
  L.chooseAscensionPath=function(id){
    if(L.currentStage().id!=="galactic" || state.game.run.ascensionPath) return false;
    const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===id; });
    if(!path) return false;
    state.game.run.ascensionPath=id;
    L.pushLog("Ascension path committed: "+path.name);
    L.unlockStoryEntry("ascension_chosen");
    return true;
  };
  L.ascensionObjectives=function(){
    const path=state.game.run.ascensionPath;
    return ((DATA.ASCENSION_OBJECTIVES||{})[path]||[]).map(function(obj){
      let done=false, detail="";
      if(obj.resource){ done=(state.game.run.resources[obj.resource]||0)>=obj.target; detail=L.resourceName(obj.resource)+" "+L.fmt(state.game.run.resources[obj.resource]||0)+" / "+L.fmt(obj.target); }
      if(obj.project){ done=!!state.game.meta.completedProjects[obj.project]; detail=done?"Project complete":"Needs "+obj.project; }
      if(obj.tech){ done=!!state.game.run.technologies[obj.tech]; detail=done?"Tech complete":"Needs "+(((L.currentStage().technologies||[]).find(function(item){ return item.id===obj.tech; })||{}).name||obj.tech); }
      if(obj.kind==="rivals"){ const wins=(state.game.run.rivals||[]).filter(function(r){ return r.victory; }).length; done=wins<=obj.target; detail=wins+" rival victories / max "+obj.target; }
      if(obj.kind==="rivalsMax"){ const wins=(state.game.run.rivals||[]).filter(function(r){ return r.victory; }).length; done=wins<=obj.target; detail=wins+" rival victories / max "+obj.target; }
      return Object.assign({done:done,detail:detail},obj);
    });
  };

  L.lockReasonForAutomation=function(){ return "Generic generators have been replaced by stage production."; };
  L.buyAutomation=function(){ return false; };

  L.sourceCanRun=function(item){
    const consume=((item.effects||{}).consume)||{};
    return Object.entries(consume).every(function(entry){ return (state.game.run.resources[entry[0]]||0)>0 || state.ui.debug; });
  };

  L.lockReasonForTech=function(item){
    if(!L.lineageRequirementMet(item)) return L.lineageRequirementText(item);
    if(!L.pathRequirementMet(item)) return L.pathRequirementText(item);
    const missing=(item.prereq||[]).filter(function(id){ return !L.requirementMet(id); });
    if(missing.length) return "Needs "+missing.join(", ");
    if(!L.canAfford(L.discountedCost(item.cost))) return "Need "+L.bundleText(L.discountedCost(item.cost));
    return "";
  };
  L.buyTech=function(techId){
    const item=(L.currentStage().technologies||[]).find(function(tech){ return tech.id===techId; });
    if(!item || state.game.run.technologies[item.id]) return false;
    if(!L.lineageRequirementMet(item) && !state.ui.debug) return false;
    if(!L.pathRequirementMet(item) && !state.ui.debug) return false;
    if(!L.prereqsMet(item) && !state.ui.debug) return false;
    const cost=L.discountedCost(item.cost);
    if(!L.canAfford(cost)) return false;
    L.spend(cost);
    state.game.run.technologies[item.id]=true;
    if(L.currentStage().id==="galactic" && item.id==="ascension_protocols" && state.game.run.congressChoice){
      const proposal=L.currentCongressProposal();
      if(proposal && proposal.bloc){
        state.game.meta.congressInstitutionLevels[proposal.bloc]=(state.game.meta.congressInstitutionLevels[proposal.bloc]||0)+1+(L.enlightenmentUpgradeLevel("institutional_memory")>0?1:0);
      }
    }
    L.markSeenContent("tech",item);
    L.addCapacity((item.effects||{}).capacity);
    L.pushLog("Researched "+item.name);
    return true;
  };
  L.purchaseWeight=function(cost){
    return Object.values(cost||{}).reduce(function(sum,value){ return sum+(value||0); },0);
  };
  L.stageAdvanceRequirement=function(stageId){
    const ownedStage=L.ownedSystemsForStage();
    const techStage=L.ownedTechForStage();
    if(stageId==="cell") return {met:!!state.game.run.ownedSystems.nucleus && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=8,text:"Need Nucleus and 8 organelles"};
    if(stageId==="creature") return {met:!!state.game.run.ownedSystems.den_network && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=6,text:"Need Den Network and a stable species body plan"};
    if(stageId==="tribal") return {met:!!state.game.run.ownedSystems.village_center && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=10 && techStage.length>=3,text:"Need Village Center, 10 tribal structures, and 3 supporting techs"};
    if(stageId==="civilization") return {met:!!state.game.run.ownedSystems.city_center && !!state.game.run.technologies.code_of_laws && techStage.length>=4 && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=6,text:"Need a City Center, Code of Laws, 4 techs, and a functioning civic economy"};
    if(stageId==="empire") return {met:!!state.game.run.ownedSystems.provincial_admin && !!state.game.run.ownedSystems.rail_hub && !!state.game.run.ownedSystems.general_staff && techStage.length>=3 && ownedStage.reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)>=7,text:"Need Provincial Administration, Rail Hub, General Staff, and broad imperial infrastructure"};
    if(stageId==="solar") return {met:!!L.currentFTLMethodId() && !!state.game.run.ownedSystems.shipyard_ring && techStage.length>=3,text:"Need a tested FTL method, a Shipyard Ring, and mature orbital research"};
    if(stageId==="galactic") return {met:!!state.game.run.ascensionPath && !!state.game.run.technologies.ascension_protocols && L.ascensionObjectives().length>0 && L.ascensionObjectives().every(function(obj){ return obj.done; }),text:"Need a chosen ascension, Ascension Protocols, and every path objective complete"};
    return {met:true,text:""};
  };

  L.availableSpecializations=function(){ return L.hasLockedLineage()?DATA.SPECIALIZATIONS[state.game.run.lockedArchetype]||[]:[]; };
  L.chooseSpecialization=function(id){
    if(!L.hasLockedLineage() || state.game.run.specialization) return false;
    const found=L.availableSpecializations().find(function(item){ return item.id===id; });
    if(!found) return false;
    state.game.run.specialization=id;
    state.game.meta.seenSpecializations[state.game.run.lockedArchetype+":"+id]=true;
    L.pushLog("Specialization chosen: "+found.name);
    return true;
  };
  L.availableLineageEvents=function(){
    const arch=state.game.run.lockedArchetype, stageIndex=state.game.run.stageIndex;
    if(!arch) return [];
    return DATA.LINEAGE_EVENTS.filter(function(event){
      const eventStage=DATA.STAGES.findIndex(function(stage){ return stage.id===event.stage; });
      const chainOk=!event.afterEvent || state.game.run.lineageEvents[event.afterEvent]===event.afterChoice;
      return event.archetype===arch && eventStage>=0 && stageIndex>=eventStage && chainOk;
    });
  };
  L.chooseLineageEvent=function(eventId,choiceId){
    const events=state.game.run.lineageEvents||(state.game.run.lineageEvents={});
    if(events[eventId]) return false;
    const event=L.availableLineageEvents().find(function(item){ return item.id===eventId; });
    if(!event) return false;
    const choice=(event.choices||[]).find(function(item){ return item.id===choiceId; });
    if(!choice) return false;
    events[eventId]=choiceId;
    state.game.meta.seenEvents[eventId+":"+choiceId]=true;
    L.pushLog("Lineage event: "+event.name+" - "+choice.name);
    return true;
  };

  L.stageGoals=function(){
    const stage=L.currentStage(), output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    return DATA.STAGE_GOALS.map(function(goal){
      let done=false, detail="";
      if(goal.id==="starter_path"){
        const starterIds=["membrane_pump","ribosome","vacuole"];
        const owned=starterIds.filter(function(id){ return !!state.game.run.ownedSystems[id]; }).length;
        done=stage.id!=="cell" || owned>=starterIds.length;
        detail=stage.id==="cell"?(owned+" / "+starterIds.length+" starter organelles"):("Completed in Cell");
      }
      if(goal.id==="score_half"){ done=L.currentScore()>=stage.scoreTarget*0.5; detail=L.fmt(L.currentScore())+" / "+L.fmt(stage.scoreTarget*0.5); }
      if(goal.id==="systems_depth"){ done=L.ownedSystemsForStage().length>=8; detail=L.ownedSystemsForStage().length+" / 8 systems"; }
      if(goal.id==="tech_depth"){ done=stage.id==="cell" || L.ownedTechForStage().length>=4; detail=stage.id==="cell"?"Cell uses organelles":L.ownedTechForStage().length+" / 4 techs"; }
      if(goal.id==="stable_growth"){
        const foodNet=(output.food||0)-(upkeep.food||0), waterNet=(output.water||0)-(upkeep.water||0), happinessNet=(output.happiness||0)-(upkeep.happiness||0), energyNet=(output.energy||0)-(upkeep.energy||0);
        if(stage.id==="cell"){
          done=false;
          detail="Activates from Creature onward";
        } else if(stage.id==="creature"){
          done=state.game.run.population>=18 && foodNet>=0 && waterNet>=0;
          detail="Pop "+L.fmt(state.game.run.population)+" | Food "+L.fmt(foodNet)+"/s | Water "+L.fmt(waterNet)+"/s";
        } else if(["tribal","civilization"].includes(stage.id)){
          done=state.game.run.population>=25 && foodNet>=0 && waterNet>=0;
          detail="Pop "+L.fmt(state.game.run.population)+" | Food "+L.fmt(foodNet)+"/s | Water "+L.fmt(waterNet)+"/s";
        } else if(stage.id==="empire"){
          done=state.game.run.population>=25 && foodNet>=0 && happinessNet>=0;
          detail="Pop "+L.fmt(state.game.run.population)+" | Food "+L.fmt(foodNet)+"/s | Happiness "+L.fmt(happinessNet)+"/s";
        } else if(stage.id==="solar"){
          done=state.game.run.population>=25 && foodNet>=0 && energyNet>=0;
          detail="Pop "+L.fmt(state.game.run.population)+" | Food "+L.fmt(foodNet)+"/s | Energy "+L.fmt(energyNet)+"/s";
        } else {
          done=state.game.run.population>=25 && energyNet>=0 && happinessNet>=0;
          detail="Pop "+L.fmt(state.game.run.population)+" | Energy "+L.fmt(energyNet)+"/s | Happiness "+L.fmt(happinessNet)+"/s";
        }
      }
      return Object.assign({},goal,{done:done,detail:detail,claimed:!!state.game.run.claimedGoals[L.goalKey(goal)]});
    });
  };
  L.visibleStageGoals=function(){
    const goals=L.stageGoals();
    if(L.currentStage().id==="cell") return goals.filter(function(goal){ return ["starter_path","score_half"].includes(goal.id); });
    if(L.currentStage().id==="creature") return goals.filter(function(goal){ return ["score_half","stable_growth"].includes(goal.id); });
    if(L.currentStage().id==="tribal") return goals.filter(function(goal){ return goal.id!=="starter_path"; });
    if(L.currentStage().id==="civilization") return goals.filter(function(goal){ return ["score_half","systems_depth","tech_depth"].includes(goal.id); });
    if(L.currentStage().id==="empire"){
      const surface=L.stageSurfaceLevel("empire");
      const ids=surface===0?["systems_depth"]:(surface===1?["systems_depth","tech_depth"]:["systems_depth","tech_depth","stable_growth"]);
      return goals.filter(function(goal){ return ids.includes(goal.id); });
    }
    if(L.currentStage().id==="solar"){
      const surface=L.stageSurfaceLevel("solar");
      const ids=surface===0?["score_half"]:(surface===1?["score_half","tech_depth"]:["tech_depth","stable_growth"]);
      return goals.filter(function(goal){ return ids.includes(goal.id); });
    }
    if(L.currentStage().id==="galactic"){
      if(!state.game.run.ownedSystems.sector_network) return goals.filter(function(goal){ return ["score_half"].includes(goal.id); });
      if(!state.game.run.ascensionPath) return goals.filter(function(goal){ return ["score_half","systems_depth"].includes(goal.id); });
      if(!state.game.run.technologies.ascension_protocols) return goals.filter(function(goal){ return ["systems_depth","tech_depth"].includes(goal.id); });
      return goals.filter(function(goal){ return ["tech_depth","stable_growth"].includes(goal.id); });
    }
    return goals.filter(function(goal){ return goal.id!=="starter_path"; });
  };
  L.cellStarterSequence=function(){
    return [
      {id:"membrane_pump",name:"Membrane Pump",why:"Start glucose flow and unlock the first stable intake loop."},
      {id:"ribosome",name:"Ribosome",why:"Opens protein assembly so the cell can diversify beyond raw ATP clicks."},
      {id:"vacuole",name:"Vacuole",why:"Adds storage and balance, letting the stage breathe before advanced organelles."}
    ];
  };
  L.creatureStarterSequence=function(){
    return [
      {id:"thinking_cluster",name:"Thinking",why:"The first body needs pattern recognition before it can organize territory or identity."},
      {id:"den_network",name:"Den Network",why:"A stable nest structure turns survival into a species-scale loop and opens the real Creature gate."}
    ];
  };
  L.tribalStarterSequence=function(){
    return [
      {id:"village_center",name:"Village Center",why:"This is the first real settlement anchor. Tribal does not exist yet until this is built."},
      {id:"sawmill",name:"Sawmill",why:"Lumber is the first throughput multiplier and the point where Tribal starts acting like infrastructure instead of raw gathering."},
      {id:"workshop",name:"Workshop",why:"Science and military preparation begin here, which gives the stage a real shape beyond subsistence."}
    ];
  };
  L.civilizationStarterSequence=function(){
    return [
      {id:"city_center",name:"City Center",why:"Urban identity is the stage hinge. Civilization should start by becoming a city, not just a larger tribe."},
      {id:"market",name:"Market",why:"Gold and luxury flow make the city economy feel real instead of purely productive."},
      {id:"library",name:"Library",why:"Science and culture need an institutional anchor before law and military branching matter."}
    ];
  };
  L.empireStarterSequence=function(){
    return [
      {id:"provincial_admin",name:"Provincial Administration",why:"Empire begins the moment regions can be governed as a whole instead of as oversized cities."},
      {id:"rail_hub",name:"Rail Hub",why:"Logistics is the first proof that the empire can move what it makes instead of hoarding local surpluses."},
      {id:"general_staff",name:"General Staff",why:"Doctrine and command turn scale into power instead of waste."}
    ];
  };
  L.solarStarterSequence=function(){
    return [
      {id:"planetary_colony",name:"Planetary Colony",why:"Solar starts when the civilization truly leaves one world behind and builds a second anchor."},
      {id:"solar_array",name:"Solar Array",why:"Energy must harden before every orbital dream turns into maintenance debt."},
      {id:"shipyard_ring",name:"Shipyard Ring",why:"A real spacefaring stage needs an industrial launch spine, not just better planets."}
    ];
  };
  L.galacticStarterSequence=function(){
    return [
      {id:"sector_network",name:"Sector Network",why:"Galactic only exists when distant systems can be ruled as one lattice instead of isolated stars."},
      {id:"quantum_archive",name:"Quantum Archive",why:"Memory, data, and identity become strategic here; the galaxy needs a thesis, not just expansion."},
      {id:"gateway_spine",name:"Gateway Spine",why:"Interstellar movement must become deliberate and reliable before ascension is believable."},
      {id:"ascension_protocol",name:"Ascension Protocol",why:"This is the first committed ending move. Galactic should culminate in a chosen future, not idle abundance."}
    ];
  };
  L.stageOnboardingBeat=function(){
    const stage=L.currentStage();
    if(stage.id==="cell"){
      const sequence=L.cellStarterSequence();
      const next=sequence.find(function(item){ return !state.game.run.ownedSystems[item.id]; });
      return {
        title:"Seed the first cell",
        summary:"Build the first three organelles in order, then pivot into the wider organelle field.",
        cards: next ? [
          {title:"Next organelle",detail:next.name+" is the clearest next purchase. "+next.why,kind:"guide"},
          {title:"Current loop",detail:"Click ATP when needed, then spend it to make passive intake take over.",kind:"loop"}
        ] : [
          {title:"Stage milestone reached",detail:"Starter Path is complete. The first cell shell is now stable enough to support deeper specialization.",kind:"milestone"},
          {title:"Starter shell complete",detail:"The first cell body is stable. Now pick organelles that shape future lineage pressure.",kind:"progress"},
          {title:"Next gate",detail:"Push toward Nucleus and eight organelles so the stage can break open cleanly.",kind:"gate"}
        ]
      };
    }
    if(stage.id==="creature"){
      const earlyCreature=L.ownedSystemsForStage().length<=1 && L.currentScore()<stage.scoreTarget*0.3;
      const creatureNext=L.creatureStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
      return {
        title:earlyCreature?"The first body stirs":"A body becomes a species",
        summary:earlyCreature?"The old cell has crossed a threshold. Survival is physical now, and the run finally feels alive.":"Creature is where survival pressure becomes ecology. Food and water matter now, and the lineage will lock after this stage.",
        cards:(earlyCreature?[
          {title:"Metamorphosis",detail:"A single cell just turned into a body plan. Take a moment to stabilize the basics before specializing the species.",kind:"progress"},
        ]:[]).concat([
          {title:"Immediate pressure",detail:"Keep food and water non-negative. If either stays empty too long, the run collapses.",kind:"warning"},
          {title:"Stage identity",detail:(creatureNext?("Build "+creatureNext.name+" next. "):"Keep deepening the body plan. ")+(creatureNext?creatureNext.why:"Push Thinking and Den Network together so the species feels distinct before Tribal begins."),kind:"guide"}
        ])
      };
    }
    if(stage.id==="tribal"){
      const next=L.tribalStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
      return {
        title:"Settlement changes the loop",
        summary:"Tribal is the first stage where repeated buildings really matter and raw gathering starts to give way to infrastructure.",
        cards:[
          {title:"First priority",detail:(next?("Build "+next.name+" next. "):"Keep the settlement spine growing. ")+(next?next.why:"Once the first settlement spine is online, use buildings and units to define the tribe."),kind:"guide"},
          {title:"What matters long-term",detail:"Science, happiness, and military all begin competing here, so the first layout choices have more identity.",kind:"choice"}
        ]
      };
    }
    if(stage.id==="civilization"){
      const next=L.civilizationStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
      return {
        title:"The village learns to govern",
        summary:"Civilization is where production stops being enough by itself. Cities, law, and institutions now decide whether the economy feels coherent.",
        cards:[
          {title:"First city beat",detail:(next?("Build "+next.name+" next. "):"Market and Library should define the first city shell. ")+(next?next.why:"Once those are online, law and military can branch from a stable civic core."),kind:"guide"},
          {title:"Stage gate",detail:"Code of Laws is the hinge. Civilization should end with a real civic identity, not just a larger settlement.",kind:"choice"}
        ]
      };
    }
    if(stage.id==="empire"){
      const next=L.empireStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
      return {
        title:"Scale creates friction",
        summary:"Empire is about making your regions talk to each other. Production alone is not enough; logistics, administration, and doctrine must all harden together.",
        cards:[
          {title:"Build the spine",detail:(next?("Build "+next.name+" next. "):"The imperial spine is online. ")+(next?next.why:"Now you can widen into medicine, communications, and regional identity without the stage collapsing into clutter."),kind:"guide"},
          {title:"Main pressure",detail:"If happiness or logistics sag while industry rises, the stage starts looking rich on paper and weak in practice.",kind:"warning"}
        ]
      };
    }
    if(stage.id==="solar"){
      const next=L.solarStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
      return {
        title:"One world is no longer enough",
        summary:"Solar is the first truly spatial stage. Energy, alloys, and colonies have to grow together, then all of it has to culminate in a tested FTL leap.",
        cards:[
          {title:"Orbit before ambition",detail:(next?("Build "+next.name+" next. "):"The orbital backbone is online. ")+(next?next.why:"Now the stage can widen into deeper colonies, orbital industry, and diplomacy without losing its launch identity."),kind:"guide"},
          {title:"Defining project",detail:"The FTL Research Array is the stage's story beat. Treat it like the run's turning point, not a side errand.",kind:"project"}
        ]
      };
    }
    if(stage.id==="galactic"){
      const done=L.ascensionObjectives().filter(function(obj){ return obj.done; }).length;
      const next=L.galacticStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
      return {
        title:"Choose what the civilization becomes",
        summary:"Galactic is not only bigger Solar. It is the stage where raw output must crystallize into an ascension philosophy and survive rival pressure long enough to finish it.",
        cards:[
          {title:"Commit the ending",detail:next?("Build "+next.name+" next. "+next.why):(state.game.run.ascensionPath?"You are on the "+(((DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===state.game.run.ascensionPath; })||{}).name||"chosen")+" path. Complete all three path objectives to finish the ascension cleanly.":"Pick an ascension path early so every later build has a real destination."),kind:"choice"},
          {title:"Objective pressure",detail:state.game.run.ascensionPath?(done+" / "+L.ascensionObjectives().length+" ascension objectives complete. Rivals, cohesion, and tension all matter more than another generic score spike now."):("Choose a path to reveal the final objective set. Galactic should end with a thesis, not a blur of numbers."),kind:"warning"}
        ]
      };
    }
    return null;
  };
  L.claimStageGoal=function(goalId){
    const goal=L.stageGoals().find(function(item){ return item.id===goalId; });
    if(!goal || !goal.done || goal.claimed) return false;
    state.game.run.claimedGoals[L.goalKey(goal)]=true;
    const totalReward=goal.reward+L.goalRewardBonus();
    state.game.meta.evolutionPoints+=totalReward;
    L.pushLog("Stage goal claimed: "+goal.name+" +"+totalReward+" EP");
    return true;
  };

  L.automationOutputPerSecond=function(){
    const out=State.emptyResources(), popScale=L.populationScaleMultiplier();
    L.activeEffectSources().forEach(function(item){
      if(!L.sourceCanRun(item)) return;
      const quantity=item.effectiveCount||1;
      Object.entries((item.effects||{}).perSecond||{}).forEach(function(entry){ out[entry[0]]=(out[entry[0]]||0)+entry[1]*quantity*L.automationMultiplier()*popScale*L.resourceOutputMultiplier(entry[0]); });
    });
    if(L.divinityUnlocked()){
      const pop=Math.max(0,state.game.run.population||0);
      const faith=state.game.run.resources.faith||0;
      const happiness=state.game.run.resources.happiness||0;
      const cohesion=state.game.run.resources.cohesion||0;
      const military=state.game.run.resources.military_power||0;
      const command=state.game.run.resources.command||0;
      const production=state.game.run.resources.production||0;
      const gold=state.game.run.resources.gold||0;
      const science=state.game.run.resources.science||0;
      const data=state.game.run.resources.data||0;
      const ascension=state.game.run.resources.ascension||0;
      const unity=state.game.run.resources.unity||0;
      const baseFollowers=pop*0.0012;
      const baseFaith=faith*0.004;
      const totalPrayer=baseFollowers + baseFaith;
      const routing=L.prayerRouting();
      out.divinity_growth += totalPrayer*(routing.growth/100) + (state.game.run.resources.food||0)*0.0004 + (state.game.run.resources.water||0)*0.0003;
      out.divinity_harmony += totalPrayer*(routing.harmony/100) + happiness*0.0004 + cohesion*0.0005;
      out.divinity_conquest += totalPrayer*(routing.conquest/100) + military*0.0005 + command*0.00045;
      out.divinity_wealth += totalPrayer*(routing.wealth/100) + production*0.0004 + gold*0.00035 + (state.game.run.resources.alloys||0)*0.00025;
      out.divinity_knowledge += totalPrayer*(routing.knowledge/100) + science*0.00045 + data*0.00045;
      out.divinity_transcendence += totalPrayer*(routing.transcendence/100) + unity*0.0005 + ascension*0.0007;
    }
    return out;
  };

  L.resourceUpkeepPerSecond=function(){
    const upkeep=State.emptyResources(), stage=L.currentStage(), pop=Math.max(0,state.game.run.population);
    L.activeEffectSources().forEach(function(item){
      const hasOutput=Object.keys((item.effects||{}).perSecond||{}).length>0;
      if(hasOutput && !L.sourceCanRun(item)) return;
      const quantity=item.effectiveCount||1;
      Object.entries((item.effects||{}).consume||{}).forEach(function(entry){ upkeep[entry[0]]=(upkeep[entry[0]]||0)+entry[1]*quantity; });
    });
    if(stage.id==="cell"){
      const systemCount=L.ownedSystemsForStage().length;
      upkeep.atp += Math.max(0,systemCount*(0.055+L.sumScalarEffect("upkeepBonus")));
    }
    if(["creature","tribal","civilization","solar"].includes(stage.id)){
      upkeep.food += pop*0.006;
      upkeep.water += pop*0.004;
    }
    if(["empire","galactic"].includes(stage.id)){
      upkeep.food += pop*0.0045;
    }
    if(["tribal","civilization","empire","solar","galactic"].includes(stage.id)){
      upkeep.happiness += Math.max(0,pop-20)*0.0015;
    }
    return upkeep;
  };

  L.tick=function(dt){
    if(!state.running) return;
    L.refreshPrestigeUnlocks();
    if(state.ui.betweenRuns){
      L.runTranscendenceAutomation();
      return;
    }
    L.ensureWorldState();
    state.game.run.time += dt;
    L.invalidateEffectSourceCache();
    if(L.futureLayerState("apotheosis").unlocked || state.ui.debug){
      state.game.run.miracleChargeProgress=(state.game.run.miracleChargeProgress||0)+dt*(1+L.futureLayerUpgradeLevel("apotheosis","miracle_reservoir")*0.35);
      while((state.game.run.miracleCharges||0)<L.maxMiracleCharges() && state.game.run.miracleChargeProgress>=240){
        state.game.run.miracleChargeProgress-=240;
        state.game.run.miracleCharges=(state.game.run.miracleCharges||0)+1;
      }
      state.game.run.miracleCharges=Math.min(L.maxMiracleCharges(),state.game.run.miracleCharges||0);
    }
    Object.keys(state.game.run.ritualCooldowns||{}).forEach(function(id){
      state.game.run.ritualCooldowns[id]=Math.max(0,(state.game.run.ritualCooldowns[id]||0)-dt);
    });
    state.game.run.ritualSurges=(state.game.run.ritualSurges||[]).map(function(item){
      return Object.assign({},item,{remaining:(item.remaining||0)-dt});
    }).filter(function(item){ return item.remaining>0; });
    (state.game.run.rivals||[]).forEach(function(rival){
      if(rival.victory) return;
      if(rival.score>=(85-(L.upgradeLevel("rival_scan")||0)*2) && !rival.pressureNoted){
        rival.pressureNoted=true;
        L.noteRivalStudy(rival.archetype);
      }
      let phaseFactor=1;
      if(L.currentStage().id==="galactic"){
        phaseFactor=!state.game.run.ascensionPath?0.72:(!state.game.run.technologies.ascension_protocols?1.05:1.18);
      }
      rival.score+=rival.trend*L.rivalTrendMultiplier()*dt*(1+state.game.run.stageIndex*0.2)*phaseFactor;
      if(rival.score>=100){
        rival.score=100;
        rival.victory=true;
        L.noteRivalVictory(rival);
        L.pushLog("A rival lineage has reached victory pressure: "+L.displayArchetypeName(rival.archetype)+".");
      }
    });
    const project=L.specialProjectDef();
    if(project && state.game.run.specialProject){
      state.game.run.specialProject.progress=Math.min(project.duration,state.game.run.specialProject.progress+dt*L.projectSpeedMultiplier());
      if(state.game.run.specialProject.progress>=project.duration){
        if(project.choices || project.scarRecovery || project.recoverArtifact){
          state.game.run.pendingProjectChoice={id:project.id};
          L.pushLog("Special project awaits completion choice: "+project.name);
        } else {
          state.game.meta.completedProjects[project.id]=true;
          if(project.targetArchetype) L.completeRivalCounterProject(project);
          L.pushLog("Special project completed: "+project.name);
        }
        state.game.run.specialProject=null;
      }
    }
    L.runEnlightenmentAutopilot(dt);
    L.runTranscendenceAutomation();
    L.runScriptAutomation(dt);
    const maintenance=L.wonderMaintenanceCost();
    if(maintenance){
      state.game.run.wonderMaintenanceTimer+=dt;
      if(state.game.run.wonderMaintenanceTimer>=90){
        state.game.run.wonderMaintenanceTimer=0;
        L.maintainWonders();
      }
    } else state.game.run.wonderMaintenanceTimer=0;
    L.runMetaAutomation(dt);
    const perSecond=L.automationOutputPerSecond();
    const divinityGenerated=L.divinityChannelIds().reduce(function(sum,id){ return sum+(perSecond[id]||0); },0)*dt;
    if(divinityGenerated>0) state.game.run.divinityGeneratedTotal=(state.game.run.divinityGeneratedTotal||0)+divinityGenerated;
    L.gain(perSecond,dt);
    if(L.futureLayerState("enlightenment").unlocked || state.ui.debug) L.updateForesightLedger();
    if(L.divinityUnlocked() && L.divinityTotals().value>0) L.unlockStoryEntry("divinity_flows");
    const midpointStoryMap={cell:"cell_midpoint",creature:"creature_midpoint",tribal:"tribal_midpoint",civilization:"civilization_midpoint",empire:"empire_midpoint",solar:"solar_midpoint",galactic:"galactic_midpoint"};
    const midpointId=midpointStoryMap[L.currentStage().id];
    if(midpointId && L.currentScore()>=L.currentStage().scoreTarget*0.5) L.unlockStoryEntry(midpointId);
    const upkeep=L.resourceUpkeepPerSecond();
    Object.entries(upkeep).forEach(function(entry){ state.game.run.resources[entry[0]]=Math.max(0,(state.game.run.resources[entry[0]]||0)-entry[1]*dt); });
    if(L.currentStage().id!=="cell"){
      const survivalKeys=L.survivalFailureResources();
      survivalKeys.forEach(function(key){
        const empty=(state.game.run.resources[key]||0)<=0;
        state.game.run.resourceFailures[key]=empty?((state.game.run.resourceFailures[key]||0)+dt):0;
      });
      ["food","water"].filter(function(key){ return !survivalKeys.includes(key); }).forEach(function(key){ state.game.run.resourceFailures[key]=0; });
      const woodDry=((upkeep.wood||0)>(L.automationOutputPerSecond().wood||0)) && (state.game.run.resources.wood||0)<=0;
      state.game.run.resourceFailures.wood=woodDry?((state.game.run.resourceFailures.wood||0)+dt):0;
      const failedKey=survivalKeys.find(function(key){ return (state.game.run.resourceFailures[key]||0)>=L.shortageGraceSeconds(); });
      if(failedKey){
        state.game.meta.lastRunReview=L.buildRunReview("Collapse",0,{failure:"Starvation",failureResource:failedKey});
        state.ui.betweenRuns=true;
        state.ui.betweenRunsStep="review";
        state.game.run=State.createRun(state.game.meta);
        L.autoApplySeedTemplate(L.frontierStage().id);
        state.game.run.log.push("Run collapsed due to prolonged shortage.");
        return;
      }
    }
    const popGain=L.sumScalarEffect("populationGrowth")*dt*Math.max(0.4,L.populationScaleMultiplier());
    const survivalKeys=L.survivalFailureResources();
    const hasGrowthInputs=survivalKeys.every(function(key){ return (state.game.run.resources[key]||0)>0; });
    if(popGain>0 && (survivalKeys.length===0 || hasGrowthInputs)) state.game.run.population+=popGain;
    if(L.currentStage().id==="cell") state.game.run.population+=0.0006*dt*L.ownedSystemsForStage().length;
  };

  L.autoBuyOrganelles=function(){
    if(L.currentStage().id!=="cell") return false;
    if(state.game.meta.automationSettings && state.game.meta.automationSettings.organellesEnabled===false) return false;
    const target=state.game.meta.autoOrganelleTarget;
    const choices=(L.currentStage().systems||[]).filter(function(item){ return !state.game.run.ownedSystems[item.id] && !L.lockReasonForSystem(item); });
    const picked=choices.sort(function(a,b){ return (L.itemAffinity(b)[target]||0)-(L.itemAffinity(a)[target]||0); })[0]||choices[0];
    return picked?L.buySystem(picked.id):false;
  };
  L.autoBuyInfrastructure=function(){
    if(L.currentStage().id==="cell") return false;
    if(state.game.meta.automationSettings && state.game.meta.automationSettings.infrastructureEnabled===false) return false;
    const choices=(L.currentStage().systems||[]).filter(function(item){
      return !state.game.run.ownedSystems[item.id] && Object.keys((item.effects||{}).perSecond||{}).length>0 && !L.lockReasonForSystem(item);
    });
    if(!choices.length) return false;
    const resources=L.currentStage().resources;
    const policy=state.game.run.automationPolicy||"balanced", lineage=state.game.run.lockedArchetype;
    function policyScore(item){
      const effects=item.effects||{}, per=effects.perSecond||{}, output=effects.resourceOutput||{};
      if(policy==="food") return (per.food||0)*4+(per.water||0)*3+(output.food||0)+(output.water||0);
      if(policy==="science") return (per.science||0)*4+(per.data||0)*3+(output.science||0)+(output.data||0);
      if(policy==="low_pollution") return -((per.pollution||0)*6+((effects.consume||{}).pollution||0)*4+(output.pollution||0)*2);
      if(policy==="lineage") return (item.archetypeReq===lineage?8:0)+((L.itemAffinity(item)[lineage]||0)*2);
      return 0;
    }
    const picked=choices.sort(function(a,b){
      const score=(policyScore(b)+L.templatePriorityScore(b,"system"))-(policyScore(a)+L.templatePriorityScore(a,"system"));
      if(score) return score;
      const aOut=Object.keys((a.effects||{}).perSecond||{})[0]||resources[0];
      const bOut=Object.keys((b.effects||{}).perSecond||{})[0]||resources[0];
      const aRatio=(state.game.run.resources[aOut]||0)/Math.max(1,L.capacityFor(aOut));
      const bRatio=(state.game.run.resources[bOut]||0)/Math.max(1,L.capacityFor(bOut));
      return aRatio-bRatio || resources.indexOf(aOut)-resources.indexOf(bOut);
    })[0];
    return picked?L.buySystem(picked.id):false;
  };
  L.runMetaAutomation=function(dt){
    const timers=state.game.run.autoTimers||(state.game.run.autoTimers={organelles:0,infrastructure:0,generators:0});
    if(timers.infrastructure==null) timers.infrastructure=timers.generators||0;
    if(timers.template==null) timers.template=0;
    const organelleLevel=L.upgradeLevel("auto_organelles"), generatorLevel=L.upgradeLevel("auto_generators");
    if(organelleLevel>0 && L.currentStage().id==="cell" && (!state.game.meta.automationSettings || state.game.meta.automationSettings.organellesEnabled!==false)){
      timers.organelles += dt;
      const interval=Math.max(2,11-organelleLevel);
      if(timers.organelles>=interval){ timers.organelles=0; L.autoBuyOrganelles(); }
    }
    if(generatorLevel>0 && (!state.game.meta.automationSettings || state.game.meta.automationSettings.infrastructureEnabled!==false)){
      timers.infrastructure += dt;
      const interval=Math.max(2,12-generatorLevel);
      if(timers.infrastructure>=interval){ timers.infrastructure=0; L.autoBuyInfrastructure(); }
    }
  };

  L.currentScore=function(){
    const stage=L.currentStage();
    const scoreWeights={
      cell:{resource:5.2,population:5.5,systems:0,techs:0},
      creature:{resource:5.8,population:6.2,systems:0,techs:0},
      tribal:{resource:6.6,population:7.1,systems:0,techs:0}
    };
    const weights=scoreWeights[stage.id]||{resource:7,population:8,systems:0,techs:0};
    let score=0;
    stage.resources.forEach(function(key){ score+=Math.sqrt(Math.max(0,state.game.run.resources[key]||0))*weights.resource; });
    score+=Math.sqrt(Math.max(1,state.game.run.population))*weights.population;
    score+=L.ownedSystemsForStage().reduce(function(sum,item){ return sum+(item.ownedCount||1); },0)*weights.systems;
    score+=L.ownedTechForStage().length*weights.techs;
    score+=L.sumScalarEffect("score");
    return Math.round(score);
  };
  L.canEvolve=function(){
    if(state.ui.debug) return true;
    if(state.ui.betweenRuns || L.currentScore()<L.currentStage().scoreTarget) return false;
    if(!L.stageAdvanceRequirement(L.currentStage().id).met) return false;
    if(L.currentStage().id==="galactic" && !state.game.run.ascensionPath) return false;
    return true;
  };
  L.buildRunReview=function(kind,epAward,extra){
    const stage=L.currentStage(), output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    const topResources=stage.resources.map(function(id){ return {id:id,net:(output[id]||0)-(upkeep[id]||0),value:state.game.run.resources[id]||0}; }).sort(function(a,b){ return b.net-a.net; }).slice(0,4);
    const topSystems=L.ownedSystemsForStage().slice().sort(function(a,b){
      const aPer=Object.values((a.effects||{}).perSecond||{}).reduce(function(sum,value){ return sum+value; },0);
      const bPer=Object.values((b.effects||{}).perSecond||{}).reduce(function(sum,value){ return sum+value; },0);
      return bPer-aPer;
    }).slice(0,5).map(function(item){ return item.name; });
    const rivalWins=(state.game.run.rivals||[]).filter(function(rival){ return rival.victory; }).length;
    const alerts=L.pressureAlerts().map(function(alert){ return alert.title; });
    const crisisResponses=Object.entries(state.game.run.worldEventChoices[stage.id]||{}).map(function(entry){
      const eventId=(state.game.run.worldEvents[stage.id]||{})[entry[0]], event=L.worldEventDef(eventId);
      if(!event || (event.kind!=="crisis" && event.kind!=="disaster")) return null;
      const choice=(event.choices||[]).find(function(item){ return item.id===entry[1]; });
      return choice?{event:event.name,choice:choice.name,kind:event.kind}:null;
    }).filter(Boolean);
    const medals=(DATA.RUN_MEDALS||[]).filter(function(medal){
      if(medal.condition==="fast") return state.game.run.time<180;
      if(medal.condition==="no_rivals") return rivalWins===0 && stage.id==="galactic";
      if(medal.condition==="tension") return L.ascensionTension()>=55;
      if(medal.condition==="wonders") return Object.keys(state.game.run.mapWonders||{}).length>=2;
      if(medal.condition==="clean") return alerts.length===0;
      return false;
    }).map(function(medal){ return medal.id; });
    return Object.assign({
      kind:kind,
      stageId:stage.id,
      stage:stage.name,
      score:L.currentScore(),
      target:stage.scoreTarget,
      epAward:epAward||0,
      time:state.game.run.time,
      population:state.game.run.population,
      archetype:state.game.run.lockedArchetype||L.dominantArchetype(),
      specialization:state.game.run.specialization||"",
      ascensionPath:state.game.run.ascensionPath||"",
      ftlMethod:L.currentFTLMethodId(),
      legacyTier:state.game.meta.legacyTier,
      topResources:topResources,
      topSystems:topSystems,
      rivalWins:rivalWins,
      rivalsBeaten:(state.game.run.rivals||[]).filter(function(rival){ return !rival.victory; }).length,
      congress:state.game.run.congressChoice,
      wonders:Object.keys(state.game.run.mapWonders||{}).length,
      alerts:alerts,
      crisisResponses:crisisResponses,
      medals:medals,
      stageMastery:Object.assign({},state.game.meta.stageMastery||{}),
      date:Date.now()
    },extra||{});
  };
  L.createLineageChronicle=function(victoryName,review){
    const arch=review.archetype||"unknown", path=review.ascensionPath||"none";
    const count=(state.game.meta.archetypeWins[arch]||0);
    const openings=["The "+L.archetypeName(arch)+" lineage carried", "Archivists recorded", "Later descendants remembered", "The museum names"];
    const focus=review.rivalWins>0?"contested ascension":((review.medals||[]).includes("no_rival_victories")?"quiet supremacy":"deep continuity");
    const title=DATA.PATH_ENDING_TITLES[path]||"Transcendent";
    return {id:Date.now()+":"+arch+":"+path,name:title+" Chronicle "+count,text:openings[count%openings.length]+" "+victoryName+" as a "+focus+" shaped by "+(review.wonders||0)+" wonders and "+(review.rivalsBeaten||0)+" contained rivals.",archetype:arch,path:path,time:Date.now()};
  };
  L.recordEraLegacy=function(){
    const era=L.currentEra();
    if(!era) return false;
    const legacy=(DATA.ERA_LEGACIES||{})[era.id];
    if(!legacy || state.game.meta.eraLegacies[era.id]) return false;
    state.game.meta.eraLegacies[era.id]=true;
    L.pushLog("Era legacy recorded: "+legacy.name);
    return true;
  };
  L.evolve=function(){
    if(!L.canEvolve()) return false;
    const stage=L.currentStage(), archivedSystems=L.ownedSystemsForStage(), archivedAffinity={};
    archivedSystems.forEach(function(item){ L.addAffinity(archivedAffinity,L.itemAffinity(item)); });
    const evolvedArchetype=L.dominantArchetype();
    if(stage.id==="creature"){
      state.game.meta.revealedArchetypes[evolvedArchetype]=true;
      state.game.run.lockedArchetype=evolvedArchetype;
    }
    state.game.run.archive.push({stageId:stage.id,stageName:stage.name,systems:archivedSystems.map(function(item){ return item.name; }),traits:archivedSystems.flatMap(function(item){ return item.traits||[]; }),archetype:evolvedArchetype,affinity:archivedAffinity});
    state.game.meta.stageMastery[stage.id]=(state.game.meta.stageMastery[stage.id]||0)+1;
    const contract=(DATA.STAGE_CONTRACTS||[]).find(function(item){ return item.id===state.game.run.activeContract; });
    if(contract){
      state.game.meta.evolutionPoints+=contract.reward;
      state.game.meta.completedContracts[contract.id]=(state.game.meta.completedContracts[contract.id]||0)+1;
      L.pushLog("Stage contract completed: "+contract.name+" +"+contract.reward+" EP");
      state.game.run.activeContract="";
    }
    L.recordEraLegacy();
    L.recordThreatScars();
    L.tryAwardArtifact(stage.id);
    state.game.meta.stageClearCounts[stage.id]=(state.game.meta.stageClearCounts[stage.id]||0)+1;
    if(L.isFrontierStage() && !L.isFinalStage()){
      const oldFrontier=L.frontierStageIndex();
      const unlockedStage=DATA.STAGES[Math.min(DATA.STAGES.length-1,oldFrontier+1)];
      const reward=L.stageClearReward(stage.id);
      state.game.meta.evolutionPoints+=reward;
      state.game.meta.frontierStageIndex=Math.min(DATA.STAGES.length-1,oldFrontier+1);
      state.game.meta.lastRunReview=L.buildRunReview("Stage Clear",reward,{
        victoryName:stage.name+" cleared",
        frontierStage:stage.id,
        unlockedFrontier:unlockedStage?unlockedStage.name:"",
        unlocks:unlockedStage&&unlockedStage.id!==stage.id?[unlockedStage.name+" unlocked"]:[],
        nextFrontierReward:L.nextFrontierRewardPreview()
      });
      L.completeMasteryChallenges(stage.id,state.game.meta.lastRunReview);
      if((state.game.meta.futureLayers.enlightenment||{}).unlocked){
        const routeKey=L.currentRouteKey(), ledger=L.foresightLedger();
        if((state.game.meta.lastRunReview.alerts||[]).length===0) ledger.routeWins[routeKey]=(ledger.routeWins[routeKey]||0)+1;
      }
      if(stage.id==="cell") L.unlockStoryEntry("cell_mastered");
      if(stage.id==="creature") L.unlockStoryEntry("creature_mastered");
      if(stage.id==="tribal") L.unlockStoryEntry("tribal_mastered");
      state.game.run=State.createRun(state.game.meta);
      L.autoApplySeedTemplate(L.frontierStage().id);
      state.ui.betweenRuns=true;
      state.ui.betweenRunsStep="review";
      state.game.run.log.push(stage.name+" cleared. "+reward+" Evolution Points awarded."+(unlockedStage&&unlockedStage.id!==stage.id?(" "+unlockedStage.name+" is now part of the frontier."):""));
      return true;
    }
    if(state.game.run.stageIndex>=DATA.STAGES.length-1){
      const baseVictoryName=DATA.VICTORY_VARIANTS[state.game.run.lockedArchetype]||"Galactic Transcendence";
      const pathTitle=(DATA.PATH_ENDING_TITLES||{})[state.game.run.ascensionPath]||"Transcendent";
      const victoryName=pathTitle+" "+baseVictoryName;
      const arch=state.game.run.lockedArchetype||"unknown";
      const rivalWins=(state.game.run.rivals||[]).filter(function(rival){ return rival.victory; }).length;
      const objectiveAward=L.ascensionObjectives().filter(function(obj){ return obj.done; }).reduce(function(sum,obj){ return sum+(obj.reward||0); },0);
      const oldWins=state.game.meta.galacticWins, newWins=oldWins+1;
      const newlyUnlocked=(DATA.META_UNLOCKS||[]).filter(function(unlock){ return unlock.wins>oldWins && unlock.wins<=newWins; });
      const legacy=L.legacyTierDef(), baseEp=Math.max(10,25-rivalWins*3)+objectiveAward;
      const epAward=Math.max(1,Math.round(baseEp*(legacy?legacy.epMult||1:1)));
      const rivalEndings=(state.game.run.rivals||[]).filter(function(rival){ return rival.victory; }).map(function(rival){ return {archetype:rival.archetype,path:rival.path,name:L.rivalEndingName(rival),time:Date.now()}; });
      const challengesJustAwakened=oldWins===0;
      state.game.meta.galacticWins+=1;
      const genesisMastery=state.game.meta.genesisMastery||(state.game.meta.genesisMastery={cradleWins:{},awakenedSeeds:{},primeSeen:{},geographySeen:{}});
      const apotheosisMastery=state.game.meta.apotheosisMastery||(state.game.meta.apotheosisMastery={worshipWins:{},miraclesUsed:{},heresyOutcomes:{},lawsEnacted:{}});
      const divinityMastery=state.game.meta.divinityMastery||(state.game.meta.divinityMastery={maskWins:{},polarityWins:{},channelsUnlocked:{},routingRuns:0});
      const eternityMastery=state.game.meta.eternityMastery||(state.game.meta.eternityMastery={clausesSealed:{},canonKinds:{},weavesSealed:{},preservedUniverses:0,resets:0});
      if((state.game.meta.genesisChoices||{}).cradleWorld) genesisMastery.cradleWins[state.game.meta.genesisChoices.cradleWorld]=(genesisMastery.cradleWins[state.game.meta.genesisChoices.cradleWorld]||0)+1;
      if(state.game.meta.worshipMode) apotheosisMastery.worshipWins[state.game.meta.worshipMode]=(apotheosisMastery.worshipWins[state.game.meta.worshipMode]||0)+1;
      if(state.game.meta.divineMask) divinityMastery.maskWins[state.game.meta.divineMask]=(divinityMastery.maskWins[state.game.meta.divineMask]||0)+1;
      if(state.game.meta.prayerPolarity) divinityMastery.polarityWins[state.game.meta.prayerPolarity]=(divinityMastery.polarityWins[state.game.meta.prayerPolarity]||0)+1;
      if(state.game.meta.divinityPreset && (state.game.run.divinityGeneratedTotal||0)>=120) divinityMastery.routingRuns=(divinityMastery.routingRuns||0)+1;
      L.trackDivinityChannelUnlocks();
      (state.game.meta.testamentClauses||[]).forEach(function(id){ eternityMastery.clausesSealed[id]=true; });
      (state.game.meta.permanenceWeaves||[]).forEach(function(id){ eternityMastery.weavesSealed[id]=true; });
      (state.game.meta.canonEntries||[]).forEach(function(id){
        const entry=L.canonCandidates().find(function(item){ return item.id===id; });
        if(entry && entry.kind) eternityMastery.canonKinds[entry.kind]=true;
      });
      if((state.game.meta.futureLayers.enlightenment||{}).unlocked){
        const routeKey=L.currentRouteKey(), ledger=L.foresightLedger();
        ledger.routeWins[routeKey]=(ledger.routeWins[routeKey]||0)+1;
      }
      if(challengesJustAwakened) L.unlockStoryEntry("galactic_rebirth");
      state.game.meta.lastMilestoneWins=newWins;
      state.game.meta.archetypeWins[arch]=(state.game.meta.archetypeWins[arch]||0)+1;
      state.game.meta.lastRunReview=L.buildRunReview("Rebirth",epAward,{victoryName:victoryName,objectiveAward:objectiveAward,unlocks:newlyUnlocked.map(function(item){ return item.name; }).concat(challengesJustAwakened?["Evolution challenges awaken across all major stages"]:[])});
      L.completeMasteryChallenges(stage.id,state.game.meta.lastRunReview);
      L.refreshPrestigeUnlocks();
      if(L.futureLayerState("enlightenment").unlocked) L.unlockStoryEntry("evolution_complete");
      state.game.meta.lastRunReview.rivalEndings=rivalEndings;
      if(rivalEndings.length) state.game.meta.rivalEndings=rivalEndings.concat(state.game.meta.rivalEndings||[]).slice(0,30);
      state.game.meta.lineageChronicles.unshift(L.createLineageChronicle(victoryName,state.game.meta.lastRunReview));
      state.game.meta.lineageChronicles=state.game.meta.lineageChronicles.slice(0,40);
      state.game.meta.victoryLog.unshift({archetype:arch,name:victoryName,specialization:state.game.run.specialization||"",ascensionPath:state.game.run.ascensionPath||"",legacyTier:state.game.meta.legacyTier,objectives:L.ascensionObjectives().filter(function(obj){ return obj.done; }).map(function(obj){ return obj.id; }),rivalsBeaten:(state.game.run.rivals||[]).filter(function(rival){ return !rival.victory; }).length,rivalPressure:rivalWins,artifacts:Object.keys(state.game.meta.artifacts||{}),projects:Object.keys(state.game.meta.completedProjects||{}),unlocks:newlyUnlocked.map(function(item){ return item.name; }),time:Date.now()});
      state.game.meta.victoryLog=state.game.meta.victoryLog.slice(0,20);
      state.game.meta.evolutionPoints+=epAward;
      L.applyArtifactWear();
      ["lithoid","necroid","toxoid","extremophile"].forEach(function(id){ state.game.meta.unlockedRareArchetypes[id]=true; });
      state.game.run=State.createRun(state.game.meta);
      L.autoApplySeedTemplate(L.frontierStage().id);
      state.ui.betweenRuns=true;
      state.ui.betweenRunsStep="review";
      state.game.run.log.push(victoryName+" achieved. "+epAward+" Evolution Points awarded"+(legacy&&legacy.epMult!==1?(" with "+legacy.name+" x"+legacy.epMult):"")+(objectiveAward?(" including "+objectiveAward+" from path objectives"):"")+(newlyUnlocked.length?(". New unlocks: "+newlyUnlocked.map(function(item){ return item.name; }).join(", ")):"")+".");
      return true;
    }
    const nextStage=DATA.STAGES[state.game.run.stageIndex+1], carryResources={}, carryCaps={};
    (nextStage.carryResources||[]).forEach(function(resourceId){ carryResources[resourceId]=state.game.run.resources[resourceId]||0; carryCaps[resourceId]=state.game.run.capacities[resourceId]||25; });
    Object.entries(L.frontierKitBundle(nextStage.id)).forEach(function(entry){
      carryResources[entry[0]]=Math.max(carryResources[entry[0]]||0,entry[1]);
      carryCaps[entry[0]]=Math.max(carryCaps[entry[0]]||25,Math.round(entry[1]*2.5));
    });
    Object.entries(L.compressedFrontierBundle(nextStage.id)).forEach(function(entry){
      carryResources[entry[0]]=Math.max(carryResources[entry[0]]||0,entry[1]);
      carryCaps[entry[0]]=Math.max(carryCaps[entry[0]]||25,Math.round(entry[1]*2.5));
    });
    const carryPopulation=nextStage.carryPopulation?state.game.run.population:8, archive=state.game.run.archive.slice(), lockedArchetype=state.game.run.lockedArchetype;
    state.game.run.stageIndex+=1;
    state.game.run.resources=State.emptyResources();
    state.game.run.capacities=State.emptyCapacities();
    Object.entries(carryResources).forEach(function(entry){ state.game.run.resources[entry[0]]=entry[1]; });
    Object.entries(carryCaps).forEach(function(entry){ state.game.run.capacities[entry[0]]=entry[1]; });
    if(nextStage.id==="creature"){
      state.game.run.resources.food=Math.max(state.game.run.resources.food||0,18);
      state.game.run.resources.water=Math.max(state.game.run.resources.water||0,18);
      state.game.run.resources.materials=Math.max(state.game.run.resources.materials||0,12);
    }
    if(nextStage.resources.includes("happiness") && !state.game.run.resources.happiness) state.game.run.resources.happiness=70;
    state.game.run.activeContract="";
    state.game.run.specialProject=null;
    state.game.run.archive=archive;
    state.game.run.lockedArchetype=lockedArchetype;
    state.game.run.population=Math.max(carryPopulation,10);
    L.pushLog("Evolved into "+L.currentStage().name+".");
    L.ensureWorldState();
    return true;
  };
  L.recordThreatScars=function(){
    const projects=DATA.THREAT_PROJECTS||[], active=L.threats();
    active.forEach(function(threat){
      const solved=projects.some(function(project){ return project.threat===threat.id && state.game.run.threatProjects[project.id]; });
      if(solved) return;
      state.game.meta.threatScars[threat.id]=(state.game.meta.threatScars[threat.id]||0)+1;
      if(state.game.meta.threatScars[threat.id]>=3 && !state.game.meta.transformedScars[threat.id]){
        L.pushLog("Threat scar mutated: "+(((DATA.THREAT_SCARS||{})[threat.id]||{}).name||threat.title)+" has deepened.");
      }
      const scar=(DATA.THREAT_SCARS||{})[threat.id];
      L.pushLog("Threat scar recorded: "+(scar?scar.name:threat.title)+".");
    });
  };
  L.tryAwardArtifact=function(stageId){
    const claimed=Object.keys(state.game.run.claimedGoals||{}).filter(function(key){ return key.startsWith(stageId+":"); }).length;
    if(claimed<2 && L.currentScore()<L.currentStage().scoreTarget*0.9) return false;
    const artifact=DATA.ARTIFACTS.find(function(item){ return item.stage===stageId && !state.game.meta.artifacts[item.id]; });
    if(!artifact) return false;
    state.game.meta.artifacts[artifact.id]=true;
    L.pushLog("Artifact inherited: "+artifact.name);
    return true;
  };
  L.masteryChallengesForStage=function(stageId){
    if(!L.evolutionChallengesUnlocked() && !state.ui.debug) return [];
    return (DATA.EVOLUTION_CHALLENGES[stageId]||[]).map(function(challenge){
      return Object.assign({completed:!!state.game.meta.completedMasteryChallenges[L.archiveFavoriteKey(stageId,challenge.id)]},challenge);
    });
  };
  L.evaluateMasteryChallenge=function(stageId,challenge,review){
      if(challenge.condition==="stage_clear") return review.stageId===challenge.targetStage || review.frontierStage===challenge.targetStage;
      if(challenge.condition==="fast_stage") return (review.stageId===challenge.targetStage || review.frontierStage===challenge.targetStage) && review.time<(challenge.timeLimit||999999);
      if(challenge.condition==="locked_lineage_clear") return (review.stageId===challenge.targetStage || review.frontierStage===challenge.targetStage) && !!review.archetype && !state.game.run.secondaryArchetype;
      if(challenge.condition==="population_threshold") return (review.stageId===challenge.targetStage || review.frontierStage===challenge.targetStage) && (state.game.run.population||0)>=(challenge.populationTarget||0);
      if(challenge.condition==="resource_stockpile") return (review.stageId===challenge.targetStage || review.frontierStage===challenge.targetStage) && (state.game.run.resources[challenge.resource]||0)>=(challenge.amount||0);
      if(challenge.condition==="galactic_win") return review.kind==="Rebirth";
      if(challenge.condition==="rare_galactic_win") return review.kind==="Rebirth" && ["lithoid","necroid","toxoid","extremophile"].includes(review.archetype||"");
      if(challenge.condition==="project_chain") return (review.stageId===challenge.targetStage || review.frontierStage===challenge.targetStage) && (challenge.projects||[]).every(function(id){ return !!state.game.meta.completedProjects[id]; });
      return false;
    };
  L.completeMasteryChallenges=function(stageId,review){
    const active=L.activeEvolutionChallengeDef();
    if(active && (active.targetStage===stageId || (active.targetStage==="galactic" && review.kind==="Rebirth"))){
      const key=L.archiveFavoriteKey(active.targetStage,active.id);
      if(!state.game.meta.completedMasteryChallenges[key] && L.evaluateMasteryChallenge(stageId,active,review)){
        state.game.meta.completedMasteryChallenges[key]=true;
        state.game.meta.evolutionPoints += active.reward||0;
        L.pushLog("Evolution challenge completed: "+active.name+" +"+(active.reward||0)+" EP");
        if(active.family==="growth") L.unlockStoryEntry("cell_mastered");
        if(active.family==="late_stage") L.unlockStoryEntry("evolution_complete");
        state.game.meta.activeEvolutionChallenge="";
        state.game.run.activeEvolutionChallenge="";
      }
    }
    L.refreshPrestigeUnlocks();
  };

  L.rebirthScoreTarget=function(){ return Math.ceil(L.currentStage().scoreTarget*0.25); };
  L.canRebirth=function(){
    if(state.ui.betweenRuns) return false;
    if(L.currentScore()<L.rebirthScoreTarget()) return false;
    return state.ui.debug || state.game.run.time>=45 || state.game.run.stageIndex>=1;
  };
  L.rebirthGain=function(){ if(!L.canRebirth()) return 0; const scorePart=L.currentScore()/Math.max(1,L.currentStage().scoreTarget); return Math.max(1,Math.floor(state.game.run.stageIndex*3+scorePart*4+Math.log10(1+state.game.run.population))); };
  L.rebirth=function(){ if(!L.canRebirth()) return false; const gainValue=L.rebirthGain(); state.game.meta.lastRunReview=L.buildRunReview("Seed New Life",gainValue); L.completeMasteryChallenges(L.currentStage().id,state.game.meta.lastRunReview); state.game.meta.evolutionPoints+=gainValue; state.game.run=State.createRun(state.game.meta); L.autoApplySeedTemplate(L.frontierStage().id); state.ui.betweenRuns=true; state.ui.betweenRunsStep="review"; state.game.run.log.push("Seed New Life awarded "+gainValue+" Evolution Points."); return true; };
  L.buyUpgrade=function(id){ const def=DATA.SHOP_UPGRADES.find(function(item){ return item.id===id; }); if(!def) return false; if(def.requiresWin && state.game.meta.galacticWins<(def.minWins||1) && !state.ui.debug) return false; const level=L.upgradeLevel(id); if(level>=def.max) return false; const cost=def.base+level*def.base; if(state.game.meta.evolutionPoints<cost && !state.ui.debug) return false; if(!state.ui.debug) state.game.meta.evolutionPoints-=cost; state.game.meta.upgrades[id]=level+1; return true; };
  L.runEnlightenmentAutopilot=function(dt){
    if(L.enlightenmentUpgradeLevel("policy_autopilot")<=0) return false;
    let changed=false;
    if(L.currentStage().id==="galactic" && !state.game.run.ascensionPath && state.game.run.seedPreferredAscensionPath && state.game.run.ownedSystems.gateway_spine){
      changed=L.chooseAscensionPath(state.game.run.seedPreferredAscensionPath) || changed;
    }
    if(L.currentStage().id==="galactic" && !state.game.run.congressChoice && state.game.run.seedPreferredCongressBloc){
      const proposal=L.preferredCongressProposalForBloc(state.game.run.seedPreferredCongressBloc);
      if(proposal) changed=L.chooseCongressProposal(proposal.id) || changed;
    }
    if(L.hasLockedLineage() && !state.game.run.doctrine){
      const doctrine=L.availableDoctrines()[0];
      if(doctrine) changed=L.chooseDoctrine(doctrine.id) || changed;
    }
    if(!state.game.run.lineageLaws[L.currentStage().id]){
      const law=L.availableLineageLaws()[0];
      if(law) changed=L.chooseLineageLaw(law.id) || changed;
    }
    if(state.game.run.pendingProjectChoice){
      const pending=L.pendingProjectDef();
      let choice=((pending&&pending.choices)||[])[0];
      if(pending && ["ftl_theory_conclave","ftl_research"].includes(pending.id) && state.game.run.seedPreferredFTLMethod){
        choice=(pending.choices||[]).find(function(item){ return item.id===state.game.run.seedPreferredFTLMethod; }) || choice;
      }
      if(choice) changed=L.chooseProjectCompletion(choice.id) || changed;
    }
    if(!state.game.run.specialProject){
      const preferred=L.preferredProjectForTemplate();
      if(preferred) changed=L.startSpecialProject(preferred.id) || changed;
    }
    const timers=state.game.run.autoTimers||(state.game.run.autoTimers={organelles:0,infrastructure:0,generators:0,template:0});
    if(timers.template==null) timers.template=0;
    timers.template += dt||0;
    const interval=L.transcendenceUpgradeLevel("template_overdrive")>0?4:10;
    if(timers.template>=interval){
      timers.template=0;
      const target=L.pickTemplatePriorityPurchase();
      if(target){
        if(target.kind==="system") changed=L.buySystem(target.item.id) || changed;
        if(target.kind==="tech") changed=L.buyTech(target.item.id) || changed;
      }
    }
    return changed;
  };
  L.hasAutomationControls=function(){ return L.upgradeLevel("auto_organelles")>0 || L.upgradeLevel("auto_generators")>0; };
  L.recommendedEvolutionUpgrades=function(){
    const frontier=L.frontierStage().id;
    const priorityMap={
      cell:["manual","start","cost","objective_cache","auto","auto_organelles"],
      creature:["auto","cost","start","objective_cache","frontier_kit","emergency_stores"],
      tribal:["auto","cost","frontier_kit","emergency_stores","auto_generators"],
      civilization:["auto","cost","frontier_kit","auto_generators","project_haste"],
      empire:["auto","cost","frontier_kit","project_haste","rival_scan"],
      solar:["auto","project_haste","rival_scan","counterintel","artifact_attunement"],
      galactic:["project_haste","rival_scan","counterintel","rival_brakes","artifact_attunement"]
    };
    const ordered=priorityMap[frontier]||priorityMap.cell;
    return ordered.map(function(id){
      const def=(DATA.SHOP_UPGRADES||[]).find(function(item){ return item.id===id; });
      if(!def) return null;
      const level=L.upgradeLevel(id), cost=def.base+level*def.base;
      return {id:id,name:def.name,level:level,cost:cost,desc:def.desc(level),affordable:state.game.meta.evolutionPoints>=cost};
    }).filter(function(item){ return item && item.level<((DATA.SHOP_UPGRADES||[]).find(function(def){ return def.id===item.id; })||{}).max; }).slice(0,3);
  };

  L.stageHint=function(){
    const stage=L.currentStage();
    if(state.ui.betweenRuns) return "Spend Evolution Points, then seed the next run.";
    if(!L.guidanceEnabled()) return "Guidance is off. Re-enable it from Options anytime.";
    const next=L.stageNextStep();
    return next.title+": "+next.detail;
  };
  L.stageNextStep=function(){
    const stage=L.currentStage(), advance=L.stageAdvanceRequirement(stage.id), goals=L.visibleStageGoals();
    const readyGoal=goals.find(function(goal){ return goal.done && !goal.claimed; });
    const survivalFailures=L.survivalFailureResources().map(function(key){ return {key:key,value:(state.game.run.resourceFailures||{})[key]||0}; }).filter(function(row){ return row.value>0; });
    if(survivalFailures.length){
      const failing=survivalFailures.sort(function(a,b){ return b.value-a.value; })[0].key;
      return {title:"Stabilize "+L.resourceName(failing),detail:"A collapse timer is running. Restore positive "+L.resourceName(failing).toLowerCase()+" flow immediately.",kind:"critical"};
    }
    if(readyGoal){
      return {title:"Claim a stage objective",detail:readyGoal.name+" is ready and pays "+readyGoal.reward+" Evolution Points toward the next meta purchase.",kind:"reward"};
    }
    if(stage.id==="cell" && !state.game.run.ownedSystems.nucleus) return {title:"Secure a nucleus",detail:"Build toward Nucleus so the lineage can stabilize and the Cell stage exit opens up.",kind:"build"};
    if(stage.id==="creature" && !state.game.run.ownedSystems.den_network) return {title:"Form a den network",detail:"Creature runs become smoother once the species has a proper nest structure and steady food-water flow.",kind:"build"};
    if(stage.id==="tribal" && !state.game.run.ownedSystems.village_center) return {title:"Raise a village center",detail:"The Village Center unlocks repeated building loops and tells the stage what it is actually about.",kind:"build"};
    if(stage.id==="tribal" && !state.game.run.ownedSystems.sawmill) return {title:"Stand up lumber flow",detail:"A Sawmill is the first real throughput multiplier. Tribal should pivot away from pure clicking as soon as it is stable.",kind:"build"};
    if(stage.id==="civilization" && !state.game.run.ownedSystems.city_center) return {title:"Raise the first city",detail:"City Center should be the first strong purchase. It converts tribal surplus into a real urban economy.",kind:"build"};
    if(stage.id==="civilization" && !state.game.run.technologies.code_of_laws) return {title:"Write the first code",detail:"Code of Laws is the civic hinge. Get there before over-investing in side infrastructure.",kind:"research"};
    if(stage.id==="empire" && !state.game.run.ownedSystems.provincial_admin) return {title:"Install provincial rule",detail:"Provincial Administration is the empire's anchor. Without it, the stage is just oversized civilization.",kind:"build"};
    if(stage.id==="empire" && !state.game.run.ownedSystems.rail_hub) return {title:"Connect the regions",detail:"Rail Hub is the moment Empire starts feeling integrated instead of swollen. Logistics is the stage's real test.",kind:"build"};
    if(stage.id==="empire" && !state.game.run.ownedSystems.general_staff) return {title:"Codify command",detail:"General Staff turns military power into a true imperial lever and stabilizes the stage gate.",kind:"build"};
    if(stage.id==="solar" && !state.game.run.ownedSystems.planetary_colony) return {title:"Found the first world-core",detail:"Planetary Colony gives Solar its backbone. Start with the home system before drifting into optional branches.",kind:"build"};
    if(stage.id==="solar" && !state.game.run.ownedSystems.solar_array) return {title:"Lock in stellar energy",detail:"Solar Array is the first proof the system can feed itself. Build it before widening into too many colony-side upgrades.",kind:"build"};
    if(stage.id==="solar" && !state.game.run.ownedSystems.shipyard_ring) return {title:"Finish the launch spine",detail:"Shipyard Ring is the operational proof that this is a spacefaring stage, not just a large energy economy.",kind:"build"};
    if(stage.id==="galactic" && !state.game.run.ownedSystems.sector_network) return {title:"Bind the first sectors",detail:"Sector Network is the governance hinge. Without it, Galactic is just a larger Solar economy.",kind:"build"};
    if(stage.id==="galactic" && !state.game.run.ownedSystems.quantum_archive) return {title:"Build the shared memory core",detail:"Quantum Archive is the first sign this civilization has a galactic identity instead of disconnected expansion.",kind:"build"};
    if(stage.id==="galactic" && !state.game.run.ownedSystems.gateway_spine) return {title:"Complete the transit lattice",detail:"Gateway Spine turns far systems into one body. Finish it before you treat ascension as inevitable.",kind:"build"};
    if(stage.id==="solar" && !state.game.meta.completedProjects.ftl_theory_conclave){
      const preferred=L.preferredFTLMethodName()||"an FTL doctrine";
      return {title:"Hold the theory conclave",detail:"Choose "+preferred+" or another credible doctrine before the fleet proves anything. Solar should feel like a political-scientific commitment, not a last-minute checkbox.",kind:"project"};
    }
    if(stage.id==="solar" && !state.game.meta.completedProjects.ftl_proof_flight){
      return {title:"Attempt a proof flight",detail:"Run the first dangerous manned jump. The empire needs a test result before the FTL array can become a trusted method.",kind:"project"};
    }
    if(stage.id==="solar" && !L.currentFTLMethodId()){
      const preferred=L.preferredFTLMethodName() || L.plannedFTLMethodName();
      return {title:"Prove faster-than-light travel",detail:"Finish the FTL Research Array and lock in a tested FTL method"+(preferred?(" like "+preferred):"")+". Solar should culminate in a proven leap, not a vague readiness score.",kind:"project"};
    }
    if(stage.id==="solar" && L.currentFTLMethodId()) return {title:"Stabilize the launch doctrine",detail:"Your civilization has proven "+L.currentFTLMethodName()+". Consolidate the orbital economy and shipyard backbone before opening the galactic frontier.",kind:"project"};
    if(stage.id==="galactic" && !state.game.run.ascensionPath) return {title:"Commit to ascension",detail:"Choose Biological, Synthetic, Psionic, Energetic, or Dimensional ascension early so every late build, law, and crisis answer pulls in the same direction.",kind:"choice"};
    if(stage.id==="galactic" && state.game.run.ascensionPath && !state.game.run.congressChoice) return {title:"Pass a galactic congress line",detail:"Choose a congress proposal now so the finale gains real bloc pressure, crisis tradeoffs, and institutional texture instead of only raw tension.",kind:"choice"};
    if(stage.id==="galactic" && !state.game.run.ownedSystems.ascension_protocol) return {title:"Declare the first protocol",detail:"Ascension Protocol is the institutional commitment. Build it before you try to codify a final doctrine.",kind:"build"};
    if(stage.id==="galactic" && !state.game.run.technologies.ascension_protocols) return {title:"Codify the ascent",detail:"Ascension Protocols are the formal bridge between your chosen path and a real ending.",kind:"research"};
    if(!advance.met){
      return {title:"Unlock the stage gate",detail:advance.text+". Keep building toward the evolve requirement before chasing side systems.",kind:"gate"};
    }
    if(stage.id==="galactic"){
      const incomplete=L.ascensionObjectives().filter(function(obj){ return !obj.done; });
      if(incomplete.length) return {title:"Finish the ascension proof",detail:incomplete[0].name+" is still open. Galactic should end by completing path objectives, not merely by inflating score.",kind:"choice"};
    }
    const stageSystems=(stage.systems||[]).filter(function(item){ return L.contentVisible(item,state.ui.showLockedContent) && !state.game.run.ownedSystems[item.id] && !L.lockReasonForSystem(item); });
    if(stageSystems.length) return {title:"Add one more system",detail:""+stageSystems[0].name+" is currently the cleanest affordable build for this stage.",kind:"build"};
    const stageTechs=(stage.technologies||[]).filter(function(item){ return !state.game.run.technologies[item.id] && L.contentVisible(item,state.ui.showLockedContent) && !L.lockReasonForTech(item); });
    if(stageTechs.length) return {title:"Push the next tech",detail:""+stageTechs[0].name+" is open and will sharpen the current stage loop.",kind:"research"};
    return {title:"Consolidate the layer",detail:"Smooth out resource flow, storage, and pressure so the next evolve window feels stable instead of rushed.",kind:"steady"};
  };
  L.nextSeedPlan=function(){
    L.refreshPrestigeUnlocks();
    const meta=state.game.meta, review=meta.lastRunReview||{}, tier=L.legacyTierDef(), theme=(DATA.COSMETIC_THEMES||[]).find(function(item){ return item.id===meta.cosmeticTheme; });
    const activeRelics=Object.keys(meta.masteryRelics||{}).filter(function(stageId){ return meta.activeRelics[stageId]!==false; });
    const recommended=L.recommendedEvolutionUpgrades();
    const guidance=[];
    if(review.failure) guidance.push({title:"Patch the last collapse",detail:"Last run ended to "+review.failure+". Bias the next seed toward earlier stabilization and storage."});
    else if((review.rivalEndings||[]).length) guidance.push({title:"Answer rival pressure earlier",detail:"A rival ending was recorded. Reach your military, unity, or pressure response layer sooner next cycle."});
    else if(review.kind==="Rebirth") guidance.push({title:"Spend for a new angle",detail:"This run already proved the full path. Use the shop to buy speed, automation, or a new legacy universe before seeding again."});
    else if(review.kind==="Stage Clear") guidance.push({title:"Push the frontier forward",detail:"You unlocked "+(review.unlockedFrontier||"the next stage")+". Spend toward purchases that make the next frontier clear arrive faster."});
    else guidance.push({title:"Target a cleaner first break",detail:"Open with the stage gate in mind and claim one stage objective before pushing for the next layer."});
    const enlightenment=L.futureLayerState("enlightenment");
    const autopilot=L.seedAutopilotEnabled();
    const appliedRoute=state.game.run.seedTemplateName||"";
    if(enlightenment.unlocked) guidance.push({title:"Enlightenment is optional",detail:"You do not have to reset immediately. You can keep grinding Evolution Points and mastery progress first, then awaken Divinity with a stronger bank."});
    if(enlightenment.unlocked) guidance.push({title:"Current divinity focus",detail:(L.divinityFocusDef()?L.divinityFocusDef().name:"No focus selected")+" will shape the next Enlightenment-era runs."});
    if(L.evolutionChallengesUnlocked() && !enlightenment.unlocked) guidance.push({title:"Evolution is not complete yet",detail:"Finish every Evolution challenge to unlock Enlightenment. Current progress: "+L.completedEvolutionChallengeCount()+"/"+L.totalEvolutionChallenges()+"."});
    if(activeRelics.length) guidance.push({title:"Carry forward relic memory",detail:activeRelics.length+" mastery relics are active for the next seed."});
    if(meta.galacticWins>=1 && tier) guidance.push({title:"Legacy universe selected",detail:tier.name+" is active, with EP x"+tier.epMult+" and "+tier.desc});
    if(recommended.length) guidance.push({title:"Recommended next purchases",detail:recommended.map(function(item){ return item.name+" ("+item.cost+" EP"+(item.affordable?", affordable now":"")+")"; }).join(" | ")});
    if(L.enlightenmentUpgradeLevel("compressed_frontiers")>0) guidance.push({title:"Compressed frontiers active",detail:"Earlier stages below the current frontier now open with stronger starter bundles and much faster output."});
    if(appliedRoute) guidance.push({title:"Applied route template",detail:appliedRoute+" is already steering the next seed toward "+(state.game.run.seedPreferredAscensionPath||"its default path")+", "+(state.game.run.seedPreferredCongressBloc||"its default bloc")+", and "+(state.game.run.seedPreferredFTLMethod||"its default FTL doctrine")+" choices."});
    else if(autopilot) guidance.push({title:"Autopilot is armed",detail:"If a matching default route exists for "+L.frontierStage().name+", it will be applied automatically before the next seed begins."});
    else guidance.push({title:"Manual seed active",detail:"Seed autopilot is off, so the next run will begin without an auto-applied route unless you pick one here."});
    return {
      title: meta.galacticWins>0 ? "Seed the next world" : "Seed new life",
      subtitle: meta.galacticWins>0 ? "Carry memory forward, choose the conditions, and begin again." : "This is the first spark. Set the conditions and begin the cycle.",
      rows:[
        {label:"Frontier",value:L.frontierStage().name,sub:"Beat this stage to unlock "+(L.frontierStageIndex()<DATA.STAGES.length-1?L.nextFrontierStage().name:"future prestige layers")},
        {label:"Default Route",value:L.templateDefaultName(L.frontierStage().id)||"None",sub:L.templateDefaultName(L.frontierStage().id)?"Auto-applies when a new seed is created for this frontier":"No auto-applied route template set"},
        {label:"Seed Autopilot",value:autopilot?"Enabled":"Manual",sub:autopilot?(appliedRoute?("Applied route: "+appliedRoute):"Uses the current frontier or global default route when available"):"No route is auto-applied unless you do it manually"},
        {label:"FTL Doctrine",value:L.preferredFTLMethodName()||"Open",sub:L.preferredFTLMethodName()?"Saved route intent for Solar FTL research":"No saved FTL preference yet"},
        {label:"Divinity Focus",value:L.divinityFocusDef()?L.divinityFocusDef().name:"Locked",sub:L.divinityFocusDef()?L.divinityFocusDef().desc:"Choose a Divinity focus once Enlightenment is unlocked"},
        {label:"Legacy Universe",value:tier?tier.name:"Standard",sub:tier?tier.desc:"Base evolution curve"},
        {label:"Run Banner",value:theme?theme.name:"Default Banner",sub:theme?theme.desc:"Standard presentation"},
        {label:"Active Relics",value:L.fmt(activeRelics.length),sub:activeRelics.length?activeRelics.join(", "):"No mastery relics equipped"},
        {label:"Known Lineages",value:L.fmt(Object.keys(meta.revealedArchetypes||{}).length),sub:"Blind first-run mystery narrows over time"},
        {label:"Galactic Wins",value:L.fmt(meta.galacticWins||0),sub:"Awakens Evolution challenges and harder universes"},
        {label:"Evolution Challenges",value:L.evolutionChallengesUnlocked()?(L.completedEvolutionChallengeCount()+"/"+L.totalEvolutionChallenges()):"Dormant",sub:L.evolutionChallengesUnlocked()?"Master every challenge to unlock Enlightenment.":"Awaken after the first Galactic rebirth"},
        {label:"Enlightenment",value:enlightenment.unlocked?("Ready | +"+L.enlightenmentGain()+" Enlightenment now"):"Locked",sub:enlightenment.unlocked?"Optional reset layer with Divinity, foresight, route control, and compressed frontiers.":"Unlocks after every Evolution challenge is completed"},
        {label:"Route Templates",value:L.enlightenmentUpgradeLevel("route_templates")>0?Object.keys(meta.templates||{}).length+" saved":"Locked",sub:L.enlightenmentUpgradeLevel("route_templates")>0?"Save and apply route plans in seed setup":"Buy Route Templates in Enlightenment"},
        {label:"Compressed Frontiers",value:L.enlightenmentUpgradeLevel("compressed_frontiers")>0?"Active":"Locked",sub:L.enlightenmentUpgradeLevel("compressed_frontiers")>0?"Earlier stages beneath the frontier are accelerated":"Buy in Enlightenment to compress prior stages"},
        {label:"Recommended Buys",value:recommended.length?recommended.map(function(item){ return item.name; }).join(", "):"None",sub:recommended.length?"Chosen to help the next frontier clear":"No clear recommendation yet"},
        {label:"Last Result",value:review.kind||"No review yet",sub:review.victoryName||review.failure||review.stage||"No lineage record stored yet"}
      ],
      guidance:L.guidanceEnabled()?guidance:[]
    };
  };
  L.stagePaceText=function(){
    const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond(), primary=L.currentStage().resources[0], advance=L.stageAdvanceRequirement(L.currentStage().id);
    const shortageTimers=L.survivalFailureResources().map(function(key){ return (state.game.run.resourceFailures||{})[key]||0; });
    const shortage=shortageTimers.some(function(value){ return value>0; })?(" | Collapse in "+L.fmt(L.shortageGraceSeconds()-Math.max.apply(Math,shortageTimers))+"s"):"";
    return L.resourceName(primary)+" "+(L.rateText((output[primary]||0)-(upkeep[primary]||0))||"steady")+" | "+advance.text+shortage;
  };
  L.resourceSummary=function(){
    const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    const keys=L.currentStage().resources.slice();
    if(L.divinityUnlocked() && L.divinityVisible() && keys.indexOf("divinity")<0) keys.push("divinity");
    const rows=keys.map(function(key){
      if(key==="divinity"){
        const total=L.divinityTotals();
        return {id:"divinity",name:"Divinity",value:total.value,perSecond:total.perSecond,capacity:total.capacity};
      }
      return {id:key,name:L.resourceName(key),value:state.game.run.resources[key]||0,perSecond:(output[key]||0)-(upkeep[key]||0),capacity:L.capacityFor(key)};
    }).filter(function(row,index){
      return index<4 || row.id==="divinity" || row.value>0 || Math.abs(row.perSecond)>=0.01 || ["food","water","energy","production","science","atp"].includes(row.id);
    }).sort(function(a,b){
      const aHot=(Math.abs(a.perSecond)>=0.01||a.value>0)?0:1;
      const bHot=(Math.abs(b.perSecond)>=0.01||b.value>0)?0:1;
      const aIndex=a.id==="divinity"?999:L.currentStage().resources.indexOf(a.id);
      const bIndex=b.id==="divinity"?999:L.currentStage().resources.indexOf(b.id);
      return aHot-bHot || aIndex-bIndex;
    });
    let trimmed=rows.slice(0,8);
    if(L.divinityUnlocked() && L.divinityVisible() && !trimmed.some(function(row){ return row.id==="divinity"; })){
      const divinityRow=rows.find(function(row){ return row.id==="divinity"; });
      if(divinityRow){
        trimmed=trimmed.slice(0,7).concat([divinityRow]);
      }
    }
    return trimmed;
  };
  L.automationSummary=function(){
    const sources=L.activeEffectSources().filter(function(item){ return Object.keys((item.effects||{}).perSecond||{}).length>0 || Object.keys((item.effects||{}).consume||{}).length>0; });
    const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond();
    const positive=Object.entries(output).filter(function(entry){ return entry[1]>0; }).length;
    const drains=Object.entries(upkeep).filter(function(entry){ return entry[1]>0; }).length;
    const autoLevels={organelles:L.upgradeLevel("auto_organelles"),infrastructure:L.upgradeLevel("auto_generators")};
    return {sources:sources,positive:positive,drains:drains,autoLevels:autoLevels};
  };
  L.pressureAlerts=function(){
    const output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond(), alerts=[];
    L.currentStage().resources.forEach(function(key){
      const value=state.game.run.resources[key]||0, cap=L.capacityFor(key), net=(output[key]||0)-(upkeep[key]||0);
      if((upkeep[key]||0)>0 && net<0) alerts.push({kind:"drain",resource:key,title:L.resourceName(key)+" drain",detail:"Net "+L.fmt(net)+"/s. Upkeep is outpacing production."});
      else if(cap>0 && value/cap>0.92 && (output[key]||0)>0) alerts.push({kind:"cap",resource:key,title:L.resourceName(key)+" capped",detail:"Storage is nearly full. Buy capacity or spend it."});
      else if(cap>0 && value/cap<0.12 && (output[key]||0)<=0 && (upkeep[key]||0)>0) alerts.push({kind:"shortage",resource:key,title:L.resourceName(key)+" shortage",detail:"Low reserves and no positive production."});
    });
    return alerts.slice(0,8);
  };
  L.resourceRoutes=function(){
    return L.activeEffectSources().map(function(item){
      const consume=(item.effects||{}).consume||{}, produce=(item.effects||{}).perSecond||{};
      if(!Object.keys(consume).length && !Object.keys(produce).length) return null;
      return {name:item.name,from:Object.keys(consume).map(function(id){ return L.resourceName(id)+" "+L.fmt(consume[id])+"/s"; }).join(", "),to:Object.keys(produce).map(function(id){ return L.resourceName(id)+" "+L.fmt(produce[id])+"/s"; }).join(", ")};
    }).filter(Boolean);
  };
  L.threats=function(){
    const alerts=L.pressureAlerts(), output=L.automationOutputPerSecond(), upkeep=L.resourceUpkeepPerSecond(), stage=L.currentStage(), threats=[];
    function push(id,title,detail,severity){ threats.push({id:id,title:title,detail:detail,severity:severity}); }
    if(alerts.some(function(a){ return ["food","water"].includes(a.resource) && a.kind==="drain"; })) push("famine","Famine Pressure","Food or water is trending negative.",2);
    if((state.game.run.resources.happiness||100)<25 || ((output.happiness||0)-(upkeep.happiness||0))<0) push("instability","Instability","Happiness is low or declining.",1);
    if((state.game.run.resources.pollution||0)>L.capacityFor("pollution")*0.6) push("ecology","Ecological Strain","Pollution reserves are high.",2);
    if(["empire","solar","galactic"].includes(stage.id) && (state.game.run.resources.military_power||0)<20) push("security","Security Gap","Military reserves are thin for this stage.",1);
    if(stage.id==="galactic" && ((state.game.run.resources.cohesion||0)<20 || (state.game.run.resources.ascension||0)<10)) push("crisis","Cosmic Crisis","Cohesion or ascension readiness is dangerously low.",3);
    if((state.game.run.rivals||[]).some(function(rival){ return rival.victory || rival.score>=85; })) push("rival","Rival Victory Pressure","A competing lineage is close to forcing a crisis or reducing final EP.",3);
    return threats;
  };
  L.codexSummary=function(){
    const meta=state.game.meta;
    const museum={};
    const pathEntries={};
    Object.keys(meta.revealedArchetypes||{}).forEach(function(arch){
      if(!meta.revealedArchetypes[arch]) return;
      (DATA.ASCENSION_PATHS||[]).forEach(function(path){
        pathEntries[arch+":"+path.id]={archetype:arch,path:path.id,count:0,lastName:"",specializations:{}};
      });
    });
    (meta.victoryLog||[]).forEach(function(victory){
      const arch=victory.archetype||"unknown", path=victory.ascensionPath||"none", key=arch+":"+path;
      if(!museum[key]) museum[key]={archetype:arch,path:path,count:0,bestObjectives:0,lastName:victory.name};
      museum[key].count+=1;
      museum[key].bestObjectives=Math.max(museum[key].bestObjectives,(victory.objectives||[]).length);
      museum[key].lastName=victory.name;
      if(!pathEntries[key]) pathEntries[key]={archetype:arch,path:path,count:0,lastName:"",specializations:{}};
      pathEntries[key].count+=1;
      pathEntries[key].lastName=victory.name;
      if(victory.specialization) pathEntries[key].specializations[victory.specialization]=(pathEntries[key].specializations[victory.specialization]||0)+1;
    });
    const rewards=(DATA.MUSEUM_REWARDS||[]).filter(function(reward){
      return Object.values(museum).some(function(row){ return row.count>=reward.count; });
    });
    return {
      archetypesRevealed:Object.keys(meta.revealedArchetypes||{}).length,
      archetypeWins:meta.archetypeWins||{},
      specializations:Object.keys(meta.seenSpecializations||{}).length,
      events:Object.keys(meta.seenEvents||{}).length,
      crisisHistory:L.crisisHistory(),
      content:Object.keys(meta.seenContent||{}).length,
      archiveBoost:L.archiveBoostValue(),
      timelineRecords:L.timelineRecordCount(),
      victories:meta.victoryLog||[],
      rivalEndings:meta.rivalEndings||[],
      chronicles:meta.lineageChronicles||[],
      dossiers:meta.rivalDossiers||{},
      stageMastery:meta.stageMastery||{},
      artifactEvolutions:meta.artifactEvolutions||{},
      favorites:meta.archiveFavorites||{},
      masteryChallenges:meta.completedMasteryChallenges||{},
      evolvedDoctrines:meta.evolvedDoctrines||{},
      masteryRelics:meta.masteryRelics||{},
      wornArtifacts:meta.wornArtifacts||{},
      restoredArtifacts:meta.restoredArtifacts||{},
      congressInstitutions:meta.congressInstitutionLevels||{},
      timelineMilestones:L.timelineMilestoneSources(),
      institutionTraits:L.institutionTraitSources(),
      timelineAnchors:L.timelineAnchorSources(),
      pathEntries:Object.values(pathEntries).sort(function(a,b){
        return a.archetype.localeCompare(b.archetype) || a.path.localeCompare(b.path);
      }),
      museum:Object.values(museum).sort(function(a,b){ return b.count-a.count || b.bestObjectives-a.bestObjectives; }),
      museumRewards:rewards
    };
  };
  L.worldSummary=function(){
      L.ensureWorldState();
      L.trackDivinityChannelUnlocks();
      const era=L.currentEra(), artifacts=DATA.ARTIFACTS.filter(function(item){ return !!state.game.meta.artifacts[item.id]; });
      const stageMutators=state.game.run.activeMutators||{}, stageId=L.currentStage().id;
      const runState={
        era:era,
        forecast:L.nextEraForecast(),
        slots:L.mapSlotsForStage(),
        rivals:state.game.run.rivals||[],
        activeContract:state.game.run.activeContract,
        secondaryArchetype:state.game.run.secondaryArchetype,
        automationPolicy:state.game.run.automationPolicy||"balanced",
        activeMutator:Object.prototype.hasOwnProperty.call(stageMutators,stageId)?stageMutators[stageId]:null,
        worldEvents:state.game.run.worldEvents[L.currentStage().id]||{},
        worldEventChoices:state.game.run.worldEventChoices[L.currentStage().id]||{},
        crisisHistory:L.crisisHistory(),
        crisisAffinity:L.crisisHistory().affinity||{},
        crisisMemories:L.crisisMemorySources(),
        mapWonders:state.game.run.mapWonders||{},
        specialProject:state.game.run.specialProject,
        pendingProject:L.pendingProjectDef(),
        ascensionPath:state.game.run.ascensionPath,
        frontierStageId:L.frontierStage().id
      };
      const mapState={
        templates:state.game.meta.templates||{},
        mapPresets:state.game.meta.mapPresets||{},
        stageLayouts:L.availableStageLayouts(stageId),
        activeStageLayout:L.activeStageLayout(stageId),
        stageMastery:L.stageMasteryCount(stageId),
        masteryChallenges:L.masteryChallengesForStage(stageId),
        adjacency:L.adjacencySources(),
        tagSynergies:L.tagSynergySources(),
        mapWonderSources:L.mapWonderSources(),
        wonderSets:L.wonderSetSources()
      };
      const archiveState={
        artifacts:artifacts,
        artifactSets:L.artifactSetSources(),
        artifactEvolutions:L.availableArtifactEvolutions(),
        artifactFusions:L.artifactFusionSources(),
        restoredArtifacts:L.restoredArtifactSources(),
        restorationChains:L.restorationChainSources(),
        masteryRelics:L.masteryRelicSources(),
        relicSlots:L.maxRelicSlots(),
        equippedRelics:L.equippedRelicStageIds(),
        archiveMilestones:L.archiveMilestoneSources(),
        timelineMilestones:L.timelineMilestoneSources(),
        timelineAnchors:L.timelineAnchorSources(),
        wornArtifacts:state.game.meta.wornArtifacts||{},
        museumRewards:L.museumRewardSources()
      };
      const societyState={
        vassals:state.game.meta.vassals||{},
        vassalDemands:L.availableVassalDemands(),
        contracts:L.availableContracts(),
        rivalInteractions:L.availableRivalInteractions(),
        rivalDefections:L.availableRivalDefections(),
        threatProjects:L.availableThreatProjects(),
        threatScars:L.threatScarSources(),
        transformedScars:L.transformedScarSources(),
        lineageLaws:L.availableLineageLaws(),
        doctrines:L.availableDoctrines(),
        doctrineEvolutions:L.availableDoctrineEvolutions(),
        activeDoctrine:state.game.run.doctrine,
        lawSets:L.lawSetSources(),
        lawCongress:L.lawCongressSources(),
        congressProposals:L.availableCongressProposals(),
        congressChoice:state.game.run.congressChoice,
        currentCongress:L.currentCongressProposal(),
        nextCongressSeason:L.nextCongressSeason(),
        congressInstitutionLevels:state.game.meta.congressInstitutionLevels||{},
        institutionTraits:L.institutionTraitSources(),
        congressCrisis:L.activeCongressCrisis(),
        congressCrisisChoice:state.game.run.rivalEvents.congressCrisis||"",
        institutionCrisis:L.activeInstitutionCrisis(),
        institutionCrisisChoice:state.game.run.rivalEvents.institutionCrisis||""
      };
      const metaState={
        compressionBands:L.availableCompressionBands(),
        logicCores:L.logicCoreDefs(),
        activeLogicCore:L.currentLogicCoreDef(),
        mutatorDraft:L.mutatorDraft(),
        legacyTier:L.legacyTierDef(),
        legacyTiers:L.availableLegacyTiers(),
        cosmeticThemes:L.availableCosmeticThemes(),
        activeCosmeticTheme:state.game.meta.cosmeticTheme||"",
        preferredFTLMethod:L.preferredFTLMethodName(),
        ascensionTension:L.ascensionTension(),
        allSpecialProjects:(DATA.SPECIAL_PROJECTS||[]).concat(DATA.CRISIS_RECOVERY_PROJECTS||[],L.rivalCounterProjectDefs(),L.dossierOperationDefs(),L.artifactRecoveryProjectDefs()).filter(function(item){ return item.stage===L.currentStage().id; }),
        specialProjects:L.availableSpecialProjects(),
        ascensionObjectives:L.ascensionObjectives(),
        story:L.storySummary(),
        unlocks:DATA.META_UNLOCKS||[]
      };
      const genesisState={
        foresight:L.foresightStatus(),
        genesisChoices:L.genesisChoices(),
        genesisDefs:(L.futureLayerState("genesis").unlocked || state.ui.debug)?L.genesisChoiceDefs():{},
        genesisConsequences:L.genesisStageConsequenceSources(),
        awakenedSeeds:L.awakenedDormantSeedSources(),
        genesisMastery:L.genesisMasterySummary()
      };
      const divineState={
        offerings:L.availableOfferings(),
        rituals:L.availableRituals(),
        scripts:L.availableScripts(),
        offeringShare:L.offeringShare(),
        offeringLedger:L.offeringLedger(),
        worshipModes:L.availableWorshipModes(),
        activeWorshipMode:L.currentWorshipModeDef(),
        divineLaws:L.availableDivineLaws(),
        selectedDivineLaws:state.game.meta.divineLaws||[],
        apotheosisInterplay:L.apotheosisInterplaySources(),
        apotheosisMastery:L.apotheosisMasterySummary(),
        heresyHistory:state.game.meta.heresyHistory||{responses:{},types:{}},
        miracles:L.availableMiracles(),
        miracleCharges:state.game.run.miracleCharges||0,
        maxMiracleCharges:L.maxMiracleCharges(),
        heresy:L.activeHeresy(),
        divineMasks:L.divineMasks(),
        activeDivineMask:L.currentDivineMaskDef(),
        prayerPolarities:L.prayerPolarities(),
        activePrayerPolarity:L.currentPrayerPolarityDef(),
        prayerRouting:L.prayerRouting(),
        routingPresets:L.divinityRoutingPresets(),
        currentRoutingPreset:L.currentDivinityPresetDef(),
        preferredMiracle:L.preferredMiracleDef(),
        divinityMastery:L.divinityMasterySummary()
      };
      const omnipotenceState={
        instabilityEvent:L.activeInstabilityEvent(),
        omnipotenceStances:L.omnipotenceStances(),
        activeInstabilityStance:L.currentInstabilityStanceDef(),
        hybridLineages:(state.game.meta.hybridLineages||[]).slice(),
        hybridSlots:L.maxHybridLineageSlots(),
        hybridLegacies:L.hybridLegacySources(),
        omnipotenceMastery:L.omnipotenceMasterySummary()
      };
      const infinityState={
        infinityEchoes:L.infinityEchoes(),
        boundEchoes:(state.game.meta.boundEchoes||[]).slice(),
        echoSlots:L.maxEchoSlots(),
        futureDebt:L.currentFutureDebtDef(),
        debtTiers:L.futureDebtTiers(),
        forks:L.infinityForkDefs(),
        activeFork:L.currentForkDef(),
        activeForkBranch:L.activeForkBranch(),
        activeForkModifier:L.activeForkSource()[0]||null,
        forkArchives:(state.game.meta.forkArchives||[]).slice(),
        mergedForkLessons:(state.game.meta.mergedForkLessons||[]).slice(),
        infinityMastery:L.infinityMasterySummary()
      };
      const eternityState={
        testamentClauses:L.testamentClauses(),
        activeTestamentClauses:(state.game.meta.testamentClauses||[]).slice(),
        maxTestamentClauses:L.maxTestamentClauses(),
        canonCandidates:L.canonCandidates(),
        canonEntries:(state.game.meta.canonEntries||[]).slice(),
        maxCanonEntries:L.maxCanonEntries(),
        permanenceWeaves:L.permanenceWeaveDefs(),
        activePermanenceWeaves:(state.game.meta.permanenceWeaves||[]).slice(),
        maxPermanenceWeaves:L.maxPermanenceWeaves(),
        eternalInheritances:L.activePermanenceInheritance(),
        eternityMastery:L.eternityMasterySummary(),
        latestUniverseSummary:L.latestUniverseSummary(),
        latestUniverseSummarySections:L.latestUniverseSummarySections(L.latestUniverseSummary()),
        finalTestaments:(state.game.meta.finalTestaments||[]).slice()
      };
      return Object.assign({},runState,mapState,archiveState,societyState,metaState,genesisState,divineState,omnipotenceState,infinityState,eternityState);
  };
  L.templateDefaults=function(){
    const defaults=state.game.meta.templateDefaults||(state.game.meta.templateDefaults={global:"",frontier:{}});
    if(defaults.global==null) defaults.global="";
    if(!defaults.frontier) defaults.frontier={};
    return defaults;
  };
  L.seedAutopilotEnabled=function(){
    return state.game.meta.seedAutopilotEnabled!==false;
  };
  L.clearAppliedSeedTemplate=function(){
    state.game.run.seedTemplateName="";
    state.game.run.seedPreferredAscensionPath="";
    state.game.run.seedPreferredCongressBloc="";
    state.game.run.seedPreferredFTLMethod="";
    L.pushLog("Seed template cleared for the next run.");
    return true;
  };
  L.setSeedAutopilot=function(enabled){
    state.game.meta.seedAutopilotEnabled=!!enabled;
    if(enabled){
      L.autoApplySeedTemplate(L.frontierStage().id);
      L.pushLog("Seed autopilot enabled.");
    } else {
      L.clearAppliedSeedTemplate();
      L.pushLog("Seed autopilot disabled; the next seed stays manual.");
    }
    return true;
  };
  L.preferredCongressProposalForBloc=function(bloc){
    if(!bloc) return null;
    return (L.availableCongressProposals()||[]).find(function(item){ return item.bloc===bloc; }) || null;
  };
  L.templateDefaultName=function(frontierStageId){
    const defaults=L.templateDefaults();
    return defaults.frontier[frontierStageId] || defaults.global || "";
  };
  L.templatesForFrontier=function(frontierStageId){
    return Object.entries(state.game.meta.templates||{}).map(function(entry){
      return Object.assign({name:entry[0]},entry[1]);
    }).filter(function(template){
      return !template.frontierStageId || template.frontierStageId===frontierStageId;
    }).sort(function(a,b){
      const aFrontier=a.frontierStageId===frontierStageId?0:(a.frontierStageId?1:2);
      const bFrontier=b.frontierStageId===frontierStageId?0:(b.frontierStageId?1:2);
      return aFrontier-bFrontier || (b.lastAppliedAt||0)-(a.lastAppliedAt||0) || (b.createdAt||0)-(a.createdAt||0) || a.name.localeCompare(b.name);
    });
  };
  L.saveBuildTemplate=function(name,options){
    const key=(name||"Default").trim()||"Default";
    const opts=options||{};
    const frontierStageId=opts.global ? "" : (opts.frontierStageId||L.frontierStage().id);
    const frontierStage=frontierStageId ? (DATA.STAGES[L.stageIndexById(frontierStageId)]||null) : null;
    const previous=(state.game.meta.templates||{})[key]||{};
    const mask=L.currentDivineMaskDef();
    state.game.meta.templates[key]=Object.assign({},previous,{
      autoOrganelleTarget:state.game.meta.autoOrganelleTarget,
      specialization:state.game.run.specialization||"",
      automationPolicy:state.game.run.automationPolicy||"balanced",
      automationSettings:Object.assign({},state.game.meta.automationSettings||{}),
      doctrine:state.game.run.doctrine||"",
      preferredAscensionPath:opts.preferredAscensionPath || state.game.run.ascensionPath || state.game.run.seedPreferredAscensionPath || (mask&&mask.preferredAscensionPath) || previous.preferredAscensionPath || "",
      preferredCongressBloc:opts.preferredCongressBloc || ((L.currentCongressProposal()||{}).bloc) || state.game.run.seedPreferredCongressBloc || (mask&&mask.preferredBloc) || previous.preferredCongressBloc || "",
      preferredFTLMethod:opts.preferredFTLMethod || L.currentFTLMethodId() || previous.preferredFTLMethod || "",
      preferredTheme:opts.preferredTheme || state.game.meta.cosmeticTheme || previous.preferredTheme || "",
      preferredMask:opts.preferredMask || state.game.meta.divineMask || previous.preferredMask || "",
      frontierStageId:frontierStageId,
      frontierStageName:frontierStage?frontierStage.name:"Any Frontier",
      global:!frontierStageId,
      createdAt:previous.createdAt||Date.now()
    });
    L.pushLog("Build template saved: "+key);
    return true;
  };
  L.applyBuildTemplate=function(name){
    const template=(state.game.meta.templates||{})[name];
    if(!template) return false;
    if(template.autoOrganelleTarget) state.game.meta.autoOrganelleTarget=template.autoOrganelleTarget;
    if(template.automationSettings) state.game.meta.automationSettings=Object.assign({},template.automationSettings);
    if(template.automationPolicy) state.game.run.automationPolicy=template.automationPolicy;
    const mask=(template.preferredMask?(DATA.DIVINE_MASKS||[]).find(function(item){ return item.id===template.preferredMask; }):null) || L.currentDivineMaskDef();
    state.game.run.seedPreferredAscensionPath=template.preferredAscensionPath || (mask&&mask.preferredAscensionPath) || "";
    state.game.run.seedPreferredCongressBloc=template.preferredCongressBloc || (mask&&mask.preferredBloc) || "";
    state.game.run.seedPreferredFTLMethod=template.preferredFTLMethod||"";
    if(L.transcendenceUpgradeLevel("seed_orchestra")>0 && template.preferredTheme!=null){
      L.chooseCosmeticTheme(template.preferredTheme||"");
    }
    if(template.preferredMask) state.game.meta.divineMask=template.preferredMask;
    if(template.specialization && !state.game.run.specialization && L.hasLockedLineage()) L.chooseSpecialization(template.specialization);
    if(template.doctrine && !state.game.run.doctrine && L.availableDoctrines().some(function(item){ return item.id===template.doctrine; })) L.chooseDoctrine(template.doctrine);
    if(L.currentStage().id==="galactic" && !state.game.run.ascensionPath && state.game.run.seedPreferredAscensionPath && state.game.run.ownedSystems.gateway_spine){
      L.chooseAscensionPath(state.game.run.seedPreferredAscensionPath);
    }
    if(L.currentStage().id==="galactic" && !state.game.run.congressChoice && state.game.run.seedPreferredCongressBloc){
      const proposal=L.preferredCongressProposalForBloc(state.game.run.seedPreferredCongressBloc);
      if(proposal) L.chooseCongressProposal(proposal.id);
    }
    template.lastAppliedAt=Date.now();
    state.game.run.seedTemplateName=name;
    L.pushLog("Build template applied: "+name);
    return true;
  };
  L.setTemplateDefault=function(name,mode){
    const template=(state.game.meta.templates||{})[name];
    if(!template) return false;
    const defaults=L.templateDefaults();
    if(mode==="global"){
      defaults.global=name;
      L.pushLog("Default global route set: "+name);
      return true;
    }
    const frontierId=template.frontierStageId||L.frontierStage().id;
    defaults.frontier[frontierId]=name;
    L.pushLog("Default route set for "+((DATA.STAGES[L.stageIndexById(frontierId)]||{}).name||frontierId)+": "+name);
    return true;
  };
  L.clearTemplateDefault=function(mode,frontierStageId){
    const defaults=L.templateDefaults();
    if(mode==="global"){
      defaults.global="";
      L.pushLog("Global default route cleared.");
      return true;
    }
    const frontierId=frontierStageId||L.frontierStage().id;
    delete defaults.frontier[frontierId];
    L.pushLog("Frontier default route cleared for "+((DATA.STAGES[L.stageIndexById(frontierId)]||{}).name||frontierId)+".");
    return true;
  };
  L.autoApplySeedTemplate=function(frontierStageId){
    if(!L.seedAutopilotEnabled()) return false;
    const name=L.templateDefaultName(frontierStageId||L.frontierStage().id);
    if(!name) return false;
    return L.applyBuildTemplate(name);
  };
  L.seedTemplateFromFavorite=function(){
    if(L.upgradeLevel("archive_pinning")<=0 && !state.ui.debug) return false;
    const keys=Object.keys(state.game.meta.archiveFavorites||{});
    if(!keys.length) return false;
    const lineageFav=keys.find(function(key){ return key.indexOf("archive:")===0 && key.indexOf("Chronicle")>=0; })||keys[0];
    const templateName="Favorite Seed";
    state.game.meta.templates[templateName]={autoOrganelleTarget:state.game.meta.autoOrganelleTarget,specialization:state.game.run.specialization||"",automationPolicy:state.game.run.automationPolicy||"balanced",automationSettings:Object.assign({},state.game.meta.automationSettings||{}),preferredAscensionPath:state.game.run.ascensionPath||state.game.run.seedPreferredAscensionPath||((L.currentDivineMaskDef()||{}).preferredAscensionPath)||"",preferredCongressBloc:((L.currentCongressProposal()||{}).bloc)||state.game.run.seedPreferredCongressBloc||((L.currentDivineMaskDef()||{}).preferredBloc)||"",preferredFTLMethod:L.currentFTLMethodId()||"",preferredTheme:state.game.meta.cosmeticTheme||"",preferredMask:state.game.meta.divineMask||"",favoriteSource:lineageFav,frontierStageId:L.frontierStage().id,frontierStageName:L.frontierStage().name,global:false,createdAt:Date.now()};
    L.pushLog("Favorite loadout seeded from archive memory.");
    return true;
  };
  L.saveMapPreset=function(name){
    L.ensureWorldState();
    if(!L.stageHasMapSlots(L.currentStage().id)) return false;
    const key=(name||"Default").trim()||"Default";
    const stageId=L.currentStage().id;
    state.game.meta.mapPresets[key]={stageId:stageId,slots:L.mapSlotsForStage().map(function(slot){ return {slotId:slot.id,systemId:slot.systemId||""}; })};
    L.pushLog("World layout preset saved: "+key);
    return true;
  };
  L.applyMapPreset=function(name){
    L.ensureWorldState();
    if(!L.stageHasMapSlots(L.currentStage().id)) return false;
    const preset=(state.game.meta.mapPresets||{})[name];
    if(!preset || preset.stageId!==L.currentStage().id) return false;
    preset.slots.forEach(function(row){
      if(row.systemId) L.placeSystemInSlot(row.systemId,row.slotId);
      else {
        const slot=L.mapSlotsForStage().find(function(item){ return item.id===row.slotId; });
        if(slot) slot.systemId="";
      }
    });
    L.pushLog("World layout preset applied: "+name);
    return true;
  };

  window.EvolutionLogic=L;
})();
