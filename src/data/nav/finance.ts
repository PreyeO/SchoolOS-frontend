import { CircleDollarSign, Receipt, CreditCard, Wallet, Banknote, PieChart } from "lucide-react";

import { adminItem, type NavGroup } from "./types";

export const financeGroup: NavGroup = {
  label: "Finance",
  icon: CircleDollarSign,
  items: [
    adminItem({
      label: "Fees & Invoices",
      href: "/fees",
      icon: Receipt,
      description: "Set up fee structures and generate termly invoices for every student.",
      permission: "view_fees",
    }, false),
    adminItem({
      label: "Payments",
      href: "/payments",
      icon: CreditCard,
      description: "Track fee payments, balances, and send automated payment reminders.",
      // The payments list itself is open, but both halves of the screen need
      // fee items, so PaymentsPage already refuses without view_fees.
      permission: "view_fees",
    }, false),
    // Result Cards moved to the Results group (2026-11-11): see results-group.ts.
    adminItem({
      label: "Expenses",
      href: "/expenses",
      icon: Wallet,
      description: "Record and categorize school expenses and operating costs.",
    }),
    adminItem({
      label: "Payroll",
      href: "/payroll",
      icon: Banknote,
      description: "Run staff payroll with salary structures, deductions, and payslips.",
    }),
    adminItem({
      label: "Financial Reports",
      href: "/finance-reports",
      icon: PieChart,
      description: "Get income, expenditure, and outstanding balance reports at a glance.",
    }),
  ],
};
