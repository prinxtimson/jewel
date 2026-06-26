import { Client, TablesDB, Account, ID, Query } from "appwrite";
import { generatePassword } from "./utils";

const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Replace with your project ID

export const account = new Account(client);
export const tablesDB = new TablesDB(client);

export const getAllBooking = async () => {
  const res = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "appointment",
    // queries: [Query.select(["*", "user.*", "admin.*"])],
  });

  return res;
};

export const getAllUsers = async () => {
  const res = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "profile",
  });

  return res;
};

export const addNewUser = async ({ email, phone, name }) => {
  let password = await generatePassword(8);

  const user = await account.create({
    userId: ID.unique(),
    name: name,
    email: email,
    password: password,
  });

  const res = await tablesDB.createRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "profile",
    rowId: ID.unique(),
    data: {
      user_id: user.$id,
      name: user.name,
      email: user.email,
      phone: phone,
    },
  });

  return res;
};

export const deleteUser = async (id) => {
  await account.deleteIdentity(id);

  await tablesDB.deleteRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "profile",
    rowId: id,
  });

  return "The user had been deleted";
};

export const getAuditLogs = async () => {
  const res = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "auditlogs",
    queries: [Query.select(["*", "user.name"])],
  });
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "access",
    entityType: "Audit Logs",
    location: "",
    details: "Get all audit logs",
    user: id,
  });

  return res;
};

export const searchLeaveBalance = async (data) => {
  const res = await tablesDB.listRows({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leavebalances",
    queries: [
      Query.equal("user", data.userId),
      Query.equal("leaveType", data.leaveType),
    ],
  });
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "access",
    entityType: "Leave Balance",
    location: "",
    details: "Read leave balance",
    user: id,
  });

  return res;
};

export const createLeaveBalance = async (data) => {
  const res = await tablesDB.createRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "leavebalances",
    rowId: ID.unique(),
    data,
  });
  const id = (await account.get()).$id;
  createAuditLogs({
    actionType: "create",
    entityType: "Leave Balance",
    location: "",
    details: "Create leave balance",
    user: id,
  });

  return res;
};

export const createAuditLogs = async (data) => {
  await tablesDB.createRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "auditlogs",
    rowId: ID.unique(),
    data,
  });
};

export const submitLeaveApplication = async (data) => {
  const res = await tablesDB.createRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "appointment",
    rowId: ID.unique(),
    data,
  });
  const id = (await account.get()).$id;
  // createAuditLogs({
  //   actionType: "create",
  //   entityType: "Leave Applications",
  //   location: "",
  //   details: "Submit leave applications",
  //   user: id,
  // });

  return res;
};

export const approveLeaveApplication = async (data) => {
  const res = await tablesDB.updateRow({
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tableId: "appointment",
    rowId: data.$id,
    data: {
      status: data.status,
    },
  });

  return res;
};

function calculateDays(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let timeDifference = end - start;
  let daysDifference = Math.round(timeDifference / (1000 * 3600 * 24));
  return daysDifference;
}
