import { Client, Databases, Users, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"] || process.env.ADMIN_API_KEY);

  const databases = new Databases(client);
  const users = new Users(client);

  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const payload = req.body;

  try {
    const newUser = await users.create({
      userId: ID.unique(),
      email: payload.email,
      password: "", // Passing an empty string creates a passwordless account
    });

    await databases.createDocument({
      databaseId: databaseId,
      collectionId: "profile",
      documentId: ID.unique(),
      data: {
        user_id: newUser.$id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        avatar: "public/avatar",
      },
    });

    log(`User created successfully: ${newUser.$id}`);
    return res.json({ success: true, userId: newUser.$id });
  } catch (err) {
    error("Failed to create user: " + err.message);
    return res.json({ error: err.message }, 500);
  }
};
