# Quick Start Guide - Sales Dashboard

## Status: ✅ READY TO USE

All data is loaded and the system is production-ready!

---

## To Start the Dashboard:

### Option 1: Using Batch File (Windows)
```bash
.\start_dashboard.bat
```

### Option 2: Using PowerShell
```powershell
.\start_dashboard.ps1
```

---

## Access the Dashboard

Once server starts, open your browser:

- **Dashboard**: http://localhost:8000/dashboard/
- **Login**: http://localhost:8000/accounts/login/
- **Admin**: http://localhost:8000/admin/

---

## Test Credentials

### All users use password: `Demo@123456`

### LEADER (Full Access - All Records):
- **Username**: `nitin_mude`
- **Password**: `Demo@123456`
- **Sees**: All 2,931 sales records (₹2,624,738.52)
- **Role**: Leader - can see entire organization data

### MANAGER (Team Access):
- **Username**: `abhijeet_mane`
- **Password**: `Demo@123456`
- **Sees**: Only team members' records
- **Role**: Manager - can see direct reports

### RM (Own Data Only):
- **Username**: `bhushan_kulkarni`
- **Password**: `Demo@123456`
- **Sees**: Only own wire_code records (F447P01)
- **Role**: RM/MA - can see only own sales data

---

## Data Summary

| Metric | Value |
|--------|-------|
| **Employees** | 23 active |
| **Sales Records** | 2,931 transactions |
| **Total Brokerage** | ₹2,624,738.52 |
| **Top Wire Code** | F338Y10 (114 records, ₹447,217.00) |

---

## User Hierarchy

```
Nitin Mude (LEADER - F338Y01)
├─ Harshal Ghatage (Manager - F338Y02)
│  ├─ Avishek Kumar (RM - F338Y12)
│  ├─ Rohit Patokar (RM - F338Y14)
│  ├─ Ganesh Shankar (RM - F338Y15)
│  ├─ Rakesh Bhamare (RM - F338Y13)
│  └─ Harshal Bavaskar (RM - FY746)
├─ Suhas Tare (Manager - F338Y03)
│  ├─ Devashish Upadhyaya (RM - F338Y10)
│  ├─ Amit Nawale (RM - F338Y07)
│  ├─ Amol Patekar (RM - F338Y09)
│  ├─ Abhay Aouti (RM - F338Y08)
│  ├─ Samir Supsande (RM - F338Y04)
│  └─ Niyaz Sheikh (RM - F338Y05)
└─ Abhijeet Mane (Manager - F447P)
   ├─ Bhushan Kulkarni (RM - F447P01)
   │  └─ Rahul Khot (RM - F447P06)
   ├─ Anil Gavali (RM - F447P02)
   ├─ Kedar Kulkarni (RM - F447P03)
   │  └─ Rohan Joshi (RM - F447P023)
   ├─ Dhananjay Yadav (RM - F447P04)
   │  └─ Prasanna Daddamani (RM - F447P24)
   └─ Ashwini Patankar (RM - F447P10)
```

---

## Security Features

✅ **Password Encryption**: PBKDF2-SHA256 (260,000 iterations)  
✅ **Role-Based Access Control**: 3 levels (Leader/Manager/RM)  
✅ **Hierarchy-Based Filtering**: Users see only authorized data  
✅ **Wire Code Matching**: Automatic employee-sales join  

---

## If Data Needs Reloading

Run this command in SalesDashboard folder:

```bash
python complete_data_load.py
```

This will:
1. Clear all data
2. Load 23 employees with hierarchy
3. Load 2,931 brokerage records
4. Create all 23 users with correct roles
5. Show final statistics

---

## Support

**Server running on**: http://0.0.0.0:8000/  
**Database**: SQLite (db.sqlite3)  
**Admin access**: http://localhost:8000/admin/

Login with admin credentials set during setup.
