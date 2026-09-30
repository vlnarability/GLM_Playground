(function(){
  const DATA=window.EvolutionData, State=window.EvolutionState, Logic=window.EvolutionLogic, state=State.state, UI={};

  function byId(id){ return document.getElementById(id); }
  function badge(text,kind){ return '<span class="badge '+kind+'">'+text+'</span>'; }
  function iconTitle(text,icon){ return '<span class="title-with-icon"><span class="label-icon label-icon-'+icon+'"></span><span>'+text+'</span></span>'; }
  function crestTitle(text,archetype){ return '<span class="title-with-icon"><span class="crest-chip crest-'+archetype+'"></span><span>'+text+'</span></span>'; }
  function bindPress(el,handler){
    let pointerHandled=false;
    el.onclick=function(event){ if(pointerHandled){ pointerHandled=false; return; } handler(event); };
    el.onpointerdown=function(event){ if(el.disabled) return; if(event.pointerType==="mouse" && event.button!==0) return; pointerHandled=true; event.preventDefault(); handler(event); };
  }
  function cardButton(label,disabled,title,handler){ const btn=document.createElement("button"); btn.textContent=label; btn.disabled=!!disabled; if(title) btn.title=title; bindPress(btn,handler); return btn; }
  function emptyState(text){ const div=document.createElement("div"); div.className="empty-state"; div.textContent=text; return div; }
  function effectText(item){
    const effects=(item&&item.effects)||{}, lines=[];
    if(effects.perSecond) Object.entries(effects.perSecond).forEach(function(entry){ const rate=Logic.rateText(entry[1]); if(rate) lines.push(rate+" "+Logic.resourceName(entry[0])); });
    if(effects.consume) Object.entries(effects.consume).forEach(function(entry){ const rate=Logic.rateText(-entry[1]); if(rate) lines.push(rate+" "+Logic.resourceName(entry[0])); });
    if(effects.allOutput) lines.push("All output +"+Math.round(effects.allOutput*100)+"%");
    if(effects.resourceOutput) Object.entries(effects.resourceOutput).forEach(function(entry){ const pct=Math.round(entry[1]*100); lines.push(Logic.resourceName(entry[0])+" output "+(pct>=0?"+":"")+pct+"%"); });
    if(effects.populationGrowth) lines.push("Population growth +"+Logic.fmt(effects.populationGrowth)+"/s");
    if(effects.manualBonus) lines.push("Manual x"+Logic.fmt(1+effects.manualBonus));
    if(effects.score) lines.push("Score +"+Logic.fmt(effects.score));
    return lines.join(" | ");
  }
  function productionTitle(stageId){
    return {
      cell:"Cell Metabolism",
      creature:"Creature Structures",
      tribal:"Tribal Buildings",
      civilization:"Civic Infrastructure",
      empire:"Imperial Systems",
      solar:"Solar Infrastructure",
      galactic:"Galactic Networks"
    }[stageId]||"Production";
  }
  function applyArchetypeBorder(card,item){
    if(!["cell","creature"].includes(Logic.currentStage().id)) return;
    const affinity=Logic.itemAffinity(item), top=Object.entries(affinity).filter(function(entry){ return Logic.isArchetypeRevealed(entry[0]); }).sort(function(a,b){ return b[1]-a[1]; })[0];
    if(!top) return;
    card.classList.add("archetype-revealed");
    card.style.setProperty("--archetype-color",Logic.archetypeColor(top[0]));
  }
  function bindArchetypePreview(card,item){
    if(!["cell","creature"].includes(Logic.currentStage().id)) return;
    const affinity=Logic.itemAffinity(item);
    if(!Object.keys(affinity).length) return;
    card.onmouseenter=function(){ state.ui.previewAffinity=affinity; card.classList.add("hover-preview"); drawArchetypeRadar(); };
    card.onmouseleave=function(){ state.ui.previewAffinity=null; card.classList.remove("hover-preview"); drawArchetypeRadar(); };
    card.onfocusin=card.onmouseenter;
    card.onfocusout=card.onmouseleave;
  }
  function affinityText(item){
    const affinity=Logic.itemAffinity(item);
    return Object.entries(affinity).sort(function(a,b){ return b[1]-a[1]; }).map(function(entry){ return Logic.displayArchetypeName(entry[0])+" +"+Logic.fmt(entry[1]); }).join(" | ");
  }
  function lineageText(item){ return item.archetypeReq?"Lineage: "+Logic.displayArchetypeName(item.archetypeReq):""; }
  function effectSourceText(source){ return effectText({effects:(source&&source.effects)||{}}); }
  function switchTab(tabId){ state.ui.tab=tabId; UI.render(); }
  function tierPriority(tier){ return {critical:3, choice:2, reminder:1}[tier]||1; }
  function lockedFilterToggle(){
    const label=document.createElement("label"), input=document.createElement("input");
    label.className="filter-toggle";
    input.type="checkbox";
    input.checked=!!state.ui.showLockedContent;
    input.onchange=function(event){ state.ui.showLockedContent=!!event.target.checked; UI.render(); };
    label.appendChild(input);
    label.appendChild(document.createTextNode("Show locked"));
    return label;
  }
  function drawArchetypeRadar(){
    const canvas=byId("archetype-radar");
    if(!canvas || !canvas.getContext) return;
    const ctx=canvas.getContext("2d"), w=canvas.width, h=canvas.height, cx=w/2, cy=h/2+4, radius=Math.min(w,h)*0.33;
    const archetypes=DATA.ARCHETYPES, scores=Object.assign({},Logic.archetypeScores());
    if(state.ui.previewAffinity) Logic.addAffinity(scores,state.ui.previewAffinity);
    const max=Math.max(1,...Object.values(scores));
    ctx.clearRect(0,0,w,h);
    ctx.font="12px system-ui, sans-serif";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.strokeStyle="rgba(163,186,216,.25)";
    ctx.fillStyle="rgba(163,186,216,.62)";
    for(let ring=1;ring<=3;ring++){
      ctx.beginPath();
      archetypes.forEach(function(_,i){
        const angle=-Math.PI/2+i*2*Math.PI/archetypes.length, r=radius*ring/3, x=cx+Math.cos(angle)*r, y=cy+Math.sin(angle)*r;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    archetypes.forEach(function(arch,i){
      const angle=-Math.PI/2+i*2*Math.PI/archetypes.length, x=cx+Math.cos(angle)*radius, y=cy+Math.sin(angle)*radius;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(x,y);
      ctx.stroke();
      ctx.fillStyle=Logic.isArchetypeRevealed(arch.id)?Logic.archetypeColor(arch.id):"rgba(163,186,216,.68)";
      ctx.fillText(Logic.displayArchetypeName(arch.id),cx+Math.cos(angle)*(radius+28),cy+Math.sin(angle)*(radius+22));
    });
    const previewTop=state.ui.previewAffinity?Object.entries(state.ui.previewAffinity).sort(function(a,b){ return b[1]-a[1]; })[0]:null;
    const dominant=(previewTop&&previewTop[0])||Logic.dominantArchetype(), fillColor=Logic.isArchetypeRevealed(dominant)?Logic.archetypeColor(dominant):"#8da5c4";
    ctx.beginPath();
    archetypes.forEach(function(arch,i){
      const angle=-Math.PI/2+i*2*Math.PI/archetypes.length, r=radius*((scores[arch.id]||0)/max), x=cx+Math.cos(angle)*r, y=cy+Math.sin(angle)*r;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.fillStyle=fillColor+"33";
    ctx.strokeStyle=fillColor;
    ctx.lineWidth=2;
    ctx.fill();
    ctx.stroke();
    if(previewTop){
      ctx.fillStyle=Logic.isArchetypeRevealed(previewTop[0])?Logic.archetypeColor(previewTop[0]):"rgba(231,240,255,.85)";
      ctx.fillText("Preview "+affinityText({affinity:state.ui.previewAffinity}),cx,18);
    }
    ctx.lineWidth=1;
  }

  UI.bindUI=function(){
    document.querySelectorAll(".tab").forEach(function(btn){ btn.onclick=function(){ state.ui.tab=btn.dataset.tab; UI.render(); }; });
    byId("ascend-btn").onclick=function(){ if(Logic.evolve()) UI.render(); };
    byId("rebirth-btn").onclick=function(){ if(Logic.rebirth()) UI.render(); };
    byId("save-btn").onclick=function(){ State.saveGame(); };
    byId("reset-btn").onclick=function(){ State.hardReset(); UI.render(); };
    byId("options-btn").onclick=function(){ state.ui.optionsOpen=!state.ui.optionsOpen; UI.render(); };
    byId("debug-toggle").onchange=function(e){ state.ui.debug=!!e.target.checked; if(!state.ui.debug) state.speedIndex=0; UI.render(); };
    byId("guidance-toggle").onchange=function(e){ Logic.setGuidanceEnabled(!!e.target.checked); UI.render(); };
    byId("compact-toggle").onchange=function(e){ state.ui.compact=!!e.target.checked; UI.render(); };
    byId("crisis-intensity-select").onchange=function(e){ if(Logic.setCrisisIntensity(e.target.value)) { State.saveGame(); UI.render(); } };
    byId("pause-btn").onclick=function(){ state.running=!state.running; UI.render(); };
    byId("speed-btn").onclick=function(){
      if(!state.ui.debug){ state.speedIndex=0; UI.render(); return; }
      state.speedIndex=(state.speedIndex+1)%DATA.DEBUG_SPEEDS.length;
      UI.render();
    };
    byId("focus-minimize-btn").onclick=function(){ state.ui.focusOverlayMinimized=true; UI.render(); };
    byId("focus-restore-btn").onclick=function(){ state.ui.focusOverlayMinimized=false; UI.render(); };
    byId("shop-close-btn").onclick=function(){
      if(state.ui.betweenRunsStep==="review"){ state.ui.betweenRunsStep="shop"; UI.render(); return; }
      if(state.ui.betweenRunsStep==="shop"){ state.ui.betweenRunsStep="setup"; UI.render(); return; }
      state.ui.betweenRuns=false;
      state.ui.betweenRunsStep="review";
      UI.render();
    };
    byId("story-popup-dismiss-btn").onclick=function(){
      const prompt=Logic.currentStoryPrompt();
      if(prompt) Logic.dismissStoryEntry(prompt.id);
      UI.render();
    };
    byId("universe-summary-close-btn").onclick=function(){
      state.ui.universeSummaryOpen=false;
      UI.render();
    };
    byId("archive-search").oninput=function(event){ state.ui.archiveSearch=event.target.value||""; UI.render(); };
  };

  UI.render=function(){
      if(Logic.invalidateEffectSourceCache) Logic.invalidateEffectSourceCache();
      Logic.applyCosmeticThemeNames();
      const stage=Logic.currentStage(), score=Logic.currentScore(), progress=Math.min(1,score/stage.scoreTarget);
      const world=Logic.worldSummary();
    const isMobile=window.matchMedia && window.matchMedia("(max-width: 600px)").matches;
    document.body.dataset.stage=stage.id;
    document.body.classList.toggle("compact",!!state.ui.compact);
    document.body.classList.toggle("between-runs-mode",!!state.ui.betweenRuns);
    (DATA.COSMETIC_THEMES||[]).forEach(function(theme){ document.body.classList.toggle("theme-"+theme.archetype,state.game.meta.cosmeticTheme===theme.id); });
    if(isMobile && !state.ui.mobileLayoutPrimed){
      const runFeaturesDetails=byId("run-features-details"), archetypeDetails=byId("archetype-details"), traitsDetails=byId("traits-details");
      if(runFeaturesDetails) runFeaturesDetails.open=false;
      if(archetypeDetails) archetypeDetails.open=false;
      if(traitsDetails) traitsDetails.open=false;
      state.ui.mobileLayoutPrimed=true;
    }

    const storyPrompt=Logic.currentStoryPrompt();
    const storyPopup=byId("story-popup");
    storyPopup.classList.toggle("hidden",!storyPrompt);
    if(storyPrompt){
      byId("story-popup-title").textContent=storyPrompt.title;
      byId("story-popup-layer").textContent=storyPrompt.layer;
      byId("story-popup-text").textContent=storyPrompt.text;
    }
    const universeSummary=Logic.latestUniverseSummary();
    const universeSummaryScreen=byId("universe-summary-screen");
    universeSummaryScreen.classList.toggle("hidden",!(state.ui.universeSummaryOpen && universeSummary));
    if(universeSummary){
      byId("universe-summary-title").textContent="Preserved Universe";
      byId("universe-summary-subtitle").textContent=universeSummary.endingText||"A canonized universe now rests in memory.";
      const summaryGrid=byId("universe-summary-grid"); summaryGrid.innerHTML="";
      [
        {label:"Theme",value:universeSummary.themeLabel||universeSummary.theme||"None",sub:"Cosmic identity"},
        {label:"Divine Face",value:universeSummary.maskName||"Unknown",sub:universeSummary.polarityName||"Unknown worship"},
        {label:"Frontier",value:universeSummary.frontier||"Unknown",sub:"Last reached horizon"},
        {label:"Canon",value:Logic.fmt((universeSummary.canonized||[]).length),sub:universeSummary.canonSummary||"No canonized truths"}
      ].forEach(function(item){
        const card=document.createElement("div");
        card.className="summary-box";
        card.innerHTML='<div class="label">'+item.label+'</div><div class="value">'+item.value+'</div><div class="tiny">'+item.sub+'</div>';
        summaryGrid.appendChild(card);
      });
      const summarySections=byId("universe-summary-sections"); summarySections.innerHTML="";
      (Logic.latestUniverseSummarySections(universeSummary)||[]).forEach(function(section){
        const card=document.createElement("div");
        card.className="buy-card layer-eternity";
        card.innerHTML='<div class="name-row"><span>'+section.title+'</span>'+badge("Preserved","owned")+'</div><div class="tiny">'+section.rows.join("<br>")+'</div>';
        summarySections.appendChild(card);
      });
      const exportCard=document.createElement("div");
      exportCard.className="buy-card layer-eternity";
      exportCard.innerHTML='<div class="name-row"><span>Final Testament</span>'+badge("Optional Export","available")+'</div><div class="tiny">Write this preserved universe into scripture and archive memory so future worlds remember exactly what endured.</div><div class="tiny">Exported testaments: '+Logic.fmt((state.game.meta.finalTestaments||[]).length)+'</div>';
      exportCard.appendChild(cardButton("Export to Story / Archive",false,"Create a final testament record from this preserved universe.",function(){ if(Logic.exportLatestUniverseTestament()) UI.render(); }));
      summarySections.appendChild(exportCard);
    }

    byId("stage-name").textContent=stage.name;
    byId("stage-desc").textContent=stage.description;
    byId("population-value").textContent=Logic.fmt(state.game.run.population);
    byId("population-trend").textContent=Logic.dominantArchetypeLabel();
    byId("score-value").textContent=Logic.fmt(score);
    byId("score-detail").textContent="Target "+Logic.fmt(stage.scoreTarget);
    byId("run-status-value").textContent=state.ui.betweenRuns?"Between runs":"In run";
    byId("run-status-detail").textContent=Logic.canRebirth()?("Seed New Life +"+Logic.rebirthGain()+" EP"):(Logic.isFrontierStage()?("Frontier: clear "+stage.name+" to unlock "+(Logic.nextFrontierStage().id!==stage.id?Logic.nextFrontierStage().name:"future prestige")):"Build toward "+Logic.frontierStage().name);
    const nextStep=Logic.stageNextStep();
    byId("advisor-text").textContent=Logic.stageHint();
    byId("pace-text").textContent="Focus: "+nextStep.title+" | "+Logic.stagePaceText();
    byId("advisor-card").classList.toggle("hidden",!Logic.guidanceEnabled());
    byId("stage-score-fill").style.width=(progress*100)+"%";
    byId("stage-score-label").textContent=Math.round(progress*100)+"% of "+Logic.evolveActionLabel().toLowerCase()+" target";
    byId("ascend-fill").style.width=(progress*100)+"%";
    const evolveWord=Logic.evolveActionLabel();
    const advanceReq=Logic.stageAdvanceRequirement(stage.id);
    byId("ascend-status").textContent=(Logic.canEvolve()?("Ready to "+evolveWord):"Not ready yet")+(state.ui.debug?" | Debug override":"");
    const frontierMessage=Logic.isFrontierStage()?(Logic.nextFrontierStage().id!==stage.id?(" | Unlocks "+Logic.nextFrontierStage().name):" | Advances toward Evolution mastery"):" | Continues toward "+Logic.frontierStage().name;
    byId("ascend-requirements").textContent=(advanceReq.met?"Task complete":"Task: "+advanceReq.text)+" | Need "+Math.max(0,stage.scoreTarget-score)+" more score"+frontierMessage;
    byId("ascend-btn").disabled=!Logic.canEvolve()&&!state.ui.debug;
    byId("ascend-btn").textContent=evolveWord;

    const stageArt=byId("stage-art-hook");
    stageArt.dataset.stage=stage.id;
    stageArt.dataset.lineage=state.game.run.lockedArchetype||"unknown";
    stageArt.innerHTML='<div class="stage-art-copy"><div class="label">Stage Atmosphere</div><div class="value">'+stage.name+'</div><div class="tiny">'+(state.game.run.lockedArchetype?Logic.displayArchetypeName(state.game.run.lockedArchetype):"Unknown Lineage Emerging")+'</div></div><div class="stage-art-marks"><span class="art-mark"></span><span class="art-mark"></span><span class="art-mark"></span></div>';

    const earlyQuiet=["cell","creature"].includes(stage.id);
    const featureStrip=byId("feature-strip"); featureStrip.innerHTML="";
    const featureItems=[
      {
        label:"Map",
        value:world.slots.filter(function(slot){ return !!slot.systemId; }).length+" / "+world.slots.length,
        sub:(world.mapWonderSources||[]).length?((world.mapWonderSources||[]).length+" wonders anchored"):"Stage placement board",
        state:(world.slots.some(function(slot){ return !slot.systemId; })?"Ready":"Placed"),
        kind:(world.slots.some(function(slot){ return !slot.systemId; })?"available":"owned"),
        action:"Open Stage Map",
        tab:"systems"
      },
      {
        label:"Artifacts",
        value:String(world.artifacts.length),
        sub:(world.artifactEvolutions||[]).length?((world.artifactEvolutions||[]).length+" reassemblies ready"):((world.restoredArtifacts||[]).length?"Restorations active":"Inherited relic archive"),
        state:(world.artifactEvolutions||[]).length?"Ready":(world.artifacts.length?"Known":"Hidden"),
        kind:(world.artifactEvolutions||[]).length?"available":(world.artifacts.length?"owned":"locked"),
        action:"Open Artifacts",
        tab:"world"
      },
      {
        label:"Laws",
        value:String((Object.values(state.game.run.lineageLaws||{}).filter(Boolean).length)+(world.activeDoctrine?1:0)),
        sub:(world.lineageLaws||[]).length?((world.lineageLaws||[]).length+" laws to choose"):((world.activeDoctrine||world.doctrineEvolutions.length)?"Doctrine active":"Lineage policies"),
        state:(world.lineageLaws||[]).length?"Ready":((Object.values(state.game.run.lineageLaws||{}).filter(Boolean).length||world.activeDoctrine)?"Adopted":"Dormant"),
        kind:(world.lineageLaws||[]).length?"available":((Object.values(state.game.run.lineageLaws||{}).filter(Boolean).length||world.activeDoctrine)?"owned":"locked"),
        action:"Open Lineage",
        tab:"lineage"
      },
      {
        label:"Projects",
        value:world.pendingProject?world.pendingProject.name:(world.specialProject?"Active":String((world.allSpecialProjects||[]).length)),
        sub:world.pendingProject?"Choose a completion branch":(world.specialProject?"Long project underway":((world.allSpecialProjects||[]).length+" projects available")),
        state:world.pendingProject?"Resolve":(world.specialProject?"Running":((world.allSpecialProjects||[]).length?"Ready":"Quiet")),
        kind:world.pendingProject?"available":(world.specialProject?"owned":((world.allSpecialProjects||[]).length?"available":"locked")),
        action:"Open Projects",
        tab:"world"
      }
    ];
    const visibleFeatureItems=featureItems.filter(function(item){
      if(!earlyQuiet) return true;
      if(item.label==="Map") return true;
      if(item.label==="Artifacts") return true;
      if(item.label==="Laws") return item.kind!=="locked" || item.state!=="Dormant";
      if(item.label==="Projects") return item.kind!=="locked" || item.state!=="Quiet";
      return true;
    });
    visibleFeatureItems.forEach(function(item){
      const card=document.createElement("div");
      card.className="summary-box feature-card";
      card.dataset.stage=stage.id;
      card.dataset.hook=item.label.toLowerCase();
      card.dataset.emblem=item.label.toLowerCase();
      card.innerHTML='<div class="label">'+item.label+'</div><div class="value">'+item.value+'</div><div class="tiny">'+item.sub+'</div><div class="name-row">'+badge(item.state,item.kind)+'</div>';
      card.appendChild(cardButton(item.action,false,"Jump to "+item.label.toLowerCase()+".",function(){ switchTab(item.tab); }));
      featureStrip.appendChild(card);
    });

    const betweenRunsPanel=byId("between-runs-panel");
    const lastReview=state.game.meta.lastRunReview||{};
    const runStageId=(lastReview.stageId||({
      "Cell Stage":"cell",
      "Creature Stage":"creature",
      "Tribal Stage":"tribal",
      "Civilization Stage":"civilization",
      "Empire Stage":"empire",
      "Solar Stage":"solar",
      "Galactic Stage":"galactic"
    })[lastReview.stage]||stage.id);
    betweenRunsPanel.dataset.runStage=runStageId;
    betweenRunsPanel.dataset.runStep=state.ui.betweenRunsStep||"review";

    const focusList=byId("focus-list"); focusList.innerHTML="";
    const focusItems=[];
    const deepSystemsDeferred=Logic.deepSystemsDeferred(stage.id);
    const stageSurfaceLevel=Logic.stageSurfaceLevel(stage.id);
    const failureTimers=state.game.run.resourceFailures||{};
    const nearFailure=((failureTimers.food||0)>0)||((failureTimers.water||0)>0)||Logic.pressureAlerts().some(function(alert){
      return ["food","water"].includes(alert.resource) && alert.kind==="shortage";
    });
    function pushFocus(group,tier,build){ focusItems.push({group:group,tier:tier,priority:tierPriority(tier),build:build}); }
    const unresolvedLineageEvents=(Logic.hasLockedLineage()?Logic.availableLineageEvents().filter(function(event){ return !(state.game.run.lineageEvents||{})[event.id]; }):[]);
    unresolvedLineageEvents.forEach(function(event){
      pushFocus("lineage","choice",function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge("Lineage choice","available")+'</div><div class="tiny">'+event.desc+'</div>';
        (event.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Option","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this lineage event.",function(){ if(Logic.chooseLineageEvent(event.id,choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    });
    if(!earlyQuiet && stageSurfaceLevel>=2) Object.entries(world.worldEvents||{}).forEach(function(entry){
      const event=Logic.worldEventDef(entry[1]), chosen=world.worldEventChoices[entry[0]], slot=world.slots.find(function(item){ return item.id===entry[0].replace(":chain",""); });
      if(!event || chosen) return;
      pushFocus("world","choice",function(){
        const card=document.createElement("div");
        card.className="buy-card";
        const eventLabel=slot?slot.name:(event.kind==="disaster"?"Disaster":(event.kind==="crisis"?"Stage crisis":"World event"));
        card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge(eventLabel,"available")+'</div><div class="tiny">'+event.desc+'</div>';
        (event.choices||[]).forEach(function(choice){
          const preview=Logic.worldEventChoicePreview(event,choice);
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Response","available")+'</div><div class="effects">'+effectSourceText(preview)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this world event.",function(){ if(Logic.chooseWorldEventResponse(entry[0],choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    });
    if(!earlyQuiet && stageSurfaceLevel>=1 && !world.congressChoice && (world.congressProposals||[]).length){
      pushFocus("world","choice",function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>Congress Proposal</span>'+badge("Choose a bloc","available")+'</div><div class="tiny">Passing one proposal now unlocks later congress crises and institution pressure, which makes the finale feel more political and less like raw resource drift.</div>';
        (world.congressProposals||[]).slice(0,2).forEach(function(proposal){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+proposal.name+'</span>'+badge("Proposal","available")+'</div><div class="effects">'+effectSourceText(proposal)+'</div>';
          row.appendChild(cardButton("Pass",false,"Pass this congress proposal for the run.",function(){ if(Logic.chooseCongressProposal(proposal.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    }
    if(!earlyQuiet && stageSurfaceLevel>=2) (world.vassalDemands||[]).forEach(function(row){
      pushFocus("world","choice",function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+row.demand.name+'</span>'+badge("Vassal demand","available")+'</div><div class="tiny">'+row.demand.desc+'</div><div class="effects">'+effectSourceText(row.demand)+'</div>';
        card.appendChild(cardButton("Resolve",false,"Answer this vassal demand.",function(){ if(Logic.chooseVassalDemand(row.archetype,row.demand.id)) UI.render(); }));
        return card;
      });
    });
    if(!earlyQuiet && stageSurfaceLevel>=1){
      const counterProjects=(world.specialProjects||[]).filter(function(project){
        return project.id.indexOf("rival_")===0 || project.id.indexOf("dossier_")===0;
      });
      if(counterProjects.length && !world.specialProject){
        pushFocus("projects","choice",function(){
          const project=counterProjects[0], card=document.createElement("div");
          card.className="buy-card";
          card.innerHTML='<div class="name-row"><span>'+project.name+'</span>'+badge("Counterplay","available")+'</div><div class="tiny">'+project.desc+'</div><div class="effects">'+effectSourceText(project)+'</div>';
          card.appendChild(cardButton("Start Project",false,"Launch this rival counterplay project now.",function(){ if(Logic.startSpecialProject(project.id)) UI.render(); }));
          return card;
        });
      }
    }
    if(!earlyQuiet && stageSurfaceLevel>=2) (world.rivalDefections||[]).forEach(function(row){
      pushFocus("world","choice",function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+row.defection.name+'</span>'+badge("Rival opening","available")+'</div><div class="tiny">'+row.defection.desc+'</div><div class="effects">'+effectSourceText(row.defection)+'</div>';
        card.appendChild(cardButton("Use",false,"Use this rival defection opportunity.",function(){ if(Logic.chooseRivalDefection(row.rival.archetype,row.defection.id)) UI.render(); }));
        return card;
      });
    });
    if(!earlyQuiet && stageSurfaceLevel>=2 && world.congressCrisis && !world.congressCrisisChoice){
      pushFocus("crisis","critical",function(){
        const crisis=world.congressCrisis, card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+crisis.name+'</span>'+badge("Congress crisis","locked")+'</div><div class="tiny">'+crisis.desc+'</div><div class="effects">'+effectSourceText(crisis)+'</div>';
        (crisis.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Response","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this congress crisis.",function(){ if(Logic.chooseCongressCrisisResponse(choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    }
    if(!earlyQuiet && stageSurfaceLevel>=2 && world.institutionCrisis && !world.institutionCrisisChoice){
      pushFocus("crisis","critical",function(){
        const crisis=world.institutionCrisis, card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+crisis.name+'</span>'+badge("Institution crisis","locked")+'</div><div class="tiny">'+crisis.desc+'</div><div class="effects">'+effectSourceText(crisis)+'</div>';
        (crisis.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Response","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this institutional crisis.",function(){ if(Logic.chooseInstitutionCrisisResponse(choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    }
    if(!earlyQuiet && (!deepSystemsDeferred || world.pendingProject) && world.pendingProject){
      pushFocus("projects","critical",function(){
        const pending=world.pendingProject, card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+pending.name+'</span>'+badge("Project complete","available")+'</div><div class="tiny">Choose the outcome for this finished project.</div>';
        if(pending.scarRecovery){
          Object.keys(state.game.meta.threatScars||{}).filter(function(id){ return !state.game.meta.transformedScars[id]; }).forEach(function(id){
            const transform=(DATA.SCAR_TRANSFORMS||{})[id];
            if(!transform) return;
            const row=document.createElement("div");
            row.className="choice-row";
            row.innerHTML='<div class="name-row"><span>'+transform.name+'</span>'+badge("Transform","available")+'</div><div class="effects">'+effectSourceText(transform)+'</div>';
            row.appendChild(cardButton("Choose",false,"Choose this scar recovery outcome.",function(){ if(Logic.chooseProjectCompletion(id)) UI.render(); }));
            card.appendChild(row);
          });
        } else (pending.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Branch","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton("Choose",false,"Choose this project completion branch.",function(){ if(Logic.chooseProjectCompletion(choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        return card;
      });
    }
    const availableLaws=Logic.availableLineageLaws();
    if(!((state.game.run.lineageLaws||{})[stage.id]) && availableLaws.length){
      pushFocus("lineage","reminder",function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+iconTitle("Stage Law Available","law")+'</span>'+badge("Policy","available")+'</div><div class="tiny">This stage has an unchosen lineage law.</div>';
        card.appendChild(cardButton("Open Laws",false,"Open the lineage law panel.",function(){ switchTab("lineage"); }));
        return card;
      });
    }
    if(!earlyQuiet && stageSurfaceLevel>=2 && (world.artifactEvolutions||[]).length){
      pushFocus("relics","reminder",function(){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+iconTitle("Artifact Reassembly","artifact")+'</span>'+badge((world.artifactEvolutions||[]).length+" ready","available")+'</div><div class="tiny">Inherited relics can be upgraded between eras.</div>';
        card.appendChild(cardButton("Open Artifacts",false,"Jump to artifact management.",function(){ switchTab("world"); }));
        return card;
      });
    }
    const focusGroups=[
      {id:"all",label:"All"},
      {id:"crisis",label:"Crises"},
      {id:"projects",label:"Projects"},
      {id:"lineage",label:"Lineage"},
      {id:"world",label:"World"},
      {id:"relics",label:"Relics"}
    ];
    const tierCounts={critical:0,choice:0,reminder:0};
    focusItems.forEach(function(item){ tierCounts[item.tier]=(tierCounts[item.tier]||0)+1; });
    if(isMobile && !state.ui.focusAutoMinimizedOnce && !focusItems.some(function(item){ return item.tier==="critical"; })){
      state.ui.focusOverlayMinimized=true;
      state.ui.focusAutoMinimizedOnce=true;
    }
    if(stage.id==="tribal" && state.ui.focusAutoMinimizedStage!=="tribal" && !focusItems.some(function(item){ return item.tier==="critical"; }) && !nearFailure){
      state.ui.focusOverlayMinimized=true;
      state.ui.focusAutoMinimizedStage="tribal";
    } else if(stage.id!=="tribal" && state.ui.focusAutoMinimizedStage==="tribal"){
      state.ui.focusAutoMinimizedStage="";
    }
    const focusFilterBar=byId("focus-filter-bar"); focusFilterBar.innerHTML="";
    const availableFocusGroups=focusGroups.filter(function(group){
      return group.id==="all" || focusItems.some(function(item){ return item.group===group.id; });
    });
    if(!availableFocusGroups.some(function(group){ return group.id===state.ui.focusCategory; })) state.ui.focusCategory="all";
    availableFocusGroups.forEach(function(group){
      const btn=document.createElement("button");
      const count=group.id==="all"?focusItems.length:focusItems.filter(function(item){ return item.group===group.id; }).length;
      btn.textContent=group.label+(count?(" "+count):"");
      btn.className=state.ui.focusCategory===group.id?"tab active":"tab";
      btn.onclick=function(){ state.ui.focusCategory=group.id; UI.render(); };
      focusFilterBar.appendChild(btn);
    });
    const visibleFocusItems=focusItems
      .filter(function(item){ return state.ui.focusCategory==="all" || item.group===state.ui.focusCategory; })
      .filter(function(item){ return !isMobile || item.tier!=="reminder" || state.ui.focusCategory==="relics" || state.ui.focusCategory==="all"; })
      .sort(function(a,b){ return b.priority-a.priority; })
      .slice(0,isMobile?3:6);
    visibleFocusItems.forEach(function(item){ focusList.appendChild(item.build()); });
    const focusOverlay=byId("focus-overlay"), focusRestore=byId("focus-restore-btn");
    const focusTierStrip=byId("focus-tier-strip"); focusTierStrip.innerHTML="";
    [
      {label:"Critical", value:tierCounts.critical, sub:"Immediate choices", kind:tierCounts.critical?"locked":"owned"},
      {label:"Choice", value:tierCounts.choice, sub:"Player decisions", kind:tierCounts.choice?"available":"owned"},
      {label:"Reminder", value:tierCounts.reminder, sub:"Non-urgent follow-up", kind:tierCounts.reminder?"available":"owned"}
    ].forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="label">'+item.label+'</div><div class="value">'+item.value+'</div><div class="tiny">'+item.sub+'</div>';
      focusTierStrip.appendChild(card);
    });
    const focusSuppressed=earlyQuiet && !focusItems.some(function(item){ return item.tier==="critical"; });
    byId("focus-title").textContent=focusItems.length?"Attention Required":"Attention";
    const topTier=focusItems.some(function(item){ return item.tier==="critical"; })?"critical":(focusItems.some(function(item){ return item.tier==="choice"; })?"choice":"reminder");
    byId("focus-subtitle").textContent=focusItems.length?(focusItems.length+" surfaced items are available while the run continues. "+topTier.charAt(0).toUpperCase()+topTier.slice(1)+" items lead."):"No urgent decisions right now.";
    focusOverlay.classList.toggle("hidden",state.ui.focusOverlayMinimized || !focusItems.length || state.ui.betweenRuns || focusSuppressed);
    focusRestore.classList.toggle("hidden",!state.ui.focusOverlayMinimized || !focusItems.length || state.ui.betweenRuns || focusSuppressed);
    focusRestore.textContent=tierCounts.critical?("Critical Attention ("+focusItems.length+")"):(stage.id==="tribal"?"Review Attention ("+focusItems.length+")":"Open Attention ("+focusItems.length+")");

    const resourceWrap=byId("resource-topbar"); resourceWrap.innerHTML="";
    Logic.resourceSummary().forEach(function(row){
      const chip=document.createElement("div"), def=Logic.resourceDef(row.id)||{};
      chip.className="resource-chip";
      chip.dataset.resourceId=row.id;
      if(def.category==="strategic_aggregate") chip.title=Logic.bundleText((Logic.diversifiedStrategicBreakdown&&Logic.diversifiedStrategicBreakdown())||{}) || "Strategic resource breakdown.";
      if(def.category==="luxury_aggregate") chip.title=Logic.bundleText((Logic.diversifiedLuxuryBreakdown&&Logic.diversifiedLuxuryBreakdown())||{}) || "Luxury resource breakdown.";
      if(def.category==="divinity_aggregate"){
        const breakdown=Logic.divinityTotals().rows.map(function(item){ return item.name+" "+Logic.fmt(item.value)+" ("+(Logic.rateText(item.perSecond)||"steady")+")"; }).join(" | ");
        chip.title=breakdown||"Divinity has not begun flowing yet.";
      }
      if(def.category==="divinity_aggregate" || def.category==="luxury_aggregate" || def.category==="strategic_aggregate"){
        chip.classList.add("clickable");
        if(state.ui.resourceBreakdown===row.id) chip.classList.add("selected");
        chip.onclick=function(){
          state.ui.resourceBreakdown=state.ui.resourceBreakdown===row.id?"":row.id;
          UI.render();
        };
      }
      chip.innerHTML='<div class="label">'+row.name+'</div><div class="value">'+Logic.fmt(row.value)+' / '+Logic.fmt(row.capacity)+'</div><div class="tiny">'+(Logic.rateText(row.perSecond)||"steady")+'</div>';
      resourceWrap.appendChild(chip);
    });
    const resourceDetail=byId("resource-detail-panel");
    if(resourceDetail){
      let aggregateId=state.ui.resourceBreakdown||"";
      if(aggregateId==="divinity" && !Logic.divinityVisible()){
        state.ui.resourceBreakdown="";
        aggregateId="";
      }
      const detailRows=aggregateId?Logic.aggregateResourceBreakdown(aggregateId):[];
      resourceDetail.classList.toggle("hidden",!aggregateId);
      resourceDetail.innerHTML="";
      if(aggregateId){
        const title=document.createElement("div");
        title.className="label";
        title.textContent=(Logic.resourceName(aggregateId)||aggregateId)+" Breakdown";
        resourceDetail.appendChild(title);
        if(detailRows.length){
          detailRows.forEach(function(item){
            const line=document.createElement("div");
            line.className="tiny";
            line.textContent=item.text;
            resourceDetail.appendChild(line);
          });
        } else {
          const empty=document.createElement("div");
          empty.className="tiny";
          empty.textContent="No active channels are contributing yet.";
          resourceDetail.appendChild(empty);
        }
      }
    }

    const actionGrid=byId("action-grid"); actionGrid.innerHTML="";
    Logic.stageActions().forEach(function(action){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+action.name+'</span>'+badge("Available","available")+'</div><div class="effects">'+Logic.bundleText(action.gain)+'</div>';
      card.appendChild(cardButton("Gather",state.ui.betweenRuns,"Perform a manual action.",function(){ if(Logic.performAction(action.id)) UI.render(); }));
      actionGrid.appendChild(card);
    });
    if(!actionGrid.children.length) actionGrid.appendChild(emptyState("No manual actions are active in this layer."));

    byId("systems-title").textContent=stage.name+" Systems";
    const stageBridgeHint=(function(){
      if(stage.id==="cell"){
        if(!state.game.run.ownedSystems.mitochondria) return "Starter shell is complete. The next bridge is energy: Mitochondria first, then Assembly toward Golgi.";
        if(!state.game.run.ownedSystems.golgi_apparatus) return "Mid-bridge: finish Golgi Apparatus so Core organelles can open cleanly.";
        if(!state.game.run.ownedSystems.nucleus) return "Threshold ahead: Nucleus is the real Cell gate. Push the bridge resources instead of side organelles.";
        return "The core is online. Broaden into advanced organelles one lane at a time instead of buying every visible option.";
      }
      if(stage.id==="creature"){
        if(!state.game.run.ownedSystems.thinking_cluster) return "Creature starts with survival. Stabilize Nest, food, water, then push Thinking before side adaptations.";
        if(!state.game.run.ownedSystems.den_network) return "The species is taking shape. Den Network is the bridge from body to tribe.";
        return "Now that the core loop exists, add identity and sustainability before rushing the stage gate.";
      }
      if(stage.id==="tribal") return "Use Village Center into Sawmill as the core lane, then layer food, science, and defense around it.";
      if(stage.id==="civilization") return "City Center first, then the civic hinge: farms, market, library, and Code of Laws.";
      if(stage.id==="empire") return "Province, logistics, then command. Empire should feel like coordination, not just bigger numbers.";
      if(stage.id==="solar") return "Build the orbital backbone first: colony, energy, shipyard, then the FTL proof project.";
      if(stage.id==="galactic") return "Pick the ascension path early, then let the path decide which galactic systems deserve attention.";
      return "Systems unlock actions, increase capacities, add production, and shape archetype drift.";
    })();
    byId("systems-hint").textContent=stageBridgeHint;
    const ownedWrap=byId("systems-overview-list"); ownedWrap.innerHTML="";
    const owned=Logic.ownedSystemsForStage();
    if(!owned.length) ownedWrap.appendChild(emptyState("No systems unlocked yet."));
    else owned.forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,item);
      bindArchetypePreview(card,item);
      card.innerHTML='<div class="name-row"><span>'+item.name+(item.ownedCount>1?(" x"+item.ownedCount):"")+'</span>'+badge("Owned","owned")+'</div><div class="tiny">'+Logic.systemCategory(item)+(item.ownedCount>1?(" | eff. x"+Logic.fmt(item.effectiveCount||item.ownedCount)):"")+'</div>';
      ownedWrap.appendChild(card);
    });

    const systemsMapBoard=byId("systems-map-board"); systemsMapBoard.innerHTML="";
    if(!world.slots.length) systemsMapBoard.appendChild(emptyState("This stage has no placement board yet."));
    else {
      const layoutTile=document.createElement("div");
      layoutTile.className="map-tile map-tile-meta";
      layoutTile.innerHTML='<div class="label">Layout</div><div class="value">'+((world.activeStageLayout&&world.activeStageLayout.name)||"Standard")+'</div><div class="tiny">'+((world.activeStageLayout&&world.activeStageLayout.desc)||"Default stage slot arrangement")+'</div>';
      const layoutSelect=document.createElement("select");
      (world.stageLayouts||[]).forEach(function(layout){
        const option=document.createElement("option");
        option.value=layout.id;
        option.textContent=layout.name+(layout.wins?(" - "+layout.wins+" clears"):"");
        layoutSelect.appendChild(option);
      });
      layoutSelect.value=(world.activeStageLayout&&world.activeStageLayout.id)||"standard";
      layoutSelect.onchange=function(event){ if(Logic.chooseStageLayout(stage.id,event.target.value)) UI.render(); };
      layoutTile.appendChild(layoutSelect);
      systemsMapBoard.appendChild(layoutTile);

      const expandTile=document.createElement("div");
        const expanded=state.game.run.expandedSlots[stage.id]||0, expandCost=Logic.expandMapCost(expanded);
        expandTile.className="map-tile map-tile-meta";
        expandTile.innerHTML='<div class="label">Expand Map</div><div class="value">'+(expanded>=3?"Maxed":"+"+expanded+" slots")+'</div><div class="tiny">More territory for stage systems and wonders.</div><div class="cost">Cost: '+expandCost+' EP</div>';
      expandTile.appendChild(cardButton(expanded>=3?"Maxed":"Expand",expanded>=3 || (state.game.meta.evolutionPoints<expandCost&&!state.ui.debug),"Spend EP to add a new slot.",function(){ if(Logic.expandMap()) UI.render(); }));
      systemsMapBoard.appendChild(expandTile);

      world.slots.forEach(function(slot){
        const tile=document.createElement("div"), system=slot.systemId?(stage.systems||[]).find(function(item){ return item.id===slot.systemId; }):null;
        const trait=(DATA.SLOT_TRAITS||[]).find(function(item){ return item.id===slot.traitId; });
        const builtId=(world.mapWonders||{})[slot.id], built=builtId?(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===builtId; }):null;
        const adjacency=world.adjacency.find(function(item){ return item.slot===slot.id; });
        const tagSynergy=world.tagSynergies.find(function(item){ return item.slotName===slot.name; });
        const select=document.createElement("select");
        const empty=document.createElement("option");
        empty.value="";
        empty.textContent="Empty";
        select.appendChild(empty);
        Logic.ownedSystemsForStage().forEach(function(item){
          const option=document.createElement("option");
          option.value=item.id;
          option.textContent=item.name+(item.ownedCount>1?(" x"+item.ownedCount):"");
          select.appendChild(option);
        });
        select.value=slot.systemId||"";
        select.onpointerdown=function(event){ event.stopPropagation(); state.ui.inputActive=true; };
        select.onfocus=function(){ state.ui.inputActive=true; };
        select.onblur=function(){ state.ui.inputActive=false; UI.render(); };
        select.onchange=function(event){ Logic.placeSystemInSlot(event.target.value,slot.id); UI.render(); };
        tile.className="map-tile"+(slot.systemId?" map-tile-filled":"");
        tile.dataset.stage=stage.id;
        tile.dataset.slotType=slot.type||"";
        tile.dataset.trait=slot.traitId||"";
        tile.innerHTML='<div class="name-row"><span>'+slot.name+'</span>'+badge(slot.type,"available")+'</div><div class="tiny">'+(trait?trait.name:"Neutral terrain")+(built?(" | "+built.name):"")+'</div><div class="value">'+(system?system.name:"Unassigned")+'</div>'+(slot.effects?'<div class="effects">'+effectSourceText(slot)+'</div>':'')+(adjacency?'<div class="effects">Adjacency: '+adjacency.name+'</div>':'')+(tagSynergy?'<div class="effects">Synergy: '+tagSynergy.name+'</div>':'');
        tile.appendChild(select);
        const actions=document.createElement("div");
        actions.className="inline-actions";
        if(built){
          const level=(state.game.run.mapWonderLevels||{})[slot.id]||1, maxLevel=Logic.maxMapWonderLevel(), canUpgrade=level<maxLevel && Logic.canAfford(Logic.mapWonderUpgradeCost(slot.id));
          actions.appendChild(cardButton(level>=maxLevel?"Wonder Maxed":"Upgrade Wonder",level>=maxLevel||!canUpgrade,canUpgrade?"Upgrade this wonder.":"Needs resources or max level.",function(){ if(Logic.upgradeMapWonder(slot.id)) UI.render(); }));
        } else if(Logic.availableMapWonders(slot.id).length){
          actions.appendChild(cardButton("See Wonders",false,"Open world wonders for this slot.",function(){ switchTab("world"); }));
        }
        if(actions.children.length) tile.appendChild(actions);
        systemsMapBoard.appendChild(tile);
      });
    }

    const sysCats=Logic.visibleSystemCategories();
    const guidedCategory=(function(){
      if(stage.id==="cell"){
        const next=Logic.cellStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
        if(!next) return "";
        const match=(stage.systems||[]).find(function(item){ return item.id===next.id; });
        return match?Logic.systemCategory(match):"";
      }
      if(stage.id==="creature"){
        const next=Logic.creatureStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
        if(!next) return "";
        const match=(stage.systems||[]).find(function(item){ return item.id===next.id; });
        return match?Logic.systemCategory(match):"";
      }
      if(stage.id==="tribal"){
        if(!state.game.run.ownedSystems.village_center) return "Village core";
        if(!state.game.run.ownedSystems.sawmill) return "Buildings";
        if(!state.game.run.ownedSystems.watch_band) return "Units";
      }
      if(stage.id==="civilization"){
        if(!state.game.run.ownedSystems.city_center) return "Cities";
        if(!state.game.run.ownedSystems.library) return "Institutions";
        if(!state.game.run.ownedSystems.barracks) return "Military";
      }
      if(stage.id==="empire"){
        const next=Logic.empireStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
        if(!next) return "";
        const match=(stage.systems||[]).find(function(item){ return item.id===next.id; });
        return match?Logic.systemCategory(match):"";
      }
      if(stage.id==="solar"){
        const next=Logic.solarStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
        if(!next) return "";
        const match=(stage.systems||[]).find(function(item){ return item.id===next.id; });
        return match?Logic.systemCategory(match):"";
      }
      if(stage.id==="galactic"){
        const next=Logic.galacticStarterSequence().find(function(item){ return !state.game.run.ownedSystems[item.id]; });
        if(!next) return "";
        const match=(stage.systems||[]).find(function(item){ return item.id===next.id; });
        return match?Logic.systemCategory(match):"";
      }
      return "";
    })();
    if(guidedCategory && sysCats.includes(guidedCategory) && state.ui.systemsCategory!==guidedCategory){
      state.ui.systemsCategory=guidedCategory;
    }
    if(!sysCats.includes(state.ui.systemsCategory)) state.ui.systemsCategory=sysCats[0]||"";
    const systemsSubbar=byId("systems-subbar"); systemsSubbar.innerHTML="";
    if(sysCats.length>1){
      sysCats.forEach(function(category){
        const btn=document.createElement("button");
        btn.textContent=category;
        btn.className=state.ui.systemsCategory===category?"tab active":"tab";
        bindPress(btn,function(){ state.ui.systemsCategory=category; UI.render(); });
        systemsSubbar.appendChild(btn);
      });
    }
    systemsSubbar.appendChild(lockedFilterToggle());

    const systemsList=byId("systems-list"); systemsList.innerHTML="";
    const starterSequence=
      stage.id==="cell"?Logic.cellStarterSequence():
      (stage.id==="creature"?Logic.creatureStarterSequence():
      (stage.id==="tribal"?Logic.tribalStarterSequence():
      (stage.id==="civilization"?Logic.civilizationStarterSequence():
      (stage.id==="empire"?Logic.empireStarterSequence():
      (stage.id==="solar"?Logic.solarStarterSequence():
      (stage.id==="galactic"?Logic.galacticStarterSequence():[]))))));
    const starterOrder=starterSequence.reduce(function(map,item,index){
      map[item.id]={step:index+1,why:item.why};
      return map;
    },{});
    const nextStarter=starterSequence.find(function(item){ return !state.game.run.ownedSystems[item.id]; });
    const systemCards=(stage.systems||[]).filter(function(item){
      if(stage.id==="creature" && starterOrder[item.id] && !state.game.run.ownedSystems[item.id] && nextStarter){
        if(item.id===nextStarter.id) return true;
        return false;
      }
      if(!Logic.contentVisible(item,state.ui.showLockedContent)) return false;
      if(state.ui.systemsCategory==="All organelles") return stage.id==="cell" && item.category!=="Starter organelles" && !state.game.run.ownedSystems[item.id];
      if(Logic.systemCategory(item)!==state.ui.systemsCategory) return false;
      if(stage.id==="cell" && starterOrder[item.id] && !state.game.run.ownedSystems[item.id] && nextStarter && item.id!==nextStarter.id) return false;
      if(!state.game.run.ownedSystems[item.id]) return true;
      return Logic.repeatableSystem(item);
    }).map(function(item){
      const reason=Logic.lockReasonForSystem(item), canBuy=!reason||state.ui.debug, effects=effectText(item), ownedCount=Logic.systemOwnedCount(item.id);
      const affinity=affinityText(item);
      const card=document.createElement("div");
      card.className="buy-card";
      applyArchetypeBorder(card,item);
      bindArchetypePreview(card,item);
      const lineage=lineageText(item);
      const nextCost=Logic.repeatableSystem(item)?Logic.scaledCost(item.cost,ownedCount):Logic.discountedCost(item.cost);
      const starterMeta=starterOrder[item.id];
      const starterBadge=starterMeta?badge(nextStarter&&nextStarter.id===item.id?("Step "+starterMeta.step):("Core "+starterMeta.step),nextStarter&&nextStarter.id===item.id?"available":"owned"):"";
      const starterLabel=stage.id==="cell"?"Starter organelle":(stage.id==="creature"?"Anchor build":"Core build");
      const starterLine=starterMeta?'<div class="effects starter-note">'+(nextStarter&&nextStarter.id===item.id?"Build now: ":(starterLabel+": "))+starterMeta.why+'</div>':'';
      card.className+=""+(starterMeta?" starter-buy-card":"")+(nextStarter&&nextStarter.id===item.id?" starter-buy-card-next":"");
      card.innerHTML='<div class="name-row"><span>'+item.name+(ownedCount?(" x"+ownedCount):"")+'</span><span>'+(starterBadge?starterBadge+" ":"")+badge(canBuy?"Available":"Locked",canBuy?"available":"locked")+'</span></div><div class="tiny">'+item.description+'</div><div class="tiny">'+Logic.systemCategory(item)+(Logic.repeatableSystem(item)?" | Repeatable building":"")+'</div>'+starterLine+(lineage?'<div class="effects">'+lineage+'</div>':'')+(effects?'<div class="effects">'+effects+'</div>':'')+(affinity&&["cell","creature"].includes(stage.id)?'<div class="effects">Affinity: '+affinity+'</div>':'')+'<div class="cost">Cost: '+Logic.bundleText(nextCost)+'</div>'+(reason?'<div class="lock-reason">'+reason+'</div>':'');
      card.appendChild(cardButton(canBuy?(ownedCount&&Logic.repeatableSystem(item)?"Build Another":"Build"):"Locked",!canBuy,reason||"Build this system.",function(){ if(Logic.buySystem(item.id)) UI.render(); }));
      card.dataset.costWeight=String(Logic.purchaseWeight(nextCost)+(starterMeta?starterMeta.step*0.01:0));
      card.dataset.canBuy=canBuy?"1":"0";
      card.dataset.starterRank=starterMeta?String(starterMeta.step):"99";
      return card;
    }).sort(function(a,b){
      const aBuy=a.dataset.canBuy==="1", bBuy=b.dataset.canBuy==="1";
      if(aBuy!==bBuy) return aBuy?-1:1;
      const starterDiff=Number(a.dataset.starterRank)-Number(b.dataset.starterRank);
      if(starterDiff!==0) return starterDiff;
      return Number(a.dataset.costWeight)-Number(b.dataset.costWeight);
    });
    systemCards.forEach(function(card){ systemsList.appendChild(card); });
    if(!systemsList.children.length) systemsList.appendChild(emptyState("No available systems in this category right now."));

    byId("automation-title").textContent=productionTitle(stage.id);
    byId("automation-hint").textContent=stage.id==="cell"?"Organelles are the production layer here. Evo automation can eventually steer organelle purchases from the shop.":"Buildings, units, and infrastructure are the production layer. Evo automation can auto-build affordable production systems.";
    const autoSummary=Logic.automationSummary(), autoStrip=byId("automation-summary-strip"); autoStrip.innerHTML="";
    [
      {label:"Sources",value:Logic.fmt(autoSummary.sources.length),sub:"Owned producers and upkeep"},
      {label:"Outputs",value:Logic.fmt(autoSummary.positive),sub:"Resources being produced"},
      {label:"Upkeep",value:Logic.fmt(autoSummary.drains),sub:"Resources being consumed"},
      {label:"Evo Automation",value:"O"+autoSummary.autoLevels.organelles+" / I"+autoSummary.autoLevels.infrastructure,sub:"Organelles / infrastructure"}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="automation-stat";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      autoStrip.appendChild(card);
    });

    const defs=autoSummary.sources, autoCats=["All"].concat([...new Set(defs.map(function(item){ return item.category||item.path||"Other"; }))]);
    if(!autoCats.includes(state.ui.automationCategory)) state.ui.automationCategory=autoCats[0]||"";
    const autoSubbar=byId("automation-subbar"); autoSubbar.innerHTML="";
    autoCats.forEach(function(category){
      const btn=document.createElement("button");
      btn.textContent=category==="All"?"All":category;
      btn.className=state.ui.automationCategory===category?"tab active":"tab";
      bindPress(btn,function(){ state.ui.automationCategory=category; UI.render(); });
      autoSubbar.appendChild(btn);
    });

    const autoList=byId("automation-list"); autoList.innerHTML="";
    defs.filter(function(item){ return state.ui.automationCategory==="All" || item.category===state.ui.automationCategory || item.path===state.ui.automationCategory; }).forEach(function(item){
      const effects=effectText(item);
      const card=document.createElement("div");
      card.className="buy-card";
      applyArchetypeBorder(card,item);
      bindArchetypePreview(card,item);
      card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge("Owned","owned")+'</div><div class="tiny">'+(item.category||item.path||"Production")+'</div>'+(effects?'<div class="effects">'+effects+'</div>':'');
      autoList.appendChild(card);
    });
    if(!autoList.children.length) autoList.appendChild(emptyState("No owned production sources yet."));

    byId("tech-title").textContent=stage.name+" Tech";
    byId("tech-hint").textContent=stage.id==="cell"?"Cell has no separate tech tree. Organelles are this stage's tech layer.":"Tech paths are stage-specific and use the same cost/effect schema as systems.";
    const techPaths=Logic.visibleTechPaths();
    if(!techPaths.some(function(path){ return path.id===state.ui.techCategory; })) state.ui.techCategory=(techPaths[0]&&techPaths[0].id)||"";
    const techSubbar=byId("tech-subbar"); techSubbar.innerHTML="";
    techPaths.forEach(function(path){
      const btn=document.createElement("button");
      btn.textContent=path.name;
      btn.className=state.ui.techCategory===path.id?"tab active":"tab";
      bindPress(btn,function(){ state.ui.techCategory=path.id; UI.render(); });
      techSubbar.appendChild(btn);
    });
    techSubbar.appendChild(lockedFilterToggle());

    const techList=byId("tech-list"); techList.innerHTML="";
    const techCards=(stage.technologies||[]).filter(function(item){
      const ownedTech=!!state.game.run.technologies[item.id];
      return !ownedTech && item.path===state.ui.techCategory && Logic.contentVisible(item,state.ui.showLockedContent);
    }).map(function(item){
      const reason=Logic.lockReasonForTech(item), canBuy=!reason||state.ui.debug, effects=effectText(item);
      const card=document.createElement("div");
      card.className="buy-card";
      const lineage=lineageText(item);
      card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge(canBuy?"Available":"Locked", canBuy?"available":"locked")+'</div>'+(lineage?'<div class="effects">'+lineage+'</div>':'')+(effects?'<div class="effects">'+effects+'</div>':'')+'<div class="cost">Cost: '+Logic.bundleText(Logic.discountedCost(item.cost))+'</div>'+(reason?'<div class="lock-reason">'+reason+'</div>':'');
      card.appendChild(cardButton("Research",!canBuy,reason||"Research this technology.",function(){ if(Logic.buyTech(item.id)) UI.render(); }));
      card.dataset.costWeight=String(Logic.purchaseWeight(Logic.discountedCost(item.cost)));
      card.dataset.canBuy=canBuy?"1":"0";
      return card;
    }).sort(function(a,b){
      const aBuy=a.dataset.canBuy==="1", bBuy=b.dataset.canBuy==="1";
      if(aBuy!==bBuy) return aBuy?-1:1;
      return Number(a.dataset.costWeight)-Number(b.dataset.costWeight);
    });
    techCards.forEach(function(card){ techList.appendChild(card); });
    if(!techList.children.length) techList.appendChild(emptyState(stage.id==="cell"?"No Cell techs. Use Stage Systems to buy organelles.":"No technologies in this path yet."));

    const autoControlList=byId("auto-control-list"); autoControlList.innerHTML="";
    const settings=state.game.meta.automationSettings||(state.game.meta.automationSettings={organellesEnabled:true,infrastructureEnabled:true});
    if(Logic.upgradeLevel("auto_organelles")>0){
      const card=document.createElement("div");
      card.className="buy-card";
      const targetSelect=document.createElement("select");
      DATA.ARCHETYPES.forEach(function(arch){
        const option=document.createElement("option");
        option.value=arch.id;
        option.textContent=Logic.displayArchetypeName(arch.id);
        targetSelect.appendChild(option);
      });
      targetSelect.value=state.game.meta.autoOrganelleTarget||"humanoid";
      targetSelect.onpointerdown=function(event){ event.stopPropagation(); state.ui.inputActive=true; };
      targetSelect.onfocus=function(){ state.ui.inputActive=true; };
      targetSelect.onblur=function(){ state.ui.inputActive=false; UI.render(); };
      targetSelect.onchange=function(event){ state.game.meta.autoOrganelleTarget=event.target.value; State.saveGame(); };
      const toggle=document.createElement("input");
      toggle.type="checkbox";
      toggle.checked=settings.organellesEnabled!==false;
      toggle.onchange=function(event){ settings.organellesEnabled=!!event.target.checked; State.saveGame(); UI.render(); };
      const row=document.createElement("label");
      row.className="control-row";
      row.innerHTML='<span>Enabled</span>';
      row.appendChild(toggle);
      card.innerHTML='<div class="name-row"><span>Organelle Instinct</span>'+badge("Lv "+Logic.upgradeLevel("auto_organelles"),"available")+'</div><div class="tiny">Auto-buys affordable Cell organelles. Targeting stays hidden until a lineage has been discovered.</div>';
      card.appendChild(row);
      const targetRow=document.createElement("div");
      targetRow.className="control-row";
      targetRow.innerHTML='<span>Target lineage</span>';
      targetRow.appendChild(targetSelect);
      card.appendChild(targetRow);
      autoControlList.appendChild(card);
    }
    if(Logic.upgradeLevel("auto_generators")>0){
      const card=document.createElement("div");
      card.className="buy-card";
      const policySelect=document.createElement("select");
      [
        ["balanced","Balanced"],
        ["food","Food and water"],
        ["science","Rush science"],
        ["low_pollution","Avoid pollution"],
        ["lineage","Favor lineage"]
      ].forEach(function(row){
        const option=document.createElement("option");
        option.value=row[0];
        option.textContent=row[1];
        policySelect.appendChild(option);
      });
      policySelect.value=state.game.run.automationPolicy||"balanced";
      policySelect.onpointerdown=function(event){ event.stopPropagation(); state.ui.inputActive=true; };
      policySelect.onfocus=function(){ state.ui.inputActive=true; };
      policySelect.onblur=function(){ state.ui.inputActive=false; UI.render(); };
      policySelect.onchange=function(event){ Logic.setAutomationPolicy(event.target.value); State.saveGame(); };
      const toggle=document.createElement("input");
      toggle.type="checkbox";
      toggle.checked=settings.infrastructureEnabled!==false;
      toggle.onchange=function(event){ settings.infrastructureEnabled=!!event.target.checked; State.saveGame(); UI.render(); };
      const row=document.createElement("label");
      row.className="control-row";
      row.innerHTML='<span>Enabled</span>';
      row.appendChild(toggle);
      card.innerHTML='<div class="name-row"><span>Infrastructure Foreman</span>'+badge("Lv "+Logic.upgradeLevel("auto_generators"),"available")+'</div><div class="tiny">Auto-builds affordable production systems after the Cell stage using a simple priority.</div>';
      card.appendChild(row);
      const policyRow=document.createElement("div");
      policyRow.className="control-row";
      policyRow.innerHTML='<span>Priority</span>';
      policyRow.appendChild(policySelect);
      card.appendChild(policyRow);
      autoControlList.appendChild(card);
    }
    if(!autoControlList.children.length) autoControlList.appendChild(emptyState("Buy an autobuyer in the Evolution Shop to unlock automation controls."));

    const lineageIdentity=byId("lineage-identity-list"); lineageIdentity.innerHTML="";
    const lineagePolicySummary=byId("lineage-policy-summary"); lineagePolicySummary.innerHTML="";
    const lineageStorySummary=byId("lineage-story-summary"); lineageStorySummary.innerHTML="";
    const lineagePressureSummary=byId("lineage-pressure-summary"); lineagePressureSummary.innerHTML="";
    const lineageUnlocked=Logic.hasLockedLineage();
    const activeSpec=Logic.specializationDef(), eventChoices=Logic.chosenLineageEvents();
    [
      {label:"Lineage",value:lineageUnlocked?Logic.archetypeName(state.game.run.lockedArchetype):"Unformed",sub:lineageUnlocked?"Locked after Creature":"Evolve beyond Creature to lock this run."},
      {label:"Specialization",value:lineageUnlocked?(activeSpec?activeSpec.name:"Open"):"Dormant",sub:lineageUnlocked?(activeSpec?activeSpec.desc:"Choose one permanent fork for this run."):"Specialization begins after lineage lock-in."},
      {label:"Events",value:lineageUnlocked?Logic.fmt(eventChoices.length):"0",sub:lineageUnlocked?"Lineage event choices active":"No lineage story before lock-in."},
      {label:"Victory Path",value:lineageUnlocked?(DATA.VICTORY_VARIANTS[state.game.run.lockedArchetype]||"Galactic Transcendence"):"Unknown",sub:lineageUnlocked?"Galactic ending variant":"Hidden until a lineage forms."}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      lineageIdentity.appendChild(card);
    });

    const specList=byId("specialization-list"); specList.innerHTML="";
    if(!lineageUnlocked) specList.appendChild(emptyState("Specialization unlocks after the Creature stage locks a lineage."));
    else Logic.availableSpecializations().forEach(function(spec){
      const picked=state.game.run.specialization===spec.id, disabled=!!state.game.run.specialization&&!picked;
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+spec.name+'</span>'+badge(picked?"Chosen":(disabled?"Closed":"Fork"),picked?"owned":(disabled?"locked":"available"))+'</div><div class="tiny">'+spec.desc+'</div><div class="effects">'+effectSourceText(spec)+'</div>';
      card.appendChild(cardButton(picked?"Chosen":"Choose",picked||disabled,disabled?"Another specialization is already active.":"Choose this specialization for the run.",function(){ if(Logic.chooseSpecialization(spec.id)) UI.render(); }));
      specList.appendChild(card);
    });

    const eventList=byId("lineage-event-list"); eventList.innerHTML="";
    if(!lineageUnlocked) eventList.appendChild(emptyState("Lineage events begin after a lineage is locked."));
    else {
      const events=Logic.availableLineageEvents();
      if(!events.length) eventList.appendChild(emptyState("No lineage events are available in this stage yet."));
      events.forEach(function(event){
        const chosen=(state.game.run.lineageEvents||{})[event.id];
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge(chosen?"Resolved":"Choice",chosen?"owned":"available")+'</div><div class="tiny">'+event.desc+'</div>';
        (event.choices||[]).forEach(function(choice){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge(chosen===choice.id?"Chosen":(chosen?"Closed":"Option"),chosen===choice.id?"owned":(chosen?"locked":"available"))+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
          row.appendChild(cardButton(chosen===choice.id?"Chosen":"Choose",!!chosen,chosen?"This event has already been resolved.":"Resolve this lineage event.",function(){ if(Logic.chooseLineageEvent(event.id,choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        eventList.appendChild(card);
      });
    }

    const lawList=byId("lineage-law-list"); lawList.innerHTML="";
    const activeDoctrineId=world.activeDoctrine;
    if(activeDoctrineId){
      const doctrine=((DATA.LINEAGE_DOCTRINES||{})[state.game.run.lockedArchetype]||[]).find(function(item){ return item.id===activeDoctrineId; });
      if(doctrine){
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+iconTitle(doctrine.name,"law")+'</span>'+badge("Doctrine","owned")+'</div><div class="tiny">'+doctrine.desc+'</div><div class="effects">'+effectSourceText(doctrine)+'</div>';
        lawList.appendChild(card);
      }
      (world.doctrineEvolutions||[]).forEach(function(evo){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+iconTitle(evo.name,"law")+'</span>'+badge("Evolve","available")+'</div><div class="tiny">'+evo.desc+'</div><div class="effects">'+effectSourceText(evo)+'</div>';
        card.appendChild(cardButton("Evolve Doctrine",false,"Upgrade this doctrine into its advanced form.",function(){ if(Logic.evolveDoctrine(evo.baseDoctrine)) UI.render(); }));
        lawList.appendChild(card);
      });
    } else if((world.doctrines||[]).length){
      (world.doctrines||[]).forEach(function(doctrine){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+iconTitle(doctrine.name,"law")+'</span>'+badge("Doctrine","available")+'</div><div class="tiny">'+doctrine.desc+'</div><div class="effects">'+effectSourceText(doctrine)+'</div>';
        card.appendChild(cardButton("Choose",false,"Choose this repeat-win doctrine for the run.",function(){ if(Logic.chooseDoctrine(doctrine.id)) UI.render(); }));
        lawList.appendChild(card);
      });
    }
    const lawOptions=Logic.availableLineageLaws();
    const adoptedLawId=(state.game.run.lineageLaws||{})[stage.id];
    if(adoptedLawId){
      const law=((DATA.LINEAGE_LAWS||{})[stage.id]||[]).find(function(item){ return item.id===adoptedLawId; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(law.name,"law")+'</span>'+badge("Adopted","owned")+'</div><div class="tiny">'+law.desc+'</div><div class="effects">'+effectSourceText(law)+'</div>';
      lawList.appendChild(card);
    } else if(!lawOptions.length) lawList.appendChild(emptyState("Lineage laws unlock after Civilization for Empire, Solar, and Galactic stages."));
    else lawOptions.forEach(function(law){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(law.name,"law")+'</span>'+badge("Law","available")+'</div><div class="tiny">'+law.desc+'</div><div class="effects">'+effectSourceText(law)+'</div>';
      card.appendChild(cardButton("Adopt",false,"Adopt this permanent stage law.",function(){ if(Logic.chooseLineageLaw(law.id)) UI.render(); }));
      lawList.appendChild(card);
    });
    const currentLawSets=Logic.worldSummary().lawSets;
    (DATA.LAW_SETS||[]).forEach(function(set){
      const active=currentLawSets.some(function(item){ return item.id===set.id; }), chosen=Object.values(state.game.run.lineageLaws||{}), card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(set.name,"law")+'</span>'+badge(active?"Set active":"Law set",active?"owned":"locked")+'</div><div class="tiny">Needs '+set.requires.filter(function(id){ return !chosen.includes(id); }).length+' more matching laws</div><div class="effects">'+effectSourceText(set)+'</div>';
      lawList.appendChild(card);
    });
    (Logic.worldSummary().lawCongress||[]).forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(item.name,"law")+'</span>'+badge("Congress","owned")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
      lawList.appendChild(card);
    });

    const onboardingWrap=byId("onboarding-list");
    const onboardingDetails=byId("onboarding-details");
    const onboardingBeat=Logic.stageOnboardingBeat();
    onboardingWrap.innerHTML="";
    if(!Logic.guidanceEnabled() || !onboardingBeat){
      onboardingDetails.classList.add("hidden");
    } else {
      onboardingDetails.classList.remove("hidden");
      const summaryCard=document.createElement("div");
      summaryCard.className="buy-card onboarding-card onboarding-card-summary";
      summaryCard.innerHTML='<div class="name-row"><span>'+onboardingBeat.title+'</span>'+badge("Now","available")+'</div><div class="tiny">'+onboardingBeat.summary+'</div>';
      onboardingWrap.appendChild(summaryCard);
      (onboardingBeat.cards||[]).forEach(function(item){
        const card=document.createElement("div");
        card.className="buy-card onboarding-card onboarding-card-"+(item.kind||"guide");
        const itemLabel=item.kind==="warning"?"Watch":(item.kind==="choice"?"Choice":(item.kind==="milestone"?"Milestone":"Guide"));
        const itemKind=item.kind==="warning"?"locked":(item.kind==="milestone"?"owned":"available");
        card.innerHTML='<div class="name-row"><span>'+item.title+'</span>'+badge(itemLabel,itemKind)+'</div><div class="tiny">'+item.detail+'</div>';
        onboardingWrap.appendChild(card);
      });
    }

    const goalList=byId("stage-goal-list"); goalList.innerHTML="";
    const goalPriority={ starter_path:-2, score_half:-1, systems_depth:0, tech_depth:1, stable_growth:2 };
    const orderedGoals=Logic.visibleStageGoals().slice().sort(function(a,b){
      const aRank=a.claimed?2:(a.done?0:1), bRank=b.claimed?2:(b.done?0:1);
      return aRank-bRank || (goalPriority[a.id]??10)-(goalPriority[b.id]??10) || a.reward-b.reward || a.name.localeCompare(b.name);
    });
    const focusGoal=orderedGoals.find(function(goal){ return !goal.claimed && !goal.done; }) || orderedGoals.find(function(goal){ return goal.done && !goal.claimed; });
    const showGoalToggle=stage.id==="tribal" && orderedGoals.length>2;
    const renderedGoals=showGoalToggle && !state.ui.stageObjectivesExpanded ? orderedGoals.slice(0,2) : orderedGoals;
    renderedGoals.forEach(function(goal){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+goal.name+'</span>'+badge(goal===focusGoal&&!goal.claimed?"Focus":(goal.claimed?"Claimed":(goal.done?"Ready":"Goal")),goal===focusGoal&&!goal.claimed?"available":(goal.claimed?"owned":(goal.done?"available":"locked")))+'</div><div class="tiny">'+goal.desc+'</div><div class="effects">'+goal.detail+'</div><div class="cost">Reward: '+goal.reward+' EP</div>';
      card.appendChild(cardButton(goal.claimed?"Claimed":"Claim",goal.claimed||!goal.done,goal.done?"Claim this optional objective.":"Goal not complete.",function(){ if(Logic.claimStageGoal(goal.id)) UI.render(); }));
      goalList.appendChild(card);
    });
    if(showGoalToggle){
      const toggleCard=document.createElement("div");
      toggleCard.className="mini-card";
      const hiddenCount=Math.max(0,orderedGoals.length-2);
      toggleCard.innerHTML='<div class="name-row"><span>'+(state.ui.stageObjectivesExpanded?"Hide extra objectives":"Show more objectives")+'</span>'+badge(state.ui.stageObjectivesExpanded?"Open":"More "+hiddenCount,"available")+'</div><div class="tiny">'+(state.ui.stageObjectivesExpanded?"Collapse the lower-priority goals and keep the main tribal push in view.":"Keep the top two tribal goals visible by default, or expand to see the full list.")+'</div>';
      toggleCard.appendChild(cardButton(state.ui.stageObjectivesExpanded?"Show less":"Show more",false,"Toggle the full tribal objective list.",function(){ state.ui.stageObjectivesExpanded=!state.ui.stageObjectivesExpanded; UI.render(); }));
      goalList.appendChild(toggleCard);
    } else if(stage.id!=="tribal" && state.ui.stageObjectivesExpanded){
      state.ui.stageObjectivesExpanded=false;
    }
    if(!goalList.children.length) goalList.appendChild(emptyState("No stage objectives are visible right now."));

    const threatList=byId("threat-list"); threatList.innerHTML="";
    const threats=Logic.threats();
    const scars=Logic.worldSummary().threatScars;
    if(!threats.length && !scars.length) threatList.appendChild(emptyState("No major threats detected."));
    else threats.forEach(function(threat){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+threat.title+'</span>'+badge("Severity "+threat.severity,"locked")+'</div><div class="tiny">'+threat.detail+'</div>';
      Logic.availableThreatProjects().filter(function(project){ return project.threat===threat.id; }).forEach(function(project){
        const done=!!state.game.run.threatProjects[project.id], canResolve=done?false:Logic.canAfford(project.cost);
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+project.name+'</span>'+badge(done?"Resolved":(canResolve?"Project":"Needs resources"),done?"owned":(canResolve?"available":"locked"))+'</div><div class="effects">'+effectSourceText(project)+'</div><div class="cost">Cost: '+Logic.bundleText(project.cost)+'</div>';
        row.appendChild(cardButton(done?"Resolved":"Resolve",done||!canResolve,canResolve?"Complete this project.":"Need resources for this project.",function(){ if(Logic.resolveThreatProject(project.id)) UI.render(); }));
        card.appendChild(row);
      });
      threatList.appendChild(card);
    });
    scars.forEach(function(scar){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+scar.name+'</span>'+badge(scar.mutated?"Mutated":"Scar","locked")+'</div><div class="tiny">Persistent consequence from ignored threats.</div><div class="effects">'+effectSourceText(scar)+'</div>';
      threatList.appendChild(card);
    });
    Logic.worldSummary().transformedScars.forEach(function(scar){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+scar.name+'</span>'+badge("Transformed","owned")+'</div><div class="tiny">A recovered scar now works for the lineage.</div><div class="effects">'+effectSourceText(scar)+'</div>';
      threatList.appendChild(card);
    });

    const routeList=byId("route-list"); routeList.innerHTML="";
    const routes=Logic.resourceRoutes();
    if(!routes.length) routeList.appendChild(emptyState("No active production routes yet."));
    else routes.slice(0,8).forEach(function(route){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+route.name+'</span>'+badge(route.from?"Route":"Output","available")+'</div><div class="tiny">'+(route.from||"No input")+' -> '+(route.to||"No output")+'</div>';
      routeList.appendChild(card);
    });

    const pressureList=byId("pressure-alert-list"); pressureList.innerHTML="";
    const alerts=Logic.pressureAlerts();
    if(!alerts.length) pressureList.appendChild(emptyState("No urgent resource pressure detected."));
    else alerts.forEach(function(alert){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+alert.title+'</span>'+badge(alert.kind,"locked")+'</div><div class="tiny">'+alert.detail+'</div>';
      pressureList.appendChild(card);
    });

    [
      {label:"Doctrine",value:lineageUnlocked?(world.activeDoctrine?(((DATA.LINEAGE_DOCTRINES||{})[state.game.run.lockedArchetype]||[]).find(function(item){ return item.id===world.activeDoctrine; })||{name:"Active Doctrine"}).name:((world.doctrines||[]).length?"Available":"Dormant")):"Dormant",sub:lineageUnlocked?(world.activeDoctrine?"Current repeat-win doctrine":((world.doctrines||[]).length?"A doctrine can be chosen this run":"No doctrine unlocked yet")):"Policies begin after lineage lock-in."},
      {label:"Stage Law",value:lineageUnlocked?(adoptedLawId?(((DATA.LINEAGE_LAWS||{})[stage.id]||[]).find(function(item){ return item.id===adoptedLawId; })||{name:"Adopted"}).name:((lawOptions||[]).length?"Available":"Dormant")):"Dormant",sub:lineageUnlocked?(adoptedLawId?"Permanent law for this stage":((lawOptions||[]).length?"A law choice is waiting":"No law in this stage yet")):"No lineage law before lock-in."},
      {label:"Law Sets",value:lineageUnlocked?Logic.fmt((currentLawSets||[]).length):"0",sub:lineageUnlocked?((currentLawSets||[]).length?"Active policy combinations":"No matching law sets active"):"Policy sets are hidden until lineage matters."},
      {label:"Congress Links",value:lineageUnlocked?Logic.fmt((Logic.worldSummary().lawCongress||[]).length):"0",sub:lineageUnlocked?"Policy synergies with congress blocs":"No lineage congress ties yet."}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      lineagePolicySummary.appendChild(card);
    });

    [
      {label:"Event Choices",value:lineageUnlocked?Logic.fmt(unresolvedLineageEvents.length):"0",sub:lineageUnlocked?(unresolvedLineageEvents.length?"Unresolved lineage decisions":"No unresolved lineage events"):"Lineage story starts after lock-in."},
      {label:"Resolved Events",value:lineageUnlocked?Logic.fmt(eventChoices.length):"0",sub:lineageUnlocked?"Choices already committed this run":"No lineage story has begun."},
      {label:"Archive Weight",value:lineageUnlocked?Logic.fmt((state.game.run.archive||[]).length):"0",sub:lineageUnlocked?"Retired stages feeding lineage memory":"Archive memory is not lineage-specific yet."},
      {label:"Focus",value:lineageUnlocked?"Lineage Story":"Stage Story",sub:lineageUnlocked?"This panel now tracks lineage-specific narrative.":"Generic objectives live in Actions until lock-in."}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      lineageStorySummary.appendChild(card);
    });

    [
      {label:"Threats",value:lineageUnlocked?Logic.fmt(threats.length):"0",sub:lineageUnlocked?(threats.length?"Major issues demanding action":"No major threats detected"):"Threat history starts after lineage lock-in."},
      {label:"Scars",value:lineageUnlocked?Logic.fmt(scars.length):"0",sub:lineageUnlocked?(scars.length?"Persistent consequences are active":"No active lineage scars"):"No lineage scars before lock-in."},
      {label:"Alerts",value:Logic.fmt(alerts.length),sub:alerts.length?"Urgent pressure warnings":"No urgent pressure alerts"},
      {label:"Routes",value:Logic.fmt(routes.length),sub:routes.length?"Active resource routes this stage":"No route network yet"}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      lineagePressureSummary.appendChild(card);
    });

    const worldSummary=byId("world-summary-list"); worldSummary.innerHTML="";
      const worldSummaryRows=[
        {label:"Era",value:world.era?world.era.name:(state.game.meta.galacticWins>0?"Stable":"Locked"),sub:world.era?effectSourceText(world.era):"Era modifiers unlock after first Galactic win."},
        {label:"Slots",value:world.slots.filter(function(s){ return !!s.systemId; }).length+" / "+world.slots.length,sub:"Occupied map locations"},
        {label:"Artifacts",value:world.artifacts.length,sub:"Inherited relics active"},
        {label:"Rivals",value:world.rivals.filter(function(r){ return r.victory; }).length+" / "+world.rivals.length,sub:"Rivals at victory pressure"},
        {label:"Foresight",value:(world.foresight&&world.foresight.activeSignals?world.foresight.activeSignals.length:0)+" live",sub:world.foresight?("Nodes "+world.foresight.nodesUnlocked+"/"+world.foresight.totalNodes+" | Solved "+world.foresight.solvedCount):"Unlock Enlightenment to read fate."},
        {label:"Legacy",value:world.legacyTier?world.legacyTier.name:"Standard",sub:(world.legacyTier&&world.legacyTier.epMult!==1)?("EP x"+world.legacyTier.epMult):"Baseline universe"},
        {label:"Tension",value:world.ascensionTension||0,sub:stage.id==="galactic"?"Ascension instability":"Galactic-only pressure"},
        {label:"Crisis Pressure",value:Logic.crisisIntensityDef().name,sub:Logic.crisisIntensityDef().desc},
        {label:"Crisis Memory",value:Logic.fmt(((world.crisisHistory||{}).resolvedTotal)||0),sub:Logic.fmt(((world.crisisHistory||{}).stages||{})[stage.id]||0)+" resolved in this stage family"},
        {label:"Recovery Projects",value:Logic.fmt((world.specialProjects||[]).filter(function(project){ return !!project.requiresCrisisMemory; }).length),sub:"Crisis-memory infrastructure available now"},
        {label:"Archive Boost",value:"+"+Math.round(Logic.archiveBoostValue()*1000)/10+"%",sub:Object.keys(state.game.meta.seenContent||{}).length+" seen entries"},
        {label:"Offerings",value:Math.round((world.offeringShare||0)*100)+"%",sub:(world.offeringLedger&&world.offeringLedger.totalOfferings)?(world.offeringLedger.totalOfferings+" total offerings made"):"No divine sacrifice yet"},
        {label:"Rituals",value:Logic.fmt((world.rituals||[]).length),sub:(world.rituals||[]).length?"Prepared divine interventions":"No rituals prepared"},
        {label:"Scripts",value:Logic.fmt((world.scripts||[]).filter(function(item){ return item.enabled; }).length),sub:(world.scripts||[]).length?"Active divine logic scripts":"No scripts configured"}
      ];
    (stageSurfaceLevel===0?worldSummaryRows.slice(0,4):(stageSurfaceLevel===1?worldSummaryRows.slice(0,6):worldSummaryRows)).forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      worldSummary.appendChild(card);
    });
    if(stageSurfaceLevel>=1 && world.era && Logic.upgradeLevel("era_control")>0){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">Forecast</div><div class="value">'+(world.forecast?world.forecast.name:"Stable")+'</div><div class="tiny">'+(world.forecast?effectSourceText(world.forecast):"No next era to forecast.")+'</div>';
      card.appendChild(cardButton("Reroll Era",false,"Shift the current era to the next available condition.",function(){ if(Logic.rerollEra()) UI.render(); }));
      worldSummary.appendChild(card);
    }
    const maintenanceCost=Logic.wonderMaintenanceCost();
    if(stageSurfaceLevel>=1 && maintenanceCost){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">Wonder Upkeep</div><div class="value">Every 90s</div><div class="tiny">'+Logic.bundleText(maintenanceCost)+'</div>';
      worldSummary.appendChild(card);
    }

    const milestoneList=byId("milestone-list"); milestoneList.innerHTML="";
    world.unlocks.forEach(function(unlock){
      const active=Logic.hasMetaUnlock(unlock.id), card=document.createElement("div");
      card.className="mini-card";
      const justUnlocked=active && state.game.meta.lastMilestoneWins===unlock.wins;
      card.innerHTML='<div class="name-row"><span>'+unlock.name+'</span>'+badge(justUnlocked?"New":(active?"Unlocked":unlock.wins+" wins"),justUnlocked||active?"owned":"locked")+'</div><div class="tiny">'+unlock.desc+'</div>';
      milestoneList.appendChild(card);
    });

    const mutatorList=byId("mutator-list"); mutatorList.innerHTML="";
    if(deepSystemsDeferred) mutatorList.appendChild(emptyState("Push the core stage spine a little further before optional world conditions start crowding the run."));
    else if(!Logic.hasMetaUnlock("run_mutators")) mutatorList.appendChild(emptyState(Logic.unlockText("run_mutators")));
    else if(world.activeMutator!==null){
      const mut=(DATA.RUN_MUTATORS||[]).find(function(item){ return item.id===world.activeMutator; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+(mut?mut.name:"Skipped")+'</span>'+badge("Chosen","owned")+'</div><div class="tiny">'+(mut?mut.desc:"No mutator for this stage.")+'</div>'+(mut?'<div class="effects">'+effectSourceText(mut)+'</div>':'');
      mutatorList.appendChild(card);
    } else {
      world.mutatorDraft.forEach(function(mutator){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+mutator.name+'</span>'+badge("Draft","available")+'</div><div class="tiny">'+mutator.desc+'</div><div class="effects">'+effectSourceText(mutator)+'</div>';
        card.appendChild(cardButton("Choose",false,"Choose this mutator for the stage.",function(){ if(Logic.chooseMutator(mutator.id)) UI.render(); }));
        mutatorList.appendChild(card);
      });
      const skip=document.createElement("div");
      skip.className="buy-card";
      skip.innerHTML='<div class="name-row"><span>No Mutator</span>'+badge("Safe","available")+'</div><div class="tiny">Skip this stage draft.</div>';
      skip.appendChild(cardButton("Skip",false,"Skip the stage mutator.",function(){ if(Logic.chooseMutator("")) UI.render(); }));
      mutatorList.appendChild(skip);
    }

    const mapList=byId("map-slot-list"); mapList.innerHTML="";
    const layoutCard=document.createElement("div");
    layoutCard.className="buy-card";
    layoutCard.innerHTML='<div class="name-row"><span>Stage Layout</span>'+badge("Mastery "+world.stageMastery,"available")+'</div><div class="tiny">'+(world.activeStageLayout?world.activeStageLayout.desc:"Default stage layout")+'</div>';
    const layoutSelect=document.createElement("select");
    (world.stageLayouts||[]).forEach(function(layout){
      const option=document.createElement("option");
      option.value=layout.id;
      option.textContent=layout.name+(layout.wins?(" - "+layout.wins+" clears"):"");
      layoutSelect.appendChild(option);
    });
    layoutSelect.value=(world.activeStageLayout&&world.activeStageLayout.id)||"standard";
    layoutSelect.onchange=function(event){ if(Logic.chooseStageLayout(stage.id,event.target.value)) UI.render(); };
    layoutCard.appendChild(layoutSelect);
    mapList.appendChild(layoutCard);
    const expandCard=document.createElement("div");
    const expanded=state.game.run.expandedSlots[stage.id]||0, expandCost=2+expanded*2;
    expandCard.className="buy-card";
    expandCard.innerHTML='<div class="name-row"><span>Expand '+stage.name+' Map</span>'+badge(expanded>=3?"Max":"+"+expanded,"available")+'</div><div class="tiny">Adds archetype-leaning slots for buildings and stage systems.</div><div class="cost">Cost: '+expandCost+' EP</div>';
    expandCard.appendChild(cardButton(expanded>=3?"Maxed":"Expand",expanded>=3 || (state.game.meta.evolutionPoints<expandCost&&!state.ui.debug),"Spend EP to add a new slot.",function(){ if(Logic.expandMap()) UI.render(); }));
    mapList.appendChild(expandCard);
    const mapLinkCard=document.createElement("div");
    mapLinkCard.className="buy-card";
    mapLinkCard.innerHTML='<div class="name-row"><span>Placement Board</span>'+badge(world.slots.filter(function(slot){ return !!slot.systemId; }).length+" / "+world.slots.length,"owned")+'</div><div class="tiny">The interactive map now lives in Stage Systems so building placement stays near the systems it affects.</div>';
    mapLinkCard.appendChild(cardButton("Open Stage Map",false,"Jump to the systems map board.",function(){ switchTab("systems"); }));
    mapList.appendChild(mapLinkCard);

    const wonderList=byId("map-wonder-list"); wonderList.innerHTML="";
    if(deepSystemsDeferred){
      wonderList.appendChild(emptyState("Stabilize the stage spine first. Wonders, relic chains, and timeline perks open up once the core lane is online."));
    } else world.slots.forEach(function(slot){
      const builtId=(world.mapWonders||{})[slot.id], built=builtId?(DATA.MAP_WONDERS||[]).find(function(item){ return item.id===builtId; }):null;
      if(built){
        const level=(state.game.run.mapWonderLevels||{})[slot.id]||1, maxLevel=Logic.maxMapWonderLevel(), canUpgrade=level<maxLevel && Logic.canAfford(Logic.mapWonderUpgradeCost(slot.id));
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+built.name+'</span>'+badge("Lv "+level+"/"+maxLevel,"owned")+'</div><div class="tiny">'+slot.name+' landmark.</div><div class="effects">'+effectSourceText(Logic.mapWonderSources().find(function(item){ return item.id===built.id; })||built)+'</div><div class="cost">Upgrade: '+Logic.bundleText(Logic.mapWonderUpgradeCost(slot.id))+'</div>';
        card.appendChild(cardButton(level>=maxLevel?"Maxed":"Upgrade",level>=maxLevel||!canUpgrade,canUpgrade?"Upgrade this wonder.":"Needs resources or max level.",function(){ if(Logic.upgradeMapWonder(slot.id)) UI.render(); }));
        wonderList.appendChild(card);
        return;
      }
      Logic.availableMapWonders(slot.id).forEach(function(wonder){
        const canBuy=Logic.canAfford(wonder.cost), card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+wonder.name+'</span>'+badge(slot.name,canBuy?"available":"locked")+'</div><div class="tiny">Fits '+slot.name+' terrain.</div><div class="effects">'+effectSourceText(wonder)+'</div><div class="cost">Cost: '+Logic.bundleText(wonder.cost)+'</div>';
        card.appendChild(cardButton("Build",!canBuy,canBuy?"Build this wonder in the slot.":"Not enough resources.",function(){ if(Logic.buildMapWonder(wonder.id,slot.id)) UI.render(); }));
        wonderList.appendChild(card);
      });
    });
    if(stageSurfaceLevel>=1) (world.wonderSets||[]).forEach(function(set){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+set.name+'</span>'+badge("Set","owned")+'</div><div class="tiny">'+set.desc+'</div><div class="effects">'+effectSourceText(set)+'</div>';
      wonderList.appendChild(card);
    });
    if(stageSurfaceLevel>=2) (world.artifactFusions||[]).forEach(function(set){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+set.name+'</span>'+badge("Fusion","owned")+'</div><div class="tiny">'+set.desc+'</div><div class="effects">'+effectSourceText(set)+'</div>';
      wonderList.appendChild(card);
    });
    if(stageSurfaceLevel>=1) (world.timelineMilestones||[]).forEach(function(milestone){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+milestone.name+'</span>'+badge("Timeline","owned")+'</div><div class="tiny">'+milestone.desc+'</div><div class="effects">'+effectSourceText(milestone)+'</div>';
      wonderList.appendChild(card);
    });
    if(stageSurfaceLevel>=2) (world.timelineAnchors||[]).forEach(function(anchor){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+anchor.name+'</span>'+badge("Anchor","owned")+'</div><div class="tiny">'+anchor.desc+'</div><div class="effects">'+effectSourceText(anchor)+'</div>';
      wonderList.appendChild(card);
    });
    if(stageSurfaceLevel>=1) (world.masteryRelics||[]).forEach(function(relic){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+relic.name+'</span>'+badge("Relic","owned")+'</div><div class="tiny">'+relic.desc+'</div><div class="effects">'+effectSourceText(relic)+'</div>';
      card.appendChild(cardButton(state.game.meta.activeRelics[Object.keys(DATA.MASTERY_RELICS).find(function(id){ return DATA.MASTERY_RELICS[id].name===relic.name; })]===false?"Enable":"Disable",false,"Toggle this mastery relic for future runs.",function(){
        const stageId=Object.keys(DATA.MASTERY_RELICS).find(function(id){ return DATA.MASTERY_RELICS[id].name===relic.name; });
        if(stageId && Logic.toggleMasteryRelic(stageId)) UI.render();
      }));
      wonderList.appendChild(card);
    });
    if(!wonderList.children.length) wonderList.appendChild(emptyState("No wonder fits the current slots yet."));

    const congressList=byId("congress-list"); congressList.innerHTML="";
    if(stage.id==="empire" && deepSystemsDeferred) congressList.appendChild(emptyState("Finish Provincial Administration and Rail Hub first. Congress plays better once the empire can actually hold itself together."));
    else if(!world.congressProposals.length) congressList.appendChild(emptyState("Congress proposals begin in Empire."));
    else world.congressProposals.forEach(function(proposal){
      const picked=world.congressChoice===proposal.id, closed=!!world.congressChoice&&!picked, card=document.createElement("div");
      const bloc=(DATA.CONGRESS_BLOCS||{})[proposal.bloc];
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+proposal.name+'</span>'+badge(picked?"Passed":(closed?"Closed":"Proposal"),picked?"owned":(closed?"locked":"available"))+'</div><div class="tiny">'+proposal.desc+'</div><div class="effects">'+(bloc?("Bloc: "+bloc.name+" | "):"")+effectSourceText(proposal)+'</div>';
      card.appendChild(cardButton(picked?"Passed":"Pass",picked||closed,closed?"A congress proposal is already active.":"Pass this proposal for the run.",function(){ if(Logic.chooseCongressProposal(proposal.id)) UI.render(); }));
      congressList.appendChild(card);
    });
    if(stageSurfaceLevel>=1 && world.currentCongress && world.nextCongressSeason){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>Congress Season</span>'+badge("Next: "+world.nextCongressSeason.name,"available")+'</div><div class="tiny">Current proposal: '+world.currentCongress.name+'</div>';
      card.appendChild(cardButton("Rotate Season",false,"Rotate congress to the next seasonal proposal.",function(){ if(Logic.rotateCongressSeason()) UI.render(); }));
      congressList.appendChild(card);
    }
    if(stageSurfaceLevel>=2) (world.institutionTraits||[]).forEach(function(trait){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+trait.name+'</span>'+badge("Trait","owned")+'</div><div class="tiny">'+trait.desc+'</div><div class="effects">'+effectSourceText(trait)+'</div>';
      congressList.appendChild(card);
    });
    if(stageSurfaceLevel>=2 && world.congressCrisis){
      const crisis=world.congressCrisis;
      const crisisCard=document.createElement("div");
      crisisCard.className="buy-card";
      crisisCard.innerHTML='<div class="name-row"><span>'+crisis.name+'</span>'+badge(world.congressCrisisChoice?"Resolved":"Crisis",world.congressCrisisChoice?"owned":"locked")+'</div><div class="tiny">'+crisis.desc+'</div><div class="effects">'+effectSourceText(crisis)+'</div>';
      (crisis.choices||[]).forEach(function(choice){
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge(world.congressCrisisChoice===choice.id?"Chosen":(world.congressCrisisChoice?"Closed":"Response"),world.congressCrisisChoice===choice.id?"owned":(world.congressCrisisChoice?"locked":"available"))+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
        row.appendChild(cardButton(world.congressCrisisChoice===choice.id?"Chosen":"Choose",!!world.congressCrisisChoice,world.congressCrisisChoice?"This crisis has already been resolved.":"Choose a congress crisis response.",function(){ if(Logic.chooseCongressCrisisResponse(choice.id)) UI.render(); }));
        crisisCard.appendChild(row);
      });
      congressList.appendChild(crisisCard);
    }
    if(stageSurfaceLevel>=2 && world.institutionCrisis){
      const crisis=world.institutionCrisis;
      const crisisCard=document.createElement("div");
      crisisCard.className="buy-card";
      crisisCard.innerHTML='<div class="name-row"><span>'+crisis.name+'</span>'+badge(world.institutionCrisisChoice?"Resolved":"Institution Crisis",world.institutionCrisisChoice?"owned":"locked")+'</div><div class="tiny">'+crisis.desc+'</div><div class="effects">'+effectSourceText(crisis)+'</div>';
      (crisis.choices||[]).forEach(function(choice){
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge(world.institutionCrisisChoice===choice.id?"Chosen":(world.institutionCrisisChoice?"Closed":"Response"),world.institutionCrisisChoice===choice.id?"owned":(world.institutionCrisisChoice?"locked":"available"))+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
        row.appendChild(cardButton(world.institutionCrisisChoice===choice.id?"Chosen":"Choose",!!world.institutionCrisisChoice,world.institutionCrisisChoice?"This crisis has already been resolved.":"Choose an institution crisis response.",function(){ if(Logic.chooseInstitutionCrisisResponse(choice.id)) UI.render(); }));
        crisisCard.appendChild(row);
      });
      congressList.appendChild(crisisCard);
    }

    const worldEventList=byId("world-event-list"); worldEventList.innerHTML="";
    if(deepSystemsDeferred) worldEventList.appendChild(emptyState("World events stay quiet until the stage's core lane is established."));
    else {
      Object.entries(world.worldEvents||{}).forEach(function(entry){
        const slot=world.slots.find(function(item){ return item.id===entry[0].replace(":chain",""); }), event=Logic.worldEventDef(entry[1]);
        if(!event) return;
        const chosen=world.worldEventChoices[entry[0]];
        const card=document.createElement("div");
        card.className="buy-card";
        const eventLabel=slot?slot.name:(event.kind==="disaster"?"Disaster":(event.kind==="crisis"?"Stage crisis":"Stage event"));
        card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge(eventLabel,"available")+'</div><div class="tiny">'+event.desc+'</div>';
        (event.choices||[]).forEach(function(choice){
          const preview=Logic.worldEventChoicePreview(event,choice);
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge(chosen===choice.id?"Chosen":(chosen?"Closed":"Response"),chosen===choice.id?"owned":(chosen?"locked":"available"))+'</div><div class="effects">'+effectSourceText(preview)+'</div>';
          row.appendChild(cardButton(chosen===choice.id?"Chosen":"Choose",!!chosen,chosen?"This event has already been resolved.":"Choose this event response.",function(){ if(Logic.chooseWorldEventResponse(entry[0],choice.id)) UI.render(); }));
          card.appendChild(row);
        });
        worldEventList.appendChild(card);
      });
      Object.entries(world.crisisAffinity||{}).sort(function(a,b){ return b[1]-a[1]; }).slice(0,3).forEach(function(entry){
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>Hardship Lean</span>'+badge(Logic.archetypeName(entry[0]),"owned")+'</div><div class="tiny">Resolved crises are nudging early evolution toward this lineage. Weight '+Logic.fmt(entry[1])+'</div>';
        worldEventList.appendChild(card);
      });
      (world.crisisMemories||[]).forEach(function(memory){
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+memory.name+'</span>'+badge(memory.path||"Memory","owned")+'</div><div class="tiny">'+(memory.desc||"A resolved crisis has become inherited habit.")+'</div><div class="effects">'+effectSourceText(memory)+'</div>';
        worldEventList.appendChild(card);
      });
      if(!worldEventList.children.length) worldEventList.appendChild(emptyState("No stage crises or slot events are active."));
      if(!Logic.hasMetaUnlock("world_events")) worldEventList.appendChild(emptyState(Logic.unlockText("world_events")+" Slot-specific opportunities and disasters unlock later; stage crises can still appear now."));
    }

    const artifactList=byId("artifact-list"); artifactList.innerHTML="";
    DATA.ARTIFACTS.forEach(function(artifact){
      const owned=!!state.game.meta.artifacts[artifact.id], card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle((owned?artifact.name:"???"),"artifact")+'</span>'+badge(owned?"Inherited":artifact.stage,owned?"owned":"locked")+'</div><div class="tiny">'+(owned?artifact.desc:"Complete strong stage goals to inherit this relic.")+'</div>'+(owned?'<div class="effects">'+effectSourceText(artifact)+'</div>':'');
      artifactList.appendChild(card);
    });
    (DATA.ARTIFACT_SETS||[]).forEach(function(set){
      const owned=(set.requires||[]).every(function(id){ return !!state.game.meta.artifacts[id]; }), card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle((owned?set.name:"Artifact Set"),"artifact")+'</span>'+badge(owned?"Active":"Collection",owned?"owned":"locked")+'</div><div class="tiny">'+(owned?"Set complete.":"Requires "+(set.requires||[]).length+" relics.")+'</div>'+(owned?'<div class="effects">'+effectSourceText(set)+'</div>':'');
      artifactList.appendChild(card);
    });
    if(stageSurfaceLevel>=2) (world.artifactEvolutions||[]).forEach(function(evo){
      const canBuy=Logic.canAfford(evo.cost), card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(evo.name,"artifact")+'</span>'+badge("Reassembly",canBuy?"available":"locked")+'</div><div class="tiny">'+evo.desc+'</div><div class="effects">'+effectSourceText(evo)+'</div><div class="cost">Cost: '+Logic.bundleText(evo.cost)+' | '+evo.wins+' wins</div>';
      card.appendChild(cardButton("Reassemble",!canBuy,canBuy?"Evolve this artifact into a stronger inherited relic.":"Need resources for this reassembly.",function(){ if(Logic.evolveArtifact(evo.id)) UI.render(); }));
      artifactList.appendChild(card);
    });
    if(stageSurfaceLevel>=2) (world.restoredArtifacts||[]).forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(item.name,"artifact")+'</span>'+badge("Restored","owned")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
      artifactList.appendChild(card);
    });
    if(stageSurfaceLevel>=2) (world.restorationChains||[]).forEach(function(item){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(item.name,"artifact")+'</span>'+badge("Chain","owned")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
      artifactList.appendChild(card);
    });
    if(stageSurfaceLevel>=2) Object.keys(world.wornArtifacts||{}).forEach(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      if(!artifact) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(artifact.name,"artifact")+'</span>'+badge("Worn","locked")+'</div><div class="tiny">This relic degraded in a harsh universe and can be restored through a project.</div>';
      artifactList.appendChild(card);
    });

    const contractList=byId("contract-list"); contractList.innerHTML="";
    if(stageSurfaceLevel<2) contractList.appendChild(emptyState(stageSurfaceLevel===0?"Challenge contracts can wait until the stage's core economy is online.":"Stage contracts come after the stage is stable enough to support optional constraints."));
    else if(state.game.meta.galacticWins<=0 && !state.ui.debug) contractList.appendChild(emptyState("Stage contracts unlock after a Galactic victory."));
    else world.contracts.forEach(function(contract){
      const picked=world.activeContract===contract.id, closed=!!world.activeContract&&!picked, canPick=!world.activeContract && (Logic.ownedSystemsForStage().length===0 || state.ui.debug);
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+contract.name+'</span>'+badge(picked?"Active":(closed?"Closed":"Challenge"),picked?"owned":(closed?"locked":"available"))+'</div><div class="tiny">'+contract.desc+'</div><div class="effects">'+effectSourceText(contract)+'</div><div class="cost">Reward: '+contract.reward+' EP on evolve</div>';
      if(contract.after) card.innerHTML+='<div class="effects">Chain tier '+contract.tier+' | Requires '+contract.after+'</div>';
      card.appendChild(cardButton(picked?"Active":"Accept",picked||closed||!canPick,canPick?"Accept this stage contract before building.":"Contracts must be chosen at stage start.",function(){ if(Logic.chooseContract(contract.id)) UI.render(); }));
      contractList.appendChild(card);
    });
    if(!contractList.children.length) contractList.appendChild(emptyState("No contracts available."));

    const rivalList=byId("rival-list"); rivalList.innerHTML="";
    if(deepSystemsDeferred){
      rivalList.appendChild(emptyState("Rival politics surface once the core stage spine is stable enough to support them."));
    } else if(stageSurfaceLevel===1){
      world.rivals.forEach(function(rival){
        const card=document.createElement("div");
        card.className="mini-card";
        applyArchetypeBorder(card,{archetype:rival.archetype});
        const personality=(DATA.RIVAL_PERSONALITIES||[]).find(function(item){ return item.id===rival.personality; });
        const path=(DATA.RIVAL_ASCENSION||{})[rival.path];
        card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(rival.archetype)+'</span>'+badge(rival.victory?"Victory":Logic.fmt(rival.score),rival.victory?"locked":"available")+'</div><div class="bar"><div class="fill" style="width:'+Math.min(100,rival.score)+'%"></div></div><div class="tiny">'+(personality?(personality.name+" | "+personality.desc):"Unknown personality")+'</div><div class="tiny">'+(path?path.name:"No ascension bid")+' | Trend +'+Logic.fmt(rival.trend*60)+'/min</div>';
        rivalList.appendChild(card);
      });
      if(!rivalList.children.length) rivalList.appendChild(emptyState("Rival lineages are not pushing yet."));
    } else (world.vassalDemands||[]).forEach(function(row){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+row.demand.name+'</span>'+badge(Logic.displayArchetypeName(row.archetype),"available")+'</div><div class="tiny">'+row.demand.desc+'</div><div class="effects">'+effectSourceText(row.demand)+'</div>';
      card.appendChild(cardButton("Choose",false,"Resolve this vassal demand.",function(){ if(Logic.chooseVassalDemand(row.archetype,row.demand.id)) UI.render(); }));
      rivalList.appendChild(card);
    });
    if(!deepSystemsDeferred) (world.rivalDefections||[]).forEach(function(row){
      const rival=row.rival, defection=row.defection, card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+defection.name+'</span>'+badge(Logic.displayArchetypeName(rival.archetype),"available")+'</div><div class="tiny">'+defection.desc+'</div><div class="effects">'+effectSourceText(defection)+'</div>';
      card.appendChild(cardButton("Resolve",false,"Use this response against a pressured rival.",function(){ if(Logic.chooseRivalDefection(rival.archetype,defection.id)) UI.render(); }));
      rivalList.appendChild(card);
    });
    if(!deepSystemsDeferred) world.rivalInteractions.forEach(function(event){
      const chosen=Object.values(state.game.run.rivalEvents||{}).includes(event.id), stageChosen=!!(state.game.run.rivalEvents||{})[stage.id];
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+event.name+'</span>'+badge(chosen?"Active":(stageChosen?"Closed":"Interaction"),chosen?"owned":(stageChosen?"locked":"available"))+'</div><div class="tiny">'+event.desc+'</div><div class="effects">'+effectSourceText(event)+'</div>';
      card.appendChild(cardButton(chosen?"Chosen":"Choose",stageChosen,stageChosen?"This stage already has a rival interaction.":"Choose one rival interaction for this stage.",function(){ if(Logic.chooseRivalInteraction(event.id)) UI.render(); }));
      rivalList.appendChild(card);
    });
    world.rivals.forEach(function(rival){
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:rival.archetype});
      const personality=(DATA.RIVAL_PERSONALITIES||[]).find(function(item){ return item.id===rival.personality; });
      const path=(DATA.RIVAL_ASCENSION||{})[rival.path];
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(rival.archetype)+'</span>'+badge(rival.victory?"Victory":Logic.fmt(rival.score),rival.victory?"locked":"available")+'</div><div class="bar"><div class="fill" style="width:'+Math.min(100,rival.score)+'%"></div></div><div class="tiny">'+(personality?(personality.name+" | "+personality.desc):"Unknown personality")+'</div><div class="tiny">'+(path?path.name:"No ascension bid")+' | Trend +'+Logic.fmt(rival.trend*60)+'/min</div>';
      rivalList.appendChild(card);
    });
    if(!deepSystemsDeferred) Object.entries(world.vassals||{}).forEach(function(entry){
      const card=document.createElement("div"), row=entry[1]||{};
      const personality=(DATA.VASSAL_PERSONALITIES||[]).find(function(item){ return item.id===row.personality; });
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:entry[0]});
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(entry[0])+' Vassal</span>'+badge(row.mode||"bound","owned")+'</div><div class="tiny">Persistent support gained from rival resolution. Strength '+(row.count||1)+(personality?(' | '+personality.name):'')+'.</div>';
      rivalList.appendChild(card);
    });
    if(!rivalList.children.length) rivalList.appendChild(emptyState("No rival lineages are active."));

    const hybridList=byId("hybrid-list"); hybridList.innerHTML="";
    if(!Logic.hasMetaUnlock("hybridization")) hybridList.appendChild(emptyState(Logic.unlockText("hybridization")));
    else if(Logic.upgradeLevel("hybridization")<=0 && !state.ui.debug) hybridList.appendChild(emptyState("Buy Secondary Lineage Influence in the Evolution Shop to choose a soft secondary influence."));
    else DATA.ARCHETYPES.filter(function(arch){ return arch.id!==state.game.run.lockedArchetype; }).forEach(function(arch){
      const picked=state.game.run.secondaryArchetype===arch.id, disabled=!!state.game.run.secondaryArchetype&&!picked;
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:arch.id});
      card.innerHTML='<div class="name-row"><span>'+Logic.displayArchetypeName(arch.id)+'</span>'+badge(picked?"Hybrid":(disabled?"Closed":"Available"),picked?"owned":(disabled?"locked":"available"))+'</div><div class="tiny">Adds a smaller second influence to this run.</div>';
      card.appendChild(cardButton(picked?"Chosen":"Choose",picked||disabled,disabled?"A secondary lineage is already selected.":"Choose this secondary lineage.",function(){ if(Logic.chooseSecondaryArchetype(arch.id)) UI.render(); }));
      hybridList.appendChild(card);
    });

    const genesisList=byId("genesis-list"); genesisList.innerHTML="";
    if(!(Logic.futureLayerState("genesis").unlocked || state.ui.debug)){
      genesisList.appendChild(emptyState("Genesis begins once the god can author cradle worlds instead of inheriting them."));
    } else {
      const genesisHead=document.createElement("div");
      genesisHead.className="mini-card";
      genesisHead.innerHTML='<div class="name-row"><span>Authored Consequences</span>'+badge((world.genesisConsequences||[]).length+" live","owned")+'</div><div class="tiny">Your authored world is now pushing concrete bonuses into this stage. Awakened seeds: '+((world.awakenedSeeds||[]).length)+'.</div>';
      genesisList.appendChild(genesisHead);
      const genesisMastery=world.genesisMastery||{};
      const genesisMasteryCard=document.createElement("div");
      genesisMasteryCard.className="mini-card";
      genesisMasteryCard.innerHTML='<div class="name-row"><span>Genesis Mastery</span>'+badge((genesisMastery.cradleWins||0)+"/"+(genesisMastery.cradleTotal||0),"owned")+'</div><div class="tiny">Cradle wins: '+(genesisMastery.cradleWins||0)+' / '+(genesisMastery.cradleTotal||0)+' | Awakened seeds: '+(genesisMastery.awakenedSeeds||0)+' / '+(genesisMastery.awakenedSeedTotal||0)+' | Prime conditions seen: '+(genesisMastery.primesSeen||0)+' / '+(genesisMastery.primeTotal||0)+' | Sacred geographies seen: '+(genesisMastery.geographiesSeen||0)+' / '+(genesisMastery.geographyTotal||0)+'.</div>';
      genesisList.appendChild(genesisMasteryCard);
      const choices=world.genesisChoices||{}, defs=world.genesisDefs||{};
      [["Cradle Worlds","cradleWorld",(defs.cradleWorlds||[])],["Prime Conditions","primeCondition",(defs.primeConditions||[])],["Sacred Geography","sacredGeography",(defs.sacredGeographies||[])],["Dormant Seeds","dormantSeed",(defs.dormantSeeds||[])]].forEach(function(group){
        const head=document.createElement("div");
        head.className="mini-card";
        head.innerHTML='<div class="name-row"><span>'+group[0]+'</span>'+badge("Genesis","owned")+'</div><div class="tiny">Chosen: '+((group[2].find(function(item){ return item.id===choices[group[1]]; })||{}).name||"None")+'</div>';
        genesisList.appendChild(head);
        group[2].forEach(function(item){
          const chosen=choices[group[1]]===item.id;
          const card=document.createElement("div");
          card.className="buy-card layer-genesis";
          card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge(chosen?"Chosen":"Available",chosen?"owned":"available")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
          card.appendChild(cardButton(chosen?"Chosen":"Choose",chosen,"Use this authored world trait for future seeded runs.",function(){ if(Logic.chooseGenesisOption(group[1],item.id)) UI.render(); }));
          genesisList.appendChild(card);
        });
      });
    }

    const apotheosisList=byId("apotheosis-list"); apotheosisList.innerHTML="";
    if(!(Logic.futureLayerState("apotheosis").unlocked || state.ui.debug)){
      apotheosisList.appendChild(emptyState("Apotheosis begins when civilization can knowingly worship the divine."));
    } else {
      const interplayHead=document.createElement("div");
      interplayHead.className="mini-card";
      interplayHead.innerHTML='<div class="name-row"><span>Worship Interplay</span>'+badge((world.apotheosisInterplay||[]).length+" active","owned")+'</div><div class="tiny">Mode, laws, miracles, and heresy now reinforce one another instead of acting like isolated toggles.</div>';
      apotheosisList.appendChild(interplayHead);
      const apotheosisMastery=world.apotheosisMastery||{};
      const apotheosisMasteryCard=document.createElement("div");
      apotheosisMasteryCard.className="mini-card";
      apotheosisMasteryCard.innerHTML='<div class="name-row"><span>Apotheosis Mastery</span>'+badge((apotheosisMastery.worshipWins||0)+"/"+(apotheosisMastery.worshipTotal||0),"owned")+'</div><div class="tiny">Worship victories: '+(apotheosisMastery.worshipWins||0)+' / '+(apotheosisMastery.worshipTotal||0)+' | Miracles used: '+(apotheosisMastery.miraclesUsed||0)+' / '+(apotheosisMastery.miracleTotal||0)+' | Heresy outcomes resolved: '+(apotheosisMastery.heresyOutcomes||0)+' / '+(apotheosisMastery.heresyTotal||0)+' | Laws enacted: '+(apotheosisMastery.lawsEnacted||0)+' / '+(apotheosisMastery.lawTotal||0)+'.</div>';
      apotheosisList.appendChild(apotheosisMasteryCard);
      const modeHead=document.createElement("div");
      modeHead.className="mini-card";
      modeHead.innerHTML='<div class="name-row"><span>Worship Mode</span>'+badge((world.activeWorshipMode||{}).name||"None","owned")+'</div><div class="tiny">How civilization understands and serves the divine.</div>';
      apotheosisList.appendChild(modeHead);
      (world.worshipModes||[]).forEach(function(item){
        const active=(world.activeWorshipMode||{}).id===item.id;
        const card=document.createElement("div");
        card.className="buy-card layer-apotheosis";
        card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge(active?"Active":"Available",active?"owned":"available")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
        card.appendChild(cardButton(active?"Active":"Adopt",active,"Adopt this worship mode.",function(){ if(Logic.chooseWorshipMode(item.id)) UI.render(); }));
        apotheosisList.appendChild(card);
      });
      const lawHead=document.createElement("div");
      lawHead.className="mini-card";
      lawHead.innerHTML='<div class="name-row"><span>Divine Laws</span>'+badge((world.selectedDivineLaws||[]).length+"/"+Logic.maxDivineLawSlots(),"owned")+'</div><div class="tiny">Choose the rules civilization believes the god has written.</div>';
      apotheosisList.appendChild(lawHead);
      (world.divineLaws||[]).forEach(function(item){
        const active=(world.selectedDivineLaws||[]).includes(item.id);
        const card=document.createElement("div");
        card.className="buy-card layer-apotheosis";
        card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge(active?"Enacted":"Available",active?"owned":"available")+'</div><div class="tiny">'+item.desc+'</div><div class="effects">'+effectSourceText(item)+'</div>';
        card.appendChild(cardButton(active?"Revoke":"Enact",!active && (world.selectedDivineLaws||[]).length>=Logic.maxDivineLawSlots(),"Toggle this divine law.",function(){ if(Logic.toggleDivineLaw(item.id)) UI.render(); }));
        apotheosisList.appendChild(card);
      });
      const miracleHead=document.createElement("div");
      miracleHead.className="mini-card";
      miracleHead.innerHTML='<div class="name-row"><span>Miracles</span>'+badge((world.miracleCharges||0)+"/"+(world.maxMiracleCharges||0),"owned")+'</div><div class="tiny">Charges recover over time. Spend Divinity to intervene directly.</div>';
      apotheosisList.appendChild(miracleHead);
      (world.miracles||[]).forEach(function(item){
        const card=document.createElement("div");
        card.className="buy-card layer-apotheosis";
        card.innerHTML='<div class="name-row"><span>'+item.name+'</span>'+badge(item.canPay?"Ready":"Need charge",item.canPay?"available":"locked")+'</div><div class="tiny">'+item.desc+'</div><div class="cost">Cost: '+Logic.bundleText(item.cost||{})+'</div>';
        card.appendChild(cardButton("Invoke",!item.canPay,"Spend miracle charge and Divinity to intervene.",function(){ if(Logic.invokeMiracle(item.id)) UI.render(); }));
        apotheosisList.appendChild(card);
      });
      if(world.heresy){
        const heresyCard=document.createElement("div");
        heresyCard.className="buy-card layer-apotheosis";
        heresyCard.innerHTML='<div class="name-row"><span>'+world.heresy.name+'</span>'+badge("Heresy","available")+'</div><div class="tiny">'+world.heresy.desc+'</div>';
        (world.heresy.responses||[]).forEach(function(response){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+response.name+'</span>'+badge("Response","available")+'</div><div class="effects">'+effectSourceText(response)+'</div>';
          row.appendChild(cardButton("Choose",false,"Resolve this heresy by divine policy.",function(){ if(Logic.resolveHeresy(response.id)) UI.render(); }));
          heresyCard.appendChild(row);
        });
        apotheosisList.appendChild(heresyCard);
      }
    }

    const singularityList=byId("singularity-list"); singularityList.innerHTML="";
    if(!(Logic.futureLayerState("singularity").unlocked || state.ui.debug)){
      singularityList.appendChild(emptyState("Singularity begins when the god enters the machinery of reality itself."));
    } else {
      const relicHead=document.createElement("div");
      relicHead.className="mini-card";
      relicHead.innerHTML='<div class="name-row"><span>Relic Loadout</span>'+badge((world.equippedRelics||[]).length+"/"+(world.relicSlots||0),"owned")+'</div><div class="tiny">Mastery relics now behave as a true loadout rather than always-on memory.</div>';
      singularityList.appendChild(relicHead);
      Object.keys(state.game.meta.masteryRelics||{}).forEach(function(stageId){
        const relic=(DATA.MASTERY_RELICS||{})[stageId];
        if(!relic) return;
        const active=(world.equippedRelics||[]).includes(stageId);
        const card=document.createElement("div");
        card.className="buy-card layer-singularity";
        card.innerHTML='<div class="name-row"><span>'+relic.name+'</span>'+badge(active?"Equipped":"Available",active?"owned":"available")+'</div><div class="tiny">'+relic.desc+'</div><div class="effects">'+effectSourceText(relic)+'</div>';
        card.appendChild(cardButton(active?"Unequip":"Equip",!active && (world.equippedRelics||[]).length>=(world.relicSlots||0),"Toggle this relic in the Singularity loadout.",function(){ if(Logic.toggleMasteryRelic(stageId)) UI.render(); }));
        singularityList.appendChild(card);
      });
      if(!Object.keys(state.game.meta.masteryRelics||{}).length) singularityList.appendChild(emptyState("No mastery relics are unlocked yet. Clear stage mastery lines to build the first loadout."));
      const compressionHead=document.createElement("div");
      compressionHead.className="mini-card";
      compressionHead.innerHTML='<div class="name-row"><span>Compression Bands</span>'+badge("Live","owned")+'</div><div class="tiny">Choose which mastered stages collapse into brisk preludes before the frontier.</div>';
      singularityList.appendChild(compressionHead);
      (world.compressionBands||[]).forEach(function(band){
        const card=document.createElement("div");
        card.className="buy-card layer-singularity";
        card.innerHTML='<div class="name-row"><span>'+band.name+'</span>'+badge(band.active?"Compressed":"Idle",band.active?"owned":"available")+'</div><div class="tiny">Mastery clears: '+band.mastery+' | Compressed stages open with stronger carried bundles and faster output.</div>';
        card.appendChild(cardButton(band.active?"Disable":"Compress",false,"Toggle this stage band for Singularity compression.",function(){ if(Logic.toggleCompressionBand(band.id)) UI.render(); }));
        singularityList.appendChild(card);
      });
      if(!(world.compressionBands||[]).length) singularityList.appendChild(emptyState("No stage bands are mastered enough to compress yet."));
      const coreHead=document.createElement("div");
      coreHead.className="mini-card";
      coreHead.innerHTML='<div class="name-row"><span>Logic Core</span>'+badge((world.activeLogicCore||{}).name||"None","owned")+'</div><div class="tiny">Choose the machine mind that biases automation and long-run priority.</div>';
      singularityList.appendChild(coreHead);
      (world.logicCores||[]).forEach(function(core){
        const active=(world.activeLogicCore||{}).id===core.id;
        const card=document.createElement("div");
        card.className="buy-card layer-singularity";
        card.innerHTML='<div class="name-row"><span>'+core.name+'</span>'+badge(active?"Active":"Available",active?"owned":"available")+'</div><div class="tiny">'+core.desc+'</div>';
        card.appendChild(cardButton(active?"Active":"Adopt",active,"Use this logic core as the primary automation mind.",function(){ if(Logic.chooseLogicCore(core.id)) UI.render(); }));
        singularityList.appendChild(card);
      });
    }

    const omnipotenceList=byId("omnipotence-list"); omnipotenceList.innerHTML="";
    if(!Logic.futureLayerState("omnipotence").unlocked && !state.ui.debug) omnipotenceList.appendChild(emptyState("Unlock Omnipotence to sustain multiple lineages under chosen instability rules."));
    else {
      (world.omnipotenceStances||[]).forEach(function(stance){
        const active=(world.activeInstabilityStance||{}).id===stance.id;
        const card=document.createElement("div");
        card.className="buy-card layer-omnipotence";
        card.innerHTML='<div class="name-row"><span>'+stance.name+'</span>'+badge(active?"Active":"Available",active?"owned":"available")+'</div><div class="tiny">'+stance.desc+'</div><div class="effects">'+effectSourceText(stance)+'</div>';
        card.appendChild(cardButton(active?"Active":"Adopt",active,"Set the contradiction doctrine for hybridized runs.",function(){ if(Logic.chooseInstabilityStance(stance.id)) UI.render(); }));
        omnipotenceList.appendChild(card);
      });
      const lineageStatus=document.createElement("div");
      lineageStatus.className="mini-card";
      const omniMastery=world.omnipotenceMastery||{};
      lineageStatus.innerHTML='<div class="name-row"><span>Lineage Binding Slots</span>'+badge((world.hybridLineages||[]).length+" / "+(world.hybridSlots||0),"available")+'</div><div class="tiny">Bind additional lineages into the same civilization. This is full Omnipotence binding, distinct from shop secondary influence.</div><div class="tiny">Binding pairs run: '+(omniMastery.hybridPairs||0)+' | Instabilities resolved: '+(omniMastery.instabilityEvents||0)+' / '+(omniMastery.instabilityTotal||0)+'.</div>';
      omnipotenceList.appendChild(lineageStatus);
      DATA.ARCHETYPES.filter(function(arch){ return Logic.isArchetypeRevealed(arch.id) || state.ui.debug; }).forEach(function(arch){
        const chosen=(world.hybridLineages||[]).includes(arch.id);
        const card=document.createElement("div");
        card.className="buy-card layer-omnipotence";
        applyArchetypeBorder(card,{archetype:arch.id});
        card.innerHTML='<div class="name-row"><span>'+crestTitle(Logic.displayArchetypeName(arch.id),arch.id)+'</span>'+badge(chosen?"Bound":"Available",chosen?"owned":"available")+'</div><div class="tiny">Keep this lineage active as a permanent hybrid thread.</div>';
        card.appendChild(cardButton(chosen?"Unbind":"Bind",!chosen && (world.hybridLineages||[]).length>=(world.hybridSlots||0),"Toggle this Omnipotence lineage binding.",function(){ if(Logic.toggleHybridLineage(arch.id)) UI.render(); }));
        omnipotenceList.appendChild(card);
      });
      if(world.instabilityEvent){
        const eventCard=document.createElement("div");
        eventCard.className="buy-card layer-omnipotence";
        const pairText=(world.instabilityEvent.pair||[]).length?(" | Pair "+world.instabilityEvent.pair.map(function(id){ return Logic.displayArchetypeName(id); }).join(" + ")):"";
        eventCard.innerHTML='<div class="name-row"><span>'+world.instabilityEvent.name+'</span>'+badge("Instability","locked")+'</div><div class="tiny">'+world.instabilityEvent.desc+pairText+'</div>';
        (world.instabilityEvent.responses||[]).forEach(function(response){
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+response.name+'</span>'+badge("Response","available")+'</div><div class="effects">'+effectSourceText(response)+'</div>'+(response.legacy?('<div class="tiny">Leaves a '+response.legacy.type+': '+response.legacy.name+'</div>'):'');
          row.appendChild(cardButton("Resolve",false,"Choose this response to the current instability.",function(){ if(Logic.resolveInstabilityEvent(response.id)) UI.render(); }));
          eventCard.appendChild(row);
        });
        omnipotenceList.appendChild(eventCard);
      }
      (world.hybridLegacies||[]).forEach(function(legacy){
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+legacy.name+'</span>'+badge(legacy.path,"owned")+'</div><div class="tiny">'+(legacy.desc||"Hybrid history persists.")+'</div><div class="effects">'+effectSourceText(legacy)+'</div>';
        omnipotenceList.appendChild(card);
      });
    }

    const divinityLayerList=byId("divinity-layer-list"); divinityLayerList.innerHTML="";
    if(!Logic.futureLayerState("divinity").unlocked && !state.ui.debug) divinityLayerList.appendChild(emptyState("Unlock Divinity to define the face the cosmos sees and the polarity of prayer it produces."));
    else {
      const divinityMastery=world.divinityMastery||{};
      const divinityMasteryCard=document.createElement("div");
      divinityMasteryCard.className="mini-card";
      divinityMasteryCard.innerHTML='<div class="name-row"><span>Divine Identity Mastery</span>'+badge((divinityMastery.maskWins||0)+"/"+(divinityMastery.maskTotal||0),"owned")+'</div><div class="tiny">Mask victories: '+(divinityMastery.maskWins||0)+' / '+(divinityMastery.maskTotal||0)+' | Polarity victories: '+(divinityMastery.polarityWins||0)+' / '+(divinityMastery.polarityTotal||0)+' | Prayer channels awakened: '+(divinityMastery.channelUnlocks||0)+' / '+(divinityMastery.channelTotal||0)+' | Routing-led runs: '+(divinityMastery.routingRuns||0)+'.</div>';
      divinityLayerList.appendChild(divinityMasteryCard);
      (world.divineMasks||[]).forEach(function(mask){
        const active=(world.activeDivineMask||{}).id===mask.id;
        const card=document.createElement("div");
        card.className="buy-card layer-divinity";
        card.innerHTML='<div class="name-row"><span>'+mask.name+'</span>'+badge(active?"Active":"Available",active?"owned":"available")+'</div><div class="tiny">'+mask.desc+'</div><div class="tiny">'+(mask.behaviorText||"")+'</div><div class="effects">'+effectSourceText(mask)+'</div><div class="tiny">Preferred preset: '+(mask.preferredPreset||"none")+' | Preferred miracle: '+((((world.miracles||[]).find(function(item){ return item.id===mask.preferredMiracle; })||{}).name)||"None")+'</div><div class="tiny">Preferred bloc: '+(mask.preferredBloc||"none")+' | Preferred ascension: '+(mask.preferredAscensionPath||"none")+'</div>';
        card.appendChild(cardButton(active?"Active":"Wear",active,"Set the divine face creation perceives.",function(){ if(Logic.chooseDivineMask(mask.id)) UI.render(); }));
        divinityLayerList.appendChild(card);
      });
      (world.prayerPolarities||[]).forEach(function(polarity){
        const active=(world.activePrayerPolarity||{}).id===polarity.id;
        const card=document.createElement("div");
        card.className="buy-card layer-divinity";
        card.innerHTML='<div class="name-row"><span>'+polarity.name+'</span>'+badge(active?"Routed":"Available",active?"owned":"available")+'</div><div class="tiny">'+polarity.desc+'</div><div class="effects">'+effectSourceText(polarity)+'</div>';
        card.appendChild(cardButton(active?"Active":"Route",active,"Set the dominant worship polarity.",function(){ if(Logic.choosePrayerPolarity(polarity.id)) UI.render(); }));
        divinityLayerList.appendChild(card);
      });
      const routingCard=document.createElement("div");
      routingCard.className="buy-card layer-divinity";
      routingCard.innerHTML='<div class="name-row"><span>Prayer Routing</span>'+badge("Live Allocation","owned")+'</div><div class="tiny">Allocate the prayer of creation across the six divine channels. This changes how Divinity grows during the run.</div>';
      if(world.currentRoutingPreset){
        routingCard.innerHTML+='<div class="tiny">Current preset: '+world.currentRoutingPreset.name+' | Miracle priority: '+(((world.miracles||[]).find(function(item){ return item.id===world.currentRoutingPreset.miraclePriority; })||{}).name||"None")+' | Script bias: '+((world.currentRoutingPreset.scriptPriority||[]).join(", ")||"None")+'</div>';
      }
      if(world.preferredMiracle){
        routingCard.innerHTML+='<div class="tiny">Active divine priority: '+world.preferredMiracle.name+'</div>';
      }
      const presetRow=document.createElement("div");
      presetRow.className="choice-row";
      presetRow.innerHTML='<div class="name-row"><span>Routing Presets</span>'+badge((world.activeDivineMask||{}).name||"Mask","available")+'</div>';
      (world.routingPresets||[]).forEach(function(preset){
        presetRow.appendChild(cardButton(preset.name,false,"Apply this prayer routing preset.",function(){ if(Logic.applyPrayerRoutingPreset(preset.id)) UI.render(); }));
      });
      presetRow.appendChild(cardButton("Mask Bias",false,"Apply the default routing bias for the current divine mask.",function(){ if(Logic.applyMaskPrayerBias()) UI.render(); }));
      routingCard.appendChild(presetRow);
      ["growth","harmony","conquest","wealth","knowledge","transcendence"].forEach(function(key){
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+key.charAt(0).toUpperCase()+key.slice(1)+'</span>'+badge((world.prayerRouting||{})[key]+"%","available")+'</div>';
        row.appendChild(cardButton("-5",false,"Reduce this prayer allocation.",function(){ if(Logic.adjustPrayerRouting(key,-5)) UI.render(); }));
        row.appendChild(cardButton("+5",false,"Increase this prayer allocation.",function(){ if(Logic.adjustPrayerRouting(key,5)) UI.render(); }));
        routingCard.appendChild(row);
      });
      divinityLayerList.appendChild(routingCard);
    }

    const infinityList=byId("infinity-list"); infinityList.innerHTML="";
    if(!Logic.futureLayerState("infinity").unlocked && !state.ui.debug) infinityList.appendChild(emptyState("Unlock Infinity to bind echoes from other histories and borrow strength from the future."));
    else {
      const echoStatus=document.createElement("div");
      echoStatus.className="mini-card";
      echoStatus.innerHTML='<div class="name-row"><span>Echo Bindings</span>'+badge((world.boundEchoes||[]).length+" / "+(world.echoSlots||0),"available")+'</div><div class="tiny">Echoes are reusable residues from older histories.</div>';
      infinityList.appendChild(echoStatus);
      const infinityMastery=world.infinityMastery||{};
      const infinityMasteryCard=document.createElement("div");
      infinityMasteryCard.className="mini-card";
      infinityMasteryCard.innerHTML='<div class="name-row"><span>Recursive Mastery</span>'+badge((infinityMastery.mergedForks||0)+"/"+(infinityMastery.forkTotal||0),"owned")+'</div><div class="tiny">Echoes bound: '+(infinityMastery.echoesBound||0)+' / '+(infinityMastery.echoTotal||0)+' | Debt tiers used: '+(infinityMastery.debtTiers||0)+' / '+(infinityMastery.debtTotal||0)+' | Fork families shaped: '+(infinityMastery.forkFamilies||0)+' | Branch blessings: '+(infinityMastery.branchBlessings||0)+' | Branch scars: '+(infinityMastery.branchScars||0)+'.</div>';
      infinityList.appendChild(infinityMasteryCard);
      (world.infinityEchoes||[]).forEach(function(echo){
        const active=(world.boundEchoes||[]).includes(echo.id);
        const card=document.createElement("div");
        card.className="buy-card layer-infinity";
        card.innerHTML='<div class="name-row"><span>'+echo.name+'</span>'+badge(active?"Bound":"Available",active?"owned":"available")+'</div><div class="tiny">'+echo.desc+'</div><div class="effects">'+effectSourceText(echo)+'</div>';
        card.appendChild(cardButton(active?"Unbind":"Bind",!active && (world.boundEchoes||[]).length>=(world.echoSlots||0),"Bind or release this echo.",function(){ if(Logic.toggleBoundEcho(echo.id)) UI.render(); }));
        infinityList.appendChild(card);
      });
      (world.debtTiers||[]).forEach(function(tier){
        const active=(world.futureDebt||{}).id===tier.id;
        const card=document.createElement("div");
        card.className="buy-card layer-infinity";
        card.innerHTML='<div class="name-row"><span>'+tier.name+'</span>'+badge(active?"Chosen":"Available",active?"owned":"available")+'</div><div class="tiny">'+tier.desc+'</div><div class="effects">'+effectSourceText(tier)+'</div>';
        card.appendChild(cardButton(active?"Active":"Assume Debt",active,"Borrow this much strength from a future run.",function(){ if(Logic.chooseFutureDebtTier(tier.id)) UI.render(); }));
        infinityList.appendChild(card);
      });
      const forkCard=document.createElement("div");
      forkCard.className="buy-card layer-infinity";
      forkCard.innerHTML='<div class="name-row"><span>Fork and Merge</span>'+badge(world.activeFork?world.activeFork.name:((world.mergedForkLessons||[]).length+" lessons"),world.activeFork?"available":"owned")+'</div><div class="tiny">Frontier-aware fork options for '+(world.frontierStageId||"this")+' decide which alternate history lessons can be harvested now.</div>';
      if(world.activeForkModifier) forkCard.innerHTML+='<div class="effects">Active branch modifier: '+effectSourceText({effects:world.activeForkModifier.effects||{}})+'</div><div class="tiny">'+(world.activeForkModifier.desc||"")+'</div>';
      if(world.activeForkBranch){
        const lessons=(world.activeForkBranch.lessons||[]).map(function(lesson,index){
          return (index<(world.activeForkBranch.progress||0)?"[Done] ":"[Open] ")+lesson.label+" - "+lesson.desc;
        });
        forkCard.innerHTML+='<div class="tiny">Branch development: '+Logic.fmt(world.activeForkBranch.progress||0)+' / '+Logic.fmt(world.activeForkBranch.required||0)+'</div><div class="tiny">'+lessons.join("<br>")+'</div>';
        forkCard.appendChild(cardButton("Advance Branch",!(world.activeForkBranch.lessons||[])[world.activeForkBranch.progress||0] || !world.activeFork || !Logic.forkRequirementMet((world.activeForkBranch.lessons||[])[world.activeForkBranch.progress||0]),"Fulfill the next branch lesson if current run conditions are ready.",function(){ if(Logic.advanceForkBranch()) UI.render(); }));
        forkCard.appendChild(cardButton("Merge Finished Branch",!Logic.canMergeFork(),"Merge this completed branch back into the main history.",function(){ if(Logic.mergeFork()) UI.render(); }));
      }
      infinityList.appendChild(forkCard);
      (world.forks||[]).forEach(function(fork){
        const active=world.activeFork&&world.activeFork.id===fork.id;
        const merged=(world.mergedForkLessons||[]).includes(fork.id);
        const card=document.createElement("div");
        card.className="buy-card layer-infinity";
        card.innerHTML='<div class="name-row"><span>'+fork.name+'</span>'+badge(active?"Active":(merged?"Merged":"Available"),active||merged?"owned":"available")+'</div><div class="tiny">'+fork.desc+'</div><div class="effects">'+effectSourceText(fork)+'</div>';
        if(active) card.appendChild(cardButton("Branch Active",true,"Develop the active branch from the summary card above before merging it.",function(){}));
        else card.appendChild(cardButton(merged?"Merged":"Open Fork",merged || !!world.activeFork,"Open this forked history line.",function(){ if(Logic.startFork(fork.id)) UI.render(); }));
        infinityList.appendChild(card);
      });
      if((world.forkArchives||[]).length){
        const archiveCard=document.createElement("div");
        archiveCard.className="buy-card layer-infinity";
        archiveCard.innerHTML='<div class="name-row"><span>Branch Archive</span>'+badge((world.forkArchives||[]).length+" merged","owned")+'</div><div class="tiny">'+(world.forkArchives||[]).slice(-3).map(function(entry){ return (entry.outcomeName||entry.name)+" ("+entry.stageId+")"+(entry.legacy?(" | "+(entry.legacy.type==="scar"?"Scar":"Blessing")+": "+entry.legacy.name):""); }).join("<br>")+'</div>';
        infinityList.appendChild(archiveCard);
      }
    }

    const eternityLayerList=byId("eternity-layer-list"); eternityLayerList.innerHTML="";
    if(!Logic.futureLayerState("eternity").unlocked && !state.ui.debug) eternityLayerList.appendChild(emptyState("Unlock Eternity to write the divine testament and choose which truths survive total resets."));
    else {
      const eternityMastery=world.eternityMastery||{};
      const eternityMasteryCard=document.createElement("div");
      eternityMasteryCard.className="mini-card";
      eternityMasteryCard.innerHTML='<div class="name-row"><span>Final Authorship</span>'+badge((eternityMastery.clausesSealed||0)+"/"+(eternityMastery.clauseTotal||0),"owned")+'</div><div class="tiny">Clauses sealed: '+(eternityMastery.clausesSealed||0)+' / '+(eternityMastery.clauseTotal||0)+' | Canon kinds proven: '+(eternityMastery.canonKinds||0)+' | Weaves sealed: '+(eternityMastery.weavesSealed||0)+' / '+(eternityMastery.weaveTotal||0)+' | Universes preserved: '+(eternityMastery.preservedUniverses||0)+' | Resets cast: '+(eternityMastery.resets||0)+'.</div>';
      eternityLayerList.appendChild(eternityMasteryCard);
      const clauseStatus=document.createElement("div");
      clauseStatus.className="mini-card";
      clauseStatus.innerHTML='<div class="name-row"><span>Divine Testament</span>'+badge((world.activeTestamentClauses||[]).length+" / "+(world.maxTestamentClauses||0),"available")+'</div><div class="tiny">Choose the clauses that define what reality values forever.</div>';
      eternityLayerList.appendChild(clauseStatus);
      (world.testamentClauses||[]).forEach(function(clause){
        const active=(world.activeTestamentClauses||[]).includes(clause.id);
        const card=document.createElement("div");
        card.className="buy-card layer-eternity";
        card.innerHTML='<div class="name-row"><span>'+clause.name+'</span>'+badge(active?"Canonized":"Available",active?"owned":"available")+'</div><div class="tiny">'+clause.desc+'</div><div class="effects">'+effectSourceText(clause)+'</div>';
        card.appendChild(cardButton(active?"Remove":"Canonize",!active && (world.activeTestamentClauses||[]).length>=(world.maxTestamentClauses||0),"Toggle this testament clause.",function(){ if(Logic.toggleTestamentClause(clause.id)) UI.render(); }));
        eternityLayerList.appendChild(card);
      });
      const weaveStatus=document.createElement("div");
      weaveStatus.className="mini-card";
      weaveStatus.innerHTML='<div class="name-row"><span>Permanence Weaves</span>'+badge((world.activePermanenceWeaves||[]).length+" / "+(world.maxPermanenceWeaves||0),"available")+'</div><div class="tiny">These truths endure even when the universe is cast again.</div>';
      eternityLayerList.appendChild(weaveStatus);
      (world.permanenceWeaves||[]).forEach(function(weave){
        const active=(world.activePermanenceWeaves||[]).includes(weave.id);
        const card=document.createElement("div");
        card.className="buy-card layer-eternity";
        card.innerHTML='<div class="name-row"><span>'+weave.name+'</span>'+badge(active?"Woven":"Available",active?"owned":"available")+'</div><div class="tiny">'+weave.desc+'</div><div class="effects">'+effectSourceText(weave)+'</div>';
        card.appendChild(cardButton(active?"Unweave":"Weave",!active && (world.activePermanenceWeaves||[]).length>=(world.maxPermanenceWeaves||0),"Toggle this permanence weave.",function(){ if(Logic.togglePermanenceWeave(weave.id)) UI.render(); }));
        eternityLayerList.appendChild(card);
      });
      const canonStatus=document.createElement("div");
      canonStatus.className="mini-card";
      canonStatus.innerHTML='<div class="name-row"><span>Canonization</span>'+badge((world.canonEntries||[]).length+" / "+(world.maxCanonEntries||0),"available")+'</div><div class="tiny">Declare actual remembered stories, victories, artifacts, and chronicles to be permanent truths of future reality.</div>';
      eternityLayerList.appendChild(canonStatus);
      (world.canonCandidates||[]).forEach(function(entry){
        const active=(world.canonEntries||[]).includes(entry.id);
        const card=document.createElement("div");
        card.className="buy-card layer-eternity";
        card.innerHTML='<div class="name-row"><span>'+entry.name+'</span>'+badge(active?"Canon":"Available",active?"owned":"available")+'</div><div class="tiny">'+entry.kind+' | '+entry.desc+'</div><div class="effects">'+effectSourceText(entry)+'</div>';
        card.appendChild(cardButton(active?"Remove":"Canonize",!active && (world.canonEntries||[]).length>=(world.maxCanonEntries||0),"Toggle this canon entry.",function(){ if(Logic.toggleCanonEntry(entry.id)) UI.render(); }));
        eternityLayerList.appendChild(card);
      });
        if(world.latestUniverseSummary){
          const finalCard=document.createElement("div");
          finalCard.className="buy-card layer-eternity";
          finalCard.innerHTML='<div class="name-row"><span>Latest Preserved Universe</span>'+badge("Canon Report","owned")+'</div><div class="tiny">Theme: '+(world.latestUniverseSummary.theme||"none")+' | Frontier: '+(world.latestUniverseSummary.frontier||"unknown")+' | Wins: '+Logic.fmt(world.latestUniverseSummary.wins||0)+'</div><div class="tiny">Canonized truths: '+(world.latestUniverseSummary.canonSummary||"No canonized truths")+'</div><div class="tiny">Paths retained: '+((world.latestUniverseSummary.paths||[]).join(", ")||"none")+'</div><div class="tiny">Artifacts retained: '+((world.latestUniverseSummary.artifacts||[]).join(", ")||"none")+'</div>';
          finalCard.appendChild(cardButton("Open Final Summary",false,"View the preserved universe as a full canon screen.",function(){ state.ui.universeSummaryOpen=true; UI.render(); }));
          finalCard.appendChild(cardButton("Export Testament",false,"Write this preserved universe into Story and Archive as a final testament.",function(){ if(Logic.exportLatestUniverseTestament()) UI.render(); }));
          eternityLayerList.appendChild(finalCard);
        }
        const inherit=world.eternalInheritances||{};
        if(inherit.law || inherit.lineage || inherit.relic || inherit.memory){
          const inheritCard=document.createElement("div");
          inheritCard.className="buy-card layer-eternity";
          inheritCard.innerHTML='<div class="name-row"><span>Eternal Inheritance</span>'+badge("Rewritten","owned")+'</div><div class="tiny">Law: '+(inherit.law||"None")+'<br>Lineage: '+(inherit.lineage||"None")+'<br>Relic: '+(inherit.relic||"None")+'<br>Memory: '+(inherit.memory||"None")+'</div>';
          eternityLayerList.appendChild(inheritCard);
        }
      }

    const offeringList=byId("offering-list"); offeringList.innerHTML="";
    if(!(Logic.futureLayerState("transcendence").unlocked || state.ui.debug)) offeringList.appendChild(emptyState("Offerings begin in Transcendence, when the god learns to draw power from history instead of only watching it."));
    else if(Logic.transcendenceUpgradeLevel("offering_altars")<=0 && !state.ui.debug) offeringList.appendChild(emptyState("Buy Offering Altars in the Transcendence shop to convert surplus civilization into Divinity."));
    else if(!world.offerings.length) offeringList.appendChild(emptyState("No offering rites are available yet."));
    else {
      const economyCard=document.createElement("div");
      economyCard.className="mini-card";
      economyCard.innerHTML='<div class="name-row"><span>Offering Economy</span>'+badge(Math.round((world.offeringShare||0)*100)+"%","owned")+'</div><div class="tiny">Share of this run\'s Divinity drawn from sacrifice rather than passive worship. Total offerings: '+(((world.offeringLedger||{}).totalOfferings)||0)+'.</div>';
      offeringList.appendChild(economyCard);
      world.offerings.forEach(function(offering){
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+offering.name+'</span>'+badge(offering.canPay?"Ready":"Need surplus",offering.canPay?"available":"locked")+'</div><div class="tiny">'+offering.desc+'</div><div class="cost">Offer: '+Logic.bundleText(offering.cost||{})+(offering.populationCost?(" | Population -"+offering.populationCost):"")+'</div><div class="effects">Gain: '+Logic.bundleText(offering.gain||{})+'</div>';
        card.appendChild(cardButton("Offer",!offering.canPay,offering.canPay?"Transform mortal surplus into Divinity.":"Need more surplus before this rite can be offered.",function(){ if(Logic.makeOffering(offering.id)) UI.render(); }));
        offeringList.appendChild(card);
      });
    }

    const ritualList=byId("ritual-list"); ritualList.innerHTML="";
    if(!(Logic.futureLayerState("transcendence").unlocked || state.ui.debug)) ritualList.appendChild(emptyState("Rituals awaken once the god stands beyond creation."));
    else if(Logic.transcendenceUpgradeLevel("ritual_reserve")<=0 && !state.ui.debug) ritualList.appendChild(emptyState("Buy Ritual Reserve in the Transcendence shop to invoke divine rites during a run."));
    else if(!world.rituals.length) ritualList.appendChild(emptyState("No rituals are prepared yet."));
    else world.rituals.forEach(function(ritual){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+ritual.name+'</span>'+badge(ritual.cooldownRemaining>0?("Cooling "+Math.ceil(ritual.cooldownRemaining)+"s"):(ritual.canPay?"Ready":"Need grace"),ritual.cooldownRemaining>0?"locked":(ritual.canPay?"available":"locked"))+'</div><div class="tiny">'+ritual.desc+'</div><div class="cost">Cost: '+Logic.bundleText(ritual.cost||{})+'</div>';
      if(ritual.effects&&ritual.effects.grant) card.innerHTML+='<div class="effects">Grant: '+Logic.bundleText(ritual.effects.grant)+'</div>';
      if(ritual.effects&&ritual.effects.projectProgress) card.innerHTML+='<div class="effects">Project progress: +'+Logic.fmt(ritual.effects.projectProgress)+'</div>';
      if(ritual.effects&&ritual.effects.surgeSeconds) card.innerHTML+='<div class="effects">Surge: +'+Math.round((ritual.effects.surgeOutput||0)*100)+'% for '+ritual.effects.surgeSeconds+'s</div>';
      card.appendChild(cardButton("Invoke",!ritual.canPay || ritual.cooldownRemaining>0,ritual.canPay?"Invoke this rite now.":"Need enough Divinity channels first.",function(){ if(Logic.performRitual(ritual.id)) UI.render(); }));
      ritualList.appendChild(card);
    });

    const scriptList=byId("script-list"); scriptList.innerHTML="";
    if(!(Logic.futureLayerState("transcendence").unlocked || state.ui.debug)) scriptList.appendChild(emptyState("Scripts awaken after the god learns to intervene from outside causality."));
    else if(Logic.transcendenceUpgradeLevel("script_lattice")<=0 && !state.ui.debug) scriptList.appendChild(emptyState("Buy Script Lattice in the Transcendence shop to automate divine intervention."));
    else if(!world.scripts.length) scriptList.appendChild(emptyState("No script patterns are available yet."));
    else world.scripts.forEach(function(script){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+script.name+'</span>'+badge(script.enabled?"Enabled":"Disabled",script.enabled?"owned":"available")+'</div><div class="tiny">'+script.desc+'</div><div class="tiny">Condition: '+script.condition.replace(/_/g," ")+'</div>';
      card.appendChild(cardButton(script.enabled?"Disable":"Enable",false,"Toggle this divine script.",function(){ if(Logic.toggleScript(script.id)) UI.render(); }));
      scriptList.appendChild(card);
    });

    const projectList=byId("project-list"); projectList.innerHTML="";
    const activeProject=Logic.specialProjectDef();
    if(world.pendingProject){
      const pending=world.pendingProject, card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(pending.name,"project")+'</span>'+badge("Complete","available")+'</div><div class="tiny">Choose how this project resolves.</div>';
      if(pending.scarRecovery){
        Object.keys(state.game.meta.threatScars||{}).filter(function(id){ return !state.game.meta.transformedScars[id]; }).forEach(function(id){
          const transform=(DATA.SCAR_TRANSFORMS||{})[id];
          if(!transform) return;
          const row=document.createElement("div");
          row.className="choice-row";
          row.innerHTML='<div class="name-row"><span>'+transform.name+'</span>'+badge("Transform","available")+'</div><div class="effects">'+effectSourceText(transform)+'</div>';
          row.appendChild(cardButton("Transform",false,"Transform this scar.",function(){ if(Logic.chooseProjectCompletion(id)) UI.render(); }));
          card.appendChild(row);
        });
      } else (pending.choices||[]).forEach(function(choice){
        const row=document.createElement("div");
        row.className="choice-row";
        row.innerHTML='<div class="name-row"><span>'+choice.name+'</span>'+badge("Branch","available")+'</div><div class="effects">'+effectSourceText(choice)+'</div>';
        row.appendChild(cardButton("Choose",false,"Choose this completion branch.",function(){ if(Logic.chooseProjectCompletion(choice.id)) UI.render(); }));
        card.appendChild(row);
      });
      projectList.appendChild(card);
    } else if(activeProject && state.game.run.specialProject){
      const pct=Math.min(100,Math.round((state.game.run.specialProject.progress/activeProject.duration)*100));
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+iconTitle(activeProject.name,"project")+'</span>'+badge(pct+"%","available")+'</div><div class="tiny">'+activeProject.desc+'</div><div class="bar"><div class="fill" style="width:'+pct+'%"></div></div>';
      projectList.appendChild(card);
    } else {
      const visibleProjects=deepSystemsDeferred
        ? world.allSpecialProjects.filter(function(project){
            return project.id==="ftl_research" || project.requiresPath || project.id.indexOf("rival_")===0;
          }).slice(0,3)
        : (stageSurfaceLevel===1
          ? world.allSpecialProjects.filter(function(project){
              return !project.targetArchetype && !project.scarRecovery && !project.recoverArtifact;
            }).slice(0,5)
          : world.allSpecialProjects);
      visibleProjects.forEach(function(project){
        const reason=Logic.projectLockReason(project), canBuy=!reason, card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+iconTitle(project.name,"project")+'</span>'+badge(canBuy?"Project":"Locked",canBuy?"available":"locked")+'</div><div class="tiny">'+project.desc+'</div><div class="effects">'+effectSourceText(project)+'</div><div class="cost">Cost: '+Logic.bundleText(Logic.discountedProjectCost(project.cost))+' | Time '+project.duration+'s</div>'+(project.targetArchetype?'<div class="effects">Counter-project vs '+Logic.displayArchetypeName(project.targetArchetype)+'</div>':'')+(reason?'<div class="lock-reason">'+reason+'</div>':'');
        card.appendChild(cardButton("Start",!canBuy,canBuy?"Start this long project.":reason,function(){ if(Logic.startSpecialProject(project.id)) UI.render(); }));
        projectList.appendChild(card);
      });
      if(!projectList.children.length) projectList.appendChild(emptyState(deepSystemsDeferred?"Core-stage projects are quiet until the main lane is online.":"No special project is available in this stage."));
    }

    const ascensionPathList=byId("ascension-path-list"); ascensionPathList.innerHTML="";
    if(stage.id!=="galactic") ascensionPathList.appendChild(emptyState("Ascension paths unlock in Galactic."));
    else if(state.game.run.ascensionPath){
      const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===state.game.run.ascensionPath; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+path.name+'</span>'+badge("Committed","owned")+'</div><div class="tiny">'+path.desc+'</div><div class="effects">'+effectSourceText(path)+'</div>';
      ascensionPathList.appendChild(card);
      world.ascensionObjectives.forEach(function(obj){
        const row=document.createElement("div");
        row.className="mini-card";
        row.innerHTML='<div class="name-row"><span>'+obj.name+'</span>'+badge(obj.done?("+"+obj.reward+" EP"):"Objective",obj.done?"owned":"locked")+'</div><div class="tiny">'+obj.detail+'</div>';
        ascensionPathList.appendChild(row);
      });
    } else (DATA.ASCENSION_PATHS||[]).forEach(function(path){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+path.name+'</span>'+badge("Path","available")+'</div><div class="tiny">'+path.desc+'</div><div class="effects">'+effectSourceText(path)+'</div>';
      card.appendChild(cardButton("Commit",false,"Commit to this Galactic victory build.",function(){ if(Logic.chooseAscensionPath(path.id)) UI.render(); }));
      ascensionPathList.appendChild(card);
    });

    const templateList=byId("template-list"); templateList.innerHTML="";
    const saveCard=document.createElement("div");
    saveCard.className="buy-card";
    saveCard.innerHTML='<div class="name-row"><span>Current Build</span>'+badge("Template","available")+'</div><div class="tiny">Stores autobuyer settings, specialization, and late-run path or bloc intent for later runs.</div>';
    saveCard.appendChild(cardButton("Save Template",false,"Save current settings.",function(){ if(Logic.saveBuildTemplate("Default")) UI.render(); }));
    templateList.appendChild(saveCard);
    const seedCard=document.createElement("div");
    seedCard.className="buy-card";
    seedCard.innerHTML='<div class="name-row"><span>Favorite Loadout</span>'+badge("Archive","available")+'</div><div class="tiny">Seed a template from pinned archive memory.</div>';
    seedCard.appendChild(cardButton("Seed Template",false,"Create a template from archive favorites.",function(){ if(Logic.seedTemplateFromFavorite()) UI.render(); }));
    templateList.appendChild(seedCard);
    const mapPresetCard=document.createElement("div");
    mapPresetCard.className="buy-card";
    mapPresetCard.innerHTML='<div class="name-row"><span>Current World Layout</span>'+badge("Preset","available")+'</div><div class="tiny">Stores this stage map slot assignments separately from automation templates.</div>';
    mapPresetCard.appendChild(cardButton("Save Layout",false,"Save current slot assignments.",function(){ if(Logic.saveMapPreset(stage.id+" Layout")) UI.render(); }));
    templateList.appendChild(mapPresetCard);
    Object.entries(world.templates).forEach(function(entry){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+entry[0]+'</span>'+badge("Saved","owned")+'</div><div class="tiny">Target '+(entry[1].autoOrganelleTarget||"-")+' | Spec '+(entry[1].specialization||"none")+' | Doctrine '+(entry[1].doctrine||"none")+(entry[1].favoriteSource?(" | "+entry[1].favoriteSource):"")+'</div><div class="tiny">Path '+(entry[1].preferredAscensionPath||"none")+' | Bloc '+(entry[1].preferredCongressBloc||"none")+' | Mask '+((((world.divineMasks||[]).find(function(item){ return item.id===entry[1].preferredMask; })||{}).name)||"none")+'</div>';
      card.appendChild(cardButton("Apply",false,"Apply this template.",function(){ if(Logic.applyBuildTemplate(entry[0])) UI.render(); }));
      templateList.appendChild(card);
    });
    Object.entries(world.mapPresets).forEach(function(entry){
      const card=document.createElement("div");
      const usable=entry[1].stageId===stage.id;
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+entry[0]+'</span>'+badge(usable?"Layout":"Other stage",usable?"owned":"locked")+'</div><div class="tiny">Stage '+entry[1].stageId+' | '+(entry[1].slots||[]).filter(function(row){ return !!row.systemId; }).length+' placements</div>';
      card.appendChild(cardButton("Apply",!usable,usable?"Apply this map layout.":"This preset belongs to another stage.",function(){ if(Logic.applyMapPreset(entry[0])) UI.render(); }));
      templateList.appendChild(card);
    });

    const codex=Logic.codexSummary(), codexSummary=byId("codex-summary-list"); codexSummary.innerHTML="";
    [
      {label:"Revealed",value:Logic.fmt(codex.archetypesRevealed),sub:"Known archetypes"},
      {label:"Wins",value:Logic.fmt(state.game.meta.galacticWins),sub:"Galactic victories"},
      {label:"Specializations",value:Logic.fmt(codex.specializations),sub:"Discovered forks"},
      {label:"Events",value:Logic.fmt(codex.events),sub:"Resolved choices"},
      {label:"Timeline",value:Logic.fmt(codex.timelineRecords||0),sub:"Historical records"},
      {label:"Dossiers",value:Logic.fmt(Object.keys(codex.dossiers||{}).length),sub:"Studied rival lineages"},
      {label:"Anchors",value:Logic.fmt((codex.timelineAnchors||[]).length),sub:"Pinned history bonuses"},
      {label:"Museum Perks",value:Logic.fmt((codex.museumRewards||[]).length),sub:"Repeat endings completed"},
      {label:"Seen Content",value:Logic.fmt(codex.content),sub:"Archive generation +"+Math.round(codex.archiveBoost*1000)/10+"%"}
    ].forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      codexSummary.appendChild(card);
    });

    const story=Logic.storySummary(), storySummary=byId("story-summary-list"); storySummary.innerHTML="";
    [
      {label:"Scripture",value:Logic.fmt(story.total),sub:"Recorded passages"},
      {label:"Latest",value:story.latest?story.latest.title:"None yet",sub:story.latest?(story.latest.layer+" scripture"):"No divine record has been written yet"},
      {label:"Evolution",value:Logic.fmt(story.layers.Evolution||0),sub:"Trials and awakenings"},
      {label:"Beyond Evolution",value:Logic.fmt(story.total-(story.layers.Evolution||0)),sub:"Solar, Galactic, and later divine chapters"}
    ].forEach(function(item){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+item.label+'</div><div class="value">'+item.value+'</div><div class="tiny">'+item.sub+'</div>';
      storySummary.appendChild(card);
    });
    const storyFilterBar=byId("story-filter-bar"); storyFilterBar.innerHTML="";
    ["all"].concat(Logic.storyLayers()).forEach(function(id){
      const btn=document.createElement("button");
      btn.className=state.ui.storyFilter===id?"tab active":"tab";
      btn.textContent=id==="all"?"All":id;
      btn.onclick=function(){ state.ui.storyFilter=id; UI.render(); };
      storyFilterBar.appendChild(btn);
    });
    const storyList=byId("story-list"); storyList.innerHTML="";
    story.entries.filter(function(entry){ return state.ui.storyFilter==="all" || entry.layer===state.ui.storyFilter; }).forEach(function(entry){
        const card=document.createElement("div");
        const isTestament=!!entry.dynamic || /^Final Testament:/i.test(entry.title||"");
        card.className="buy-card story-card"+(isTestament?" story-card-testament":"");
        if(isTestament){
          card.innerHTML='<div class="story-testament-kicker">Final Testament</div><div class="name-row"><span>'+entry.title.replace(/^Final Testament:\s*/i,"")+'</span>'+badge(entry.layer,"owned")+'</div><div class="story-testament-body">'+((entry.lines&&entry.lines.length)?entry.lines.map(function(line){ return "<div class=\"story-testament-line\">"+line+"</div>"; }).join(""):entry.text)+'</div>';
        }else{
        card.innerHTML='<div class="name-row"><span>'+entry.title+'</span>'+badge(entry.layer,"owned")+'</div><div class="tiny">'+entry.text+'</div>';
      }
      storyList.appendChild(card);
    });
    if(!storyList.children.length) storyList.appendChild(emptyState("No scripture has been written for this layer yet."));
    const codexArch=byId("codex-archetype-list"); codexArch.innerHTML="";
    DATA.ARCHETYPES.forEach(function(arch){
      const revealed=Logic.isArchetypeRevealed(arch.id), wins=(codex.archetypeWins||{})[arch.id]||0;
      const dossier=(codex.dossiers||{})[arch.id]||{};
      const card=document.createElement("div");
      card.className="mini-card";
      if(revealed) applyArchetypeBorder(card,{archetype:arch.id});
      card.innerHTML='<div class="name-row"><span>'+crestTitle(Logic.displayArchetypeName(arch.id),arch.id)+'</span>'+badge(wins?("Wins "+wins):(revealed?"Known":"Hidden"),wins||revealed?"owned":"locked")+'</div><div class="tiny">'+(revealed?(arch.rarity+" | "+(DATA.VICTORY_VARIANTS[arch.id]||"Galactic Transcendence")):"Discover by evolving into this lineage.")+'</div>'+(dossier.studied?'<div class="effects">Dossier: pressure '+(dossier.studied||0)+' | victories '+(dossier.victories||0)+' | defections '+(dossier.defections||0)+'</div>':'');
      codexArch.appendChild(card);
    });
    (codex.pathEntries||[]).forEach(function(entry){
      const revealed=Logic.isArchetypeRevealed(entry.archetype);
      if(!revealed) return;
      const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===entry.path; });
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:entry.archetype});
      const specializations=Object.keys(entry.specializations||{});
      card.innerHTML='<div class="name-row"><span>'+crestTitle(Logic.displayArchetypeName(entry.archetype)+" - "+(path?path.name:entry.path),entry.archetype)+'</span>'+badge(entry.count?("Recorded x"+entry.count):"Unwritten",entry.count?"owned":"locked")+'</div><div class="tiny">'+(entry.count?(entry.lastName||"Recorded ending"):"This lineage has not completed this ascension yet.")+'</div><div class="tiny">'+(specializations.length?("Specializations: "+specializations.join(", ")):"No specialization record yet.")+'</div>';
      codexArch.appendChild(card);
    });
    Object.entries(codex.stageMastery||{}).forEach(function(entry){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+entry[0]+' Mastery</span>'+badge("Clears "+entry[1],"owned")+'</div><div class="tiny">Repeated clears unlock alternate stage layouts.</div>';
      codexArch.appendChild(card);
    });
    Object.keys(codex.masteryRelics||{}).forEach(function(stageId){
      const relic=(DATA.MASTERY_RELICS||{})[stageId];
      if(!relic) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+relic.name+'</span>'+badge("Mastery Relic","owned")+'</div><div class="tiny">'+relic.desc+'</div><div class="effects">'+effectSourceText(relic)+'</div><div class="tiny">Currently '+(state.game.meta.activeRelics[stageId]===false?"disabled":"active")+'</div>';
      codexArch.appendChild(card);
    });
    if(!Logic.evolutionChallengesUnlocked() && !state.ui.debug){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>Evolution Challenges</span>'+badge("Dormant","locked")+'</div><div class="tiny">These divine trials awaken after the first Galactic rebirth. Complete every challenge to unlock Enlightenment.</div>';
      codexArch.appendChild(card);
    } else Object.entries(DATA.EVOLUTION_CHALLENGES||{}).forEach(function(entry){
      entry[1].forEach(function(challenge){
        const key=entry[0]+":"+challenge.id, done=!!(codex.masteryChallenges||{})[key], card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+(done?challenge.name:"???")+'</span>'+badge(done?"Mastery":"Locked",done?"owned":"locked")+'</div><div class="tiny">'+(done?challenge.desc:("Complete the "+entry[0]+" Evolution challenge to reveal this mastery."))+'</div>';
        codexArch.appendChild(card);
      });
    });
    Object.keys(codex.artifactEvolutions||{}).forEach(function(id){
      const evo=(DATA.ARTIFACT_EVOLUTIONS||[]).find(function(item){ return item.id===id; });
      if(!evo) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+evo.name+'</span>'+badge("Artifact Evo","owned")+'</div><div class="tiny">'+evo.desc+'</div><div class="effects">'+effectSourceText(evo)+'</div>';
      codexArch.appendChild(card);
    });
    (DATA.ARCHIVE_MILESTONES||[]).forEach(function(milestone){
      const active=(state.game.meta.seenContent&&Object.keys(state.game.meta.seenContent).length>=milestone.count), card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+milestone.name+'</span>'+badge(active?"Active":milestone.count+" seen",active?"owned":"locked")+'</div><div class="tiny">Archive milestone</div><div class="effects">'+effectSourceText(milestone)+'</div>';
      codexArch.appendChild(card);
    });
    (DATA.TIMELINE_MILESTONES||[]).forEach(function(milestone){
      const active=(codex.timelineRecords||0)>=milestone.count, card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+milestone.name+'</span>'+badge(active?"Active":milestone.count+" records",active?"owned":"locked")+'</div><div class="tiny">'+milestone.desc+'</div><div class="effects">'+effectSourceText(milestone)+'</div>';
      codexArch.appendChild(card);
    });
    (codex.timelineAnchors||[]).forEach(function(anchor){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+anchor.name+'</span>'+badge("Anchor","owned")+'</div><div class="tiny">'+anchor.desc+'</div><div class="effects">'+effectSourceText(anchor)+'</div>';
      codexArch.appendChild(card);
    });
    const codexSpec=byId("codex-specialization-list"); codexSpec.innerHTML="";
    Object.entries(DATA.SPECIALIZATIONS).forEach(function(entry){
      entry[1].forEach(function(spec){
        const key=entry[0]+":"+spec.id, seen=!!state.game.meta.seenSpecializations[key];
        const card=document.createElement("div");
        card.className="mini-card";
        card.innerHTML='<div class="name-row"><span>'+(seen?spec.name:"???")+'</span>'+badge(seen?Logic.archetypeName(entry[0]):"Hidden",seen?"owned":"locked")+'</div><div class="tiny">'+(seen?spec.desc:"Choose this fork in a run to record it.")+'</div>';
        codexSpec.appendChild(card);
      });
    });
    const codexEvents=byId("codex-event-list"); codexEvents.innerHTML="";
    DATA.LINEAGE_EVENTS.forEach(function(event){
      const seenChoices=(event.choices||[]).filter(function(choice){ return !!state.game.meta.seenEvents[event.id+":"+choice.id]; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+crestTitle((seenChoices.length?event.name:"???"),event.archetype)+'</span>'+badge(seenChoices.length?Logic.archetypeName(event.archetype):"Hidden",seenChoices.length?"owned":"locked")+'</div><div class="tiny">'+(seenChoices.length?("Choices: "+seenChoices.map(function(choice){ return choice.name; }).join(", ")):"Resolve this event in a run to record it.")+'</div>';
      codexEvents.appendChild(card);
    });
    (DATA.STAGE_CRISES||[]).concat(DATA.STAGE_DISASTERS||[]).forEach(function(event){
      const seenChoices=(event.choices||[]).filter(function(choice){ return !!state.game.meta.seenEvents[event.id+":"+choice.id]; });
      const card=document.createElement("div");
      card.className="mini-card";
      const label=event.kind==="disaster"?"Disaster":("Crisis - "+(event.stage||((event.stages||[])[0])||"World"));
      card.innerHTML='<div class="name-row"><span>'+(seenChoices.length?event.name:"???")+'</span>'+badge(seenChoices.length?label:"Hidden",seenChoices.length?"owned":"locked")+'</div><div class="tiny">'+(seenChoices.length?("Responses: "+seenChoices.map(function(choice){ return choice.name; }).join(", ")):"Resolve this stage pressure event in a run to record it.")+'</div>';
      codexEvents.appendChild(card);
    });
    (((codex.crisisHistory||{}).responses)||[]).slice(0,5).forEach(function(response){
      const card=document.createElement("div");
      card.className="mini-card";
      const lean=Object.entries(response.affinity||{}).sort(function(a,b){ return b[1]-a[1]; })[0];
      card.innerHTML='<div class="name-row"><span>'+(response.eventName||"Recorded Crisis")+'</span>'+badge((response.kind||"crisis")+" memory","owned")+'</div><div class="tiny">Response: '+(response.choiceName||"Unknown")+' | Stage: '+(response.stage||"unknown")+(lean?(' | Lean: '+Logic.archetypeName(lean[0])):'')+'</div>';
      codexEvents.appendChild(card);
    });
    (codex.victories||[]).forEach(function(victory){
      const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===victory.ascensionPath; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+crestTitle(victory.name,victory.archetype)+'</span>'+badge(Logic.archetypeName(victory.archetype),"owned")+'</div><div class="tiny">Path: '+(path?path.name:(victory.ascensionPath||"None"))+' | Specialization: '+(victory.specialization||"None")+' | Objectives: '+((victory.objectives||[]).length)+'</div>';
      codexEvents.appendChild(card);
    });
    (codex.pathEntries||[]).forEach(function(entry){
      if(!Logic.isArchetypeRevealed(entry.archetype)) return;
      const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===entry.path; });
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+crestTitle((path?path.name:entry.path)+" Record",entry.archetype)+'</span>'+badge(entry.count?("Archive x"+entry.count):"Locked",entry.count?"owned":"locked")+'</div><div class="tiny">'+Logic.displayArchetypeName(entry.archetype)+' | '+(entry.count?(entry.lastName||"Recorded ending"):"No completed ending for this archetype-path pair yet.")+'</div>';
      codexEvents.appendChild(card);
    });
    (codex.rivalEndings||[]).forEach(function(ending){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+crestTitle(ending.name,ending.archetype||"humanoid")+'</span>'+badge("Rival Ending","locked")+'</div><div class="tiny">A rival reached victory pressure before transcendence.</div><div class="tiny">Path: '+(ending.path||"unknown")+'</div>';
      codexEvents.appendChild(card);
    });
    Object.entries(codex.dossiers||{}).forEach(function(entry){
      const topPath=Object.entries(entry[1].paths||{}).sort(function(a,b){ return b[1]-a[1]; })[0];
      const topEra=Object.entries(entry[1].eras||{}).sort(function(a,b){ return b[1]-a[1]; })[0];
      const tree=Object.entries(entry[1].paths||{}).sort(function(a,b){ return b[1]-a[1]; }).slice(0,3).map(function(path){ return path[0]+" x"+path[1]; }).join(" -> ");
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+crestTitle(Logic.displayArchetypeName(entry[0])+' Dossier',entry[0])+'</span>'+badge("Dossier","owned")+'</div><div class="tiny">Pressure '+(entry[1].studied||0)+' | victories '+(entry[1].victories||0)+' | defections '+(entry[1].defections||0)+' | collapses '+(entry[1].collapses||0)+'</div><div class="tiny">Most common path: '+(topPath?topPath[0]:"unknown")+' | most common era: '+(topEra?topEra[0]:"unknown")+' | last path '+(entry[1].lastPath||"unknown")+'</div>'+(tree?'<div class="effects">Genealogy: '+tree+'</div>':'');
      codexEvents.appendChild(card);
    });
    Object.keys(codex.evolvedDoctrines||{}).forEach(function(id){
      const evo=(DATA.DOCTRINE_EVOLUTIONS||{})[id];
      if(!evo) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+evo.name+'</span>'+badge("Doctrine Evo","owned")+'</div><div class="tiny">'+evo.desc+'</div><div class="effects">'+effectSourceText(evo)+'</div>';
      codexEvents.appendChild(card);
    });
    Object.keys(codex.congressInstitutions||{}).forEach(function(bloc){
      const level=codex.congressInstitutions[bloc];
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+bloc.charAt(0).toUpperCase()+bloc.slice(1)+' Institution</span>'+badge("Lv "+level,"owned")+'</div><div class="tiny">Built by carrying a bloc through multiple congress seasons.</div>';
      codexEvents.appendChild(card);
    });
    (codex.institutionTraits||[]).forEach(function(trait){
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+trait.name+'</span>'+badge("Institution Trait","owned")+'</div><div class="tiny">'+trait.desc+'</div><div class="effects">'+effectSourceText(trait)+'</div>';
      codexEvents.appendChild(card);
    });
    Object.keys(codex.wornArtifacts||{}).forEach(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      if(!artifact) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+artifact.name+'</span>'+badge("Worn","locked")+'</div><div class="tiny">A harsh-universe relic waiting for recovery.</div>';
      codexEvents.appendChild(card);
    });
    Object.keys(codex.restoredArtifacts||{}).forEach(function(id){
      const artifact=(DATA.ARTIFACTS||[]).find(function(item){ return item.id===id; });
      const branch=(DATA.ARTIFACT_RESTORATION_BRANCHES||[]).find(function(item){ return item.id===codex.restoredArtifacts[id]; });
      if(!artifact || !branch) return;
      const card=document.createElement("div");
      card.className="mini-card";
      card.innerHTML='<div class="name-row"><span>'+artifact.name+'</span>'+badge("Restored","owned")+'</div><div class="tiny">'+branch.name+' | '+branch.desc+'</div><div class="effects">'+effectSourceText(branch)+'</div>';
      codexEvents.appendChild(card);
    });

    const archetypeList=byId("archetype-list"); archetypeList.innerHTML="";
    drawArchetypeRadar();
    const dominant=Logic.dominantArchetype(), dominantCard=document.createElement("div");
    dominantCard.className="mini-card";
    applyArchetypeBorder(dominantCard,{archetype:dominant});
    const dominantDetail=Logic.isArchetypeRevealed(dominant)?((Logic.archetypeDef(dominant)||{}).rarity||"basic"):"Evolve to identify this lineage";
    dominantCard.innerHTML='<div class="name-row"><span>'+crestTitle(Logic.dominantArchetypeLabel(),dominant)+'</span>'+badge("Dominant","owned")+'</div><div class="tiny">'+dominantDetail+'</div>';
    archetypeList.appendChild(dominantCard);
    const scores=Logic.archetypeScores();
    DATA.ARCHETYPES.filter(function(arch){ return (scores[arch.id]||0)>0; }).sort(function(a,b){ return (scores[b.id]||0)-(scores[a.id]||0); }).slice(0,5).forEach(function(arch){
      const card=document.createElement("div");
      card.className="mini-card";
      applyArchetypeBorder(card,{archetype:arch.id});
      card.innerHTML='<div class="name-row"><span>'+crestTitle(Logic.displayArchetypeName(arch.id),arch.id)+'</span>'+badge(Logic.fmt(scores[arch.id]),"available")+'</div><div class="tiny">Affinity weight</div>';
      archetypeList.appendChild(card);
    });

    const traitList=byId("trait-list"); traitList.innerHTML="";
    const traits=Logic.inheritedTraits();
    if(!traits.length) traitList.appendChild(emptyState("No inherited traits yet."));
    else traits.forEach(function(trait){ const card=document.createElement("div"); card.className="mini-card"; card.textContent=trait; traitList.appendChild(card); });

    const archiveList=byId("archive-list"); archiveList.innerHTML="";
    const archiveFilterBar=byId("archive-filter-bar"); archiveFilterBar.innerHTML="";
    byId("archive-search").value=state.ui.archiveSearch||"";
    ["all","timeline","eras","chronicles","museum","rivals","seen"].forEach(function(id){
      const btn=document.createElement("button");
      btn.textContent={all:"All",timeline:"Timeline",eras:"Eras",chronicles:"Chronicles",museum:"Museum",rivals:"Rivals",seen:"Seen"}[id];
      btn.className=state.ui.archiveFilter===id?"tab active":"tab";
      btn.onclick=function(){ state.ui.archiveFilter=id; UI.render(); };
      archiveFilterBar.appendChild(btn);
    });
    const codexForMuseum=Logic.codexSummary();
    const archiveSearch=(state.ui.archiveSearch||"").trim().toLowerCase();
    function archiveMatches(text){
      return !archiveSearch || (text||"").toLowerCase().indexOf(archiveSearch)>=0;
    }
    function pushArchiveCard(title,badgeText,badgeKind,detail,effectsText){
      const haystack=[title,badgeText,detail,effectsText].filter(Boolean).join(" ");
      if(!archiveMatches(haystack)) return;
      const card=document.createElement("div");
      const isTestament=badgeText==="Final Testament";
      card.className="mini-card"+(isTestament?" story-card-testament":"");
      const favoriteKey=(title+"|"+badgeText).replace(/"/g,"");
        card.innerHTML=(isTestament?'<div class="story-testament-kicker">Final Testament</div>':'')+'<div class="name-row"><span>'+title+(isTestament?'':"")+'</span><span>'+badge(badgeText,badgeKind)+(Logic.upgradeLevel("archive_pinning")>0||state.ui.debug?(" "+badge(Logic.isArchiveFavorite("archive",favoriteKey)?"Favorite":"Pin","available")):"")+'</span></div><div class="'+(isTestament?"story-testament-body":"tiny")+'">'+(isTestament?String(detail).split(" | ").map(function(line){ return '<div class="story-testament-line">'+line+'</div>'; }).join(""):detail)+'</div>'+(effectsText?'<div class="effects">'+effectsText+'</div>':'');
      if(Logic.upgradeLevel("archive_pinning")>0 || state.ui.debug){
        card.appendChild(cardButton(Logic.isArchiveFavorite("archive",favoriteKey)?"Unfavorite":"Favorite",false,"Pin or unpin this archive entry.",function(){ if(Logic.toggleArchiveFavorite("archive",favoriteKey)) UI.render(); }));
      }
      archiveList.appendChild(card);
    }
    if(state.ui.archiveFilter==="timeline"){
      const timelineEntries=[].concat(
        (codexForMuseum.victories||[]).map(function(entry){ return {time:entry.time,title:entry.name,kind:"Victory",detail:"Path "+(entry.ascensionPath||"none")+" | Archetype "+Logic.archetypeName(entry.archetype)}; }),
        (codexForMuseum.chronicles||[]).map(function(entry){ return {time:entry.time,title:entry.name,kind:"Chronicle",detail:entry.text}; }),
        (state.game.meta.finalTestaments||[]).map(function(entry){ return {time:entry.time,title:entry.title,kind:"Final Testament",detail:entry.text}; }),
        Object.values(state.game.meta.seenContent||{}).map(function(entry){ return {time:entry.time,title:entry.name,kind:entry.kind,detail:"Seen in "+entry.stage}; })
      ).sort(function(a,b){ return (b.time||0)-(a.time||0); });
      timelineEntries.forEach(function(entry){ pushArchiveCard(entry.title,entry.kind,"owned",entry.detail); });
      (codexForMuseum.timelineMilestones||[]).forEach(function(milestone){
        pushArchiveCard(milestone.name,"Timeline Milestone","owned",milestone.desc,effectSourceText(milestone));
      });
    }
    if(state.ui.archiveFilter==="eras"){
      const eras={};
      Object.values(state.game.meta.seenContent||{}).forEach(function(entry){
        if(!eras[entry.stage]) eras[entry.stage]=[];
        eras[entry.stage].push(entry);
      });
      Object.entries(eras).forEach(function(entry){
        pushArchiveCard(entry[0].charAt(0).toUpperCase()+entry[0].slice(1)+" Era","Stage Group","owned",entry[1].length+" discovered records");
      });
    }
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="seen"){
      if(!state.game.run.archive.length && state.ui.archiveFilter==="seen") archiveList.appendChild(emptyState("No retired stages yet."));
      else [...state.game.run.archive].reverse().forEach(function(entry){
        pushArchiveCard(entry.stageName,entry.archetype?Logic.displayArchetypeName(entry.archetype):"-","owned",((entry.systems&&entry.systems.join(", "))||"No systems recorded."));
      });
      Object.values(state.game.meta.seenContent||{}).slice(-80).reverse().forEach(function(entry){
        pushArchiveCard(entry.name,entry.kind,"owned","Seen in "+entry.stage);
      });
    }
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="museum"){
      (codexForMuseum.museum||[]).forEach(function(entry){
        const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===entry.path; });
        pushArchiveCard(entry.lastName,"Museum","owned",Logic.archetypeName(entry.archetype)+' | Path '+(path?path.name:entry.path)+' | Wins '+entry.count+' | Best objectives '+entry.bestObjectives);
      });
      (codexForMuseum.pathEntries||[]).forEach(function(entry){
        if(!Logic.isArchetypeRevealed(entry.archetype)) return;
        const path=(DATA.ASCENSION_PATHS||[]).find(function(item){ return item.id===entry.path; });
        pushArchiveCard(Logic.displayArchetypeName(entry.archetype)+" - "+(path?path.name:entry.path),"Path Record",entry.count?"owned":"locked",entry.count?("Recorded "+entry.count+" times | latest "+(entry.lastName||"ending")):"This archetype has not yet completed this ascension.");
      });
      (codexForMuseum.museumRewards||[]).forEach(function(reward){
        pushArchiveCard(reward.name,"Museum Perk","owned","Unlocked by repeating an ending row "+reward.count+" times.",effectSourceText(reward));
      });
    }
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="chronicles") (codexForMuseum.chronicles||[]).forEach(function(entry){
      pushArchiveCard(entry.name,Logic.archetypeName(entry.archetype),"owned",entry.text);
    });
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="chronicles") (state.game.meta.finalTestaments||[]).forEach(function(entry){
      pushArchiveCard(entry.title,"Final Testament","owned",entry.text);
    });
    if(state.ui.archiveFilter==="all" || state.ui.archiveFilter==="rivals") (codexForMuseum.rivalEndings||[]).forEach(function(entry){
      pushArchiveCard(entry.name,"Rival","locked","Pressure ending recorded in the archive.");
    });
    if(!archiveList.children.length) archiveList.appendChild(emptyState("No archive entries match this filter."));

    const log=byId("log"); log.innerHTML="";
    [...state.game.run.log].reverse().slice(0,60).forEach(function(line){ const entry=document.createElement("div"); entry.className="log-entry"; entry.textContent=line; log.appendChild(entry); });
    if(!log.children.length) log.appendChild(emptyState("No log entries."));

    byId("between-runs-panel").classList.toggle("hidden",!state.ui.betweenRuns);
    const reviewList=byId("run-review-list"); reviewList.innerHTML="";
    const betweenRunsTitle=byId("between-runs-title");
    const betweenRunsSubtitle=byId("between-runs-subtitle");
    const review=state.game.meta.lastRunReview;
    if(!review) reviewList.appendChild(emptyState("No completed run review yet."));
    else {
      [
        {label:review.kind||"Run",value:review.victoryName||review.stage,sub:"Score "+Logic.fmt(review.score)+" / "+Logic.fmt(review.target)+" | EP +"+Logic.fmt(review.epAward)},
        {label:"Frontier",value:review.unlockedFrontier||review.stage,sub:review.kind==="Stage Clear"?("Unlocked next stage | Next clear worth about "+Logic.fmt(review.nextFrontierReward||0)+" EP"):("Current frontier "+Logic.frontierStage().name)},
        {label:"Lineage",value:Logic.displayArchetypeName(review.archetype),sub:"Path "+(review.ascensionPath||"none")+" | Spec "+(review.specialization||"none")},
        {label:"Pacing",value:Logic.fmt(review.time)+"s",sub:"Population "+Logic.fmt(review.population)+" | Legacy "+(review.legacyTier||"standard")},
        {label:"Rivals",value:review.rivalWins+" pressure",sub:review.rivalsBeaten+" held back"},
        {label:"Map",value:review.wonders+" wonders",sub:"Congress "+(review.congress||"none")},
        {label:"Alerts",value:(review.alerts||[]).length,sub:(review.alerts||[]).slice(0,3).join(", ")||"No major warnings"},
        {label:"Mastery",value:Object.keys((review.stageMastery||{})).length,sub:"Stage mastery tracks advanced"}
      ].forEach(function(row){
        const card=document.createElement("div");
        card.className="summary-box";
        card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
        reviewList.appendChild(card);
      });
      const systems=document.createElement("div");
      systems.className="summary-box";
      systems.innerHTML='<div class="label">Top Systems</div><div class="tiny">'+((review.topSystems||[]).join(", ")||"No systems recorded")+'</div>';
      reviewList.appendChild(systems);
      const resources=document.createElement("div");
      resources.className="summary-box";
      resources.innerHTML='<div class="label">Best Nets</div><div class="tiny">'+((review.topResources||[]).map(function(row){ return Logic.resourceName(row.id)+" "+(row.net>=0?"+":"")+Logic.fmt(row.net)+"/s"; }).join(", ")||"No resource trend recorded")+'</div>';
      reviewList.appendChild(resources);
      const medals=document.createElement("div");
      medals.className="summary-box";
      medals.innerHTML='<div class="label">Run Medals</div><div class="tiny">'+((review.medals||[]).map(function(id){ const medal=(DATA.RUN_MEDALS||[]).find(function(item){ return item.id===id; }); return medal?medal.name:id; }).join(", ")||"No medals earned")+'</div>';
      reviewList.appendChild(medals);
      if((review.rivalEndings||[]).length){
        const endings=document.createElement("div");
        endings.className="summary-box";
        endings.innerHTML='<div class="label">Rival Endings</div><div class="tiny">'+review.rivalEndings.map(function(item){ return item.name; }).join(", ")+'</div>';
        reviewList.appendChild(endings);
      }
    }
    byId("evo-value").textContent=Logic.fmt(state.game.meta.evolutionPoints)+" EP";
    byId("evo-detail").textContent="Frontier "+Logic.frontierStage().name+" | Next unlock "+(Logic.frontierStageIndex()<DATA.STAGES.length-1?Logic.nextFrontierStage().name:"Evolution mastery")+" | Galactic wins "+Logic.fmt(state.game.meta.galacticWins)+" | Challenges "+Logic.completedEvolutionChallengeCount()+"/"+Logic.totalEvolutionChallenges();
    byId("evo-fill").style.width=Math.min(100,state.game.meta.evolutionPoints%100)+"%";
    const reviewBlock=reviewList.closest(".compact-details");
    const legacyBlock=byId("legacy-tier-list").closest(".compact-details");
    const cosmeticBlock=byId("cosmetic-theme-list").closest(".compact-details");
    const setupBlock=byId("seed-setup-block");
    const evoCard=byId("evo-value").closest(".mini-card");
    const seedSetupList=byId("seed-setup-list"); seedSetupList.innerHTML="";
    const seedGuidanceList=byId("seed-guidance-list"); seedGuidanceList.innerHTML="";
    const seedPlan=Logic.nextSeedPlan();
    seedPlan.rows.forEach(function(row){
      const card=document.createElement("div");
      card.className="summary-box";
      card.innerHTML='<div class="label">'+row.label+'</div><div class="value">'+row.value+'</div><div class="tiny">'+row.sub+'</div>';
      seedSetupList.appendChild(card);
    });
    seedPlan.guidance.forEach(function(item){
      const card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+item.title+'</span>'+badge("Seed Plan","owned")+'</div><div class="tiny">'+item.detail+'</div>';
      seedGuidanceList.appendChild(card);
    });
    seedGuidanceList.classList.toggle("hidden",!Logic.guidanceEnabled());
    const routeTemplatesUnlocked=Logic.enlightenmentUpgradeLevel("route_templates")>0;
    const enlightenmentUnlocked=Logic.futureLayerState("enlightenment").unlocked;
    if(enlightenmentUnlocked){
      const frontierId=Logic.frontierStage().id;
      const defaultRoute=Logic.templateDefaultName(frontierId);
      const globalDefault=Logic.templateDefaultName("");
      const autopilotEnabled=Logic.seedAutopilotEnabled();
      const appliedRoute=state.game.run.seedTemplateName||"";
      const routeCard=document.createElement("div");
      routeCard.className="buy-card";
      routeCard.innerHTML='<div class="name-row"><span>Route Templates</span>'+badge(routeTemplatesUnlocked?"Live":"Enlightenment",routeTemplatesUnlocked?"available":"locked")+'</div><div class="tiny">'+(routeTemplatesUnlocked?"Save, default, and auto-apply route plans before seeding the next world.":"Buy Route Templates in Enlightenment to save and apply route plans here.")+'</div><div class="tiny">Seed mode: '+(autopilotEnabled?"Autopilot":"Manual")+(appliedRoute?(" | Applied route: "+appliedRoute):" | No route applied yet")+'</div><div class="tiny">'+(defaultRoute?("Frontier default for "+Logic.frontierStage().name+": "+defaultRoute):("No frontier default route set for "+Logic.frontierStage().name+" yet."))+(globalDefault?(" | Global fallback: "+globalDefault):"")+'</div><div class="tiny">Preferred FTL doctrine: '+(world.preferredFTLMethod||"Open")+' | Divinity focus: '+((Logic.divinityFocusDef()||{}).name||"Locked")+' | Theme orchestra: '+(Logic.transcendenceUpgradeLevel("seed_orchestra")>0?"Ready":"Locked")+'</div>';
      routeCard.appendChild(cardButton(autopilotEnabled?"Manual Seed":"Enable Autopilot",!routeTemplatesUnlocked,autopilotEnabled?"Disable route autopilot so this seed stays manual.":"Enable default-route autopilot for future seeds.",function(){ Logic.setSeedAutopilot(!autopilotEnabled); UI.render(); }));
      routeCard.appendChild(cardButton("Apply Current Default",!routeTemplatesUnlocked||(!defaultRoute&&!globalDefault),"Apply the active frontier or global default route to this pending seed now.",function(){ if(Logic.autoApplySeedTemplate(frontierId)) UI.render(); }));
      routeCard.appendChild(cardButton("Clear Applied Route",!routeTemplatesUnlocked||!appliedRoute,"Remove the currently applied route from this pending seed.",function(){ if(Logic.clearAppliedSeedTemplate()) UI.render(); }));
      routeCard.appendChild(cardButton("Save Frontier Route",!routeTemplatesUnlocked,"Save the current automation and lineage plan as a frontier-specific route template.",function(){ if(Logic.saveBuildTemplate(Logic.frontierStage().name+" Route",{frontierStageId:Logic.frontierStage().id})) UI.render(); }));
      routeCard.appendChild(cardButton("Save Global Route",!routeTemplatesUnlocked,"Save the current route plan for any frontier.",function(){ if(Logic.saveBuildTemplate("Global Route",{global:true})) UI.render(); }));
      routeCard.appendChild(cardButton("Seed From Favorites",!routeTemplatesUnlocked,"Create a route template from pinned archive memory.",function(){ if(Logic.seedTemplateFromFavorite()) UI.render(); }));
      seedGuidanceList.appendChild(routeCard);
      if(routeTemplatesUnlocked){
        Logic.templatesForFrontier(frontierId).forEach(function(template){
          const card=document.createElement("div");
          card.className="mini-card";
          const frontierBadge=template.frontierStageId?(template.frontierStageName||template.frontierStageId):"Any Frontier";
          const isFrontierDefault=Logic.templateDefaultName(frontierId)===template.name;
          const isGlobalDefault=Logic.templateDefaultName(frontierId)!==template.name && Logic.templateDefaultName("")===template.name;
          card.innerHTML='<div class="name-row"><span>'+template.name+'</span>'+badge(isFrontierDefault?"Frontier Default":(isGlobalDefault?"Global Default":"Template"),isFrontierDefault||isGlobalDefault?"available":"owned")+'</div><div class="tiny">'+frontierBadge+' | Target '+(template.autoOrganelleTarget||"-")+' | Policy '+(template.automationPolicy||"balanced")+' | Doctrine '+(template.doctrine||"none")+'</div><div class="tiny">Path '+(template.preferredAscensionPath||"none")+' | Bloc '+(template.preferredCongressBloc||"none")+' | FTL '+(template.preferredFTLMethod||"open")+'</div><div class="tiny">Theme '+(template.preferredTheme||"default")+'</div>';
          card.appendChild(cardButton("Apply to Seed",false,"Apply this route template to the next run before seeding.",function(){ if(Logic.applyBuildTemplate(template.name)) UI.render(); }));
          card.appendChild(cardButton(isFrontierDefault?"Frontier Default":"Set Frontier Default",isFrontierDefault,"Auto-apply this route whenever the current frontier is seeded.",function(){ if(Logic.setTemplateDefault(template.name,"frontier")) { Logic.applyBuildTemplate(template.name); UI.render(); } }));
          card.appendChild(cardButton(isGlobalDefault?"Global Default":"Set Global Default",isGlobalDefault,"Auto-apply this route on seed when no frontier-specific default exists.",function(){ if(Logic.setTemplateDefault(template.name,"global")) { Logic.applyBuildTemplate(template.name); UI.render(); } }));
          seedGuidanceList.appendChild(card);
        });
        if(defaultRoute || globalDefault){
          const clearCard=document.createElement("div");
          clearCard.className="mini-card";
          clearCard.innerHTML='<div class="name-row"><span>Route Defaults</span>'+badge("Manage","owned")+'</div><div class="tiny">Clear the current frontier or global default if you want this seed to remain manual.</div>';
          if(defaultRoute) clearCard.appendChild(cardButton("Clear Frontier Default",false,"Stop auto-applying a route for this frontier.",function(){ if(Logic.clearTemplateDefault("frontier",frontierId)) UI.render(); }));
          if(globalDefault) clearCard.appendChild(cardButton("Clear Global Default",false,"Stop auto-applying the global fallback route.",function(){ if(Logic.clearTemplateDefault("global")) UI.render(); }));
          seedGuidanceList.appendChild(clearCard);
        }
      }
      if(Logic.futureLayerState("genesis").unlocked || state.ui.debug){
        const genesisCard=document.createElement("div");
        genesisCard.className="buy-card layer-genesis";
        const cradle=Logic.selectedGenesisDef("cradleWorld"), prime=Logic.selectedGenesisDef("primeCondition"), geography=Logic.selectedGenesisDef("sacredGeography"), seed=Logic.selectedGenesisDef("dormantSeed");
        genesisCard.innerHTML='<div class="name-row"><span>Genesis Planning Surface</span>'+badge("Live","available")+'</div><div class="tiny">Author the world before life begins, then let the next seed inherit that shape.</div><div class="tiny">Cradle: '+(cradle?cradle.name:"None")+' | Prime: '+(prime?prime.name:"None")+'</div><div class="tiny">Geography: '+(geography?geography.name:"None")+' | Dormant Seed: '+(seed?seed.name:"None")+'</div>';
        genesisCard.appendChild(cardButton("Review in World Tab",false,"Genesis choices are managed in the World tab and persist between seeds.",function(){ state.ui.betweenRuns=false; state.ui.tab="world"; UI.render(); }));
        seedGuidanceList.appendChild(genesisCard);
      }
    }
    const prestigeList=byId("prestige-list"); prestigeList.innerHTML="";
    const legacyList=byId("legacy-tier-list"); legacyList.innerHTML="";
    (DATA.LEGACY_TIERS||[]).forEach(function(tier){
      const unlocked=world.legacyTiers.some(function(item){ return item.id===tier.id; }), picked=state.game.meta.legacyTier===tier.id, card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+tier.name+'</span>'+badge(picked?"Selected":(unlocked?"Unlocked":tier.wins+" wins"),picked?"owned":(unlocked?"available":"locked"))+'</div><div class="tiny">'+tier.desc+'</div><div class="effects">EP x'+tier.epMult+(effectSourceText(tier)?' | '+effectSourceText(tier):'')+'</div>';
      card.appendChild(cardButton(picked?"Selected":"Select",picked||!unlocked,unlocked?"Use this legacy universe for future victories.":"Requires "+tier.wins+" Galactic wins.",function(){ if(Logic.chooseLegacyTier(tier.id)) UI.render(); }));
      legacyList.appendChild(card);
    });
    const cosmeticList=byId("cosmetic-theme-list"); cosmeticList.innerHTML="";
    const availableThemes=world.cosmeticThemes||[];
    const currentTheme=(DATA.COSMETIC_THEMES||[]).find(function(theme){ return theme.id===world.activeCosmeticTheme; })||null;
    const themeSummary=document.createElement("div");
    themeSummary.className="buy-card";
    themeSummary.innerHTML='<div class="name-row"><span>Theme Management</span>'+badge(currentTheme?"Active":"Default",currentTheme?"available":"owned")+'</div><div class="tiny">Current banner: '+(currentTheme?currentTheme.name:"Default Banner")+' | Unlocked themes: '+availableThemes.length+'</div><div class="tiny">Mythic realm: '+(Logic.transcendenceUpgradeLevel("mythic_realm")>0?"Unlocked":"Not yet owned")+' | Fantasy naming: '+((availableThemes||[]).some(function(theme){ return theme.id==="fantasy_realm"; })?"Available":"Locked")+'</div><div class="tiny">Theme Curator: '+(Logic.transcendenceUpgradeLevel("theme_curator")>0?"Full banner library unlocked":"Locked")+' | Seed Orchestra: '+(Logic.transcendenceUpgradeLevel("seed_orchestra")>0?"Template themes auto-apply":"Manual theme switching")+'</div>';
    if((availableThemes||[]).some(function(theme){ return theme.id==="fantasy_realm"; }) && world.activeCosmeticTheme!=="fantasy_realm"){
      themeSummary.appendChild(cardButton("Use Mythic Chronicle",false,"Switch to the fantasy cosmetic presentation immediately.",function(){ if(Logic.chooseCosmeticTheme("fantasy_realm")) UI.render(); }));
    }
    if(currentTheme){
      themeSummary.appendChild(cardButton("Use Default Banner",false,"Return to the base Evolution Idle presentation.",function(){ if(Logic.chooseCosmeticTheme("")) UI.render(); }));
    }
    cosmeticList.appendChild(themeSummary);
    const clearCard=document.createElement("div");
    clearCard.className="buy-card";
    clearCard.innerHTML='<div class="name-row"><span>Default Banner</span>'+badge(world.activeCosmeticTheme?"Available":"Selected",world.activeCosmeticTheme?"available":"owned")+'</div><div class="tiny">Use the standard Evolution Shop presentation.</div>';
    clearCard.appendChild(cardButton(world.activeCosmeticTheme?"Select":"Selected",!world.activeCosmeticTheme,"Use the default banner.",function(){ if(Logic.chooseCosmeticTheme("")) UI.render(); }));
    cosmeticList.appendChild(clearCard);
    (DATA.COSMETIC_THEMES||[]).forEach(function(theme){
      const unlocked=availableThemes.some(function(item){ return item.id===theme.id; }), picked=world.activeCosmeticTheme===theme.id, card=document.createElement("div");
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+theme.name+'</span>'+badge(picked?"Selected":(unlocked?"Unlocked":theme.wins+" wins"),picked?"owned":(unlocked?"available":"locked"))+'</div><div class="tiny">'+theme.desc+'</div>';
      card.appendChild(cardButton(picked?"Selected":"Select",picked||!unlocked,unlocked?"Use this run banner.":"Earn repeat victories with this archetype.",function(){ if(Logic.chooseCosmeticTheme(theme.id)) UI.render(); }));
      cosmeticList.appendChild(card);
    });
      const upgradeGroups={
        frontier:["start","frontier_kit","objective_cache","cost"],
        momentum:["manual","auto","emergency_stores","cartography","artifact_attunement","civic_memory"],
        automation:["auto_organelles","auto_generators","project_haste"],
        legacy:["rival_scan","counterintel","archive_pinning","rival_brakes","era_control","hybridization","imperial_charters","orbital_stockpiles"],
        cosmetics:["fantasy_pack"]
      };
      [["Reach Farther",upgradeGroups.frontier],["Build Momentum",upgradeGroups.momentum],["Automation",upgradeGroups.automation],["Legacy",upgradeGroups.legacy],["Cosmetics",upgradeGroups.cosmetics]].forEach(function(group){
        const head=document.createElement("div");
        head.className="mini-card";
        head.innerHTML='<div class="name-row"><span>'+group[0]+'</span>'+badge("Section","owned")+'</div><div class="tiny">Evolution Shop upgrades</div>';
      prestigeList.appendChild(head);
      DATA.SHOP_UPGRADES.filter(function(upgrade){ return group[1].includes(upgrade.id); }).forEach(function(upgrade){
      const minWins=upgrade.minWins||1, level=state.game.meta.upgrades[upgrade.id]||0, cost=upgrade.base+level*upgrade.base, winLocked=upgrade.requiresWin&&state.game.meta.galacticWins<minWins&&!state.ui.debug, canBuy=!winLocked&&((state.game.meta.evolutionPoints>=cost)||state.ui.debug);
      const card=document.createElement("div");
      const helpsNext=(function(){
        if(["start","frontier_kit","objective_cache","cost"].includes(upgrade.id)) return "Helps reach "+Logic.frontierStage().name+" more reliably.";
        if(["manual","auto","emergency_stores","cartography","artifact_attunement","civic_memory"].includes(upgrade.id)) return "Helps stabilize the next frontier run.";
        if(["auto_organelles","auto_generators","project_haste"].includes(upgrade.id)) return "Helps automate the climb into "+(Logic.frontierStageIndex()<DATA.STAGES.length-1?Logic.nextFrontierStage().name:Logic.frontierStage().name)+".";
        if(["rival_scan","counterintel","archive_pinning","rival_brakes","era_control","hybridization","imperial_charters","orbital_stockpiles"].includes(upgrade.id)) return "Mostly matters after deeper frontier clears and Galactic rebirths.";
        if(upgrade.id==="fantasy_pack") return "Pure flavor for long-term runs.";
        return "";
      })();
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+upgrade.name+'</span>'+badge(winLocked?"Post-win":(level>=upgrade.max?"Max":"Lv "+level), winLocked?"locked":(level>=upgrade.max?"owned":"available"))+'</div><div class="tiny">'+upgrade.desc(level)+'</div><div class="tiny">'+helpsNext+'</div><div class="cost">Cost: '+cost+' EP</div>';
      card.appendChild(cardButton(level>=upgrade.max?"Maxed":"Buy",level>=upgrade.max||!canBuy,winLocked?"Requires "+minWins+" Galactic wins.":(canBuy?"Buy this permanent upgrade.":"Not enough Evolution Points."),function(){ if(Logic.buyUpgrade(upgrade.id)) UI.render(); }));
      prestigeList.appendChild(card);
      });
    });
    const challengeCard=document.createElement("div");
    challengeCard.className="buy-card";
    if(!Logic.evolutionChallengesUnlocked() && !state.ui.debug){
      challengeCard.innerHTML='<div class="name-row"><span>Evolution Challenges</span>'+badge("Dormant","locked")+'</div><div class="tiny">The god is still only learning the shape of life. These trials awaken after the first Galactic rebirth.</div><div class="tiny">When awakened, complete every challenge at least once to unlock Enlightenment.</div>';
    } else {
      const total=Logic.totalEvolutionChallenges(), done=Logic.completedEvolutionChallengeCount();
      challengeCard.innerHTML='<div class="name-row"><span>Evolution Challenges</span>'+badge(done+"/"+total,done>=total?"owned":"available")+'</div><div class="tiny">Selective pressure becomes mastery here. Each cleared challenge grants a permanent bonus tied to the hardship it imposed.</div><div class="tiny">'+(done>=total?"Every challenge is complete. Enlightenment can now be entered whenever you want.":"Finish every challenge to unlock Enlightenment. Keep grinding Evolution first if you want a stronger bank.")+'</div>';
    }
    prestigeList.appendChild(challengeCard);
    if(Logic.evolutionChallengesUnlocked() || state.ui.debug){
      Object.values(DATA.EVOLUTION_CHALLENGES||{}).flat().forEach(function(challenge){
        const key=challenge.targetStage+":"+challenge.id;
        const done=!!(state.game.meta.completedMasteryChallenges||{})[key];
        const active=(state.game.meta.activeEvolutionChallenge||"")===challenge.id;
        const card=document.createElement("div");
        card.className="buy-card";
        const completionText=(function(){
          if(challenge.condition==="fast_stage") return challenge.targetStage+" clear under "+Math.round((challenge.timeLimit||0)/60)+"m";
          if(challenge.condition==="locked_lineage_clear") return challenge.targetStage+" clear with one locked lineage";
          if(challenge.condition==="population_threshold") return challenge.targetStage+" clear with population "+(challenge.populationTarget||0)+"+";
          if(challenge.condition==="resource_stockpile") return challenge.targetStage+" clear with "+(challenge.resource||"resource")+" "+(challenge.amount||0)+"+";
          if(challenge.condition==="galactic_win") return "win Galactic rebirth";
          if(challenge.condition==="rare_galactic_win") return "win Galactic with a rare lineage";
          return challenge.targetStage+" clear";
        })();
        card.innerHTML='<div class="name-row"><span>'+challenge.name+'</span>'+badge(done?"Mastered":(active?"Active":challenge.targetStage),done?"owned":(active?"available":"locked"))+'</div><div class="tiny">'+challenge.desc+'</div><div class="tiny">Family: '+challenge.family+' | Completion: '+completionText+'</div><div class="effects">Penalty: '+effectSourceText({effects:challenge.effects||{}})+'</div><div class="effects">Mastery: '+effectSourceText({effects:challenge.masteryEffects||{}})+'</div>';
        card.appendChild(cardButton(done?"Mastered":(active?"Active":"Prepare"),done||active,done?"Already completed.":("Prepare this challenge for the next run."),function(){ if(Logic.setActiveEvolutionChallenge(challenge.id)) UI.render(); }));
        if(active) card.appendChild(cardButton("Clear",false,"Remove the currently prepared challenge.",function(){ if(Logic.setActiveEvolutionChallenge("")) UI.render(); }));
        prestigeList.appendChild(card);
      });
    }
    if(Logic.futureLayerState("enlightenment").unlocked){
      const resetCard=document.createElement("div");
      resetCard.className="buy-card";
      resetCard.innerHTML='<div class="name-row"><span>Enlightenment Reset</span>'+badge("Optional","available")+'</div><div class="tiny">Reset Evolution progression and frontier unlocks, but keep Enlightenment, Transcendence, archive history, cosmetics, templates, and long-term discoveries.</div><div class="cost">Gain: +'+Logic.enlightenmentGain()+' Enlightenment</div><div class="tiny">You can keep grinding this layer first if you want a bigger bank before resetting.</div>';
      resetCard.appendChild(cardButton("Awaken to Foresight",!Logic.canEnlighten(),"Perform the first real Enlightenment reset now.",function(){ if(Logic.enlighten()) UI.render(); }));
      prestigeList.appendChild(resetCard);

      const focusHead=document.createElement("div");
      focusHead.className="mini-card";
      focusHead.innerHTML='<div class="name-row"><span>Divinity Focus</span>'+badge("Live","owned")+'</div><div class="tiny">Enlightenment is about reading fate, not just buying raw buffs. Pick the future this god is best at interpreting.</div>';
      prestigeList.appendChild(focusHead);
      (DATA.DIVINITY_NODES||[]).forEach(function(node){
        const active=(Logic.divinityFocusDef()||{}).id===node.id;
        const card=document.createElement("div");
        card.className="buy-card";
        card.innerHTML='<div class="name-row"><span>'+node.name+'</span>'+badge(active?"Aligned":"Available",active?"owned":"available")+'</div><div class="tiny">'+node.desc+'</div><div class="effects">'+effectSourceText({effects:node.effects||{}})+'</div>';
        card.appendChild(cardButton(active?"Aligned":"Align Focus",active,"Use this as the active Divinity focus for Enlightenment-era runs.",function(){ if(Logic.chooseDivinityFocus(node.id)) UI.render(); }));
        prestigeList.appendChild(card);
      });
    }
    if(Logic.futureLayerState("transcendence").unlocked){
      const resetCard=document.createElement("div");
      resetCard.className="buy-card";
      resetCard.innerHTML='<div class="name-row"><span>Transcendence Reset</span>'+badge("Optional","available")+'</div><div class="tiny">Reset Evolution and Enlightenment progression, but keep Transcendence, story, templates, cosmetics, archive history, and universe-state scaffolds.</div><div class="cost">Gain: +'+Logic.transcendenceGain()+' Transcendence</div><div class="tiny">Use this when foresight is mature and you want offerings, rituals, scripts, and deeper automation to become the main game.</div>';
      resetCard.appendChild(cardButton("Step Beyond Causality",!Logic.canTranscend(),"Perform the first real Transcendence reset now.",function(){ if(Logic.transcend()) UI.render(); }));
      prestigeList.appendChild(resetCard);
    }
    const layerHead=document.createElement("div");
    layerHead.className="mini-card";
    layerHead.innerHTML='<div class="name-row"><span>Divine Ladder</span>'+badge("Story Arc","owned")+'</div><div class="tiny">Each higher layer is optional. We can keep grinding the current one for a better bank, or step upward and let the story widen.</div>';
    prestigeList.appendChild(layerHead);
    (DATA.PRESTIGE_LAYERS||[]).filter(function(layer){ return layer.id!=="evolution"; }).forEach(function(layer){
      const futureState=Logic.futureLayerState(layer.id);
      const card=document.createElement("div");
      card.className="buy-card layer-"+layer.id;
      card.innerHTML='<div class="name-row"><span>'+layer.name+'</span>'+badge(futureState.unlocked?"Scaffold unlocked":"Locked",futureState.unlocked?"available":"locked")+'</div><div class="tiny">'+layer.desc+'</div><div class="effects">'+layer.currency+' layer | Reset: '+layer.resetLabel+'</div>';
      const optionalNote=document.createElement("div");
      optionalNote.className="tiny";
      optionalNote.textContent=futureState.unlocked ? "Optional: keep grinding the current layer for a bigger bank before you reset into this one." : "Planned as an optional deeper reset once unlocked.";
      card.appendChild(optionalNote);
        if(layer.id==="enlightenment"){
          const notes=document.createElement("div");
          notes.className="tiny";
          notes.textContent="Live mechanics: Divinity focus, node-routed foresight, route defaults, pressure foresight, rival reads, FTL planning, bottleneck tracking, and compressed frontiers.";
          card.appendChild(notes);
        const board=document.createElement("div");
        board.className="foresight-board";
        Object.entries(Logic.foresightNodesByLane()).forEach(function(group){
          const lane=document.createElement("div");
          lane.className="foresight-lane";
          lane.innerHTML='<div class="label">'+group[0]+'</div>';
          group[1].forEach(function(nodeState){
            if(!nodeState) return;
            const node=document.createElement("div");
            const owned=nodeState.owned;
            node.className='foresight-node'+(owned?' owned':'');
            node.textContent=nodeState.label;
            node.title=nodeState.desc+(nodeState.missing.length?(" | Requires: "+nodeState.missing.join(", ")):"");
            if(!owned){
              node.onclick=function(){ if(Logic.buyForesightNode(nodeState.id)) UI.render(); };
            }
            lane.appendChild(node);
          });
          board.appendChild(lane);
        });
        card.appendChild(board);
      } else if(layer.id==="transcendence"){
        const notes=document.createElement("div");
        notes.className="tiny";
        notes.textContent="Live mechanics: route orchestration, mythic identity, early offering scaffolds, and faster crisis-time intervention.";
        card.appendChild(notes);
      } else if(layer.id==="genesis"){
        const notes=document.createElement("div");
        notes.className="tiny";
        const cradle=Logic.selectedGenesisDef("cradleWorld"), prime=Logic.selectedGenesisDef("primeCondition"), geography=Logic.selectedGenesisDef("sacredGeography"), seed=Logic.selectedGenesisDef("dormantSeed");
        notes.textContent="Live mechanics: cradle worlds, prime conditions, sacred geography, and dormant seeds. Current authored world: "+[(cradle||{}).name,(prime||{}).name,(geography||{}).name,(seed||{}).name].filter(Boolean).join(" | ")+".";
        card.appendChild(notes);
      } else if(layer.id==="apotheosis"){
        const notes=document.createElement("div");
        notes.className="tiny";
        notes.textContent="Live mechanics: worship mode, divine laws, miracle charges, and heresy responses. Current worship: "+(((Logic.currentWorshipModeDef()||{}).name)||"None")+".";
        card.appendChild(notes);
      } else if(layer.id==="singularity"){
        const notes=document.createElement("div");
        notes.className="tiny";
        notes.textContent="Live mechanics: relic loadouts, compression bands, and logic cores. Equipped relics: "+Logic.equippedRelicStageIds().length+"/"+Logic.maxRelicSlots()+" | Core: "+(((Logic.currentLogicCoreDef()||{}).name)||"None")+".";
        card.appendChild(notes);
      } else {
        const notes=document.createElement("div");
        notes.className="tiny";
        notes.textContent="Playable scaffold: story progression, generic upgrades, and a layer rite so the full divine arc can be traversed end to end.";
        card.appendChild(notes);
      }
      prestigeList.appendChild(card);
      if(["genesis","apotheosis","singularity","omnipotence","divinity","infinity","eternity"].includes(layer.id) && futureState.unlocked){
        const resetCard=document.createElement("div");
        resetCard.className="buy-card layer-"+layer.id;
        resetCard.innerHTML='<div class="name-row"><span>'+layer.name+' Rite</span>'+badge("Optional","available")+'</div><div class="tiny">'+layer.resetLabel+' and carry the story upward. Lower layers reset, but the higher scripture and this layer remain.</div><div class="cost">Gain: +'+Logic.futureLayerGain(layer.id)+' '+layer.currency+'</div><div class="tiny">You can stay here longer first if you want a richer bank.</div>';
        resetCard.appendChild(cardButton(layer.resetLabel,!Logic.canAscendFutureLayer(layer.id),"Perform this optional layer reset now.",function(){ if(Logic.ascendFutureLayer(layer.id)) UI.render(); }));
        prestigeList.appendChild(resetCard);
      }
      const futureDefs=layer.id==="enlightenment"?(DATA.ENLIGHTENMENT_UPGRADES||[]):(layer.id==="transcendence"?(DATA.TRANSCENDENCE_UPGRADES||[]):Logic.futureLayerDefs(layer.id));
      futureDefs.forEach(function(upgrade){
        const row=document.createElement("div");
        row.className="buy-card layer-"+layer.id;
        const owned=layer.id==="enlightenment"?Logic.enlightenmentUpgradeLevel(upgrade.id):(layer.id==="transcendence"?Logic.transcendenceUpgradeLevel(upgrade.id):Logic.futureLayerUpgradeLevel(layer.id,upgrade.id));
        const live=upgrade.implemented!==false;
        row.innerHTML='<div class="name-row"><span>'+upgrade.name+'</span>'+badge(owned?"Owned":(futureState.unlocked?(live?"Available":"Planned"):"Future"),owned?"owned":(futureState.unlocked?(live?"available":"locked"):"locked"))+'</div><div class="tiny">'+upgrade.desc+'</div><div class="cost">Cost: '+upgrade.cost+' '+layer.currency+'</div><div class="tiny">'+upgrade.lockedText+'</div>';
        if(layer.id==="enlightenment"){
          row.appendChild(cardButton(owned?"Owned":(live?"Buy":"Planned"),owned || !live || (!futureState.unlocked && !state.ui.debug) || ((state.game.meta.enlightenmentPoints||0)<upgrade.cost && !state.ui.debug),owned?"Already purchased.":(!live?"This Enlightenment upgrade is planned but not fully playable yet.":(futureState.unlocked?"Buy this Divinity foresight upgrade.":"Unlock Enlightenment first.")),function(){ if(Logic.buyEnlightenmentUpgrade(upgrade.id)) UI.render(); }));
        } else if(layer.id==="transcendence"){
          row.appendChild(cardButton(owned?"Owned":(live?"Buy":"Planned"),owned || !live || (!futureState.unlocked && !state.ui.debug) || ((state.game.meta.transcendencePoints||0)<upgrade.cost && !state.ui.debug),owned?"Already purchased.":(!live?"This Transcendence upgrade is still scaffolded.":(futureState.unlocked?"Buy this Transcendence upgrade.":"Unlock Transcendence first.")),function(){ if(Logic.buyTranscendenceUpgrade(upgrade.id)) UI.render(); }));
        } else {
          row.appendChild(cardButton(owned?"Owned":(live?"Buy":"Planned"),owned || !live || (!futureState.unlocked && !state.ui.debug) || (Logic.futureLayerCurrency(layer.id)<upgrade.cost && !state.ui.debug),owned?"Already purchased.":(!live?"This higher-layer upgrade is still scaffolded.":(futureState.unlocked?"Buy this "+layer.name+" upgrade.":"Unlock "+layer.name+" first.")),function(){ if(Logic.buyFutureLayerUpgrade(layer.id,upgrade.id)) UI.render(); }));
        }
        prestigeList.appendChild(row);
      });
    });
    const eternityCard=document.createElement("div");
    eternityCard.className="buy-card";
    const chosenBoon=(DATA.UNIVERSE_RESET_BOONS||[]).find(function(item){ return item.id===state.game.meta.selectedUniverseBoon; })||null;
    eternityCard.innerHTML='<div class="name-row"><span>Eternity Ending</span>'+badge((Logic.futureLayerState("eternity").unlocked||state.ui.debug)?"Prepared":"Scaffolded",(Logic.futureLayerState("eternity").unlocked||state.ui.debug)?"available":"owned")+'</div><div class="tiny">The final layer ends with a choice: Preserve the Universe as a finished canon save, or Reset the Universe and choose one cosmic boon for the next full cycle.</div><div class="tiny">Preserved universes: '+Logic.fmt(state.game.meta.universePreserveCount||0)+' | Universe resets: '+Logic.fmt(state.game.meta.universeResetCount||0)+'</div><div class="tiny">Chosen reset boon: '+(chosenBoon?chosenBoon.name:"None selected")+'</div>';
    eternityCard.appendChild(cardButton("Preserve Universe",!(Logic.futureLayerState("eternity").unlocked||state.ui.debug),"Record the current universe as canon.",function(){ if(Logic.preserveUniverse()){ state.ui.universeSummaryOpen=true; UI.render(); } }));
    eternityCard.appendChild(cardButton("Reset Universe",!(Logic.futureLayerState("eternity").unlocked||state.ui.debug) || !state.game.meta.selectedUniverseBoon,"Begin a new universe with the selected cosmic boon.",function(){ if(Logic.resetUniverse()) UI.render(); }));
    prestigeList.appendChild(eternityCard);
    (DATA.UNIVERSE_RESET_BOONS||[]).forEach(function(boon){
      const card=document.createElement("div");
      const selected=state.game.meta.selectedUniverseBoon===boon.id;
      const stacks=Logic.universeBoonLevel(boon.id);
      card.className="buy-card";
      card.innerHTML='<div class="name-row"><span>'+boon.name+'</span>'+badge(selected?"Selected":(stacks?("Stacks "+stacks):"Boon"),selected?"owned":"available")+'</div><div class="tiny">'+boon.desc+'</div>'+(effectSourceText({effects:boon.effects||{}})?'<div class="effects">'+effectSourceText({effects:boon.effects||{}})+'</div>':'');
      card.appendChild(cardButton(selected?"Selected":"Choose Boon",selected,"Use this as the next universe reset boon.",function(){ if(Logic.chooseUniverseBoon(boon.id)) UI.render(); }));
      prestigeList.appendChild(card);
    });

    if(state.ui.betweenRunsStep==="review"){
      betweenRunsTitle.textContent="Run Review";
      betweenRunsSubtitle.textContent="Study the last lineage before choosing how the next world begins.";
    } else if(state.ui.betweenRunsStep==="shop"){
      const highestLayer=(DATA.PRESTIGE_LAYERS||[]).slice().reverse().find(function(layer){
        return layer.id==="evolution" || Logic.futureLayerState(layer.id).unlocked;
      }) || DATA.PRESTIGE_LAYERS[0];
      betweenRunsTitle.textContent=highestLayer.name+" Shop";
      betweenRunsSubtitle.textContent=highestLayer.id==="evolution"
        ? "Spend Evolution Points to reach farther next run and sharpen the frontier climb."
        : "Plan the next divine layer, tune its mechanics, and decide whether to bank more power before ascending again.";
    } else {
      betweenRunsTitle.textContent=seedPlan.title;
      betweenRunsSubtitle.textContent=seedPlan.subtitle;
    }
    if(reviewBlock) reviewBlock.classList.toggle("hidden",state.ui.betweenRunsStep!=="review");
    if(evoCard) evoCard.classList.toggle("hidden",state.ui.betweenRunsStep==="review" || state.ui.betweenRunsStep==="setup");
    prestigeList.classList.toggle("hidden",state.ui.betweenRunsStep!=="shop");
    if(legacyBlock) legacyBlock.classList.toggle("hidden",state.ui.betweenRunsStep==="review");
    if(cosmeticBlock) cosmeticBlock.classList.toggle("hidden",state.ui.betweenRunsStep==="review");
    if(setupBlock) setupBlock.classList.toggle("hidden",state.ui.betweenRunsStep!=="setup");
    byId("shop-close-btn").textContent=state.ui.betweenRunsStep==="review"?"Open Shop":(state.ui.betweenRunsStep==="shop"?"Choose Seed":"Seed New Life");

    byId("debug-tab-btn").classList.toggle("hidden",!state.ui.debug);
    byId("auto-tab-btn").classList.toggle("hidden",!Logic.hasAutomationControls());
    byId("lineage-tab-btn").classList.toggle("hidden",!Logic.hasLockedLineage());
    if(!Logic.hasAutomationControls() && state.ui.tab==="auto-control") state.ui.tab="actions";
    if(!Logic.hasLockedLineage() && state.ui.tab==="lineage") state.ui.tab="actions";
    if(!state.ui.debug && state.ui.tab==="debug") state.ui.tab="actions";
    const summaryList=byId("summary-list"); summaryList.innerHTML="";
    ["Stage: "+Logic.currentStage().name,"Frontier: "+Logic.frontierStage().name,"Population: "+Logic.fmt(state.game.run.population),"Stage score: "+Logic.fmt(Logic.currentScore())+"/"+Logic.fmt(Logic.currentStage().scoreTarget),"Owned systems: "+Logic.ownedSystemsForStage().length,"Owned techs: "+Logic.ownedTechForStage().length,"EP: "+Logic.fmt(state.game.meta.evolutionPoints||0),"Enlightenment: "+Logic.fmt(state.game.meta.enlightenmentPoints||0),"Transcendence: "+Logic.fmt(state.game.meta.transcendencePoints||0),"Genesis: "+Logic.fmt(Logic.futureLayerCurrency("genesis")),"Apotheosis: "+Logic.fmt(Logic.futureLayerCurrency("apotheosis"))].forEach(function(line){ const card=document.createElement("div"); card.className="mini-card"; card.textContent=line; summaryList.appendChild(card); });
    const debugSpeedList=byId("debug-speed-list"), debugStageList=byId("debug-stage-list"), debugMetaList=byId("debug-meta-list");
    if(debugSpeedList) debugSpeedList.innerHTML="";
    if(debugStageList) debugStageList.innerHTML="";
    if(debugMetaList) debugMetaList.innerHTML="";
    if(state.ui.debug && debugSpeedList && debugStageList && debugMetaList){
      const speedCard=document.createElement("div");
      speedCard.className="debug-card";
      speedCard.innerHTML='<div class="label">Game speed</div><div class="tiny">Debug-only speed presets for simulation and UI testing.</div>';
      const speedSelect=document.createElement("select");
      DATA.DEBUG_SPEEDS.forEach(function(mult,idx){
        const opt=document.createElement("option");
        opt.value=String(mult);
        opt.textContent="Speed x"+mult;
        if(idx===state.speedIndex) opt.selected=true;
        speedSelect.appendChild(opt);
      });
      speedSelect.onchange=function(event){ Logic.debugSetSpeed(Number(event.target.value)); UI.render(); };
      speedCard.appendChild(speedSelect);
      speedCard.appendChild(cardButton(state.running?"Pause Run":"Resume Run",false,"Toggle simulation.",function(){ state.running=!state.running; UI.render(); }));
      debugSpeedList.appendChild(speedCard);

      const resourceCard=document.createElement("div");
      resourceCard.className="debug-card";
      resourceCard.innerHTML='<div class="label">Current run</div><div class="tiny">Fast helpers for the active stage.</div>';
      const resourceActions=document.createElement("div");
      resourceActions.className="inline-actions";
      resourceActions.appendChild(cardButton("Fill Resources",false,"Fill current-stage resources close to cap.",function(){ Logic.debugFillCurrentResources(); UI.render(); }));
      resourceActions.appendChild(cardButton("Claim Goals",false,"Claim all completed stage goals.",function(){ Logic.debugClaimAllGoals(); UI.render(); }));
      resourceActions.appendChild(cardButton("Complete Project",!state.game.run.specialProject&&!state.game.run.pendingProjectChoice,"Complete the active special project or resolve its first branch.",function(){ if(Logic.debugCompleteProject()) UI.render(); }));
      resourceCard.appendChild(resourceActions);
      debugSpeedList.appendChild(resourceCard);

      const stageCard=document.createElement("div");
      stageCard.className="debug-card";
      stageCard.innerHTML='<div class="label">Start at stage</div><div class="tiny">Fresh run seeded directly into a chosen stage for UI and pacing checks.</div>';
      const stageSelect=document.createElement("select");
      DATA.STAGES.forEach(function(row){
        const opt=document.createElement("option");
        opt.value=row.id;
        opt.textContent=row.name;
        if((state.ui.debugStageTarget||"cell")===row.id) opt.selected=true;
        stageSelect.appendChild(opt);
      });
      stageSelect.onchange=function(event){ state.ui.debugStageTarget=event.target.value; };
      stageCard.appendChild(stageSelect);
      stageCard.appendChild(cardButton("Start Fresh Here",false,"Reset the run and begin at the selected stage with seeded resources.",function(){ if(Logic.debugStartAtStage(state.ui.debugStageTarget||"cell")) UI.render(); }));
      debugStageList.appendChild(stageCard);

      const frontierCard=document.createElement("div");
      frontierCard.className="debug-card";
      frontierCard.innerHTML='<div class="label">Frontier target</div><div class="tiny">Choose which stage counts as the current unlock frontier.</div>';
      const frontierSelect=document.createElement("select");
      DATA.STAGES.forEach(function(row){
        const opt=document.createElement("option");
        opt.value=row.id;
        opt.textContent=row.name;
        if((state.ui.debugFrontierTarget||Logic.frontierStage().id)===row.id) opt.selected=true;
        frontierSelect.appendChild(opt);
      });
      frontierSelect.onchange=function(event){ state.ui.debugFrontierTarget=event.target.value; };
      frontierCard.appendChild(frontierSelect);
      frontierCard.appendChild(cardButton("Set Frontier",false,"Set the current frontier stage.",function(){ if(Logic.debugSetFrontier(state.ui.debugFrontierTarget||"cell")) UI.render(); }));
      debugStageList.appendChild(frontierCard);

      const evoCard=document.createElement("div");
      evoCard.className="debug-card";
      evoCard.innerHTML='<div class="label">Evolution currency</div><div class="tiny">Meta boosts for shop and review testing.</div>';
      const evoActions=document.createElement("div");
      evoActions.className="inline-actions";
      evoActions.appendChild(cardButton("+10 EP",false,"Add 10 Evolution Points.",function(){ Logic.debugGrantMeta("evolution",10); UI.render(); }));
      evoActions.appendChild(cardButton("+50 EP",false,"Add 50 Evolution Points.",function(){ Logic.debugGrantMeta("evolution",50); UI.render(); }));
      evoCard.appendChild(evoActions);
      debugMetaList.appendChild(evoCard);

      const prestigeCard=document.createElement("div");
      prestigeCard.className="debug-card";
      prestigeCard.innerHTML='<div class="label">Prestige layers</div><div class="tiny">Unlock future scaffolds and their test currencies.</div>';
      const layerSelect=document.createElement("select");
      ["evolution","enlightenment","transcendence","genesis","apotheosis","singularity","omnipotence","divinity","infinity","eternity"].forEach(function(id){
        const opt=document.createElement("option");
        opt.value=id;
        opt.textContent=id.charAt(0).toUpperCase()+id.slice(1);
        if((state.ui.debugLayerTarget||"evolution")===id) opt.selected=true;
        layerSelect.appendChild(opt);
      });
      layerSelect.onchange=function(event){ state.ui.debugLayerTarget=event.target.value; };
      prestigeCard.appendChild(layerSelect);
      const prestigeActions=document.createElement("div");
      prestigeActions.className="inline-actions";
      prestigeActions.appendChild(cardButton("Unlock Layer",false,"Unlock the selected prestige scaffold and seed its meta state.",function(){ if(Logic.debugUnlockLayer(state.ui.debugLayerTarget||"evolution")) UI.render(); }));
      prestigeActions.appendChild(cardButton("+10 Layer",false,"Add 10 points to the selected prestige layer if it uses currency.",function(){ if((state.ui.debugLayerTarget||"evolution")!=="evolution"){ Logic.debugGrantMeta(state.ui.debugLayerTarget,10); UI.render(); } }));
      prestigeCard.appendChild(prestigeActions);
      debugMetaList.appendChild(prestigeCard);

      const resetCard=document.createElement("div");
      resetCard.className="debug-card";
      resetCard.innerHTML='<div class="label">Reset and cleanup</div><div class="tiny">Quick state cleanup without leaving the game.</div>';
      const resetActions=document.createElement("div");
      resetActions.className="inline-actions";
      resetActions.appendChild(cardButton("Hard Reset",false,"Reset the entire save.",function(){ State.hardReset(); UI.render(); }));
      resetActions.appendChild(cardButton("Save Now",false,"Save immediately.",function(){ State.saveGame(); UI.render(); }));
      resetCard.appendChild(resetActions);
      debugMetaList.appendChild(resetCard);
    }

    document.querySelectorAll(".tab").forEach(function(btn){ btn.classList.toggle("active",btn.dataset.tab===state.ui.tab); });
    const stageSystems=stage.systems||[], stageTechs=stage.technologies||[];
    const buyableSystems=stageSystems.some(function(item){ return Logic.contentVisible(item,state.ui.showLockedContent) && (!state.game.run.ownedSystems[item.id] || Logic.repeatableSystem(item)) && !Logic.lockReasonForSystem(item); });
    const buyableTechs=stageTechs.some(function(item){ return !state.game.run.technologies[item.id] && Logic.contentVisible(item,state.ui.showLockedContent) && !Logic.lockReasonForTech(item); });
    const lineageReady=unresolvedLineageEvents.length || (!((state.game.run.lineageLaws||{})[stage.id]) && availableLaws.length);
    const worldReady=!earlyQuiet && (Object.keys(world.worldEvents||{}).some(function(id){ return !world.worldEventChoices[id]; }) || (world.vassalDemands||[]).length || (world.rivalDefections||[]).length || !!world.pendingProject || !!world.congressCrisis && !world.congressCrisisChoice || !!world.institutionCrisis && !world.institutionCrisisChoice || (world.artifactEvolutions||[]).length);
    const unseenSystems=stageSystems.some(function(item){ return Logic.contentVisible(item,true) && !state.game.meta.seenContent["system:"+item.id]; });
    const unseenTechs=stageTechs.some(function(item){ return Logic.contentVisible(item,true) && !state.game.meta.seenContent["tech:"+item.id]; });
    document.querySelectorAll(".tab[data-tab='systems'], .tab[data-tab='tech'], .tab[data-tab='lineage'], .tab[data-tab='world']").forEach(function(btn){
      btn.classList.remove("tab-ready","tab-new");
      if(btn.dataset.tab==="systems" && buyableSystems) btn.classList.add("tab-ready");
      if(btn.dataset.tab==="tech" && buyableTechs) btn.classList.add("tab-ready");
      if(btn.dataset.tab==="lineage" && lineageReady) btn.classList.add("tab-ready");
      if(btn.dataset.tab==="world" && worldReady) btn.classList.add("tab-ready");
      if(btn.dataset.tab==="systems" && unseenSystems) btn.classList.add("tab-new");
      if(btn.dataset.tab==="tech" && unseenTechs) btn.classList.add("tab-new");
    });
    document.querySelector(".tab[data-tab='world']").classList.toggle("hidden",earlyQuiet);
    if(earlyQuiet && state.ui.tab==="world") state.ui.tab="systems";
    document.querySelectorAll(".tab-panel").forEach(function(panel){ panel.classList.toggle("active",panel.id===("tab-"+state.ui.tab)); });

    byId("options-panel").classList.toggle("hidden",!state.ui.optionsOpen);
    byId("debug-toggle").checked=!!state.ui.debug;
    byId("guidance-toggle").checked=Logic.guidanceEnabled();
    byId("compact-toggle").checked=!!state.ui.compact;
    byId("crisis-intensity-select").value=state.game.meta.crisisIntensity||"normal";
    byId("pause-btn").textContent=state.running?"Pause":"Resume";
    if(!state.ui.debug) state.speedIndex=0;
    const speedList=state.ui.debug?DATA.DEBUG_SPEEDS:DATA.SPEEDS;
    if(state.speedIndex>=speedList.length) state.speedIndex=0;
    const activeSpeed=speedList[state.speedIndex]||1;
    byId("speed-btn").textContent="Speed x"+activeSpeed;
    byId("speed-btn").disabled=!state.ui.debug;
    byId("rebirth-btn").disabled=!Logic.canRebirth();
    byId("rebirth-btn").textContent=Logic.canRebirth()?("Seed New Life +"+Logic.rebirthGain()+" EP"):("Seed New Life Needs "+Logic.rebirthScoreTarget()+" Score");
  };

  window.EvolutionUI=UI;
})();
