import { useCallback, useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import "./styles.css";

const STORAGE_KEY = "latex-preview-input";
const RT_KEY = "latex-preview-real-time";
const SCALE = 3;

const DEFAULT_INPUT = String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`;

function loadSaved(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function loadSavedBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v === "true" : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch { /* noop */ }
}

function getKatexHtml(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: true,
      displayMode,
    });
  } catch (err) {
    return `<span class="error-msg">${escapeHtml(String(err))}</span>`;
  }
}

const KATEX_CDN_CSS = "https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css";

function formulaToBlob(html: string): Promise<Blob | null> {
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;width:auto;height:auto;";
  container.innerHTML = html;
  document.body.appendChild(container);

  const el = container.querySelector(".katex") as HTMLElement | null;
  if (!el) {
    document.body.removeChild(container);
    return Promise.resolve(null);
  }

  const rect = el.getBoundingClientRect();
  const w = Math.ceil(rect.width) || 1;
  const h = Math.ceil(rect.height) || 1;

  const padding = 8;
  const svgW = w + padding * 2;
  const svgH = h + padding * 2;

  const svgData = [
    '<svg xmlns="http://www.w3.org/2000/svg"',
    `width="${svgW}" height="${svgH}"`,
    `viewBox="0 0 ${svgW} ${svgH}">`,
    "<defs><style>",
    `@import url('${KATEX_CDN_CSS}');`,
    ".katex-display { margin:0; text-align:center; }",
    "</style></defs>",
    `<foreignObject x="${padding}" y="${padding}" width="${w}" height="${h}">`,
    '<div xmlns="http://www.w3.org/1999/xhtml">',
    container.innerHTML,
    "</div>",
    "</foreignObject>",
    "</svg>",
  ].join("");

  document.body.removeChild(container);

  const canvas = document.createElement("canvas");
  canvas.width = svgW * SCALE;
  canvas.height = svgH * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, svgW, svgH);

  const img = new Image();
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => resolve(b), "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

async function copyPngToClipboard(html: string): Promise<boolean> {
  const blob = await formulaToBlob(html);
  if (!blob) return false;
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formula.png";
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
}

async function downloadPng(html: string) {
  const blob = await formulaToBlob(html);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "formula.png";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadSvg(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  const el = container.querySelector(".katex");
  if (!el) return;
  const xml = new XMLSerializer().serializeToString(el);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "formula.svg";
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [input, setInput] = useState(() => loadSaved(STORAGE_KEY, DEFAULT_INPUT));
  const [realTime, setRealTime] = useState(() => loadSavedBool(RT_KEY, true));
  const previewRef = useRef<HTMLDivElement>(null);
  const [htmlCache, setHtmlCache] = useState("");

  const runRender = useCallback((latex: string) => {
    const el = previewRef.current;
    if (!el) return;
    if (!latex.trim()) {
      el.innerHTML = "";
      setHtmlCache("");
      return;
    }
    const html = getKatexHtml(latex, true);
    el.innerHTML = html;
    setHtmlCache(html);
  }, []);

  useEffect(() => {
    if (realTime) runRender(input);
  }, [input, realTime, runRender]);

  const handleInput = useCallback((value: string) => {
    setInput(value);
    save(STORAGE_KEY, value);
  }, []);

  const handleRealTime = useCallback((checked: boolean) => {
    setRealTime(checked);
    save(RT_KEY, String(checked));
  }, []);

  const handleRender = useCallback(() => {
    runRender(input);
  }, [input, runRender]);

  const handleClear = useCallback(() => {
    setInput("");
    save(STORAGE_KEY, "");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runRender(input);
      }
    },
    [input, runRender],
  );

  const handleCopyImage = useCallback(async () => {
    if (!htmlCache) return;
    await copyPngToClipboard(htmlCache);
  }, [htmlCache]);

  const handleDownloadPng = useCallback(async () => {
    if (!htmlCache) return;
    await downloadPng(htmlCache);
  }, [htmlCache]);

  const handleDownloadSvg = useCallback(() => {
    if (!htmlCache) return;
    downloadSvg(htmlCache);
  }, [htmlCache]);

  const hasContent = htmlCache.length > 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>LaTeX Preview</h1>
        <p className="app-subtitle">
          <a href="https://env.skin">env.skin</a>
        </p>
      </header>

      <div className="input-area">
        <textarea
          className="input-editor"
          value={input}
          onChange={(e) => handleInput(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter LaTeX here..."
          spellCheck={false}
          rows={3}
        />
        <div className="toolbar">
          <button className="btn btn-primary" onClick={handleRender}>
            Render
          </button>
          <button className="btn" onClick={handleClear}>
            Clear
          </button>
          <label className="toggle">
            <input
              type="checkbox"
              checked={realTime}
              onChange={(e) => handleRealTime(e.currentTarget.checked)}
            />
            <span>Real-time</span>
          </label>
          <div className="toolbar-spacer" />
          <button className="btn btn-outline" onClick={handleCopyImage} disabled={!hasContent}>
            Copy as Image
          </button>
          <button className="btn btn-outline" onClick={handleDownloadPng} disabled={!hasContent}>
            Download PNG
          </button>
          <button className="btn btn-outline" onClick={handleDownloadSvg} disabled={!hasContent}>
            Download SVG
          </button>
        </div>
      </div>

      <div className="output-area">
        <div className="output" ref={previewRef} />
        {!hasContent && (
          <p className="hint">Enter LaTeX and press Render</p>
        )}
      </div>

      <footer className="app-footer">
        <a href="https://katex.org/">KaTeX</a> &middot;
        <a href="https://env.skin">env.skin</a> &middot;
        <a href="https://mathlandscape.com/latex-eq/">参考リンク</a>
      </footer>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
