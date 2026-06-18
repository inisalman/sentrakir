import React, { useState, useEffect, useRef } from "react";
import AddEditVehicleModal from "./VehiclesViewModals/AddEditVehicleModal";
import UploadDocModal from "./VehiclesViewModals/UploadDocModal";
import UrusSuratModal from "./VehiclesViewModals/UrusSuratModal";
import DokumenModal from "./VehiclesViewModals/DokumenModal";
import PreviewDokumenModal from "./VehiclesViewModals/PreviewDokumenModal";
import VehicleDetailModal from "./VehiclesViewModals/VehicleDetailModal";
// fleetHelpers: getPlateRegion, isDataMismatch, getExpiryCardStyle used via UrusSuratModal (not needed here directly)
import {
  getDaysRemaining,
  getDocStatus,
  getTierConfig,
  canAddVehicle,
  getVehicleLimit,
} from "../../../utils/fleetMockData.js";
import {
  createVehicle,
  updateVehicleSupabase,
  deleteVehicleSupabase,
} from "../../../utils/supabaseVehicles.js";
import {
  createRequest,
} from "../../../utils/supabaseRequests.js";
import { createNotification } from "../../../utils/supabaseNotifications.js";
import { getAllServicePrices } from "../../../utils/supabasePricing.js";
import { exportToCSV, printData } from "../../../utils/exportHelpers.js";

