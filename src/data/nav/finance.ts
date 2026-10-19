import { CircleDollarSign, Receipt, CreditCard, Ticket, Wallet, Banknote, PieChart } from "lucide-react";

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
    // Bought from SchoolOS, not a school fee. /scratch-cards/payment-complete
    // (Paystack's return) resolves to this item too, so it's gated the same.
    adminItem({
      label: "Result PINs",
      href: "/scratch-cards",
      icon: Ticket,
      description: "Buy result-check PINs for parents and manage them.",
      permission: "manage_scratch_cards",
    }, false),
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
