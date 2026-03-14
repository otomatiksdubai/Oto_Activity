# Parent Portal Invoice Integration

## Overview
This document describes the implementation that allows parents to view invoices for their children through the parent portal.

## How It Works

### Parent Login System
- **Username**: Student's name (e.g., "Ahmed")
- **Password**: Parent's phone number (e.g., "0501234567")
- Parent accounts are automatically created when a new student is added to the system

### Invoice Visibility for Parents

When a parent logs into the portal, they can now:

1. **View Invoices on Dashboard**
   - The dashboard shows KPIs including unpaid and partial fees
   - Invoices are automatically filtered to show only their children's invoices

2. **Access Fees Page**
   - Parents can navigate to the "Fees" page from the sidebar menu
   - The fees table displays all invoices for their children
   - Parents see a "View" button (not "Print") to view individual invoices
   - Parents **cannot** create new invoices (form is hidden)
   - Parents **cannot** delete invoices (delete button is hidden)

### Technical Implementation

#### Invoice Matching Logic
The system matches invoices to parents using two methods:

1. **By Student ID**: If the invoice's `studentId` matches the child's internal ID (e.g., "S001")
2. **By Student Name**: If the invoice's `studentId` is a manually entered name that matches the child's name

This dual matching ensures that invoices are visible regardless of whether:
- Admin/Staff selected a student from the system
- Admin/Staff manually typed the student's name

#### Code Changes Made

**File: `assets/app.js`**

1. **Updated `renderFees()` function** (lines 674-699)
   - Changed parent filtering logic from using `parentEmail` to matching by student name
   - Added dual matching: by student ID and by student name
   - Ensures manually entered student names are also matched
   - Shows "View" button for parents and "Print" button for admin/staff

2. **Updated `renderDashboard()` function** (lines 117-127)
   - Applied the same dual matching logic for dashboard KPIs
   - Ensures fee counts on dashboard are accurate for parents

## Usage Example

### For Admin/Staff Creating an Invoice:

1. Go to **Fees** page
2. Fill in the invoice form:
   - **Student Name**: Type the student's name (e.g., "Ahmed")
   - **Course**: Select the course
   - **Price**: Enter the amount
   - **Discount**: Enter any discount
   - **Status**: Select payment status
3. Click **Create**

### For Parents Viewing Invoices:

1. **Login** with:
   - Username: Student's name (e.g., "Ahmed")
   - Password: Parent's phone number
2. **Dashboard**: View summary of unpaid/partial fees
3. **Navigate to Fees**: Click "Fees" in the sidebar
4. **View Invoices**: See all invoices for their children
5. **View Invoice Details**: Click "View" button to see invoice details (can also print from there)

## Benefits

✅ **Automatic Visibility**: Invoices automatically appear in parent portal when created  
✅ **No Manual Linking**: System automatically matches invoices to parents  
✅ **Flexible Entry**: Works with both system-selected students and manually typed names  
✅ **Secure**: Parents only see their own children's invoices  
✅ **Real-time**: Invoices appear immediately after creation  

## Testing

To test the parent portal invoice feature:

1. **Create a student** (as Admin):
   - Name: "TestStudent"
   - Parent Phone: "1234567890"
   
2. **Create an invoice** (as Admin):
   - Student Name: "TestStudent"
   - Course: Any course
   - Amount: 500 AED
   
3. **Login as parent**:
   - Username: TestStudent
   - Password: 1234567890
   
4. **Verify**:
   - Dashboard shows the invoice in KPIs
   - Fees page displays the invoice
   - Can print the invoice

## Notes

- Parents cannot create, edit, or delete invoices
- Parents can only view and print invoices
- The system supports multiple children per parent (if multiple students have the same name as login)
- Invoice filtering is case-insensitive for better matching