const formatDateLong = (dateStr) => {
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

export default function VehiclesView({
  vehicles,
  docs,
  clientId,
  company,
  onUpdate,
  servicePrices = {},
  activeTab,
}) {
  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'upload' | 'urus' | null
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [uploadDocType, setUploadDocType] = useState("kir");
  const [uploadFileName, setUploadFileName] = useState("");
  const [requestServiceType, setRequestServiceType] = useState("kir_renewal");
  const [requestDesc, setRequestDesc] = useState("");
  const [requestLaporHilang, setRequestLaporHilang] = useState(false);
  const [requestMediaNasional, setRequestMediaNasional] = useState(false);
  const [requestSimService, setRequestSimService] = useState(null); // null | 'sim_baru' | 'sim_perpanjang' | 'sim_konsultasi'
  const [chosenAdminId, setChosenAdminId] = useState(null); // for SIM services where client chooses admin
  const [rescanDocType, setRescanDocType] = useState(null); // 'kartuKir' | 'sertifikatKir' | 'stnk' | null
  const [previewDoc, setPreviewDoc] = useState(null); // { key, label, fileName } for preview modal
  const [vehicleDetailModal, setVehicleDetailModal] = useState(null); // full vehicle data modal

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalType !== null) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [modalType]);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    ownerName: "",
    plateNumber: "",
    vehicleType: "Delvan",
    testNumber: "",
    noJktBelumAda: false,
    kirExpiry: "",
    stnkExpiry: "",
    pajakExpiry: "",
    simDriverExpiry: "",
    notes: "",
    // Data Kartu Kendaraan
    kkOwnerName: "",
    kkOwnerAddress: "",
    kkPlateNumber: "",
    kkFrameNumber: "",
    kkEngineNumber: "",
    kkTestNumber: "",
    // Data Kartu KIR
    kirOwnerName: "",
    kirPlateNumber: "",
    kirTestNumber: "",
    kirVehicleType: "Delvan",
    kirBrand: "",
    // Data STNK
    stnkOwnerName: "",
    stnkPlateNumber: "",
    stnkOwnerAddress: "",
    stnkBrand: "",
    stnkVehicleType: "",
    stnkVehicleJenis: "Delvan",
    stnkModel: "",
    stnkYearManufactured: "",
    stnkFrameNumber: "",
    stnkEngineNumber: "",
    kartuKirFile: null,
    kartuKirHilang: false,
    kartuKirMobilBaru: false,
    kartuKirBelumAda: false,
    sertifikatKirFile: null,
    sertifikatKirHilang: false,
    sertifikatKirMobilBaru: false,
    sertifikatKirBelumAda: false,
    stnkFile: null,
    stnkHilang: false,
    stnkBelumAda: false,
  });

  const prevValuesRef = useRef({
    ownerName: "",
    plateNumber: "",
    testNumber: "",
    vehicleType: "Delvan",
  });

  useEffect(() => {
    const prev = prevValuesRef.current;
    setFormData((curr) => {
      const updated = { ...curr };

      // Sync kkOwnerName if it matches previous ownerName (or is empty)
      if (curr.kkOwnerName === prev.ownerName || curr.kkOwnerName === "") {
        updated.kkOwnerName = curr.ownerName;
      }
      // Sync kkPlateNumber
      if (
        curr.kkPlateNumber === prev.plateNumber ||
        curr.kkPlateNumber === ""
      ) {
        updated.kkPlateNumber = curr.plateNumber;
      }
      // Sync kkTestNumber
      if (curr.kkTestNumber === prev.testNumber || curr.kkTestNumber === "") {
        updated.kkTestNumber = curr.testNumber;
      }

      // Sync kirOwnerName
      if (curr.kirOwnerName === prev.ownerName || curr.kirOwnerName === "") {
        updated.kirOwnerName = curr.ownerName;
      }
      // Sync kirPlateNumber
      if (
        curr.kirPlateNumber === prev.plateNumber ||
        curr.kirPlateNumber === ""
      ) {
        updated.kirPlateNumber = curr.plateNumber;
      }
      // Sync kirTestNumber
      if (curr.kirTestNumber === prev.testNumber || curr.kirTestNumber === "") {
        updated.kirTestNumber = curr.testNumber;
      }
      // Sync kirVehicleType
      if (
        curr.kirVehicleType === prev.vehicleType ||
        curr.kirVehicleType === "Delvan"
      ) {
        updated.kirVehicleType = curr.vehicleType;
      }

      return updated;
    });

    // Update refs
    prevValuesRef.current = {
      ownerName: formData.ownerName,
      plateNumber: formData.plateNumber,
      testNumber: formData.testNumber,
      vehicleType: formData.vehicleType,
    };
  }, [
    formData.ownerName,
    formData.plateNumber,
    formData.vehicleType,
    formData.testNumber,
  ]);

  // Keep vehicleDetailModal in sync with latest props
  useEffect(() => {
    if (vehicleDetailModal) {
      const updated = vehicles.find((v) => v.id === vehicleDetailModal.id);
      if (updated) {
        setVehicleDetailModal(updated);
      } else {
        setVehicleDetailModal(null); // closed if deleted
      }
    }
  }, [vehicles, vehicleDetailModal?.id]);

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenAdd = () => {
    setFormData({
      ownerName: "",
      plateNumber: "",
      vehicleType: "Delvan",
      testNumber: "",
      noJktBelumAda: false,
      kirExpiry: "",
      stnkExpiry: "",
      pajakExpiry: "",
      simDriverExpiry: "",
      notes: "",
      // Data Kartu Kendaraan
      kkOwnerName: "",
      kkOwnerAddress: "",
      kkPlateNumber: "",
      kkFrameNumber: "",
      kkEngineNumber: "",
      kkTestNumber: "",
      // Data Kartu KIR
      kirOwnerName: "",
      kirPlateNumber: "",
      kirTestNumber: "",
      kirVehicleType: "Delvan",
      kirBrand: "",
      // Data STNK
      stnkOwnerName: "",
      stnkPlateNumber: "",
      stnkOwnerAddress: "",
      stnkBrand: "",
      stnkVehicleType: "",
      stnkVehicleJenis: "Delvan",
      stnkModel: "",
      stnkYearManufactured: "",
      stnkFrameNumber: "",
      stnkEngineNumber: "",
      kartuKirFile: null,
      kartuKirHilang: false,
      kartuKirMobilBaru: false,
      kartuKirBelumAda: false,
      sertifikatKirFile: null,
      sertifikatKirHilang: false,
      sertifikatKirMobilBaru: false,
      sertifikatKirBelumAda: false,
      stnkFile: null,
      stnkHilang: false,
      stnkBelumAda: false,
    });
    setModalType("add");
  };

  const handleOpenEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      ownerName: vehicle.ownerName || "",
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.vehicleType,
      testNumber: vehicle.testNumber || "",
      noJktBelumAda: !!vehicle.noJktBelumAda,
      kirExpiry: vehicle.kirExpiry,
      stnkExpiry: vehicle.stnkExpiry,
      pajakExpiry: vehicle.pajakExpiry,
      simDriverExpiry: vehicle.simDriverExpiry || "",
      notes: vehicle.notes || "",
      // Data Kartu Kendaraan
      kkOwnerName: vehicle.kkOwnerName || "",
      kkOwnerAddress: vehicle.kkOwnerAddress || "",
      kkPlateNumber: vehicle.kkPlateNumber || "",
      kkFrameNumber: vehicle.kkFrameNumber || "",
      kkEngineNumber: vehicle.kkEngineNumber || "",
      kkTestNumber: vehicle.kkTestNumber || "",
      // Data Kartu KIR
      kirOwnerName: vehicle.kirOwnerName || "",
      kirPlateNumber: vehicle.kirPlateNumber || "",
      kirTestNumber: vehicle.kirTestNumber || "",
      kirVehicleType: vehicle.kirVehicleType || "Delvan",
      kirBrand: vehicle.kirBrand || "",
      // Data STNK
      stnkOwnerName: vehicle.stnkOwnerName || "",
      stnkPlateNumber: vehicle.stnkPlateNumber || "",
      stnkOwnerAddress: vehicle.stnkOwnerAddress || "",
      stnkBrand: vehicle.stnkBrand || "",
      stnkVehicleType: vehicle.stnkVehicleType || "",
      stnkVehicleJenis: vehicle.stnkVehicleJenis || "Delvan",
      stnkModel: vehicle.stnkModel || "",
      stnkYearManufactured: vehicle.stnkYearManufactured || "",
      stnkFrameNumber: vehicle.stnkFrameNumber || "",
      stnkEngineNumber: vehicle.stnkEngineNumber || "",
      kartuKirFile: vehicle.kartuKirFileName || null,
      kartuKirHilang: !!vehicle.kartuKirHilang,
      kartuKirMobilBaru: !!vehicle.kartuKirMobilBaru,
      kartuKirBelumAda: !!vehicle.kartuKirBelumAda,
      sertifikatKirFile: vehicle.sertifikatKirFileName || null,
      sertifikatKirHilang: !!vehicle.sertifikatKirHilang,
      sertifikatKirMobilBaru: !!vehicle.sertifikatKirMobilBaru,
      sertifikatKirBelumAda: !!vehicle.sertifikatKirBelumAda,
      stnkFile: vehicle.stnkFileName || null,
      stnkHilang: !!vehicle.stnkHilang,
      stnkBelumAda: !!vehicle.stnkBelumAda,
    });
    setModalType("edit");
  };

  // Set selected document file (no scanning, just stores the file name)
  const setDocumentFile = (docType, fileName) => {
    setFormData((prev) => ({
      ...prev,
      [`${docType}File`]: fileName,
    }));
  };

  // Remove selected document file
  const removeDocumentFile = (docType) => {
    setFormData((prev) => ({
      ...prev,
      [`${docType}File`]: null,
    }));
  };

  const handleOpenUpload = (vehicle) => {
    setSelectedVehicle(vehicle);
    setUploadDocType("kir");
    setUploadFileName("");
    setModalType("upload");
  };

  // Helper function to get description based on service type and vehicle
  const getDescriptionForServiceType = (serviceType, vehicle) => {
    if (!vehicle) return "";

    const descriptions = {
      kir_renewal: `Pengurusan perpanjangan Uji KIR untuk kendaraan ${vehicle.plateNumber} yang habis pada tanggal ${formatDateLong(vehicle.kirExpiry)}.`,

      stnk_renewal: `Pengurusan perpanjangan STNK (Surat Tanda Nomor Kendaraan) 5 tahunan untuk kendaraan ${vehicle.plateNumber} yang habis tanggal ${formatDateLong(vehicle.stnkExpiry)}.`,

      pajak_renewal: `Pengurusan perpanjangan Pajak Kendaraan Tahunan untuk kendaraan ${vehicle.plateNumber} yang habis tanggal ${formatDateLong(vehicle.pajakExpiry)}. Proses pembayaran dan pengurusan dokumen kami tangani.`,

      buka_blokir_kir: `Pengurusan Buka Blokir Data Kendaraan KIR untuk kendaraan ${vehicle.plateNumber} karena KIR telah kadaluwarsa lebih dari 1 tahun (Habis sejak ${formatDateLong(vehicle.kirExpiry)}). Diperlukan proses khusus ke Dishub untuk membuka status terblokir.`,

      balik_nama: `Pengurusan Balik Nama Kendaraan (BBN-KB) untuk kendaraan ${vehicle.plateNumber} karena data pemilik/NOPOL pada STNK tidak sesuai dengan data pada Sertifikat KIR. Wajib menyesuaikan data saat perpanjangan KIR.`,

      // New Jakarta-area STNK services (routed to Padajaya)
      balik_nama_stnk: `Pengurusan Balik Nama STNK untuk kendaraan ${vehicle.plateNumber}. Proses administrasi perubahan nama pemilik pada STNK.`,
      mutasi: `Pengurusan Mutasi Kendaraan untuk kendaraan ${vehicle.plateNumber}. Proses administrasi perpindahan kepemilikan atau domisili kendaraan.`,
      mutasi_masuk_stnk: `Pengurusan Mutasi Masuk STNK (Ke-Jakarta) untuk kendaraan ${vehicle.plateNumber}. Proses memasukkan data STNK kendaraan dari luar wilayah Jakarta ke wilayah Jakarta.`,
      stnk_hilang: `Pengurusan penggantian STNK Hilang untuk kendaraan ${vehicle.plateNumber}. Proses permohonan penerbitan STNK baru karena kehilangan.`,
      ganti_alamat: `Pengurusan perubahan alamat pada STNK untuk kendaraan ${vehicle.plateNumber}. Penyesuaian data alamat pemilik kendaraan.`,
      blokir_progresif: `Pengurusan Blokir Progresif Pajak Kendaraan untuk ${vehicle.plateNumber}. Pemblokiran STNK sementara untuk menghindari akumulasi pajak.`,
      cek_fisik_bantuan: `Pengurusan Cek Fisik Bantuan kendaraan untuk ${vehicle.plateNumber}. Pendampingan proses pemeriksaan fisik kendaraan.`,
      urus_e_tilang: `Pengurusan E-Tilang untuk kendaraan ${vehicle.plateNumber}. Bantuan penanganan dan penyelesaian tilang elektronik.`,
      cabut_berkas_stnk: `Pengurusan Cabut Berkas STNK untuk kendaraan ${vehicle.plateNumber}. Proses pengambilan berkas STNK dari kepolisian/Samsat.`,

      // New SIM services (client chooses admin)
      bikin_sim_a: `Pembuatan SIM A baru untuk ${vehicle.plateNumber}. Proses pembuatan Surat Izin Mengemudi golongan A (kendaraan penumpang < 3000kg).`,
      bikin_sim_c: `Pembuatan SIM C baru untuk ${vehicle.plateNumber}. Proses pembuatan Surat Izin Mengemudi golongan C (sepeda motor).`,
      perpanjang_sim_a: `Perpanjangan SIM A untuk ${vehicle.plateNumber}. Proses perpanjangan masa berlaku Surat Izin Mengemudi golongan A yang akan habis.`,
      perpanjang_sim_c: `Perpanjangan SIM C untuk ${vehicle.plateNumber}. Proses perpanjangan masa berlaku Surat Izin Mengemudi golongan C yang akan habis.`,

      // New Jakarta-area KIR services
      kir_uji_baru: `Pengurusan Uji KIR Baru (pertama kali) untuk kendaraan ${vehicle.plateNumber}. Proses pendaftaran dan pengujian KIR untuk kendaraan yang belum pernah diuji.`,
      kir_numpang_uji: `Pengurusan Numpang Uji KIR untuk kendaraan ${vehicle.plateNumber}. Pengujian KIR di wilayah Jakarta untuk kendaraan dengan domisili luar Jakarta.`,
      kir_mutasi_masuk: `Pengurusan Mutasi Masuk (Ke-Jakarta) data KIR untuk kendaraan ${vehicle.plateNumber}. Proses perpindahan data uji KIR ke wilayah Jakarta.`,
      kir_mutasi_keluar: `Pengurusan Mutasi Keluar (Cabut Berkas) data KIR untuk kendaraan ${vehicle.plateNumber}. Proses pencabutan berkas uji KIR dari wilayah Jakarta.`,
      kir_balik_nama: `Pengurusan Balik Nama data KIR untuk kendaraan ${vehicle.plateNumber}. ⚠️ Catatan: Pengurusan balik nama KIR hanya dapat dilakukan bersamaan dengan proses Perpanjang Uji KIR atau Buka Blokir Data.`,
      kir_ganti_nopol: `Pengurusan Ganti Nopol data KIR untuk kendaraan ${vehicle.plateNumber}. ⚠️ Catatan: Pengurusan ganti nopol KIR hanya dapat dilakukan bersamaan dengan proses Perpanjang Uji KIR atau Buka Blokir Data.`,
    };

    return descriptions[serviceType] || "";
  };

  // Update description automatically when service type changes
  useEffect(() => {
    if (selectedVehicle && requestServiceType) {
      const newDesc = getDescriptionForServiceType(
        requestServiceType,
        selectedVehicle,
      );
      setRequestDesc(newDesc);
    }
  }, [requestServiceType, selectedVehicle]);

  // Auto-set chosen admin for SIM services based on company admin
  // DISABLED - Let automatic routing handle this
  /*
  useEffect(() => {
    if (
      ["bikin_sim_a", "bikin_sim_c", "perpanjang_sim_a", "perpanjang_sim_c"].includes(requestServiceType) &&
      !chosenAdminId
    ) {
      setChosenAdminId(company.adminId || "admin-1");
    }
  }, [requestServiceType, company.adminId]);
  */

  const handleOpenUrus = (vehicle) => {
    setSelectedVehicle(vehicle);
    setRequestLaporHilang(false);
    setRequestMediaNasional(false);
    setRequestSimService(null);
    setChosenAdminId(null);
    setRequestServiceType("");
    setRequestDesc("");
    setModalType("urus");
  };

  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();

    // Enforce membership vehicle quota
    const tierId = company.membershipTier || "free";
    if (!canAddVehicle(tierId, vehicles.length)) {
      const limit = getVehicleLimit(tierId);
      const tier = getTierConfig(tierId);
      alert(
        `Kuota armada untuk paket ${tier.name} adalah ${limit} kendaraan dan sudah penuh (${vehicles.length}/${limit}).\n\nSilakan ajukan upgrade paket di menu Membership untuk menambah kuota.`,
      );
      return;
    }

    if (
      !formData.ownerName ||
      !formData.plateNumber ||
      (!formData.testNumber && !formData.noJktBelumAda) ||
      !formData.kirExpiry ||
      !formData.stnkExpiry ||
      !formData.pajakExpiry
    )
      return;

    const isKartuKirOk =
      formData.kartuKirHilang ||
      formData.kartuKirMobilBaru ||
      formData.kartuKirBelumAda ||
      !!formData.kartuKirFile;
    const isSertifikatKirOk =
      formData.sertifikatKirHilang ||
      formData.sertifikatKirMobilBaru ||
      formData.sertifikatKirBelumAda ||
      !!formData.sertifikatKirFile;
    const isStnkOk =
      formData.stnkHilang || formData.stnkBelumAda || !!formData.stnkFile;

    if (!isKartuKirOk || !isSertifikatKirOk || !isStnkOk) {
      alert(
        "Harap unggah dokumen Kartu KIR, Sertifikat KIR, dan STNK terlebih dahulu (kecuali dinyatakan Mobil Baru / Hilang / Belum Ada).",
      );
      return;
    }

    const result = await createVehicle({
      companyId: clientId,
      plateNumber: formData.plateNumber.toUpperCase(),
      vehicleType: formData.vehicleType,
      testNumber: formData.noJktBelumAda ? "" : formData.testNumber,
      noJktBelumAda: !!formData.noJktBelumAda,
      kirExpiry: formData.kirExpiry,
      stnkExpiry: formData.stnkExpiry,
      pajakExpiry: formData.pajakExpiry,
      notes: formData.notes,
      // Legacy data mappings for backward compatibility
      ownerName:
        formData.ownerName ||
        formData.kkOwnerName ||
        formData.kirOwnerName ||
        formData.stnkOwnerName ||
        "",
      ownerAddress: formData.kkOwnerAddress || formData.stnkOwnerAddress || "",
      frameNumber: formData.kkFrameNumber || formData.stnkFrameNumber || "",
      engineNumber: formData.kkEngineNumber || formData.stnkEngineNumber || "",
      brand: formData.kirBrand || formData.stnkBrand || "",
      model: formData.stnkModel || "",
      yearManufactured: formData.stnkYearManufactured || "",
      // Data Kartu Kendaraan
      kkOwnerName: formData.kkOwnerName || "",
      kkOwnerAddress: formData.kkOwnerAddress || "",
      kkPlateNumber: formData.kkPlateNumber || "",
      kkFrameNumber: formData.kkFrameNumber || "",
      kkEngineNumber: formData.kkEngineNumber || "",
      kkTestNumber: formData.kkTestNumber || "",
      // Data Kartu KIR
      kirOwnerName: formData.kirOwnerName || "",
      kirPlateNumber: formData.kirPlateNumber || "",
      kirTestNumber: formData.kirTestNumber || "",
      kirVehicleType: formData.kirVehicleType || "Delvan",
      kirBrand: formData.kirBrand || "",
      // Data STNK
      stnkOwnerName: formData.stnkOwnerName || "",
      stnkPlateNumber: formData.stnkPlateNumber || "",
      stnkOwnerAddress: formData.stnkOwnerAddress || "",
      stnkBrand: formData.stnkBrand || "",
      stnkVehicleType: formData.stnkVehicleType || "",
      stnkVehicleJenis: formData.stnkVehicleJenis || "Delvan",
      stnkModel: formData.stnkModel || "",
      stnkYearManufactured: formData.stnkYearManufactured || "",
      stnkFrameNumber: formData.stnkFrameNumber || "",
      stnkEngineNumber: formData.stnkEngineNumber || "",
      kartuKirHilang: !!formData.kartuKirHilang,
      kartuKirMobilBaru: !!formData.kartuKirMobilBaru,
      kartuKirBelumAda: !!formData.kartuKirBelumAda,
      sertifikatKirHilang: !!formData.sertifikatKirHilang,
      sertifikatKirMobilBaru: !!formData.sertifikatKirMobilBaru,
      sertifikatKirBelumAda: !!formData.sertifikatKirBelumAda,
      kartuKirFileName:
        formData.kartuKirHilang ||
        formData.kartuKirMobilBaru ||
        formData.kartuKirBelumAda
          ? null
          : formData.kartuKirFile,
      sertifikatKirFileName:
        formData.sertifikatKirHilang ||
        formData.sertifikatKirMobilBaru ||
        formData.sertifikatKirBelumAda
          ? null
          : formData.sertifikatKirFile,
      stnkFileName:
        formData.stnkHilang || formData.stnkBelumAda ? null : formData.stnkFile,
      stnkHilang: !!formData.stnkHilang,
      stnkBelumAda: !!formData.stnkBelumAda,
    });

    setModalType(null);
    onUpdate();
  };

    const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (
      !formData.ownerName ||
      !formData.plateNumber ||
      (!formData.testNumber && !formData.noJktBelumAda) ||
      !formData.kirExpiry ||
      !formData.stnkExpiry ||
      !formData.pajakExpiry
    )
      return;

    const result = await updateVehicleSupabase(selectedVehicle.id, {
      plate_number: formData.plateNumber.toUpperCase(),
      jenis_kendaraan: formData.vehicleType,
      meta_data: {
        ...(selectedVehicle.meta_data || {}),
        noJktBelumAda: !!formData.noJktBelumAda,
        testNumber: formData.noJktBelumAda ? "" : formData.testNumber,
        kirExpiry: formData.kirExpiry,
        stnkExpiry: formData.stnkExpiry,
        pajakExpiry: formData.pajakExpiry,
        simDriverExpiry: formData.simDriverExpiry || null,
        notes: formData.notes || "",
        ownerName: formData.ownerName || "",
        ownerAddress: formData.kkOwnerAddress || formData.stnkOwnerAddress || "",
        frameNumber: formData.kkFrameNumber || formData.stnkFrameNumber || "",
        engineNumber: formData.kkEngineNumber || formData.stnkEngineNumber || "",
        brand: formData.kirBrand || formData.stnkBrand || "",
        model: formData.stnkModel || "",
        yearManufactured: formData.stnkYearManufactured || "",
        kkOwnerName: formData.kkOwnerName || "",
        kkOwnerAddress: formData.kkOwnerAddress || "",
        kkPlateNumber: formData.kkPlateNumber || "",
        kkFrameNumber: formData.kkFrameNumber || "",
        kkEngineNumber: formData.kkEngineNumber || "",
        kkTestNumber: formData.kkTestNumber || "",
        kirOwnerName: formData.kirOwnerName || "",
        kirPlateNumber: formData.kirPlateNumber || "",
        kirTestNumber: formData.kirTestNumber || "",
        kirVehicleType: formData.kirVehicleType || "Delvan",
        kirBrand: formData.kirBrand || "",
        stnkOwnerName: formData.stnkOwnerName || "",
        stnkPlateNumber: formData.stnkPlateNumber || "",
        stnkOwnerAddress: formData.stnkOwnerAddress || "",
        stnkBrand: formData.stnkBrand || "",
        stnkVehicleType: formData.stnkVehicleType || "",
        stnkVehicleJenis: formData.stnkVehicleJenis || "Delvan",
        stnkModel: formData.stnkModel || "",
        stnkYearManufactured: formData.stnkYearManufactured || "",
        stnkFrameNumber: formData.stnkFrameNumber || "",
        stnkEngineNumber: formData.stnkEngineNumber || "",
        kartuKirHilang: !!formData.kartuKirHilang,
        kartuKirMobilBaru: !!formData.kartuKirMobilBaru,
        kartuKirBelumAda: !!formData.kartuKirBelumAda,
        sertifikatKirHilang: !!formData.sertifikatKirHilang,
        sertifikatKirMobilBaru: !!formData.sertifikatKirMobilBaru,
        sertifikatKirBelumAda: !!formData.sertifikatKirBelumAda,
        stnkHilang: !!formData.stnkHilang,
        stnkBelumAda: !!formData.stnkBelumAda,
        kartuKirFileName:
          formData.kartuKirHilang ||
          formData.kartuKirMobilBaru ||
          formData.kartuKirBelumAda
            ? null
            : formData.kartuKirFile,
        sertifikatKirFileName:
          formData.sertifikatKirHilang ||
          formData.kartuKirMobilBaru ||
          formData.kartuKirBelumAda
            ? null
            : formData.sertifikatKirFile,
        stnkFileName:
          formData.stnkHilang || formData.stnkBelumAda ? null : formData.stnkFile,
      },
    });

    if (!result.success) {
      alert("Gagal mengupdate kendaraan: " + result.error);
      return;
    }

    setModalType(null);
    onUpdate();
  };
