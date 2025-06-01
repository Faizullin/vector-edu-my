"use client";

import Datatable, { ActionRegistry } from "@/components/datatable";
import LongText from "@/components/datatable/long-text";
import { Main } from "@/components/layout/main";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { showComponentNiceDialog } from "@/utils/nice-modal";
import { useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { UserToggleStatusNiceDialog } from "./components/users-dialogs";
import { userPaymentTypes, type UserDocument } from "./data/schema";

const col = createColumnHelper<UserDocument>();

const paymentTypes = new Map<UserDocument["user_type"], string>([
  [
    "premium_paid",
    "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200",
  ],
  ["free", "bg-neutral-300/40 border-neutral-300"],
  ["paid", "bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300"],
]);

const queryKey = "users";

export default function Users() {
  const queryClient = useQueryClient();
  const handleOpenToggleDialog = useCallback(
    (selectedItems: UserDocument[]) => {
      showComponentNiceDialog(UserToggleStatusNiceDialog, {
        users: selectedItems,
      }).then(({ result }) => {
        if (!result) return;
        queryClient.invalidateQueries({
          queryKey: [queryKey],
        });
      });
    },
    [queryClient]
  );
  const actions: ActionRegistry<UserDocument> = useMemo(
    () => ({
      // archive: {
      //   label: "Archive Selected",
      //   callback: (_, selectedItems) => {
      //     console.log("Archiving", selectedItems?.length || 0, "items");
      //   },
      //   icon: <Archive className="h-4 w-4" />,
      //   renderType: "menu",
      // },
      bulkTogglePaymentStatus: (context) => {
        const selectedItems = context.selectedRows.map((row) => row.original);
        return {
          id: "toggle-payment",
          label: "Toggle Payment",
          callback: () => {
            handleOpenToggleDialog(selectedItems);
          },
          disabled: selectedItems.length === 0,
          renderType: "menu",
        };
      },
    }),
    [handleOpenToggleDialog]
  );
  const topbar = {
    title: "Users",
    subtitle: "Manage your users",
  };
  const columns = useMemo(() => {
    return [
      col.accessor("id", {
        header: "ID",
        meta: {
          filter: {
            type: "text",
            displayType: "toolbar",
          },
        },
        enableHiding: false,
      }),
      col.accessor("username", {
        header: "Username",
        enableSorting: false,
        meta: {
          filter: {
            type: "text",
            displayType: "toolbar",
          },
          sizeBorderStyle: true,
        },
        cell: ({ row }) => (
          <LongText className="max-w-36">{row.getValue("username")}</LongText>
        ),
        enableHiding: false,
      }),
      col.accessor("email", {
        header: "Email",
        enableSorting: false,
        meta: {
          filter: {
            type: "text",
            displayType: "toolbar",
          },
        },
      }),
      col.accessor("user_type", {
        header: "Payment",
        enableSorting: false,
        cell: ({ row }) => {
          const { user_type } = row.original;
          const badgeColor = paymentTypes.get(user_type);
          return (
            <div className="flex space-x-2">
              <Badge variant="outline" className={cn("capitalize", badgeColor)}>
                {
                  userPaymentTypes.find((option) => option.value === user_type)
                    ?.label
                }
              </Badge>
            </div>
          );
        },
        meta: {
          filter: {
            type: "select",
            options: userPaymentTypes,
            displayType: "toolbar",
          },
        },
      }),
    ];
  }, []);
  return (
    <>
      <Main>
        <Datatable.Root
          resource={{
            name: "users",
            url: `/accounts/users`,
            columns,
            useRowSelection: true,
          }}
          topbar={topbar}
          actions={actions}
        >
          <Datatable.Panel menuActions={["bulkTogglePaymentStatus"]}>
            <Datatable.Table />
          </Datatable.Panel>
        </Datatable.Root>
      </Main>
    </>
  );
}
