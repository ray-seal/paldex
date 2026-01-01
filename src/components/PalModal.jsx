export default function PalModal({ pal, onClose, theme }) {
    if (!pal) return null;

    const types = Array.isArray(pal.type) ? pal.type : pal.type ? [pal.type] : [];
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

                <h2 style={{ color: theme?.text || "#000" }}>{pal.name}</h2>

                <div style={styles.section}>
                    <strong>Type:</strong>
                    <p>{types.join(", ")}</p>
                </div>

                <div style={styles.section}>
                    <strong>Work Suitability:</strong>
                    <ul>
                        {workList.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                </div>
                <div style={styles.section}>
                    <strong>Gives:</strong>
                    <p>{pal.gives ?? "N/A"}</p>
                </div>
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
};