import React from "react";

export default function PalCard({ pal, revealed }) {
    return (
        <div style={cardStyle} aria-hidden={!revealed}>
            <div style={nameStyle}>{revealed ? pal.name : "???"}</div>
        </div>
    );
}

const cardStyle = {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    textAlign: "center",
    background: "#fff",
};

const nameStyle = {
    fontWeight: 600,
};
