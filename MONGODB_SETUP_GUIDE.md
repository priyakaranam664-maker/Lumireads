# MongoDB Setup Guide - Quick Solutions

## 📌 Current Status
```
Frontend: ✅ Running (http://localhost:5173)
Backend:  ✅ Running (http://localhost:5000)
MongoDB:  ❌ Not installed/configured
App:      ✅ Working with fallback data
```

---

## ⚡ Quick Setup Options

### **Option 1: Online MongoDB Atlas (Recommended - Fastest)**
*No installation required - 5 minutes*

#### Steps:
1. Visit: https://www.mongodb.com/cloud/atlas
2. Click "Start Free"
3. Sign up with email (use any email)
4. Create free cluster (M0 tier)
5. Wait 2-3 minutes for cluster to initialize
6. Click "Connect"
7. Copy connection string
8. Update `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bookstore
   ```
9. Restart backend: `npm start`

✅ **No download needed!**

---

### **Option 2: Local MongoDB Installation**
*One-time setup - 10 minutes*

#### Windows Setup:
1. Download MongoDB Community:
   ```
   https://www.mongodb.com/try/download/community
   ```

2. Run installer (MSI file)
   - Choose "Complete" installation
   - Check "Install as a Service"
   - Keep default paths

3. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

4. Verify installation:
   ```powershell
   mongo --version
   ```

5. Your `.env` already configured:
   ```
   MONGO_URI=mongodb://localhost:27017/bookstore
   ```

6. Restart backend:
   ```
   npm start
   ```

✅ **Runs locally, no internet needed**

---

### **Option 3: MongoDB Online (Atlas Alternative)**
*Same as Option 1 but different flow*

If Atlas has issues, try:
1. https://www.mongodb.com/try/download/community-kubernetes
2. Or use: https://www.mongodb.com/docs/manual/installation/

---

### **Option 4: Use MongoDB Temporary Local (Windows)**
*Quick test without installation*

If you want to test without installing, use in-memory SQLite instead:

```javascript
// Temporarily use SQLite for testing
// Update .env: MONGO_URI=sqlite://bookstore.db
```

---

## 🚀 Recommended Path

### For Quick Testing:
1. **Use Option 1 (MongoDB Atlas Online)**
   - No installation
   - Free tier included
   - Works immediately
   - Best for development

### For Production:
1. **Use Option 2 (Local MongoDB)**
   - Or deploy Atlas to cloud
   - Better performance
   - Full control

---

## 📝 Step-by-Step: MongoDB Atlas (Recommended)

### Step 1: Create Account
- Go to: https://www.mongodb.com/cloud/atlas
- Sign up with your email
- Create organization and project

### Step 2: Create Free Cluster
- Select "Free (M0)" tier
- Choose nearest region
- Click "Create"
- Wait 2-5 minutes

### Step 3: Create Database User
- Go to: Database Access
- Click "Add New Database User"
- Username: `bookstore`
- Password: `bookstore123` (or any password)
- Built-in Roles: `Atlas Admin`
- Click "Add User"

### Step 4: Whitelist IP Address
- Go to: Network Access
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (0.0.0.0/0)
- Click "Confirm"

### Step 5: Get Connection String
- Go to: Databases → Connect
- Choose "Drivers"
- Select "Node.js"
- Copy connection string
- Replace `<password>` with your password

### Step 6: Update Application
```bash
# Edit .env file:
MONGO_URI=mongodb+srv://bookstore:bookstore123@cluster0.xxxxx.mongodb.net/bookstore?retryWrites=true&w=majority

# Then restart:
npm start
```

### Step 7: Verify Connection
```bash
# Check backend logs - you should see:
# ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

---

## ✅ Testing Connection

After setup, run:
```bash
cd server
node diagnose-mongo-detailed.js
```

Expected output:
```
✅ ✅ ✅ MONGODB CONNECTED SUCCESSFULLY! ✅ ✅ ✅
   Host: cluster0.xxxxx.mongodb.net
   Database: bookstore
   State: Connected
```

---

## 🐛 Troubleshooting

### Error: "Cannot resolve hostname"
- Check MongoDB Atlas network access is set to 0.0.0.0/0
- Verify connection string is correct

### Error: "Authentication failed"
- Verify username and password in connection string
- Check special characters are URL-encoded

### Error: "Connection refused on localhost"
- MongoDB service not running
- Run: `net start MongoDB`

### Error: "Timeout"
- Check firewall isn't blocking port 27017
- Verify antivirus isn't blocking connections

---

## 💡 Pro Tips

1. **Save connection string**: Copy it somewhere safe for future reference
2. **Never commit credentials**: Use `.env.example` for template
3. **Monitor usage**: MongoDB Atlas has usage limits on free tier
4. **Backup data**: Regularly export your data

---

## 📊 Comparison

| Feature | Atlas Cloud | Local MongoDB |
|---------|------------|---------------|
| Setup time | 5 min | 10 min |
| Installation | No | Yes |
| Cost | Free (M0) | Free |
| Availability | Always on | Only when running |
| Best for | Development | Any use |
| Recommended | ✅ Start here | After testing |

---

## 🎯 Next Steps

**Choose one option and run it:**

```bash
# Option 1: After setting up Atlas
npm start

# Option 2: After installing local MongoDB
net start MongoDB
npm start
```

Then verify:
```bash
# Check if backend can see MongoDB
curl http://localhost:5000/api/health
```

---

**Need help?** All code is ready, just need to connect to MongoDB! 🚀
