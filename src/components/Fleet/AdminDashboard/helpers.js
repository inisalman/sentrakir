export const getCompanyName = (db, companyId) => {
  const comp = db?.companies?.find((c) => c.id === companyId);
  return comp ? comp.name : "Unknown Company";
};

export const getPlateNumber = (db, vehicleId) => {
  const veh = db?.vehicles?.find((v) => v.id === vehicleId);
  return veh ? veh.plateNumber : "-";
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};
