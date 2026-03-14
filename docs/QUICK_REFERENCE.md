# Quick Reference Guide - Student Management

## ✅ What's New

### 1. School Name Field
- Added to student registration form
- Displayed in the student list table
- Can be edited by admin/staff

### 2. Automatic Parent Login Creation
When you add a new student:
- **Username**: Student's name (e.g., "Ahmed")
- **Password**: Parent's mobile number (e.g., "0501234567")
- Credentials are shown in a success message after adding the student

### 3. View Button
- Available for ALL users (admin, staff, trainer, parent)
- Opens a popup showing complete student details:
  - Name
  - Grade
  - School Name
  - Parent Phone Number
  - Parent Login Username
  - Parent Login Password

### 4. Edit Button (Admin & Staff Only)
- Only visible to admin and staff roles
- Located in the student details popup
- Allows editing of:
  - Student Name
  - Grade
  - School Name
  - Parent Phone Number
- Parent login credentials update automatically when you change name or phone

## 🎯 How to Use

### Adding a New Student (Admin/Staff)
1. Fill in the form:
   - Name (required)
   - Grade
   - School Name
   - Parent Phone Number (required)
2. Click "Add"
3. Note the parent login credentials shown in the success message
4. Share these credentials with the parent

### Viewing Student Details (All Users)
1. Click the "View" button next to any student
2. A popup opens showing all details
3. Click "Close" to exit

### Editing Student Details (Admin/Staff Only)
1. Click "View" button next to the student
2. Click "Edit" button in the popup
3. Modify the fields as needed
4. Click "Save"
5. Changes are saved and parent credentials are updated automatically

## 🔐 Role-Based Access

| Role    | Add Student | View Details | Edit Details | Delete Student |
|---------|-------------|--------------|--------------|----------------|
| Admin   | ✅          | ✅           | ✅           | ✅             |
| Staff   | ✅          | ✅           | ✅           | ✅             |
| Trainer | ❌          | ✅           | ❌           | ❌             |
| Parent  | ❌          | ✅ (own kids)| ❌           | ❌             |

## 📝 Important Notes

1. **Parent Login Credentials**:
   - Username = Student Name (case-sensitive)
   - Password = Parent Phone Number
   - These update automatically when you edit student details

2. **Data Synchronization**:
   - Changing student name updates the parent's login username
   - Changing phone number updates the parent's login password
   - Parent user account is created automatically when adding a student

3. **Security**:
   - Parents can only see their own children's details
   - Only admin and staff can edit or delete students
   - Trainers have read-only access to all students

## 🐛 Troubleshooting

**Parent can't login?**
- Check that you're using the exact student name as username
- Verify the phone number matches what was entered
- Names are case-sensitive

**Edit button not showing?**
- Only admin and staff can see the edit button
- Parents and trainers have read-only access

**School name not showing?**
- Older students added before this update won't have school names
- Click "View" and "Edit" to add the school name

## 📱 Testing Credentials

**Admin Login:**
- Email: admin@demo.com
- Password: 123456

**Demo Parent Login (for student "Ahmed"):**
- Username: Ahmed
- Password: 0501234567
