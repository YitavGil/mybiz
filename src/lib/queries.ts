"use server";

import { clerkClient, currentUser } from "@clerk/nextjs";
import { db } from "./db";
import { redirect } from "next/navigation";
import {
  Agency,
  Lane,
  Plan,
  Prisma,
  Role,
  SubAccount,
  Tag,
  Ticket,
  User,
} from '@prisma/client'


export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: { id: subaccountId },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    });
  }

  if (!userData) {
    throw new Error("Could not find user");
  }

  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error(
        "You need to provide at least agency Id or subaccount Id"
      );
    }

    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });

    if (response) foundAgencyId = response.agencyId;
  }
  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: { id: subaccountId },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;

  const response = await db.user.create({ data: { ...user } });
  return response;
};

export const verifyAndAcceptinvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const invitationExist = await db.invitation.findUnique({
    where: { email: user.emailAddresses[0].emailAddress, status: "PENDING" },
  });

  if (invitationExist) {
    const userDetails = await createTeamUser(invitationExist.id, {
      email: invitationExist.email,
      agencyId: invitationExist.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExist.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await saveActivityLogsNotification({
      agencyId: invitationExist?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    });

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });

      await db.invitation.delete({
        where: { email: userDetails.email },
      });

      return userDetails.agencyId;
    } else {
      return null;
    }
  } else {
    const agency = await db.user.findUnique({
      where: { email: user.emailAddresses[0].emailAddress },
    });
    return agency ? agency.agencyId : null;
  }
};

export const getAuthUserDeatils = async () => {
  const user = await currentUser();

  if (!user) {
    return;
  }

  const userData = await db.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: { include: { SidebarOption: true } },
        },
      },
      Permissions: true,
    },
  });

  return userData;
};
