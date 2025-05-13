import { DatatablePagePanel } from "@/components/datatable";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import LongText from "@/components/long-text";
import NiceModal from "@/components/nice-modal/NiceModal";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Badge } from "@/components/ui/badge";
import { useResource } from "@/hooks/use-resource";
import { cn } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { ToggleLeftIcon } from "lucide-react";
import { useMemo } from "react";
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

export default function Users() {
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
  const resource = useResource<UserDocument>({
    name: "users",
    url: `/accounts/users/`,
    columns,
    useRowSelection: true,
  });
  const selectedRowModel = resource.datatable.table.getSelectedRowModel();
  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <DatatablePagePanel
          resource={resource}
          topbar={{
            title: "User List",
            subtitle: "Manage your users and their roles here.",
          }}
          actions={[
            {
              id: "toggle-payment",
              label: "Toggle Payment",
              renderType: "actions-menu",
              callback: () => {
                NiceModal.show(UserToggleStatusNiceDialog, {
                  userIds: selectedRowModel.rows.map((row) => row.original.id),
                }).then(() => {
                  resource.query.refetch();
                });
              },
              disabled: selectedRowModel.rows.length === 0,
              shortcutIcon: <ToggleLeftIcon />,
            },
          ]}
        />
      </Main>
    </>
  );
}
