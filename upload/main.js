
(function(){
  const DATA=window.EvolutionData, State=window.EvolutionState, Logic=window.EvolutionLogic, UI=window.EvolutionUI, state=State.state;
  let last=performance.now();
  let lastRender=0;
  function frame(now){
    const dt=Math.min(0.25,(now-last)/1000);
    last=now;
    const speeds=state.ui.debug?DATA.DEBUG_SPEEDS:DATA.SPEEDS;
    const speed=speeds[state.speedIndex]||1;
    if(!state.ui.betweenRuns && state.running) Logic.tick(dt*speed);
    if(now-lastRender>=250 && !state.ui.inputActive){ lastRender=now; UI.render(); }
    requestAnimationFrame(frame);
  }
  function start(){ State.loadGame(); UI.bindUI(); UI.render(); setInterval(function(){ State.saveGame(); },5000); requestAnimationFrame(frame); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
