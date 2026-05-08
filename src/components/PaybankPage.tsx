import React from 'react';

const headingClass = 'text-xl font-bold text-primary sm:text-2xl';
const tableHeaderClass =
  'border border-white/25 bg-primary px-2 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white sm:px-3';
const inputClass =
  'h-9 w-full min-w-[5rem] rounded border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30';
const cellClass = 'border border-slate-200 bg-white px-2 py-2 align-middle';

function IconEdit({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="rounded border border-slate-200 p-1.5 text-primary transition hover:bg-slate-50"
        title="Edit"
        aria-label="Edit row"
      >
        <IconEdit />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded border border-slate-200 p-1.5 text-red-600 transition hover:bg-red-50"
        title="Delete"
        aria-label="Delete row"
      >
        <IconTrash />
      </button>
    </div>
  );
}

function SectionFooter({
  onSave,
  onAddRow,
}: {
  onSave: () => void;
  onAddRow: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap justify-end gap-3">
      <button
        type="button"
        onClick={onSave}
        className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      >
        Save Details
      </button>
      <button
        type="button"
        onClick={onAddRow}
        className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        + Add Row
      </button>
    </div>
  );
}

type BankDetailRow = {
  id: string;
  bankNameUpi: string;
  accountNumber: string;
  ifsc: string;
  micr: string;
  city: string;
  country: string;
};

type SwiftRow = {
  id: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  city: string;
  country: string;
};

type QrRow = {
  id: string;
  qrFileName: string;
  upiId: string;
  country: string;
};

let idSeq = 0;
function nextId() {
  idSeq += 1;
  return `row-${idSeq}`;
}

