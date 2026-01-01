export default function PalCard({ pal, revealed, onClick, theme }) {
    const cardStyle = {
        ...styles.card,
        backgroundColor: theme?.cardBg || "#f9f9f9",
        borderColor: theme?.border || "#ccc",
        color: theme?.text || "#000000",
        cursor: revealed ? 'pointer' : 'not-allowed',
        opacity: revealed ? 1 : 0.5,
        transform: revealed ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 0.3s ease',
    };

    return (
        <div style={cardStyle}
            onClick={revealed ? onClick : undefined}
            onMouseEnter={(e) => {
                if (revealed) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }
            }}
            onMouseLeave={(e) => {
                if (revealed) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}
            >
                {revealed ? (
                    <>
                    <div style={styles.name}>{pal.name}</div>
                    <div style={styles.type}>{typeof pal.type === 'string' ? pal.type : pal.type?.join(', ')}</div>
                </>
                ) : (
                    <div style={styles.unknown}>???</div>
                )}
        </div>
    );
}

const styles = {
    card: {
        border: "2px solid",
        padding: "0.75rem",
        textAlign: "center",
        borderRadius: "8px",
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "80px",
        height: "80px",
        objectFit: "contain",
        marginBottom: "0.5rem",
    },
    name: {
        fontWeight: "bold",
        fontSize: "0.9rem",
        marginBottom: "0.25rem",
    },
    type: {
        fontSize: "0.75rem",
        fontStyle: "italic",
        opacity: 0.8,
    },
    unknown: {
        fontSize: "1.5rem",
        fontWeight: "bold",
    },
};