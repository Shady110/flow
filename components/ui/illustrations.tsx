/**
 * Abstract product illustrations for the dark showcase panels.
 *
 * Plain SVG, no client boundary and no dependency — these are decorative, so
 * they carry `aria-hidden` and never hold information that is not also in the
 * text beside them. Every one is drawn on a 400×300 canvas and scales with its
 * container, so panels can size them freely.
 *
 * The vocabulary is deliberately narrow, which is what makes four separate
 * drawings read as one family: soft translucent panels, hairline strokes, a
 * single lime accent per illustration, and one cursor tag showing FLOW acting
 * on the customer's work.
 */

const STROKE = 'rgba(255,255,255,0.16)'
const PANEL = 'rgba(255,255,255,0.045)'
const PANEL_SOFT = 'rgba(255,255,255,0.03)'
const INK = 'rgba(255,255,255,0.30)'
const INK_SOFT = 'rgba(255,255,255,0.14)'
const LIME = '#C4F075'

type Props = { className?: string }

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className ?? 'h-auto w-full'}
    >
      {children}
    </svg>
  )
}

/** A short bar standing in for a line of text. */
function TextBar({ x, y, w, o = 1 }: { x: number; y: number; w: number; o?: number }) {
  return <rect x={x} y={y} width={w} height="4" rx="2" fill={INK} opacity={o} />
}

/** The floating "who did this" tag, lifted from the reference's cursor labels. */
function CursorTag({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0 L11 4.2 L6.4 6.4 L4.2 11 Z" fill={LIME} />
      <rect x="9" y="8" width={label.length * 5.6 + 14} height="19" rx="9.5" fill={LIME} />
      <text
        x={9 + (label.length * 5.6 + 14) / 2}
        y="21.5"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#143C28"
        fontFamily="var(--font-display), sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

/**
 * Product Content Creation — a shot being framed, retouched and cut into the
 * set of images a listing needs.
 */
export function ContentCreationArt({ className }: Props) {
  return (
    <Frame className={className}>
      {/* Studio frame */}
      <rect x="40" y="38" width="196" height="150" rx="10" fill={PANEL} stroke={STROKE} />
      {/* Crop marks */}
      <path d="M58 56 H74 M58 56 V72" stroke={LIME} strokeWidth="2" strokeLinecap="round" />
      <path d="M218 170 H202 M218 170 V154" stroke={LIME} strokeWidth="2" strokeLinecap="round" />
      {/* The product, abstracted to a lit form on a sweep */}
      <ellipse cx="138" cy="150" rx="62" ry="10" fill="rgba(255,255,255,0.07)" />
      <rect x="108" y="82" width="60" height="62" rx="8" fill="rgba(255,255,255,0.16)" />
      <rect x="108" y="82" width="60" height="24" rx="8" fill={LIME} opacity="0.85" />
      <circle cx="180" cy="72" r="12" fill="rgba(255,255,255,0.10)" />

      {/* Output strip: the frames the listing actually ships with */}
      <rect x="264" y="38" width="96" height="150" rx="10" fill={PANEL_SOFT} stroke={STROKE} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x="276"
          y={50 + i * 44}
          width="72"
          height="34"
          rx="6"
          fill={PANEL}
          stroke={i === 0 ? LIME : STROKE}
          strokeOpacity={i === 0 ? 0.9 : 1}
        />
      ))}

      {/* Bilingual caption lines */}
      <TextBar x={40} y={210} w={120} />
      <TextBar x={40} y={224} w={196} o={0.55} />
      <TextBar x={40} y={238} w={84} o={0.35} />

      <CursorTag x={286} y={196} label="FLOW" />
    </Frame>
  )
}

/**
 * Listing Optimization — a listing climbing the results, with the keywords
 * doing the lifting.
 */
