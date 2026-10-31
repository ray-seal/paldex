import palLocations from "../data/palLocations.json";

export default function PalModal({ pal, onClose, theme, revealed, onAddToCollection }) {
    if (!pal) return null;

    const types = Array.isArray(pal.type) ? pal.type : pal.type ? [pal.type] : [];
    const habitat = palLocations[pal.name];
    const rawWork = pal.workSuitability ?? pal["work suitability"] ?? "";
    const workList = Array.isArray(rawWork)
        ? rawWork
        : typeof rawWork === "string"
        ? rawWork.split(/\s*,\s*/).filter(Boolean)
        : [];

    const modalStyle = {
        ...styles.modal,
        backgroundColor: theme?.cardBg || "#fff",
        color: theme?.text || "#000",
        border: `3px solid ${theme?.border || "#ccc"}`,
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={{ ...styles.close, color: theme?.text || "#000" }}>✕</button>

                <h2 style={{ color: theme?.text || "#000" }}>
                    {pal.name}
                    {!revealed && <span style={styles.badge}> 🔒</span>}
                </h2>
                {pal.paldeck && <p style={{ textAlign: "center", marginTop: "-0.5rem" }}>Paldeck #{pal.paldeck}</p>}

                {!revealed && (
                    <div style={styles.collectionStatus}>
                        <span style={styles.notCollected}>Not in Collection</span>
                    </div>
                )}

                <div style={styles.section}>
                    <strong>Type:</strong>
                    <p>{types.join(", ")}</p>
                </div>
                {habitat && (
                    <div style={styles.section}>
                        <strong>Where to find:</strong>
                        {habitat.regions?.length > 0 ? (
                            <ul>{habitat.regions.map((region, i) => <li key={i}>{region}</li>)}</ul>
                        ) : <p>No regular wild habitat recorded.</p>}
                        {habitat.day_night && <p><strong>Active:</strong> {habitat.day_night === "both" ? "Day and night" : habitat.day_night}</p>}
                        {habitat.alpha_locations?.length > 0 && <>
                            <strong>Alpha encounters:</strong>
                            <ul>{habitat.alpha_locations.map((location, i) => <li key={i}>{location}</li>)}</ul>
                        </>}
                        {habitat.egg_types?.length > 0 && <p><strong>Egg type:</strong> {habitat.egg_types.join(", ")}</p>}
                        {habitat.other_sources?.length > 0 && <>
                            <strong>Other ways to obtain:</strong>
                            <ul>{habitat.other_sources.map((source, i) => <li key={i}>{source}</li>)}</ul>
                        </>}
                    </div>
                )}
                {!habitat && <div style={styles.section}>
                    <strong>Where to find:</strong>
                    <p>Location data not yet available for this Pal.</p>
                </div>}

                <div style={styles.section}>
                    <strong>Work Suitability:</strong>
                    <ul>
                        {workList.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                </div>
                {pal.stats && <div style={styles.section}>
                    <strong>Base Stats:</strong>
                    <p>HP {pal.stats.hp ?? "?"} · Attack {pal.stats.attack ?? "?"} · Defense {pal.stats.defense ?? "?"}</p>
                </div>}
                <div style={styles.section}>
                    <strong>Gives:</strong>
                    <p>{pal.gives || "Not listed"}</p>
                </div>

                {revealed ? null : (
                    <button
                        onClick={onAddToCollection}
                        style={styles.addButton}
                    >
                        Add to Collection
                    </button>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        padding: "1.5rem",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "400px",
        maxHeight: "85vh",
        overflowY: "auto",
        position: "relative",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    },
    close: {
        position: "absolute",
        top: "0.5rem",
        right: "0.5rem",
        background: "transparent",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        fontWeight: "bold",
    },
    image: {
        width: "120px",
        display: "block",
        margin: "0 auto 1rem"
    },
    section: {
        marginTop: "1rem",
    },
    badge: {
        fontSize: "1rem",
        marginLeft: "0.5rem",
    },
    collectionStatus: {
        textAlign: "center",
        marginBottom: "1rem",
    },
    notCollected: {
        color: "#dc3545",
        fontWeight: "bold",
        fontSize: "0.9rem",
    },
    addButton: {
        width: "100%",
        marginTop: "1rem",
        padding: "0.75rem",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "1rem",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    },
};