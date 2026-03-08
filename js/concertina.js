// Panel toggle and concertina for small screens
(function() {
  var btn = document.getElementById('panel-toggle');
  var controls = document.getElementById('controls');
  if (!controls) return;
  var lastExpanded = null;

  function isPortrait() { return window.innerWidth <= 560; }
  function isLandscape() { return !isPortrait() && window.innerHeight <= 550; }
  function isConcertina() { return isPortrait() || isLandscape(); }

  // Slide-out panel toggle (portrait only)
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      controls.classList.toggle('open');
      if (controls.classList.contains('open') && lastExpanded) {
        lastExpanded.classList.remove('collapsed');
        lastExpanded.classList.add('expanded');
      }
    });
  }

  // Close slide-out by tapping outside (portrait only)
  document.addEventListener('touchstart', function(e) {
    if (!isPortrait()) return;
    if (!controls.classList.contains('open')) return;
    if (controls.contains(e.target) || (btn && btn.contains(e.target))) return;
    controls.classList.remove('open');
  });

  // Collapse all panels by default for concertina
  var concertinaPanels = controls.querySelectorAll('.control-panel');
  for (var i = 0; i < concertinaPanels.length; i++) {
    concertinaPanels[i].classList.add('collapsed');
  }

  // Concertina click handler - class based
  var concertinaTitles = controls.querySelectorAll('.concertina-title');
  for (var t = 0; t < concertinaTitles.length; t++) {
    concertinaTitles[t].addEventListener('click', function() {
      var panel = this.closest('.control-panel');
      if (!panel) return;
      var allPanels = controls.querySelectorAll('.control-panel');
      for (var i = 0; i < allPanels.length; i++) {
        allPanels[i].classList.add('collapsed');
        allPanels[i].classList.remove('expanded');
      }
      panel.classList.remove('collapsed');
      panel.classList.add('expanded');
      lastExpanded = panel;
    });
  }

  // Portrait: close slide-out when tapping outside
  document.addEventListener('touchstart', function(e) {
    if (!isPortrait()) return;
    if (!controls.classList.contains('open')) return;
    if (controls.contains(e.target) || (btn && btn.contains(e.target))) return;
    controls.classList.remove('open');
  });
  document.addEventListener('click', function(e) {
    if (!isPortrait()) return;
    if (!controls.classList.contains('open')) return;
    if (controls.contains(e.target) || (btn && btn.contains(e.target))) return;
    controls.classList.remove('open');
  });

  // Landscape: stop touch events on controls from propagating to canvas
  controls.addEventListener('touchstart', function(e) {
    e.stopPropagation();
  }, { passive: true });
  controls.addEventListener('touchmove', function(e) {
    e.stopPropagation();
  }, { passive: true });
})();
