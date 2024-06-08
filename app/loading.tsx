import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white ">
      <div className="space-y-4 text-center ">
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
        </div>
        <p className="text-lg font-medium text-secondary">loading...</p>
      </div>
    </div>
  );
};

export default Loading;