export function ListingOptimizationArt({ className }: Props) {
  return (
    <Frame className={className}>
      {/* Search field */}
      <rect x="40" y="34" width="200" height="30" rx="15" fill={PANEL} stroke={STROKE} />
      <circle cx="60" cy="49" r="6" stroke={INK} strokeWidth="2" />
      <path d="M64.5 53.5 L69 58" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <TextBar x={76} y={47} w={92} o={0.6} />

      {/* Result rows — the lime one has moved to the top */}
      {[0, 1, 2, 3].map((i) => {
        const top = i === 0
        return (
          <g key={i}>
            <rect
              x="40"
              y={80 + i * 40}
              width="200"
              height="32"
              rx="8"
              fill={top ? 'rgba(196,240,117,0.12)' : PANEL_SOFT}
              stroke={top ? LIME : STROKE}
              strokeOpacity={top ? 0.75 : 1}
            />
            <rect x="52" y={90 + i * 40} width="12" height="12" rx="3" fill={top ? LIME : INK_SOFT} />
            <TextBar x={74} y={94 + i * 40} w={top ? 120 : 86} o={top ? 0.9 : 0.4} />
          </g>
        )
      })}
      {/* The climb */}
      <path
        d="M250 178 L250 96"
        stroke={LIME}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      <path d="M250 88 L245 98 H255 Z" fill={LIME} />

      {/* Rank / conversion bars */}
      <rect x="272" y="34" width="88" height="144" rx="10" fill={PANEL} stroke={STROKE} />
      {[26, 44, 62, 88].map((h, i) => (
        <rect
          key={i}
          x={284 + i * 19}
          y={158 - h}
          width="12"
          height={h}
          rx="4"
          fill={i === 3 ? LIME : INK_SOFT}
        />
      ))}

      <TextBar x={40} y={244} w={150} o={0.45} />
      <CursorTag x={300} y={196} label="Rank #1" />
    </Frame>
  )
}

/**
 * Marketplace Management — one catalogue, pushed out to every storefront.
 */
export function MarketplaceArt({ className }: Props) {
  const nodes = [
    { x: 296, y: 44 },
    { x: 296, y: 110 },
    { x: 296, y: 176 },
  ]
  return (
    <Frame className={className}>
      {/* The single source catalogue */}
      <rect x="36" y="76" width="132" height="112" rx="10" fill={PANEL} stroke={STROKE} />
      <rect x="36" y="76" width="132" height="26" rx="10" fill="rgba(255,255,255,0.06)" />
      <circle cx="50" cy="89" r="3.5" fill={LIME} />
      <TextBar x={62} y={87} w={54} o={0.5} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="50" y={114 + i * 17} width="10" height="10" rx="2.5" fill={INK_SOFT} />
          <TextBar x={68} y={117 + i * 17} w={i === 1 ? 78 : 60} o={0.4} />
        </g>
      ))}

      {/* Fan-out to each storefront */}
      {nodes.map((n, i) => (
        <path
          key={i}
          d={`M168 132 C 218 132, 232 ${n.y + 26}, ${n.x - 8} ${n.y + 26}`}
          stroke={i === 1 ? LIME : STROKE}
          strokeWidth={i === 1 ? 2 : 1.5}
          strokeDasharray={i === 1 ? undefined : '4 5'}
        />
      ))}

      {nodes.map((n, i) => (
        <g key={i}>
          <rect
            x={n.x}
            y={n.y}
            width="72"
            height="52"
            rx="9"
            fill={i === 1 ? 'rgba(196,240,117,0.10)' : PANEL_SOFT}
            stroke={i === 1 ? LIME : STROKE}
            strokeOpacity={i === 1 ? 0.7 : 1}
          />
          <rect
            x={n.x + 12}
            y={n.y + 13}
            width="14"
            height="14"
            rx="4"
            fill={i === 1 ? LIME : INK_SOFT}
          />
          <TextBar x={n.x + 12} y={n.y + 35} w={44} o={0.4} />
        </g>
      ))}

      <TextBar x={36} y={214} w={110} o={0.45} />
      <TextBar x={36} y={228} w={168} o={0.25} />
      <CursorTag x={196} y={200} label="Synced" />
    </Frame>
  )
}

/**
 * Account Management — the account watched and kept running, rather than a
 * pile of listings.
 */
export function AccountManagementArt({ className }: Props) {
  return (
    <Frame className={className}>
      {/* Dashboard shell */}
      <rect x="36" y="34" width="328" height="180" rx="12" fill={PANEL} stroke={STROKE} />
      <path d="M36 64 H364" stroke={STROKE} />
      <circle cx="52" cy="49" r="3.5" fill={INK_SOFT} />
      <circle cx="64" cy="49" r="3.5" fill={INK_SOFT} />
      <circle cx="76" cy="49" r="3.5" fill={LIME} />

      {/* Sidebar */}
      <path d="M104 64 V214" stroke={STROKE} />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x="50"
          y={84 + i * 22}
          width={i === 0 ? 40 : 34}
          height="8"
          rx="4"
          fill={i === 0 ? LIME : INK_SOFT}
          opacity={i === 0 ? 0.9 : 1}
        />
      ))}

      {/* Metric tiles */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={122 + i * 80}
            y="80"
            width="68"
            height="46"
            rx="8"
            fill={PANEL_SOFT}
            stroke={STROKE}
          />
          <TextBar x={132 + i * 80} y={90} w={28} o={0.35} />
          <rect x={132 + i * 80} y="102" width={i === 1 ? 38 : 26} height="9" rx="4" fill={i === 1 ? LIME : INK} />
        </g>
      ))}

      {/* Performance line */}
      <rect x="122" y="138" width="228" height="62" rx="8" fill={PANEL_SOFT} stroke={STROKE} />
      <path
        d="M136 186 L172 172 L206 178 L240 156 L276 162 L310 142 L336 148"
        stroke={LIME}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="310" cy="142" r="4" fill={LIME} />

      <CursorTag x={244} y={222} label="FLOW Team" />
    </Frame>
  )
}

