# Staff Management Feature - Summary

## Overview
Added a new **Staff Management** section accessible only to admin users for managing trainers and staff members.

## New Admin Credentials
- **Username**: `admin`
- **Password**: `Oto@2026`

## Features Added

### 1. Staff Management Page (`staff.html`)
A dedicated page for managing all staff members including:
- Trainers
- Staff members
- Admin users

### 2. Access Control
- **Only admin users** can access the Staff Management page
- Menu item "Staff Management" appears only for admin role
- Other roles (staff, trainer, parent) cannot see or access this page

### 3. Functionality

#### Add New Staff Member
Admin can add new staff members with the following fields:
- **Full Name** (required)
- **Email/Username** (required) - used for login
- **Password** (required)
- **Role** (required) - Trainer, Staff, or Admin
- **Phone** (optional)
- **Specialization** (optional) - e.g., "Robotics", "Arduino"

#### View Staff Members
- Table displays all staff members with their details
- Shows: Name, Email, Role, Phone, Specialization
- Role badges with color coding (Admin = green badge)

#### Edit Staff Member
- Click "View" button to see staff details in a modal
- Click "Edit" to enable editing
- Can update: Name, Phone, Specialization
- Cannot change: Email (username) and Role

#### Delete Staff Member
- Click "Delete" button to remove a staff member
- Confirmation prompt before deletion

## Files Modified/Created

### Created:
1. **`staff.html`** - Staff management page with form and table
2. **Staff functions in `app.js`** - All staff management logic

### Modified:
1. **`assets/data.js`**
   - Updated admin credentials to: `admin` / `Oto@2026`

2. **`assets/app.js`**
   - Updated `navItemsByRole()` function to show "Staff Management" for admin only
   - Separated admin and staff navigation menus
   - Updated login error message with new credentials
   - Added staff management functions:
     - `renderStaff()` - Display staff list
     - `addStaff()` - Add new staff member
     - `deleteStaffMember()` - Delete staff member
     - `viewStaffMember()` - View staff details in modal
     - `saveStaff()` - Save edited staff details
     - `closeStaffModal()` - Close modal
     - `enableStaffEdit()` - Enable editing mode
     - `setStaffFieldsReadonly()` - Toggle readonly state

## Navigation Menu Changes

### Admin Menu (NEW):
- Dashboard
- Students
- **Staff Management** ⭐ NEW
- Sessions / Timetable
- Attendance
- Fees

### Staff Menu:
- Dashboard
- Students
- Sessions / Timetable
- Attendance
- Fees

### Trainer Menu:
- Dashboard
- My Sessions
- Mark Attendance

### Parent Menu:
- Dashboard
- My Children
- Fees

## Usage Instructions

### Login as Admin:
1. Go to login page
2. Enter username: `admin`
3. Enter password: `Oto@2026`
4. Click Login

### Add a Staff Member:
1. Login as admin
2. Click "Staff Management" in sidebar
3. Fill in the form:
   - Name: e.g., "John Doe"
   - Email: e.g., "john@otomatiks.com"
   - Password: e.g., "secure123"
   - Role: Select from dropdown
   - Phone: e.g., "0501234567"
   - Specialization: e.g., "Robotics Expert"
4. Click "Add Staff Member"

### View/Edit Staff Member:
1. In the staff table, click "View" button
2. Modal opens with staff details
3. Click "Edit" to enable editing
4. Modify Name, Phone, or Specialization
5. Click "Save Changes"

### Delete Staff Member:
1. In the staff table, click "Delete" button
2. Confirm deletion in the prompt
3. Staff member is removed from the system

## Security Features

✅ **Admin-Only Access**: Only users with admin role can access staff management  
✅ **Email Uniqueness**: System prevents duplicate email addresses  
✅ **Required Fields**: Name, Email, and Password are mandatory  
✅ **Confirmation Prompts**: Delete actions require confirmation  
✅ **Role Protection**: Email and Role cannot be changed after creation  

## Data Storage

All staff data is stored in the `users` array in localStorage under the key `inst_db_v1`.

Staff members have the following structure:
```javascript
{
  email: "john@otomatiks.com",
  pass: "secure123",
  role: "trainer",
  name: "John Doe",
  phone: "0501234567",
  specialization: "Robotics Expert"
}
```

## Testing

To test the feature:

1. **Login as Admin**:
   - Username: `admin`
   - Password: `Oto@2026`

2. **Verify Menu**: Check that "Staff Management" appears in sidebar

3. **Add Test Staff**:
   - Name: "Test Trainer"
   - Email: "test@trainer.com"
   - Password: "test123"
   - Role: Trainer
   - Phone: "0501111111"
   - Specialization: "Arduino"

4. **Verify in Table**: Check that the new staff member appears

5. **Test Edit**: Click View, then Edit, modify details, Save

6. **Test Login**: Logout and try logging in with the new trainer credentials

7. **Test Delete**: Delete the test staff member

## Notes

- Parent accounts are still auto-generated when students are added (separate from staff management)
- Staff members can be trainers, staff, or admins
- The admin account cannot delete itself
- All changes are saved to localStorage immediately
