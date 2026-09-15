import { Op } from "sequelize";

import {
  User,
  ExecutorProfile,
  Verification,
  Task,
  Dispute,
  Payment,
} from "../models/index.js";

export async function getAdminOverview() {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalExecutors,
    pendingVerifications,
    openDisputes,
    activeTasks,
    completedTasks,
    heldPayments,
  ] = await Promise.all([
    User.count(),

    User.count({
      where: {
        account_status: "ACTIVE",
      },
    }),

    User.count({
      where: {
        account_status: "SUSPENDED",
      },
    }),

    ExecutorProfile.count(),

    Verification.count({
      where: {
        status: "PENDING",
      },
    }),

    Dispute.count({
      where: {
        status: {
          [Op.in]: ["OPEN", "UNDER_REVIEW"],
        },
      },
    }),

    Task.count({
      where: {
        status: {
          [Op.in]: ["ASSIGNED", "IN_PROGRESS", "PENDING_APPROVAL"],
        },
      },
    }),

    Task.count({
      where: {
        status: "COMPLETED",
      },
    }),

    Payment.sum("gross_amount", {
      where: {
        status: "HELD",
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
    },

    executors: totalExecutors,

    verifications: {
      pending: pendingVerifications,
    },

    disputes: {
      open: openDisputes,
    },

    tasks: {
      active: activeTasks,
      completed: completedTasks,
    },

    payments: {
      heldAmount: Number(heldPayments || 0),
    },
  };
}

export async function getAdminUsers({
  search = "",
  status,
  role,
  page = 1,
  limit = 20,
}) {
  const normalizedPage = Math.max(Number(page) || 1, 1);

  const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const where = {};

  if (status) {
    where.account_status = status;
  }

  if (role) {
    where.role = role;
  }

  if (search.trim()) {
    where[Op.or] = [
      {
        name: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
      {
        email: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,

    attributes: [
      "id",
      "name",
      "email",
      "phone",
      "auth_provider",
      "account_status",
      "role",
      "created_at",
    ],

    include: [
      {
        model: ExecutorProfile,

        as: "executorProfile",

        required: false,

        attributes: [
          "trust_score",
          "completion_rate",
          "on_time_rate",
          "total_tasks",
          "completed_tasks",
          "is_available",
        ],
      },

      {
        model: Verification,

        as: "verification",

        required: false,

        attributes: [
          "status",
          "verification_type",
          "verified_at",
          "rejection_reason",
        ],
      },
    ],

    order: [["created_at", "DESC"]],

    limit: normalizedLimit,

    offset: (normalizedPage - 1) * normalizedLimit,
  });

  return {
    users: rows,

    pagination: {
      page: normalizedPage,

      limit: normalizedLimit,

      total: count,

      pages: Math.ceil(count / normalizedLimit),
    },
  };
}

export async function updateUserAccountStatus({
  userId,
  accountStatus,
  adminId,
}) {
  const allowedStatuses = ["ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"];

  if (!allowedStatuses.includes(accountStatus)) {
    throw new Error("Invalid account status.");
  }

  if (userId === adminId) {
    throw new Error("You cannot change your own account status.");
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.role === "ADMIN") {
    throw new Error("Admin accounts cannot be modified from this screen.");
  }

  await user.update({
    account_status: accountStatus,
  });

  return {
    id: user.id,
    accountStatus: user.account_status,
  };
}

export async function getPendingVerifications() {
  return Verification.findAll({
    where: {
      status: "PENDING",
      verification_type: "IDENTITY",
    },

    include: [
      {
        model: User,

        as: "user",

        attributes: ["id", "name", "email", "phone", "account_status"],
      },
    ],

    order: [["created_at", "ASC"]],
  });
}

export async function getAdminTasks({
  search = "",
  status,
  riskLevel,
  page = 1,
  limit = 20,
}) {
  const safePage = Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (riskLevel) {
    where.risk_level = riskLevel;
  }

  if (search.trim()) {
    where[Op.or] = [
      {
        title: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
      {
        address_text: {
          [Op.like]: `%${search.trim()}%`,
        },
      },
    ];
  }

  const { rows, count } = await Task.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "requester",
        attributes: ["id", "name", "email"],
      },
      {
        model: TaskAssignment,
        as: "assignments",
        required: false,
        where: {
          status: {
            [Op.in]: ["ACTIVE", "COMPLETED", "RELEASED"],
          },
        },
        include: [
          {
            model: User,
            as: "executor",
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
    distinct: true,
  });

  return {
    tasks: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      pages: Math.ceil(count / safeLimit),
    },
  };
}


export async function getAdminPayments({
  status,
  search = "",
  page = 1,
  limit = 20,
}) {
  const safePage = Math.max(
    Number(page) || 1,
    1,
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100,
  );

  const where = {};

  if (status) {
    where.status = status;
  }

  const include = [
    {
      model: Task,
      as: "task",
      attributes: [
        "id",
        "title",
        "status",
      ],
    },
    {
      model: User,
      as: "requester",
      attributes: [
        "id",
        "name",
        "email",
      ],
    },
    {
      model: User,
      as: "executor",
      attributes: [
        "id",
        "name",
        "email",
      ],
    },
  ];

  if (search.trim()) {
    include[0].where = {
      title: {
        [Op.like]:
          `%${search.trim()}%`,
      },
    };
  }

  const {
    rows,
    count,
  } = await Payment.findAndCountAll({
    where,
    include,
    order: [
      ["created_at", "DESC"],
    ],
    limit: safeLimit,
    offset:
      (safePage - 1) * safeLimit,
    distinct: true,
  });

  return {
    payments: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      pages: Math.ceil(
        count / safeLimit,
      ),
    },
  };
}


export async function getAdminAuditLogs({
  search = "",
  eventType,
  page = 1,
  limit = 50,
}) {
  const safePage = Math.max(
    Number(page) || 1,
    1,
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100,
  );

  const where = {};

  if (eventType) {
    where.event_type = eventType;
  }

  const taskWhere =
    search.trim()
      ? {
          title: {
            [Op.like]:
              `%${search.trim()}%`,
          },
        }
      : undefined;

  const {
    rows,
    count,
  } = await TaskEvent.findAndCountAll({
    where,

    include: [
      {
        model: Task,
        as: "task",
        required: Boolean(taskWhere),
        where: taskWhere,
        attributes: [
          "id",
          "title",
          "status",
        ],
      },
      {
        model: User,
        as: "actor",
        required: false,
        attributes: [
          "id",
          "name",
          "email",
        ],
      },
    ],

    order: [
      ["created_at", "DESC"],
    ],

    limit: safeLimit,

    offset:
      (safePage - 1) *
      safeLimit,

    distinct: true,
  });

  return {
    events: rows,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      pages: Math.ceil(
        count / safeLimit,
      ),
    },
  };
}