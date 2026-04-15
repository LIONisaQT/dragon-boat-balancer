import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "./CrewList.scss";
import { Crew } from "../../types";
import { sampleCrew } from "../../utils/sample-crew";
import { Dispatch, SetStateAction, useState } from "react";

type CrewTableProps = {
  data: Crew[];
  setCrewIds: Dispatch<SetStateAction<string[]>>;
  onView?: (crew: Crew) => void;
  onCopy?: (crew: Crew) => void;
  onDelete?: (crewId: string) => void;
  onCreate?: (crew?: Crew) => void;
};

export default function CrewList({
  data,
  setCrewIds,
  onView,
  onCopy,
  onDelete,
  onCreate,
}: CrewTableProps) {
  const [crewId, setCrewId] = useState("");

  const submitCrewId = () => {
    // Basic UUID v4 validation
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidV4Regex.test(crewId)) {
      alert(`Invalid crew ID format: ${crewId}`);
      return;
    }

    setCrewIds((prev) => [...prev, crewId]);
  };

  const copyCrewIdToClipboard = async (crewId: string) => {
    try {
      await navigator.clipboard.writeText(crewId);
    } catch (err) {
      console.error("Failed to copy crew ID:", crewId, err);
    }
  };

  const columns: ColumnDef<Crew>[] = [
    {
      accessorKey: "name",
      header: "Crew name",
      cell: ({ row }) => (
        <button
          onClick={() => onView?.(row.original)}
          className="crew-name-button"
          title={`View ${row.original.name}`}
        >
          <p>{row.original.name}</p>
        </button>
      ),
    },
    {
      accessorFn: (crew) =>
        crew.roster.length +
        crew.leftSide.filter((p) => p !== null).length +
        crew.rightSide.filter((p) => p !== null).length +
        (crew.drum ? 1 : 0) +
        (crew.steer ? 1 : 0),
      id: "numPaddlers",
      header: "#",
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="actions">
          <button
            onClick={() => copyCrewIdToClipboard(row.original.id)}
            title="Copy"
            className="copy"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </button>
          <button
            onClick={() => onCopy?.(row.original)}
            title="Duplicate"
            className="duplicate"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button
            onClick={() => onDelete?.(row.original.id)}
            title="Delete"
            className="delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="crew-list">
      <table className="crew-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="table-header"
                >
                  <div className="header-text-container">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {{
                      asc: (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="19" x2="12" y2="5"></line>
                          <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                      ),
                      desc: (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                      ),
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="table-row">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="table-data">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <section className="button-group">
        <button onClick={() => onCreate?.()}>New empty crew</button>
        <button onClick={() => onCreate?.(sampleCrew)}>New sample crew</button>
        <div className="id-input-container">
          <input
            type="text"
            placeholder="Crew ID"
            onChange={(e) => setCrewId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitCrewId();
              }
            }}
          />
          <button onClick={submitCrewId}>﹢</button>
        </div>
      </section>
    </div>
  );
}
