    const slides = Array.from(document.querySelectorAll("[data-slide]"));
    const dotsContainer = document.getElementById("slide-dots");
    const prevSlideButton = document.getElementById("prev-slide");
    const nextSlideButton = document.getElementById("next-slide");
    let currentSlide = 0;

    slides.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = index === 0 ? "dot active" : "dot";
      dot.addEventListener("click", () => setSlide(index));
      dotsContainer.appendChild(dot);
    });

    function setSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === currentSlide));
      Array.from(dotsContainer.children).forEach((dot, i) => dot.classList.toggle("active", i === currentSlide));
    }

    prevSlideButton.addEventListener("click", () => setSlide(currentSlide - 1));
    nextSlideButton.addEventListener("click", () => setSlide(currentSlide + 1));

    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        setSlide(currentSlide + 1);
      } else if (event.key === "ArrowLeft") {
        setSlide(currentSlide - 1);
      }
    });

    let vertexGradients = [];

    const activeCell = { row: 1, col: 1 };

    function getCellGradients(cellRow, cellCol) {
      return {
        d00: {
          ...vertexGradients[cellRow + 1][cellCol],
          name: "bottom-left"
        },
        d10: {
          ...vertexGradients[cellRow + 1][cellCol + 1],
          name: "bottom-right"
        },
        d01: {
          ...vertexGradients[cellRow][cellCol],
          name: "top-left"
        },
        d11: {
          ...vertexGradients[cellRow][cellCol + 1],
          name: "top-right"
        }
      };
    }

    function getWrappedCellGradients(cellRow, cellCol, period = 4) {
      const topRow = positiveModulo(cellRow, period);
      const bottomRow = positiveModulo(cellRow + 1, period);
      const leftCol = positiveModulo(cellCol, period);
      const rightCol = positiveModulo(cellCol + 1, period);

      return {
        d00: {
          ...vertexGradients[bottomRow][leftCol],
          name: "bottom-left"
        },
        d10: {
          ...vertexGradients[bottomRow][rightCol],
          name: "bottom-right"
        },
        d01: {
          ...vertexGradients[topRow][leftCol],
          name: "top-left"
        },
        d11: {
          ...vertexGradients[topRow][rightCol],
          name: "top-right"
        }
      };
    }

    function getActiveCellGradients() {
      return getCellGradients(activeCell.row, activeCell.col);
    }

    const hoverPosition = document.getElementById("hover-position");
    const hoverGradient = document.getElementById("hover-gradient");
    const hoverOffset = document.getElementById("hover-offset");
    const hoverFormula = document.getElementById("hover-formula");
    const slide1PerlinSvg = document.getElementById("slide1-perlin-svg");
    const slide2DetailSvg = document.getElementById("slide2-detail-svg");
    const slide2DotShell = document.getElementById("slide2-dot-shell");
    const cornerButtons = Array.from(document.querySelectorAll("[data-corner]"));
    const selectedCornerLabel = document.getElementById("selected-corner-label");
    const selectedCornerGradient = document.getElementById("selected-corner-gradient");
    const interpolationGridSvg = document.getElementById("interpolation-grid-svg");
    const slide3SyncShell = document.getElementById("slide3-sync-shell");
    const slide3LeftSvg = document.getElementById("slide3-left-svg");
    const slide3MiddleSvg = document.getElementById("slide3-middle-svg");
    const slide3XSvg = document.getElementById("slide3-x-svg");
    const slide3Tooltip = document.getElementById("slide3-tooltip");
    const slide3Formula = document.getElementById("slide3-formula");
    const slide3FadeCurveSvg = document.getElementById("slide3-fade-curve-svg");
    const slide3LeftTitle = document.getElementById("slide3-left-title");
    const slide3MiddleTitle = document.getElementById("slide3-middle-title");
    const slide3RightTitle = document.getElementById("slide3-right-title");
    const slide4SyncShell = document.getElementById("slide4-sync-shell");
    const slide4X1Svg = document.getElementById("slide4-x1-svg");
    const slide4X2Svg = document.getElementById("slide4-x2-svg");
    const slide4FinalSvg = document.getElementById("slide4-final-svg");
    const slide4Tooltip = document.getElementById("slide4-tooltip");
    const slide4Position = document.getElementById("slide4-position");
    const slide4Inputs = document.getElementById("slide4-inputs");
    const slide4Weight = document.getElementById("slide4-weight");
    const slide4Formula = document.getElementById("slide4-formula");
    const slide4FadeCurveSvg = document.getElementById("slide4-fade-curve-svg");
    const freq1Svg = document.getElementById("freq1-svg");
    const freq2Svg = document.getElementById("freq2-svg");
    const freq4Svg = document.getElementById("freq4-svg");
    const fbm3Svg = document.getElementById("fbm3-svg");
    const fbm5Svg = document.getElementById("fbm5-svg");
    const fbm6Svg = document.getElementById("fbm6-svg");
    const decayExpSvg = document.getElementById("decay-exp-svg");
    const decayLinearSvg = document.getElementById("decay-linear-svg");
    const decayNoneSvg = document.getElementById("decay-none-svg");
    const seamedRepeatSvg = document.getElementById("seamed-repeat-svg");
    const wrappedRepeatSvg = document.getElementById("wrapped-repeat-svg");
    const fbmPerlinVsSvg = document.getElementById("fbm-perlin-vs-svg");
    const fbmSinVsSvg = document.getElementById("fbm-sin-vs-svg");
    const xBlendButtons = Array.from(document.querySelectorAll("[data-xblend]"));
    const seedInput = document.getElementById("seed-input");
    const applySeedButton = document.getElementById("apply-seed");

    let selectedCorner = "d00";
    let slide2HoveredSample = null;
    let selectedXBlend = "x0";
    let slide3HoveredSample = null;
    let slide4HoveredSampleKey = null;
    let slide4HoveredSample = null;

    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function dot2(a, b) {
      return a.x * b.x + a.y * b.y;
    }

    function hashString(value) {
      let hash = 2166136261;
      for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    }

    function createRngFromSeed(seedText) {
      let state = hashString(seedText) || 1;
      return function nextRandom() {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        return state / 4294967296;
      };
    }

    function generateVertexGradients(seedText, size = 5) {
      const rng = createRngFromSeed(seedText);
      return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => {
          const angle = rng() * Math.PI * 2;
          return {
            x: Number(Math.cos(angle).toFixed(2)),
            y: Number(Math.sin(angle).toFixed(2))
          };
        })
      );
    }

    function normalize(value, min, max) {
      if (max === min) {
        return 0.5;
      }
      return Math.min(1, Math.max(0, (value - min) / (max - min)));
    }

    function colorForValue(value, min, max) {
      const t = normalize(value, min, max);
      const hue = lerp(198, 22, t);
      const sat = lerp(48, 62, t);
      const light = lerp(41, 73, 1 - Math.abs(t - 0.5) * 1.12);
      return `hsl(${hue}, ${sat}%, ${light}%)`;
    }

    function contrastColorForValue(value, min, max) {
      const t = normalize(value, min, max);
      const centerDistance = Math.abs(t - 0.5) * 2;
      if (t <= 0.5) {
        const hue = lerp(202, 226, t * 2);
        const sat = lerp(82, 96, centerDistance);
        const light = lerp(96, 26, centerDistance);
        return `hsl(${hue}, ${sat}%, ${light}%)`;
      }

      const warmT = (t - 0.5) * 2;
      const hue = lerp(20, 2, warmT);
      const sat = lerp(84, 96, centerDistance);
      const light = lerp(96, 28, centerDistance);
      return `hsl(${hue}, ${sat}%, ${light}%)`;
    }

    function textColorForValue(value, min, max) {
      return normalize(value, min, max) > 0.62 ? "#182126" : "#ffffff";
    }

    function perlinData(x, y, cellRow = activeCell.row, cellCol = activeCell.col) {
      const offset00 = { x, y };
      const offset10 = { x: x - 1, y };
      const offset01 = { x, y: y - 1 };
      const offset11 = { x: x - 1, y: y - 1 };

      const cellGradients = getCellGradients(cellRow, cellCol);
      const d00 = dot2(cellGradients.d00, offset00);
      const d10 = dot2(cellGradients.d10, offset10);
      const d01 = dot2(cellGradients.d01, offset01);
      const d11 = dot2(cellGradients.d11, offset11);

      const u = fade(x);
      const v = fade(y);
      const x0 = lerp(d00, d10, u);
      const x1 = lerp(d01, d11, u);
      const final = lerp(x0, x1, v);

      return { x, y, offset00, offset10, offset01, offset11, d00, d10, d01, d11, u, v, x0, x1, final };
    }

    function perlinWrappedData(x, y, cellRow, cellCol, period = 4) {
      const offset00 = { x, y };
      const offset10 = { x: x - 1, y };
      const offset01 = { x, y: y - 1 };
      const offset11 = { x: x - 1, y: y - 1 };

      const cellGradients = getWrappedCellGradients(cellRow, cellCol, period);
      const d00 = dot2(cellGradients.d00, offset00);
      const d10 = dot2(cellGradients.d10, offset10);
      const d01 = dot2(cellGradients.d01, offset01);
      const d11 = dot2(cellGradients.d11, offset11);

      const u = fade(x);
      const v = fade(y);
      const x0 = lerp(d00, d10, u);
      const x1 = lerp(d01, d11, u);
      return lerp(x0, x1, v);
    }

    function positiveModulo(value, mod) {
      return ((value % mod) + mod) % mod;
    }

    function evaluatePeriodicPerlin(x, y, frequency = 1) {
      const cells = 4;
      const safeX = Math.min(x, 0.999999);
      const safeY = Math.min(y, 0.999999);
      const scaledX = safeX * cells * frequency;
      const scaledY = safeY * cells * frequency;

      const cellCol = positiveModulo(Math.floor(scaledX), cells);
      const cellRowFromBottom = positiveModulo(Math.floor(scaledY), cells);
      const cellRow = cells - 1 - cellRowFromBottom;
      const localX = scaledX - Math.floor(scaledX);
      const localY = scaledY - Math.floor(scaledY);

      return perlinData(localX, localY, cellRow, cellCol).final;
    }

    function evaluateWrappedPeriodicPerlin(x, y, frequency = 1) {
      const cells = 4;
      const safeX = Math.min(x, 0.999999);
      const safeY = Math.min(y, 0.999999);
      const scaledX = safeX * cells * frequency;
      const scaledY = safeY * cells * frequency;

      const cellCol = positiveModulo(Math.floor(scaledX), cells);
      const cellRowFromBottom = positiveModulo(Math.floor(scaledY), cells);
      const cellRow = cells - 1 - cellRowFromBottom;
      const localX = scaledX - Math.floor(scaledX);
      const localY = scaledY - Math.floor(scaledY);

      return perlinWrappedData(localX, localY, cellRow, cellCol, cells);
    }

    function evaluateFbm(x, y, octaves, weightFn, lacunarity = 2) {
      let sum = 0;
      let weightTotal = 0;
      for (let i = 0; i < octaves; i += 1) {
        const weight = weightFn(i, octaves);
        sum += weight * evaluatePeriodicPerlin(x, y, Math.pow(lacunarity, i));
        weightTotal += Math.abs(weight);
      }
      return weightTotal > 0 ? sum / weightTotal : 0;
    }

    function sinePhase(seedText, octave, axisTag) {
      const rng = createRngFromSeed(`${seedText}|${axisTag}|${octave}`);
      return rng() * Math.PI * 2;
    }

    function evaluateSinFbm(x, y, octaves, weightFn, seedText, lacunarity = 2) {
      let sum = 0;
      let weightTotal = 0;
      for (let i = 0; i < octaves; i += 1) {
        const weight = weightFn(i, octaves);
        const frequency = Math.pow(lacunarity, i);
        const phaseX = sinePhase(seedText, i, "x");
        const phaseY = sinePhase(seedText, i, "y");
        const signal = 0.5 * (Math.sin(2 * Math.PI * frequency * x + phaseX) + Math.sin(2 * Math.PI * frequency * y + phaseY));
        sum += weight * signal;
        weightTotal += Math.abs(weight);
      }
      return weightTotal > 0 ? sum / weightTotal : 0;
    }

    function sampleGrid(size = 5, cellRow = activeCell.row, cellCol = activeCell.col) {
      const values = [];
      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          const x = col / (size - 1);
          const y = 1 - row / (size - 1);
          values.push({ row, col, ...perlinData(x, y, cellRow, cellCol) });
        }
      }
      return values;
    }

    function renderGradientGrid(svgId, options = {}) {
      const svg = document.getElementById(svgId);
      const ns = "http://www.w3.org/2000/svg";
      const pad = 86;
      const span = 147;
      const highlightCell = options.highlightCell || null;
      const fineSamples = options.fineSamples || null;
      const sampleKey = options.sampleKey || null;

      svg.innerHTML = "";

      const bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", "36");
      bg.setAttribute("y", "36");
      bg.setAttribute("width", "688");
      bg.setAttribute("height", "688");
      bg.setAttribute("rx", "24");
      bg.setAttribute("fill", "#fffaf1");
      bg.setAttribute("stroke", "#d8c7a7");
      bg.setAttribute("stroke-width", "2");
      svg.appendChild(bg);

      if (highlightCell) {
        const highlight = document.createElementNS(ns, "rect");
        const cellX = pad + highlightCell.col * span;
        const cellY = pad + highlightCell.row * span;
        highlight.setAttribute("x", cellX.toString());
        highlight.setAttribute("y", cellY.toString());
        highlight.setAttribute("width", span.toString());
        highlight.setAttribute("height", span.toString());
        highlight.setAttribute("rx", "18");
        highlight.setAttribute("fill", "rgba(201, 117, 58, 0.18)");
        highlight.setAttribute("stroke", "#c8753a");
        highlight.setAttribute("stroke-width", "3");
        svg.appendChild(highlight);

        if (fineSamples && sampleKey) {
          const count = Math.sqrt(fineSamples.length);
          const cellSize = span / count;

          fineSamples.forEach((entry, index) => {
            const sampleRow = Math.floor(index / count);
            const sampleCol = index % count;
            const value = entry[sampleKey];
            const sampleRect = document.createElementNS(ns, "rect");
            const sampleX = cellX + sampleCol * cellSize;
            const sampleY = cellY + sampleRow * cellSize;
            sampleRect.setAttribute("x", sampleX.toFixed(2));
            sampleRect.setAttribute("y", sampleY.toFixed(2));
            sampleRect.setAttribute("width", cellSize.toFixed(2));
            sampleRect.setAttribute("height", cellSize.toFixed(2));
            sampleRect.setAttribute("fill", colorForValue(value, -1.2, 1.2));
            sampleRect.setAttribute("stroke", "rgba(255,255,255,0.55)");
            sampleRect.setAttribute("stroke-width", "1");
            sampleRect.style.cursor = "pointer";
            sampleRect.addEventListener("mouseenter", (event) => {
              renderHoverFormula(entry);
              moveHoverTooltip(event);
              hoverTooltip.classList.add("visible");
            });
            sampleRect.addEventListener("mousemove", (event) => {
              renderHoverFormula(entry);
              moveHoverTooltip(event);
            });
            sampleRect.addEventListener("mouseleave", () => {
              hoverTooltip.classList.remove("visible");
            });
            svg.appendChild(sampleRect);

            const sampleText = document.createElementNS(ns, "text");
            sampleText.setAttribute("x", (sampleX + cellSize / 2).toFixed(2));
            sampleText.setAttribute("y", (sampleY + cellSize / 2 + 4).toFixed(2));
            sampleText.setAttribute("text-anchor", "middle");
            sampleText.setAttribute("font-size", count >= 9 ? "8" : "10");
            sampleText.setAttribute("fill", textColorForValue(value, -1.2, 1.2));
            sampleText.style.pointerEvents = "none";
            sampleText.textContent = "";
            svg.appendChild(sampleText);
          });
        }

        const clickableCorners = [
          { key: "d01", label: "d01", x: cellX, y: cellY },
          { key: "d11", label: "d11", x: cellX + span, y: cellY },
          { key: "d00", label: "d00", x: cellX, y: cellY + span },
          { key: "d10", label: "d10", x: cellX + span, y: cellY + span }
        ];

        clickableCorners.forEach((corner) => {
          const isActive = corner.key === selectedCorner;

          const hit = document.createElementNS(ns, "circle");
          hit.setAttribute("cx", corner.x.toString());
          hit.setAttribute("cy", corner.y.toString());
          hit.setAttribute("r", isActive ? "18" : "14");
          hit.setAttribute("fill", isActive ? "rgba(13,106,116,0.18)" : "rgba(255,250,241,0.82)");
          hit.setAttribute("stroke", isActive ? "#0d6a74" : "#8a7d67");
          hit.setAttribute("stroke-width", isActive ? "4" : "2");
          hit.style.cursor = "pointer";
          hit.addEventListener("click", () => {
            selectedCorner = corner.key;
            renderSlide2Grid();
          });
          svg.appendChild(hit);

          const label = document.createElementNS(ns, "text");
          label.setAttribute("x", corner.x.toString());
          label.setAttribute("y", (corner.y - 24).toString());
          label.setAttribute("text-anchor", "middle");
          label.setAttribute("font-size", "16");
          label.setAttribute("font-weight", isActive ? "700" : "600");
          label.setAttribute("fill", isActive ? "#0b4c53" : "#5c655e");
          label.style.cursor = "pointer";
          label.textContent = corner.label;
          label.addEventListener("click", () => {
            selectedCorner = corner.key;
            renderSlide2Grid();
          });
          svg.appendChild(label);
        });
      }

      for (let i = 0; i < 5; i += 1) {
        const p = pad + i * span;
        const h = document.createElementNS(ns, "line");
        h.setAttribute("x1", pad);
        h.setAttribute("y1", p);
        h.setAttribute("x2", pad + 4 * span);
        h.setAttribute("y2", p);
        h.setAttribute("stroke", i === 0 || i === 4 ? "#8a7d67" : "rgba(29,43,47,0.16)");
        h.setAttribute("stroke-width", i === 0 || i === 4 ? "2.2" : "1.4");
        svg.appendChild(h);

        const v = document.createElementNS(ns, "line");
        v.setAttribute("x1", p);
        v.setAttribute("y1", pad);
        v.setAttribute("x2", p);
        v.setAttribute("y2", pad + 4 * span);
        v.setAttribute("stroke", i === 0 || i === 4 ? "#8a7d67" : "rgba(29,43,47,0.16)");
        v.setAttribute("stroke-width", i === 0 || i === 4 ? "2.2" : "1.4");
        svg.appendChild(v);
      }

      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 5; col += 1) {
          const px = pad + col * span;
          const py = pad + row * span;
          const g = vertexGradients[row][col];

          const point = document.createElementNS(ns, "circle");
          point.setAttribute("cx", px);
          point.setAttribute("cy", py);
          point.setAttribute("r", "6");
          point.setAttribute("fill", "#1d2b2f");
          svg.appendChild(point);

          const arrow = document.createElementNS(ns, "line");
          arrow.setAttribute("x1", px);
          arrow.setAttribute("y1", py);
          arrow.setAttribute("x2", (px + g.x * 38).toFixed(1));
          arrow.setAttribute("y2", (py - g.y * 38).toFixed(1));
          arrow.setAttribute("stroke", "#0d6a74");
          arrow.setAttribute("stroke-width", "4");
          arrow.setAttribute("stroke-linecap", "round");
          svg.appendChild(arrow);

          const tip = document.createElementNS(ns, "circle");
          tip.setAttribute("cx", (px + g.x * 38).toFixed(1));
          tip.setAttribute("cy", (py - g.y * 38).toFixed(1));
          tip.setAttribute("r", "3.5");
          tip.setAttribute("fill", "#0d6a74");
          svg.appendChild(tip);

          const label = document.createElementNS(ns, "text");
          label.setAttribute("x", px + 10);
          label.setAttribute("y", py - 12);
          label.setAttribute("font-size", "14");
          label.setAttribute("fill", "#4b5c61");
          label.textContent = `(${col}, ${4 - row})`;
          svg.appendChild(label);
        }
      }

    }

    function createCell(entry, key, min, max) {
      const cell = document.createElement("div");
      const value = entry[key];
      cell.className = "cell";
      cell.style.background = colorForValue(value, min, max);
      cell.style.color = textColorForValue(value, min, max);
      cell.innerHTML = `${value.toFixed(2)}<span class="tiny">(${entry.x.toFixed(2)}, ${entry.y.toFixed(2)})</span>`;
      return cell;
    }

    function renderHoverFormula(entry) {
      const cellRow = entry.cellRow ?? activeCell.row;
      const cellCol = entry.cellCol ?? activeCell.col;
      const g = getCellGradients(cellRow, cellCol)[selectedCorner];
      const offsetKey = selectedCorner === "d00" ? "offset00" : selectedCorner === "d10" ? "offset10" : selectedCorner === "d01" ? "offset01" : "offset11";
      const off = entry[offsetKey];
      const value = entry[selectedCorner];
      hoverPosition.innerHTML = `(x, y) = <span style="color: #c8753a;">(${entry.x.toFixed(2)}, ${entry.y.toFixed(2)})</span>`;
      hoverGradient.innerHTML = `<span style="color: #0b4c53;">g</span> = <span style="color: #0b4c53;">(${g.x.toFixed(2)}, ${g.y.toFixed(2)})</span>`;
      hoverOffset.innerHTML = `<span style="color: #c8753a;">offset</span> = <span style="color: #c8753a;">(${off.x.toFixed(2)}, ${off.y.toFixed(2)})</span>`;
      hoverFormula.innerHTML = `dot(<span style="color: #0b4c53;">g</span>, <span style="color: #c8753a;">offset</span>) = <span style="color: #0b4c53;">${g.x.toFixed(2)}</span> * <span style="color: #c8753a;">${off.x.toFixed(2)}</span> + <span style="color: #0b4c53;">${g.y.toFixed(2)}</span> * <span style="color: #c8753a;">${off.y.toFixed(2)}</span> = <span style="color: #8f4d21;">${value.toFixed(3)}</span>`;
    }

    function moveTooltipWithinShell(event, tooltip, shell) {
      const shellBounds = shell.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 320;
      const tooltipHeight = tooltip.offsetHeight || 120;
      const offset = 18;
      let left = event.clientX - shellBounds.left + offset;
      let top = event.clientY - shellBounds.top + offset;

      if (left + tooltipWidth > shellBounds.width - 10) {
        left = event.clientX - shellBounds.left - tooltipWidth - offset;
      }
      if (top + tooltipHeight > shellBounds.height - 10) {
        top = event.clientY - shellBounds.top - tooltipHeight - offset;
      }

      tooltip.style.left = `${Math.max(10, left)}px`;
      tooltip.style.top = `${Math.max(10, top)}px`;
    }

    function moveTooltipWithinFrame(event, tooltip) {
      const frameBounds = tooltip.parentElement.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth || 320;
      const tooltipHeight = tooltip.offsetHeight || 120;
      const offset = 18;
      let left = event.clientX - frameBounds.left + offset;
      let top = event.clientY - frameBounds.top + offset;

      if (left + tooltipWidth > frameBounds.width - 10) {
        left = event.clientX - frameBounds.left - tooltipWidth - offset;
      }
      if (top + tooltipHeight > frameBounds.height - 10) {
        top = event.clientY - frameBounds.top - tooltipHeight - offset;
      }

      tooltip.style.left = `${Math.max(10, left)}px`;
      tooltip.style.top = `${Math.max(10, top)}px`;
    }

    function renderSlide3Formula(entry) {
      const config = getSlide3BlendConfig();
      const leftValue = entry[config.leftKey];
      const rightValue = entry[config.middleKey];
      slide3Formula.textContent =
        `${config.blendLabel} = ${config.leftKey} + (${config.middleKey} - ${config.leftKey}) * fade(x)\n` +
        `= ${leftValue.toFixed(2)} + (${rightValue.toFixed(2)} - ${leftValue.toFixed(2)}) * ${entry.u.toFixed(3)}\n` +
        `= ${entry[config.blendKey].toFixed(3)}`;
      renderFadeXCurve(slide3FadeCurveSvg, entry.x);
    }

    function renderSlide3DotFormula(entry, cornerKey) {
      const cellGradients = getCellGradients(entry.cellRow, entry.cellCol);
      const g = cellGradients[cornerKey];
      const offsetKey = cornerKey === "d00" ? "offset00" : cornerKey === "d10" ? "offset10" : cornerKey === "d01" ? "offset01" : "offset11";
      const off = entry[offsetKey];
      const value = entry[cornerKey];
      slide3Formula.textContent = `dot(g, offset) = ${g.x.toFixed(2)} * ${off.x.toFixed(2)} + ${g.y.toFixed(2)} * ${off.y.toFixed(2)} = ${value.toFixed(3)}`;
      renderFadeXCurve(slide3FadeCurveSvg, entry.x);
    }

    function renderSlide4Formula(entry) {
      slide4Position.textContent = `(x, y) = (${entry.x.toFixed(2)}, ${entry.y.toFixed(2)})`;
      slide4Inputs.textContent = `final uses x1 = ${entry.x0.toFixed(2)} and x2 = ${entry.x1.toFixed(2)}`;
      slide4Weight.textContent = `v = fade(y) = ${entry.v.toFixed(3)}`;
      slide4Formula.textContent = `final = ${entry.x0.toFixed(2)} + (${entry.x1.toFixed(2)} - ${entry.x0.toFixed(2)}) * ${entry.v.toFixed(3)} = ${entry.final.toFixed(3)}`;
      renderFadeYCurve(slide4FadeCurveSvg, entry.y);
    }

    function defaultSlide2Sample() {
      const entry = sampleGrid(9, activeCell.row, activeCell.col).find((sample) => sample.row === 4 && sample.col === 4);
      return { ...entry, cellRow: activeCell.row, cellCol: activeCell.col };
    }

    function renderSlide2Detail(entry) {
      const ns = "http://www.w3.org/2000/svg";
      const svg = slide2DetailSvg;
      const pad = 50;
      const span = 140;
      const cellRow = entry.cellRow ?? activeCell.row;
      const cellCol = entry.cellCol ?? activeCell.col;
      const cornerPoint = getCornerPoint(0, 0, selectedCorner, pad, span);
      const samplePoint = {
        x: pad + entry.x * span,
        y: pad + (1 - entry.y) * span
      };
      const cellGradients = getCellGradients(cellRow, cellCol);
      const g = cellGradients[selectedCorner];
      const arrowEnd = {
        x: cornerPoint.x + g.x * 34,
        y: cornerPoint.y - g.y * 34
      };

      svg.innerHTML = "";

      const bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", "12");
      bg.setAttribute("y", "12");
      bg.setAttribute("width", "216");
      bg.setAttribute("height", "216");
      bg.setAttribute("rx", "18");
      bg.setAttribute("fill", "#fffaf1");
      bg.setAttribute("stroke", "#d8c7a7");
      bg.setAttribute("stroke-width", "2");
      svg.appendChild(bg);

      const cell = document.createElementNS(ns, "rect");
      cell.setAttribute("x", pad.toString());
      cell.setAttribute("y", pad.toString());
      cell.setAttribute("width", span.toString());
      cell.setAttribute("height", span.toString());
      cell.setAttribute("rx", "14");
      cell.setAttribute("fill", "rgba(201, 117, 58, 0.08)");
      cell.setAttribute("stroke", "#c8753a");
      cell.setAttribute("stroke-width", "2.5");
      svg.appendChild(cell);

      const gridLines = [
        [pad, pad, pad + span, pad],
        [pad, pad + span, pad + span, pad + span],
        [pad, pad, pad, pad + span],
        [pad + span, pad, pad + span, pad + span]
      ];

      gridLines.forEach(([x1, y1, x2, y2]) => {
        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", x1.toString());
        line.setAttribute("y1", y1.toString());
        line.setAttribute("x2", x2.toString());
        line.setAttribute("y2", y2.toString());
        line.setAttribute("stroke", "#8a7d67");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
      });

      ["d01", "d11", "d00", "d10"].forEach((cornerKey) => {
        const point = getCornerPoint(0, 0, cornerKey, pad, span);
        const vertex = document.createElementNS(ns, "circle");
        vertex.setAttribute("cx", point.x.toFixed(1));
        vertex.setAttribute("cy", point.y.toFixed(1));
        vertex.setAttribute("r", cornerKey === selectedCorner ? "7" : "4.5");
        vertex.setAttribute("fill", cornerKey === selectedCorner ? "#0b4c53" : "#1d2b2f");
        svg.appendChild(vertex);
      });

      const vectorLine = document.createElementNS(ns, "line");
      vectorLine.setAttribute("x1", cornerPoint.x.toFixed(1));
      vectorLine.setAttribute("y1", cornerPoint.y.toFixed(1));
      vectorLine.setAttribute("x2", samplePoint.x.toFixed(1));
      vectorLine.setAttribute("y2", samplePoint.y.toFixed(1));
      vectorLine.setAttribute("stroke", "#c8753a");
      vectorLine.setAttribute("stroke-width", "3");
      vectorLine.setAttribute("stroke-linecap", "round");
      svg.appendChild(vectorLine);

      const gradientLine = document.createElementNS(ns, "line");
      gradientLine.setAttribute("x1", cornerPoint.x.toFixed(1));
      gradientLine.setAttribute("y1", cornerPoint.y.toFixed(1));
      gradientLine.setAttribute("x2", arrowEnd.x.toFixed(1));
      gradientLine.setAttribute("y2", arrowEnd.y.toFixed(1));
      gradientLine.setAttribute("stroke", "#0b4c53");
      gradientLine.setAttribute("stroke-width", "4.5");
      gradientLine.setAttribute("stroke-linecap", "round");
      svg.appendChild(gradientLine);

      const sample = document.createElementNS(ns, "circle");
      sample.setAttribute("cx", samplePoint.x.toFixed(1));
      sample.setAttribute("cy", samplePoint.y.toFixed(1));
      sample.setAttribute("r", "6");
      sample.setAttribute("fill", "#c8753a");
      sample.setAttribute("stroke", "#fffaf1");
      sample.setAttribute("stroke-width", "2");
      svg.appendChild(sample);
    }

    function renderFadeCurve(svg, currentT = null, axisLabel = "x") {
      const ns = "http://www.w3.org/2000/svg";
      svg.innerHTML = "";

      const bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", "0");
      bg.setAttribute("y", "0");
      bg.setAttribute("width", "280");
      bg.setAttribute("height", "120");
      bg.setAttribute("rx", "14");
      bg.setAttribute("fill", "rgba(255,255,255,0.72)");
      svg.appendChild(bg);

      const axisX = document.createElementNS(ns, "line");
      axisX.setAttribute("x1", "28");
      axisX.setAttribute("y1", "92");
      axisX.setAttribute("x2", "252");
      axisX.setAttribute("y2", "92");
      axisX.setAttribute("stroke", "rgba(29,43,47,0.28)");
      axisX.setAttribute("stroke-width", "1.5");
      svg.appendChild(axisX);

      const axisY = document.createElementNS(ns, "line");
      axisY.setAttribute("x1", "28");
      axisY.setAttribute("y1", "20");
      axisY.setAttribute("x2", "28");
      axisY.setAttribute("y2", "92");
      axisY.setAttribute("stroke", "rgba(29,43,47,0.28)");
      axisY.setAttribute("stroke-width", "1.5");
      svg.appendChild(axisY);

      let pathData = "";
      for (let i = 0; i <= 80; i += 1) {
        const t = i / 80;
        const x = 28 + t * 224;
        const y = 92 - fade(t) * 72;
        pathData += `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)} `;
      }

      const curve = document.createElementNS(ns, "path");
      curve.setAttribute("d", pathData.trim());
      curve.setAttribute("fill", "none");
      curve.setAttribute("stroke", "#0d6a74");
      curve.setAttribute("stroke-width", "4");
      curve.setAttribute("stroke-linecap", "round");
      svg.appendChild(curve);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", "34");
      label.setAttribute("y", "26");
      label.setAttribute("fill", "#0b4c53");
      label.setAttribute("font-size", "14");
      label.textContent = `fade(${axisLabel}) = 6${axisLabel}^5 - 15${axisLabel}^4 + 10${axisLabel}^3`;
      svg.appendChild(label);

      const zero = document.createElementNS(ns, "text");
      zero.setAttribute("x", "24");
      zero.setAttribute("y", "108");
      zero.setAttribute("fill", "#54656a");
      zero.setAttribute("font-size", "12");
      zero.textContent = "0";
      svg.appendChild(zero);

      const one = document.createElementNS(ns, "text");
      one.setAttribute("x", "248");
      one.setAttribute("y", "108");
      one.setAttribute("fill", "#54656a");
      one.setAttribute("font-size", "12");
      one.textContent = "1";
      svg.appendChild(one);

      if (currentT !== null) {
        const clampedT = Math.max(0, Math.min(1, currentT));
        const markerX = 28 + clampedT * 224;
        const fadeValue = fade(clampedT);
        const markerY = 92 - fadeValue * 72;

        const guide = document.createElementNS(ns, "line");
        guide.setAttribute("x1", markerX.toFixed(2));
        guide.setAttribute("y1", "92");
        guide.setAttribute("x2", markerX.toFixed(2));
        guide.setAttribute("y2", markerY.toFixed(2));
        guide.setAttribute("stroke", "rgba(200,117,58,0.45)");
        guide.setAttribute("stroke-width", "2");
        guide.setAttribute("stroke-dasharray", "4 4");
        svg.appendChild(guide);

        const marker = document.createElementNS(ns, "circle");
        marker.setAttribute("cx", markerX.toFixed(2));
        marker.setAttribute("cy", markerY.toFixed(2));
        marker.setAttribute("r", "5.5");
        marker.setAttribute("fill", "#c8753a");
        marker.setAttribute("stroke", "#fffaf1");
        marker.setAttribute("stroke-width", "2");
        svg.appendChild(marker);

        const valueLabel = document.createElementNS(ns, "text");
        const labelX = Math.max(34, Math.min(markerX - 36, 184));
        const labelY = Math.max(34, markerY - 12);
        valueLabel.setAttribute("x", labelX.toFixed(2));
        valueLabel.setAttribute("y", labelY.toFixed(2));
        valueLabel.setAttribute("fill", "#8f4d21");
        valueLabel.setAttribute("font-size", "13");
        valueLabel.setAttribute("font-weight", "700");
        valueLabel.textContent = `fade(${axisLabel}) = ${fadeValue.toFixed(3)}`;
        svg.appendChild(valueLabel);
      }
    }

    function renderFadeXCurve(svg, currentX = null) {
      renderFadeCurve(svg, currentX, "x");
    }

    function renderFadeYCurve(svg, currentY = null) {
      renderFadeCurve(svg, currentY, "y");
    }

    function renderSelectedContributionLattice() {
      const svg = interpolationGridSvg;
      renderLatticeField(svg, (entry) => entry[selectedCorner], -1.2, 1.2, { colorFn: colorForValue });
    }

    function sampleEntryKey(entry) {
      return `${entry.cellRow}-${entry.cellCol}-${entry.row}-${entry.col}`;
    }

    function getCornerPoint(cellRow, cellCol, cornerKey, pad, span) {
      const cellX = pad + cellCol * span;
      const cellY = pad + cellRow * span;
      if (cornerKey === "d01") {
        return { x: cellX, y: cellY };
      }
      if (cornerKey === "d11") {
        return { x: cellX + span, y: cellY };
      }
      if (cornerKey === "d00") {
        return { x: cellX, y: cellY + span };
      }
      return { x: cellX + span, y: cellY + span };
    }

    function renderLatticeField(svg, valueGetter, min, max, options = {}) {
      const colorFn = options.colorFn || colorForValue;
      const hoverHandler = options.hoverHandler || null;
      const hoverTooltipElement = options.hoverTooltipElement || null;
      const highlightedSampleKey = options.highlightedSampleKey || null;
      const highlightedSampleEntry = options.highlightedSampleEntry || null;
      const activeCornerKey = options.activeCornerKey || null;
      const highlightedSampleBubble = options.highlightedSampleBubble || null;
      const onSampleEnter = options.onSampleEnter || null;
      const onSampleMove = options.onSampleMove || null;
      const onSampleLeave = options.onSampleLeave || null;
      const ns = "http://www.w3.org/2000/svg";
      const pad = 86;
      const span = 147;
      const subdivisions = 9;
      svg.innerHTML = "";

      const bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", "36");
      bg.setAttribute("y", "36");
      bg.setAttribute("width", "688");
      bg.setAttribute("height", "688");
      bg.setAttribute("rx", "24");
      bg.setAttribute("fill", "#fffaf1");
      bg.setAttribute("stroke", "#d8c7a7");
      bg.setAttribute("stroke-width", "2");
      svg.appendChild(bg);

      for (let cellRow = 0; cellRow < 4; cellRow += 1) {
        for (let cellCol = 0; cellCol < 4; cellCol += 1) {
          const samples = sampleGrid(subdivisions, cellRow, cellCol);
          const cellSize = span / subdivisions;
          const baseX = pad + cellCol * span;
          const baseY = pad + cellRow * span;

          samples.forEach((entry, index) => {
            const sampleRow = Math.floor(index / subdivisions);
            const sampleCol = index % subdivisions;
            const hoverEntry = { ...entry, cellRow, cellCol, sampleRow, sampleCol };
            const isHighlighted = sampleEntryKey(hoverEntry) === highlightedSampleKey;
            const rect = document.createElementNS(ns, "rect");
            rect.setAttribute("x", (baseX + sampleCol * cellSize).toFixed(2));
            rect.setAttribute("y", (baseY + sampleRow * cellSize).toFixed(2));
            rect.setAttribute("width", cellSize.toFixed(2));
            rect.setAttribute("height", cellSize.toFixed(2));
            rect.setAttribute("fill", colorFn(valueGetter(hoverEntry), min, max));
            rect.setAttribute("stroke", isHighlighted ? "#8f4d21" : "rgba(255,255,255,0.28)");
            rect.setAttribute("stroke-width", isHighlighted ? "3" : "0.8");
            if (hoverHandler || hoverTooltipElement || onSampleEnter || onSampleMove || onSampleLeave) {
              rect.style.cursor = "pointer";
              rect.addEventListener("mouseenter", (event) => {
                if (hoverHandler) {
                  hoverHandler(hoverEntry);
                }
                if (hoverTooltipElement) {
                  moveTooltipWithinFrame(event, hoverTooltipElement);
                  hoverTooltipElement.classList.add("visible");
                }
                if (onSampleEnter) {
                  onSampleEnter(hoverEntry, event);
                }
              });
              rect.addEventListener("mousemove", (event) => {
                if (hoverHandler) {
                  hoverHandler(hoverEntry);
                }
                if (hoverTooltipElement) {
                  moveTooltipWithinFrame(event, hoverTooltipElement);
                }
                if (onSampleMove) {
                  onSampleMove(hoverEntry, event);
                }
              });
              rect.addEventListener("mouseleave", () => {
                if (hoverTooltipElement) {
                  hoverTooltipElement.classList.remove("visible");
                }
                if (onSampleLeave) {
                  onSampleLeave(hoverEntry);
                }
              });
            }
            svg.appendChild(rect);
          });
        }
      }

      for (let i = 0; i < 5; i += 1) {
        const p = pad + i * span;
        const h = document.createElementNS(ns, "line");
        h.setAttribute("x1", pad);
        h.setAttribute("y1", p);
        h.setAttribute("x2", pad + 4 * span);
        h.setAttribute("y2", p);
        h.setAttribute("stroke", i === 0 || i === 4 ? "#8a7d67" : "rgba(29,43,47,0.16)");
        h.setAttribute("stroke-width", i === 0 || i === 4 ? "2.2" : "1.4");
        svg.appendChild(h);

        const v = document.createElementNS(ns, "line");
        v.setAttribute("x1", p);
        v.setAttribute("y1", pad);
        v.setAttribute("x2", p);
        v.setAttribute("y2", pad + 4 * span);
        v.setAttribute("stroke", i === 0 || i === 4 ? "#8a7d67" : "rgba(29,43,47,0.16)");
        v.setAttribute("stroke-width", i === 0 || i === 4 ? "2.2" : "1.4");
        svg.appendChild(v);
      }

      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 5; col += 1) {
          const px = pad + col * span;
          const py = pad + row * span;
          const g = vertexGradients[row][col];

          const point = document.createElementNS(ns, "circle");
          point.setAttribute("cx", px);
          point.setAttribute("cy", py);
          point.setAttribute("r", "5");
          point.setAttribute("fill", "#1d2b2f");
          svg.appendChild(point);

          const arrow = document.createElementNS(ns, "line");
          arrow.setAttribute("x1", px);
          arrow.setAttribute("y1", py);
          arrow.setAttribute("x2", (px + g.x * 38).toFixed(1));
          arrow.setAttribute("y2", (py - g.y * 38).toFixed(1));
          arrow.setAttribute("stroke", "#0d6a74");
          arrow.setAttribute("stroke-width", "4");
          arrow.setAttribute("stroke-linecap", "round");
          svg.appendChild(arrow);

          const tip = document.createElementNS(ns, "circle");
          tip.setAttribute("cx", (px + g.x * 38).toFixed(1));
          tip.setAttribute("cy", (py - g.y * 38).toFixed(1));
          tip.setAttribute("r", "3.5");
          tip.setAttribute("fill", "#0d6a74");
          svg.appendChild(tip);
        }
      }

      if (highlightedSampleEntry && activeCornerKey) {
        const cornerPoint = getCornerPoint(highlightedSampleEntry.cellRow, highlightedSampleEntry.cellCol, activeCornerKey, pad, span);
        const samplePoint = {
          x: pad + highlightedSampleEntry.cellCol * span + highlightedSampleEntry.x * span,
          y: pad + highlightedSampleEntry.cellRow * span + (1 - highlightedSampleEntry.y) * span
        };
        const cellGradients = getCellGradients(highlightedSampleEntry.cellRow, highlightedSampleEntry.cellCol);
        const g = cellGradients[activeCornerKey];
        const arrowEnd = {
          x: cornerPoint.x + g.x * 38,
          y: cornerPoint.y - g.y * 38
        };

        const vectorLine = document.createElementNS(ns, "line");
        vectorLine.setAttribute("x1", cornerPoint.x.toFixed(1));
        vectorLine.setAttribute("y1", cornerPoint.y.toFixed(1));
        vectorLine.setAttribute("x2", samplePoint.x.toFixed(1));
        vectorLine.setAttribute("y2", samplePoint.y.toFixed(1));
        vectorLine.setAttribute("stroke", "#c8753a");
        vectorLine.setAttribute("stroke-width", "4");
        vectorLine.setAttribute("stroke-linecap", "round");
        svg.appendChild(vectorLine);

        const gradientLine = document.createElementNS(ns, "line");
        gradientLine.setAttribute("x1", cornerPoint.x.toFixed(1));
        gradientLine.setAttribute("y1", cornerPoint.y.toFixed(1));
        gradientLine.setAttribute("x2", arrowEnd.x.toFixed(1));
        gradientLine.setAttribute("y2", arrowEnd.y.toFixed(1));
        gradientLine.setAttribute("stroke", "#0b4c53");
        gradientLine.setAttribute("stroke-width", "6");
        gradientLine.setAttribute("stroke-linecap", "round");
        svg.appendChild(gradientLine);

        const cornerHighlight = document.createElementNS(ns, "circle");
        cornerHighlight.setAttribute("cx", cornerPoint.x.toFixed(1));
        cornerHighlight.setAttribute("cy", cornerPoint.y.toFixed(1));
        cornerHighlight.setAttribute("r", "11");
        cornerHighlight.setAttribute("fill", "rgba(13,106,116,0.14)");
        cornerHighlight.setAttribute("stroke", "#0b4c53");
        cornerHighlight.setAttribute("stroke-width", "3");
        svg.appendChild(cornerHighlight);

        const sampleHighlight = document.createElementNS(ns, "circle");
        sampleHighlight.setAttribute("cx", samplePoint.x.toFixed(1));
        sampleHighlight.setAttribute("cy", samplePoint.y.toFixed(1));
        sampleHighlight.setAttribute("r", "8");
        sampleHighlight.setAttribute("fill", "#c8753a");
        sampleHighlight.setAttribute("stroke", "#fffaf1");
        sampleHighlight.setAttribute("stroke-width", "2.5");
        svg.appendChild(sampleHighlight);

        if (highlightedSampleBubble) {
          const bubbleText = document.createElementNS(ns, "text");
          bubbleText.setAttribute("font-family", "Trebuchet MS, Gill Sans, sans-serif");
          bubbleText.setAttribute("font-size", "38");
          bubbleText.setAttribute("font-weight", "700");
          bubbleText.setAttribute("letter-spacing", "0.02em");
          bubbleText.textContent = highlightedSampleBubble(highlightedSampleEntry);
          svg.appendChild(bubbleText);

          const textBox = bubbleText.getBBox();
          const bubblePaddingX = 22;
          const bubblePaddingY = 18;
          const pointerSize = 10;
          const bubbleWidth = textBox.width + bubblePaddingX * 2;
          const bubbleHeight = textBox.height + bubblePaddingY * 2;
          const minX = 48;
          const maxX = 712 - bubbleWidth;
          const bubbleX = Math.max(minX, Math.min(samplePoint.x - bubbleWidth / 2, maxX));
          const bubbleY = Math.max(44, samplePoint.y - bubbleHeight - 20);

          const bubbleRect = document.createElementNS(ns, "rect");
          bubbleRect.setAttribute("x", bubbleX.toFixed(1));
          bubbleRect.setAttribute("y", bubbleY.toFixed(1));
          bubbleRect.setAttribute("width", bubbleWidth.toFixed(1));
          bubbleRect.setAttribute("height", bubbleHeight.toFixed(1));
          bubbleRect.setAttribute("rx", "14");
          bubbleRect.setAttribute("fill", "rgba(255, 250, 241, 0.96)");
          bubbleRect.setAttribute("stroke", "#c8753a");
          bubbleRect.setAttribute("stroke-width", "2");
          svg.appendChild(bubbleRect);

          const pointer = document.createElementNS(ns, "path");
          const pointerBaseX = Math.max(bubbleX + 16, Math.min(samplePoint.x, bubbleX + bubbleWidth - 16));
          const pointerBaseY = bubbleY + bubbleHeight;
          pointer.setAttribute(
            "d",
            `M ${pointerBaseX - pointerSize} ${pointerBaseY} L ${pointerBaseX + pointerSize} ${pointerBaseY} L ${samplePoint.x.toFixed(1)} ${(samplePoint.y - 10).toFixed(1)} Z`
          );
          pointer.setAttribute("fill", "rgba(255, 250, 241, 0.96)");
          pointer.setAttribute("stroke", "#c8753a");
          pointer.setAttribute("stroke-width", "2");
          pointer.setAttribute("stroke-linejoin", "round");
          svg.appendChild(pointer);

          bubbleText.setAttribute("x", (bubbleX + bubblePaddingX).toFixed(1));
          bubbleText.setAttribute("y", (bubbleY + bubblePaddingY + textBox.height - 2).toFixed(1));
          bubbleText.setAttribute("fill", "#8f4d21");
          svg.appendChild(bubbleText);
        }
      }
    }

    function getSlide3BlendConfig() {
      if (selectedXBlend === "x0") {
        return {
          leftKey: "d00",
          middleKey: "d10",
          blendKey: "x0",
          blendLabel: "x1",
          leftTitle: "Corner Dot Product: d00",
          middleTitle: "Corner Dot Product: d10",
          leftCaption: "The left endpoint for the horizontal blend.",
          middleCaption: "The right endpoint for the horizontal blend.",
          rightCaption: "This is the lerp result using fade(x) between d00 and d10."
        };
      }

      return {
        leftKey: "d01",
        middleKey: "d11",
        blendKey: "x1",
        blendLabel: "x2",
        leftTitle: "Corner Dot Product: d01",
        middleTitle: "Corner Dot Product: d11",
        leftCaption: "The left endpoint for the upper horizontal blend.",
        middleCaption: "The right endpoint for the upper horizontal blend.",
        rightCaption: "This is the lerp result using fade(x) between d01 and d11."
      };
    }

    function renderTextureField(svg, valueFn, min, max, colorFn = contrastColorForValue) {
      const ns = "http://www.w3.org/2000/svg";
      const size = 760;
      const pad = 24;
      const gridSize = 64;
      const cellSize = (size - pad * 2) / gridSize;
      svg.innerHTML = "";

      const bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", "10");
      bg.setAttribute("y", "10");
      bg.setAttribute("width", "740");
      bg.setAttribute("height", "740");
      bg.setAttribute("rx", "22");
      bg.setAttribute("fill", "#fffaf1");
      bg.setAttribute("stroke", "#d8c7a7");
      bg.setAttribute("stroke-width", "2");
      svg.appendChild(bg);

      for (let row = 0; row < gridSize; row += 1) {
        for (let col = 0; col < gridSize; col += 1) {
          const x = col / (gridSize - 1);
          const y = 1 - row / (gridSize - 1);
          const rect = document.createElementNS(ns, "rect");
          rect.setAttribute("x", (pad + col * cellSize).toFixed(2));
          rect.setAttribute("y", (pad + row * cellSize).toFixed(2));
          rect.setAttribute("width", Math.ceil(cellSize + 0.2).toString());
          rect.setAttribute("height", Math.ceil(cellSize + 0.2).toString());
          rect.setAttribute("fill", colorFn(valueFn(x, y), min, max));
          svg.appendChild(rect);
        }
      }
    }

    function renderNaiveNoiseField(svg, seedText) {
      const rng = createRngFromSeed(`${seedText}|naive-noise`);
      const ns = "http://www.w3.org/2000/svg";
      const size = 760;
      const pad = 24;
      const gridSize = 28;
      const cellSize = (size - pad * 2) / gridSize;
      svg.innerHTML = "";

      const bg = document.createElementNS(ns, "rect");
      bg.setAttribute("x", "10");
      bg.setAttribute("y", "10");
      bg.setAttribute("width", "740");
      bg.setAttribute("height", "740");
      bg.setAttribute("rx", "22");
      bg.setAttribute("fill", "#fffaf1");
      bg.setAttribute("stroke", "#d8c7a7");
      bg.setAttribute("stroke-width", "2");
      svg.appendChild(bg);

      for (let row = 0; row < gridSize; row += 1) {
        for (let col = 0; col < gridSize; col += 1) {
          const value = rng() * 2 - 1;
          const rect = document.createElementNS(ns, "rect");
          rect.setAttribute("x", (pad + col * cellSize).toFixed(2));
          rect.setAttribute("y", (pad + row * cellSize).toFixed(2));
          rect.setAttribute("width", Math.ceil(cellSize + 0.2).toString());
          rect.setAttribute("height", Math.ceil(cellSize + 0.2).toString());
          rect.setAttribute("fill", contrastColorForValue(value, -1, 1));
          svg.appendChild(rect);
        }
      }
    }

    function renderSlide3Panels() {
      const config = getSlide3BlendConfig();
      slide3LeftTitle.textContent = config.leftTitle;
      slide3MiddleTitle.textContent = config.middleTitle;
      slide3RightTitle.textContent = `Horizontal Blend: ${config.blendLabel}`;
      renderLatticeField(slide3LeftSvg, (entry) => entry[config.leftKey], -1.2, 1.2, {
        colorFn: colorForValue,
        hoverHandler: (entry) => renderSlide3DotFormula(entry, config.leftKey),
        highlightedSampleKey: slide3HoveredSample ? sampleEntryKey(slide3HoveredSample) : null,
        highlightedSampleEntry: slide3HoveredSample,
        activeCornerKey: config.leftKey,
        highlightedSampleBubble: (entry) => `${config.leftKey} = ${entry[config.leftKey].toFixed(2)}`,
        onSampleEnter: (entry) => {
          slide3HoveredSample = entry;
          renderSlide3Panels();
        },
        onSampleMove: (entry) => {
          const nextKey = sampleEntryKey(entry);
          if (!slide3HoveredSample || sampleEntryKey(slide3HoveredSample) !== nextKey) {
            slide3HoveredSample = entry;
            renderSlide3Panels();
          }
        },
        onSampleLeave: () => {
          if (slide3HoveredSample !== null) {
            slide3HoveredSample = null;
            renderSlide3Panels();
          }
        }
      });
      renderLatticeField(slide3MiddleSvg, (entry) => entry[config.middleKey], -1.2, 1.2, {
        colorFn: colorForValue,
        hoverHandler: (entry) => renderSlide3DotFormula(entry, config.middleKey),
        highlightedSampleKey: slide3HoveredSample ? sampleEntryKey(slide3HoveredSample) : null,
        highlightedSampleEntry: slide3HoveredSample,
        activeCornerKey: config.middleKey,
        highlightedSampleBubble: (entry) => `${config.middleKey} = ${entry[config.middleKey].toFixed(2)}`,
        onSampleEnter: (entry) => {
          slide3HoveredSample = entry;
          renderSlide3Panels();
        },
        onSampleMove: (entry) => {
          const nextKey = sampleEntryKey(entry);
          if (!slide3HoveredSample || sampleEntryKey(slide3HoveredSample) !== nextKey) {
            slide3HoveredSample = entry;
            renderSlide3Panels();
          }
        },
        onSampleLeave: () => {
          if (slide3HoveredSample !== null) {
            slide3HoveredSample = null;
            renderSlide3Panels();
          }
        }
      });
      renderLatticeField(slide3XSvg, (entry) => entry[config.blendKey], -1, 1, {
        colorFn: contrastColorForValue,
        hoverHandler: renderSlide3Formula,
        highlightedSampleKey: slide3HoveredSample ? sampleEntryKey(slide3HoveredSample) : null,
        highlightedSampleEntry: slide3HoveredSample,
        onSampleEnter: (entry) => {
          slide3HoveredSample = entry;
          renderSlide3Panels();
        },
        onSampleMove: (entry) => {
          const nextKey = sampleEntryKey(entry);
          if (!slide3HoveredSample || sampleEntryKey(slide3HoveredSample) !== nextKey) {
            slide3HoveredSample = entry;
            renderSlide3Panels();
          }
        },
        onSampleLeave: () => {
          if (slide3HoveredSample !== null) {
            slide3HoveredSample = null;
            renderSlide3Panels();
          }
        }
      });
    }

    function renderSlide4Panels() {
      const displayEntry = slide4HoveredSample || defaultSlide2Sample();
      renderSlide4Formula(displayEntry);

      const syncHandlers = {
        onSampleEnter: (entry) => {
          slide4HoveredSampleKey = sampleEntryKey(entry);
          slide4HoveredSample = entry;
          renderSlide4Panels();
        },
        onSampleMove: (entry) => {
          const nextKey = sampleEntryKey(entry);
          if (slide4HoveredSampleKey !== nextKey) {
            slide4HoveredSampleKey = nextKey;
            slide4HoveredSample = entry;
            renderSlide4Panels();
          }
        },
        onSampleLeave: () => {
          if (slide4HoveredSampleKey !== null) {
            slide4HoveredSampleKey = null;
            slide4HoveredSample = null;
            renderSlide4Panels();
          }
        }
      };

      renderLatticeField(slide4X1Svg, (entry) => entry.x0, -1, 1, {
        colorFn: contrastColorForValue,
        highlightedSampleKey: slide4HoveredSampleKey,
        ...syncHandlers
      });
      renderLatticeField(slide4X2Svg, (entry) => entry.x1, -1, 1, {
        colorFn: contrastColorForValue,
        highlightedSampleKey: slide4HoveredSampleKey,
        ...syncHandlers
      });
      renderLatticeField(slide4FinalSvg, (entry) => entry.final, -1, 1, {
        colorFn: contrastColorForValue,
        highlightedSampleKey: slide4HoveredSampleKey,
        ...syncHandlers
      });
    }

    function renderFbmSlides() {
      renderTextureField(freq1Svg, (x, y) => evaluatePeriodicPerlin(x, y, 1), -1, 1, contrastColorForValue);
      renderTextureField(freq2Svg, (x, y) => evaluatePeriodicPerlin(x, y, 2), -1, 1, contrastColorForValue);
      renderTextureField(freq4Svg, (x, y) => evaluatePeriodicPerlin(x, y, 4), -1, 1, contrastColorForValue);

      renderTextureField(fbm3Svg, (x, y) => evaluatePeriodicPerlin(x, y, 1), -1, 1, contrastColorForValue);
      renderTextureField(fbm5Svg, (x, y) => evaluateFbm(x, y, 3, (i) => Math.pow(0.5, i)), -1, 1, contrastColorForValue);
      renderTextureField(fbm6Svg, (x, y) => evaluateFbm(x, y, 5, (i) => Math.pow(0.5, i)), -1, 1, contrastColorForValue);

      renderTextureField(decayExpSvg, (x, y) => evaluateFbm(x, y, 6, (i) => Math.pow(0.5, i)), -1, 1, contrastColorForValue);
      renderTextureField(decayLinearSvg, (x, y) => evaluateFbm(x, y, 6, (i, n) => 1 - i / n), -1, 1, contrastColorForValue);
      renderTextureField(decayNoneSvg, (x, y) => evaluateFbm(x, y, 6, () => 1), -1, 1, contrastColorForValue);
    }

    function renderRepeatedTexture(svg, valueFn, min, max, repeats = 2) {
      renderTextureField(svg, (x, y) => {
        const repeatedX = positiveModulo(x * repeats, 1);
        const repeatedY = positiveModulo(y * repeats, 1);
        return valueFn(repeatedX, repeatedY);
      }, min, max, contrastColorForValue);
    }

    function renderSeamSlide() {
      renderRepeatedTexture(seamedRepeatSvg, (x, y) => evaluatePeriodicPerlin(x, y, 1), -1, 1, 2);
      renderRepeatedTexture(wrappedRepeatSvg, (x, y) => evaluateWrappedPeriodicPerlin(x, y, 1), -1, 1, 2);
    }

    function renderComparisonSlide() {
      const currentSeed = seedInput.value.trim() || "perlin-demo-1";
      renderTextureField(fbmPerlinVsSvg, (x, y) => evaluateFbm(x, y, 6, (i) => Math.pow(0.5, i)), -1, 1, contrastColorForValue);
      renderTextureField(fbmSinVsSvg, (x, y) => evaluateSinFbm(x, y, 6, (i) => Math.pow(0.5, i), currentSeed), -1, 1, contrastColorForValue);
    }

    function rerenderAll() {
      renderNaiveNoiseField(document.getElementById("gradient-grid-svg"), seedInput.value.trim() || "perlin-demo-1");
      renderTextureField(slide1PerlinSvg, (x, y) => evaluatePeriodicPerlin(x, y, 1), -1, 1, contrastColorForValue);
      renderSlide2Grid();
      renderSlide3Panels();
      renderSlide4Panels();
      renderFadeXCurve(slide3FadeCurveSvg, slide3HoveredSample ? slide3HoveredSample.x : 0);
      renderFbmSlides();
      renderSeamSlide();
      renderComparisonSlide();
    }

    function renderSlide2Grid() {
      const displayEntry = slide2HoveredSample || defaultSlide2Sample();
      cornerButtons.forEach((button) => button.classList.toggle("active", button.dataset.corner === selectedCorner));
      renderHoverFormula(displayEntry);
      renderSlide2Detail(displayEntry);
      renderLatticeField(interpolationGridSvg, (entry) => entry[selectedCorner], -1.2, 1.2, {
        colorFn: colorForValue,
        highlightedSampleKey: displayEntry ? sampleEntryKey(displayEntry) : null,
        highlightedSampleEntry: displayEntry,
        activeCornerKey: selectedCorner,
        onSampleEnter: (entry) => {
          slide2HoveredSample = entry;
          renderSlide2Grid();
        },
        onSampleMove: (entry) => {
          const nextKey = sampleEntryKey(entry);
          if (!slide2HoveredSample || sampleEntryKey(slide2HoveredSample) !== nextKey) {
            slide2HoveredSample = entry;
            renderSlide2Grid();
          }
        },
        onSampleLeave: () => {}
      });
    }

    cornerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedCorner = button.dataset.corner;
        slide2HoveredSample = null;
        renderSlide2Grid();
      });
    });

    xBlendButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectedXBlend = button.dataset.xblend;
        xBlendButtons.forEach((item) => item.classList.toggle("active", item === button));
        slide3HoveredSample = null;
        renderSlide3Panels();
      });
    });

    applySeedButton.addEventListener("click", () => {
      vertexGradients = generateVertexGradients(seedInput.value.trim() || "perlin-demo-1");
      rerenderAll();
    });

    seedInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        vertexGradients = generateVertexGradients(seedInput.value.trim() || "perlin-demo-1");
        rerenderAll();
      }
    });

    vertexGradients = generateVertexGradients(seedInput.value.trim() || "perlin-demo-1");
    rerenderAll();
    setSlide(0);
