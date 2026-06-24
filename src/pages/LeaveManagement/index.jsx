import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { SquarePen, Check, X } from "lucide-react";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import moment from "moment";

import MainContainer from "../../layouts/MainContainer";
import { approveLeaveApplication, getAllBooking } from "../../lib/appwrite";
import LeaveEditModal from "./LeaveEditModal";

const index = () => {
  const toastRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    handleGetLeaveApplication();
  }, []);

  const handleGetLeaveApplication = async () => {
    try {
      const res = await getAllBooking();
      setData(res.rows);
      setTotal(res.total);
      setIsLoading(false);
    } catch (error) {
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

    if (msg) {
      handleGetLeaveApplication();
      toastRef.current.show({
        severity: "success",
        summary: "Success",
        detail: msg,
        life: 3000,
        onHide: () => setMsg(null),
      });
    }
  }, [error, msg]);

  const getSeverity = (status) => {
    switch (status) {
      case "rejected":
        return "danger";

      case "approved":
        return "success";

      case "pending":
        return "info";

      case "cancelled":
        return "warning";
    }
  };

  const getLeaveType = (type) => {
    switch (type) {
      case "sickLeave":
        return "Sick Leave";

      case "annualLeave":
        return "Annual Leave";

      case "casualLeave":
        return "Casual Leave";

      case "maternityLeave":
        return "Maternity Leave";
    }
  };

  const approveLeave = async (row, status) => {
    try {
      const res = await approveLeaveApplication({
        ...row,
        status: status,
        admin: user.$id,
        approveAt: new Date(),
      });

      let ind = data.findIndex((val) => val.$id == row.$id);
      let rows = [...data];
      rows.splice(ind, 1, res);
      setData([...rows]);
      setMsg("Appointment updated successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-1 items-center text-[#f8fafc]">
        <button
          disabled={
            rowData.status !== "pending" || rowData.status == "approved"
          }
          onClick={() => approveLeave(rowData, "approved")}
          className="p-2 bg-green-50 text-green-600 rounded-full  transition-colors cursor-pointer"
          title="Approved"
        >
          <Check className="w-4 h-4" />
        </button>

        <button
          disabled={
            rowData.status !== "pending" || rowData.status == "rejected"
          }
          onClick={() => approveLeave(rowData, "rejected")}
          className="p-2 bg-rose-50 text-rose-600 rounded-full transition-colors cursor-pointer"
          title="Rejected"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const leaveTypeBodyTemplate = (rowData) => {
    return <div className="">{getLeaveType(rowData.leaveType)}</div>;
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
    );
  };

  const dateBodyTemplate = (date) => {
    if (date) {
      return <div className="">{moment(date).format("ll")}</div>;
    }
    return;
  };

  const userBodyTemplate = (user) => {
    if (!user || !user.name) return;
    return (
      <div className="flex align-items-center gap-2">
        <Avatar
          label={`${user?.name?.split(" ")[0]?.charAt(0)}${user?.name?.split(" ")[1]?.charAt(0)}`}
          shape="circle"
          style={{ backgroundColor: "#6a008e", color: "#ffffff" }}
        />
        <span>{user?.name}</span>
      </div>
    );
  };

  const handleOnHide = () => {
    setVisible(false);
    setSelectedLeave(null);
  };

  return (
    <MainContainer toast={toastRef}>
      <div className="h-full flex flex-col p-5">
        <LeaveEditModal
          visible={visible}
          handleOnHide={handleOnHide}
          payload={selectedLeave}
          setError={setError}
          setMsg={setMsg}
        />
        <div className=" shadow-md rounded-lg p-2 bg-white border border-slate-200">
          <div className="w-full rounded">
            <DataTable
              value={data}
              paginator
              rows={10}
              totalRecords={total}
              loading={isLoading}
              breakpoint="0px"
              tableStyle={{ minWidth: "50rem" }}
              dataKey="$id"
              stripedRows
              size="small"
              //header={header}
            >
              <Column field="$id" header="ID"></Column>
              <Column
                field="name"
                header="Name"
                style={{ minWidth: "10rem" }}
              ></Column>
              <Column
                field="email"
                header="Email"
                style={{ minWidth: "10rem" }}
              ></Column>
              <Column
                field="type"
                header="Type"
                align="center"
                style={{ minWidth: "10rem" }}
              ></Column>
              <Column
                field="department"
                header="Department"
                style={{ minWidth: "10rem" }}
              ></Column>
              <Column
                field="date"
                header="Date"
                style={{ minWidth: "10rem" }}
                body={(row) => dateBodyTemplate(row.date)}
              ></Column>
              <Column
                field="time"
                header="Time"
                style={{ minWidth: "10rem" }}
              ></Column>
              <Column
                field="status"
                header="Status"
                body={statusBodyTemplate}
              ></Column>
              <Column
                field="createdAt"
                header="Submitted At"
                style={{ minWidth: "10rem" }}
                body={(row) => dateBodyTemplate(row.$createdAt)}
              ></Column>
              <Column header="Action" body={actionBodyTemplate}></Column>
            </DataTable>
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default index;
