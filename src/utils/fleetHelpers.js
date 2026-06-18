import { getDaysRemaining } from "./fleetMockData.js";

// Helper for UI styling of document expiry status
export const getExpiryCardStyle = (expiryDate) => {
  if (!expiryDate) {
    return {
      background: "#fffbeb",
      border: "1px solid #fde68a",
      labelColor: "#b45309",
      valueColor: "#92400e",
      value: "Belum Ada",
    };
  }

  const days = getDaysRemaining(expiryDate);
  if (days < 0) {
    return {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      labelColor: "#b91c1c",
      valueColor: "#7f1d1d",
      value: `Kedaluwarsa (${Math.abs(days)} hari lalu)`,
    };
  } else if (days <= 30) {
    return {
      background: "#fff7ed",
      border: "1px solid #fed7aa",
      labelColor: "#c2410c",
      valueColor: "#9a3412",
      value: `Segera Habis (${days} hari lagi)`,
    };
  } else {
    return {
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      labelColor: "#15803d",
      valueColor: "#166534",
      value: `Aktif (${days} hari lagi)`,
    };
  }
};

// Check if vehicle plate is from outside Jakarta area
export const getPlateRegion = (vehicle) => {
  if (!vehicle || !vehicle.plateNumber) return "unknown";
  const plate = vehicle.plateNumber.toUpperCase().trim();
  if (plate.startsWith("B ")) {
    const parts = plate.split(" ");
    if (parts.length >= 3) {
      const suffix = parts[2];
      const char1 = suffix.charAt(0);
      const bodetabekChars = ["G", "N", "C", "V", "E", "F", "W"]; // Tangerang, Bekasi, Depok, Bogor, etc.
      if (bodetabekChars.includes(char1)) {
        return "bodetabek"; // Area BODETABEK
      }
    }
    return "jakarta"; // Default to Jakarta if B but not matching BODETABEK suffixes
  }
  return "outside"; // Non-B plates (outside JABODETABEK)
};

// Check if owner/plate data matches between documents
export const isDataMismatch = (vehicle) => {
  if (!vehicle) return false;
  const stnkOwner = vehicle.stnkOwnerName?.toLowerCase().trim();
  const kkOwner = vehicle.kkOwnerName?.toLowerCase().trim();
  const stnkPlate = vehicle.stnkPlateNumber?.toUpperCase().trim();
  const kkPlate = vehicle.kkPlateNumber?.toUpperCase().trim();

  const ownerMatch = stnkOwner === kkOwner;
  const plateMatch = stnkPlate === kkPlate;

  return (
    stnkOwner && kkOwner && !ownerMatch && stnkPlate && kkPlate && !plateMatch
  );
};

// Check overall vehicle compliance status based on documents
export const getOverallStatus = (vehicle) => {
  if (!vehicle) return "unknown";
  const stnkDays = vehicle.stnkExpiry
    ? getDaysRemaining(vehicle.stnkExpiry)
    : null;
  const kirDays = vehicle.kirExpiry
    ? getDaysRemaining(vehicle.kirExpiry)
    : null;
  const pajakDays = vehicle.pajakExpiry
    ? getDaysRemaining(vehicle.pajakExpiry)
    : null;

  const isExpired = (days) => days !== null && days < 0;
  const isWarning = (days) => days !== null && days >= 0 && days <= 30;

  if (isExpired(stnkDays) || isExpired(kirDays) || isExpired(pajakDays)) {
    return "Kedaluwarsa";
  } else if (
    isWarning(stnkDays) ||
    isWarning(kirDays) ||
    isWarning(pajakDays)
  ) {
    return "Segera Habis";
  } else if (stnkDays > 30 && kirDays > 30 && pajakDays > 30) {
    return "Aktif";
  } else {
    return "Belum Lengkap";
  }
};

export const formatDateLong = (dateStr) => {
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
