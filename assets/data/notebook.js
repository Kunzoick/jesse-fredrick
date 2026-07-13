// assets/data/notebook.js
// Loaded via <script> tag — NOT fetched — to avoid CORS on file:// protocol.
// This script sets a global const. Do not convert to JSON or fetch().

const NOTEBOOK_DATA = [
  {
    id: "ADR-001",
    project: "BarnCart",
    type: "bug",
    title: "Multi-item checkout silently dropped order items",
    tags: ["Transactions", "Hibernate", "Data Integrity"],
    status: "Fixed",
    takeaway: "Verify persistence directly in the database.",
    investigation: [
      "Database inspected — only one row per order, regardless of cart size",
      "Application logs checked — every item logged as saved, no errors",
      "Hibernate session inspected — cleared after every stock deduction"
    ],
    context: "The stock-deduction query cleared the entire persistence context after every run. Anything saved but not yet flushed in that same request was silently discarded. Only the last item in a multi-item cart ever survived commit.",
    decision: "Flush explicitly after each item is saved, before the next stock deduction runs.",
    rejected: "Leaving it as-is — that would just restore the data loss.",
    principle: "Logs describe what the application believes happened. The database tells you what actually happened."
  },
  {
    id: "ADR-002",
    project: "Trust API",
    type: "decision",
    title: "Separate role authorization from trust evaluation",
    tags: ["Security", "Authorization", "Architecture"],
    status: "Accepted",
    takeaway: "A high trust score should never unlock access a role doesn't already grant.",
    context: "The system had to judge who a user is and how trustworthy their recent behavior has been, without either one leaking into the other's job.",
    decision: "The two stay on separate axes. Trust score never grants structural access. Escalating access is always an explicit admin action.",
    rejected: "Letting trust score automatically unlock restricted endpoints — that opens access to being gamed through behavior alone.",
    consequence: "Every new endpoint has to be checked against this rule before it ships.",
    principle: "Security boundaries lose value the moment they become conditional."
  },
  {
    id: "ADR-003",
    project: "Multi-Tenant API",
    type: "decision",
    title: "Tenant isolation enforced structurally, not by convention",
    tags: ["Security", "Multi-Tenancy", "Data Isolation"],
    status: "Accepted",
    takeaway: "If a security guarantee depends on someone remembering, it isn't a guarantee.",
    context: "In a multi-tenant system, one missed filter on one query is enough to leak one tenant's data into another's.",
    decision: "Every tenant-scoped query passes through a base repository that applies the tenant filter automatically. Tenant ID only ever comes from the authenticated token, never from a request parameter.",
    rejected: "Trusting each repository method to add its own tenant check — that depends on nobody ever forgetting.",
    consequence: "All tenant-scoped access has to go through that one base repository — a constraint, in exchange for removing an entire bug category by construction."
  },
  {
    id: "ADR-004",
    project: "Pipeline",
    type: "decision",
    title: "Spring self-invocation bypassed @Transactional",
    tags: ["Spring", "Transactions", "Concurrency"],
    status: "Accepted",
    takeaway: "If @Transactional seems to do nothing, check whether the method is being called from inside its own class.",
    context: "A processing record's status needed to become visible to a separate background thread immediately, before the rest of the processing work finished.",
    decision: "Moved the status-update method into its own separate service class, so it's always called from outside, not from within the same class.",
    rejected: "Marking the method REQUIRES_NEW inside the class that already calls it — Spring's transaction wrapping only applies to calls coming from outside the object; a class calling its own method skips it silently, with no error.",
    consequence: "One small extra class exists purely to make a transaction boundary function."
  },
  {
    id: "ADR-005",
    project: "Calculus API",
    type: "decision",
    title: "Hand-written symbolic engine, zero framework dependency",
    tags: ["Algorithms", "Parsing", "Testability"],
    status: "Accepted",
    takeaway: "A component is only really testable in isolation if nothing forces it to know about the framework around it.",
    context: "The differentiation/integration engine needed to be trustworthy on its own, not just as part of the API.",
    decision: "Built the tokenizer, parser, AST, differentiator, integrator, simplifier, and printer as plain Java classes with zero Spring imports anywhere in the engine. The REST layer is a thin wrapper on top."
  },
  {
    id: "ADR-006",
    project: "Student Management System",
    type: "decision",
    title: "A sentinel adminId pattern closes off a class of access bugs",
    tags: ["Java Swing", "Access Control", "Code Review"],
    status: "Accepted",
    takeaway: "A shared, consistent identity value flowing through every layer closes off gaps that ad-hoc checks miss.",
    context: "A desktop multi-admin system needed every screen to reliably know which admin was acting, without relying on each frame remembering to check it itself."
  }
];