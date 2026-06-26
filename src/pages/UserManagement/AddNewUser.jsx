import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

import { addNewUser, getAllUsers } from "../../lib/appwrite";

const AddNewUser = ({ visible, handleOnHide, setError, setMsg }) => {
  const toastRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      setData({
        name: "",
        email: "",
        phone: "",
      });
    };
  }, []);

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
      await addNewUser(data);
      await getAllUsers();
      setMsg("New user added successful");
      handleOnHide();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog
      visible={visible}
      onHide={handleOnHide}
      className=" "
      header="New User"
    >
      <div className="card w-full sm:w-[35rem]">
        <form onSubmit={onSubmit} className="p-fluid">
          <div className="field">
            <div className="p-float-label">
              <InputText
                name="name"
                value={data.name}
                onChange={handleOnChange}
                required
                placeholder="John Doe"
              />
              <label htmlFor="name" className="">
                Name *
              </label>
            </div>
          </div>
          <div className="field">
            <div className="p-float-label">
              <InputText
                name="email"
                type="email"
                value={data.email}
                onChange={handleOnChange}
                autoComplete="new email"
                required
              />
              <label htmlFor="email" className="">
                Email Address *
              </label>
            </div>
          </div>
          <div className="field">
            <div className="p-float-label">
              <InputText
                name="phone"
                value={data.phone}
                onChange={handleOnChange}
              />
              <label htmlFor="phone_number" className="">
                Phone Number
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-4 mb-4">
            <Button
              type="button"
              label="Cancel"
              onClick={handleOnHide}
              severity="secondary"
            />

            <Button
              type="submit"
              label={"Create New User"}
              loading={isLoading}
              pt={{
                root: {
                  className: "bg-[#cc5500]",
                },
              }}
            />
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default AddNewUser;
