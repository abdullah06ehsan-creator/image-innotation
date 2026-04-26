(function () {
  const COLORS = [
    "#ea4335",
    "#ff7a59",
    "#ffb200",
    "#00a86b",
    "#1890ff",
    "#5a67d8",
    "#c026d3",
    "#111827",
  ];
  const DEFAULT_STROKE_WIDTH = 4;
  const MAX_HISTORY = 100;
  const MIN_RECT_SIZE = 8;
  const MIN_DRAW_DISTANCE = 1.5;
  const DEMO_IMAGE_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="960" viewBox="0 0 1400 960">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fbf4ea" />
          <stop offset="100%" stop-color="#ead9c1" />
        </linearGradient>
        <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#f3e4d1" />
        </linearGradient>
        <linearGradient id="bottle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#406c7d" />
          <stop offset="100%" stop-color="#1f3944" />
        </linearGradient>
      </defs>
      <rect width="1400" height="960" fill="url(#bg)" />
      <circle cx="1120" cy="170" r="180" fill="#f4c385" opacity="0.55" />
      <circle cx="260" cy="790" r="230" fill="#d7b08a" opacity="0.34" />
      <rect x="150" y="120" width="1100" height="720" rx="42" fill="#fffdf8" stroke="#d8c2a8" stroke-width="8" />
      <rect x="235" y="235" width="930" height="490" rx="28" fill="url(#card)" stroke="#ead7c4" stroke-width="5" />
      <rect x="575" y="210" width="250" height="70" rx="22" fill="#d8653d" opacity="0.16" />
      <text x="700" y="254" text-anchor="middle" fill="#9d4f31" font-size="38" font-family="Segoe UI, Arial" font-weight="700">Lifestyle Shot</text>
      <rect x="602" y="282" width="196" height="110" rx="26" fill="#1f3944" />
      <rect x="640" y="315" width="120" height="360" rx="48" fill="url(#bottle)" />
      <rect x="668" y="262" width="64" height="70" rx="18" fill="#274955" />
      <rect x="650" y="415" width="100" height="110" rx="16" fill="#fff7ed" />
      <text x="700" y="472" text-anchor="middle" fill="#274955" font-size="34" font-family="Segoe UI, Arial" font-weight="700">RINSE</text>
      <ellipse cx="700" cy="741" rx="170" ry="28" fill="#b08a62" opacity="0.26" />
      <rect x="322" y="358" width="152" height="182" rx="28" fill="#f1decb" />
      <rect x="938" y="352" width="126" height="196" rx="22" fill="#eed9c3" />
      <path d="M350 524 C415 420, 480 398, 548 390" fill="none" stroke="#d0b497" stroke-width="10" stroke-linecap="round" opacity="0.8" />
      <path d="M850 390 C908 398, 974 424, 1035 516" fill="none" stroke="#d0b497" stroke-width="10" stroke-linecap="round" opacity="0.8" />
    </svg>
  `.trim();
  const DEMO_PROJECT = {
    version: 1,
    image: {
      name: "demo-product-photo.svg",
      src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(DEMO_IMAGE_SVG)}`,
      width: 1400,
      height: 960,
    },
    annotations: [
      {
        id: "demo-rect-1",
        type: "rect",
        name: "Cap highlight",
        color: "#ea4335",
        lineWidth: 4,
        visible: true,
        x: 616,
        y: 250,
        width: 168,
        height: 105,
      },
      {
        id: "demo-freehand-1",
        type: "freehand",
        name: "Label alignment",
        color: "#1890ff",
        lineWidth: 4,
        visible: true,
        points: [
          { x: 620, y: 410 },
          { x: 598, y: 436 },
          { x: 594, y: 486 },
          { x: 605, y: 547 },
          { x: 640, y: 582 },
          { x: 700, y: 594 },
          { x: 760, y: 578 },
          { x: 792, y: 526 },
          { x: 801, y: 472 },
          { x: 780, y: 424 },
          { x: 734, y: 398 },
          { x: 676, y: 395 },
          { x: 635, y: 405 },
        ],
      },
    ],
  };
  const TOOL_LABELS = {
    select: "Select",
    pan: "Pan",
    rect: "Rectangle",
    freehand: "Freehand",
  };

  const els = {
    fileInput: document.getElementById("file-input"),
    uploadAction: document.getElementById("upload-action"),
    saveAction: document.getElementById("save-action"),
    exportAction: document.getElementById("export-action"),
    statusText: document.getElementById("status-text"),
    swatchStrip: document.getElementById("swatch-strip"),
    viewerFrame: document.getElementById("viewer-frame"),
    stage: document.getElementById("stage"),
    sourceImage: document.getElementById("source-image"),
    overlay: document.getElementById("annotation-overlay"),
    dropzoneOverlay: document.getElementById("dropzone-overlay"),
    dropzoneUploadButton: document.getElementById("dropzone-upload-button"),
    zoomReadout: document.getElementById("zoom-readout"),
    annotationCount: document.getElementById("annotation-count"),
    visibleCount: document.getElementById("visible-count"),
    layerList: document.getElementById("layer-list"),
    layerEmpty: document.getElementById("layer-empty"),
    inspectorEmpty: document.getElementById("inspector-empty"),
    inspectorDetails: document.getElementById("inspector-details"),
    annotationNameInput: document.getElementById("annotation-name-input"),
    annotationTypeValue: document.getElementById("annotation-type-value"),
    annotationMetricsValue: document.getElementById("annotation-metrics-value"),
    annotationColorChip: document.getElementById("annotation-color-chip"),
    annotationColorValue: document.getElementById("annotation-color-value"),
    annotationStatusValue: document.getElementById("annotation-status-value"),
    applySwatchButton: document.getElementById("apply-swatch-button"),
    deleteSelectedButton: document.getElementById("delete-selected-button"),
    undoButton: document.getElementById("undo-button"),
    redoButton: document.getElementById("redo-button"),
    zoomInButton: document.getElementById("zoom-in-button"),
    zoomOutButton: document.getElementById("zoom-out-button"),
    fitButton: document.getElementById("fit-button"),
    toolButtons: Array.from(document.querySelectorAll("[data-tool]")),
    canvasTitle: document.getElementById("canvas-title"),
    announcer: document.getElementById("announcer"),
  };

  const state = {
    image: null,
    tool: "select",
    color: COLORS[0],
    zoom: 1,
    pan: { x: 0, y: 0 },
    annotations: [],
    selectedId: null,
    dragCounter: 0,
    interaction: null,
    history: { past: [], future: [] },
    spacePan: false,
  };

  function init() {
    buildSwatches();
    bindEvents();
    renderAll();
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      loadProjectData(DEMO_PROJECT, "Loaded the built-in demo project.").catch(() => {
        setStatus("The built-in demo project could not be loaded.");
      });
      return;
    }
    setStatus("Load a product photo or saved review JSON to begin.");
  }

  function bindEvents() {
    els.uploadAction.addEventListener("click", openFilePicker);
    els.dropzoneUploadButton.addEventListener("click", openFilePicker);
    els.saveAction.addEventListener("click", saveProject);
    els.exportAction.addEventListener("click", exportAnnotatedImage);
    els.undoButton.addEventListener("click", undo);
    els.redoButton.addEventListener("click", redo);
    els.zoomInButton.addEventListener("click", () => zoomAtViewportCenter(1.15));
    els.zoomOutButton.addEventListener("click", () => zoomAtViewportCenter(1 / 1.15));
    els.fitButton.addEventListener("click", fitToView);

    els.toolButtons.forEach((button) => {
      button.addEventListener("click", () => setTool(button.dataset.tool));
    });

    els.fileInput.addEventListener("change", async (event) => {
      const [file] = event.target.files || [];
      els.fileInput.value = "";
      if (file) {
        await handleIncomingFile(file);
      }
    });

    els.viewerFrame.addEventListener("dragenter", onDragEnter);
    els.viewerFrame.addEventListener("dragover", onDragOver);
    els.viewerFrame.addEventListener("dragleave", onDragLeave);
    els.viewerFrame.addEventListener("drop", onDrop);
    els.viewerFrame.addEventListener("pointerdown", onPointerDown);
    els.viewerFrame.addEventListener("wheel", onWheel, { passive: false });

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    els.layerList.addEventListener("click", onLayerListClick);
    els.annotationNameInput.addEventListener("change", onRenameSelected);
    els.applySwatchButton.addEventListener("click", applyCurrentColorToSelected);
    els.deleteSelectedButton.addEventListener("click", deleteSelectedAnnotation);
  }

  function openFilePicker() {
    els.fileInput.click();
  }

  function buildSwatches() {
    els.swatchStrip.innerHTML = "";

    COLORS.forEach((color, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "swatch-button";
      button.dataset.color = color;
      button.dataset.tooltip = `Color ${index + 1}: ${color.toUpperCase()}`;
      button.setAttribute("aria-label", `Choose annotation color ${color}`);

      const chip = document.createElement("span");
      chip.style.background = color;
      button.appendChild(chip);

      button.addEventListener("click", () => {
        state.color = color;
        updateControls();
        setStatus(`Active swatch set to ${color.toUpperCase()}.`);
      });

      els.swatchStrip.appendChild(button);
    });
  }

  async function handleIncomingFile(file) {
    try {
      if (isJsonFile(file)) {
        await loadProjectFile(file);
        return;
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Please provide an image file or a saved review JSON file.");
      }

      const dataUrl = await readFileAsDataUrl(file);
      const dimensions = await loadImageDimensions(dataUrl);

      state.image = {
        name: file.name,
        src: dataUrl,
        width: dimensions.width,
        height: dimensions.height,
      };
      state.annotations = [];
      state.selectedId = null;
      state.tool = "select";
      resetHistory();
      fitToView(false);
      renderAll();
      setStatus(`Loaded image ${file.name}. Ready to annotate.`);
    } catch (error) {
      renderAll();
      setStatus(error.message || "The selected file could not be loaded.");
    }
  }

  async function loadProjectFile(file) {
    const rawText = await file.text();
    let project;

    try {
      project = JSON.parse(rawText);
    } catch (error) {
      throw new Error("That JSON file could not be parsed.");
    }

    if (!project || project.version !== 1 || !project.image || !project.image.src) {
      throw new Error("That JSON file is not a valid saved review bundle.");
    }

    await loadProjectData(project, `Loaded saved review ${file.name}.`);
  }

  async function loadProjectData(project, successMessage) {
    const dimensions =
      Number.isFinite(project.image.width) && Number.isFinite(project.image.height)
        ? { width: project.image.width, height: project.image.height }
        : await loadImageDimensions(project.image.src);

    state.image = {
      name: project.image.name || "review-image",
      src: project.image.src,
      width: dimensions.width,
      height: dimensions.height,
    };
    state.annotations = Array.isArray(project.annotations)
      ? project.annotations
          .map((annotation, index) => hydrateAnnotation(annotation, index))
          .filter(Boolean)
      : [];
    state.selectedId = state.annotations[0] ? state.annotations[0].id : null;
    state.tool = "select";
    resetHistory();
    fitToView(false);
    renderAll();
    setStatus(successMessage);
  }

  function hydrateAnnotation(annotation, index) {
    if (!annotation || typeof annotation !== "object") {
      return null;
    }

    const base = {
      id: annotation.id || createId(),
      name: annotation.name || `${annotation.type === "freehand" ? "Freehand" : "Rectangle"} ${index + 1}`,
      type: annotation.type === "freehand" ? "freehand" : "rect",
      color: typeof annotation.color === "string" ? annotation.color : COLORS[0],
      lineWidth:
        Number.isFinite(annotation.lineWidth) && annotation.lineWidth > 0
          ? annotation.lineWidth
          : DEFAULT_STROKE_WIDTH,
      visible: annotation.visible !== false,
    };

    if (base.type === "rect") {
      if (
        !Number.isFinite(annotation.x) ||
        !Number.isFinite(annotation.y) ||
        !Number.isFinite(annotation.width) ||
        !Number.isFinite(annotation.height)
      ) {
        return null;
      }

      return {
        ...base,
        x: annotation.x,
        y: annotation.y,
        width: annotation.width,
        height: annotation.height,
      };
    }

    if (!Array.isArray(annotation.points) || annotation.points.length < 2) {
      return null;
    }

    return {
      ...base,
      points: annotation.points
        .map((point) => ({
          x: Number(point.x) || 0,
          y: Number(point.y) || 0,
        }))
        .filter((point, pointIndex, points) => {
          if (!points[pointIndex]) {
            return false;
          }
          if (pointIndex === 0) {
            return true;
          }
          return distanceBetween(points[pointIndex - 1], point) > 0;
        }),
    };
  }

  function onDragEnter(event) {
    if (!transferHasFiles(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    state.dragCounter += 1;
    renderViewport();
  }

  function onDragOver(event) {
    if (!transferHasFiles(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function onDragLeave(event) {
    if (!transferHasFiles(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    state.dragCounter = Math.max(0, state.dragCounter - 1);
    renderViewport();
  }

  async function onDrop(event) {
    if (!transferHasFiles(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    state.dragCounter = 0;
    renderViewport();

    const [file] = Array.from(event.dataTransfer.files || []);
    if (file) {
      await handleIncomingFile(file);
    }
  }

  function onWheel(event) {
    if (!state.image) {
      return;
    }

    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    zoomAroundPoint(factor, {
      x: event.clientX - els.viewerFrame.getBoundingClientRect().left,
      y: event.clientY - els.viewerFrame.getBoundingClientRect().top,
    });
  }

  function onPointerDown(event) {
    if (event.target.closest("button, input, label")) {
      return;
    }

    if (!state.image) {
      els.viewerFrame.focus();
      return;
    }

    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    els.viewerFrame.focus();

    const point = getEventPoint(event);
    const annotationId = getAnnotationIdFromTarget(event.target);

    if (shouldPan(event)) {
      state.interaction = {
        type: "pan",
        startClient: { x: event.clientX, y: event.clientY },
        basePan: { ...state.pan },
      };
      renderViewport();
      return;
    }

    if (state.tool === "select") {
      if (annotationId) {
        state.selectedId = annotationId;
        const annotation = findAnnotation(annotationId);
        if (annotation) {
          state.interaction = {
            type: "move",
            id: annotationId,
            startPoint: { x: point.imageX, y: point.imageY },
            original: structuredClone(annotation),
            snapshot: snapshotState(),
            moved: false,
          };
          renderAll();
          return;
        }
      }

      if (state.selectedId) {
        state.selectedId = null;
        renderAll();
      }
      return;
    }

    if (!isPointInsideImage(point.imageX, point.imageY)) {
      return;
    }

    if (state.tool === "rect") {
      state.interaction = {
        type: "rect",
        startPoint: { x: point.imageX, y: point.imageY },
        currentPoint: { x: point.imageX, y: point.imageY },
        snapshot: snapshotState(),
      };
      renderViewport();
      return;
    }

    if (state.tool === "freehand") {
      state.interaction = {
        type: "freehand",
        points: [{ x: point.imageX, y: point.imageY }],
        snapshot: snapshotState(),
      };
      renderViewport();
    }
  }

  function onPointerMove(event) {
    const interaction = state.interaction;
    if (!interaction || !state.image) {
      return;
    }

    if (interaction.type === "pan") {
      state.pan = {
        x: interaction.basePan.x + (event.clientX - interaction.startClient.x),
        y: interaction.basePan.y + (event.clientY - interaction.startClient.y),
      };
      renderViewport();
      return;
    }

    const point = getEventPoint(event);

    if (interaction.type === "rect") {
      interaction.currentPoint = clampPointToImage({
        x: point.imageX,
        y: point.imageY,
      });
      renderViewport();
      return;
    }

    if (interaction.type === "freehand") {
      const nextPoint = clampPointToImage({ x: point.imageX, y: point.imageY });
      const lastPoint = interaction.points[interaction.points.length - 1];
      if (distanceBetween(lastPoint, nextPoint) >= MIN_DRAW_DISTANCE) {
        interaction.points.push(nextPoint);
        renderViewport();
      }
      return;
    }

    if (interaction.type === "move") {
      const currentPoint = clampPointToImage({ x: point.imageX, y: point.imageY });
      const delta = {
        x: currentPoint.x - interaction.startPoint.x,
        y: currentPoint.y - interaction.startPoint.y,
      };

      const movedAnnotation = translateAnnotationWithinBounds(interaction.original, delta);
      if (!movedAnnotation) {
        return;
      }

      if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
        interaction.moved = true;
      }

      replaceAnnotation(interaction.id, movedAnnotation);
      renderViewport();
      renderInspector();
    }
  }

  function onPointerUp() {
    if (!state.interaction || !state.image) {
      return;
    }

    const interaction = state.interaction;
    state.interaction = null;

    if (interaction.type === "pan") {
      renderViewport();
      return;
    }

    if (interaction.type === "move") {
      if (interaction.moved) {
        pushHistory(interaction.snapshot);
        setStatus("Moved the selected annotation.");
      }
      renderAll();
      return;
    }

    if (interaction.type === "rect") {
      const rect = normalizeRect(interaction.startPoint, interaction.currentPoint);
      if (rect.width >= MIN_RECT_SIZE && rect.height >= MIN_RECT_SIZE) {
        const annotation = {
          id: createId(),
          type: "rect",
          name: createAnnotationName("rect"),
          color: state.color,
          lineWidth: DEFAULT_STROKE_WIDTH,
          visible: true,
          ...rect,
        };
        state.annotations = [...state.annotations, annotation];
        state.selectedId = annotation.id;
        pushHistory(interaction.snapshot);
        setStatus(`Added ${annotation.name}.`);
      } else {
        setStatus("Rectangle annotations need a bit more size to be saved.");
      }
      renderAll();
      return;
    }

    if (interaction.type === "freehand") {
      if (interaction.points.length >= 2) {
        const annotation = {
          id: createId(),
          type: "freehand",
          name: createAnnotationName("freehand"),
          color: state.color,
          lineWidth: DEFAULT_STROKE_WIDTH,
          visible: true,
          points: interaction.points,
        };
        state.annotations = [...state.annotations, annotation];
        state.selectedId = annotation.id;
        pushHistory(interaction.snapshot);
        setStatus(`Added ${annotation.name}.`);
      } else {
        setStatus("Freehand annotations need at least two points.");
      }
      renderAll();
    }
  }

  function onLayerListClick(event) {
    const row = event.target.closest("[data-annotation-id]");
    if (!row) {
      return;
    }

    const annotationId = row.dataset.annotationId;
    const action = event.target.closest("[data-action]");

    if (action) {
      const actionName = action.dataset.action;
      if (actionName === "toggle-visibility") {
        toggleVisibility(annotationId);
        return;
      }
      if (actionName === "move-up") {
        reorderAnnotation(annotationId, "up");
        return;
      }
      if (actionName === "move-down") {
        reorderAnnotation(annotationId, "down");
        return;
      }
      if (actionName === "delete") {
        deleteAnnotationById(annotationId);
      }
      return;
    }

    state.selectedId = annotationId;
    renderAll();
    setStatus(`Selected ${findAnnotation(annotationId)?.name || "annotation"}.`);
  }

  function onRenameSelected() {
    const selected = getSelectedAnnotation();
    if (!selected) {
      return;
    }

    const nextName = els.annotationNameInput.value.trim();
    if (!nextName || nextName === selected.name) {
      els.annotationNameInput.value = selected.name;
      return;
    }

    const snapshot = snapshotState();
    replaceAnnotation(selected.id, { ...selected, name: nextName });
    pushHistory(snapshot);
    renderAll();
    setStatus(`Renamed layer to ${nextName}.`);
  }

  function onKeyDown(event) {
    const metaOrCtrl = event.ctrlKey || event.metaKey;
    const isTextEntry = isEditableTarget(event.target);

    if (metaOrCtrl && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }

    if (metaOrCtrl && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }

    if (isTextEntry) {
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
      if (!state.spacePan) {
        state.spacePan = true;
        renderViewport();
      }
      return;
    }

    if (event.key === "Escape") {
      cancelInteraction();
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      if (state.selectedId) {
        event.preventDefault();
        deleteSelectedAnnotation();
      }
      return;
    }

    if (event.key === "0") {
      event.preventDefault();
      fitToView();
      return;
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomAtViewportCenter(1.15);
      return;
    }

    if (event.key === "-") {
      event.preventDefault();
      zoomAtViewportCenter(1 / 1.15);
      return;
    }

    const lowerKey = event.key.toLowerCase();
    if (lowerKey === "v") {
      setTool("select");
      return;
    }
    if (lowerKey === "h") {
      setTool("pan");
      return;
    }
    if (lowerKey === "r") {
      setTool("rect");
      return;
    }
    if (lowerKey === "f") {
      setTool("freehand");
      return;
    }

    if (state.selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      const delta =
        event.key === "ArrowUp"
          ? { x: 0, y: -step }
          : event.key === "ArrowDown"
            ? { x: 0, y: step }
            : event.key === "ArrowLeft"
              ? { x: -step, y: 0 }
              : { x: step, y: 0 };
      nudgeSelected(delta);
    }
  }

  function onKeyUp(event) {
    if (event.key === " ") {
      state.spacePan = false;
      renderViewport();
    }
  }

  function cancelInteraction() {
    if (!state.interaction) {
      return;
    }

    if (state.interaction.type === "pan") {
      state.pan = { ...state.interaction.basePan };
    } else if (state.interaction.type === "move") {
      applySnapshot(state.interaction.snapshot);
    }

    state.interaction = null;
    renderAll();
    setStatus("Cancelled the active interaction.");
  }

  function setTool(tool) {
    state.tool = tool;
    renderAll();
    setStatus(`${TOOL_LABELS[tool]} tool selected.`);
  }

  function zoomAtViewportCenter(factor) {
    if (!state.image) {
      return;
    }

    const frameRect = els.viewerFrame.getBoundingClientRect();
    zoomAroundPoint(factor, {
      x: frameRect.width / 2,
      y: frameRect.height / 2,
    });
  }

  function zoomAroundPoint(factor, viewportPoint) {
    if (!state.image) {
      return;
    }

    const nextZoom = clamp(state.zoom * factor, 0.1, 12);
    const imageX = (viewportPoint.x - state.pan.x) / state.zoom;
    const imageY = (viewportPoint.y - state.pan.y) / state.zoom;

    state.zoom = nextZoom;
    state.pan = {
      x: viewportPoint.x - imageX * nextZoom,
      y: viewportPoint.y - imageY * nextZoom,
    };
    renderViewport();
  }

  function fitToView(announce = true) {
    if (!state.image) {
      return;
    }

    const frameRect = els.viewerFrame.getBoundingClientRect();
    if (!frameRect.width || !frameRect.height) {
      return;
    }

    const padding = 40;
    const zoom = Math.min(
      (frameRect.width - padding) / state.image.width,
      (frameRect.height - padding) / state.image.height,
    );

    state.zoom = clamp(zoom, 0.05, 12);
    state.pan = {
      x: (frameRect.width - state.image.width * state.zoom) / 2,
      y: (frameRect.height - state.image.height * state.zoom) / 2,
    };

    renderViewport();
    if (announce) {
      setStatus("Fitted the image to the current view.");
    }
  }

  function renderAll() {
    renderViewport();
    renderLayerList();
    renderInspector();
    updateControls();
    replaceIcons();
  }

  function renderViewport() {
    const hasImage = Boolean(state.image);
    els.stage.hidden = !hasImage;
    els.dropzoneOverlay.hidden = hasImage && state.dragCounter === 0;

    const currentCursor = !hasImage
      ? "default"
      : state.interaction?.type === "pan"
        ? "grabbing"
        : shouldPan()
          ? "grab"
          : state.tool === "rect" || state.tool === "freehand"
            ? "crosshair"
            : "default";
    els.viewerFrame.dataset.cursor = currentCursor;

    if (!hasImage) {
      els.sourceImage.removeAttribute("src");
      els.overlay.innerHTML = "";
      els.canvasTitle.textContent = "Product photo canvas";
      updateControls();
      return;
    }

    els.canvasTitle.textContent = state.image.name;
    if (els.sourceImage.src !== state.image.src) {
      els.sourceImage.src = state.image.src;
    }
    els.sourceImage.alt = `Product photo: ${state.image.name}`;

    els.stage.style.left = `${state.pan.x}px`;
    els.stage.style.top = `${state.pan.y}px`;
    els.stage.style.width = `${state.image.width * state.zoom}px`;
    els.stage.style.height = `${state.image.height * state.zoom}px`;

    els.overlay.setAttribute("viewBox", `0 0 ${state.image.width} ${state.image.height}`);
    els.overlay.setAttribute("width", String(state.image.width));
    els.overlay.setAttribute("height", String(state.image.height));

    renderSvgAnnotations();
    updateControls();
  }

  function renderSvgAnnotations() {
    els.overlay.innerHTML = "";

    state.annotations.forEach((annotation) => {
      if (!annotation.visible) {
        return;
      }

      els.overlay.appendChild(
        createAnnotationGroup(annotation, annotation.id === state.selectedId, false),
      );
    });

    const preview = getPreviewAnnotation();
    if (preview) {
      els.overlay.appendChild(createAnnotationGroup(preview, false, true));
    }
  }

  function createAnnotationGroup(annotation, selected, preview) {
    const group = createSvg("g");
    group.classList.add("annotation-layer");
    if (selected) {
      group.classList.add("is-selected");
    }
    if (preview) {
      group.classList.add("is-preview");
    }

    if (!preview && annotation.id) {
      group.dataset.annotationId = annotation.id;
    }

    const glow = buildShape(annotation);
    glow.classList.add("annotation-glow");
    glow.setAttribute("stroke", "rgba(255, 255, 255, 0.92)");
    glow.setAttribute("stroke-width", String(annotation.lineWidth + 6));
    glow.setAttribute("fill", "none");
    glow.setAttribute("vector-effect", "non-scaling-stroke");

    const shape = buildShape(annotation);
    shape.classList.add("annotation-shape");
    shape.setAttribute("stroke", annotation.color);
    shape.setAttribute("stroke-width", String(annotation.lineWidth));
    shape.setAttribute("vector-effect", "non-scaling-stroke");
    shape.setAttribute("fill", "none");

    if (annotation.type === "rect") {
      shape.classList.add("rect-fill");
      shape.setAttribute("fill", preview ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.04)");
    }

    if (!preview) {
      const hit = buildShape(annotation);
      hit.classList.add("annotation-hit");
      hit.setAttribute("stroke", "transparent");
      hit.setAttribute("stroke-width", String(annotation.lineWidth + 14));
      hit.setAttribute("vector-effect", "non-scaling-stroke");
      hit.dataset.annotationId = annotation.id;
      group.appendChild(hit);
    }

    group.appendChild(glow);
    group.appendChild(shape);
    return group;
  }

  function buildShape(annotation) {
    if (annotation.type === "rect") {
      const rect = createSvg("rect");
      rect.setAttribute("x", String(annotation.x));
      rect.setAttribute("y", String(annotation.y));
      rect.setAttribute("width", String(annotation.width));
      rect.setAttribute("height", String(annotation.height));
      rect.setAttribute("rx", "4");
      rect.setAttribute("ry", "4");
      return rect;
    }

    const path = createSvg("path");
    path.setAttribute("d", buildPath(annotation.points));
    return path;
  }

  function renderLayerList() {
    els.layerList.innerHTML = "";
    const visibleAnnotations = state.annotations.filter((annotation) => annotation.visible);
    els.layerEmpty.hidden = state.annotations.length > 0;
    els.visibleCount.textContent = `${visibleAnnotations.length} visible`;

    const ordered = [...state.annotations].reverse();
    ordered.forEach((annotation) => {
      const actualIndex = state.annotations.findIndex((item) => item.id === annotation.id);
      const row = document.createElement("li");
      row.className = "layer-row";
      row.dataset.annotationId = annotation.id;

      const mainButton = document.createElement("button");
      mainButton.type = "button";
      mainButton.className = "layer-main";
      mainButton.dataset.annotationId = annotation.id;
      mainButton.classList.toggle("is-selected", annotation.id === state.selectedId);
      mainButton.classList.toggle("is-hidden", !annotation.visible);
      mainButton.setAttribute("aria-label", `Select layer ${annotation.name}`);

      const header = document.createElement("div");
      header.className = "layer-header";

      const name = document.createElement("span");
      name.className = "layer-name";
      name.textContent = annotation.name;

      const swatch = document.createElement("span");
      swatch.className = "layer-swatch";
      swatch.style.background = annotation.color;

      header.append(name, swatch);

      const meta = document.createElement("div");
      meta.className = "layer-meta";

      const typeChip = document.createElement("span");
      typeChip.className = "layer-chip";
      typeChip.textContent = annotation.type === "rect" ? "Rectangle" : "Freehand";

      const metric = document.createElement("span");
      metric.textContent = getAnnotationMetrics(annotation);

      meta.append(typeChip, metric);
      mainButton.append(header, meta);

      const actions = document.createElement("div");
      actions.className = "layer-actions";
      actions.dataset.annotationId = annotation.id;

      actions.append(
        createLayerAction(
          annotation.visible ? "eye" : "eye-off",
          annotation.visible ? "Hide layer" : "Show layer",
          "toggle-visibility",
        ),
      );
      actions.append(
        createLayerAction("move-up", "Move layer up", "move-up", actualIndex >= state.annotations.length - 1),
      );
      actions.append(
        createLayerAction("move-down", "Move layer down", "move-down", actualIndex <= 0),
      );
      actions.append(createLayerAction("trash-2", "Delete layer", "delete"));

      row.append(mainButton, actions);
      els.layerList.appendChild(row);
    });
  }

  function createLayerAction(iconName, label, action, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "layer-action";
    button.dataset.action = action;
    button.dataset.tooltip = label;
    button.setAttribute("aria-label", label);
    button.disabled = disabled;

    const icon = document.createElement("i");
    icon.dataset.lucide = iconName;
    button.appendChild(icon);
    return button;
  }

  function renderInspector() {
    const selected = getSelectedAnnotation();
    const hasSelection = Boolean(selected);

    els.inspectorEmpty.hidden = hasSelection;
    els.inspectorDetails.hidden = !hasSelection;

    if (!selected) {
      return;
    }

    els.annotationNameInput.value = selected.name;
    els.annotationTypeValue.textContent =
      selected.type === "rect" ? "Rectangle annotation" : "Freehand annotation";
    els.annotationMetricsValue.textContent = getAnnotationMetrics(selected);
    els.annotationColorChip.style.background = selected.color;
    els.annotationColorValue.textContent = selected.color.toUpperCase();
    els.annotationStatusValue.textContent = selected.visible ? "Visible" : "Hidden";
  }

  function updateControls() {
    const hasImage = Boolean(state.image);
    const hasSelection = Boolean(getSelectedAnnotation());

    els.toolButtons.forEach((button) => {
      const isActive = button.dataset.tool === state.tool;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.disabled = !hasImage;
    });

    els.swatchStrip.querySelectorAll("[data-color]").forEach((button) => {
      const isActive = button.dataset.color === state.color;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.disabled = !hasImage;
    });

    els.saveAction.disabled = !hasImage;
    els.exportAction.disabled = !hasImage;
    els.undoButton.disabled = state.history.past.length === 0;
    els.redoButton.disabled = state.history.future.length === 0;
    els.zoomInButton.disabled = !hasImage;
    els.zoomOutButton.disabled = !hasImage;
    els.fitButton.disabled = !hasImage;
    els.applySwatchButton.disabled = !hasSelection;
    els.deleteSelectedButton.disabled = !hasSelection;
    els.annotationNameInput.disabled = !hasSelection;

    els.zoomReadout.textContent = `${Math.round(state.zoom * 100)}%`;
    els.annotationCount.textContent = `${state.annotations.length} layer${state.annotations.length === 1 ? "" : "s"}`;
  }

  function saveProject() {
    if (!state.image) {
      return;
    }

    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      image: state.image,
      annotations: state.annotations,
    };
    const baseName = getBaseName(state.image.name);
    downloadBlob(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
      `${baseName}-review.json`,
    );
    setStatus(`Saved review bundle for ${state.image.name}.`);
  }

  async function exportAnnotatedImage() {
    if (!state.image) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = state.image.width;
    canvas.height = state.image.height;
    const context = canvas.getContext("2d");

    if (!context) {
      setStatus("This browser could not create an export canvas.");
      return;
    }

    const image = new Image();
    image.src = state.image.src;
    await image.decode();
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    state.annotations.forEach((annotation) => {
      if (!annotation.visible) {
        return;
      }
      context.strokeStyle = annotation.color;
      context.lineWidth = annotation.lineWidth;
      context.lineJoin = "round";
      context.lineCap = "round";

      if (annotation.type === "rect") {
        context.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        return;
      }

      const [firstPoint, ...restPoints] = annotation.points;
      context.beginPath();
      context.moveTo(firstPoint.x, firstPoint.y);
      restPoints.forEach((point) => context.lineTo(point.x, point.y));
      context.stroke();
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) {
      setStatus("The annotated PNG could not be generated.");
      return;
    }

    downloadBlob(blob, `${getBaseName(state.image.name)}-annotated.png`);
    setStatus(`Exported annotated PNG for ${state.image.name}.`);
  }

  function undo() {
    if (state.history.past.length === 0) {
      return;
    }

    const previous = state.history.past.pop();
    state.history.future.push(snapshotState());
    applySnapshot(previous);
    renderAll();
    setStatus("Undid the last annotation change.");
  }

  function redo() {
    if (state.history.future.length === 0) {
      return;
    }

    const next = state.history.future.pop();
    state.history.past.push(snapshotState());
    applySnapshot(next);
    renderAll();
    setStatus("Redid the last annotation change.");
  }

  function toggleVisibility(annotationId) {
    const annotation = findAnnotation(annotationId);
    if (!annotation) {
      return;
    }

    const snapshot = snapshotState();
    replaceAnnotation(annotationId, { ...annotation, visible: !annotation.visible });
    pushHistory(snapshot);
    renderAll();
    setStatus(`${annotation.visible ? "Hid" : "Showed"} ${annotation.name}.`);
  }

  function reorderAnnotation(annotationId, direction) {
    const index = state.annotations.findIndex((annotation) => annotation.id === annotationId);
    if (index === -1) {
      return;
    }

    const nextIndex = direction === "up" ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= state.annotations.length) {
      return;
    }

    const snapshot = snapshotState();
    const nextAnnotations = [...state.annotations];
    const [annotation] = nextAnnotations.splice(index, 1);
    nextAnnotations.splice(nextIndex, 0, annotation);
    state.annotations = nextAnnotations;
    pushHistory(snapshot);
    renderAll();
    setStatus(`Reordered ${annotation.name}.`);
  }

  function deleteSelectedAnnotation() {
    if (!state.selectedId) {
      return;
    }
    deleteAnnotationById(state.selectedId);
  }

  function deleteAnnotationById(annotationId) {
    const annotation = findAnnotation(annotationId);
    if (!annotation) {
      return;
    }

    const snapshot = snapshotState();
    state.annotations = state.annotations.filter((item) => item.id !== annotationId);
    if (state.selectedId === annotationId) {
      state.selectedId = null;
    }
    pushHistory(snapshot);
    renderAll();
    setStatus(`Deleted ${annotation.name}.`);
  }

  function applyCurrentColorToSelected() {
    const selected = getSelectedAnnotation();
    if (!selected) {
      return;
    }

    const snapshot = snapshotState();
    replaceAnnotation(selected.id, { ...selected, color: state.color });
    pushHistory(snapshot);
    renderAll();
    setStatus(`Applied ${state.color.toUpperCase()} to ${selected.name}.`);
  }

  function nudgeSelected(delta) {
    const selected = getSelectedAnnotation();
    if (!selected || !state.image) {
      return;
    }

    const snapshot = snapshotState();
    const nextAnnotation = translateAnnotationWithinBounds(selected, delta);
    if (!nextAnnotation) {
      return;
    }

    replaceAnnotation(selected.id, nextAnnotation);
    pushHistory(snapshot);
    renderAll();
    setStatus(`Nudged ${selected.name}.`);
  }

  function getPreviewAnnotation() {
    if (!state.interaction) {
      return null;
    }

    if (state.interaction.type === "rect") {
      const rect = normalizeRect(state.interaction.startPoint, state.interaction.currentPoint);
      return {
        type: "rect",
        color: state.color,
        lineWidth: DEFAULT_STROKE_WIDTH,
        visible: true,
        ...rect,
      };
    }

    if (state.interaction.type === "freehand") {
      return {
        type: "freehand",
        color: state.color,
        lineWidth: DEFAULT_STROKE_WIDTH,
        visible: true,
        points: state.interaction.points,
      };
    }

    return null;
  }

  function findAnnotation(annotationId) {
    return state.annotations.find((annotation) => annotation.id === annotationId) || null;
  }

  function getSelectedAnnotation() {
    return state.selectedId ? findAnnotation(state.selectedId) : null;
  }

  function replaceAnnotation(annotationId, nextAnnotation) {
    state.annotations = state.annotations.map((annotation) =>
      annotation.id === annotationId ? nextAnnotation : annotation,
    );
  }

  function shouldPan(event) {
    const middleMouse = event && event.button === 1;
    return Boolean(middleMouse || state.spacePan || state.tool === "pan");
  }

  function isPointInsideImage(x, y) {
    return (
      state.image &&
      x >= 0 &&
      y >= 0 &&
      x <= state.image.width &&
      y <= state.image.height
    );
  }

  function clampPointToImage(point) {
    return {
      x: clamp(point.x, 0, state.image.width),
      y: clamp(point.y, 0, state.image.height),
    };
  }

  function translateAnnotationWithinBounds(annotation, delta) {
    const bounds = getAnnotationBounds(annotation);
    const boundedDelta = {
      x: clamp(delta.x, -bounds.x, state.image.width - bounds.x - bounds.width),
      y: clamp(delta.y, -bounds.y, state.image.height - bounds.y - bounds.height),
    };

    if (annotation.type === "rect") {
      return {
        ...annotation,
        x: annotation.x + boundedDelta.x,
        y: annotation.y + boundedDelta.y,
      };
    }

    return {
      ...annotation,
      points: annotation.points.map((point) => ({
        x: point.x + boundedDelta.x,
        y: point.y + boundedDelta.y,
      })),
    };
  }

  function getAnnotationBounds(annotation) {
    if (annotation.type === "rect") {
      return {
        x: annotation.x,
        y: annotation.y,
        width: annotation.width,
        height: annotation.height,
      };
    }

    const xs = annotation.points.map((point) => point.x);
    const ys = annotation.points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  function snapshotState() {
    return structuredClone({
      annotations: state.annotations,
      selectedId: state.selectedId,
    });
  }

  function applySnapshot(snapshot) {
    state.annotations = structuredClone(snapshot.annotations || []);
    state.selectedId =
      snapshot.selectedId && state.annotations.some((annotation) => annotation.id === snapshot.selectedId)
        ? snapshot.selectedId
        : null;
  }

  function pushHistory(snapshot) {
    state.history.past.push(structuredClone(snapshot));
    if (state.history.past.length > MAX_HISTORY) {
      state.history.past.shift();
    }
    state.history.future = [];
  }

  function resetHistory() {
    state.history.past = [];
    state.history.future = [];
  }

  function createAnnotationName(type) {
    const nextCount =
      state.annotations.filter((annotation) => annotation.type === type).length + 1;
    return `${type === "rect" ? "Rectangle" : "Freehand"} ${nextCount}`;
  }

  function getAnnotationMetrics(annotation) {
    if (annotation.type === "rect") {
      return `${Math.round(annotation.width)} x ${Math.round(annotation.height)} px`;
    }

    return `${annotation.points.length} points`;
  }

  function getEventPoint(event) {
    const frameRect = els.viewerFrame.getBoundingClientRect();
    const localX = event.clientX - frameRect.left;
    const localY = event.clientY - frameRect.top;
    return {
      viewportX: localX,
      viewportY: localY,
      imageX: (localX - state.pan.x) / state.zoom,
      imageY: (localY - state.pan.y) / state.zoom,
    };
  }

  function getAnnotationIdFromTarget(target) {
    return target.closest?.("[data-annotation-id]")?.dataset.annotationId || null;
  }

  function createSvg(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }

  function buildPath(points) {
    return points.reduce((path, point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${path}${command}${point.x} ${point.y} `;
    }, "");
  }

  function normalizeRect(startPoint, currentPoint) {
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    return {
      x,
      y,
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y),
    };
  }

  function isJsonFile(file) {
    return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
  }

  function transferHasFiles(dataTransfer) {
    return Boolean(
      dataTransfer &&
        Array.from(dataTransfer.types || []).includes("Files"),
    );
  }

  function isEditableTarget(target) {
    if (!target) {
      return false;
    }

    const tagName = target.tagName?.toLowerCase();
    return (
      tagName === "input" ||
      tagName === "button" ||
      tagName === "textarea" ||
      tagName === "select" ||
      target.isContentEditable
    );
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distanceBetween(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function createId() {
    return self.crypto?.randomUUID?.() || `annotation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function getBaseName(filename) {
    return (filename || "review").replace(/\.[^.]+$/, "");
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("That file could not be read."));
      reader.readAsDataURL(file);
    });
  }

  function loadImageDimensions(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () =>
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      image.onerror = () => reject(new Error("The image could not be decoded."));
      image.src = src;
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function replaceIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons({
        attrs: {
          "stroke-width": 1.9,
        },
      });
    }
  }

  function setStatus(message) {
    els.statusText.textContent = message;
    els.announcer.textContent = message;
  }

  init();
})();
