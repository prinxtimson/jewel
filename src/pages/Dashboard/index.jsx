import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import MainContainer from "../../layouts/MainContainer";
import { getAllBooking } from "../../lib/appwrite";
import { Download } from "lucide-react";
import moment from "moment";

const index = () => {
  const toastRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    cancelled: 0,
  });

  const [chartData, setChartData] = useState([
    { name: "Approved", value: stats.approved, color: "#22c55e" },
    { name: "Rejected", value: stats.rejected, color: "#ef4444" },
    { name: "Pending", value: stats.pending, color: "#06b6d4" },
    { name: "Cancelled", value: stats.cancelled, color: "#f97316" },
  ]);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    handleGetLeaveApplication();
  }, []);

  const handleGetLeaveApplication = async () => {
    try {
      const res = await getAllBooking();
      const counts = res.rows.reduce(
        (acc, cur) => {
          if (cur.status == "pending") acc.pending++;
          if (cur.status == "rejected") acc.rejected++;
          if (cur.status == "approved") acc.approved++;
          if (cur.status == "cancelled") acc.cancelled++;
          return acc;
        },
        { approved: 0, rejected: 0, pending: 0, cancelled: 0 },
      );

      setStats({ ...counts, total: res.total });
      setChartData([
        { name: "Approved", value: counts.approved, color: "#22c55e" },
        { name: "Rejected", value: counts.rejected, color: "#ef4444" },
        { name: "Pending", value: counts.pending, color: "#06b6d4" },
        { name: "Cancelled", value: counts.cancelled, color: "#f97316" },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: error,
        life: 3000,
        onHide: () => setError(null),
      });
    }
  }, [error]);

  const exportToExcel = (fileName) => {
    const logsData = logs.map((val) => ({ ...val, user: val.user.name }));
    // Create a new workbook and a worksheet from JSON data
    const worksheet = XLSX.utils.json_to_sheet(logsData);
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Write the workbook to a file and save it
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const userBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <Avatar
          label={`${rowData.user?.name?.split(" ")[0]?.charAt(0)}${rowData.user?.name?.split(" ")[1]?.charAt(0)}`}
          shape="circle"
          style={{ backgroundColor: "#6a008e", color: "#ffffff" }}
        />
        <span>{rowData.user?.name}</span>
      </div>
    );
  };

  const dateBodyTemplate = (rowData) => {
    return <div className="">{moment(rowData.$createdAt).format("ll")}</div>;
  };

  return (
    <MainContainer toast={toastRef}>
      <div className="p-4 animate-fadeIn">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Pending Appointment",
              value: stats.pending,
              icon: "fa-bullseye",
              color: "text-amber-600",
            },
            {
              label: "Approved Appointment",
              value: stats.approved,
              icon: "fa-smile",
              color: "text-green-600",
            },
            {
              label: "Cancelled Appointment",
              value: stats.cancelled,
              icon: "fa-frown",
              color: "text-red-600",
            },
            {
              label: "Rejected Appointment",
              value: stats.rejected,
              icon: "fa-frown",
              color: "text-red-600",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.label}
                </span>
                <i className={`fas ${item.icon} ${item.color} text-sm`}></i>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1  gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm text-center font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Booking Application
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm text-center font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Volume Distribution
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          <div className="flex items-center justify-between"></div>

          {/* <div className="grid grid-cols-1 gap-4 h-full">
            <div className="relative h-[26vh] overflow-auto">
              <div className="h-full border border-slate-200 bg-white rounded-md">
                <DataTable
                  value={logs}
                  paginator
                  rows={20}
                  totalRecords={logs.length}
                  loading={isLoading}
                  breakpoint="0px"
                  tableStyle={{ minWidth: "50rem" }}
                  dataKey="$id"
                  stripedRows
                >
                  <Column field="$id" header="ID"></Column>
                  <Column
                    field="actionType"
                    header="Action Type"
                    style={{ minWidth: "8rem" }}
                  ></Column>
                  <Column
                    field="entityType"
                    header="Entity Type"
                    style={{ minWidth: "10rem" }}
                  ></Column>
                  <Column
                    field="user"
                    header="User"
                    style={{ minWidth: "10rem" }}
                    body={userBodyTemplate}
                  ></Column>
                  <Column
                    field="details"
                    header="Details"
                    style={{ minWidth: "15rem" }}
                  ></Column>

                  <Column field="location" header="Location"></Column>
                  <Column
                    field="$createdAt"
                    header="TimeStamp"
                    style={{ minWidth: "10rem" }}
                    body={dateBodyTemplate}
                  ></Column>
                </DataTable>
              </div>
            </div>
          </div>*/}
        </div>
      </div>
    </MainContainer>
  );
};

export default index;
