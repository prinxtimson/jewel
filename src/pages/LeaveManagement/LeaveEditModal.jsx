import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { approveLeaveApplication } from "../../lib/appwrite";

const LeaveEditModal = ({
  visible,
  handleOnHide,
  payload,
  setError,
  setMsg,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    status: "",
    user: "",
    admin: "",
    comment: "",
  });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (payload) {
      setData({
        $id: payload.$id,
        leaveType: payload.leaveType,
        startDate: new Date(payload.startDate).toDateString() || "",
        endDate: new Date(payload.endDate).toDateString() || "",
        status: payload.status,
        user: payload.user?.name || "",
        admin: payload.admin?.name || "",
        comment: payload.comment || "",
      });
    }
  }, [payload]);

  const handleOnClose = () => {
    setData({
      leaaveType: "",
      startDate: "",
      endDate: "",
      status: "",
      user: "",
      admin: "",
      comment: "",
    });
    handleOnHide();
  };

  const handleOnChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await approveLeaveApplication({
        ...data,
        admin: user.$id,
        approveAt: new Date(),
      });

      setMsg("Leave application updated successfully");
      handleOnClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleOnClose}
      className=" "
      header="Leave Application"
    >
      <div className="p-5 w-full sm:w-[35rem]">
        <form onSubmit={onSubmit} className="p-fluid flex flex-col gap-6">
          <div className="field">
            <span className="p-float-label ">
              <InputText
                value={data.leaveType}
                readOnly
                className="p-3 border"
              />
              <label htmlFor="leaveType" className="">
                Leave Type
              </label>
            </span>
          </div>

          <div className="field">
            <span className="p-float-label ">
              <InputText
                value={data.startDate}
                readOnly
                className="p-3 border"
              />
              <label htmlFor="startDate" className="">
                Start Date
              </label>
            </span>
          </div>

          <div className="field">
            <span className="p-float-label ">
              <InputText value={data.endDate} readOnly className="p-3 border" />
              <label htmlFor="endDate" className="">
                End Date
              </label>
            </span>
          </div>
          <div className="field">
            <span className="p-float-label ">
              <InputText value={data.user} readOnly className="p-3 border" />
              <label htmlFor="user" className="">
                User
              </label>
            </span>
          </div>
          <div className="field">
            <span className="p-float-label ">
              <Dropdown
                name="status"
                value={data.status}
                onChange={handleOnChange}
                options={STATUS}
                optionLabel="label"
                optionValue="value"
                className="w-full p- border"
                required
              />
              <label htmlFor="status" className="">
                Status
              </label>
            </span>
          </div>
          <div className="field">
            <span className="p-float-label ">
              <InputText value={data.admin} readOnly className="p-3 border" />
              <label htmlFor="admin" className="">
                Approved By
              </label>
            </span>
          </div>
          <div className="field">
            <span className="p-float-label ">
              <InputTextarea
                name="comment"
                value={data.comment}
                rows={3}
                className="p-3 border"
                onChange={handleOnChange}
              />
              <label htmlFor="comment" className="">
                Comment
              </label>
            </span>
          </div>

          <div className="flex justify-between gap-4 mb-4">
            <Button
              type="button"
              label="Cancel"
              onClick={handleOnClose}
              className="p-3 rounded text-white"
              severity="secondary"
            />

            <Button
              type="submit"
              label="Submit"
              loading={isLoading}
              className="p-3 rounded bg-[#67840d] border-green-400 text-white"
              severity="success"
            />
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default LeaveEditModal;

const STATUS = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
];