/**
 * The process visual — six stages carrying a product through to a live listing.
 */
export function ProcessArt({ className }: Props) {
  return (
    <Frame className={className}>
      <rect x="28" y="30" width="344" height="240" rx="14" fill={PANEL_SOFT} stroke={STROKE} />

      {/* Intake */}
      <rect x="52" y="60" width="96" height="66" rx="9" fill={PANEL} stroke={STROKE} />
      <rect x="68" y="76" width="64" height="26" rx="6" fill="rgba(255,255,255,0.14)" />
      <TextBar x={68} y={110} w={44} o={0.4} />

      {/* Middle stage, active */}
      <rect
        x="200"
        y="60"
        width="96"
        height="66"
        rx="9"
        fill="rgba(196,240,117,0.10)"
        stroke={LIME}
        strokeOpacity="0.7"
      />
      <rect x="216" y="76" width="64" height="26" rx="6" fill={LIME} opacity="0.8" />
      <TextBar x={216} y={110} w={52} o={0.6} />

      {/* Output */}
      <rect x="126" y="176" width="140" height="68" rx="9" fill={PANEL} stroke={STROKE} />
      <circle cx="150" cy="200" r="8" fill={LIME} />
      <TextBar x={168} y={196} w={72} o={0.5} />
      <TextBar x={150} y={220} w={90} o={0.3} />

      {/* Connectors */}
      <path d="M148 93 H196" stroke={STROKE} strokeWidth="1.5" strokeDasharray="4 5" />
      <path d="M196 93 L188 88 V98 Z" fill={INK_SOFT} />
      <path d="M248 126 V152 C248 166, 236 172, 222 172" stroke={LIME} strokeWidth="2" />
      <path d="M214 172 L224 167 V177 Z" fill={LIME} />

      {/* Stage markers */}
      <text x="60" y="52" fontSize="11" fontWeight="700" fill={INK} fontFamily="var(--font-display), sans-serif">
        01
      </text>
      <text x="208" y="52" fontSize="11" fontWeight="700" fill={LIME} fontFamily="var(--font-display), sans-serif">
        02
      </text>
    </Frame>
  )
}

/**
 * The portfolio teaser's demo — a gallery with one shot lifted out of the
 * grid, standing in for the lightbox the real page opens.
 */
export function PortfolioArt({ className }: Props) {
  // A ragged masonry, because a tidy 3×3 would not read as the real grid.
  const tiles = [
    { x: 34, y: 46, w: 68, h: 76 },
    { x: 110, y: 46, w: 68, h: 52 },
    { x: 34, y: 130, w: 68, h: 52 },
    { x: 110, y: 106, w: 68, h: 76 },
    { x: 34, y: 190, w: 68, h: 62 },
    { x: 110, y: 190, w: 68, h: 62 },
  ]
  return (
    <Frame className={className}>
      {/* Filter row */}
      <rect x="34" y="20" width="46" height="16" rx="8" fill={LIME} />
      {[86, 132, 178].map((x, i) => (
        <rect key={i} x={x} y="20" width={i === 1 ? 42 : 38} height="16" rx="8" fill={PANEL} stroke={STROKE} />
      ))}

      {/* Grid */}
      {tiles.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="7" fill={PANEL} stroke={STROKE} />
          <rect
            x={t.x + 12}
            y={t.y + t.h / 2 - 10}
            width={t.w - 24}
            height="20"
            rx="5"
            fill="rgba(255,255,255,0.10)"
          />
        </g>
      ))}

      {/* The lifted shot — larger, brighter, and shadowed off the grid, the
          way the lightbox pulls one image forward. */}
      <rect x="206" y="62" width="160" height="150" rx="11" fill="#0B2417" stroke={LIME} strokeOpacity="0.55" />
      <rect x="220" y="76" width="132" height="94" rx="7" fill="rgba(255,255,255,0.09)" />
      <ellipse cx="286" cy="150" rx="44" ry="7" fill="rgba(255,255,255,0.07)" />
      <rect x="262" y="98" width="48" height="48" rx="7" fill="rgba(255,255,255,0.18)" />
      <rect x="262" y="98" width="48" height="18" rx="7" fill={LIME} opacity="0.85" />
      <TextBar x={220} y={182} w={78} o={0.5} />
      <TextBar x={220} y={194} w={52} o={0.28} />

      {/* Connector from the grid to the lifted shot */}
      <path d="M180 132 H200" stroke={LIME} strokeWidth="2" strokeDasharray="3 4" />
      <path d="M206 132 L197 127 V137 Z" fill={LIME} />

      <CursorTag x={300} y={224} label="View work" />
    </Frame>
  )
}

