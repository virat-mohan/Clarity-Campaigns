export function GrowthFlywheelDiagram() {
  return (
    <svg viewBox="0 0 480 380" className="w-full max-w-[460px] h-auto" role="img" aria-label="Growth flywheel: Acquisition, Conversion, Retention">
      <defs>
        <marker id="arrowGold" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 Z" fill="#d1a02e" />
        </marker>
        <marker id="arrowSage" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 Z" fill="#7a8455" />
        </marker>
        <marker id="arrowCoral" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 Z" fill="#b0553a" />
        </marker>
      </defs>

      <path d="M256.5,76.4 A95,95 0 0,1 329.3,202.5" fill="none" stroke="#d1a02e" strokeWidth={16} strokeLinecap="round" markerEnd="url(#arrowGold)" />
      <path d="M312.8,231.1 A95,95 0 0,1 167.2,231.1" fill="none" stroke="#7a8455" strokeWidth={16} strokeLinecap="round" markerEnd="url(#arrowSage)" />
      <path d="M150.7,202.5 A95,95 0 0,1 223.5,76.4" fill="none" stroke="#b0553a" strokeWidth={16} strokeLinecap="round" markerEnd="url(#arrowCoral)" />

      <circle cx={240} cy={170} r={55} fill="none" stroke="#3a3229" strokeWidth={1} />
      <text x={240} y={166} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize={10} letterSpacing={2} fill="#a89f8f">GROWTH</text>
      <text x={240} y={182} textAnchor="middle" fontFamily="'IBM Plex Mono',monospace" fontSize={10} letterSpacing={2} fill="#a89f8f">FLYWHEEL</text>

      <text x={361} y={100} textAnchor="start" fontFamily="'Fraunces',serif" fontSize={17} fontWeight={700} fill="#d1a02e">Acquisition</text>
      <text x={361} y={119} textAnchor="start" fontSize={11.5} fill="#a89f8f">Build demand</text>

      <text x={240} y={310} textAnchor="middle" fontFamily="'Fraunces',serif" fontSize={17} fontWeight={700} fill="#7a8455">Conversion</text>
      <text x={240} y={328} textAnchor="middle" fontSize={11.5} fill="#a89f8f">Turn attention to revenue</text>

      <text x={119} y={100} textAnchor="end" fontFamily="'Fraunces',serif" fontSize={17} fontWeight={700} fill="#b0553a">Retention</text>
      <text x={119} y={119} textAnchor="end" fontSize={11.5} fill="#a89f8f">Extend LTV</text>
    </svg>
  );
}
