export default function PalCard({ pal, revealed, onClick }) {
    return (
        <div style={{
            ...styles.card,
            cursor: revealed ? 'default' : 'pointer',
            opacity: revealed ? 1 : 0.6,
        }}
            onClick={revealed ? onClick : undefined}
            >
                {revealed ? (
                    <>
                    <div style={styles.name}>{pal.name}</div>
                </>
                ) : (
                    "???"
                )}
        </div>
    );
}

const styles = {
    card: {
        border: "1px solid #ccc",
        padding: "0.75rem",
        textAlign: "center",
        borderRadius: "6px",
        backgroundColor: "#f9f9f9",
    },
    image: {
        width: "80px",
        height: "80px",
        objectFit: "contain",
        marginBottom: "0.5rem",
    },
    name: {
        fontWeight: "bold",
    },
};