import React from "react";
import { User, Maximize2 } from "lucide-react";

export default function StakeholderCard({ member, onClick }) {
  return (
    <div className="albijo-stakeholder-card" onClick={() => onClick(member)}>
      <div className="albijo-stakeholder-img-wrapper">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="albijo-stakeholder-img"
          />
        ) : (
          <div className="albijo-stakeholder-placeholder">
            <User size={48} className="albijo-placeholder-icon" />
          </div>
        )}
        <div className="albijo-card-hover-overlay">
          <Maximize2 size={24} className="albijo-overlay-icon" />
          <span>View Bio</span>
        </div>
      </div>

      <div className="albijo-stakeholder-info">
        <h3 className="albijo-stakeholder-name">{member.name}</h3>
        <p className="albijo-stakeholder-role">{member.role}</p>
        <p className="albijo-stakeholder-snippet">{member.snippet}</p>
      </div>
    </div>
  );
}
