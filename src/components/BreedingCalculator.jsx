import { useMemo, useState } from "react";
import breeding from "../data/breeding.json";

// The source table is keyed by the offspring's Paldeck ID and lists every
// parent pair that produces it. Variant IDs use the source's B suffix.
function palKey(pal) {
    return String(pal.id).includes(".")
        ? String(Math.floor(pal.id)).padStart(3, "0") + "B"
        : String(pal.id).padStart(3, "0");
}

export default function BreedingCalculator({ allPals, theme }) {
    const [mode, setMode] = useState("mix");
    const [parentA, setParentA] = useState("");
    const [parentB, setParentB] = useState("");
    const [target, setTarget] = useState("");
    const [matrixParent, setMatrixParent] = useState("");

    const styles = {
        panel: { maxWidth: "900px", margin: "0 auto", padding: "1rem" },
        card: { background: theme.cardBg, border: `2px solid ${theme.border}`, borderRadius: "12px", padding: "1rem", marginBottom: "1rem" },
        heading: { color: theme.text, margin: "0 0 .75rem" },
        label: { display: "block", color: theme.text, fontWeight: 700, marginBottom: ".35rem" },
        select: { width: "100%", padding: ".8rem", borderRadius: "8px", border: "1px solid #aaa", fontSize: "1rem", marginBottom: ".8rem" },
        button: { border: 0, borderRadius: "8px", padding: ".7rem 1rem", background: "#087cf0", color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer" },
        result: { background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "10px", padding: "1rem", marginTop: ".8rem", textAlign: "center" },
        muted: { opacity: .75, fontSize: ".9rem", lineHeight: 1.5 },
        list: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: ".6rem" },
        row: { background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: ".7rem", color: theme.text },
    };

    const byKey = useMemo(() => new Map(allPals.map(p => [palKey(p), p])), [allPals]);
    const orderedPals = useMemo(() => [...allPals].sort((a, b) => a.id - b.id), [allPals]);
    const resultsByPair = useMemo(() => {
        const result = new Map();
        Object.entries(breeding).forEach(([childKey, pairs]) => {
            pairs.forEach(([a, b]) => {
                const pairKey = [a, b].sort().join("+");
                if (!result.has(pairKey)) result.set(pairKey, []);
                const children = result.get(pairKey);
                if (!children.includes(childKey)) children.push(childKey);
            });
        });
        return result;
    }, []);

    const childKeys = parentA && parentB
        ? (resultsByPair.get([parentA, parentB].sort().join("+")) || [])
        : [];
    const reversePairs = target ? (breeding[ target ] || []).filter(([a, b]) => byKey.has(a) && byKey.has(b)) : [];
    const matrixRows = matrixParent
        ? [...resultsByPair.entries()].filter(([pair]) => pair.split("+").includes(matrixParent))
            .map(([pair, children]) => ({ partner: pair.split("+").find(k => k !== matrixParent) || matrixParent, children }))
            .filter(row => byKey.has(row.partner))
            .sort((a, b) => byKey.get(a.partner).name.localeCompare(byKey.get(b.partner).name))
        : [];

    const palName = key => byKey.get(key)?.name || `Unknown Pal (${key})`;
    const renderPalSelect = (label, value, onChange, placeholder) => (
        <label style={styles.label}>{label}
            <select value={value} onChange={e => onChange(e.target.value)} style={styles.select}>
                <option value="">{placeholder}</option>
                {orderedPals.map(p => <option key={palKey(p)} value={palKey(p)}>{String(p.id).replace(".1", "B")} · {p.name}</option>)}
            </select>
        </label>
    );

    return (
        <div style={styles.panel}>
            <h2 style={styles.heading}>🧬 Breeding Calculator</h2>
            <p style={styles.muted}>Experiment with parent combinations, work backwards from a Pal you want, or explore everything one Pal can produce.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginBottom: "1rem" }}>
                {[
                    ["mix", "Parent → offspring"],
                    ["target", "Find the parents"],
                    ["matrix", "Explore a Pal"]
                ].map(([value, label]) => (
                    <button key={value} onClick={() => setMode(value)} style={{ ...styles.button, background: mode === value ? "#087cf0" : "#666" }}>{label}</button>
                ))}
            </div>

            {mode === "mix" && (
                <section style={styles.card}>
                    <h3 style={styles.heading}>What do these two Pals make?</h3>
                    {renderPalSelect("Parent 1", parentA, setParentA, "Choose the first Pal")}
                    {renderPalSelect("Parent 2", parentB, setParentB, "Choose the second Pal")}
                    {parentA && parentB && (
                        <div style={styles.result}>
                            <div style={styles.muted}>{palName(parentA)} + {palName(parentB)}</div>
                            {childKeys.length ? childKeys.map(key => <h2 key={key} style={{ color: theme.text, margin: ".6rem 0" }}>🥚 {palName(key)}</h2>) : <h3 style={{ color: theme.text }}>No matching combination in this dataset</h3>}
                            <p style={styles.muted}>{childKeys.length ? "This is a recorded breeding combination. Parent order does not matter in this lookup." : "This pair may need the normal breeding-power calculation or may not be breedable in this dataset."}</p>
                        </div>
                    )}
                </section>
            )}

            {mode === "target" && (
                <section style={styles.card}>
                    <h3 style={styles.heading}>Which parents make this Pal?</h3>
                    {renderPalSelect("Target Pal", target, setTarget, "Choose the Pal you want")}
                    {target && (
                        <>
                            <p style={styles.muted}>{reversePairs.length} recorded parent combinations</p>
                            {reversePairs.length ? <div style={styles.list}>{reversePairs.map(([a, b], i) => <div key={a + b + i} style={styles.row}><strong>{palName(a)} + {palName(b)}</strong></div>)}</div> : <p style={styles.muted}>No cross-species recipes are listed for this Pal. It may require two of the same species, or its recipe may be missing from this dataset.</p>}
                        </>
                    )}
                </section>
            )}

            {mode === "matrix" && (
                <section style={styles.card}>
                    <h3 style={styles.heading}>What can I breed with this Pal?</h3>
                    {renderPalSelect("Choose a Pal", matrixParent, setMatrixParent, "Choose a Pal to explore")}
                    {matrixParent && (
                        <>
                            <p style={styles.muted}>{matrixRows.length} possible partner combinations</p>
                            {matrixRows.length ? <div style={styles.list}>{matrixRows.map((row, i) => <div key={row.partner + i} style={styles.row}><strong>{palName(matrixParent)} + {palName(row.partner)}</strong><div style={{ marginTop: ".35rem" }}>🥚 {row.children.map(palName).join(", ")}</div></div>)}</div> : <p style={styles.muted}>No combinations found for this Pal in the current dataset.</p>}
                        </>
                    )}
                </section>
            )}

            <p style={styles.muted}>Breeding combinations adapted from mlg404/palworld-paldex-api (MIT). This is the legacy 216-Pal dataset already used by Pal-Dex, not a verified current-game 1.0 table. Game updates may change results; check important combinations in-game.</p>
        </div>
    );
}