const handleDelete = async (id) => {
    if (
      confirm(
        "Hapus kendaraan ini dari armada? Seluruh dokumen dan order terikat akan ikut dihapus.",
      )
    ) {
      const result = await deleteVehicleSupabase(id);
      if (!result.success) {
        alert("Gagal menghapus kendaraan: " + result.error);
        return;
      }
      onUpdate();
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFileName) return;
    // Document storage to Supabase to be implemented via Edge Function
    alert(
      "Dokumen berhasil diunggah! Status dokumen saat ini: Menunggu Verifikasi Admin.",
    );
    setModalType(null);
    onUpdate();
  };

  // hidden file input ref for document upload
  const scanInputRef = useRef(null);

  const handleFileSelected = async (e, docType) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      await updateVehicleSupabase(selectedVehicle.id, {
        [`${docType}FileName`]: fileName,
      });
      setRescanDocType(null);
      onUpdate();
    }
  };

  const handleRescanDoc = (docType) => {
    if (scanInputRef.current) {
      scanInputRef.current.accept = ".jpeg,.jpg,.png,.pdf";
      scanInputRef.current.click();
    }
  };

  const handleUrusSubmit = async (e) => {
    e.preventDefault();

    if (!requestServiceType) {
      alert("Harap pilih jenis pengurusan yang ingin diajukan!");
      return;
    }

    // Calculate add-on costs
    let addOnCost = 0;
    let addOnDesc = "";

    if (requestLaporHilang) {
      addOnCost += 50000;
      addOnDesc += "\n• Bantu Urus Laporan Kehilangan Kepolisian (Rp 50.000)";
    }
    if (requestMediaNasional) {
      addOnCost += 50000;
      addOnDesc += "\n• Bantu Urus Media Nasional (Rp 50.000)";
    }
    if (requestSimService === "sim_baru") {
      addOnCost += 500000;
      addOnDesc += "\n• Pembuatan SIM A Baru (Rp 500.000)";
    }
    if (requestSimService === "sim_perpanjang") {
      addOnCost += 350000;
      addOnDesc += "\n• Perpanjangan SIM A (Rp 350.000)";
    }
    if (requestSimService === "sim_konsultasi") {
      addOnCost += 100000;
      addOnDesc += "\n• Konsultasi Pengurusan SIM Khusus (Rp 100.000)";
    }

    // Fallback prices (dipakai kalau harga dari Supabase belum ke-load)
    const fallbackCostMap = {
      kir_renewal: 350000,
      buka_blokir_kir: 1500000,
      balik_nama: 2000000,
      kir_uji_baru: 450000,
      kir_numpang_uji: 500000,
      kir_mutasi_masuk: 1800000,
      kir_mutasi_keluar: 1800000,
      kir_balik_nama: 1500000,
      kir_ganti_nopol: 1200000,
      balik_nama_stnk: 2250000,
      mutasi: 2500000,
      mutasi_masuk_stnk: 2500000,
      stnk_hilang: 600000,
      ganti_alamat: 800000,
      blokir_progresif: 250000,
      cek_fisik_bantuan: 400000,
      urus_e_tilang: 500000,
      cabut_berkas_stnk: 1800000,
      bikin_sim_a: 800000,
      bikin_sim_c: 600000,
      perpanjang_sim_a: 350000,
      perpanjang_sim_c: 300000,
    };
    // Prioritaskan harga dari database (servicePrices), fallback ke hardcode
    let baseCost =
      servicePrices[requestServiceType] ||
      fallbackCostMap[requestServiceType] ||
      350000;

    const serviceLabels = {
      kir_renewal: "Perpanjangan Uji KIR",
      kir_uji_baru: "Uji Baru KIR",
      kir_numpang_uji: "Numpang Uji KIR",
      kir_mutasi_masuk: "Mutasi Masuk (Ke-Jakarta)",
      kir_mutasi_keluar: "Mutasi Keluar (Cabut Berkas)",
      kir_balik_nama: "Balik Nama KIR",
      kir_ganti_nopol: "Ganti Nopol KIR",
      stnk_renewal: "Perpanjangan STNK",
      pajak_renewal: "Perpanjangan Pajak",
      buka_blokir_kir: "Buka Blokir KIR",
      balik_nama: "Balik Nama Kendaraan",
      multiple: "Pengurusan KIR & STNK",
      balik_nama_stnk: "Balik Nama STNK",
      mutasi: "Mutasi Kendaraan",
      mutasi_masuk_stnk: "Mutasi Masuk STNK",
      stnk_hilang: "STNK Hilang",
      ganti_alamat: "Ganti Alamat STNK",
      blokir_progresif: "Blokir Progresif Pajak",
      cek_fisik_bantuan: "Cek Fisik Bantuan",
      urus_e_tilang: "Urus E-Tilang",
      cabut_berkas_stnk: "Cabut Berkas STNK",
      bikin_sim_a: "Bikin SIM A",
      bikin_sim_c: "Bikin SIM C",
      perpanjang_sim_a: "Perpanjang SIM A",
      perpanjang_sim_c: "Perpanjang SIM C",
    };

    const requestPayload = {
      companyId: clientId,
      vehicleId: selectedVehicle.id,
      serviceType: requestServiceType,
      serviceTypeLabel: serviceLabels[requestServiceType] || "Pengurusan Jasa",
      description:
        requestDesc + (addOnDesc ? `\n\nLayanan Tambahan:${addOnDesc}` : ""),
      estimatedCost: baseCost + addOnCost,
      adminId: company.adminId || "admin-1", // Sertakan admin asal perusahaannya
    };

    const result = await createRequest(requestPayload);

    if (!result.success) {
      alert("Gagal membuat pengajuan layanan: " + result.error);
      return;
    }

    // Trigger admin notification
    createNotification({
      adminId: requestPayload.adminId,
      type: 'request_new',
      title: 'Request Baru',
      message: `${company.name} mengajukan ${requestPayload.serviceTypeLabel}`,
      priority: 'normal',
      referenceId: result.data?.id,
      referenceType: 'request',
      metaData: { companyName: company.name, serviceType: requestPayload.serviceType },
    });

    alert(
      'Pengajuan pengurusan berhasil dibuat! Silakan cek menu "Status Pengurusan" secara berkala.',
    );
    setModalType(null);
    onUpdate();
  };

  // Helper to get general status flag for row highlights
  const getOverallStatus = (v) => {
    const kirDays = getDaysRemaining(v.kirExpiry);
    const stnkDays = getDaysRemaining(v.stnkExpiry);
    const pajakDays = getDaysRemaining(v.pajakExpiry);
    const minDays = Math.min(kirDays, stnkDays, pajakDays);

    if (minDays <= 0) return { code: "danger", label: "Jatuh Tempo" };
    if (minDays <= 90) return { code: "warning", label: "Warning" };
    return { code: "success", label: "Aman" };
  };

  // Determine SIM requirements based on vehicle type and SIM expiry
  // Returns: null (not applicable) | 'sim_baru' | 'sim_perpanjang' | 'sim_konsultasi'
  const getSimRequirement = (vehicle) => {
    if (!vehicle || !vehicle.simDriverExpiry) return null;

    const simDays = getDaysRemaining(vehicle.simDriverExpiry);
    const type = (vehicle.vehicleType || "").toLowerCase();

    // Vehicle types that require SIM beyond A & C (heavy vehicles, buses, trailers)
    const heavyTypes = [
      "bus",
      "truck",
      "truck cde",
      "truck cdd",
      "light truck",
      "box",
      "truck wingbox",
      "truk gandeng",
      "kereta tempelan",
      "trailer",
    ];
    const isHeavy = heavyTypes.some((t) => type.includes(t) || type === t);

    if (isHeavy) {
      // These vehicles need SIM B1 or B2 - tidak bisa diproses otomatis
      return "sim_konsultasi";
    }

    // SIM A is for passenger vehicles < 3000kg (suitable for mobil/SUV/sedan)
    if (simDays <= 0) {
      // SIM sudah habis → perlu bikin baru
      return "sim_baru";
    } else if (simDays <= 90) {
      // SIM hampir habis → bisa diperpanjang
      return "sim_perpanjang";
    }

    return null;
  };

  // Export handlers
  const handleExportCSV = () => {
    const columns = [
      { key: 'plateNumber', label: 'Plat Nomor' },
      { key: 'vehicleType', label: 'Tipe Kendaraan' },
      { key: 'testNumber', label: 'Nomor Uji KIR' },
      { key: 'kirExpiry', label: 'Masa Berlaku KIR', format: (val) => formatDateLong(val) },
      { key: 'stnkExpiry', label: 'Masa Berlaku STNK', format: (val) => formatDateLong(val) },
      { key: 'pajakExpiry', label: 'Pajak Tahunan', format: (val) => formatDateLong(val) },
      { key: 'simDriverExpiry', label: 'Masa Berlaku SIM', format: (val) => formatDateLong(val) },
      { key: 'status', label: 'Status Kelayakan', format: (_, item) => getOverallStatus(item).label },
    ];
    exportToCSV(filteredVehicles, 'Data_Armada_Kendaraan', columns);
  };

  const handlePrint = () => {
    const tableHeaders = [
      'Plat Nomor', 'Tipe', 'No KIR', 'Expiry KIR', 'Expiry STNK', 'Pajak Tahunan', 'Status'
    ];
    const tableRowsHTML = filteredVehicles.map(v => `
      <tr>
        <td><strong>${v.plateNumber}</strong></td>
        <td>${v.vehicleType}</td>
        <td>${v.testNumber || '-'}</td>
        <td>${formatDateLong(v.kirExpiry)}</td>
        <td>${formatDateLong(v.stnkExpiry)}</td>
        <td>${formatDateLong(v.pajakExpiry)}</td>
        <td>${getOverallStatus(v).label}</td>
      </tr>
    `).join('');

    printData(`Data Armada Terdaftar - ${company?.name || ''}`, tableHeaders, tableRowsHTML);
  };

  // Note: getPlateRegion, isDataMismatch, getExpiryCardStyle are imported from
  // fleetHelpers.js and used via UrusSuratModal. No need to redefine here.

  return (
    <div className="fleet-card">
      {/* hidden file input for document upload */}
      <input
        type="file"
        ref={scanInputRef}
        accept=".jpeg,.jpg,.png,.pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          if (rescanDocType) {
            handleFileSelected(e, rescanDocType);
          }
        }}
      />
      <div className="table-controls">
        <input
          type="text"
          className="fleet-input table-search"
          placeholder="Cari plat nomor atau tipe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {(() => {
          const tierId = company.membershipTier || "free";
          const limit = getVehicleLimit(tierId);
          const isFull = limit !== null && vehicles.length >= limit;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {limit !== null && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: isFull ? "#b91c1c" : "#475569",
                    background: isFull ? "#fef2f2" : "#f1f5f9",
                    border: `1px solid ${isFull ? "#fecaca" : "#e2e8f0"}`,
                    padding: "6px 10px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap",
                  }}
                  title="Kuota armada paket Anda"
                >
                  Kuota: {vehicles.length}/{limit}
                </span>
              )}
              <button
                className="fleet-btn fleet-btn-primary"
                onClick={handleOpenAdd}
                disabled={isFull}
                title={
                  isFull ? "Kuota armada penuh — ajukan upgrade paket" : ""
                }
                style={isFull ? { opacity: 0.55, cursor: "not-allowed" } : {}}
              >
                ➕ Tambah Kendaraan
              </button>
            </div>
          );
        })()}
      </div>

      <div className="fleet-table-container">
        <table className="fleet-table">
          <thead>
            <tr>
              <th>Plat Nomor</th>
              <th>Tipe Armada</th>
              <th>Nomor KIR</th>
              <th>Masa Berlaku KIR</th>
              <th>Masa Berlaku STNK</th>
              <th>Pajak Tahunan</th>
              <th>SIM Driver</th>
              <th>Dokumen Diupload</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#6b7a96",
                  }}
                >
                  Tidak ada kendaraan armada terdaftar.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => {
                const overall = getOverallStatus(v);
                const vehicleDocs = docs.filter((d) => d.vehicleId === v.id);

                return (
                  <tr
                    key={v.id}
                    onClick={() => setVehicleDetailModal(v)}
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0fdf4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ fontWeight: "700" }}>{v.plateNumber}</td>
                    <td>{v.vehicleType}</td>
                    <td style={{ fontFamily: "monospace" }}>
                      {v.testNumber || "-"}
                    </td>
                    <td>
                      <span className={getDocStatus(v.kirExpiry).textClass}>
                        {formatDateLong(v.kirExpiry)} (
                        {getDaysRemaining(v.kirExpiry)} hari)
                      </span>
                    </td>
                    <td>
                      <span className={getDocStatus(v.stnkExpiry).textClass}>
                        {formatDateLong(v.stnkExpiry)}
                      </span>
                    </td>
                    <td>
                      <span className={getDocStatus(v.pajakExpiry).textClass}>
                        {formatDateLong(v.pajakExpiry)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          v.simDriverExpiry
                            ? getDocStatus(v.simDriverExpiry).textClass
                            : "badge-status neutral"
                        }
                      >
                        {v.simDriverExpiry || "-"}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="fleet-btn fleet-btn-secondary fleet-btn-sm"
                          style={{
                            padding: "4px 12px",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            background: "#eff6ff",
                            color: "#1e40af",
                            border: "1px solid #bfdbfe",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicle(v);
                            setModalType("dokumen");
                          }}
                        >
                          📄 Dokumen Diupload
                        </button>
                        {v.kartuKirHilang && (
                          <span style={{ fontSize: "10px", color: "#dc2626" }}>
                            ⚠️ Ada dokumen hilang
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${overall.code}`}>
                        {overall.label}
                      </span>
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {(overall.code === "warning" ||
                          overall.code === "danger") && (
                          <button
                            className="fleet-btn fleet-btn-accent fleet-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUrus(v);
                            }}
                          >
                            URUS SEKARANG
                          </button>
                        )}
                        <button
                          className="fleet-btn fleet-btn-secondary fleet-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(v);
                          }}
                          title="Edit Kendaraan"
                        >
                          ✏️
                        </button>
                        <button
                          className="fleet-btn fleet-btn-danger fleet-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(v.id);
                          }}
                          title="Hapus"
                          style={{ padding: "6px" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals are now extracted into VehiclesViewModals directory */}
      <AddEditVehicleModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setModalType(null)}
        onSubmit={modalType === "add" ? handleAddSubmit : handleEditSubmit}
      />

      <UploadDocModal
        isOpen={modalType === "upload"}
        vehicle={selectedVehicle}
        uploadDocType={uploadDocType}
        setUploadDocType={setUploadDocType}
        uploadFileName={uploadFileName}
        setUploadFileName={setUploadFileName}
        onClose={() => setModalType(null)}
        onSubmit={handleUploadSubmit}
      />

      <UrusSuratModal
        isOpen={modalType === "urus"}
        vehicle={selectedVehicle}
        company={company}
        servicePrices={servicePrices}
        requestServiceType={requestServiceType}
        setRequestServiceType={setRequestServiceType}
        requestDesc={requestDesc}
        setRequestDesc={setRequestDesc}
        requestLaporHilang={requestLaporHilang}
        setRequestLaporHilang={setRequestLaporHilang}
        requestMediaNasional={requestMediaNasional}
        setRequestMediaNasional={setRequestMediaNasional}
        requestSimService={requestSimService}
        setRequestSimService={setRequestSimService}
        onClose={() => setModalType(null)}
        onSubmit={handleUrusSubmit}
      />

      <DokumenModal
        isOpen={modalType === "dokumen"}
        vehicle={selectedVehicle}
        onClose={() => setModalType(null)}
        onPreviewClick={setPreviewDoc}
        onRescanClick={(type) => {
          setRescanDocType(type);
          handleRescanDoc(type);
        }}
      />

      <PreviewDokumenModal
        doc={previewDoc}
        vehicle={selectedVehicle}
        onClose={() => setPreviewDoc(null)}
      />

      <VehicleDetailModal
        vehicle={vehicleDetailModal}
        onClose={() => setVehicleDetailModal(null)}
        onUrusClick={(v) => {
          setVehicleDetailModal(null);
          setSelectedVehicle(v);
          setRequestServiceType("");
          setRequestDesc("");
          setRequestLaporHilang(false);
          setRequestMediaNasional(false);
          setRequestSimService(null);
          setModalType("urus");
        }}
        onEditClick={(v) => {
          setVehicleDetailModal(null);
          handleOpenEdit(v);
        }}
      />
    </div>
  );
}