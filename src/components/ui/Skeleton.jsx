import React from "react";

export function Skeleton({ width = "100%", height = "20px", borderRadius = "8px", style = {}, className = "" }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function SkeletonCircle({ size = "40px", style = {}, className = "" }) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius="50%"
      className={`skeleton-circle ${className}`}
      style={style}
    />
  );
}

export function SkeletonText({ lines = 2, gap = "8px", lastLineWidth = "70%", style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, width: "100%", ...style }}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          height="14px"
          width={idx === lines - 1 && lines > 1 ? lastLineWidth : "100%"}
          borderRadius="4px"
        />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card glass-card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <Skeleton width="110px" height="16px" borderRadius="6px" />
        <SkeletonCircle size="36px" />
      </div>
      <Skeleton width="80px" height="38px" borderRadius="8px" style={{ margin: "0 0 10px 0" }} />
      <Skeleton width="130px" height="14px" borderRadius="4px" />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div
      className="glass-card"
      style={{
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "14px",
        borderLeft: "4px solid var(--surface-highest)"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flex: 1 }}>
        <SkeletonCircle size="24px" style={{ marginTop: "4px" }} />
        <div style={{ flex: 1, maxWidth: "700px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <Skeleton width="220px" height="20px" borderRadius="6px" />
            <Skeleton width="60px" height="18px" borderRadius="12px" />
            <Skeleton width="75px" height="18px" borderRadius="12px" />
          </div>
          <SkeletonText lines={2} gap="6px" lastLineWidth="60%" />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <Skeleton width="70px" height="14px" borderRadius="4px" />
        <SkeletonCircle size="32px" />
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div
      className="glass-card"
      style={{
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        borderRadius: "14px",
      }}
    >
      <SkeletonCircle size="46px" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton width="110px" height="15px" borderRadius="4px" />
          <Skeleton width="50px" height="14px" borderRadius="10px" />
        </div>
        <Skeleton width="80px" height="11px" borderRadius="4px" />
      </div>
    </div>
  );
}

export function ChatDmSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 14px",
        borderRadius: "10px"
      }}
    >
      <SkeletonCircle size="38px" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <Skeleton width="110px" height="14px" borderRadius="4px" />
        <Skeleton width="70px" height="11px" borderRadius="4px" />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton({ isSelf = false }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isSelf ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: "12px",
        margin: "12px 0"
      }}
    >
      <SkeletonCircle size="36px" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isSelf ? "flex-end" : "flex-start",
          gap: "6px",
          maxWidth: "65%"
        }}
      >
        <Skeleton width="80px" height="12px" borderRadius="4px" />
        <div
          className="skeleton-shimmer"
          style={{
            padding: "14px 18px",
            borderRadius: isSelf ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            width: isSelf ? "240px" : "280px",
            height: "54px"
          }}
        />
      </div>
    </div>
  );
}

export function CalendarAgendaSkeleton() {
  return (
    <div
      className="glass-card"
      style={{
        padding: "16px",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginBottom: "12px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width="70px" height="16px" borderRadius="6px" />
        <Skeleton width="60px" height="16px" borderRadius="10px" />
      </div>
      <Skeleton width="160px" height="18px" borderRadius="6px" />
      <Skeleton width="100%" height="13px" borderRadius="4px" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <SkeletonCircle size="20px" />
          <SkeletonCircle size="20px" />
        </div>
        <Skeleton width="20px" height="20px" borderRadius="4px" />
      </div>
    </div>
  );
}
