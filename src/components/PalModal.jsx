export default function PalModal({ pal, onClose }) {
    if (!pal) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={styles.close}>x</button>

                <h2>{pal.name}</h2>

                <div style={styles.section}>
                    <strong>Type:</strong>
                    <p>{pal.type.join(", ")}</p>
                </div>

                <div style={styles.section}>
                    <strong>Work Suitability:</strong>
                    <ul>
                        {pal.workSuitability.map((work) => (
                            <li key={work}>{work}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        background: "#fff",
        padding: "1.5rem",
        borderRadius: "10px",
        width: "90%",
        maxWidth: "400px",
        position: "relative",
    },
    close: {
        position: "absolute",
        top: "0.5rem",
        right: "0.5rem",
        background: "transparent",
        border: "none",
        fontSize: "1.2rem",
        cursor: "pointer",
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