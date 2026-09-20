import { prisma } from "../../lib/prisma";
import { NotificationType, Role } from "../../../generated/prisma/enums";

const notifyUser = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = NotificationType.GENERAL,
) => {
  await prisma.notification.create({
    data: { userId, type, title, message },
  });
};

const notifyAdmins = async (
  title: string,
  message: string,
  type: NotificationType = NotificationType.GENERAL,
) => {
  const admins = await prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } },
    select: { id: true },
  });
  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({ userId: admin.id, type, title, message })),
  });
};

const getMyNotifications = async (userId: string, limit: number) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, unreadCount };
};

const markAsRead = async (userId: string, id: string) => {
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
};

const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const NotificationService = {
  notifyUser,
  notifyAdmins,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
