import { useEffect, useState, useRef } from "react";
import { Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import moment from "moment";

import MainContainer from "../../layouts/MainContainer";
import { deleteUser, getAllUsers } from "../../lib/appwrite";
import AddNewUser from "./AddNewUser";

const index = () => {
  const toastRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState();
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const { user } = useSelector((state) => state.auth);

  const handleGetAllUser = async () => {
    try {
      const res = await getAllUsers();

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
      handleGetAllUser();
      toastRef.current.show({
        severity: "success",
        summary: "Success",
        detail: msg,
        life: 3000,
        onHide: () => setMsg(null),
      });
    }
  }, [error, msg]);

  useEffect(() => {
    handleGetAllUser();
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex flex-col gap-2 sm:flex-row justify-between">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search"> </InputIcon>
          <InputText
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Keyword Search"
            className="w-full"
          />
        </IconField>
        <div className="">
          <Button
            icon="pi pi-plus"
            label="Add User"
            onClick={() => setVisible(true)}
            className="w-full"
            pt={{
              root: {
                className: "bg-[#cc5500]",
              },
            }}
          />
        </div>
      </div>
    );
  };

  const header = renderHeader();

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-1 items-center text-[#f8fafc]">
        {user.labels?.includes("admin") &&
          !rowData.labels?.includes("admin") && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `You are about to delete this user are you sure?`,
                  )
                ) {
                  deleteUser(rowData.$id);
                }
              }}
              className="p-2 bg-red-100 text-red-600 rounded-full transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
      </div>
    );
  };

  const handleOnHide = () => {
    setVisible(false);
  };

  const roleBodyTemplate = (rowData) => (
    <div className="text-center">
      {rowData.labels?.includes("admin") ? "Super Admin" : "Admin"}
    </div>
  );

  const statusBodyTemplate = (rowData) => (
    <div className="">{rowData.deleted_at ? "Inactive" : "Active"}</div>
  );

  const registeredBodyTemplate = (rowData) => (
    <div className="">{moment(rowData.created_at).format("ll")}</div>
  );

  return (
    <MainContainer toast={toastRef}>
      <div className="h-full flex flex-col px-5 py-8">
        <AddNewUser
          visible={visible}
          handleOnHide={handleOnHide}
          setError={setError}
          setMsg={setMsg}
        />
        <div className="shadow-md rounded-lg p-2 bg-white border border-slate-200">
          <div className="w-full rounded">
            <DataTable
              value={data}
              paginator
              rows={20}
              totalRecords={total}
              breakpoint="0px"
              tableStyle={{ minWidth: "50rem" }}
              dataKey="$id"
              stripedRows
              header={header}
            >
              <Column field="$id" header="ID"></Column>
              <Column
                field="name"
                header="Fullname"
                style={{ minWidth: "10rem" }}
              ></Column>
              <Column field="email" header="Email"></Column>
              <Column field="phone" header="Phone"></Column>
              <Column
                field="role"
                header="Role"
                body={roleBodyTemplate}
                align="center"
                style={{ minWidth: "8rem" }}
              ></Column>

              <Column
                field="created_at"
                header="Created At"
                style={{ minWidth: "10rem" }}
                body={registeredBodyTemplate}
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
