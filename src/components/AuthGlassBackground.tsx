/**
 * Distinctive animated glass atmosphere for auth routes (Opsverai palette).
 * Layers: horizon, halo, aurora, mesh, pulse, orbs, shards, prism, sheen, sparks, grain, vignette.
 */
export default function AuthGlassBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 min-h-[100dvh] overflow-hidden bg-background" aria-hidden>
      <div className="auth-glass-base" />
      <div className="auth-glass-horizon" />
      <div className="auth-glass-halo" />
      <div className="auth-glass-aurora" aria-hidden>
        <span className="auth-glass-aurora__band auth-glass-aurora__band--1" />
        <span className="auth-glass-aurora__band auth-glass-aurora__band--2" />
        <span className="auth-glass-aurora__band auth-glass-aurora__band--3" />
      </div>
      <div className="auth-glass-mesh" />
      <div className="auth-glass-pulse" />
      <div className="auth-glass-orb auth-glass-orb--a" />
      <div className="auth-glass-orb auth-glass-orb--b" />
      <div className="auth-glass-orb auth-glass-orb--c" />
      <div className="auth-glass-shard auth-glass-shard--1" />
      <div className="auth-glass-shard auth-glass-shard--2" />
      <div className="auth-glass-shard auth-glass-shard--3" />
      <div className="auth-glass-prism" />
      <div className="auth-glass-sheen" />
      <div className="auth-glass-sparks" />
      <div className="auth-glass-grain" />
      <div className="auth-glass-vignette" />
    </div>
  );
}
