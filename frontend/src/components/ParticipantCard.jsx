import React from "react";

const ParticipantCard = ({
  name,
  role,
}) => {
  return (
    <div className="h-full rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center relative">
      <span className="text-4xl font-bold text-white">
        {name?.charAt(0)}
      </span>

      <div className="absolute bottom-2 left-2 text-xs bg-black/30 px-2 py-1 rounded text-white">
        {role}
      </div>
    </div>
  );
};

export default ParticipantCard;