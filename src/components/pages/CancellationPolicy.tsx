"use client";

import PolicyEditor from "./PolicyEditor";

const CancellationPolicy = () => {
  return (
    <PolicyEditor
      pageName="cancellationPolicy"
      emptyMessageKey="enterCancellationPolicyContent"
      saveLabelKey="saveCancellationPolicy"
    />
  );
};

export default CancellationPolicy;
