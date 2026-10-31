import { useMemo, useState } from "react";
import breedingData from "../data/breeding.json";

const titleCase = value => value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
const pairKey = (a, b) => [a, b].sort().join("|");

export default function BreedingCalculator({ allPals, theme }) {
    const [mode, setMode] = useState("pair");
    const [parentA, setParentA] = useState("");
    const [parentB, setParentB] = useState("");
    const [genderA, setGenderA] = useState("");
    const [genderB, setGenderB] = useState("");
    const [target, setTarget] = useState("");
    const [explore, setExplore] = useState("");

    const pals = useMemo(() => allPals.filter(p => p.gameId && Number.isFinite(p.combiRank)), [allPals]);
    const byGameId = useMemo(() => new Map(pals.map(p => [p.gameId, p])), [pals]);
    const parentPool = useMemo(() => pals.filter(p => p.breedableAsParent), [pals]);
    const childPool = useMemo(() => pals.filter(p => p.breedableAsChild).sort((a,b) =>
        a.combiRank - b.combiRank || (a.breedOrder ?? 999999999) - (b.breedOrder ?? 999999999) || a.gameId.localeCompare(b.gameId)
    ), [pals]);
    const specialByPair = useMemo(() => {
        const map = new Map();
        breedingData.specialCombos.forEach(combo => {
            const key = pairKey(...combo.parents);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(combo);
        });
        return map;
    }, []);
    const outcomes = useMemo(() => {
        const map = new Map();
        for (let i=0; i<parentPool.length; i++) {
            for (let j=i; j<parentPool.length; j++) {
                const a=parentPool[i], b=parentPool[j];
                const key=pairKey(a.gameId,b.gameId);
                const specials=specialByPair.get(key) || [];
                let children=[];
                if (specials.length) children=[...new Set(specials.map(x=>x.child))];
                else if (a.gameId===b.gameId) {
                    if (a.breedableAsChild) children=[a.gameId];
                } else {
                    const rank=Math.floor((a.combiRank+b.combiRank+1)/2);
                    let best=null, distance=Infinity;
                    for (const child of childPool) {
                        const d=Math.abs(child.combiRank-rank);
                        if (d<distance) {best=child;distance=d;}
                        else if (d>distance) break;
                    }
                    if (best) children=[best.gameId];
                }
                if(children.length) map.set(key,children);
            }
        }
        return map;
    }, [parentPool, childPool, specialByPair]);

    const name = id => byGameId.get(id)?.name || id;
    const selectedPair = parentA && parentB ? pairKey(parentA,parentB) : "";
    const selectedSpecials = selectedPair ? (specialByPair.get(selectedPair)||[]) : [];
    const selectedChildren = selectedPair ? (outcomes.get(selectedPair)||[]) : [];
    const genderSensitive = selectedSpecials.some(c=>c.parentGenders);
    const genderResults = genderSensitive && genderA && genderB
        ? selectedSpecials.filter(c => {
            const required = Object.fromEntries(c.parents.map((id,i)=>[id,c.parentGenders?.[i]]));
            return (!required[parentA] || required[parentA]===genderA) && (!required[parentB] || required[parentB]===genderB);
        }).map(c=>c.child)
        : selectedChildren;
    const targetPairs = target ? [...outcomes.entries()].filter(([,children])=>children.includes(target)) : [];
    const partnerRows = explore ? [...outcomes.entries()].filter(([key])=>key.split("|").includes(explore)).map(([key,children])=>({
        partner:key.split("|").find(id=>id!==explore)||explore,children
    })).sort((a,b)=>name(a.partner).localeCompare(name(b.partner))) : [];

    const panel={background:theme.cardBg,color:theme.text,border:"1px solid "+theme.border,borderRadius:12,padding:16,marginBottom:16};
    const selectStyle={width:"100%",padding:12,borderRadius:8,border:"1px solid #aaa",fontSize:16,marginTop:6,marginBottom:12};
    const muted={opacity:.75,fontSize:13,lineHeight:1.5};
    const btn=active=>({padding:"10px 12px",border:0,borderRadius:8,background:active?"#087cf0":"#666",color:"white",fontWeight:700,cursor:"pointer"});
    const renderSelect=(label,value,onChange,placeholder,options)=> <label style={{display:"block",fontWeight:700,marginBottom:6}}>{label}<select style={selectStyle} value={value} onChange={e=>onChange(e.target.value)}><option value="">{placeholder}</option>{options.map(p=><option key={p.gameId} value={p.gameId}>{p.paldeck} · {p.name}</option>)}</select></label>;
    const renderGender=(label,value,onChange)=><label style={{display:"block",fontWeight:700,marginBottom:10}}>{label}<select style={selectStyle} value={value} onChange={e=>onChange(e.target.value)}><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option></select></label>;
    const resultCard=id=><div key={id} style={{padding:12,borderRadius:8,background:theme.bg,border:"1px solid "+theme.border,marginTop:8}}><strong>{name(id)}</strong><div style={muted}>#{byGameId.get(id)?.paldeck || "?"}</div></div>;

    return <div style={{maxWidth:900,margin:"0 auto",padding:16}}>
        <h2 style={{color:theme.text}}>🧬 Breeding Lab</h2>
        <p style={muted}>Explore Palworld 1.0 breeding. Mix any two Pals, work backwards from a target, or see every possible partner for one Pal.</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
            <button style={btn(mode==="pair")} onClick={()=>setMode("pair")}>Pair calculator</button>
            <button style={btn(mode==="target")} onClick={()=>setMode("target")}>Find parents</button>
            <button style={btn(mode==="explore")} onClick={()=>setMode("explore")}>Explore a Pal</button>
        </div>
        {mode==="pair" && <section style={panel}>
            <h3>What do these two Pals make?</h3>
            {renderSelect("Parent 1",parentA,setParentA,"Choose first parent",parentPool)}
            {renderSelect("Parent 2",parentB,setParentB,"Choose second parent",parentPool)}
            {genderSensitive && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{renderGender("Parent 1 gender",genderA,setGenderA)}{renderGender("Parent 2 gender",genderB,setGenderB)}</div>}
            {parentA&&parentB && <div style={{marginTop:12}}>
                <strong>{name(parentA)} + {name(parentB)}</strong>
                {genderSensitive&&<p style={muted}>This special combination depends on which parent is male or female. Select both genders to narrow the result.</p>}
                {genderResults.length ? genderResults.map(resultCard) : <p style={muted}>No valid offspring for this pair with the selected genders.</p>}
                {selectedSpecials.length>0&&<p style={muted}>Special breeding combination from the game data.</p>}
                {!selectedSpecials.length&&selectedChildren.length>0&&<p style={muted}>Calculated using the Palworld breeding-rank formula.</p>}
            </div>}
        </section>}
        {mode==="target" && <section style={panel}>
            <h3>Which parents make this Pal?</h3>
            {renderSelect("Target Pal",target,setTarget,"Choose the offspring",childPool)}
            {target&&<><p style={muted}>{targetPairs.length.toLocaleString()} recorded parent pairs</p>
                {targetPairs.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:8}}>{targetPairs.map(([key])=>{const [a,b]=key.split("|");return <div key={key} style={{padding:12,borderRadius:8,background:theme.bg,border:"1px solid "+theme.border}}>{name(a)} + {name(b)}</div>})}</div>:<p style={muted}>No parent pairs found in this data.</p>}
            </>}
        </section>}
        {mode==="explore" && <section style={panel}>
            <h3>What can I breed with this Pal?</h3>
            {renderSelect("Choose a Pal",explore,setExplore,"Choose a parent",parentPool)}
            {explore&&<><p style={muted}>{partnerRows.length.toLocaleString()} possible partners</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:8}}>{partnerRows.map(row=><div key={row.partner} style={{padding:12,borderRadius:8,background:theme.bg,border:"1px solid "+theme.border}}><strong>{name(explore)} + {name(row.partner)}</strong><div style={{marginTop:6}}>{row.children.map(name).join(" / ")}</div></div>)}</div>
            </>}
        </section>}
        <p style={muted}>Game-data snapshot: Palworld 1.0.3 (September 2026 extraction). The 1.0.4 and 1.0.5 patch notes report no changes to the Pal roster or breeding tables in the latest tracked extraction. Mutations, passive inheritance, gender-specific outcomes and egg odds are separate mechanics and are not simulated here.</p>
        <p style={muted}>Breeding data source: AlbertoJALJ/palworld, extracted from the game's Pal and unique-combination tables. <a href="https://github.com/AlbertoJALJ/palworld" target="_blank" rel="noreferrer">Source and methodology</a>.</p>
    </div>;
}
