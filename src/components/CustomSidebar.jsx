import { Avatar } from "primereact/avatar";
import { Link, useLocation } from "react-router-dom";

const CustomSidebar = ({ user, customClass }) => {
  const location = useLocation();

  const items = [
    {
      id: "DASHBOARD",
      icon: "fa-chart-line",
      label: "Dashboard",
      link: "/dashboard",
    },
    {
      id: "appointment",
      icon: "fa-address-book",
      label: "Appointments",
      link: "/dashboard/appointment",
    },
    {
      id: "AGENTCHAT",
      icon: "fa-address-book",
      label: "Chat",
      link: "/dashboard/chat-agent",
    },
  ];

  return (
    <div className={customClass}>
      <div className="p-6 flex items-center gap-3">
        {/* <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <i className="fas fa-robot text-xl"></i>
                </div> */}
        <Link to="/">
          <span className="font-bold text-xl text-white tracking-tight">
            HR Connect
          </span>
        </Link>
      </div>

      <nav className="grow px-4 mt-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mb-4 transition-all ${
              location.pathname === item.link
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            {/* <i className={`fas ${item.icon} w-5`}></i> */}
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar
            label={`${user?.name.split(" ")[0].charAt(0)}${user?.name.split(" ")[1].charAt(0)}`}
            shape="circle"
            style={{ backgroundColor: "#6a008e", color: "#ffffff" }}
          />

          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSidebar;
