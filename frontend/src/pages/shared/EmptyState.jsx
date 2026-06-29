import React from "react";
export function EmptyState({ icon: Icon, title, text }) { return <div className="emptyState">{Icon && <Icon size={48}/>}<strong>{title}</strong><span>{text}</span></div>; }