export const PaybankPage: React.FC = () => {
  const [bankRows, setBankRows] = React.useState<BankDetailRow[]>(() => [
    {
      id: nextId(),
      bankNameUpi: '',
      accountNumber: '',
      ifsc: '',
      micr: '',
      city: '',
      country: '',
    },
  ]);

  const [swiftRows, setSwiftRows] = React.useState<SwiftRow[]>(() => [
    {
      id: nextId(),
      bankName: '',
      accountNumber: '',
      iban: '',
      swift: '',
      city: '',
      country: '',
    },
  ]);

  const [qrRows, setQrRows] = React.useState<QrRow[]>(() => [
    {
      id: nextId(),
      qrFileName: '',
      upiId: '',
      country: '',
    },
  ]);

  const updateBank = (id: string, patch: Partial<Omit<BankDetailRow, 'id'>>) => {
    setBankRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const updateSwift = (id: string, patch: Partial<Omit<SwiftRow, 'id'>>) => {
    setSwiftRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const updateQr = (id: string, patch: Partial<Omit<QrRow, 'id'>>) => {
    setQrRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  return (
    <div className="w-full space-y-12">
      {/* Bank Details */}
      <section>
        <h2 className={`mb-4 ${headingClass}`}>Bank Details</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Bank Name / UPI</th>
                <th className={tableHeaderClass}>Account Number</th>
                <th className={tableHeaderClass}>IFSC Code</th>
                <th className={tableHeaderClass}>MICR Code</th>
                <th className={tableHeaderClass}>City</th>
                <th className={tableHeaderClass}>Country</th>
                <th className={`${tableHeaderClass} w-[100px] text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bankRows.map((row) => (
                <tr key={row.id}>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.bankNameUpi}
                      onChange={(e) =>
                        updateBank(row.id, { bankNameUpi: e.target.value })
                      }
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.accountNumber}
                      onChange={(e) =>
                        updateBank(row.id, { accountNumber: e.target.value })
                      }
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.ifsc}
                      onChange={(e) => updateBank(row.id, { ifsc: e.target.value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.micr}
                      onChange={(e) => updateBank(row.id, { micr: e.target.value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.city}
                      onChange={(e) => updateBank(row.id, { city: e.target.value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.country}
                      onChange={(e) =>
                        updateBank(row.id, { country: e.target.value })
                      }
                    />
                  </td>
                  <td className={`${cellClass} text-center`}>
                    <ActionButtons
                      onEdit={() => {}}
                      onDelete={() =>
                        setBankRows((rows) =>
                          rows.length > 1
                            ? rows.filter((r) => r.id !== row.id)
                            : rows,
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionFooter
          onSave={() => {}}
          onAddRow={() =>
            setBankRows((rows) => [
              ...rows,
              {
                id: nextId(),
                bankNameUpi: '',
                accountNumber: '',
                ifsc: '',
                micr: '',
                city: '',
                country: '',
              },
            ])
          }
        />
      </section>

      {/* Swift Bank Details */}
      <section>
        <h2 className={`mb-4 ${headingClass}`}>Swift Bank Details</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[780px] border-collapse text-sm">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Bank Name</th>
                <th className={tableHeaderClass}>Account Number</th>
                <th className={tableHeaderClass}>IBAN No.</th>
                <th className={tableHeaderClass}>SWIFT Code</th>
                <th className={tableHeaderClass}>City</th>
                <th className={tableHeaderClass}>Country</th>
                <th className={`${tableHeaderClass} w-[100px] text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {swiftRows.map((row) => (
                <tr key={row.id}>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.bankName}
                      onChange={(e) =>
                        updateSwift(row.id, { bankName: e.target.value })
                      }
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.accountNumber}
                      onChange={(e) =>
                        updateSwift(row.id, { accountNumber: e.target.value })
                      }
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.iban}
                      onChange={(e) => updateSwift(row.id, { iban: e.target.value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.swift}
                      onChange={(e) => updateSwift(row.id, { swift: e.target.value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.city}
                      onChange={(e) => updateSwift(row.id, { city: e.target.value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.country}
                      onChange={(e) =>
                        updateSwift(row.id, { country: e.target.value })
                      }
                    />
                  </td>
                  <td className={`${cellClass} text-center`}>
                    <ActionButtons
                      onEdit={() => {}}
                      onDelete={() =>
                        setSwiftRows((rows) =>
                          rows.length > 1
                            ? rows.filter((r) => r.id !== row.id)
                            : rows,
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionFooter
          onSave={() => {}}
          onAddRow={() =>
            setSwiftRows((rows) => [
              ...rows,
              {
                id: nextId(),
                bankName: '',
                accountNumber: '',
                iban: '',
                swift: '',
                city: '',
                country: '',
              },
            ])
          }
        />
      </section>

      {/* Country QR */}
      <section>
        <h2 className={`mb-4 ${headingClass}`}>Country QR</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr>
                <th className={tableHeaderClass}>QR Code</th>
                <th className={tableHeaderClass}>UPI ID</th>
                <th className={tableHeaderClass}>Country</th>
                <th className={`${tableHeaderClass} w-[100px] text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qrRows.map((row) => (
                <tr key={row.id}>
                  <td className={cellClass}>
                    <label className="block">
                      <span className="sr-only">Choose QR image file</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full max-w-[220px] cursor-pointer text-xs text-slate-600 file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-800 hover:file:bg-slate-200"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          updateQr(row.id, {
                            qrFileName: f ? f.name : '',
                          });
                        }}
                      />
                    </label>
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.upiId}
                      onChange={(e) => updateQr(row.id, { upiId: e.target.value })}
                    />
                  </td>
                  <td className={cellClass}>
                    <input
                      className={inputClass}
                      value={row.country}
                      onChange={(e) =>
                        updateQr(row.id, { country: e.target.value })
                      }
                    />
                  </td>
                  <td className={`${cellClass} text-center`}>
                    <ActionButtons
                      onEdit={() => {}}
                      onDelete={() =>
                        setQrRows((rows) =>
                          rows.length > 1
                            ? rows.filter((r) => r.id !== row.id)
                            : rows,
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionFooter
          onSave={() => {}}
          onAddRow={() =>
            setQrRows((rows) => [
              ...rows,
              {
                id: nextId(),
                qrFileName: '',
                upiId: '',
                country: '',
              },
            ])
          }
        />
      </section>
    </div>
  );
};
