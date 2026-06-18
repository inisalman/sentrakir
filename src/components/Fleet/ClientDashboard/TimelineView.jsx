import React from "react";
import { getDaysRemaining, CURRENT_DATE_STR } from "../../../utils/fleetMockData.js";

  export default function TimelineView({ vehicles }) {
  const baseDate = new Date(CURRENT_DATE_STR);

  const monthsList = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(baseDate);
    d.setMonth(baseDate.getMonth() + i);
    monthsList.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleString("id-ID", { month: "long", year: "numeric" }),
    });
  }

  // Populate timeline items
  const timelineData = monthsList.map((month) => {
    const items = [];

    vehicles.forEach((v) => {
      const checkExpiry = (expiryStr, typeLabel, typeKey) => {
        if (!expiryStr) return;
        const exp = new Date(expiryStr);
        if (
          exp.getFullYear() === month.year &&
          exp.getMonth() === month.month
        ) {
          const days = getDaysRemaining(expiryStr);
          items.push({
            id: `${v.id}-${typeKey}`,
            plate: v.plateNumber,
            type: v.vehicleType,
            docType: typeLabel,
            docKey: typeKey,
            daysRemaining: days,
          });
        }
      };

      checkExpiry(v.kirExpiry, "KIR", "kir");
      checkExpiry(v.stnkExpiry, "STNK", "stnk");
      checkExpiry(v.pajakExpiry, "Pajak", "pajak");
    });

    return {
      ...month,
      items,
    };
  });

  return (
    <div className="timeline-section-card">
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "800",
          margin: "0 0 8px 0",
          color: "#1C3967",
        }}
      >
        Jadwal Kadaluwarsa Bulanan
      </h2>
      <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#6b7a96" }}>
        Berikut adalah daftar dokumen armada yang akan habis masa berlakunya
        dalam 6 bulan ke depan.
      </p>

      <div className="timeline-months-grid">
        {timelineData.map((month, idx) => (
          <div key={idx} className="timeline-month-box">
            <div className="month-name">{month.label}</div>
            <div className="timeline-items">
              {month.items.length === 0 ? (
                <div className="no-expiry-text">
                  Tidak ada berkas jatuh tempo
                </div>
              ) : (
                month.items.map((item) => {
                  const isPast = item.daysRemaining <= 0;
                  return (
                    <div key={item.id} className="timeline-item-card">
                      <div className="timeline-item-left">
                        <span className="timeline-plate">{item.plate}</span>
                        <span className="timeline-type">{item.type}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "4px",
                        }}
                      >
                        <span className={`timeline-doc-tag ${item.docKey}`}>
                          {item.docType}
                        </span>
                        <span
                          className={`timeline-days-badge ${isPast ? "danger" : "warning"}`}
                        >
                          {isPast ? "EXPIRED" : `H-${item.daysRemaining}`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================