/**
 * The hero's anchor — the whole promise in one wide frame: a raw product goes
 * in on one side, a live, ranked listing comes out the other.
 *
 * Wider than the others (900×340) because it sits full-measure under a centred
 * headline rather than beside a column of text.
 */
export function HeroArt({ className }: Props) {
  return (
    <svg
      viewBox="0 0 900 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className ?? 'h-auto w-full'}
    >
      {/* ── Stage 1: the raw product ─────────────────────────── */}
      <rect x="26" y="72" width="196" height="196" rx="16" fill={PANEL} stroke={STROKE} />
      <ellipse cx="124" cy="216" rx="58" ry="9" fill="rgba(255,255,255,0.07)" />
      <rect x="92" y="128" width="64" height="72" rx="10" fill="rgba(255,255,255,0.15)" />
      <rect x="92" y="128" width="64" height="26" rx="10" fill="rgba(255,255,255,0.24)" />
      <text x="46" y="106" fontSize="11" fontWeight="700" fill={INK} fontFamily="var(--font-display), sans-serif">
        01
      </text>
      <TextBar x={46} y={240} w={72} o={0.35} />

      {/* ── Stage 2: the work ────────────────────────────────── */}
      <rect
        x="290"
        y="52"
        width="230"
        height="236"
        rx="16"
        fill="rgba(196,240,117,0.07)"
        stroke={LIME}
        strokeOpacity="0.5"
      />
      <text x="310" y="86" fontSize="11" fontWeight="700" fill={LIME} fontFamily="var(--font-display), sans-serif">
        02
      </text>
      {/* Shot, retouched, described, keyworded — four passes on one item */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="310"
            y={104 + i * 42}
            width="190"
            height="32"
            rx="8"
            fill={i === 1 ? 'rgba(196,240,117,0.16)' : PANEL}
            stroke={i === 1 ? LIME : STROKE}
            strokeOpacity={i === 1 ? 0.6 : 1}
          />
          <rect x="324" y={114 + i * 42} width="12" height="12" rx="3" fill={i === 1 ? LIME : INK_SOFT} />
          <TextBar x={346} y={118 + i * 42} w={i === 1 ? 116 : 84} o={i === 1 ? 0.85 : 0.4} />
        </g>
      ))}

      {/* ── Stage 3: live on the marketplaces ────────────────── */}
      <text x="608" y="86" fontSize="11" fontWeight="700" fill={INK} fontFamily="var(--font-display), sans-serif">
        03
      </text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="588"
            y={100 + i * 62}
            width="176"
            height="50"
            rx="10"
            fill={i === 0 ? 'rgba(196,240,117,0.10)' : PANEL_SOFT}
            stroke={i === 0 ? LIME : STROKE}
            strokeOpacity={i === 0 ? 0.65 : 1}
          />
          <rect x="604" y={114 + i * 62} width="20" height="20" rx="6" fill={i === 0 ? LIME : INK_SOFT} />
          <TextBar x={636} y={116 + i * 62} w={92} o={0.5} />
          <TextBar x={636} y={128 + i * 62} w={60} o={0.25} />
        </g>
      ))}

      {/* Connectors — the flow the brand is named for */}
      <path d="M222 170 H286" stroke={STROKE} strokeWidth="1.5" strokeDasharray="4 6" />
      <path d="M286 170 L277 165 V175 Z" fill={INK_SOFT} />
      <path d="M520 170 H584" stroke={LIME} strokeWidth="2" />
      <path d="M584 170 L575 165 V175 Z" fill={LIME} />

      {/* Result marker */}
      <rect x="792" y="112" width="82" height="26" rx="13" fill={LIME} />
      <text
        x="833"
        y="129"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#143C28"
        fontFamily="var(--font-display), sans-serif"
      >
        Live
      </text>
      <CursorTag x={782} y={186} label="FLOW" />
    </svg>
  )
}
