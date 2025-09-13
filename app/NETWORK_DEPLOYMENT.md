# Network Deployment Guide

## 🌐 **Exposing Web App to Network**

Your web app is now configured to be accessible from other devices on your network at `http://10.0.0.96:3000`.

## 🚀 **How to Run**

### **Development Mode:**
```bash
# Navigate to the app directory
cd app

# Install dependencies (if not already done)
npm install

# Run with network access
npm run dev:network

# Or use the regular dev command (now configured for network)
npm run dev
```

### **Production Build:**
```bash
# Build the app
npm run build

# Preview with network access
npm run preview
```

## 📱 **Access from Other Devices**

Once running, your web app will be accessible at:
- **Your machine**: `http://localhost:3000`
- **Other devices on network**: `http://10.0.0.96:3000`
- **Mobile devices**: `http://10.0.0.96:3000`

## 🔧 **Configuration Details**

### **Vite Configuration (`vite.config.ts`):**
- **Host**: `0.0.0.0` (allows external connections)
- **Port**: `3000`
- **API Proxy**: `/api` → `http://10.0.0.96:8000`

### **Package Scripts:**
- **`npm run dev`**: Standard development server
- **`npm run dev:network`**: Explicitly enable network access
- **`npm run preview`**: Preview built app with network access

## 🔒 **Security Considerations**

### **Network Access:**
- ✅ **Local network only** - accessible from devices on same network
- ✅ **No external exposure** - not accessible from internet
- ✅ **API proxy configured** - backend calls work correctly

### **Firewall:**
- Ensure port 3000 is not blocked by Windows Firewall
- If blocked, add exception for Node.js/Vite

## 🛠️ **Troubleshooting**

### **Can't Access from Other Devices:**
1. **Check IP address**: Run `ipconfig` to verify `10.0.0.96` is correct
2. **Check firewall**: Ensure port 3000 is allowed
3. **Check network**: Ensure devices are on same network
4. **Check Vite output**: Look for "Local: http://10.0.0.96:3000"

### **API Calls Not Working:**
1. **Backend running**: Ensure backend is running on `10.0.0.96:8000`
2. **CORS configured**: Backend should allow `http://10.0.0.96:3000`
3. **Proxy working**: Check browser dev tools for API call errors

## 📋 **Quick Start Checklist**

- [ ] Backend running on `http://10.0.0.96:8000`
- [ ] Web app running with `npm run dev:network`
- [ ] Accessible at `http://10.0.0.96:3000`
- [ ] Mobile app can connect to same backend
- [ ] All devices on same network

## 🎯 **Expected Results**

After running `npm run dev:network`:
- ✅ **Console shows**: "Local: http://10.0.0.96:3000"
- ✅ **Web app loads** on your machine
- ✅ **Other devices can access** the web app
- ✅ **API calls work** from all devices
- ✅ **Mobile app connects** to same backend

Your web app is now accessible from any device on your network! 🎉
