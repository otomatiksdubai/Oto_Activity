# Connecting MongoDB Atlas to Institute Portal

This guide explains how to set up and connect a MongoDB Atlas database to your application.

## 1. Create a MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Register for a free account.

## 2. Create a Free Cluster
1. Log in and click **"Create a Deployment"**.
2. Select **M0 (Free)**.
3. Choose a provider (e.g., AWS) and a region close to you.
4. Click **"Create"**.

## 3. Set Up Security (Crucial)
1. **Database Access**:
   - Go to "Database Access" under the Security section.
   - Click **"Add New Database User"**.
   - Set a **Username** and a **Password**. 
   - *Important: Save these! Use "Built-in Role: Read and write to any database".*
2. **Network Access**:
   - Go to "Network Access" under the Security section.
   - Click **"Add IP Address"**.
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0) for development, or add your specific IP.
   - Click **"Confirm"**.

## 4. Get Your Connection String
1. Go to the "Database" section (Clusters).
2. Click the **"Connect"** button on your cluster.
3. Choose **"Drivers"**.
4. Select **Node.js** as the driver.
5. Copy the connection string. It looks like this:
   `mongodb+srv://<db_username>:<db_password>@clustername.abcde.mongodb.net/?retryWrites=true&w=majority&appName=ClusterName`

## 5. Update Your Backend Configuration
1. Open the file: `backend/.env`
2. Replace the `MONGODB_URI` line with your copied string.
3. Replace `<db_username>` and `<db_password>` with the credentials you created in Step 3.
4. Specify the database name by adding it after the slash `/` and before the `?`.

Example `.env` content:
```env
PORT=5000
MONGODB_URI=mongodb+srv://admin:yourPassword@your-cluster.mongodb.net/institute-portal?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here
NODE_ENV=development
```

## 6. Restart Your Server
1. Stop your backend if it's running.
2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```
3. Check the console. You should see: `MongoDB connected`.

## Troubleshooting
- **Whitelist Error**: Double-check "Network Access" in Atlas. Ensure your IP is added.
- **Password Error**: Ensure you used the *Database User* password, not your Atlas login password.
- **Special Characters**: If your password contains special characters (like `@` or `#`), you must URL-encode them (e.g., `@` becomes `%40`).
