import { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { X, Download, FileText, Share2, CheckCircle2 } from "lucide-react";

export default function ReceiptModal({ transaction, onClose }) {
  const receiptRef = useRef(null);
  if (!transaction) return null;

  const isCredit = transaction.transaction_type === "CREDIT";
  const amountFormatted = parseFloat(transaction.amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  });
  const meta = transaction.meta_data || {};

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `NOHASub_Receipt_${transaction.reference || "tx"}.png`;
      link.click();
    } catch {
      alert("Failed to generate receipt image.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`NOHASub_Receipt_${transaction.reference || "tx"}.pdf`);
    } catch {
      alert("Failed to generate receipt PDF.");
    }
  };

  const handleShare = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `NOHASub_Receipt_${transaction.reference}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "NOHASub Receipt", text: `Receipt for ${transaction.description}`, files: [file] });
        } else {
          handleDownloadImage();
        }
      });
    } catch {
      handleDownloadImage();
    }
  };

  const Row = ({ label, value, mono = false }) => (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className={`max-w-[60%] text-right font-semibold text-slate-900 ${mono ? "font-mono text-xs sm:text-sm" : ""}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transaction Receipt</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {/* PRINTABLE RECEIPT PAPER (Always White) */}
          <div ref={receiptRef} className="rounded-2xl border border-slate-200 p-5 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
            <div className="mb-5 text-center">
              <div className="text-2xl font-extrabold tracking-tight" style={{ color: "#0f172a" }}>
                NOHA<span style={{ color: "#10b981" }}>Sub</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: "#64748b" }}>Official Transaction Receipt</p>
            </div>

            <div className={`mb-5 rounded-2xl p-4 text-center ${isCredit ? "bg-[#f0fdf4]" : "bg-[#f8fafc]"}`}>
              <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#15803d]">
                <CheckCircle2 size={12} /> {transaction.status || "Successful"}
              </div>
              <div className="text-3xl font-extrabold" style={{ color: "#0f172a" }}>
                {isCredit ? "+" : "-"}₦{amountFormatted}
              </div>
              <p className="mt-1 text-sm" style={{ color: "#475569" }}>{transaction.description}</p>
            </div>

            {meta.meter_token && (
              <div className="mb-5 rounded-2xl border-2 border-dashed border-[#60a5fa] bg-[#eff6ff] p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1e40af]">Prepaid Electricity Token</p>
                <p className="mt-2 font-mono text-lg font-extrabold tracking-wider text-[#1d4ed8] sm:text-xl">{meta.meter_token}</p>
                {meta.units && <p className="mt-1 text-xs text-[#475569]">Units: <span className="font-semibold" style={{ color: "#0f172a" }}>{meta.units}</span></p>}
              </div>
            )}

            <div>
              <Row label="Reference" value={transaction.reference || "N/A"} mono />
              <Row label="Date & Time" value={transaction.date || "N/A"} />
              <Row label="Service Type" value={transaction.service_type || transaction.transaction_type || "N/A"} />
              {meta.phone_number && <Row label="Recipient Phone" value={meta.phone_number} />}
              {meta.iuc_number && <Row label="Smartcard / IUC" value={meta.iuc_number} mono />}
              {meta.meter_number && <Row label="Meter Number" value={meta.meter_number} mono />}
              {meta.network && <Row label="Network" value={meta.network} />}
              {meta.plan_name && <Row label="Plan" value={meta.plan_name} />}
              <Row label="Amount" value={`₦${parseFloat(transaction.amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`} />
              {transaction.fee && parseFloat(transaction.fee) > 0 && <Row label="Fee" value={`₦${parseFloat(transaction.fee).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`} />}
              <Row label="Payment Method" value="NOHASub Wallet" />
            </div>

            <div className="mt-5 border-t border-dashed border-slate-200 pt-4 text-center">
              <p className="text-xs" style={{ color: "#64748b" }}>Thank you for using NOHASub</p>
            </div>
          </div>

          {/* Action Buttons (Dark Mode Aware) */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={handleDownloadImage} className="inline-flex justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <Download size={16} /> Image
            </button>
            <button onClick={handleDownloadPDF} className="inline-flex justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <FileText size={16} /> PDF
            </button>
          </div>
          <button onClick={handleShare} className="mt-2 flex w-full justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700">
            <Share2 size={16} /> Share Receipt
          </button>
        </div>
      </div>
    </div>
  );
}