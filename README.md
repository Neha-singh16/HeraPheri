                   USER
                    │
                    │ creates
                    ▼
                  TASK
                    │
                    │ accepted by
                    ▼
              ASSIGNMENT
                    │
                    │ executed by
                    ▼
                 EXECUTOR
                    │
                    │ submits
                    ▼
                  PROOF
                    │
                    │ reviewed
                    ▼
          PENDING APPROVAL
             │          │
          approve     dispute
             │
             ▼
        COMPLETED
             │
             ▼
          PAYMENT

 And throughout the process:

             TASK EVENTS
                  ↑
                  │
      records every important change

That's HEREPHERI's heart.


3. But there is one important financial weakness ❗

Your refund calls Razorpay inside the same DB transaction. For example, Admin dispute resolution calls Razorpay refund before committing the MySQL transaction.

That can create this dangerous situation:

Razorpay refund succeeds
        ↓
MySQL update fails
        ↓
DB transaction rolls back
        ↓
Razorpay says REFUNDED
MySQL says HELD

That's exactly the type of edge case we want to eliminate before calling this production-ready.



PHASE 🔐 PAYMENT HARDENING
───────────────────────────

✅ REFUND_REQUESTED state
✅ DB transaction before queue
✅ BullMQ retry
✅ Exponential backoff
✅ Idempotent ledger helper

NOW:
1. Fix Payment ENUM mismatch
2. Make PAYMENT_HELD ledger idempotent
3. Make refund retry/reconciliation safe
4. Test concurrent refund calls
5. Test duplicate release
6. Test duplicate payment verification