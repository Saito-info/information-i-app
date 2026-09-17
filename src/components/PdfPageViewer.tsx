"use client";

import { useEffect, useRef, useState } from "react";

type PdfPageViewerProps = {
  images: string[];
  title?: string;
  className?: string;
  /** 0-based initial page */
  initialPage?: number;
};

export function PdfPageViewer({
  images,
  title,
  className = "",
  initialPage = 0,
}: PdfPageViewerProps) {
  const [page, setPage] = useState(() =>
    Math.min(Math.max(0, initialPage), Math.max(0, images.length - 1)),
  );
  const [zoom, setZoom] = useState(1);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPage(Math.min(Math.max(0, initialPage), Math.max(0, images.length - 1)));
    setZoom(1);
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [initialPage, images]);

  if (!images.length) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 ${className}`}
      >
        ページ画像がありません
      </div>
    );
  }

  const current = images[Math.min(page, images.length - 1)]!;

  function zoomBy(delta: number) {
    setZoom((z) =>
      Math.min(3, Math.max(0.6, Math.round((z + delta) * 10) / 10)),
    );
  }

  return (
    <div className={`flex flex-col overflow-hidden bg-slate-900/5 ${className}`}>
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-2 py-1.5">
        {title ? (
          <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600">
            {title}
          </p>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={() => zoomBy(-0.2)}
          className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700"
          aria-label="縮小"
        >
          −
        </button>
        <span className="w-10 text-center text-[11px] font-medium text-slate-500">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => zoomBy(0.2)}
          className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700"
          aria-label="拡大"
        >
          ＋
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
        >
          リセット
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain bg-slate-200/60"
      >
        <div
          className="mx-auto origin-top p-2 transition-transform"
          style={{ width: `${zoom * 100}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={`PDFページ ${page + 1}`}
            className="w-full rounded-md bg-white shadow-sm"
            draggable={false}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white px-2 py-1.5">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 disabled:opacity-40"
        >
          ← 前へ
        </button>
        <p className="text-xs font-medium text-slate-600">
          {page + 1} / {images.length}
        </p>
        <button
          type="button"
          disabled={page >= images.length - 1}
          onClick={() => setPage((p) => Math.min(images.length - 1, p + 1))}
          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 disabled:opacity-40"
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
