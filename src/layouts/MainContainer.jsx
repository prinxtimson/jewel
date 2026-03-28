import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Sidebar } from "primereact/sidebar";
import { Menu } from "primereact/menu";
import { Badge } from "primereact/badge";
import { Toast } from "primereact/toast";
import { Link, useNavigate, useLocation } from "react-router-dom";
import moment from "moment";

import CustomSidebar from "../components/CustomSidebar";
import { clearUser, logout } from "../features/auth/authSlice";
//import { markNotification } from "../features/notification/notificationSlice";

const MainContainer = ({ children, toast, handleOnTextChange = null }) => {
  const [visible, setVisible] = useState(false);
  const notificationRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  //const { notifications } = useSelector((state) => state.notification);

  const toggleSidebar = () => {
    setVisible(!visible);
  };

  const onLogout = () => {
    dispatch(logout());
    dispatch(clearUser());
    navigate("/");
  };

  const getNotificationDetails = (value) => {
    if (value.type == "App\\Notifications\\FeedbackNotification") {
      return {
        label: (
          <div className="tw-w-full tw-flex tw-flex-col tw-gap-3 tw-border-b tw-p-2">
            <div className="">New feedback submitted</div>
            <div className="tw-text-sm tw-text-gray-400">
              {moment(value.created_at).fromNow()}
            </div>
          </div>
        ),
        command: () => navigate(`/dashboard/feedback`),
      };
    } else {
      return {
        label: "",
      };
    }
  };

  return (
    <div className="">
      <Toast ref={toast} />
      <div className="h-screen flex overflow-hidden">
        <Sidebar
          visible={visible}
          onHide={toggleSidebar}
          className="lg:hidden"
          showCloseIcon={false}
          content={() => (
            <CustomSidebar
              user={user}
              customClass="w-full bg-slate-900 h-screen flex flex-col text-slate-300"
            />
          )}
        ></Sidebar>
        <CustomSidebar
          user={user}
          customClass="w-80 bg-slate-900 h-screen flex-col text-slate-300 hidden lg:flex"
        />
        <main className="grow overflow-y-auto bg-slate-50 relativ flex flex-col">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center">
            <div className="flex gap-5">
              <div className="lg:hidden">
                <a
                  href="#"
                  type="button"
                  className="bg-transparen"
                  onClick={toggleSidebar}
                >
                  <i className="fas fa-bars text-stone-800 text-2xl"></i>
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <i className="fas fa-home"></i>
                {location.pathname
                  .replace("/", "")
                  .split("/")
                  .map((val) => (
                    <div key={val}>
                      <i className="fas fa-chevron-right text-[10px]"></i>
                      <span className="font-medium text-slate-900 capitalize">
                        {val.replaceAll("-", " ").toLowerCase()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="">
                <i
                  className="fas fa-bell"
                  style={{
                    fontSize: "1.5rem",
                    cursor: "pointer",
                  }}
                  onClick={(e) => notificationRef.current?.toggle(e)}
                >
                  {/* {notifications &&
                                    notifications.count > 0 ? (
                                        <Badge
                                            value={
                                                notifications.count > 9
                                                    ? "9+"
                                                    : notifications.count
                                            }
                                            severity="danger"
                                        ></Badge>
                                    ) : null} */}
                </i>
                <Menu
                  model={
                    // notifications
                    //     ? notifications.data
                    //           .slice(0, 9)
                    //           .map((val) =>
                    //               getNotificationDetails(
                    //                   val
                    //               )
                    //           ) :
                    [
                      {
                        label: "No Notification found",
                      },
                    ]
                  }
                  popup
                  ref={notificationRef}
                  //onShow={() => dispatch(markNotification())}
                  style={{ width: 340 }}
                />
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              {/* <Link
                to="/dashboard/profile"
                className="text-sm font-bold text-slate-900"
              >
                Profile
              </Link> */}
              <span
                className="text-sm font-bold text-red-600 cursor-pointer"
                onClick={onLogout}
              >
                Logout
              </span>
            </div>
          </header>

          <div className="grow">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainContainer;
